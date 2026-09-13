---
title: "Concept v4から導くHELIX L2要求"
canonical_vmodel: L1-L12
canonical_layer: L2
canonical_pair: L11
layer: L2
kind: design
status: draft
freeze_blocking: true
created: 2026-09-14
updated: 2026-09-14
pair_artifact: docs/test-design/helix/L11-concept-v4-derived-requirements.md
---

# Concept v4から導くHELIX L2要求

本書は最新の上位概念から利用者要求を具体化した、対象別移管のための混在要求整理案である。
最新のPO指示に従い、要求の所属先はHARNESS／HELIX-OS／個別プロダクトへ分離する。本書をそれらの共通要求正本として再固定しない。
最新の親候補は[Concept v4.1](../../../governance/candidates/helix-concept-v4.1.md)であり、出典要求は
[HCV4-BR-001..006](../../../governance/candidates/helix-concept-v4-requests.md)。
v4.0候補承認の対象revisionは[PLAN-L3-84](../../../plans/PLAN-L3-84-helix-concept-v4-upgrade.md)に記録されているが、
製品境界を改訂したv4.1は人間承認待ちである。本書の具体化とL11条件もdraftであり、v4.0の候補承認を
v4.1、対象別L2、L11の合意へ転用しない。
既存Requirement IRの置換・追加は未実施である。

## 要求対象別の移管対応

移管先は[HARNESS L2](../../harness/L2-requirements/product-requirements.md)と
[HELIX-OS L2](../../helix-os/L2-requirements/governance-requirements.md)。以下は意味の分割先を示す。
詳細条件・反例の全件移管を証明する表ではなく、下記の具体条件は照合が終わるまで本書から削除しない。

| 混在要求 | HARNESSが定義する条件 | HELIX-OSが実行・管理する条件 |
|---|---|---|
| HCV4-L2-001 | HARNESS-L2-003：必要な合意と対象revision、進行条件 | HELIXOS-L2-001／003：要求・判断の出典、適用範囲、変更の管理 |
| HCV4-L2-002 | HARNESS-L2-004：要求・設計・検証のtrace条件 | HELIXOS-L2-002／007：owner・作業・成果・提供・運用の追跡と証拠保存 |
| HCV4-L2-003 | HARNESS-L2-003／005：完了判定・検証独立性・証拠有効性の条件 | HELIXOS-L2-004／007／008：独立reviewの割当、実検証・証拠回収・CI運転 |
| HCV4-L2-004 | HARNESS-L2-003／005：再開時にも維持する工程・証拠条件 | HELIXOS-L2-004／009：runtime交代、assignment・lease・予算・作業状態の継続 |
| HCV4-L2-005 | HARNESS-L2-006：提供機能・構成版・依存・外部利用の成立条件 | HELIXOS-L2-006：管理対象への導入・更新・復旧の実行と結果管理 |
| HCV4-L2-006 | HARNESS-L2-003／004：要求変更時の再合意・差戻し・再検証条件 | HELIXOS-L2-005：観測・改善候補・採否・変更・効果確認の循環 |

[HELIX-Web](../../helix-web/README.md)固有の利用者要求はWeb側へ置く。上記6要求をWeb機能の網羅分母にせず、
OSがWebを管理するという関係と、Webが利用者に提供する機能を分ける。

## 利用者要求と利用場面

主な利用者は開発をAIへ委譲する本人であり、要求決定・受入・運用で役割を切り替える。
provider名、旧画面15件、旧51 FRを製品全体の固定構成にしない。

| L2要求ID | 出典 | 利用者ができるべきこと | 合意で確認する利用場面 |
|---|---|---|---|
| HCV4-L2-001 | HCV4-BR-001 | 自分の要求、選択、承認、決定、採否を区別し、対象・範囲・版を確認して意思を示せる。相談や叱責を承認として実行されない | 要求を修正し、変更対象と既存承認への影響を確認する。未承認変更と承認範囲外の操作が止まる理由を把握する |
| HCV4-L2-002 | HCV4-BR-002 | 変更の要求から担当責務、作業、成果、検証、配布、運用まで辿り、欠落・競合・停滞を把握できる | 一つの変更から責務ownerと証拠へ移動し、担当未決定や追跡切れを未解決として確認する |
| HCV4-L2-003 | HCV4-BR-003 | 完了主張について対象版、実際の成果、実行検証、反例、独立reviewを確認できる。未実施・不一致・期限切れを合格と誤認しない | AIが完了と報告した変更で、未実行oracleや別HEADのreviewを見つけ、再検証へ戻す |
| HCV4-L2-004 | HCV4-BR-004 | provider・model・IDE・runtimeが変わっても、同じ要求・承認・責務と作業状態を維持して再開できる | runtime交代後に対象要求・assignment・HEAD・lease・予算を確認し、未解決の場合は安全に停止していることを把握する |
| HCV4-L2-005 | HCV4-BR-005 | 適格性を確認した機能単位を組み合わせ、導入・更新・復旧できる。提供済みと未提供、releaseとdeploymentを区別できる | preview機能の混入を確認し、同一artifactで導入・更新・rollbackを辿る。release成功だけで運用成功と表示されないことを確認する |
| HCV4-L2-006 | HCV4-BR-006 | 開発・運用の観測を根拠付き改善候補として確認し、要求への影響と採否を判断できる。学習結果が承認なく要求や規則を変更しない | 反復障害から改善候補を確認し、影響要求・再合意・再凍結・検証へ辿る。候補の棄却・保留も理由とともに残す |

