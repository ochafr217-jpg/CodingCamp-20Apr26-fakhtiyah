// Todo List Life Dashboard - Main Application Logic

// Application will be initialized here
// Components: GreetingDisplay, FocusTimer, TaskList, QuickLinks, StorageManager

// ===== Storage Manager =====
// Centralized Local Storage operations with error handling
const StorageManager = {
  // Storage keys for different data types
  KEYS: {
    TASKS: 'dashboard_tasks',
    LINKS: 'dashboard_links',
    SORT_PREFERENCE: 'dashboard_sort_preference',
    THEME: 'dashboard_theme',
    USER_NAME: 'dashboard_user_name'
  },

  /**
   * Retrieve and parse data from Local Storage
   * @param {string} key - Storage key to retrieve
   * @returns {any} Parsed data or null if not found or error occurs
   */
  get(key) {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return null;
      }
      return JSON.parse(item);
    } catch (error) {
      if (error instanceof SyntaxError) {
        console.error(`Parse error for key "${key}":`, error);
        return null;
      }
      console.error(`Error retrieving key "${key}":`, error);
      return null;
    }
  },

  /**
   * Stringify and save data to Local Storage
   * @param {string} key - Storage key to save under
   * @param {any} data - Data to serialize and save
   * @returns {boolean} True if successful, false if error occurs
   */
  set(key, data) {
    try {
      const serialized = JSON.stringify(data);
      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error('Storage quota exceeded. Unable to save data.');
        alert('Storage quota exceeded. Please delete some items to free up space.');
        return false;
      }
      console.error(`Error saving key "${key}":`, error);
      return false;
    }
  },

  /**
   * Remove data from Local Storage
   * @param {string} key - Storage key to remove
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing key "${key}":`, error);
    }
  }
};

// ===== Greeting Display Component =====
// Displays current time, date, and time-based greeting
const GreetingDisplay = {
  // User's name for personalized greeting
  userName: '',

  /**
   * Initialize the greeting display and start the clock
   */
  init() {
    this.loadName();
    this.updateTime();
    this.updateDate();
    this.updateGreeting();
    this.setupEventListeners();
    // Update time every second
    setInterval(() => {
      this.updateTime();
      this.updateDate();
      this.updateGreeting();
    }, 1000);
  },

  /**
   * Set up event listeners for name input
   */
  setupEventListeners() {
    const saveNameBtn = document.getElementById('save-name-btn');
    const nameInput = document.getElementById('name-input');
    
    if (saveNameBtn) {
      saveNameBtn.addEventListener('click', () => {
        this.saveName();
      });
    }
    
    // Allow saving name with Enter key
    if (nameInput) {
      nameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.saveName();
        }
      });
    }
  },

  /**
   * Load saved user name from Local Storage
   */
  loadName() {
    const savedName = StorageManager.get(StorageManager.KEYS.USER_NAME);
    this.userName = savedName || '';
    
    // Update the input field with saved name
    const nameInput = document.getElementById('name-input');
    if (nameInput && this.userName) {
      nameInput.value = this.userName;
    }
  },

  /**
   * Save user name to Local Storage
   */
  saveName() {
    const nameInput = document.getElementById('name-input');
    if (!nameInput) return;
    
    const name = nameInput.value.trim();
    this.userName = name;
    
    // Save to Local Storage
    StorageManager.set(StorageManager.KEYS.USER_NAME, this.userName);
    
    // Update greeting immediately
    this.updateGreeting();
    
    // Provide visual feedback
    const saveNameBtn = document.getElementById('save-name-btn');
    if (saveNameBtn) {
      const originalText = saveNameBtn.textContent;
      saveNameBtn.textContent = 'Saved!';
      setTimeout(() => {
        saveNameBtn.textContent = originalText;
      }, 1500);
    }
  },

  /**
   * Update and display the current time
   */
  updateTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    
    // Format time as HH:MM:SS with leading zeros
    const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    const timeDisplay = document.getElementById('time-display');
    if (timeDisplay) {
      timeDisplay.textContent = timeString;
    }
  },

  /**
   * Update and display the current date
   */
  updateDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = now.toLocaleDateString('en-US', options);
    
    const dateDisplay = document.getElementById('date-display');
    if (dateDisplay) {
      dateDisplay.textContent = dateString;
    }
  },

  /**
   * Get greeting message based on hour of day
   * @param {number} hour - Hour in 24-hour format (0-23)
   * @returns {string} Greeting message
   */
  getGreeting(hour) {
    if (hour >= 5 && hour <= 11) {
      return 'Good Morning';
    } else if (hour >= 12 && hour <= 16) {
      return 'Good Afternoon';
    } else if (hour >= 17 && hour <= 20) {
      return 'Good Evening';
    } else {
      return 'Good Night';
    }
  },

  /**
   * Update and display the greeting message
   */
  updateGreeting() {
    const now = new Date();
    const hour = now.getHours();
    const greeting = this.getGreeting(hour);
    
    // Add user name to greeting if available
    const fullGreeting = this.userName ? `${greeting}, ${this.userName}!` : greeting;
    
    const greetingMessage = document.getElementById('greeting-message');
    if (greetingMessage) {
      greetingMessage.textContent = fullGreeting;
    }
  }
};

