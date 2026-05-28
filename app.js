/* ============================================================
   XPOD — application entry
   - Hash-based router with separated views
   - Local-first workouts store with migration from v2
   - Voice console + rest timer + program templates
   - Optional Supabase cloud sync (guest by default)
   ============================================================ */

/* ---------- Constants & storage keys ----------------------- */
const STORAGE = {
  workouts: "xpod-workouts-v1",
  legacySets: "xpod-workout-sets-v2",
  authMode: "xpod-auth-mode-v1",
  sync: "xpod-sync-config-v1",
  activeId: "xpod-active-workout-v1",
};

const ROUTES = ["landing", "auth", "workouts", "programs", "program", "start", "workout", "stats", "settings"];
const PARENT_OF = {
  auth: "#/",
  programs: "#/workouts",
  program: "#/programs",
  start: "#/workouts",
  workout: "#/workouts",
  stats: "#/workouts",
  settings: "#/workouts",
};

/* ---------- Program templates ------------------------------ */
const PROGRAMS = [
  {
    id: "ppl",
    name: "Push · Pull · Legs",
    level: "Intermediate",
    schedule: "6 days/week",
    description: "Classic high-frequency hypertrophy split. Three movement patterns, repeated twice weekly.",
    days: [
      {
        id: "push-a",
        name: "Push A — Chest focus",
        exercises: [
          { name: "Bench Press", sets: 4, reps: "5-8" },
          { name: "Incline Dumbbell Press", sets: 3, reps: "8-10" },
          { name: "Overhead Press", sets: 3, reps: "6-8" },
          { name: "Cable Fly", sets: 3, reps: "12-15" },
          { name: "Triceps Pushdown", sets: 3, reps: "10-12" },
        ],
      },
      {
        id: "pull-a",
        name: "Pull A — Back width",
        exercises: [
          { name: "Pull Up", sets: 4, reps: "6-10" },
          { name: "Barbell Row", sets: 3, reps: "6-8" },
          { name: "Lat Pulldown", sets: 3, reps: "10-12" },
          { name: "Face Pull", sets: 3, reps: "12-15" },
          { name: "Barbell Curl", sets: 3, reps: "8-10" },
        ],
      },
      {
        id: "legs-a",
        name: "Legs A — Squat focus",
        exercises: [
          { name: "Back Squat", sets: 4, reps: "5-8" },
          { name: "Romanian Deadlift", sets: 3, reps: "6-8" },
          { name: "Leg Press", sets: 3, reps: "10-12" },
          { name: "Leg Curl", sets: 3, reps: "10-12" },
          { name: "Standing Calf Raise", sets: 4, reps: "8-12" },
        ],
      },
      {
        id: "push-b",
        name: "Push B — Shoulder focus",
        exercises: [
          { name: "Overhead Press", sets: 4, reps: "5-8" },
          { name: "Incline Bench Press", sets: 3, reps: "8-10" },
          { name: "Lateral Raise", sets: 4, reps: "12-15" },
          { name: "Dips", sets: 3, reps: "8-10" },
          { name: "Overhead Triceps Extension", sets: 3, reps: "10-12" },
        ],
      },
      {
        id: "pull-b",
        name: "Pull B — Back thickness",
        exercises: [
          { name: "Deadlift", sets: 3, reps: "3-5" },
          { name: "Chest-Supported Row", sets: 3, reps: "8-10" },
          { name: "Single-Arm Row", sets: 3, reps: "10-12" },
          { name: "Reverse Fly", sets: 3, reps: "12-15" },
          { name: "Hammer Curl", sets: 3, reps: "10-12" },
        ],
      },
      {
        id: "legs-b",
        name: "Legs B — Posterior chain",
        exercises: [
          { name: "Front Squat", sets: 4, reps: "5-8" },
          { name: "Hip Thrust", sets: 3, reps: "8-10" },
          { name: "Bulgarian Split Squat", sets: 3, reps: "8-10" },
          { name: "Leg Extension", sets: 3, reps: "12-15" },
          { name: "Seated Calf Raise", sets: 4, reps: "10-15" },
        ],
      },
    ],
  },
  {
    id: "upper-lower",
    name: "Upper · Lower",
    level: "Intermediate",
    schedule: "4 days/week",
    description: "Balanced strength + size. Two upper days, two lower days, ample recovery.",
    days: [
      { id: "upper-1", name: "Upper Strength", exercises: [
        { name: "Bench Press", sets: 4, reps: "4-6" },
        { name: "Barbell Row", sets: 4, reps: "5-7" },
        { name: "Overhead Press", sets: 3, reps: "6-8" },
        { name: "Pull Up", sets: 3, reps: "AMRAP" },
        { name: "Barbell Curl", sets: 3, reps: "8-10" },
      ]},
      { id: "lower-1", name: "Lower Strength", exercises: [
        { name: "Back Squat", sets: 4, reps: "4-6" },
        { name: "Romanian Deadlift", sets: 3, reps: "6-8" },
        { name: "Walking Lunge", sets: 3, reps: "10/leg" },
        { name: "Standing Calf Raise", sets: 4, reps: "8-12" },
      ]},
      { id: "upper-2", name: "Upper Hypertrophy", exercises: [
        { name: "Incline DB Press", sets: 4, reps: "8-10" },
        { name: "Chest-Supported Row", sets: 4, reps: "8-10" },
        { name: "Lateral Raise", sets: 4, reps: "12-15" },
        { name: "Lat Pulldown", sets: 3, reps: "10-12" },
        { name: "Triceps Pushdown", sets: 3, reps: "10-12" },
      ]},
      { id: "lower-2", name: "Lower Hypertrophy", exercises: [
        { name: "Front Squat", sets: 4, reps: "6-8" },
        { name: "Hip Thrust", sets: 3, reps: "8-10" },
        { name: "Leg Press", sets: 3, reps: "10-12" },
        { name: "Leg Curl", sets: 3, reps: "10-12" },
        { name: "Seated Calf Raise", sets: 4, reps: "10-15" },
      ]},
    ],
  },
  {
    id: "fullbody-3",
    name: "Full Body 3-Day",
    level: "Beginner-friendly",
    schedule: "3 days/week",
    description: "Compact, compound-forward template. Ideal if you're new to lifting.",
    days: [
      { id: "fb-a", name: "Day A", exercises: [
        { name: "Back Squat", sets: 3, reps: "5" },
        { name: "Bench Press", sets: 3, reps: "5" },
        { name: "Barbell Row", sets: 3, reps: "8" },
      ]},
      { id: "fb-b", name: "Day B", exercises: [
        { name: "Back Squat", sets: 3, reps: "5" },
        { name: "Overhead Press", sets: 3, reps: "5" },
        { name: "Deadlift", sets: 1, reps: "5" },
      ]},
      { id: "fb-c", name: "Day C", exercises: [
        { name: "Front Squat", sets: 3, reps: "5" },
        { name: "Bench Press", sets: 3, reps: "5" },
        { name: "Pull Up", sets: 3, reps: "AMRAP" },
      ]},
    ],
  },
  {
    id: "531bbb",
    name: "5/3/1 + BBB",
    level: "Advanced",
    schedule: "4 days/week",
    description: "Wendler's strength template with Boring But Big volume work.",
    days: [
      { id: "press", name: "Press Day", exercises: [
        { name: "Overhead Press", sets: 3, reps: "5/3/1" },
        { name: "Overhead Press (BBB)", sets: 5, reps: "10" },
        { name: "Chin Up", sets: 5, reps: "10" },
      ]},
      { id: "dl", name: "Deadlift Day", exercises: [
        { name: "Deadlift", sets: 3, reps: "5/3/1" },
        { name: "Deadlift (BBB)", sets: 5, reps: "10" },
        { name: "Hanging Leg Raise", sets: 5, reps: "15" },
      ]},
      { id: "bp", name: "Bench Day", exercises: [
        { name: "Bench Press", sets: 3, reps: "5/3/1" },
        { name: "Bench Press (BBB)", sets: 5, reps: "10" },
        { name: "Barbell Row", sets: 5, reps: "10" },
      ]},
      { id: "sq", name: "Squat Day", exercises: [
        { name: "Back Squat", sets: 3, reps: "5/3/1" },
        { name: "Back Squat (BBB)", sets: 5, reps: "10" },
        { name: "Standing Calf Raise", sets: 5, reps: "10" },
      ]},
    ],
  },
];

