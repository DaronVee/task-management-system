# AI-Powered Task Management System

A complete task management system powered by Claude Code sub-agents, featuring intelligent task processing, strategic prioritization, and optimal scheduling.

## 🎯 System Overview

This system transforms morning brain dumps into structured, prioritized, and optimally scheduled daily tasks using a chain of specialized Claude Code sub-agents.

### Architecture Flow
```
Morning Brain Dump
    ↓
Claude Code Sub-Agents (Intelligence Layer)
    ↓
Python Scripts (Sync Layer)
    ↓
Supabase Database (Data Layer)
    ↓
Next.js Frontend (Interface Layer)
```

## ✨ Key Features

- **🤖 AI-Powered Processing**: 7 specialized sub-agents handle task extraction, prioritization, and scheduling
- **⚡ Real-time Sync**: Bi-directional updates between frontend and database
- **📊 Smart Analytics**: Progress tracking, pattern recognition, and productivity insights
- **⏰ Time Block Optimization**: Aligns tasks with your energy levels and availability
- **📱 Responsive UI**: Works seamlessly on desktop and mobile devices
- **🔄 Automated Reports**: Daily, weekly, and monthly productivity reports

## 🧠 Sub-Agent Intelligence

The system uses 7 specialized Claude Code sub-agents:

1. **Task Extractor** - Parses brain dumps into discrete, actionable tasks
2. **Priority Strategist** - Aligns tasks with objectives and assigns strategic priorities
3. **Task Architect** - Adds metadata, time estimates, and success criteria
4. **Day Optimizer** - Creates optimal time-blocked schedules
5. **Progress Analyst** - Identifies patterns and improvement opportunities
6. **Report Composer** - Generates insightful daily/weekly/monthly reports
7. **Task Coach** - Provides guidance for stuck or blocked tasks

## 📁 Project Structure

```
task-management/
├── backend/                 # Python backend and data models
│   ├── models.py           # Pydantic data models
│   ├── sync.py             # Supabase sync layer
│   ├── config.json         # User objectives and preferences
│   └── schema.sql          # Database schema
├── scripts/                # Workflow orchestration
│   ├── process_morning.py  # Morning brain dump processing
│   └── generate_report.py  # Report generation
├── agents/                 # Sub-agent prompt templates
│   ├── task-extractor.md
│   ├── priority-strategist.md
│   └── [5 more agents...]
├── frontend/               # Next.js web interface
│   ├── app/               # Next.js app router
│   ├── components/        # React components
│   └── lib/              # Utilities and Supabase client
├── data/                  # Local data storage
│   ├── input/            # Brain dumps
│   ├── processed/        # Sub-agent outputs
│   ├── daily/           # Daily task files
│   └── reports/         # Generated reports
└── test_workflow.py      # End-to-end testing
```

## 🚀 Quick Start

### 1. Initial Setup

```bash
# Clone or create the project directory
cd task-management

# Run the setup script
python setup.py

# Install backend dependencies
pip install -r backend/requirements.txt

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Database Setup

1. **Create Supabase project**: Go to [supabase.com](https://supabase.com)
2. **Run schema**: Copy `backend/schema.sql` into Supabase SQL Editor
3. **Enable realtime**: Turn on for `daily_tasks` table
4. **Get credentials**: Copy URL and anon key from Settings > API

### 3. Environment Configuration

```bash
# Backend environment
cp backend/.env.example backend/.env
# Edit backend/.env with your Supabase credentials

# Frontend environment
cp frontend/.env.example frontend/.env.local
# Edit frontend/.env.local with your Supabase credentials
```

### 4. Claude Code Sub-Agents

Set up sub-agents in Claude Code using the prompts from the `agents/` folder:

1. Create 7 sub-agents with names: `task-extractor`, `priority-strategist`, `task-architect`, `day-optimizer`, `progress-analyst`, `report-composer`, `task-coach`
2. Use the corresponding `.md` files as prompts
3. Test each agent individually before chaining

### 5. Test the System

```bash
# Run end-to-end tests
python test_workflow.py

# Test with sample data (optional)
python test_workflow.py --skip-supabase
```

## 📝 Daily Workflow

### Morning Routine (5 minutes)

1. **Write brain dump**: Edit `data/input/brain_dump.txt` with your thoughts
2. **Process with Claude Code**: Run the morning workflow
3. **Review results**: Check the web UI at `http://localhost:3000`

### During the Day

- **Update progress**: Mark tasks complete, update status, add notes
- **Real-time sync**: Changes appear instantly across all devices
- **Stay focused**: Use time blocks to align work with energy

