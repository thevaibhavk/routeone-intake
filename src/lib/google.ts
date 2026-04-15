import { google } from "googleapis";
import { Readable } from "node:stream";

function getAuth() {
  const credentialsJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!credentialsJson) return null;
  try {
    const credentials = JSON.parse(credentialsJson);
    return new google.auth.GoogleAuth({
      credentials,
      scopes: [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive",
      ],
    });
  } catch {
    console.error("[google] Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON");
    return null;
  }
}

function isConfigured() {
  return !!(
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON &&
    process.env.GOOGLE_SHEET_ID &&
    process.env.GOOGLE_DRIVE_FOLDER_ID
  );
}

// ─── Sheets ──────────────────────────────────────────────────────────────────

const SHEET_HEADERS = [
  "Company",
  "Contact Name",
  "Email",
  "Status",
  "Completion %",
  "Form Link",
  "Created At",
  "Submitted At",
  "Drive Folder",
  "Invite ID",
];

async function ensureSheetHeaders(auth: ReturnType<typeof getAuth>, sheetId: string) {
  if (!auth) return;
  const sheets = google.sheets({ version: "v4", auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: "Sheet1!A1:Z1",
  });
  const firstRow = res.data.values?.[0] ?? [];
  if (firstRow[0] !== "Company") {
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: "Sheet1!A1",
      valueInputOption: "RAW",
      requestBody: { values: [SHEET_HEADERS] },
    });
  }
}

export async function sheetAddInviteRow({
  inviteId,
  companyName,
  contactName,
  email,
  formLink,
  createdAt,
}: {
  inviteId: string;
  companyName: string;
  contactName: string;
  email: string;
  formLink: string;
  createdAt: string;
}) {
  if (!isConfigured()) return;
  const auth = getAuth();
  if (!auth) return;
  const sheetId = process.env.GOOGLE_SHEET_ID!;
  await ensureSheetHeaders(auth, sheetId);
  const sheets = google.sheets({ version: "v4", auth });
  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: "Sheet1!A1",
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [
        [
          companyName,
          contactName,
          email,
          "invited",
          "0",
          formLink,
          createdAt,
          "",
          "",
          inviteId,
        ],
      ],
    },
  });
}

async function findRowByInviteId(
  sheets: ReturnType<typeof google.sheets>,
  sheetId: string,
  inviteId: string,
): Promise<number | null> {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: "Sheet1!J:J",
  });
  const rows = res.data.values ?? [];
  for (let i = 0; i < rows.length; i++) {
    if (rows[i]?.[0] === inviteId) return i + 1;
  }
  return null;
}

export async function sheetUpdateStatus({
  inviteId,
  status,
  completion,
  submittedAt,
}: {
  inviteId: string;
  status: string;
  completion: number;
  submittedAt?: string;
}) {
  if (!isConfigured()) return;
  const auth = getAuth();
  if (!auth) return;
  const sheetId = process.env.GOOGLE_SHEET_ID!;
  const sheets = google.sheets({ version: "v4", auth });
  const row = await findRowByInviteId(sheets, sheetId, inviteId);
  if (!row) return;
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: sheetId,
    requestBody: {
      valueInputOption: "RAW",
      data: [
        { range: `Sheet1!D${row}`, values: [[status]] },
        { range: `Sheet1!E${row}`, values: [[String(completion)]] },
        { range: `Sheet1!H${row}`, values: [[submittedAt ?? ""]] },
      ],
    },
  });
}

export async function sheetUpdateDriveFolder({
  inviteId,
  driveFolderLink,
}: {
  inviteId: string;
  driveFolderLink: string;
}) {
  if (!isConfigured()) return;
  const auth = getAuth();
  if (!auth) return;
  const sheetId = process.env.GOOGLE_SHEET_ID!;
  const sheets = google.sheets({ version: "v4", auth });
  const row = await findRowByInviteId(sheets, sheetId, inviteId);
  if (!row) return;
  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: `Sheet1!I${row}`,
    valueInputOption: "RAW",
    requestBody: { values: [[driveFolderLink]] },
  });
}

// ─── Drive ───────────────────────────────────────────────────────────────────

async function getOrCreateClientFolder(
  drive: ReturnType<typeof google.drive>,
  rootFolderId: string,
  companyName: string,
): Promise<string> {
  const safeName = companyName.trim().replace(/[/\\?%*:|"<>]/g, "-") || "Unknown Client";

  const listRes = await drive.files.list({
    q: `'${rootFolderId}' in parents and name = '${safeName.replace(/'/g, "\\'")}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: "files(id, name)",
    spaces: "drive",
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });

  if (listRes.data.files && listRes.data.files.length > 0) {
    return listRes.data.files[0].id!;
  }

  const createRes = await drive.files.create({
    requestBody: {
      name: safeName,
      mimeType: "application/vnd.google-apps.folder",
      parents: [rootFolderId],
    },
    fields: "id",
    supportsAllDrives: true,
  });
  return createRes.data.id!;
}

export async function driveUploadFile({
  fileBuffer,
  fileName,
  mimeType,
  companyName,
}: {
  fileBuffer: Buffer;
  fileName: string;
  mimeType: string;
  companyName: string;
}): Promise<{ fileId: string; fileLink: string; folderId: string; folderLink: string } | null> {
  if (!isConfigured()) return null;
  const auth = getAuth();
  if (!auth) return null;
  const rootFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID!;
  const drive = google.drive({ version: "v3", auth });

  const folderId = await getOrCreateClientFolder(drive, rootFolderId, companyName);

  const stream = Readable.from(fileBuffer);
  const uploadRes = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [folderId],
    },
    media: {
      mimeType,
      body: stream,
    },
    fields: "id, webViewLink",
    supportsAllDrives: true,
  });

  const fileId = uploadRes.data.id!;
  const fileLink = uploadRes.data.webViewLink ?? `https://drive.google.com/file/d/${fileId}/view`;
  const folderLink = `https://drive.google.com/drive/folders/${folderId}`;

  await drive.permissions.create({
    fileId,
    requestBody: { role: "reader", type: "anyone" },
    supportsAllDrives: true,
  });

  return { fileId, fileLink, folderId, folderLink };
}
