import SearchBar from "@/components/SearchBar";
import ThemeToggle from "@/components/ThemeToggle";

const EXAMPLE_USERS = ["torvalds", "gaearon", "sindresorhus", "yyx990803", "tj"];

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, var(--color-accent-indigo) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-8"
          style={{
            background: "radial-gradient(circle, var(--color-accent-teal) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(var(--color-text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--color-text-primary) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Theme toggle */}
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 max-w-2xl text-center animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[var(--color-accent-indigo)] flex items-center justify-center shadow-[var(--shadow-glow-indigo)]">
            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="gradient-text">DevDash</span>
          </h1>
        </div>

        <div className="space-y-3">
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
            Visualize any{" "}
            <span className="gradient-text">GitHub profile</span>
          </h2>
          <p className="text-lg text-[var(--color-text-secondary)] max-w-md mx-auto leading-relaxed">
            Contribution heatmaps, language breakdowns, achievement badges, and an AI-powered portfolio summary — all from a username.
          </p>
        </div>

        <SearchBar variant="landing" />

        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="text-sm text-[var(--color-text-muted)]">Try:</span>
          {EXAMPLE_USERS.map((user) => (
            <a
              key={user}
              href={`/dashboard/${user}`}
              className="px-3 py-1.5 rounded-full text-sm font-mono
                         bg-[var(--color-bg-surface)] border border-[var(--color-border)]
                         text-[var(--color-text-secondary)]
                         hover:border-[var(--color-accent-indigo)] hover:text-[var(--color-accent-indigo)]
                         hover:bg-[var(--color-bg-elevated)]
                         transition-all duration-200"
            >
              {user}
            </a>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
          {[
            { icon: "📊", label: "Contribution Heatmap" },
            { icon: "🏆", label: "Achievement Badges" },
            { icon: "💻", label: "Language Breakdown" },
            { icon: "✨", label: "AI Summary" },
          ].map((feature) => (
            <span
              key={feature.label}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs
                         bg-[var(--color-bg-surface)] border border-[var(--color-border)]
                         text-[var(--color-text-secondary)]"
            >
              <span>{feature.icon}</span>
              {feature.label}
            </span>
          ))}
        </div>
      </div>
    </main>
  );
}
