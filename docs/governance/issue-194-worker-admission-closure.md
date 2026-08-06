# Issue #194 クロージャ記録 — 外部AI worker共通admission境界

## 概要

Feature #194（外部AI worker共通admission境界の実装）を正式 close する記録。HR-FR-P2-05〜08 /
WCC-FR-01〜09 を provider-neutral な external worker admission として L4〜L9 へ降下し、versioned
descriptor / 共通 wrapper / isolated broker / strict output revalidation / worker lifecycle receipt を
実装した。Kimi #51・将来 worker・#92 orchestration は本共通境界の consumer である。

## atomic child（全 closed）

- #225 versioned descriptor／common wrapper／blind benchmark／用途別 admit-retire — resolved
- #226 isolated Node broker／worktree／secret-network-scope deny — resolved
- #227 strict output revalidation／proposal authority／worker lifecycle receipt — resolved

依存順 `#225 → #226 → #227` で構築。blocker（#227 / #373 / #389 / #241）はすべて解決済み。

## closure graph（canonical contract 9/9 receipt 充足）

`WCC-FR-01`〜`WCC-FR-09` の completion receipt を子 Issue に掲載済み。うち **`WCC-FR-01`（委譲面:
versioned descriptor）** は当初 receipt が欠落していた（実装 #355 が v2 review-receipt 形式導入前
だったため）。PLAN-RECOVERY-33 / PR #424 で L3 要件→runtime 強制の current-HEAD 検証
`U-WCC-FR01-001` を追加し、独立レビュー approve・CI success・DB converged の v2 review receipt を
根拠に WCC-FR-01 completion receipt を #225 へ回復掲載した。これにより closure graph の 9/9 が充足した。

## 権限境界

Node だけが approval/write/commit/DB authority を持つ。外部 worker へ DB path/credential/repository
state を渡さない。外部 worker の proposal-only 境界と ADR-010 の恒久 Python semantic core を混同しない。

MIC-FR-001 の work graph／capacity／projection 実装は #92（#213〜#215）が所有し、本 Issue の範囲外。
successor #213 は open のまま。
