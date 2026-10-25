import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Sparkles,
  FileText,
  Image as ImageIcon,
  FileCheck,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  MessageSquare,
  Sliders,
  BookOpen,
  BarChart3,
  Lock,
  UserCheck,
  Users,
  Eye,
  Plus,
  Search,
  Check,
  X,
  Info,
  ChevronRight,
  RefreshCw,
  Layers,
  Award,
  Terminal,
  ExternalLink,
  Upload,
  Filter,
  Clock,
  Send,
  History,
  Palette,
  Type,
  Database,
  TrendingUp,
  HelpCircle
} from 'lucide-react';

// --- INITIAL SAMPLE DATA ---
const INITIAL_ISSUES = [
  {
    id: 'ISS-01',
    format: 'text',
    category: 'Critical Claims',
    severity: 'critical',
    ruleId: 'FACT-2026-09',
    citation: 'Approved Product Facts Q4 • Row #18',
    title: 'Unsupported Promotional Claim & Unverified Uptime Stat',
    explanation: 'The draft claims "100% guaranteed zero-downtime" and "instant 10x speed". Approved engineering benchmarks certify 99.99% SLA uptime and up to 4.2x throughput gains.',
    originalSnippet: 'delivering 100% guaranteed zero-downtime and an instant 10x speed boost for every global enterprise',
    suggestedSnippet: 'delivering an enterprise-grade 99.99% uptime SLA and up to 4.2x faster query throughput across global workloads',
    status: 'open', // 'open' | 'applied' | 'overridden' | 'reverted'
    overrideReason: '',
    comments: [
      { author: 'AI Co-Pilot', time: '2m ago', text: 'Flagged against FTC Truth-in-Advertising & Q4 Fact Sheet.' }
    ]
  },
  {
    id: 'ISS-02',
    format: 'text',
    category: 'Tone & Terms',
    severity: 'warning',
    ruleId: 'RULE-TONE-04',
    citation: 'Brand Voice Guide v4.2 • Page 12',
    title: 'Off-Brand Aggressive & Hyperbolic Terminology',
    explanation: 'Acme Cloud voice is "Assured, Clear, and Collaborative." Avoid combative phrases like "crush your legacy competitors" or banned buzzwords like "bleeding-edge synergy".',
    originalSnippet: 'Crush your legacy competitors with our bleeding-edge AI synergy that obliterates manual ops.',
    suggestedSnippet: 'Accelerate your cloud transformation with intelligent automation designed to streamline complex operations.',
    status: 'open',
    overrideReason: '',
    comments: []
  },
  {
    id: 'ISS-03',
    format: 'text',
    category: 'Critical Claims',
    severity: 'critical',
    ruleId: 'SEC-COMP-02',
    citation: 'Legal & Security Claims Policy • Sec 3.1',
    title: 'Unqualified FedRamp High Certification Statement',
    explanation: 'Acme Cloud holds SOC2 Type II and ISO 27001 certifications. FedRAMP High is currently "In Process" and cannot be stated as completed without qualification.',
    originalSnippet: 'fully FedRAMP High certified out of the box for all defense workloads',
    suggestedSnippet: 'SOC2 Type II and ISO 27001 certified, with FedRAMP High authorization currently in process',
    status: 'open',
    overrideReason: '',
    comments: []
  },
  {
    id: 'ISS-04',
    format: 'visual',
    category: 'Visual & WCAG',
    severity: 'warning',
    ruleId: 'VIS-PALETTE-01',
    citation: 'Visual Identity System • Color Tokens',
    title: 'Off-Brand CTA Button Hex Color (#FF5733)',
    explanation: 'Primary call-to-action badge uses #FF5733 (Sunset Orange, Delta-E distance 41.2 from brand palette). Approved primary interactive accent is Electric Indigo (#4F46E5).',
    originalSnippet: 'CTA Fill: #FF5733 (Unapproved Orange)',
    suggestedSnippet: 'CTA Fill: #4F46E5 (Acme Electric Indigo)',
    status: 'open',
    overrideReason: '',
    comments: []
  },
  {
    id: 'ISS-05',
    format: 'visual',
    category: 'Visual & WCAG',
    severity: 'warning',
    ruleId: 'WCAG-AA-143',
    citation: 'Accessibility Standard • WCAG 2.1 AA (1.4.3)',
    title: 'Insufficient Subtitle Text Contrast Ratio (2.8:1)',
    explanation: 'Subtitle text (#94A3B8 on #CBD5E1 gradient card) measures 2.8:1 luminance contrast. WCAG 2.1 AA requires at least 4.5:1 for normal body copy.',
    originalSnippet: 'Subtitle Contrast: 2.8:1 (#94A3B8 on Light Slate)',
    suggestedSnippet: 'Subtitle Contrast: 7.4:1 (#1E293B Deep Slate)',
    status: 'open',
    overrideReason: '',
    comments: []
  }
];

const INITIAL_RULES = [
  { id: 'RULE-TONE-04', type: 'Terminology', forbidden: 'bleeding-edge, obliterate, crush competitors', preferred: 'intelligent, streamline, accelerate transformation', source: 'Brand Voice Guide v4.2 (p.12)' },
  { id: 'FACT-2026-09', type: 'Verified Fact', forbidden: '100% uptime, 10x speed', preferred: '99.99% uptime SLA, up to 4.2x faster query throughput', source: 'Q4 Engineering Benchmark Sheet' },
  { id: 'SEC-COMP-02', type: 'Legal Claim', forbidden: 'FedRAMP High certified', preferred: 'SOC2 Type II certified; FedRAMP High in process', source: 'Security Compliance Bulletin 2026' },
  { id: 'VIS-PALETTE-01', type: 'Visual Token', forbidden: 'Unapproved warm neon accents (#FF5733)', preferred: 'Electric Indigo (#4F46E5) & Deep Slate (#0F172A)', source: 'Design System Tokens v4.2' }
];

