-- =============================================================================
-- marketingwerk Portal — Seed Data
-- =============================================================================
-- Run AFTER migrations: psql $DATABASE_URL -f supabase/seed.sql
-- Or via Supabase Dashboard → SQL Editor
--
-- WICHTIG: portal_users braucht eine auth.users UUID.
-- 1. Erstelle zuerst einen User via Magic Link (Auth → Users in Supabase Dashboard)
-- 2. Kopiere die UUID und füge unten ein:
--
--    INSERT INTO portal_users (id, customer_id, role)
--    VALUES ('<auth-user-uuid>', '<customer-id>', 'admin');
-- =============================================================================

-- Beispiel-Kunde
INSERT INTO customers (id, name, package, contact_name, contact_email, credits_available, credits_used, contract_start, contract_end, gdrive_folder_url, leadtable_url, calendly_url, slack_channel_url)
VALUES (
  'cust_01',
  'TechRecruit GmbH',
  'Premium',
  'Anna Müller',
  'anna@techrecruit.at',
  150,
  47,
  '2025-09-01',
  '2026-08-31',
  'https://drive.google.com/drive/folders/example',
  'https://airtable.com/app/example',
  'https://calendly.com/marketingwerk/30min',
  'https://slack.com/example'
);

-- Kampagnen (verschiedene Status)
INSERT INTO campaigns (id, customer_id, name, type, channels, status, start_date, created_at) VALUES
  ('camp_01', 'cust_01', 'Senior Developer Kampagne', 'Recruiting', ARRAY['LinkedIn', 'Meta'], 'Aktiv', '2025-11-01', '2025-11-01T10:00:00Z'),
  ('camp_02', 'cust_01', 'Sales Manager Suche', 'Recruiting', ARRAY['LinkedIn'], 'Pausiert', '2025-10-15', '2025-10-15T09:00:00Z'),
  ('camp_03', 'cust_01', 'Employer Branding Q4', 'Branding', ARRAY['Instagram', 'TikTok'], 'Beendet', '2025-07-01', '2025-07-01T08:00:00Z');

-- Performance-Daten (4 Wochen für camp_01)
INSERT INTO campaign_performance (campaign_id, week_start, impressions, clicks, leads, cost_eur) VALUES
  ('camp_01', '2025-12-02', 12400, 310, 8, 420.00),
  ('camp_01', '2025-12-09', 15200, 385, 12, 480.00),
  ('camp_01', '2025-12-16', 13800, 345, 10, 450.00),
  ('camp_01', '2025-12-23', 11200, 280, 7, 390.00);

-- Hot Leads
INSERT INTO hot_leads (id, campaign_id, name, position, company, linkedin_url, status, created_at) VALUES
  ('lead_01', 'camp_01', 'Max Bauer', 'Senior Backend Developer', 'DataFlow AG', 'https://linkedin.com/in/example1', 'Neu', '2025-12-20T14:30:00Z'),
  ('lead_02', 'camp_01', 'Sarah Klein', 'Full-Stack Entwicklerin', 'CloudTech GmbH', 'https://linkedin.com/in/example2', 'Kontaktiert', '2025-12-18T11:00:00Z'),
  ('lead_03', 'camp_02', 'Thomas Gruber', 'Sales Director', 'InnoSales KG', 'https://linkedin.com/in/example3', 'Interessiert', '2025-12-15T09:15:00Z');

-- Dokumente
INSERT INTO documents (id, customer_id, name, type, description, url, created_at) VALUES
  ('doc_01', 'cust_01', 'Performance Report Dezember', 'Report', 'Monatlicher Kampagnen-Report mit allen KPIs', 'https://drive.google.com/file/d/example1', '2025-12-28T10:00:00Z'),
  ('doc_02', 'cust_01', 'Rahmenvertrag 2025/26', 'Vertrag', 'Dienstleistungsvertrag Premium Paket', 'https://drive.google.com/file/d/example2', '2025-09-01T08:00:00Z'),
  ('doc_03', 'cust_01', 'Kampagnen-Briefing Q1', 'Briefing', 'Briefing für die Senior Developer Kampagne', 'https://drive.google.com/file/d/example3', '2025-10-28T14:00:00Z');
