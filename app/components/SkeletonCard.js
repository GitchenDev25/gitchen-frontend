export default function SkeletonCard() {
  return (
    <div className="bg-white shadow-lg rounded-lg animate-pulse">
      <div className="bg-gray-300 h-48 w-full"></div>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-8 bg-gray-300 rounded w-1/2 mt-4"></div>
      </div>
    </div>
  );
}
