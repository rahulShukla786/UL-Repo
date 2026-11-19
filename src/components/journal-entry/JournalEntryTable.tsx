import React, { useState, useMemo } from "react";
import {
  Search,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Check,
} from "lucide-react";
import { useJournalEntries } from "../../context/JournalEntriesContext";
import { StatusBadge } from "../shared/StatusBadge";
import { DataTable } from "../shared/DataTable";
import { Input } from "../shared/Input";
import { Select, SelectItem } from "../shared/Select";
import { Button } from "../shared/Button";
import type { ColumnDef } from "@tanstack/react-table";
import type { JEStatus, JournalEntry } from "../../types";
import { cn } from "../../lib/utils";

const STATUS_TABS: { key: string; label: string; status?: JEStatus }[] = [
  { key: "all", label: "All" },
  { key: "completed", label: "Completed", status: "completed" },
  {
    key: "action_required",
    label: "Action Required",
    status: "action_required",
  },
  { key: "failed", label: "Failed", status: "failed" },
  { key: "pending", label: "Pending", status: "pending" },
];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const YEARS = ["2026", "2025", "2024", "2023", "2022", "2021", "2020"];

interface DropdownProps {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  className?: string;
}

const FilterSelect: React.FC<DropdownProps> = ({
  label,
  options,
  value,
  onChange,
  className,
}) => (
  <div>
    <label className="block text-[12px] font-medium text-gray-700 mb-1">
      {label}
    </label>
    <Select
      value={value}
      onValueChange={onChange}
      className={cn("w-full", className)}
    >
      {options.map((opt) => (
        <SelectItem key={opt} value={opt}>
          {opt}
        </SelectItem>
      ))}
    </Select>
  </div>
);

