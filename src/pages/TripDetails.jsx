import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, DollarSign, List, FileText, Plus, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { activeDb } from "../services/firebase";
import { doc, getDoc, collection, addDoc, query, onSnapshot, deleteDoc, orderBy } from "firebase/firestore";
import toast from "react-hot-toast";

export default function TripDetails() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("itinerary");
  
  // State for sub-collections
  const [itinerary, setItinerary] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [documents, setDocuments] = useState([]);

  // Form states
  const [newItemName, setNewItemName] = useState("");
  const [newItemAmount, setNewItemAmount] = useState("");
  const [newItemDate, setNewItemDate] = useState("");
  const [newItemLink, setNewItemLink] = useState("");

  useEffect(() => {
    if (!currentUser || !import.meta.env.VITE_FIREBASE_API_KEY) {
      setLoading(false);
      return;
    }

    const fetchTripDetails = async () => {
      try {
        const docRef = doc(activeDb, "trips", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().userId === currentUser.uid) {
          setTrip({ id: docSnap.id, ...docSnap.data() });
        } else {
          toast.error("Trip not found");
        }
      } catch (error) {
        console.error("Error fetching trip:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTripDetails();

    // Set up real-time listeners for subcollections
    const tripRef = doc(activeDb, "trips", id);
    
    const unsubItinerary = onSnapshot(
      query(collection(tripRef, "itinerary"), orderBy("date")),
      (snapshot) => setItinerary(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
    );

    const unsubExpenses = onSnapshot(
      collection(tripRef, "expenses"),
      (snapshot) => setExpenses(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
    );

    const unsubDocs = onSnapshot(
      collection(tripRef, "documents"),
      (snapshot) => setDocuments(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
    );

    return () => {
      unsubItinerary();
      unsubExpenses();
      unsubDocs();
    };
  }, [id, currentUser]);

  // Advanced React Concept: useMemo for calculating total expenses
  const totalExpenses = useMemo(() => {
    return expenses.reduce((total, expense) => total + parseFloat(expense.amount || 0), 0);
  }, [expenses]);

  // Advanced React Concept: useCallback for delete handler passed down
  const handleDeleteItem = useCallback(async (collectionName, itemId) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const itemRef = doc(activeDb, `trips/${id}/${collectionName}`, itemId);
      await deleteDoc(itemRef);
      toast.success("Item deleted");
    } catch (error) {
      toast.error("Failed to delete item");
    }
  }, [id]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!import.meta.env.VITE_FIREBASE_API_KEY) {
      toast.error("Firebase not configured");
      return;
    }

    try {
      const tripRef = doc(activeDb, "trips", id);
      if (activeTab === "itinerary") {
        if (!newItemName || !newItemDate) return toast.error("Fill name and date");
        await addDoc(collection(tripRef, "itinerary"), {
          activity: newItemName,
          date: newItemDate,
          timestamp: new Date().toISOString()
        });
      } else if (activeTab === "budget") {
        if (!newItemName || !newItemAmount) return toast.error("Fill description and amount");
        await addDoc(collection(tripRef, "expenses"), {
          description: newItemName,
          amount: parseFloat(newItemAmount),
          timestamp: new Date().toISOString()
        });
      } else if (activeTab === "documents") {
        if (!newItemName || !newItemLink) return toast.error("Fill name and URL");
        await addDoc(collection(tripRef, "documents"), {
          name: newItemName,
          url: newItemLink,
          timestamp: new Date().toISOString()
        });
      }
      
      // Reset form
      setNewItemName("");
      setNewItemAmount("");
      setNewItemDate("");
      setNewItemLink("");
      toast.success("Added successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to add item");
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (!trip) return <div className="text-center py-12">Trip not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6 group">
        <ArrowLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </Link>

      {/* Header Banner */}
      <div className="relative rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-8 bg-gray-900 h-64">
        <img 
          src={trip.imageUrl || `https://loremflickr.com/1200/400/${encodeURIComponent(trip.destination)},landmark`}
          alt={trip.destination}
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-8 flex items-end gap-4">
          <div className="h-16 w-16 bg-white/10 backdrop-blur-md text-white rounded-2xl flex items-center justify-center border border-white/20 shadow-lg">
            <MapPin className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight">{trip.destination}</h1>
            <div className="flex items-center gap-2 text-gray-300 mt-2 font-medium">
              <Calendar className="h-5 w-5" />
              <span>
                {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-8 bg-gray-200/50 p-1 rounded-xl w-full sm:w-fit">
        {[
          { id: "itinerary", icon: List, label: "Itinerary" },
          { id: "budget", icon: DollarSign, label: "Budget" },
          { id: "documents", icon: FileText, label: "Documents" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${
              activeTab === tab.id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-100/50"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main List */}
        <div className="lg:col-span-2 space-y-4">
          {activeTab === "itinerary" && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Daily Itinerary</h2>
              {itinerary.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No activities planned yet.</p>
              ) : (
                <div className="space-y-4">
                  {itinerary.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-primary-100 bg-gray-50 hover:bg-primary-50/50 transition-colors">
                      <div>
                        <p className="font-semibold text-gray-900">{item.activity}</p>
                        <p className="text-sm text-gray-500">{new Date(item.date).toLocaleDateString()}</p>
                      </div>
                      <button onClick={() => handleDeleteItem("itinerary", item.id)} className="text-gray-400 hover:text-red-500 p-2">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "budget" && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Expenses</h2>
                <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg font-bold">
                  Total: ₹{totalExpenses.toFixed(2)}
                </div>
              </div>
              {expenses.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No expenses tracked yet.</p>
              ) : (
                <div className="space-y-4">
                  {expenses.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-red-100 bg-gray-50 hover:bg-red-50/50 transition-colors">
                      <p className="font-semibold text-gray-900">{expense.description}</p>
                      <div className="flex items-center gap-4">
                        <p className="font-bold text-gray-900">₹{expense.amount}</p>
                        <button onClick={() => handleDeleteItem("expenses", expense.id)} className="text-gray-400 hover:text-red-500 p-2">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "documents" && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Important Documents</h2>
              {documents.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No documents linked yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {documents.map((docItem) => (
                    <div key={docItem.id} className="p-4 rounded-xl border border-gray-100 hover:border-primary-100 bg-gray-50 hover:bg-primary-50/50 transition-colors flex flex-col justify-between h-32 relative group">
                       <button onClick={() => handleDeleteItem("documents", docItem.id)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <div>
                        <FileText className="h-6 w-6 text-primary-500 mb-2" />
                        <p className="font-semibold text-gray-900 truncate pr-6">{docItem.name}</p>
                      </div>
                      <a href={docItem.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary-600 hover:text-primary-700">
                        View Document &rarr;
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Add Form Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary-500" />
              Add {activeTab === "itinerary" ? "Activity" : activeTab === "budget" ? "Expense" : "Document"}
            </h3>
            
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {activeTab === "itinerary" ? "Activity Name" : activeTab === "budget" ? "Description" : "Document Name"}
                </label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              {activeTab === "itinerary" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={newItemDate}
                    onChange={(e) => setNewItemDate(e.target.value)}
                    min={trip.startDate}
                    max={trip.endDate}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
              )}

              {activeTab === "budget" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newItemAmount}
                    onChange={(e) => setNewItemAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
              )}

              {activeTab === "documents" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Link URL</label>
                  <input
                    type="url"
                    value={newItemLink}
                    onChange={(e) => setNewItemLink(e.target.value)}
                    placeholder="https://"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium mt-2"
              >
                Save
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
