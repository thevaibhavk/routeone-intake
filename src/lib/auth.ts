import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const clientCookieName = "routeone_client";
const adminCookieName = "routeone_admin";

type SessionPayload = {
  inviteId?: string;
  inviteToken?: string;
  email?: string;
  role: "client" | "admin";
  exp: number;
};

function getSecret() {
  return process.env.APP_SECRET || "routeone-dev-secret";
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("hex");
}

function encodeSession(payload: SessionPayload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

function decodeSession(token: string): SessionPayload | null {
  const [body, signature] = token.split(".");
  if (!body || !signature) {
    return null;
  }
  const expected = sign(body);
  const valid = signature.length === expected.length && timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  if (!valid) {
    return null;
  }
  const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
  return Date.now() > payload.exp ? null : payload;
}

export async function setClientSession(input: { inviteId: string; inviteToken: string; email: string }) {
  const store = await cookies();
  store.set(
    clientCookieName,
    encodeSession({
      role: "client",
      inviteId: input.inviteId,
      inviteToken: input.inviteToken,
      email: input.email,
      exp: Date.now() + 1000 * 60 * 60 * 24 * 14,
    }),
    { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 14 },
  );
}

export async function getClientSession() {
  const store = await cookies();
  const raw = store.get(clientCookieName)?.value;
  return raw ? decodeSession(raw) : null;
}

export async function clearClientSession() {
  const store = await cookies();
  store.delete(clientCookieName);
}

export async function setAdminSession() {
  const store = await cookies();
  store.set(
    adminCookieName,
    encodeSession({ role: "admin", exp: Date.now() + 1000 * 60 * 60 * 8 }),
    { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 8 },
  );
}

export async function getAdminSession() {
  const store = await cookies();
  const raw = store.get(adminCookieName)?.value;
  return raw ? decodeSession(raw) : null;
}