// ===== Focus Timer Component =====
// Customizable countdown timer for focus sessions
const FocusTimer = {
  // Timer state management
  state: {
    duration: 25 * 60,      // Default 25 minutes in seconds (1500)
    remaining: 25 * 60,     // Remaining seconds
    isRunning: false,       // Timer active status
    intervalId: null        // setInterval ID for cleanup
  },

  /**
   * Initialize the focus timer
   */
  init() {
    this.loadDuration();
    this.render();
    
    // Add event listeners for control buttons
    const startBtn = document.getElementById('timer-start');
    const stopBtn = document.getElementById('timer-stop');
    const resetBtn = document.getElementById('timer-reset');
    
    if (startBtn) {
      startBtn.addEventListener('click', () => this.start());
    }
    if (stopBtn) {
      stopBtn.addEventListener('click', () => this.stop());
    }
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.reset());
    }
    
    // Add event listener for duration input
    const durationInput = document.getElementById('timer-duration');
    if (durationInput) {
      durationInput.addEventListener('change', (e) => {
        this.setDuration(parseInt(e.target.value, 10));
      });
    }
  },

  /**
   * Load saved duration from Local Storage
   */
  loadDuration() {
    const savedDuration = StorageManager.get('dashboard_timer_duration');
    if (savedDuration && savedDuration >= 60) {
      this.state.duration = savedDuration;
      this.state.remaining = savedDuration;
    }
    
    // Update duration input if it exists
    const durationInput = document.getElementById('timer-duration');
    if (durationInput) {
      durationInput.value = Math.floor(this.state.duration / 60);
    }
  },

  /**
   * Save duration to Local Storage
   */
  saveDuration() {
    StorageManager.set('dashboard_timer_duration', this.state.duration);
  },

  /**
   * Set custom duration for the timer
   * @param {number} minutes - Duration in minutes (minimum 1)
   */
  setDuration(minutes) {
    // Validate minimum 1 minute
    if (minutes < 1 || isNaN(minutes)) {
      alert('Duration must be at least 1 minute.');
      // Reset input to current duration
      const durationInput = document.getElementById('timer-duration');
      if (durationInput) {
        durationInput.value = Math.floor(this.state.duration / 60);
      }
      return;
    }
    
    // Stop timer if running
    this.stop();
    
    // Update duration and remaining time
    this.state.duration = minutes * 60;
    this.state.remaining = this.state.duration;
    
    // Save to Local Storage
    this.saveDuration();
    
    // Update display
    this.render();
  },

  /**
   * Start the countdown timer
   */
  start() {
    // Only start if not already running
    if (!this.state.isRunning) {
      this.state.isRunning = true;
      // Create interval that calls tick() every 1000ms (1 second)
      this.state.intervalId = setInterval(() => this.tick(), 1000);
    }
  },

  /**
   * Stop/pause the countdown timer
   */
  stop() {
    // Only stop if currently running
    if (this.state.isRunning) {
      this.state.isRunning = false;
      // Clear the interval
      clearInterval(this.state.intervalId);
      this.state.intervalId = null;
    }
  },

  /**
   * Reset the timer to configured duration and stop
   */
  reset() {
    // Stop the timer if it's running
    this.stop();
    // Reset remaining time to duration
    this.state.remaining = this.state.duration;
    // Update the display
    this.render();
  },

  /**
   * Decrement timer by 1 second (called every second when running)
   */
  tick() {
    // Decrement remaining time
    this.state.remaining--;
    // Update the display
    this.render();
    // Stop when reaching zero
    if (this.state.remaining <= 0) {
      this.stop();
    }
  },

  /**
   * Format seconds as MM:SS or HH:MM:SS for durations over 60 minutes
   * @param {number} seconds - Total seconds to format
   * @returns {string} Formatted time string
   */
  formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    // If duration is 60 minutes or more, show hours
    if (this.state.duration >= 3600) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    } else {
      return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    }
  },

  /**
   * Update the timer display
   */
  render() {
    const timerDisplay = document.getElementById('timer-display');
    if (timerDisplay) {
      timerDisplay.textContent = this.formatTime(this.state.remaining);
    }
  }
};

