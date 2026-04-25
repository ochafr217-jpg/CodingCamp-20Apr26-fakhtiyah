# Design Document: Todo List Life Dashboard

## Overview

The Todo List Life Dashboard is a single-page web application that provides a personal productivity interface combining time awareness, task management, focus timing, and quick website access. The application is built entirely with vanilla HTML, CSS, and JavaScript, requiring no build process or backend infrastructure.

### Core Design Principles

1. **Client-Side Only**: All functionality runs in the browser with no server dependencies
2. **Zero Build Process**: Direct HTML/CSS/JS files that can be opened in any browser
3. **Local Persistence**: Browser Local Storage API for all data persistence
4. **Vanilla JavaScript**: No frameworks or external dependencies
5. **Minimal UI**: Clean, uncluttered interface with clear visual hierarchy

### Key Features

- Real-time clock and date display with time-based greetings
- 25-minute focus timer with start/stop/reset controls
- Task list with add, edit, complete, and delete operations
- Quick links for favorite websites
- Automatic data persistence to Local Storage

## Architecture

### Application Structure

```
todo-list-life-dashboard/
├── index.html          # Main HTML structure
├── css/
│   └── styles.css      # All styling
└── js/
    └── app.js          # All application logic
```

### Component Architecture

The application follows a modular component pattern within a single JavaScript file:

```
┌─────────────────────────────────────┐
│         index.html (Entry)          │
└─────────────────────────────────────┘
                 │
                 ├─────────────────────┐
                 │                     │
         ┌───────▼──────┐      ┌──────▼──────┐
         │  styles.css  │      │   app.js    │
         └──────────────┘      └──────┬──────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
            ┌───────▼────────┐ ┌─────▼──────┐ ┌───────▼────────┐
            │ GreetingDisplay│ │ FocusTimer │ │   TaskList     │
            └────────────────┘ └────────────┘ └────────────────┘
                    │                 │                 │
                    └─────────────────┼─────────────────┘
                                      │
                              ┌───────▼────────┐
                              │  LocalStorage  │
                              │    Manager     │
                              └────────────────┘
```

### Data Flow

1. **Initialization**: On page load, retrieve data from Local Storage and render UI
2. **User Interaction**: User actions trigger event handlers
3. **State Update**: Event handlers update application state
4. **Persistence**: State changes are immediately saved to Local Storage
5. **UI Update**: DOM is updated to reflect new state

### State Management

Application state is managed through JavaScript objects and synchronized with Local Storage:

- **Tasks State**: Array of task objects `[{id, text, completed, createdAt}]`
- **Quick Links State**: Array of link objects `[{id, label, url}]`
- **Timer State**: Object `{duration, remaining, isRunning, intervalId}`

## Components and Interfaces

### 1. Greeting Display Component

**Purpose**: Display current time, date, and time-based greeting

**DOM Structure**:
```html
<div id="greeting-section">
  <div id="time-display"></div>
  <div id="date-display"></div>
  <div id="greeting-message"></div>
</div>
```

**JavaScript Interface**:
```javascript
const GreetingDisplay = {
  init() { /* Initialize and start clock */ },
  updateTime() { /* Update time display */ },
  updateDate() { /* Update date display */ },
  getGreeting(hour) { /* Return greeting based on hour */ },
  render() { /* Update all displays */ }
}
```

**Key Functions**:
- `getGreeting(hour: number): string` - Pure function mapping hour (0-23) to greeting text
  - 5-11: Morning greeting
  - 12-16: Afternoon greeting
  - 17-20: Evening greeting
  - 21-4: Night greeting
- `updateTime()` - Format and display current time
- `updateDate()` - Format and display current date

### 2. Focus Timer Component

**Purpose**: 25-minute countdown timer for focus sessions

**DOM Structure**:
```html
<div id="timer-section">
  <div id="timer-display">25:00</div>
  <div id="timer-controls">
    <button id="timer-start">Start</button>
    <button id="timer-stop">Stop</button>
    <button id="timer-reset">Reset</button>
  </div>
</div>
```

**JavaScript Interface**:
```javascript
const FocusTimer = {
  state: {
    duration: 25 * 60,      // 25 minutes in seconds
    remaining: 25 * 60,
    isRunning: false,
    intervalId: null
  },
  init() { /* Setup event listeners */ },
  start() { /* Begin countdown */ },
  stop() { /* Pause countdown */ },
  reset() { /* Reset to 25 minutes */ },
  tick() { /* Decrement timer by 1 second */ },
  formatTime(seconds) { /* Format seconds as MM:SS */ },
  render() { /* Update display */ }
}
```

