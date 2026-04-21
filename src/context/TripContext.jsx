import { createContext, useContext, useState, useCallback } from "react";

const TripContext = createContext();

export function useTrip() {
  return useContext(TripContext);
}

export function TripProvider({ children }) {
  const [currentTrip, setCurrentTrip] = useState(null);

  const selectTrip = useCallback((trip) => {
    setCurrentTrip(trip);
  }, []);

  const clearTrip = useCallback(() => {
    setCurrentTrip(null);
  }, []);

  const value = {
    currentTrip,
    selectTrip,
    clearTrip
  };

  return (
    <TripContext.Provider value={value}>
      {children}
    </TripContext.Provider>
  );
}
