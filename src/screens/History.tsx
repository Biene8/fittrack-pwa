import { useState } from "react";
import { useApp } from "../context";
import { getDayTotals, formatDate, todayKey } from "../store";

export default function History() {
  const { state } = useApp();
  const [expanded, setExpanded] = useState<string | null>(null);

  const today = todayKey();
  const days = Object.values(state.days)
    .filter(d => d.date <= today)
    .sort((a, b) => b.date.localeCompare(a.date));

  const { settings } = state;

  return (
    <div className="screen">
      <div className="screen-header">
        <h1>Verlauf</h1>
        <p>{days.length} Tage getrackt</p>
      </div>
      <div className="screen-content">
        {days.map(day => {
          const t = getDayTotals(day);
          const balance = t.kcal - (settings.bmr + t.burned);
          const isExpanded = expanded === day.date;
          return (
            <div key={day.date} className="card" style={{ padding: 0, overflow: "hidden" }}>
              <button
                style={{ width: "100%", padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, background: "none", textAlign: "left" }}
                onClick={() => setExpanded(isExpanded ? null : day.date)}
              >
                {/* Date */}
                <div style={{ minWidth: 48, textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "var(--primary)" }}>
                    {new Date(day.date + "T12:00:00").getDate()}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>
                    {new Date(day.date + "T12:00:00").toLocaleString("de-DE", { month: "short" })}
                  </div>
                </div>

                {/* Stats */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 12, marginBottom: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 700 }}>{t.kcal} kcal</span>
                    <span style={{ fontSize: 13, color: "var(--blue)", fontWeight: 600 }}>{t.protein_g}g P</span>
                    {day.weight_kg && <span style={{ fontSize: 13, color: "var(--muted)" }}>⚖️ {day.weight_kg} kg</span>}
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: balance <= 0 ? "var(--primary)" : "var(--danger)", fontWeight: 600 }}>
                      {balance > 0 ? "+" : ""}{balance} kcal
                    </span>
                    {day.training.length > 0 && (
                      <span style={{ fontSize: 11, color: "var(--muted)" }}>🏋️ {day.training.length}× Training</span>
                    )}
                    {formatDate(day.date) && (
                      <span style={{ fontSize: 11, color: "var(--muted)" }}>{formatDate(day.date)}</span>
                    )}
                  </div>
                </div>

                <span style={{ color: "var(--muted)", fontSize: 18 }}>{isExpanded ? "▲" : "▼"}</span>
              </button>

              {/* Expanded detail */}
              {isExpanded && (
                <div style={{ borderTop: "0.5px solid var(--border)", padding: "12px 16px" }}>
                  {day.food.length > 0 && (
                    <>
                      <div className="section-title">Mahlzeiten</div>
                      {day.food.map(f => (
                        <div key={f.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "0.5px solid var(--border)", fontSize: 13 }}>
                          <span style={{ flex: 1, color: "var(--fg2)" }}>{f.description}</span>
                          <span style={{ color: "var(--muted)", marginLeft: 8 }}>{f.kcal} kcal · {f.protein_g}g P</span>
                        </div>
                      ))}
                    </>
                  )}
                  {day.training.length > 0 && (
                    <div style={{ marginTop: 10 }}>
                      <div className="section-title">Training</div>
                      {day.training.map(t => (
                        <div key={t.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13 }}>
                          <span style={{ color: "var(--fg2)" }}>{t.type} ({t.duration_min} min)</span>
                          <span style={{ color: "var(--muted)" }}>-{t.kcal_burned} kcal</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
