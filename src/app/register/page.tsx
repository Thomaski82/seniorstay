import Link from "next/link";

import { registerAction } from "@/lib/actions";
import { getLocaleFromSearchParam } from "@/lib/locale";

export default async function RegisterPage({
  searchParams
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParam(params.lang);
  const copy =
    locale === "pl"
      ? {
          create: "Utworz konto",
          title: "Zapisuj domy i rezerwuj opieke online",
          fullName: "Imie i nazwisko",
          email: "E-mail",
          password: "Haslo",
          passwordPlaceholder: "Minimum 8 znakow",
          createAccount: "Utworz konto",
          already: "Masz juz konto?",
          signIn: "Zaloguj sie"
        }
      : {
          create: "Create account",
          title: "Save homes and book care online",
          fullName: "Full name",
          email: "Email",
          password: "Password",
          passwordPlaceholder: "Minimum 8 characters",
          createAccount: "Create account",
          already: "Already registered?",
          signIn: "Sign in"
        };

  return (
    <main className="container auth-shell">
      <div className="auth-card">
        <div>
          <p className="eyebrow">{copy.create}</p>
          <h1>{copy.title}</h1>
        </div>

        <form action={registerAction} className="stack-md">
          <label>
            <span>{copy.fullName}</span>
            <input name="name" placeholder="Jane Doe" required />
          </label>
          <label>
            <span>{copy.email}</span>
            <input name="email" type="email" placeholder="you@example.com" required />
          </label>
          <label>
            <span>{copy.password}</span>
            <input name="password" type="password" placeholder={copy.passwordPlaceholder} required />
          </label>
          <button type="submit" className="button button-primary">
            {copy.createAccount}
          </button>
        </form>

        <p className="muted">
          {copy.already} <Link href={`/login${locale === "pl" ? "?lang=pl" : ""}`}>{copy.signIn}</Link>
        </p>
      </div>
    </main>
  );
}
