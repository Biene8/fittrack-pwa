// ─── Types ────────────────────────────────────────────────────────────────────

export interface FoodEntry {
  id: string;
  description: string;
  kcal: number;
  protein_g: number;
  timestamp: string;
}

export interface TrainingEntry {
  id: string;
  type: string;
  duration_min: number;
  kcal_burned: number;
  timestamp: string;
}

export interface DayLog {
  date: string; // YYYY-MM-DD
  food: FoodEntry[];
  training: TrainingEntry[];
  weight_kg?: number;
  bmr?: number;
  dayStarted: boolean;
  dayEnded: boolean;
}

export interface Settings {
  weight_kg: number;
  height_cm: number;
  age: number;
  gender: "male" | "female";
  activity: number; // multiplier
  kcal_deficit: number;
  protein_goal_g: number;
  bmr: number;
  kcal_goal: number;
}

export interface AppState {
  settings: Settings;
  days: Record<string, DayLog>;
}

// ─── BMR Calculation (Mifflin-St Jeor) ────────────────────────────────────────

export function calcBMR(s: Settings): number {
  const base = 10 * s.weight_kg + 6.25 * s.height_cm - 5 * s.age;
  const bmr = s.gender === "male" ? base + 5 : base - 161;
  return Math.round(bmr * s.activity);
}

// ─── Historical Data ───────────────────────────────────────────────────────────

