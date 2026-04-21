// Pre-defined destination suggestions for Smart Trip Generation in INR (₹)
export const destinationData = {
  paris: {
    dailyBudget: 12000,
    flightCost: 55000,
    hotelRate: 15000,
    activities: [
      "Eiffel Tower Tour",
      "Louvre Museum",
      "Seine River Cruise",
      "Montmartre Walking Tour",
      "Notre-Dame Cathedral Visit",
      "Champs-Élysées Shopping"
    ]
  },
  tokyo: {
    dailyBudget: 10000,
    flightCost: 45000,
    hotelRate: 12000,
    activities: [
      "Senso-ji Temple Visit",
      "Shibuya Crossing & Hachiko",
      "Tsukiji Outer Market Tasting",
      "Meiji Shrine Walk",
      "Akihabara Electronics District",
      "Tokyo Skytree View"
    ]
  },
  "new york": {
    dailyBudget: 15000,
    flightCost: 80000,
    hotelRate: 20000,
    activities: [
      "Central Park Walk",
      "Statue of Liberty Tour",
      "Times Square at Night",
      "Empire State Building View",
      "Broadway Show",
      "Brooklyn Bridge Walk"
    ]
  },
  bali: {
    dailyBudget: 4000,
    flightCost: 35000,
    hotelRate: 6000,
    activities: [
      "Ubud Monkey Forest",
      "Tegallalang Rice Terrace",
      "Uluwatu Temple Sunset",
      "Seminyak Beach Day",
      "Mount Batur Sunrise Trek",
      "Traditional Balinese Spa"
    ]
  },
  london: {
    dailyBudget: 13000,
    flightCost: 60000,
    hotelRate: 16000,
    activities: [
      "Tower of London",
      "British Museum",
      "London Eye Ride",
      "Buckingham Palace Changing of the Guard",
      "Westminster Abbey",
      "Borough Market Food Tour"
    ]
  },
  dubai: {
    dailyBudget: 15000,
    flightCost: 25000,
    hotelRate: 18000,
    activities: [
      "Burj Khalifa View",
      "Dubai Mall Shopping",
      "Desert Safari",
      "Dubai Fountain Show",
      "Palm Jumeirah Tour",
      "Dubai Marina Walk"
    ]
  }
};

const genericFallback = {
  dailyBudget: 8000,
  flightCost: 40000,
  hotelRate: 10000,
  activities: [
    "City Center Sightseeing",
    "Local Cuisine Tasting",
    "Historical Museum Visit",
    "Cultural Center Tour",
    "Shopping District Exploration",
    "Sunset Point View"
  ]
};

export const getTripSuggestions = (destinationName, durationDays) => {
  const query = destinationName.toLowerCase().trim();
  let data = genericFallback;

  // Find exact match or partial match
  for (const [key, value] of Object.entries(destinationData)) {
    if (query.includes(key)) {
      data = value;
      break;
    }
  }

  // Calculate budget
  const budget = [
    { description: "Roundtrip Flights", amount: data.flightCost },
    { description: `Hotel (${durationDays} nights)`, amount: data.hotelRate * durationDays },
    { description: "Estimated Daily Expenses (Food, Transport)", amount: data.dailyBudget * durationDays }
  ];

  // Generate itinerary (1-2 activities per day)
  const itinerary = [];
  let activityIndex = 0;
  
  for (let i = 0; i < durationDays; i++) {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + i);
    
    // Add 1 or 2 activities per day depending on how many are available
    if (activityIndex < data.activities.length) {
      itinerary.push({
        activity: data.activities[activityIndex],
        dayOffset: i // We will calculate exact date when saving
      });
      activityIndex++;
    }
    if (activityIndex < data.activities.length && i % 2 === 0) { // Add a second activity every other day
      itinerary.push({
        activity: data.activities[activityIndex],
        dayOffset: i
      });
      activityIndex++;
    }
  }

  return { budget, itinerary };
};
