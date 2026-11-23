import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Search, ChevronRight } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { DataTable } from "../components/shared/DataTable";
import { Input } from "../components/shared/Input";
import { Select, SelectItem } from "../components/shared/Select";
import { SOPParserPanel } from "../components/sop-terminal/SOPParserPanel";
import { SOPLibraryDetailPanel } from "../components/sop-terminal/SOPLibraryDetailPanel";
import { cn, formatDate } from "../lib/utils";
import { useJournalEntries } from "../context/JournalEntriesContext";
import { useSOPStore } from "../stores/sopStore";
import type { SOPEntry, SOPStatus } from "../stores/sopStore";
import { SOP_LOBS, getRulesForLob, type LobRule, type SOPLob } from "../data/ruleSets";
import type { ColumnDef } from "@tanstack/react-table";

const SOP_CATEGORIES = [
  "All",
  "Adjustment",
  "Payroll",
  "Tax",
  "Intercompany",
  "Depreciation",
  "Accrual",
  "Revenue",
];

const SOP_COUNTRIES = [
  "All",
  "India",
  "Australia",
  "Philippines",
  "Canada",
  "UK",
  "USA",
];

const SOP_STATUS_OPTIONS = ["All", "Active", "Inactive"] as const;
const TABS = ["SOP Library", "SOP Parser"] as const;

const StatusPill: React.FC<{ status: SOPStatus }> = ({ status }) => {
  const isActive = status === "Active";

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-semibold"
      style={{
        background: "transparent",
        borderColor: isActive ? "#38b24c" : "#ff304d",
        color: isActive ? "#38b24c" : "#ff304d",
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: isActive ? "#38b24c" : "#ff304d" }}
      />
      {status}
    </span>
  );
};

