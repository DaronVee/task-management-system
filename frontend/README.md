# Task Management Frontend

A modern, responsive Next.js frontend for the AI-powered task management system.

## Features

- **Real-time sync** with Supabase database
- **Responsive design** optimized for desktop and mobile
- **Two view modes**: List view and Time Block view
- **Interactive task management**: Update status, progress, and subtasks
- **Live progress tracking** with visual indicators
- **Date navigation** to view tasks for any day
- **Priority and category visualization**

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Supabase** - Real-time database and authentication
- **date-fns** - Date manipulation utilities

## Setup

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Environment configuration**:
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
frontend/
├── app/
│   ├── globals.css          # Global styles and Tailwind
│   ├── layout.tsx           # Root layout component
│   └── page.tsx             # Main dashboard page
├── components/
│   ├── DayProgress.tsx      # Progress overview component
│   ├── LoadingSpinner.tsx   # Loading state component
│   ├── TaskList.tsx         # List view of tasks
│   └── TimeBlockView.tsx    # Time block organized view
├── lib/
│   ├── supabase.ts          # Supabase client and types
│   └── utils.ts             # Utility functions
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

## Key Components

### Dashboard (`app/page.tsx`)
- Main application entry point
- Handles data loading and real-time subscriptions
- Manages view mode switching and date selection
- Coordinates task updates with the database

### TaskList (`components/TaskList.tsx`)
- Displays tasks in a detailed list format
- Expandable task cards with full metadata
- Inline editing of status and progress
- Subtask management
- Interactive progress sliders

### TimeBlockView (`components/TimeBlockView.tsx`)
- Organizes tasks by time blocks (morning, afternoon, evening)
- Visual time-based scheduling
- Block-level progress tracking
- Unscheduled task management

### DayProgress (`components/DayProgress.tsx`)
- Overview of daily completion metrics
- Priority breakdown with visual indicators
- Category distribution statistics
- Time tracking summaries

## Real-time Features

The frontend automatically syncs with the database in real-time:

- **Task updates** propagate instantly across all connected clients
- **Progress changes** update live progress bars and completion percentages
- **New tasks** appear automatically when processed by the backend
- **Status changes** reflect immediately in all views

## Mobile Optimization

- **Responsive grid layouts** that adapt to screen size
- **Touch-friendly controls** with appropriate sizing
- **Optimized typography** for readability on small screens
- **Efficient data loading** to minimize mobile data usage

## Performance Features

- **Optimistic updates** for instant UI feedback
- **Error boundaries** with graceful fallbacks
- **Debounced API calls** to prevent excessive requests
- **Lazy loading** of non-critical components
- **Memoized calculations** for expensive operations

## Customization

### Styling
The application uses Tailwind CSS with a custom color palette defined in `tailwind.config.js`. Key colors:
- **Primary**: Blue tones for main interactions
- **Priority colors**: Red (P1), Yellow (P2), Green (P3)
- **Status colors**: Context-appropriate colors for different task states

### Task Display
Task rendering can be customized in the utility functions:
- `getPriorityColor()` - Priority badge styling
- `getStatusColor()` - Status indicator colors
- `getCategoryIcon()` - Category emoji icons
- `getTimeBlockIcon()` - Time block indicators

### Layout
The responsive grid layout adapts automatically:
- **Desktop**: 3-column time block view, 2-column task details
- **Tablet**: 2-column layouts with stacked sections
- **Mobile**: Single column with optimized spacing

## Integration with Backend

The frontend integrates seamlessly with the Python backend:

1. **Task Processing**: Displays tasks created by the morning processing script
2. **Real-time Updates**: Syncs changes made by other clients or scripts
3. **Data Validation**: Uses TypeScript types that match Python models
4. **Error Handling**: Gracefully handles backend connectivity issues

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Type checking
npx tsc --noEmit
```

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
The application can be deployed to any platform supporting Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Browser Support

- **Modern browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile browsers**: iOS Safari, Chrome Mobile
- **Progressive Web App**: Installable on mobile devices

## Troubleshooting

### Common Issues

1. **Real-time not working**:
   - Check Supabase project settings
   - Verify RLS policies allow real-time updates
   - Ensure WebSocket connections aren't blocked

2. **Tasks not loading**:
   - Verify environment variables are set correctly
   - Check browser console for API errors
   - Confirm database schema matches expected structure

3. **Styling issues**:
   - Clear browser cache
   - Verify Tailwind CSS is building correctly
   - Check for conflicting CSS rules

### Debug Mode
Set `DEBUG=true` in environment variables to enable additional logging and error details.