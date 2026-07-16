'use client'
import { Printer } from 'lucide-react'

export function PrintButton() {
  return (
    <div className="no-print mb-8 flex justify-end">
      <button
        onClick={() => window.print()}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-sans font-semibold text-sm shadow-lg hover:opacity-90 transition-opacity"
        style={{ background: 'linear-gradient(135deg, #7c3aed, #22d3ee)' }}
      >
        <Printer className="w-4 h-4" /> Print / Save as PDF
      </button>
    </div>
  )
}
