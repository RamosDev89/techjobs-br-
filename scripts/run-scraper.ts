import { runAllScrapers } from "../src/scraper";

async function main() {
  console.log("Starting scraper...\n");
  const start = Date.now();

  const result = await runAllScrapers();

  const duration = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\nDone in ${duration}s`);
  console.log(`Total:    ${result.total}`);
  console.log(`Inserted: ${result.inserted}`);
  console.log(`Skipped:  ${result.skipped}`);

  if (result.errors.length > 0) {
    console.log(`\nErrors:`);
    result.errors.forEach((e) => console.log(" -", e));
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