/* ---------- DOM & storage helpers (hoisted before boot) ----- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function saveJSON(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

/* ---------- State ------------------------------------------ */
const state = {
  authMode: localStorage.getItem(STORAGE.authMode) || "none", // none | guest | user
  workouts: [],
  activeWorkoutId: localStorage.getItem(STORAGE.activeId) || null,
  cloud: { client: null, user: null, config: loadJSON(STORAGE.sync, {}) },
  rest: { intervalId: null, secondsLeft: 0 },
  recognition: null,
  authTab: "login", // login | signup
};

/* ---------- Boot ------------------------------------------- */
boot();

function boot() {
  migrateLegacyData();
  state.workouts = loadJSON(STORAGE.workouts, []);
  hydrateCloudInputs();
  wireGlobalEvents();
  setupSpeechRecognition();
  registerServiceWorker();
  handleRoute();
  // Try to silently re-establish cloud session if credentials are saved
  restoreCloudSession().catch(() => {});
}

async function restoreCloudSession() {
  if (!state.cloud.config.url || !state.cloud.config.anonKey) return;
  try {
    const mod = await import("https://esm.sh/@supabase/supabase-js@2");
    state.cloud.client = mod.createClient(state.cloud.config.url, state.cloud.config.anonKey);
    const { data } = await state.cloud.client.auth.getSession();
    if (data?.session?.user) {
      state.cloud.user = data.session.user;
      if (state.authMode !== "user") {
        state.authMode = "user";
        localStorage.setItem(STORAGE.authMode, "user");
      }
      if ($(".view-settings.is-active")) renderSettings();
    }
  } catch {
    // network/import unavailable — guest still works
  }
}

function migrateLegacyData() {
  if (localStorage.getItem(STORAGE.workouts)) return;
  const legacy = loadJSON(STORAGE.legacySets, null);
  if (!Array.isArray(legacy) || legacy.length === 0) return;
  const sorted = [...legacy].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  const workout = {
    id: crypto.randomUUID(),
    name: "Imported sets",
    programId: null,
    programDayId: null,
    startedAt: sorted[0].timestamp,
    endedAt: sorted.at(-1).timestamp,
    planned: [],
    sets: sorted.map((s) => ({
      id: s.id || crypto.randomUUID(),
      exercise: s.exercise,
      weight: Number(s.weight),
      reps: Number(s.reps),
      rpe: s.rpe ?? null,
      timestamp: s.timestamp,
    })),
  };
  saveJSON(STORAGE.workouts, [workout]);
}

