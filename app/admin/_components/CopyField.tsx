'use client';

import { useState } from 'react';

/** Read-only link with a Copy button. */
export default function CopyField({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex gap-2">
      <input
        readOnly
        value={value}
        aria-label={label}
        onFocus={(e) => e.currentTarget.select()}
        className="min-w-0 flex-1 rounded-lg border border-[#2a2319]/20 bg-[#faf7ee] px-3 py-2 font-mono text-xs text-[#2a2319]/80"
      />
      <button
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        className="shrink-0 rounded-lg border border-[#2a2319]/20 bg-white px-3 py-2 text-sm font-semibold text-[#2a2319] hover:border-[#023020] hover:text-[#023020]"
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}
