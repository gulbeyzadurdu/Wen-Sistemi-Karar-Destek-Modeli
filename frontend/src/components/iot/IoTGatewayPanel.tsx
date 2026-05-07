export function IoTGatewayPanel() {
  return (
    <section className="space-y-s4 rounded-2xl border border-border bg-card p-s6 shadow-card">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.45em] text-slate">Cihaz Bağlantıları (IoT Gateway)</p>
        <h2 className="mt-s2 text-xl font-semibold text-foreground">Saha bağlantı sağlığı</h2>
      </div>

      <div className="grid gap-s3 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-elevated/50 p-s4">
          <p className="text-xs text-slate">Bağlı Sensör Sayısı</p>
          <p className="mt-s1 font-semibold text-foreground">124 Sensör (Çevrimiçi)</p>
        </div>
        <div className="rounded-lg border border-border bg-elevated/50 p-s4">
          <p className="text-xs text-slate">Gateway Durumu</p>
          <p className="mt-s1 font-semibold text-foreground">BOSB-GW-01 (Çevrimiçi)</p>
        </div>
        <div className="rounded-lg border border-border bg-elevated/50 p-s4">
          <p className="text-xs text-slate">MQTT Broker</p>
          <p className="mt-s1 font-semibold text-foreground">broker.bosb.local:1883 (Çevrimiçi)</p>
        </div>
        <div className="rounded-lg border border-border bg-elevated/50 p-s4">
          <p className="text-xs text-slate">Veri Gecikmesi</p>
          <p className="mt-s1 font-semibold text-foreground">≈ 42 ms (Çevrimiçi)</p>
        </div>
      </div>

      <p className="text-xs text-slate">Tüm cihazlar çevrimiçi · Son senkronizasyon: 12:00:08</p>
    </section>
  )
}
