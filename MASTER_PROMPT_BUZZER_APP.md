# 🎯 MASTER PROMPT: Real-Time Buzzer & Score Consolidation System
## College CSE Symposium - Single-Day Event

---

## 📋 PROJECT OVERVIEW

**Purpose**: Build a lightweight, millisecond-accurate buzzer system for a one-day college symposium with multiple game rounds, real-time timestamp queuing, dynamic pass logic, and consolidated scoring.

**Key Constraints**:
- ✅ Single-day event → No complex auth, no enterprise DB
- ✅ Millisecond-level accuracy → Socket.io with server-side timestamps
- ✅ High-contrast UI → Dark mode, projector-friendly
- ✅ Modular code → Easy to add/remove features

---

## 🛠️ TECH STACK

```
Frontend:  React 18 + Vite + TailwindCSS + Socket.io-client
Backend:   Node.js + Express + Socket.io
Database:  In-Memory (with optional SQLite for persistence)
Hosting:   Local network / Cloud (Render/Railway for backend)
```

---

## 🎯 CORE FEATURES BREAKDOWN

### **FEATURE 1: Host/Admin Dashboard & Game Control**

#### Requirements:
- [x] Single password-protected host view (hardcoded PIN: `ADMIN2025`)
- [x] Dynamic team registration UI (add teams before round starts)
- [x] Game controls:
  - **"Enable Buzzer"** → Activates buzzer for current question
  - **"Disable Buzzer"** → Locks buzzer (no new presses accepted)
  - **"Reset Buzzer"** → Clears queue, moves to next question
  - **"Start New Round"** → Begins Round 1, 2, 3, etc.

#### Live Timestamp Leaderboard (Host View):
```
Question 3 - Buzzer Queue:
┌─────┬──────────┬─────────────┬──────────────┐
│ Rank│ Team Name│ Time Diff   │ Status       │
├─────┼──────────┼─────────────┼──────────────┤
│  1  │ Team A   │ 0.000s      │ 🟢 ACTIVE    │
│  2  │ Team C   │ +0.125s     │ ⏸️ Standby   │
│  3  │ Team B   │ +0.450s     │ ⏸️ Standby   │
│  4  │ Team D   │ +1.200s     │ ⏸️ Standby   │
└─────┴──────────┴─────────────┴──────────────┘
```

#### Dynamic Pass Logic Controls:
```javascript
// Host has 3 action buttons for the ACTIVE team:

1. ✅ "Correct Answer"
   → Awards points to Team A
   → Clears buzzer queue
   → Moves to next question

2. ❌ "Wrong Answer - Pass"
   → Team A gets 0 points (disqualified from this question)
   → Team C (Rank 2) automatically becomes ACTIVE
   → Team C's screen turns green
   → Host can now judge Team C's answer

3. ⏭️ "End Question"
   → Nobody gets points
   → Clears queue
   → Moves to next question
```

**Implementation Checklist**:
- [ ] Host login page with PIN validation
- [ ] Team management panel (add/edit/delete teams)
- [ ] Live queue display with millisecond precision
- [ ] Three action buttons (Correct/Pass/End)
- [ ] Socket event: `host-correct-answer` → awards points, resets queue
- [ ] Socket event: `host-pass-answer` → promotes next team in queue
- [ ] Socket event: `host-end-question` → clears queue, no points awarded
- [ ] Real-time UI updates for all connected clients

---

### **FEATURE 2: Real-Time Buzzer System (Timestamp-Based Queue)**

#### Participant Flow:
```
1. Open link → Enter team name → Join room code
2. See giant "BUZZ" button (disabled until host enables)
3. Host enables buzzer → Button turns GREEN
4. Team presses button → Captures timestamp:
   - Client: performance.now() (for UI feedback)
   - Server: Date.now() (authoritative ordering)
5. Server sorts ALL buzzes by server timestamp
6. Server broadcasts updated queue to ALL clients
```

#### UI States (Participant View):

**State 1: Waiting**
```
╔════════════════════════════╗
║   WAITING FOR BUZZER...    ║
║                            ║
║   [BUZZ] (grayed out)      ║
║                            ║
║   Buzzer not yet enabled   ║
╚════════════════════════════╝
```

