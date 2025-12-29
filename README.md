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

### For Students
1. **Sign Up**: Create account with username, email, password, and grade level
2. **Explore**: Start in Geometry Glacier with unlocked puzzles
3. **Solve Puzzles**: Click "Solve" to attempt puzzles
4. **Use Hints**: Request up to 3 hints per puzzle
5. **Earn Gems**: Get gems for correct answers
6. **Unlock Zones**: Solve puzzles to unlock new zones
7. **Track Progress**: View dashboard for learning analytics

### For Teachers/Parents
1. **Create Account**: Select Teacher or Parent role
2. **Monitor Progress**: Access learning dashboard
3. **View Analytics**: See student performance and weak areas
4. **Track Improvement**: Review completion rates and time spent

## Features By Page

### Home Page
- Hero section with feature showcase
- Call-to-action button
- Statistics display (150+ puzzles, 4 zones, 50+ hours)

### Island Page
- Interactive zone map
- Unlock requirements display
- Progress bars per zone
- Zone selection interface

### Zone Detail Page
- Browse all puzzles in a zone
- View difficulty and grade level
- Check math concepts covered
- Time estimates and gem rewards

### Puzzle Solver
- Problem presentation
- Multiple input methods
- 3-level hint system
- Real-time feedback
- Timer and attempt tracking

### Profile Page
- Avatar customization
- Personal statistics
- Gems counter
- Puzzles solved
- Time spent tracking

### Dashboard
- Completion rate
- Weak area identification
- Recent activity feed
- Performance metrics

### Achievements Page
- Badge collection display
- Category filtering
- Progress circle
- Unlock dates

## API & Database Operations

### Authentication Flow
- Users sign up with email/password
- Automatic profile creation
- First zone auto-unlocked
- Avatar initialized with defaults

### Puzzle Completion
- Validates answer and updates progress
- Awards gems to user account
- Checks for zone unlocks
- Tracks hints and attempts
- Records completion timestamp

### Data Retrieval
- Lazy-loaded zone and puzzle data
- Progress cached per session
- Avatar customization persisted
- Achievement status tracked

## Security

- **RLS Enabled**: All tables protected with Row-Level Security
- **User Isolation**: Users can only access their own data
- **Authentication**: Supabase auth with email/password
- **No Client Secrets**: API key is anon key with limited permissions
- **Ownership Checks**: All update/delete operations verified

## Performance

- **Build Size**: ~326KB JavaScript (gzipped: ~93KB)
- **CSS**: ~25KB (gzipped: ~4.8KB)
- **Database Indexes**: Optimized for common queries
- **Lazy Loading**: Components load on demand
- **Responsive Design**: Mobile-first approach

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Enhancements

- AI-powered hint generation
- Spaced repetition system
- Real-time multiplayer challenges
- Custom puzzle creation tool
- Teacher classroom management dashboard
- Mobile app version
- Offline mode
- Social features and leaderboards
- Advanced analytics for educators
- Voice-based puzzle instructions

## Troubleshooting

### Can't login?
- Verify Supabase URL and key in .env
- Check email exists in database
- Confirm password is correct

### Puzzles not loading?
- Check database connection
- Verify zones and puzzles exist in database
- Clear browser cache

### Gems not updating?
- Refresh page after solving puzzle
- Check user profile in database
- Verify RLS policies are correct

## Contributing

This is an educational project. Feel free to:
- Add more puzzles
- Create new zones
- Design new puzzle types
- Improve UI/UX
- Optimize performance



**Start your mathematical adventure today!**
