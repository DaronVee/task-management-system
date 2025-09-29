# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚀 DEPLOYMENT & UI/UX ARCHITECTURE COMPLETE (September 29, 2025)

**STATUS**: ✅ COMPLETE - Production deployment with GitHub auto-deploy pipeline + Best-in-class 2025 UI/UX

### 🌐 GitHub to Netlify Auto-Deploy Architecture

**LIVE SITE**: https://daron-task-crusher.netlify.app/

#### Deployment Pipeline
```
Local Development → GitHub Push → Netlify Auto-Build → Live Deployment
     ↓                  ↓              ↓                ↓
Claude Code      git push main    netlify.toml     Static CDN
Brain Dumps         ↓           Auto-Detection      HTTPS +
    ↓          GitHub Webhook      ↓              Custom Domain
Supabase Sync      ↓         Next.js Build           ↓
    ↓        Trigger Deploy      ↓           Professional Hosting
Live UI Data       ↓         Static Export           ↓
                Deploy        ↓              Real-time Updates
               Complete    CDN Distribution
```

#### Architecture Benefits
- **Frontend**: Professional Netlify hosting with CDN, HTTPS, custom domains
- **Backend**: Claude Code remains local for AI-powered task processing
- **Auto-Deploy**: Every `git push` triggers automatic deployment
- **Real-time Sync**: Supabase handles live data synchronization
- **Zero DevOps**: No server management, automatic scaling

### 🎨 UI/UX Modernization Applied
- **Design System**: Modern design tokens with CSS custom properties
- **Component Architecture**: Professional TaskCard with animations and accessibility
- **Keyboard Shortcuts**: Full keyboard navigation (⌘+R, ⌘+T, ⌘+1/2, ⌘+←/→)
- **Performance**: Optimized builds, efficient re-renders, virtualization support
- **Accessibility**: WCAG 2.2 AA compliance, screen reader support
- **Visual Design**: Professional typography, color psychology, 8pt grid system

### 📁 Key Configuration Files

#### `netlify.toml` - Deployment Configuration
```toml
[build]
  base = "frontend"              # Next.js app location
  command = "npm run build"      # Build command
  publish = "out"               # Static export directory

[build.environment]
  NODE_VERSION = "18.17.0"      # Node.js version
  NEXT_TELEMETRY_DISABLED = "1"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200                  # SPA routing support
```

#### `frontend/next.config.js` - Static Export Configuration
```javascript
const nextConfig = {
  output: 'export',             // Static site generation
  trailingSlash: true,         // Netlify compatibility
  distDir: 'out',              # Output directory
  images: { unoptimized: true } // Static export optimization
}
```

#### `.gitignore` - Security & Performance
```
# Environment variables (CRITICAL: Never commit)
.env
.env.local
backend/.env

# Build outputs
.next/
out/
node_modules/

# Data files (processed results)
data/daily/*.json
data/processed/*.json
```

### 🔧 Files Modified/Created

#### New Deployment Files
- `netlify.toml` - Netlify build and deployment configuration
- `frontend/.env.example` - Environment variable template
- `DEPLOYMENT.md` - Comprehensive deployment guide
- `.gitignore` - Security and performance exclusions

#### Updated Configuration
- `frontend/next.config.js` - Added static export configuration
- `frontend/app/page.tsx` - Fixed TypeScript errors for deployment

#### Frontend Architecture
- `frontend/styles/design-tokens.css` - Core design system
- `frontend/app/globals.css` - Component styles and animations
- `frontend/app/layout.tsx` - Modern header with gradient branding
- `frontend/app/page.tsx` - Enhanced dashboard with keyboard shortcuts
- `frontend/components/modern/TaskCard.tsx` - Professional component
- `frontend/lib/hooks.ts` - Keyboard shortcuts and optimistic updates

