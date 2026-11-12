const DEFAULT_DURATION = 25;

async function initializeTimer() {
  const { timeOption, isRunning, endTime } = await chrome.storage.local.get([
    "timeOption",
    "isRunning",
    "endTime",
  ]);

  const updates = {};

  if (timeOption === undefined) {
    updates.timeOption = DEFAULT_DURATION;
  }

  if (isRunning === undefined) {
    updates.isRunning = false;
  }

  if (endTime === undefined) {
    updates.endTime = null;
  }

  if (Object.keys(updates).length > 0) {
    await chrome.storage.local.set(updates);
  }

  await checkTimer();
}

async function checkTimer() {
  const {
    isRunning,
    endTime,
    timeOption = DEFAULT_DURATION,
  } = await chrome.storage.local.get(["isRunning", "endTime", "timeOption"]);

  if (!isRunning || !endTime) return;

  if (Date.now() >= endTime) {
    await chrome.storage.local.set({
      isRunning: false,
      endTime: null,
      remainingTime: null,
    });

    await chrome.alarms.clear("pomodoroTimer");

    await chrome.notifications.create({
      type: "basic",
      iconUrl: "icon.png",
      title: "Pomodoro Timer",
      message: `${timeOption} minutes have passed!`,
    });
  }
}

chrome.runtime.onInstalled.addListener(initializeTimer);
chrome.runtime.onStartup.addListener(initializeTimer);

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "pomodoroTimer") {
    checkTimer();
  }
});
