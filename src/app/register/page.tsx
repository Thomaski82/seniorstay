import Link from "next/link";

import { registerAction } from "@/lib/actions";

export default function RegisterPage() {
  return (
    <main className="container auth-shell">
      <div className="auth-card">
        <div>
          <p className="eyebrow">Create account</p>
          <h1>Save homes and book care online</h1>
        </div>

        <form action={registerAction} className="stack-md">
          <label>
            <span>Full name</span>
            <input name="name" placeholder="Jane Doe" required />
          </label>
          <label>
            <span>Email</span>
            <input name="email" type="email" placeholder="you@example.com" required />
          </label>
          <label>
            <span>Password</span>
            <input name="password" type="password" placeholder="Minimum 8 characters" required />
          </label>
          <button type="submit" className="button button-primary">
            Create account
          </button>
        </form>

        <p className="muted">
          Already registered? <Link href="/login">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
