import { FACTORIES } from '@/mocks/factories'
import { useOpsStore } from '@/stores/ops-store'

export function FactorySelector() {
  const selectedFactoryId = useOpsStore((s) => s.selectedFactoryId)
  const setSelectedFactoryId = useOpsStore((s) => s.setSelectedFactoryId)

  return (
    <div className="rounded-xl border border-border bg-card p-s4 shadow-card">
      <p className="font-mono text-sm tracking-[0.28em] text-slate">Fabrika Seçici</p>
      <div className="mt-s3 flex flex-wrap items-center gap-s3">
        <label htmlFor="factory-select" className="text-sm font-medium text-foreground">
          İzleme kapsamı
        </label>
        <select
          id="factory-select"
          value={selectedFactoryId}
          onChange={(event) => setSelectedFactoryId(event.target.value as 'ALL' | string)}
          className="min-w-[220px] rounded-md border border-border bg-base px-s3 py-s2 text-sm text-foreground outline-none transition focus:border-input"
        >
          <option value="ALL">Tüm Sanayi Bölgesi (BOSB)</option>
          {FACTORIES.map((factory) => (
            <option key={factory.id} value={factory.id}>
              {factory.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
