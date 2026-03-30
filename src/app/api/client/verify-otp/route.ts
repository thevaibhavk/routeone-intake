import { NextResponse } from "next/server";
import { z } from "zod";

import { setClientSession } from "@/lib/auth";
import { getPublicInvite } from "@/lib/intake";
import { getInviteByToken, hashValue, verifyOtp } from "@/lib/store";

const schema = z.object({
  inviteToken: z.string().uuid(),
  code: z.string().length(6),
});

export async function POST(request: Request) {
  const body = schema.parse(await request.json());
  const invite = await getInviteByToken(body.inviteToken);

  if (!invite || !invite.otpHash || !invite.otpExpiresAt) {
    return NextResponse.json({ error: "OTP session not found." }, { status: 400 });
  }

  if (new Date(invite.otpExpiresAt).getTime() < Date.now()) {
    return NextResponse.json({ error: "OTP has expired." }, { status: 400 });
  }

  if (hashValue(body.code) !== invite.otpHash) {
    return NextResponse.json({ error: "Incorrect code." }, { status: 401 });
  }

  const updated = await verifyOtp(invite.id);
  if (!updated) {
    return NextResponse.json({ error: "Invite not found." }, { status: 404 });
  }

  await setClientSession({
    inviteId: updated.id,
    inviteToken: updated.token,
    email: updated.email,
  });

  return NextResponse.json({ ok: true, invite: getPublicInvite(updated) });
}
