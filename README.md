# 🚀 Smart Travel Planner

**End-Term Project Submission**  
Course: *Building Web Applications with React*  
Batch: **2029**

---

## 🎯 Problem Statement
Travel planning is often fragmented. Travelers use spreadsheets for budgets, notes apps for daily itineraries, and email folders for booking documents. **Smart Travel Planner** solves this genuine, real-world problem by providing a unified, centralized dashboard. 

**Who is the user?** Frequent travelers, vacationers, and digital nomads.  
**What problem are we solving?** Eliminating the chaos of scattered travel details.  
**Why does it matter?** It reduces stress, prevents overspending, and ensures important documents are always one click away during a trip.

---

## ✨ Features
- **Firebase Authentication**: Secure login and signup with persistent sessions.
- **Dynamic Dashboard**: View all your trips at a glance, categorized by travel dates with dynamic destination imagery and status badges (Upcoming, Ongoing, Completed).
- **Interactive Trip Details**:
  - 📝 **Itinerary Planner**: Day-by-day activity tracking.
  - 💰 **Budget Tracker**: Track expenses with real-time total calculations.
  - 📂 **Document Manager**: Keep important links (flight tickets, hotel bookings) in one place.
- **Real-time Database**: Full CRUD capabilities synced instantly with Firestore.

---

## 🛠️ Tech Stack
- **Frontend**: React 18 (Functional Components, Hooks)
- **Build Tool**: Vite (Lightning fast HMR and builds)
- **Styling**: Tailwind CSS v4 (Glassmorphism, Mobile-first responsive design)
- **Routing**: React Router v6 (Protected Routes, Lazy Loading)
- **State Management**: React Context API (`AuthContext`, `TripContext`)
- **Backend**: Firebase (Auth + Firestore)
- **Icons & UI Extras**: Lucide React, React Hot Toast

---

## 🏗️ Architecture & React Concepts Demonstrated
This project was built to meet the **100/100 Evaluation Rubric**:

1. **React Fundamentals**: Proper prop drilling, component composition, `useState`, `useEffect`.
2. **Intermediate Concepts**: Custom Hooks (`useTripStatus`), `AuthContext` for global state, Controlled form components, React Router.
3. **Advanced React Usage**:
   - `useMemo`: Used dynamically to calculate budget totals without unnecessary re-renders.
   - `useCallback`: Memoized database fetch and delete functions passed as props.
   - `useRef`: Implemented for auto-focusing inputs on mount.
   - `React.lazy` & `<Suspense>`: Route-level code splitting for enhanced performance.
4. **Clean Code Quality**: Proper separation into `components`, `pages`, `context`, `services`, and `hooks` folders.

---

## ⚙️ Setup Instructions

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd End_Term_Project_Final
```

### 2. Install dependencies
```bash
npm install
```

### 3. Firebase Configuration
Create a `.env.local` file in the root directory and add your Firebase credentials:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

> **Note:** Make sure you have created a Firestore Database in your Firebase Console and enabled the "Email/Password" sign-in provider in Firebase Authentication.

### 4. Run the development server
```bash
npm run dev
```

### 5. Build for production
```bash
npm run build
```
*(A `vercel.json` file is included to ensure proper React Router routing upon deployment).*
