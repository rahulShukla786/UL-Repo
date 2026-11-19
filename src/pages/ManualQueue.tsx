import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { useJournalEntries } from "../context/JournalEntriesContext";
import { StatusBadge } from "../components/shared/StatusBadge";
import { DataTable } from "../components/shared/DataTable";
import { Input } from "../components/shared/Input";
import { Select, SelectItem } from "../components/shared/Select";
import { Button } from "../components/shared/Button";
import type { ColumnDef } from "@tanstack/react-table";
import type { JEStatus, JournalEntry } from "../types";
import { cn } from "../lib/utils";

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

interface FilterSelectProps {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  className?: string;
}

const FilterSelect: React.FC<FilterSelectProps> = ({
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

export const ManualQueue: React.FC = () => {
  const navigate = useNavigate();
  const { entries: journalEntries } = useJournalEntries();
  const [search, setSearch] = useState("");
  const [jeCategory, setJeCategory] = useState("All");
  const [jeType, setJeType] = useState("All");
  const [lob, setLob] = useState("All");
  const [month, setMonth] = useState("All");

  // Derive filter options from action_required entries
  const baseData = useMemo(
    () => journalEntries.filter((je) => je.status === "action_required"),
    [journalEntries],
  );
  const filterOptions = useMemo(() => {
    const categories = [
      "All",
      ...Array.from(
        new Set(baseData.map((je) => je.jeCategory).filter(Boolean)),
      ),
    ];
    const types = [
      "All",
      ...Array.from(new Set(baseData.map((je) => je.jeType).filter(Boolean))),
    ];
    const lobs = [
      "All",
      ...Array.from(new Set(baseData.map((je) => je.lob).filter(Boolean))),
    ];
    const monthYears = Array.from(
      new Set(
        baseData
          .map((je) => {
            if (!je.processDate) return null;
            const parts = je.processDate.split(" ");
            if (parts.length < 3) return null;
            const monthFull =
              MONTHS.find((m) => m.startsWith(parts[1])) || parts[1];
            return `${monthFull}, ${parts[2]}`;
          })
          .filter(Boolean),
      ),
    ) as string[];
    return { categories, types, lobs, monthYears };
  }, [baseData]);

  // Only show action_required entries
  const filtered = useMemo(() => {
    let data = [...baseData];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (je) =>
          je.id.toLowerCase().includes(q) || je.name.toLowerCase().includes(q),
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
        const mFull = MONTHS.find((m) => m.startsWith(parts[1])) || "";
        return MONTHS.indexOf(mFull) === monthIdx && parts[2] === year;
      });
    }
    return data;
  }, [search, jeCategory, jeType, lob, month, baseData]);

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
      header: "COUNTRY",
      accessorKey: "country",
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
      header: "EXCEPTION",
      id: "exception",
      cell: ({ row }) => {
        const stages = row.original.stages;
        const exceptionStage = stages.find((s) => s.exceptionType);
        return (
          <span className="text-[12px] text-warning font-medium">
            {exceptionStage?.exceptionTitle ?? "Action Required"}
          </span>
        );
      },
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
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-[12px] text-gray-500 mb-4">
        <button
          onClick={() => navigate("/dashboard")}
          className="hover:text-brand transition-colors cursor-pointer"
        >
          AI Journal Entry
        </button>
        <span>/</span>
        <span className="text-gray-900 font-medium">Work List</span>
      </div>

      {/* Title + count */}
      <div className="flex items-center gap-3 mb-5">
        <h1 className="text-[20px] font-semibold text-gray-900">Work List</h1>
        <span className="inline-flex items-center justify-center h-[24px] px-2.5 rounded-full bg-warning/10 text-warning text-[12px] font-semibold">
          {filtered.length}
        </span>
      </div>

      <div>
        <div className="mt-4">
          <DataTable<JournalEntry>
            columns={columns}
            data={filtered}
            rowKey={(je) => je.id}
            onRowClick={(je) =>
              navigate(`/journal-entry/${je.id}`, {
                state: { from: "/work-list" },
              })
            }
            rowClassName="h-[80px]"
            className="mt-4"
            headerComponents={headerComponents}
            initialPageSize={7}
            pageSizeOptions={[7, 10, 20]}
            label="Action Required Entries"
          />
        </div>
      </div>
    </div>
  );
};

export default ManualQueue;
