# YuviMantra AI
### "A Friend Who Listens. An AI That Cares."

YuviMantra AI is an enterprise-quality emotional wellness, productivity, and study companion designed specifically for students. It offers a warm, empathetic, and respectful AI advisor, mood calendar logs, rich journaling with AI sentiment analysis, Pomodoro timers, habit tracking checklists, guided meditation room mixers, and a full administrative dashboard.

---

## Technical Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Framer Motion, Axios, React Hook Form, TanStack React Query, Chart.js.
- **Backend:** Node.js, Express, TypeScript, Mongoose, JWT auth, Helmet, CORS, Express Rate Limit.
- **AI:** Google Gemini API (`@google/generative-ai`) with offline simulated support fallbacks.
- **Database:** MongoDB.

---

## Folder Structure

```
yuvimantra ai/
├── backend/
│   ├── src/
│   │   ├── config/          # Configurations
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # JWT verification, admin validator, rate limiter
│   │   ├── models/          # Mongoose database models
│   │   ├── routes/          # Express route bindings
│   │   ├── utils/           # Gemini API integrations & simulated fallbacks
│   │   └── app.ts           # Server entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/      # Layouts, PomodoroTimer, BreathingTimer
│   │   ├── context/         # AuthContext, ThemeContext
│   │   ├── pages/           # Pages (Dashboard, Chat, Journal, Moods, habits, Profile, Admin)
│   │   ├── services/        # Axios API client wrapper
│   │   ├── App.tsx          # Router layout mounts
│   │   ├── index.css        # Styles & keyframes animations
│   │   └── main.tsx         # Virtual DOM mount
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.ts
│   └── package.json
└── README.md
```

---

## Database Schemas

### 1. User (`User.ts`)
- `name` (String, required): Display name.
- `email` (String, required, unique): Contact address.
- `password` (String): Brypted hash password.
- `role` (String, enum: `user` | `admin`): Security clearance level.
- `isVerified` (Boolean): Activation status.
- `settings` (Object): Custom themes (`dark` default), notification preferences, privacy rules.
- `stats` (Object): XP points, leveling metrics, streak lengths.
- `achievements` (Array): Log of unlocked badges.

### 2. Chat & Message (`Chat.ts` & `Message.ts`)
- `chat`: Link back to Chat session.
- `sender` (enum: `user` | `ai`): Message writer.
- `text` (String): Content string.
- `reactions` (Array): Emoji overlays log.
- `suggestions` (Array): Guided capsules prompts.

### 3. Mood (`Mood.ts`)
- `mood` (String): Mood tag (e.g. Happy, Anxious).
- `value` (Number, 1-5): Numeric emotional rating.
- `emoji` (String): Emoji graphical icon.
- `note` (String): Reflective commentary.
- `tags` (Array): Associated triggers.
- `date` (Date): Check-in timestamp.

### 4. Journal (`Journal.ts`)
- `title` & `content` (String, required): Diary texts.
- `sentiment` (enum: `positive` | `neutral` | `negative`): Analytical sentiment classification.
- `sentimentScore` (Number, -1.0 to 1.0): Exact emotional weight.
- `aiSummary` (String): Summarized 1-sentence prompt.

### 5. Habit (`Habit.ts`)
- `name` & `type` (String): Routine name.
- `streak` & `maxStreak` (Number): Consecutive ticks count.
- `completions` (Array of YYYY-MM-DD): Dates logged.

---

## API Endpoints List

### Authentication & Profiles
- `POST /api/auth/signup` - Register user.
- `POST /api/auth/login` - Login user (returns JWT token + refresh token).
- `POST /api/auth/refresh` - Refresh access token.
- `GET /api/users/profile` - Fetch profile metadata.
- `PUT /api/users/profile` - Update display info & bios.
- `PUT /api/users/settings` - Toggle notifications/themes.

### Wellness & AI Chat
- `GET /api/chats` - List conversation sessions.
- `POST /api/chats` - Create conversation session.
- `POST /api/chats/:chatId/messages` - Send prompt (triggers Gemini response, updates streaks/points).
- `PUT /api/chats/:chatId/pin` - Pin chat to sidebar.
- `PUT /api/chats/messages/:messageId/react` - Add emoji reaction.
- `GET /api/chats/:chatId/export?format=text|json` - Export chat session.

### Trackers & Planners
- `POST /api/moods` - Log mood check-in.
- `GET /api/moods/analytics` - Compile 30-day stats, trends, triggers, and advice.
- `POST /api/journals` - Log diary (triggers sentiment + summaries).
- `PUT /api/habits/:habitId/complete` - Check completed task (recalculates streaks).
- `GET /api/tasks/stats` - Fetch pending count and exam countdowns.

---

## Running Locally

### Prerequisites
- Node.js (v18+)
- MongoDB (running locally on port 27017 or Atlas connection URL)

### 1. Configure environmental parameters
Create `backend/.env` containing:
```
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/yuvimantra
JWT_SECRET=yuvimantra_secret_access_key_987654321
JWT_REFRESH_SECRET=yuvimantra_secret_refresh_key_123456789
GEMINI_API_KEY=your_google_gemini_api_key
```

### 2. Start the Backend
```bash
cd backend
npm install
npm run dev
```

### 3. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Testing Guide

- **Verify AI API Fallbacks:** If `GEMINI_API_KEY` is not provided in `.env`, the backend falls back to rule-based wellness simulations. Try asking about "exams" or "stress" to check simulated responses.
- **Verify Focus Mode:** Go to the Study Planner, click the Pomodoro fullscreen icon, and notice the distraction-free focus blocker overlay.

---

## Future Improvements

1. **Integrated WebRTC Soundscape:** Integrate high-quality streams from YouTube or Spotify API directly in the meditation mixer.
2. **Push Notifications:** Configure standard Service Worker push notification alerts for mobile web.
