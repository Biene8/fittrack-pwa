import { useState } from "react";
import { useApp } from "../context";

export default function LogWeightModal({ onClose }: { onClose: () => void }) {
  const { state, logWeight } = useApp();
  const [weight, setWeight] = useState(String(state.settings.weight_kg));

  function handleSave() {
    const w = parseFloat(weight);
    if (!w || w < 30 || w > 300) return;
    logWeight(w);
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-header">
          <span className="modal-title">Gewicht eintragen</span>
          <button onClick={onClose} style={{ color: "var(--muted)", fontSize: 22 }}>×</button>
        </div>
        <div className="modal-body">
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ fontSize: 64, fontWeight: 900, color: "var(--primary)" }}>{weight || "—"}</div>
            <div style={{ fontSize: 20, color: "var(--muted)", marginTop: 4 }}>kg</div>
          </div>
          <label>
            <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4 }}>Gewicht (kg)</div>
            <input
              type="number"
              step="0.1"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              placeholder="90.0"
              autoFocus
            />
          </label>
          <div style={{ fontSize: 12, color: "var(--muted)", textAlign: "center" }}>
            Letztes Gewicht: {state.settings.weight_kg} kg · BMR wird automatisch neu berechnet
          </div>
          <button className="btn btn-primary" onClick={handleSave} style={{ width: "100%" }}>
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
}
