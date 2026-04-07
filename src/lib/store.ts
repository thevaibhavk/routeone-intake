import { createHash, randomUUID } from "node:crypto";
import { Redis } from "@upstash/redis";

export type Contact = {
  id: string;
  role: string;
  name: string;
  title: string;
  email: string;
  phone: string;
};

export type UploadItem = {
  id: string;
  fieldId: string;
  originalName: string;
  mimeType: string;
  size: number;
  storedName: string;
  uploadedAt: string;
  driveFileLink?: string;
};

export type Draft = {
  values: Record<string, string | string[]>;
  contacts: Contact[];
  uploads: Record<string, UploadItem[]>;
  completion: number;
  lastSavedAt: string | null;
};

export type InviteRecord = {
  id: string;
  token: string;
  email: string;
  companyName: string;
  contactName: string;
  createdAt: string;
  updatedAt: string;
  lastOpenedAt: string | null;
  otpHash: string | null;
  otpExpiresAt: string | null;
  otpVerifiedAt: string | null;
  submittedAt: string | null;
  status: "invited" | "active" | "submitted";
  driveFolderId: string | null;
  driveFolderLink: string | null;
  sheetRowSynced: boolean;
  draft: Draft;
};

function getRedis() {
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
}

const INVITES_INDEX = "invites:all";

function inviteKey(id: string) {
  return `invite:${id}`;
}

const defaultDraft = (): Draft => ({
  values: {},
  contacts: [
    {
      id: randomUUID(),
      role: "Primary Contact",
      name: "",
      title: "",
      email: "",
      phone: "",
    },
  ],
  uploads: {},
  completion: 0,
  lastSavedAt: null,
});

export function hashValue(input: string) {
  return createHash("sha256").update(input).digest("hex");
}

export async function listInvites(): Promise<InviteRecord[]> {
  const redis = getRedis();
  const ids = await redis.smembers(INVITES_INDEX);
  if (!ids.length) return [];
  const records = await Promise.all(ids.map((id) => redis.get<InviteRecord>(inviteKey(id))));
  return records
    .filter((r): r is InviteRecord => r !== null)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function createInvite(input: { email: string; companyName: string; contactName: string }) {
  const redis = getRedis();
  const now = new Date().toISOString();
  const invite: InviteRecord = {
    id: randomUUID(),
    token: randomUUID(),
    email: input.email.trim().toLowerCase(),
    companyName: input.companyName.trim(),
    contactName: input.contactName.trim(),
    createdAt: now,
    updatedAt: now,
    lastOpenedAt: null,
    otpHash: null,
    otpExpiresAt: null,
    otpVerifiedAt: null,
    submittedAt: null,
    status: "invited",
    driveFolderId: null,
    driveFolderLink: null,
    sheetRowSynced: false,
    draft: defaultDraft(),
  };
  await redis.set(inviteKey(invite.id), invite);
  await redis.sadd(INVITES_INDEX, invite.id);
  return invite;
}

export async function getInviteByToken(token: string): Promise<InviteRecord | null> {
  const redis = getRedis();
  const ids = await redis.smembers(INVITES_INDEX);
  if (!ids.length) return null;
  const records = await Promise.all(ids.map((id) => redis.get<InviteRecord>(inviteKey(id))));
  return records.find((r): r is InviteRecord => r !== null && r.token === token) ?? null;
}

export async function updateInvite(id: string, updater: (invite: InviteRecord) => InviteRecord) {
  const redis = getRedis();
  const existing = await redis.get<InviteRecord>(inviteKey(id));
  if (!existing) return null;
  const next = updater(existing);
  next.updatedAt = new Date().toISOString();
  await redis.set(inviteKey(id), next);
  return next;
}

export async function saveOtp(id: string, otp: string, expiresAt: string) {
  return updateInvite(id, (invite) => ({
    ...invite,
    otpHash: hashValue(otp),
    otpExpiresAt: expiresAt,
  }));
}

export async function markInviteOpened(id: string) {
  return updateInvite(id, (invite) => ({
    ...invite,
    lastOpenedAt: new Date().toISOString(),
    status: invite.submittedAt ? "submitted" : "active",
  }));
}

export async function verifyOtp(id: string) {
  return updateInvite(id, (invite) => ({
    ...invite,
    otpVerifiedAt: new Date().toISOString(),
    otpHash: null,
    otpExpiresAt: null,
    status: invite.submittedAt ? "submitted" : "active",
  }));
}

export async function saveDraft(id: string, draft: Pick<Draft, "values" | "contacts" | "completion" | "uploads">) {
  return updateInvite(id, (invite) => ({
    ...invite,
    status: invite.submittedAt ? "submitted" : "active",
    draft: {
      ...draft,
      lastSavedAt: new Date().toISOString(),
    },
  }));
}

export async function markSubmitted(id: string) {
  return updateInvite(id, (invite) => ({
    ...invite,
    submittedAt: new Date().toISOString(),
    status: "submitted",
  }));
}

export async function updateInviteDrive(
  id: string,
  driveFolderId: string,
  driveFolderLink: string,
) {
  return updateInvite(id, (invite) => ({
    ...invite,
    driveFolderId,
    driveFolderLink,
  }));
}

export async function persistUpload(file: File, fieldId: string): Promise<{ item: UploadItem; buffer: Buffer }> {
  const id = randomUUID();
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const item: UploadItem = {
    id,
    fieldId,
    originalName: file.name,
    mimeType: file.type || "application/octet-stream",
    size: file.size,
    storedName: id,
    uploadedAt: new Date().toISOString(),
  };
  return { item, buffer };
}

export async function deleteUpload(_storedName: string) {
  // Files are stored in Google Drive only — nothing to delete locally
}
