import Link from 'next/link';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { useMemo } from 'react';

export default function PokemonTable({
  pokemons, // Array of Pokémon data
  totalCount, // Total number of Pokémon from the API
  offset, // Current pagination offset
  limit, // Pagination limit per page
  search, // Current search term (if any)
  evOffset, // Evolution trigger offset (used to preserve URL state)
  setSelectedPokemon, // Function to set a Pokémon when row is clicked (for modal)
}) {
  const columnHelper = createColumnHelper();

  // Define table columns with accessor and custom cell rendering
  const columns = useMemo(
    () => [
      columnHelper.accessor('image', {
        header: 'Image',
        cell: (info) => (
          <img
            src={info.getValue()}
            alt="pokemon"
            className="w-10 h-10 rounded-full border"
          />
        ),
      }),
      columnHelper.accessor('name', {
        header: 'Name',
        cell: (info) =>
          info.getValue().charAt(0).toUpperCase() + info.getValue().slice(1),
      }),
      columnHelper.accessor('height', {
        header: 'Height',
        cell: (info) => `${info.getValue()}`,
      }),
      columnHelper.accessor('weight', {
        header: 'Weight',
        cell: (info) => `${info.getValue()}`,
      }),
    ],
    []
  );

  // Initialize table instance with TanStack Table
  const table = useReactTable({
    data: pokemons,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Calculate pagination states
  const hasPrev = offset > 0;
  const hasNext = offset + limit < totalCount;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="overflow-x-auto shadow rounded-lg">
        <table className="min-w-full table-auto border border-gray-300 rounded">
          <thead className="bg-indigo-100 text-indigo-700">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 border text-left text-sm font-medium"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => setSelectedPokemon(row.original)}
                  className="hover:bg-indigo-50 transition cursor-pointer text-sm h-10"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-2 border">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-4 text-gray-500"
                >
                  No Pokémon found with that name.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Buttons - only visible when not searching */}
      {!search && (
        <div className="flex justify-between mt-4">
          {hasPrev ? (
            <Link
              href={`/?offset=${offset - limit}&evOffset=${evOffset}`}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Previous
            </Link>
          ) : (
            <div />
          )}

          {hasNext && (
            <Link
              href={`/?offset=${offset + limit}&evOffset=${evOffset}`}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