/* ---------- Router ----------------------------------------- */
function parseHash() {
  const hash = location.hash || "#/";
  const [pathPart, queryPart = ""] = hash.replace(/^#\/?/, "").split("?");
  const segments = pathPart.split("/").filter(Boolean);
  const params = Object.fromEntries(new URLSearchParams(queryPart));
  return { segments, params };
}

function navigate(hash) {
  if (location.hash === hash) handleRoute();
  else location.hash = hash;
}

window.addEventListener("hashchange", () => {
  handleRoute();
  // Smooth scroll to top on route change
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    window.scrollTo(0, 0);
  }
});

function handleRoute() {
  const { segments, params } = parseHash();
  let viewName = segments[0] || "";
  let entityId = segments[1];

  // Default route: landing if no auth chosen, else workouts
  if (!viewName) viewName = state.authMode === "none" ? "landing" : "workouts";

  // Auth-protected routes
  const protectedRoutes = ["workouts", "programs", "program", "start", "workout", "stats", "settings"];
  if (state.authMode === "none" && protectedRoutes.includes(viewName)) {
    return navigate("#/auth");
  }

  if (!ROUTES.includes(viewName)) viewName = "workouts";

  // Activate view
  $$(".view").forEach((node) => node.classList.toggle("is-active", node.dataset.view === viewName));

  // Update chrome
  updateChrome(viewName);
  updateTabbar(viewName);

  // Per-view render
  switch (viewName) {
    case "landing": renderLanding(); break;
    case "auth": renderAuth(params); break;
    case "workouts": renderWorkouts(); break;
    case "programs": renderPrograms(); break;
    case "program": renderProgram(entityId); break;
    case "start": renderStart(); break;
    case "workout": renderTracker(entityId); break;
    case "stats": renderStats(); break;
    case "settings": renderSettings(); break;
  }
}

function updateChrome(viewName) {
  const showTopbar = !["landing", "auth"].includes(viewName);
  const showTabbar = !["landing", "auth", "workout"].includes(viewName)
    && state.authMode !== "none";

  $("#topbar").hidden = !showTopbar;
  $("#tabbar").hidden = !showTabbar;

  document.body.classList.toggle("has-topbar", showTopbar);
  document.body.classList.toggle("no-tabbar", !showTabbar);

  // Back button visibility
  const isRoot = ["workouts", "landing"].includes(viewName);
  $("#back-btn").style.visibility = isRoot ? "hidden" : "visible";
}

function updateTabbar(viewName) {
  const tabFor = { workouts: "workouts", programs: "programs", program: "programs", start: "workouts", stats: "stats", settings: "settings", workout: "workouts" };
  const active = tabFor[viewName];
  $$(".tabbar a").forEach((a) => a.classList.toggle("is-active", a.dataset.tab === active));
}

/* ---------- Global events ---------------------------------- */
function wireGlobalEvents() {
  $("#back-btn").addEventListener("click", () => {
    const { segments } = parseHash();
    const view = segments[0] || "landing";
    const parent = PARENT_OF[view] || "#/workouts";
    navigate(parent);
  });

  // Auth view
  $$("[data-auth-tab]").forEach((btn) =>
    btn.addEventListener("click", () => setAuthTab(btn.dataset.authTab))
  );
  $("#auth-form").addEventListener("submit", (e) => {
    e.preventDefault();
    state.authTab === "signup" ? registerCloudUser() : loginCloudUser();
  });
  $("#guest-btn").addEventListener("click", continueAsGuest);
  $("#connect-cloud-btn").addEventListener("click", connectCloud);

  // Start picker
  $("#start-freestyle").addEventListener("click", () => startFreestyle());
  $("#start-quick-repeat").addEventListener("click", () => startQuickRepeat());

  // Tracker
  $("#start-btn").addEventListener("click", startListening);
  $("#stop-btn").addEventListener("click", stopListening);
  $("#parse-btn").addEventListener("click", () => parseTranscriptIntoDraft($("#transcript").value));
  $("#next-set-btn").addEventListener("click", prepareNextSetDraft);
  $("#set-form").addEventListener("submit", (e) => { e.preventDefault(); saveDraftAsSet(); });
  $("#start-rest-btn").addEventListener("click", () => {
    const seconds = Number($("#rest-seconds").value) || 90;
    startRestTimer(seconds);
  });
  $("#end-workout-btn").addEventListener("click", endActiveWorkout);

  // Stats
  $("#chart-exercise").addEventListener("change", drawChart);
  $("#chart-metric").addEventListener("change", drawChart);
  window.addEventListener("resize", drawChart);

  // Settings
  $("#settings-login-btn").addEventListener("click", () => navigate("#/auth"));
  $("#settings-logout-btn").addEventListener("click", logoutCloudUser);
  $("#push-sync-btn").addEventListener("click", pushToCloud);
  $("#pull-sync-btn").addEventListener("click", pullFromCloud);
  $("#clear-btn").addEventListener("click", () => {
    if (!confirm("Clear all local workouts? Cloud data is not touched.")) return;
    state.workouts = [];
    state.activeWorkoutId = null;
    saveJSON(STORAGE.workouts, []);
    localStorage.removeItem(STORAGE.activeId);
    setFeedback("#sync-status", "Local data cleared.");
    if ($(".view-workouts.is-active")) renderWorkouts();
  });
}

/* ---------- Auth view -------------------------------------- */
function renderLanding() { /* no-op */ }

function setAuthTab(tab) {
  state.authTab = tab;
  $$("[data-auth-tab]").forEach((btn) => btn.classList.toggle("is-active", btn.dataset.authTab === tab));
  $("#auth-submit").textContent = tab === "signup" ? "Create account" : "Log in";
  $("#auth-password").autocomplete = tab === "signup" ? "new-password" : "current-password";
}

