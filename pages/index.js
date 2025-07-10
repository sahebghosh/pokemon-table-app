import { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import Link from 'next/link';

export async function getServerSideProps(context) {
  const offset = parseInt(context.query.offset) || 0;
  const limit = 20;

  const res = await fetch(
    `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`
  );
  const data = await res.json();

  const pokemonDetails = await Promise.all(
    data.results.map(async (pokemon) => {
      const detailRes = await fetch(pokemon.url);
      const detailData = await detailRes.json();

      return {
        name: detailData.name,
        height: detailData.height,
        weight: detailData.weight,
        image: detailData.sprites.front_default,
        base_experience: detailData.base_experience,
      };
    })
  );

  return {
    props: {
      pokemons: pokemonDetails,
      offset,
      limit,
      totalCount: data.count,
    },
  };
}

export default function Home({ pokemons, offset, limit, totalCount }) {
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const columnHelper = createColumnHelper();

  const columns = useMemo(
    () => [
      columnHelper.accessor('image', {
        header: 'Image',
        cell: (info) => (
          <img src={info.getValue()} alt="pokemon" className="w-12 h-12" />
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

  const table = useReactTable({
    data: pokemons,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const hasPrev = offset > 0;
  const hasNext = offset + limit < totalCount;

  return (
    <main className="min-h-screen bg-white py-10 px-4">
      <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
        Pokémon Table with Pagination
      </h1>

      <div className="overflow-x-auto max-w-4xl mx-auto">
        <table className="table-auto border border-gray-300 w-full">
          <thead className="bg-gray-100">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-2 border border-gray-300 text-left"
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
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => setSelectedPokemon(row.original)}
                className="cursor-pointer hover:bg-gray-100 transition"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-4 py-2 border border-gray-300"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-between mt-6">
          {hasPrev ? (
            <Link href={`/?offset=${offset - limit}`}>
              <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Previous
              </button>
            </Link>
          ) : (
            <div />
          )}

          {hasNext && (
            <Link href={`/?offset=${offset + limit}`}>
              <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Next
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* Modal */}
      {selectedPokemon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setSelectedPokemon(null)}
            >
              ✖
            </button>

            <div className="text-center">
              <img
                src={selectedPokemon.image}
                alt={selectedPokemon.name}
                className="w-24 h-24 mx-auto mb-4"
              />
              <h2 className="text-2xl font-bold mb-2 capitalize">
                {selectedPokemon.name}
              </h2>
              <p>
                <strong>Height:</strong> {selectedPokemon.height}
              </p>
              <p>
                <strong>Weight:</strong> {selectedPokemon.weight}
              </p>
              <p>
                <strong>Base XP:</strong> {selectedPokemon.base_experience}
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
