import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  FileSpreadsheet,
  RefreshCcw,
  Clock,
  Banknote,
} from "lucide-react";
import { JournalEntryList } from "./JournalEntryList";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ReportCard {
  key: string;
  label: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  barColor: string;
  count: number;
  percentage: number;
  trend: number;
  trendUp: boolean;
  mom: number;
}

interface PostingStat {
  label: string;
  value: number;
  badgeLabel: string;
  badgeColor: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const REPORT_CARDS: ReportCard[] = [
  {
    key: "adhoc",
    label: "ADHOC",
    icon: FileSpreadsheet,
    iconBg: "bg-[var(--dgem-red)]",
    iconColor: "text-white",
    barColor: "bg-[var(--dgem-red)]",
    count: 347,
    percentage: 41.0,
    trend: 13.0,
    trendUp: true,
    mom: 22.6,
  },
  {
    key: "recurring",
    label: "RECURRING",
    icon: RefreshCcw,
    iconBg: "bg-[var(--dgem-orange)]",
    iconColor: "text-white",
    barColor: "bg-[var(--dgem-orange)]",
    count: 218,
    percentage: 25.8,
    trend: 3.0,
    trendUp: false,
    mom: 22.6,
  },
  {
    key: "accural",
    label: "ACCURAL",
    icon: Clock,
    iconBg: "bg-[var(--dgem-light-blue)]",
    iconColor: "text-white",
    barColor: "bg-[var(--dgem-light-blue)]",
    count: 183,
    percentage: 22.6,
    trend: 10.0,
    trendUp: true,
    mom: 22.0,
  },
  {
    key: "cash",
    label: "CASH",
    icon: Banknote,
    iconBg: "bg-[var(--dgem-green)]",
    iconColor: "text-white",
    barColor: "bg-[var(--dgem-green)]",
    count: 95,
    percentage: 11.8,
    trend: 5.0,
    trendUp: true,
    mom: 22.0,
  },
];

const POSTING_STATS: PostingStat[] = [
  {
    label: "POSTED",
    value: 573,
    badgeLabel: "Live",
    badgeColor: "bg-green-100 text-green-700",
  },
  {
    label: "PROCESSED",
    value: 164,
    badgeLabel: "Live",
    badgeColor: "bg-green-100 text-green-700",
  },
  {
    label: "QUEUED",
    value: 23,
    badgeLabel: "Trend",
    badgeColor: "bg-orange-100 text-orange-600",
  },
  {
    label: "EXTRACTED",
    value: 41,
    badgeLabel: "Trend",
    badgeColor: "bg-orange-100 text-orange-600",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Breadcrumb */}
      <p className="text-[12px] text-gray-400 mb-0.5">Overview</p>
      <h1 className="text-[22px] font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* ── Blue Stats Banner ─────────────────────────────────────────── */}
      <div className="bg-[var(--brand-primary)] rounded-2xl px-8 py-6 flex items-center justify-between mb-6">
        {/* Date Range */}
        <div>
          <p className="text-[11px] text-blue-200 mb-1.5">Date Range</p>
          <div className="flex items-center gap-2.5 bg-white/10 rounded-xl px-4 py-2.5 border border-white/20">
            <span className="text-white text-[14px] font-medium">
              2026-01-01 - 2026-07-01
            </span>
            <Calendar size={15} className="text-blue-300 flex-shrink-0" />
          </div>
        </div>

        {/* KPIs */}
        <div className="flex items-stretch">
          <div className="pl-10 pr-10 border-l border-white/20">
            <p className="text-[11px] font-semibold text-blue-200 uppercase tracking-widest mb-1">
              JE PROCESSED
            </p>
            <p className="text-[36px] font-bold text-white leading-none">573</p>
          </div>
          <div className="pl-10 pr-10 border-l border-white/20">
            <p className="text-[11px] font-semibold text-blue-200 uppercase tracking-widest mb-1">
              TOTAL AMOUNT
            </p>
            <p className="text-[36px] font-bold text-white leading-none">
              $15,122K
            </p>
          </div>
          <div className="pl-10 border-l border-white/20">
            <p className="text-[11px] font-semibold text-blue-200 uppercase tracking-widest mb-1">
              RECORDS
            </p>
            <p className="text-[36px] font-bold text-white leading-none">
              3,214
            </p>
          </div>
        </div>
      </div>

      {/* ── Report Type Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {REPORT_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.key}
              className="bg-white rounded-2xl p-5 shadow-sm border border-border-default"
            >
              {/* Header row */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${card.iconBg}`}
                  >
                    <Icon size={19} className={card.iconColor} />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-gray-900 leading-tight">
                      {card.label}
                    </p>
                    <p className="text-[11px] text-gray-400">Report Type</p>
                  </div>
                </div>
                <span
                  className={`flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-[4px] ${
                    card.trendUp
                      ? "bg-green-50 text-green-600"
                      : "bg-red-50 text-red-500"
                  }`}
                >
                  {card.trendUp ? (
                    <TrendingUp size={11} />
                  ) : (
                    <TrendingDown size={11} />
                  )}
                  {card.trend.toFixed(1)}%
                </span>
              </div>

              {/* Count */}
              <p className="text-[30px] font-bold text-gray-900 leading-none mb-0.5">
                {card.count}
              </p>
              <p className="text-[11px] text-gray-400 mb-3">
                {card.percentage.toFixed(1)}% of total
              </p>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-gray-100 rounded-full mb-3">
                <div
                  className={`h-1.5 rounded-full ${card.barColor}`}
                  style={{ width: `${card.percentage}%` }}
                />
              </div>

              {/* Month over month */}
              <p className="text-[11px] text-gray-400 mb-0.5">
                Month Over Month
              </p>
              <span className="flex items-center gap-0.5 text-[12px] font-bold text-green-600">
                <TrendingUp size={11} />
                {card.mom.toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>

      {/* ── JE Posting Overview ───────────────────────────────────────── */}
      <div className="flex gap-4 mb-6 bg-white p-4 rounded-[8px]">
        {/* Description card */}
        <div className="w-[280px] flex-shrink-0 flex flex-col justify-center">
          <div className="flex items-center flex-wrap gap-2 mb-2">
            <h3 className="text-[14px] font-bold text-gray-900">
              JE Posting Overview
            </h3>
            <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
              Top Status: Posted
            </span>
          </div>
          <p className="text-[12px] text-gray-600 mb-1">
            573 JE's Requested. 3214 Records
          </p>
          <p className="text-[11px] text-gray-400">
            Updated just now. Data shown for total requests.
          </p>
        </div>

        {/* Posting stats */}
        <div className="grid grid-cols-4 gap-4 flex-1">
          {POSTING_STATS.map((stat) => (
            <div
              key={stat.label}
              className=" rounded-[8px] p-5 border border-border-default"
            >
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-3">
                {stat.label}
              </p>
              <p className="text-[34px] font-bold text-gray-900 leading-none mb-3">
                {stat.value}
              </p>
              <span
                className={`text-[11px] font-semibold px-3 py-1 rounded-[4px] ${
                  stat.badgeColor
                }`}
              >
                {stat.badgeLabel}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Journal Entry List (existing component, embedded mode) ────── */}
      <JournalEntryList
        embedded
        defaultMonth="July, 2026"
        onRowClick={(je) => navigate(`/journal-entry/${je.id}`)}
      />
    </div>
  );
};