const HISTORICAL_DAYS: DayLog[] = [
  { date: "2026-01-17", food: [{ id: "h1", description: "Frühstück", kcal: 450, protein_g: 35, timestamp: "2026-01-17T08:00:00Z" }], training: [], weight_kg: 93, dayStarted: true, dayEnded: true },
  { date: "2026-01-18", food: [{ id: "h2", description: "Essen", kcal: 1650, protein_g: 120, timestamp: "2026-01-18T12:00:00Z" }], training: [], dayStarted: true, dayEnded: true },
  { date: "2026-01-19", food: [{ id: "h3", description: "Essen", kcal: 1800, protein_g: 140, timestamp: "2026-01-19T12:00:00Z" }], training: [{ id: "ht1", type: "Push", duration_min: 90, kcal_burned: 450, timestamp: "2026-01-19T17:00:00Z" }], dayStarted: true, dayEnded: true },
  { date: "2026-01-20", food: [{ id: "h4", description: "Essen", kcal: 1600, protein_g: 130, timestamp: "2026-01-20T12:00:00Z" }], training: [], dayStarted: true, dayEnded: true },
  { date: "2026-01-21", food: [{ id: "h5", description: "Essen", kcal: 1750, protein_g: 150, timestamp: "2026-01-21T12:00:00Z" }], training: [{ id: "ht2", type: "Pull", duration_min: 90, kcal_burned: 450, timestamp: "2026-01-21T17:00:00Z" }], dayStarted: true, dayEnded: true },
  { date: "2026-01-22", food: [{ id: "h6", description: "Essen", kcal: 1700, protein_g: 160, timestamp: "2026-01-22T12:00:00Z" }], training: [], dayStarted: true, dayEnded: true },
  { date: "2026-01-23", food: [{ id: "h7", description: "Essen", kcal: 1900, protein_g: 170, timestamp: "2026-01-23T12:00:00Z" }], training: [], dayStarted: true, dayEnded: true },
  { date: "2026-01-24", food: [{ id: "h8", description: "Essen", kcal: 1650, protein_g: 145, timestamp: "2026-01-24T12:00:00Z" }], training: [], dayStarted: true, dayEnded: true },
  { date: "2026-01-25", food: [{ id: "h9", description: "Essen", kcal: 1800, protein_g: 155, timestamp: "2026-01-25T12:00:00Z" }], training: [{ id: "ht3", type: "Push", duration_min: 90, kcal_burned: 450, timestamp: "2026-01-25T17:00:00Z" }], dayStarted: true, dayEnded: true },
  { date: "2026-01-26", food: [{ id: "h10", description: "Essen", kcal: 1700, protein_g: 160, timestamp: "2026-01-26T12:00:00Z" }], training: [], dayStarted: true, dayEnded: true },
  { date: "2026-01-27", food: [{ id: "h11", description: "Essen", kcal: 1600, protein_g: 130, timestamp: "2026-01-27T12:00:00Z" }], training: [], dayStarted: true, dayEnded: true },
  { date: "2026-01-28", food: [{ id: "h12", description: "Essen", kcal: 1750, protein_g: 145, timestamp: "2026-01-28T12:00:00Z" }], training: [{ id: "ht4", type: "Pull", duration_min: 90, kcal_burned: 450, timestamp: "2026-01-28T17:00:00Z" }], dayStarted: true, dayEnded: true },
  { date: "2026-01-29", food: [{ id: "h13", description: "Essen", kcal: 1680, protein_g: 150, timestamp: "2026-01-29T12:00:00Z" }], training: [], dayStarted: true, dayEnded: true },
  { date: "2026-01-30", food: [{ id: "h14", description: "Essen", kcal: 1720, protein_g: 155, timestamp: "2026-01-30T12:00:00Z" }], training: [], dayStarted: true, dayEnded: true },
  { date: "2026-01-31", food: [{ id: "h15", description: "Essen", kcal: 1650, protein_g: 140, timestamp: "2026-01-31T12:00:00Z" }], training: [], dayStarted: true, dayEnded: true },
  { date: "2026-02-01", food: [{ id: "h16", description: "Essen", kcal: 1800, protein_g: 160, timestamp: "2026-02-01T12:00:00Z" }], training: [{ id: "ht5", type: "Push", duration_min: 90, kcal_burned: 450, timestamp: "2026-02-01T17:00:00Z" }], weight_kg: 92, dayStarted: true, dayEnded: true },
  { date: "2026-02-02", food: [{ id: "h17", description: "Essen", kcal: 1700, protein_g: 150, timestamp: "2026-02-02T12:00:00Z" }], training: [], weight_kg: 91, dayStarted: true, dayEnded: true },
  { date: "2026-02-03", food: [{ id: "h18", description: "Essen", kcal: 1574, protein_g: 130, timestamp: "2026-02-03T12:00:00Z" }], training: [], dayStarted: true, dayEnded: true },
  { date: "2026-02-04", food: [{ id: "h19", description: "Essen", kcal: 1574, protein_g: 130, timestamp: "2026-02-04T12:00:00Z" }], training: [], dayStarted: true, dayEnded: true },
  { date: "2026-02-05", food: [{ id: "h20", description: "Essen", kcal: 1574, protein_g: 130, timestamp: "2026-02-05T12:00:00Z" }], training: [], dayStarted: true, dayEnded: true },
  { date: "2026-02-06", food: [{ id: "h21", description: "Essen", kcal: 1574, protein_g: 130, timestamp: "2026-02-06T12:00:00Z" }], training: [], dayStarted: true, dayEnded: true },
  { date: "2026-02-07", food: [{ id: "h22", description: "Essen", kcal: 1574, protein_g: 130, timestamp: "2026-02-07T12:00:00Z" }], training: [], dayStarted: true, dayEnded: true },
  // Tag 22 - 9. Feb
  { date: "2026-02-09", food: [
    { id: "d22_1", description: "Protein Brötchen", kcal: 380, protein_g: 25, timestamp: "2026-02-09T08:00:00Z" },
    { id: "d22_2", description: "Croissant", kcal: 280, protein_g: 8, timestamp: "2026-02-09T08:30:00Z" },
    { id: "d22_3", description: "Zimtschnecke", kcal: 320, protein_g: 7, timestamp: "2026-02-09T09:00:00Z" },
    { id: "d22_4", description: "Banane", kcal: 105, protein_g: 1, timestamp: "2026-02-09T09:30:00Z" },
    { id: "d22_5", description: "Big Steak Dürüm", kcal: 680, protein_g: 48, timestamp: "2026-02-09T13:00:00Z" },
  ], training: [], dayStarted: true, dayEnded: true },
  // Tag 23 - 10. Feb
  { date: "2026-02-10", food: [
    { id: "d23_1", description: "Burger", kcal: 620, protein_g: 42, timestamp: "2026-02-10T12:00:00Z" },
    { id: "d23_2", description: "Reis mit Linsencurry & Tiger Garnelen (x2)", kcal: 960, protein_g: 76, timestamp: "2026-02-10T13:00:00Z" },
    { id: "d23_3", description: "500ml Milch + 2 Scoops Whey", kcal: 320, protein_g: 52, timestamp: "2026-02-10T20:00:00Z" },
  ], training: [], dayStarted: true, dayEnded: true },
  // Tag 24 - 11. Feb
  { date: "2026-02-11", food: [
    { id: "d24_1", description: "Big Steak Dürüm", kcal: 680, protein_g: 48, timestamp: "2026-02-11T13:00:00Z" },
    { id: "d24_2", description: "500g Skyr + 2 Scoops Whey + 20g Kollagen", kcal: 380, protein_g: 88, timestamp: "2026-02-11T16:00:00Z" },
    { id: "d24_3", description: "500ml Milch + 2 Scoops Whey", kcal: 320, protein_g: 52, timestamp: "2026-02-11T20:00:00Z" },
    { id: "d24_4", description: "More Protein Chips", kcal: 180, protein_g: 20, timestamp: "2026-02-11T21:00:00Z" },
  ], training: [{ id: "dt24_1", type: "Push", duration_min: 90, kcal_burned: 450, timestamp: "2026-02-11T17:00:00Z" }], dayStarted: true, dayEnded: true },
  // Tag 25 - 12. Feb
  { date: "2026-02-12", food: [
    { id: "d25_1", description: "Reis mit Linsencurry & Tiger Garnelen (x2)", kcal: 960, protein_g: 76, timestamp: "2026-02-12T12:00:00Z" },
    { id: "d25_2", description: "Jack Link's Beef Jerky", kcal: 110, protein_g: 24, timestamp: "2026-02-12T20:00:00Z" },
  ], training: [{ id: "dt25_1", type: "Pull", duration_min: 90, kcal_burned: 450, timestamp: "2026-02-12T17:00:00Z" }], dayStarted: true, dayEnded: true },
  // Tags 26-29 - Durchschnitt
  { date: "2026-02-13", food: [{ id: "d26", description: "Ø-Tag (nicht getrackt)", kcal: 1574, protein_g: 130, timestamp: "2026-02-13T12:00:00Z" }], training: [], dayStarted: true, dayEnded: true },
  { date: "2026-02-14", food: [{ id: "d27", description: "Ø-Tag (nicht getrackt)", kcal: 1574, protein_g: 130, timestamp: "2026-02-14T12:00:00Z" }], training: [], dayStarted: true, dayEnded: true },
  { date: "2026-02-15", food: [{ id: "d28", description: "Ø-Tag (nicht getrackt)", kcal: 1574, protein_g: 130, timestamp: "2026-02-15T12:00:00Z" }], training: [], dayStarted: true, dayEnded: true },
  { date: "2026-02-16", food: [{ id: "d29", description: "Ø-Tag (nicht getrackt)", kcal: 1574, protein_g: 130, timestamp: "2026-02-16T12:00:00Z" }], training: [], dayStarted: true, dayEnded: true },
  // Tag 30 - 17. Feb
  { date: "2026-02-17", food: [
    { id: "d30_1", description: "500ml Milch + 2 Scoops Whey", kcal: 320, protein_g: 52, timestamp: "2026-02-17T08:00:00Z" },
    { id: "d30_2", description: "Kartoffelpüree + Fleischbällchen (x3)", kcal: 1560, protein_g: 126, timestamp: "2026-02-17T13:00:00Z" },
    { id: "d30_3", description: "Nudeln mit Bolognese", kcal: 680, protein_g: 54, timestamp: "2026-02-17T19:00:00Z" },
  ], training: [], dayStarted: true, dayEnded: true },
  // Tag 31 - 18. Feb
  { date: "2026-02-18", food: [
    { id: "d31_1", description: "500ml Milch + 2 Scoops Whey", kcal: 320, protein_g: 52, timestamp: "2026-02-18T08:00:00Z" },
    { id: "d31_2", description: "Tomaten Mozzarella Brötchen mit Pesto", kcal: 380, protein_g: 18, timestamp: "2026-02-18T10:00:00Z" },
    { id: "d31_3", description: "Salami Brötchen mit Salat & Ei", kcal: 420, protein_g: 26, timestamp: "2026-02-18T12:00:00Z" },
    { id: "d31_4", description: "Dönerteller", kcal: 650, protein_g: 52, timestamp: "2026-02-18T14:00:00Z" },
    { id: "d31_5", description: "Köfte Baguette", kcal: 520, protein_g: 38, timestamp: "2026-02-18T19:00:00Z" },
  ], training: [], weight_kg: 90, dayStarted: true, dayEnded: true },
  // Tags 32-36 - Durchschnitt
  { date: "2026-02-19", food: [{ id: "d32", description: "Ø-Tag (nicht getrackt)", kcal: 2425, protein_g: 160, timestamp: "2026-02-19T12:00:00Z" }], training: [], dayStarted: true, dayEnded: true },
  { date: "2026-02-20", food: [{ id: "d33", description: "Ø-Tag (nicht getrackt)", kcal: 2425, protein_g: 160, timestamp: "2026-02-20T12:00:00Z" }], training: [], dayStarted: true, dayEnded: true },
  { date: "2026-02-21", food: [{ id: "d34", description: "Ø-Tag (nicht getrackt)", kcal: 2425, protein_g: 160, timestamp: "2026-02-21T12:00:00Z" }], training: [], dayStarted: true, dayEnded: true },
  { date: "2026-02-22", food: [{ id: "d35", description: "Ø-Tag (nicht getrackt)", kcal: 2425, protein_g: 160, timestamp: "2026-02-22T12:00:00Z" }], training: [], dayStarted: true, dayEnded: true },
  { date: "2026-02-23", food: [{ id: "d36", description: "Ø-Tag (nicht getrackt)", kcal: 2425, protein_g: 160, timestamp: "2026-02-23T12:00:00Z" }], training: [], dayStarted: true, dayEnded: true },
  // Tag 37 - 24. Feb
  { date: "2026-02-24", food: [
    { id: "d37_1", description: "200ml Milch + 1 Scoop Designer Whey", kcal: 140, protein_g: 26, timestamp: "2026-02-24T08:00:00Z" },
    { id: "d37_2", description: "ESN Designer Bar Almond Coconut (x2)", kcal: 380, protein_g: 36, timestamp: "2026-02-24T10:00:00Z" },
    { id: "d37_3", description: "More Protein Chips (50g)", kcal: 180, protein_g: 20, timestamp: "2026-02-24T15:00:00Z" },
    { id: "d37_4", description: "Bowl (Kartoffeln, Rinderhack, Hirtenkäse)", kcal: 580, protein_g: 48, timestamp: "2026-02-24T18:00:00Z" },
    { id: "d37_5", description: "500ml Milch + 2 Scoops Designer Whey", kcal: 300, protein_g: 52, timestamp: "2026-02-24T21:00:00Z" },
  ], training: [], dayStarted: true, dayEnded: true },
  // Tag 38 - 25. Feb
  { date: "2026-02-25", food: [
    { id: "d38_1", description: "Große Banane", kcal: 130, protein_g: 2, timestamp: "2026-02-25T08:00:00Z" },
    { id: "d38_2", description: "200ml Milch + 1 Scoop Designer Whey", kcal: 140, protein_g: 26, timestamp: "2026-02-25T09:00:00Z" },
    { id: "d38_3", description: "Steak Dürüm", kcal: 680, protein_g: 48, timestamp: "2026-02-25T13:00:00Z" },
    { id: "d38_4", description: "Aoste Salami Sticks", kcal: 180, protein_g: 16, timestamp: "2026-02-25T16:00:00Z" },
    { id: "d38_5", description: "Lorenz Rosmarin Chips", kcal: 160, protein_g: 3, timestamp: "2026-02-25T17:00:00Z" },
  ], training: [], dayStarted: true, dayEnded: true },
  // Tag 39 - 26. Feb
  { date: "2026-02-26", food: [
    { id: "d39_1", description: "Bowl mit Kartoffeln, Rinderhack, Hirtenkäse (groß)", kcal: 680, protein_g: 56, timestamp: "2026-02-26T12:00:00Z" },
    { id: "d39_2", description: "400ml Milch + 2 Scoops Designer Whey", kcal: 280, protein_g: 52, timestamp: "2026-02-26T16:00:00Z" },
    { id: "d39_3", description: "Jerked Chicken Brötchen", kcal: 420, protein_g: 38, timestamp: "2026-02-26T19:00:00Z" },
  ], training: [], dayStarted: true, dayEnded: true },
];

