import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Float,
    Integer,
    Text,
    Boolean,
    DateTime,
    ForeignKey,
    JSON
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    approved_hex_palette = Column(JSON, default=lambda: ["#4F46E5", "#0F172A"])
    min_wcag_ratio = Column(Float, default=4.5)
    created_at = Column(DateTime, default=datetime.utcnow)

    users = relationship("User", back_populates="organization")
    guidelines = relationship("BrandGuideline", back_populates="organization")
    submissions = relationship("ContentSubmission", back_populates="organization")

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    org_id = Column(String(36), ForeignKey("organizations.id"), nullable=False)
    email = Column(String(255), nullable=False, unique=True)
    role = Column(String(50), nullable=False, default="CREATOR")  # CREATOR | REVIEWER | BRAND_ADMIN

    organization = relationship("Organization", back_populates="users")

class BrandGuideline(Base):
    __tablename__ = "brand_guidelines"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    org_id = Column(String(36), ForeignKey("organizations.id"), nullable=False)
    title = Column(String(255), nullable=False)
    file_url = Column(String(1024), nullable=True)
    version_hash = Column(String(64), nullable=False)
    is_active = Column(Boolean, default=True)

    organization = relationship("Organization", back_populates="guidelines")
    rules = relationship("GuidelineRule", back_populates="guideline")

class GuidelineRule(Base):
    __tablename__ = "guideline_rules"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    guideline_id = Column(String(36), ForeignKey("brand_guidelines.id"), nullable=True)
    rule_code = Column(String(50), nullable=False)
    category = Column(String(50), nullable=False)  # TONE | CLAIM | TERM | VISUAL | A11Y
    rule_text = Column(Text, nullable=False)
    source_citation = Column(String(255), nullable=False)
    total_triggers = Column(Integer, default=0)
    human_override_count = Column(Integer, default=0)

    guideline = relationship("BrandGuideline", back_populates="rules")
    flagged_issues = relationship("FlaggedIssue", back_populates="rule")

class ContentSubmission(Base):
    __tablename__ = "content_submissions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    org_id = Column(String(36), ForeignKey("organizations.id"), nullable=False)
    creator_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    title = Column(String(255), nullable=False)
    content_type = Column(String(50), nullable=False)  # MARKDOWN | IMAGE | PDF
    workflow_status = Column(String(50), default="DRAFT")  # DRAFT | IN_REVIEW | CHANGES_REQUESTED | APPROVED
    current_governance_score = Column(Integer, default=64)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    organization = relationship("Organization", back_populates="submissions")
    versions = relationship("SubmissionVersion", back_populates="submission")
    approval_logs = relationship("ApprovalLog", back_populates="submission")

class SubmissionVersion(Base):
    __tablename__ = "submission_versions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    submission_id = Column(String(36), ForeignKey("content_submissions.id"), nullable=False)
    version_number = Column(Integer, default=1)
    text_payload = Column(Text, nullable=True)
    asset_s3_url = Column(String(1024), nullable=True)
    sha256_hash = Column(String(64), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    submission = relationship("ContentSubmission", back_populates="versions")
    flagged_issues = relationship("FlaggedIssue", back_populates="version")

class FlaggedIssue(Base):
    __tablename__ = "flagged_issues"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    version_id = Column(String(36), ForeignKey("submission_versions.id"), nullable=True)
    rule_id = Column(String(36), ForeignKey("guideline_rules.id"), nullable=True)
    category = Column(String(50), nullable=False)
    severity = Column(String(50), nullable=False)  # CRITICAL | WARNING | MINOR
    original_snippet = Column(Text, nullable=False)
    explanation = Column(Text, nullable=False)
    suggested_rewrite = Column(Text, nullable=False)
    status = Column(String(50), default="OPEN")  # OPEN | ACCEPTED | OVERRIDDEN
    override_reason = Column(Text, nullable=True)
    ai_model_disclosure = Column(String(100), default="Gemini-2.5-Pro")

    version = relationship("SubmissionVersion", back_populates="flagged_issues")
    rule = relationship("GuidelineRule", back_populates="flagged_issues")

class ApprovalLog(Base):
    __tablename__ = "approval_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    submission_id = Column(String(36), ForeignKey("content_submissions.id"), nullable=False)
    actor_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    action = Column(String(50), nullable=False)  # SUBMITTED | ACCEPTED_FIX | OVERRODE_FLAG | APPROVED | REJECTED
    comment = Column(Text, nullable=True)
    previous_hash = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    submission = relationship("ContentSubmission", back_populates="approval_logs")