// ===== Task List Component =====
// Manage todo items with CRUD operations
const TaskList = {
  // Array to store all tasks
  tasks: [],
  // Current sort criteria
  sortCriteria: 'newest',

  /**
   * Initialize the task list component
   */
  init() {
    this.loadTasks();
    this.loadSortPreference();
    this.render();
    this.setupEventListeners();
  },

  /**
   * Set up event listeners for task list interactions
   */
  setupEventListeners() {
    // Form submission handler for adding tasks
    const taskForm = document.getElementById('task-form');
    if (taskForm) {
      taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const taskInput = document.getElementById('task-input');
        if (taskInput) {
          const text = taskInput.value;
          const success = this.addTask(text);
          if (success) {
            taskInput.value = ''; // Clear input on success
            this.render();
          } else {
            // Provide user feedback for validation errors
            if (text.trim() === '') {
              alert('Task text cannot be empty.');
            } else {
              alert('This task already exists.');
            }
          }
        }
      });
    }

    // Sort dropdown handler
    const sortSelect = document.getElementById('task-sort');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.sortCriteria = e.target.value;
        this.saveSortPreference();
        this.render();
      });
    }

    // Event delegation for task list actions
    const taskList = document.getElementById('task-list');
    if (taskList) {
      taskList.addEventListener('click', (e) => {
        const target = e.target;
        const taskItem = target.closest('.task-item');
        
        if (!taskItem) return;
        
        const taskId = taskItem.getAttribute('data-id');
        if (!taskId) return;

        // Handle checkbox toggle
        if (target.classList.contains('task-checkbox')) {
          this.toggleTask(taskId);
          this.render();
        }

        // Handle edit button
        if (target.classList.contains('task-edit')) {
          this.enterEditMode(taskItem, taskId);
        }

        // Handle delete button
        if (target.classList.contains('task-delete')) {
          this.deleteTask(taskId);
          this.render();
        }
      });
    }
  },

  /**
   * Enter edit mode for a task
   * @param {HTMLElement} taskItem - The task list item element
   * @param {string} taskId - The task ID
   */
  enterEditMode(taskItem, taskId) {
    // Find the task
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return;

    // Find the text span
    const textSpan = taskItem.querySelector('.task-text');
    if (!textSpan) return;

    // Create input field
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'task-edit-input';
    input.value = task.text;

    // Save handler
    const saveEdit = () => {
      const newText = input.value;
      const success = this.editTask(taskId, newText);
      if (success) {
        this.render();
      } else {
        // Provide user feedback for validation errors
        if (newText.trim() === '') {
          alert('Task text cannot be empty.');
        } else {
          alert('This task already exists.');
        }
        this.render(); // Restore original view
      }
    };

    // Cancel handler
    const cancelEdit = () => {
      this.render();
    };

    // Event listeners for input
    input.addEventListener('blur', saveEdit);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        saveEdit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cancelEdit();
      }
    });

    // Replace text span with input
    textSpan.replaceWith(input);
    input.focus();
    input.select();
  },

  /**
   * Render the entire task list
   * Clears and re-renders all tasks in the DOM
   */
  render() {
    const taskList = document.getElementById('task-list');
    if (!taskList) return;

    // Clear existing tasks
    taskList.innerHTML = '';

    // Sort tasks based on current criteria
    const sortedTasks = this.sortTasks(this.sortCriteria);

    // Update sort dropdown to reflect current selection
    const sortSelect = document.getElementById('task-sort');
    if (sortSelect) {
      sortSelect.value = this.sortCriteria;
    }

    // Render each task
    sortedTasks.forEach(task => {
      const taskElement = this.renderTask(task);
      taskList.appendChild(taskElement);
    });
  },

  /**
   * Load tasks from Local Storage
   * Retrieves saved tasks or initializes with empty array
   */
  loadTasks() {
    const savedTasks = StorageManager.get(StorageManager.KEYS.TASKS);
    // If tasks exist in storage, use them; otherwise use empty array
    this.tasks = savedTasks || [];
  },

  /**
   * Save tasks to Local Storage
   * Persists current tasks array to storage
   */
  saveTasks() {
    StorageManager.set(StorageManager.KEYS.TASKS, this.tasks);
  },

  /**
   * Load sort preference from Local Storage
   * Retrieves saved sort criteria or uses default 'newest'
   */
  loadSortPreference() {
    const savedSort = StorageManager.get(StorageManager.KEYS.SORT_PREFERENCE);
    this.sortCriteria = savedSort || 'newest';
  },

  /**
   * Save sort preference to Local Storage
   * Persists current sort criteria
   */
  saveSortPreference() {
    StorageManager.set(StorageManager.KEYS.SORT_PREFERENCE, this.sortCriteria);
  },

  /**
   * Sort tasks based on criteria
   * @param {string} criteria - Sort criteria: 'newest', 'oldest', 'completed', 'pending'
   * @returns {Array} Sorted copy of tasks array
   */
  sortTasks(criteria) {
    // Create a copy to avoid mutating original array
    const tasksCopy = [...this.tasks];

    switch (criteria) {
      case 'newest':
        // Sort by createdAt descending (newest first)
        return tasksCopy.sort((a, b) => b.createdAt - a.createdAt);
      
      case 'oldest':
        // Sort by createdAt ascending (oldest first)
        return tasksCopy.sort((a, b) => a.createdAt - b.createdAt);
      
      case 'completed':
        // Sort completed tasks first, then by creation date
        return tasksCopy.sort((a, b) => {
          if (a.completed === b.completed) {
            return b.createdAt - a.createdAt;
          }
          return a.completed ? -1 : 1;
        });
      
      case 'pending':
        // Sort pending tasks first, then by creation date
        return tasksCopy.sort((a, b) => {
          if (a.completed === b.completed) {
            return b.createdAt - a.createdAt;
          }
          return a.completed ? 1 : -1;
        });
      
      default:
        // Default to newest first
        return tasksCopy.sort((a, b) => b.createdAt - a.createdAt);
    }
  },

  /**
   * Validate task text
   * Pure function that checks if task text is valid and not a duplicate
   * @param {string} text - Task text to validate
   * @returns {boolean} True if text is valid and not duplicate, false otherwise
   */
  validateTaskText(text) {
    // Check for non-empty text after trimming whitespace
    const trimmedText = text.trim();
    if (trimmedText === '') {
      return false;
    }

    // Check for duplicate tasks (case-insensitive comparison)
    const isDuplicate = this.tasks.some(task => 
      task.text.toLowerCase() === trimmedText.toLowerCase()
    );
    
    return !isDuplicate;
  },

  /**
   * Add a new task to the task list
   * @param {string} text - Task text to add
   * @returns {boolean} True if task was added successfully, false if validation failed
   */
  addTask(text) {
    // Validate the task text
    if (!this.validateTaskText(text)) {
      return false;
    }

    // Create new task object
    const timestamp = Date.now();
    const newTask = {
      id: String(timestamp),
      text: text.trim(),
      completed: false,
      createdAt: timestamp
    };

    // Add task to the tasks array
    this.tasks.push(newTask);

    // Save to Local Storage
    this.saveTasks();

    return true;
  },

  /**
   * Edit an existing task's text
   * @param {string} id - Task ID to edit
   * @param {string} newText - New text for the task
   * @returns {boolean} True if task was edited successfully, false if validation failed or task not found
   */
  editTask(id, newText) {
    // Validate non-empty text after trimming
    const trimmedText = newText.trim();
    if (trimmedText === '') {
      return false;
    }

    // Find the task by id
    const taskIndex = this.tasks.findIndex(task => task.id === id);
    if (taskIndex === -1) {
      return false;
    }

    // Check for duplicate tasks (case-insensitive), excluding the current task being edited
    const isDuplicate = this.tasks.some((task, index) => 
      index !== taskIndex && task.text.toLowerCase() === trimmedText.toLowerCase()
    );
    
    if (isDuplicate) {
      return false;
    }

    // Update the task text
    this.tasks[taskIndex].text = trimmedText;

    // Save to Local Storage
    this.saveTasks();

    return true;
  },

  /**
   * Toggle task completion status
   * @param {string} id - Task ID to toggle
   * @returns {boolean} True if task was toggled successfully, false if task not found
   */
  toggleTask(id) {
    // Find the task by id
    const task = this.tasks.find(task => task.id === id);
    if (!task) {
      return false;
    }

    // Toggle the completed status
    task.completed = !task.completed;

    // Save to Local Storage
    this.saveTasks();

    return true;
  },

  /**
   * Delete a task from the task list
   * @param {string} id - Task ID to delete
   * @returns {boolean} True if task was deleted successfully, false if task not found
   */
  deleteTask(id) {
    // Find the task index by id
    const taskIndex = this.tasks.findIndex(task => task.id === id);
    if (taskIndex === -1) {
      return false;
    }

    // Remove the task from the tasks array
    this.tasks.splice(taskIndex, 1);

    // Save to Local Storage
    this.saveTasks();

    return true;
  },

  /**
   * Render a task as a DOM element
   * @param {Object} task - Task object to render
   * @returns {HTMLElement} List item element representing the task
   */
  renderTask(task) {
    // Create list item element
    const li = document.createElement('li');
    li.className = 'task-item';
    li.setAttribute('data-id', task.id);
    
    // Add completed class if task is completed
    if (task.completed) {
      li.classList.add('completed');
    }

    // Create checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = task.completed;

    // Create task text span
    const textSpan = document.createElement('span');
    textSpan.className = 'task-text';
    textSpan.textContent = task.text;

    // Create edit button
    const editButton = document.createElement('button');
    editButton.className = 'task-edit';
    editButton.textContent = 'Edit';

    // Create delete button
    const deleteButton = document.createElement('button');
    deleteButton.className = 'task-delete';
    deleteButton.textContent = 'Delete';

    // Append all elements to list item
    li.appendChild(checkbox);
    li.appendChild(textSpan);
    li.appendChild(editButton);
    li.appendChild(deleteButton);

    return li;
  }
};

