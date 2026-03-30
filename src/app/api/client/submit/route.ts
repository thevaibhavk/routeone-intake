import { NextResponse } from "next/server";
import { z } from "zod";

import { getClientSession } from "@/lib/auth";
import { getInviteByToken, markSubmitted } from "@/lib/store";
import { sheetUpdateStatus } from "@/lib/google";

const schema = z.object({
  inviteId: z.string().uuid(),
  inviteToken: z.string().uuid(),
});

export async function POST(request: Request) {
  const session = await getClientSession();
  const body = schema.parse(await request.json());

  if (
    !session ||
    session.role !== "client" ||
    session.inviteId !== body.inviteId ||
    session.inviteToken !== body.inviteToken
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const invite = await markSubmitted(body.inviteId);

  if (invite) {
    sheetUpdateStatus({
      inviteId: invite.id,
      status: "submitted",
      completion: invite.draft?.completion ?? 100,
      submittedAt: invite.submittedAt ?? undefined,
    }).catch((err) => console.error("[google] sheetUpdateStatus failed:", err));
  }

  return NextResponse.json({ submittedAt: invite?.submittedAt ?? null });
}
