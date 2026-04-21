import { Clock, CheckCircle2, PlayCircle } from "lucide-react";
import { useCallback } from "react";

export function useTripStatus() {
  const getTripStatus = useCallback((startDate, endDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (today < start) {
      return { label: "Upcoming", color: "bg-blue-100 text-blue-700", icon: Clock };
    } else if (today >= start && today <= end) {
      return { label: "Ongoing", color: "bg-green-100 text-green-700", icon: PlayCircle };
    } else {
      return { label: "Completed", color: "bg-gray-100 text-gray-700", icon: CheckCircle2 };
    }
  }, []);

  return getTripStatus;
}
