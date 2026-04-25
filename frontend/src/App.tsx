import { Button } from '@/components/ui/button'

export default function App() {
  return (
    <div className="mx-auto flex min-h-svh max-w-content flex-col gap-s8 px-s4 py-s8 text-left text-foreground">
      <header className="space-y-s2">
        <p className="font-mono text-xs uppercase tracking-wider text-slate-foreground">WEN · NEXUS DS</p>
        <h1 className="text-display-xl">Water–Energy Nexus</h1>
        <p className="max-w-prose text-slate-foreground">
          Faz 0: Vite, React, Tailwind ve design token altyapısı hazır. Bileşenler yalnızca <code className="rounded-sm bg-elevated px-s1 font-mono text-xs">var(--token)</code> ile
          stillenir.
        </p>
      </header>
      <section aria-label="Domain renk önizlemesi" className="grid gap-s4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-s4 shadow-card">
          <p className="mb-s2 font-mono text-xs uppercase text-slate-foreground">water</p>
          <p className="text-data-value text-water">12.4</p>
          <p className="text-sm text-slate-foreground">m³/saat</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-s4 shadow-card">
          <p className="mb-s2 font-mono text-xs uppercase text-slate-foreground">energy</p>
          <p className="text-data-value text-energy">842</p>
          <p className="text-sm text-slate-foreground">kWh</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-s4 shadow-card">
          <p className="mb-s2 font-mono text-xs uppercase text-slate-foreground">solar</p>
          <p className="text-data-value text-solar">18.2</p>
          <p className="text-sm text-slate-foreground">kW üretim</p>
        </div>
      </section>
      <footer className="flex flex-wrap gap-s3">
        <Button type="button">Primary</Button>
        <Button type="button" variant="secondary">
          Navy
        </Button>
        <Button type="button" variant="outline">
          Ghost outline
        </Button>
      </footer>
    </div>
  )
}
