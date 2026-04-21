// Pre-defined destination suggestions for Smart Trip Generation
export const destinationData = {
  paris: {
    dailyBudget: 150,
    flightCost: 600,
    hotelRate: 180,
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
    dailyBudget: 120,
    flightCost: 900,
    hotelRate: 150,
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
    dailyBudget: 180,
    flightCost: 400,
    hotelRate: 250,
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
    dailyBudget: 50,
    flightCost: 800,
    hotelRate: 80,
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
    dailyBudget: 160,
    flightCost: 600,
    hotelRate: 200,
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
    dailyBudget: 200,
    flightCost: 700,
    hotelRate: 220,
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
  dailyBudget: 100,
  flightCost: 500,
  hotelRate: 120,
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
