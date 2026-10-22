# 開発repo運用規則の機械化棚卸し

```yaml
evidence_kind: scaffold
authority_effect: none
request_id: WR-CODEX-MECHANIZATION-INVENTORY-3565-20261022-01
base_sha: 9beb5890aa11d6fffb9a623526a9c26e62f32007
```

## 範囲と読み方

Issue #3565「進め方1」の観察資料。AGENTS.md、作業入口、GitHub上流運用モデル、PR template、Feature Ticket Issue templateを対象にし、#3567固定監査のconsumer根13件から現行参照をたどった。監査snapshot自体は変更しない。Binding pinは静的参照であり、runtime実利用やconsumer closureの証明ではない。

分類列は各規則群の中心的な状態を示す。「機械強制済み」は記載した限定機能だけ、「機械化できる」は既存契約の入力・判定を機械で補助できる見立て、「判断要」はauthorityまたは意味判断が残る箇所を指す。個別の意味reviewは指定された独立review側が担う。要求・Concept等の人間authorityは現行authority modelまたは有効な委任条件に従う。機械化候補は新しいgate、義務、要求を提案しない。

## 規則群の分類

| 規則群と現行source | 分類 | 現在の機構・強制範囲 | 機械化余地（入力→判定→失敗時） | failure／旧対応キー |
|---|---|---|---|---|
| R1 対象、許可範囲、停止条件（AGENTS「現在の境界」、作業入口） | 判断要 | 作業入口とauthority modelに記述。全作業経路を機械で閉じる機構はない。 | 対象revision・class・authority記録→既決状態との参照整合→missing／unknown／staleを表示して停止状態を保つ。 | 規則由来の製品要求failureは今回範囲で未発見。旧CLAUDE「自律境界」(L82-85)。 |
| R2 失敗起点、inventory-first、旧source確認（AGENTS「再構築の原則」） | 機械化できる | 旧asset台帳と監査記録は参照先。失敗の意味分類を行う自動機構はない。 | 変更対象・旧source/asset ID・failure記録→path/digestの存在を照合→欠落を表示。failureとの意味上の対応はreviewへ返す。 | ORA-005/006、UTW-004/025。旧CLAUDE「旧 HELIX ソースリポジトリ」(L72-80)、旧前身weakness audit。 |
| R3 旧資産の再利用、差分記録、living文書と固定記録（AGENTS「再構築の原則」） | 機械化できる | git履歴と資産台帳を引けるが、保持点・変更理由の意味比較は自動化されていない。 | 現行記述・旧asset ID/path・差分記録→参照とdigestを照合→不一致を表示。意味の一致は独立reviewで確認する。 | ORA-005/006、UTW-004/025。旧repository-structure「配置ルール」。 |
| R4 authority順序、要求・層・停止境界、旧runtime不実行（AGENTS、作業入口、運用モデル） | 判断要 | `scfctl validate`はBinding schema/stateを検査。要求authorityや旧実行経路全般を検査する機構ではない。 | 対象ID/revision/state→schemaと既決記録への参照を照合→欠落/conflict/staleを表示し下流作業を進めない。 | #2564の広範囲PRでscope・層の分割が問題化。旧CLAUDE「自律境界」。旧CI/runtimeは起動しない。 |
| R5 scaffold登録、stale確認、置換・撤去（AGENTS「現在の境界」「編集と検証」、scaffold説明） | 機械強制済み（一部） | `scaffold/tools/scfctl.py`の`check_stale`はpinのstaleを検出。`check_replacement`は構造・revision対応を検査し、`cmd_retire`はreceipt/digest等の撤去条件を再検査する。意味移管の正しさは機械判定しない。 | Binding/upstream SHA→schema・path/digestを照合→staleを報告。replacement contract/receipt/revision→既存条件を検査→不一致ならretireを拒否する。 | #3566の20 Binding・32 pin追随。旧ddd-tdd-rules L31-32のconsumer=0、旧deprecation-cutover L35-37/L41のreplacement・zero-reference・rollback。 |
| R6 PRの原子性、作成と独立review、exact HEAD（運用モデル「PRの原子性」「作成側とレビュー対応側の責務」） | 判断要 | 作成側と異なるcontextのreview側がexact HEADをreview。新世代CIは未構築。 | PR class/base/head・finding→責務範囲とreview対象HEADを照合→scope違反・HEAD変化を作成側へ返す。 | #2563/#2564の大きな一括PR、#2424/#2562の通知停滞。旧CLAUDE「GitHub 自走運用」L191-214。 |
| R7 Issue／Feature Ticket投影、状態・依存・完了の非生成（運用モデル「IssueとFeature Ticket」） | 機械化できる | Issue templateは記入欄を示すがsource整合は検査しない。Issue/PRから要求authorityを生成しない。 | local ticket・source revision・Issue本文→意味欄を比較→欠落/不一致をprojection failureとして返す。 | 個別のprojection failureは今回検索範囲で未発見。旧CLAUDE「GitHub 自走運用」。 |
| R8 PR／Issue templateの欄、scope、class、証拠（2 template） | 機械化できる | Markdown/YAML欄は記入支援で、GitHub自体は欄間整合を検査しない。 | PR class/HEAD/要求ID/証拠欄→欠落・複数class・SHA不整合を表示→作成側へ返す。 | #2564の大きな一括PR。template誤記由来の個別failureは今回範囲で未発見。 |
| R9 GUI lane登録、依頼、通知、ACK、結果（運用モデル「GUIレーンの運転と通知」、SCF-B-0003） | 機械強制済み（一部） | `scaffold/review-handoff/gui_mailbox.py`がpacket identity、配送、claim/ACK/result bindingを検査。通知・ACKはreview/approvalではない。 | packet/runtime/session/task ID/source digest/result→identityとdigestを照合→不一致・期限切れを拒否してlaneへ返す。 | #2424/#2562の依頼未達。旧CLAUDE「Hybrid 多ランタイム commit 協調」全体(L216-239)。 |
| R10 lane交代、worktree回収（運用モデル「レーンの交代」「作業branchとworktreeの片付け」、SCF-B-0158） | 機械強制済み（一部） | `scaffold/tools/worktree_reclaim.py`の`evaluate`/`apply_one`は限定条件の候補分類・回収。lane適性・交代判断は割当側が担う。 | worktree状態・age・main祖先性・process/PR状態→既存条件を判定→unknown/dirty/unmergedは削除せず保持・報告。 | UT-TDD #661（junction解除失敗後のremoveでprimary `node_modules`消失）、#384/#794。旧CLAUDE「GitHub 自走運用」「Hybrid 多ランタイム commit 協調」。 |
| R11 運用規則の置き場、consumer、機構移管（運用モデル「運用規則の置き場と、機構への移管」） | 機械化できる | `docs/governance/github-upstream-operating-model.md`が運用本文。全consumer closure・意味移管を検査する機構はない。 | source path・consumer参照・Binding pin→literal参照を列挙→不明は不明とし、意味移管や本文削減を自動確定しない。 | ORA-005/006、UTW-004/025。旧operations-rule-audit L3-6/L38-39。 |
| R12 設計JSONの分割、意味保存、設計反例と製品TDDの区別（運用モデルの該当節） | 判断要 | 文書照合と独立review。意味・consumer同等性を確定する機構はない。 | 原JSON・抽出後の復元値・consumer/oracle→値・順序・null/欠落・hash対象を比較→差異と未評価を表示してreviewへ返す。 | #3139、PR #3363-3365、#3503/#3514。旧L4/L5設計資料（source map参照）。ddd-tdd-rulesはこの意味の根拠に含めない。 |
| R13 人間向け日本語、識別子は原語（運用モデル、2 template） | 機械化できる（費用対効果なし） | 文面は作業者が作成。formatter/linterによる意味判定なし。 | title/body・識別子→形式差の検査は可能だが、今回範囲で誤判定の費用に見合う機械化根拠なし→現行の記述・reviewに留める。 | 対応する具体failureは今回検索範囲で未発見。旧sourceの同等契約も未確認。 |
| R14 必須入口（AGENTS「必須入口」：`docs/concept/helix-concept.md`、`docs/concept/helix-principles.md`、`docs/governance/decisions/brain-helix-core-po-intent-2026-09-25.md`、`scaffold/research/design-template-seed-minimum-gap-20261004/README.md` (DT-MSG)、`scaffold/research/design-template-seed-sdop-20260929/README.md` (DT-SDOP)、`scaffold/verification-test-template-seed-20261001/README.md` (DT-VT)の直接読解） | 機械化できる（読了確認まで） | 作業前の直接readが明記される。readや理解を強制する共通runtime gateはない。 | 対象作業・revision・必須path→path存在とrevisionを照合→欠落を表示。読了・適用意味そのものは機械判定しない。 | 個別failureは今回検索範囲で未発見。SCF-B-0152/0153/0154はseed候補のBindingで、採否・適用を確定しない。 |
| R15 L3／L10承認の委任（運用モデル「L3／L10承認の委任」） | 判断要（既存委任条件） | 対象revisionの独立review・判断record・対象6文書との照合で成立する。通知・review投稿だけでは成立しない。 | 対象revision、別系統review、no_findings、判断record、6文書bytes→同一性と委任条件を照合→条件欠落・差異は承認不成立として戻す。 | 固有のfailureは今回範囲で未発見。適用根拠は同節が引用する2026-10-05／10-08のPO委任判断。Concept/L1/L2は委任範囲外。 |
| R16 secrets／PII／credentials禁止、不可逆な外部作用の許可境界（AGENTS「現在の境界」） | 判断要 | secrets／PII／credentialsを書かない。release、tag、cutover、配布repo切替、その他不可逆な外部作用は対象と作用を明示した許可が必要。通常のGitHub lane操作に重複許可は求めない。全経路を強制する機構は確認していない。 | diff・action scope・既存許可record→既存境界との照合→secret疑い・許可欠落・不可逆作用は書込み／実行せず既存authority境界へ返す。 | 個別failureは今回検索範囲で未発見。新たな承認手続きやgateは提案しない。 |
| R17 対象ファイルを編集前に読む（AGENTS「編集と検証」） | 機械化できる（read evidenceまで） | 明示ルールだが、一般の編集を止める機械機構はない。 | 対象path・作業revision・read証跡→変更対象との対応を照合→未読対象を示す。理解の正しさは機械判定しない。 | 個別failureは今回検索範囲で未発見。 |
| R18 merge admission（運用モデル「review、判断、merge admission」、PR class別admission） | 判断要（review側が再照合） | exact base/content SHA、未解消finding、直前のbase/head/main/mergeability/method確認、merge後read-afterが契約。`scfctl stale`は上流pinのstaleを機械検出する。 | review request/response・base/head・merge result・Binding stale→identity/blob/祖先性/staleとclass条件を照合→不一致はmergeせず作成側へ返す。CodeQLは対象classで明示された場合の外部statusとして扱い、一般admission条件や新gateへ広げない。 | #2563/#2564のHEAD/scope往復、#3566のpin追随。PR class別の既存条件を適用し、新しい条件を加えない。 |
| R19 review依頼・応答packetの形式／identity検査（運用モデル「GUIレーンの運転と通知」、`packet.py`） | 機械強制済み（一部） | `scaffold/review-handoff/packet.py`の`validate`/`validate_response`はschema、field、authority_effect、PR/runtime identity、base/content SHA、参照bytes、payload digestとresponse bindingを検査。形式検査は意味reviewやmerge admissionではない。 | request/response packet・HEAD・reference set→schema/identity/digestを検査→不一致は拒否し再作成／再依頼へ返す。 | #2424/#2562は依頼未達の事例であり、packet validationが意味reviewを代替する根拠ではない。旧CLAUDE「Hybrid 多ランタイム commit 協調」(L216-239)。 |

