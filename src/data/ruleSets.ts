// ── Rule sets per Line of Business (LOB) ───────────────────────────────────
// Logistics rules : Rules/All_116_Rules_File_Check_Results.xlsx (sheet "All 116 Rules",
//                   116 rules, DTP SCF Pallets Accrual) — read at runtime.
// Warehouse rules : warehouseDocs/WH_rule_111.xlsx (sheet "result", 111 rules,
//                   EU_Deliver_WH_Accruals_BNL_V5_Check2) — read at runtime.
import * as XLSX from "xlsx";
import warehouseRulesUrl from "../../warehouseDocs/WH_rule_111.xlsx?url";
import logisticsRulesUrl from "../../Rules/All_116_Rules_File_Check_Results.xlsx?url";
import type { BusinessRuleCategory } from "../types";

export const SOP_LOBS = ["Logistics", "Warehouse"] as const;
export type SOPLob = (typeof SOP_LOBS)[number];

export const DEFAULT_LOB: SOPLob = "Logistics";

export const isSOPLob = (value: unknown): value is SOPLob =>
  typeof value === "string" && (SOP_LOBS as readonly string[]).includes(value);

/** Guess the LOB from the uploaded file name (e.g. EU_Deliver_WH_Accruals...docx). */
export const guessLobFromFileName = (fileName: string): SOPLob | null => {
  const name = fileName.toLowerCase();
  if (/(^|[^a-z])wh([^a-z]|$)/.test(name) || name.includes("warehouse")) return "Warehouse";
  if (name.includes("pallet") || name.includes("logistic")) return "Logistics";
  return null;
};

/** Common shape used by the SOP Parser and Stage 1 for both rule sets. */
export interface LobRule {
  rule_id: string;
  title: string;
  description: string;
  rule_type: string;
  order_of_execution: number;
  enabled: boolean;
}

// ── Logistics (All_116_Rules_File_Check_Results.xlsx, 116 rules) ──────────────
/** Number of Logistics rules in Rules/All_116_Rules_File_Check_Results.xlsx */
export const LOGISTICS_RULE_COUNT = 116;

const ruleNumber = (ruleId: string): number => Number(ruleId.replace(/\D/g, "")) || 0;

let logisticsRulesPromise: Promise<LobRule[]> | null = null;

export const loadLogisticsRules = (): Promise<LobRule[]> => {
  if (!logisticsRulesPromise) {
    logisticsRulesPromise = fetch(logisticsRulesUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`Could not load logistics rules (${res.status})`);
        return res.arrayBuffer();
      })
      .then((buffer) => {
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheet =
          workbook.Sheets["All 116 Rules"] ?? workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
        return rows
          .map((row) => String(row["Rule ID"] ?? "").trim() ? row : null)
          .filter((row): row is Record<string, unknown> => !!row)
          .sort(
            (a, b) => ruleNumber(String(a["Rule ID"])) - ruleNumber(String(b["Rule ID"])),
          )
          .map((row, index) => ({
            // Same id format as the earlier pallet rules so saved statuses carry over
            rule_id: `DTP_SCF_Pallets_Accrual - ${String(row["Rule ID"]).trim()}`,
            title: String(row["Title"] ?? "").trim(),
            description: String(row["Description"] ?? "").trim(),
            rule_type: String(row["Rule Type"] ?? "").trim(),
            order_of_execution: index + 1,
            enabled: true,
          }));
      })
      .catch((err) => {
        logisticsRulesPromise = null; // allow retry
        throw err;
      });
  }
  return logisticsRulesPromise;
};

// ── Warehouse (WH_rule_111.xlsx) ─────────────────────────────────────────────
const toBool = (value: unknown): boolean =>
  value === true || String(value).trim().toLowerCase() === "true";

let warehouseRulesPromise: Promise<LobRule[]> | null = null;

export const loadWarehouseRules = (): Promise<LobRule[]> => {
  if (!warehouseRulesPromise) {
    warehouseRulesPromise = fetch(warehouseRulesUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`Could not load warehouse rules (${res.status})`);
        return res.arrayBuffer();
      })
      .then((buffer) => {
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheet = workbook.Sheets["result"] ?? workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
        return rows
          .filter((row) => String(row.rule_id ?? "").trim())
          .map((row) => ({
            rule_id: String(row.rule_id).trim(),
            title: String(row.title ?? "").trim(),
            description: String(row.description ?? "").trim(),
            rule_type: String(row.rule_type ?? "").trim(),
            order_of_execution: Number(row.order_of_execution) || 0,
            enabled: toBool(row.enabled),
          }))
          .sort((a, b) => a.order_of_execution - b.order_of_execution);
      })
      .catch((err) => {
        warehouseRulesPromise = null; // allow retry
        throw err;
      });
  }
  return warehouseRulesPromise;
};

/** Rules for a LOB (both rule sets are read from Excel). */
export const getRulesForLob = (lob: SOPLob): Promise<LobRule[]> =>
  lob === "Warehouse" ? loadWarehouseRules() : loadLogisticsRules();

const shortRuleId = (ruleId: string): string => ruleId.split(" - ").pop() ?? ruleId;

// ── Stage 1 "Reading Business Rules" categories for Warehouse ────────────────
const WAREHOUSE_SOURCE_FILES = [
  "UHPC overview weekly figures 2026-Week43.xlsx",
  "UHPC overview weekly figures 2026-Week42.xlsx",
  "UHPC overview weekly figures 2026-Week41.xlsx",
  "SAP.xlsx",
];

// Trintech.xlsx and Snapshot.xlsx removed from Stage 1 Reference Files (user request)
const WAREHOUSE_REFERENCE_FILES = ["FC Update.xlsx"];

export const buildWarehouseBusinessRuleCategories = (
  rules: LobRule[],
): BusinessRuleCategory[] => {
  const byType = (type: string) =>
    rules
      .filter((rule) => rule.rule_type === type)
      .map((rule) => `${shortRuleId(rule.rule_id)}: ${rule.title}`);

  return [
    {
      title: "Source File Requirements",
      status: "completed",
      items: WAREHOUSE_SOURCE_FILES,
      referenceFiles: WAREHOUSE_REFERENCE_FILES,
    },
    { title: "Source Rules", status: "completed", items: byType("Sourcing") },
    { title: "Validation Rules", status: "completed", items: byType("Validation") },
    { title: "Calculation Rules", status: "completed", items: byType("Calculation") },
  ];
};
