// Run with: node scripts/test-google.mjs
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Load .env manually
const envPath = resolve(process.cwd(), ".env");
const envLines = readFileSync(envPath, "utf8").split("\n");
for (const line of envLines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  const val = trimmed.slice(eqIdx + 1).trim();
  process.env[key] = val;
}

const { google } = await import("googleapis");

const credentialsJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
const sheetId = process.env.GOOGLE_SHEET_ID;
const driveFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

console.log("─── Config check ───────────────────────────────");
console.log("GOOGLE_SERVICE_ACCOUNT_JSON:", credentialsJson ? "✓ set" : "✗ MISSING");
console.log("GOOGLE_SHEET_ID:", sheetId ? `✓ ${sheetId}` : "✗ MISSING");
console.log("GOOGLE_DRIVE_FOLDER_ID:", driveFolderId ? `✓ ${driveFolderId}` : "✗ MISSING");

if (!credentialsJson || !sheetId || !driveFolderId) {
  console.error("\n✗ Missing env vars. Aborting.");
  process.exit(1);
}

let credentials;
try {
  credentials = JSON.parse(credentialsJson);
  console.log("\n✓ Service account JSON parsed OK");
  console.log("  client_email:", credentials.client_email);
} catch {
  console.error("\n✗ Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON — check for unescaped quotes");
  process.exit(1);
}

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
  ],
});

// ─── Test Sheets ────────────────────────────────
console.log("\n─── Testing Google Sheets ───────────────────────");
try {
  const sheets = google.sheets({ version: "v4", auth });
  const res = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
  console.log("✓ Sheet accessible:", res.data.properties?.title);

  // Write a test row then delete it
  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: "Sheet1!A1",
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [["__TEST__", "test", "test@test.com", "test", "0", "", new Date().toISOString(), "", "", "__TEST__"]] },
  });
  console.log("✓ Sheet write OK");

  // Find and clear the test row
  const readRes = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: "Sheet1!J:J" });
  const rows = readRes.data.values ?? [];
  let testRowIdx = null;
  for (let i = 0; i < rows.length; i++) {
    if (rows[i]?.[0] === "__TEST__") { testRowIdx = i + 1; break; }
  }
  if (testRowIdx) {
    await sheets.spreadsheets.values.clear({ spreadsheetId: sheetId, range: `Sheet1!A${testRowIdx}:J${testRowIdx}` });
    console.log("✓ Test row cleaned up");
  }
} catch (err) {
  console.error("✗ Sheets error:", err.message);
  if (err.message?.includes("403")) console.error("  → Share the sheet with:", credentials.client_email);
}

// ─── Test Drive ─────────────────────────────────
console.log("\n─── Testing Google Drive ────────────────────────");
try {
  const drive = google.drive({ version: "v3", auth });

  // Check root folder is accessible
  const folderRes = await drive.files.get({ fileId: driveFolderId, fields: "id, name", supportsAllDrives: true });
  console.log("✓ Drive folder accessible:", folderRes.data.name);

  // Create a test subfolder
  const createRes = await drive.files.create({
    requestBody: { name: "__TEST_CLIENT__", mimeType: "application/vnd.google-apps.folder", parents: [driveFolderId] },
    fields: "id, name",
    supportsAllDrives: true,
  });
  console.log("✓ Subfolder creation OK:", createRes.data.name);

  // Clean up test folder
  await drive.files.delete({ fileId: createRes.data.id, supportsAllDrives: true });
  console.log("✓ Test folder cleaned up");
} catch (err) {
  console.error("✗ Drive error:", err.message);
  if (err.message?.includes("403") || err.message?.includes("404")) {
    console.error("  → Share the Drive folder with:", credentials.client_email);
  }
}

console.log("\n─── Done ────────────────────────────────────────");
