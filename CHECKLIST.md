# Task Management System - Setup Checklist

Use this checklist to verify your system is ready to use.

## ✅ File Structure Verification

### Core Components
- [ ] `backend/models.py` - Data models and validation
- [ ] `backend/sync.py` - Supabase synchronization layer
- [ ] `backend/schema.sql` - Database schema
- [ ] `backend/config.json` - User objectives and preferences
- [ ] `scripts/process_morning.py` - Morning workflow orchestration
- [ ] `scripts/generate_report.py` - Report generation
- [ ] `frontend/package.json` - Frontend dependencies
- [ ] `frontend/app/page.tsx` - Main dashboard
- [ ] `test_workflow.py` - End-to-end testing
- [ ] `setup.py` - Automated setup script

### Sub-Agent Prompts
- [ ] `agents/task-extractor.md`
- [ ] `agents/priority-strategist.md`
- [ ] `agents/task-architect.md`
- [ ] `agents/day-optimizer.md`
- [ ] `agents/progress-analyst.md`
- [ ] `agents/report-composer.md`
- [ ] `agents/task-coach.md`

### Frontend Components
- [ ] `frontend/components/TaskList.tsx`
- [ ] `frontend/components/DayProgress.tsx`
- [ ] `frontend/components/TimeBlockView.tsx`
- [ ] `frontend/lib/supabase.ts`
- [ ] `frontend/lib/utils.ts`

### Data Directories
- [ ] `data/input/` - Brain dump input files
- [ ] `data/processed/` - Sub-agent processing outputs
- [ ] `data/daily/` - Daily task storage
- [ ] `data/reports/` - Generated reports

### Sample Data
- [ ] `data/input/brain_dump.txt` - Sample brain dump for testing

## 🛠️ Setup Steps

### 1. Dependencies
- [ ] Python dependencies installed: `pip install -r backend/requirements.txt`
- [ ] Frontend dependencies installed: `cd frontend && npm install`

### 2. Database Setup
- [ ] Supabase project created
- [ ] Database schema deployed (`backend/schema.sql`)
- [ ] Realtime enabled for `daily_tasks` table
- [ ] Credentials copied to environment files

### 3. Environment Configuration
- [ ] `backend/.env` created with Supabase credentials
- [ ] `frontend/.env.local` created with Supabase credentials

### 4. Claude Code Sub-Agents
- [ ] 7 sub-agents created in Claude Code
- [ ] Agent names match: `task-extractor`, `priority-strategist`, etc.
- [ ] Prompts loaded from `agents/` folder
- [ ] Agents tested individually

## 🧪 Testing

### Automated Tests
- [ ] Run: `python test_workflow.py --skip-supabase` (basic tests)
- [ ] Run: `python test_workflow.py` (full tests with Supabase)

### Manual Verification
- [ ] Edit `data/input/brain_dump.txt` with your tasks
- [ ] Run: `python scripts/process_morning.py`
- [ ] Start frontend: `cd frontend && npm run dev`
- [ ] Open: `http://localhost:3000`
- [ ] Verify tasks appear in UI
- [ ] Test task updates (status, progress, subtasks)
- [ ] Generate report: `python scripts/generate_report.py`

## 🎯 Daily Workflow Test

### Morning (5 minutes)
1. [ ] Write brain dump in `data/input/brain_dump.txt`
2. [ ] Process with Claude Code: Call sub-agents in sequence
3. [ ] Review in UI: Check tasks, priorities, time blocks

### During Day
1. [ ] Update task progress in UI
2. [ ] Mark tasks complete
3. [ ] Add notes and subtasks as needed

### Evening (5 minutes)
1. [ ] Generate daily report
2. [ ] Review progress and insights
3. [ ] Plan adjustments for tomorrow

## 🔧 Customization

### User Objectives
- [ ] Edit `backend/config.json` with your real objectives
- [ ] Update work hours and energy schedule
- [ ] Adjust default time estimates

### Sub-Agent Tuning
- [ ] Customize prompts in `agents/` folder if needed
- [ ] Test modifications with sample data
- [ ] Document any changes made

### Frontend Styling
- [ ] Customize colors in `frontend/tailwind.config.js`
- [ ] Adjust layout preferences
- [ ] Test responsive design on mobile

## 🚀 Ready to Use!

Once all items are checked, your task management system is ready for daily use.

### Quick Start Commands

```bash
# Morning processing
python scripts/process_morning.py

# Start web interface
cd frontend && npm run dev

# Generate evening report
python scripts/generate_report.py
```

### Need Help?

- Check the main `README.md` for detailed instructions
- Review individual component READMEs in each folder
- Run `python test_workflow.py --verbose` for diagnostic info
- Verify Supabase configuration if sync issues occur

**Happy task managing! 🎉**