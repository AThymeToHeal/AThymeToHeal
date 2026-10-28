'use client';

import { useState, useTransition } from 'react';
import { copyInviteLinkAction } from '@/lib/admin/team-actions';
import CopyField from './CopyField';
import { btnQuiet } from './ui';

/** Makes a fresh one-time link for someone and shows it with a Copy button, to send yourself. */
export default function InviteLinkButton({ id, name, pending }: { id: string; name: string; pending: boolean }) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [working, start] = useTransition();

  if (url) {
    return (
      <div className="w-full space-y-1.5">
        <CopyField value={url} label={`Link for ${name}`} />
        <p className="text-xs text-[#2a2319]/55">
          Email or text this to {name}. It works once, for {pending ? '7 days' : '1 hour'}, and lets them choose {pending ? 'their' : 'a new'} password.
        </p>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        disabled={working}
        className={btnQuiet}
        onClick={() =>
          start(async () => {
            const res = await copyInviteLinkAction(id);
            if (res.url) setUrl(res.url);
            else setError(res.error ?? 'Something went wrong.');
          })
        }
      >
        {working ? 'Making link…' : pending ? 'Copy invite link' : 'Copy password-reset link'}
      </button>
      {error && <span className="text-sm text-[#8a3214]">{error}</span>}
    </>
  );
}
