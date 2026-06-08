import { useState } from "react";
import { cards, spendingBuckets } from "./cards";

const ownerColors = {
  patrick: "bg-blue-100 text-blue-800",
  "michael anne": "bg-pink-100 text-pink-800",
};

const categoryIcons = {
  credit: "💳",
  travel: "✈️",
  hotel: "🏨",
  dining: "🍽️",
  protection: "🛡️",
  status: "⭐",
};

function OwnerBadge({ owner }) {
  const label = owner === "patrick" ? "Patrick" : "Michael Anne";
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ownerColors[owner]}`}>
      {label}
    </span>
  );
}

// ─── Cards view ───────────────────────────────────────────────────────────────

function CardView({ card }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-gray-200 shadow-sm overflow-hidden bg-white">
      <button
        className="w-full text-left p-5 flex items-start gap-4"
        onClick={() => setOpen(!open)}
      >
        <div className="w-2 self-stretch rounded-full flex-shrink-0" style={{ backgroundColor: card.color }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-gray-900 text-base">{card.name}</span>
            <OwnerBadge owner={card.owner} />
            {card.annualFee > 0 ? (
              <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">${card.annualFee}/yr</span>
            ) : (
              <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">No annual fee</span>
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {card.categories.slice(0, 3).map((c) => (
              <span key={c.label} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                <strong>{c.multiplier}</strong> {c.label.toLowerCase()}
              </span>
            ))}
          </div>
        </div>
        <span className="text-gray-400 mt-1 flex-shrink-0">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="border-t border-gray-100 px-5 pb-5 space-y-5">
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-4 mb-2">Earning Rates</h3>
            <div className="space-y-1">
              {card.categories.map((c) => (
                <div key={c.label} className="flex justify-between text-sm">
                  <span className="text-gray-700">{c.label}</span>
                  <span className="font-semibold" style={{ color: card.color }}>{c.multiplier} {c.points ? "pts" : "cash"}</span>
                </div>
              ))}
            </div>
          </div>
          {card.benefits.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Benefits</h3>
              <div className="space-y-2">
                {card.benefits.map((b) => (
                  <div key={b.label} className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5">{categoryIcons[b.category] || "•"}</span>
                      <div>
                        <div className="font-medium text-sm text-gray-900">{b.label}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{b.description}</div>
                        {b.expiry && <div className="text-xs text-amber-600 mt-1 font-medium">⏰ {b.expiry}</div>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {card.annualFee > 0 && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-sm">
              <span className="font-medium text-amber-800">Annual Fee:</span>{" "}
              <span className="text-amber-700">${card.annualFee} — {card.annualFeeDate}</span>
            </div>
          )}
          {card.redemptionTip && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm text-blue-800">
              <span className="font-medium">💡 Redemption:</span> {card.redemptionTip}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Summary view ─────────────────────────────────────────────────────────────

function RateBar({ rate, maxRate, color }) {
  const pct = Math.round((rate / maxRate) * 100);
  return (
    <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  );
}

function BucketCard({ bucket }) {
  const [open, setOpen] = useState(false);

  // Collect all card/category combos that match this tag, deduplicated by card+rate
  const entries = [];
  for (const card of cards) {
    let best = null;
    for (const cat of card.categories) {
      if (cat.tags.includes(bucket.tag)) {
        if (!best || cat.rate > best.rate) best = cat;
      }
    }
    if (best) entries.push({ card, cat: best });
  }
  entries.sort((a, b) => b.cat.rate - a.cat.rate);

  if (entries.length === 0) return null;

  const top = entries[0];
  const maxRate = entries[0].cat.rate;

  return (
    <div className="rounded-2xl border border-gray-200 shadow-sm bg-white overflow-hidden">
      <button className="w-full text-left p-4 flex items-center gap-3" onClick={() => setOpen(!open)}>
        <span className="text-2xl">{bucket.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-gray-900">{bucket.label}</span>
            <span className="text-xs text-gray-400 flex-shrink-0">{open ? "▲" : "▼"}</span>
          </div>
          {/* Best card at a glance */}
          <div className="flex items-center gap-2 mt-1">
            <span
              className="text-sm font-bold"
              style={{ color: top.card.color }}
            >
              {top.cat.multiplier} {top.cat.points ? "pts" : "cash"}
            </span>
            <span className="text-xs text-gray-500">· {top.card.shortName}</span>
            <OwnerBadge owner={top.card.owner} />
          </div>
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-2">
          {entries.map(({ card, cat }) => (
            <div key={card.id} className="flex items-center gap-3">
              <div className="w-20 flex-shrink-0">
                <span className="font-bold text-sm" style={{ color: card.color }}>
                  {cat.multiplier}
                </span>
                <span className="text-xs text-gray-400 ml-1">{cat.points ? "pts" : "%"}</span>
              </div>
              <RateBar rate={cat.rate} maxRate={maxRate} color={card.color} />
              <div className="w-32 flex-shrink-0 flex items-center gap-1.5 justify-end">
                <span className="text-xs text-gray-700 font-medium">{card.shortName}</span>
                <OwnerBadge owner={card.owner} />
              </div>
            </div>
          ))}
          {top.cat.tags.includes("other") && (
            <p className="text-xs text-gray-400 mt-1 italic">Rates shown are for this category; may vary by card program.</p>
          )}
        </div>
      )}
    </div>
  );
}

function SummaryView() {
  return (
    <div className="space-y-3">
      {spendingBuckets.map((bucket) => (
        <BucketCard key={bucket.tag} bucket={bucket} />
      ))}
    </div>
  );
}

// ─── App shell ────────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState("summary");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = cards.filter((c) => {
    if (ownerFilter !== "all" && c.owner !== ownerFilter) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">Card Benefits</h1>
          <p className="text-sm text-gray-500">Patrick & Michael Anne</p>

          {/* View toggle */}
          <div className="mt-3 flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
            <button
              onClick={() => setView("summary")}
              className={`text-sm px-4 py-1.5 rounded-lg font-medium transition-colors ${
                view === "summary" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Best Card For...
            </button>
            <button
              onClick={() => setView("cards")}
              className={`text-sm px-4 py-1.5 rounded-lg font-medium transition-colors ${
                view === "cards" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              All Cards
            </button>
          </div>

          {/* Cards view filters */}
          {view === "cards" && (
            <div className="mt-3 flex gap-2 flex-wrap">
              {["all", "patrick", "michael anne"].map((o) => (
                <button
                  key={o}
                  onClick={() => setOwnerFilter(o)}
                  className={`text-sm px-3 py-1 rounded-full border transition-colors ${
                    ownerFilter === o
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  {o === "all" ? "Everyone" : o === "patrick" ? "Patrick" : "Michael Anne"}
                </button>
              ))}
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-sm px-3 py-1 rounded-full border border-gray-200 outline-none focus:border-gray-400 ml-auto"
              />
            </div>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-3">
        {view === "summary" ? (
          <SummaryView />
        ) : (
          <>
            {filtered.length === 0 && <p className="text-gray-400 text-center py-12">No cards match.</p>}
            {filtered.map((card) => <CardView key={card.id} card={card} />)}
          </>
        )}
      </main>

      <footer className="max-w-2xl mx-auto px-4 py-8 text-center text-xs text-gray-400">
        Tap any row to expand · Benefits may change — verify with issuer
      </footer>
    </div>
  );
}
