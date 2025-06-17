import React, { useState } from 'react'
import { Icons } from './icons'
import type { Doctor } from '@/types/doctor'
import { useTranslation } from 'react-i18next'

interface Props {
  doctor: Doctor
}

export default function DoctorCard({ doctor }: Props) {
  const { t } = useTranslation()
  const [time, setTime] = useState('')
  const availableSlots = Array.isArray(doctor.available) ? doctor.available : []

  const handleReserve = () => {
    if (!time) {
      alert('Veuillez sélectionner un horaire')
      return
    }
    alert(`Rendez-vous réservé avec ${doctor.name} à ${time}`)
    setTime('')
  }

  const iconMap: Record<string, JSX.Element> = {
    Cardiologie: <Icons.heartPulse className="w-4 h-4" />,
    Dermatologie: <Icons.syringe className="w-4 h-4" />,
    Pédiatrie: <Icons.baby className="w-4 h-4" />,
    Gynécologie: <Icons.venus className="w-4 h-4" />,
    Généraliste: <Icons.stethoscope className="w-4 h-4" />,
  }

  const getStatus = (slot: string) => {
    const idx = availableSlots.indexOf(slot)
    if (idx % 3 === 0) return 'full'
    if (idx % 3 === 1) return 'almost'
    return 'available'
  }

  const statusLabel = (status: string) => {
    if (status === 'full') return t('appointment_full')
    if (status === 'almost') return t('appointment_almost_full')
    return ''
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
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg w-full max-w-md mx-auto">
      <div className="flex gap-4">
        <img
          src="/assets/doctor.jpg"
          alt={`Photo de ${doctor.name}`}
          className="w-16 h-16 rounded-full object-cover"
        />
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            {iconMap[doctor.specialty] ?? <Icons.stethoscope className="w-4 h-4" />} {doctor.name}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">{doctor.specialty}</p>
          {doctor.bio && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{doctor.bio}</p>
          )}
          {renderStars()}
        </div>
      </div>
      <select
        value={time}
        onChange={(e) => setTime(e.target.value)}
        className="mt-4 w-full border rounded-md p-2 text-sm"
      >
        <option value="">{t('appointment_select_slot')}</option>
        {availableSlots.map((tSlot) => {
          const status = getStatus(tSlot)
          return (
            <option key={tSlot} value={tSlot} disabled={status === 'full'}>
              {tSlot} {status !== 'available' && `- ${statusLabel(status)}`}
            </option>
          )
        })}
      </select>
      {time && (
        <button
          type="button"
          onClick={handleReserve}
          className="mt-3 w-full rounded-lg bg-gradient-to-r from-green-500 to-green-600 px-4 py-2 text-white shadow-md transition-transform hover:shadow-lg hover:scale-105"
        >
          Réserver
        </button>
      )}
    </div>
  )
}
