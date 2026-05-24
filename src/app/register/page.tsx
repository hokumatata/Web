import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <div className="container-tw py-16 animate-fade-in">
      <div className="max-w-sm mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-1 mb-3">
            <span className="block h-6 w-1 bg-accent rounded-sm" />
            <span className="block h-6 w-1 bg-accent/50 rounded-sm" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-ink-50">Create account</h1>
          <p className="text-sm text-ink-300 mt-1">Join TradeWave for personalized market coverage</p>
        </div>
        <div className="card p-6">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