// ─── Default Settings ──────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: Settings = {
  weight_kg: 90,
  height_cm: 180,
  age: 25,
  gender: "male",
  activity: 1.375,
  kcal_deficit: 500,
  protein_goal_g: 200,
  bmr: 2150,
  kcal_goal: 1650,
};

// ─── Storage ───────────────────────────────────────────────────────────────────

const STORAGE_KEY = "fittrack_state";
// Increment this when historical data changes to force a re-merge
const HISTORICAL_VERSION = 2;
const VERSION_KEY = "fittrack_hist_version";

function buildInitialDays(): Record<string, DayLog> {
  const map: Record<string, DayLog> = {};
  for (const d of HISTORICAL_DAYS) {
    map[d.date] = d;
  }
  return map;
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const savedVersion = parseInt(localStorage.getItem(VERSION_KEY) ?? "0", 10);
    const historical = buildInitialDays();

    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      // Always merge historical days that might be missing
      for (const [date, day] of Object.entries(historical)) {
        if (!parsed.days[date]) {
          parsed.days[date] = day;
        }
      }
      // If version changed, force re-merge (overwrite historical days with fresh data)
      if (savedVersion < HISTORICAL_VERSION) {
        for (const [date, day] of Object.entries(historical)) {
          parsed.days[date] = day;
        }
        localStorage.setItem(VERSION_KEY, String(HISTORICAL_VERSION));
      }
      return parsed;
    }
  } catch {
    // ignore
  }
  localStorage.setItem(VERSION_KEY, String(HISTORICAL_VERSION));
  return {
    settings: DEFAULT_SETTINGS,
    days: buildInitialDays(),
  };
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "short" });
}

export function getDayTotals(day: DayLog) {
  const kcal = day.food.reduce((s, f) => s + f.kcal, 0);
  const protein_g = day.food.reduce((s, f) => s + f.protein_g, 0);
  const burned = day.training.reduce((s, t) => s + t.kcal_burned, 0);
  return { kcal, protein_g, burned };
}
