import { RegisterForm } from "@/components/auth/RegisterForm";
import Link from "next/link";

export const metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <div className="container-mp py-16">
      <div className="mx-auto max-w-md card p-6">
        <span className="kicker">New account</span>
        <h1 className="mt-1 font-serif text-2xl font-semibold text-white">Create your account</h1>
        <RegisterForm />
        <div className="mt-6 text-sm text-ink-300">
          Already have an account?{" "}
          <Link href="/login" className="text-accent hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
