const DEFAULT_DURATION = 25;

const form = document.getElementById("options-form");
const timeInput = document.getElementById("time-option");
const status = document.getElementById("status");

async function loadSettings() {
  const { timeOption = DEFAULT_DURATION } =
    await chrome.storage.local.get("timeOption");

  timeInput.value = timeOption;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const duration = Number(timeInput.value);

  if (!Number.isInteger(duration) || duration < 1 || duration > 180) {
    status.textContent = "Enter a duration between 1 and 180 minutes.";
    return;
  }

  await chrome.storage.local.set({
    timeOption: duration,
  });

  status.textContent = "Settings saved successfully!";
});

loadSettings();
