/**
 * Shared shell for public legal/policy pages (Growth markdown → HTML).
 */
export function PolicyShell({ html }: { html: string }) {
  return (
    <div className="container-tw py-12 animate-fade-in">
      <div className="max-w-3xl mx-auto">
        <div
          className="prose-mp max-w-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}
