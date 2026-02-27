import { useApp } from "../context";
import { getDayTotals, todayKey } from "../store";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine, CartesianGrid,
} from "recharts";

export default function Analytics() {
  const { state } = useApp();
  const today = todayKey();
  const { settings } = state;

  const days = Object.values(state.days)
    .filter(d => d.date <= today)
    .sort((a, b) => a.date.localeCompare(b.date));

  // Weight data
  const weightData = days
    .filter(d => d.weight_kg)
    .map(d => ({
      date: new Date(d.date + "T12:00:00").toLocaleDateString("de-DE", { day: "numeric", month: "short" }),
      weight: d.weight_kg!,
    }));

  // Last 30 days calorie data
  const last30 = days.slice(-30).map(d => {
    const t = getDayTotals(d);
    return {
      date: new Date(d.date + "T12:00:00").toLocaleDateString("de-DE", { day: "numeric", month: "short" }),
      kcal: t.kcal,
      protein: t.protein_g,
      balance: t.kcal - (settings.bmr + t.burned),
    };
  });

  // Summary stats
  const allTotals = days.filter(d => d.dayEnded).map(d => getDayTotals(d));
  const avgKcal = allTotals.length ? Math.round(allTotals.reduce((s, t) => s + t.kcal, 0) / allTotals.length) : 0;
  const avgProtein = allTotals.length ? Math.round(allTotals.reduce((s, t) => s + t.protein_g, 0) / allTotals.length) : 0;
  const totalDeficit = allTotals.reduce((s, t) => s + (t.kcal - settings.bmr), 0);
  const trainingDays = days.filter(d => d.training.length > 0).length;

  const minWeight = weightData.length ? Math.min(...weightData.map(w => w.weight)) : 0;
  const maxWeight = weightData.length ? Math.max(...weightData.map(w => w.weight)) : 0;
  const weightLoss = weightData.length >= 2 ? (weightData[0].weight - weightData[weightData.length - 1].weight) : 0;

  return (
    <div className="screen">
      <div className="screen-header">
        <h1>Analyse</h1>
        <p>{days.length} Tage · {trainingDays} Trainings</p>
      </div>
      <div className="screen-content">

        {/* Summary stats */}
        <div className="stat-grid">
          <div className="stat-box" style={{ background: "var(--primary-light)" }}>
            <div className="stat-value" style={{ color: "var(--primary)" }}>{avgKcal}</div>
            <div className="stat-label">Ø kcal/Tag</div>
          </div>
          <div className="stat-box" style={{ background: "var(--blue-light)" }}>
            <div className="stat-value" style={{ color: "var(--blue)" }}>{avgProtein}g</div>
            <div className="stat-label">Ø Protein/Tag</div>
          </div>
          <div className="stat-box" style={{ background: totalDeficit <= 0 ? "var(--primary-light)" : "var(--danger-light)" }}>
            <div className="stat-value" style={{ color: totalDeficit <= 0 ? "var(--primary)" : "var(--danger)", fontSize: 18 }}>
              {totalDeficit > 0 ? "+" : ""}{Math.round(totalDeficit / 1000 * 10) / 10}k
            </div>
            <div className="stat-label">Gesamt-Bilanz</div>
          </div>
          <div className="stat-box" style={{ background: "var(--warning-light)" }}>
            <div className="stat-value" style={{ color: "var(--warning)" }}>{trainingDays}</div>
            <div className="stat-label">Training-Tage</div>
          </div>
        </div>

        {/* Weight chart */}
        {weightData.length >= 2 && (
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div className="section-title" style={{ padding: 0 }}>Gewichtsverlauf</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: weightLoss >= 0 ? "var(--primary)" : "var(--danger)" }}>
                {weightLoss >= 0 ? "-" : "+"}{Math.abs(weightLoss).toFixed(1)} kg
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: "var(--muted)" }}>Start: {weightData[0].weight} kg</span>
              <span style={{ fontSize: 12, color: "var(--muted)" }}>Aktuell: {weightData[weightData.length - 1].weight} kg</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--muted)" }} interval="preserveStartEnd" />
                <YAxis domain={[minWeight - 1, maxWeight + 1]} tick={{ fontSize: 10, fill: "var(--muted)" }} width={35} />
                <Tooltip
                  contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => [`${v} kg`, "Gewicht"]}
                />
                <Line type="monotone" dataKey="weight" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 4, fill: "var(--primary)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Calorie chart */}
        {last30.length > 0 && (
          <div className="card">
            <div className="section-title" style={{ marginBottom: 12 }}>Kalorien (letzte {last30.length} Tage)</div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={last30}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: "var(--muted)" }} interval={Math.floor(last30.length / 6)} />
                <YAxis tick={{ fontSize: 10, fill: "var(--muted)" }} width={35} />
                <Tooltip
                  contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => [`${v} kcal`, "Kalorien"]}
                />
                <ReferenceLine y={settings.kcal_goal} stroke="var(--primary)" strokeDasharray="4 4" />
                <Bar dataKey="kcal" fill="var(--orange)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, fontSize: 11, color: "var(--muted)" }}>
              <div style={{ width: 20, height: 2, background: "var(--primary)", borderTop: "2px dashed var(--primary)" }} />
              Ziel: {settings.kcal_goal} kcal
            </div>
          </div>
        )}

        {/* Balance chart */}
        {last30.length > 0 && (
          <div className="card">
            <div className="section-title" style={{ marginBottom: 12 }}>Kalorienbilanz</div>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={last30}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: "var(--muted)" }} interval={Math.floor(last30.length / 6)} />
                <YAxis tick={{ fontSize: 10, fill: "var(--muted)" }} width={35} />
                <Tooltip
                  contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => [`${v > 0 ? "+" : ""}${v} kcal`, "Bilanz"]}
                />
                <ReferenceLine y={0} stroke="var(--border)" strokeWidth={1.5} />
                <Bar dataKey="balance" radius={[3, 3, 0, 0]}
                  fill="var(--primary)"
                  label={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Protein chart */}
        {last30.length > 0 && (
          <div className="card">
            <div className="section-title" style={{ marginBottom: 12 }}>Protein (letzte {last30.length} Tage)</div>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={last30}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: "var(--muted)" }} interval={Math.floor(last30.length / 6)} />
                <YAxis tick={{ fontSize: 10, fill: "var(--muted)" }} width={35} />
                <Tooltip
                  contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => [`${v}g`, "Protein"]}
                />
                <ReferenceLine y={settings.protein_goal_g} stroke="var(--blue)" strokeDasharray="4 4" />
                <Bar dataKey="protein" fill="var(--blue)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
