import LoginForm from './LoginForm';
import { teamIsActive } from '@/lib/admin/session';

export const metadata = { title: 'Sign in' };
export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  let team = false;
  try {
    team = await teamIsActive();
  } catch {
    // Database unreachable: the shared password form still renders
  }
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#023020] px-5 py-16">
      <div className="w-full max-w-sm">
        <p className="font-script text-5xl leading-tight text-[#d9a066]">A Thyme to Heal</p>
        <h1 className="mt-3 font-serif text-2xl text-[#f0e9d2]">Practice admin</h1>
        <p className="mb-8 mt-2 text-sm text-[#f0e9d2]/70">
          Appointments, time off, clients, reviews and messages, all in one place.
        </p>
        <LoginForm team={team} />
      </div>
    </main>
  );
}
