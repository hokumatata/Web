export const metadata = { title: "About" };

export default function AboutPage() {
  const name = process.env.NEXT_PUBLIC_SITE_NAME ?? "MarketPulse";
  return (
    <div className="container-mp py-12">
      <div className="mx-auto max-w-3xl">
        <span className="kicker">About</span>
        <h1 className="mt-2 font-serif text-4xl font-bold text-white">{name}</h1>
        <p className="mt-4 text-lg text-ink-200">
          {name} is a markets and macro publication for traders, researchers and operators.
          We cover crypto, FX, equities and macro — with a focus on data, clarity and edge.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-white">Editorial principles</h2>
        <ul className="mt-3 space-y-2 text-ink-200 list-disc pl-6">
          <li>Lead with data. Quote sources. Show your work.</li>
          <li>No moonshot hype. No fear-mongering. Just signal.</li>
          <li>Disclose conflicts. Correct errors visibly.</li>
        </ul>

        <h2 className="mt-10 font-serif text-2xl text-white">Disclaimer</h2>
        <p className="mt-2 text-ink-200">
          Nothing on this site constitutes investment advice. Do your own research.
        </p>
      </div>
    </div>
  );
}
