/**
 * Prove the house-style quality floor without calling a model.
 *
 * A headline restatement plus a watchlist of /economic-calendar and /price
 * CTAs must fail findStyleViolations(). A real desk note must pass.
 * The compose / house-style prompts must still name that floor.
 *
 *   npx tsx scripts/house-style-dry-run.ts
 */

import { buildSystemPrompt, findStyleViolations, QUALITY_FLOOR, VOICE_SAMPLES } from "../src/lib/house-style";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const STUB = `# US CPI rises more than expected in July

US CPI rose more than expected in July, keeping inflation in focus for the dollar.

## What to watch

See the [economic calendar](/economic-calendar) for the next prints and check [live prices](/price).
`;

const BLURB_400 = `# Dollar firms after the print

The dollar firmed after the print as traders waited for the next release.

## Shelter still dominates the basket

Shelter still dominates the basket and that is why the tape twitched. The dollar firmed a little. Markets will wait for the next release. ${"The print is in and the tape has a number to trade. ".repeat(28)}

## Policy path is the next argument

The policy path is the next argument and the front end will do the work. ${"A hotter print revises cuts later and a cooler print does the reverse. ".repeat(22)}
`;

function deskNote(): string {
  const mechanism =
    "The channel is the front end of the curve, not a calendar reminder. A tenth on core revises the implied path, lifts real yields, and tightens financial conditions into the dollar. That is why EUR/USD and gold give back the easy bid when the print lands hot, and why DXY holds a bid when the surprise is in core rather than in the headline food-and-energy residual. ";
  const numbers =
    "The user prompt supplied the arithmetic: actual 0.3 percent on the month, consensus 0.2 percent, prior 0.3 percent. Those three figures are the whole comparison. If the prior had been missing from the material, this piece would have said so instead of inventing a typical print. ";
  const falsifier =
    "The read dies if the next core print falls back to 0.1 percent while the unemployment rate jumps a full tenth and the Fed's preferred PCE stays soft. That combination would re-open an early-cut path and unwind the dollar bid this print just earned. A single soft headline with sticky core would not be enough. ";
  const instrument =
    "For the tape, that means DXY holding the session high, EUR/USD staying offered through 1.0900 if that level is in the material, and gold losing the real-yield bid rather than a vague claim that the dollar may do something. ";
  const body = (mechanism + numbers + falsifier + instrument).repeat(6);

  return `# Core print leaves the easy comparison behind

The July core reading landed a tenth above the 0.2 percent consensus and matched the prior 0.3 percent figure supplied in the source material. That gap is small on the month and large for front-end pricing, because the market had faded a cooler path into the release.

A restatement of the title would have stopped at "the print was hot." The useful fact is the comparison: actual versus consensus versus prior, and the channel that comparison travels through.

## A tenth on core is a real-yield story

${body}

The second-order effect is not "watch the calendar." It is the revision to the number of cuts priced this year, then the lift in real yields, then the tighter dollar.

## The counter-case is a one-off shelter residual

Shelter can still flatter a single month. If the next print shows the residual fading while goods stay soft, the policy-path revision this piece describes does not survive. That is the counter-case, and it is specific.

${body}

## What would kill this read

${falsifier}

A close that pointed readers at the site calendar and the price page as the article would fail the floor. Those links may sit once here, together, and then the piece ends.

The next core print at 0.1 percent with a weaker labour report is the falsifier. Until that arrives, DXY keeps the bid this comparison earned. See the [economic calendar](/economic-calendar) and [prices](/price).
`;
}

function has(violations: string[], snippet: string): boolean {
  return violations.some((v) => v.toLowerCase().includes(snippet.toLowerCase()));
}

function main() {
  let failures = 0;
  const check = (name: string, pass: boolean, detail = "") => {
    if (!pass) failures++;
    console.log(`${pass ? "ok  " : "FAIL"} ${name}${detail ? `\n     ${detail}` : ""}`);
  };

  const stub = findStyleViolations(STUB);
  console.log("=== STUB (headline + watchlist) ===");
  console.log(stub.map((v) => `  - ${v}`).join("\n") || "  (none)");
  check("stub is rejected", stub.length > 0);
  check("stub flagged as too short", has(stub, "too short"));
  check("stub flagged for lede restating the headline", has(stub, "lede restates"));
  check("stub flagged for watchlist/CTA body", has(stub, "watchlist") || has(stub, "cta"));
  check("stub flagged for template/watchlist heading", has(stub, "what to watch") || has(stub, "template heading"));

  const blurb = findStyleViolations(BLURB_400);
  console.log("\n=== 400-WORD BLURB ===");
  console.log(blurb.map((v) => `  - ${v}`).join("\n") || "  (none)");
  check("400-word blurb is rejected as too short", has(blurb, "too short"));

  const note = deskNote();
  const good = findStyleViolations(note);
  console.log("\n=== DESK NOTE ===");
  console.log(good.map((v) => `  - ${v}`).join("\n") || "  (none)");
  check("desk note has no style violations", good.length === 0, good.join("; "));

  const prompt = buildSystemPrompt("data-release");
  const userPromptFile = readFileSync(resolve("src/lib/ai.ts"), "utf8");
  console.log("\n=== PROMPTS NAME THE FLOOR ===");
  const promptNeedles = [
    "QUALITY FLOOR",
    "800 to 1,200",
    "Watchlist",
    "FALSIFIER",
    "USD may react",
    "actual / consensus / prior",
  ];
  for (const needle of promptNeedles) {
    check(`system prompt contains "${needle}"`, prompt.includes(needle));
  }
  check("data-release outline requires supplied figures", prompt.includes("using only figures supplied"));
  check(
    "compose user prompt bans lede+watchlist stub",
    userPromptFile.includes("Do NOT write a Watchlist / Next steps") &&
      userPromptFile.includes("800–1,200 words")
  );
  check(
    "expand-if-thin rewrite names the quality floor",
    userPromptFile.includes("fails the house-style quality floor")
  );
  check("QUALITY_FLOOR is a standalone, editable block", QUALITY_FLOOR.includes("QUALITY FLOOR"));
  check("VOICE_SAMPLES is empty until Vishal's samples land", VOICE_SAMPLES.trim() === "");
  check(
    "system prompt does not name Bloomberg/FXStreet as the voice to copy",
    !prompt.includes("who read Bloomberg, Reuters and FXStreet")
  );

  console.log(failures === 0 ? "\nall checks passed" : `\n${failures} check(s) failed`);
  process.exit(failures === 0 ? 0 : 1);
}

main();
