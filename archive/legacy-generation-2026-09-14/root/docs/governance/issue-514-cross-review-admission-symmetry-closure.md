# Issue #514 クロージャ記録 — cross-review admission の方向対称化

## 概要

Issue #514 で検出した、`current HEAD independent review admission` が
Codex author／Claude reviewer の一方向だけを受理する欠陥を閉じる。
PR #520 は current receipt を v3 へ更新し、author／reviewer の runtime と model family を
双方向に検査する一方、v2 を historical evidence 専用として保持した。

## 完了条件の充足

- `codex / gpt-5.6-sol` → `claude / claude-opus-5` と、逆方向の
  `claude / claude-opus-5` → `codex / gpt-5.6-sol` を同じ判定 core で受理する。
- 同一 runtime、同一 model family、unknown model、runtime と model の入れ替え、stale HEAD、
  別 PR、重複 receipt は fail-close を維持する。
- GitHub admission、Issue closure graph、Kimi bootstrap は human-readable prose を判定根拠にせず、
  共通の canonical comment decoder を使う。
- current admission は v3 のみを受理し、v2 は historical closure／bootstrap の読取互換に限定する。
- caller 由来の actor identity／session／context、current HEAD の input exact set、typed finding の
  provenance は本 Issue の完了へ過大計上せず、successor #519 が所有する。

## 同一 HEAD の証拠

- 実装 PR: #520
- candidate HEAD: `c4d2d91075d954649f154e832f786a018dfa38be`
- candidate tree: `5b414a653fc294a071996a0b6cf089fae639a607`
- Draft 時の全量 CI: run `31326115723`、成功
- Ready 後の admission CI: run `31327039160`、成功
- canonical v3 review receipt:
  https://github.com/RetryYN/HELIX-HARNESS/pull/520#issuecomment-5232853132
- レビュー判定: `approve`、blocker 0、DB converged
- merge commit: `75afbab83e1552148060ded0628c7ae057e4aa6a`
- merge tree: `5b414a653fc294a071996a0b6cf089fae639a607`
- merge parents: `5d28912d55ca8f8461bcf5a838f0be29756d5a5c`、
  `c4d2d91075d954649f154e832f786a018dfa38be`
- merge 後の read-after receipt: `sha256:b450927c714b893e0554b47064e407bfc2e24d059e2d358c233a6394c8f94fec`
  （`outcome=verified`、`reasons=[]`、mode 0600）
- completion receipt:
  https://github.com/RetryYN/HELIX-HARNESS/issues/514#issuecomment-5232888724

candidate tree と merge tree は同一であり、merge parents は reviewed candidate HEAD を含む。
post-merge receipt は現行 v1 契約どおり Git common runtime へ保存した local evidence であり、
Issue completion receipt v1 が機械 join した証拠とは主張しない。

## 後続境界

- #519 は `github-cross-review-admission` owner の provenance 強化を担う open successor とする。
- 親 Issue #489 は #519 が完了するまで close しない。
- PR #506 は #514 以外の設計順序・PLAN identity・behavior contract blockerを持つため、
  本 Issue の完了を根拠に Ready 化または merge しない。
- superseded PR #518 は #520 へ吸収済みで、merge しない。

## Issue closure graph 契約

```json
{"schema_version":"helix-issue-closure-graph.v1","canonical_contracts":[{"contract_id":"GITHUB-CROSS-REVIEW-ADMISSION-001","owner_issue":514}],"child_issues":[],"successor_issues":[{"number":519,"expected_state":"open"}]}
```