### 📦 Dependencies & Technology Stack
- **Frontend Framework**: Next.js 14 with static export
- **Hosting**: Netlify with GitHub integration
- **Database**: Supabase with real-time subscriptions
- **UI Library**: @heroicons/react for professional icons
- **Performance**: react-window for virtualization (optional)
- **Version Control**: GitHub with automated deployment triggers

### 🏗️ Deployment Status
- ✅ **GitHub Repository**: https://github.com/DaronVee/task-management-system
- ✅ **Live Application**: https://daron-task-crusher.netlify.app/
- ✅ **Auto-Deploy**: Active on main branch pushes
- ✅ **Build Status**: All builds passing with TypeScript validation
- ✅ **Performance**: CDN distribution, optimized static assets
- ✅ **Security**: HTTPS, environment variable isolation

### 🔄 Development Workflow
```bash
# Daily workflow
python scripts/process_morning.py  # Process brain dumps with Claude Code
python backend/sync.py push        # Sync to Supabase

# Deploy changes
git add .
git commit -m "Your changes"
git push                          # Triggers automatic Netlify deployment
```

**Documentation**: See `DEPLOYMENT.md` for step-by-step setup guide.

## CRITICAL: Brain Dump Processing Instructions

**WHEN Claude Code detects brain dump content (unstructured task lists, daily thoughts, or productivity planning), AUTOMATICALLY use the sub-agent chain:**

### Automatic Sub-Agent Invocation
```
1. Use task-extractor agent to parse brain dump into structured tasks
2. Use priority-strategist agent to align tasks with user objectives
3. Use task-architect agent to add metadata and time estimates
4. Use day-optimizer agent to create optimal daily schedule
5. Save results to data/processed/ and sync to Supabase
```

### Brain Dump Detection Triggers
- Unstructured lists of things to do
- Stream-of-consciousness task planning
- Daily/weekly planning content
- Mixed personal and work task content
- User explicitly mentions "brain dump", "daily tasks", or "planning"

### Sub-Agent Chain Execution
**ALWAYS call these sub-agents in sequence when processing brain dumps:**

```
Step 1: Use task-extractor agent
Input: Raw brain dump text
Output: JSON array of extracted tasks

Step 2: Use priority-strategist agent
Input: Extracted tasks + user objectives from config/objectives.json
Output: Tasks with P1/P2/P3 priorities and strategic alignment

Step 3: Use task-architect agent
Input: Prioritized tasks
Output: Fully structured tasks with time estimates, categories, success criteria

Step 4: Use day-optimizer agent
Input: Structured tasks + user preferences
Output: Optimized daily schedule with time blocks
```

### Exact Sub-Agent Call Format
When invoking sub-agents, use this format:
- "Use the task-extractor agent to process this brain dump: [content]"
- "Use the priority-strategist agent to prioritize these tasks against the user's CCGG objectives"
- "Use the task-architect agent to structure these prioritized tasks"
- "Use the day-optimizer agent to create an optimal daily schedule"

### Required Output
After sub-agent processing, ALWAYS:
1. Use Python backend/sync.py to save results to Supabase
2. Notify user that tasks are available in the frontend at http://localhost:3001 (or 3000 if available)
3. Provide summary of created tasks, priorities, and schedule
4. Show next steps for the user's day

## CRITICAL: Complete Brain Dump Processing Workflow

### Pre-Flight Checklist (ALWAYS run these first)
1. Check frontend status: Test both `http://localhost:3000` and `http://localhost:3001`
2. Test Supabase connection: `python test_connection.py`
3. Verify environment variables are loaded properly
4. Ensure backend/.env file exists with correct Supabase credentials

### Step-by-Step Brain Dump Processing

#### Phase 1: Frontend Setup and Verification
```bash
# Check if frontend is running (try both ports)
# Frontend may run on port 3001 if 3000 is occupied
# Always note which port is actually in use
```

