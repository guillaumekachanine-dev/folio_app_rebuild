import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--bg-base) 0%, var(--bg-light) 100%)" }}>
      <LoginForm />
    </div>
  );
}
