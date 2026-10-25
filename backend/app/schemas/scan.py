from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class IssueCommentSchema(BaseModel):
    author: str
    time: str
    text: str

class FlaggedIssueSchema(BaseModel):
    id: str
    format: str = Field(default="text", description="text | visual | pdf")
    category: str = Field(description="CLAIM | TONE | TERM | VISUAL | A11Y")
    severity: str = Field(description="CRITICAL | WARNING | MINOR")
    ruleId: str
    citation: str
    title: str
    explanation: str
    originalSnippet: str
    suggestedSnippet: str
    status: str = Field(default="open", description="open | applied | overridden | reverted")
    overrideReason: Optional[str] = None
    comments: List[IssueCommentSchema] = []
    aiModelDisclosure: Optional[str] = "Gemini-2.5-Pro"

class ScanRequest(BaseModel):
    textDraft: Optional[str] = None
    imageAssetUrl: Optional[str] = None
    pdfAssetUrl: Optional[str] = None
    brandKitId: Optional[str] = "kit-v4.2"

class ScanResponse(BaseModel):
    submissionId: str
    brandScore: int
    openIssuesCount: int
    issues: List[FlaggedIssueSchema]
    aiDisclosure: Dict[str, Any]

class IssueResolveRequest(BaseModel):
    action: str = Field(description="ACCEPTED | OVERRIDDEN | REVERTED")
    override_reason: Optional[str] = None
    comment: Optional[str] = None

class IssueResolveResponse(BaseModel):
    success: bool
    issueId: str
    status: str
    updatedBrandScore: int
    auditLogId: str
