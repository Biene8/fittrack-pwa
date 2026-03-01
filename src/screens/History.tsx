import { useState } from "react";
import { useApp } from "../context";
import { getDayTotals, formatDate, todayKey, DayLog } from "../store";
import EditDayModal from "../modals/EditDayModal";

function getTomorrowKey(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export default function History() {
  const { state } = useApp();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editDay, setEditDay] = useState<DayLog | null>(null);

  const today = todayKey();
  const tomorrow = getTomorrowKey();

  // Include today, all past days, and tomorrow
  const allDays = Object.values(state.days)
    .filter(d => d.date <= tomorrow)
    .sort((a, b) => b.date.localeCompare(a.date));

  // Ensure tomorrow always appears (even if empty)
  const hasTomorrow = allDays.some(d => d.date === tomorrow);
  const tomorrowEntry: DayLog = state.days[tomorrow] ?? {
    date: tomorrow,
    food: [],
    training: [],
    dayStarted: false,
    dayEnded: false,
  };
  const days = hasTomorrow ? allDays : [tomorrowEntry, ...allDays];

  const { settings } = state;

  function getDayLabel(date: string): string {
    if (date === tomorrow) return "Morgen (vorplanen)";
    if (date === today) return "Heute";
    return "";
  }

  return (
    <div className="screen">
      <div className="screen-header">
        <h1>Verlauf</h1>
        <p>{days.filter(d => d.date <= today).length} Tage getrackt</p>
      </div>
      <div className="screen-content">
        {days.map(day => {
          const t = getDayTotals(day);
          const balance = t.kcal - (settings.bmr + t.burned);
          const isExpanded = expanded === day.date;
          const label = getDayLabel(day.date);
          const isEmpty = day.food.length === 0 && day.training.length === 0;
          const isFuture = day.date > today;

          return (
            <div key={day.date} className="card" style={{ padding: 0, overflow: "hidden" }}>
              {/* Day label badge */}
              {label && (
                <div style={{
                  padding: "4px 12px", fontSize: 11, fontWeight: 700,
                  background: isFuture ? "var(--blue)" : "var(--primary)",
                  color: "#fff", letterSpacing: 0.5,
                }}>
                  {label}
                </div>
              )}

              <div style={{ display: "flex", alignItems: "center" }}>
                {/* Expand/collapse button */}
                <button
                  style={{ flex: 1, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, background: "none", textAlign: "left" }}
                  onClick={() => setExpanded(isExpanded ? null : day.date)}
                >
                  {/* Date */}
                  <div style={{ minWidth: 48, textAlign: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: isFuture ? "var(--blue)" : "var(--primary)" }}>
                      {new Date(day.date + "T12:00:00").getDate()}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>
                      {new Date(day.date + "T12:00:00").toLocaleString("de-DE", { month: "short" })}
                    </div>
                  </div>

                  {/* Stats */}
                  <div style={{ flex: 1 }}>
                    {isEmpty ? (
                      <div style={{ fontSize: 14, color: "var(--muted)", fontStyle: "italic" }}>Kein Eintrag</div>
                    ) : (
                      <>
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
                      </>
                    )}
                  </div>

                  <span style={{ color: "var(--muted)", fontSize: 18 }}>{isExpanded ? "▲" : "▼"}</span>
                </button>

                {/* Edit button */}
                <button
                  onClick={() => setEditDay(day)}
                  style={{
                    padding: "14px 14px", background: "none", color: "var(--primary)",
                    fontSize: 18, flexShrink: 0, borderLeft: "0.5px solid var(--border)",
                  }}
                  title="Tag bearbeiten"
                >
                  ✏️
                </button>
              </div>

              {/* Expanded detail */}
              {isExpanded && !isEmpty && (
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
                      {day.training.map(tr => (
                        <div key={tr.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13 }}>
                          <span style={{ color: "var(--fg2)" }}>{tr.type} ({tr.duration_min} min)</span>
                          <span style={{ color: "var(--muted)" }}>-{tr.kcal_burned} kcal</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Empty day – quick fill prompt */}
              {isExpanded && isEmpty && (
                <div style={{ borderTop: "0.5px solid var(--border)", padding: "12px 16px", textAlign: "center" }}>
                  <button
                    onClick={() => setEditDay(day)}
                    style={{
                      padding: "10px 20px", borderRadius: "var(--radius)",
                      background: "var(--primary)", color: "#fff",
                      fontSize: 14, fontWeight: 600,
                    }}>
                    Tag bearbeiten
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Edit Day Modal */}
      {editDay && (
        <EditDayModal
          day={editDay}
          onClose={() => setEditDay(null)}
        />
      )}
    </div>
  );
}
