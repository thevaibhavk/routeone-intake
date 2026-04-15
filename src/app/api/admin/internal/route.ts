import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdminSession } from "@/lib/auth";
import { getInternalForm, saveInternalForm, getInviteById } from "@/lib/store";
import { sheetWriteInternalData } from "@/lib/google";

const getSchema = z.object({ inviteId: z.string().uuid() });
const postSchema = z.object({
  inviteId: z.string().uuid(),
  values: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
});

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const inviteId = searchParams.get("inviteId");
  if (!inviteId) {
    return NextResponse.json({ error: "Missing inviteId" }, { status: 400 });
  }

  const data = await getInternalForm(inviteId);
  return NextResponse.json({ form: data });
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = postSchema.parse(await request.json());
  const form = await saveInternalForm(body.inviteId, body.values);

  const invite = await getInviteById(body.inviteId);
  if (invite) {
    await sheetWriteInternalData({
      inviteId: invite.id,
      companyName: invite.companyName,
      values: body.values,
      savedAt: form.lastSavedAt ?? new Date().toISOString(),
    }).catch((err) => console.error("[google] sheetWriteInternalData failed:", err));
  }

  return NextResponse.json({ form });
}
