import { NextResponse } from "next/server";
import { z } from "zod";

import { getClientSession } from "@/lib/auth";
import { sanitizeDraftPayload } from "@/lib/intake";
import { saveDraft } from "@/lib/store";
import { sheetUpdateStatus } from "@/lib/google";

const schema = z.object({
  inviteId: z.string().uuid(),
  inviteToken: z.string().uuid(),
  values: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
  contacts: z.array(
    z.object({
      id: z.string(),
      role: z.string(),
      roleOther: z.string().optional().default(""),
      name: z.string(),
      title: z.string(),
      email: z.string(),
      phone: z.string(),
    }),
  ),
  uploads: z.record(
    z.string(),
    z.array(
      z.object({
        id: z.string(),
        fieldId: z.string(),
        originalName: z.string(),
        mimeType: z.string(),
        size: z.number(),
        storedName: z.string(),
        uploadedAt: z.string(),
      }),
    ),
  ),
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

  const nextDraft = sanitizeDraftPayload(body);
  const invite = await saveDraft(body.inviteId, nextDraft);

  if (invite) {
    sheetUpdateStatus({
      inviteId: invite.id,
      status: invite.status,
      completion: invite.draft?.completion ?? 0,
    }).catch((err) => console.error("[google] sheetUpdateStatus (draft) failed:", err));
  }

  return NextResponse.json({ draft: invite?.draft ?? null });
}
