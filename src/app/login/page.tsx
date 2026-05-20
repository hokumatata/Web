import { LoginForm } from "@/components/auth/LoginForm";
import Link from "next/link";

export const metadata = { title: "Sign in" };

export default function LoginPage({ searchParams }: { searchParams: { next?: string } }) {
  return (
    <div className="container-mp py-16">
      <div className="mx-auto max-w-md card p-6">
        <span className="kicker">Account</span>
        <h1 className="mt-1 font-serif text-2xl font-semibold text-white">Sign in</h1>
        <LoginForm next={searchParams.next ?? "/dashboard"} />
        <div className="mt-6 text-sm text-ink-300">
          New here?{" "}
          <Link href="/register" className="text-accent hover:underline">
            Create an account
          </Link>
        </div>
        <div className="mt-6 rounded-sm border border-ink-700 bg-ink-850 p-3 text-xs text-ink-300">
          <p className="text-ink-200 font-medium mb-1">Demo accounts</p>
          <p>admin@marketpulse.local · editor@marketpulse.local · author@marketpulse.local · reader@marketpulse.local</p>
          <p className="mt-1">Password: <span className="text-ink-100 font-mono">password123</span></p>
        </div>
      </div>
    </div>
  );
}
