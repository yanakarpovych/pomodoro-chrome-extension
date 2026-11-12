const DEFAULT_DURATION = 25;

const timeDisplay = document.getElementById("time");
const startTimerBtn = document.getElementById("start-timer-btn");
const resetTimerBtn = document.getElementById("reset-timer-btn");
const addTaskBtn = document.getElementById("add-task-btn");
const taskContainer = document.getElementById("task-container");

let tasks = [];

// Timer

async function getTimerState() {
  return chrome.storage.local.get([
    "timeOption",
    "isRunning",
    "endTime",
    "remainingTime",
  ]);
}

async function updateTime() {
  const {
    timeOption = DEFAULT_DURATION,
    isRunning = false,
    endTime,
    remainingTime,
  } = await getTimerState();

  let secondsLeft = remainingTime ?? timeOption * 60;

  if (isRunning && endTime) {
    secondsLeft = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
  }

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  timeDisplay.textContent =
    `${String(minutes).padStart(2, "0")}:` +
    `${String(seconds).padStart(2, "0")}`;

  startTimerBtn.textContent = isRunning ? "Pause Timer" : "Start Timer";
}

startTimerBtn.addEventListener("click", async () => {
  const {
    timeOption = DEFAULT_DURATION,
    isRunning,
    endTime,
    remainingTime,
  } = await getTimerState();

  if (isRunning) {
    const secondsLeft = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));

    await chrome.storage.local.set({
      isRunning: false,
      endTime: null,
      remainingTime: secondsLeft,
    });

    await chrome.alarms.clear("pomodoroTimer");
  } else {
    const secondsLeft = remainingTime ?? timeOption * 60;
    const newEndTime = Date.now() + secondsLeft * 1000;

    await chrome.storage.local.set({
      isRunning: true,
      endTime: newEndTime,
      remainingTime: null,
    });

    await chrome.alarms.create("pomodoroTimer", {
      when: newEndTime,
    });
  }

  updateTime();
});

resetTimerBtn.addEventListener("click", async () => {
  await chrome.alarms.clear("pomodoroTimer");

  await chrome.storage.local.set({
    isRunning: false,
    endTime: null,
    remainingTime: null,
  });

  updateTime();
});

updateTime();
setInterval(updateTime, 1000);

// Tasks

async function loadTasks() {
  const result = await chrome.storage.sync.get("tasks");
  tasks = result.tasks ?? [];
  renderTasks();
}

function saveTasks() {
  chrome.storage.sync.set({ tasks });
}

function renderTask(taskNum) {
  const taskRow = document.createElement("div");

  const text = document.createElement("input");
  text.type = "text";
  text.placeholder = "Enter a task...";
  text.value = tasks[taskNum];
  text.className = "task-input";

  text.addEventListener("change", () => {
    tasks[taskNum] = text.value;
    saveTasks();
  });

  const deleteBtn = document.createElement("input");
  deleteBtn.type = "button";
  deleteBtn.value = "X";
  deleteBtn.className = "task-delete";

  deleteBtn.addEventListener("click", () => {
    deleteTask(taskNum);
  });

  taskRow.appendChild(text);
  taskRow.appendChild(deleteBtn);
  taskContainer.appendChild(taskRow);
}

function addTask() {
  tasks.push("");
  renderTasks();
  saveTasks();
}

function deleteTask(taskNum) {
  tasks.splice(taskNum, 1);
  renderTasks();
  saveTasks();
}

function renderTasks() {
  taskContainer.textContent = "";

  tasks.forEach((task, index) => {
    renderTask(index);
  });
}

addTaskBtn.addEventListener("click", addTask);

loadTasks();
