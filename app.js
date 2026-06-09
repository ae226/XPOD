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
  knownExercises: "xpod-known-exercises-v1",
  canonMigration: "xpod-canon-migrated-v1",
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
  rest: { intervalId: null, endAt: 0, total: 0, wakeLock: null },
  recognition: null,
  voice: { supported: false, intendToListen: false, restartTimer: null },
  authTab: "login", // login | signup
};

/* ---------- Canonical exercise identity --------------------
   Every logged set is stored under a canonical display name so that
   voice-transcription drift and freeform typing don't fragment a lift's
   history. Matching is deliberately conservative: it collapses spelling
   variants but never merges across a distinguishing qualifier
   (incline/front/close/sumo/paused/etc.), because a wrong merge corrupts
   history silently, which is worse than leaving a near-duplicate.
   ----------------------------------------------------------- */

// Spoken / shorthand forms -> canonical. Keyed by normalized string.
const EXERCISE_ALIASES = {
  "bench": "Bench Press",
  "bench press": "Bench Press",
  "barbell bench press": "Bench Press",
  "flat bench": "Bench Press",
  "ohp": "Overhead Press",
  "shoulder press": "Overhead Press",
  "military press": "Overhead Press",
  "press": "Overhead Press",
  "squat": "Back Squat",
  "squats": "Back Squat",
  "back squats": "Back Squat",
  "deadlift": "Deadlift",
  "deads": "Deadlift",
  "conventional deadlift": "Deadlift",
  "rdl": "Romanian Deadlift",
  "romanian deadlift": "Romanian Deadlift",
  "row": "Barbell Row",
  "rows": "Barbell Row",
  "bent over row": "Barbell Row",
  "pendlay row": "Barbell Row",
  "pull up": "Pull Up",
  "pull ups": "Pull Up",
  "pullup": "Pull Up",
  "pullups": "Pull Up",
  "chin up": "Chin Up",
  "chin ups": "Chin Up",
  "lat pulldown": "Lat Pulldown",
  "pulldown": "Lat Pulldown",
  "curl": "Barbell Curl",
  "curls": "Barbell Curl",
  "bicep curl": "Barbell Curl",
  "lateral raise": "Lateral Raise",
  "lat raise": "Lateral Raise",
  "side raise": "Lateral Raise",
  "leg press": "Leg Press",
  "leg curl": "Leg Curl",
  "leg extension": "Leg Extension",
  "hip thrust": "Hip Thrust",
  "calf raise": "Standing Calf Raise",
  "tricep pushdown": "Triceps Pushdown",
  "triceps pushdown": "Triceps Pushdown",
  "pushdown": "Triceps Pushdown",
  "face pull": "Face Pull",
  "dip": "Dips",
  "dips": "Dips",
};

// Words that change which lift it is. Two names that differ by any of these
// are never auto-merged.
const QUALIFIER_TOKENS = new Set([
  "incline", "decline", "flat", "front", "back", "close", "wide", "narrow",
  "sumo", "deficit", "paused", "pin", "box", "seated", "standing", "bent",
  "single", "one", "arm", "leg", "dumbbell", "db", "barbell", "machine",
  "cable", "smith", "reverse", "overhead", "hammer", "preacher", "spider",
  "bulgarian", "split", "romanian", "stiff", "good", "morning", "hack",
  "chest", "supported", "t", "bar", "landmine", "zercher", "safety",
]);

function loadKnownExercises() {
  const stored = loadJSON(STORAGE.knownExercises, null);
  const set = new Set(Array.isArray(stored) ? stored : []);
  // Seed from program templates + alias targets so the very first session benefits.
  for (const p of PROGRAMS) for (const d of p.days) for (const ex of d.exercises) set.add(ex.name);
  for (const v of Object.values(EXERCISE_ALIASES)) set.add(v);
  return set;
}

let KNOWN_EXERCISES = null;
function knownExercises() {
  if (!KNOWN_EXERCISES) KNOWN_EXERCISES = loadKnownExercises();
  return KNOWN_EXERCISES;
}
function rememberExercise(displayName) {
  knownExercises().add(displayName);
  saveJSON(STORAGE.knownExercises, [...knownExercises()]);
}

