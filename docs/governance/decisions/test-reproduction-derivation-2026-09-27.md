---
title: "G18 テスト・再現ケース生成候補の導出記録"
record_id: HDEC-G18-TEST-REPRO-DERIVATION-2026-09-27
status: candidate_derivation_record
authority_effect: none
recorded_at: 2026-09-27
---

# G18 テスト・再現ケース生成候補の導出記録

## 記録の範囲

本記録は、POが示した第4項の能力範囲を、既存HARNESSの設計・検証契約と旧HELIXの該当sourceに照合し、HARNESS-L2-030〜033の未採択候補と対応L11受入候補へ分けた導出記録である。G18の採択、L2合意、L3承認、実装・実行許可、v0.1収載、CI合格、個別成果物のAcceptedを生成しない。候補番号、version_target、本文案が存在することもこれらのauthorityを生まない。

[PO原文snapshot](../../helix-harness/sources/capability-reinforcement-po-original-2026-09-27.md)はhandoff全体をbyte一致で保持する。SHA-256は `ab8bb6ae8cd418053d6baaafccaa80ee8ef2e715caab1576e5a00c306e97d1f8`（7,151 bytes）。1〜4行はClaudeの前書き、6行目は区切りで、8行目以降がPOの会話入力である。第4項は同snapshotの36〜42行。

## PO第4項から候補への対応

POは、API・状態遷移定義から正常、境界、権限違反、取消、順序違反のケースとデータを作ること、外部サービスの代用品を作ること、障害時はログ・入力から小さな再現ケースを作り修正後の回帰testにすることを求める。仕事は人がtest/repro手順を作る作業の代行であり、検査基準の追加やCI運転の追加ではない。

| PO第4項の条件 | 候補の行き先 | 所有する処理と境界 |
|---|---|---|
| API/state定義から正常・境界・権限・取消・順序違反のscenario/case/dataを作る | `HARNESS-L2-030` | 入力された承認済み仕様、HARNESS-L2-014の対設計、HARNESS-L2-022のoracleをcase/fixture候補へ写す。期待値・権限意味・暗黙制約を発明しない。 |
| 外部サービス代用品を作る | `HARNESS-L2-030` | 選択された外部契約の範囲でdouble候補を生成する。生きた外部serviceを呼ばず、応答・呼出し数・副作用条件は契約に根拠がある範囲で表現する。 |
| 障害のログ・入力から小さな再現ケースを作る | `HARNESS-L2-031` | 許可されたbounded/sanitized inputを段階的に縮小し、同じ独立oracle failureを保つか確認する。再現不能・環境不足・root cause unknownはそのまま残す。 |
| 修正後も使う回帰testにする | `HARNESS-L2-031`、段階traceが必要なとき`HARNESS-L2-033` | 元failure、縮小repro、修正前fail、修正後revisionでのpassを同じoracleと別々のrun receiptへ結ぶ。修正後passは候補作成の開始条件ではなく後続結果である。 |
| 生成testを選択したexecutorで扱う | `HARNESS-L2-032` | artifact identity、source/version、oracle参照、target revision/scopeをOS-L2-020または利用者CIの宣言schemaに沿ったpacketへ接続する。接続は実行やpassを意味しない。 |
| 複数段階の作成・受渡しを一つの業務traceで確認する | `HARNESS-L2-033` | 030/031と、選択した場合の032を構成し、unit、reproduction、execution、regressionの別状態を保持する。各unitの合格を033固有の成立と同一視しない。 |

030〜033は検証対象case/artifactを作成・追跡する能力である。HARNESS-L2-014の設計authority、HARNESS-L2-022のoracle・検証義務・stage/受入契約、OS-L2-020または利用者CIの実行・隔離・結果回収を移譲しない。HARNESS-L2-010/011の既存pack境界とcall/input/scope/compatibility/receipt契約を使い、それらを重複所有しない。

## 旧HELIX source、保持点と変更点

| Asset ID・旧source | SHA-256 | G18で保持する内容 | 現行候補で変える／持ち込まない内容 |
|---|---|---|---|
| `LEGACY-ASSET-20C14BB23C519C65E7BD` — `archive/legacy-generation-2026-09-14/root/docs/governance/ai-dev-team-operations_v1.1.md:716-750` | `4c03ceed6fd11985158cb9dd7d3e5f455274cf74e839523b756da7f35441867d` | 本番障害・PR findingを説明可能な再現/regression testとして残し、背景と期待動作を結ぶ。既存例は空白を含むメール入力の誤拒否。 | 旧運用の「必ず」やfailure-test保持を新CI gateとして直輸入しない。generatorはtest artifact候補を作り、実行と品質判定は既存contract/executorへ委ねる。 |
| `LEGACY-ASSET-81FAB27053CEFFED01A3` — `archive/legacy-generation-2026-09-14/root/docs/archive/intake/development-investment-stage-directives-source_v1.0.md:982-1026`（INV-028/029） | `7b7d0600bccd9045aa1c11f9762886c982b38e9446197f9dcf00637116833b04` | 入力・版・seed・bounded log・commandの由来、sanitized/isolated reproduction、secret混入と外部副作用の二重化拒否。schema/state machineからの反例候補と独立oracle。 | archive intake/sourceは現行authorityでない。旧packet/schema/command、旧隔離runtime、mutation・採点方式を移植しない。 |
| `LEGACY-ASSET-EE5DBACC7F28F7D1F605` — `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md:147,152-156,174,178-184`；対の `LEGACY-ASSET-44DD86E3DEC09E65EF51` — `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md:109-113,127-139` | `7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544`；`df81469f13deb45e7da4c74d90c7f3d3b1be5f26ccf63b706e6e230bc5b4c3b6` | oracle/testを独立させ、test自身の存在・coverage-only・生成器と共有する誤りで合格を作らない。回帰fence、期待失敗、独立検証の考え方。 | 旧L3要件/acceptanceを現行L2/L11へ番号対応で移さない。固定coverage/閾値や旧TDD運用を新設しない。 |
| `LEGACY-ASSET-DA012A9B04D5BE9419CE` — `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/ci-system-synthesis-requirements.md:37-90`；対の `LEGACY-ASSET-8DE0535125B1E39C6FEA` — `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/ci-system-synthesis-acceptance.md:24-40` | `65400847881f1a72b273f0bdeff503a5ea302705cd0e71d7913fc7d0f8dd18fb`；`f5dcd1910a4eef57c66e1c2c03fffe20e5c681ed9e9d043b9e8f15a211e65d9b` | test identityを安定したIDとrevision/env/runへ結び、retry greenで元failureを消さず、省略義務を合格にしない。生成と実行planを別責務にする。 | 旧CI synthesis/runtime/loggingを実行・移植せず、新世代CIが未構築である事実を代用合格にしない。 |

