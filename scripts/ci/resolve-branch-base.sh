#!/usr/bin/env bash
set -euo pipefail

event_name="${EVENT_NAME:?EVENT_NAME is required}"
candidate_head="${BRANCH_CANDIDATE_HEAD:?BRANCH_CANDIDATE_HEAD is required}"
explicit_base="${BRANCH_BASE_HEAD:-}"

is_head() {
  [[ "$1" =~ ^[0-9a-f]{40}$ && "$1" != "0000000000000000000000000000000000000000" ]]
}

if ! is_head "$candidate_head"; then
  echo "branch_base_candidate_head_invalid" >&2
  exit 1
fi

if [[ "$event_name" == "pull_request" ]]; then
  if ! is_head "$explicit_base"; then
    echo "branch_base_pull_request_base_invalid" >&2
    exit 1
  fi
  printf '%s\n' "$explicit_base"
  exit 0
fi

repository="${GITHUB_REPOSITORY:?GITHUB_REPOSITORY is required for non-PR base resolution}"
tmp_dir="$(mktemp -d)"
trap 'rm -rf -- "$tmp_dir"' EXIT

gh api --paginate --slurp "repos/$repository/pulls?state=open&per_page=100" > "$tmp_dir/open-pr-pages.json"
node -e '
  const fs = require("node:fs");
  const pages = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
  const pulls = pages.flatMap((page) => page);
  const matches = pulls
    .filter((pr) => pr?.head?.sha === process.argv[3])
    .map((pr) => ({ number: pr.number, head_sha: pr.head.sha, base_sha: pr?.base?.sha }));
  fs.writeFileSync(process.argv[2], JSON.stringify(matches));
' "$tmp_dir/open-pr-pages.json" "$tmp_dir/matches.json" "$candidate_head"

match_count="$(node -e 'process.stdout.write(String(JSON.parse(require("node:fs").readFileSync(process.argv[1], "utf8")).length))' "$tmp_dir/matches.json")"
if [[ "$match_count" -gt 1 ]]; then
  echo "branch_base_open_pr_ambiguous" >&2
  exit 1
fi

if [[ "$match_count" -eq 1 ]]; then
  readarray -t match < <(node -e 'const m=JSON.parse(require("node:fs").readFileSync(process.argv[1], "utf8"))[0]; console.log(m.number); console.log(m.head_sha); console.log(m.base_sha)' "$tmp_dir/matches.json")
  pr_number="${match[0]}"
  before_head="${match[1]}"
  before_base="${match[2]}"
  gh api "repos/$repository/pulls/$pr_number" > "$tmp_dir/read-after.json"
  readarray -t after < <(node -e 'const m=JSON.parse(require("node:fs").readFileSync(process.argv[1], "utf8")); console.log(m?.head?.sha ?? m.head_sha ?? ""); console.log(m?.base?.sha ?? m.base_sha ?? "")' "$tmp_dir/read-after.json")
  after_head="${after[0]}"
  after_base="${after[1]}"
  if [[ "$before_head" != "$candidate_head" || "$after_head" != "$candidate_head" || "$after_base" != "$before_base" ]]; then
    echo "branch_base_open_pr_stale" >&2
    exit 1
  fi
  git merge-base "$before_base" "$candidate_head"
  exit 0
fi

gh api "repos/$repository" > "$tmp_dir/repository.json"
default_branch="$(node -e 'const m=JSON.parse(require("node:fs").readFileSync(process.argv[1], "utf8")); process.stdout.write(typeof m.default_branch === "string" ? m.default_branch : (typeof m === "string" ? m : ""))' "$tmp_dir/repository.json")"
if [[ -z "$default_branch" || "$default_branch" == "null" ]]; then
  echo "branch_base_default_branch_unavailable" >&2
  exit 1
fi
default_head="$(git rev-parse "refs/remotes/origin/$default_branch")"
if ! is_head "$default_head"; then
  echo "branch_base_default_head_invalid" >&2
  exit 1
fi
git merge-base "$default_head" "$candidate_head"
