"use client";

import React, { useEffect, useState, useCallback } from 'react';
import type { Doctor } from '@/types/doctor';
import { DoctorFormModal } from '@/components/doctor-form-modal';
import { DoctorDeleteDialog } from '@/components/doctor-delete-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, RefreshCw, Settings, Star, Lock, LogOut } from 'lucide-react';
import {
  fetchDoctorsAction,
  createDoctorAction,
  updateDoctorAction,
  deleteDoctorAction,
  verifyAdminPassword,
} from './actions';

const SESSION_KEY = 'samasante_admin_session';

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editDoctor, setEditDoctor] = useState<Doctor | undefined>(undefined);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Doctor | null>(null);

  // Vérifier la session au chargement
  useEffect(() => {
    const session = sessionStorage.getItem(SESSION_KEY);
    if (session === 'true') {
      setAuthenticated(true);
    }
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
      setAuthError('Erreur de connexion. Réessayez.');
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
      const data = await fetchDoctorsAction();
      setDoctors(data);
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authenticated) {
      fetchDoctors();
    }
  }, [authenticated, fetchDoctors]);

  const handleAdd = () => {
    setEditDoctor(undefined);
    setFormOpen(true);
  };

  const handleEdit = (doctor: Doctor) => {
    setEditDoctor(doctor);
    setFormOpen(true);
  };

  const handleFormSuccess = (saved: Doctor) => {
    if (editDoctor) {
      setDoctors((prev) => prev.map((d) => (d.id === saved.id ? saved : d)));
      toast({ title: 'Médecin modifié avec succès' });
    } else {
      setDoctors((prev) => [...prev, saved]);
      toast({ title: 'Médecin ajouté avec succès' });
    }
  };

  const handleDeleteClick = (doctor: Doctor) => {
    setDeleteTarget(doctor);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      const result = await deleteDoctorAction(deleteTarget.id);
      if (!result.success) throw new Error(result.error);
      setDoctors((prev) => prev.filter((d) => d.id !== deleteTarget.id));
      toast({ title: 'Médecin supprimé avec succès' });
    } catch {
      toast({ variant: 'destructive', title: 'Erreur lors de la suppression' });
    } finally {
      setDeleteOpen(false);
      setDeleteTarget(null);
    }
  };

  // Écran de chargement initial
  if (checkingSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Skeleton className="h-12 w-48 rounded-xl" />
      </div>
    );
  }

  // Écran de connexion
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="bg-card rounded-2xl border border-border/50 p-8 shadow-lg">
            <div className="text-center mb-8">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Lock className="h-7 w-7 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">Administration</h1>
              <p className="text-muted-foreground text-sm mt-1">
                SamaSanté AI
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Mot de passe administrateur"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={authError ? 'border-destructive' : ''}
                  autoFocus
                />
                {authError && (
                  <p className="text-xs text-destructive">{authError}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={authLoading || !password.trim()}
              >
                {authLoading ? 'Vérification...' : 'Se connecter'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Page admin (authentifié)
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-premium text-white">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <Settings className="h-7 w-7" />
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  Gestion des médecins
                </h1>
              </div>
              <p className="text-white/70 mt-2 max-w-lg">
                Gérez les médecins de l&apos;annuaire SamaSanté.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-5xl -mt-4">
        <div className="bg-card rounded-2xl border border-border/50 p-6 md:p-8">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">
              Médecins ({doctors.length})
            </h2>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un médecin
            </Button>
          </div>

          {/* Loading */}
          {loading && (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-14 rounded-xl" />
              ))}
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="text-center py-12 bg-muted/30 rounded-2xl border border-border/50">
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button variant="outline" onClick={fetchDoctors}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer
              </Button>
            </div>
          )}

          {/* Table */}
          {!loading && !error && (
            <div className="rounded-xl border border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Spécialité</TableHead>
                    <TableHead className="hidden md:table-cell">Localisation</TableHead>
                    <TableHead className="hidden sm:table-cell">Note</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {doctors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Aucun médecin enregistré.
                      </TableCell>
                    </TableRow>
                  ) : (
                    doctors.map((doctor) => (
                      <TableRow key={doctor.id}>
                        <TableCell className="font-medium">{doctor.name}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center bg-primary/10 text-primary text-xs font-medium rounded-lg px-2 py-0.5">
                            {doctor.specialty}
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                          {doctor.location || '—'}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {doctor.rating != null ? (
                            <span className="inline-flex items-center gap-1 text-sm">
                              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                              {doctor.rating}
                            </span>
                          ) : (
                            '—'
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(doctor)}
                              aria-label={`Modifier ${doctor.name}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(doctor)}
                              aria-label={`Supprimer ${doctor.name}`}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <DoctorFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        doctor={editDoctor}
        onSuccess={handleFormSuccess}
      />

      {deleteTarget && (
        <DoctorDeleteDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          doctor={deleteTarget}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
}
