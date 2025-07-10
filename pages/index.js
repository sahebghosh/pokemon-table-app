import { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import Link from 'next/link';
import { useRouter } from 'next/router';

export async function getServerSideProps(context) {
  const offset = parseInt(context.query.offset) || 0;
  const evOffset = parseInt(context.query.evOffset) || 0;
  const limit = 5;
  const search = context.query.search?.toLowerCase() || null;

  let pokemons = [];
  let totalCount = 0;
  let evoTriggers = [];
  let evoTotalCount = 0;

  // Always fetch evolution triggers first
  const evoRes = await fetch(
    `https://pokeapi.co/api/v2/evolution-trigger/?limit=${limit}&offset=${evOffset}`
  );
  const evoData = await evoRes.json();
  evoTriggers = evoData.results;
  evoTotalCount = evoData.count;

  if (search) {
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${search}`);
      if (!res.ok) throw new Error('Not Found');
      const data = await res.json();

      pokemons = [
        {
          name: data.name,
          height: data.height,
          weight: data.weight,
          image: data.sprites.front_default,
          base_experience: data.base_experience,
        },
      ];
      totalCount = 1;
    } catch (err) {
      return {
        props: {
          notFound: true,
          pokemons: [],
          totalCount: 0,
          offset,
          limit,
          evOffset,
          evoTriggers,
          evoTotalCount,
          search,
        },
      };
    }
  } else {
    const res = await fetch(
      `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`
    );
    const data = await res.json();

    pokemons = await Promise.all(
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
    totalCount = data.count;
  }

  return {
    props: {
      pokemons,
      totalCount,
      offset,
      limit,
      evOffset,
      evoTriggers,
      evoTotalCount,
      notFound: false,
      search,
    },
  };
}

export default function Home({
  pokemons,
  totalCount,
  offset,
  limit,
  evOffset,
  evoTriggers,
  evoTotalCount,
  notFound,
  search,
}) {
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const columnHelper = createColumnHelper();
  const router = useRouter();

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

  const handleSearch = (e) => {
    e.preventDefault();
    const name = e.target.search.value.trim().toLowerCase();
    if (name) {
      router.push(`/?search=${name}`);
    } else {
      router.push('/');
    }
  };

  return (
    <main className="min-h-screen bg-white py-10 px-4">
      <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
        Pokémon List
      </h1>

      <form
        onSubmit={handleSearch}
        className="max-w-md mx-auto mb-6 flex gap-2"
      >
        <input
          name="search"
          defaultValue={search || ''}
          placeholder="Search by exact Pokémon name"
          className="w-full border px-4 py-2 rounded shadow"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Search
        </button>
        {search && (
          <button
            type="button"
            onClick={() => router.push('/')}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
          >
            Reset
          </button>
        )}
      </form>

      {notFound && (
        <p className="text-red-500 text-center font-semibold mb-6">
          Pokémon not found. Please try another name.
        </p>
      )}

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

        {!search && (
          <div className="flex justify-between mt-6">
            {hasPrev ? (
              <Link
                href={`/?offset=${offset - limit}&evOffset=${evOffset}${
                  search ? `&search=${search}` : ''
                }`}
              >
                <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  Previous
                </button>
              </Link>
            ) : (
              <div />
            )}

            {hasNext && (
              <Link
                href={`/?offset=${offset + limit}&evOffset=${evOffset}${
                  search ? `&search=${search}` : ''
                }`}
              >
                <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  Next
                </button>
              </Link>
            )}
          </div>
        )}
      </div>

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

      {/* Evolution Trigger Table */}
      <section className="mt-12 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-blue-500 mb-4">
          Evolution Triggers
        </h2>
        <table className="table-auto w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">URL</th>
            </tr>
          </thead>
          <tbody>
            {evoTriggers.map((item, index) => (
              <tr key={index}>
                <td className="px-4 py-2 border capitalize">
                  {item.name.replace(/-/g, ' ')}
                </td>
                <td className="px-4 py-2 border text-blue-600 underline break-all">
                  {item.url}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-between mt-4">
          {evOffset > 0 ? (
            <Link
              href={`/?offset=${offset}&evOffset=${evOffset - limit}${
                search ? `&search=${search}` : ''
              }`}
            >
              <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Prev Page
              </button>
            </Link>
          ) : (
            <div />
          )}

          {evOffset + limit < evoTotalCount ? (
            <Link
              href={`/?offset=${offset}&evOffset=${evOffset + limit}${
                search ? `&search=${search}` : ''
              }`}
            >
              <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Next Page
              </button>
            </Link>
          ) : null}
        </div>
      </section>
    </main>
  );
}
