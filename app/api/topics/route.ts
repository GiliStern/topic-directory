import { NextRequest, NextResponse } from "next/server";
import { listTopics } from "@/lib/topics";
import { TOPICS_PAGE_SIZE } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get("q") ?? "";
  const hideEmpty = searchParams.get("hideEmpty") !== "0";
  const offset = Number(searchParams.get("offset") ?? "0");
  const limit = Number(searchParams.get("limit") ?? String(TOPICS_PAGE_SIZE));

  try {
    const result = await listTopics({
      query,
      hideEmpty,
      offset: Number.isFinite(offset) ? offset : 0,
      limit: Number.isFinite(limit) ? limit : TOPICS_PAGE_SIZE,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load topics";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