**State 2: Buzzer Enabled (Not Pressed)**
```
╔════════════════════════════╗
║      BUZZER ACTIVE!        ║
║                            ║
║   ┌──────────────────┐     ║
║   │   🔴 BUZZ! 🔴   │     ║ (GREEN, pulsing)
║   └──────────────────┘     ║
║                            ║
╚════════════════════════════╝
```

**State 3: Rank 1 (Active)**
```
╔════════════════════════════╗
║   🟢 YOU ARE ACTIVE! 🟢   ║
║                            ║
║   Speak now! You buzzed    ║
║   first at 0.000s          ║
║                            ║
║   Waiting for host...      ║
╚════════════════════════════╝
```

**State 4: Rank 2+ (Standby)**
```
╔════════════════════════════╗
║    ⏸️ STANDBY - #2 ⏸️     ║
║                            ║
║   You buzzed at +0.125s    ║
║                            ║
║   Waiting for Team A...    ║
╚════════════════════════════╝
```

**State 5: Promoted to Active (After Pass)**
```
╔════════════════════════════╗
║  🟢 NOW ACTIVE! SPEAK! 🟢  ║
║                            ║
║   Previous team passed     ║
║   Your turn to answer!     ║
║                            ║
╚════════════════════════════╝
```

**Implementation Checklist**:
- [ ] Team join page (team name + room code input)
- [ ] Giant buzzer button (300px+, responsive)
- [ ] Client captures `performance.now()` on click
- [ ] Socket emits: `buzzer-press` with `{teamId, teamName, clientTimestamp}`
- [ ] Server validates: buzzer enabled? already buzzed?
- [ ] Server sorts by `Date.now()` (server timestamp)
- [ ] Server broadcasts: `queue-update` with full sorted queue
- [ ] Client receives rank and updates UI state
- [ ] Auto-update when promoted (Rank 2 → Rank 1)

---

### **FEATURE 3: Round Consolidation & Public Leaderboard**

#### Data Structure:
```javascript
// In-Memory State
{
  rounds: [
    {
      roundId: 1,
      roundName: "Round 1 - Quiz Buzz",
      scores: {
        "team-a": 50,
        "team-b": 30,
        "team-c": 40
      }
    },
    {
      roundId: 2,
      roundName: "Round 2 - Code Sprint",
      scores: {
        "team-a": 70,
        "team-b": 60,
        "team-c": 50
      }
    }
  ],
  teams: {
    "team-a": { id: "team-a", name: "Team A" },
    "team-b": { id: "team-b", name: "Team B" },
    "team-c": { id: "team-c", name: "Team C" }
  }
}
```

#### Public Leaderboard (Projected on Big Screen):
```
╔═══════════════════════════════════════════════╗
║        🏆 CSE SYMPOSIUM LEADERBOARD 🏆        ║
╠═══════════════════════════════════════════════╣
║  Rank │ Team Name  │ R1  │ R2  │ Total       ║
╠═══════╪════════════╪═════╪═════╪═════════════╣
║   🥇  │ Team A     │ 50  │ 70  │ 120         ║
║   🥈  │ Team C     │ 40  │ 50  │  90         ║
║   🥉  │ Team B     │ 30  │ 60  │  90         ║
╚═══════╧════════════╧═════╧═════╧═════════════╝

Last Updated: 14:32:45
```

**Implementation Checklist**:
- [ ] Track scores per round per team
- [ ] Calculate consolidated totals
- [ ] Public `/leaderboard` route (no auth required)
- [ ] Auto-refresh every 5 seconds (or Socket.io live updates)
- [ ] Large fonts (readable from 20+ feet)
- [ ] Dark mode with high contrast colors
- [ ] Medal emojis for top 3
- [ ] Timestamp of last update

---

## 📂 PROJECT STRUCTURE

```
symposium-buzzer/
│
├── backend/
│   ├── package.json
│   ├── server.js                 # Main Express + Socket.io server
│   ├── gameState.js              # In-memory state management
│   ├── socketHandlers.js         # Socket event handlers
│   └── utils/
│       ├── timestampQueue.js     # Buzzer queue sorting logic
│       └── scoring.js            # Point calculation logic
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── index.html
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── socket.js             # Socket.io client setup
│   │   ├── pages/
│   │   │   ├── Home.jsx          # Landing page
│   │   │   ├── HostDashboard.jsx # Admin control panel
│   │   │   ├── TeamBuzzer.jsx    # Participant buzzer UI
│   │   │   └── Leaderboard.jsx   # Public scoreboard
│   │   ├── components/
│   │   │   ├── BuzzerButton.jsx  # Giant buzz button
│   │   │   ├── QueueDisplay.jsx  # Timestamp queue (host view)
│   │   │   ├── TeamCard.jsx      # Team info card
│   │   │   └── ScoreTable.jsx    # Consolidated scores
│   │   └── hooks/
│   │       ├── useSocket.js      # Socket connection hook
│   │       └── useGameState.js   # Game state management
│   │
│   └── public/
│       └── buzzer-sound.mp3      # Optional sound effect
│
└── README.md                      # Setup instructions
```

