import { NextResponse } from "next/server";

import { getClientSession, setClientSession } from "@/lib/auth";
import { getPublicInvite } from "@/lib/intake";
import { getInviteByToken, markInviteOpened } from "@/lib/store";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const inviteToken = url.searchParams.get("invite");
  if (!inviteToken) {
    return NextResponse.json({ authenticated: false, invite: null });
  }

  const invite = await getInviteByToken(inviteToken);
  if (!invite) {
    return NextResponse.json({ authenticated: false, invite: null }, { status: 404 });
  }

  const session = await getClientSession();
  let authenticated =
    Boolean(session) &&
    session?.role === "client" &&
    session.inviteId === invite.id &&
    session.inviteToken === invite.token;

  if (!authenticated) {
    await setClientSession({
      inviteId: invite.id,
      inviteToken: invite.token,
      email: invite.email,
    });
    await markInviteOpened(invite.id);
    authenticated = true;
  }

  return NextResponse.json({
    authenticated,
    invite: getPublicInvite(invite),
  });
}
