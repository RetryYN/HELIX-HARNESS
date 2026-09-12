import { writeFileSync } from "node:fs";

const [repository, outputPath, trustedLogins] = process.argv.slice(2);
if (!repository || !outputPath || !trustedLogins) throw new Error("usage: repository output trusted-logins");
const token = process.env.GITHUB_TOKEN;
const api = process.env.GITHUB_API_URL ?? "https://api.github.com";
if (!token) throw new Error("GITHUB_TOKEN is required");

async function pages(path) {
  const rows = [];
  for (let page = 1; ; page += 1) {
    const response = await fetch(`${api}${path}${path.includes("?") ? "&" : "?"}per_page=100&page=${page}`, {
      headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(`github_read_failed:${response.status}:${path}`);
    const batch = await response.json();
    if (!Array.isArray(batch)) throw new Error(`github_shape_invalid:${path}`);
    rows.push(...batch);
    if (batch.length < 100) return rows;
  }
}

async function stablePages(path) {
  const first = await pages(path);
  const second = await pages(path);
  const identity = (rows) => JSON.stringify(rows.map((row) => [row.id, row.updated_at ?? null]));
  if (identity(first) !== identity(second)) throw new Error(`pagination_race:${path}`);
  return second;
}

function comment(value) {
  return {
    id: value.id,
    body: value.body ?? "",
    created_at: value.created_at,
    updated_at: value.updated_at,
    author_login: value.user?.login ?? "",
    author_type: value.user?.type ?? "User",
  };
}

const pulls = await stablePages(`/repos/${repository}/pulls?state=open`);
const issues = (await stablePages(`/repos/${repository}/issues?state=open`)).filter(
  (issue) => issue.pull_request === undefined,
);
const allComments = await stablePages(
  `/repos/${repository}/issues/comments?sort=updated&direction=asc`,
);
const commentsByNumber = new Map();
for (const value of allComments) {
  const number = Number(new URL(value.issue_url).pathname.split("/").at(-1));
  const bucket = commentsByNumber.get(number) ?? [];
  bucket.push(comment(value));
  commentsByNumber.set(number, bucket);
}
const subjects = [];
for (const pull of pulls) {
  subjects.push({
    subject_kind: "pull_request",
    number: pull.number,
    head_sha: pull.head?.sha ?? null,
    comments: commentsByNumber.get(pull.number) ?? [],
  });
}
for (const issue of issues) {
  subjects.push({
    subject_kind: "issue",
    number: issue.number,
    head_sha: null,
    comments: commentsByNumber.get(issue.number) ?? [],
  });
}
writeFileSync(
  outputPath,
  `${JSON.stringify({
    schema_version: "claude-review-observation.v1",
    observed_at: new Date().toISOString(),
    subjects,
    trusted_responder_logins: trustedLogins.split(",").map((value) => value.trim()).filter(Boolean),
  })}\n`,
  { flag: "wx" },
);
