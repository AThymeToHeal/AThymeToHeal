import Link from 'next/link';
import SetPasswordForm from './SetPasswordForm';

export const metadata = { title: 'Choose a password' };

export default async function SetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const valid = !!token && /^[0-9a-f]{64}$/.test(token);
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#023020] px-5 py-16">
      <div className="w-full max-w-sm">
        <p className="font-script text-5xl leading-tight text-[#d9a066]">A Thyme to Heal</p>
        <h1 className="mb-8 mt-3 font-serif text-2xl text-[#f0e9d2]">Choose your password</h1>
        {valid ? (
          <SetPasswordForm token={token} />
        ) : (
          <p className="text-sm text-[#f0e9d2]/80">
            This link isn&apos;t complete. Open it straight from your email, or{' '}
            <Link href="/admin/login" className="underline">ask for a new one</Link>.
          </p>
        )}
      </div>
    </main>
  );
}
