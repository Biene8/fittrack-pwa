import { useState } from "react";
import { useApp } from "../context";
import { getDayTotals, formatDate, todayKey } from "../store";
import AddFoodModal from "../modals/AddFoodModal";
import AddTrainingModal from "../modals/AddTrainingModal";
import LogWeightModal from "../modals/LogWeightModal";
import PhotoAnalyzeModal from "../modals/PhotoAnalyzeModal";
import BarcodeModal from "../modals/BarcodeModal";

const WEEKDAYS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

export default function Today() {
  const { state, todayLog, startDay, endDay, removeFood, removeTraining } = useApp();
  const { settings } = state;

  const [showFood, setShowFood] = useState(false);
  const [showTraining, setShowTraining] = useState(false);
  const [showWeight, setShowWeight] = useState(false);
  const [showPhoto, setShowPhoto] = useState(false);
  const [showBarcode, setShowBarcode] = useState(false);

  const totals = getDayTotals(todayLog);
  const kcalLeft = settings.kcal_goal - totals.kcal;
  const proteinLeft = settings.protein_goal_g - totals.protein_g;
  const proteinPct = Math.min(100, (totals.protein_g / settings.protein_goal_g) * 100);
  const balance = totals.kcal - (settings.bmr + totals.burned);

  // Week summary (last 7 days excluding today)
  const today = todayKey();
  const last7 = Object.values(state.days)
    .filter(d => d.date < today && d.dayEnded)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 7);
  const avgKcal = last7.length ? Math.round(last7.reduce((s, d) => s + getDayTotals(d).kcal, 0) / last7.length) : 0;
  const avgProtein = last7.length ? Math.round(last7.reduce((s, d) => s + getDayTotals(d).protein_g, 0) / last7.length) : 0;
  const avgBalance = last7.length ? Math.round(last7.reduce((s, d) => {
    const t = getDayTotals(d);
    return s + (t.kcal - (settings.bmr + t.burned));
  }, 0) / last7.length) : 0;
  const trainCount = last7.filter(d => d.training.length > 0).length;

  const now = new Date();
  const dateStr = `${WEEKDAYS[now.getDay()]}, ${now.getDate()}. ${now.toLocaleString("de-DE", { month: "long" })}`;

  return (
    <div className="screen">
      {/* Header */}
      <div className="screen-header">
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 2 }}>{dateStr}</p>
        <h1>Tag {Object.keys(state.days).filter(d => d <= today).length}</h1>
      </div>

      <div className="screen-content">
        {/* Main calorie card */}
        <div className="card" style={{ textAlign: "center", padding: "20px 16px" }}>
          <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
            {kcalLeft >= 0 ? "Noch zu essen" : "Über Ziel"}
          </div>
          <div className="kcal-big" style={{ color: kcalLeft >= 0 ? "var(--primary)" : "var(--danger)" }}>
            {Math.abs(kcalLeft)}
          </div>
          <div className="kcal-label">kcal</div>

          {/* 3-col stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 16 }}>
            {[
              { label: "Gegessen", value: totals.kcal, color: "var(--fg)" },
              { label: "Ziel", value: settings.kcal_goal, color: "var(--fg)" },
              { label: "Verbrannt", value: settings.bmr + totals.burned, color: "var(--orange)" },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Protein bar */}
          <div style={{ marginTop: 16, textAlign: "left" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Protein</span>
              <span style={{ fontSize: 13, color: "var(--muted)" }}>{totals.protein_g}g / {settings.protein_goal_g}g</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${proteinPct}%`, background: "var(--blue)" }} />
            </div>
          </div>

          {/* Balance */}
          <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>Bilanz</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: balance > 0 ? "var(--danger)" : "var(--primary)" }}>
              {balance > 0 ? "+" : ""}{balance} kcal
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="action-row">
          <button className="action-btn" style={{ background: "var(--primary)" }} onClick={() => setShowFood(true)}>
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/></svg>
            Essen
          </button>
          <button className="action-btn" style={{ background: "var(--orange)" }} onClick={() => setShowPhoto(true)}>
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 15.2A3.2 3.2 0 0 1 8.8 12 3.2 3.2 0 0 1 12 8.8 3.2 3.2 0 0 1 15.2 12 3.2 3.2 0 0 1 12 15.2M20 4h-3.17L15 2H9L7.17 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/></svg>
            Foto
          </button>
          <button className="action-btn" style={{ background: "var(--teal)" }} onClick={() => setShowBarcode(true)}>
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M2 6h2v12H2zm3 0h1v12H5zm2 0h3v12H7zm4 0h1v12h-1zm3 0h2v12h-2zm3 0h1v12h-1zm2 0h2v12h-2zM1 4v4H3V5h3V3H2a1 1 0 0 0-1 1zm20-1h-3v2h3v3h2V4a1 1 0 0 0-1-1zM3 16v3H1v3a1 1 0 0 0 1 1h3v-2H3v-3H1v-2zm18 3h-3v2h-3v2h3a1 1 0 0 0 1-1v-3z"/></svg>
            Barcode
          </button>
          <button className="action-btn" style={{ background: "#22c55e" }} onClick={() => setShowTraining(true)}>
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/></svg>
            Training
          </button>
        </div>

        {/* Weight + day controls */}
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-secondary" style={{ flex: 1, fontSize: 13 }} onClick={() => setShowWeight(true)}>
            ⚖️ Gewicht {todayLog.weight_kg ? `(${todayLog.weight_kg} kg)` : "eintragen"}
          </button>
          {!todayLog.dayStarted ? (
            <button className="btn btn-primary" style={{ flex: 1, fontSize: 13 }} onClick={startDay}>Tag starten</button>
          ) : !todayLog.dayEnded ? (
            <button className="btn" style={{ flex: 1, fontSize: 13, background: "var(--muted)", color: "#fff" }} onClick={endDay}>Tag beenden</button>
          ) : (
            <div style={{ flex: 1, textAlign: "center", fontSize: 13, color: "var(--primary)", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center" }}>
              ✓ Tag abgeschlossen
            </div>
          )}
        </div>

        {/* Food entries */}
        {todayLog.food.length > 0 && (
          <div className="card">
            <div className="section-title">Gegessen</div>
            {todayLog.food.map(f => (
              <div key={f.id} className="list-item">
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{f.description}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>{f.kcal} kcal · {f.protein_g}g Protein</div>
                </div>
                <button onClick={() => removeFood(today, f.id)} style={{ color: "var(--danger)", fontSize: 18, padding: "4px 8px" }}>×</button>
              </div>
            ))}
          </div>
        )}

        {/* Training entries */}
        {todayLog.training.length > 0 && (
          <div className="card">
            <div className="section-title">Training</div>
            {todayLog.training.map(t => (
              <div key={t.id} className="list-item">
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{t.type}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>{t.duration_min} min · -{t.kcal_burned} kcal</div>
                </div>
                <button onClick={() => removeTraining(today, t.id)} style={{ color: "var(--danger)", fontSize: 18, padding: "4px 8px" }}>×</button>
              </div>
            ))}
          </div>
        )}

        {/* Week summary */}
        {last7.length > 0 && (
          <div className="card">
            <div className="section-title">Letzte {last7.length} Tage – Durchschnitt</div>
            <div className="stat-grid" style={{ marginTop: 8 }}>
              <div className="stat-box" style={{ background: "var(--danger-light)" }}>
                <div className="stat-value" style={{ color: "var(--danger)" }}>{avgKcal}</div>
                <div className="stat-label">kcal/Tag</div>
              </div>
              <div className="stat-box" style={{ background: "var(--blue-light)" }}>
                <div className="stat-value" style={{ color: "var(--blue)" }}>{avgProtein}g</div>
                <div className="stat-label">Protein/Tag</div>
              </div>
              <div className="stat-box" style={{ background: avgBalance <= 0 ? "var(--primary-light)" : "var(--danger-light)" }}>
                <div className="stat-value" style={{ color: avgBalance <= 0 ? "var(--primary)" : "var(--danger)" }}>
                  {avgBalance > 0 ? "+" : ""}{avgBalance}
                </div>
                <div className="stat-label">Ø Bilanz</div>
              </div>
              <div className="stat-box" style={{ background: "var(--warning-light)" }}>
                <div className="stat-value" style={{ color: "var(--warning)" }}>{trainCount}×</div>
                <div className="stat-label">Training</div>
              </div>
            </div>
          </div>
        )}

        {/* Protein remaining */}
        {proteinLeft > 0 && (
          <div style={{ textAlign: "center", fontSize: 13, color: "var(--muted)", paddingBottom: 8 }}>
            Noch {proteinLeft}g Protein bis zum Ziel
          </div>
        )}
      </div>

      {showFood && <AddFoodModal onClose={() => setShowFood(false)} />}
      {showTraining && <AddTrainingModal onClose={() => setShowTraining(false)} />}
      {showWeight && <LogWeightModal onClose={() => setShowWeight(false)} />}
      {showPhoto && <PhotoAnalyzeModal onClose={() => setShowPhoto(false)} />}
      {showBarcode && <BarcodeModal onClose={() => setShowBarcode(false)} />}
    </div>
  );
}
