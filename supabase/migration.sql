-- Enable UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Customers
CREATE TABLE customers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  package text,
  contact_name text,
  contact_email text,
  credits_available int DEFAULT 0,
  credits_used int DEFAULT 0,
  contract_start date,
  contract_end date,
  gdrive_folder_url text,
  leadtable_url text,
  slack_channel_url text,
  calendly_url text DEFAULT 'https://calendly.com/marketingwerk-at/recruitpilot',
  logo_url text,
  airtable_record_id text UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Campaigns
CREATE TABLE campaigns (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text,
  channels text[],
  tool text,
  status text DEFAULT 'Aktiv',
  target_audience text,
  start_date date,
  airtable_record_id text UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Weekly Performance
CREATE TABLE performance (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  week text NOT NULL,
  contacted int DEFAULT 0,
  accepted int DEFAULT 0,
  replies int DEFAULT 0,
  positive int DEFAULT 0,
  calls int DEFAULT 0,
  notes text,
  airtable_record_id text UNIQUE
);

-- Hot Leads
CREATE TABLE hot_leads (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  name text NOT NULL,
  company text,
  position text,
  linkedin_url text,
  channel text,
  status text,
  handed_over_at date,
  airtable_record_id text UNIQUE
);

-- Documents
CREATE TABLE documents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text,
  url text,
  description text,
  created_at date DEFAULT now()
);

-- Portal Users (links Supabase Auth to customers)
CREATE TABLE portal_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text DEFAULT 'viewer'
);

-- Indexes
CREATE INDEX idx_campaigns_customer ON campaigns(customer_id);
CREATE INDEX idx_performance_campaign ON performance(campaign_id);
CREATE INDEX idx_hot_leads_campaign ON hot_leads(campaign_id);
CREATE INDEX idx_documents_customer ON documents(customer_id);
CREATE INDEX idx_portal_users_customer ON portal_users(customer_id);

-- ROW LEVEL SECURITY
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE hot_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own" ON portal_users FOR SELECT USING (id = auth.uid());

CREATE POLICY "customers_own" ON customers FOR SELECT USING (
  id IN (SELECT customer_id FROM portal_users WHERE id = auth.uid())
);

CREATE POLICY "campaigns_own" ON campaigns FOR SELECT USING (
  customer_id IN (SELECT customer_id FROM portal_users WHERE id = auth.uid())
);

CREATE POLICY "performance_own" ON performance FOR SELECT USING (
  campaign_id IN (
    SELECT c.id FROM campaigns c
    JOIN portal_users pu ON pu.customer_id = c.customer_id
    WHERE pu.id = auth.uid()
  )
);

CREATE POLICY "hot_leads_own" ON hot_leads FOR SELECT USING (
  campaign_id IN (
    SELECT c.id FROM campaigns c
    JOIN portal_users pu ON pu.customer_id = c.customer_id
    WHERE pu.id = auth.uid()
  )
);

CREATE POLICY "documents_own" ON documents FOR SELECT USING (
  customer_id IN (SELECT customer_id FROM portal_users WHERE id = auth.uid())
);
