import React from 'react';
import { FlaggedIssue } from '../lib/api';
import { ArrowRight } from './Icons';

interface VisualCanvasProps {
  issues: FlaggedIssue[];
  selectedIssueId: string;
  onSelectIssue: (id: string) => void;
}

export function VisualCanvas({ issues, onSelectIssue }: VisualCanvasProps) {
  const ctaIssue = issues.find((i) => i.id === 'ISS-04');
  const contrastIssue = issues.find((i) => i.id === 'ISS-05');

  return (
    <div className="p-6 sm:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-amber-600 font-semibold">
            COMPUTER VISION + WCAG LUMINANCE AUDITOR
          </span>
          <h2 className="text-lg font-bold text-slate-900">
            LinkedIn & ProductHunt Launch Banner (1200 × 628 px)
          </h2>
        </div>
        <span className="text-xs text-slate-500">Click bounding-box hotspots to inspect</span>
      </div>

      {/* Simulated Promotional Graphic Canvas */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-8 text-white shadow-inner min-h-[340px] flex flex-col justify-between">
        {/* Top Row: Brand Logo Check (Passed) */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur border border-emerald-400/60">
            <div className="w-5 h-5 rounded bg-indigo-500 flex items-center justify-center font-bold text-xs">A</div>
            <span className="font-semibold text-sm tracking-tight">ACME CLOUD</span>
            <span className="ml-2 text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-400/40">
              ✓ Logo Clear-Space OK
            </span>
          </div>
          <span className="text-xs font-mono text-slate-400">ASSET-ID: BANNER-Q4-01</span>
        </div>

        {/* Center Headline & Hotspot #2 (WCAG Contrast Check) */}
        <div className="my-6 max-w-xl space-y-3">
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Acme Cloud Horizon 4.0: Autonomous Data Mesh
          </h3>

          {/* Subtitle box with interactive WCAG contrast status */}
          <div
            onClick={() => onSelectIssue('ISS-05')}
            className={`p-3 rounded-xl transition cursor-pointer ${
              contrastIssue?.status === 'applied'
                ? 'bg-white text-[#1E293B] border-2 border-emerald-400 shadow-md'
                : 'bg-[#CBD5E1] text-[#94A3B8] border-2 border-dashed border-amber-400'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-900 text-amber-300 font-semibold">
                {contrastIssue?.status === 'applied'
                  ? '✓ WCAG 2.1 AA Passed (7.4:1 Contrast)'
                  : '⚠ Hotspot #2: WCAG Contrast Failure (2.8:1 < 4.5:1)'}
              </span>
            </div>
            <p className="text-sm font-medium">
              Deploy zero-ops multi-region clusters with automated compliance guardrails across AWS, GCP, and Azure.
            </p>
          </div>
        </div>

        {/* Bottom CTA Button Hotspot #1 (Hex Palette Check) */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div
            onClick={() => onSelectIssue('ISS-04')}
            className="relative group cursor-pointer inline-block"
          >
            <div
              className={`px-6 py-3 rounded-xl font-bold text-sm shadow-lg transition flex items-center gap-2 ${
                ctaIssue?.status === 'applied'
                  ? 'bg-[#4F46E5] text-white ring-2 ring-emerald-400'
                  : 'bg-[#FF5733] text-white ring-2 ring-rose-400 ring-offset-2 ring-offset-slate-900'
              }`}
            >
              <span>Start Free Enterprise Trial</span>
              <ArrowRight className="w-4 h-4" />
            </div>
            <span className="mt-2 inline-block text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900/90 text-amber-300 border border-amber-400/40">
              {ctaIssue?.status === 'applied'
                ? '✓ Approved Token #4F46E5 Applied'
                : '⚠ Hotspot #1: Off-Brand Hex #FF5733 (Delta-E: 41.2)'}
            </span>
          </div>

          {/* Palette Swatch Comparison */}
          <div className="bg-slate-900/90 border border-slate-700 rounded-xl p-3 flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-[#FF5733] border border-white/20"></span>
              <span className="font-mono text-slate-300">Detected: #FF5733</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-[#4F46E5] border border-white/20"></span>
              <span className="font-mono text-emerald-300">Brand Kit: #4F46E5</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
