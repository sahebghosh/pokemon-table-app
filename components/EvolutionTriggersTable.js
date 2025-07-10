import Link from 'next/link';

export default function EvolutionTriggersTable({
  evoTriggers,
  evOffset,
  limit,
  evoTotalCount,
  offset,
  search,
}) {
  const hasPrev = evOffset > 0;
  const hasNext = evOffset + limit < evoTotalCount;

  return (
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
              <tr key={index} className="text-sm h-14 hover:bg-indigo-50">
                <td className="px-6 py-2 border capitalize">
                  {item.name?.replace(/-/g, ' ')}
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
        {hasPrev ? (
          <Link
            href={`/?offset=${offset}&evOffset=${evOffset - limit}${
              search ? `&search=${search}` : ''
            }`}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Prev Page
          </Link>
        ) : (
          <div />
        )}

        {hasNext && (
          <Link
            href={`/?offset=${offset}&evOffset=${evOffset + limit}${
              search ? `&search=${search}` : ''
            }`}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Next Page
          </Link>
        )}
      </div>
    </section>
  );
}
