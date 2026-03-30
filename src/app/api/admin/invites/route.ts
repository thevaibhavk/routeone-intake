import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdminSession } from "@/lib/auth";
import { createInvite, listInvites } from "@/lib/store";
import { sendMail } from "@/lib/mailer";
import { sheetAddInviteRow } from "@/lib/google";

const schema = z.object({
  email: z.string().email(),
  companyName: z.string().min(1),
  contactName: z.string().min(1),
});

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET() {
  const session = await getAdminSession();
  if (!session || session.role !== "admin") {
    return unauthorized();
  }

  const invites = await listInvites();
  return NextResponse.json({ invites });
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session || session.role !== "admin") {
    return unauthorized();
  }

  const body = schema.parse(await request.json());
  const invite = await createInvite(body);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const link = `${baseUrl}/?invite=${invite.token}`;

  await sendMail({
    to: invite.email,
    subject: `Route One intake for ${invite.companyName}`,
    text: `Hi ${invite.contactName},\n\nUse this secure link to access your Route One intake form:\n${link}\n\nYou will verify access with a one-time code sent to this email address.`,
    html: `<p>Hi ${invite.contactName},</p><p>Use this secure link to access your Route One intake form:</p><p><a href="${link}">${link}</a></p><p>You will verify access with a one-time code sent to this email address.</p>`,
  });

  sheetAddInviteRow({
    inviteId: invite.id,
    companyName: invite.companyName,
    contactName: invite.contactName,
    email: invite.email,
    formLink: link,
    createdAt: invite.createdAt,
  }).catch((err) => console.error("[google] sheetAddInviteRow failed:", err));

  return NextResponse.json({ invite, link });
}
