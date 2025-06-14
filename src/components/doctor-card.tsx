import React, { useState } from 'react'
import { Icons } from './icons'

interface Doctor {
  id: string
  name: string
  specialty: string
  bio?: string
  available: string[]
}

interface Props {
  doctor: Doctor
}

export default function DoctorCard({ doctor }: Props) {
  const [time, setTime] = useState('')

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

  return (
    <div className="flex bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg w-full max-w-md mx-auto gap-4">
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
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{doctor.bio}</p>
        )}
        <label htmlFor={`time-${doctor.id}`} className="sr-only">
          Choisir un horaire
        </label>
        <select
          id={`time-${doctor.id}`}
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="mt-1 w-full border rounded-md p-2 text-gray-900 dark:text-gray-800"
        >
          <option value="">Choisir un créneau</option>
          {doctor.available.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleReserve}
          className="mt-3 w-full rounded-lg bg-gradient-to-r from-green-500 to-green-600 px-4 py-2 text-white shadow-md transition-transform hover:shadow-lg hover:scale-105"
        >
          Réserver
        </button>
      </div>
    </div>
  )
}
