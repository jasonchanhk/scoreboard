# Basketball Scoreboard

A real-time basketball scoreboard web application built with React, Supabase, and TailwindCSS.

## Features

- **Authentication**: Email/password authentication using Supabase Auth
- **Real-time Updates**: Live score updates using Supabase subscriptions
- **Score Management**: Increment/decrement scores with click controls
- **Share Functionality**: Generate 6-digit share codes for view-only access
- **Public View**: View-only access for shared scoreboards
- **Quarter Management**: Track current quarter (1-4)
- **Responsive Design**: Clean, modern UI with TailwindCSS

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: TailwindCSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Routing**: React Router DOM

## Prerequisites

- Node.js (v20.19.0 or higher)
- npm or yarn
- Supabase account

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd web
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Create a `.env.local` file in the `web` directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set up Database

Run the SQL migration in your Supabase SQL editor:

```sql
-- Copy and paste the contents of supabase-migration.sql
```

This will create:
- `scoreboards` table with all required fields
- Row Level Security (RLS) policies
- Proper indexes for performance

### 4. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Database Schema

### scoreboards table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| owner_id | UUID | References auth.users |
| share_code | TEXT | 6-digit unique code for sharing |
| team_a_name | TEXT | Name of team A |
| team_b_name | TEXT | Name of team B |
| score_a | INTEGER | Team A score (0-200) |
| score_b | INTEGER | Team B score (0-200) |
| current_quarter | INTEGER | Current quarter (1-4) |
| timer | TEXT | Timer display |
| created_at | TIMESTAMP | Creation timestamp |

## Usage

### Authentication
- Sign up with email/password
- Sign in to access your scoreboards
- Sign out to return to login

### Creating Scoreboards
1. Click "Create New Scoreboard" on the dashboard
2. Enter team names
3. Click "Create Scoreboard"

### Managing Scores
- **Owner View**: Click +1/-1 buttons to adjust scores
- **Score Limits**: Scores are constrained between 0-200
- **Quarter Management**: Use quarter controls to change quarters
- **Reset**: Reset all scores and quarter to 1

### Sharing Scoreboards
1. Click "Share" button on any scoreboard
2. A 6-digit code will be generated
3. Share the code or the public URL: `/view/{shareCode}`

### Public View
- Access via `/view/{shareCode}` URL
- View-only access (no editing)
- Real-time updates
- No authentication required

## Security

- **Row Level Security (RLS)** ensures users can only access their own scoreboards
- **Share codes** provide controlled public access
- **Authentication** required for all editing operations
- **Input validation** prevents invalid score values

## Development

### Project Structure

```
src/
├── components/          # React components
│   ├── Dashboard.tsx    # Main dashboard
│   ├── Scoreboard.tsx   # Scoreboard interface
│   ├── PublicView.tsx   # Public view component
│   ├── LoginForm.tsx    # Authentication forms
│   └── SignUpForm.tsx
├── contexts/            # React contexts
│   └── AuthContext.tsx  # Authentication context
├── lib/                 # Utilities
│   └── supabase.ts      # Supabase client
└── App.tsx             # Main app component
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Future Enhancements

- Timer functionality with start/stop/pause
- Per-quarter statistics tracking
- Foul tracking
- Timeout management
- Team colors and logos
- Game history
- Export functionality

## Troubleshooting

### Common Issues

1. **Environment Variables**: Ensure `.env.local` is properly configured
2. **Database Connection**: Verify Supabase URL and key are correct
3. **RLS Policies**: Make sure database migration was run successfully
4. **Real-time Updates**: Check Supabase real-time is enabled

### Getting Help

- Check the browser console for errors
- Verify Supabase dashboard for database issues
- Ensure all dependencies are installed correctly

## License

MIT License - feel free to use this project for your own needs!