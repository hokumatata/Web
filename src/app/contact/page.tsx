import { Mail, MapPin } from "lucide-react";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="container-tw py-12 animate-fade-in">
      <div className="max-w-xl mx-auto">
        <span className="kicker">Contact</span>
        <h1 className="font-serif text-3xl font-bold text-white mt-2 mb-6">Get in Touch</h1>
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3 text-ink-200">
            <Mail size={16} className="text-accent" />
            <span>contact@tradewave.io</span>
          </div>
          <div className="flex items-center gap-3 text-ink-200">
            <MapPin size={16} className="text-accent" />
            <span>New York, NY</span>
          </div>
        </div>
        <p className="text-sm text-ink-300">
          For press inquiries, partnerships, or corrections, please reach out via email. We typically respond within 24 hours.
        </p>
      </div>
    </div>
  );
}
