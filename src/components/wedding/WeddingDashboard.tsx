"use client";

import { useMemo, useState } from "react";
import {
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  Flower2,
  Gift,
  Heart,
  LayoutDashboard,
  ListChecks,
  MapPin,
  Menu,
  MessageCircle,
  MoreHorizontal,
  Palette,
  Plus,
  Search,
  Settings,
  Sparkles,
  Store,
  Users,
  WalletCards,
  X,
} from "lucide-react";

type NavItem = {
  label: string;
  icon: typeof LayoutDashboard;
  badge?: number;
};

type Task = {
  id: number;
  title: string;
  category: string;
  due: string;
  done: boolean;
  priority: "High" | "Medium" | "Low";
  owner: string;
};

const navigation: NavItem[] = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Tasks", icon: ListChecks, badge: 12 },
  { label: "Guest list", icon: Users },
  { label: "Budget", icon: WalletCards },
  { label: "Vendors", icon: Store },
  { label: "Events", icon: CalendarDays },
  { label: "Inspiration", icon: Palette },
  { label: "Gifts", icon: Gift },
];

const initialTasks: Task[] = [
  {
    id: 1,
    title: "Finalise sangeet choreography",
    category: "Entertainment",
    due: "Today",
    done: false,
    priority: "High",
    owner: "VM",
  },
  {
    id: 2,
    title: "Approve marigold mandap samples",
    category: "Décor",
    due: "Tomorrow",
    done: false,
    priority: "High",
    owner: "AS",
  },
  {
    id: 3,
    title: "Send room allocation to hotel",
    category: "Hospitality",
    due: "18 Jul",
    done: false,
    priority: "Medium",
    owner: "RK",
  },
  {
    id: 4,
    title: "Confirm mehendi artist arrival",
    category: "Beauty",
    due: "20 Jul",
    done: true,
    priority: "Low",
    owner: "VM",
  },
];

const events = [
  {
    day: "29",
    month: "AUG",
    name: "Welcome Dinner",
    details: "7:00 PM · The Courtyard",
    color: "#b45309",
  },
  {
    day: "30",
    month: "AUG",
    name: "Haldi & Mehendi",
    details: "10:00 AM · Gulmohar Lawn",
    color: "#d97706",
  },
  {
    day: "30",
    month: "AUG",
    name: "Sangeet Night",
    details: "7:30 PM · Darbar Hall",
    color: "#9f1239",
  },
  {
    day: "31",
    month: "AUG",
    name: "Wedding Ceremony",
    details: "5:45 PM · Palace Terrace",
    color: "#7f1d1d",
  },
];

const vendors = [
  {
    name: "Jaipur Blooms",
    service: "Floral décor",
    amount: "₹6.40L",
    status: "Confirmed",
    initials: "JB",
    tint: "bg-rose-100 text-rose-800",
  },
  {
    name: "The Wedding Film Co.",
    service: "Photo & video",
    amount: "₹3.85L",
    status: "Confirmed",
    initials: "WF",
    tint: "bg-amber-100 text-amber-800",
  },
  {
    name: "Rasoi by Rajveer",
    service: "Catering",
    amount: "₹8.20L",
    status: "Awaiting menu",
    initials: "RR",
    tint: "bg-emerald-100 text-emerald-800",
  },
];

const priorityStyles = {
  High: "bg-rose-50 text-rose-700 border-rose-100",
  Medium: "bg-amber-50 text-amber-700 border-amber-100",
  Low: "bg-stone-50 text-stone-600 border-stone-200",
};

