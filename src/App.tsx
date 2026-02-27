import { useState } from "react";
import { AppProvider } from "./context";
import Today from "./screens/Today";
import History from "./screens/History";
import Analytics from "./screens/Analytics";
import Settings from "./screens/Settings";

type Tab = "today" | "history" | "analytics" | "settings";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: "today",
    label: "Heute",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
      </svg>
    ),
  },
  {
    id: "history",
    label: "Verlauf",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
      </svg>
    ),
  },
  {
    id: "analytics",
    label: "Analyse",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z" />
      </svg>
    ),
  },
  {
    id: "settings",
    label: "Einstellungen",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
      </svg>
    ),
  },
];

function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="tab-bar">
      {TABS.map(t => (
        <button key={t.id} className={`tab-item${active === t.id ? " active" : ""}`} onClick={() => onChange(t.id)}>
          {t.icon}
          {t.label}
        </button>
      ))}
    </nav>
  );
}

export default function App() {
  const [tab, setTab] = useState<Tab>("today");

  return (
    <AppProvider>
      <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--bg)" }}>
        <div style={{ flex: 1, overflow: "hidden" }}>
          {tab === "today" && <Today />}
          {tab === "history" && <History />}
          {tab === "analytics" && <Analytics />}
          {tab === "settings" && <Settings />}
        </div>
        <TabBar active={tab} onChange={setTab} />
      </div>
    </AppProvider>
  );
}
