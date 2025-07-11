import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import PokemonTable from '../components/PokemonTable';
import EvolutionTriggersTable from '../components/EvolutionTriggersTable';
import Modal from '../components/Modal';
import { motion, AnimatePresence } from 'framer-motion';

// Server-side fetching of both Pokémon and Evolution Trigger data
export async function getServerSideProps(context) {
  const offset = parseInt(context.query.offset) || 0; // Pokémon list offset
  const evOffset = parseInt(context.query.evOffset) || 0; // Evolution Triggers offset
  const limit = 20; // Page size for pagination
  const search = context.query.search?.toLowerCase() || null; // Search query

  let pokemons = [];
  let totalCount = 0;
  let evoTriggers = [];
  let evoTotalCount = 0;

  // Evolution triggers fetch
  const evoRes = await fetch(
    `https://pokeapi.co/api/v2/evolution-trigger/?limit=${limit}&offset=${evOffset}`
  );
  const evoData = await evoRes.json();
  evoTriggers = evoData?.results || [];
  evoTotalCount = evoData?.count || 0;

  // If search query, fetch Pokémon based on search
  if (search) {
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${search}`);
      if (!res.ok) throw new Error('Not Found');
      const data = await res.json();

      // Mapping the searched Pokémon into expected format
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
      // Returning empty state for invalid search
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
    // Default: Fetch paginated list of Pokémon
    const res = await fetch(
      `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`
    );
    const data = await res.json();

    // Fetch detail info for each Pokémon
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
  const [selectedPokemon, setSelectedPokemon] = useState(null); // For modal, pokemon details
  const [loading, setLoading] = useState(false); // For loading spinner
  const [searchInput, setSearchInput] = useState(search || ''); // Controlled search input
  const [activeTab, setActiveTab] = useState('pokemon'); // For tab view
  const router = useRouter();

  // Global route change loading spinner handler
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

  // Handle search submit
  const handleSearch = (e) => {
    e.preventDefault();
    const name = searchInput.trim().toLowerCase();

    if (!name) return;
    if (name) {
      router.push(`/?search=${name}`);
    } else {
      router.push('/');
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 text-gray-800 relative">
      <Head>
        <title>Pokémon Table App</title>
      </Head>

      {/* Full screen loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-white bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="w-12 h-12 border-4 border-indigo-300 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <h1 className="text-3xl font-bold text-center text-indigo-600 mb-8">
        Pokémon Dashboard
      </h1>

      {/* Tabs for navigation */}
      <div className="max-w-5xl mx-auto">
        <div className="flex mb-6 bg-white shadow rounded-t-lg overflow-hidden">
          <button
            onClick={() => setActiveTab('pokemon')}
            className={`w-1/2 py-3 text-center font-medium transition-all duration-300 ${
              activeTab === 'pokemon'
                ? 'bg-white text-indigo-600 border-b-2 border-indigo-600'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Pokémon List
          </button>
          <button
            onClick={() => setActiveTab('evolution')}
            className={`w-1/2 py-3 text-center font-medium transition-all duration-300 ${
              activeTab === 'evolution'
                ? 'bg-white text-indigo-600 border-b-2 border-indigo-600'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Evolution Triggers
          </button>
        </div>

        {/* Tab View with Animation */}
        <AnimatePresence mode="wait">
          {activeTab === 'pokemon' && (
            <motion.div
              key="pokemon"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Search Form */}
              <form onSubmit={handleSearch} className="mb-6 flex gap-3">
                <input
                  name="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search exact Pokémon name"
                  className="w-full border px-4 py-2 rounded shadow-sm focus:outline-none focus:ring focus:ring-indigo-300"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                >
                  Search
                </button>
                {/* Reset button clears search input and route */}
                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput('');
                      router.push('/');
                    }}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                  >
                    Reset
                  </button>
                )}
              </form>

              {/* Pokémon Table Section */}
              <PokemonTable
                pokemons={pokemons}
                totalCount={totalCount}
                offset={offset}
                limit={limit}
                search={search}
                evOffset={evOffset}
                setSelectedPokemon={setSelectedPokemon}
              />

              {/* Detail Modal on Pokémon click */}
              <Modal
                selectedPokemon={selectedPokemon}
                onClose={() => setSelectedPokemon(null)}
              />
            </motion.div>
          )}

          {activeTab === 'evolution' && (
            <motion.div
              key="evolution"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Evolution Triggers Table Section */}
              <EvolutionTriggersTable
                evoTriggers={evoTriggers}
                evOffset={evOffset}
                limit={limit}
                evoTotalCount={evoTotalCount}
                offset={offset}
                search={search}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
