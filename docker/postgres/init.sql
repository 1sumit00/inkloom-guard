-- Inkloom Guard PostgreSQL 16 + pgvector Initialization Schema
-- Matches database-entity.md

-- 1. Enable pgvector extension for RAG embeddings
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Organizations Table
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    approved_hex_palette JSONB DEFAULT '["#4F46E5", "#0F172A"]'::jsonb,
    min_wcag_ratio REAL DEFAULT 4.5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'CREATOR' CHECK (role IN ('CREATOR', 'REVIEWER', 'BRAND_ADMIN'))
);

-- 4. Brand Guidelines Table
CREATE TABLE IF NOT EXISTS brand_guidelines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    file_url TEXT,
    version_hash VARCHAR(64) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- 5. Guideline Rules Table (with 1536-dim vector for embeddings)
CREATE TABLE IF NOT EXISTS guideline_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guideline_id UUID REFERENCES brand_guidelines(id) ON DELETE CASCADE,
    rule_code VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('TONE', 'CLAIM', 'TERM', 'VISUAL', 'A11Y')),
    rule_text TEXT NOT NULL,
    source_citation VARCHAR(255) NOT NULL,
    forbidden TEXT,
    preferred TEXT,
    embedding vector(1536),
    total_triggers INT DEFAULT 0,
    human_override_count INT DEFAULT 0
);

-- 6. Content Submissions Table
CREATE TABLE IF NOT EXISTS content_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    creator_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('MARKDOWN', 'IMAGE', 'PDF')),
    workflow_status VARCHAR(50) DEFAULT 'DRAFT' CHECK (workflow_status IN ('DRAFT', 'IN_REVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'PUBLISHED')),
    current_governance_score INT DEFAULT 64 CHECK (current_governance_score BETWEEN 0 AND 100),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Submission Versions Table
CREATE TABLE IF NOT EXISTS submission_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID REFERENCES content_submissions(id) ON DELETE CASCADE,
    version_number INT DEFAULT 1,
    text_payload TEXT,
    asset_s3_url TEXT,
    sha256_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Flagged Issues Table
CREATE TABLE IF NOT EXISTS flagged_issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version_id UUID REFERENCES submission_versions(id) ON DELETE CASCADE,
    rule_id UUID REFERENCES guideline_rules(id) ON DELETE SET NULL,
    category VARCHAR(50) NOT NULL,
    severity VARCHAR(50) NOT NULL CHECK (severity IN ('CRITICAL', 'WARNING', 'MINOR')),
    original_snippet TEXT NOT NULL,
    explanation TEXT NOT NULL,
    suggested_rewrite TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'ACCEPTED', 'OVERRIDDEN')),
    override_reason TEXT,
    ai_model_disclosure VARCHAR(100) DEFAULT 'Gemini-2.5-Pro'
);

-- 9. Approval Logs Table (Cryptographic audit chain)
CREATE TABLE IF NOT EXISTS approval_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID REFERENCES content_submissions(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL CHECK (action IN ('SUBMITTED', 'ACCEPTED_FIX', 'OVERRODE_FLAG', 'APPROVED', 'REJECTED')),
    comment TEXT,
    previous_hash VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Organization, User, and Rules
DO $$
DECLARE
    default_org_id UUID := 'a0000000-0000-0000-0000-000000000001'::uuid;
    default_user_id UUID := 'b0000000-0000-0000-0000-000000000001'::uuid;
    default_kit_id UUID := 'c0000000-0000-0000-0000-000000000001'::uuid;
BEGIN
    INSERT INTO organizations (id, name, approved_hex_palette, min_wcag_ratio)
    VALUES (default_org_id, 'Acme Cloud Enterprise', '["#4F46E5", "#0F172A"]'::jsonb, 4.5)
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO users (id, org_id, email, role)
    VALUES (default_user_id, default_org_id, 'creator@acmecloud.io', 'CREATOR')
    ON CONFLICT (email) DO NOTHING;

    INSERT INTO brand_guidelines (id, org_id, title, version_hash, is_active)
    VALUES (default_kit_id, default_org_id, 'Acme Brand Voice & Design Kit v4.2', '9b7a14f2e881c3f9a2c4e881fa446b17', TRUE)
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO guideline_rules (id, guideline_id, rule_code, category, rule_text, source_citation, forbidden, preferred, total_triggers, human_override_count)
    VALUES 
    ('d0000000-0000-0000-0000-000000000001'::uuid, default_kit_id, 'RULE-TONE-04', 'TERM', 'Tone must be Assured, Clear, and Collaborative. Avoid aggressive superlatives.', 'Brand Voice Guide v4.2 (p.12)', 'bleeding-edge, obliterate, crush competitors', 'intelligent, streamline, accelerate transformation', 34, 13),
    ('d0000000-0000-0000-0000-000000000002'::uuid, default_kit_id, 'FACT-2026-09', 'CLAIM', 'Uptime claims must be certified against verified engineering SLAs.', 'Q4 Engineering Benchmark Sheet', '100% uptime, 10x speed', '99.99% uptime SLA, up to 4.2x faster query throughput', 18, 2),
    ('d0000000-0000-0000-0000-000000000003'::uuid, default_kit_id, 'SEC-COMP-02', 'CLAIM', 'FedRAMP High claims must be qualified as authorization currently in process.', 'Security Compliance Bulletin 2026', 'fully FedRAMP High certified', 'SOC2 Type II certified; FedRAMP High in process', 24, 7),
    ('d0000000-0000-0000-0000-000000000004'::uuid, default_kit_id, 'VIS-PALETTE-01', 'VISUAL', 'Interactive accents must strictly match approved Electric Indigo.', 'Design System Tokens v4.2', 'Unapproved warm neon accents (#FF5733)', 'Electric Indigo (#4F46E5) & Deep Slate (#0F172A)', 15, 1)
    ON CONFLICT (id) DO NOTHING;
END $$;
