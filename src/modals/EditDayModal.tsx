import { useState } from "react";
import { useApp } from "../context";
import { DayLog, getDayTotals, formatDate } from "../store";

const QUICK_FOODS = [
  { description: "500ml Milch + 2 Scoops Whey", kcal: 320, protein_g: 52 },
  { description: "200ml Milch + 1 Scoop Whey", kcal: 140, protein_g: 26 },
  { description: "500g Skyr + 2 Scoops Whey + 20g Kollagen", kcal: 380, protein_g: 88 },
  { description: "Big Steak Dürüm", kcal: 680, protein_g: 48 },
  { description: "Dönerteller", kcal: 650, protein_g: 52 },
  { description: "Reis mit Linsencurry & Tiger Garnelen", kcal: 480, protein_g: 38 },
  { description: "Bowl (Kartoffeln, Rinderhack, Hirtenkäse)", kcal: 580, protein_g: 48 },
  { description: "More Protein Chips (50g)", kcal: 180, protein_g: 20 },
  { description: "ESN Designer Bar Almond Coconut", kcal: 190, protein_g: 18 },
  { description: "Jack Link's Beef Jerky", kcal: 110, protein_g: 24 },
  { description: "Banane", kcal: 105, protein_g: 1 },
  { description: "Protein Brötchen", kcal: 380, protein_g: 25 },
];

const TRAINING_TYPES = [
  { type: "Push Training", kcal_per_min: 5 },
  { type: "Pull Training", kcal_per_min: 5 },
  { type: "Legs Training", kcal_per_min: 6 },
  { type: "Full Body", kcal_per_min: 6 },
  { type: "Cardio (leicht)", kcal_per_min: 7 },
  { type: "Cardio (intensiv)", kcal_per_min: 10 },
  { type: "HIIT", kcal_per_min: 12 },
  { type: "Laufen", kcal_per_min: 9 },
];

type Section = "overview" | "add-food" | "add-training";
type FoodTab = "quick" | "manual";
type TrainingTab = "quick" | "manual";

