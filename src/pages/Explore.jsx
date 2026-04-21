import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Compass, ArrowRight } from "lucide-react";

export default function Explore() {
  const [query, setQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Create an array of 6 distinct image sources using the loremflickr lock parameter
  const images = Array.from({ length: 6 }).map((_, i) => ({
    id: i,
    url: `https://loremflickr.com/800/600/${encodeURIComponent(query)},landmark,city?lock=${i + 1}`
  }));

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsLoading(true);
    setHasSearched(false);
    
    // Simulate network delay to allow images to load gracefully
    setTimeout(() => {
      setHasSearched(true);
      setIsLoading(false);
    }, 800);
  };

  const handlePlanTrip = () => {
    navigate("/", { state: { destination: query } });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Search Header */}
      <div className={`transition-all duration-700 ease-in-out flex flex-col items-center ${hasSearched ? 'mt-4 mb-12' : 'mt-32 mb-8'}`}>
        <div className="bg-primary-50 p-4 rounded-3xl mb-6">
          <Compass className="h-12 w-12 text-primary-600" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight text-center mb-4">
          Where to next?
        </h1>
        <p className="text-lg text-gray-500 text-center max-w-2xl mb-8">
          Search for any destination around the globe to discover beautiful inspiration and start planning your perfect itinerary.
        </p>

        <form onSubmit={handleSearch} className="w-full max-w-2xl relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., Tokyo, Japan"
            className="block w-full pl-12 pr-32 py-4 text-lg border-2 border-gray-100 bg-white rounded-full shadow-sm focus:ring-0 focus:border-primary-500 transition-all hover:shadow-md"
          />
          <button
            type="submit"
            className="absolute inset-y-2 right-2 px-6 bg-gray-900 text-white font-medium rounded-full hover:bg-gray-800 transition-colors"
          >
            Explore
          </button>
        </form>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-pulse flex flex-col items-center">
            <Search className="h-8 w-8 text-primary-300 animate-bounce mb-4" />
            <p className="text-gray-500 font-medium">Scouting locations...</p>
          </div>
        </div>
      )}

      {/* Results Grid */}
      {hasSearched && !isLoading && (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 pb-12">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Inspiration for <span className="text-primary-600 capitalize">{query}</span>
            </h2>
            <button
              onClick={handlePlanTrip}
              className="hidden sm:flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl hover:bg-primary-700 transition-all shadow-sm font-medium hover:shadow-md hover:-translate-y-0.5"
            >
              <MapPin className="h-5 w-5" />
              Plan a trip here
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image) => (
              <div 
                key={image.id} 
                className="group relative h-80 rounded-2xl overflow-hidden bg-gray-100 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <img
                  src={image.url}
                  alt={`Scenery of ${query}`}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                  <button 
                    onClick={handlePlanTrip}
                    className="flex items-center gap-2 bg-white/90 backdrop-blur-sm text-gray-900 px-5 py-2.5 rounded-full font-bold hover:bg-white hover:scale-105 transition-all shadow-lg"
                  >
                    Start Planning <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile bottom CTA */}
          <div className="mt-8 sm:hidden">
            <button
              onClick={handlePlanTrip}
              className="w-full flex justify-center items-center gap-2 bg-primary-600 text-white px-5 py-3.5 rounded-xl hover:bg-primary-700 transition-colors shadow-sm font-medium"
            >
              <MapPin className="h-5 w-5" />
              Plan a trip to {query}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
