export type FactoryAnomaly = {
  id: string
  factoryId: string
  severity: 'Kritik' | 'Turuncu' | 'Sari' | 'Yesil' | 'Uyari'
  summary: string
  ts: string
}

const now = Date.now()

export const FACTORY_ANOMALY_HISTORY: FactoryAnomaly[] = [
  {
    id: 'ANM-TEK-921',
    factoryId: 'tekstil-a',
    severity: 'Sari',
    summary: 'Tekstil-A buhar hattinda kisa sureli basinç dalgalanmasi.',
    ts: new Date(now - 9 * 60_000).toLocaleString('tr-TR'),
  },
  {
    id: 'ANM-OTO-905',
    factoryId: 'otomotiv-b',
    severity: 'Turuncu',
    summary: 'Otomotiv-B enerji tuketimi 20 dakikada %16 artti.',
    ts: new Date(now - 28 * 60_000).toLocaleString('tr-TR'),
  },
  {
    id: 'ANM-GID-877',
    factoryId: 'gida-c',
    severity: 'Yesil',
    summary: 'Gida-C yalanci pozitif alarmi dogrulandi ve kapatildi.',
    ts: new Date(now - 2 * 60 * 60_000).toLocaleString('tr-TR'),
  },
  {
    id: 'ANM-KMY-842',
    factoryId: 'kimya-d',
    severity: 'Kritik',
    summary: 'Kimya-D su geri kazanim modulu cevrim disi tespit edildi.',
    ts: new Date(now - 47 * 60_000).toLocaleString('tr-TR'),
  },
  {
    id: 'ANM-OTO-831',
    factoryId: 'otomotiv-b',
    severity: 'Uyari',
    summary: 'Otomotiv-B MQTT paket gecikmesi 65ms seviyesine cikti.',
    ts: new Date(now - 76 * 60_000).toLocaleString('tr-TR'),
  },
  {
    id: 'ANM-TEK-818',
    factoryId: 'tekstil-a',
    severity: 'Yesil',
    summary: 'Tekstil-A otomatik dengeleme sayesinde esik deger normale dondu.',
    ts: new Date(now - 3 * 60 * 60_000).toLocaleString('tr-TR'),
  },
]
