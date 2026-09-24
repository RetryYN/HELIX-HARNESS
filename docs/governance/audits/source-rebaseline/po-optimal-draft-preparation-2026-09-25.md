# PO最適ドラフト準備の要求・候補調査

確認日: 2026-09-25
起点: `origin/main` `1f330f245ff7034dcc606a56c96f6c11ee012a8b`

## 目的と境界

PO最適ドラフトに先立ち、現行HARNESS L2・HELIX-OS L2・OSのticket節・機構別候補の文言と出典を、要求の文言を変えずに集める。ここにある仮参照IDは監査記録を指すだけで、要求ID、要求採否、合意、正本昇格を作らない。単体・接続・構成体の粒度評価も調査上の仮分類で、PO判断ではない。

要求・候補の原文行と行番号は[全量JSONL](po-optimal-draft-preparation-items-2026-09-25.jsonl)に収録した。現行L2主要求22件、L2本文中の従属詳細条件25行、ticket節37行、機構候補の表行100行（ID付き候補73行、責務・説明等の非要求行27行）を保持する。ticket節の37行は`G4-TICKET-LINE-*`、IDのない候補行は`G4-CAND-*`という監査用参照であり、正式な要求identityではない。調査上の分母はL2主要求22件、ticket節37行、候補ID付き要求73件の計132行とした。詳細条件25行は主要求に従属し、候補の非要求27行は説明・責務表として分母から除外した。退役済みDTK候補14行は`retired_comparison_source`へ分け、分母に含めない。旧監査のL1親対応表23行は要求でないため収録対象から除いた。

## 読んだ入口・判断記録

- [新世代作業入口](../../new-generation-start-here.md)：HARNESS／HELIX-OS L2はdraft・未採否であり、候補やPR状態から承認を作らない境界を確認。
- [L2要求読取り入口](l2-source-register.md)、[粒度監査](current-l2-requirement-granularity-audit.md)、[旧HARNESS要求対応](legacy-harness-requirements-source-crosswalk.md)、[候補source台帳](candidate-source-target-inventory.md)。
- [2026-09-24 PO判断](../../decisions/concept-requirement-po-decisions-2026-09-24.md)：HARNESS-L2-001..009、ticket・Discovery／PoC・S4・Researchの再整理、退役済みDTK候補を確認。
- [2026-09-25機構配置判断](../../decisions/mechanism-placement-po-decisions-2026-09-25.md)：OS L2-005/012/013のLABO移管、Intelligence限定修復候補、候補の配置と後続未決を確認。
- [2026-09-25 BRAIN・ヘリックスコア判断](../../decisions/brain-helix-core-po-intent-2026-09-25.md)：設計template、BRAIN、製品固有ヘリックスコア、Intelligence、原本／正本、コネクタ、導出成果物の意図と未決を確認。
- HELIX-OSとHARNESSの対象別L2本文、および以下の機構別candidates 12文書と、退役済みticket候補1文書を全文読取り。

## 要求の分母

| 対象 | 主要求 | 追加で全量収録した記録 |
|---|---:|---|
| HARNESS L2 | 9 | 同じL2 IDに結び付いた詳細条件行 |
| HELIX-OS L2 | 13 | 同じL2 IDに結び付いた詳細条件行、ID未付与のticket節 |
| 機構候補 | 主要求IDだけで分母を固定しない | HARNESS 5、OS 4、BRAIN 1、LABO 1、Intelligence 1文書の全表行。ticket導出候補は退役済み比較sourceとして別記録 |

現行L2要求の粒度は、各要求ごとに既存監査の`unit`／`connection`／`composite`／`mixed`を記録し、HELIXOS-L2-012/013の移管などsource revision差を注記した。これは9/15時点のproposal分類であり、現在の採否ではない。候補要求にも各行ごとの仮粒度・根拠、関連判断記録を記録し、責務・説明行は分類不能の理由を示した。JSONL内の`source_attribution_as_written`は現行本文の出典欄をそのまま保持する。`legacy_source_refs`は、source IDから旧pathと行を一意に照合できた範囲を記録し、見つからないHCV4・旧OS編成案・旧BR/FR等は未特定の検索範囲を明記した。旧sourceに直接結び付かない候補行は候補文書と行を固定し、旧出典との意味関係を推測で補わない。

## 旧HELIXの出典と保持・差分

