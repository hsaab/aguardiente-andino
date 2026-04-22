import { useStrings } from '../i18n/strings.js';

/**
 * Top-of-page brand header with language and currency toggles.
 * Keeps the logo at a comfortable projection size and keeps toggles compact.
 */
export default function Header({ lang, setLang, currency, setCurrency }) {
  const t = useStrings(lang);

  return (
    <header className="w-full border-b border-charcoal/10 bg-cream/80 backdrop-blur-sm">
      <div className="container-content flex items-center justify-between py-6">
        <div className="flex items-center gap-4">
          <img
            src="/logo.png"
            alt={t.brand}
            className="h-14 w-auto select-none"
            draggable={false}
          />
          <div className="hidden md:flex flex-col leading-tight">
            <span className="eyebrow">{t.tagline}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <SegmentedToggle
            label="Language"
            value={lang}
            onChange={setLang}
            options={[
              { value: 'en', label: 'EN' },
              { value: 'es', label: 'ES' },
            ]}
          />
          <SegmentedToggle
            label="Currency"
            value={currency}
            onChange={setCurrency}
            options={[
              { value: 'COP', label: 'COP' },
              { value: 'USD', label: 'USD' },
            ]}
          />
        </div>
      </div>
    </header>
  );
}

function SegmentedToggle({ label, value, onChange, options }) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex rounded-lg border border-charcoal/10 bg-surface p-1 shadow-card"
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={[
              'rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200',
              active
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'text-muted hover:text-charcoal',
            ].join(' ')}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
