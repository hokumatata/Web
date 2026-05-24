import { Globe, Shield, BarChart3, Users } from "lucide-react";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="container-tw py-12 animate-fade-in">
      <div className="max-w-3xl mx-auto">
        <span className="kicker">About</span>
        <h1 className="text-3xl md:text-4xl font-bold text-ink-50 mt-2 mb-6 tracking-tight">
          Professional Market Intelligence
        </h1>
        <p className="text-lg text-ink-200 leading-relaxed mb-8">
          TradeWave delivers real-time market data, breaking financial news, and expert analysis across crypto, forex, equities, and global macro. Built for traders, analysts, and operators who need accurate, timely information to make informed decisions.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {[
            { icon: Globe, title: "Global Coverage", desc: "Markets from New York to Tokyo, 24/7 coverage across all time zones." },
            { icon: BarChart3, title: "Live Data", desc: "Real-time crypto and forex data from institutional-grade sources." },
            { icon: Shield, title: "Independent", desc: "Editorial independence is our foundation. No sponsored content, no bias." },
            { icon: Users, title: "Expert Analysis", desc: "Deep dives from analysts with decades of combined market experience." },
          ].map((item) => (
            <div key={item.title} className="card p-6">
              <item.icon size={24} className="text-accent mb-3" />
              <h3 className="text-lg font-semibold text-ink-50 mb-1">{item.title}</h3>
              <p className="text-sm text-ink-300">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
