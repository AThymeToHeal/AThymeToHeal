'use client';

/** Friendly fallback for anything that goes wrong inside /admin (e.g. a session that expired mid-edit). */
export default function AdminError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf7ee] px-5 py-16">
      <div className="w-full max-w-sm text-center">
        <h1 className="mb-2 font-serif text-2xl text-[#023020]">Something went wrong</h1>
        <p className="mb-6 text-sm text-[#2a2319]/70">
          That didn&apos;t go through. Your website is fine. Try again, or sign in again if you&apos;ve been away for a while.
        </p>
        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-lg bg-[#023020] px-5 py-2.5 text-sm font-semibold text-[#f0e9d2] hover:bg-[#0b4a33]"
          >
            Try again
          </button>
          <a
            href="/admin/login"
            className="inline-flex items-center rounded-lg border border-[#2a2319]/20 px-5 py-2.5 text-sm font-semibold text-[#2a2319]/80 hover:text-[#023020]"
          >
            Sign in again
          </a>
        </div>
      </div>
    </main>
  );
}
