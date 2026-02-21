-- =============================================================================
-- marketingwerk Portal v2 — Migration
-- =============================================================================
-- Drops old schema, creates new schema per PRD v2
-- =============================================================================

-- Drop old tables
DROP TABLE IF EXISTS portal_users CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS hot_leads CASCADE;
DROP TABLE IF EXISTS performance CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;
DROP TABLE IF EXISTS customers CASCADE;

-- =============================================================================
-- NEW SCHEMA
-- =============================================================================

-- Clients
CREATE TABLE clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE,
  status text DEFAULT 'Aktiv',
  branche text,
  website text,
  ansprache text DEFAULT 'Sie',
  credits_available int DEFAULT 0,
  credits_used int DEFAULT 0,
  gdrive_folder_url text,
  slack_channel_url text,
  slack_channel_id text,
  asana_project_url text,
  calendly_url text DEFAULT 'https://calendly.com/marketingwerk-at/30min',
  canva_folder_id text,
  stripe_payment_link text,
  campaign_request_url text,
  quote_request_url text,
  change_request_url text,
  logo_url text,
  primary_color text,
  secondary_color text,
  account_owner text DEFAULT 'Michael Höller',
  onboarding_date date,
  created_at timestamptz DEFAULT now()
);

-- Job Campaigns
CREATE TABLE job_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  jobtitel text NOT NULL,
  status text DEFAULT 'Setup',
  funnel_status text,
  funnel_url text,
  start_date date,
  end_date date,
  daily_budget decimal(10,2),
  total_spend decimal(10,2) DEFAULT 0,
  impressions int DEFAULT 0,
  clicks int DEFAULT 0,
  total_leads int DEFAULT 0,
  qualified_leads int DEFAULT 0,
  ctr decimal(5,2) DEFAULT 0,
  cvr decimal(5,2) DEFAULT 0,
  cpl decimal(10,2) DEFAULT 0,
  cpql decimal(10,2) DEFAULT 0,
  kpi_updated_at date,
  created_at timestamptz DEFAULT now()
);

-- Credit Transactions
CREATE TABLE credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  description text NOT NULL,
  type text NOT NULL,
  amount int NOT NULL,
  date date DEFAULT CURRENT_DATE,
  reference_type text,
  stripe_invoice_id text,
  created_at timestamptz DEFAULT now()
);

-- Contacts (Account Team)
CREATE TABLE contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text,
  email text,
  avatar_url text,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Announcements
CREATE TABLE announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  message text NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Portal Users
CREATE TABLE portal_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text DEFAULT 'viewer'
);

-- Indexes
CREATE INDEX idx_job_campaigns_client ON job_campaigns(client_id);
CREATE INDEX idx_credit_transactions_client ON credit_transactions(client_id);
CREATE INDEX idx_contacts_client ON contacts(client_id);
CREATE INDEX idx_announcements_client ON announcements(client_id);
CREATE INDEX idx_portal_users_client ON portal_users(client_id);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own" ON portal_users FOR SELECT USING (id = auth.uid());

CREATE POLICY "clients_own" ON clients FOR SELECT USING (
  id IN (SELECT client_id FROM portal_users WHERE id = auth.uid())
);

CREATE POLICY "campaigns_own" ON job_campaigns FOR SELECT USING (
  client_id IN (SELECT client_id FROM portal_users WHERE id = auth.uid())
);

CREATE POLICY "credits_own" ON credit_transactions FOR SELECT USING (
  client_id IN (SELECT client_id FROM portal_users WHERE id = auth.uid())
);

CREATE POLICY "contacts_own" ON contacts FOR SELECT USING (
  client_id IN (SELECT client_id FROM portal_users WHERE id = auth.uid())
);

CREATE POLICY "announcements_own" ON announcements FOR SELECT USING (
  client_id IN (SELECT client_id FROM portal_users WHERE id = auth.uid())
);
