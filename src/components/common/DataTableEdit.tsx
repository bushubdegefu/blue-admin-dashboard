import { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DataTableEditableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onEdit?: (rowIndex: number, updatedRow: TData) => void; // Callback for saving edits
  isLoading?: boolean; // Optional loading state
  isEditable?: boolean; // New prop to control edit visibility
}

export function DataTableEdit<TData, TValue>({
  columns,
  data,
  onEdit,
  isEditable = true, // Default to true
}: DataTableEditableProps<TData, TValue>) {
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const [editedRow, setEditedRow] = useState<TData | null>(null);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const startEditing = (rowIndex: number, rowData: TData) => {
    setEditingRowIndex(rowIndex);
    setEditedRow({ ...rowData });
  };

  const cancelEditing = () => {
    setEditingRowIndex(null);
    setEditedRow(null);
  };

  const saveEditing = () => {
    if (editingRowIndex !== null && editedRow && onEdit) {
      onEdit(editingRowIndex, editedRow);
    }
    setEditingRowIndex(null);
    setEditedRow(null);
  };

  const handleInputChange = (key: keyof TData, value: any) => {
    if (editedRow) {
      setEditedRow({ ...editedRow, [key]: value });
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-sm font-medium text-gray-600"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, rowIndex) => (
                <tr
                  key={row.id}
                  className={cn(
                    "border-b hover:bg-gray-50 transition-colors",
                    rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {isEditable && editingRowIndex === rowIndex ? (
                        <Input
                          value={
                            editedRow
                              ? (editedRow[cell.column.id as keyof TData] as string)
                              : ""
                          }
                          onChange={(e) =>
                            handleInputChange(
                              cell.column.id as keyof TData,
                              e.target.value
                            )
                          }
                        />
                      ) : (
                        flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )
                      )}
                    </td>
                  ))}
                  {isEditable && (
                    <td className="px-4 py-3">
                      {editingRowIndex === rowIndex ? (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={saveEditing}>
                            Save
                          </Button>
                          <Button size="sm" variant="ghost" onClick={cancelEditing}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => startEditing(rowIndex, row.original)}
                        >
                          Edit
                        </Button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + (isEditable ? 1 : 0)}
                  className="py-6 text-center text-gray-500"
                >
                  No results found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}