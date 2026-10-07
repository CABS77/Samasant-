'use client';

import React, { useCallback, useRef, useState } from 'react';
import { createAppointment } from '@/services/appointments';
import { weekdays, type AppointmentReceipt } from '@/lib/appointment-validation';
import type { Doctor } from '@/types/doctor';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/date-picker';
import { TimePicker } from '@/components/time-picker';
import { PatientSignIn } from '@/components/patient-sign-in';
import { PatientAppointments } from '@/components/patient-appointments';
import { toast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Props {
  doctors: Doctor[];
  selectedDoctor: string;
  onSelectDoctor: (id: string) => void;
}

export function AppointmentForm({ doctors, selectedDoctor, onSelectDoctor }: Props) {
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState('');
  const [motif, setMotif] = useState('');
  const [phone, setPhone] = useState('');
  const [patientId, setPatientId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<(AppointmentReceipt & { doctorName: string }) | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const session = useRef<string | null>(null);
  const onSessionChange = useCallback((userId: string | null) => {
    if (session.current !== userId) {
      session.current = userId;
      setReceipt(null);
      setMotif(''); setPhone('');
      setDate(undefined); setTime('');
    }
    setPatientId(userId);
  }, []);
  // Keep a stable key after a network failure, but use a new key if the payload changes.
  const request = useRef<{ payload: string; key: string }>();
  const doctor = doctors.find(d => d.id === selectedDoctor);
  const dateKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const todayInSenegal = new Date().toISOString().slice(0, 10);
  const disabledDate = (d: Date) => dateKey(d) < todayInSenegal || !doctor?.available.includes(weekdays[d.getDay()]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    const issues: Record<string, string> = {};
    const contact = phone.replace(/[\s()-]/g, '');
    if (!doctor) issues.doctor = 'Veuillez sélectionner un médecin';
    if (!date || disabledDate(date)) issues.date = 'Choisissez un jour disponible à venir';
    if (!time) issues.time = 'Veuillez choisir un horaire';
    if (!motif.trim()) issues.motif = 'Veuillez indiquer le motif de consultation';
    if (!/^\+[1-9]\d{7,14}$/.test(contact)) issues.phone = 'Utilisez le format international, par exemple +221…';
    if (!patientId) issues.session = 'Connectez-vous pour réserver';
    setErrors(issues);
    if (Object.keys(issues).length) return;
    setSubmitting(true);
    try {
      const input = { doctorId: selectedDoctor, startAt: `${dateKey(date!)}T${time}:00.000Z`, motif: motif.trim(), phone: contact, mode: 'clinic' as const };
      const payload = JSON.stringify(input);
      if (request.current?.payload !== payload) request.current = { payload, key: crypto.randomUUID() };
      const saved = await createAppointment({ ...input, requestKey: request.current!.key });
      if (session.current !== patientId) return;
      setReceipt({ ...saved, doctorName: doctor!.name });
      toast({ title: 'Demande enregistrée', description: 'Le médecin doit encore confirmer ce rendez-vous.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Demande non confirmée',
        description: error instanceof Error ? error.message : 'Impossible d’enregistrer la demande. Réessayez.' });
    } finally { setSubmitting(false); }
  };

  if (receipt) return (
    <div role="status" className="text-center py-8 space-y-4">
      <PatientSignIn onSessionChange={onSessionChange} />
      <CheckCircle2 className="h-8 w-8 text-primary mx-auto" />
      <h3 className="text-xl font-semibold">Demande enregistrée</h3>
      <p>Avec {receipt.doctorName}, le {new Date(receipt.startAt).toLocaleString('fr-FR', { timeZone: 'Africa/Dakar' })} (Sénégal), en clinique.</p>
      <p className="font-medium">En attente de confirmation par le médecin.</p>
      <p className="text-sm break-all">Référence : {receipt.id}</p>
      <p className="text-sm text-muted-foreground">Conservez cette référence et contactez la clinique pour suivre votre demande.</p>
      {patientId && <PatientAppointments key={patientId} doctors={doctors} />}
      <Button type="button" variant="outline" onClick={() => {
        setReceipt(null); setDate(undefined); setTime(''); setMotif(''); request.current = undefined;
      }}>Nouvelle demande</Button>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PatientSignIn onSessionChange={onSessionChange} />
      {patientId && <PatientAppointments key={patientId} doctors={doctors} />}
      {errors.session && <p role="alert" className="text-sm text-destructive">{errors.session}</p>}
      <div className="space-y-2">
        <label htmlFor="appointment-doctor" className="text-sm font-medium">Médecin</label>
        <Select value={selectedDoctor} onValueChange={id => { onSelectDoctor(id); setDate(undefined); setTime(''); }}>
          <SelectTrigger id="appointment-doctor"><SelectValue placeholder="Choisissez un médecin" /></SelectTrigger>
          <SelectContent>{doctors.map(d => <SelectItem key={d.id} value={d.id}>{d.name} — {d.specialty}</SelectItem>)}</SelectContent>
        </Select>
        {errors.doctor && <p className="text-xs text-destructive">{errors.doctor}</p>}
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">Date</p>
        <DatePicker date={date} onChange={value => { setDate(value); setTime(''); }} disabledDates={disabledDate} />
        {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
      </div>
      {date && <div className="space-y-2">
        <p className="text-sm font-medium">Horaire (heure du Sénégal)</p>
        <TimePicker value={time} onChange={setTime} />
        {errors.time && <p className="text-xs text-destructive">{errors.time}</p>}
      </div>}
      <div className="space-y-2">
        <label htmlFor="appointment-phone" className="text-sm font-medium">Téléphone de contact</label>
        <Input id="appointment-phone" type="tel" autoComplete="tel" maxLength={30} value={phone}
          onChange={event => setPhone(event.target.value)} placeholder="+221…" required />
        {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
      </div>
      <div className="space-y-2">
        <label htmlFor="appointment-motif" className="text-sm font-medium">Motif de consultation</label>
        <Textarea id="appointment-motif" maxLength={1000} value={motif} required
          onChange={event => setMotif(event.target.value)} placeholder="Motif de votre consultation" />
        {errors.motif && <p className="text-xs text-destructive">{errors.motif}</p>}
      </div>
      <p className="text-sm text-muted-foreground">Consultation en clinique. Les consultations vidéo ne sont pas encore disponibles.</p>
      <Button type="submit" disabled={submitting || !patientId} className="w-full" size="lg">
        {submitting ? <><Loader2 className="animate-spin mr-2 h-4 w-4" />Enregistrement…</> : 'Envoyer la demande de rendez-vous'}
      </Button>
      <p className="text-xs text-center text-muted-foreground">La demande sera enregistrée ; le rendez-vous reste à confirmer par le médecin.</p>
    </form>
  );
}