**Key Functions**:
- `start()` - Start countdown if not running
- `stop()` - Pause countdown if running
- `reset()` - Reset to 25:00 and stop
- `tick()` - Decrement remaining time, stop at zero
- `formatTime(seconds: number): string` - Convert seconds to "MM:SS" format

### 3. Task List Component

**Purpose**: Manage todo items with CRUD operations

**DOM Structure**:
```html
<div id="task-section">
  <form id="task-form">
    <input type="text" id="task-input" placeholder="Add a new task...">
    <button type="submit">Add</button>
  </form>
  <ul id="task-list">
    <!-- Task items rendered here -->
  </ul>
</div>
```

**Task Item Structure**:
```html
<li class="task-item" data-id="unique-id">
  <input type="checkbox" class="task-checkbox">
  <span class="task-text">Task description</span>
  <button class="task-edit">Edit</button>
  <button class="task-delete">Delete</button>
</li>
```

**JavaScript Interface**:
```javascript
const TaskList = {
  tasks: [],
  init() { /* Load from storage and setup listeners */ },
  loadTasks() { /* Retrieve from Local Storage */ },
  saveTasks() { /* Persist to Local Storage */ },
  addTask(text) { /* Create new task */ },
  editTask(id, newText) { /* Update task text */ },
  toggleTask(id) { /* Toggle completion status */ },
  deleteTask(id) { /* Remove task */ },
  validateTaskText(text) { /* Check if text is valid */ },
  render() { /* Update DOM */ },
  renderTask(task) { /* Create task element */ }
}
```

**Task Data Model**:
```javascript
{
  id: string,           // Unique identifier (timestamp-based)
  text: string,         // Task description
  completed: boolean,   // Completion status
  createdAt: number     // Timestamp
}
```

**Key Functions**:
- `validateTaskText(text: string): boolean` - Pure function checking if text is non-empty after trimming
- `addTask(text: string)` - Create task if valid, save, and render
- `editTask(id: string, newText: string)` - Update task if valid, save, and render
- `toggleTask(id: string)` - Toggle completed status, save, and render
- `deleteTask(id: string)` - Remove task, save, and render

### 4. Quick Links Component

**Purpose**: Manage favorite website shortcuts

**DOM Structure**:
```html
<div id="links-section">
  <form id="link-form">
    <input type="text" id="link-label" placeholder="Label">
    <input type="url" id="link-url" placeholder="URL">
    <button type="submit">Add Link</button>
  </form>
  <div id="links-container">
    <!-- Link buttons rendered here -->
  </div>
</div>
```

**Link Button Structure**:
```html
<div class="link-item" data-id="unique-id">
  <a href="url" target="_blank" class="link-button">Label</a>
  <button class="link-delete">×</button>
</div>
```

**JavaScript Interface**:
```javascript
const QuickLinks = {
  links: [],
  init() { /* Load from storage and setup listeners */ },
  loadLinks() { /* Retrieve from Local Storage */ },
  saveLinks() { /* Persist to Local Storage */ },
  addLink(label, url) { /* Create new link */ },
  deleteLink(id) { /* Remove link */ },
  validateUrl(url) { /* Check if URL is valid */ },
  render() { /* Update DOM */ },
  renderLink(link) { /* Create link element */ }
}
```

**Link Data Model**:
```javascript
{
  id: string,      // Unique identifier
  label: string,   // Display text
  url: string      // Target URL
}
```

### 5. Local Storage Manager

**Purpose**: Centralized storage operations

**JavaScript Interface**:
```javascript
const StorageManager = {
  KEYS: {
    TASKS: 'dashboard_tasks',
    LINKS: 'dashboard_links'
  },
  get(key) { /* Retrieve and parse data */ },
  set(key, data) { /* Stringify and save data */ },
  remove(key) { /* Delete data */ },
  clear() { /* Clear all app data */ }
}
```

**Key Functions**:
- `get(key: string): any` - Retrieve and deserialize data from Local Storage
- `set(key: string, data: any): void` - Serialize and save data to Local Storage
- Error handling for quota exceeded and parse errors

## Data Models

### Task Model

```javascript
{
  id: string,           // Unique ID (Date.now() + random)
  text: string,         // Task description (non-empty, trimmed)
  completed: boolean,   // Completion status (default: false)
  createdAt: number     // Creation timestamp
}
```

**Validation Rules**:
- `text`: Must be non-empty after trimming whitespace
- `id`: Must be unique within task list
- `completed`: Boolean value only