function renderAuth(params) {
  if (params.mode === "guest") {
    continueAsGuest();
    return;
  }
  setAuthTab("login");
  setFeedback("#auth-status", "");
}

function continueAsGuest() {
  state.authMode = "guest";
  localStorage.setItem(STORAGE.authMode, "guest");
  navigate("#/workouts");
}

/* ---------- Workouts view ---------------------------------- */
function renderWorkouts() {
  const list = $("#workout-list");
  list.innerHTML = "";

  const sorted = [...state.workouts].sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));

  if (sorted.length === 0) {
    list.innerHTML = `<li class="empty-state">No workouts yet. Tap <strong>Start workout</strong> to log your first session.</li>`;
  } else {
    for (const w of sorted) {
      const isActive = !w.endedAt;
      const setCount = w.sets.length;
      const volume = w.sets.reduce((a, s) => a + s.weight * s.reps, 0);
      const li = document.createElement("li");
      li.innerHTML = `
        <a href="#/workout/${w.id}">
          <div class="workout-row-top">
            <span class="workout-name">${escapeHtml(w.name || "Workout")}</span>
            <span class="workout-meta">${formatDate(w.startedAt)}</span>
          </div>
          <div class="workout-sub">
            ${isActive ? '<span class="tag">In progress</span>' : ""}
            ${w.programId ? `<span class="tag">${escapeHtml(programNameById(w.programId))}</span>` : ""}
            <span>${setCount} sets</span>
            <span>${Math.round(volume).toLocaleString()} lb volume</span>
          </div>
        </a>
      `;
      list.appendChild(li);
    }
  }

  // Greeting + stats
  $("#greeting").textContent = greeting() + (state.authMode === "guest" ? ", guest" : "");
  renderStatsSummary();
}

function renderStatsSummary() {
  const now = Date.now();
  const week = state.workouts.filter((w) => now - new Date(w.startedAt).getTime() < 7 * 86400000);
  $("#stat-week-sessions").textContent = week.length;

  const thirtyDayCutoff = now - 30 * 86400000;
  let totalVolume = 0;
  for (const w of state.workouts) {
    for (const s of w.sets) {
      if (new Date(s.timestamp).getTime() >= thirtyDayCutoff) totalVolume += s.weight * s.reps;
    }
  }
  $("#stat-volume").textContent = Math.round(totalVolume).toLocaleString();

  // Top lift = highest single-set weight ever
  let top = null;
  for (const w of state.workouts) {
    for (const s of w.sets) {
      if (!top || s.weight > top.weight) top = s;
    }
  }
  if (top) {
    $("#stat-top-lift").textContent = `${top.weight} lb`;
    $("#stat-top-lift-sub").textContent = `${top.exercise} · ${top.reps} reps`;
  } else {
    $("#stat-top-lift").textContent = "—";
    $("#stat-top-lift-sub").textContent = "add a set";
  }
}

/* ---------- Programs view ---------------------------------- */
function renderPrograms() {
  const grid = $("#program-grid");
  grid.innerHTML = "";
  for (const p of PROGRAMS) {
    const li = document.createElement("li");
    li.innerHTML = `
      <a href="#/program/${p.id}">
        <div class="program-card-title">${escapeHtml(p.name)}</div>
        <div class="program-card-meta">${escapeHtml(p.level)} · ${escapeHtml(p.schedule)}</div>
        <div class="program-card-desc">${escapeHtml(p.description)}</div>
      </a>
    `;
    grid.appendChild(li);
  }
}

function renderProgram(id) {
  const program = PROGRAMS.find((p) => p.id === id);
  if (!program) return navigate("#/programs");

  $("#program-eyebrow").textContent = program.level + " · " + program.schedule;
  $("#program-title").textContent = program.name;
  $("#program-desc").textContent = program.description;

  const days = $("#program-days");
  days.innerHTML = "";
  for (const day of program.days) {
    const li = document.createElement("li");
    const exerciseLines = day.exercises
      .map((ex) => `<span class="planned-target">${ex.sets} × ${ex.reps} · ${escapeHtml(ex.name)}</span>`)
      .join("<br>");
    li.innerHTML = `
      <div class="workout-row-top">
        <span class="workout-name">${escapeHtml(day.name)}</span>
        <button class="btn btn-primary btn-sm" data-start-day="${day.id}">Start</button>
      </div>
      <div class="workout-sub" style="display:block; margin-top:.5rem;">${exerciseLines}</div>
    `;
    li.querySelector("[data-start-day]").addEventListener("click", () => startProgramDay(program, day));
    days.appendChild(li);
  }
}

/* ---------- Start picker ----------------------------------- */
function renderStart() {
  const last = [...state.workouts].sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt))[0];
  const btn = $("#start-quick-repeat");
  if (last) {
    btn.hidden = false;
    $("#quick-repeat-sub").textContent = `${last.name || "Workout"} · ${formatDate(last.startedAt)}`;
  } else {
    btn.hidden = true;
  }
}

function startFreestyle() {
  const workout = createWorkout({ name: "Freestyle session" });
  navigate(`#/workout/${workout.id}`);
}

function startProgramDay(program, day) {
  const workout = createWorkout({
    name: day.name,
    programId: program.id,
    programDayId: day.id,
    planned: day.exercises.map((ex) => ({ name: ex.name, sets: ex.sets, reps: ex.reps })),
  });
  navigate(`#/workout/${workout.id}`);
}

function startQuickRepeat() {
  const last = [...state.workouts].sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt))[0];
  if (!last) return;
  const workout = createWorkout({
    name: last.name,
    programId: last.programId,
    programDayId: last.programDayId,
    planned: last.planned ? [...last.planned] : [],
  });
  navigate(`#/workout/${workout.id}`);
}

