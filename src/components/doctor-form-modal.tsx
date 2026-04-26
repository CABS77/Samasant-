"use client";

import React, { useEffect, useState } from 'react';
import type { Doctor } from '@/types/doctor';
import { doctorCreateSchema } from '@/lib/doctor-validation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const VALID_DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'] as const;

interface DoctorFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctor?: Doctor;
  onSuccess: (doctor: Doctor) => void;
}

export function DoctorFormModal({ open, onOpenChange, doctor, onSuccess }: DoctorFormModalProps) {
  const { t } = useTranslation();
  const isEdit = !!doctor;

  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [available, setAvailable] = useState<string[]>([]);
  const [rating, setRating] = useState('');
  const [reviews, setReviews] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      if (doctor) {
        setName(doctor.name);
        setSpecialty(doctor.specialty);
        setLocation(doctor.location ?? '');
        setBio(doctor.bio ?? '');
        setAvailable(doctor.available);
        setRating(doctor.rating != null ? String(doctor.rating) : '');
        setReviews(doctor.reviews != null ? String(doctor.reviews) : '');
      } else {
        setName('');
        setSpecialty('');
        setLocation('');
        setBio('');
        setAvailable([]);
        setRating('');
        setReviews('');
      }
      setErrors({});
    }
  }, [open, doctor]);

  const toggleDay = (day: string) => {
    setAvailable((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data: Record<string, unknown> = {
      name,
      specialty,
      available,
    };
    if (location) data.location = location;
    if (bio) data.bio = bio;
    if (rating) data.rating = parseFloat(rating);
    if (reviews) data.reviews = parseInt(reviews, 10);

    const result = doctorCreateSchema.safeParse(data);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path.join('.');
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      const url = isEdit ? `/api/doctors/${doctor.id}` : '/api/doctors';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.data),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Erreur serveur');
      }

      const saved = (await res.json()) as Doctor;
      onSuccess(saved);
      onOpenChange(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      setErrors({ _form: message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t('admin_edit') : t('admin_add_doctor')}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Modifier les informations du médecin.'
              : 'Remplissez les informations pour ajouter un nouveau médecin.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors._form && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
              {errors._form}
            </p>
          )}

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="doctor-name">Nom *</Label>
            <Input
              id="doctor-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dr. Prénom Nom"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          {/* Specialty */}
          <div className="space-y-2">
            <Label htmlFor="doctor-specialty">Spécialité *</Label>
            <Input
              id="doctor-specialty"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              placeholder="Généraliste, Cardiologie..."
              className={errors.specialty ? 'border-destructive' : ''}
            />
            {errors.specialty && <p className="text-xs text-destructive">{errors.specialty}</p>}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="doctor-location">Localisation</Label>
            <Input
              id="doctor-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Dakar, Thiès..."
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="doctor-bio">Biographie</Label>
            <Textarea
              id="doctor-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Courte description du médecin..."
              className="min-h-[80px] resize-none"
            />
          </div>

          {/* Available days */}
          <div className="space-y-2">
            <Label>Jours disponibles *</Label>
            <div className="flex flex-wrap gap-3">
              {VALID_DAYS.map((day) => (
                <label
                  key={day}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Checkbox
                    checked={available.includes(day)}
                    onCheckedChange={() => toggleDay(day)}
                  />
                  <span className="text-sm">{day}</span>
                </label>
              ))}
            </div>
            {errors.available && <p className="text-xs text-destructive">{errors.available}</p>}
          </div>

          {/* Rating + Reviews */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="doctor-rating">Note (0-5)</Label>
              <Input
                id="doctor-rating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                placeholder="4.5"
                className={errors.rating ? 'border-destructive' : ''}
              />
              {errors.rating && <p className="text-xs text-destructive">{errors.rating}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="doctor-reviews">Nombre d&apos;avis</Label>
              <Input
                id="doctor-reviews"
                type="number"
                min="0"
                value={reviews}
                onChange={(e) => setReviews(e.target.value)}
                placeholder="0"
                className={errors.reviews ? 'border-destructive' : ''}
              />
              {errors.reviews && <p className="text-xs text-destructive">{errors.reviews}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Enregistrement...
                </>
              ) : isEdit ? (
                'Enregistrer'
              ) : (
                'Ajouter'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