function exKey(name) {
  // Normalized comparison key: lowercase, depluralized tokens, sorted.
  return normalize(name)
    .split(" ")
    .filter(Boolean)
    .map((w) => (w.length > 3 && w.endsWith("s") ? w.slice(0, -1) : w))
    .sort()
    .join(" ");
}

function qualifierSignature(name) {
  return new Set(
    normalize(name).split(" ").filter((w) => QUALIFIER_TOKENS.has(w))
  );
}
function sameQualifiers(a, b) {
  const qa = qualifierSignature(a);
  const qb = qualifierSignature(b);
  if (qa.size !== qb.size) return false;
  for (const q of qa) if (!qb.has(q)) return false;
  return true;
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  const dp = Array.from({ length: m + 1 }, (_, i) => i);
  for (let j = 1; j <= n; j += 1) {
    let prev = dp[0];
    dp[0] = j;
    for (let i = 1; i <= m; i += 1) {
      const tmp = dp[i];
      dp[i] = a[i - 1] === b[j - 1] ? prev : 1 + Math.min(prev, dp[i], dp[i - 1]);
      prev = tmp;
    }
  }
  return dp[m];
}

/**
 * Resolve a raw exercise string (typed or transcribed) to a canonical
 * display name. Registers genuinely new names so they self-converge next time.
 */
function canonicalizeExercise(raw) {
  const cleaned = normalize(raw);
  if (!cleaned) return "";

  // 1) Direct alias hit.
  if (EXERCISE_ALIASES[cleaned]) {
    rememberExercise(EXERCISE_ALIASES[cleaned]);
    return EXERCISE_ALIASES[cleaned];
  }

  const key = exKey(cleaned);

  // 2) Exact normalized match against anything we already know.
  for (const known of knownExercises()) {
    if (exKey(known) === key) return known;
  }

  // 3) Conservative fuzzy match: only against candidates that share the same
  //    qualifier signature, and only when the spelling is very close.
  let best = null;
  let bestDist = Infinity;
  for (const known of knownExercises()) {
    if (!sameQualifiers(cleaned, known)) continue;
    const dist = levenshtein(key, exKey(known));
    const tolerance = Math.max(1, Math.floor(key.length * 0.12)); // ~1 typo per 8 chars
    if (dist <= tolerance && dist < bestDist) {
      best = known;
      bestDist = dist;
    }
  }
  if (best) return best;

  // 4) Genuinely new movement — register a tidy title-cased form.
  const display = titleCase(cleaned);
  rememberExercise(display);
  return display;
}

// Increment sizing for next-weight recommendations (lb).
function exerciseIncrement(name) {
  const t = normalize(name);
  const isolation = /(curl|raise|fly|flye|pushdown|extension|face pull|kickback|shrug|calf)/.test(t);
  if (isolation) return 2.5;
  const lowerCompound = /(squat|deadlift|hip thrust|leg press|lunge|good morning)/.test(t);
  if (lowerCompound) return 10;
  return 5; // upper-body compounds: press, row, pulldown, dip, etc.
}

function roundToPlate(weight) {
  // Smallest commonly loadable jump on a barbell is 5 lb total (2.5/side).
  return Math.round(weight / 2.5) * 2.5;
}

/** Parse a planned rep string ("5-8", "5", "AMRAP", "5/3/1") to a target number, or null. */
function parseRepTarget(reps) {
  if (reps == null) return null;
  const s = String(reps).toLowerCase();
  const range = s.match(/(\d+)\s*-\s*(\d+)/);
  if (range) return Number(range[2]); // top of range = progression trigger
  const single = s.match(/^\s*(\d+)\s*$/);
  if (single) return Number(single[1]);
  return null; // AMRAP, 5/3/1, x/leg, etc. — fall back to performed reps
}



/* ---------- Boot ------------------------------------------- */
boot();

function boot() {
  migrateLegacyData();
  const stored = loadJSON(STORAGE.workouts, []);
  state.workouts = Array.isArray(stored) ? stored.filter(Boolean) : [];
  canonicalizeExistingHistory();
  pruneEmptySessions(true);
  hydrateCloudInputs();
  wireGlobalEvents();
  setupSpeechRecognition();
  registerServiceWorker();
  handleRoute();
  // Try to silently re-establish cloud session if credentials are saved
  restoreCloudSession().catch(() => {});
}

