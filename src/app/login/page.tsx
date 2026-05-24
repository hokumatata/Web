import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="container-tw py-16 animate-fade-in">
      <div className="max-w-sm mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-1 mb-3">
            <span className="block h-6 w-1 bg-accent rounded-sm" />
            <span className="block h-6 w-1 bg-accent/50 rounded-sm" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-white">Sign in</h1>
          <p className="text-sm text-ink-300 mt-1">Access your TradeWave account</p>
        </div>
        <div className="card p-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
