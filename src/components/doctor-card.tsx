import React from 'react'
import { Icons } from './icons'
import type { Doctor } from '@/types/doctor'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { MapPin, Calendar } from 'lucide-react'

interface Props {
  doctor: Doctor
  onSelect?: (id: string) => void
}

export default function DoctorCard({ doctor, onSelect }: Props) {
  const { t } = useTranslation()

  const iconMap: Record<string, JSX.Element> = {
    Cardiologie: <Icons.heartPulse className="w-4 h-4" />,
    Dermatologie: <Icons.syringe className="w-4 h-4" />,
    Pédiatrie: <Icons.baby className="w-4 h-4" />,
    Gynécologie: <Icons.venus className="w-4 h-4" />,
    Généraliste: <Icons.stethoscope className="w-4 h-4" />,
  }

  const renderStars = () => {
    if (!doctor.rating) return null
    const full = Math.round(doctor.rating)
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Icons.star
            key={i}
            className={`w-3.5 h-3.5 ${
              i < full ? 'fill-amber-400 text-amber-400' : 'fill-none text-border'
            }`}
          />
        ))}
        {doctor.reviews && (
          <span className="text-xs text-muted-foreground ml-1">({doctor.reviews})</span>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col bg-card rounded-2xl border border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-200 overflow-hidden h-full">
      {/* Header with specialty color */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 text-xs font-medium text-primary bg-primary/10 rounded-lg px-2.5 py-1">
            {iconMap[doctor.specialty] ?? <Icons.stethoscope className="w-3.5 h-3.5" />}
            {doctor.specialty}
          </div>
          {renderStars()}
        </div>

        <h4 className="text-base font-semibold mt-3">{doctor.name}</h4>

        {doctor.location && (
          <p className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <MapPin className="h-3 w-3" />
            {doctor.location}
          </p>
        )}

        {doctor.bio && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
            {doctor.bio}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto px-5 pb-5 pt-3 border-t border-border/30">
        {doctor.available && doctor.available.length > 0 && (
          <div className="flex items-center gap-1.5 mb-3">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <div className="flex gap-1 flex-wrap">
              {doctor.available.map((day) => (
                <span
                  key={day}
                  className="text-[10px] font-medium bg-muted rounded px-1.5 py-0.5"
                >
                  {day}
                </span>
              ))}
            </div>
          </div>
        )}

        <Button
          onClick={() => onSelect?.(doctor.id)}
          variant="outline"
          size="sm"
          className="w-full"
        >
          {t('doctor_select_button')}
        </Button>
      </div>
    </div>
  )
}