- 柱要求の出典ID（HBR-P0..P9、HNFR-P3/P5/P8/AC）は旧`archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/pillar-requirements.md:50-67`にある。各現行要求が参照するIDと、対応する旧行はJSONLの`legacy_source_refs`へ個別に記録した。
- 旧HARNESS要求のBR/UX/FR/NFRは旧`archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/`の5文書を起点とする。対象別分類と旧ID群の対応は[旧HARNESS要求source crosswalk](legacy-harness-requirements-source-crosswalk.md)のBR/UX、FR、NFR、画面・技術の各節に照合した。現行source欄にある旧IDの中で、今回の範囲検索から原文の一意な行まで追えないIDは、JSONLで未特定とし、曖昧な行番号を作っていない。
- v1.3の旧sourceは旧`archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md`。明示ID `HR-FR-HYB-003/005/006/007/008/010` は同ファイルの該当表行に固定した。ticket種別の旧語彙は旧`archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:29-47`、旧HARNESS business requirementsのmode表は旧`archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/business-requirements.md:114-125`。
- HARNESS-L2-007は旧Concept/VisionのVersion 1構想に対応するsourceとして旧`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/concept-vision-package-intake.md:21`を記録した。HARNESS-L2-008は旧Requirement Discovery JSON authorityの設計template接続口（旧`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/requirement-discovery-json-authority.md:70-77`）とADR-010、HARNESS-L2-009は旧Design Template JSON authority（旧`archive/legacy-generation-2026-09-14/root/docs/design/helix/L4-basic-design/design-template-json-authority.md:18-24,36-41,58-60`）をsourceとして記録した。これは現行の要件全体と旧sourceが同一意味だという判断ではない。
- HELIXOS-L2-010/011について、現行source欄が示す「HELIX-OS編成案」は新世代の候補文書で、同名の旧archive sourceは見つからなかった。archive内のgovernance/docsを検索した範囲をJSONLに記録した。HELIXOS-L2-012のResearchは旧`archive/legacy-generation-2026-09-14/root/docs/process/modes/research.md:5`と旧`archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/functional-requirements.md:58`を記録した。HELIXOS-L2-013の旧原文対応は同じ旧docs範囲で未特定。
- HCV4-L2-001..006は現行crosswalkが保持する旧Concept由来のIDだが、archiveの`helix-concept-v4-requirements.md`と同階層の候補を検索しても旧原文行を特定できなかった。現行[移管crosswalk](../../crosswalks/legacy-concept-derived-requirements.md)は意味の対応候補であって、旧原文の代替出典とは扱わない。
- 旧ticket導出候補`docs/governance/candidates/development-ticket-derivation-requirements.md`は、2026-09-24 PO判断で14要求を「いらない」として退役し、ticket節から書き直すと記録されている。現候補本文は比較のためID・原文行を保持したが、要求分母やPO質問案に含めず、復活案として扱わない。

旧HELIXのmode語彙・pair・検証条件は照合根拠として保持し、旧runtime、CI、mode registry、旧ticket実装は移管しない。旧分類と現行ticket記述の差（DiscoveryとPoCの分離、旧S4からDECIDEへの分離、Researchから判断を外す等）は9/24判断に基づく照合論点であり、今回の監査から追加判断を作らない。

## 各機構候補の調査範囲と状態

| 機構 | 候補文書 | 記録した範囲 |
|---|---|---|
| HARNESS | `ai-readable-authority-requirements.md`、`next-generation-ci-requirements.md`、`requirement-engine-python-core-requirements.md`、`semantic-density-python-extraction-policy.md`、`wbs-ledger-requirements.md` | 候補ID付き要求、責務・境界行、受入・制約行。L2との包含、重複、適用revisionは未決。 |
| HELIX-OS | `ai-readable-authority-requirements.md`、`next-generation-ci-requirements.md`、`requirement-engine-python-core-requirements.md`、`wbs-ledger-requirements.md` | 候補ID付き要求、責務・境界行、受入・停止条件。HARNESSとの入力／実行責務、承認・採否は未決。 |
| HELIX-BRAIN | `design-template-system-requirements.md` | DST-HARNESS/OS候補、seedと適用に関する表行。POはBRAINの汎用パターン抽出を指示済みだが、候補採否と責務本文は未決。 |
| HELIX-LABO | `improvement-research-requirements.md` | HELIXOS-L2-005/012/013からの移管表示、RCLS候補、受入行。技術調査・クローラー発行との境界は未決。 |
| HELIX-Intelligence | `audit-bounded-repair-requirements.md` | AAFD候補、限定修復の条件・受入行。実行統制とOS推進・検収、HARNESS検証との接点は未決。 |
| governance（退役候補） | `development-ticket-derivation-requirements.md` | DTK-HARNESS/OS候補14行。退役の判断根拠として読んだ。現行候補として採用せず、ticket要求へ戻さない。 |

候補文書の現状は`docs/governance/audits/source-rebaseline/candidate-source-target-inventory.md`および機構配置判断に従い、候補の存在・文言をL2の採否・承認・現行要求へ読み替えない。

## 判断記録に残る未決事項の集約

