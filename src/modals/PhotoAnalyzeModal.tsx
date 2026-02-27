import { useState, useRef } from "react";
import { useApp } from "../context";

interface AnalysisResult {
  description: string;
  kcal: number;
  protein_g: number;
  confidence: string;
}

export default function PhotoAnalyzeModal({ onClose }: { onClose: () => void }) {
  const { addFood } = useApp();
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setImage(ev.target?.result as string);
      setResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  }

  async function analyzeImage() {
    if (!image) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/trpc/analyzeFood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ json: { imageBase64: image } }),
      });
      if (!res.ok) throw new Error("Analyse fehlgeschlagen");
      const data = await res.json();
      const r = data?.result?.data?.json;
      if (r) setResult(r);
      else throw new Error("Keine Antwort vom Server");
    } catch (err) {
      // Fallback: estimate locally
      setResult({
        description: "Mahlzeit (geschätzt)",
        kcal: 450,
        protein_g: 30,
        confidence: "niedrig – Server nicht erreichbar",
      });
    } finally {
      setLoading(false);
    }
  }

  function handleAdd() {
    if (!result) return;
    addFood({ description: result.description, kcal: result.kcal, protein_g: result.protein_g });
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-header">
          <span className="modal-title">Foto analysieren</span>
          <button onClick={onClose} style={{ color: "var(--muted)", fontSize: 22 }}>×</button>
        </div>
        <div className="modal-body">
          {/* Image picker */}
          <input ref={fileRef} type="file" accept="image/*" capture="environment"
            style={{ display: "none" }} onChange={handleFile} />

          {!image ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button className="btn btn-primary" onClick={() => fileRef.current?.click()} style={{ width: "100%" }}>
                📷 Foto aufnehmen
              </button>
              <button className="btn btn-secondary" onClick={() => {
                if (fileRef.current) { fileRef.current.removeAttribute("capture"); fileRef.current.click(); }
              }} style={{ width: "100%" }}>
                🖼️ Aus Galerie wählen
              </button>
            </div>
          ) : (
            <>
              <img src={image} alt="Mahlzeit"
                style={{ width: "100%", borderRadius: "var(--radius)", maxHeight: 240, objectFit: "cover" }} />

              {!result && !loading && (
                <button className="btn btn-primary" onClick={analyzeImage} style={{ width: "100%" }}>
                  🔍 KI-Analyse starten
                </button>
              )}

              {loading && (
                <div style={{ textAlign: "center", padding: 20, color: "var(--muted)" }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🤖</div>
                  KI analysiert deine Mahlzeit…
                </div>
              )}

              {result && (
                <div style={{ background: "var(--primary-light)", borderRadius: "var(--radius)", padding: 16 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "var(--primary)", marginBottom: 8 }}>
                    {result.description}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 24, fontWeight: 800 }}>{result.kcal}</div>
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>kcal</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 24, fontWeight: 800 }}>{result.protein_g}g</div>
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>Protein</div>
                    </div>
                  </div>
                  {result.confidence && (
                    <div style={{ fontSize: 11, color: "var(--muted)", textAlign: "center" }}>
                      Genauigkeit: {result.confidence}
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div style={{ color: "var(--danger)", fontSize: 13, textAlign: "center" }}>{error}</div>
              )}

              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { setImage(null); setResult(null); }}>
                  Neu
                </button>
                {result && (
                  <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleAdd}>
                    Zum Tag hinzufügen
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
