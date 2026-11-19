import React from 'react';
import type { AdHocPreparationRow } from '../../types';

interface AdHocPreparationTableProps {
  rows: AdHocPreparationRow[];
  /** Maximum rows to show before truncating (default: 20). Pass rows.length to show all. */
  maxRows?: number;
  /** When true, cells become editable */
  isEditing?: boolean;
}

const DEFAULT_MAX_ROWS = 20;

/**
 * Reusable spreadsheet-style table for ad_hoc_je_preparation rows.
 * Columns: GL Account | GL Account Description | Posting Amount | DR/CR | Cost Center
 * Validation Status is intentionally excluded.
 * Used in Stage 2 (SOP Classification) and Stage 4 (Document Preview).
 *
 * Document Preview passes maxRows={rows.length} to show all records in scroll.
 */
export const AdHocPreparationTable: React.FC<AdHocPreparationTableProps> = ({
  rows,
  maxRows = DEFAULT_MAX_ROWS,
  isEditing = false,
}) => {
  const displayRows = rows.slice(0, maxRows);
  const hasMore = rows.length > maxRows;
  const showAll = maxRows >= rows.length;

  const HEADERS = ['A', 'B', 'C', 'D', 'E'];
  const COL_NAMES = [
    'GL Account',
    'GL Account Description',
    'Posting Amount',
    'DR/CR',
    'Cost Center',
  ];

  return (
    // max-h-[280px] — compact height, scrollable for all records
    <div className="overflow-x-scroll overflow-y-auto max-h-[280px] bg-white scrollbar-doc">
      <table className="w-max text-[11px]" style={{ borderCollapse: 'collapse' }}>
        <thead className="sticky top-0 z-10">
          <tr>
            <th className="w-8 bg-gray-100 border border-gray-300 px-1 py-0.5 text-center text-gray-500" />
            {HEADERS.map((h) => (
              <th
                key={h}
                className="bg-gray-100 border border-gray-300 px-2 py-0.5 text-center font-semibold text-gray-700 w-[260px]"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Row 1 — column name headers */}
          <tr>
            <td className="bg-gray-100 border border-gray-300 px-1 py-0.5 text-center text-gray-500 text-[10px]">
              1
            </td>
            {COL_NAMES.map((col) => (
              <td
                key={col}
                className="border border-gray-300 px-2 py-0.5 font-semibold text-gray-900 bg-doc-header-bg"
              >
                {col}
              </td>
            ))}
          </tr>

          {/* Data rows */}
          {displayRows.map((row, ri) => (
            <tr
              key={row.je_preparation_id}
              className={ri % 2 === 0 ? 'bg-source-email-bg' : 'bg-white'}
            >
              <td className="bg-gray-100 border border-gray-300 px-1 py-0.5 text-center text-gray-500 text-[10px]">
                {ri + 2}
              </td>
              <td className={`border border-gray-300 px-2 py-0.5 text-brand font-medium ${isEditing ? 'cursor-text hover:bg-blue-50' : ''}`} contentEditable={isEditing} suppressContentEditableWarning>
                {row.gl_account}
              </td>
              <td className={`border border-gray-300 px-2 py-0.5 text-gray-700 ${isEditing ? 'cursor-text hover:bg-blue-50' : ''}`} contentEditable={isEditing} suppressContentEditableWarning>
                {row.gl_account_description}
              </td>
              <td className={`border border-gray-300 px-2 py-0.5 text-gray-700 text-right ${isEditing ? 'cursor-text hover:bg-blue-50' : ''}`} contentEditable={isEditing} suppressContentEditableWarning>
                ${row.posting_amount.toLocaleString()}
              </td>
              <td className={`border border-gray-300 px-2 py-0.5 text-center ${isEditing ? 'cursor-text hover:bg-blue-50' : ''}`} contentEditable={isEditing} suppressContentEditableWarning>
                <span
                  className={`inline-block px-1 rounded text-[10px] font-semibold ${
                    row.debit_credit_indicator === 'DR'
                      ? 'bg-source-email-bg text-brand'
                      : 'bg-completed-light text-completed'
                  }`}
                >
                  {row.debit_credit_indicator}
                </span>
              </td>
              <td className={`border border-gray-300 px-2 py-0.5 text-gray-700 ${isEditing ? 'cursor-text hover:bg-blue-50' : ''}`} contentEditable={isEditing} suppressContentEditableWarning>
                {row.cost_center}
              </td>
            </tr>
          ))}

          {/* Truncated indicator */}
          {hasMore && (
            <tr>
              <td
                colSpan={HEADERS.length + 1}
                className="border border-gray-300 px-3 py-1.5 text-center text-[11px] text-gray-500 bg-gray-50 italic"
              >
                Showing {maxRows} of {rows.length} records
              </td>
            </tr>
          )}

          {/* All-records footer when showing full dataset */}
          {showAll && (
            <tr>
              <td
                colSpan={HEADERS.length + 1}
                className="border border-gray-300 px-3 py-1.5 text-center text-[11px] text-gray-400 bg-gray-50"
              >
                {rows.length} records total
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdHocPreparationTable;
