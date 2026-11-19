import React, { useCallback, useMemo, useState } from "react";
import { Search, ChevronRight } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { DataTable } from "../components/shared/DataTable";
import { Input } from "../components/shared/Input";
import { Select, SelectItem } from "../components/shared/Select";
import { SOPParserPanel } from "../components/sop-terminal/SOPParserPanel";
import { SOPLibraryDetailPanel } from "../components/sop-terminal/SOPLibraryDetailPanel";
import { cn } from "../lib/utils";
import { useJournalEntries } from "../context/JournalEntriesContext";
import { useSOPStore } from "../stores/sopStore";
import type { SOPEntry, SOPStatus } from "../stores/sopStore";
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
  const { sopEntries, addEntry } = useSOPStore();
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("SOP Library");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(SOP_CATEGORIES[0]);
  const [selectedStatus, setSelectedStatus] = useState<SOPStatus | "All">("All");
  const [selectedCountry, setSelectedCountry] = useState(SOP_COUNTRIES[0]);

  const handleSaveToLibrary = useCallback((fileName: string, rules: SOPEntry["rules"]) => {
    const isNewEntry = addEntry(fileName, rules);
    if (isNewEntry) {
      addEntryFromSOP(fileName);
    }
    setActiveTab("SOP Library");
  }, [addEntry, addEntryFromSOP]);

  const allJEOptions = useMemo(() => {
    return journalEntries.map((je) => `${je.id} - ${je.name}`);
  }, [journalEntries]);

  const selectedEntry = useMemo(
    () => sopEntries.find((entry) => entry.id === sopId) ?? null,
    [sopId, sopEntries],
  );

  const filteredEntries = useMemo(() => {
    return sopEntries.filter((row) => {
      const matchesSearch = row.name.toLowerCase().includes(search.toLowerCase());
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
      header: "SOP NAME",
      accessorKey: "name",
      cell: ({ getValue }) => (
        <span className="text-brand font-medium hover:underline cursor-pointer">
          {getValue<string>()}
        </span>
      ),
    },
    {
      header: "VERSION NUMBER",
      accessorKey: "version",
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
      header: "LAST UPDATED",
      accessorKey: "lastUpdated",
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
          onClick={() => navigate("/dashboard")}
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
              onClick={() => setActiveTab(tab)}
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
            key={selectedEntry.id}
            entryId={selectedEntry.id}
            sopCode={selectedEntry.sopCode}
            name={selectedEntry.name}
            version={selectedEntry.version}
            category={selectedEntry.category}
            lastUpdated={selectedEntry.lastUpdated}
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
                      placeholder="Search by SOP Name..."
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
