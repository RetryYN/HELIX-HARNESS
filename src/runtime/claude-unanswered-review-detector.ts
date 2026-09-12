import { createHash } from "node:crypto";
import { parseClaudeIndependentPrReviewComment } from "./claude-pr-convergence";

const REQUEST_MENTION = /(^|\s)@claude(?:\s|$|[,:])/iu;
const REVIEW_INTENT = /review|レビュー|監査/iu;
const HEAD_LINE = /(?:^|\n)HEAD:\s*`?([a-f0-9]{40})`?(?:\n|$)/u;

export interface ClaudeReviewCommentObservation {
  id: number;
  body: string;
  created_at: string;
  updated_at: string;
  author_login: string;
  author_type: "User" | "Bot" | "Organization";
}

export interface ClaudeReviewSubjectObservation {
  subject_kind: "pull_request" | "issue";
  number: number;
  head_sha: string | null;
  comments: ClaudeReviewCommentObservation[];
}

export interface ClaudeReviewRequestState {
  subject_kind: "pull_request" | "issue";
  number: number;
  comment_id: number;
  requested_head: string | null;
  first_observed_at: string;
  body_digest: `sha256:${string}`;
}

export interface ClaudeUnansweredDetectorReport {
  schema_version: "claude-unanswered-review-detector.v1";
  read_only: true;
  requests: ClaudeReviewRequestState[];
  unanswered: Array<
    ClaudeReviewRequestState & {
      current_comment_present: boolean;
      edited_lost_mention: boolean;
    }
  >;
  answered_request_ids: number[];
  ignored_bot_comment_ids: number[];
  untrusted_response_comment_ids: number[];
}

function digest(value: string): `sha256:${string}` {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

function isRequest(comment: ClaudeReviewCommentObservation): boolean {
  return (
    comment.author_type !== "Bot" &&
    REQUEST_MENTION.test(comment.body) &&
    REVIEW_INTENT.test(comment.body)
  );
}

function responseHead(body: string): string | null {
  const receipt = parseClaudeIndependentPrReviewComment(body);
  if (receipt?.schemaVersion === "helix-claude-pr-review-receipt.v4") return receipt.headSha;
  if (!body.includes("## Claude reviewer:")) return null;
  return body.match(HEAD_LINE)?.[1] ?? null;
}

function answersRequest(
  comment: ClaudeReviewCommentObservation,
  request: ClaudeReviewRequestState,
  trustedResponderLogins: ReadonlySet<string>,
): boolean {
  if (comment.author_type === "Bot" || comment.id <= request.comment_id) return false;
  if (!trustedResponderLogins.has(comment.author_login.toLowerCase())) return false;
  const head = responseHead(comment.body);
  if (head === null) return false;
  return request.requested_head === null || head === request.requested_head;
}

export function detectUnansweredClaudeReviews(input: {
  subjects: ClaudeReviewSubjectObservation[];
  previous_requests?: ClaudeReviewRequestState[];
  trusted_responder_logins: string[];
}): ClaudeUnansweredDetectorReport {
  const subjectKey = (kind: string, number: number) => `${kind}:${String(number)}`;
  const currentSubjects = new Map(
    input.subjects.map((subject) => [subjectKey(subject.subject_kind, subject.number), subject]),
  );
  const requestByComment = new Map<number, ClaudeReviewRequestState>();
  for (const previous of input.previous_requests ?? [])
    requestByComment.set(previous.comment_id, previous);
  const ignoredBotCommentIds: number[] = [];
  const trustedResponderLogins = new Set(
    input.trusted_responder_logins.map((login) => login.trim().toLowerCase()).filter(Boolean),
  );
  const untrustedResponseCommentIds: number[] = [];
  for (const subject of input.subjects) {
    for (const comment of subject.comments) {
      if (comment.author_type === "Bot" && REQUEST_MENTION.test(comment.body)) {
        ignoredBotCommentIds.push(comment.id);
      }
      if (!isRequest(comment)) continue;
      requestByComment.set(comment.id, {
        subject_kind: subject.subject_kind,
        number: subject.number,
        comment_id: comment.id,
        requested_head: subject.head_sha,
        first_observed_at: comment.created_at,
        body_digest: digest(comment.body),
      });
    }
  }
  const requests = [...requestByComment.values()].sort((a, b) => a.comment_id - b.comment_id);
  const unanswered: ClaudeUnansweredDetectorReport["unanswered"] = [];
  const answeredRequestIds: number[] = [];
  for (const request of requests) {
    const subject = currentSubjects.get(subjectKey(request.subject_kind, request.number));
    if (!subject) {
      unanswered.push({ ...request, current_comment_present: false, edited_lost_mention: false });
      continue;
    }
    const currentRequest = subject.comments.find((comment) => comment.id === request.comment_id);
    const editedLostMention =
      currentRequest !== undefined && !REQUEST_MENTION.test(currentRequest.body);
    for (const comment of subject.comments) {
      if (
        comment.id > request.comment_id &&
        comment.author_type !== "Bot" &&
        responseHead(comment.body) !== null &&
        !trustedResponderLogins.has(comment.author_login.toLowerCase())
      ) {
        untrustedResponseCommentIds.push(comment.id);
      }
    }
    if (
      subject.comments.some((comment) => answersRequest(comment, request, trustedResponderLogins))
    ) {
      answeredRequestIds.push(request.comment_id);
    } else {
      unanswered.push({
        ...request,
        current_comment_present: currentRequest !== undefined,
        edited_lost_mention: editedLostMention,
      });
    }
  }
  return {
    schema_version: "claude-unanswered-review-detector.v1",
    read_only: true,
    requests,
    unanswered,
    answered_request_ids: answeredRequestIds,
    ignored_bot_comment_ids: [...new Set(ignoredBotCommentIds)].sort((a, b) => a - b),
    untrusted_response_comment_ids: [...new Set(untrustedResponseCommentIds)].sort((a, b) => a - b),
  };
}
