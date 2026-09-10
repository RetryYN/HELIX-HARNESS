# Authority Candidates

このdirectoryは、L1／L3／L10のcurrent authorityへ昇格する前の提案を置く。
candidateをruntime入力、DB authority、README上の確定機能として扱わない。plan固有human approval、
canonical merge、Requirement IR admission、main反映後の再読を経たものだけを現行正本へ移す。

## インフラ・運用・保守・logging品質要求

- [入力・既存owner接続](infrastructure-operations-quality-intake.md)
- [L1要求候補](infrastructure-operations-quality-l1-request-candidates.md)
- [L3要求候補](infrastructure-operations-quality-l3-requirement-candidates.md)
- [L10受入候補](infrastructure-operations-quality-l10-acceptance-candidates.md)

Issue #1728の未承認候補である。既存ownerへの接続を先に行い、この候補だけでSLO値、production操作、
包括的な自動修復権限、実装・運用完了を成立させない。

## HELIX Concept v4.0

- `helix-concept-v4.0.md`: Verified Change Operating SystemへのConcept候補
- `helix-concept-v4-requests.md`: L1要求候補
- `helix-concept-v4-requirements.md`: L3要件候補
- `helix-concept-v4-acceptance.md`: L10受入候補
- `helix-concept-v4-capability-delta.md`: baseline capabilityとの実測差分
- `helix-concept-v4-readme-projection.md`: 人間向けREADME説明候補（非authority）

正本化するときは、候補をこのdirectoryに残したままcurrentと二重authorityにしない。昇格先、
compatibility／archive移動、参照更新を同一migrationで閉じる。

## Cursor Phase A

- `cursor-phase-a-plan.md`: #1293の未採番PLAN候補と正本昇格checklist
- `cursor-phase-a-l4-boundary.md`: assignment・原子的ownership・実行・回収・独立review境界のL4候補
- `cursor-phase-a-l9-integration-oracles.md`: 同境界の失敗・回復を検査するL9候補

この3文書はnoncanonicalであり、runtime activation authorityではない。正規PLAN ID、three-lane IRの
main read-after、L4/L9 pair freeze、design catalog登録を同一promotionで成立させた後に候補を退役する。
