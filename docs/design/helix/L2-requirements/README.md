# HELIX L2要求の読取り入口

## 要求対象別の入口

2026-09-14のPO指示に従い、要求の対象をフォルダで分離する。

- [HARNESSの利用要求](../../harness/L2-requirements/product-requirements.md)：Vモデル、層・pair、工程・検証条件を規定する提供プロダクト。
- [HELIX-OSの統制要求](../../helix-os/L2-requirements/governance-requirements.md)：管理・統制、Worker、学習、ログ、CI、継続・復旧。

- [HELIX-Webの要求整理入口](../../helix-web/README.md)：Vision2で示された、HELIX-OSが管理する個別プロダクト。Web固有要求はこの対象へ分離する。

HARNESSとHELIX-OSにL2／L11の対を設けた。HELIX-WebにはVision由来8件のL2／L11案を追加した。
現時点は混在要求からの分離案であり、全条件の採択・新規IDのIR登録は適用待ちである。
候補系列の対象と接続状態は[対象別台帳](../../../governance/audits/l2-requirements/candidate-source-target-inventory.md)を参照する。
以下の既存`helix/`一覧は移管元の監査入口として使い、HARNESSとHELIX-OSを一つの要求集合として再固定しない。

### 詳細条件の移管状況

以下は本作業で具体化した条件の配置であり、HELIX全要求の網羅分母や承認状況を件数で表すものではない。

| 条件群 | 現在の配置 | 残る確認 |
|---|---|---|
| HARNESSの提供・工程要求6件 | HARNESS L2／L11 | 詳細出典との全件照合、対象別L3接続、IR移管 |
| HELIX-OSの統制要求9件 | HELIX-OS L2／L11 | 既存運用要求・追補の全件照合、対象別L3接続、IR移管 |
| HMC6件 | HELIX-OS L2／L11 | 候補の独立検収・正本昇格、旧memory要求との差分統合 |
| AAFD4件・RCLS6件・PPS4件 | HELIX-OS L2／L11 | draft候補の採否・採用revision、L3との接続 |
| CLR詳細8件 | HELIX-OS L2／L11 | 未承認候補の採否・採用revision、既存継続機構との接続 |
| FRS9件・提供構成の追補 | HARNESSの提供条件とOSの構成・配布運用へ分割 | 対象別L3接続、詳細受入との照合、正本昇格・IR移管 |
| AVS6件・RFA3件・DGH3件 | HARNESSの工程条件とOSの判断・反復管理へ分割 | 候補状態の確認、対象別L3接続、詳細受入との全件照合 |
| HELIX-Web | Vision由来8件のL2／L11案 | 個別採択・プロト合意・L3接続、将来の動的計画・納品契約の詳細化 |

対象別L11はいずれも未実行。旧候補の承認記録を新しい対象別要求の合意として転用しない。

### 既存柱要求の対象別対応

同じ旧IDの中でも、工程条件の定義はHARNESS、実行・記録・運用はHELIX-OSへ分ける。
以下は帰属と移管先の案であり、詳細条件を移管済みとする証拠ではない。

| 旧要求 | HARNESS側の条件と移管先 | HELIX-OS側の条件と移管先 |
|---|---|---|
| HBR-P0 | 選択styleへの復帰条件：HARNESS-L2-002／003 | 障害検出・停止・復旧実行：HELIXOS-L2-009 |
| HBR-P1 | 工程選択と凍結後の進行条件：HARNESS-L2-002／003 | queue・連続実行・予算・再開：HELIXOS-L2-004／009 |
| HBR-P2 | 検証独立性など工程が要求する条件：HARNESS-L2-003／005 | Worker割当・loop・tool契約・runtime parity：HELIXOS-L2-004／009 |
| HBR-P3 | pair・検証・完了条件：HARNESS-L2-001／003／004／005 | 検証実行・証拠回収・進行制御：HELIXOS-L2-002／007／008 |
| HBR-P4 | 改善で要求が変わる場合の差戻し条件：HARNESS-L2-003／004 | 監視・修復・学習・改善還流：HELIXOS-L2-005／009 |
| HBR-P6 | 検証・公開前の工程条件と外部利用の成立条件：HARNESS-L2-003／005／006 | GitHub・CI運転、配布・setup・更新：HELIXOS-L2-006／008 |
| HBR-P7 | 工程規則の新規所有は追加しない | memory・継続情報・知識と出典：HELIXOS-L2-005／007／009 |
| HBR-P8 | 根拠照合を必要とする検証条件：HARNESS-L2-005 | 外部検索・知見取込み・適用管理：HELIXOS-L2-005 |
| HBR-P9 | 必須traceと完了条件：HARNESS-L2-003／004 | DB投影・横断追跡・表示・整合監視：HELIXOS-L2-001／002／007 |
| HNFR-P3 | 証拠・反例・独立検証の基準：HARNESS-L2-003／005 | 証拠収集と実際の独立review運用：HELIXOS-L2-004／007／008 |
| HNFR-P5 | 工程規則の新規所有は追加しない | context予算・durable記録・冪等再開：HELIXOS-L2-004／007／009 |
| HNFR-P8 | 工程上の必要な人間判断の境界：HARNESS-L2-003 | secret保護・sandbox・外部操作の許可確認：HELIXOS-L2-004／006／009 |
| HNFR-AC | 適用する工程規則の版：HARNESS-L2-005 | runtime間の規則適用・必要情報共有：HELIXOS-L2-003／004／007 |

