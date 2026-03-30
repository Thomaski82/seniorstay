import Link from "next/link";

import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/lib/actions";

export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand">
          SeniorStay
        </Link>

        <nav className="nav">
          <Link href="/">Browse</Link>
          {user && <Link href="/profile">Profile</Link>}
          {user?.role === "ADMIN" && <Link href="/admin">Admin</Link>}
          {!user ? (
            <>
              <Link href="/login">Sign in</Link>
              <Link href="/register" className="button button-small button-primary">
                Get started
              </Link>
            </>
          ) : (
            <form action={logoutAction}>
              <button type="submit" className="button button-small">
                Log out
              </button>
            </form>
          )}
        </nav>
      </div>
    </header>
  );
}