旧sourceは再構築の起点とfailure/consumerの材料である。旧runtime・CLI・hook・test・CIは一切実行せず、旧source記述を現行の決定済みauthorityとして扱わない。旧資産と現行候補が異なるときは、上記保持点と変更理由を記録した。

## 現行親と責務境界

確認した親文書はcommit `28b1cca62057bdb35e63d9d233f3c22eb659db5c`のsnapshotを指す。行番号・SHA-256はこの固定commitに対するもの。後続mainの追補は登録前に照合し、下表を未固定のcurrent pinとして扱わない。

| 現行親・根拠 | 関連行 | SHA-256 | G18での使い方 |
|---|---:|---|---|
| `docs/helix-harness/L1-planning/product-intent.md` | 29-41（ID表、親接続）、57-60（HARNESS対象外/機構境界） | `238ae0590f43c10c0a59a0cea4a9907328752a81388891e1a115d4278db00e1f` | HARNESS-L1-001（V-pair trace）、004（検証義務・反例・証拠・戻し先）、005（外部利用）、007（Version 1 scope）を候補親として導出。L1はdraft_candidateであり、L2からL1の意味やauthorityを更新しない。 |
| `docs/helix-harness/L2-requirements/product-requirements.md` | 320-338（010/011/014/022の位置と親）、340-361（010/011境界・呼出し契約）、379-385（014設計責務）、447-461（022 oracle/stage/OS境界） | `ac5bca1524473dc8a61ad03d5af1956b9a34e6172dd8a83ef16c8a2be6f446f4` | 014の対設計を入力にし、022のoracle/verification/acceptance contractに従う。010/011の境界・呼出し契約を再利用する。 |
| `docs/helix-harness/L11-acceptance/product-acceptance.md` | 217（022の段階条件）、298-304（oracle、証拠、backflow） | `28a63a5a86d9067caaf4ea3940ff79b4c967c1a510f36a7b13a53ae5ae4190bd` | 単体・結合・system・利用者受入を分離し、候補の生成・run receiptで上位stageを自動成立させない。 |
| `docs/helix-os/L2-requirements/governance-requirements.md` | 692-700（HELIXOS-L2-020の入力・実行・結果回収責務） | `0540ca59582c27b6e9326e8922aed3d996eae8083b823b8cee096e0ecc6911dd` | OS-L2-020または利用者CIがtest/CI実行と結果回収を所有。032は選択executorへ渡すHARNESS契約だけを持つ。 |

親L1への接続は、候補本文に親IDと対象revisionを明記して初めて導出関係として確認できる。HARNESS-L1-005の対象revision確認は既存親文書が明示するPO境界を保つ。期待挙動・permission・oracleが上流で未決の場合、generatorは補わずHARNESS-L2-003/004の戻し先に従って意味ownerへ戻す。source/log/data-use permissionは該当security/data owner、executor schemaは選択consumer ownerへ戻す。

## 親側の確認・登録責務とauthority

候補を追跡本文へ反映する親作業では、次を確認する。

1. 反映時点のmainと対象L1/L2/L11本文revisionを読み直し、上表のline/SHAが参照時点のsourceを指すことを確かめる。
2. HARNESS-L2-030〜033 IDが最新版の台帳/registerで未使用であること、候補本文とL11のID・親・版・scope・依存区分・受入oracleが対になっていることを確認する。配置・追記後に参照、末尾LF、候補/prefix境界を静的確認し、所定のregister/pin手順があれば同じ対象revisionへ揃える。
3. 旧asset ID/path/line/SHAと保持/変更の記録が旧source本文と一致することを確認する。旧source/runtimeの実行や新しい旧規則の移植はしない。
4. L1意味の変更、期待挙動・権限・外部副作用の上流決定、採択・L3承認・実装・実行・release等を本記録や候補存在から生成しない。必要なPO/owner判断がある場合は、選択肢と影響を対象revisionへ結んで提示し、独自の承認経路を追加しない。

本記録のauthorityは`none`であり、候補起草者の整理である。PO第4項は能力範囲の根拠だが、候補ID、個別oracle、対象revisionの受入、採択をPOが本記録で承認したことにはならない。候補が存在しても実行、テストpass、Verified/Accepted、v0.1収載は成立しない。
