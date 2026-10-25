import React from 'react';
import { FlaggedIssue } from '../lib/api';
import {
  CheckCircle2,
  AlertOctagon,
  AlertTriangle,
  UserCheck,
  BookOpen,
  Sparkles,
  Check,
  RotateCcw,
  MessageSquare
} from './Icons';

interface IssueCardProps {
  issue: FlaggedIssue;
  isSelected: boolean;
  onSelect: () => void;
  onApplyFix: (id: string) => void;
  onResetIssue: (id: string) => void;
  overrideInputId: string | null;
  setOverrideInputId: (id: string | null) => void;
  overrideText: string;
  setOverrideText: (val: string) => void;
  onConfirmOverride: (id: string) => void;
  commentInputId: string | null;
  setCommentInputId: (id: string | null) => void;
  commentText: string;
  setCommentText: (val: string) => void;
  onAddComment: (id: string) => void;
}

export function IssueCard({
  issue,
  isSelected,
  onSelect,
  onApplyFix,
  onResetIssue,
  overrideInputId,
  setOverrideInputId,
  overrideText,
  setOverrideText,
  onConfirmOverride,
  commentInputId,
  setCommentInputId,
  commentText,
  setCommentText,
  onAddComment,
}: IssueCardProps) {
  const isResolved = issue.status === 'applied' || issue.status === 'overridden';

  return (
    <div
      onClick={onSelect}
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
          <p className="text-slate-700 line-through decoration-rose-400/80 bg-rose-50/60 p-2 rounded border border-rose-200/60 break-words">
            {issue.originalSnippet}
          </p>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase text-emerald-700 font-bold flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Intent-Preserving Suggestion
          </span>
          <p className="text-slate-900 font-medium bg-emerald-50/70 p-2 rounded border border-emerald-200/80 break-words">
            {issue.suggestedSnippet}
          </p>
        </div>
      </div>

      {/* Show Override Reason if Overridden */}
      {issue.status === 'overridden' && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-slate-100 border border-slate-300 text-xs text-slate-700 flex items-center justify-between">
          <div>
            <span className="font-bold text-slate-900">Human Override Justification: </span>
            <span>&quot;{issue.overrideReason}&quot;</span>
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
                onApplyFix(issue.id);
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
              onResetIssue(issue.id);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium transition cursor-pointer"
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
          className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-indigo-600 cursor-pointer"
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
              onClick={() => onConfirmOverride(issue.id)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 cursor-pointer"
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
              onClick={() => onAddComment(issue.id)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold cursor-pointer"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
