import Link from "next/link";

import { loginAction } from "@/lib/actions";
import { getLocaleFromSearchParam } from "@/lib/locale";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParam(params.lang);
  const copy =
    locale === "pl"
      ? {
          welcome: "Witaj ponownie",
          title: "Zaloguj sie, aby zarzadzac rezerwacjami i ulubionymi",
          email: "E-mail",
          password: "Haslo",
          signIn: "Zaloguj sie",
          demo: "Demo admin",
          need: "Potrzebujesz konta?",
          create: "Utworz konto"
        }
      : {
          welcome: "Welcome back",
          title: "Sign in to manage bookings and favorites",
          email: "Email",
          password: "Password",
          signIn: "Sign in",
          demo: "Demo admin",
          need: "Need an account?",
          create: "Create one"
        };

  return (
    <main className="container auth-shell">
      <div className="auth-card">
        <div>
          <p className="eyebrow">{copy.welcome}</p>
          <h1>{copy.title}</h1>
        </div>

        <form action={loginAction} className="stack-md">
          <label>
            <span>{copy.email}</span>
            <input name="email" type="email" placeholder="you@example.com" required />
          </label>
          <label>
            <span>{copy.password}</span>
            <input name="password" type="password" placeholder="********" required />
          </label>
          <button type="submit" className="button button-primary">
            {copy.signIn}
          </button>
        </form>

        <p className="muted">
          {copy.demo}: <strong>admin@seniorstay.com</strong> / <strong>password123</strong>
        </p>
        <p className="muted">
          {copy.need} <Link href={`/register${locale === "pl" ? "?lang=pl" : ""}`}>{copy.create}</Link>
        </p>
      </div>
    </main>
  );
}
