import { RegisterForm } from "@/components/auth/RegisterForm";
import { UserPlus } from "lucide-react";

export const metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <div className="container-tw py-16 animate-fade-in">
      <div className="max-w-sm mx-auto">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-accent/10 rounded-md flex items-center justify-center mx-auto mb-4">
            <UserPlus size={20} className="text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-ink-50 tracking-tight">Create Account</h1>
          <p className="text-sm text-ink-400 mt-1">Join TradeWave for personalized market coverage</p>
        </div>
        <div className="card p-6">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
