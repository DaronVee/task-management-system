# Sub-Agent Prompt Templates

This folder contains specialized prompt templates for Claude Code sub-agents that power the task management system's intelligence layer.

## Available Sub-Agents

### 1. Task Extractor (`task-extractor.md`)
**Purpose**: Parse brain dumps into discrete, actionable tasks
- **Input**: Unstructured text/voice transcription
- **Output**: JSON array of task objects
- **When to use**: Process morning brain dumps, meeting notes, random thoughts

### 2. Priority Strategist (`priority-strategist.md`)
**Purpose**: Align tasks with objectives and assign strategic priorities
- **Input**: Raw tasks + user objectives
- **Output**: Prioritized tasks with P1/P2/P3 levels
- **When to use**: After task extraction, before scheduling

### 3. Task Architect (`task-architect.md`)
**Purpose**: Structure tasks with metadata, estimates, and success criteria
- **Input**: Prioritized task list
- **Output**: Fully structured task objects
- **When to use**: After prioritization, before scheduling

### 4. Day Optimizer (`day-optimizer.md`)
**Purpose**: Create optimal time-blocked daily schedules
- **Input**: Structured tasks + calendar constraints
- **Output**: Time-blocked schedule optimized for energy and flow
- **When to use**: Final step of morning workflow

### 5. Progress Analyst (`progress-analyst.md`)
**Purpose**: Analyze completion patterns and identify improvement opportunities
- **Input**: Historical task data and completion statistics
- **Output**: Performance insights and recommendations
- **When to use**: Weekly reviews, when performance seems off

### 6. Report Composer (`report-composer.md`)
**Purpose**: Generate insightful daily/weekly/monthly reports
- **Input**: Task data + progress insights
- **Output**: Formatted reports with achievements and next steps
- **When to use**: Evening daily reports, weekly/monthly reviews

### 7. Task Coach (`task-coach.md`)
**Purpose**: Unblock stuck tasks with specific guidance
- **Input**: Stuck task details and blocker description
- **Output**: Specific unblocking strategies and next steps
- **When to use**: When tasks have been stalled for 24+ hours

## How to Use with Claude Code

### Setting Up Sub-Agents

1. **Create each sub-agent** in Claude Code using the prompts from these files
2. **Name them consistently**: Use the exact names (task-extractor, priority-strategist, etc.)
3. **Test individually**: Verify each agent works with sample inputs
4. **Chain them together**: Use orchestration scripts to connect them

### Agent Chaining Example

```
Morning Workflow:
Brain Dump → task-extractor → priority-strategist → task-architect → day-optimizer → Supabase
```

### Individual Agent Usage

```python
# In your Python scripts, call agents like this:
result = claude_code.call_agent("task-extractor", {
    "brain_dump": "Today I need to fix the bug, call mom, and maybe write docs...",
    "config": config_data
})
```

## Configuration Variables

Several agents reference configuration that gets injected:

- `{OBJECTIVES_WILL_BE_INSERTED_HERE}` - User objectives from config.json
- `{USER_PREFERENCES_WILL_BE_INSERTED_HERE}` - User preferences and settings

Make sure your orchestration scripts inject these values before calling the agents.

## Agent Output Standards

All agents return structured JSON for easy parsing and chaining:

### Common Output Format
```json
{
  "agent_name": "task-extractor",
  "timestamp": "2025-01-29T10:30:00Z",
  "input_summary": "Brief description of what was processed",
  "output_count": 5,
  "processing_notes": ["Any important notes"],
  "data": [/* Agent-specific structured output */]
}
```

### Error Handling
Agents should include error recovery:
```json
{
  "success": false,
  "error": "Description of what went wrong",
  "partial_results": [/* Any data that could be extracted */],
  "suggestions": ["How to fix the input or try again"]
}
```

## Customization Guidelines

### Modifying Prompts
- **Keep the structure**: Don't change input/output formats without updating code
- **Test thoroughly**: Changes can affect downstream agents
- **Version control**: Keep track of prompt iterations

### Adding New Agents
- **Follow naming convention**: Use lowercase with hyphens
- **Document inputs/outputs**: Be specific about expected data formats
- **Update orchestration**: Modify workflow scripts to include new agents

### Tuning Performance
- **Adjust complexity**: Some agents can use smaller models for speed
- **Batch processing**: Group similar tasks for efficiency
- **Caching results**: Store agent outputs to avoid reprocessing

## Troubleshooting

### Common Issues
1. **Agent not found**: Check agent names match exactly
2. **JSON parse errors**: Verify agent output format
3. **Context too large**: Break inputs into smaller chunks
4. **Inconsistent results**: Add more specific examples to prompts

### Debug Tips
- **Test with sample data**: Use known inputs to verify outputs
- **Log all interactions**: Keep records of agent calls and responses
- **Validate JSON**: Check that agent outputs are properly formatted
- **Monitor token usage**: Some agents may be expensive to run frequently

## Best Practices

### Performance
- **Chain efficiently**: Only run agents when input data has changed
- **Cache aggressively**: Store results between runs
- **Batch when possible**: Process multiple items together

### Quality
- **Validate inputs**: Check data quality before calling agents
- **Handle errors gracefully**: Don't let one agent failure break the chain
- **Monitor outputs**: Review agent results for quality and consistency

### Maintenance
- **Update regularly**: Improve prompts based on real usage
- **Document changes**: Keep notes on why prompts were modified
- **Test regressions**: Verify changes don't break existing functionality

---

*These sub-agents form the intelligence core of your task management system. They handle all the complex reasoning so your Python code can focus on simple data movement.*