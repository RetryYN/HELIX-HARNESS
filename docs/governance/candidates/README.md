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

## 開発投資の段階候補

- `development-investment-stage-directives-intake_v1.0.md`: 開発コスト削減・知能化に関する
  INV-001〜072の日本語候補入口。原文bytesは`docs/archive/intake/development-investment-stage-directives-source_v1.0.md`へ保全する。

この文書のINV IDとP0〜P4は、Requirement ID、障害severity、L1〜L12、Release Waveではない。
候補文書だけで72件を承認・v1必須化・一括Issue化・実装済み扱いにしない。選択したINVごとに
current Requirement／Capability／Issue／Release ownerを再解決し、意味・受入・権限の差分だけを
正規の要求改訂へ送る。分冊原稿が参照していた`06_ITEM_DIRECTIVES.md`は実在せず、統合版内の
「INV-001〜072 個別実施カード」をその参照先として扱う。
