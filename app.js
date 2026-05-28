const STORAGE_KEY = "xpod-workout-sets-v1";

const elements = {
  transcript: document.querySelector("#transcript"),
  micStatus: document.querySelector("#mic-status"),
  parseFeedback: document.querySelector("#parse-feedback"),
  startBtn: document.querySelector("#start-btn"),
  stopBtn: document.querySelector("#stop-btn"),
  parseBtn: document.querySelector("#parse-btn"),
  form: document.querySelector("#set-form"),
  exercise: document.querySelector("#exercise"),
  weight: document.querySelector("#weight"),
  reps: document.querySelector("#reps"),
  rpe: document.querySelector("#rpe"),
  logBody: document.querySelector("#log-body"),
  suggestions: document.querySelector("#suggestions"),
  clearBtn: document.querySelector("#clear-btn"),
};

let sets = loadSets();
let recognition = null;

boot();

function boot() {
  setupSpeechRecognition();
  wireEvents();
  render();
}

function setupSpeechRecognition() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    elements.startBtn.disabled = true;
    elements.stopBtn.disabled = true;
    elements.micStatus.textContent = "Unsupported";
    elements.parseFeedback.textContent =
      "Speech recognition is not available in this browser. You can still paste text and parse it.";
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = true;
  recognition.continuous = true;

  recognition.onstart = () => {
    setMicStatus("Listening", "listening");
    elements.startBtn.disabled = true;
    elements.stopBtn.disabled = false;
    elements.parseFeedback.textContent = "Listening...";
  };

  recognition.onerror = (event) => {
    elements.parseFeedback.textContent =
      "Mic error: " + (event.error || "Unknown issue");
  };

  recognition.onresult = (event) => {
    let transcript = "";
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      transcript += event.results[i][0].transcript + " ";
    }
    elements.transcript.value = (elements.transcript.value + " " + transcript).trim();
  };

  recognition.onend = () => {
    setMicStatus("Idle", "idle");
    elements.startBtn.disabled = false;
    elements.stopBtn.disabled = true;
  };
}

function wireEvents() {
  elements.startBtn.addEventListener("click", () => {
    if (recognition) {
      elements.transcript.value = "";
      recognition.start();
    }
  });

  elements.stopBtn.addEventListener("click", () => {
    if (recognition) recognition.stop();
  });

  elements.parseBtn.addEventListener("click", () => {
    parseTranscriptIntoDraft(elements.transcript.value);
  });

  elements.form.addEventListener("submit", (event) => {
    event.preventDefault();
    saveDraftAsSet();
  });

  elements.clearBtn.addEventListener("click", () => {
    const confirmed = window.confirm(
      "Clear all logged sets? This cannot be undone."
    );
    if (!confirmed) return;
    sets = [];
    persistSets();
    render();
  });
}

function setMicStatus(label, statusClass) {
  elements.micStatus.textContent = label;
  elements.micStatus.className = "badge " + statusClass;
}

function parseTranscriptIntoDraft(rawText) {
  const text = String(rawText || "").toLowerCase().trim();
  if (!text) {
    elements.parseFeedback.textContent = "Nothing to parse yet.";
    return;
  }

  const exerciseMatch = text.match(
    /^([a-zA-Z ]+?)(?:\s+\d|\s+at\s+\d|\s+pounds|\s+lbs|\s+kg|$)/
  );
  const weightMatch =
    text.match(/(\d+(?:\.\d+)?)\s*(?:lb|lbs|pound|pounds|kg)/) ||
    text.match(/(?:at\s+)?(\d+(?:\.\d+)?)\s*(?:for|x|\*)\s*\d+/);
  const repsMatch = text.match(/(\d+)\s*(?:rep|reps)/) || text.match(/x\s*(\d+)/);
  const rpeMatch = text.match(/rpe\s*(\d+(?:\.\d+)?)/);

  if (exerciseMatch?.[1]) {
    elements.exercise.value = titleCase(exerciseMatch[1].trim());
  }
  if (weightMatch?.[1]) {
    elements.weight.value = Number(weightMatch[1]);
  }
  if (repsMatch?.[1]) {
    elements.reps.value = Number(repsMatch[1]);
  }
  if (rpeMatch?.[1]) {
    elements.rpe.value = Number(rpeMatch[1]);
  }

  elements.parseFeedback.textContent =
    "Parsed transcript. Review fields, then save set.";
}