OSが参照する工程規則はHARNESSの版へ結びつける。OS側で同じ規則本文を独立更新しない。
逆にHARNESSの工程条件へ特定Worker、ログ保存先、CI実装を埋め込んでOS実装を二重所有しない。

本書は要求文書の案内であり、新しい要求正本や承認記録ではない。
canonical工程はL1企画、L2要求＋画面プロト、L3要件定義・凍結である。
要求の意味はリポジトリ内の文書・正本JSONと承認revisionから確認する。GitHub Issue、PR、Projectの
存在・本文・状態を要求の必要性、承認、充足の正本にしない。

## 最新要求へ整備する基準

最新の要求へ更新することを本整備の目的とする。旧文書の記述を保存すること自体を完了条件にしない。
2026-09-14に`git fetch origin main`で確認した最新mainは`6fabd1251`で、監査基準commitと一致した。
mainへの収載だけで要求承認を判断せず、リポジトリ内の改訂・承認・supersessionを照合する。

- 上位概念は[Concept v4候補](../../../governance/candidates/helix-concept-v4.0.md)とその承認対象を確認する。旧v3.1を新要求の基準へ戻さない。
- 要件正本は[requirements v1.3](../../../governance/helix-harness-requirements_v1.3.md)、層はL1-L12 directive、実装責務はADR-009／010を基準にする。
- JSON移管済み範囲は現行Requirement IRを読み、後続の要求候補・追補との差を確認する。承認済みの新定義を旧本文に合わせて後退させない。
- 新しい要求の文書化、候補承認、canonicalへの昇格、runtimeへの適用は別に記録する。新しい候補を未確認のまま現行採用済みと表示しない。

以下の旧文書の照合は要求を失わず置換するために行う。旧層名を直しただけで最新化済みとはしない。

## L2に対応する既存文書

最新Conceptからの具体化は[Concept v4由来L2要求](concept-v4-derived-requirements.md)を参照する。
6つの上位要求を利用場面へ具体化し、L3候補18件とL11受入案6件への対応を示した。
新しいL2合意を取得済みとはせず、draft・freeze_blockingで保持する。既存要求の置換・全体網羅は照合中である。

物理directoryの`L1-requirements`は意味上の層を保証しない。以下はmetadataに
`canonical_layer: L2`があるHELIX側の文書である。

| 文書 | 現在の宣言と注意点 |
| --- | --- |
| [柱要求](../L1-requirements/pillar-requirements.md) | L2／L11、confirmed。HBR9件・HNFR4件。現行分類・意味コア・要求正本の境界を訂正。旧承認記録と対文書の検証基準は現行L11受入の証拠にできない |
| [Infinity Loop要求](../L1-requirements/infinity-loop-platform-requirements.md) | L2／L11、compatibility_read_only。153要求の移管元であり、現行の機械意味正本ではない |
| [REBASELINE是正差分](../L1-requirements/hybrid-rebaseline-v0.5.0-remediation-delta.md) | L2／L11、proposed。全文確認し表題・template検査・errata是正案の矛盾を訂正。59所見の過去評価と現行要求への採用を分離。個別の採否・移管は照合継続中 |

Infinity Loopの現行機械意味正本は[authority設定](../../../../config/requirement-ir-authority.json)が指す
[Requirement IR manifest](../../../../requirements-ir/manifest.json)である。
[requirements shard](../../../../requirements-ir/requirements.json)の153件はすべてInfinity Loop文書からの移管であり、
HELIX全要求の網羅分母ではない。追加のrefinement shard、他要求文書、要求候補との照合が必要である。

