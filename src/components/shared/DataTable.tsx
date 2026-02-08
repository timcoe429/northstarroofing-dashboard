'use client';

import React, { useState, useMemo } from 'react';
import { TABLE_STYLES, COLORS, TYPOGRAPHY, SPACING, CARD_STYLES } from '@/styles/constants';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: any) => React.ReactNode;
}

export interface TableRow {
  [key: string]: any;
}

interface DataTableProps {
  title: string;
  columns: TableColumn[];
  data: TableRow[];
  sortable?: boolean;
  filterable?: boolean;
  showViewAll?: boolean;
  onViewAll?: () => void;
  totalsRow?: TableRow;
  emptyMessage?: string;
  maxHeight?: string;
  initialSortColumn?: string;
  initialSortDirection?: 'asc' | 'desc';
}

type SortDirection = 'asc' | 'desc';

export const DataTable: React.FC<DataTableProps> = ({
  title,
  columns,
  data,
  sortable = false,
  filterable = false,
  showViewAll = false,
  onViewAll,
  totalsRow,
  emptyMessage = 'No data available',
  maxHeight,
  initialSortColumn,
  initialSortDirection = 'asc'
}) => {
  const [sortColumn, setSortColumn] = useState<string | null>(initialSortColumn || null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(initialSortDirection);

  // Handle column header click for sorting
  const handleSort = (columnKey: string) => {
    if (!sortable) return;
    
    const column = columns.find(col => col.key === columnKey);
    if (!column?.sortable) return;

    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  // Apply sorting
  const sortedData = useMemo(() => {
    if (!sortColumn || !sortable) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.toLowerCase().localeCompare(bValue.toLowerCase());
        return sortDirection === 'asc' ? comparison : -comparison;
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        const comparison = aValue - bValue;
        return sortDirection === 'asc' ? comparison : -comparison;
      }

      // Fallback to string comparison
      const comparison = String(aValue).localeCompare(String(bValue));
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortColumn, sortDirection, sortable]);

  return (
    <div style={TABLE_STYLES.container}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: SPACING[3] 
      }}>
        <h3 style={{
          fontSize: TYPOGRAPHY.fontSize.base,
          fontWeight: TYPOGRAPHY.fontWeight.semibold,
          color: COLORS.navy,
          margin: 0,
          textTransform: 'uppercase',
          letterSpacing: TYPOGRAPHY.letterSpacing.widest
        }}>
          {title}
        </h3>
        
        {showViewAll && (
          <button 
            onClick={onViewAll}
            style={{
              background: 'none',
              border: `1px solid ${COLORS.gray200}`,
              borderRadius: SPACING[1],
              padding: `${SPACING[1]} ${SPACING[2]}`,
              fontSize: TYPOGRAPHY.fontSize.xs,
              color: COLORS.gray500,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = COLORS.gray400;
              e.currentTarget.style.color = COLORS.gray700;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = COLORS.gray200;
              e.currentTarget.style.color = COLORS.gray500;
            }}
          >
            View All →
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{ 
        overflowX: 'auto',
        maxHeight: maxHeight,
        overflowY: maxHeight ? 'auto' : 'visible'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${COLORS.gray200}` }}>
              {columns.map(column => (
                <th
                  key={column.key}
                  onClick={() => handleSort(column.key)}
                  style={{
                    ...TABLE_STYLES.header,
                    textAlign: column.align || 'left',
                    width: column.width,
                    cursor: (sortable && column.sortable) ? 'pointer' : 'default',
                    userSelect: 'none'
                  }}
                >
                  {column.label}
                  {sortable && column.sortable && sortColumn === column.key && (
                    <span style={{ marginLeft: SPACING[1] }}>
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody>
            {sortedData.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length}
                  style={{
                    ...TABLE_STYLES.row,
                    textAlign: 'center',
                    color: COLORS.gray500,
                    padding: `${SPACING[8]} ${SPACING[4]}`,
                    fontSize: TYPOGRAPHY.fontSize.lg
                  }}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sortedData.map((row, index) => (
                <tr 
                  key={row.id || index}
                  style={{
                    borderBottom: `1px solid ${COLORS.gray100}`,
                    background: index % 2 === 0 ? COLORS.white : COLORS.gray50
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = COLORS.gray100;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = index % 2 === 0 ? COLORS.white : COLORS.gray50;
                  }}
                >
                  {columns.map(column => (
                    <td
                      key={column.key}
                      style={{
                        ...TABLE_STYLES.row,
                        textAlign: column.align || 'left'
                      }}
                    >
                      {column.render 
                        ? column.render(row[column.key], row)
                        : row[column.key]
                      }
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>

          {/* Totals Row */}
          {totalsRow && (
            <tfoot>
              <tr style={TABLE_STYLES.totalRow}>
                {columns.map(column => (
                  <td
                    key={column.key}
                    style={{
                      ...TABLE_STYLES.row,
                      ...TABLE_STYLES.totalRow,
                      textAlign: column.align || 'left'
                    }}
                  >
                    {column.render 
                      ? column.render(totalsRow[column.key], totalsRow)
                      : totalsRow[column.key]
                    }
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};