import { useState } from "react";
import { useApp } from "../context";

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

export default function AddFoodModal({ onClose }: { onClose: () => void }) {
  const { addFood } = useApp();
  const [desc, setDesc] = useState("");
  const [kcal, setKcal] = useState("");
  const [protein, setProtein] = useState("");
  const [tab, setTab] = useState<"quick" | "manual">("quick");

  function handleAdd() {
    if (!desc || !kcal || !protein) return;
    addFood({ description: desc, kcal: +kcal, protein_g: +protein });
    onClose();
  }

  function handleQuick(f: typeof QUICK_FOODS[0]) {
    addFood(f);
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-header">
          <span className="modal-title">Essen hinzufügen</span>
          <button onClick={onClose} style={{ color: "var(--muted)", fontSize: 22 }}>×</button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "0.5px solid var(--border)", padding: "0 16px" }}>
          {(["quick", "manual"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{
                flex: 1, padding: "10px 0", fontSize: 14, fontWeight: 600,
                color: tab === t ? "var(--primary)" : "var(--muted)",
                borderBottom: tab === t ? "2px solid var(--primary)" : "2px solid transparent",
              }}>
              {t === "quick" ? "Schnellauswahl" : "Manuell"}
            </button>
          ))}
        </div>

        <div className="modal-body">
          {tab === "quick" ? (
            QUICK_FOODS.map(f => (
              <button key={f.description}
                style={{
                  width: "100%", textAlign: "left", padding: "12px 14px",
                  background: "var(--surface2)", borderRadius: "var(--radius)",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}
                onClick={() => handleQuick(f)}>
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
              <button className="btn btn-primary" onClick={handleAdd} style={{ width: "100%" }}>
                Hinzufügen
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