## #3567 consumer根13件と規則群の対応

#3567の固定監査の列挙とroot→規則群の対応を示す。0040へ連なる6根は監査上の静的source preservation／review chainであり、個々のBindingが現行ruleをruntimeで使う証明ではない。

| consumer root | 対応規則群 | 対応理由／境界 |
|---|---|---|
| SCF-B-0001 | R5, R18 | scfctl/Binding登録・置換検査が仮artifact lifecycleとstale照合に対応。 |
| SCF-B-0003 | R9, R19 | GUI mailboxの通知運転とreview packet identity/形式。 |
| SCF-B-0040 | R2, R3, R11 | outside-67 source_holding migration候補。source保全・差分・consumer移管の静的調査に対応。 |
| SCF-B-0152 | R14 | DT-SDOP seed候補を読む対象。seed採否を生成しない。 |
| SCF-B-0153 | R14 | DT-VT seed候補を読む対象。検証規則の採否を生成しない。 |
| SCF-B-0154 | R14 | DT-MSG seed候補を読む対象。設計義務の承認を生成しない。 |
| SCF-B-0158 | R10 | worktree reclaim候補分類・回収機構。 |
| SCF-B-0023 | R2, R3 | 0040へ連なるholding外source保存・authority-gap監査。直接の運用規則consumerではない。 |
| SCF-B-0027 | R2, R3 | 0040へ連なるpre-isolation source holdingの静的監査。直接の運用規則consumerではない。 |
| SCF-B-0029 | R2, R3 | 0040へ連なるdelegated-doc sourceのfile/blob監査。直接の運用規則consumerではない。 |
| SCF-B-0034 | R2, R3 | 0040へ連なるPHCAP source/failure evidence gap監査。要求authorityを確定しない。 |
| SCF-B-0035 | R2, R3 | 0040へ連なるoutside-67 pathとholdingの静的照合。 |
| SCF-B-0038 | R2, R3 | 0040へ連なるoutside-67 source_holding保存候補。append/採否を確定しない。 |

