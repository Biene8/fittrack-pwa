import React, { createContext, useContext, useReducer, useEffect, useCallback } from "react";
import {
  AppState, DayLog, FoodEntry, TrainingEntry, Settings,
  loadState, saveState, todayKey, calcBMR, getHistoricalDays, getDayTotals,
} from "./store";

// ─── Actions ──────────────────────────────────────────────────────────────────

type Action =
  | { type: "START_DAY" }
  | { type: "END_DAY" }
  | { type: "ADD_FOOD"; payload: Omit<FoodEntry, "id" | "timestamp"> }
  | { type: "REMOVE_FOOD"; payload: { date: string; id: string } }
  | { type: "ADD_TRAINING"; payload: Omit<TrainingEntry, "id" | "timestamp"> }
  | { type: "REMOVE_TRAINING"; payload: { date: string; id: string } }
  | { type: "LOG_WEIGHT"; payload: { weight_kg: number } }
  | { type: "UPDATE_SETTINGS"; payload: Partial<Settings> }
  | { type: "FORCE_MERGE_HISTORICAL" }
  // Date-specific actions for editing past/future days
  | { type: "ADD_FOOD_TO_DATE"; payload: { date: string } & Omit<FoodEntry, "id" | "timestamp"> }
  | { type: "ADD_TRAINING_TO_DATE"; payload: { date: string } & Omit<TrainingEntry, "id" | "timestamp"> }
  | { type: "FILL_WITH_AVERAGE"; payload: { date: string } };

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function ensureDay(state: AppState, date: string): DayLog {
  return state.days[date] ?? {
    date,
    food: [],
    training: [],
    dayStarted: true,
    dayEnded: true,
  };
}

function ensureToday(state: AppState): DayLog {
  return ensureDay(state, todayKey());
}

