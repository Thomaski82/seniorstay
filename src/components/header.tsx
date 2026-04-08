import Link from "next/link";

import { LanguageToggle } from "@/components/language-toggle";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/lib/actions";
import { getLocaleFromCookie } from "@/lib/locale";

export async function Header() {
  const user = await getCurrentUser();
  const locale = await getLocaleFromCookie();
  const copy =
    locale === "pl"
      ? {
          browse: "Przegladaj",
          profile: "Profil",
          admin: "Admin",
          signIn: "Zaloguj",
          getStarted: "Zacznij",
          logout: "Wyloguj"
        }
      : {
          browse: "Browse",
          profile: "Profile",
          admin: "Admin",
          signIn: "Sign in",
          getStarted: "Get started",
          logout: "Log out"
        };

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand">
          SeniorStay
        </Link>

        <nav className="nav">
          <LanguageToggle />
          <Link href="/">{copy.browse}</Link>
          {user && <Link href="/profile">{copy.profile}</Link>}
          {user?.role === "ADMIN" && <Link href="/admin">Admin</Link>}
          {!user ? (
            <>
              <Link href="/login">{copy.signIn}</Link>
              <Link href="/register" className="button button-small button-primary">
                {copy.getStarted}
              </Link>
            </>
          ) : (
            <form action={logoutAction}>
              <button type="submit" className="button button-small">
                {copy.logout}
              </button>
            </form>
          )}
        </nav>
      </div>
    </header>
  );
}
