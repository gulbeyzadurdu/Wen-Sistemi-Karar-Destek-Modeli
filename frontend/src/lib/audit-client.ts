export type ChecklistAuditPayload = {
  step_id: string
  timestamp: string
  user_id: string
}

/** Mock PUT for Kod Kırmızı audit trail until FastAPI exposes `/v1/crisis/audit`. */
export async function putChecklistAudit(payload: ChecklistAuditPayload): Promise<{ ok: true }> {
  await new Promise((r) => setTimeout(r, 140))
  if (import.meta.env.DEV) {
    console.info('[AUDIT MOCK PUT] /v1/crisis/audit', payload)
  }
  return { ok: true }
}