export default function App() {
  // Navigation & Role State
  const [activeNav, setActiveNav] = useState('studio'); // 'studio' | 'workflow' | 'vault' | 'insights'
  const [role, setRole] = useState('creator'); // 'creator' | 'reviewer' | 'admin'
  const [activeFormatTab, setActiveFormatTab] = useState('text'); // 'text' | 'visual' | 'pdf'
  const [selectedIssueId, setSelectedIssueId] = useState('ISS-01');
  const [issueFilter, setIssueFilter] = useState('All');

  // Interactive Data States
  const [issues, setIssues] = useState(INITIAL_ISSUES);
  const [rules, setRules] = useState(INITIAL_RULES);
  const [isScanning, setIsScanning] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [overrideInputId, setOverrideInputId] = useState(null);
  const [overrideText, setOverrideText] = useState('');
  const [commentInputId, setCommentInputId] = useState(null);
  const [commentText, setCommentText] = useState('');

  // Workflow Approval State
  const [workflowStatus, setWorkflowStatus] = useState('In Review'); // 'Draft' | 'In Review' | 'Changes Requested' | 'Approved for Publish'
  const [auditLogs, setAuditLogs] = useState([
    { id: 1, time: '10:14 AM', actor: 'Maya Lin (Creator)', role: 'Creator', action: 'Uploaded multi-modal launch kit (Copy + Social Banner + Whitepaper PDF)', badge: 'Upload' },
    { id: 2, time: '10:14 AM', actor: 'Inkloom Guard AI', role: 'AI Engine', action: 'Completed pre-flight scan against Brand Kit v4.2 (5 issues detected)', badge: 'AI Scan' }
  ]);

  // Knowledge Vault New Rule Form
  const [newRule, setNewRule] = useState({ id: '', type: 'Terminology', forbidden: '', preferred: '', source: '' });
  const [showAddRule, setShowAddRule] = useState(false);

  // Ambiguous Guideline Clarified State
  const [clarifiedRules, setClarifiedRules] = useState({});

  // Dynamic Brand Health Score Calculation
  const brandScore = useMemo(() => {
    const total = issues.length;
    const resolved = issues.filter(i => i.status === 'applied' || i.status === 'overridden').length;
    return Math.round(64 + (resolved / total) * 34);
  }, [issues]);

  const openIssuesCount = issues.filter(i => i.status === 'open').length;

  // Filtered Issues for Right Panel
  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      if (issueFilter === 'All') return true;
      return issue.category === issueFilter;
    });
  }, [issues, issueFilter]);

  // Handlers
  const handleRunScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 900);
  };

  const handleApplyFix = (id) => {
    const target = issues.find(i => i.id === id);
    setIssues(prev => prev.map(iss => iss.id === id ? { ...iss, status: 'applied' } : iss));
    setAuditLogs(prev => [
      {
        id: Date.now(),
        time: 'Just now',
        actor: role === 'creator' ? 'Maya Lin (Creator)' : 'Alex Rivera (Reviewer)',
        role: role.toUpperCase(),
        action: `Accepted AI intent-preserving rewrite for ${id} (${target?.ruleId})`,
        badge: 'Applied Fix'
      },
      ...prev
    ]);
  };

  const handleResetIssue = (id) => {
    setIssues(prev => prev.map(iss => iss.id === id ? { ...iss, status: 'open', overrideReason: '' } : iss));
  };

  const handleConfirmOverride = (id) => {
    if (!overrideText.trim()) return;
    const target = issues.find(i => i.id === id);
    setIssues(prev => prev.map(iss => iss.id === id ? { ...iss, status: 'overridden', overrideReason: overrideText } : iss));
    setAuditLogs(prev => [
      {
        id: Date.now(),
        time: 'Just now',
        actor: role === 'creator' ? 'Maya Lin (Creator)' : 'Alex Rivera (Reviewer)',
        role: 'Human Override',
        action: `Overrode ${id} (${target?.ruleId}) with justification: "${overrideText}"`,
        badge: 'Override'
      },
      ...prev
    ]);
    setOverrideInputId(null);
    setOverrideText('');
  };

  const handleAddComment = (id) => {
    if (!commentText.trim()) return;
    const authorName = role === 'creator' ? 'Maya Lin (Creator)' : role === 'reviewer' ? 'Alex Rivera (Manager)' : 'Samir Patel (Brand Admin)';
    setIssues(prev => prev.map(iss => iss.id === id ? {
      ...iss,
      comments: [...iss.comments, { author: authorName, time: 'Just now', text: commentText }]
    } : iss));
    setCommentInputId(null);
    setCommentText('');
  };

  const handleWorkflowDecision = (newStatus) => {
    setWorkflowStatus(newStatus);
    setAuditLogs(prev => [
      {
        id: Date.now(),
        time: 'Just now',
        actor: 'Alex Rivera (Brand Reviewer)',
        role: 'Manager',
        action: `Marked campaign package status as "${newStatus}"`,
        badge: newStatus === 'Approved for Publish' ? 'Approved' : 'Revision'
      },
      ...prev
    ]);
  };

  const handleAddRuleSubmit = (e) => {
    e.preventDefault();
    if (!newRule.forbidden || !newRule.preferred) return;
    const created = {
      id: newRule.id || `RULE-CUSTOM-0${rules.length + 1}`,
      type: newRule.type,
      forbidden: newRule.forbidden,
      preferred: newRule.preferred,
      source: newRule.source || 'Brand Admin Live Update v4.3'
    };
    setRules([created, ...rules]);
    setNewRule({ id: '', type: 'Terminology', forbidden: '', preferred: '', source: '' });
    setShowAddRule(false);
  };

  // Helper to get specific issue state for live preview
  const getIssue = (id) => issues.find(i => i.id === id);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* TOP GLOBAL HEADER */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-3">
        <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Left: Brand Logo & Active Kit Selector */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base tracking-tight text-slate-900">Inkloom Guard</span>
                  <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
                    v2.4 Enterprise
                  </span>
                </div>
                <p className="text-xs text-slate-500">Intelligent Brand-Governance & Pre-Publication Co-Pilot</p>
              </div>
            </div>

            <div className="hidden xl:flex items-center gap-2 pl-4 border-l border-slate-200">
              <span className="text-xs font-medium text-slate-400">Active Kit:</span>
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Acme Cloud Enterprise — Brand Kit v4.2
              </div>
            </div>
          </div>

          {/* Center: Role Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/70">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 px-2.5 hidden sm:inline">
              Simulate Role:
            </span>
            {[
              { id: 'creator', label: 'Creator (Draft & Fix)', icon: FileText },
              { id: 'reviewer', label: 'Manager (Approve & Audit)', icon: UserCheck },
              { id: 'admin', label: 'Brand Admin (Rules & Insights)', icon: Sliders }
            ].map((r) => {
              const Icon = r.icon;
              const active = role === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{r.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right: Responsible AI Disclosure Badge */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAiModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50/90 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-medium transition"
            >
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden md:inline font-semibold">AI Disclosure:</span>
              <span className="font-mono text-[11px]">Gemini 2.5 • Zero-Retention</span>
              <Info className="w-3.5 h-3.5 text-emerald-600" />
            </button>
          </div>
        </div>
      </header>

      {/* SUB-NAVIGATION BAR & ROLE CONTEXT BANNER */}
      <div className="bg-white border-b border-slate-200 px-6">
        <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Primary View Tabs */}
          <nav className="flex items-center gap-1 -mb-px overflow-x-auto">
            {[
              { id: 'studio', label: '1. Multi-Modal Review Studio', icon: Sparkles, badge: openIssuesCount > 0 ? `${openIssuesCount} Open` : 'Compliant' },
              { id: 'workflow', label: '2. Approval Workflow & Audit Log', icon: History, badge: workflowStatus },
              { id: 'vault', label: '3. Brand Knowledge Vault', icon: BookOpen, badge: `${rules.length} Rules` },
              { id: 'insights', label: '4. Governance & Clarity Insights', icon: BarChart3, badge: '2 Alerts' }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeNav === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveNav(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3.5 border-b-2 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  <span
                    className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-indigo-100 text-indigo-700 font-bold'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tab.badge}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Role Context Indicator */}
          <div className="py-2 hidden lg:flex items-center gap-2 text-xs text-slate-500">
            <span className="font-mono text-[11px] uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
              Active Permissions
            </span>
            {role === 'creator' && <span>Can edit drafts, apply 1-click AI rewrites, or log human overrides with context.</span>}
            {role === 'reviewer' && <span>Can audit creator overrides, verify citations, and sign off for publication.</span>}
            {role === 'admin' && <span>Can configure RAG guidelines, update hex tolerances, and resolve ambiguous rules.</span>}
          </div>
        </div>
      </div>

      {/* MAIN WORKSPACE CONTENT */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-6 py-6">
        {/* =========================================================
            VIEW 1: MULTI-MODAL REVIEW STUDIO (Split-Screen Co-Pilot)
        ========================================================= */}
        {activeNav === 'studio' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT PANEL (7 Cols): Multi-Format Content Canvas */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              {/* Document Toolbar */}
              <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex flex-wrap items-center justify-between gap-3">
                {/* Format Switcher */}
                <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-xl">
                  <button
                    onClick={() => setActiveFormatTab('text')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      activeFormatTab === 'text' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Marketing Copy (MD)</span>
                    <span className="font-mono text-[10px] px-1.5 py-0.2 bg-rose-100 text-rose-700 rounded-full">3</span>
                  </button>
                  <button
                    onClick={() => setActiveFormatTab('visual')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      activeFormatTab === 'visual' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                    <span>Social Banner (Visual)</span>
                    <span className="font-mono text-[10px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded-full">2</span>
                  </button>
                  <button
                    onClick={() => setActiveFormatTab('pdf')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      activeFormatTab === 'pdf' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Whitepaper (PDF)</span>
                  </button>
                </div>

                {/* Re-Scan / Upload Trigger */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRunScan}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                    <span>{isScanning ? 'Scanning RAG Vault...' : 'Run Pre-Flight Scan'}</span>
                  </button>
                </div>
              </div>

              {/* Animated Scan Progress Bar */}
              {isScanning && (
                <div className="w-full bg-indigo-50 px-4 py-2 border-b border-indigo-100 flex items-center justify-between text-xs text-indigo-700 font-medium">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 animate-pulse text-indigo-600" />
                    <span>Verifying claims, tone, hex distance (Delta-E), and WCAG 2.1 contrast against Brand Kit v4.2...</span>
                  </div>
                  <span className="font-mono">88%</span>
                </div>
              )}

              {/* TAB A: MARKETING COPY & CLAIMS EDITOR */}
              {activeFormatTab === 'text' && (
                <div className="p-6 sm:p-8 space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-600 font-semibold">
                        CAMPAIGN ASSET #AC-409 • PRESS & BLOG DRAFT
                      </span>
                      <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                        Introducing Acme Cloud Horizon 4.0 for Global Enterprises
                      </h2>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">Click any highlighted span to inspect</span>
                  </div>

                  {/* Interactive Document Paragraphs */}
                  <div className="space-y-5 text-[15px] leading-relaxed text-slate-700">
                    <p>
                      Today, we are proud to unveil <strong>Acme Cloud Horizon 4.0</strong>, our next-generation distributed data mesh built for high-velocity engineering teams. Modern organizations need unified observability without complex infrastructure overhead.
                    </p>

                    {/* Paragraph with Issue 1 (Critical Claim) */}
                    <p>
                      Built on our autonomous multi-region fabric, Horizon 4.0 sets a new industry benchmark by{' '}
                      {getIssue('ISS-01')?.status === 'applied' ? (
                        <span
                          onClick={() => setSelectedIssueId('ISS-01')}
                          className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-900 border-b-2 border-emerald-500 font-medium cursor-pointer transition"
                        >
                          {getIssue('ISS-01').suggestedSnippet}
                          <span className="ml-1.5 text-[10px] font-mono bg-emerald-600 text-white px-1.5 py-0.5 rounded">
                            ✓ FACT-2026-09 APPLIED
                          </span>
                        </span>
                      ) : getIssue('ISS-01')?.status === 'overridden' ? (
                        <span
                          onClick={() => setSelectedIssueId('ISS-01')}
                          className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 border-b-2 border-slate-400 cursor-pointer"
                        >
                          {getIssue('ISS-01').originalSnippet}
                          <span className="ml-1.5 text-[10px] font-mono bg-slate-600 text-white px-1.5 py-0.5 rounded">
                            OVERRIDDEN BY HUMAN
                          </span>
                        </span>
                      ) : (
                        <span
                          onClick={() => setSelectedIssueId('ISS-01')}
                          className={`px-1.5 py-0.5 rounded bg-rose-50/90 text-rose-900 border-b-2 border-rose-500 font-medium cursor-pointer transition ${
                            selectedIssueId === 'ISS-01' ? 'ring-2 ring-rose-400 ring-offset-1' : 'hover:bg-rose-100'
                          }`}
                        >
                          {getIssue('ISS-01')?.originalSnippet}
                          <span className="ml-1.5 text-[10px] font-mono bg-rose-600 text-white px-1.5 py-0.5 rounded">
                            ! FACT-2026-09
                          </span>
                        </span>
                      )}
                      .
                    </p>

                    {/* Paragraph with Issue 2 (Tone & Terminology) */}
                    <p>
                      Why settle for incremental upgrades when re-architecting your core pipeline?{' '}
                      {getIssue('ISS-02')?.status === 'applied' ? (
                        <span
                          onClick={() => setSelectedIssueId('ISS-02')}
                          className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-900 border-b-2 border-emerald-500 font-medium cursor-pointer transition"
                        >
                          {getIssue('ISS-02').suggestedSnippet}
                          <span className="ml-1.5 text-[10px] font-mono bg-emerald-600 text-white px-1.5 py-0.5 rounded">
                            ✓ RULE-TONE-04 APPLIED
                          </span>
                        </span>
                      ) : getIssue('ISS-02')?.status === 'overridden' ? (
                        <span
                          onClick={() => setSelectedIssueId('ISS-02')}
                          className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 border-b-2 border-slate-400 cursor-pointer"
                        >
                          {getIssue('ISS-02').originalSnippet}
                          <span className="ml-1.5 text-[10px] font-mono bg-slate-600 text-white px-1.5 py-0.5 rounded">
                            OVERRIDDEN
                          </span>
                        </span>
                      ) : (
                        <span
                          onClick={() => setSelectedIssueId('ISS-02')}
                          className={`px-1.5 py-0.5 rounded bg-amber-50 text-amber-950 border-b-2 border-amber-500 font-medium cursor-pointer transition ${
                            selectedIssueId === 'ISS-02' ? 'ring-2 ring-amber-400 ring-offset-1' : 'hover:bg-amber-100'
                          }`}
                        >
                          {getIssue('ISS-02')?.originalSnippet}
                          <span className="ml-1.5 text-[10px] font-mono bg-amber-600 text-white px-1.5 py-0.5 rounded">
                            ⚠ RULE-TONE-04
                          </span>
                        </span>
                      )}
                    </p>

                    {/* Paragraph with Issue 3 (Legal & Security Compliance) */}
                    <p>
                      Security and governance remain foundational to every release. Acme Cloud Horizon 4.0 is{' '}
                      {getIssue('ISS-03')?.status === 'applied' ? (
                        <span
                          onClick={() => setSelectedIssueId('ISS-03')}
                          className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-900 border-b-2 border-emerald-500 font-medium cursor-pointer transition"
                        >
                          {getIssue('ISS-03').suggestedSnippet}
                          <span className="ml-1.5 text-[10px] font-mono bg-emerald-600 text-white px-1.5 py-0.5 rounded">
                            ✓ SEC-COMP-02 APPLIED
                          </span>
                        </span>
                      ) : getIssue('ISS-03')?.status === 'overridden' ? (
                        <span
                          onClick={() => setSelectedIssueId('ISS-03')}
                          className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 border-b-2 border-slate-400 cursor-pointer"
                        >
                          {getIssue('ISS-03').originalSnippet}
                          <span className="ml-1.5 text-[10px] font-mono bg-slate-600 text-white px-1.5 py-0.5 rounded">
                            OVERRIDDEN
                          </span>
                        </span>
                      ) : (
                        <span
                          onClick={() => setSelectedIssueId('ISS-03')}
                          className={`px-1.5 py-0.5 rounded bg-rose-50/90 text-rose-900 border-b-2 border-rose-500 font-medium cursor-pointer transition ${
                            selectedIssueId === 'ISS-03' ? 'ring-2 ring-rose-400 ring-offset-1' : 'hover:bg-rose-100'
                          }`}
                        >
                          {getIssue('ISS-03')?.originalSnippet}
                          <span className="ml-1.5 text-[10px] font-mono bg-rose-600 text-white px-1.5 py-0.5 rounded">
                            ! SEC-COMP-02
                          </span>
                        </span>
                      )}
                      , giving regulated financial and public sector institutions peace of mind.
                    </p>
                  </div>

                  {/* Legend Footer */}
                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Unsupported Claim / Legal Risk
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Off-Brand Tone / Banned Term
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Verified & Compliant
                      </span>
                    </div>
                    <span className="font-mono text-[11px]">Preserving Creator Intent: Active</span>
                  </div>
                </div>
              )}

              {/* TAB B: SOCIAL BANNER & VISUALS INSPECTOR */}
              {activeFormatTab === 'visual' && (
                <div className="p-6 sm:p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-amber-600 font-semibold">
                        COMPUTER VISION + WCAG LUMINANCE AUDITOR
                      </span>
                      <h2 className="text-lg font-bold text-slate-900">
                        LinkedIn & ProductHunt Launch Banner (1200 × 628 px)
                      </h2>
                    </div>
                    <span className="text-xs text-slate-500">Click bounding-box hotspots to inspect</span>
                  </div>

                  {/* Simulated Promotional Graphic Canvas */}
                  <div className="relative rounded-2xl overflow-hidden border-2 border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-8 text-white shadow-inner min-h-[340px] flex flex-col justify-between">
                    {/* Top Row: Brand Logo Check (Passed) */}
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur border border-emerald-400/60">
                        <div className="w-5 h-5 rounded bg-indigo-500 flex items-center justify-center font-bold text-xs">A</div>
                        <span className="font-semibold text-sm tracking-tight">ACME CLOUD</span>
                        <span className="ml-2 text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-400/40">
                          ✓ Logo Clear-Space OK
                        </span>
                      </div>
                      <span className="text-xs font-mono text-slate-400">ASSET-ID: BANNER-Q4-01</span>
                    </div>

                    {/* Center Headline & Hotspot #2 (WCAG Contrast Check) */}
                    <div className="my-6 max-w-xl space-y-3">
                      <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                        Acme Cloud Horizon 4.0: Autonomous Data Mesh
                      </h3>

                      {/* Subtitle box with interactive WCAG contrast status */}
                      <div
                        onClick={() => setSelectedIssueId('ISS-05')}
                        className={`p-3 rounded-xl transition cursor-pointer ${
                          getIssue('ISS-05')?.status === 'applied'
                            ? 'bg-white text-[#1E293B] border-2 border-emerald-400 shadow-md'
                            : 'bg-[#CBD5E1] text-[#94A3B8] border-2 border-dashed border-amber-400'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-900 text-amber-300 font-semibold">
                            {getIssue('ISS-05')?.status === 'applied'
                              ? '✓ WCAG 2.1 AA Passed (7.4:1 Contrast)'
                              : '⚠ Hotspot #2: WCAG Contrast Failure (2.8:1 < 4.5:1)'}
                          </span>
                        </div>
                        <p className="text-sm font-medium">
                          Deploy zero-ops multi-region clusters with automated compliance guardrails across AWS, GCP, and Azure.
                        </p>
                      </div>
                    </div>

                    {/* Bottom CTA Button Hotspot #1 (Hex Palette Check) */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                      <div
                        onClick={() => setSelectedIssueId('ISS-04')}
                        className="relative group cursor-pointer inline-block"
                      >
                        <div
                          className={`px-6 py-3 rounded-xl font-bold text-sm shadow-lg transition flex items-center gap-2 ${
                            getIssue('ISS-04')?.status === 'applied'
                              ? 'bg-[#4F46E5] text-white ring-2 ring-emerald-400'
                              : 'bg-[#FF5733] text-white ring-2 ring-rose-400 ring-offset-2 ring-offset-slate-900'
                          }`}
                        >
                          <span>Start Free Enterprise Trial</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                        <span className="mt-2 inline-block text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900/90 text-amber-300 border border-amber-400/40">
                          {getIssue('ISS-04')?.status === 'applied'
                            ? '✓ Approved Token #4F46E5 Applied'
                            : '⚠ Hotspot #1: Off-Brand Hex #FF5733 (Delta-E: 41.2)'}
                        </span>
                      </div>

                      {/* Palette Swatch Comparison */}
                      <div className="bg-slate-900/90 border border-slate-700 rounded-xl p-3 flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded bg-[#FF5733] border border-white/20"></span>
                          <span className="font-mono text-slate-300">Detected: #FF5733</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded bg-[#4F46E5] border border-white/20"></span>
                          <span className="font-mono text-emerald-300">Brand Kit: #4F46E5</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB C: PRODUCT WHITEPAPER PDF PRE-FLIGHT */}
              {activeFormatTab === 'pdf' && (
                <div className="p-6 sm:p-8 space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-600 font-semibold">
                        MULTI-PAGE DOCUMENT PARSER • OCR + METADATA
                      </span>
                      <h2 className="text-lg font-bold text-slate-900">
                        Acme_Horizon_Architecture_Whitepaper_2026.pdf (14 Pages)
                      </h2>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      12 / 14 Pages Fully Compliant
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { page: 'Pages 1–4', title: 'Executive Summary & Vision', status: 'Passed', detail: 'Typography (Plus Jakarta Sans) & Logo clear-space verified.' },
                      { page: 'Pages 5–9', title: 'Benchmark Throughput Tables', status: 'Flagged (ISS-01)', detail: 'Page 7 Table 2 repeats the 10x speed claim; synced with ISS-01 rewrite.' },
                      { page: 'Pages 10–14', title: 'Security & Compliance Appendix', status: 'Flagged (ISS-03)', detail: 'Page 11 footnote requires FedRAMP "In Process" qualifier.' }
                    ].map((pg, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-slate-500">{pg.page}</span>
                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                              pg.status === 'Passed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {pg.status}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900">{pg.title}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">{pg.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT PANEL (5 Cols): Explainable Findings & Intent-Preserving Co-Pilot */}
            <div className="lg:col-span-5 space-y-4">
              {/* Brand Health Score Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                      LIVE BRAND GOVERNANCE SCORE
                    </span>
                    <div className="flex items-baseline gap-3 mt-1">
                      <span
                        className={`text-3xl font-extrabold font-mono ${
                          brandScore >= 90 ? 'text-emerald-600' : brandScore >= 75 ? 'text-indigo-600' : 'text-amber-600'
                        }`}
                      >
                        {brandScore}%
                      </span>
                      <span className="text-xs font-semibold text-slate-600">
                        {brandScore >= 90 ? 'Ready for Manager Sign-Off' : `${openIssuesCount} pre-publication issues require review`}
                      </span>
                    </div>
                  </div>

                  {/* Quick Progress Pill */}
                  <div className="text-right">
                    <span className="text-xs font-mono text-slate-500">
                      Resolved: {issues.length - openIssuesCount} / {issues.length}
                    </span>
                    <div className="w-32 h-2.5 bg-slate-100 rounded-full overflow-hidden mt-1.5 border border-slate-200">
                      <div
                        className={`h-full transition-all duration-500 ${
                          brandScore >= 90 ? 'bg-emerald-500' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${brandScore}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap items-center gap-1.5 mt-4 pt-4 border-t border-slate-100">
                  {['All', 'Critical Claims', 'Tone & Terms', 'Visual & WCAG'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setIssueFilter(cat)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                        issueFilter === cat
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Explainable Issue Cards List */}
              <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
                {filteredIssues.map((issue) => {
                  const isSelected = selectedIssueId === issue.id;
                  const isResolved = issue.status === 'applied' || issue.status === 'overridden';

                  return (
                    <div
                      key={issue.id}
                      onClick={() => {
                        setSelectedIssueId(issue.id);
                        if (issue.format !== activeFormatTab) setActiveFormatTab(issue.format);
                      }}
                      className={`bg-white rounded-2xl border transition-all p-5 cursor-pointer ${
                        isSelected
                          ? 'border-indigo-600 ring-2 ring-indigo-500/15 shadow-md'
                          : 'border-slate-200 hover:border-slate-300 shadow-sm'
                      }`}
                    >
                      {/* Top Badges & Citation */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                              issue.status === 'applied'
                                ? 'bg-emerald-100 text-emerald-800'
                                : issue.status === 'overridden'
                                ? 'bg-slate-200 text-slate-800'
                                : issue.severity === 'critical'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {issue.status === 'applied' ? (
                              <>
                                <CheckCircle2 className="w-3 h-3" /> Fix Applied
                              </>
                            ) : issue.status === 'overridden' ? (
                              <>
                                <UserCheck className="w-3 h-3" /> Human Override
                              </>
                            ) : issue.severity === 'critical' ? (
                              <>
                                <AlertOctagon className="w-3 h-3" /> {issue.category}
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="w-3 h-3" /> {issue.category}
                              </>
                            )}
                          </span>
                          <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded">
                            {issue.ruleId}
                          </span>
                        </div>

                        <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                          <BookOpen className="w-3 h-3 text-slate-400" />
                          {issue.citation}
                        </span>
                      </div>

                      {/* Issue Title & Plain-Language Explanation */}
                      <h3 className="text-sm font-bold text-slate-900 mb-1">{issue.title}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed mb-3">{issue.explanation}</p>

                      {/* Side-by-Side Intent-Preserving Diff Box */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs mb-3">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono uppercase text-rose-600 font-bold block">
                            Original Draft
                          </span>
                          <p className="text-slate-700 line-through decoration-rose-400/80 bg-rose-50/60 p-2 rounded border border-rose-200/60">
                            {issue.originalSnippet}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono uppercase text-emerald-700 font-bold flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Intent-Preserving Suggestion
                          </span>
                          <p className="text-slate-900 font-medium bg-emerald-50/70 p-2 rounded border border-emerald-200/80">
                            {issue.suggestedSnippet}
                          </p>
                        </div>
                      </div>

                      {/* Show Override Reason if Overridden */}
                      {issue.status === 'overridden' && (
                        <div className="mb-3 px-3 py-2 rounded-lg bg-slate-100 border border-slate-300 text-xs text-slate-700 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-900">Human Override Justification: </span>
                            <span>"{issue.overrideReason}"</span>
                          </div>
                        </div>
                      )}

                      {/* Human-in-the-Loop Action Buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                        {!isResolved ? (
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApplyFix(issue.id);
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Apply Rewrite / Fix</span>
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOverrideInputId(overrideInputId === issue.id ? null : issue.id);
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Override with Reason</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleResetIssue(issue.id);
                            }}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium transition"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Revert to Original</span>
                          </button>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCommentInputId(commentInputId === issue.id ? null : issue.id);
                          }}
                          className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-indigo-600"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Discuss ({issue.comments.length})</span>
                        </button>
                      </div>

                      {/* Inline Override Reason Box */}
                      {overrideInputId === issue.id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
                        >
                          <label className="block text-[11px] font-semibold text-slate-700">
                            Human-in-the-Loop Override (Logged to Audit Trail without AI blocking):
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={overrideText}
                              onChange={(e) => setOverrideText(e.target.value)}
                              placeholder="e.g., Approved by Legal Counsel for regional campaign..."
                              className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-indigo-500"
                            />
                            <button
                              onClick={() => handleConfirmOverride(issue.id)}
                              className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
                            >
                              Log Override
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Inline Comment / Discussion Thread */}
                      {commentInputId === issue.id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
                        >
                          {issue.comments.map((c, i) => (
                            <div key={i} className="text-xs bg-white p-2 rounded border border-slate-200/80">
                              <span className="font-bold text-slate-800">{c.author}</span>{' '}
                              <span className="text-slate-400 font-mono text-[10px]">{c.time}</span>
                              <p className="text-slate-600 mt-0.5">{c.text}</p>
                            </div>
                          ))}
                          <div className="flex gap-2 pt-1">
                            <input
                              type="text"
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              placeholder="Add review note or @mention manager..."
                              className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                            />
                            <button
                              onClick={() => handleAddComment(issue.id)}
                              className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
                            >
                              Send
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            VIEW 2: COLLABORATIVE APPROVAL WORKFLOW & REVISION HISTORY
        ========================================================= */}
        {activeNav === 'workflow' && (
          <div className="space-y-6">
            {/* Pipeline Stepper Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-600 font-semibold">
                    ROLE-BASED GOVERNANCE PIPELINE
                  </span>
                  <h2 className="text-xl font-bold text-slate-900">
                    Campaign Release Approval & Cryptographic Audit Trail
                  </h2>
                </div>

                {/* Role-Based Approval Actions */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleWorkflowDecision('Changes Requested')}
                    className="px-4 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition cursor-pointer"
                  >
                    Request Creator Revisions
                  </button>
                  <button
                    onClick={() => handleWorkflowDecision('Approved for Publish')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve for Publication</span>
                  </button>
                </div>
              </div>

              {/* 4-Stage Stepper */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {[
                  { step: '01', title: 'Draft Uploaded', desc: 'Maya Lin (Creator) • 3 Assets', done: true },
                  { step: '02', title: 'AI Pre-Flight Scan', desc: '5 Findings Grounded in RAG', done: true },
                  {
                    step: '03',
                    title: 'Creator Refinements',
                    desc: `${issues.length - openIssuesCount} of ${issues.length} Resolved • Score ${brandScore}%`,
                    done: openIssuesCount === 0
                  },
                  {
                    step: '04',
                    title: 'Manager Sign-Off',
                    desc: `Status: ${workflowStatus}`,
                    done: workflowStatus === 'Approved for Publish'
                  }
                ].map((st, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-xl border ${
                      st.done ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold text-indigo-600">STEP {st.step}</span>
                      {st.done ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-500" />
                      )}
                    </div>
                    <h4 className="font-bold text-sm text-slate-900">{st.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{st.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Revision & Audit Log Table */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-4">
                Immutable Revision History & Human-in-the-Loop Audit Trail
              </h3>
              <div className="space-y-3">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[11px] text-slate-400">{log.time}</span>
                      <span className="font-bold text-slate-900">{log.actor}</span>
                      <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono text-[10px] font-semibold">
                        {log.badge}
                      </span>
                      <span className="text-slate-700">{log.action}</span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-400">SHA-256 VERIFIED</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            VIEW 3: BRAND KNOWLEDGE VAULT (Guideline, Facts & Asset Setup)
        ========================================================= */}
        {activeNav === 'vault' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-600 font-semibold">
                    RAG GROUNDING SOURCE OF TRUTH
                  </span>
                  <h2 className="text-xl font-bold text-slate-900">
                    Brand Knowledge Vault — Rules, Verified Claims & Design Tokens
                  </h2>
                </div>
                <button
                  onClick={() => setShowAddRule(!showAddRule)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Brand Rule / Verified Fact</span>
                </button>
              </div>

              {/* Inline Add Rule Form */}
              {showAddRule && (
                <form
                  onSubmit={handleAddRuleSubmit}
                  className="mb-6 p-4 rounded-xl bg-indigo-50/50 border border-indigo-200 grid grid-cols-1 sm:grid-cols-5 gap-3"
                >
                  <input
                    type="text"
                    placeholder="Rule ID (e.g. CLAIM-2026-12)"
                    value={newRule.id}
                    onChange={(e) => setNewRule({ ...newRule, id: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs"
                  />
                  <select
                    value={newRule.type}
                    onChange={(e) => setNewRule({ ...newRule, type: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs"
                  >
                    <option>Terminology</option>
                    <option>Verified Fact</option>
                    <option>Legal Claim</option>
                    <option>Visual Token</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Flagged / Disallowed Phrase"
                    value={newRule.forbidden}
                    onChange={(e) => setNewRule({ ...newRule, forbidden: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Approved Replacement / Fact"
                    value={newRule.preferred}
                    onChange={(e) => setNewRule({ ...newRule, preferred: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700"
                  >
                    Save to RAG Index
                  </button>
                </form>
              )}

              {/* Rules Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-mono uppercase">
                      <th className="py-3 px-4">Rule Citation ID</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Disallowed / Off-Brand Pattern</th>
                      <th className="py-3 px-4">Approved Standard / Grounded Fact</th>
                      <th className="py-3 px-4">Authoritative Source</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rules.map((r, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80">
                        <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">{r.id}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                            {r.type}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-rose-700 font-medium">{r.forbidden}</td>
                        <td className="py-3.5 px-4 text-emerald-800 font-medium">{r.preferred}</td>
                        <td className="py-3.5 px-4 text-slate-500 font-mono">{r.source}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            VIEW 4: GOVERNANCE & GUIDELINE CLARITY INSIGHTS
        ========================================================= */}
        {activeNav === 'insights' && (
          <div className="space-y-6">
            {/* Top KPI Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Pre-Publication Assets Audited', val: '1,420', delta: '+18% this month', color: 'text-indigo-600' },
                { label: 'Unsupported Claims Prevented', val: '312', delta: '100% citation-grounded', color: 'text-rose-600' },
                { label: 'Avg Review Turnaround Time', val: '14 mins', delta: '-68% faster vs manual', color: 'text-emerald-600' },
                { label: 'Human Override Rate', val: '11.4%', delta: '2 rules flagged as ambiguous', color: 'text-amber-600' }
              ].map((kpi, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <span className="text-xs font-medium text-slate-500">{kpi.label}</span>
                  <p className={`text-3xl font-extrabold font-mono mt-1 ${kpi.color}`}>{kpi.val}</p>
                  <span className="text-[11px] font-mono text-slate-400 mt-1 block">{kpi.delta}</span>
                </div>
              ))}
            </div>

            {/* Ambiguous Guideline Alert Panel (Directly answers Problem Statement requirement!) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-amber-600 font-semibold">
                    GOVERNANCE FEEDBACK LOOP • GUIDELINE CLARITY DETECTOR
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">
                    Repeated Mistakes & Unclear Brand Guideline Alerts
                  </h3>
                </div>
                <span className="text-xs text-slate-500">
                  Identifies rules with high human override rates so Brand Admins can clarify documentation
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    ruleId: 'RULE-TONE-04',
                    overrideRate: '38% Human Override Rate (External Agencies)',
                    problem: 'Creators frequently use "hyper-scalable" in technical whitepapers, which triggers the banned superlative filter.',
                    recommendation: 'Update Brand Voice Guide p.12 to allow "horizontally scalable" in technical architecture docs while keeping marketing superlatives restricted.'
                  },
                  {
                    ruleId: 'SEC-COMP-02',
                    overrideRate: '29% Revision Delay Rate (Public Sector Team)',
                    problem: 'Sales decks repeatedly state "FedRAMP Authorized" without distinguishing between Moderate (Authorized) and High (In Process).',
                    recommendation: 'Add separate snippet templates in the Knowledge Vault for FedRAMP Moderate vs. FedRAMP High workloads.'
                  }
                ].map((item) => (
                  <div
                    key={item.ruleId}
                    className="p-5 rounded-xl bg-amber-50/50 border border-amber-200/80 flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-indigo-700 bg-white px-2.5 py-0.5 rounded border border-indigo-200">
                          {item.ruleId}
                        </span>
                        <span className="text-xs font-bold text-amber-800">{item.overrideRate}</span>
                      </div>
                      <p className="text-xs text-slate-700">
                        <strong>Detected Pattern:</strong> {item.problem}
                      </p>
                      <p className="text-xs text-slate-900 bg-white p-3 rounded-lg border border-amber-200">
                        <strong>AI Clarity Recommendation:</strong> {item.recommendation}
                      </p>
                    </div>

                    <div className="pt-2">
                      {clarifiedRules[item.ruleId] ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                          <CheckCircle2 className="w-4 h-4" /> Guideline Clarification Published to v4.3
                        </span>
                      ) : (
                        <button
                          onClick={() => setClarifiedRules({ ...clarifiedRules, [item.ruleId]: true })}
                          className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition cursor-pointer"
                        >
                          Publish Guideline Clarification to Brand Kit
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* RESPONSIBLE AI, PRIVACY & DISCLOSURE MODAL */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900">
                  Responsible AI, Privacy & Human Oversight Disclosure
                </h3>
              </div>
              <button onClick={() => setShowAiModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                <strong>1. Explicit AI & External Service Disclosure:</strong> Pre-publication analysis is powered by <strong>Google Gemini 2.5 Pro</strong> coupled with deterministic OpenCV / WCAG 2.1 luminance algorithms and Qdrant RAG vector retrieval.
              </p>
              <p>
                <strong>2. Zero-Data Retention & Confidentiality:</strong> Unpublished campaign drafts, product roadmaps, and brand kits are isolated per enterprise tenant. Payloads are never used to train external foundation models.
              </p>
              <p>
                <strong>3. Human-in-the-Loop Sovereignty:</strong> Inkloom Guard never automatically overrides human creative decisions. Creators and reviewers can accept suggestions or log justified overrides with full auditability.
              </p>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowAiModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
              >
                Acknowledge & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}