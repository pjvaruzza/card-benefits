import { useState } from "react";
import { cards, spendingBuckets } from "./cards";

// ─── Shared helpers ───────────────────────────────────────────────────────────

function owner(card) {
  return card.owner === "patrick" ? "Patrick" : "Michael Anne";
}

function daysUntil(month) {
  const now = new Date();
  const target = new Date(now.getFullYear(), month - 1, 1);
  if (target < now) target.setFullYear(now.getFullYear() + 1);
  return Math.ceil((target - now) / 86400000);
}

function Chevron({ open }) {
  return (
    <svg
      className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`}
      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

// ─── Best Card For view ───────────────────────────────────────────────────────

function BucketRow({ bucket }) {
  const [open, setOpen] = useState(false);

  const entries = [];
  for (const card of cards) {
    let best = null;
    for (const cat of card.categories) {
      if (cat.tags.includes(bucket.tag) && (!best || cat.rate > best.rate)) best = cat;
    }
    if (best) entries.push({ card, cat: best });
  }
  entries.sort((a, b) => b.cat.rate - a.cat.rate);
  if (!entries.length) return null;

  const top = entries[0];
  const maxRate = top.cat.rate;

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        className="w-full flex items-center gap-4 py-3.5 px-5 text-left hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span className="text-lg w-6 text-center flex-shrink-0">{bucket.icon}</span>
        <span className="flex-1 text-sm font-medium text-gray-800">{bucket.label}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900">
            {top.cat.multiplier} <span className="font-normal text-gray-400">{top.cat.points ? "pts" : "cash"}</span>
          </span>
          <span className="text-xs text-gray-400 hidden sm:inline">· {top.card.shortName}</span>
          <span className="text-xs text-gray-400">· {owner(top.card)}</span>
        </div>
        <Chevron open={open} />
      </button>

      {open && (
        <div className="px-5 pb-4 pt-1 bg-gray-50 border-t border-gray-100">
          <div className="space-y-2.5">
            {entries.map(({ card, cat }, i) => (
              <div key={card.id} className="flex items-center gap-3">
                <span className={`text-xs w-4 text-right flex-shrink-0 font-medium ${i === 0 ? "text-gray-900" : "text-gray-400"}`}>
                  {i + 1}
                </span>
                <div className="flex-1 bg-gray-200 rounded-full h-1 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gray-700"
                    style={{ width: `${Math.round((cat.rate / maxRate) * 100)}%`, opacity: i === 0 ? 1 : 0.35 + (0.65 * (1 - i / entries.length)) }}
                  />
                </div>
                <span className={`text-sm w-12 text-right font-semibold flex-shrink-0 ${i === 0 ? "text-gray-900" : "text-gray-500"}`}>
                  {cat.multiplier}
                </span>
                <span className="text-xs text-gray-500 w-20 flex-shrink-0">{card.shortName}</span>
                <span className="text-xs text-gray-400 w-20 flex-shrink-0">{owner(card)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryView() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {spendingBuckets.map((b) => <BucketRow key={b.tag} bucket={b} />)}
    </div>
  );
}

// ─── All Cards view ───────────────────────────────────────────────────────────

function CardRow({ card }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        className="w-full flex items-start gap-4 py-4 px-5 text-left hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="w-1 self-stretch rounded-full flex-shrink-0 mt-0.5" style={{ backgroundColor: card.color }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-semibold text-gray-900 text-sm">{card.name}</span>
            <div className="text-right flex-shrink-0">
              {card.annualFee > 0 ? (
                <>
                  <span className="text-xs font-medium text-gray-700">${card.annualFee}/yr</span>
                  {card.annualFeeDate && card.annualFeeDate !== "Check statement" && (
                    <span className="text-xs text-gray-400 ml-1.5">due {card.annualFeeDate}</span>
                  )}
                </>
              ) : (
                <span className="text-xs text-gray-400">No fee</span>
              )}
            </div>
          </div>
          <div className="text-xs text-gray-400 mt-0.5">{owner(card)} · {card.network}</div>
          {!open && (
            <div className="text-xs text-gray-500 mt-1.5">
              {card.categories.slice(0,2).map(c => `${c.multiplier} ${c.label.toLowerCase()}`).join("  ·  ")}
            </div>
          )}
        </div>
        <Chevron open={open} />
      </button>

      {open && (
        <div className="px-5 pb-5 bg-gray-50 border-t border-gray-100 space-y-5">
          {/* Earning rates */}
          <div className="pt-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Earning Rates</p>
            <div className="space-y-1.5">
              {card.categories.map((c) => (
                <div key={c.label} className="flex justify-between text-sm">
                  <span className="text-gray-600">{c.label}</span>
                  <span className="font-semibold text-gray-900">{c.multiplier} <span className="font-normal text-gray-400">{c.points ? "pts" : "cash"}</span></span>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          {card.benefits.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Benefits</p>
              <div className="space-y-2">
                {card.benefits.map((b) => (
                  <div key={b.label} className="text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-medium text-gray-800">{b.label}</span>
                      {b.expiry && <span className="text-xs text-amber-600 flex-shrink-0">{b.expiry}</span>}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{b.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Annual fee */}
          {card.annualFee > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Annual fee</span>
              <span className="text-gray-700">${card.annualFee} — {card.annualFeeDate}</span>
            </div>
          )}

          {/* Redemption tip */}
          {card.redemptionTip && (
            <div className="text-xs text-gray-500 border-t border-gray-200 pt-3">
              <span className="font-medium text-gray-700">Tip: </span>{card.redemptionTip}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CardsView({ ownerFilter, search }) {
  const filtered = cards.filter((c) => {
    if (ownerFilter !== "all" && c.owner !== ownerFilter) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {filtered.length === 0
        ? <p className="text-gray-400 text-center py-12 text-sm">No cards match.</p>
        : filtered.map((card) => <CardRow key={card.id} card={card} />)
      }
    </div>
  );
}

// ─── Playbook view ────────────────────────────────────────────────────────────

const stepStyle = {
  warning:  { dot: "bg-amber-400",  label: "text-amber-700"  },
  action:   { dot: "bg-green-500",  label: "text-green-700"  },
  deadline: { dot: "bg-red-500",    label: "text-red-700"    },
  tip:      { dot: "bg-blue-400",   label: "text-blue-700"   },
};

function PlaybookCardRow({ card }) {
  const [open, setOpen] = useState(false);
  const pb = card.playbook;
  const days = card.annualFeeMonth ? daysUntil(card.annualFeeMonth) : null;

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        className="w-full flex items-start gap-4 py-4 px-5 text-left hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ backgroundColor: card.color }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-semibold text-gray-900 text-sm">{card.name}</span>
            <span className="text-xs text-gray-400 flex-shrink-0">${card.annualFee}/yr</span>
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs text-gray-400">{owner(card)} · due {card.annualFeeDate}</span>
            {days !== null && (
              <span className={`text-xs font-medium ${days <= 30 ? "text-red-600" : days <= 60 ? "text-amber-600" : "text-gray-400"}`}>
                {days}d
              </span>
            )}
          </div>
          {pb && !open && <p className="text-xs text-gray-400 mt-1">{pb.title}</p>}
        </div>
        <Chevron open={open} />
      </button>

      {open && (
        <div className="px-5 pb-5 bg-gray-50 border-t border-gray-100">
          {pb ? (
            <div className="pt-4 space-y-4">
              <p className="text-sm text-gray-600">{pb.context}</p>

              {pb.effectiveCost && (
                <div className="text-xs text-gray-500 border-l-2 border-gray-300 pl-3">
                  {pb.effectiveCost}
                </div>
              )}

              {/* Timeline */}
              <div className="relative">
                <div className="absolute left-[5px] top-2 bottom-2 w-px bg-gray-200" />
                <div className="space-y-4">
                  {pb.steps.map((step, i) => {
                    const s = stepStyle[step.type] || stepStyle.tip;
                    return (
                      <div key={i} className="flex gap-4 relative">
                        <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 z-10 ring-2 ring-white ${s.dot}`} />
                        <div className="flex-1 pb-1">
                          <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">{step.timing}</div>
                          <div className={`text-sm font-semibold mt-0.5 ${s.label}`}>{step.label}</div>
                          <p className="text-xs text-gray-500 mt-1 leading-relaxed">{step.detail}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400 pt-4 italic">No playbook yet for this card.</p>
          )}
        </div>
      )}
    </div>
  );
}

