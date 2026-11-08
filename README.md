# FocusFlow — Smart To-Do Manager

A responsive task manager built with HTML5, CSS3 and vanilla JavaScript.

## Features
- Add tasks using the Add button or Enter key
- Mark tasks as complete and delete individual tasks
- Task priority labels (High, Medium, Low)
- Filter tasks: All, Active, Completed
- Search tasks by title
- Dashboard statistics and completion progress
- Animated glassmorphism interface
- Dark / light theme toggle
- Saves tasks and theme in browser LocalStorage

## Run locally
1. Download and extract `FocusFlow-Smart-ToDo.zip`.
2. Open the extracted folder in Visual Studio Code.
3. Open `index.html` in your browser, or use the **Live Server** extension.
4. Add a task and refresh the page to verify LocalStorage persistence.

No backend, installation, API key or build step is required.

## Files
- `index.html` — page structure
- `style.css` — responsive glassmorphism styling and animations
- `script.js` — task logic, events, dashboard and LocalStorage

## Notes
Tasks are stored in the current browser on the current device. Clearing browser site data may remove saved tasks.