function saveDraftAsSet() {
  const exercise = elements.exercise.value.trim();
  const weight = Number(elements.weight.value);
  const reps = Number(elements.reps.value);
  const rpe = elements.rpe.value ? Number(elements.rpe.value) : null;

  if (!exercise || !Number.isFinite(weight) || !Number.isFinite(reps)) {
    elements.parseFeedback.textContent = "Exercise, weight, and reps are required.";
    return;
  }

  const entry = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    exercise,
    weight,
    reps,
    rpe,
  };

  sets.unshift(entry);
  persistSets();
  elements.form.reset();
  elements.parseFeedback.textContent = "Set saved.";
  render();
}

function render() {
  renderLog();
  renderSuggestions();
}

function renderLog() {
  elements.logBody.innerHTML = "";
  if (sets.length === 0) {
    elements.logBody.innerHTML =
      '<tr><td colspan="6">No sets logged yet.</td></tr>';
    return;
  }

  for (const set of sets) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${formatTime(set.timestamp)}</td>
      <td>${set.exercise}</td>
      <td>${set.weight.toFixed(1)} lb</td>
      <td>${set.reps}</td>
      <td>${set.rpe ?? "-"}</td>
      <td>${(set.weight * set.reps).toFixed(0)}</td>
    `;
    elements.logBody.appendChild(row);
  }
}

function renderSuggestions() {
  elements.suggestions.innerHTML = "";

  const grouped = groupByExercise(sets);
  const exerciseNames = Object.keys(grouped);
  if (exerciseNames.length === 0) {
    elements.suggestions.innerHTML =
      "<li>Log at least two sessions for an exercise to get overload recommendations.</li>";
    return;
  }

  for (const exercise of exerciseNames) {
    const history = grouped[exercise].sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );
    const insight = buildOverloadInsight(history);
    const item = document.createElement("li");
    item.className = insight.level;
    item.innerHTML = `
      <strong>${exercise}</strong><br />
      ${insight.message}
      <div class="meta">${insight.meta}</div>
    `;
    elements.suggestions.appendChild(item);
  }
}

function buildOverloadInsight(history) {
  if (history.length < 2) {
    return {
      level: "warn",
      message: "Need one more logged set to compare progress.",
      meta: "Tip: log this lift again next session.",
    };
  }

  const last = history[history.length - 1];
  const prev = history[history.length - 2];
  const lastVolume = last.weight * last.reps;
  const prevVolume = prev.weight * prev.reps;
  const volumeDelta = lastVolume - prevVolume;

  if (last.weight > prev.weight && last.reps >= prev.reps) {
    return {
      level: "good",
      message:
        "Great progression. You increased load without dropping reps.",
      meta: "Next target: add 2.5 to 5 lb if bar speed stays solid.",
    };
  }

  if (last.weight === prev.weight && last.reps > prev.reps) {
    return {
      level: "good",
      message: "Rep PR achieved at the same weight.",
      meta: "Next target: keep reps or add 2.5 lb next workout.",
    };
  }

  if (volumeDelta >= 0) {
    return {
      level: "warn",
      message:
        "Volume is flat to slightly up. You are maintaining, but not clearly overloading.",
      meta: "Try one extra rep or a small weight increase next session.",
    };
  }

  return {
    level: "warn",
    message: "Performance dipped compared with your previous logged set.",
    meta: "Consider repeating weight with better recovery, then progress.",
  };
}

function groupByExercise(allSets) {
  return allSets.reduce((acc, set) => {
    if (!acc[set.exercise]) acc[set.exercise] = [];
    acc[set.exercise].push(set);
    return acc;
  }, {});
}

function loadSets() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistSets() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sets));
}

function formatTime(isoString) {
  const date = new Date(isoString);
  return (
    date.toLocaleDateString([], { month: "short", day: "numeric" }) +
    " " +
    date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
  );
}

function titleCase(value) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
