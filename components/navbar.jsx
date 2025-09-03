"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./auth-provider";
import { useTheme } from "./theme-provider";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useState } from "react";

const navItems = [
  { href: "/", label: "Landing", public: true },
  { href: "/Home", label: "Dashboard", protected: true },
  { href: "/test", label: "Start Test", protected: true },
  { href: "/profile", label: "Profile", protected: true },
];

export function Navbar() {
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <nav className="max-w-7xl mx-auto flex items-center gap-4 px-4 py-3">        
        <div className="flex items-center gap-6 flex-1">
          <Link href="/" className="font-bold tracking-tight text-lg focus:outline-none focus:ring-2 focus:ring-ring rounded-sm">EquiTestAI</Link>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggle} aria-label="Toggle theme" className="h-9 w-9 inline-flex items-center justify-center rounded-sm border border-border hover:bg-accent/10 focus:outline-none focus:ring-2 focus:ring-ring text-xs">
            {theme === "dark" ? "🌞" : "🌙"}
          </button>
          {!user && (
            <div className="flex items-center gap-2">
              <Link href="/login" className="text-sm px-3 py-1.5 rounded-sm bg-primary text-primary-foreground shadow hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring">Login</Link>
              <Link href="/signin" className="text-sm px-3 py-1.5 rounded-sm bg-primary text-primary-foreground shadow hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring">Sign Up</Link>
            </div>
          )}
          {user && (
            <div className="relative">
              <button onClick={()=>setMenuOpen(o=>!o)} className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-sm border border-border hover:bg-accent/10 focus:outline-none focus:ring-2 focus:ring-ring" aria-haspopup="menu" aria-expanded={menuOpen}>
                <span className="h-6 w-6 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center" aria-hidden>{user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}</span>
                <span className="hidden sm:inline max-w-28 truncate">{user.displayName || user.email}</span>
              </button>
              {menuOpen && (
                <ul role="menu" className="absolute right-0 mt-2 w-48 rounded-sm border border-border bg-background shadow-md p-1 text-sm">
                  {navItems.filter(i=>i.protected).map(i=> (
                    <li key={i.href}>
                      <Link role="menuitem" onClick={()=>setMenuOpen(false)} href={i.href} className="block px-3 py-2 rounded-sm hover:bg-accent/10 focus:outline-none focus:ring-2 focus:ring-ring">{i.label}</Link>
                    </li>
                  ))}
                  <li>
                    <button
                      role="menuitem"
                      onClick={async()=>{ await signOut(auth); setMenuOpen(false); router.push('/'); }}
                      className="w-full text-left px-3 py-2 rounded-sm text-destructive hover:bg-destructive/10 focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              )}
            </div>
          )}
        </div>
      </nav>
      <div className="md:hidden border-t border-border px-4 pb-3 flex gap-3 flex-wrap">
        {navItems.filter(i => (i.public || (i.protected && user))).map(i => (
          <Link key={i.href} href={i.href} className={`text-xs px-2 py-1 rounded-sm border border-border ${pathname===i.href?"bg-accent/10": "hover:bg-accent/10"}`}>{i.label}</Link>
        ))}
      </div>
    </header>
  );
}