function reducer(state: AppState, action: Action): AppState {
  const key = todayKey();

  switch (action.type) {
    case "START_DAY": {
      const day = ensureToday(state);
      return { ...state, days: { ...state.days, [key]: { ...day, dayStarted: true, dayEnded: false } } };
    }
    case "END_DAY": {
      const day = ensureToday(state);
      return { ...state, days: { ...state.days, [key]: { ...day, dayEnded: true } } };
    }
    case "ADD_FOOD": {
      const day = ensureToday(state);
      const entry: FoodEntry = { ...action.payload, id: uid(), timestamp: new Date().toISOString() };
      return { ...state, days: { ...state.days, [key]: { ...day, food: [...day.food, entry] } } };
    }
    case "REMOVE_FOOD": {
      const { date, id } = action.payload;
      const day = state.days[date];
      if (!day) return state;
      return { ...state, days: { ...state.days, [date]: { ...day, food: day.food.filter(f => f.id !== id) } } };
    }
    case "ADD_TRAINING": {
      const day = ensureToday(state);
      const entry: TrainingEntry = { ...action.payload, id: uid(), timestamp: new Date().toISOString() };
      return { ...state, days: { ...state.days, [key]: { ...day, training: [...day.training, entry] } } };
    }
    case "REMOVE_TRAINING": {
      const { date, id } = action.payload;
      const day = state.days[date];
      if (!day) return state;
      return { ...state, days: { ...state.days, [date]: { ...day, training: day.training.filter(t => t.id !== id) } } };
    }
    case "LOG_WEIGHT": {
      const day = ensureToday(state);
      const newSettings = { ...state.settings, weight_kg: action.payload.weight_kg };
      const newBMR = calcBMR(newSettings);
      const updatedSettings = { ...newSettings, bmr: newBMR, kcal_goal: newBMR - newSettings.kcal_deficit };
      return {
        ...state,
        settings: updatedSettings,
        days: { ...state.days, [key]: { ...day, weight_kg: action.payload.weight_kg } },
      };
    }
    case "UPDATE_SETTINGS": {
      const newSettings = { ...state.settings, ...action.payload };
      const newBMR = calcBMR(newSettings);
      const updated = { ...newSettings, bmr: newBMR, kcal_goal: newBMR - newSettings.kcal_deficit };
      return { ...state, settings: updated };
    }
    case "FORCE_MERGE_HISTORICAL": {
      const historical = getHistoricalDays();
      const newDays = { ...state.days };
      for (const day of historical) {
        if (!newDays[day.date]) {
          newDays[day.date] = day;
        }
      }
      return { ...state, days: newDays };
    }
    case "ADD_FOOD_TO_DATE": {
      const { date, ...foodData } = action.payload;
      const day = ensureDay(state, date);
      const entry: FoodEntry = { ...foodData, id: uid(), timestamp: `${date}T12:00:00Z` };
      return { ...state, days: { ...state.days, [date]: { ...day, food: [...day.food, entry] } } };
    }
    case "ADD_TRAINING_TO_DATE": {
      const { date, ...trainingData } = action.payload;
      const day = ensureDay(state, date);
      const entry: TrainingEntry = { ...trainingData, id: uid(), timestamp: `${date}T17:00:00Z` };
      return { ...state, days: { ...state.days, [date]: { ...day, training: [...day.training, entry] } } };
    }
    case "FILL_WITH_AVERAGE": {
      const { date } = action.payload;
      // Calculate average from last 14 tracked days (excluding the target date)
      const trackedDays = Object.values(state.days)
        .filter(d => d.date !== date && d.dayEnded && d.food.length > 0)
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 14);
      if (trackedDays.length === 0) return state;
      const avgKcal = Math.round(trackedDays.reduce((s, d) => s + getDayTotals(d).kcal, 0) / trackedDays.length);
      const avgProtein = Math.round(trackedDays.reduce((s, d) => s + getDayTotals(d).protein_g, 0) / trackedDays.length);
      const day = ensureDay(state, date);
      const entry: FoodEntry = {
        id: uid(),
        description: `Ø-Tag (${avgKcal} kcal, ${avgProtein}g P – Durchschnitt)`,
        kcal: avgKcal,
        protein_g: avgProtein,
        timestamp: `${date}T12:00:00Z`,
      };
      return {
        ...state,
        days: {
          ...state.days,
          [date]: { ...day, food: [...day.food, entry], dayStarted: true, dayEnded: true },
        },
      };
    }
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  startDay: () => void;
  endDay: () => void;
  addFood: (f: Omit<FoodEntry, "id" | "timestamp">) => void;
  removeFood: (date: string, id: string) => void;
  addTraining: (t: Omit<TrainingEntry, "id" | "timestamp">) => void;
  removeTraining: (date: string, id: string) => void;
  logWeight: (weight_kg: number) => void;
  updateSettings: (s: Partial<Settings>) => void;
  forceReloadHistory: () => void;
  addFoodToDate: (date: string, f: Omit<FoodEntry, "id" | "timestamp">) => void;
  addTrainingToDate: (date: string, t: Omit<TrainingEntry, "id" | "timestamp">) => void;
  fillWithAverage: (date: string) => void;
  todayLog: DayLog;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  // On every mount, ensure historical data is present
  useEffect(() => {
    dispatch({ type: "FORCE_MERGE_HISTORICAL" });
  }, []);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const todayLog: DayLog = state.days[todayKey()] ?? {
    date: todayKey(), food: [], training: [], dayStarted: false, dayEnded: false,
  };

  const startDay = useCallback(() => dispatch({ type: "START_DAY" }), []);
  const endDay = useCallback(() => dispatch({ type: "END_DAY" }), []);
  const addFood = useCallback((f: Omit<FoodEntry, "id" | "timestamp">) => dispatch({ type: "ADD_FOOD", payload: f }), []);
  const removeFood = useCallback((date: string, id: string) => dispatch({ type: "REMOVE_FOOD", payload: { date, id } }), []);
  const addTraining = useCallback((t: Omit<TrainingEntry, "id" | "timestamp">) => dispatch({ type: "ADD_TRAINING", payload: t }), []);
  const removeTraining = useCallback((date: string, id: string) => dispatch({ type: "REMOVE_TRAINING", payload: { date, id } }), []);
  const logWeight = useCallback((weight_kg: number) => dispatch({ type: "LOG_WEIGHT", payload: { weight_kg } }), []);
  const updateSettings = useCallback((s: Partial<Settings>) => dispatch({ type: "UPDATE_SETTINGS", payload: s }), []);
  const forceReloadHistory = useCallback(() => dispatch({ type: "FORCE_MERGE_HISTORICAL" }), []);
  const addFoodToDate = useCallback((date: string, f: Omit<FoodEntry, "id" | "timestamp">) =>
    dispatch({ type: "ADD_FOOD_TO_DATE", payload: { date, ...f } }), []);
  const addTrainingToDate = useCallback((date: string, t: Omit<TrainingEntry, "id" | "timestamp">) =>
    dispatch({ type: "ADD_TRAINING_TO_DATE", payload: { date, ...t } }), []);
  const fillWithAverage = useCallback((date: string) =>
    dispatch({ type: "FILL_WITH_AVERAGE", payload: { date } }), []);

  return (
    <AppContext.Provider value={{
      state, startDay, endDay, addFood, removeFood, addTraining, removeTraining,
      logWeight, updateSettings, forceReloadHistory,
      addFoodToDate, addTrainingToDate, fillWithAverage,
      todayLog,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
