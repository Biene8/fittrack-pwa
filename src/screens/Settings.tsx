import { useState } from "react";
import { useApp } from "../context";
import { calcBMR } from "../store";

export default function Settings() {
  const { state, updateSettings } = useApp();
  const { settings } = state;

  const [form, setForm] = useState({ ...settings });
  const [saved, setSaved] = useState(false);

  function handleSave() {
    updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const previewBMR = calcBMR(form);
  const previewGoal = previewBMR - form.kcal_deficit;

  const activityOptions = [
    { value: 1.2, label: "Kaum aktiv (Büro)" },
    { value: 1.375, label: "Leicht aktiv (1-3×/Woche)" },
    { value: 1.55, label: "Mäßig aktiv (3-5×/Woche)" },
    { value: 1.725, label: "Sehr aktiv (6-7×/Woche)" },
    { value: 1.9, label: "Extrem aktiv (2×/Tag)" },
  ];

  return (
    <div className="screen">
      <div className="screen-header">
        <h1>Einstellungen</h1>
        <p>Grundumsatz & Ziele</p>
      </div>
      <div className="screen-content">

        {/* BMR preview */}
        <div className="card" style={{ background: "var(--primary)", color: "#fff" }}>
          <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.8, marginBottom: 4 }}>Dein Grundumsatz (BMR)</div>
          <div style={{ fontSize: 36, fontWeight: 900 }}>{previewBMR} kcal</div>
          <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>Kalorienziel: {previewGoal} kcal/Tag</div>
          <div style={{ fontSize: 13, opacity: 0.8 }}>Protein-Ziel: {form.protein_goal_g}g/Tag</div>
        </div>

        {/* Body stats */}
        <div className="card">
          <div className="section-title">Körperdaten</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
            <label>
              <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4 }}>Gewicht (kg)</div>
              <input type="number" value={form.weight_kg}
                onChange={e => setForm(f => ({ ...f, weight_kg: +e.target.value }))} />
            </label>
            <label>
              <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4 }}>Größe (cm)</div>
              <input type="number" value={form.height_cm}
                onChange={e => setForm(f => ({ ...f, height_cm: +e.target.value }))} />
            </label>
            <label>
              <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4 }}>Alter</div>
              <input type="number" value={form.age}
                onChange={e => setForm(f => ({ ...f, age: +e.target.value }))} />
            </label>
            <label>
              <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4 }}>Geschlecht</div>
              <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value as "male" | "female" }))}>
                <option value="male">Männlich</option>
                <option value="female">Weiblich</option>
              </select>
            </label>
            <label>
              <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4 }}>Aktivitätslevel</div>
              <select value={form.activity} onChange={e => setForm(f => ({ ...f, activity: +e.target.value }))}>
                {activityOptions.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* Goals */}
        <div className="card">
          <div className="section-title">Ziele</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
            <label>
              <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4 }}>Kaloriendefizit (kcal/Tag)</div>
              <input type="number" value={form.kcal_deficit}
                onChange={e => setForm(f => ({ ...f, kcal_deficit: +e.target.value }))} />
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
                Positiv = Defizit (Abnehmen), Negativ = Überschuss (Zunehmen)
              </div>
            </label>
            <label>
              <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4 }}>Protein-Ziel (g/Tag)</div>
              <input type="number" value={form.protein_goal_g}
                onChange={e => setForm(f => ({ ...f, protein_goal_g: +e.target.value }))} />
            </label>
          </div>
        </div>

        <button className="btn btn-primary" onClick={handleSave} style={{ width: "100%" }}>
          {saved ? "✓ Gespeichert!" : "Einstellungen speichern"}
        </button>

        {/* Info */}
        <div className="card" style={{ background: "var(--surface2)" }}>
          <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>
            <strong style={{ color: "var(--fg)" }}>BMR-Berechnung</strong> nach Mifflin-St Jeor.
            Wenn du dein Gewicht einträgst, wird der BMR automatisch neu berechnet.
            Dein Kalorienziel = BMR × Aktivität − Defizit.
          </div>
        </div>
      </div>
    </div>
  );
}
