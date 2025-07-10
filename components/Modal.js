export default function Modal({ selectedPokemon, onClose }) {
  if (!selectedPokemon) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 transition">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full relative animate-fadeIn">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
          onClick={onClose}
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
  );
}
