"use client";

import * as React from "react";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchPlaceholder?: string;
  searchColumn?: string;
  pageSize?: number;
  emptyMessage?: string;
}

// PHARMASOFT — Table générique avec tri colonne, recherche globale et pagination client-side.
// Adaptée des patterns shadcn DataTable + TanStack Table v8.
export function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = "Rechercher…",
  searchColumn,
  pageSize = 10,
  emptyMessage = "Aucune donnée",
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
    globalFilterFn: (row, _columnId, filterValue) => {
      const haystack = (searchColumn ? String(row.getValue(searchColumn)) : Object.values(row.original ?? {}).join(" "))
        .toLowerCase();
      return haystack.includes(String(filterValue).toLowerCase());
    },
  });

  return (
    <div className="space-y-3">
      {/* Barre de recherche */}
      <div className="relative max-w-sm">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder={searchPlaceholder}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b bg-muted/60">
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
                  >
                    {h.isPlaceholder ? null : h.column.getCanSort() ? (
                      <button
                        onClick={h.column.getToggleSortingHandler()}
                        className="inline-flex items-center gap-1 hover:text-foreground"
                      >
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        <ArrowUpDown size={11} className="opacity-50" />
                      </button>
                    ) : (
                      flexRender(h.column.columnDef.header, h.getContext())
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-muted-foreground">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    "border-b transition-colors hover:bg-muted/40",
                    row.getIsSelected() ? "bg-muted" : "",
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3.5 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {table.getPageCount() > 1 ? (
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}{" "}
            <span className="opacity-60">· {table.getFilteredRowModel().rows.length} résultats</span>
          </div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft size={14} /> Préc.
            </Button>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              Suiv. <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
