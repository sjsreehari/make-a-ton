import React from 'react';

export type MascotState = 'idle' | 'listening' | 'thinking' | 'talking' | 'moving' | 'pointing' | 'happy' | 'oops';

interface MascotProps {
  state?: MascotState;
  target?: { x: number; y: number };
  className?: string;
}

export const Mascot: React.FC<MascotProps> = ({ state = 'idle', className = '' }) => {
  // CSS state styles for the lightweight Phase 1 mascot
  const stateStyles: Record<MascotState, string> = {
    idle: 'bg-indigo-500 shadow-indigo-300',
    listening: 'bg-blue-400 ring-4 ring-blue-200 animate-pulse',
    thinking: 'bg-amber-500 animate-bounce shadow-amber-300',
    talking: 'bg-emerald-500 scale-105 ring-2 ring-emerald-300 animate-pulse',
    moving: 'bg-purple-500 translate-x-1 transition-all',
    pointing: 'bg-cyan-500 ring-2 ring-cyan-300',
    happy: 'bg-green-500 scale-110 shadow-green-300',
    oops: 'bg-rose-500 ring-4 ring-rose-200',
  };

  return (
    <div
      className={`relative flex items-center justify-center w-8 h-8 rounded-full shadow-md transition-all duration-300 ${stateStyles[state]} ${className}`}
      title={`Loop (${state})`}
    >
      <div className="w-2 h-2 rounded-full bg-white opacity-80" />
    </div>
  );
};
