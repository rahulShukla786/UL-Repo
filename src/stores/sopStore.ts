import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { DEFAULT_LOB, isSOPLob, type SOPLob } from "../data/ruleSets";
import { toIsoDate } from "../lib/utils";

export type SOPStatus = "Active" | "Inactive";
export type SOPRuleStatus = "Approved" | "Rejected" | "Pending";

export interface SOPRule {
  id: string;
  order: number;
  title: string;
  text: string;
  type: string;
  status: SOPRuleStatus;
}

export interface SOPEntry {
  id: string;
  sopCode: string;
  name: string;
  version: string;
  country: string;
  category: string;
  /** Line of Business: Logistics or Warehouse (decides which rule set applies) */
  lob: SOPLob;
  lastUpdated: string;
  status: SOPStatus;
  mappedJournalEntries: string[];
  rules: SOPRule[];
}

const getSOPNameFromFile = (
  fileName: string,
): { name: string; category: string } => {
  const name = fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .trim();
  const lowerName = name.toLowerCase();
  const category = lowerName.includes("payroll")
    ? "Payroll"
    : lowerName.includes("tax")
      ? "Tax"
      : "Accrual";

  return { name: name || "Uploaded SOP", category };
};

const normalizeSOPName = (name: string): string =>
  name.toLowerCase().replace(/\s+/g, " ").trim();

interface SOPStore {
  sopEntries: SOPEntry[];
  addEntry: (fileName: string, rules: SOPRule[], lob: SOPLob) => boolean;
  setEntries: (entries: SOPEntry[]) => void;
  updateEntry: (id: string, updates: Partial<SOPEntry>) => void;
}

export const useSOPStore = create<SOPStore>()(
  persist(
    (set) => ({
      sopEntries: [],

      addEntry: (fileName, rules, lob) => {
        const { name: sopName, category } = getSOPNameFromFile(fileName);
        const lastUpdated = toIsoDate(new Date()); // YYYY-MM-DD
        const now = Date.now();
        let isNewEntry = false;
        const copiedRules = rules.map((rule) => ({ ...rule }));

        set((state) => {
          const existingEntry = state.sopEntries.find(
            (entry) => normalizeSOPName(entry.name) === normalizeSOPName(sopName),
          );

          if (existingEntry) {
            return {
              sopEntries: state.sopEntries.map((entry) =>
                entry.id === existingEntry.id
                  ? { ...entry, name: sopName, category, lob, lastUpdated, rules: copiedRules }
                  : entry,
              ),
            };
          }

          isNewEntry = true;
          const newEntry: SOPEntry = {
            id: `sop-parsed-${now}`,
            sopCode: `SOP-${now.toString(36).toUpperCase()}`,
            name: sopName,
            version: "v1.0",
            country: "India",
            category,
            lob,
            lastUpdated,
            status: "Active",
            mappedJournalEntries: [],
            rules: copiedRules,
          };

          return { sopEntries: [newEntry, ...state.sopEntries] };
        });

        return isNewEntry;
      },

      setEntries: (entries) => set({ sopEntries: entries }),

      updateEntry: (id, updates) =>
        set((state) => ({
          sopEntries: state.sopEntries.map((entry) =>
            entry.id === id ? { ...entry, ...updates } : entry
          ),
        })),
    }),
    {
      name: "sop-library",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ sopEntries: state.sopEntries }),
      // SOPs saved before LOB existed are Logistics
      merge: (persisted, current) => {
        const stored = (persisted as Partial<SOPStore> | undefined)?.sopEntries ?? [];
        return {
          ...current,
          sopEntries: stored.map((entry) => ({
            ...entry,
            lob: isSOPLob(entry.lob) ? entry.lob : DEFAULT_LOB,
          })),
        };
      },
    },
  ),
);