export function WeddingDashboard() {
  const [activeNav, setActiveNav] = useState("Overview");
  const [tasks, setTasks] = useState(initialTasks);
  const [search, setSearch] = useState("");
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTask, setNewTask] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const visibleTasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return tasks;
    return tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(query) ||
        task.category.toLowerCase().includes(query),
    );
  }, [search, tasks]);

  const completedTasks = tasks.filter((task) => task.done).length;

  function toggleTask(id: number) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task,
      ),
    );
  }

  function addTask() {
    const title = newTask.trim();
    if (!title) return;

    setTasks((current) => [
      {
        id: Date.now(),
        title,
        category: "General",
        due: "This week",
        done: false,
        priority: "Medium",
        owner: "VM",
      },
      ...current,
    ]);
    setNewTask("");
    setShowTaskForm(false);
  }

  function selectNav(label: string) {
    setActiveNav(label);
    setMobileMenuOpen(false);
  }

  return (
    <div className="min-h-screen bg-[#f7f3ec] text-[#342c28]">
      <div className="flex min-h-screen">
        {mobileMenuOpen && (
          <button
            aria-label="Close navigation"
            className="fixed inset-0 z-30 bg-stone-950/30 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-[248px] flex-col border-r border-[#eadfd2] bg-[#fffaf3] transition-transform lg:static lg:translate-x-0 ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-[82px] items-center justify-between border-b border-[#eadfd2] px-6">
            <button
              className="flex items-center gap-3 text-left"
              onClick={() => selectNav("Overview")}
            >
              <span className="relative grid h-10 w-10 place-items-center rounded-full bg-[#861f2d] text-[#f5c96a] shadow-[0_7px_18px_rgba(134,31,45,0.22)]">
                <Flower2 size={21} strokeWidth={1.8} />
                <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-[#fffaf3] bg-[#e2a93b]" />
              </span>
              <span>
                <span className="block font-serif text-xl font-bold leading-none tracking-tight text-[#6f1826]">
                  Saanjh
                </span>
                <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.23em] text-[#a67c52]">
                  Wedding Studio
                </span>
              </span>
            </button>
            <button
              aria-label="Close menu"
              className="rounded-lg p-2 text-stone-500 hover:bg-[#f4eadf] lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X size={18} />
            </button>
          </div>

          <nav className="flex-1 px-3 py-6">
            <p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#b5a090]">
              Planning
            </p>
            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = activeNav === item.label;
                return (
                  <button
                    key={item.label}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                      active
                        ? "bg-[#861f2d] text-white shadow-[0_7px_18px_rgba(134,31,45,0.17)]"
                        : "text-[#74655d] hover:bg-[#f4eadf] hover:text-[#6f1826]"
                    }`}
                    onClick={() => selectNav(item.label)}
                  >
                    <Icon
                      size={17}
                      strokeWidth={active ? 2.25 : 1.8}
                      className={active ? "text-[#f5d17e]" : ""}
                    />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span
                        className={`ml-auto rounded-full px-2 py-0.5 text-[10px] ${
                          active
                            ? "bg-white/15 text-white"
                            : "bg-[#f0dfd3] text-[#861f2d]"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="m-3 overflow-hidden rounded-2xl bg-[#38151b] p-4 text-white">
            <div className="mb-5 flex items-center gap-2 text-[#f5d17e]">
              <Sparkles size={15} />
              <span className="text-[10px] font-bold uppercase tracking-[0.16em]">
                Wedding countdown
              </span>
            </div>
            <div className="flex items-end gap-2">
              <span className="font-serif text-4xl font-bold leading-none">48</span>
              <span className="pb-1 text-xs text-white/60">days to go</span>
            </div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-[72%] rounded-full bg-[#d8a23a]" />
            </div>
            <p className="mt-2 text-[10px] text-white/45">72% planning complete</p>
          </div>

          <div className="flex items-center gap-3 border-t border-[#eadfd2] px-5 py-4">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#ead4c2] text-xs font-bold text-[#7a2430]">
              VD
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-bold text-[#443832]">
                Vishal Dixit
              </span>
              <span className="block text-[10px] text-[#9c877a]">Lead planner</span>
            </span>
            <Settings size={16} className="text-[#a69386]" />
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 flex h-[82px] items-center justify-between border-b border-[#eadfd2] bg-[#f7f3ec]/95 px-4 backdrop-blur md:px-7 xl:px-10">
            <div className="flex items-center gap-3">
              <button
                aria-label="Open navigation"
                className="rounded-lg border border-[#e2d7cc] bg-white p-2 text-stone-600 lg:hidden"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu size={19} />
              </button>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#ad8e78]">
                  {activeNav}
                </p>
                <h1 className="mt-0.5 font-serif text-xl font-bold tracking-tight text-[#43242a] md:text-2xl">
                  Aanya &amp; Rohan
                </h1>
              </div>
              <span className="ml-1 hidden rounded-full border border-[#ead7be] bg-[#fff9ed] px-2.5 py-1 text-[10px] font-bold text-[#9a6a22] sm:inline">
                31 AUG 2026 · JAIPUR
              </span>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <label className="relative hidden md:block">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a18e82]"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search planning..."
                  className="h-10 w-52 rounded-xl border border-[#e3d8ce] bg-white pl-9 pr-3 text-xs outline-none transition placeholder:text-[#b4a59b] focus:border-[#9c4450] xl:w-64"
                />
              </label>
              <div className="relative">
                <button
                  aria-label="Notifications"
                  className="relative grid h-10 w-10 place-items-center rounded-xl border border-[#e3d8ce] bg-white text-[#6b5a51] hover:border-[#c9a6aa]"
                  onClick={() => setShowNotifications((visible) => !visible)}
                >
                  <Bell size={17} />
                  <span className="absolute right-2.5 top-2 h-2 w-2 rounded-full border-2 border-white bg-[#b3263c]" />
                </button>
                {showNotifications && (
                  <div className="absolute right-0 top-12 w-72 rounded-2xl border border-[#e9ddd2] bg-white p-3 shadow-xl">
                    <p className="px-2 pb-2 text-xs font-bold text-[#4c3931]">
                      Planning updates
                    </p>
                    <div className="rounded-xl bg-[#faf5ee] p-3 text-xs leading-relaxed text-[#76645a]">
                      Jaipur Blooms uploaded three new mandap concepts.
                      <span className="mt-1 block text-[10px] text-[#aa9283]">
                        12 minutes ago
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <button
                className="flex h-10 items-center gap-2 rounded-xl bg-[#861f2d] px-3.5 text-xs font-bold text-white shadow-[0_7px_18px_rgba(134,31,45,0.16)] hover:bg-[#741725]"
                onClick={() => setShowTaskForm(true)}
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Add task</span>
              </button>
            </div>
          </header>

          <div className="p-4 md:p-7 xl:p-10">
            {activeNav === "Overview" ? (
              <Overview
                tasks={visibleTasks}
                completedTasks={completedTasks}
                toggleTask={toggleTask}
                openTaskForm={() => setShowTaskForm(true)}
                selectNav={selectNav}
              />
            ) : (
              <FocusedView
                title={activeNav}
                tasks={visibleTasks}
                toggleTask={toggleTask}
                openTaskForm={() => setShowTaskForm(true)}
              />
            )}
          </div>
        </main>
      </div>

      {showTaskForm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#2a1518]/45 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/70 bg-[#fffaf3] p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#b18465]">
                  New preparation
                </p>
                <h2 className="mt-1 font-serif text-2xl font-bold text-[#51232b]">
                  Add a task
                </h2>
              </div>
              <button
                aria-label="Close"
                className="rounded-full bg-[#f1e8de] p-2 text-[#75645a]"
                onClick={() => setShowTaskForm(false)}
              >
                <X size={17} />
              </button>
            </div>
            <label className="mt-6 block text-xs font-bold text-[#5f4e45]">
              What needs to be done?
            </label>
            <input
              autoFocus
              value={newTask}
              onChange={(event) => setNewTask(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") addTask();
              }}
              placeholder="e.g. Confirm baraat route"
              className="mt-2 h-12 w-full rounded-xl border border-[#ddcec1] bg-white px-4 text-sm outline-none focus:border-[#9b3b48]"
            />
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button className="rounded-xl border border-[#ddcec1] bg-white px-3 py-3 text-left text-xs">
                <span className="block text-[9px] font-bold uppercase tracking-wider text-[#a38d7f]">
                  Due date
                </span>
                <span className="mt-1 block font-semibold text-[#55443b]">This week</span>
              </button>
              <button className="rounded-xl border border-[#ddcec1] bg-white px-3 py-3 text-left text-xs">
                <span className="block text-[9px] font-bold uppercase tracking-wider text-[#a38d7f]">
                  Priority
                </span>
                <span className="mt-1 block font-semibold text-[#a65e18]">Medium</span>
              </button>
            </div>
            <button
              className="mt-6 w-full rounded-xl bg-[#861f2d] py-3 text-sm font-bold text-white hover:bg-[#741725]"
              onClick={addTask}
            >
              Add to preparation list
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Overview({
  tasks,
  completedTasks,
  toggleTask,
  openTaskForm,
  selectNav,
}: {
  tasks: Task[];
  completedTasks: number;
  toggleTask: (id: number) => void;
  openTaskForm: () => void;
  selectNav: (label: string) => void;
}) {
  return (
    <div className="mx-auto max-w-[1500px] animate-fade-in">
      <section className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold text-[#a1714e]">
            <Sparkles size={14} />
            Tuesday, 14 July
          </p>
          <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-[#3e2427] md:text-[34px]">
            Namaste, Vishal.
          </h2>
          <p className="mt-1 text-sm text-[#8d786c]">
            Everything is moving beautifully. Here&apos;s what needs your attention.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#76645a]">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white shadow-sm">
            <Check size={14} className="text-emerald-600" />
          </span>
          <span>
            <strong className="text-[#4d3b32]">7 updates</strong> since yesterday
          </span>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total budget"
          value="₹32.5L"
          detail="₹18.4L committed"
          icon={CircleDollarSign}
          accent="#9f1239"
          progress={57}
        />
        <StatCard
          label="Guest responses"
          value="486"
          detail="of 650 invited"
          icon={Users}
          accent="#b45309"
          progress={75}
        />
        <StatCard
          label="Preparation"
          value={`${completedTasks + 77}%`}
          detail={`${24 - completedTasks} tasks remaining`}
          icon={ListChecks}
          accent="#047857"
          progress={completedTasks + 77}
        />
        <StatCard
          label="Vendors"
          value="14 / 16"
          detail="2 awaiting confirmation"
          icon={Store}
          accent="#7c3aed"
          progress={88}
        />
      </section>

      <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.42fr)_minmax(320px,0.68fr)]">
        <div className="space-y-5">
          <div className="overflow-hidden rounded-2xl border border-[#e7dcd1] bg-white shadow-[0_7px_24px_rgba(74,48,35,0.05)]">
            <CardHeader
              title="Priority preparations"
              eyebrow="Today & this week"
              action="View all"
              onAction={() => selectNav("Tasks")}
            />
            <div className="divide-y divide-[#f0e9e1]">
              {tasks.slice(0, 4).map((task) => (
                <TaskRow key={task.id} task={task} toggleTask={toggleTask} />
              ))}
            </div>
            <button
              className="flex w-full items-center justify-center gap-2 border-t border-[#f0e9e1] bg-[#fffcf8] py-3 text-xs font-bold text-[#8c3340] hover:bg-[#fbf3ea]"
              onClick={openTaskForm}
            >
              <Plus size={14} />
              Add another preparation
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#e7dcd1] bg-white shadow-[0_7px_24px_rgba(74,48,35,0.05)]">
            <CardHeader
              title="Vendor commitments"
              eyebrow="₹18.4L of ₹32.5L"
              action="Manage vendors"
              onAction={() => selectNav("Vendors")}
            />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left">
                <thead>
                  <tr className="border-b border-[#eee5dd] bg-[#fcfaf7] text-[9px] font-bold uppercase tracking-[0.15em] text-[#a48e80]">
                    <th className="px-5 py-3">Partner</th>
                    <th className="px-4 py-3">Service</th>
                    <th className="px-4 py-3">Commitment</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((vendor) => (
                    <tr
                      key={vendor.name}
                      className="border-b border-[#f2ece5] text-xs last:border-0 hover:bg-[#fffcf8]"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <span
                            className={`grid h-8 w-8 place-items-center rounded-lg text-[10px] font-bold ${vendor.tint}`}
                          >
                            {vendor.initials}
                          </span>
                          <span className="font-bold text-[#4a3830]">{vendor.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-[#806e64]">{vendor.service}</td>
                      <td className="px-4 py-3.5 font-bold text-[#514038]">{vendor.amount}</td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${
                            vendor.status === "Confirmed"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {vendor.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <button aria-label={`More options for ${vendor.name}`}>
                          <MoreHorizontal size={16} className="text-[#a59489]" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="overflow-hidden rounded-2xl bg-[#4d1b23] text-white shadow-[0_16px_35px_rgba(78,27,35,0.18)]">
            <div
              className="relative h-32 bg-cover bg-center"
              style={{
                backgroundImage:
                  "linear-gradient(180deg, rgba(52,14,21,.08), rgba(52,14,21,.82)), url('https://images.unsplash.com/photo-1604608672516-f1b9b1d37076?auto=format&fit=crop&w=1200&q=85')",
              }}
            >
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-[#f0c86d]">
                    Next celebration
                  </p>
                  <h3 className="mt-1 font-serif text-xl font-bold text-white">
                    Welcome Dinner
                  </h3>
                </div>
                <span className="rounded-full border border-white/25 bg-black/15 px-2.5 py-1 text-[9px] font-bold backdrop-blur">
                  46 DAYS
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 divide-x divide-white/10 border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-2 text-xs text-white/70">
                <Clock3 size={14} className="text-[#e3b952]" />
                7:00 PM
              </div>
              <div className="flex items-center gap-2 pl-4 text-xs text-white/70">
                <MapPin size={14} className="text-[#e3b952]" />
                The Courtyard
              </div>
            </div>
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex -space-x-2">
                {["AM", "RM", "SM", "VD"].map((initials, index) => (
                  <span
                    key={initials}
                    className="grid h-7 w-7 place-items-center rounded-full border-2 border-[#4d1b23] bg-[#f0d9c7] text-[8px] font-bold text-[#6f2832]"
                    style={{ zIndex: 4 - index }}
                  >
                    {initials}
                  </span>
                ))}
              </div>
              <button className="flex items-center gap-1.5 text-[10px] font-bold text-[#f1cf78]">
                Open run sheet <ChevronDown size={13} className="-rotate-90" />
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-[#e7dcd1] bg-white p-5 shadow-[0_7px_24px_rgba(74,48,35,0.05)]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#b3957e]">
                  Celebration calendar
                </p>
                <h3 className="mt-1 font-serif text-lg font-bold text-[#4a2d31]">
                  Wedding week
                </h3>
              </div>
              <CalendarDays size={18} className="text-[#91313e]" />
            </div>
            <div className="mt-4 space-y-1">
              {events.map((event) => (
                <div
                  key={`${event.day}-${event.name}`}
                  className="group flex items-center gap-3 rounded-xl px-2 py-2.5 hover:bg-[#faf5ee]"
                >
                  <div className="w-9 text-center">
                    <span className="block text-[8px] font-bold tracking-wider text-[#aa9487]">
                      {event.month}
                    </span>
                    <span className="block font-serif text-lg font-bold leading-none text-[#4f3b32]">
                      {event.day}
                    </span>
                  </div>
                  <span
                    className="h-8 w-[3px] rounded-full"
                    style={{ backgroundColor: event.color }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-[#4f3b32]">
                      {event.name}
                    </p>
                    <p className="mt-0.5 truncate text-[10px] text-[#9b887d]">
                      {event.details}
                    </p>
                  </div>
                  <ChevronDown
                    size={13}
                    className="-rotate-90 text-[#c6b8af] opacity-0 transition group-hover:opacity-100"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#ead9c6] bg-[#fff8e9] p-4">
            <div className="flex gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#f2dfb6] text-[#96611a]">
                <MessageCircle size={17} />
              </span>
              <div>
                <p className="text-xs font-bold text-[#654a26]">Family approval needed</p>
                <p className="mt-1 text-[10px] leading-relaxed text-[#947650]">
                  3 menu items and 2 invitation proofs are waiting for review.
                </p>
                <button className="mt-2 text-[10px] font-bold text-[#8a4f14] underline underline-offset-2">
                  Review together
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FocusedView({
  title,
  tasks,
  toggleTask,
  openTaskForm,
}: {
  title: string;
  tasks: Task[];
  toggleTask: (id: number) => void;
  openTaskForm: () => void;
}) {
  const Icon =
    navigation.find((item) => item.label === title)?.icon ?? LayoutDashboard;

  return (
    <div className="mx-auto max-w-[1200px] animate-fade-in">
      <section className="relative overflow-hidden rounded-3xl bg-[#4b1b23] px-6 py-8 text-white md:px-10 md:py-10">
        <div className="absolute -right-12 -top-16 h-52 w-52 rounded-full border-[38px] border-[#f3c65c]/10" />
        <div className="absolute bottom-[-52px] right-28 h-32 w-32 rounded-full border-[24px] border-white/5" />
        <div className="relative flex items-center gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-[#efc764]">
            <Icon size={23} />
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#e9c46d]">
              Aanya &amp; Rohan · Jaipur
            </p>
            <h2 className="mt-1 font-serif text-3xl font-bold">{title}</h2>
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="overflow-hidden rounded-2xl border border-[#e7dcd1] bg-white">
          <CardHeader
            title={title === "Tasks" ? "All preparations" : `${title} overview`}
            eyebrow="Wedding workspace"
            action="Add new"
            onAction={openTaskForm}
          />
          <div className="divide-y divide-[#f0e9e1]">
            {tasks.map((task) => (
              <TaskRow key={task.id} task={task} toggleTask={toggleTask} />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl border border-[#e7dcd1] bg-white p-5">
            <div className="flex items-center gap-2">
              <Heart size={17} className="fill-[#a33d4a] text-[#a33d4a]" />
              <h3 className="font-serif text-lg font-bold text-[#4a2d31]">
                Planner&apos;s note
              </h3>
            </div>
            <p className="mt-3 text-xs leading-6 text-[#806d62]">
              Keep one owner and one clear deadline on every decision. The final
              four weeks should be for confirmations, not new choices.
            </p>
          </div>
          <div className="rounded-2xl border border-[#e6d7c8] bg-[#f3e8dc] p-5">
            <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-[#a17758]">
              Completion
            </p>
            <div className="mt-3 flex items-end gap-2">
              <span className="font-serif text-4xl font-bold text-[#6f2430]">72%</span>
              <span className="pb-1 text-xs text-[#9a7e6b]">on track</span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/70">
              <div className="h-full w-[72%] rounded-full bg-[#9b3341]" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  accent,
  progress,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof LayoutDashboard;
  accent: string;
  progress: number;
}) {
  return (
    <div className="rounded-2xl border border-[#e7dcd1] bg-white p-5 shadow-[0_7px_24px_rgba(74,48,35,0.04)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#a18c80]">
            {label}
          </p>
          <p className="mt-2 font-serif text-[27px] font-bold leading-none text-[#402f29]">
            {value}
          </p>
        </div>
        <span
          className="grid h-9 w-9 place-items-center rounded-xl"
          style={{ backgroundColor: `${accent}12`, color: accent }}
        >
          <Icon size={18} />
        </span>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#f0ebe6]">
          <div
            className="h-full rounded-full"
            style={{ width: `${Math.min(progress, 100)}%`, backgroundColor: accent }}
          />
        </div>
        <span className="whitespace-nowrap text-[9px] font-semibold text-[#927e72]">
          {detail}
        </span>
      </div>
    </div>
  );
}

function CardHeader({
  title,
  eyebrow,
  action,
  onAction,
}: {
  title: string;
  eyebrow: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-[#eee5dd] px-5 py-4">
      <div>
        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#b19989]">
          {eyebrow}
        </p>
        <h3 className="mt-1 font-serif text-lg font-bold text-[#4a2d31]">{title}</h3>
      </div>
      <button
        className="text-[10px] font-bold text-[#91313e] hover:underline"
        onClick={onAction}
      >
        {action}
      </button>
    </div>
  );
}

function TaskRow({
  task,
  toggleTask,
}: {
  task: Task;
  toggleTask: (id: number) => void;
}) {
  return (
    <div className="group flex items-center gap-3 px-5 py-3.5 hover:bg-[#fffcf8]">
      <button
        aria-label={task.done ? `Mark ${task.title} incomplete` : `Complete ${task.title}`}
        className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border transition ${
          task.done
            ? "border-[#8f3140] bg-[#8f3140] text-white"
            : "border-[#d7c8bd] bg-white text-transparent hover:border-[#9b4651]"
        }`}
        onClick={() => toggleTask(task.id)}
      >
        <Check size={12} strokeWidth={3} />
      </button>
      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-xs font-bold ${
            task.done ? "text-[#aa9a90] line-through" : "text-[#4f3d35]"
          }`}
        >
          {task.title}
        </p>
        <p className="mt-1 text-[9px] text-[#a08d82]">
          {task.category} · Due {task.due}
        </p>
      </div>
      <span
        className={`hidden rounded-full border px-2 py-1 text-[8px] font-bold sm:inline ${priorityStyles[task.priority]}`}
      >
        {task.priority}
      </span>
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#efe2d7] text-[8px] font-bold text-[#7c3640]">
        {task.owner}
      </span>
      <CheckCircle2
        size={14}
        className={`hidden sm:block ${task.done ? "text-emerald-600" : "text-[#ddd1c7]"}`}
      />
    </div>
  );
}
