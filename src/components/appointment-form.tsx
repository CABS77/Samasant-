"use client";

import React, { useState } from 'react';
import { createAppointment } from '@/services/appointments';
import type { RendezVous } from '@/types/firestore';
import type { Doctor } from '@/types/doctor';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/date-picker';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Icons } from '@/components/icons';
import { TimePicker } from '@/components/time-picker';
import { toast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { Loader2, CheckCircle2, CalendarDays, Clock, User, FileText, Stethoscope, Video } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Props {
  doctors: Doctor[];
  selectedDoctor: string;
  onSelectDoctor: (id: string) => void;
}

export function AppointmentForm({ doctors, selectedDoctor, onSelectDoctor }: Props) {
  const { t } = useTranslation();
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState('');
  const [motif, setMotif] = useState('');
  const [mode, setMode] = useState<'clinic' | 'video'>('clinic');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const today = new Date();
  // Désactiver les dimanches et les jours passés
  const isDateDisabled = (d: Date) => {
    return d < today || d.getDay() === 0;
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!selectedDoctor) newErrors.doctor = 'Veuillez sélectionner un médecin';
    if (!date) newErrors.date = 'Veuillez choisir une date';
    if (!time) newErrors.time = 'Veuillez choisir un horaire';
    if (!motif.trim()) newErrors.motif = 'Veuillez indiquer le motif de consultation';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const [hours, minutes] = time.split(':').map(Number);
      const dateTime = new Date(date!);
      dateTime.setHours(hours);
      dateTime.setMinutes(minutes);
      const timestamp = { seconds: Math.floor(dateTime.getTime() / 1000), nanoseconds: 0 };

      const data: RendezVous = {
        jefandikukat_id: 'demo-user',
        doktoor_id: selectedDoctor,
        dat: timestamp,
        estatu: 'planifie',
        motif,
        notes_jefandikukat: mode,
      };

      await createAppointment(data);

      setSuccess(true);
      const doctorName = doctors.find((d) => d.id === selectedDoctor)?.name || 'le médecin';
      toast({
        title: '✅ Rendez-vous confirmé',
        description: `Votre rendez-vous avec ${doctorName} est enregistré pour le ${date!.toLocaleDateString('fr-FR')} à ${time}.`,
      });

      // Reset après 3 secondes
      setTimeout(() => {
        setSuccess(false);
        setMotif('');
        setDate(undefined);
        setTime('');
      }, 4000);
    } catch (error: any) {
      console.error('Error creating appointment:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de créer le rendez-vous. Veuillez réessayer.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Écran de succès
  if (success) {
    const doctorName = doctors.find((d) => d.id === selectedDoctor)?.name;
    return (
      <div className="text-center py-12 space-y-4">
        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold">Rendez-vous confirmé !</h3>
        <div className="text-muted-foreground space-y-1">
          <p>Avec <span className="font-medium text-foreground">{doctorName}</span></p>
          <p>{date?.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} à {time}</p>
          <p className="text-sm">{mode === 'video' ? '📹 Consultation vidéo' : '🏥 En clinique'}</p>
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          Un SMS de confirmation sera envoyé. Vous pouvez annuler jusqu'à 2h avant.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Étape 1 : Médecin */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium">
          <User className="h-4 w-4 text-primary" />
          Médecin
        </label>
        <Select value={selectedDoctor} onValueChange={onSelectDoctor}>
          <SelectTrigger className={errors.doctor ? 'border-destructive' : ''}>
            <SelectValue placeholder="Choisissez un médecin" />
          </SelectTrigger>
          <SelectContent>
            {doctors.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                <span className="flex items-center gap-2">
                  {d.name} — <span className="text-muted-foreground">{d.specialty}</span>
                  {d.location && <span className="text-xs text-muted-foreground">({d.location})</span>}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.doctor && <p className="text-xs text-destructive">{errors.doctor}</p>}
      </div>

      {/* Étape 2 : Date */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium">
          <CalendarDays className="h-4 w-4 text-primary" />
          Date
        </label>
        <DatePicker date={date} onChange={setDate} />
        {date && (
          <p className="text-sm text-muted-foreground">
            📅 {date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        )}
        {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
      </div>

      {/* Étape 3 : Heure */}
      {date && (
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium">
            <Clock className="h-4 w-4 text-primary" />
            Horaire
          </label>
          <TimePicker value={time} onChange={setTime} />
          {errors.time && <p className="text-xs text-destructive">{errors.time}</p>}
        </div>
      )}

      {/* Étape 4 : Motif */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium">
          <FileText className="h-4 w-4 text-primary" />
          Motif de consultation
        </label>
        <Textarea
          value={motif}
          onChange={(e) => setMotif(e.target.value)}
          placeholder="Décrivez brièvement la raison de votre consultation..."
          className={`min-h-[80px] resize-none ${errors.motif ? 'border-destructive' : ''}`}
        />
        {errors.motif && <p className="text-xs text-destructive">{errors.motif}</p>}
      </div>

      {/* Étape 5 : Mode */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Type de consultation</label>
        <RadioGroup
          value={mode}
          onValueChange={(v) => setMode(v as 'clinic' | 'video')}
          className="grid grid-cols-2 gap-3"
        >
          <label
            htmlFor="clinic"
            className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              mode === 'clinic'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/30'
            }`}
          >
            <RadioGroupItem value="clinic" id="clinic" />
            <div>
              <div className="flex items-center gap-2 font-medium">
                <Stethoscope className="h-4 w-4" />
                En clinique
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Consultation sur place</p>
            </div>
          </label>
          <label
            htmlFor="video"
            className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              mode === 'video'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/30'
            }`}
          >
            <RadioGroupItem value="video" id="video" />
            <div>
              <div className="flex items-center gap-2 font-medium">
                <Video className="h-4 w-4" />
                En vidéo
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Depuis chez vous</p>
            </div>
          </label>
        </RadioGroup>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={submitting}
        className="w-full py-3 text-base font-semibold"
        size="lg"
      >
        {submitting ? (
          <>
            <Loader2 className="animate-spin mr-2 h-4 w-4" />
            Réservation en cours...
          </>
        ) : (
          'Confirmer le rendez-vous'
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        En confirmant, vous acceptez nos conditions d'utilisation. Annulation gratuite jusqu'à 2h avant.
      </p>
    </form>
  );
}