function createWorkout(partial) {
  const workout = {
    id: crypto.randomUUID(),
    name: partial.name || "Workout",
    programId: partial.programId || null,
    programDayId: partial.programDayId || null,
    startedAt: new Date().toISOString(),
    endedAt: null,
    planned: partial.planned || [],
    sets: [],
  };
  state.workouts.unshift(workout);
  state.activeWorkoutId = workout.id;
  saveJSON(STORAGE.workouts, state.workouts);
  localStorage.setItem(STORAGE.activeId, workout.id);
  return workout;
}

function getWorkout(id) {
  return state.workouts.find((w) => w.id === id);
}

/* ---------- Tracker view ----------------------------------- */
function renderTracker(id) {
  const workout = getWorkout(id);
  if (!workout) return navigate("#/workouts");

  state.activeWorkoutId = workout.id;
  localStorage.setItem(STORAGE.activeId, workout.id);

  $("#tracker-title").textContent = workout.name;
  $("#tracker-eyebrow").textContent = workout.endedAt
    ? `Completed · ${formatDate(workout.endedAt)}`
    : `Active session · ${formatDate(workout.startedAt)}`;

  renderPlanned(workout);
  renderSessionLog(workout);
  renderSuggestions(workout);
  updateSetSequence();
}

function renderPlanned(workout) {
  const list = $("#planned-list");
  list.innerHTML = "";
  if (!workout.planned || workout.planned.length === 0) {
    list.innerHTML = `<li class="empty-state" style="padding:.8rem;">Freestyle session — log any movement.</li>`;
    return;
  }
  for (const ex of workout.planned) {
    const done = workout.sets.filter((s) => s.exercise.toLowerCase() === ex.name.toLowerCase()).length;
    const isDone = done >= ex.sets;
    const li = document.createElement("li");
    li.innerHTML = `
      <div>
        <div class="planned-name">${escapeHtml(ex.name)}</div>
        <div class="planned-target">Target: ${ex.sets} × ${ex.reps}</div>
      </div>
      <div class="${isDone ? "planned-done" : "planned-target"}">${done}/${ex.sets} ${isDone ? "✓" : ""}</div>
    `;
    li.style.cursor = "pointer";
    li.addEventListener("click", () => {
      $("#exercise").value = ex.name;
      updateSetSequence();
      $("#weight").focus();
    });
    list.appendChild(li);
  }
}

function renderSessionLog(workout) {
  const body = $("#log-body");
  body.innerHTML = "";
  if (workout.sets.length === 0) {
    body.innerHTML = `<tr><td colspan="6">No sets logged yet this session.</td></tr>`;
    return;
  }
  for (const s of [...workout.sets].reverse()) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${formatTime(s.timestamp)}</td>
      <td>${escapeHtml(s.exercise)}</td>
      <td>${s.weight.toFixed(1)} lb</td>
      <td>${s.reps}</td>
      <td>${s.rpe ?? "—"}</td>
      <td>${Math.round(s.weight * s.reps)}</td>
    `;
    body.appendChild(row);
  }
}

function renderSuggestions(workout) {
  const list = $("#suggestions");
  list.innerHTML = "";

  // Compare current workout's last set per exercise to global history's prior set
  const grouped = new Map();
  for (const w of state.workouts) {
    for (const s of w.sets) {
      const key = s.exercise.toLowerCase();
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(s);
    }
  }

  const activeExercises = new Set(workout.sets.map((s) => s.exercise.toLowerCase()));
  if (activeExercises.size === 0) {
    list.innerHTML = `<li>Log a set to see overload guidance.</li>`;
    return;
  }

  for (const key of activeExercises) {
    const history = (grouped.get(key) || []).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const insight = buildOverloadInsight(history);
    const exName = history.at(-1)?.exercise || key;
    const li = document.createElement("li");
    li.className = insight.level;
    li.innerHTML = `<strong>${escapeHtml(exName)}</strong><br>${insight.message}<div class="meta">${insight.meta}</div>`;
    list.appendChild(li);
  }
}

function buildOverloadInsight(history) {
  if (history.length < 2) {
    return {
      level: "warn",
      message: "Need one more logged set to compare.",
      meta: "Hit this movement again — the trend will start tracking.",
    };
  }
  const prev = history.at(-2);
  const curr = history.at(-1);
  const prevE1rm = estimate1RM(prev.weight, prev.reps);
  const currE1rm = estimate1RM(curr.weight, curr.reps);

  if (curr.weight > prev.weight && curr.reps >= prev.reps) {
    return {
      level: "good",
      message: "Load up, reps held. That's textbook overload.",
      meta: "Next: hold weight and add 1 rep, or add 2.5–5 lb if bar speed stays fast.",
    };
  }
  if (currE1rm > prevE1rm) {
    return {
      level: "good",
      message: "Estimated 1RM trending up.",
      meta: "Stay disciplined — tighten form before adding more load.",
    };
  }
  return {
    level: "warn",
    message: "Performance flat or down vs prior session.",
    meta: "Repeat this load, dial in recovery, then push next time.",
  };
}

function prepareNextSetDraft() {
  const workout = getWorkout(state.activeWorkoutId);
  if (!workout) return;
  const lastSet = workout.sets[0];
  const exercise = $("#exercise").value.trim() || lastSet?.exercise;
  if (!exercise) return;
  $("#exercise").value = exercise;
  if (lastSet && lastSet.exercise.toLowerCase() === exercise.toLowerCase()) {
    $("#weight").value = lastSet.weight;
    $("#reps").value = lastSet.reps;
    if (lastSet.rpe != null) $("#rpe").value = lastSet.rpe;
  }
  updateSetSequence();
}

function saveDraftAsSet() {
  const workout = getWorkout(state.activeWorkoutId);
  if (!workout) return;

  const exercise = $("#exercise").value.trim();
  const weight = Number($("#weight").value);
  const reps = Number($("#reps").value);
  const rpeRaw = $("#rpe").value;
  const rpe = rpeRaw === "" ? null : Number(rpeRaw);

  if (!exercise || !Number.isFinite(weight) || !Number.isFinite(reps)) {
    setFeedback("#parse-feedback", "Exercise, weight, and reps are required.");
    return;
  }

  workout.sets.unshift({
    id: crypto.randomUUID(),
    exercise,
    weight,
    reps,
    rpe,
    timestamp: new Date().toISOString(),
  });
  saveJSON(STORAGE.workouts, state.workouts);
  setFeedback("#parse-feedback", "Set logged.");
  prepareNextSetDraft();
  renderTracker(workout.id);
}

function endActiveWorkout() {
  const workout = getWorkout(state.activeWorkoutId);
  if (!workout) return navigate("#/workouts");
  if (workout.sets.length === 0) {
    if (!confirm("End this workout with no sets logged?")) return;
  }
  workout.endedAt = new Date().toISOString();
  saveJSON(STORAGE.workouts, state.workouts);
  localStorage.removeItem(STORAGE.activeId);
  state.activeWorkoutId = null;
  stopRestTimer();
  stopListening();
  navigate("#/workouts");
}

function updateSetSequence() {
  const workout = getWorkout(state.activeWorkoutId);
  if (!workout) return;
  const ex = $("#exercise").value.trim();
  if (!ex) {
    $("#set-sequence").textContent = "Set #1";
    return;
  }
  const count = workout.sets.filter((s) => s.exercise.toLowerCase() === ex.toLowerCase()).length;
  $("#set-sequence").textContent = `Set #${count + 1}`;
}