### Evening Review (5 minutes)

1. **Generate report**: Claude Code creates daily insights
2. **Review patterns**: See what worked and what didn't
3. **Plan tomorrow**: Adjust approach based on learnings

## 🖥️ Frontend Usage

### Start the Frontend

```bash
cd frontend
npm run dev
# Open http://localhost:3000
```

### Key Features

- **📋 List View**: Detailed task management with expandable cards
- **⏰ Time Block View**: Visual schedule organized by energy periods
- **📊 Progress Dashboard**: Real-time completion metrics and insights
- **📅 Date Navigation**: View tasks for any day
- **🎯 Priority Filtering**: Focus on what matters most

### Keyboard Shortcuts

- `Space`: Mark task complete/incomplete
- `E`: Expand/collapse task details
- `Arrow keys`: Navigate between tasks
- `Enter`: Edit task when focused

## 🔧 Customization

### User Objectives

Edit `backend/config.json` to customize:
- Personal/professional objectives
- Work hours and energy schedule
- Default time estimates
- Sub-agent preferences

### Sub-Agent Tuning

Modify prompts in `agents/` folder to:
- Adjust prioritization criteria
- Change time block preferences
- Customize report formats
- Add new analysis dimensions

### Frontend Styling

Customize appearance in:
- `frontend/tailwind.config.js` - Colors and themes
- `frontend/app/globals.css` - Custom styles
- `frontend/lib/utils.ts` - Display logic

## 📊 Analytics & Reports

### Daily Reports
- Task completion summary
- Time usage analysis
- Energy alignment insights
- Tomorrow's focus recommendations

### Weekly Reports
- Productivity patterns
- Objective progress
- Process improvements
- Scheduling optimizations

### Monthly Reports
- Strategic goal review
- System evolution tracking
- Performance trends
- Capacity planning

## 🛠️ Development

### Backend Development

```bash
# Install development dependencies
pip install pytest black flake8 mypy

# Run tests
pytest backend/tests/

# Format code
black backend/

# Type checking
mypy backend/
```

### Frontend Development

```bash
# Install development dependencies (included in package.json)
cd frontend

# Run in development mode
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Type checking
npx tsc --noEmit
```

## 🔍 Troubleshooting

### Common Issues

1. **Sub-agents not working**:
   - Verify Claude Code setup
   - Check agent prompt formatting
   - Test individual agents first

2. **Database connection errors**:
   - Verify Supabase credentials
   - Check network connectivity
   - Confirm RLS policies

3. **Frontend not loading tasks**:
   - Check browser console for errors
   - Verify environment variables
   - Test API endpoints directly

4. **Real-time sync issues**:
   - Confirm Supabase realtime is enabled
   - Check WebSocket connectivity
   - Verify database triggers

### Debug Mode

Set `DEBUG=true` in environment files for additional logging.

### Getting Help

1. **Check the logs**: Both Python and Next.js provide detailed error messages
2. **Test components**: Use `test_workflow.py` to isolate issues
3. **Review documentation**: Each folder has specific README files
4. **Verify setup**: Ensure all dependencies and configurations are correct

## 🎯 Optimization Tips

### Performance
- Use local caching for frequently accessed data
- Batch database operations when possible
- Optimize sub-agent prompts for speed vs accuracy trade-offs

### Productivity
- Customize objectives to match your real goals
- Experiment with time block durations
- Use the task coach agent for stuck items
- Review weekly reports for system improvements

### Workflow
- Process brain dumps immediately after writing
- Keep brain dumps conversational and natural
- Trust the prioritization but override when needed
- Use subtasks for complex multi-step items

## 📈 Future Enhancements

Potential improvements to consider:

- **Calendar Integration**: Sync with Google Calendar or Outlook
- **Mobile App**: Native iOS/Android apps
- **Voice Input**: Speech-to-text for brain dumps
- **Team Features**: Shared tasks and collaborative planning
- **Advanced Analytics**: Predictive modeling and recommendations
- **Automation**: Auto-scheduling based on patterns
- **Integrations**: Connect with other productivity tools

## 📄 License

This project is open source and available under the MIT License. Feel free to modify and distribute as needed.

## 🙏 Acknowledgments

- **Claude Code**: For providing the sub-agent infrastructure
- **Supabase**: For real-time database and authentication
- **Next.js**: For the modern React framework
- **Tailwind CSS**: For utility-first styling

---

**Built with ❤️ and AI-powered intelligence**

*Transform your daily brain dumps into strategic, scheduled, and successful task completion.*