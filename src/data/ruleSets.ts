// ── Rule sets per Line of Business (LOB) ───────────────────────────────────
// Logistics rules : src/data/palletAccrualRules.ts (DTP SCF Pallets Accrual) +
//                   src/data/rules116.ts (Rules/All_116_Rules_File_Check_Results.xlsx)
// Warehouse rules : warehouseDocs/WH_rule_111.xlsx (sheet "result", 111 rules,
//                   EU_Deliver_WH_Accruals_BNL_V5_Check2) — read at runtime.
import * as XLSX from "xlsx";
import warehouseRulesUrl from "../../warehouseDocs/WH_rule_111.xlsx?url";
import { PALLET_ACCRUAL_RULES } from "./palletAccrualRules";
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

// ── Logistics (existing pallet accrual rules) ─────────────────────────────────
export const LOGISTICS_RULES: LobRule[] = PALLET_ACCRUAL_RULES.map((rule) => ({
  rule_id: rule.rule_id,
  title: rule.title,
  description: rule.description,
  rule_type: rule.rule_type,
  order_of_execution: rule.order_of_execution,
  enabled: rule.enabled,
}));

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

/** Rules for a LOB (Logistics is synchronous, Warehouse is read from Excel). */
export const getRulesForLob = (lob: SOPLob): Promise<LobRule[]> =>
  lob === "Warehouse" ? loadWarehouseRules() : Promise.resolve(LOGISTICS_RULES);

const shortRuleId = (ruleId: string): string => ruleId.split(" - ").pop() ?? ruleId;

// ── Stage 1 "Reading Business Rules" categories for Warehouse ────────────────
const WAREHOUSE_SOURCE_FILES = [
  "UHPC overview weekly figures 2026-Week43.xlsx",
  "UHPC overview weekly figures 2026-Week42.xlsx",
  "UHPC overview weekly figures 2026-Week41.xlsx",
  "SAP.xlsx",
];

const WAREHOUSE_REFERENCE_FILES = [
  "Trintech.xlsx",
  "FC Update.xlsx",
  "Snapshot.xlsx",
];

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
