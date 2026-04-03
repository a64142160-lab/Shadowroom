'use client';

import { Minus, Plus, X } from 'lucide-react';

const themes = {
  Shadow: { bg: '#0a0a0f', surface: '#111118', surface2: '#18181f', accent: '#7c5cfc', accent2: '#c084fc', text: '#e8e8f0', muted: '#6b6b80' },
  Ocean: { bg: '#08111a', surface: '#0f1a25', surface2: '#132233', accent: '#38bdf8', accent2: '#60a5fa', text: '#e6f6ff', muted: '#70a6c1' },
  Forest: { bg: '#08130d', surface: '#102116', surface2: '#16301f', accent: '#34d399', accent2: '#86efac', text: '#e8fff2', muted: '#75b596' },
  Ember: { bg: '#160c0c', surface: '#261212', surface2: '#341818', accent: '#f97316', accent2: '#fb7185', text: '#fff1ee', muted: '#c79b91' },
  Light: { bg: '#f5f7ff', surface: '#ffffff', surface2: '#e8ecff', accent: '#4f46e5', accent2: '#7c3aed', text: '#1f2435', muted: '#5f6985' }
};

export default function SettingsPanel({ open, onClose, settings, canEdit, onUpdate }) {
  if (!open) return null;

  const applyTheme = (name) => {
    const theme = themes[name];
    Object.entries(theme).forEach(([k, v]) => document.documentElement.style.setProperty(`--${k}`, v));
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/60">
      <div className="h-full w-full max-w-md border-l border-border bg-surface p-4">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Room Settings</h2>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        {!canEdit ? <p className="rounded-lg border border-yellow/30 bg-yellow/10 p-3 text-sm text-yellow">Host has disabled member settings changes.</p> : (
          <div className="space-y-4 text-sm">
            {[
              ['allowMemberSettings', 'Allow Members to Edit Settings'],
              ['locked', 'Lock Room'],
              ['onlyHostCanMessage', 'Only Host Can Send Messages']
            ].map(([key, label]) => (
              <label key={key} className="flex items-center justify-between rounded-lg border border-border bg-surface2 px-3 py-3">
                <span>{label}</span>
                <input type="checkbox" checked={settings?.[key]} onChange={(e) => onUpdate({ [key]: e.target.checked })} />
              </label>
            ))}

            <div className="rounded-lg border border-border bg-surface2 p-3">
              <p className="mb-2">Theme</p>
              <div className="grid grid-cols-5 gap-2">
                {Object.keys(themes).map((name) => (
                  <button key={name} onClick={() => applyTheme(name)} className="rounded bg-white/5 px-2 py-1 text-xs">{name}</button>
                ))}
              </div>
            </div>

            <label className="block rounded-lg border border-border bg-surface2 p-3">
              <p className="mb-2">Custom Accent Color</p>
              <input type="color" onChange={(e) => {
                document.documentElement.style.setProperty('--accent', e.target.value);
                document.documentElement.style.setProperty('--accent2', e.target.value);
              }} />
            </label>

            <div className="rounded-lg border border-border bg-surface2 p-3">
              <p className="mb-2">Font Size</p>
              <div className="flex items-center gap-2">
                <button onClick={() => {
                  const current = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--font-size'));
                  document.documentElement.style.setProperty('--font-size', `${Math.max(12, current - 1)}px`);
                }} className="rounded bg-white/10 p-2"><Minus size={14} /></button>
                <button onClick={() => {
                  const current = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--font-size'));
                  document.documentElement.style.setProperty('--font-size', `${Math.min(20, current + 1)}px`);
                }} className="rounded bg-white/10 p-2"><Plus size={14} /></button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