export default function EditDayModal({ day, onClose }: { day: DayLog; onClose: () => void }) {
  const { removeFood, removeTraining, addFoodToDate, addTrainingToDate, fillWithAverage, state } = useApp();
  const [section, setSection] = useState<Section>("overview");

  // Food form state
  const [foodTab, setFoodTab] = useState<FoodTab>("quick");
  const [desc, setDesc] = useState("");
  const [kcal, setKcal] = useState("");
  const [protein, setProtein] = useState("");

  // Training form state
  const [trainingTab, setTrainingTab] = useState<TrainingTab>("quick");
  const [selectedType, setSelectedType] = useState(TRAINING_TYPES[0]);
  const [duration, setDuration] = useState("90");
  const [customType, setCustomType] = useState("");
  const [customKcal, setCustomKcal] = useState("");

  const totals = getDayTotals(day);
  const { settings } = state;
  const balance = totals.kcal - (settings.bmr + totals.burned);

  function handleAddFood() {
    if (!desc || !kcal || !protein) return;
    addFoodToDate(day.date, { description: desc, kcal: +kcal, protein_g: +protein });
    setDesc(""); setKcal(""); setProtein("");
    setSection("overview");
  }

  function handleQuickFood(f: typeof QUICK_FOODS[0]) {
    addFoodToDate(day.date, f);
    setSection("overview");
  }

  function handleAddTraining() {
    const type = trainingTab === "quick" ? selectedType.type : customType;
    const dur = +duration;
    const burned = trainingTab === "quick"
      ? Math.round(dur * selectedType.kcal_per_min)
      : +customKcal;
    if (!type || !dur || !burned) return;
    addTrainingToDate(day.date, { type, duration_min: dur, kcal_burned: burned });
    setSection("overview");
  }

  function handleFillAverage() {
    fillWithAverage(day.date);
    onClose();
  }

  const previewKcal = Math.round(+duration * selectedType.kcal_per_min);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-header">
          <span className="modal-title">
            {section === "overview" ? formatDate(day.date) : section === "add-food" ? "Essen hinzufügen" : "Training hinzufügen"}
          </span>
          <button onClick={section === "overview" ? onClose : () => setSection("overview")}
            style={{ color: "var(--muted)", fontSize: 22 }}>
            {section === "overview" ? "×" : "←"}
          </button>
        </div>

        <div className="modal-body">
          {section === "overview" && (
            <>
              {/* Summary */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, textAlign: "center" }}>
                <div style={{ background: "var(--surface2)", borderRadius: "var(--radius)", padding: "10px 6px" }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "var(--primary)" }}>{totals.kcal}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>kcal</div>
                </div>
                <div style={{ background: "var(--surface2)", borderRadius: "var(--radius)", padding: "10px 6px" }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "var(--blue)" }}>{totals.protein_g}g</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>Protein</div>
                </div>
                <div style={{ background: "var(--surface2)", borderRadius: "var(--radius)", padding: "10px 6px" }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: balance <= 0 ? "var(--primary)" : "var(--danger)" }}>
                    {balance > 0 ? "+" : ""}{balance}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>Bilanz</div>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <button className="btn btn-primary" onClick={() => setSection("add-food")} style={{ fontSize: 14 }}>
                  + Essen
                </button>
                <button className="btn btn-secondary" onClick={() => setSection("add-training")} style={{ fontSize: 14 }}>
                  + Training
                </button>
              </div>

              {/* Fill with average button */}
              <button
                onClick={handleFillAverage}
                style={{
                  width: "100%", padding: "12px", borderRadius: "var(--radius)",
                  background: "var(--surface2)", border: "1.5px dashed var(--border)",
                  fontSize: 14, fontWeight: 600, color: "var(--muted)",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}>
                <span>📊</span>
                <span>Mit Ø-Werten füllen</span>
              </button>

              {/* Food list */}
              {day.food.length > 0 && (
                <div>
                  <div className="section-title">Mahlzeiten</div>
                  {day.food.map(f => (
                    <div key={f.id} style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "8px 0", borderBottom: "0.5px solid var(--border)",
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 500 }}>{f.description}</div>
                        <div style={{ fontSize: 12, color: "var(--muted)" }}>{f.kcal} kcal · {f.protein_g}g P</div>
                      </div>
                      <button
                        onClick={() => removeFood(day.date, f.id)}
                        style={{ color: "var(--danger)", fontSize: 20, padding: "4px 8px", flexShrink: 0 }}>
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Training list */}
              {day.training.length > 0 && (
                <div>
                  <div className="section-title">Training</div>
                  {day.training.map(t => (
                    <div key={t.id} style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "8px 0", borderBottom: "0.5px solid var(--border)",
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 500 }}>{t.type}</div>
                        <div style={{ fontSize: 12, color: "var(--muted)" }}>{t.duration_min} min · -{t.kcal_burned} kcal</div>
                      </div>
                      <button
                        onClick={() => removeTraining(day.date, t.id)}
                        style={{ color: "var(--danger)", fontSize: 20, padding: "4px 8px", flexShrink: 0 }}>
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {day.food.length === 0 && day.training.length === 0 && (
                <div style={{ textAlign: "center", color: "var(--muted)", fontSize: 14, padding: "16px 0" }}>
                  Noch keine Einträge für diesen Tag.
                </div>
              )}
            </>
          )}

          {section === "add-food" && (
            <>
              <div style={{ display: "flex", borderBottom: "0.5px solid var(--border)", margin: "0 -16px", padding: "0 16px" }}>
                {(["quick", "manual"] as const).map(t => (
                  <button key={t} onClick={() => setFoodTab(t)}
                    style={{
                      flex: 1, padding: "10px 0", fontSize: 14, fontWeight: 600,
                      color: foodTab === t ? "var(--primary)" : "var(--muted)",
                      borderBottom: foodTab === t ? "2px solid var(--primary)" : "2px solid transparent",
                    }}>
                    {t === "quick" ? "Schnellauswahl" : "Manuell"}
                  </button>
                ))}
              </div>

              {foodTab === "quick" ? (
                QUICK_FOODS.map(f => (
                  <button key={f.description}
                    style={{
                      width: "100%", textAlign: "left", padding: "12px 14px",
                      background: "var(--surface2)", borderRadius: "var(--radius)",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                    }}
                    onClick={() => handleQuickFood(f)}>
                    <span style={{ fontSize: 14, fontWeight: 500, flex: 1 }}>{f.description}</span>
                    <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 8, whiteSpace: "nowrap" }}>
                      {f.kcal} kcal · {f.protein_g}g P
                    </span>
                  </button>
                ))
              ) : (
                <>
                  <label>
                    <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4 }}>Beschreibung</div>
                    <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="z.B. Hähnchenbrust mit Reis" />
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <label>
                      <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4 }}>Kalorien (kcal)</div>
                      <input type="number" value={kcal} onChange={e => setKcal(e.target.value)} placeholder="500" />
                    </label>
                    <label>
                      <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4 }}>Protein (g)</div>
                      <input type="number" value={protein} onChange={e => setProtein(e.target.value)} placeholder="40" />
                    </label>
                  </div>
                  <button className="btn btn-primary" onClick={handleAddFood} style={{ width: "100%" }}>
                    Hinzufügen
                  </button>
                </>
              )}
            </>
          )}

          {section === "add-training" && (
            <>
              <div style={{ display: "flex", borderBottom: "0.5px solid var(--border)", margin: "0 -16px", padding: "0 16px" }}>
                {(["quick", "manual"] as const).map(t => (
                  <button key={t} onClick={() => setTrainingTab(t)}
                    style={{
                      flex: 1, padding: "10px 0", fontSize: 14, fontWeight: 600,
                      color: trainingTab === t ? "var(--primary)" : "var(--muted)",
                      borderBottom: trainingTab === t ? "2px solid var(--primary)" : "2px solid transparent",
                    }}>
                    {t === "quick" ? "Trainingstyp" : "Manuell"}
                  </button>
                ))}
              </div>

              {trainingTab === "quick" ? (
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
              <button className="btn btn-primary" onClick={handleAddTraining} style={{ width: "100%" }}>
                Training speichern
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