#### Phase 2: Process Brain Dump with Sub-Agents (SEQUENTIAL)
1. **Extract tasks** using task-extractor agent from raw brain dump text
2. **Prioritize** using priority-strategist agent with config/objectives.json alignment
3. **Structure** using task-architect agent to add metadata and time estimates
4. **Optimize schedule** using day-optimizer agent for energy-aware scheduling

#### Phase 3: Data Formatting (CRITICAL)
Ensure ALL tasks match this EXACT Pydantic model structure:
```json
{
  "id": "unique-id-string",
  "title": "Task title (max 200 chars)",
  "description": "Task description (max 1000 chars)",
  "priority": "P1|P2|P3",
  "status": "not_started|in_progress|completed|blocked|cancelled",
  "progress": 0,
  "category": "development|design|admin|learning|personal|meeting|planning",
  "estimated_minutes": 30,
  "actual_minutes": 0,
  "time_block": "morning|afternoon|evening",
  "subtasks": [],
  "notes": [],
  "success_criteria": "Clear success criteria (optional)",
  "dependencies": [],
  "tags": [],
  "created_at": "2025-09-29T08:00:00",
  "updated_at": "2025-09-29T08:00:00",
  "completed_at": null
}
```

#### Phase 4: Save to Local File Structure
```json
{
  "date": "2025-09-29",
  "tasks": [/* array of task objects */],
  "summary": {
    "total_tasks": 1,
    "completed_tasks": 0,
    "in_progress_tasks": 0,
    "blocked_tasks": 0,
    "total_estimated_minutes": 180,
    "total_actual_minutes": 0,
    "completion_percentage": 0.0,
    "categories": {"development": 1},
    "priorities": {"P1": 1}
  }
}
```

#### Phase 5: Sync to Supabase Database
```bash
# Primary method: Use the sync script
python backend/sync.py push

# If sync fails with constraint errors, use update method:
# Check if record exists first, then update instead of insert
```

#### Phase 6: Verify in UI Using Chrome DevTools MCP
1. Navigate to the correct frontend URL (3000 or 3001)
2. Take snapshot to see current state
3. Click refresh button to trigger data reload
4. Verify task appears with all metadata (title, description, priority, time estimate)

### Error Recovery Procedures

#### If Pydantic Model Validation Fails:
- **Cause**: Task structure doesn't match models.py schema
- **Fix**: Ensure all fields match exact types and constraints
- **Test**: `python -c "from backend.models import DailyTasks; import json; DailyTasks(**json.load(open('data/daily/YYYY-MM-DD.json')))"`

#### If Sync to Supabase Fails:
1. **Environment Error**: Check backend/.env file exists and has correct SUPABASE_URL and SUPABASE_KEY
2. **Constraint Violation**: Use UPDATE instead of INSERT if record exists for that date
3. **Connection Error**: Test with `python debug_connection.py`
4. **Fallback**: Use direct database manipulation script

#### If Tasks Don't Appear in Frontend:
1. Check network requests in Chrome DevTools for Supabase API calls
2. Verify API responses contain task data (not empty arrays)
3. Force refresh using the UI refresh button
4. Check browser console for JavaScript errors
5. Ensure correct port (3000 vs 3001)

#### If Frontend Won't Start:
1. Check if port 3000 is occupied, app will use 3001
2. Run `cd frontend && npm install` if dependencies missing
3. Check for Node.js version compatibility
4. Verify `.env.local` file exists in frontend folder

### Critical Fixes Applied

#### 1. Pydantic V2 Compatibility
- **Problem**: Using deprecated `.dict()` method
- **Solution**: All instances replaced with `.model_dump()`
- **Files Fixed**: backend/sync.py (lines 74, 112, 113, 164, 188, 205)

#### 2. Environment Variable Loading
- **Problem**: load_dotenv() couldn't find backend/.env from root directory
- **Solution**: Updated to `load_dotenv(Path(__file__).parent / '.env')`
- **File Fixed**: backend/sync.py line 27