// ===== Quick Links Component =====
// Manage favorite website shortcuts
const QuickLinks = {
  // Array to store all links
  links: [],

  /**
   * Initialize the quick links component
   */
  init() {
    this.loadLinks();
    this.render();
    this.setupEventListeners();
  },

  /**
   * Set up event listeners for quick links interactions
   */
  setupEventListeners() {
    // Form submission handler for adding links
    const linkForm = document.getElementById('link-form');
    if (linkForm) {
      linkForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const labelInput = document.getElementById('link-label');
        const urlInput = document.getElementById('link-url');
        
        if (labelInput && urlInput) {
          const label = labelInput.value;
          const url = urlInput.value;
          const success = this.addLink(label, url);
          
          if (success) {
            // Clear inputs on success
            labelInput.value = '';
            urlInput.value = '';
            this.render();
          } else {
            // Provide user feedback for validation errors
            if (label.trim() === '') {
              alert('Link label cannot be empty.');
            } else if (!this.validateUrl(url)) {
              alert('Please enter a valid URL (e.g., https://example.com).');
            }
          }
        }
      });
    }

    // Event delegation for delete actions
    const linksContainer = document.getElementById('links-container');
    if (linksContainer) {
      linksContainer.addEventListener('click', (e) => {
        const target = e.target;
        
        // Handle delete button
        if (target.classList.contains('link-delete')) {
          const linkItem = target.closest('.link-item');
          if (linkItem) {
            const linkId = linkItem.getAttribute('data-id');
            if (linkId) {
              this.deleteLink(linkId);
              this.render();
            }
          }
        }
      });
    }
  },

  /**
   * Load links from Local Storage
   * Retrieves saved links or initializes with empty array
   */
  loadLinks() {
    const savedLinks = StorageManager.get(StorageManager.KEYS.LINKS);
    // If links exist in storage, use them; otherwise use empty array
    this.links = savedLinks || [];
  },

  /**
   * Save links to Local Storage
   * Persists current links array to storage
   */
  saveLinks() {
    StorageManager.set(StorageManager.KEYS.LINKS, this.links);
  },

  /**
   * Validate URL format
   * Pure function that checks if URL is valid using URL constructor
   * @param {string} url - URL string to validate
   * @returns {boolean} True if URL is valid, false otherwise
   */
  validateUrl(url) {
    try {
      // URL constructor will throw TypeError for invalid URLs
      new URL(url);
      return true;
    } catch (error) {
      // TypeError indicates invalid URL format
      return false;
    }
  },

  /**
   * Add a new link to the quick links list
   * @param {string} label - Display label for the link
   * @param {string} url - Target URL for the link
   * @returns {boolean} True if link was added successfully, false if validation failed
   */
  addLink(label, url) {
    // Validate label is non-empty after trimming
    const trimmedLabel = label.trim();
    if (trimmedLabel === '') {
      return false;
    }

    // Validate URL format
    if (!this.validateUrl(url)) {
      return false;
    }

    // Create new link object
    const timestamp = Date.now();
    const newLink = {
      id: String(timestamp),
      label: trimmedLabel,
      url: url
    };

    // Add link to the links array
    this.links.push(newLink);

    // Save to Local Storage
    this.saveLinks();

    return true;
  },

  /**
   * Delete a link from the quick links list
   * @param {string} id - Link ID to delete
   * @returns {boolean} True if link was deleted successfully, false if link not found
   */
  deleteLink(id) {
    // Find the link index by id
    const linkIndex = this.links.findIndex(link => link.id === id);
    if (linkIndex === -1) {
      return false;
    }

    // Remove the link from the links array
    this.links.splice(linkIndex, 1);

    // Save to Local Storage
    this.saveLinks();

    return true;
  },

  /**
   * Render the entire links container
   * Clears and re-renders all links in the DOM
   */
  render() {
    const linksContainer = document.getElementById('links-container');
    if (!linksContainer) return;

    // Clear existing links
    linksContainer.innerHTML = '';

    // Render each link
    this.links.forEach(link => {
      const linkElement = this.renderLink(link);
      linksContainer.appendChild(linkElement);
    });
  },

  /**
   * Render a link as a DOM element
   * @param {Object} link - Link object to render
   * @returns {HTMLElement} Div element representing the link
   */
  renderLink(link) {
    // Create link item container
    const linkItem = document.createElement('div');
    linkItem.className = 'link-item';
    linkItem.setAttribute('data-id', link.id);

    // Create anchor tag with target="_blank" for opening in new tab
    const anchor = document.createElement('a');
    anchor.href = link.url;
    anchor.target = '_blank';
    anchor.className = 'link-button';
    anchor.textContent = link.label;

    // Create delete button
    const deleteButton = document.createElement('button');
    deleteButton.className = 'link-delete';
    deleteButton.textContent = '×';

    // Append elements to link item
    linkItem.appendChild(anchor);
    linkItem.appendChild(deleteButton);

    return linkItem;
  }
};

