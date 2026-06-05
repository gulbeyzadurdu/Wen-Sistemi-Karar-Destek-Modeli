import type { AnomalySeverity } from '@/lib/anomaly-severity'

export type FactoryAnomaly = {
  id: string
  factoryId: string
  severity: AnomalySeverity
  summary: string
  ts: string
}

const now = Date.now()

export const FACTORY_ANOMALY_HISTORY: FactoryAnomaly[] = [
  {
    id: 'ANM-TEK-921',
    factoryId: 'tekstil-a',
    severity: 'Uyarı',
    summary: 'Tekstil-A buhar hattında kısa süreli basınç dalgalanması.',
    ts: new Date(now - 9 * 60_000).toLocaleString('tr-TR'),
  },
  {
    id: 'ANM-OTO-905',
    factoryId: 'otomotiv-b',
    severity: 'Uyarı',
    summary: 'Otomotiv-B enerji tüketimi 20 dakikada %16 arttı.',
    ts: new Date(now - 28 * 60_000).toLocaleString('tr-TR'),
  },
  {
    id: 'ANM-GID-877',
    factoryId: 'gida-c',
    severity: 'Bilgi',
    summary: 'Gıda-C yalancı pozitif alarmı doğrulandı ve kapatıldı.',
    ts: new Date(now - 2 * 60 * 60_000).toLocaleString('tr-TR'),
  },
  {
    id: 'ANM-KMY-842',
    factoryId: 'kimya-d',
    severity: 'Kritik',
    summary: 'Kimya-D su geri kazanım modülü çevrim dışı tespit edildi.',
    ts: new Date(now - 47 * 60_000).toLocaleString('tr-TR'),
  },
  {
    id: 'ANM-OTO-831',
    factoryId: 'otomotiv-b',
    severity: 'Uyarı',
    summary: 'Otomotiv-B MQTT paket gecikmesi 65ms seviyesine çıktı.',
    ts: new Date(now - 76 * 60_000).toLocaleString('tr-TR'),
  },
  {
    id: 'ANM-TEK-818',
    factoryId: 'tekstil-a',
    severity: 'Bilgi',
    summary: 'Tekstil-A otomatik dengeleme sayesinde eşik değer normale döndü.',
    ts: new Date(now - 3 * 60 * 60_000).toLocaleString('tr-TR'),
  },
]
