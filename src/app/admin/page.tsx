"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import type { Doctor } from '@/types/doctor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { doctorCreateSchema } from '@/lib/doctor-validation';
import { Plus, Pencil, Trash2, RefreshCw, Settings, Star, Lock, LogOut, X, Loader2, AlertTriangle, MapPin, Save } from 'lucide-react';
import {
  createDoctorAction,
  updateDoctorAction,
  deleteDoctorAction,
  verifyAdminPassword,
} from './actions';
import { fetchDoctorsServer } from '@/app/actions/doctors';

const SESSION_KEY = 'samasante_admin_session';
const VALID_DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'] as const;

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Inline form state
  const [showForm, setShowForm] = useState(false);
  const [editDoctor, setEditDoctor] = useState<Doctor | undefined>(undefined);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formName, setFormName] = useState('');
  const [formSpecialty, setFormSpecialty] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formBio, setFormBio] = useState('');
  const [formAvailable, setFormAvailable] = useState<string[]>([]);
  const [formRating, setFormRating] = useState('');
  const [formReviews, setFormReviews] = useState('');

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Doctor | null>(null);
  const [deleting, setDeleting] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);

  // Session check
  useEffect(() => {
    const session = sessionStorage.getItem(SESSION_KEY);
    if (session === 'true') setAuthenticated(true);
    setCheckingSession(false);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      const valid = await verifyAdminPassword(password);
      if (valid) {
        sessionStorage.setItem(SESSION_KEY, 'true');
        setAuthenticated(true);
        setPassword('');
      } else {
        setAuthError('Mot de passe incorrect');
      }
    } catch {
      setAuthError('Erreur de connexion.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setAuthenticated(false);
    setDoctors([]);
  };

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDoctorsServer();
      setDoctors(data);
    } catch {
      setError('Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authenticated) fetchDoctors();
  }, [authenticated, fetchDoctors]);

  // Form helpers
  const resetForm = () => {
    setFormName(''); setFormSpecialty(''); setFormLocation(''); setFormBio('');
    setFormAvailable([]); setFormRating(''); setFormReviews('');
    setFormErrors({}); setEditDoctor(undefined);
  };

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
    setDeleteTarget(null);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const openEditForm = (doctor: Doctor) => {
    setEditDoctor(doctor);
    setFormName(doctor.name);
    setFormSpecialty(doctor.specialty);
    setFormLocation(doctor.location ?? '');
    setFormBio(doctor.bio ?? '');
    setFormAvailable(doctor.available);
    setFormRating(doctor.rating != null ? String(doctor.rating) : '');
    setFormReviews(doctor.reviews != null ? String(doctor.reviews) : '');
    setFormErrors({});
    setShowForm(true);
    setDeleteTarget(null);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const closeForm = () => {
    setShowForm(false);
    resetForm();
  };

  const toggleDay = (day: string) => {
    setFormAvailable((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data: Record<string, unknown> = { name: formName, specialty: formSpecialty, available: formAvailable };
    if (formLocation) data.location = formLocation;
    if (formBio) data.bio = formBio;
    if (formRating) data.rating = parseFloat(formRating);
    if (formReviews) data.reviews = parseInt(formReviews, 10);

    const result = doctorCreateSchema.safeParse(data);
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.issues.forEach((i) => { const f = i.path.join('.'); if (!errs[f]) errs[f] = i.message; });
      setFormErrors(errs);
      return;
    }

    setFormSubmitting(true);
    try {
      let actionResult;
      if (editDoctor) {
        actionResult = await updateDoctorAction(editDoctor.id, result.data);
      } else {
        actionResult = await createDoctorAction(result.data);
      }
      if (!actionResult.success) throw new Error(actionResult.error);

      if (editDoctor) {
        setDoctors((prev) => prev.map((d) => (d.id === actionResult.doctor!.id ? actionResult.doctor! : d)));
        toast({ title: '✅ Médecin modifié' });
      } else {
        setDoctors((prev) => [...prev, actionResult.doctor!]);
        toast({ title: '✅ Médecin ajouté' });
      }
      closeForm();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur';
      setFormErrors({ _form: msg });
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteClick = (doctor: Doctor) => {
    setDeleteTarget(doctor);
    setShowForm(false);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const result = await deleteDoctorAction(deleteTarget.id);
      if (!result.success) throw new Error(result.error);
      setDoctors((prev) => prev.filter((d) => d.id !== deleteTarget.id));
      toast({ title: '✅ Médecin supprimé' });
    } catch {
      toast({ variant: 'destructive', title: 'Erreur' });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  // Loading
  if (checkingSession) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Skeleton className="h-12 w-48 rounded-xl" /></div>;
  }

  // Login
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-card rounded-2xl border border-border/50 p-8 shadow-lg">
          <div className="text-center mb-8">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Lock className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Administration</h1>
            <p className="text-muted-foreground text-sm mt-1">SamaSanté AI</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} className={authError ? 'border-destructive' : ''} autoFocus />
            {authError && <p className="text-xs text-destructive">{authError}</p>}
            <Button type="submit" className="w-full" disabled={authLoading || !password.trim()}>
              {authLoading ? 'Vérification...' : 'Se connecter'}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // Admin page
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-premium text-white">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <Settings className="h-7 w-7" />
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Gestion des médecins</h1>
              </div>
              <p className="text-white/70 mt-2">Gérez l&apos;annuaire SamaSanté.</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white">
              <LogOut className="h-4 w-4 mr-2" />Déconnexion
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl -mt-4 space-y-6">

        {/* Inline delete confirmation */}
        {deleteTarget && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-800 dark:text-red-200">Supprimer {deleteTarget.name} ?</h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">Cette action est irréversible.</p>
                <div className="flex gap-2 mt-4">
                  <Button variant="destructive" size="sm" onClick={handleDeleteConfirm} disabled={deleting}>
                    {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Trash2 className="h-4 w-4 mr-1" />}
                    Supprimer
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)} disabled={deleting}>
                    Annuler
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Inline form */}
        {showForm && (
          <div ref={formRef} className="bg-card rounded-2xl border border-primary/30 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">{editDoctor ? `Modifier ${editDoctor.name}` : 'Ajouter un médecin'}</h2>
              <Button variant="ghost" size="icon" onClick={closeForm}><X className="h-4 w-4" /></Button>
            </div>

            {formErrors._form && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2 mb-4">{formErrors._form}</p>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Nom *</Label>
                  <Input id="name" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Dr. Prénom Nom" className={formErrors.name ? 'border-destructive' : ''} />
                  {formErrors.name && <p className="text-xs text-destructive">{formErrors.name}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="specialty">Spécialité *</Label>
                  <Input id="specialty" value={formSpecialty} onChange={(e) => setFormSpecialty(e.target.value)} placeholder="Généraliste, Cardiologie..." className={formErrors.specialty ? 'border-destructive' : ''} />
                  {formErrors.specialty && <p className="text-xs text-destructive">{formErrors.specialty}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="location"><MapPin className="h-3 w-3 inline mr-1" />Localisation</Label>
                  <Input id="location" value={formLocation} onChange={(e) => setFormLocation(e.target.value)} placeholder="Dakar, Thiès..." />
                </div>
                <div className="space-y-1.5">
                  <Label>Jours disponibles *</Label>
                  <div className="flex flex-wrap gap-2">
                    {VALID_DAYS.map((day) => (
                      <label key={day} className="flex items-center gap-1.5 cursor-pointer">
                        <Checkbox checked={formAvailable.includes(day)} onCheckedChange={() => toggleDay(day)} />
                        <span className="text-xs">{day}</span>
                      </label>
                    ))}
                  </div>
                  {formErrors.available && <p className="text-xs text-destructive">{formErrors.available}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bio">Biographie</Label>
                <Textarea id="bio" value={formBio} onChange={(e) => setFormBio(e.target.value)} placeholder="Courte description..." className="min-h-[70px] resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="rating"><Star className="h-3 w-3 inline mr-1" />Note (0-5)</Label>
                  <Input id="rating" type="number" step="0.1" min="0" max="5" value={formRating} onChange={(e) => setFormRating(e.target.value)} placeholder="4.5" className={formErrors.rating ? 'border-destructive' : ''} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reviews">Avis</Label>
                  <Input id="reviews" type="number" min="0" value={formReviews} onChange={(e) => setFormReviews(e.target.value)} placeholder="0" />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={formSubmitting}>
                  {formSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
                  {editDoctor ? 'Enregistrer' : 'Ajouter'}
                </Button>
                <Button type="button" variant="outline" onClick={closeForm} disabled={formSubmitting}>Annuler</Button>
              </div>
            </form>
          </div>
        )}

        {/* Doctor list */}
        <div className="bg-card rounded-2xl border border-border/50 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold">Médecins ({doctors.length})</h2>
            {!showForm && (
              <Button onClick={openAddForm} size="sm">
                <Plus className="h-4 w-4 mr-1" />Ajouter
              </Button>
            )}
          </div>

          {loading && (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
            </div>
          )}

          {error && !loading && (
            <div className="text-center py-10 bg-muted/20 rounded-xl border border-border/50">
              <p className="text-muted-foreground mb-3">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchDoctors}><RefreshCw className="h-4 w-4 mr-1" />Réessayer</Button>
            </div>
          )}

          {!loading && !error && doctors.length === 0 && (
            <div className="text-center py-10 bg-muted/20 rounded-xl border border-border/50">
              <p className="text-muted-foreground">Aucun médecin. Cliquez sur Ajouter.</p>
            </div>
          )}

          {!loading && !error && doctors.length > 0 && (
            <div className="space-y-2">
              {doctors.map((doctor) => (
                <div key={doctor.id} className="flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:border-primary/20 transition-colors">
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-sm truncate">{doctor.name}</h3>
                      <span className="text-[10px] font-medium text-primary bg-primary/10 rounded px-1.5 py-0.5 shrink-0">{doctor.specialty}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      {doctor.location && <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" />{doctor.location}</span>}
                      {doctor.rating != null && <span className="flex items-center gap-0.5"><Star className="h-3 w-3 fill-amber-400 text-amber-400" />{doctor.rating}</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditForm(doctor)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeleteClick(doctor)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