---

## 🔄 PHASED IMPLEMENTATION PLAN

### **PHASE 1: Setup & Timestamp Sockets** ✅

**Goal**: Get the core buzzer working with accurate timestamp sorting.

#### Backend Tasks:
- [x] Initialize Node.js project with Express + Socket.io
- [x] Set up CORS for frontend connection
- [x] Create in-memory game state object
- [x] Implement Socket events:
  - `connection` → Log new connections
  - `join-team` → Register team with socket ID
  - `buzzer-press` → Capture server timestamp, sort queue
  - `host-enable-buzzer` → Enable buzzer flag
  - `host-disable-buzzer` → Disable buzzer flag
  - `host-reset-buzzer` → Clear queue, next question

#### Frontend Tasks:
- [x] Initialize Vite + React project
- [x] Install Socket.io-client + TailwindCSS
- [x] Create Socket connection utility
- [x] Build Team Join page (name + room code)
- [x] Build Buzzer Button component
- [x] Implement UI states:
  - Waiting (disabled)
  - Active (green, pulsing)
  - Rank 1 (green background, "YOU ARE ACTIVE")
  - Rank 2+ (yellow/orange, "STANDBY #2")

#### Testing Checklist:
- [ ] Open 3 browser tabs as different teams
- [ ] Enable buzzer from host
- [ ] Press buzzers in sequence
- [ ] Verify correct ranking (millisecond precision)
- [ ] Verify UI updates for all teams
- [ ] Check console logs for accurate timestamps

**Deliverables**:
```
✅ backend/server.js (working Socket.io server)
✅ frontend/src/pages/TeamBuzzer.jsx (functional buzzer UI)
✅ Timestamp queue sorting logic
✅ Real-time rank updates
```

---

### **PHASE 2: Host Controls & Pass Logic** 🎯

**Goal**: Build the host dashboard with queue management and pass logic.

#### Backend Tasks:
- [ ] Add Socket events:
  - `host-correct-answer` → Award points to active team, reset queue
  - `host-pass-answer` → Remove active team, promote Rank 2 to Rank 1
  - `host-end-question` → Clear queue, no points
- [ ] Implement pass logic:
  ```javascript
  function promoteNextTeam() {
    gameState.buzzerQueue.shift(); // Remove rank 1
    if (gameState.buzzerQueue.length > 0) {
      gameState.activeTeam = gameState.buzzerQueue[0];
      // Broadcast: "queue-update" with new active team
    } else {
      gameState.activeTeam = null;
      // All teams eliminated, end question
    }
  }
  ```
- [ ] Broadcast state changes to all clients

#### Frontend Tasks:
- [ ] Create `HostDashboard.jsx` page
- [ ] Add PIN authentication (hardcoded: `ADMIN2025`)
- [ ] Build queue display table:
  - Rank, Team Name, Time Diff, Status
- [ ] Add action buttons:
  - ✅ Correct Answer (green button)
  - ❌ Wrong - Pass (red button)
  - ⏭️ End Question (gray button)
- [ ] Add game control buttons:
  - Enable Buzzer
  - Disable Buzzer
  - Reset Buzzer
- [ ] Real-time queue updates

#### Testing Checklist:
- [ ] Host logs in with PIN
- [ ] Enable buzzer, teams buzz in
- [ ] Verify queue shows correct time differences
- [ ] Click "Pass" → Rank 2 becomes Rank 1
- [ ] Verify Team 2's UI turns green
- [ ] Click "Correct" → Points awarded, queue clears
- [ ] Click "End Question" → No points, queue clears

**Deliverables**:
```
✅ frontend/src/pages/HostDashboard.jsx
✅ Pass logic (queue promotion)
✅ Host action buttons
✅ Real-time queue display
```

---

