import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { Plus, MapPin, Calendar, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTripStatus } from "../hooks/useTripStatus";
import { getTripSuggestions } from "../services/suggestions";
import { activeDb } from "../services/firebase";
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import toast from "react-hot-toast";

export default function Dashboard() {
  const location = useLocation();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(!!location.state?.destination);
  const [newDestination, setNewDestination] = useState(location.state?.destination || "");
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { currentUser } = useAuth();
  const getTripStatus = useTripStatus();

  const fetchTrips = useCallback(async () => {
    if (!currentUser || !import.meta.env.VITE_FIREBASE_API_KEY) {
      setLoading(false);
      return;
    }
    try {
      const q = query(
        collection(activeDb, "trips"), 
        where("userId", "==", currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      const fetchedTrips = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTrips(fetchedTrips);
    } catch (error) {
      console.error("Error fetching trips:", error);
      toast.error("Failed to load trips");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const handleAddTrip = async (e) => {
    e.preventDefault();
    if (!newDestination || !newStartDate || !newEndDate) {
      toast.error("Please fill in all fields");
      return;
    }
    if (newStartDate > newEndDate) {
      toast.error("End date cannot be before start date");
      return;
    }

    if (!import.meta.env.VITE_FIREBASE_API_KEY) {
      toast.error("Firebase not configured. Cannot save.");
      return;
    }

    try {
      setSubmitting(true);
      
      const newTrip = {
        userId: currentUser.uid,
        destination: newDestination,
        startDate: newStartDate,
        endDate: newEndDate,
        imageUrl: `https://loremflickr.com/800/600/${encodeURIComponent(newDestination)},landmark,city`,
        createdAt: serverTimestamp()
      };
      
      // Wrapper to timeout if Firestore isn't initialized yet
      const addDocPromise = addDoc(collection(activeDb, "trips"), newTrip);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("FIRESTORE_TIMEOUT")), 5000)
      );

      const docRef = await Promise.race([addDocPromise, timeoutPromise]);
      
      // Auto-generate Smart Itinerary and Budget
      try {
        const start = new Date(newStartDate);
        const end = new Date(newEndDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
        
        const { budget, itinerary } = getTripSuggestions(newDestination, diffDays);

        // Add auto-generated budget items
        for (const item of budget) {
          await addDoc(collection(activeDb, "trips", docRef.id, "expenses"), {
            description: `[AI Est] ${item.description}`,
            amount: item.amount,
            createdAt: serverTimestamp()
          });
        }

        // Add auto-generated itinerary items
        for (const item of itinerary) {
          const actDate = new Date(start);
          actDate.setDate(actDate.getDate() + item.dayOffset);
          await addDoc(collection(activeDb, "trips", docRef.id, "itinerary"), {
            date: actDate.toISOString().split('T')[0],
            activity: `[AI Suggestion] ${item.activity}`,
            createdAt: serverTimestamp()
          });
        }
      } catch (err) {
        console.error("Failed to generate smart suggestions", err);
        // We don't block the UI if suggestions fail
      }

      setTrips([{ id: docRef.id, ...newTrip }, ...trips]);
      setIsModalOpen(false);
      setNewDestination("");
      setNewStartDate("");
      setNewEndDate("");
      toast.success("Trip added successfully!");
    } catch (error) {
      console.error("Error adding trip:", error);
      if (error.message === "FIRESTORE_TIMEOUT") {
        toast.error("Saving timed out. Did you create your Firestore Database in the console?", { duration: 6000 });
      } else {
        toast.error("Failed to add trip");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTrip = useCallback(async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!window.confirm("Are you sure you want to delete this trip?")) return;
    if (!import.meta.env.VITE_FIREBASE_API_KEY) return;

    try {
      await deleteDoc(doc(activeDb, "trips", id));
      setTrips(prev => prev.filter(trip => trip.id !== id));
      toast.success("Trip deleted");
    } catch (error) {
      console.error("Error deleting trip:", error);
      toast.error("Failed to delete trip");
    }
  }, []);



  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Trips</h1>
          <p className="text-gray-600 mt-1">Manage all your upcoming adventures</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Plus className="h-5 w-5" />
          <span>New Trip</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading your trips...</div>
      ) : trips.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
          <MapPin className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No trips planned yet</h3>
          <p className="text-gray-500 mb-6">Create your first trip to start planning your itinerary and budget.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 text-primary-600 font-medium hover:text-primary-700"
          >
            <Plus className="h-4 w-4" /> Add your first trip
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => {
            const status = getTripStatus(trip.startDate, trip.endDate);
            const StatusIcon = status.icon;

            return (
              <Link
                key={trip.id}
                to={`/trip/${trip.id}`}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all group relative flex flex-col"
              >
                {/* Background Image Header */}
                <div className="h-48 relative overflow-hidden bg-gray-200">
                  <img 
                    src={trip.imageUrl || `https://loremflickr.com/800/600/${encodeURIComponent(trip.destination)}`} 
                    alt={trip.destination}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  
                  {/* Status Badge */}
                  <div className={`absolute top-4 left-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-sm bg-white/90 shadow-sm ${status.color.replace('bg-', 'text-')}`}>
                    <StatusIcon className="h-3.5 w-3.5" />
                    {status.label}
                  </div>

                  <button 
                    onClick={(e) => handleDeleteTrip(e, trip.id)}
                    className="absolute top-4 right-4 text-white hover:text-red-500 bg-black/20 hover:bg-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
                    aria-label="Delete trip"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                
                {/* Card Content */}
                <div className="p-6 flex-1 bg-white relative z-10 -mt-4 rounded-t-2xl">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {trip.destination}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                    <Calendar className="h-4 w-4 text-primary-500" />
                    <span>
                      {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Add Trip Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Plan a New Trip</h2>
              <form onSubmit={handleAddTrip} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Destination
                  </label>
                  <input
                    type="text"
                    value={newDestination}
                    onChange={(e) => setNewDestination(e.target.value)}
                    placeholder="e.g. Paris, France"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    autoFocus
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={newStartDate}
                      onChange={(e) => setNewStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={newEndDate}
                      onChange={(e) => setNewEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-700"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      if (location.state?.destination) {
                        window.history.replaceState({}, document.title);
                      }
                    }}
                    className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2 px-4 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium disabled:opacity-50"
                  >
                    {submitting ? "Saving..." : "Save Trip"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
