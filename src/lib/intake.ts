import { intakeSections, requiredFieldIds } from "@/lib/form-schema";
import type { Contact, Draft, InviteRecord, UploadItem } from "@/lib/store";

export function getEmptyContact(role = "Primary Contact"): Contact {
  return {
    id: crypto.randomUUID(),
    role,
    name: "",
    title: "",
    email: "",
    phone: "",
  };
}

export function computeCompletion(input: {
  values: Record<string, string | string[]>;
  contacts: Contact[];
  uploads: Record<string, UploadItem[]>;
}) {
  const totalRequired = requiredFieldIds.length + 3;
  let completed = 0;

  for (const fieldId of requiredFieldIds) {
    const value = input.values[fieldId];
    if (Array.isArray(value) ? value.length > 0 : Boolean(String(value || "").trim())) {
      completed += 1;
    }
  }

  const primary = input.contacts[0];
  if (primary?.name.trim()) completed += 1;
  if (primary?.title.trim()) completed += 1;
  if (primary?.email.trim()) completed += 1;

  return Math.min(100, Math.round((completed / totalRequired) * 100));
}

export function sanitizeDraftPayload(payload: Partial<Draft>) {
  const values = (payload.values || {}) as Record<string, string | string[]>;
  const contacts = Array.isArray(payload.contacts) ? payload.contacts : [];
  const uploads = (payload.uploads || {}) as Record<string, UploadItem[]>;
  return {
    values,
    contacts,
    uploads,
    completion: computeCompletion({ values, contacts, uploads }),
  };
}

export function getPublicInvite(invite: InviteRecord) {
  return {
    id: invite.id,
    token: invite.token,
    email: invite.email,
    companyName: invite.companyName,
    contactName: invite.contactName,
    status: invite.status,
    createdAt: invite.createdAt,
    updatedAt: invite.updatedAt,
    submittedAt: invite.submittedAt,
    lastOpenedAt: invite.lastOpenedAt,
    otpVerifiedAt: invite.otpVerifiedAt,
    draft: invite.draft,
  };
}

export const allFieldIds = intakeSections.flatMap((section) => section.fields.map((field) => field.id));
