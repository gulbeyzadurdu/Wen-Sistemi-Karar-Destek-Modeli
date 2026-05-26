-- Migration 001: crisis_audit_logs.crisis_event_id → nullable
-- Çalıştırma: Supabase SQL Editor'a yapıştırıp çalıştır.
-- Tablo henüz yoksa (ilk kurulum) bu migration gerekmez;
-- SQLAlchemy create_all zaten nullable=True ile oluşturur.

-- 1. Eğer kolon NOT NULL ise kısıtlamayı kaldır.
ALTER TABLE crisis_audit_logs
    ALTER COLUMN crisis_event_id DROP NOT NULL;

-- 2. Ayrıca mevcut FK constraint'i yeniden tanımlamak gerekirse:
--    (Supabase genellikle FK constraint'e isim verir; aşağıdaki sadece gerekirse çalıştır.)
--
-- ALTER TABLE crisis_audit_logs
--     DROP CONSTRAINT IF EXISTS crisis_audit_logs_crisis_event_id_fkey;
--
-- ALTER TABLE crisis_audit_logs
--     ADD CONSTRAINT crisis_audit_logs_crisis_event_id_fkey
--     FOREIGN KEY (crisis_event_id)
--     REFERENCES crisis_events(id)
--     ON DELETE CASCADE;