/* ---------- Voice console ---------------------------------- */
function setupSpeechRecognition() {
  const Recog = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recog) {
    $("#start-btn").disabled = true;
    $("#stop-btn").disabled = true;
    setMicStatus("Mic unsupported", "idle");
    return;
  }
  const rec = new Recog();
  rec.lang = "en-US";
  rec.continuous = true;
  rec.interimResults = true;

  rec.onstart = () => {
    setMicStatus("Listening", "listening");
    $("#start-btn").disabled = true;
    $("#stop-btn").disabled = false;
  };
  rec.onend = () => {
    setMicStatus("Mic idle", "");
    $("#start-btn").disabled = false;
    $("#stop-btn").disabled = true;
  };
  rec.onerror = (e) => setFeedback("#parse-feedback", `Mic error: ${e.error || "unknown"}`);
  rec.onresult = (event) => {
    let chunk = "";
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const phrase = event.results[i][0].transcript.trim();
      chunk += phrase + " ";
      if (event.results[i].isFinal) handleVoiceUtterance(phrase);
    }
    if (chunk) {
      $("#transcript").value = ($("#transcript").value + " " + chunk).trim();
    }
  };

  state.recognition = rec;
}

function startListening() { state.recognition && state.recognition.start(); }
function stopListening() {
  try { state.recognition && state.recognition.stop(); } catch {}
}

function handleVoiceUtterance(phrase) {
  const t = normalize(phrase);
  if (/^next set$/.test(t)) {
    prepareNextSetDraft();
    setFeedback("#parse-feedback", "Voice: next set prepped.");
    return;
  }
  if (/^log set$/.test(t)) {
    saveDraftAsSet();
    return;
  }
  if (/^stop rest( timer)?$/.test(t)) {
    stopRestTimer();
    setFeedback("#parse-feedback", "Voice: rest stopped.");
    return;
  }
  const restMatch = t.match(/^start rest( timer)? (\d+)\s*(second|seconds|minute|minutes|sec|min)?$/);
  if (restMatch) {
    const amt = Number(restMatch[2]);
    const unit = restMatch[3] || "seconds";
    const seconds = /^(minute|minutes|min)$/.test(unit) ? amt * 60 : amt;
    startRestTimer(seconds);
    return;
  }
  parseTranscriptIntoDraft(phrase);
}

function parseTranscriptIntoDraft(raw) {
  const text = normalize(raw);
  if (!text) {
    setFeedback("#parse-feedback", "Nothing to parse.");
    return;
  }

  const exerciseMatch = text.match(/^([a-z ]+?)(?:\s+\d|\s+at\s+\d|\s+pounds|\s+lb|\s+lbs|\s+kg|$)/);
  const weightMatch =
    text.match(/(\d+(?:\.\d+)?)\s*(?:lb|lbs|pound|pounds|kg)/) ||
    text.match(/(?:at\s+)?(\d+(?:\.\d+)?)\s*(?:for|x|\*)\s*\d+/);
  const repsMatch = text.match(/(\d+)\s*(?:rep|reps)/) || text.match(/x\s*(\d+)/);
  const rpeMatch = text.match(/rpe\s*(\d+(?:\.\d+)?)/);

  if (exerciseMatch?.[1]) $("#exercise").value = titleCase(exerciseMatch[1].trim());
  if (weightMatch?.[1]) $("#weight").value = Number(weightMatch[1]);
  if (repsMatch?.[1]) $("#reps").value = Number(repsMatch[1]);
  if (rpeMatch?.[1]) $("#rpe").value = Number(rpeMatch[1]);
  updateSetSequence();
  setFeedback("#parse-feedback", "Parsed. Confirm and tap Log set.");
}