### Quick Link Model

```javascript
{
  id: string,      // Unique ID (Date.now() + random)
  label: string,   // Display label (non-empty)
  url: string      // Valid URL (must include protocol)
}
```

**Validation Rules**:
- `label`: Must be non-empty after trimming
- `url`: Must be valid URL format (checked with URL constructor)
- `id`: Must be unique within links list

### Timer State Model

```javascript
{
  duration: number,      // Total duration in seconds (1500 for 25 min)
  remaining: number,     // Remaining seconds
  isRunning: boolean,    // Timer active status
  intervalId: number|null // setInterval ID for cleanup
}
```

## Data Storage Schema

### Local Storage Keys

- `dashboard_tasks`: JSON array of task objects
- `dashboard_links`: JSON array of link objects

### Storage Format

**Tasks**:
```json
[
  {
    "id": "1234567890123",
    "text": "Complete project documentation",
    "completed": false,
    "createdAt": 1234567890123
  }
]
```

**Links**:
```json
[
  {
    "id": "1234567890124",
    "label": "GitHub",
    "url": "https://github.com"
  }
]
```

### Storage Operations

All storage operations use try-catch blocks to handle:
- Quota exceeded errors
- JSON parse errors
- Null/undefined values

## Error Handling

### Storage Errors

**Quota Exceeded**:
- Catch `QuotaExceededError` during save operations
- Display user-friendly message
- Prevent data loss by maintaining in-memory state

**Parse Errors**:
- Catch `SyntaxError` during JSON.parse
- Fall back to empty array/default state
- Log error to console for debugging

### Validation Errors

**Invalid Task Text**:
- Check for empty/whitespace-only strings
- Prevent submission with visual feedback
- Maintain current state

**Invalid URL**:
- Use URL constructor to validate
- Catch TypeError for invalid URLs
- Display error message to user

### Timer Errors

**Multiple Intervals**:
- Clear existing interval before starting new one
- Prevent memory leaks
- Ensure only one timer runs at a time

### DOM Errors

**Missing Elements**:
- Check for null before accessing DOM elements
- Fail gracefully with console warnings
- Prevent application crashes

## Testing Strategy

Given the nature of this application (UI-heavy, client-side only, no complex business logic), the testing strategy focuses on **manual testing** and **example-based unit tests** rather than property-based testing.

### Why Property-Based Testing Is Not Appropriate

This feature is primarily:
1. **UI rendering and interactions** - Better tested with visual/snapshot tests or manual testing
2. **Simple CRUD operations** - Local Storage read/write with no complex transformations
3. **Browser API integration** - Timer, storage, DOM manipulation
4. **No build/test infrastructure** - Per requirements, this is a simple HTML/CSS/JS project

### Recommended Testing Approach

#### 1. Manual Testing Checklist

**Greeting Display**:
- [ ] Time updates every second
- [ ] Date displays correctly
- [ ] Morning greeting (5 AM - 11:59 AM)
- [ ] Afternoon greeting (12 PM - 4:59 PM)
- [ ] Evening greeting (5 PM - 8:59 PM)
- [ ] Night greeting (9 PM - 4:59 AM)

**Focus Timer**:
- [ ] Initializes at 25:00
- [ ] Start button begins countdown
- [ ] Stop button pauses countdown
- [ ] Reset button returns to 25:00
- [ ] Timer stops at 00:00
- [ ] Display updates every second while running

**Task Management**:
- [ ] Add task with valid text
- [ ] Reject empty task submission
- [ ] Edit task text
- [ ] Reject empty edit
- [ ] Toggle task completion (visual indicator)
- [ ] Delete task
- [ ] Tasks persist after page reload

**Quick Links**:
- [ ] Add link with valid URL and label
- [ ] Link opens in new tab
- [ ] Delete link
- [ ] Links persist after page reload

**Data Persistence**:
- [ ] Tasks saved to Local Storage
- [ ] Links saved to Local Storage
- [ ] Data loads on page refresh
- [ ] Empty state displays correctly

#### 2. Browser Compatibility Testing

Test in each browser:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)
- [ ] Safari (latest)

Verify:
- Local Storage API works
- Timer functions correctly
- UI renders properly
- No console errors

#### 3. Example-Based Unit Tests (Optional)

If unit tests are added later, focus on pure functions:

**Greeting Logic**:
```javascript
// Test getGreeting function
assert(getGreeting(8) === "Good morning")
assert(getGreeting(14) === "Good afternoon")
assert(getGreeting(18) === "Good evening")
assert(getGreeting(22) === "Good night")
```

