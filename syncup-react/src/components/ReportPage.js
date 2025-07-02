import React from "react"
import { useNavigate } from "react-router-dom"
import NormViolationForm from "../components/NormViolationForm"

export default function SafetyReport() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 flex flex-col items-center">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-md relative">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 text-blue-500 font-medium hover:underline"
        >
          ← Back
        </button>
        <h2 className="text-2xl font-semibold mb-6 text-center">Norm Violation Report</h2>
        <NormViolationForm />
      </div>
    </div>
  )
}
