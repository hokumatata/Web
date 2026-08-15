/**
 * Prove the house-style quality floor without calling a model.
 *
 * A headline restatement plus a watchlist of /economic-calendar and /price
 * CTAs must fail findStyleViolations(). A desk-note in the week-shape
 * (price + weekly move + two pressures + tension; claim heads; path + kill)
 * must pass. VOICE_SAMPLES must hold the register, not reprinted articles.
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

function weekShapeNote(): string {
  const mechanism =
    "The chain is Hormuz risk to the oil bid, then a firmer dollar and a risk-off bid in real yields, then a cap on gold. That is why a softer CPI print did not lift the metal the way a one-line calendar note would have implied. ";
  const numbers =
    "CPI printed 3.1 percent year on year, in line with the 3.1 percent consensus and down from a 3.3 percent prior. PPI was 0.1 percent on the month against 0.2 percent expected. Spot gold ETF flows showed a 214 million dollar outflow through Thursday. Fed funds futures put a year-end cut near 48 percent, down from about 70 percent a week earlier. ";
  const path =
    "Lena Ortiz at Redwood Desk put the path at 2,480 to 2,520 if 2,455 is reclaimed on a daily close. A break of 2,410 delays it. That 2,410 print is the kill. ";
  const body = (mechanism + numbers + path).repeat(5);

  return `# Gold holds 2,440 but the CPI dip did not clear the cap

Gold settled Friday at $2,442 an ounce, down 1.1% on the week, after a firmer dollar and a war-risk premium in crude capped the bounce that an in-line CPI print had opened on Wednesday. The metal is stabilizing above $2,430. It is still capped.

A title rewrite would have stopped at "gold slipped on the week." The useful fact is the tension: the inflation print was not the problem. The two pressures were.

## War-risk premium keeps the dollar bid

${body}

The IRGC-adjacent commentary in the source material and a Treasury remark on shipping insurance are the named pressures. They travel through oil, then the dollar, then gold. They do not travel through a calendar link.

## Institutional demand shows cautious signs

${numbers}

One guest voice is enough. Ortiz's range is the path. The kill is $2,410. Do not invent a second interview.

## What would kill this read

${path}

A close that pointed readers at the site calendar and the price page as the article would fail the floor. Those links may sit once here, together, and then the piece ends.

The path is $2,480–$2,520 if $2,455 is reclaimed. A daily close under $2,410 delays it. See the [economic calendar](/economic-calendar) and [prices](/price).
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

  const week = weekShapeNote();
  const good = findStyleViolations(week);
  console.log("\n=== WEEK-SHAPE DESK NOTE ===");
  console.log(good.map((v) => `  - ${v}`).join("\n") || "  (none)");
  check("week-shape desk note has no style violations", good.length === 0, good.join("; "));
  check("week-shape lede is not a title rewrite", !ledeLooksLikeTitle(week));
  check("week-shape has 3–5 claim heads", headingCount(week) >= 3 && headingCount(week) <= 5);

  const prompt = buildSystemPrompt("data-release");
  const userPromptFile = readFileSync(resolve("src/lib/ai.ts"), "utf8");
  console.log("\n=== PROMPTS NAME THE FLOOR ===");
  const promptNeedles = [
    "QUALITY FLOOR",
    "800 to 1,200",
    "Watchlist",
    "FALSIFIER",
    "USD may react",
    "actual vs consensus vs prior",
    "3–5 claim-headed",
    "path + condition + kill",
  ];
  for (const needle of promptNeedles) {
    check(`system prompt contains "${needle}"`, prompt.includes(needle));
  }
  check("data-release outline forbids TA unless asked", prompt.includes("Do NOT include a technical-analysis"));
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
  check("VOICE_SAMPLES is filled with the register", VOICE_SAMPLES.includes("DESK / MARKETS NOTE"));
  check("VOICE_SAMPLES includes an original desk example", VOICE_SAMPLES.includes("EUR/USD settled Friday"));
  check("VOICE_SAMPLES includes an original feature example", VOICE_SAMPLES.includes("tokenized-T-bill"));
  check(
    "VOICE_SAMPLES is not a reprint of the pasted articles",
    !VOICE_SAMPLES.includes("332.02") &&
      !VOICE_SAMPLES.includes("Get the Singapore Edition") &&
      !VOICE_SAMPLES.includes("spot BTC ETF outflow")
  );
  check(
    "system prompt does not name another outlet as the voice to copy",
    !/imitate (FXStreet|Bloomberg)|write like (FXStreet|Bloomberg)|who read Bloomberg/i.test(prompt)
  );

  console.log(failures === 0 ? "\nall checks passed" : `\n${failures} check(s) failed`);
  process.exit(failures === 0 ? 0 : 1);
}

function headingCount(body: string): number {
  return (body.match(/^##\s+/gm) ?? []).length;
}

function ledeLooksLikeTitle(body: string): boolean {
  return findStyleViolations(body).some((v) => v.toLowerCase().includes("lede restates"));
}

main();
