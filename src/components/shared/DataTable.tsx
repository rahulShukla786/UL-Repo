import React, { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../shared/Button";
import { cn } from "../../lib/utils";

interface DataTableProps<T extends object> {
  columns: ColumnDef<T>[];
  data: T[];
  rowKey: (item: T) => string;
  onRowClick?: (item: T) => void;
  rowClassName?: string | ((item: T) => string);
  headerComponents?: React.ReactNode;
  emptyMessage?: string;
  className?: string;
  enablePagination?: boolean;
  initialPageSize?: number;
  pageSizeOptions?: number[];
  onPaginationChange?: (pageIndex: number, pageSize: number) => void;
  label?: string;
}

export function DataTable<T extends object>({
  columns,
  data,
  rowKey,
  onRowClick,
  rowClassName,
  headerComponents,
  emptyMessage = "No records found.",
  className,
  enablePagination = true,
  initialPageSize = 7,
  onPaginationChange,
  label,
}: DataTableProps<T>) {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: initialPageSize,
  });

  const table = useReactTable({
    data,
    columns,
    state: { pagination },
    onPaginationChange: setPagination,
    getRowId: rowKey,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const rowModel = enablePagination
    ? table.getPaginationRowModel()
    : table.getRowModel();

  const pageCount = table.getPageCount();
  const rowCount = data.length;
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const endRecord = Math.min(rowCount, (pageIndex + 1) * pageSize);

  React.useEffect(() => {
    if (onPaginationChange) {
      onPaginationChange(pageIndex, pageSize);
    }
  }, [pageIndex, pageSize, onPaginationChange]);

  return (
    <div
      className={cn(
        "rounded-2xl border border-border-default bg-white shadow-sm",
        className,
      )}
    >
      {/* Filter header — relative + z-10 so custom dropdowns render above the table */}
      {headerComponents ? (
        <div className="relative z-10 border-b border-border-default px-4 py-4">
          {headerComponents}
        </div>
      ) : null}

      {/* Table + pagination — overflow-hidden clips backgrounds to rounded corners */}
      <div
        className={cn(
          "relative z-0 overflow-hidden",
          headerComponents ? "rounded-b-2xl" : "rounded-2xl",
        )}
      >
        <div className="overflow-x-auto scrollbar-doc">
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="bg-gray-100 border-b border-border-default"
                >
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={cn(
                        "text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide",
                        (
                          header.column.columnDef.meta as
                            | { headerClassName?: string }
                            | undefined
                        )?.headerClassName,
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {rowModel.rows.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-8 text-center text-sm text-gray-500"
                    colSpan={columns.length}
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                rowModel.rows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => onRowClick?.(row.original)}
                    className={cn(
                      onRowClick
                        ? "cursor-pointer hover:bg-gray-50 transition-colors h-[80px]"
                        : "",
                      typeof rowClassName === "function"
                        ? rowClassName(row.original)
                        : rowClassName,
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={cn(
                          "px-4 py-4 text-[13px] text-gray-700 whitespace-nowrap align-middle border-b border-border-strong",
                          (
                            cell.column.columnDef.meta as
                              | { cellClassName?: string }
                              | undefined
                          )?.cellClassName,
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {enablePagination ? (
          <div className="border-t border-border-default px-4 py-4 flex items-center justify-between gap-4">
            {/* Left: label + record count */}
            <div>
              {label && (
                <p className="text-[13px] font-semibold text-gray-900">
                  {label}
                </p>
              )}
              <p className="text-[12px] text-gray-500">
                Showing {endRecord} of {rowCount} records
              </p>
            </div>

            {/* Right: Previous · page numbers · Next */}
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="flex items-center gap-1"
              >
                <ChevronLeft size={14} />
                Previous
              </Button>

              {Array.from({ length: pageCount }).map((_, index) => (
                <Button
                  key={index}
                  type="button"
                  variant={pageIndex === index ? "default" : "secondary"}
                  size="sm"
                  onClick={() => table.setPageIndex(index)}
                  className="min-w-9"
                >
                  {index + 1}
                </Button>
              ))}

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="flex items-center gap-1"
              >
                Next
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default DataTable;