## 共通統制とプロダクト別開発方式の分離

2026-09-14のPO指摘「統制機構とプロダクトで変化する開発機構が1つになっている」を
要求整備の入力として記録する。以下はHCV4-L2-001／002／003／004／006の具体化案であり、
既存Concept v4の承認記録に含まれていた条件と偽らない。

| 区分 | 責務 | 変更時の条件 |
|---|---|---|
| HARNESSの工程規則 | 層とV-pair、必要な合意、変更影響、独立検証、証拠と完了判定の条件 | 規則の変更をHARNESS自身の要求変更として管理し、利用プロダクトに適用する版を追跡する |
| HELIX-OSの共通統制 | プロジェクトごとの要求正本とrevision、責務owner、規則の適用、実行・証拠回収・進行制御 | HARNESSの条件を参照して運用する。統制自体の変更にも必要な判断・検証を伴わせる |
| プロダクト別の開発方式 | 対象に適したdevelopment style、作業分割、設計方式、言語・framework・tool、具体的な実装・テスト手順 | 共通統制が認める選択肢と委任scope内で選ぶ。L3の選択revisionと対応する検証方法を保持し、方式変更時に影響範囲を再評価する |
| HELIX自身の実装 | Python semantic core、TypeScript／Node transactional boundary、CLI・hook・DB等の実装責務 | ADR-009／010をHELIX実装へ適用する。管理対象プロダクトの言語やarchitectureまで同じ構成へ強制する根拠にしない |
| HELIXの操作画面 | HELIXの要求確認・作業監視・証跡確認を支援するUI | 旧15画面や特定レイアウトを、管理対象プロダクトのUI要求や共通の完了条件へ転用しない |

利用者は「何が共通で必須か」「何をこのプロダクトで選択したか」「変更するとどの要求・検証に影響するか」を
区別して確認できる。共通統制は永久不変という意味ではなく、プロダクト固有の手段選択とは異なる責務で変更管理する。
具体的なテストコマンドが変わっても、検証対象の要求・受入条件・証拠への対応を失わない。
非UI案件も要求形成・適用性判定を省略しない。UIのread-only制約をCLIの委任済み自動実行禁止へ転用しない。

この分離は要件v1.3の3 development style同格規律、canonical L1–L12、ADR-009／010と照合する。
新規schema、registry、実行engineの分割方法は本L2案だけで確定せず、L3以降の設計対象とする。

## L3への対応案

[v4 L3候補](../../../governance/candidates/helix-concept-v4-requirements.md)の18要件との意味対応を示す。
これはIDのadmission、L3凍結、実装完了の記録ではない。複数要求に関係する要件は重複参照する。

| L2要求 | L3候補 |
|---|---|
| HCV4-L2-001 | HCV4-FR-001／002／007 |
| HCV4-L2-002 | HCV4-FR-002／003／007／017 |
| HCV4-L2-003 | HCV4-FR-005／006／007／014／015 |
| HCV4-L2-004 | HCV4-FR-004／008／009／014 |
| HCV4-L2-005 | HCV4-FR-010／011／017／018 |
| HCV4-L2-006 | HCV4-FR-012／013／015／016 |

## 既存柱要求との統合境界

[柱要求](../L1-requirements/pillar-requirements.md)の13 IDを次に対応づける。
「対応する」は旧条件をすべて充足したという意味ではない。個別条件・追補・数値は出典に保持し、
本書の抽象的な6要求で上書き・削除しない。変更が必要な意味は別revisionとして扱う。