#### 3. Database Constraint Handling
- **Problem**: Upsert failing with duplicate key violations
- **Solution**: Check for existing records and use UPDATE operation
- **Implementation**: Direct update queries instead of blind upserts

#### 4. Unicode/Emoji Encoding Issues
- **Problem**: Using emojis in Python scripts causes UnicodeEncodeError on Windows
- **Error**: `'charmap' codec can't encode character '\u274c' in position X: character maps to <undefined>`
- **Solution**: NEVER use emojis in any Python scripts or print statements
- **Alternative**: Use text symbols like [OK], [FAIL], [SUCCESS] instead of ✅, ❌, 🚀

#### 5. Netlify Deployment 404 Errors (September 29, 2025)
- **Problem**: Netlify showing 404 "Page not found" instead of Next.js application
- **Root Cause**: Next.js 14 requires static export configuration for Netlify hosting
- **Solution Applied**:
  - Updated `frontend/next.config.js` with `output: 'export'` and `distDir: 'out'`
  - Modified `netlify.toml` publish directory from `.next` to `out`
  - Fixed redirect rules for SPA routing (removed admin role condition)
  - Added static export optimizations (`images: { unoptimized: true }`)
- **Verification**: Local build test + automatic deployment triggered via git push
- **Result**: https://daron-task-crusher.netlify.app/ now fully functional

### Common Pitfalls to NEVER Repeat

1. ❌ **Don't use `.dict()`** - Always use `.model_dump()` for Pydantic V2
2. ❌ **Don't assume port 3000** - Check actual running port (may be 3001)
3. ❌ **Don't use upsert blindly** - Check for existing records first
4. ❌ **Don't skip environment verification** - Always test Supabase connection
5. ❌ **Don't forget frontend start** - Verify UI is running before testing
6. ❌ **Don't ignore validation errors** - Test Pydantic models before sync
7. ❌ **Don't skip MCP verification** - Use Chrome DevTools to confirm UI state
8. ❌ **NEVER USE EMOJIS IN SCRIPTS** - Causes UnicodeEncodeError on Windows (cp1252 encoding)
9. ❌ **Don't deploy Next.js without static export** - Netlify requires `output: 'export'` configuration
10. ❌ **Don't assume `.next` publish directory** - Static export uses `out` directory
11. ❌ **Don't forget SPA redirect rules** - Single Page Apps need catch-all redirects
12. ❌ **Don't skip local build testing** - Always test `npm run build` before deploying

### Success Indicators Checklist

#### Local Development Success
✅ **Frontend Status**: Shows "X of Y tasks completed" instead of "No tasks"
✅ **Task Display**: Task appears with title, description, priority badge, time estimate
✅ **Network Requests**: Supabase API returns 200 status with populated data array
✅ **Local Files**: data/daily/YYYY-MM-DD.json contains properly formatted tasks
✅ **Database**: Supabase table contains matching record with tasks array
✅ **Real-time Sync**: Changes in database immediately reflect in UI

#### Deployment Success (September 29, 2025)
✅ **Live Site**: https://daron-task-crusher.netlify.app/ loads TaskFlow Pro interface
✅ **GitHub Integration**: Repository at https://github.com/DaronVee/task-management-system
✅ **Auto-Deploy**: Push to main branch triggers automatic Netlify rebuild
✅ **Build Status**: Next.js static export generates proper `out/` directory
✅ **TypeScript**: No compilation errors during build process
✅ **Static Assets**: All CSS, JS, and font files properly served via CDN
✅ **SPA Routing**: Single Page Application navigation works correctly
✅ **Performance**: Fast loading times with CDN distribution

### Commands for Quick Debugging

