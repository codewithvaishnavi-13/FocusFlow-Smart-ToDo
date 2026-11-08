const STORAGE_KEY = "focusflow_tasks_v1";
const THEME_KEY = "focusflow_theme_v1";

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const priorityInput = document.getElementById("priorityInput");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");

let tasks = loadTasks();
let currentFilter = "all";
let searchTerm = "";

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    console.warn("Could not read saved tasks:", error);
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function makeId() {
  return window.crypto && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function addTask(title, priority) {
  tasks.unshift({
    id: makeId(),
    title: title.trim(),
    priority,
    completed: false,
    createdAt: new Date().toISOString()
  });
  saveTasks();
  render();
}

function toggleTask(id) {
  tasks = tasks.map(task =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  saveTasks();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  render();
}

function clearCompleted() {
  tasks = tasks.filter(task => !task.completed);
  saveTasks();
  render();
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function createTaskElement(task) {
  const item = document.createElement("article");
  item.className = `task-item${task.completed ? " is-complete" : ""}`;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "task-check";
  checkbox.checked = task.completed;
  checkbox.setAttribute("aria-label", `Mark ${task.title} as ${task.completed ? "active" : "complete"}`);
  checkbox.addEventListener("change", () => toggleTask(task.id));

  const copy = document.createElement("div");
  copy.className = "task-copy";

  const title = document.createElement("span");
  title.className = "task-title";
  title.textContent = task.title;

  const meta = document.createElement("div");
  meta.className = "task-meta";

  const priority = document.createElement("span");
  priority.className = `priority ${task.priority}`;
  priority.textContent = `${task.priority} priority`;

  const time = document.createElement("span");
  time.className = "task-time";
  time.textContent = `Added ${formatDate(task.createdAt)}`;

  meta.append(priority, time);
  copy.append(title, meta);

  const remove = document.createElement("button");
  remove.className = "delete-button";
  remove.type = "button";
  remove.textContent = "×";
  remove.title = "Delete task";
  remove.setAttribute("aria-label", `Delete ${task.title}`);
  remove.addEventListener("click", () => deleteTask(task.id));

  item.append(checkbox, copy, remove);
  return item;
}

function render() {
  const completed = tasks.filter(task => task.completed).length;
  const pending = tasks.length - completed;
  const percent = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  document.getElementById("totalCount").textContent = tasks.length;
  document.getElementById("completedCount").textContent = completed;
  document.getElementById("pendingCount").textContent = pending;
  document.getElementById("progressPercent").textContent = `${percent}%`;
  document.getElementById("ringPercent").textContent = `${percent}%`;
  document.getElementById("progressRing").style.background =
    `conic-gradient(var(--accent) ${percent}%, rgba(155,123,255,.13) ${percent}%)`;
  document.getElementById("progressRing").setAttribute("aria-label", `${percent} percent complete`);
  document.getElementById("summaryBar").style.width = `${percent}%`;
  document.getElementById("summaryRate").textContent = `${percent}%`;
  document.getElementById("remainingText").textContent =
    pending === 0 ? "Nothing pending — enjoy the moment!" : `${pending} task${pending === 1 ? "" : "s"} left to complete`;
  document.getElementById("clearCompleted").disabled = completed === 0;
  document.getElementById("clearCompleted").style.opacity = completed === 0 ? ".45" : "1";

  const visibleTasks = tasks.filter(task => {
    const matchesFilter =
      currentFilter === "all" ||
      (currentFilter === "active" && !task.completed) ||
      (currentFilter === "completed" && task.completed);
    return matchesFilter && task.title.toLowerCase().includes(searchTerm);
  });

  taskList.replaceChildren(...visibleTasks.map(createTaskElement));
  document.getElementById("visibleCount").textContent =
    `${visibleTasks.length} task${visibleTasks.length === 1 ? "" : "s"}`;

  const noTasksAtAll = tasks.length === 0;
  emptyState.classList.toggle("show", visibleTasks.length === 0);
  if (noTasksAtAll) {
    emptyState.querySelector("h3").textContent = "Your space is clear";
    emptyState.querySelector("p").textContent = "Add a task above and turn your plans into progress.";
  } else {
    emptyState.querySelector("h3").textContent = "No tasks found";
    emptyState.querySelector("p").textContent = "Try another filter or search term.";
  }
}

taskForm.addEventListener("submit", event => {
  event.preventDefault();
  const title = taskInput.value.trim();
  if (!title) {
    taskInput.focus();
    return;
  }
  addTask(title, priorityInput.value);
  taskForm.reset();
  priorityInput.value = "medium";
  taskInput.focus();
});

document.querySelectorAll(".filter-button").forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    document.querySelectorAll(".filter-button").forEach(item =>
      item.classList.toggle("active", item === button)
    );
    render();
  });
});

searchInput.addEventListener("input", event => {
  searchTerm = event.target.value.trim().toLowerCase();
  render();
});

document.getElementById("clearCompleted").addEventListener("click", () => {
  if (tasks.some(task => task.completed) &&
      window.confirm("Delete all completed tasks?")) {
    clearCompleted();
  }
});

function applyTheme(theme) {
  document.body.classList.toggle("light-theme", theme === "light");
  document.getElementById("themeIcon").textContent = theme === "light" ? "☾" : "☼";
  localStorage.setItem(THEME_KEY, theme);
}

document.getElementById("themeToggle").addEventListener("click", () => {
  const nextTheme = document.body.classList.contains("light-theme") ? "dark" : "light";
  applyTheme(nextTheme);
});

const savedTheme = localStorage.getItem(THEME_KEY);
applyTheme(savedTheme === "light" ? "light" : "dark");

document.getElementById("todayLabel").textContent =
  new Date().toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });

render();
