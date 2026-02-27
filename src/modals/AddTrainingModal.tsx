import { useState } from "react";
import { useApp } from "../context";

const TRAINING_TYPES = [
  { type: "Push Training", kcal_per_min: 5 },
  { type: "Pull Training", kcal_per_min: 5 },
  { type: "Legs Training", kcal_per_min: 6 },
  { type: "Full Body", kcal_per_min: 6 },
  { type: "Cardio (leicht)", kcal_per_min: 7 },
  { type: "Cardio (intensiv)", kcal_per_min: 10 },
  { type: "HIIT", kcal_per_min: 12 },
  { type: "Schwimmen", kcal_per_min: 8 },
  { type: "Radfahren", kcal_per_min: 7 },
  { type: "Laufen", kcal_per_min: 9 },
];

export default function AddTrainingModal({ onClose }: { onClose: () => void }) {
  const { addTraining } = useApp();
  const [selectedType, setSelectedType] = useState(TRAINING_TYPES[0]);
  const [duration, setDuration] = useState("90");
  const [customType, setCustomType] = useState("");
  const [customKcal, setCustomKcal] = useState("");
  const [tab, setTab] = useState<"quick" | "manual">("quick");

  function handleAdd() {
    const type = tab === "quick" ? selectedType.type : customType;
    const dur = +duration;
    const burned = tab === "quick"
      ? Math.round(dur * selectedType.kcal_per_min)
      : +customKcal;
    if (!type || !dur || !burned) return;
    addTraining({ type, duration_min: dur, kcal_burned: burned });
    onClose();
  }

  const previewKcal = Math.round(+duration * selectedType.kcal_per_min);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-header">
          <span className="modal-title">Training hinzufügen</span>
          <button onClick={onClose} style={{ color: "var(--muted)", fontSize: 22 }}>×</button>
        </div>

        <div style={{ display: "flex", borderBottom: "0.5px solid var(--border)", padding: "0 16px" }}>
          {(["quick", "manual"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{
                flex: 1, padding: "10px 0", fontSize: 14, fontWeight: 600,
                color: tab === t ? "var(--primary)" : "var(--muted)",
                borderBottom: tab === t ? "2px solid var(--primary)" : "2px solid transparent",
              }}>
              {t === "quick" ? "Trainingstyp" : "Manuell"}
            </button>
          ))}
        </div>

        <div className="modal-body">
          {tab === "quick" ? (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {TRAINING_TYPES.map(t => (
                  <button key={t.type}
                    onClick={() => setSelectedType(t)}
                    style={{
                      padding: "12px 14px", borderRadius: "var(--radius)", textAlign: "left",
                      display: "flex", justifyContent: "space-between",
                      background: selectedType.type === t.type ? "var(--primary-light)" : "var(--surface2)",
                      border: selectedType.type === t.type ? "1.5px solid var(--primary)" : "1.5px solid transparent",
                    }}>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{t.type}</span>
                    <span style={{ fontSize: 12, color: "var(--muted)" }}>~{t.kcal_per_min} kcal/min</span>
                  </button>
                ))}
              </div>
              <label>
                <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4 }}>Dauer (Minuten)</div>
                <input type="number" value={duration} onChange={e => setDuration(e.target.value)} />
              </label>
              {duration && (
                <div style={{ textAlign: "center", padding: "8px", background: "var(--primary-light)", borderRadius: "var(--radius)", fontSize: 14, fontWeight: 600, color: "var(--primary)" }}>
                  Verbrannt: ~{previewKcal} kcal
                </div>
              )}
            </>
          ) : (
            <>
              <label>
                <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4 }}>Trainingsart</div>
                <input value={customType} onChange={e => setCustomType(e.target.value)} placeholder="z.B. Yoga" />
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <label>
                  <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4 }}>Dauer (min)</div>
                  <input type="number" value={duration} onChange={e => setDuration(e.target.value)} />
                </label>
                <label>
                  <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4 }}>Verbrannte kcal</div>
                  <input type="number" value={customKcal} onChange={e => setCustomKcal(e.target.value)} placeholder="300" />
                </label>
              </div>
            </>
          )}
          <button className="btn btn-primary" onClick={handleAdd} style={{ width: "100%" }}>
            Training speichern
          </button>
        </div>
      </div>
    </div>
  );
}