| 既存要求 | v4 L2との対応 | 継承・置換する条件 |
|---|---|---|
| HBR-P0 | HCV4-L2-004／006 | 逸脱受け止め・停止・再開を継承。要件v1.3に従い、Forward一律収束を選択済みdevelopment styleへの返却へ置換する |
| HBR-P1 | HCV4-L2-004／005 | 承認後の連続自律走行、二重claim防止、停止予算、fresh session、今版外作業の保全を継承。provider交代だけで自律走行全体を被覆したとしない |
| HBR-P2 | HCV4-L2-003／004 | bounded loop、worker／verifier分離、tool契約、effort制御、runtime parityを継承。内部subagentを独立authorityへ昇格しないv4条件との差を検証する |
| HBR-P3 | HCV4-L2-003 | 正規V-pair、片肺拒否、機械検証と意味review、外部根拠照合を継承。機械greenだけで独立reviewを代替しない |
| HBR-P4 | HCV4-L2-006 | 検出・修復候補・再発防止・劣化計測を継承。学習結果のgate／Policyへの直接昇格は、候補・採否・必要な承認・再検証を経る形へ改める |
| HBR-P6 | HCV4-L2-003／005 | PR／CIの自走、配布、非破壊setup、更新・rollbackを継承。構成単位の適格性とrelease／deploymentの分離を追加し、GitHubを意味正本にしない |
| HBR-P7 | HCV4-L2-002／004／006 | runtimeを越えた必要情報の共有、出典への到達、Glossary整合を継承。旧memory中心の長期知識・continuationとv4のbounded連絡／pointerへの限定は未統合の意味差分であり、既存記録を削除して解決しない |
| HBR-P8 | HCV4-L2-003／006 | 外部根拠の照合と有用知見の再利用を継承。外部取得内容から直接命令・規則を作らず、根拠・採否・適用範囲を持つ候補へ分離する |
| HBR-P9 | HCV4-L2-002／003 | trace・影響分析・投影収束を継承。DB未収束を未完了と扱う条件を、DBが意味正本であるという解釈へ拡張しない |
| HNFR-P3 | HCV4-L2-003 | 実証跡、反例、独立検証の厳格性を継承。対象identity・HEAD・generation・有効性が一致する証拠で判断する |
| HNFR-P5 | HCV4-L2-004 | bounded context、原証跡pointer、durable event、冪等再開、検証負荷予算を継承。作業会話の全保存・継続を製品成立条件にしない |
| HNFR-P8 | HCV4-L2-001／004／005 | secret保護・信頼境界・高影響操作のaction-binding承認を継承。要求承認と個別操作の許可を分離する |
| HNFR-AC | HCV4-L2-002／004 | runtime間の同一規則と必要情報への到達を継承。全agentが同じ作業contextを持つことと、同じauthority revisionを参照することを区別する |

柱要求§2.6のruntime parity、§2.7の配布／setup、§2.8の可視化は上表の該当要求へ含めて照合する。
特に自律走行のresume条件・claim・停止・再開、外部検証、配布の導入成功、可視化の実操作は、
L3候補18件へのID対応だけで受入条件が揃ったとしない。

## memory責務変更の移管先

HMC-BR-001..006の具体条件は[HELIX-OS L2](../../helix-os/L2-requirements/governance-requirements.md)の
「有期限通知とmemoryの責務」へ移管した。通知・正本再取得・長期知識との分離・誤った権威化の防止・再送と失効・provider独立性をOSが所有する。
候補の採用状態と旧memory要求との差は移管先で保持し、IR・runtimeへの昇格済みとは扱わない。

## 提供・再編要求の移管先

FRS9件と提供構成追補の運用・管理条件は[HELIX-OS L2](../../helix-os/L2-requirements/governance-requirements.md)へ、
提供物の成立・検証条件は[HARNESS L2](../../harness/L2-requirements/product-requirements.md)へ分離した。
原文の候補承認と正本昇格・IR admission・公開操作は別であり、本移管をそれらの成立証拠にしない。

## 要求形成・人間反応の移管先

AVS6件・RFA3件・DGH3件の判断記録・反復管理は[HELIX-OS L2](../../helix-os/L2-requirements/governance-requirements.md)へ、
合意・差戻し・検証の工程条件は[HARNESS L2](../../harness/L2-requirements/product-requirements.md)へ分離した。
候補の採用状態と非対象は移管先で保持し、対象別の合意取得済みとは扱わない。

## 監査・学習・成果の出所に関する移管先

AAFD4件・RCLS6件・PPS4件の具体条件は[HELIX-OS L2](../../helix-os/L2-requirements/governance-requirements.md)の
「監査・学習・成果の出所に関する候補条件」へ移管した。候補の採用状態、出典、非対象も移管先で保持する。

## 合意・適用性・受入の状態

会話継続のCLR-R01..08は[HELIX-OS L2](../../helix-os/L2-requirements/governance-requirements.md)の
「会話継続と外部状態からの再構成」へ移管した。未承認候補である状態を保持する。

6要求すべてについて本revisionの利用者合意・プロトrevision・L11実行証拠は未登録である。
実際の画面構成・操作導線は要求を引き出すプロトで検討し、上表から画面数や実装方式を固定しない。
CLI等で画面非適用とする範囲も、要件v1.3 §3に従い理由・判定者・対象HEAD・要求への影響・再評価条件を記録する。
画面非適用と要求の省略は同義ではない。

要求を変更した場合は要求revision、プロトrevision、合意者、判断記録を対応づけ、影響するL3とL11へ伝播する。
GitHub IssueやDB投影の存在・close・件数はこの合意を代替しない。
全HELIX要求の集合は既存要求・追加候補・追補との照合で確定する。本書の6件を全体の分母にしない。
