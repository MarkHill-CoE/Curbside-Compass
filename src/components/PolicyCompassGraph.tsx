import React from 'react';
import { PersonaResult } from '../types';

interface PolicyCompassGraphProps {
  persona: PersonaResult;
  totalX: number;
  totalY: number;
  className?: string;
}

export const PolicyCompassGraph: React.FC<PolicyCompassGraphProps> = ({
  persona,
  totalX,
  totalY,
  className = ''
}) => {
  // Normalize X and Y to percentage for compass marker (-12 to +12 mapped to 4% to 96% so marker stays fully visible)
  const clampedX = Math.max(-12, Math.min(12, totalX));
  const clampedY = Math.max(-12, Math.min(12, totalY));
  const markerLeftPct = 4 + ((clampedX + 12) / 24) * 92;
  const markerBottomPct = 4 + ((clampedY + 12) / 24) * 92;

  return (
    <div className={`flex flex-col items-center justify-center w-full select-none ${className}`}>
      {/* Top Outer Axis Label (Outside Graph, No Abbreviations) */}
      <div className="flex items-center justify-center gap-1.5 text-[9.5px] sm:text-[10.5px] font-black text-gray-700 uppercase tracking-wide pb-1 text-center">
        <span className="text-[#004B8D] text-xs">▲</span>
        <span>Regulated Management</span>
      </div>

      {/* Horizontal Middle Row: Left Label + Square Graph + Right Label */}
      <div className="flex items-center justify-center w-full gap-1 sm:gap-2">
        {/* Left Outer Axis Label (Outside Graph, No Abbreviations) */}
        <div className="flex flex-col items-end justify-center text-right pr-1 sm:pr-1.5 w-16 sm:w-20 flex-shrink-0">
          <span className="text-[9px] sm:text-[10.5px] font-black text-gray-700 uppercase tracking-tight leading-tight flex items-center gap-0.5">
            <span className="text-[#004B8D] text-xs">◀</span>
            <span>Taxpayer</span>
          </span>
          <span className="text-[8.5px] sm:text-[9.5px] font-bold text-gray-500 uppercase tracking-tight leading-tight">
            Funded
          </span>
        </div>

        {/* Center 2D Plane Graph (Square Container utilizing space) */}
        <div className="relative w-[180px] h-[180px] sm:w-[200px] sm:h-[200px] md:w-[210px] md:h-[210px] bg-slate-50 border-2 border-gray-300 rounded-xl overflow-hidden shadow-inner flex-shrink-0">
          {/* Subtle 50% dashed reference grid lines */}
          <div className="absolute inset-x-0 top-1/4 h-[1px] border-b border-dashed border-gray-200 pointer-events-none" />
          <div className="absolute inset-x-0 top-3/4 h-[1px] border-b border-dashed border-gray-200 pointer-events-none" />
          <div className="absolute inset-y-0 left-1/4 w-[1px] border-r border-dashed border-gray-200 pointer-events-none" />
          <div className="absolute inset-y-0 left-3/4 w-[1px] border-r border-dashed border-gray-200 pointer-events-none" />

          {/* Quadrant 1: Top-Right (Regulated & User-Pay) */}
          <div
            className={`absolute top-0 right-0 w-1/2 h-1/2 border-l border-b border-gray-300 flex flex-col items-center justify-center p-1 text-center transition-all ${
              persona.quadrant === 'Q1'
                ? 'bg-[#0081BC]/15 text-[#004B8D] ring-2 ring-inset ring-[#0081BC]/40 font-black'
                : 'text-gray-400 font-semibold hover:bg-gray-100/40'
            }`}
          >
            <span className="text-[8px] sm:text-[9px] opacity-75 font-bold uppercase tracking-wider">Q1</span>
            <span className="text-[9px] sm:text-[10px] leading-tight">Regulated</span>
            <span className="text-[7.5px] sm:text-[8px] opacity-70 font-normal hidden sm:block">User-Pay</span>
            {persona.quadrant === 'Q1' && (
              <span className="mt-0.5 text-[7px] font-black uppercase px-1 py-0.2 bg-[#0081BC] text-white rounded-full">
                Your Result
              </span>
            )}
          </div>

          {/* Quadrant 2: Top-Left (Protective & Taxpayer) */}
          <div
            className={`absolute top-0 left-0 w-1/2 h-1/2 border-r border-b border-gray-300 flex flex-col items-center justify-center p-1 text-center transition-all ${
              persona.quadrant === 'Q2'
                ? 'bg-[#005087]/15 text-[#005087] ring-2 ring-inset ring-[#005087]/40 font-black'
                : 'text-gray-400 font-semibold hover:bg-gray-100/40'
            }`}
          >
            <span className="text-[8px] sm:text-[9px] opacity-75 font-bold uppercase tracking-wider">Q2</span>
            <span className="text-[9px] sm:text-[10px] leading-tight">Protective</span>
            <span className="text-[7.5px] sm:text-[8px] opacity-70 font-normal hidden sm:block">Taxpayer</span>
            {persona.quadrant === 'Q2' && (
              <span className="mt-0.5 text-[7px] font-black uppercase px-1 py-0.2 bg-[#005087] text-white rounded-full">
                Your Result
              </span>
            )}
          </div>

          {/* Quadrant 3: Bottom-Left (Free/Open & Taxpayer) */}
          <div
            className={`absolute bottom-0 left-0 w-1/2 h-1/2 border-r border-t border-gray-300 flex flex-col items-center justify-center p-1 text-center transition-all ${
              persona.quadrant === 'Q3'
                ? 'bg-[#009A44]/15 text-[#007a36] ring-2 ring-inset ring-[#009A44]/40 font-black'
                : 'text-gray-400 font-semibold hover:bg-gray-100/40'
            }`}
          >
            <span className="text-[8px] sm:text-[9px] opacity-75 font-bold uppercase tracking-wider">Q3</span>
            <span className="text-[9px] sm:text-[10px] leading-tight">Free & Easy</span>
            <span className="text-[7.5px] sm:text-[8px] opacity-70 font-normal hidden sm:block">Open Access</span>
            {persona.quadrant === 'Q3' && (
              <span className="mt-0.5 text-[7px] font-black uppercase px-1 py-0.2 bg-[#009A44] text-white rounded-full">
                Your Result
              </span>
            )}
          </div>

          {/* Quadrant 4: Bottom-Right (Flat Rate & User-Pay) */}
          <div
            className={`absolute bottom-0 right-0 w-1/2 h-1/2 border-l border-t border-gray-300 flex flex-col items-center justify-center p-1 text-center transition-all ${
              persona.quadrant === 'Q4'
                ? 'bg-[#FFC72C]/25 text-[#996500] ring-2 ring-inset ring-[#FFC72C]/50 font-black'
                : 'text-gray-400 font-semibold hover:bg-gray-100/40'
            }`}
          >
            <span className="text-[8px] sm:text-[9px] opacity-75 font-bold uppercase tracking-wider">Q4</span>
            <span className="text-[9px] sm:text-[10px] leading-tight">Flat Rate</span>
            <span className="text-[7.5px] sm:text-[8px] opacity-70 font-normal hidden sm:block">Simple Fee</span>
            {persona.quadrant === 'Q4' && (
              <span className="mt-0.5 text-[7px] font-black uppercase px-1 py-0.2 bg-[#d49b00] text-white rounded-full">
                Your Result
              </span>
            )}
          </div>

          {/* Bold Main Center Axis Lines */}
          <div className="absolute inset-x-0 top-1/2 h-[2px] bg-[#004B8D]/40 pointer-events-none -translate-y-1/2" />
          <div className="absolute inset-y-0 left-1/2 w-[2px] bg-[#004B8D]/40 pointer-events-none -translate-x-1/2" />

          {/* Center Origin Dot (0, 0) */}
          <div className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-[#004B8D]/60 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

          {/* Animated Live Point Marker */}
          <div
            className="absolute w-5 h-5 -translate-x-1/2 translate-y-1/2 z-20 pointer-events-none transition-all duration-700 ease-out flex items-center justify-center"
            style={{
              left: `${markerLeftPct}%`,
              bottom: `${markerBottomPct}%`
            }}
            title={`Your policy coordinate: X=${totalX > 0 ? `+${totalX}` : totalX}, Y=${totalY > 0 ? `+${totalY}` : totalY}`}
          >
            {/* Pulsing radar ring */}
            <span className="absolute inset-0 rounded-full bg-[#FFC72C] opacity-75 animate-ping" />
            {/* Core marker badge */}
            <div className="relative w-4.5 h-4.5 rounded-full border-2 border-[#004B8D] bg-[#FFC72C] shadow-md flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-[#004B8D]" />
            </div>
          </div>
        </div>

        {/* Right Outer Axis Label (Outside Graph, No Abbreviations) */}
        <div className="flex flex-col items-start justify-center text-left pl-1 sm:pl-1.5 w-16 sm:w-20 flex-shrink-0">
          <span className="text-[9px] sm:text-[10.5px] font-black text-gray-700 uppercase tracking-tight leading-tight flex items-center gap-0.5">
            <span>User-Pay</span>
            <span className="text-[#004B8D] text-xs">▶</span>
          </span>
          <span className="text-[8.5px] sm:text-[9.5px] font-bold text-gray-500 uppercase tracking-tight leading-tight">
            Funded
          </span>
        </div>
      </div>

      {/* Bottom Outer Axis Label (Outside Graph, No Abbreviations) */}
      <div className="flex items-center justify-center gap-1.5 text-[9.5px] sm:text-[10.5px] font-black text-gray-700 uppercase tracking-wide pt-1 text-center">
        <span className="text-[#004B8D] text-xs">▼</span>
        <span>Open Access</span>
      </div>
    </div>
  );
};
