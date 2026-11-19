import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  ListChecks,
  AlertTriangle,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "../../lib/utils";
import DGEMLogo from "@/assets/svg/DGEMLogo";

interface NavItem {
  label: string;
  icon: React.ElementType;
  to: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard" },
  { label: "Journal Entry", icon: FileText, to: "/journal-entry" },
  { label: "Work List", icon: ListChecks, to: "/work-list" },
  { label: "Exception", icon: AlertTriangle, to: "/exception" },
  { label: "SOP Terminal", icon: BookOpen, to: "/sop-terminal" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const location = useLocation();

  return (
    <aside
      className={cn(
        "relative flex flex-col bg-white border-r border-gray-200 h-full transition-all duration-200 flex-shrink-0",
        collapsed ? "w-[56px]" : "w-[200px]",
      )}
    >
      {/* ── Logo / App Header ─────────────────────────────────── */}
      <div className="px-3 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2.5">
          <DGEMLogo />
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-gray-900 leading-tight truncate">
                AI Journal Entry
              </p>
              <p className="text-[11px] text-gray-400 leading-tight">
                Enterprise Suite
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Collapse toggle — floating at top-right edge ───────── */}
      <button
        onClick={onToggle}
        className={cn(
          "absolute -right-2.5 top-[24px] z-20",
          "w-[20px] h-[20px] rounded-full bg-white border border-gray-200 shadow-sm",
          "flex items-center justify-center",
          "text-gray-400 hover:text-brand hover:border-brand transition-colors",
        )}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
      </button>

      {/* ── Navigation ────────────────────────────────────────── */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          // When on a detail page (/journal-entry/:id), highlight the source menu item
          const fromState = (location.state as { from?: string })?.from;
          const isOnDetailPage = /^\/journal-entry\/.+/.test(location.pathname);
          let isActive: boolean;
          if (isOnDetailPage && fromState) {
            // Highlight the menu item that matches the source page
            isActive = item.to === fromState;
          } else if (item.to === "/journal-entry") {
            isActive = location.pathname.startsWith("/journal-entry");
          } else if (item.to === "/sop-terminal") {
            isActive = location.pathname.startsWith("/sop-terminal");
          } else {
            isActive = location.pathname === item.to;
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "relative flex items-center h-[36px] gap-2.5 px-3 py-2.5 mx-1.5 rounded-lg text-[13px] transition-colors",
                isActive
                  ? "bg-brand-light text-brand font-medium"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
              )}
            >
              {/* Active indicator — thick left vertical bar aligned to sidebar edge */}
              {isActive && (
                <span className="absolute -left-0 inset-y-0 top-[25%] h-[50%] w-[3px] bg-brand rounded-r-full" />
              )}
              <Icon size={16} className="flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* ── User info ─────────────────────────────────────────── */}
      <div className="px-3 py-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[11px] font-semibold">NP</span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-gray-900 truncate">
                John Doe
              </p>
              <p className="text-[11px] text-gray-400 truncate">
                Finance Analyst
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
