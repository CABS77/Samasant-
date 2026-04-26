import { z } from 'zod';

const VALID_DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'] as const;

export const doctorCreateSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  specialty: z.string().min(1, 'La spécialité est requise'),
  location: z.string().optional(),
  bio: z.string().optional(),
  available: z.array(z.enum(VALID_DAYS)).min(1, 'Au moins un jour de disponibilité est requis'),
  rating: z.number().min(0).max(5).optional(),
  reviews: z.number().int().min(0).optional(),
});

export const doctorUpdateSchema = doctorCreateSchema.partial();

export type DoctorCreateInput = z.infer<typeof doctorCreateSchema>;
export type DoctorUpdateInput = z.infer<typeof doctorUpdateSchema>;
