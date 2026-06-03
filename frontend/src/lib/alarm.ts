/**
 * Web Audio API tabanlı alarm sentezleyici.
 * Dış dosya veya CDN bağımlılığı yoktur; çevrimdışı çalışır.
 */

let _ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!_ctx || _ctx.state === 'closed') {
    _ctx = new AudioContext()
  }
  // Tarayıcı autoplay kısıtlaması için context'i resume et
  if (_ctx.state === 'suspended') {
    void _ctx.resume()
  }
  return _ctx
}

/**
 * Tek bir sinüs bip sesi çalar.
 * @param frequency - Hz (varsayılan 880)
 * @param duration  - saniye (varsayılan 0.18)
 * @param volume    - 0–1 arası (varsayılan 0.10, kısık)
 */
function playBeep(frequency = 880, duration = 0.18, volume = 0.10): void {
  try {
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.value = frequency
    gain.gain.setValueAtTime(volume, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + duration + 0.01)
  } catch {
    // Ses desteklenmeyen ortamlarda sessizce geç
  }
}

/**
 * Çift bip alarm tonu (yüksek → alçak).
 * Simülasyon başlatıldığında veya acil durum tetiklendiğinde tek seferlik çağrılır.
 */
export function playAlarmTone(volume = 0.10): void {
  playBeep(880, 0.18, volume)
  setTimeout(() => playBeep(660, 0.20, volume), 260)
}

/**
 * Sürekli alarm döngüsü başlatır.
 * Döndürülen fonksiyon çağrıldığında döngü durur.
 * AppShell içinde acil durum aktifken kullanılır.
 */
export function startAlarmLoop(volume = 0.08, intervalMs = 2000): () => void {
  playAlarmTone(volume)
  const id = setInterval(() => playAlarmTone(volume), intervalMs)
  return () => clearInterval(id)
}
