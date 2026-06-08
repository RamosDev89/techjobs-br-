import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { runAllScrapers } from "@/scraper";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 min

export async function GET(request: NextRequest) {
  const secret = request.headers.get("x-cron-secret") ?? request.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (process.env.SCRAPER_ENABLED !== "true") {
    return NextResponse.json({ message: "Scraper disabled" });
  }

  console.log("[cron/scraper] Starting scrape run...");
  const start = Date.now();

  const result = await runAllScrapers();

  const duration = Date.now() - start;
  console.log(`[cron/scraper] Done in ${duration}ms. Inserted: ${result.inserted}, Skipped: ${result.skipped}`);

  if (result.inserted > 0) {
    revalidatePath("/");
    revalidatePath("/vagas");
  }

  return NextResponse.json({
    ...result,
    durationMs: duration,
    timestamp: new Date().toISOString(),
  });
}
