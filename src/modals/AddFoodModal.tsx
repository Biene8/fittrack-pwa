import { useState, useRef } from "react";
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

interface FoodProduct {
  id: string;
  name: string;
  brand: string;
  kcal_per_100g: number;
  protein_per_100g: number;
}

type Tab = "quick" | "search" | "manual";

export default function AddFoodModal({ onClose }: { onClose: () => void }) {
  const { addFood } = useApp();
  const [tab, setTab] = useState<Tab>("quick");

  // Manual form
  const [desc, setDesc] = useState("");
  const [kcal, setKcal] = useState("");
  const [protein, setProtein] = useState("");

  // Search
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FoodProduct[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selected, setSelected] = useState<FoodProduct | null>(null);
  const [grams, setGrams] = useState("100");
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleAdd() {
    if (!desc || !kcal || !protein) return;
    addFood({ description: desc, kcal: +kcal, protein_g: +protein });
    onClose();
  }

  function handleQuick(f: typeof QUICK_FOODS[0]) {
    addFood(f);
    onClose();
  }

  async function searchFood(q: string) {
    if (q.trim().length < 2) { setSearchResults([]); return; }
    setSearching(true);
    setSearchError(null);
    try {
      const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&fields=product_name,brands,nutriments,code&page_size=10`;
      const res = await fetch(url);
      const data = await res.json();
      const products: FoodProduct[] = (data.products || [])
        .filter((p: Record<string, unknown>) => {
          const n = (p.nutriments || {}) as Record<string, unknown>;
          return p.product_name && n["energy-kcal_100g"];
        })
        .slice(0, 8)
        .map((p: Record<string, unknown>) => {
          const n = (p.nutriments || {}) as Record<string, number>;
          return {
            id: String(p.code || Math.random()),
            name: String(p.product_name || ""),
            brand: String(p.brands || ""),
            kcal_per_100g: Math.round(n["energy-kcal_100g"] || 0),
            protein_per_100g: Math.round((n["proteins_100g"] || 0) * 10) / 10,
          };
        });
      setSearchResults(products);
      if (products.length === 0) setSearchError("Keine Ergebnisse. Versuche einen anderen Begriff.");
    } catch {
      setSearchError("Suche fehlgeschlagen. Bitte prüfe deine Internetverbindung.");
    } finally {
      setSearching(false);
    }
  }

  function handleQueryChange(q: string) {
    setQuery(q);
    setSelected(null);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => searchFood(q), 600);
  }

  function handleSelectProduct(p: FoodProduct) {
    setSelected(p);
    setGrams("100");
  }

  function handleAddFromSearch() {
    if (!selected) return;
    const g = parseFloat(grams) || 100;
    const kcalVal = Math.round(selected.kcal_per_100g * g / 100);
    const protVal = Math.round(selected.protein_per_100g * g / 100 * 10) / 10;
    addFood({
      description: `${selected.name}${selected.brand ? ` (${selected.brand})` : ""} – ${g}g`,
      kcal: kcalVal,
      protein_g: protVal,
    });
    onClose();
  }

  const previewKcal = selected ? Math.round(selected.kcal_per_100g * (parseFloat(grams) || 100) / 100) : 0;
  const previewProt = selected ? Math.round(selected.protein_per_100g * (parseFloat(grams) || 100) / 100 * 10) / 10 : 0;

  const TABS: { key: Tab; label: string }[] = [
    { key: "quick", label: "Schnell" },
    { key: "search", label: "🔍 Suche" },
    { key: "manual", label: "Manuell" },
  ];

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
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{
                flex: 1, padding: "10px 0", fontSize: 13, fontWeight: 600,
                color: tab === t.key ? "var(--primary)" : "var(--muted)",
                borderBottom: tab === t.key ? "2px solid var(--primary)" : "2px solid transparent",
              }}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="modal-body">
          {/* Quick Tab */}
          {tab === "quick" && QUICK_FOODS.map(f => (
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
          ))}

          {/* Search Tab */}
          {tab === "search" && (
            <>
              <div style={{ position: "relative" }}>
                <input
                  value={query}
                  onChange={e => handleQueryChange(e.target.value)}
                  placeholder="z.B. Nudeln Bolognese, Hähnchenbrust…"
                  style={{ width: "100%", paddingRight: 36 }}
                />
                {searching && (
                  <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 14 }}>
                    ⏳
                  </span>
                )}
              </div>

              {searchError && !searching && (
                <div style={{ color: "var(--danger)", fontSize: 13, textAlign: "center" }}>{searchError}</div>
              )}

              {!selected && searchResults.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {searchResults.map(p => (
                    <button key={p.id}
                      onClick={() => handleSelectProduct(p)}
                      style={{
                        width: "100%", textAlign: "left", padding: "11px 14px",
                        background: "var(--surface2)", borderRadius: "var(--radius)",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                      }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {p.name}
                        </div>
                        {p.brand && <div style={{ fontSize: 11, color: "var(--muted)" }}>{p.brand}</div>}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--muted)", marginLeft: 8, textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontWeight: 700 }}>{p.kcal_per_100g} kcal</div>
                        <div>{p.protein_per_100g}g P</div>
                        <div style={{ fontSize: 10 }}>/ 100g</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {selected && (
                <div style={{ background: "var(--primary-light)", borderRadius: "var(--radius)", padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "var(--primary)" }}>{selected.name}</div>
                      {selected.brand && <div style={{ fontSize: 12, color: "var(--muted)" }}>{selected.brand}</div>}
                      <div style={{ fontSize: 12, color: "var(--fg2)", marginTop: 4 }}>
                        Pro 100g: {selected.kcal_per_100g} kcal · {selected.protein_per_100g}g Protein
                      </div>
                    </div>
                    <button onClick={() => setSelected(null)} style={{ color: "var(--muted)", fontSize: 20, padding: "0 4px", flexShrink: 0 }}>←</button>
                  </div>

                  <label>
                    <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4 }}>Menge (g)</div>
                    <input
                      type="number"
                      value={grams}
                      onChange={e => setGrams(e.target.value)}
                      placeholder="100"
                    />
                  </label>

                  {grams && (
                    <div style={{ marginTop: 10, padding: "10px 14px", background: "rgba(255,255,255,0.6)", borderRadius: "var(--radius)", textAlign: "center" }}>
                      <span style={{ fontSize: 20, fontWeight: 800, color: "var(--primary)" }}>{previewKcal} kcal</span>
                      <span style={{ fontSize: 14, color: "var(--muted)", marginLeft: 12 }}>{previewProt}g Protein</span>
                    </div>
                  )}

                  <button className="btn btn-primary" onClick={handleAddFromSearch} style={{ width: "100%", marginTop: 12 }}>
                    Zum Tag hinzufügen
                  </button>
                </div>
              )}

              {query.length === 0 && (
                <div style={{ textAlign: "center", color: "var(--muted)", fontSize: 13, padding: "20px 0" }}>
                  Tippe einen Lebensmittelnamen ein<br />
                  <span style={{ fontSize: 11, opacity: 0.7 }}>Datenbank: Open Food Facts (Millionen Produkte)</span>
                </div>
              )}
            </>
          )}

          {/* Manual Tab */}
          {tab === "manual" && (
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
