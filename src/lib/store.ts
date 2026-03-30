import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

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

type Database = {
  invites: InviteRecord[];
};

const storageRoot = path.join(process.cwd(), "storage");
const uploadsRoot = path.join(storageRoot, "uploads");
const dbPath = path.join(storageRoot, "db.json");

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

const defaultDb: Database = { invites: [] };

async function ensureStorage() {
  await mkdir(storageRoot, { recursive: true });
  await mkdir(uploadsRoot, { recursive: true });
  try {
    await readFile(dbPath, "utf8");
  } catch {
    await writeFile(dbPath, JSON.stringify(defaultDb, null, 2), "utf8");
  }
}

async function readDb() {
  await ensureStorage();
  const raw = await readFile(dbPath, "utf8");
  return JSON.parse(raw) as Database;
}

async function writeDb(data: Database) {
  await ensureStorage();
  await writeFile(dbPath, JSON.stringify(data, null, 2), "utf8");
}

export function hashValue(input: string) {
  return createHash("sha256").update(input).digest("hex");
}

export async function listInvites() {
  const db = await readDb();
  return db.invites.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function createInvite(input: { email: string; companyName: string; contactName: string }) {
  const db = await readDb();
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
  db.invites.push(invite);
  await writeDb(db);
  return invite;
}

export async function getInviteByToken(token: string) {
  const db = await readDb();
  return db.invites.find((invite) => invite.token === token) ?? null;
}

export async function updateInvite(id: string, updater: (invite: InviteRecord) => InviteRecord) {
  const db = await readDb();
  const index = db.invites.findIndex((invite) => invite.id === id);
  if (index === -1) {
    return null;
  }
  const next = updater(db.invites[index]);
  next.updatedAt = new Date().toISOString();
  db.invites[index] = next;
  await writeDb(db);
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

export async function persistUpload(file: File, fieldId: string) {
  await ensureStorage();
  const id = randomUUID();
  const ext = path.extname(file.name);
  const storedName = `${id}${ext}`;
  const target = path.join(uploadsRoot, storedName);
  const arrayBuffer = await file.arrayBuffer();
  await writeFile(target, Buffer.from(arrayBuffer));
  const item: UploadItem = {
    id,
    fieldId,
    originalName: file.name,
    mimeType: file.type || "application/octet-stream",
    size: file.size,
    storedName,
    uploadedAt: new Date().toISOString(),
  };
  return item;
}

export async function deleteUpload(storedName: string) {
  await rm(path.join(uploadsRoot, storedName), { force: true });
}
