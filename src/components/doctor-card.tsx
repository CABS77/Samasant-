import React, { useState } from 'react'

interface Doctor {
  id: string
  name: string
  specialty: string
  available: string[]
}

interface Props {
  doctor: Doctor
}

export default function DoctorCard({ doctor }: Props) {
  const [time, setTime] = useState('')
  return (
    <div className="card bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg transition-transform hover:scale-105">
      <img src="/assets/doctor.jpg" alt={doctor.name} className="w-32 h-32 rounded-full mx-auto mb-4 object-cover" />
      <h4 className="text-lg font-semibold text-gray-900 dark:text-white text-center">
        {doctor.name}
      </h4>
      <p className="text-center text-gray-600 dark:text-gray-300">{doctor.specialty}</p>
      <div className="mt-4 text-center">
        <label htmlFor={`time-${doctor.id}`} className="sr-only">
          Choisir un horaire
        </label>
        <select
          id={`time-${doctor.id}`}
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="mt-2 w-full border rounded-md p-2 text-gray-900 dark:text-gray-800"
        >
          <option value="">Choisir un créneau</option>
          {doctor.available.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div className="text-center mt-4">
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg">Réserver</button>
      </div>
    </div>
  )
}