153要求は契約・受入条件・テストIDの参照先が存在するが、全件に`pending_resolution`があり、
利用者・操作・画面の対応欄は空である。24件のsystem testも`designed_not_implemented`である。
JSONへの収載や`definition_status: frozen`を、L2合意・L11受入まで済んだ意味で読まない。
L1/L2の反映先やDiscovery／PoCの分類に残るJSON内の不整合は監査記録に記載している。

業務要求33件の本文を対象別に照合した結果は[Infinity Loop業務要求の対象別対応](../../../governance/audits/l2-requirements/infinity-business-target-crosswalk.md)を参照する。
旧HARNESS所有agent、memoryへの永続知識昇格等の意味変更対象を明示した。
[NFR40件・TR11件の対応](../../../governance/audits/l2-requirements/infinity-quality-constraint-crosswalk.md)では、工程・運用品質とHELIX実装制約を分離した。[FR69件の対応](../../../governance/audits/l2-requirements/infinity-functional-target-crosswalk.md)も含め、3表で153 IDの過不足・重複なしを確認した。
本文読取りと対象判断までの証拠であり、JSON本体への是正、詳細契約・受入の被覆確認は未実施。

L2の反映先と凍結境界の矛盾は[JSON是正差分](../../../governance/audits/l2-requirements/l2-freeze-ir-correction.md)に変更案・関連7レコード・更新条件を記録した。

## 同じdirectoryにあるL1企画の文書

以下は現在のmetadataでL1／L12として扱われている。ファイル名に`requests`があることを理由に
L2監査済みへ算入しない。一方、本文に具体要求が混在しているものはL2への接続欠落を調べる。

- [常駐レーン](../L1-requirements/resident-lane-orchestration-requests.md)
- [三社レーン](../L1-requirements/three-lane-cloud-governance-requests.md)
- [Skill移行](../L1-requirements/skill-mechanism-migration-requests.md)
- [定型生成](../L1-requirements/bugbot-generation-requests.md)
- [文書監査](../L1-requirements/document-authority-census-requests.md)

これらのL1／L12宣言を、L2要求の全件定義・合意・L11受入が成立した証拠にはしない。
承認済み本文とpairを一括改名してL2へ移すことも、意味・受入の照合前には行わない。

[refinement shard](../../../../requirements-ir/refinement_contracts.json)には、三社レーンの
`3L-FR-001..008`が`frozen`として収載され、3L-R-01..25と3L-AC-001..027を保持している。
常駐レーンの`RLO-FR-001`は追加4要件RLO-FR-037..040だけを保持し、状態は`specified`、`approval`はnullである。
いずれもL1文書全体の要求・L2合意を収載したことにはならない。本文の古い「IR admission待ち」だけで現状を判定しない。

同shardにはMIC（管理・統合セル）、CNW（native worker）、DIST-LITE（配布）、SYN（合成）、OPS（運用）の
5契約も収載されている。14契約全体で78要件ID・100受入IDを持つが、集約要件と詳細要件の重なりがある。
153要求との単純合算をHELIX全要求数にしない。上記5契約とRLOの状態は`specified`で、JSONの承認欄はnullである。
MIC-R-07のとおりGitHubは計画・作業状態の投影先であり、要求意味の正本ではない。
[追補14契約の対象別対応](../../../governance/audits/l2-requirements/refinement-target-crosswalk.md)に、契約状態・ID件数・帰属と未確認境界を記録した。

## 画面・候補・旧資料

`docs/design/`と`docs/governance/candidates/`を対象に、`canonical_layer: L2`または
`candidate_layer: L2`を対象別L2追加後に再検索した結果は21文書である。これはmetadataによる発見集合であり、
別層の文書に混在する要求やmetadataを持たないintakeを含む全要求の分母ではない。
内訳は旧harness要求5文書、旧harness screen7文書、HELIX側の既存要求3文書、
本整備のv4由来L2案、HELIX画面境界、Execution Ticket候補、HARNESS L2、HELIX-OS L2、HELIX-Web L2である。

旧harness screenの`README.md`は全文確認し、現行で採用しないL2 carry／旧pair／逆伝播規則を
[画面境界](../L2-screen/screen-mock-boundary.md)へ記録した。
`screen-list.md`と`screen-detail.md`も全文確認し、15画面の対応、必須schemaと詳細matrixの粒度差、
旧層・分類表示、状態保持・欠落・描画・実行境界の移管確認を画面境界へ記録した。
`business-flow.md`、`screen-flow.md`、`ui-element.md`、`wireframe.md`も全文確認した。
旧screen7文書の本文読取りは完了したが、業務・遷移の接続欠落、旧分類、個別モック未確認8画面等の
移管条件は[画面境界](../L2-screen/screen-mock-boundary.md)に残る。読取り完了を移管・合意・受入完了としない。

