"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, LayoutDashboard, Bookmark, Eye, Settings, LogOut, ChevronDown, FileText, ClipboardCheck } from "lucide-react";

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

  const showSiteOps = role === "ADMIN";
  const showWriting = role === "AUTHOR" || role === "EDITOR";
  const showReview = role === "EDITOR";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="btn-secondary h-9 px-3 gap-2 text-sm"
      >
        <div className="w-6 h-6 bg-accent/10 rounded-full flex items-center justify-center">
          <User size={12} className="text-accent" />
        </div>
        <span className="hidden sm:inline font-medium">{name.split(" ")[0]}</span>
        <ChevronDown size={12} className={`transition-transform text-ink-400 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-ink-950 border border-ink-700 rounded-md overflow-hidden z-50" style={{ boxShadow: "var(--shadow-lg)" }}>
          <div className="px-4 py-3 border-b border-ink-700 bg-ink-900">
            <p className="text-sm font-semibold text-ink-50">{name}</p>
            <p className="text-xs text-accent font-medium mt-0.5">{role}</p>
          </div>

          <div className="py-1">
            {[
              { href: "/dashboard", icon: User, label: "Dashboard", show: true },
              { href: "/dashboard/articles", icon: FileText, label: "My Articles", show: showWriting },
              { href: "/dashboard/review", icon: ClipboardCheck, label: "Review Queue", show: showReview },
              { href: "/dashboard/saved", icon: Bookmark, label: "Saved", show: true },
              { href: "/dashboard/watchlist", icon: Eye, label: "Watchlist", show: true },
              { href: "/dashboard/preferences", icon: Settings, label: "Settings", show: true },
            ]
              .filter((item) => item.show)
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-ink-300 hover:text-ink-50 hover:bg-ink-850 transition-colors"
                >
                  <item.icon size={14} className="text-ink-400" />
                  {item.label}
                </Link>
              ))}
          </div>

          {showSiteOps && (
            <div className="border-t border-ink-700 py-1">
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-accent font-medium hover:bg-ink-850 transition-colors"
              >
                <LayoutDashboard size={14} />
                Site ops
              </Link>
            </div>
          )}

          <div className="border-t border-ink-700 py-1">
            <button
              onClick={logout}
              className="flex items-center gap-3 px-4 py-2 text-sm text-down font-medium hover:bg-ink-850 transition-colors w-full text-left"
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
