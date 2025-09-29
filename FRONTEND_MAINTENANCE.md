# Frontend Maintenance Guide

## Overview
This guide covers maintaining the modernized UI/UX system implemented on September 29, 2025.

## Development Workflow

### Daily Development
```bash
# Start development server
cd frontend && npm run dev
# Runs on http://localhost:3000

# Build for production
npm run build

# Type checking
npm run lint
```

### Testing Checklist
- [ ] Build completes without errors
- [ ] Development server starts without warnings
- [ ] All keyboard shortcuts work (⌘+R, ⌘+T, ⌘+1/2, ⌘+←/→)
- [ ] Task interactions are responsive
- [ ] Accessibility features function correctly

## Architecture

### Design System (`frontend/styles/design-tokens.css`)
**Purpose**: Central source of truth for all design values
**Key Sections**:
- Color palette with semantic mappings
- Typography scale with fluid sizing
- Spacing system (8pt grid)
- Animation timing and easing
- Shadow elevation system

**Updating Colors**:
```css
/* Modify semantic tokens */
--priority-p1-bg: var(--error-50);
--priority-p1-text: var(--error-700);
```

### Component Styles (`frontend/app/globals.css`)
**Purpose**: Reusable component classes and utilities
**Key Sections**:
- Button variants (btn, btn-primary, btn-secondary)
- Card components with hover states
- Input styling with focus states
- Priority badges and progress bars
- Task status indicators

**Adding New Component Styles**:
```css
@layer components {
  .new-component {
    /* Use design tokens */
    background-color: var(--bg-primary);
    border: var(--border-width-1) solid var(--border-primary);
    border-radius: var(--border-radius-md);
  }
}
```

### Modern Components (`frontend/components/modern/`)
**TaskCard.tsx**: Primary task display component
- Accessibility features (ARIA labels, keyboard navigation)
- Animation states (hover, focus, loading)
- Progressive disclosure for task details

**VirtualizedTaskList.tsx**: Performance component for large lists
- Uses react-window for virtualization
- Includes search and filtering
- Not currently used in main implementation

## Common Maintenance Tasks

### 1. Adding New Colors
```css
/* In design-tokens.css */
:root {
  --new-color-50: #f0f9ff;
  --new-color-500: #3b82f6;
  --new-color-900: #1e3a8a;
}

/* Add semantic mapping */
--status-new: var(--new-color-500);
```

### 2. Creating New Component Variants
```css
/* In globals.css @layer components */
.btn-danger {
  background-color: var(--error-600);
  color: var(--neutral-0);
  border-color: var(--error-600);
}

.btn-danger:hover:not(:disabled) {
  background-color: var(--error-700);
  border-color: var(--error-700);
}
```

### 3. Adding Keyboard Shortcuts
```typescript
// In app/page.tsx
useKeyboardShortcuts({
  'mod+n': () => {
    // New task action
  },
  'mod+shift+d': () => {
    // Delete task action
  }
})
```

### 4. Accessibility Updates
- Always include ARIA labels for interactive elements
- Test with keyboard navigation
- Verify color contrast ratios
- Use semantic HTML elements

## Performance Monitoring

### Bundle Analysis
```bash
# Analyze bundle size
npx @next/bundle-analyzer

# Check for duplicate dependencies
npm ls
```

### Core Web Vitals
Monitor these metrics in production:
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### Performance Best Practices
- Use `useCallback` and `useMemo` for expensive operations
- Implement virtualization for lists > 100 items
- Lazy load non-critical components
- Optimize images and icons

## Troubleshooting

### Build Errors
**TypeScript Errors**:
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**CSS Issues**:
- Check for missing closing braces in globals.css
- Verify design token references are correct
- Ensure Tailwind classes don't conflict with custom CSS

### Development Issues
**Hot Reload Not Working**:
- Restart development server
- Check for syntax errors in modified files
- Verify file paths are correct

**Performance Issues**:
- Check for console errors in browser
- Profile component re-renders with React DevTools
- Monitor network requests for unnecessary API calls

## Dependency Management

### Core Dependencies
- `next`: Framework (currently 14.2.33)
- `react`: UI library (currently 18)
- `@heroicons/react`: Icon system
- `@supabase/supabase-js`: Database client
- `tailwindcss`: Utility CSS framework

### Optional Dependencies
- `react-window`: Virtualization (for VirtualizedTaskList)
- `@types/react-window`: TypeScript support

### Updating Dependencies
```bash
# Check for updates
npm outdated

# Update specific package
npm install next@latest

# Update all dependencies (careful!)
npm update
```

## Browser Support

### Minimum Requirements
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Polyfills Needed
- CSS custom properties (automatically handled by Next.js)
- ES2020+ features (automatically polyfilled)

### Testing Matrix
- Test on mobile devices (iOS Safari, Chrome Android)
- Verify keyboard navigation works across browsers
- Check color rendering and contrast
- Test with screen readers (VoiceOver, NVDA)

## Deployment Checklist

### Pre-Deployment
- [ ] `npm run build` succeeds
- [ ] No TypeScript errors
- [ ] Accessibility testing passed
- [ ] Performance metrics within targets
- [ ] All keyboard shortcuts tested

### Post-Deployment
- [ ] Monitor Core Web Vitals
- [ ] Check error logs for console errors
- [ ] Verify all API calls work correctly
- [ ] Test on various devices and browsers

## Emergency Fixes

### Quick Rollback
If critical issues arise, these files can be quickly reverted:
1. `frontend/app/globals.css` - Reset to basic styling
2. `frontend/components/TaskList.tsx` - Revert to simple implementation
3. `frontend/app/page.tsx` - Remove keyboard shortcuts if problematic

### Hotfix Process
1. Identify the problematic component/style
2. Create minimal fix using design tokens
3. Test locally with `npm run build`
4. Deploy with monitoring

## Contact Information
For questions about the UI/UX system implementation, refer to:
- `UI_UX_MODERNIZATION.md` - Complete implementation details
- `CLAUDE.md` - Project-specific guidance
- Design system documentation in `frontend/styles/design-tokens.css`