- [画面境界](../L2-screen/screen-mock-boundary.md)と対文書はL2／L11の整備案へ改訂した。
  draftであり、要求・プロト合意と実操作受入の証拠は未確認。旧confirmedを引き継がず、対文書のcanonical再利用禁止も維持する。
- [要求発見契約](../L3-requirements/requirement-discovery-json-authority.md)はL2の質問・回答・prototype・
  agreementとL3 JSON凍結を分けている。これは要求を整理する仕組みの契約であり、HELIXの全L2要求本文ではない。
- `docs/governance/candidates/`の要求候補も監査対象に含める。候補と現行要求を合算して承認済みと扱わない。
  [Execution Ticket要求候補](../../../governance/candidates/execution-ticket-requests.md)は明示的にL2／L11であり、
  [受入候補](../../../governance/candidates/execution-ticket-validation.md)に7要求の対応がある。これは合意・受入の実施証拠ではない。
  非UIの要求についても適用範囲と理由・再評価条件を持つN/A記録を確認し、画面がないことだけを理由に要求を監査対象から落とさない。
- `docs/design/harness/L1-requirements/`と`L2-screen/`は移管元のcompatibility資料である。
  [governance境界](../../../governance/README.md)に従い、旧資料を新しい要求の判断正本へ戻さない。

## Issue登録との区別

### 要求を起点にした更新・照合手順

層分けはファイルを分類するだけでなく、要求の変更を下流へ漏れなく渡し、検証結果を元の要求へ戻すために使う。
以下は本整備で用いる確認手順であり、新しいDBや別の要求正本を追加するものではない。

| 確認対象 | 確認する内容 | 欠けている場合の扱い |
|---|---|---|
| 上位概念・L1企画 | 目的、対象、非対象、適用する決定revision | 根拠未確認。Issueの説明から上位判断を推定しない |
| L2要求 | 要求ID、本文、出典、採否、合意revision、利用者・操作・期待結果、プロトまたは非UI適用性 | 未定義・未採択・未合意を区別し、下流の実装済み状態で補わない |
| L3要件 | 親L2要求と同じrevisionを具体化するFR／NFR／AC、制約、未解決事項 | 未接続・旧revisionを明示し、要求が落ちたまま凍結しない |
| L11受入 | 親L2の利用条件を検証するシナリオ、期待結果、対象revision、実行証拠 | 設計済みと受入済みを区別する。L10総合テストやCIの成功だけで充足しない |
| PLAN・GitHub作業管理 | 対象要求revision、担当責務、残作業、実装・検証証拠への参照 | 作業未接続として扱う。Issue未登録を要求不要、Issue closeを要求充足とみなさない |

1. 要求集合はローカルの指定文書・JSON・追補・候補から列挙する。Issue一覧を分母にしない。
2. 各要求の維持・変更・置換・不採用を、出典と対象revisionの判断記録から確認する。未判断を削除しない。
3. 要求変更時は、影響するL3・L11・実装・PLAN・作業参照を洗い出す。無関係な要求まで失効させない。
4. 各参照のrevision一致と未接続項目を確認し、指定JSON・生成view・DB projectionを正規経路で整合させる。
5. 完了は要求ごとの未充足条件と検証証拠で判断する。文書数・Issue数・登録件数・close率で置き換えない。

旧資料を廃止する前に、残す条件の移管先、不採用の理由、未判断項目、参照元への影響を確認する。
この対応が未確定の段階では、大規模削除やIssue一括closeの判断材料は揃っていない。

153要求の`downstream_obligation.route_issue_ids`は11件が非空、142件が空である
（main `6fabd1251`、2026-09-14の読取り）。空配列からGitHub未登録や作業不要を推定しない。
また、非空でもIssue本文・要求revision・残義務の一致が確認されたことにはならない。
全要求から作業管理への対応は、要求集合を確定してから別に照合する。

本入口の作成は全要求の監査完了を意味しない。要求候補21文書と旧harness要求5文書は本文を確認したが、
他の名称のintake、未移管要求、L2合意証拠、全要求のL3／L11接続は確認中である。

別名の[投資候補intake](../../../governance/candidates/development-investment-stage-directives-intake_v1.0.md)と
[Concept・Vision・提供構成](../../../governance/candidates/concept-vision-release-crosswalk.md)も照合対象に含む。
INV72候補・PKG13候補は新しい全要求数ではなく、採否と既存要求への対応を要する入力である。

確認範囲と未解決事項は[要求文書監査記録](../../../governance/l2-requirements-source-audit-2026-09-14.md)に記録する。
