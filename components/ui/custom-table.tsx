"use client"

import type {
  Cell,
  Column,
  ColumnDef,
  Header,
  HeaderGroup,
  Row,
  SortingState,
  Table,
} from "@tanstack/react-table"
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { atom, useAtom } from "jotai"
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon } from "lucide-react"
import type { HTMLAttributes, ReactNode } from "react"
import { createContext, memo, useCallback, useContext, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  TableBody as TableBodyRaw,
  TableCell as TableCellRaw,
  TableHeader as TableHeaderRaw,
  TableHead as TableHeadRaw,
  Table as TableRaw,
  TableRow as TableRowRaw,
} from "@/components/ui/table-primitive"
import { cn } from "@/lib/utils"

export type { ColumnDef } from "@tanstack/react-table"

const sortingAtom = atom<SortingState>([])

export const TableContext = createContext<{
  data: unknown[]
  columns: ColumnDef<unknown, unknown>[]
  table: Table<unknown> | null
}>({
  data: [],
  columns: [],
  table: null,
})

export interface TableProviderProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  children: ReactNode
  className?: string
  rowSelection?: Record<string, boolean>
  onRowSelectionChange?: (updater: any) => void
  renderTop?: ReactNode
  renderBottom?: ReactNode
}

export function TableProvider<TData, TValue>({
  columns,
  data,
  children,
  className,
  rowSelection,
  onRowSelectionChange,
  renderTop,
  renderBottom,
}: TableProviderProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: onRowSelectionChange,
    onPaginationChange: setPagination,
    state: {
      sorting,
      pagination,
      ...(rowSelection !== undefined ? { rowSelection } : {}),
    },
  })

  return (
    <TableContext.Provider
      value={{
        data,
        columns: columns as never,
        table: table as never,
      }}
    >
      {renderTop}
      <TableRaw className={className}>{children}</TableRaw>
      {renderBottom}
    </TableContext.Provider>
  )
}

export interface TableHeadProps {
  header: Header<unknown, unknown>
  className?: string
}

export const TableHead = memo(({ header, className }: TableHeadProps) => (
  <TableHeadRaw className={className} key={header.id}>
    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
  </TableHeadRaw>
))

TableHead.displayName = "TableHead"

export interface TableHeaderGroupProps {
  headerGroup: HeaderGroup<unknown>
  children: (props: { header: Header<unknown, unknown> }) => ReactNode
}

export const TableHeaderGroup = ({ headerGroup, children }: TableHeaderGroupProps) => (
  <TableRowRaw key={headerGroup.id}>
    {headerGroup.headers.map(header => children({ header }))}
  </TableRowRaw>
)

export interface TableHeaderProps {
  className?: string
  children: (props: { headerGroup: HeaderGroup<unknown> }) => ReactNode
}

export const TableHeader = ({ className, children }: TableHeaderProps) => {
  const { table } = useContext(TableContext)

  return (
    <TableHeaderRaw className={className}>
      {table?.getHeaderGroups().map(headerGroup => children({ headerGroup }))}
    </TableHeaderRaw>
  )
}

export interface TableColumnHeaderProps<TData, TValue> extends HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>
  title: string
}

export function TableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: TableColumnHeaderProps<TData, TValue>) {
  // Extract inline event handlers to prevent unnecessary re-renders
  const handleSortAsc = useCallback(() => {
    column.toggleSorting(false)
  }, [column])

  const handleSortDesc = useCallback(() => {
    column.toggleSorting(true)
  }, [column])

  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button className="-ml-3 h-8 data-[state=open]:bg-zinc-100 text-zinc-600 hover:text-[#ff6a1a] hover:bg-zinc-50 font-bold text-xs" size="sm" variant="ghost" />}>
          <span>{title}</span>
          {column.getIsSorted() === "desc" ? (
            <ArrowDownIcon className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "asc" ? (
            <ArrowUpIcon className="ml-2 h-4 w-4" />
          ) : (
            <ChevronsUpDownIcon className="ml-2 h-4 w-4" />
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={handleSortAsc}>
            <ArrowUpIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Asc
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSortDesc}>
            <ArrowDownIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Desc
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export interface TableCellProps {
  cell: Cell<unknown, unknown>
  className?: string
}

export const TableCell = ({ cell, className }: TableCellProps) => (
  <TableCellRaw className={className}>
    {flexRender(cell.column.columnDef.cell, cell.getContext())}
  </TableCellRaw>
)

export interface TableRowProps {
  row: Row<unknown>
  children: (props: { cell: Cell<unknown, unknown> }) => ReactNode
  className?: string
}

export const TableRow = ({ row, children, className }: TableRowProps) => (
  <TableRowRaw className={className} data-state={row.getIsSelected() && "selected"} key={row.id}>
    {row.getVisibleCells().map(cell => children({ cell }))}
  </TableRowRaw>
)

export interface TableBodyProps {
  children: (props: { row: Row<unknown> }) => ReactNode
  className?: string
}

export const TableBody = ({ children, className }: TableBodyProps) => {
  const { columns, table } = useContext(TableContext)
  const rows = table?.getRowModel().rows

  return (
    <TableBodyRaw className={className}>
      {rows?.length ? (
        rows.map(row => children({ row }))
      ) : (
        <TableRowRaw>
          <TableCellRaw className="h-24 text-center" colSpan={columns.length}>
            No results.
          </TableCellRaw>
        </TableRowRaw>
      )}
    </TableBodyRaw>
  )
}

export const TablePageSizeSelector = ({ className }: { className?: string }) => {
  const { table } = useContext(TableContext)
  if (!table) return null

  return (
    <div className={cn("flex items-center gap-2 px-2 py-2 mb-2", className)}>
      <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Afficher</span>
      <select
        value={table.getState().pagination.pageSize}
        onChange={e => {
          table.setPageSize(Number(e.target.value))
        }}
        className="bg-transparent border-none text-[#ff6a1a] text-xs font-bold px-1 py-1 outline-none cursor-pointer"
      >
        {[10, 20, 30, 50].map(pageSize => (
          <option key={pageSize} value={pageSize}>
            {pageSize}
          </option>
        ))}
      </select>
      <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">lignes</span>
      
      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="h-8 text-xs font-bold uppercase tracking-widest hover:bg-transparent hover:text-[#ff6a1a]"
        >
          Précédent
        </Button>
        <span className="text-xs font-medium text-zinc-500">
          Page {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="h-8 text-xs font-bold uppercase tracking-widest hover:bg-transparent hover:text-[#ff6a1a]"
        >
          Suivant
        </Button>
      </div>
    </div>
  )
}