// One-time pass: collapse historical exercise-name variants onto canonical
// names so charts, stats, and overload stop fragmenting on old data.
function canonicalizeExistingHistory() {
  if (localStorage.getItem(STORAGE.canonMigration)) return;
  let changed = false;
  for (const w of state.workouts) {
    for (const s of w.sets || []) {
      if (!s.exercise) continue;
      const canon = canonicalizeExercise(s.exercise);
      if (canon && canon !== s.exercise) { s.exercise = canon; changed = true; }
    }
    for (const p of w.planned || []) {
      if (p.name) rememberExercise(canonicalizeExercise(p.name));
    }
  }
  if (changed) saveJSON(STORAGE.workouts, state.workouts);
  localStorage.setItem(STORAGE.canonMigration, "1");
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

  if (!ROUTES.includes(viewName)) viewName = state.authMode === "none" ? "landing" : "workouts";

  // Activate view
  let activated = false;
  $$(".view").forEach((node) => {
    const match = node.dataset.view === viewName;
    node.classList.toggle("is-active", match);
    if (match) activated = true;
  });
  if (!activated) {
    // Fallback: ensure at least one view is visible
    const fallback = document.querySelector('.view[data-view="workouts"]');
    if (fallback) fallback.classList.add("is-active");
  }

  // Update chrome
  updateChrome(viewName);
  updateTabbar(viewName);

  // Per-view render — never let one view error abort the route
  try {
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
  } catch (err) {
    console.error(`[XPOD] render error for "${viewName}":`, err);
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

  // +/- steppers for fast manual entry
  $$("[data-step]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const field = btn.dataset.step;          // "weight" | "reps"
      const dir = Number(btn.dataset.dir);      // +1 | -1
      const input = $(`#${field}`);
      if (!input) return;
      const step = field === "weight" ? 5 : 1;
      const min = field === "reps" ? 1 : 0;
      const cur = Number(input.value) || (field === "reps" ? 0 : 0);
      input.value = Math.max(min, +(cur + dir * step).toFixed(2));
    });
  });

  // Update the hero readout as the focused exercise changes
  $("#exercise").addEventListener("input", () => refreshReadout());
  $("#exercise").addEventListener("change", () => {
    const workout = getWorkout(state.activeWorkoutId);
    if (!workout) return;
    const name = canonicalizeExercise($("#exercise").value.trim());
    if (name) {
      $("#exercise").value = name;
      const planned = (workout.planned || []).find((p) => canonicalizeExercise(p.name) === name);
      prefillRecommendation(workout, name, planned?.reps);
    }
    refreshReadout();
    refreshExerciseList();
    updateSetSequence();
  });

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

  // Keep the rest timer honest across backgrounding / screen lock.
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) reconcileRest();
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
      if (isActive) li.className = "is-active-session";
      li.innerHTML = `
        <a href="#/workout/${w.id}">
          <div class="workout-row-top">
            <span class="workout-name">${escapeHtml(w.name || "Workout")}</span>
            <span class="workout-meta">${formatDate(w.startedAt)}</span>
          </div>
          <div class="workout-sub">
            ${isActive ? '<span class="tag live">Resume</span>' : ""}
            ${w.programId ? `<span class="tag">${escapeHtml(programNameById(w.programId))}</span>` : ""}
            <span class="num">${setCount} sets</span>
            <span class="num">${Math.round(volume).toLocaleString()} lb volume</span>
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
  const workouts = Array.isArray(state.workouts) ? state.workouts : [];
  const btn = $("#start-quick-repeat");
  const sub = $("#quick-repeat-sub");
  if (!btn || !sub) return;
  const last = [...workouts]
    .filter((w) => w && w.startedAt)
    .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt))[0];
  if (last) {
    btn.hidden = false;
    sub.textContent = `${last.name || "Workout"} · ${formatDate(last.startedAt)}`;
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
  // Discard any abandoned, empty in-progress sessions so the dashboard doesn't
  // fill with phantom "In progress" rows.
  pruneEmptySessions(false);
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

// Remove in-progress sessions that have zero logged sets. keepActive preserves
// the currently-open session so a page refresh on the tracker isn't disruptive.
function pruneEmptySessions(keepActive) {
  const before = state.workouts.length;
  state.workouts = state.workouts.filter(
    (w) => w.endedAt || (w.sets && w.sets.length) || (keepActive && w.id === state.activeWorkoutId)
  );
  if (state.workouts.length !== before) saveJSON(STORAGE.workouts, state.workouts);
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
  renderReadout(workout);
  refreshExerciseList();
  updateSetSequence();
}

function refreshReadout() {
  const workout = getWorkout(state.activeWorkoutId);
  if (workout) renderReadout(workout);
}

// Populate a datalist so manual typing snaps onto canonical names instead of
// inventing near-duplicates. Injected from JS to keep index.html untouched.
function refreshExerciseList() {
  const input = $("#exercise");
  if (!input) return;
  let dl = document.getElementById("exercise-options");
  if (!dl) {
    dl = document.createElement("datalist");
    dl.id = "exercise-options";
    input.after(dl);
    input.setAttribute("list", "exercise-options");
  }
  const names = new Set(knownExercises());
  for (const w of state.workouts) for (const s of w.sets) names.add(s.exercise);
  dl.innerHTML = [...names].sort().map((n) => `<option value="${escapeHtml(n)}"></option>`).join("");
}

function renderPlanned(workout) {
  const list = $("#planned-list");
  list.innerHTML = "";
  if (!workout.planned || workout.planned.length === 0) {
    list.innerHTML = `<li class="empty-state" style="padding:.9rem;">Freestyle session — log any movement and XPOD tracks it.</li>`;
    return;
  }
  for (const ex of workout.planned) {
    const canon = canonicalizeExercise(ex.name);
    const done = workout.sets.filter((s) => s.exercise === canon).length;
    const isDone = done >= ex.sets;
    const li = document.createElement("li");
    li.innerHTML = `
      <div>
        <div class="planned-name">${escapeHtml(ex.name)}</div>
        <div class="planned-target num">Target: ${ex.sets} × ${ex.reps}</div>
      </div>
      <div class="${isDone ? "planned-done" : "planned-target"} num">${done}/${ex.sets} ${isDone ? "✓" : ""}</div>
    `;
    li.addEventListener("click", () => {
      $("#exercise").value = canon;
      prefillRecommendation(workout, canon, ex.reps);
      refreshReadout();
      updateSetSequence();
      $("#weight").focus();
    });
    list.appendChild(li);
  }
}

// Prefill the entry fields with the recommended next load/reps for an exercise,
// without clobbering anything the user has already typed.
function prefillRecommendation(workout, name, plannedReps) {
  const prog = computeProgression(name, exerciseSessions(name), plannedReps);
  const wEl = $("#weight"), rEl = $("#reps");
  if (prog.hasData) {
    if (wEl && wEl.value === "") wEl.value = prog.weight;
    if (rEl && rEl.value === "") rEl.value = prog.reps;
  } else {
    const tgt = parseRepTarget(plannedReps);
    if (rEl && rEl.value === "" && tgt) rEl.value = tgt;
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

/**
 * Single source of truth for progression. Compares the current session's best
 * working set against the prior SESSION and returns a concrete next target
 * (weight + reps) plus human-readable framing. Used by both the hero readout
 * and the per-movement list.
 */
function computeProgression(name, sessions, plannedReps) {
  if (!sessions.length) return { hasData: false };
  const curr = sessions.at(-1);
  const prev = sessions.length >= 2 ? sessions.at(-2) : null;
  const b = curr.best;
  const target = parseRepTarget(plannedReps) ?? b.reps;
  const inc = exerciseIncrement(name);
  const rpe = b.rpe;

  let trend = "";
  if (prev) {
    const delta = b.e1rm - prev.best.e1rm;
    if (delta > 0.5) trend = `e1RM up ${fmtNum(delta)} lb vs last session.`;
    else if (delta < -0.5) trend = `e1RM down ${fmtNum(-delta)} lb vs last session.`;
    else trend = "Matched last session.";
  }
  const did = `${fmtNum(b.weight)} × ${b.reps}${rpe != null ? ` @ RPE ${rpe}` : ""}`;

  // Deload: two consecutive declines across the last three sessions.
  if (sessions.length >= 3) {
    const [a, m, z] = sessions.slice(-3);
    const e1Down = z.best.e1rm < m.best.e1rm && m.best.e1rm < a.best.e1rm;
    const volDown = z.volume < m.volume && m.volume < a.volume;
    if (e1Down || volDown) {
      const drop = Math.round((1 - z.volume / a.volume) * 100);
      return {
        hasData: true, level: "warn", label: "Deload",
        weight: roundToPlate(b.weight * 0.9), reps: target, repsNote: "",
        headline: "Pull back and rebuild",
        reason: `Down two sessions running${volDown && drop > 0 ? ` (volume off ~${drop}%)` : ""}. Drop ~10% this week, then climb again.`,
      };
    }
  }
  if (rpe != null && rpe >= 9.5) {
    return {
      hasData: true, level: "warn", label: "Hold",
      weight: b.weight, reps: target, repsNote: "",
      headline: "Hold the load",
      reason: `Last set was RPE ${rpe}. Repeat ${fmtNum(b.weight)} and clean it up before adding. ${trend}`.trim(),
    };
  }
  if (b.reps >= target && (rpe == null || rpe <= 8)) {
    return {
      hasData: true, level: "good", label: "Add load",
      weight: roundToPlate(b.weight + inc), reps: target, repsNote: "",
      headline: "Add load",
      reason: `You hit ${did}. ${trend}`.trim(),
    };
  }
  if (b.reps < target) {
    return {
      hasData: true, level: "warn", label: "Repeat",
      weight: b.weight, reps: target, repsNote: "",
      headline: "Repeat for reps",
      reason: `Got ${b.reps}/${target} last time. Lock the target, then load up. ${trend}`.trim(),
    };
  }
  // Reps met, RPE in the 8.5–9.5 grind zone.
  return {
    hasData: true, level: "good", label: "Earn a rep",
    weight: b.weight, reps: b.reps, repsNote: "+1",
    headline: "Same load, one more rep",
    reason: `${did} — chase one more before the plate. ${trend}`.trim(),
  };
}

/* ---------- Hero readout + loaded bar (the signature) ------- */
function focusExercise(workout) {
  const typed = canonicalizeExercise($("#exercise")?.value.trim() || "");
  if (typed) return typed;
  // First planned movement not yet completed.
  for (const ex of workout.planned || []) {
    const canon = canonicalizeExercise(ex.name);
    const done = workout.sets.filter((s) => s.exercise === canon).length;
    if (done < ex.sets) return canon;
  }
  // Else the last thing logged this session.
  return workout.sets[0]?.exercise || "";
}

function renderReadout(workout) {
  const el = $("#readout");
  if (!el) return;
  const name = focusExercise(workout);

  if (!name) {
    el.className = "readout";
    el.innerHTML = `<p class="readout-label">Next up</p>
      <p class="readout-exercise">Pick a movement</p>
      <p class="readout-reason">Choose a planned exercise or type one below — XPOD shows your target weight and loads the bar.</p>`;
    return;
  }

  const plannedReps = (workout.planned || []).find((p) => canonicalizeExercise(p.name) === name)?.reps;
  const prog = computeProgression(name, exerciseSessions(name), plannedReps);

  if (!prog.hasData) {
    const tgt = parseRepTarget(plannedReps);
    el.className = "readout";
    el.innerHTML = `<p class="readout-label">Next up</p>
      <p class="readout-exercise">${escapeHtml(name)}</p>
      <p class="readout-reason">First time logging this${tgt ? ` — plan calls for ${tgt} reps` : ""}. Log a set and XPOD starts tracking your trend.</p>`;
    return;
  }

  el.className = `readout ${prog.level === "warn" ? "warn" : ""}`.trim();
  el.innerHTML = `
    <p class="readout-label">Next up · ${escapeHtml(prog.label)}</p>
    <p class="readout-exercise">${escapeHtml(name)}</p>
    <div class="readout-figure">
      <span class="readout-weight num">${fmtNum(prog.weight)}</span>
      <span class="readout-unit">lb</span>
      <span class="readout-scheme num">× ${prog.reps}${prog.repsNote ? ` ${prog.repsNote}` : ""}</span>
    </div>
    <div class="loadbar">${loadBarSVG(prog.weight)}</div>
    <p class="readout-reason">${escapeHtml(prog.reason)}</p>`;
}

// Greedy plate breakdown per side (lb), using a standard gym set incl. micros.
function plateBreakdown(total, bar = 45) {
  const plates = [45, 35, 25, 10, 5, 2.5, 1.25];
  let perSide = (total - bar) / 2;
  const out = [];
  if (perSide > 0) {
    let rem = perSide;
    for (const p of plates) {
      while (rem >= p - 1e-9) { out.push(p); rem = +(rem - p).toFixed(3); }
    }
  }
  return { bar, plates: out };
}

function loadBarSVG(total, bar = 45) {
  const { plates } = plateBreakdown(total, bar);
  const dims = { 45: 66, 35: 58, 25: 50, 10: 36, 5: 30, 2.5: 24, 1.25: 20 };
  const pw = 15, gap = 3, cy = 46, cx = 162;
  const sleeve = 22; // inner sleeve length before plates
  let parts = "";
  // Bar shaft (full width) + center knurl
  parts += `<rect x="14" y="${cy - 3}" width="292" height="6" rx="3" fill="#3a3f4a"/>`;
  parts += `<rect x="118" y="${cy - 4}" width="88" height="8" rx="4" fill="#4a505c"/>`;
  // Plates, mirrored. Heaviest nearest the center.
  let xR = cx + sleeve, xL = cx - sleeve;
  plates.forEach((p, i) => {
    const h = dims[p] || 22;
    const delay = `style="animation-delay:${i * 45}ms"`;
    parts += `<rect class="plate" ${delay} x="${xR}" y="${cy - h / 2}" width="${pw}" height="${h}" rx="3" fill="#1b1e26" stroke="#d4b483" stroke-width="1.1"/>`;
    parts += `<rect class="plate" ${delay} x="${xL - pw}" y="${cy - h / 2}" width="${pw}" height="${h}" rx="3" fill="#1b1e26" stroke="#d4b483" stroke-width="1.1"/>`;
    xR += pw + gap; xL -= pw + gap;
  });
  // Brass collars at the plate edges (or at sleeve if bar-only)
  parts += `<rect x="${xR}" y="${cy - 12}" width="6" height="24" rx="2" fill="#d4b483"/>`;
  parts += `<rect x="${xL - 6}" y="${cy - 12}" width="6" height="24" rx="2" fill="#d4b483"/>`;

  const perSideText = plates.length ? plates.map((p) => (p % 1 ? p : p | 0)).join(" + ") + " / side" : "bar only";
  return `<svg viewBox="0 0 320 92" role="img" aria-label="Loaded barbell, ${fmtNum(total)} pounds">${parts}</svg>
    <div class="loadbar-math num">${fmtNum(total)} lb · ${bar} lb bar · ${perSideText}</div>`;
}

function renderSuggestions(workout) {
  const list = $("#suggestions");
  list.innerHTML = "";

  const plannedReps = new Map(
    (workout.planned || []).map((p) => [canonicalizeExercise(p.name), p.reps])
  );
  const activeExercises = [...new Set(workout.sets.map((s) => s.exercise))];
  if (activeExercises.length === 0) {
    list.innerHTML = `<li>Log a set and per-movement guidance shows up here.</li>`;
    return;
  }
  for (const name of activeExercises) {
    const prog = computeProgression(name, exerciseSessions(name), plannedReps.get(name));
    const li = document.createElement("li");
    if (!prog.hasData) continue;
    li.className = prog.level;
    li.innerHTML = `<strong>${escapeHtml(name)}</strong> · next ${fmtNum(prog.weight)} lb × ${prog.reps}${prog.repsNote ? ` ${escapeHtml(prog.repsNote)}` : ""}<div class="meta">${escapeHtml(prog.reason)}</div>`;
    list.appendChild(li);
  }
}

// Group a single exercise's history into per-session summaries, oldest first.
function exerciseSessions(canonName) {
  const out = [];
  for (const w of state.workouts) {
    const sets = w.sets.filter((s) => s.exercise === canonName);
    if (!sets.length) continue;
    out.push({
      workoutId: w.id,
      date: w.startedAt || sets[0].timestamp,
      inProgress: !w.endedAt,
      sets,
      best: bestWorkingSet(sets),
      volume: sets.reduce((a, s) => a + s.weight * s.reps, 0),
    });
  }
  return out.sort((a, b) => new Date(a.date) - new Date(b.date));
}

// Best working set of a session = highest estimated 1RM (tie-break heavier).
function bestWorkingSet(sets) {
  let best = null;
  for (const s of sets) {
    const e = estimate1RM(s.weight, s.reps);
    if (!best || e > best.e1rm || (e === best.e1rm && s.weight > best.weight)) {
      best = { weight: s.weight, reps: s.reps, rpe: s.rpe, e1rm: e };
    }
  }
  return best;
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

  const exercise = canonicalizeExercise($("#exercise").value.trim());
  const weight = Number($("#weight").value);
  const reps = Number($("#reps").value);
  const rpeRaw = $("#rpe").value;
  const rpe = rpeRaw === "" ? null : Number(rpeRaw);

  if (!exercise || !Number.isFinite(weight) || !Number.isFinite(reps)) {
    setFeedback("#parse-feedback", "Exercise, weight, and reps are required.");
    return;
  }

  // Reflect the canonical name back into the field so the user sees what was stored.
  $("#exercise").value = exercise;

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
    $("#set-sequence").textContent = "Set 1";
    return;
  }
  const count = workout.sets.filter((s) => s.exercise.toLowerCase() === ex.toLowerCase()).length;
  $("#set-sequence").textContent = `Set ${count + 1}`;
}

/* ---------- Voice console ---------------------------------- */
function setupSpeechRecognition() {
  const Recog = window.SpeechRecognition || window.webkitSpeechRecognition;
  // iOS WebKit (incl. iOS Chrome/Edge) either lacks SpeechRecognition or
  // breaks it once installed as a PWA. Detect, then steer to manual input
  // instead of leaving a dead mic with no explanation.
  if (!Recog) {
    state.voice.supported = false;
    $("#start-btn").disabled = true;
    $("#stop-btn").disabled = true;
    setMicStatus("Voice n/a", "idle");
    setFeedback("#parse-feedback", "Voice isn't available in this browser — log sets with the form below (Next set repeats your last entry).");
    return;
  }
  state.voice.supported = true;

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
    // Recognition drops itself periodically; restart if the user still intends
    // to listen, otherwise settle to idle.
    if (state.voice.intendToListen) {
      clearTimeout(state.voice.restartTimer);
      state.voice.restartTimer = setTimeout(() => {
        try { rec.start(); } catch {}
      }, 300);
      setMicStatus("Reconnecting…", "listening");
      return;
    }
    setMicStatus("Mic idle", "");
    $("#start-btn").disabled = false;
    $("#stop-btn").disabled = true;
  };
  rec.onerror = (e) => {
    const err = e.error || "unknown";
    if (err === "not-allowed" || err === "service-not-allowed") {
      state.voice.intendToListen = false;
      setFeedback("#parse-feedback", "Mic permission blocked — use the manual form, or enable the microphone in site settings.");
    } else if (err !== "no-speech" && err !== "aborted") {
      setFeedback("#parse-feedback", `Mic error: ${err}. You can keep logging manually.`);
    }
  };
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

function startListening() {
  if (!state.voice.supported || !state.recognition) {
    setFeedback("#parse-feedback", "Voice unavailable here — log with the form below.");
    return;
  }
  state.voice.intendToListen = true;
  primeAudio(); // unlock audio cues via this user gesture
  try { state.recognition.start(); } catch {}
}
function stopListening() {
  state.voice.intendToListen = false;
  clearTimeout(state.voice.restartTimer);
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

  // Pull RPE first, then remove it so its number can't be mistaken for reps/weight.
  const rpeMatch = text.match(/rpe\s*(\d+(?:\.\d+)?)/);
  const core = text.replace(/rpe\s*\d+(?:\.\d+)?/, " ").replace(/\s+/g, " ").trim();

  const exerciseMatch = core.match(/^([a-z][a-z ]*?)(?=\s+\d|\s+at\s+\d|$)/);

  let weight = null;
  let reps = null;

  const weightUnit = core.match(/(\d+(?:\.\d+)?)\s*(?:lb|lbs|pound|pounds|kg)/);
  const weightFor = core.match(/(?:at\s+)?(\d+(?:\.\d+)?)\s*(?:for|x|\*)\s*\d+/);
  const repsMarked = core.match(/(\d+)\s*(?:rep|reps)/) || core.match(/(?:for|x|\*)\s*(\d+)/);

  if (weightUnit) weight = Number(weightUnit[1]);
  else if (weightFor) weight = Number(weightFor[1]);
  if (repsMarked) reps = Number(repsMarked[1]);

  // Fallback: "exercise 70 8" (two trailing numbers, no units/markers).
  if (weight == null && reps == null) {
    const nums = core.match(/\d+(?:\.\d+)?/g);
    if (nums && nums.length >= 2) {
      weight = Number(nums[0]);
      reps = Number(nums[1]);
    }
  }

  if (exerciseMatch?.[1]) $("#exercise").value = canonicalizeExercise(exerciseMatch[1].trim());
  if (weight != null) $("#weight").value = weight;
  if (reps != null) $("#reps").value = reps;
  if (rpeMatch?.[1]) $("#rpe").value = Number(rpeMatch[1]);

  updateSetSequence();
  refreshExerciseList();
  const got = [exerciseMatch?.[1] && "exercise", weight != null && "weight", reps != null && "reps"].filter(Boolean);
  setFeedback("#parse-feedback", got.length ? `Parsed ${got.join(", ")}. Confirm and tap Log set.` : "Couldn't parse that — enter it manually.");
}

/* ---------- Rest timer ------------------------------------- */
// Timestamp-based so it stays correct when the tab is backgrounded or the
// screen locks (decrementing setInterval drifts/freezes under throttling —
// exactly what happens when you pocket the phone mid-rest).
function startRestTimer(seconds) {
  stopRestTimer();
  const total = Math.max(5, Math.floor(seconds));
  state.rest.total = total;
  state.rest.endAt = Date.now() + total * 1000;
  state.rest.warned10 = false;
  requestWakeLock();
  primeAudio();
  renderRestStatus();
  maybeSpeak(`Rest for ${total} seconds.`);
  state.rest.intervalId = setInterval(tickRest, 250);
}

function tickRest() {
  if (!state.rest.endAt) return;
  const remaining = Math.ceil((state.rest.endAt - Date.now()) / 1000);
  if (remaining <= 10 && remaining > 0 && !state.rest.warned10) {
    state.rest.warned10 = true;
    maybeSpeak("Ten seconds.");
  }
  if (remaining <= 0) {
    completeRest();
    return;
  }
  renderRestStatus(remaining);
}

function completeRest() {
  stopRestTimer();
  beep();
  maybeSpeak("Rest complete. Next set.");
  setFeedback("#parse-feedback", "Rest complete.");
}

function stopRestTimer() {
  if (state.rest.intervalId) clearInterval(state.rest.intervalId);
  releaseWakeLock();
  state.rest = { intervalId: null, endAt: 0, total: 0, wakeLock: null, warned10: false };
  renderRestStatus();
}

function renderRestStatus(remaining) {
  const el = $("#rest-status");
  if (!el) return;
  const left = remaining ?? (state.rest.endAt ? Math.ceil((state.rest.endAt - Date.now()) / 1000) : 0);
  if (left <= 0) {
    el.textContent = "Rest off";
    el.className = "badge";
    return;
  }
  el.textContent = `Rest ${left}s`;
  el.className = "badge alert";
}

// Reconcile after the tab was hidden (timers throttle while backgrounded).
function reconcileRest() {
  if (!state.rest.endAt) return;
  const remaining = Math.ceil((state.rest.endAt - Date.now()) / 1000);
  if (remaining <= 0) completeRest();
  else { renderRestStatus(remaining); requestWakeLock(); }
}

/* ---------- Screen wake lock (best-effort) ----------------- */
async function requestWakeLock() {
  if (!("wakeLock" in navigator)) return;
  try {
    state.rest.wakeLock = await navigator.wakeLock.request("screen");
  } catch { /* user/agent declined — fine */ }
}
function releaseWakeLock() {
  try { state.rest.wakeLock?.release?.(); } catch {}
  state.rest.wakeLock = null;
}

/* ---------- Audio cue -------------------------------------- */
let audioCtx = null;
function primeAudio() {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
  } catch {}
}
function beep() {
  try {
    primeAudio();
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.3, audioCtx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.4);
  } catch {}
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
