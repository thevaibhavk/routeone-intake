import { NextResponse } from "next/server";
import { z } from "zod";

import { setAdminSession } from "@/lib/auth";

const schema = z.object({
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const body = schema.parse(await request.json());
  const expected = process.env.ADMIN_PASSWORD || "routeone-admin";

  if (body.password !== expected) {
    return NextResponse.json({ error: "Invalid password." }, { status: 401 });
  }

  await setAdminSession();
  return NextResponse.json({ ok: true });
}
