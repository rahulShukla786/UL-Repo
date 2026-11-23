// SOP document storage for the SOP Library "Download" button.
// - Files uploaded in the SOP Parser are kept in the browser (IndexedDB), keyed by SOP name.
// - SOPs whose document ships with the app use a fixed URL (KNOWN_SOP_FILES).
// - Otherwise the SOP's rules are downloaded as an Excel file.
import * as XLSX from "xlsx";
import type { SOPRule } from "../stores/sopStore";

const DB_NAME = "ul-sop-files";
const STORE = "files";

interface StoredSopFile {
  fileName: string;
  blob: Blob;
}

/** Key for an SOP name, e.g. "EU Deliver WH Accruals V5 check2" -> "eu deliver wh accruals v5 check2". */
export const sopKeyFromName = (name: string): string =>
  name.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim().toLowerCase();

/** Same key from an uploaded file name (extension removed, like the SOP Library name). */
export const sopKeyFromFileName = (fileName: string): string =>
  sopKeyFromName(fileName.replace(/\.[^.]+$/, ""));

// SOP documents that are part of the app (public/data) or the UC volume (/api/files/<key>)
const KNOWN_SOP_FILES: { fileName: string; url: string }[] = [
  { fileName: "EU_Deliver_WH_Accruals_V5_check2.docx", url: "/api/files/wh-accruals-sop" },
  { fileName: "Media_Cost centre Open DO Provision V4.0-06 Apr 2026.docx", url: "/data/Media_Cost centre Open DO Provision V4.0-06 Apr 2026.docx" },
  { fileName: "Sales Reclass Journal DTP V 2.0_05 May'2026.docx", url: "/data/Sales Reclass Journal DTP V 2.0_05 May'2026.docx" },
  { fileName: "UL_INDO_DTP_U2K2_V 3.0_Goods In Transit (GIT) Journal.docx", url: "/data/UL_INDO_DTP_U2K2_V 3.0_Goods In Transit (GIT) Journal.docx" },
];

const openDb = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

/** Keep the uploaded SOP document so it can be downloaded from the SOP Library later. */
export const saveSopFile = async (file: File): Promise<void> => {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const value: StoredSopFile = { fileName: file.name, blob: file };
    tx.objectStore(STORE).put(value, sopKeyFromFileName(file.name));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
};

const getSopFile = async (name: string): Promise<StoredSopFile | null> => {
  const db = await openDb();
  const result = await new Promise<StoredSopFile | null>((resolve, reject) => {
    const request = db.transaction(STORE, "readonly").objectStore(STORE).get(sopKeyFromName(name));
    request.onsuccess = () => resolve((request.result as StoredSopFile | undefined) ?? null);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return result;
};

const triggerDownload = (href: string, fileName: string) => {
  const link = document.createElement("a");
  link.href = href;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
};

/** Download the SOP document of an SOP Library entry. */
export const downloadSop = async (name: string, rules: SOPRule[]): Promise<void> => {
  // 1) Document uploaded in the SOP Parser (this browser)
  try {
    const stored = await getSopFile(name);
    if (stored) {
      const url = URL.createObjectURL(stored.blob);
      triggerDownload(url, stored.fileName);
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      return;
    }
  } catch {
    // IndexedDB not available -> try the other options
  }

  // 2) Document that ships with the app
  const key = sopKeyFromName(name);
  const known = KNOWN_SOP_FILES.find((f) => sopKeyFromFileName(f.fileName) === key);
  if (known) {
    triggerDownload(encodeURI(known.url), known.fileName);
    return;
  }

  // 3) No document available -> download the SOP rules as Excel
  const sheet = XLSX.utils.aoa_to_sheet([
    ["Order", "Rule ID", "Rule", "Type", "Status"],
    ...rules.map((r) => [r.order, r.id, r.text || r.title, r.type, r.status]),
  ]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "SOP Rules");
  XLSX.writeFile(workbook, `${name || "SOP"}.xlsx`);
};
