import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="container-tw py-16 animate-fade-in">
      <div className="max-w-sm mx-auto">
        <div className="text-center mb-6">
          <span className="block h-5 w-1 bg-accent mx-auto mb-2" />
          <h1 className="text-sm font-bold text-accent uppercase tracking-widest">SIGN IN</h1>
          <p className="text-3xs text-ink-400 mt-1 uppercase tracking-wider">ACCESS YOUR TERMINAL</p>
        </div>
        <div className="card p-5">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