## 要求候補の切り分け

今回確認したfailureと規則群から新たに切り分ける製品要求候補は**該当なし**。検索範囲はAGENTS.md、CLAUDE.md、作業入口、運用モデル、PR/Issue template、#3567固定auditと同auditが示す旧source、ならびに表中に引用したIssue/PR/監査である。運用規則、Issue/PR、機械化余地から要求の採否・意味・新gateを生成しない。`docs/governance/candidates/legacy-rule-derived-requirements.md`等の既存候補は参照情報のままとし、本棚卸しで状態を変更しない。ここでの「該当なし」は、今回のfailureと規則群から追加で切り分ける候補がないという意味である。

## 旧HELIX source map（固定資料への参照）

下記pathは`archive/legacy-generation-2026-09-14/`配下。asset IDと本文位置を台帳および実sourceで照合した。source bytesのSHA-256は[MANIFEST.sha256](../../../archive/legacy-generation-2026-09-14/MANIFEST.sha256)を参照する。旧資料はread-only参照で、旧CLI/runtime/CIは実行しない。

| asset ID | 旧source path | 実在する見出し／位置 | 保持点と現行との差 |
|---|---|---|---|
| LEGACY-ASSET-6EBDB617A8104A7756D0 | `archive/legacy-generation-2026-09-14/root/CLAUDE.md` | 「旧 HELIX ソースリポジトリ」L72-80、「自律境界」L82-85、「GitHub 自走運用」L191-214、「Hybrid 多ランタイム commit 協調」L216-239 | inventory-first、作成／review分離、相手変更の保護を保持。旧runtime、旧層、旧gateは移さない。 |
| LEGACY-ASSET-A54FF182C7E8ACF56ACF | `archive/legacy-generation-2026-09-14/root/AGENTS.md` | inventory-first L119-124 | 旧sourceを先に見る点を保持。本文copyなし。 |
| LEGACY-ASSET-5E22432B0A5A8F7CC8B3 | `archive/legacy-generation-2026-09-14/root/docs/governance/ddd-tdd-rules.md` | consumer=0 L31-32 | 旧consumer確認の考え方を参照。R12の設計JSON意味の根拠には使わない。 |
| LEGACY-ASSET-95E14F385D8C1F71C209 | `archive/legacy-generation-2026-09-14/root/docs/skills/deprecation-cutover.md` | replacement L35、zero-reference L36-37、rollback L41 | replacement/残存参照/rollbackの観点を参照。旧CLI手順は移さない。 |
| LEGACY-ASSET-FDBA655B1CFF75DCDC0E | `archive/legacy-generation-2026-09-14/root/docs/governance/repository-structure.md` | 配置ルール L102-173 | 責務と配置を一意にする点を保持。旧固定path/markerは採用しない。 |
| LEGACY-ASSET-4B835ADBEFBCCC13C1C0 | `archive/legacy-generation-2026-09-14/root/docs/governance/coding-rules.md` | L10-31,138-143 | 記述責務を参照。現行運用本文は運用モデル。 |
| LEGACY-ASSET-B8D84651753481B5F2B9 | `archive/legacy-generation-2026-09-14/root/docs/governance/operations-rule-audit-2026-07-26.md` | 目的L3-6、findingと処置L38-39 | 正本収束のfailure evidence。marker判定は移さない。 |
| LEGACY-ASSET-A127DEC3EEE6ED63CF17 | `archive/legacy-generation-2026-09-14/root/docs/governance/predecessor-harness-full-weakness-audit-2026-07-20.md` | 「4. 弱点 ledger」L60-101 | 派生repo failureを規則追加の自動根拠にせず、対応を記録する。 |
| LEGACY-ASSET-4F5A1F0739EC1111D91D | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L4-basic-design/design-template-json-authority.md` | 「§1 目的とauthority境界」L16、「§2 component境界」L32 | authority/component境界の確認を保持し、旧層やgateは移さない。 |
| LEGACY-ASSET-603D0E8D8193914F4AC0 | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/design-refactoring-domain-model.md` | 「§0 境界とinventory-first」L34、「§1 componentとsemantic判定」L45 | inventory-firstとsemantic境界を保持し、旧layer modelは移さない。 |

**保持点**：inventory-first、既存source/failureから始めること、作成／review分離、相手の変更を損なわないこと、正本を一か所にすること、未完な移管を保持すること。**変更点**：旧層番号、旧DB/runtime/marker/gateを採用せず、現行authority、PR class、Scaffold Bindingと既存機構へ対応させた。今回、新しい規則は加えていない。

移管順の観察：高頻度かつ既存判定の入力が揃うR5/R9/R18/R19は既存機構の適用範囲を照合しやすい。影響が大きく意味判断が残るR1/R4/R15/R16は表示・既存authority境界に留める。R2/R3/R11/R12/R14はsource・consumer・意味照合の費用が高い。これは観察上の順序であり、実装指示・新gateではない。

## 確認限界

確認範囲はAGENTS.md、CLAUDE.md、作業入口、運用モデル、PR/Issue template、#3567固定audit、表中の旧sourceとfailure事例である。GitHubの全Issue/PR履歴、動的consumer、runtime上の実利用、全失敗事例を網羅した調査ではない。事例未発見は失敗不存在を意味しない。