/* ---------- Rest timer ------------------------------------- */
function startRestTimer(seconds) {
  stopRestTimer();
  state.rest.secondsLeft = Math.max(5, Math.floor(seconds));
  renderRestStatus();
  maybeSpeak(`Rest for ${state.rest.secondsLeft} seconds.`);
  state.rest.intervalId = setInterval(() => {
    state.rest.secondsLeft -= 1;
    if (state.rest.secondsLeft === 10) maybeSpeak("Ten seconds.");
    if (state.rest.secondsLeft <= 0) {
      stopRestTimer();
      maybeSpeak("Rest complete. Next set.");
      setFeedback("#parse-feedback", "Rest complete.");
      return;
    }
    renderRestStatus();
  }, 1000);
}

function stopRestTimer() {
  if (state.rest.intervalId) clearInterval(state.rest.intervalId);
  state.rest = { intervalId: null, secondsLeft: 0 };
  renderRestStatus();
}

function renderRestStatus() {
  const el = $("#rest-status");
  if (!el) return;
  if (!state.rest.secondsLeft) {
    el.textContent = "Rest off";
    el.className = "badge";
    return;
  }
  el.textContent = `Rest ${state.rest.secondsLeft}s`;
  el.className = "badge alert";
}

function maybeSpeak(message) {
  if (!$("#voice-prompt-toggle")?.checked || !("speechSynthesis" in window)) return;
  const u = new SpeechSynthesisUtterance(message);
  u.rate = 1;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

function setMicStatus(label, mod) {
  const el = $("#mic-status");
  if (!el) return;
  el.textContent = label;
  el.className = `badge ${mod}`.trim();
}

/* ---------- Stats view (chart) ----------------------------- */
function renderStats() {
  const exerciseSel = $("#chart-exercise");
  const current = exerciseSel.value;
  const all = new Set();
  for (const w of state.workouts) for (const s of w.sets) all.add(s.exercise);
  const names = [...all].sort();

  exerciseSel.innerHTML = `<option value="__all">All exercises</option>` +
    names.map((n) => `<option value="${escapeHtml(n)}">${escapeHtml(n)}</option>`).join("");
  exerciseSel.value = names.includes(current) || current === "__all" ? current : "__all";
  drawChart();
}

function drawChart() {
  const canvas = $("#history-chart");
  if (!canvas || !canvas.isConnected) return;
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const cssW = canvas.clientWidth || 720;
  const cssH = canvas.clientHeight || 240;
  canvas.width = cssW * dpr;
  canvas.height = cssH * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssW, cssH);

  const ex = $("#chart-exercise").value || "__all";
  const metric = $("#chart-metric").value || "weight";

  const allSets = [];
  for (const w of state.workouts) for (const s of w.sets) allSets.push(s);
  const filtered = (ex === "__all" ? allSets : allSets.filter((s) => s.exercise === ex))
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  if (filtered.length < 2) {
    ctx.fillStyle = "#a8a59b";
    ctx.font = "13px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Log at least two sets to see the trend.", cssW / 2, cssH / 2);
    return;
  }

  const values = filtered.map((s) => {
    if (metric === "reps") return s.reps;
    if (metric === "volume") return s.weight * s.reps;
    if (metric === "e1rm") return estimate1RM(s.weight, s.reps);
    return s.weight;
  });
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = 32;
  const plotW = cssW - pad * 2;
  const plotH = cssH - pad * 2;
  const span = max - min || 1;

  // Axis baseline
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.beginPath();
  ctx.moveTo(pad, cssH - pad);
  ctx.lineTo(cssW - pad, cssH - pad);
  ctx.stroke();

  // Build path
  const pts = values.map((v, i) => ({
    x: pad + (i / (values.length - 1)) * plotW,
    y: cssH - pad - ((v - min) / span) * plotH,
  }));

  // Area fill
  const grad = ctx.createLinearGradient(0, pad, 0, cssH - pad);
  grad.addColorStop(0, "rgba(212, 180, 131, 0.22)");
  grad.addColorStop(1, "rgba(212, 180, 131, 0.0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, cssH - pad);
  for (const p of pts) ctx.lineTo(p.x, p.y);
  ctx.lineTo(pts.at(-1).x, cssH - pad);
  ctx.closePath();
  ctx.fill();

  // Line
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#d4b483";
  ctx.beginPath();
  pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
  ctx.stroke();

  // Points
  ctx.fillStyle = "#efd4a1";
  for (const p of pts) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Label
  ctx.fillStyle = "#a8a59b";
  ctx.font = "11px Inter, system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(`${metric.toUpperCase()}   min ${fmtNum(min)}   max ${fmtNum(max)}`, pad, pad - 8);
}

/* ---------- Settings view ---------------------------------- */
function renderSettings() {
  const status = state.cloud.user
    ? `Logged in as ${state.cloud.user.email}.`
    : state.authMode === "guest"
    ? "Guest mode (local only)."
    : "Not signed in.";
  $("#settings-auth-status").textContent = status;
  $("#settings-logout-btn").style.display = state.cloud.user ? "" : "none";
}

/* ---------- Cloud sync ------------------------------------- */
function hydrateCloudInputs() {
  if (state.cloud.config.url) $("#supabase-url").value = state.cloud.config.url;
  if (state.cloud.config.anonKey) $("#supabase-key").value = state.cloud.config.anonKey;
}