- **設計templateの責務と文言**：HELIX-BRAINが汎用パターンを扱い、各製品のヘリックスコアが固有の意味・設計を持つというPO指示と、現行HARNESS-L2-009／BRAIN候補／旧文面の間をどう接続するか。HELIX-OSの登録・適用・結果管理の境界も詰まっていない。
- **BRAINの稼働中の役割**：現行Concept記載の理解・計画・予測・診断・レビュー・配置案をBRAINに残すか、OS／Intelligenceへ移すか。
- **コネクタ担当**：BRAINと製品固有ヘリックスコアを接続する機構をHELIX-CONNECTに置くか、別の関係として扱うか。
- **LABOとIntelligenceのクローラー**：技術調査・改善研究を行うLABOと、クローラーを発行するIntelligenceの入力、取得、分析、採否の境界。
- **限定修復の実行線**：Intelligenceが発行する監査・限定修復と、OSの推進・許可・実行管理・検収、HARNESSの修復後検証の受渡し。
- **機構の導入時期**：BRAIN／Intelligenceを1.0から接続できることとConceptの版表記との関係。ヘルプbot、crawler、全体監査の稼働時期、BRAINの「学習」が構造蓄積かモデル調整か。
- **原本と正本**：「原本」（HELIX保有側）と「正本」（利用者へ渡す成果物側）というPO発言の用語が、それぞれ何を指すか。POは対応をまだ確認していない。解体・破棄の内部要件はPOが不要と判断しており、再質問しない。
- **ticket要求identity**：OS ticket節の各行にどの要求IDを付けるか、単体・接続・構成体の何を扱うか。ID付け前に節の目的・要件境界を確認する。
- **旧ticket分類の対応**：旧Discovery/PoC/S4/Research/Scrum Reverse、Incident等の条件を現行ticket種別とHARNESS工程条件へどう対応させるか。9/24 PO判断済みのDiscovery／PoC分離・DECIDE・Researchの決定非関与を再質問しない。
- **WBS-ledger接続**：旧ticket導出候補が退役済みである一方、現行HELIX-OS WBS候補がDTK-OS-002等を参照している。WBS候補本文に同一の要求行が含まれるか、参照先・置換候補をどう扱うかは文書間のsource関係として解決していない。新しいticket要求を復活させず照合する。

## POへの質問案

以下は決定ではなく、PO最適ドラフトで意味を確定するための質問案である。用語を説明し、個別の論点を独立に示す。

- 設計知識から要求への質問や設計成果を作る流れに、どのような役割・情報の受渡しが必要ですか。製品固有の意味、複数製品に使うパターン、工程管理は、どのように関係しますか。現行のBRAIN・ヘリックスコア・OS・HARNESSへの配置は、その意図を表すうえで適切ですか。
- BRAINに持たせたい仕事は何ですか。Conceptに書かれた理解・計画・予測・診断・レビュー・配置案の各仕事は、今後どのような関係で扱いたいですか。
- 製品固有の設計知識と共通パターンを別の機構で扱う場合、両者をつなぐ機能に何を期待しますか。既存のHELIX-CONNECTは、その意図とどのように関係しますか。
- 技術調査や情報収集にどのような成果を期待しますか。外部情報を集める処理（crawler）の発行、調査の実施、分析、信頼性確認、要求への反映は、どのような担当関係にしたいですか。現行のLABO・Intelligence配置はその意図を表していますか。
- 限定修復を発見してから結果を確認するまで、どのような役割と引渡しが必要ですか。実行許可、隔離して適用すること、検収、修復後の検証を、それぞれどの機能に持たせたいですか。
- HELIX-BRAINやHELIX-Intelligenceを、どの段階でどのように利用可能にしたいですか。接続可能にする時期と実際の機能を使い始める時期は同じですか。ヘルプbot、crawler、全体監査、設計パターンの学習（既存情報から構造を抽出・蓄積すること）について、想定する開始条件を教えてください。
- HELIX Web利用者へ渡す成果とHELIX側が保持する情報について、「原本」「正本」という言葉はそれぞれ何を指しますか。両者の関係をどのように理解していますか。
- ticket節にあるForward 大・中・小、Discovery、PoC、Prototype、DECIDE、Backflow、Reverse、Recovery、Incident、Refactor、Design-refactor、Performance-refactor、Redesign、Retrofit、Research、Add-feature、Version-upは、どのような仕事や状況を表すものですか。互いの関係、発行条件、戻し先、単体・接続・構成体の扱いをどう考えていますか。
- 現行WBS候補に退役済みticket候補への参照があります。WBSの作業分解・台帳管理として必要な内容は何ですか。旧候補との関係をどのように記録すれば、退役したticket要求を復活させずに参照の意図を残せますか。

## 静的照合時の制限

旧archiveはテキストの読取り・検索だけを行った。旧script、tool、hook、CI、test、runtimeは実行していない。要求本文・候補本文・判断記録・機構配置は編集していない。今回の記録は要求の採否・承認・実装準備完了を意味しない。