### **PHASE 3: Team Management & Scoring** 📊

**Goal**: Add team registration, point tracking, and round management.

#### Backend Tasks:
- [ ] Expand game state:
  ```javascript
  {
    teams: {
      "team-1": { id: "team-1", name: "Alpha Squad", totalScore: 0 },
      "team-2": { id: "team-2", name: "Beta Force", totalScore: 0 }
    },
    rounds: [
      {
        roundId: 1,
        roundName: "Quiz Buzz",
        pointsPerQuestion: 10,
        scores: { "team-1": 30, "team-2": 20 }
      }
    ],
    currentRound: 1,
    currentQuestion: 1
  }
  ```
- [ ] Add Socket events:
  - `host-add-team` → Register new team
  - `host-remove-team` → Delete team
  - `host-start-round` → Begin new round
  - `host-award-points` → Add points to team
- [ ] Implement scoring logic:
  ```javascript
  function awardPoints(teamId, points, roundId) {
    gameState.rounds[roundId].scores[teamId] += points;
    gameState.teams[teamId].totalScore += points;
  }
  ```

#### Frontend Tasks:
- [ ] Add Team Management panel to Host Dashboard:
  - Input: Team Name
  - Button: Add Team
  - List: Registered teams with delete option
- [ ] Add Round Management:
  - Input: Round Name, Points per Question
  - Button: Start New Round
- [ ] Display current round and question number
- [ ] Update scoring after each correct answer

#### Testing Checklist:
- [ ] Add 5 teams from host dashboard
- [ ] Start Round 1
- [ ] Award points to different teams
- [ ] Verify scores update in real-time
- [ ] Start Round 2
- [ ] Verify round 1 scores persist

**Deliverables**:
```
✅ Team management UI (add/remove)
✅ Round management (start new round)
✅ Scoring system (points per question)
✅ Persistent score tracking
```

---

### **PHASE 4: Public Leaderboard & UI/UX Polish** 🎨

**Goal**: Create a projector-ready leaderboard and polish all UIs.

#### Backend Tasks:
- [ ] Add REST endpoint: `GET /api/leaderboard`
  ```javascript
  app.get('/api/leaderboard', (req, res) => {
    const consolidatedScores = calculateConsolidatedScores();
    res.json(consolidatedScores);
  });
  ```
- [ ] Calculate consolidated scores:
  ```javascript
  function calculateConsolidatedScores() {
    return Object.values(gameState.teams)
      .map(team => ({
        name: team.name,
        roundScores: gameState.rounds.map(r => r.scores[team.id] || 0),
        total: team.totalScore
      }))
      .sort((a, b) => b.total - a.total);
  }
  ```
- [ ] Add Socket event: `leaderboard-update` (broadcast on score changes)