**Task Validation**:
```javascript
// Test validateTaskText function
assert(validateTaskText("Valid task") === true)
assert(validateTaskText("") === false)
assert(validateTaskText("   ") === false)
assert(validateTaskText("  text  ") === true)
```

**Timer Formatting**:
```javascript
// Test formatTime function
assert(formatTime(1500) === "25:00")
assert(formatTime(0) === "00:00")
assert(formatTime(65) === "01:05")
```

**Storage Serialization**:
```javascript
// Test round-trip serialization
const tasks = [{id: "1", text: "Test", completed: false}]
const serialized = JSON.stringify(tasks)
const deserialized = JSON.parse(serialized)
assert(deepEqual(tasks, deserialized))
```

#### 4. Performance Testing

- [ ] Page loads within 2 seconds
- [ ] UI interactions respond within 100ms
- [ ] No visible lag in timer updates
- [ ] Storage operations don't block UI

#### 5. Visual Design Review

- [ ] Consistent color scheme
- [ ] Readable typography
- [ ] Clear component separation
- [ ] Proper visual hierarchy
- [ ] Minimal, uncluttered layout

### Testing Notes

- No test framework is included per requirements (NFR-1: No test setup required)
- Focus on manual testing during development
- Pure functions (greeting logic, validation, formatting) could be extracted and unit tested if needed
- Consider browser DevTools for debugging storage and performance

## Implementation Notes

### File Organization

**index.html**:
- Semantic HTML5 structure
- All component sections with proper IDs
- No inline styles or scripts
- Link to external CSS and JS

**css/styles.css**:
- CSS custom properties for theming
- Mobile-first responsive design
- Component-scoped class names
- Minimal, clean aesthetic

**js/app.js**:
- Component objects with clear separation
- Event delegation where appropriate
- DOMContentLoaded initialization
- Clear function naming and comments

### Performance Considerations

1. **Debouncing**: Not needed for this simple app, but could be added for rapid task additions
2. **Event Delegation**: Use for dynamically created task/link elements
3. **Storage Batching**: Save immediately per requirements, but could batch if performance issues arise
4. **Timer Precision**: Use setInterval with 1000ms, acceptable for this use case

### Browser API Usage

- **Local Storage**: Synchronous API, adequate for small data volumes
- **setInterval**: For timer and clock updates
- **Date**: For time/date display
- **URL Constructor**: For URL validation
- **DOM APIs**: querySelector, addEventListener, createElement

### Accessibility Considerations

- Semantic HTML elements
- Proper button labels
- Form labels (visible or aria-label)
- Keyboard navigation support
- Focus indicators
- ARIA attributes where appropriate

### Future Enhancements

Potential features not in current scope:
- Dark mode toggle
- Custom timer durations
- Task categories/tags
- Task due dates
- Export/import data
- Keyboard shortcuts
- Sound notification when timer completes
- Task statistics/analytics

## Visual Design Guidelines

### Color Scheme

Use a calm, minimal palette:
- Primary: Soft blue/teal for accents
- Background: Light neutral (off-white)
- Text: Dark gray (not pure black)
- Success: Soft green for completed tasks
- Danger: Soft red for delete actions

### Typography

- Sans-serif font family (system fonts for performance)
- Large, readable sizes for time display (48px+)
- Medium sizes for headings (24-32px)
- Standard sizes for body text (16-18px)
- Adequate line height (1.5-1.6)

### Layout

- Centered container with max-width (800-1000px)
- Generous whitespace between sections
- Card-based component design
- Responsive grid/flexbox layout
- Mobile-friendly touch targets (44px minimum)

### Component Styling

**Greeting Section**:
- Prominent time display
- Subtle date display
- Welcoming greeting message

**Timer Section**:
- Large countdown display
- Clear, accessible buttons
- Visual feedback for running state

**Task Section**:
- Clean input field
- Checkbox for completion
- Inline edit/delete buttons
- Strikethrough for completed tasks

**Links Section**:
- Button-style links
- Hover effects
- Compact layout

## Deployment

### Hosting Options

Since this is a static site with no backend:
1. **GitHub Pages**: Free, simple deployment
2. **Netlify**: Drag-and-drop deployment
3. **Vercel**: Git-based deployment
4. **Local File System**: Open index.html directly in browser

### Deployment Steps

1. Ensure all files are in correct structure
2. Test in multiple browsers
3. Upload to hosting service or serve locally
4. No build process required

### Browser Requirements

- Modern browser with ES6 support
- Local Storage enabled
- JavaScript enabled
- No special permissions required
