export default function LoadingSpinner() {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="w-12 h-12 border-4 border-indigo-300 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
