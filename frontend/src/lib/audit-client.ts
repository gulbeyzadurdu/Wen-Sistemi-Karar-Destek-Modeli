import { putCrisisAudit } from '@/lib/api-client'

export type ChecklistAuditPayload = {
  step_id: string
  timestamp: string
  user_id: string
}

/** PUT /crisis/audit — kriz protokol adımını backend'e kaydeder.
 *  Hata durumunda sessizce geçer; uygulama akışını asla patlatmaz. */
export async function putChecklistAudit(payload: ChecklistAuditPayload): Promise<{ ok: true }> {
  try {
    await putCrisisAudit(payload)
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn('[AUDIT] PUT /v1/crisis/audit başarısız (sessizce geçiliyor):', err)
    }
  }
  return { ok: true }
}
