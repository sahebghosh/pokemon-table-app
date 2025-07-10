import { useMemo, useState, useEffect } from 'react';
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
  const limit = 10;
  const search = context.query.search?.toLowerCase() || null;

  let pokemons = [];
  let totalCount = 0;
  let evoTriggers = [];
  let evoTotalCount = 0;

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
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState(search || '');
  const columnHelper = createColumnHelper();
  const router = useRouter();

  useEffect(() => {
    const handleRouteChangeStart = () => setLoading(true);
    const handleRouteChangeEnd = () => setLoading(false);

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeEnd);
    router.events.on('routeChangeError', handleRouteChangeEnd);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeEnd);
      router.events.off('routeChangeError', handleRouteChangeEnd);
    };
  }, [router]);

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

  const table = useReactTable({
    data: pokemons,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const hasPrev = offset > 0;
  const hasNext = offset + limit < totalCount;

  const handleSearch = (e) => {
    e.preventDefault();
    const name = searchText.trim().toLowerCase();
    if (name) {
      router.push(`/?search=${name}`);
    } else {
      router.push('/');
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 text-gray-800 relative">
      {loading && (
        <div className="fixed inset-0 bg-white bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="w-12 h-12 border-4 border-indigo-300 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <h1 className="text-3xl font-bold text-center text-indigo-600 mb-3">
        Pokémon List
      </h1>

      <form
        onSubmit={handleSearch}
        className="max-w-lg mx-auto mb-6 flex gap-3"
      >
        <input
          name="search"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search exact Pokémon name"
          className="w-full border px-4 py-2 rounded shadow-sm focus:outline-none focus:ring focus:ring-indigo-300"
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Search
        </button>
        {search && (
          <button
            type="button"
            onClick={() => {
              setSearchText('');
              router.push('/');
            }}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
          >
            Reset
          </button>
        )}
      </form>

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

        {!search && (
          <div className="flex justify-between mt-4">
            {hasPrev ? (
              <Link
                href={`/?offset=${offset - limit}&evOffset=${evOffset}${
                  search ? `&search=${search}` : ''
                }`}
              >
                <button className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
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
                <button className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                  Next
                </button>
              </Link>
            )}
          </div>
        )}
      </div>

      {selectedPokemon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 transition">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full relative animate-fadeIn">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
              onClick={() => setSelectedPokemon(null)}
            >
              ×
            </button>
            <div className="text-center">
              <img
                src={selectedPokemon.image}
                alt={selectedPokemon.name}
                className="w-24 h-24 mx-auto mb-4 rounded-full border"
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

      <section className="mt-12 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-indigo-600 mb-4">
          Evolution Triggers
        </h2>
        <div className="overflow-x-auto shadow rounded-lg">
          <table className="min-w-full table-auto border border-gray-300 rounded">
            <thead className="bg-indigo-100 text-indigo-700">
              <tr>
                <th className="px-6 py-3 border text-left text-sm font-medium">
                  Name
                </th>
                <th className="px-6 py-3 border text-left text-sm font-medium">
                  URL
                </th>
              </tr>
            </thead>
            <tbody>
              {evoTriggers.map((item, index) => (
                <tr key={index} className="text-sm h-10 hover:bg-indigo-50">
                  <td className="px-6 py-2 border capitalize">
                    {item.name.replace(/-/g, ' ')}
                  </td>
                  <td className="px-6 py-2 border text-blue-600 underline break-all">
                    {item.url}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between mt-4">
          {evOffset > 0 ? (
            <Link
              href={`/?offset=${offset}&evOffset=${evOffset - limit}${
                search ? `&search=${search}` : ''
              }`}
            >
              <button className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
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
              <button className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                Next Page
              </button>
            </Link>
          ) : null}
        </div>
      </section>
    </main>
  );
}
