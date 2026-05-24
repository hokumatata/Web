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
        className="btn-secondary h-8 px-3 gap-1.5"
      >
        <User size={14} />
        <span className="hidden sm:inline text-xs">{name.split(" ")[0]}</span>
        <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-56 bg-ink-900 border border-ink-700 rounded-sm shadow-xl z-50 py-1">
          <div className="px-3 py-2 border-b border-ink-700">
            <p className="text-sm font-medium text-white">{name}</p>
            <p className="text-2xs text-ink-400 uppercase tracking-wider">{role}</p>
          </div>

          <div className="py-1">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-sm text-ink-200 hover:text-white hover:bg-ink-800 transition-colors"
            >
              <User size={14} />
              My Dashboard
            </Link>
            {isAuthor && (
              <Link
                href="/dashboard/articles"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-ink-200 hover:text-white hover:bg-ink-800 transition-colors"
              >
                <FileText size={14} />
                My Articles
              </Link>
            )}
            <Link
              href="/dashboard/saved"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-sm text-ink-200 hover:text-white hover:bg-ink-800 transition-colors"
            >
              <Bookmark size={14} />
              Saved Articles
            </Link>
            <Link
              href="/dashboard/watchlist"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-sm text-ink-200 hover:text-white hover:bg-ink-800 transition-colors"
            >
              <Eye size={14} />
              Watchlist
            </Link>
            <Link
              href="/dashboard/preferences"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-sm text-ink-200 hover:text-white hover:bg-ink-800 transition-colors"
            >
              <Settings size={14} />
              Preferences
            </Link>
          </div>

          {isAdmin && (
            <div className="border-t border-ink-700 py-1">
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-accent hover:bg-ink-800 transition-colors"
              >
                <LayoutDashboard size={14} />
                Admin Panel
              </Link>
            </div>
          )}

          <div className="border-t border-ink-700 py-1">
            <button
              onClick={logout}
              className="flex items-center gap-2.5 px-3 py-2 text-sm text-down hover:bg-down/10 transition-colors w-full text-left"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
