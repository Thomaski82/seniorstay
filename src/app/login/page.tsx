import Link from "next/link";

import { loginAction } from "@/lib/actions";

export default function LoginPage() {
  return (
    <main className="container auth-shell">
      <div className="auth-card">
        <div>
          <p className="eyebrow">Welcome back</p>
          <h1>Sign in to manage bookings and favorites</h1>
        </div>

        <form action={loginAction} className="stack-md">
          <label>
            <span>Email</span>
            <input name="email" type="email" placeholder="you@example.com" required />
          </label>
          <label>
            <span>Password</span>
            <input name="password" type="password" placeholder="••••••••" required />
          </label>
          <button type="submit" className="button button-primary">
            Sign in
          </button>
        </form>

        <p className="muted">
          Demo admin: <strong>admin@seniorstay.com</strong> / <strong>password123</strong>
        </p>
        <p className="muted">
          Need an account? <Link href="/register">Create one</Link>
        </p>
      </div>
    </main>
  );
}
