import { NextResponse } from "next/server";

import { getClientSession } from "@/lib/auth";
import { deleteUpload, getInviteByToken, persistUpload, saveDraft, updateInviteDrive } from "@/lib/store";
import { driveUploadFile, sheetUpdateDriveFolder } from "@/lib/google";

export async function POST(request: Request) {
  const session = await getClientSession();
  const formData = await request.formData();
  const inviteToken = String(formData.get("inviteToken") || "");
  const fieldId = String(formData.get("fieldId") || "");
  const file = formData.get("file");

  if (!session || session.role !== "client" || session.inviteToken !== inviteToken || !(file instanceof File)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const invite = await getInviteByToken(inviteToken);
  if (!invite || invite.id !== session.inviteId) {
    return NextResponse.json({ error: "Invite not found." }, { status: 404 });
  }

  const { item: upload, buffer } = await persistUpload(file, fieldId);

  try {
    const driveResult = await driveUploadFile({
      fileBuffer: buffer,
      fileName: upload.originalName,
      mimeType: upload.mimeType,
      companyName: invite.companyName,
    });
    if (driveResult) {
      upload.driveFileLink = driveResult.fileLink;
      if (!invite.driveFolderId) {
        await updateInviteDrive(invite.id, driveResult.folderId, driveResult.folderLink);
        sheetUpdateDriveFolder({
          inviteId: invite.id,
          driveFolderLink: driveResult.folderLink,
        }).catch((err) => console.error("[google] sheetUpdateDriveFolder failed:", err));
      }
    }
  } catch (err) {
    console.error("[google] driveUploadFile failed:", err);
  }

  const uploads = {
    ...invite.draft.uploads,
    [fieldId]: [...(invite.draft.uploads[fieldId] || []), upload],
  };
  const updated = await saveDraft(invite.id, {
    values: invite.draft.values,
    contacts: invite.draft.contacts,
    uploads,
    completion: invite.draft.completion,
  });

  return NextResponse.json({ upload, uploads: updated?.draft.uploads ?? uploads });
}

export async function DELETE(request: Request) {
  const session = await getClientSession();
  const { searchParams } = new URL(request.url);
  const inviteToken = searchParams.get("inviteToken") || "";
  const fieldId = searchParams.get("fieldId") || "";
  const fileId = searchParams.get("fileId") || "";

  if (!session || session.role !== "client" || session.inviteToken !== inviteToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const invite = await getInviteByToken(inviteToken);
  if (!invite || invite.id !== session.inviteId) {
    return NextResponse.json({ error: "Invite not found." }, { status: 404 });
  }

  const list = invite.draft.uploads[fieldId] || [];
  const target = list.find((item) => item.id === fileId);
  if (target) {
    await deleteUpload(target.storedName);
  }
  const uploads = {
    ...invite.draft.uploads,
    [fieldId]: list.filter((item) => item.id !== fileId),
  };

  const updated = await saveDraft(invite.id, {
    values: invite.draft.values,
    contacts: invite.draft.contacts,
    uploads,
    completion: invite.draft.completion,
  });

  return NextResponse.json({ uploads: updated?.draft.uploads ?? uploads });
}
