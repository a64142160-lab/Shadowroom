'use client';

import { Copy, X } from 'lucide-react';

export default function DonateModal({ open, onClose }) {
  if (!open) return null;

  const copy = async () => {
    await navigator.clipboard.writeText('UPI_ID_PLACEHOLDER');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="glass w-full max-w-md rounded-2xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Support ShadowRoom</h2>
          <button onClick={onClose} className="rounded p-1 hover:bg-white/10"><X size={18} /></button>
        </div>
        <div className="mb-4 h-56 rounded-xl border border-border bg-surface2 p-4 text-center text-sm text-muted">
          UPI QR placeholder
        </div>
        <div className="flex items-center justify-between rounded-xl border border-border bg-surface2 px-4 py-3 font-mono text-sm">
          <span>UPI_ID_PLACEHOLDER</span>
          <button onClick={copy} className="rounded-lg bg-accent/20 p-2 text-accent hover:bg-accent/30"><Copy size={16} /></button>
        </div>
      </div>
    </div>
  );
}
