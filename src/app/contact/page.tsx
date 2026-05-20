export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="container-mp py-12">
      <div className="mx-auto max-w-3xl">
        <span className="kicker">Contact</span>
        <h1 className="mt-2 font-serif text-4xl font-bold text-white">Get in touch</h1>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-5">
            <h3 className="font-serif text-lg text-white">Editorial</h3>
            <p className="mt-2 text-sm text-ink-200">Tips, scoops, corrections, syndication.</p>
            <p className="mt-2 text-sm text-accent">tips@marketpulse.example</p>
          </div>
          <div className="card p-5">
            <h3 className="font-serif text-lg text-white">Sales</h3>
            <p className="mt-2 text-sm text-ink-200">Sponsorships, partnerships, data licensing.</p>
            <p className="mt-2 text-sm text-accent">sales@marketpulse.example</p>
          </div>
        </div>
      </div>
    </div>
  );
}
