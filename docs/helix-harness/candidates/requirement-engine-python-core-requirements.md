---
title: "HARNESS要求エンジンPythonコア要求候補"
status: draft_candidate
authority_status: awaiting_human_approval
created: 2026-09-15
updated: 2026-09-25
product_owner: HELIX-HARNESS
operational_owner: HELIX-OS
derived_from:
  - docs/helix-harness/L1-planning/product-intent.md
  - archive/legacy-generation-2026-09-14/root/docs/adr/ADR-010-python-semantic-core-node-commit-boundary.md
  - archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/requirement-discovery-json-authority.md
---

# HARNESS要求エンジンPythonコア要求候補

2026-09-25のPO判断により、`docs/governance/candidates/`からHELIX-HARNESSの候補置き場へ移した（[判断記録](../../governance/decisions/mechanism-placement-po-decisions-2026-09-25.md)）。

## 責務

要求エンジンはHELIX-HARNESSの提供能力とする。利用者指示と根拠から要求候補を抽出・構造化し、
不足、矛盾、過剰解釈、変更影響と確認事項を提示する。HELIX-OSはエンジンの出力を管理対象へ登録し、
対象project、product、source revision、採否、担当、進行、証拠、再検証と改善履歴を統制する。
OS内に別の要求エンジンや要求意味の正本を作らない。

旧世代にはRequirement Engine、L3 Compiler、要求discovery、意味差分、trace、impact等の設計と
TypeScript実装が存在した。一方、Python semantic coreを現行新世代で稼働・検証済みとする証拠はない。
旧資産はbehavior sourceとして再採否し、既存実装や旧ADRのaccepted状態を新世代の完成証拠にしない。
[意味密度による抽出方針](semantic-density-python-extraction-policy.md)に従い、意味判断の割合が高いbehavior atomを
Pythonへ再導出し、認可・DB／Git／GitHub・lease等の外部作用は別のtransactional boundaryへ分離する。
外部作用境界の実装技術とwire formatは新世代architectureからL3以降で選定する。

## HARNESS要求候補

| ID | 要求 | 確認する結果 |
|---|---|---|
| REQENG-HARNESS-001 | 利用者の指示、回答、反応、既存要求、製品固有制約を出典とrevision付きで受け取り、要求候補、未確定事項、質問、矛盾、重複、欠落、過剰解釈を区別して返す | 指示にない意味を承認済み要求へ補完せず、何を抽出し何を判断待ちにしたか説明できる |
| REQENG-HARNESS-002 | Concept／企画L1、指示、抽出結果、前後revision、採用要求を同じ系譜で意味比較し、要求化漏れ、企画外追加、対象製品違い、scope／non-goal逸脱、矛盾、取消・保留の見落としを検出する | 単語一致や文書生成成功だけで企画・指示との整合を成立させない |
| REQENG-HARNESS-003 | 要求をstable identity、actor、目的、scope、制約、正常・取消・失敗・timeout・回復、acceptance、trace、根拠、uncertaintyへ構造化し、下流の設計・検証候補へ接続する | 画面、API、data、権限、通知、監査等の異なるsurfaceでも同じ要求意味へ辿れる |
| REQENG-HARNESS-004 | 要求変更のsemantic diffと影響候補を算出し、影響する要求、設計、V-pair、検証、提供物、運用評価と確認が必要なownerを提示する | unknownやambiguousを影響なしへ変換せず、無関係な要求を一律に失効させない |
| REQENG-HARNESS-005 | 要求意味処理を製品非依存のPython semantic coreとして提供し、製品固有の語彙、policy、質問、品質matrixはversioned inputとして分離する | HARNESS、HELIX-Web、他製品で共通能力を利用でき、一製品の規則が他製品へ漏れない |
| REQENG-HARNESS-006 | Python coreは決定論的な意味変換を担い、versioned strict machine contract、bounded resource、network default denyで入出力する | DB、Git、GitHub、repository、credential、runtime stateへの直接writeなしに同一入力から再現できる。wire formatはL3で選定する |
| REQENG-HARNESS-007 | 人間の指示、相談、反応、要求合意、L3承認と操作許可を区別し、エンジン出力をproposalとして扱う | 会話、Issue、PR、CI、ログ、沈黙から要求承認や操作権限を生成しない |
| REQENG-HARNESS-008 | 要求を単体要求、接続要求、構成体要求に分け、対象identity、owner scope、構成要素、接続点、依存、前提、境界を保持する | 機能A自身の成立、A→Bの接続成立、A–Cから成るシステムAの成立を別々に判定できる |
| REQENG-HARNESS-009 | 構成体要求は子要求の集合だけでなく、組合せで初めて生じるend-to-end behavior、順序、整合性、性能、failure propagation、回復、security境界を明示する | 全子機能の単体成功だけで接続・統合・システム成立を推定しない |
| REQENG-HARNESS-010 | engine出力を利用するconsumerがschema、対象revision、stale、重複、prohibited payloadを再検証できる提供契約を持つ | HELIX-OSを使わない外部consumerもcommand、SQL、path、codeを実行せず、proposalを要求正本へ直接採用しない |

