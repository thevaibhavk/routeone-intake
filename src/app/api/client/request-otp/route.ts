import { NextResponse } from "next/server";
import { z } from "zod";

import { getInviteByToken, markInviteOpened, saveOtp } from "@/lib/store";
import { sendMail } from "@/lib/mailer";

const schema = z.object({
  inviteToken: z.string().uuid(),
});

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(request: Request) {
  const body = schema.parse(await request.json());
  const invite = await getInviteByToken(body.inviteToken);

  if (!invite) {
    return NextResponse.json({ error: "Invite not found." }, { status: 404 });
  }

  const code = generateOtp();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 10).toISOString();
  await saveOtp(invite.id, code, expiresAt);
  await markInviteOpened(invite.id);

  await sendMail({
    to: invite.email,
    subject: "Your Route One verification code",
    text: `Your Route One verification code is ${code}. It expires in 10 minutes.`,
    html: `<p>Your Route One verification code is <strong>${code}</strong>.</p><p>It expires in 10 minutes.</p>`,
  });

  return NextResponse.json({
    ok: true,
    expiresAt,
    debugCode: process.env.NODE_ENV === "production" ? undefined : code,
  });
}