async function connectCloud() {
  const url = $("#supabase-url").value.trim();
  const anonKey = $("#supabase-key").value.trim();
  if (!url || !anonKey) {
    setFeedback("#auth-status", "Add Supabase URL and anon key first.");
    return;
  }
  try {
    const mod = await import("https://esm.sh/@supabase/supabase-js@2");
    state.cloud.client = mod.createClient(url, anonKey);
    state.cloud.config = { url, anonKey };
    saveJSON(STORAGE.sync, state.cloud.config);
    setFeedback("#auth-status", "Cloud connected. Log in or sign up.");
  } catch (e) {
    setFeedback("#auth-status", `Cloud connect failed: ${e.message}`);
  }
}

async function registerCloudUser() {
  if (!state.cloud.client) await connectCloud();
  if (!state.cloud.client) return;
  const email = $("#auth-email").value.trim();
  const password = $("#auth-password").value;
  if (!email || !password) { setFeedback("#auth-status", "Email and password required."); return; }
  const { error } = await state.cloud.client.auth.signUp({ email, password });
  if (error) return setFeedback("#auth-status", `Sign up failed: ${error.message}`);
  setFeedback("#auth-status", "Account created. Check email if confirmation is enabled.");
}

async function loginCloudUser() {
  if (!state.cloud.client) await connectCloud();
  if (!state.cloud.client) return;
  const email = $("#auth-email").value.trim();
  const password = $("#auth-password").value;
  if (!email || !password) { setFeedback("#auth-status", "Email and password required."); return; }
  const { data, error } = await state.cloud.client.auth.signInWithPassword({ email, password });
  if (error) return setFeedback("#auth-status", `Login failed: ${error.message}`);
  state.cloud.user = data.user;
  state.authMode = "user";
  localStorage.setItem(STORAGE.authMode, "user");
  navigate("#/workouts");
}

async function logoutCloudUser() {
  if (state.cloud.client) await state.cloud.client.auth.signOut().catch(() => {});
  state.cloud.user = null;
  state.authMode = "guest";
  localStorage.setItem(STORAGE.authMode, "guest");
  renderSettings();
  setFeedback("#sync-status", "Logged out. Continuing as guest.");
}

async function pushToCloud() {
  if (!state.cloud.client || !state.cloud.user) {
    return setFeedback("#sync-status", "Log in to push.");
  }
  const rows = [];
  for (const w of state.workouts) {
    for (const s of w.sets) {
      rows.push({
        id: s.id,
        user_id: state.cloud.user.id,
        workout_id: w.id,
        workout_name: w.name,
        program_id: w.programId,
        program_day_id: w.programDayId,
        exercise: s.exercise,
        weight: s.weight,
        reps: s.reps,
        rpe: s.rpe,
        timestamp: s.timestamp,
      });
    }
  }
  if (!rows.length) return setFeedback("#sync-status", "Nothing to push.");
  const { error } = await state.cloud.client.from("xpod_sets").upsert(rows, { onConflict: "id" });
  if (error) return setFeedback("#sync-status", `Push failed: ${error.message}`);
  setFeedback("#sync-status", `Pushed ${rows.length} sets.`);
}

async function pullFromCloud() {
  if (!state.cloud.client || !state.cloud.user) {
    return setFeedback("#sync-status", "Log in to pull.");
  }
  const { data, error } = await state.cloud.client
    .from("xpod_sets")
    .select("*")
    .eq("user_id", state.cloud.user.id)
    .order("timestamp", { ascending: true });
  if (error) return setFeedback("#sync-status", `Pull failed: ${error.message}`);

  const byWorkout = new Map();
  for (const r of data || []) {
    const id = r.workout_id || "imported";
    if (!byWorkout.has(id)) {
      byWorkout.set(id, {
        id,
        name: r.workout_name || "Workout",
        programId: r.program_id,
        programDayId: r.program_day_id,
        startedAt: r.timestamp,
        endedAt: r.timestamp,
        planned: [],
        sets: [],
      });
    }
    const w = byWorkout.get(id);
    w.sets.push({
      id: r.id,
      exercise: r.exercise,
      weight: Number(r.weight),
      reps: Number(r.reps),
      rpe: r.rpe ?? null,
      timestamp: r.timestamp,
    });
    if (new Date(r.timestamp) < new Date(w.startedAt)) w.startedAt = r.timestamp;
    if (new Date(r.timestamp) > new Date(w.endedAt)) w.endedAt = r.timestamp;
  }

  state.workouts = [...byWorkout.values()].sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));
  saveJSON(STORAGE.workouts, state.workouts);
  setFeedback("#sync-status", `Pulled ${state.workouts.length} workouts.`);
  if ($(".view-workouts.is-active")) renderWorkouts();
}

/* ---------- Service worker --------------------------------- */
function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}

/* ---------- Utilities -------------------------------------- */
function setFeedback(sel, msg) {
  const el = $(sel);
  if (el) el.textContent = msg;
}

function programNameById(id) {
  return PROGRAMS.find((p) => p.id === id)?.name || "";
}

function normalize(t) {
  return String(t || "").toLowerCase().replace(/[^\w\s.]/g, " ").replace(/\s+/g, " ").trim();
}

function titleCase(s) {
  return s.split(/\s+/).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
}

function estimate1RM(weight, reps) { return weight * (1 + reps / 30); }

function fmtNum(v) { return Number(v) >= 100 ? Math.round(v).toString() : Number(v).toFixed(1); }

function formatDate(iso) {
  const d = new Date(iso);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const ymd = new Date(d); ymd.setHours(0, 0, 0, 0);
  const diff = Math.round((today - ymd) / 86400000);
  if (diff === 0) return `Today · ${d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
  if (diff === 1) return `Yesterday · ${d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
  if (diff < 7) return d.toLocaleDateString([], { weekday: "long" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Late night";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Good evening";
}

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}