// ===== Theme Manager Component =====
// Manage light/dark theme switching
const ThemeManager = {
  // Current theme state
  currentTheme: 'light',

  /**
   * Initialize the theme manager
   */
  init() {
    this.loadTheme();
    this.setupEventListeners();
  },

  /**
   * Set up event listeners for theme toggle
   */
  setupEventListeners() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        this.toggleTheme();
      });
    }
  },

  /**
   * Load saved theme from Local Storage
   * Applies saved theme or defaults to light theme
   */
  loadTheme() {
    const savedTheme = StorageManager.get(StorageManager.KEYS.THEME);
    this.currentTheme = savedTheme || 'light';
    this.applyTheme(this.currentTheme);
  },

  /**
   * Save theme preference to Local Storage
   */
  saveTheme() {
    StorageManager.set(StorageManager.KEYS.THEME, this.currentTheme);
  },

  /**
   * Apply theme to the document
   * @param {string} theme - Theme to apply ('light' or 'dark')
   */
  applyTheme(theme) {
    const html = document.documentElement;
    const themeToggle = document.getElementById('theme-toggle');
    
    if (theme === 'dark') {
      html.setAttribute('data-theme', 'dark');
      if (themeToggle) {
        themeToggle.textContent = '☀️';
        themeToggle.setAttribute('aria-label', 'Switch to light theme');
      }
    } else {
      html.removeAttribute('data-theme');
      if (themeToggle) {
        themeToggle.textContent = '🌙';
        themeToggle.setAttribute('aria-label', 'Switch to dark theme');
      }
    }
  },

  /**
   * Toggle between light and dark themes
   */
  toggleTheme() {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme(this.currentTheme);
    this.saveTheme();
  }
};

// ===== Application Initialization =====
// Initialize all components when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing Todo List Life Dashboard...');
  
  // Initialize Theme Manager (load theme first for smooth initial render)
  ThemeManager.init();
  
  // Initialize Greeting Display
  GreetingDisplay.init();
  
  // Initialize Focus Timer
  FocusTimer.init();
  
  // Initialize Task List
  TaskList.init();
  
  // Initialize Quick Links
  QuickLinks.init();
  
  console.log('Dashboard initialized successfully');
});
