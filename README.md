# Math Mystery Island

An educational game platform where students solve math puzzles to explore a virtual island, unlock zones, and master mathematical concepts through interactive gameplay.

## Features

### Core Gameplay
- **4 Unique Zones**: Geometry Glacier, Algebra Archipelago, Statistics Savannah, and Calculus Cliffs
- **150+ Math Puzzles**: Across multiple difficulty levels (Grades 3-10)
- **Progressive Unlocking**: Solve puzzles to unlock new zones and areas
- **Math Gems Currency**: Earn rewards for solving puzzles
- **Hint System**: 3-level hint system for each puzzle
- **Performance Tracking**: Timer, attempt counter, and hint usage tracking

### User Features
- **Role-Based Access**: Student, Teacher, or Parent accounts
- **Avatar Customization**: Skin color, hair style, outfit customization
- **Learning Dashboard**: Progress analytics, weak area identification, completion rates
- **Achievement System**: 10+ badges to unlock through gameplay
- **User Profile**: Personal statistics and customization options

### Game Mechanics
- **Adaptive Difficulty**: Puzzles scale based on grade level
- **Multiple Puzzle Types**: Door riddles, bridge building, treasure maps, pattern paths, environmental puzzles
- **Progress Persistence**: All progress automatically saved to database
- **Real-time Feedback**: Instant validation and encouragement

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Email/Password)
- **Hosting Ready**: Build optimized for production deployment

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn
- Supabase account with database configured

### Setup Instructions

1. **Clone and Install**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Database Setup**
   The database schema is automatically created via migrations. All tables include:
   - Row-Level Security (RLS) policies
   - Proper indexes for performance
   - Foreign key relationships

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   The app will start at `http://localhost:5173`

5. **Build for Production**
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── components/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── SignupPage.tsx
│   ├── AchievementsPage.tsx
│   ├── DashboardPage.tsx
│   ├── HomePage.tsx
│   ├── IslandPage.tsx
│   ├── Navigation.tsx
│   ├── ProfilePage.tsx
│   ├── PuzzleSolvePage.tsx
│   └── ZoneDetailPage.tsx
├── contexts/
│   └── AuthContext.tsx
├── lib/
│   └── supabase.ts
├── App.tsx
├── main.tsx
└── index.css
```

## Database Schema

### Core Tables
- **profiles**: User account data with role and grade level
- **avatars**: Avatar customization per user
- **zones**: 4 main game zones
- **puzzles**: 150+ math puzzles with metadata
- **user_progress**: Puzzle completion tracking
- **unlocked_zones**: Zone unlock status per user

### Engagement Tables
- **achievements**: Badge definitions
- **user_achievements**: Earned achievements
- **teams**: Multiplayer team grouping
- **team_members**: Team membership
- **custom_puzzles**: User-created puzzles
- **leaderboard_entries**: Ranking data

All tables have Row-Level Security policies enabled to protect user data.

## Usage Guide