function PlaybookView() {
  const feeCards = cards
    .filter((c) => c.annualFee > 0)
    .sort((a, b) => (a.annualFeeMonth || 99) - (b.annualFeeMonth || 99));

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 px-1">
        Track annual fee dates, retention strategies, and whether to keep, downgrade, or cancel.
      </p>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {feeCards.map((card) => <PlaybookCardRow key={card.id} card={card} />)}
      </div>
    </div>
  );
}

// ─── App shell ────────────────────────────────────────────────────────────────

const TABS = [
  { id: "summary",  label: "Best Card For" },
  { id: "playbook", label: "Playbook" },
  { id: "cards",    label: "All Cards" },
];

export default function App() {
  const [view, setView] = useState("summary");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [search, setSearch] = useState("");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-5">
          <div className="pt-5 pb-3">
            <h1 className="text-base font-semibold text-gray-900 tracking-tight">Card Benefits</h1>
            <p className="text-xs text-gray-400 mt-0.5">Patrick & Michael Anne</p>
          </div>
          <nav className="flex gap-5 border-b border-gray-100 -mx-5 px-5">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setView(tab.id)}
                className={`text-sm pb-2.5 border-b-2 transition-colors ${
                  view === tab.id
                    ? "border-gray-900 text-gray-900 font-medium"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {view === "cards" && (
            <div className="py-3 flex gap-3 items-center">
              {["all", "patrick", "michael anne"].map((o) => (
                <button
                  key={o}
                  onClick={() => setOwnerFilter(o)}
                  className={`text-xs px-3 py-1 rounded-full transition-colors ${
                    ownerFilter === o
                      ? "bg-gray-900 text-white"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {o === "all" ? "All" : o === "patrick" ? "Patrick" : "Michael Anne"}
                </button>
              ))}
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="ml-auto text-xs px-3 py-1 rounded-full border border-gray-200 outline-none focus:border-gray-400 bg-white"
              />
            </div>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-6">
        {view === "summary"  && <SummaryView />}
        {view === "playbook" && <PlaybookView />}
        {view === "cards"    && <CardsView ownerFilter={ownerFilter} search={search} />}
      </main>

      <footer className="max-w-2xl mx-auto px-5 pb-10 text-center text-xs text-gray-300">
        Benefits may change — verify with issuer
      </footer>
    </div>
  );
}