const MonthYearPicker: React.FC<{
  value: string;
  onChange: (v: string) => void;
}> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("July");
  const [selectedYear, setSelectedYear] = useState("2026");

  const handleSelect = () => {
    onChange(`${selectedMonth}, ${selectedYear}`);
    setOpen(false);
  };

  return (
    <div className="relative">
      <Button
        type="button"
        variant="secondary"
        onClick={() => setOpen(!open)}
        className="flex items-center h-[36px] gap-2 w-full justify-between text-[13px] font-normal"
      >
        <span className="flex-1 text-left">{value}</span>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </Button>
      {open && (
        <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-3 w-[320px]">
          <div className="flex gap-3">
            <div className="flex-1">
              <p className="text-[11px] font-semibold text-gray-500 uppercase mb-1">
                Month
              </p>
              <div className="grid grid-cols-3 gap-1">
                {MONTHS.map((m) => (
                  <Button
                    key={m}
                    type="button"
                    variant={selectedMonth === m ? "default" : "ghost"}
                    onClick={() => setSelectedMonth(m)}
                    className="text-[11px] h-7 px-1"
                  >
                    {m.slice(0, 3)}
                  </Button>
                ))}
              </div>
            </div>
            <div className="w-[70px]">
              <p className="text-[11px] font-semibold text-gray-500 uppercase mb-1">
                Year
              </p>
              <div className="space-y-0.5">
                {YEARS.map((y) => (
                  <Button
                    key={y}
                    type="button"
                    variant={selectedYear === y ? "default" : "ghost"}
                    onClick={() => setSelectedYear(y)}
                    className="w-full text-[11px] h-7 px-1"
                  >
                    {y}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-3 pt-2 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" size="sm" onClick={handleSelect}>
              Select
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export interface JournalEntryTableProps {
  onRowClick?: (je: JournalEntry) => void;
  className?: string;
  defaultMonth?: string;
}

export const JournalEntryTable: React.FC<JournalEntryTableProps> = ({
  onRowClick,
  className,
  defaultMonth = "All",
}) => {
  const { entries: journalEntries } = useJournalEntries();
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [jeCategory, setJeCategory] = useState("All");
  const [jeType, setJeType] = useState("All");
  const [lob, setLob] = useState("All");
  const [month, setMonth] = useState(defaultMonth);

  const filtered = useMemo(() => {
    let data = [...journalEntries];
    if (activeTab !== "all") {
      data = data.filter((je) => je.status === activeTab);
    }
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (je) =>
          je.id.toLowerCase().includes(q) ||
          je.name.toLowerCase().includes(q),
      );
    }
    if (jeCategory !== "All")
      data = data.filter((je) => je.jeCategory === jeCategory);
    if (jeType !== "All") data = data.filter((je) => je.jeType === jeType);
    if (lob !== "All") data = data.filter((je) => je.lob === lob);
    if (month !== "All") {
      const [monthName, year] = month.split(", ");
      const monthIdx = MONTHS.indexOf(monthName);
      data = data.filter((je) => {
        if (!je.processDate) return false;
        const parts = je.processDate.split(" ");
        if (parts.length < 3) return false;
        const mFull = MONTHS.find((m) => m.startsWith(parts[1])) || "";
        return MONTHS.indexOf(mFull) === monthIdx && parts[2] === year;
      });
    }
    return data;
  }, [activeTab, search, jeCategory, jeType, lob, month, journalEntries]);

  const counts = useMemo(
    () => ({
      all: journalEntries.length,
      completed: journalEntries.filter((j) => j.status === "completed").length,
      action_required: journalEntries.filter(
        (j) => j.status === "action_required",
      ).length,
      failed: journalEntries.filter((j) => j.status === "failed").length,
      pending: journalEntries.filter((j) => j.status === "pending").length,
    }),
    [journalEntries],
  );

  const filterOptions = useMemo(() => {
    const toUnique = (vals: (string | undefined)[]) =>
      ["All", ...(Array.from(new Set(vals.filter(Boolean))) as string[])];
    return {
      categories: toUnique(journalEntries.map((je) => je.jeCategory)),
      types: toUnique(journalEntries.map((je) => je.jeType)),
      lobs: toUnique(journalEntries.map((je) => je.lob)),
    };
  }, [journalEntries]);

  const tabColors: Record<
    string,
    { activeButton: string; activeCount: string; activeIcon: string }
  > = {
    all: {
      activeButton: "bg-brand text-white border-brand",
      activeCount: "bg-white/15 text-white",
      activeIcon: "text-brand",
    },
    completed: {
      activeButton: "bg-completed text-white border-completed",
      activeCount: "bg-[#6CCB7B] text-white",
      activeIcon: "text-completed",
    },
    action_required: {
      activeButton: "bg-warning text-white border-warning",
      activeCount: "bg-[#F8B873] text-white border border-warning",
      activeIcon: "text-warning",
    },
    failed: {
      activeButton: "bg-failed text-white border-failed",
      activeCount: "bg-[#FF7A84] text-white",
      activeIcon: "text-failed",
    },
    pending: {
      activeButton: "bg-brand-dark text-white border-pending",
      activeCount: "bg-[#5E6F8F] text-white",
      activeIcon: "text-pending",
    },
  };

  const columns: ColumnDef<JournalEntry>[] = [
    {
      header: "JOURNAL ID",
      accessorKey: "id",
      cell: ({ getValue }) => (
        <span className="text-brand font-semibold">{getValue<string>()}</span>
      ),
      meta: { cellClassName: "pr-4" },
    },
    {
      header: "NAME",
      accessorKey: "name",
      meta: { cellClassName: "pr-4 text-gray-900" },
    },
    {
      header: "JE CATEGORY",
      accessorKey: "jeCategory",
      meta: { cellClassName: "pr-4" },
    },
    {
      header: "JE TYPE",
      accessorKey: "jeType",
      meta: { cellClassName: "pr-4" },
    },
    {
      header: "LOB",
      accessorKey: "lob",
      meta: { cellClassName: "pr-4" },
    },
    {
      header: "JE PROCESS DATE",
      accessorKey: "processDate",
      meta: { cellClassName: "pr-4" },
    },
    {
      header: "STATUS",
      accessorKey: "status",
      cell: ({ getValue }) => <StatusBadge status={getValue<JEStatus>()} />,
      meta: { cellClassName: "pr-4" },
    },
    {
      id: "actions",
      header: "",
      cell: () => <ChevronRight size={16} className="text-gray-400" />,
      meta: { cellClassName: "w-8" },
    },
  ];

  const headerComponents = (
    <div className="grid gap-4 md:grid-cols-[2fr_1fr_1fr_1fr_1fr]">
      <div>
        <label className="block text-[12px] font-medium text-gray-700 mb-1">
          Search
        </label>
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Journal ID, Name"
            className="pl-9 h-[36px]"
          />
        </div>
      </div>

      <FilterSelect
        label="JE Category"
        options={filterOptions.categories}
        value={jeCategory}
        onChange={setJeCategory}
        className="h-[36px]"
      />

      <FilterSelect
        label="JE Type"
        options={filterOptions.types}
        value={jeType}
        onChange={setJeType}
        className="h-[36px]"
      />

      <FilterSelect
        label="Line of Business"
        options={filterOptions.lobs}
        value={lob}
        onChange={setLob}
        className="h-[36px]"
      />

      <div>
        <label className="block text-[12px] font-medium text-gray-700 mb-1">
          Select Month
        </label>
        <MonthYearPicker value={month} onChange={setMonth} />
      </div>
    </div>
  );

  return (
    <div className={className}>
      {/* Status Tabs */}
      <div className="flex items-center gap-2 mb-5">
        {STATUS_TABS.map((tab) => {
          const count = counts[tab.key as keyof typeof counts] || 0;
          const isActive = activeTab === tab.key;
          const statusClasses = tabColors[tab.key] ?? tabColors.all;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-2 px-2.5 py-1.5 rounded-full text-[13px] font-medium border transition-all h-[30px] cursor-pointer",
                isActive
                  ? statusClasses.activeButton
                  : "bg-border-light-grayish-blue text-fiord border-border-light-grayish-blue",
              )}
            >
              {isActive && (
                <div className="flex items-center justify-center w-[13px] h-[13px] rounded-full flex-shrink-0 bg-white">
                  <Check
                    size={10}
                    strokeWidth={3}
                    className={statusClasses.activeIcon}
                  />
                </div>
              )}
              {tab.label}
              <span
                className={cn(
                  "text-[12px] font-semibold h-[20px] w-[27px] rounded-full flex items-center justify-center",
                  isActive
                    ? statusClasses.activeCount
                    : "bg-white text-fiord border border-border-light-grayish-blue",
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <DataTable<JournalEntry>
        columns={columns}
        data={filtered}
        rowKey={(je) => je.id}
        onRowClick={onRowClick}
        rowClassName="h-[80px]"
        headerComponents={headerComponents}
        initialPageSize={7}
        pageSizeOptions={[7, 10, 20]}
        label="Journal Entries"
      />
    </div>
  );
};

export default JournalEntryTable;