#### Frontend Tasks:
- [ ] Create `Leaderboard.jsx` page
- [ ] Design for projector (1920x1080 recommended):
  - Dark background (#0a0a0a)
  - High contrast text (white/yellow)
  - Large fonts (team names: 48px, scores: 72px)
- [ ] Add auto-refresh (Socket.io live updates)
- [ ] Add medal emojis (🥇🥈🥉)
- [ ] Add timestamp: "Last Updated: HH:MM:SS"
- [ ] Add smooth animations (score changes)

#### UI/UX Polish Tasks:
- [ ] **Buzzer Button**:
  - Size: 300px diameter on desktop, 80vw on mobile
  - Color: Green (#10b981) when enabled
  - Animation: Pulse effect, scale on hover
  - Sound effect (optional): buzzer-sound.mp3
- [ ] **Host Dashboard**:
  - Dark mode theme (#1a1a1a background)
  - Color coding: Active team (green), Standby (yellow)
  - Button styling: Rounded, shadowed, hover effects
- [ ] **Team Buzzer Page**:
  - Full-screen layout
  - Centered button
  - Large status text (36px+)
- [ ] **Leaderboard**:
  - Table with alternating row colors
  - Highlight top 3 teams
  - Add team logos (optional, if provided)

#### Testing Checklist:
- [ ] Open leaderboard on big screen
- [ ] Verify font sizes are readable from distance
- [ ] Award points, verify live update
- [ ] Test dark mode contrast
- [ ] Test buzzer button on mobile device
- [ ] Test host dashboard on tablet
- [ ] Verify all animations are smooth (60fps)

**Deliverables**:
```
✅ frontend/src/pages/Leaderboard.jsx (projector-ready)
✅ GET /api/leaderboard endpoint
✅ Dark mode TailwindCSS theme
✅ Responsive design (mobile/tablet/desktop)
✅ Smooth animations and transitions
```

---

## 🧪 TESTING PROTOCOL

### **Multi-Device Testing**
1. **Setup**:
   - Host device: Laptop (Chrome)
   - Team 1: Phone (Safari)
   - Team 2: Tablet (Firefox)
   - Team 3: Laptop (Edge)
   - Leaderboard: TV/Projector (Chrome)

2. **Scenario 1: Basic Buzzer Flow**
   - [ ] Host enables buzzer
   - [ ] All teams see green button
   - [ ] Teams press in order: T1 → T3 → T2
   - [ ] Verify queue: T1 (0.000s), T3 (+0.XXXs), T2 (+0.XXXs)
   - [ ] Verify T1 sees "ACTIVE" screen
   - [ ] Verify T2/T3 see "STANDBY" with correct rank

3. **Scenario 2: Pass Logic**
   - [ ] Host clicks "Pass" for T1
   - [ ] Verify T3 promoted to Rank 1 (becomes active)
   - [ ] Verify T3's screen turns green
   - [ ] Host clicks "Correct" for T3
   - [ ] Verify points awarded
   - [ ] Verify queue clears

4. **Scenario 3: Network Latency**
   - [ ] Simulate slow network (Chrome DevTools → Network → Slow 3G)
   - [ ] Press buzzer, verify server timestamp is authoritative
   - [ ] Verify client with slower network doesn't get unfair advantage

5. **Scenario 4: Concurrent Buzzes**
   - [ ] Have 5+ teams press buzzer within 100ms
   - [ ] Verify all buzzes recorded
   - [ ] Verify correct chronological ordering
   - [ ] Verify no duplicates

### **Edge Cases**
- [ ] Team disconnects mid-game
- [ ] Host refreshes page (state persists?)
- [ ] Buzzer pressed when disabled (should reject)
- [ ] Duplicate team names (should allow or prevent?)
- [ ] Empty queue when host clicks "Pass"

---

## 📦 DEPLOYMENT CHECKLIST

### **Backend Deployment (Railway/Render)**
- [ ] Set environment variable: `PORT=3000`
- [ ] Set CORS origin to deployed frontend URL
- [ ] Add build command: `npm install`
- [ ] Add start command: `npm start`
- [ ] Test Socket.io connection from deployed frontend
- [ ] Monitor logs for errors

### **Frontend Deployment (Vercel/Netlify)**
- [ ] Set environment variable: `VITE_BACKEND_URL=https://your-backend.railway.app`
- [ ] Update Socket.io connection URL in `socket.js`
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Test all pages after deployment

### **Local Network Setup (For Symposium)**
- [ ] Connect host laptop to venue Wi-Fi
- [ ] Run backend: `npm start` (note IP address, e.g., 192.168.1.100:3000)
- [ ] Update frontend Socket URL to local IP
- [ ] Generate QR code for team join link
- [ ] Print QR code on posters/slides
- [ ] Test connection from participant phones

---

## 🎓 SYMPOSIUM DAY RUNBOOK

### **Pre-Event (1 hour before)**
1. [ ] Start backend server
2. [ ] Start frontend dev server (or serve built files)
3. [ ] Test on 3 devices (laptop, phone, tablet)
4. [ ] Open leaderboard on projector
5. [ ] Create teams in host dashboard
6. [ ] Test buzzer flow end-to-end

### **During Event**
1. [ ] Display QR code on presentation slide
2. [ ] Teams scan and join
3. [ ] Host enables buzzer
4. [ ] Ask question
5. [ ] Teams buzz in
6. [ ] Host judges answers (Correct/Pass/End)
7. [ ] Leaderboard auto-updates
8. [ ] Repeat for all questions

### **Post-Event**
1. [ ] Export final scores (copy from leaderboard or add export feature)
2. [ ] Take screenshot of leaderboard
3. [ ] Optional: Save state to JSON file for records

---

## 🚨 CRITICAL IMPLEMENTATION NOTES

### **1. Timestamp Accuracy**
```javascript
// ❌ WRONG: Using client timestamp as authoritative source
const timestamp = clientTimestamp; // Client can manipulate this!

// ✅ CORRECT: Server-side timestamp is authoritative
const timestamp = Date.now(); // Server clock, cannot be manipulated
```

### **2. Socket.io Room Management**
```javascript
// ✅ Use room codes for isolation
socket.join(roomCode); // Each game gets its own room
io.to(roomCode).emit('event', data); // Broadcast only to that room
```

### **3. Race Condition Handling**
```javascript
// ✅ Prevent duplicate buzzes
const alreadyBuzzed = buzzerQueue.some(b => b.teamId === teamId);
if (alreadyBuzzed) return; // Reject duplicate
```

### **4. State Management**
```javascript
// ✅ Single source of truth on backend
let gameState = { ... }; // In-memory state

// ❌ WRONG: Don't store critical state on frontend
// Frontend should only display what backend sends
```

### **5. Error Handling**
```javascript
// ✅ Always validate on server
if (!gameState.buzzerEnabled) {
  socket.emit('error', { message: 'Buzzer not enabled' });
  return;
}

// ✅ Handle disconnections gracefully
socket.on('disconnect', () => {
  // Clean up team from gameState.teams
  delete gameState.teams[socket.id];
});
```

---

## 📊 SUCCESS METRICS

**The system is production-ready when**:
- [ ] 10+ teams can buzz in within 1 second without conflicts
- [ ] Timestamp accuracy is within ±50ms
- [ ] Pass logic works flawlessly (no UI glitches)
- [ ] Leaderboard updates in <1 second after score changes
- [ ] UI is readable from 20+ feet on projector
- [ ] No crashes or disconnections during 4-hour event
- [ ] Host can control entire game without technical assistance

---

## 🎯 FINAL DELIVERABLES

1. **Codebase** (GitHub repo with README)
2. **Deployment URLs**:
   - Backend: `https://buzzer-backend.railway.app`
   - Frontend: `https://buzzer-symposium.vercel.app`
3. **QR Code** for team join link
4. **Host Instructions** (1-page cheat sheet)
5. **Demo Video** (optional, 2-minute walkthrough)

---

## 🔥 BONUS FEATURES (If Time Permits)

- [ ] **Sound Effects**: Buzzer sound on press, applause on correct answer
- [ ] **Animations**: Confetti on leaderboard for top scorer
- [ ] **Export Data**: Download scores as CSV
- [ ] **Question Timer**: 30-second countdown for each question
- [ ] **Audience Poll**: Let audience vote on answers (separate UI)
- [ ] **Dark/Light Mode Toggle**: For host dashboard
- [ ] **Team Logos**: Upload images for each team
- [ ] **Stats Dashboard**: Average response time, accuracy rate
- [ ] **Replay Mode**: Review past questions and answers

---

## ⚡ QUICK START COMMANDS

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev

# Full Stack (from root)
npm install # Install workspace dependencies
npm run dev # Start both servers concurrently
```

---

## 📞 TROUBLESHOOTING

| Issue | Solution |
|-------|----------|
| Teams can't connect | Check CORS settings, verify Socket.io URL |
| Timestamps out of order | Use `Date.now()` on server, not client |
| UI doesn't update | Check Socket event names (case-sensitive) |
| Leaderboard not refreshing | Add `socket.on('leaderboard-update')` listener |
| Pass logic broken | Verify `buzzerQueue.shift()` removes correct team |
| Mobile button too small | Use `min-height: 200px` and `touch-action: manipulation` |

---

## ✅ FINAL CHECKLIST BEFORE SYMPOSIUM

**1 Week Before**:
- [ ] Complete Phases 1-4
- [ ] Test on 5+ devices
- [ ] Fix all known bugs
- [ ] Deploy to production

**1 Day Before**:
- [ ] Print QR codes
- [ ] Prepare backup laptop
- [ ] Test on venue Wi-Fi
- [ ] Brief host on controls

**1 Hour Before**:
- [ ] Boot servers
- [ ] Test end-to-end flow
- [ ] Set up projector
- [ ] Create teams

**Go Live** 🚀:
- [ ] Display QR code
- [ ] Start first round
- [ ] Monitor for issues
- [ ] Enjoy the event!

---

**END OF MASTER PROMPT**

*This document serves as the single source of truth for building the Real-Time Buzzer & Score Consolidation System. Follow each phase sequentially, check off items as you complete them, and test thoroughly before the symposium day.*

**Good luck! 🎓🔥**
