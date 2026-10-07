import { z } from 'zod';

const VALID_DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'] as const;

export const doctorCreateSchema = z.object({
  name: z.string().trim().min(2, 'Le nom doit contenir au moins 2 caractères').max(100),
  specialty: z.string().trim().min(1, 'La spécialité est requise').max(100),
  location: z.string().trim().max(100).optional(),
  bio: z.string().trim().max(1000).optional(),
  available: z.array(z.enum(VALID_DAYS)).min(1, 'Au moins un jour de disponibilité est requis'),
  rating: z.number().min(0).max(5).optional(),
  reviews: z.number().int().min(0).max(2147483647).optional(),
});

export const doctorUpdateSchema = doctorCreateSchema.partial();

export type DoctorCreateInput = z.infer<typeof doctorCreateSchema>;
export type DoctorUpdateInput = z.infer<typeof doctorUpdateSchema>;