## HELIX-OSへの登録・改善要求候補

HELIX-OSに対する要求（REQENG-OS-001〜007）は、[requirement-engine-python-core-requirements.md](../../helix-os/candidates/requirement-engine-python-core-requirements.md)へ分けた（2026-09-25 PO判断）。

## 要求の粒度とrelation

| requirement kind | 主語 | 固有に持つ意味 |
|---|---|---|
| `unit` | 一つの機能、component、service、actor action | その対象だけで成立する入力、出力、状態、制約、failure、acceptance |
| `connection` | 二つ以上の対象間の接続 | producer／consumer、方向、protocol、順序、data意味、整合性、timeout、再送、部分失敗、復旧 |
| `composite` | 複数の単体・接続から構成する製品、system、subsystem | 構成集合、全体価値、end-to-end behavior、全体制約、境界、統合acceptance |

一つの要求へ複数粒度を詰め込まない。共通の要求identityから`contains`、`connects`、`depends_on`、
`constrains`、`verified_by`等のrelationで結ぶ。単体要求の複製を構成体要求にせず、構成体固有の性質が無い場合も
「子の成立で全体成立」と推定せず、非適用理由と判断者を要求する。具体enumとschemaはL3で確定する。

## ログからの強化loop

1. ユーザー指示と参照したConcept／企画L1 revisionを固定する。
2. Python coreが要求候補と不確実性、質問、差分を出す。
3. 人間の訂正・採否と後続工程で判明した見逃しを別eventとして記録する。
4. OSがConcept／企画L1との齟齬を確認し、原因候補をengine共通、製品固有pack、入力不足、運用誤りへ分類する。
5. 採択された改善だけをHARNESS要求・設計・検証へ戻す。
6. 同じfixtureと未見fixtureで見逃し、過剰抽出、質問量、trace欠落、訂正率を再測定する。

生ログをそのままモデル学習へ送る方式は要求として固定しない。規則、fixture、評価set、モデル改善のいずれを使うかは、
data境界と効果測定を含む下流設計で決める。

## 現在の境界

- 本候補はHARNESS-L1／L2とHELIX-OS L2への適用待ち差分であり、承認済み要求ではない。
- Python core、schema、DB登録、Worker、学習、CIはまだ実装・起動しない。
- 旧TypeScript実装や旧vendorをcurrent pathへコピーしない。behavior atomを採択後に再導出する。
- 既存の「別Requirement Engineを作らない」は維持する。単一のHARNESS要求エンジンを強化する要求である。

## 要求形成の収束と補助計測の追補候補（G11）

[HARNESS-L2-024](../L2-requirements/product-requirements.md)と[対の受入](../L11-acceptance/product-acceptance.md)を、REQENG-HARNESS-001〜004/006/007の既存能力へ適用する候補である。要求意味の別正本やengineを作らず、既存のログからの強化loopへ、次の比較条件を加える。

- 同じfixtureと未見fixtureについて、対象scope・期待する必須条件・既回答・合意・新根拠・正しい質問候補/順序の根拠・engine/pack/input revisionを固定する。未見fixtureの答えを質問選択の入力へ漏らさない。
- 質問量は発行した意味上の質問件数と、既回答の重複、未回答open itemの再掲、新しい根拠による再質問を分ける。単に文章を一問へ詰め込んだり、必要な質問を省いて件数だけ減らす改善を認めない。表示回数と意味上の質問数を区別する。
- 訂正率は、評価対象の候補・質問・意味差分のどの集合を分母としたか、実際に人が訂正した項目と原因を示す。分母なし、訂正が未観測、判断待ちの状態を率0へ変換しない。質問回避で訂正の機会をなくした結果は改善扱いしない。
- 見逃し、過剰抽出、trace欠落、必須判断の残り、誤った合意再開も同じscopeで照合する。質問量・訂正率の低下だけでHARNESS-L2-024の収束条件の欠落を相殺しない。既存loopの採択された改善だけを戻す境界を維持する。
- 比較は同じ入力条件・期待結果と対応付け、違いがあれば比較不能または範囲限定とする。固定質問回数・固定反復数・根拠のない合格閾値を導入しない。初回で履歴が少ないことと、既回答/合意の記録が欠落していることを区別する。

正常例は、既回答actorを再質問せず、必要な高影響の未決事項を先に示し、残る人間判断を表示した結果を、元fixtureと未見fixtureで同じ観点から評価できること。反例は、必要質問を出さず件数を改善とする、訂正未観測を訂正率0とする、fixtureの正解を入力へ漏らす、低い訂正率だけで未解決の必須判断を閉じること。この追補は測定・再測定の要求候補であり、未構築engineの実測値や実行済みを主張しない。
