import { useState, useRef } from "react";
import { useApp } from "../context";

const CALORIENINJAS_KEY = "hPPWHMbmSJCKQmUwKqBqQA==5Hy8IQWNmKjGQfxP";

interface NutritionResult {
  name: string;
  calories: number;
  protein_g: number;
  serving_size_g: number;
}

export default function PhotoAnalyzeModal({ onClose }: { onClose: () => void }) {
  const { addFood } = useApp();
  const [image, setImage] = useState<string | null>(null);
  const [step, setStep] = useState<"photo" | "describe" | "result">("photo");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<NutritionResult[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const fileRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setImage(ev.target?.result as string);
      setStep("describe");
      setError(null);
    };
    reader.readAsDataURL(file);
  }

  async function analyzeDescription() {
    if (!description.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `https://api.calorieninjas.com/v1/nutrition?query=${encodeURIComponent(description)}`,
        { headers: { "X-Api-Key": CALORIENINJAS_KEY } }
      );
      if (!res.ok) throw new Error("API-Fehler");
      const data = await res.json();
      const items: NutritionResult[] = (data.items || []).map((item: Record<string, number | string>) => ({
        name: String(item.name || "Unbekannt"),
        calories: Math.round(Number(item.calories) || 0),
        protein_g: Math.round(Number(item.protein_g) * 10) / 10,
        serving_size_g: Math.round(Number(item.serving_size_g) || 100),
      }));
      if (items.length === 0) throw new Error("Keine Nährwerte gefunden. Versuche eine genauere Beschreibung.");
      setResults(items);
      setSelectedItems(new Set(items.map((_: NutritionResult, i: number) => i)));
      setStep("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analyse fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  }

  function toggleItem(i: number) {
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  function handleAddSelected() {
    const sel = results.filter((_, i) => selectedItems.has(i));
    if (sel.length === 0) return;
    if (sel.length === 1) {
      addFood({ description: sel[0].name, kcal: sel[0].calories, protein_g: sel[0].protein_g });
    } else {
      const totalKcal = sel.reduce((s, r) => s + r.calories, 0);
      const totalProt = Math.round(sel.reduce((s, r) => s + r.protein_g, 0) * 10) / 10;
      addFood({ description: sel.map(r => r.name).join(", "), kcal: totalKcal, protein_g: totalProt });
    }
    onClose();
  }

  const totalKcal = results.filter((_, i) => selectedItems.has(i)).reduce((s, r) => s + r.calories, 0);
  const totalProt = Math.round(results.filter((_, i) => selectedItems.has(i)).reduce((s, r) => s + r.protein_g, 0) * 10) / 10;
  const HINTS = ["200g Hähnchenbrust", "150g Reis", "2 Eier", "100g Lachs", "1 Banane", "250ml Milch"];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-header">
          <span className="modal-title">
            {step === "photo" ? "📷 Foto aufnehmen" : step === "describe" ? "✍️ Mahlzeit beschreiben" : "✅ Nährwerte"}
          </span>
          <button onClick={step === "photo" ? onClose : () => { setStep("photo"); setImage(null); setResults([]); setDescription(""); }}
            style={{ color: "var(--muted)", fontSize: 22 }}>
            {step === "photo" ? "×" : "←"}
          </button>
        </div>
        <div className="modal-body">
          {step === "photo" && (
            <>
              <input ref={fileRef} type="file" accept="image/*" capture="environment"
                style={{ display: "none" }} onChange={handleFile} />
              <input ref={galleryRef} type="file" accept="image/*"
                style={{ display: "none" }} onChange={handleFile} />
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button className="btn btn-primary" onClick={() => fileRef.current?.click()} style={{ width: "100%", padding: "16px", fontSize: 16 }}>
                  📷 Foto aufnehmen
                </button>
                <button className="btn btn-secondary" onClick={() => galleryRef.current?.click()} style={{ width: "100%" }}>
                  🖼️ Aus Galerie wählen
                </button>
              </div>
              <div style={{ background: "var(--surface2)", borderRadius: "var(--radius)", padding: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>So funktioniert es:</div>
                <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.7 }}>
                  1. Foto von deiner Mahlzeit aufnehmen<br />
                  2. Kurz beschreiben was drauf ist<br />
                  3. KI berechnet Kalorien &amp; Protein
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <button onClick={() => setStep("describe")}
                  style={{ fontSize: 13, color: "var(--primary)", textDecoration: "underline", background: "none" }}>
                  Ohne Foto direkt beschreiben →
                </button>
              </div>
            </>
          )}
          {step === "describe" && (
            <>
              {image && (
                <img src={image} alt="Mahlzeit"
                  style={{ width: "100%", borderRadius: "var(--radius)", maxHeight: 200, objectFit: "cover" }} />
              )}
              <div>
                <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 6, fontWeight: 600 }}>
                  Was ist auf dem Teller? Mit Mengenangaben:
                </div>
                <textarea value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="z.B. 200g Hähnchenbrust gegrillt, 150g Basmatireis, 100g Brokkoli"
                  rows={3}
                  style={{
                    width: "100%", padding: "10px 12px", borderRadius: "var(--radius)",
                    border: "1.5px solid var(--border)", background: "var(--surface2)",
                    fontSize: 14, color: "var(--fg)", resize: "none", fontFamily: "inherit",
                  }} />
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {HINTS.map(hint => (
                  <button key={hint} onClick={() => setDescription(prev => prev ? prev + ", " + hint : hint)}
                    style={{
                      padding: "6px 12px", borderRadius: 20, fontSize: 12, fontWeight: 500,
                      background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--fg2)",
                    }}>
                    + {hint}
                  </button>
                ))}
              </div>
              {error && <div style={{ color: "var(--danger)", fontSize: 13, textAlign: "center" }}>{error}</div>}
              <button className="btn btn-primary" onClick={analyzeDescription}
                disabled={loading || !description.trim()}
                style={{ width: "100%", opacity: loading || !description.trim() ? 0.6 : 1 }}>
                {loading ? "⏳ Analysiere…" : "🔍 Nährwerte berechnen"}
              </button>
            </>
          )}
          {step === "result" && (
            <>
              <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4 }}>
                Wähle aus, was du hinzufügen möchtest:
              </div>
              {results.map((r, i) => (
                <button key={i} onClick={() => toggleItem(i)}
                  style={{
                    width: "100%", textAlign: "left", padding: "12px 14px", borderRadius: "var(--radius)",
                    background: selectedItems.has(i) ? "var(--primary-light)" : "var(--surface2)",
                    border: selectedItems.has(i) ? "1.5px solid var(--primary)" : "1.5px solid transparent",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, textTransform: "capitalize" }}>{r.name}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>{r.serving_size_g}g</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 8 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--primary)" }}>{r.calories} kcal</div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>{r.protein_g}g Protein</div>
                  </div>
                  <div style={{ marginLeft: 10, fontSize: 18 }}>{selectedItems.has(i) ? "✅" : "⬜"}</div>
                </button>
              ))}
              {selectedItems.size > 0 && (
                <div style={{ background: "var(--primary-light)", borderRadius: "var(--radius)", padding: "12px 16px", textAlign: "center" }}>
                  <span style={{ fontSize: 20, fontWeight: 800, color: "var(--primary)" }}>{totalKcal} kcal</span>
                  <span style={{ fontSize: 14, color: "var(--muted)", marginLeft: 12 }}>{totalProt}g Protein</span>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>Gesamt ({selectedItems.size} Einträge)</div>
                </div>
              )}
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-secondary" style={{ flex: 1 }}
                  onClick={() => { setStep("describe"); setResults([]); }}>
                  Neu beschreiben
                </button>
                <button className="btn btn-primary" style={{ flex: 2 }}
                  onClick={handleAddSelected} disabled={selectedItems.size === 0}>
                  Zum Tag hinzufügen
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
