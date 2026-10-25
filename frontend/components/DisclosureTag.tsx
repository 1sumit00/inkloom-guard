import React from 'react';
import { Lock, Info } from './Icons';

interface DisclosureTagProps {
  onOpenModal: () => void;
  modelName?: string;
  retentionPolicy?: string;
}

export function DisclosureTag({
  onOpenModal,
  modelName = 'Gemini 2.5 Pro',
  retentionPolicy = 'Zero-Retention'
}: DisclosureTagProps) {
  return (
    <button
      onClick={onOpenModal}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50/90 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-medium transition cursor-pointer"
      title="Responsible AI & Data Privacy Disclosure"
    >
      <Lock className="w-3.5 h-3.5 text-emerald-600" />
      <span className="hidden md:inline font-semibold">AI Disclosure:</span>
      <span className="font-mono text-[11px]">{modelName} • {retentionPolicy}</span>
      <Info className="w-3.5 h-3.5 text-emerald-600" />
    </button>
  );
}
