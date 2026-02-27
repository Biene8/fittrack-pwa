import { useState, useRef, useEffect } from "react";
import { useApp } from "../context";

interface ProductInfo {
  name: string;
  kcal_per_100g: number;
  protein_per_100g: number;
  brand?: string;
}

export default function BarcodeModal({ onClose }: { onClose: () => void }) {
  const { addFood } = useApp();
  const [barcode, setBarcode] = useState("");
  const [product, setProduct] = useState<ProductInfo | null>(null);
  const [grams, setGrams] = useState("100");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setScanning(true);
      // Poll for barcode using BarcodeDetector if available
      if ("BarcodeDetector" in window) {
        // @ts-ignore
        const detector = new BarcodeDetector({ formats: ["ean_13", "ean_8", "upc_a", "upc_e"] });
        intervalRef.current = window.setInterval(async () => {
          if (!videoRef.current) return;
          try {
            // @ts-ignore
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes.length > 0) {
              const code = barcodes[0].rawValue;
              stopCamera();
              setBarcode(code);
              lookupBarcode(code);
            }
          } catch { /* ignore */ }
        }, 500);
      }
    } catch {
      setError("Kamera-Zugriff verweigert. Bitte Barcode manuell eingeben.");
    }
  }

  function stopCamera() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setScanning(false);
  }

  async function lookupBarcode(code: string) {
    setLoading(true);
    setError(null);
    setProduct(null);
    try {
      const res = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${code}.json`
      );
      const data = await res.json();
      if (data.status !== 1) throw new Error("Produkt nicht gefunden");
      const p = data.product;
      const nutriments = p.nutriments || {};
      const kcal = Math.round(nutriments["energy-kcal_100g"] || nutriments["energy_100g"] / 4.184 || 0);
      const prot = Math.round((nutriments["proteins_100g"] || 0) * 10) / 10;
      setProduct({
        name: p.product_name || p.product_name_de || "Unbekanntes Produkt",
        kcal_per_100g: kcal,
        protein_per_100g: prot,
        brand: p.brands,
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Produkt nicht gefunden");
    } finally {
      setLoading(false);
    }
  }

  function handleSearch() {
    if (barcode.trim()) lookupBarcode(barcode.trim());
  }

  function handleAdd() {
    if (!product) return;
    const g = parseFloat(grams) || 100;
    const kcal = Math.round(product.kcal_per_100g * g / 100);
    const protein_g = Math.round(product.protein_per_100g * g / 100 * 10) / 10;
    addFood({
      description: `${product.name}${product.brand ? ` (${product.brand})` : ""} – ${g}g`,
      kcal,
      protein_g,
    });
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-header">
          <span className="modal-title">Barcode Scanner</span>
          <button onClick={onClose} style={{ color: "var(--muted)", fontSize: 22 }}>×</button>
        </div>
        <div className="modal-body">
          {/* Camera scanner */}
          {scanning ? (
            <div style={{ position: "relative" }}>
              <video ref={videoRef} style={{ width: "100%", borderRadius: "var(--radius)", maxHeight: 220, objectFit: "cover", background: "#000" }} playsInline muted />
              <div style={{
                position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                width: "70%", height: 60, border: "2px solid var(--primary)", borderRadius: 4,
                boxShadow: "0 0 0 1000px rgba(0,0,0,0.4)",
              }} />
              <button className="btn btn-secondary" onClick={stopCamera} style={{ width: "100%", marginTop: 8 }}>
                Kamera stoppen
              </button>
              {"BarcodeDetector" in window ? (
                <div style={{ textAlign: "center", fontSize: 12, color: "var(--muted)" }}>
                  Barcode in den Rahmen halten…
                </div>
              ) : (
                <div style={{ textAlign: "center", fontSize: 12, color: "var(--warning)" }}>
                  Automatische Erkennung nicht verfügbar. Barcode manuell eingeben.
                </div>
              )}
            </div>
          ) : (
            <button className="btn btn-primary" onClick={startCamera} style={{ width: "100%" }}>
              📷 Kamera öffnen
            </button>
          )}

          {/* Manual input */}
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={barcode}
              onChange={e => setBarcode(e.target.value)}
              placeholder="Barcode manuell eingeben (EAN)"
              type="number"
              style={{ flex: 1 }}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
            />
            <button className="btn btn-secondary" onClick={handleSearch} style={{ whiteSpace: "nowrap", padding: "10px 14px" }}>
              Suchen
            </button>
          </div>

          {loading && (
            <div style={{ textAlign: "center", padding: 16, color: "var(--muted)" }}>
              Produkt wird gesucht…
            </div>
          )}

          {error && (
            <div style={{ color: "var(--danger)", fontSize: 13, textAlign: "center", padding: 8 }}>
              {error}
            </div>
          )}

          {product && (
            <div style={{ background: "var(--primary-light)", borderRadius: "var(--radius)", padding: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--primary)" }}>{product.name}</div>
              {product.brand && <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 8 }}>{product.brand}</div>}
              <div style={{ fontSize: 13, color: "var(--fg2)", marginBottom: 12 }}>
                Pro 100g: {product.kcal_per_100g} kcal · {product.protein_per_100g}g Protein
              </div>
              <label>
                <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4 }}>Menge (g)</div>
                <input type="number" value={grams} onChange={e => setGrams(e.target.value)} />
              </label>
              {grams && (
                <div style={{ marginTop: 8, fontSize: 14, fontWeight: 600, color: "var(--primary)", textAlign: "center" }}>
                  {Math.round(product.kcal_per_100g * +grams / 100)} kcal · {Math.round(product.protein_per_100g * +grams / 100 * 10) / 10}g Protein
                </div>
              )}
              <button className="btn btn-primary" onClick={handleAdd} style={{ width: "100%", marginTop: 12 }}>
                Zum Tag hinzufügen
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
