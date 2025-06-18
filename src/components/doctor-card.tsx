import React from 'react'
import { Icons } from './icons'
import type { Doctor } from '@/types/doctor'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

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
      <div className="flex items-center gap-1 text-yellow-500">
        {Array.from({ length: 5 }).map((_, i) => (
          <Icons.star key={i} className={`w-4 h-4 ${i < full ? 'fill-yellow-400' : 'fill-none stroke-yellow-400'}`} />
        ))}
        {doctor.reviews && (
          <span className="text-xs text-gray-600 ml-1">({doctor.reviews})</span>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-md shadow w-full h-full">
      <div className="flex flex-col items-center gap-2 w-full text-center">
        <div className="text-center">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1">
            {iconMap[doctor.specialty] ?? <Icons.stethoscope className="w-4 h-4" />} {doctor.name}
          </h4>
          <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">{doctor.specialty}</p>
          {renderStars()}
        </div>
        {doctor.bio && (
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
            {doctor.bio}
          </p>
        )}
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onSelect?.(doctor.id)}
        >
          {t('doctor_select_button')}
        </Button>
      </div>
    </div>
  )
}
