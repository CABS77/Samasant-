import React, { useState } from 'react'
import { Icons } from './icons'

interface Doctor {
  id: string
  name: string
  specialty: string
  bio?: string
  available: string[]
  rating?: number
  reviews?: number
}

interface Props {
  doctor: Doctor
}

export default function DoctorCard({ doctor }: Props) {
  const [time, setTime] = useState('')
  const [showTimes, setShowTimes] = useState(false)

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
    const idx = doctor.available.indexOf(slot)
    if (idx % 3 === 0) return 'full'
    if (idx % 3 === 1) return 'almost'
    return 'available'
  }

  const statusClass = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-700'
      case 'almost':
        return 'bg-yellow-100 text-yellow-700'
      default:
        return 'bg-red-100 text-red-700 cursor-not-allowed'
    }
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
          <button
            type="button"
            onClick={() => setShowTimes((s) => !s)}
            className="mt-2 text-sm text-primary underline"
          >
            {showTimes ? 'Masquer les créneaux' : 'Voir les créneaux disponibles'}
          </button>
        </div>
      </div>
      {showTimes && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {doctor.available.map((t) => {
            const status = getStatus(t)
            return (
              <button
                key={t}
                type="button"
                disabled={status === 'full'}
                onClick={() => setTime(t)}
                className={`rounded-md px-2 py-1 text-sm ${statusClass(status)} ${time === t ? 'ring-2 ring-primary' : ''}`}
              >
                {t}
              </button>
            )
          })}
        </div>
      )}
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
