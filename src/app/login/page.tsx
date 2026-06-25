import { LoginForm } from "@/components/auth/LoginForm";
import { LogIn } from "lucide-react";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="container-tw py-16 animate-fade-in">
      <div className="max-w-sm mx-auto">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-accent/10 rounded-md flex items-center justify-center mx-auto mb-4">
            <LogIn size={20} className="text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-ink-50 tracking-tight">Sign In</h1>
          <p className="text-sm text-ink-400 mt-1">Access your Forex Republic account</p>
        </div>
        <div className="card p-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
