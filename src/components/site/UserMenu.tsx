"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, LayoutDashboard, Bookmark, Eye, Settings, LogOut, ChevronDown, FileText } from "lucide-react";

interface UserMenuProps {
  name: string;
  role: string;
}

export function UserMenu({ name, role }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  const isAdmin = role === "ADMIN" || role === "EDITOR";
  const isAuthor = role === "ADMIN" || role === "EDITOR" || role === "AUTHOR";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="btn-secondary h-7 px-2 gap-1 text-3xs"
      >
        <User size={12} />
        <span className="hidden sm:inline">{name.split(" ")[0].toUpperCase()}</span>
        <ChevronDown size={10} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-52 bg-ink-900 border border-ink-700 shadow-xl z-50">
          <div className="px-3 py-2 border-b border-ink-700 bg-ink-800">
            <p className="text-2xs font-bold text-white uppercase tracking-wider">{name}</p>
            <p className="text-3xs text-accent uppercase tracking-widest">{role}</p>
          </div>

          <div className="py-0.5">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-1.5 text-2xs text-ink-300 hover:text-accent hover:bg-ink-800 transition-colors uppercase tracking-wider"
            >
              <User size={12} />
              DASHBOARD
            </Link>
            {isAuthor && (
              <Link
                href="/dashboard/articles"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-1.5 text-2xs text-ink-300 hover:text-accent hover:bg-ink-800 transition-colors uppercase tracking-wider"
              >
                <FileText size={12} />
                MY ARTICLES
              </Link>
            )}
            <Link
              href="/dashboard/saved"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-1.5 text-2xs text-ink-300 hover:text-accent hover:bg-ink-800 transition-colors uppercase tracking-wider"
            >
              <Bookmark size={12} />
              SAVED
            </Link>
            <Link
              href="/dashboard/watchlist"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-1.5 text-2xs text-ink-300 hover:text-accent hover:bg-ink-800 transition-colors uppercase tracking-wider"
            >
              <Eye size={12} />
              WATCHLIST
            </Link>
            <Link
              href="/dashboard/preferences"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-1.5 text-2xs text-ink-300 hover:text-accent hover:bg-ink-800 transition-colors uppercase tracking-wider"
            >
              <Settings size={12} />
              SETTINGS
            </Link>
          </div>

          {isAdmin && (
            <div className="border-t border-ink-700 py-0.5">
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-1.5 text-2xs text-accent hover:bg-ink-800 transition-colors uppercase tracking-wider font-bold"
              >
                <LayoutDashboard size={12} />
                ADMIN PANEL
              </Link>
            </div>
          )}

          <div className="border-t border-ink-700 py-0.5">
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-1.5 text-2xs text-down hover:bg-down/10 transition-colors w-full text-left uppercase tracking-wider font-bold"
            >
              <LogOut size={12} />
              SIGN OUT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