export const SOPTerminal: React.FC = () => {
  const navigate = useNavigate();
  const { sopId } = useParams<{ sopId: string }>();
  const { entries: journalEntries, addEntryFromSOP } = useJournalEntries();
  const { sopEntries, addEntry, setEntries } = useSOPStore();

  // SOPs saved with an incomplete rule set get the full one: Logistics = 116 rules
  // (Rules/All_116_Rules_File_Check_Results.xlsx), Warehouse = 111 rules incl. R109/R110
  // (warehouseDocs/WH_rule_111.xlsx). Saved statuses are kept by rule id,
  // and rules added by hand stay at the end.
  useEffect(() => {
    let cancelled = false;
    Promise.all(SOP_LOBS.map((lob) => getRulesForLob(lob)))
      .then((ruleLists) => {
        if (cancelled) return;
        const rulesByLob = new Map<SOPLob, LobRule[]>(
          SOP_LOBS.map((lob, index) => [lob, ruleLists[index]]),
        );
        const current = useSOPStore.getState().sopEntries;
        let changed = false;
        const next = current.map((entry) => {
          const lobRules = rulesByLob.get(entry.lob);
          if (!lobRules || lobRules.length === 0) return entry;
          const fullIds = new Set(lobRules.map((rule) => rule.rule_id));
          const presentCount = entry.rules.filter((rule) => fullIds.has(rule.id)).length;
          if (presentCount >= fullIds.size) return entry;
          changed = true;
          const statusById = new Map(entry.rules.map((rule) => [rule.id, rule.status]));
          const customRules = entry.rules.filter((rule) => !fullIds.has(rule.id));
          const rules = [
            ...lobRules.map((rule) => ({
              id: rule.rule_id,
              order: 0,
              title: rule.title,
              text: rule.description,
              type: rule.rule_type,
              status: statusById.get(rule.rule_id) ?? ("Pending" as const),
            })),
            ...customRules,
          ].map((rule, index) => ({ ...rule, order: index + 1 }));
          return { ...entry, rules };
        });
        if (changed) setEntries(next);
      })
      .catch(() => {
        // keep saved rules if the Excel file cannot be read
      });
    return () => {
      cancelled = true;
    };
  }, [setEntries]);
  const location = useLocation();
  // Tab can be passed via navigation state (keeps the tab if the route change remounts the page)
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>(() => {
    const tab = (location.state as { tab?: string } | null)?.tab;
    return tab === "SOP Parser" ? "SOP Parser" : "SOP Library";
  });
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(SOP_CATEGORIES[0]);
  const [selectedStatus, setSelectedStatus] = useState<SOPStatus | "All">("All");
  const [selectedCountry, setSelectedCountry] = useState(SOP_COUNTRIES[0]);

  const handleSaveToLibrary = useCallback((fileName: string, rules: SOPEntry["rules"], lob: SOPLob) => {
    const isNewEntry = addEntry(fileName, rules, lob);
    if (isNewEntry) {
      // Journal Entry row gets the same LOB (Logistics / Warehouse)
      addEntryFromSOP(fileName, lob);
    }
    // After saving, show the SOP Library list (not a previously opened SOP's detail page)
    setActiveTab("SOP Library");
    navigate("/sop-terminal", { state: { tab: "SOP Library" } });
  }, [addEntry, addEntryFromSOP, navigate]);

  const allJEOptions = useMemo(() => {
    return journalEntries.map((je) => `${je.id} - ${je.name}`);
  }, [journalEntries]);

  const selectedEntry = useMemo(
    () => sopEntries.find((entry) => entry.id === sopId) ?? null,
    [sopId, sopEntries],
  );

  const filteredEntries = useMemo(() => {
    return sopEntries.filter((row) => {
      const matchesSearch =
        row.name.toLowerCase().includes(search.toLowerCase()) ||
        (row.sopCode ?? "").toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || row.category === selectedCategory;
      const matchesStatus =
        selectedStatus === "All" || row.status === selectedStatus;
      const matchesCountry =
        selectedCountry === "All" || row.country === selectedCountry;
      return matchesSearch && matchesCategory && matchesStatus && matchesCountry;
    });
  }, [search, selectedCategory, selectedStatus, selectedCountry, sopEntries]);

  const columns: ColumnDef<SOPEntry>[] = [
    {
      // SOP ID first; it is the clickable link that opens the SOP details
      header: "SOP ID",
      accessorKey: "sopCode",
      cell: ({ getValue }) => (
        <span className="text-brand font-medium hover:underline cursor-pointer">
          {getValue<string>()}
        </span>
      ),
    },
    {
      header: "SOP NAME",
      accessorKey: "name",
    },
    {
      header: "COUNTRY",
      accessorKey: "country",
    },
    {
      header: "CATEGORY",
      accessorKey: "category",
    },
    {
      header: "LOB",
      accessorKey: "lob",
    },
    {
      header: "LAST UPDATED",
      accessorKey: "lastUpdated",
      // Shown as YYYY-MM-DD (older saved entries may use "23 November 2026")
      cell: ({ getValue }) => formatDate(getValue<string>()),
    },
    {
      header: "STATUS",
      accessorKey: "status",
      cell: ({ getValue }) => <StatusPill status={getValue<SOPStatus>()} />,
    },
    {
      header: "",
      accessorKey: "id",
      cell: () => (
        <button
          type="button"
          className="inline-flex items-center text-gray-400 transition-colors hover:text-gray-600"
        >
          <ChevronRight size={16} />
        </button>
      ),
      meta: {
        cellClassName: "w-[48px] text-right",
        headerClassName: "w-[48px]",
      },
    },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex items-center gap-1 text-[12px] text-gray-500 mb-4">
        <button
          type="button"
          onClick={() => navigate("/journal-entry")}
          className="hover:text-brand transition-colors cursor-pointer"
        >
          AI Journal Entry
        </button>
        <span>/</span>
        <span className="text-gray-900 font-medium">SOP Terminal</span>
      </div>

      <div className="mb-4 flex items-center gap-8 border-b border-gray-200">
        {TABS.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setActiveTab(tab);
                // Switching tabs leaves an open SOP detail so the Library opens on its list
                if (sopId) navigate("/sop-terminal", { state: { tab } });
              }}
              className={cn(
                "-mb-px border-b-2 px-0 pb-3 text-[15px] font-medium transition-colors cursor-pointer cursor-pointer",
                isActive
                  ? "border-brand text-brand"
                  : "border-transparent text-gray-500 hover:text-gray-700",
              )}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {activeTab === "SOP Library" ? (
        selectedEntry ? (
          <SOPLibraryDetailPanel
            key={`${selectedEntry.id}-${selectedEntry.rules.length}`}
            entryId={selectedEntry.id}
            sopCode={selectedEntry.sopCode}
            name={selectedEntry.name}
            version={selectedEntry.version}
            category={selectedEntry.category}
            lastUpdated={formatDate(selectedEntry.lastUpdated)}
            status={selectedEntry.status}
            mappedJournalEntries={selectedEntry.mappedJournalEntries}
            rules={selectedEntry.rules}
            allJEOptions={allJEOptions}
            onBack={() => navigate("/sop-terminal")}
          />
        ) : (
          <DataTable
            columns={columns}
            data={filteredEntries}
            rowKey={(item) => item.id}
            onRowClick={(item) => navigate(`/sop-terminal/library/${item.id}`)}
            emptyMessage="No SOPs in the library yet. Save an SOP from the SOP Parser to add it here."
            label="SOP List"
            enablePagination
            initialPageSize={7}
            pageSizeOptions={[7, 15]}
            className="mt-0"
            headerComponents={
              <div className="grid gap-3 md:grid-cols-8 md:items-end">
                <div className="md:col-span-4">
                  <label className="block text-[12px] font-medium text-gray-700 mb-1">
                    Search
                  </label>
                  <div className="relative">
                    <Search
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <Input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search by SOP ID or SOP Name..."
                      className="h-9 pl-9"
                    />
                  </div>
                </div>

                <div className="md:col-span-1">
                  <label className="block text-[12px] font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                    className="h-9 w-full"
                  >
                    {SOP_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                <div className="md:col-span-1">
                  <label className="block text-[12px] font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <Select
                    value={selectedCountry}
                    onValueChange={setSelectedCountry}
                    className="h-9 w-full"
                  >
                    {SOP_COUNTRIES.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                <div className="md:col-span-1">
                  <label className="block text-[12px] font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <Select
                    value={selectedStatus}
                    onValueChange={(value) =>
                      setSelectedStatus(value as SOPStatus | "All")
                    }
                    className="h-9 w-full"
                  >
                    {SOP_STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
              </div>
            }
          />
        )
      ) : (
        <SOPParserPanel onSaveToLibrary={handleSaveToLibrary} />
      )}
    </div>
  );
};

export default SOPTerminal;