```bash
# Test full workflow
python test_workflow.py

# Check environment
python debug_connection.py

# Manual sync test
python backend/sync.py pull
python backend/sync.py push

# Direct database fix (if sync fails)
python direct_insert.py

# Deployment commands
cd frontend && npm run build        # Test Next.js static export
git status                         # Check for uncommitted changes
git add . && git commit -m "Update"  # Commit changes
git push                          # Trigger automatic Netlify deploy

# GitHub repository management
gh repo view                      # View repository details
gh repo create --public          # Create new repository (if needed)

# Frontend restart
cd frontend && npm run dev
```

## Project Overview

This is an AI-powered task management system that transforms unstructured "brain dumps" into organized, prioritized, and optimally scheduled daily tasks using a sophisticated chain of Claude Code sub-agents.

## Core Architecture

### Sub-Agent Chain Architecture
The system's intelligence is powered by a sequential chain of 7 specialized Claude Code sub-agents located in `agents/`:

```
Brain Dump → task-extractor → priority-strategist → task-architect → day-optimizer → Supabase
```

Each agent has structured JSON input/output formats and specific responsibilities:
- **task-extractor**: Parses unstructured text into actionable tasks
- **priority-strategist**: Aligns tasks with user objectives (P1/P2/P3 priorities)
- **task-architect**: Adds metadata, time estimates, success criteria
- **day-optimizer**: Creates energy-aware time-blocked schedules
- **progress-analyst**: Analyzes completion patterns and productivity
- **report-composer**: Generates insights and recommendations
- **task-coach**: Provides guidance for blocked tasks

### Four-Layer Architecture
1. **Intelligence Layer**: Claude Code sub-agents
2. **Sync Layer**: Python scripts (`backend/sync.py`) for Supabase orchestration
3. **Data Layer**: Supabase database with real-time subscriptions
4. **Interface Layer**: Next.js 14 frontend with TypeScript and Tailwind CSS

### Data Model
All data flows through Pydantic models in `backend/models.py`:
- `Task`: Core task object with subtasks, time tracking, and metadata
- `DailyTasks`: Date-specific task collections
- `DaySummary`: Analytics and completion statistics
- `Config`: User objectives and system preferences

## Common Development Commands

### Daily Workflow
```bash
# Morning brain dump processing (orchestrates sub-agent chain)
python scripts/process_morning.py

# Run comprehensive end-to-end tests
python test_workflow.py

# Frontend development
cd frontend && npm run dev
cd frontend && npm run build
cd frontend && npm run lint

# Generate reports using sub-agents
python scripts/generate_report.py
```

### Setup Commands
```bash
# Install Python dependencies
pip install -r backend/requirements.txt

# Install frontend dependencies
cd frontend && npm install

# Deploy database schema
# Apply backend/schema.sql to your Supabase project
```

### Testing
```bash
# Basic tests (no Supabase required)
python test_workflow.py --skip-supabase

# Full end-to-end tests including Supabase sync
python test_workflow.py
```

## Configuration System

The system uses a comprehensive **dynamic configuration architecture** that allows customizing all agent behavior without modifying code. All configuration files are located in the `config/` directory and are automatically loaded by agents at runtime.

### Core Configuration Files

#### `config/objectives.json` - Strategic Goals
- **Used by**: priority-strategist agent
- **Purpose**: Defines user's strategic objectives with weights and key results
- **Structure**: Primary/secondary objectives with measurable outcomes
- **Update frequency**: Quarterly review recommended

#### `config/user-preferences.json` - Schedule & Energy Patterns
- **Used by**: day-optimizer agent
- **Purpose**: Work hours, energy schedule, calendar constraints, optimization settings
- **Structure**: Schedule preferences, time blocks, break patterns, workload limits
- **Update frequency**: Seasonal adjustments or life changes

#### `config/task-categories.json` - Categories & Time Estimation
- **Used by**: task-architect agent
- **Purpose**: Available task categories, time blocks, and estimation guidelines
- **Structure**: Default/custom categories, energy requirements, complexity multipliers
- **Update frequency**: As work patterns evolve

#### `config/report-settings.json` - Report Configuration
- **Used by**: report-composer agent
- **Purpose**: When and how reports are generated, content preferences, formatting
- **Structure**: Scheduling, sections to include, visual elements, delivery preferences
- **Update frequency**: Based on reporting needs

### Legacy Configuration
`backend/config.json` contains:
- Legacy system preferences (being migrated to new config files)
- Sub-agent model preferences

### Claude Code Settings
`.claude/settings.local.json` contains pre-approved bash commands for the workflow scripts.

### MCP Server Integration
The project has Chrome DevTools MCP server installed for UI/UX development and testing:
- **Server**: `chrome-devtools-mcp` via `npx chrome-devtools-mcp@latest`
- **Purpose**: Real-time browser automation for UI/UX improvements
- **Capabilities**: Page screenshots, element interaction, performance analysis, network monitoring
- **Usage**: When working on frontend improvements, use MCP tools to test user flows, analyze performance, and validate UI changes
- **Status**: Check with `claude mcp list` to verify connection

## Key Architectural Patterns

### Dynamic Configuration Architecture
The system implements a **configuration-driven approach** where agent behavior is fully customizable:
- **Runtime Loading**: All agents load their configuration dynamically at execution time
- **No Code Changes**: Users can modify system behavior by editing JSON configuration files
- **Consistent Pattern**: All configuration files follow the same structure with metadata and review schedules
- **Agent-Specific**: Each agent references only the configuration it needs (objectives, preferences, categories, reports)

### Real-time Sync Architecture
- **Bi-directional sync**: Local files ↔ Supabase ↔ Frontend
- **WebSocket subscriptions**: Instant UI updates via Supabase real-time
- **Local caching**: Files stored in `data/` directories for offline capability
- **Optimistic updates**: UI responds immediately with conflict resolution

### Energy-Aware Scheduling
The day-optimizer agent creates time blocks aligned with user energy patterns (configurable via `user-preferences.json`):
- Peak energy periods get P1 (critical) tasks
- Low energy periods get P3 (nice-to-have) tasks
- Similar tasks are batched together to minimize context switching
- Buffer times and break patterns are customizable

### Strategic Alignment
All task prioritization flows through user objectives (configurable via `objectives.json`):
- Each task gets an alignment score (0-100) against objectives
- Priority levels (P1/P2/P3) are assigned based on objective weight and urgency
- The system can recommend killing tasks with zero objective alignment
- Objectives can be updated without modifying agent prompts

## Directory Structure

- `agents/`: Claude Code sub-agent prompt templates with dynamic configuration references
- `backend/`: Python data models, Supabase sync layer, and legacy configuration
- `frontend/`: Next.js 14 app with real-time Supabase integration
- `scripts/`: Workflow orchestration scripts that call sub-agents in sequence
- `data/`: Local file storage (input/, processed/, daily/, reports/)
- `config/`: **Dynamic configuration system** with 4 core files:
  - `objectives.json`: Strategic goals and priorities
  - `user-preferences.json`: Schedule, energy patterns, and optimization settings
  - `task-categories.json`: Categories, time blocks, and estimation guidelines
  - `report-settings.json`: Report scheduling, content, and formatting preferences

## Data Flow

1. Brain dumps are placed in `data/input/`
2. `scripts/process_morning.py` orchestrates the sub-agent chain
3. Each agent processes and enriches the data
4. Final output is synced to Supabase via `backend/sync.py`
5. Frontend receives real-time updates via WebSocket subscriptions
6. Local files in `data/daily/` maintain offline capability

## Testing Strategy

The `test_workflow.py` script provides comprehensive end-to-end validation:
- File structure verification
- Data model validation
- Sub-agent workflow testing
- Supabase sync verification
- Frontend build validation
- Report generation testing

Use `--skip-supabase` flag for local development without database connectivity.