# PO最適ドラフト準備の要求・候補調査

確認日: 2026-09-25
起点: `origin/main` `1f330f245ff7034dcc606a56c96f6c11ee012a8b`

## 目的と境界

PO最適ドラフトに先立ち、現行HARNESS L2・HELIX-OS L2・OSのticket節・機構別候補の文言と出典を、要求の文言を変えずに集める。ここにある仮参照IDは監査記録を指すだけで、要求ID、要求採否、合意、正本昇格を作らない。単体・接続・構成体の粒度評価も調査上の仮分類で、PO判断ではない。

要求・候補の現行文言と出典行は[全量JSONL](po-optimal-draft-preparation-items-2026-09-25.jsonl)に記録した。現行L2主要求22行、ticket節の原文37行（要求条件30行、説明・見出し・旧定義比較7行）、候補要求81行（既存candidate ID79件、ID未付与条件2行）、L2従属詳細162行、L3関係map 9行、candidate L11受入36行、責務・説明context 23行、移管案内3行・Intelligence移管pointer2行、旧DTK比較14行を収録した。調査上の分母は主要求22 + ticket条件30 + 候補要求81 = 133行である。L2詳細は親要求に従属し、L3関係map、L11受入、context、移管案内、ticket説明、退役候補は要求identityの重複・誤生成を防ぐため分母から除外した。候補行の監査IDは調査recordを識別するだけで、ID未付与条件に正式IDを与えない。旧監査のL1親対応表22行は要求でないため分母に含めない。

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
| HARNESS L2 | 9 | 主要求9行、既存の詳細表21行にline 100を追加し計22行。Design Template、ticket core、修復後検証の関連条件も逐語で記録 |
| HELIX-OS L2 | 13 | 主要求13行、現行詳細行5行と追加のL2詳細条件46行。統制節151–266の要件・境界散文を逐語記録 |
| ticket節 | 19種類と周辺の作業条件 | 原文37行を保持し、条件30行・説明context7行を区別 |
| 機構候補 | 文書内のcandidate identityを維持 | HARNESS 5、OS 4、BRAIN 1、LABO 1、Intelligence 1の12文書。candidate要求81行、L11受入36行、context23行を分離。HXT-RQ-01..07は既存candidate IDとして収録。退役ticket候補14件は別比較source |

現行L2要求の粒度は、各要求ごとに既存監査の`unit`／`connection`／`composite`／`mixed`を参照した調査上の仮分類として記録し、HELIXOS-L2-005の一部移管、HELIXOS-L2-012/013の移管先candidateと案内行を分けた。これは9/15時点のproposal分類を含み、現在の採否ではない。candidate要求にも各行ごとの仮粒度・根拠・decision refsを記録し、candidate L11受入と責務説明contextを別record typeに分けた。JSONL内の`source_attribution_as_written`は現行本文の出典欄を保持する。`legacy_source_refs`は、source IDから旧pathと行を一意に照合できた範囲を記録し、見つからないHCV4・旧OS編成案・旧BR/FR等は未特定の検索範囲を明記した。旧sourceに直接結び付かない候補行は候補文書と行を固定し、旧出典との意味関係を推測で補わない。

## 旧HELIXの出典と保持・差分

- 柱要求の出典ID（HBR-P0..P9、HNFR-P3/P5/P8/AC）は旧`archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/pillar-requirements.md:50-67`にある。各現行要求が参照するIDと、対応する旧行はJSONLの`legacy_source_refs`へ個別に記録した。
- 旧HARNESS要求のBR/UX/FR/NFRは旧`archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/`の5文書を起点とする。対象別分類と旧ID群の対応は[旧HARNESS要求source crosswalk](legacy-harness-requirements-source-crosswalk.md)のBR/UX、FR、NFR、画面・技術の各節に照合した。現行source欄にある旧IDの中で、今回の範囲検索から原文の一意な行まで追えないIDは、JSONLで未特定とし、曖昧な行番号を作っていない。
- v1.3の旧sourceは旧`archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md`。明示ID `HR-FR-HYB-003/005/006/007/008/010` は同ファイルの該当表行に固定した。ticket種別の旧語彙は旧`archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:29-47`、旧HARNESS business requirementsのmode表は旧`archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/business-requirements.md:114-125`。
- HARNESS-L2-007は旧Concept/VisionのVersion 1構想に対応するsourceとして旧`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/concept-vision-package-intake.md:21`を記録した。HARNESS-L2-008は旧Requirement Discovery JSON authorityの設計template接続口（旧`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/requirement-discovery-json-authority.md:70-77`）とADR-010、HARNESS-L2-009は旧Design Template JSON authority（旧`archive/legacy-generation-2026-09-14/root/docs/design/helix/L4-basic-design/design-template-json-authority.md:18-24,36-41,58-60`）をsourceとして記録した。これは現行の要件全体と旧sourceが同一意味だという判断ではない。
- HELIXOS-L2-010/011について、現行source欄が示す「HELIX-OS編成案」は新世代の候補文書で、同名の旧archive sourceは見つからなかった。archive内のgovernance/docsを検索した範囲をJSONLに記録した。HELIXOS-L2-012のResearchは旧`archive/legacy-generation-2026-09-14/root/docs/process/modes/research.md:5`と旧`archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/functional-requirements.md:58`を記録した。HELIXOS-L2-013の旧原文対応は同じ旧docs範囲で未特定。
- HCV4-L2-001..006は現行crosswalkが保持する旧Concept由来IDだが、archiveの`helix-concept-v4-requirements.md`と同階層を検索しても旧原文行を特定できなかった。現行[移管crosswalk](../../crosswalks/legacy-concept-derived-requirements.md)は意味の対応候補で、旧原文の代替出典ではない。
- OS L2内のHMC／PPS／CLR／AVS／RFA／DGH／FRS／HXTの詳細行は、現行source行・親L2・source candidate IDを個別記録した。独立した旧原文への対応が特定できる行は旧path:line、特定できない行は対象archive範囲と未特定を個別に記録した。HXT-RQ-01..07は旧`execution-ticket-requests.md:24-30`にsource IDがある候補で、現行L2への採否とは分けた。
- 旧ticket導出候補`docs/governance/candidates/development-ticket-derivation-requirements.md`は、2026-09-24 PO判断で14要求を「いらない」として退役し、ticket節から書き直すと記録されている。現候補本文は比較のためID・原文行を保持したが、要求分母やPO質問案に含めず、復活案として扱わない。

旧HELIXのmode語彙・pair・検証条件は照合根拠として保持し、旧runtime、CI、mode registry、旧ticket実装は移管しない。旧分類と現行ticket記述の差（DiscoveryとPoCの分離、旧S4からDECIDEへの分離、Researchから判断を外す等）は9/24判断に基づく照合論点であり、今回の監査から追加判断を作らない。

## 各機構候補の調査範囲と状態

| 機構 | 候補文書 | 記録した範囲 |
|---|---|---|
| HARNESS | `ai-readable-authority-requirements.md`、`next-generation-ci-requirements.md`、`requirement-engine-python-core-requirements.md`、`semantic-density-python-extraction-policy.md`、`wbs-ledger-requirements.md` | 候補ID付き要求、責務・境界行、受入・制約行。L2との包含、重複、適用revisionは未決。 |
| HELIX-OS | `ai-readable-authority-requirements.md`、`next-generation-ci-requirements.md`、`requirement-engine-python-core-requirements.md`、`wbs-ledger-requirements.md` | 候補ID付き要求、責務・境界行、受入・停止条件。HARNESSとの入力／実行責務、承認・採否は未決。 |
| HELIX-BRAIN | `design-template-system-requirements.md` | DST-HARNESS/OS候補、seedと適用に関する表行。POはBRAINの汎用パターン抽出を指示済みだが、候補採否と責務本文は未決。 |
| HELIX-LABO | `improvement-research-requirements.md` | HELIXOS-L2-005/012/013からの移管表示、RCLS候補、受入行。技術調査・クローラー発行との境界は未決。 |
| HELIX-Intelligence | `audit-bounded-repair-requirements.md` | AAFD-BR-01..04、ID未付与の限定修復条件2行、L11受入5行。実行統制とOS推進・検収、HARNESS検証との接点は未決。 |
| governance（退役候補） | `development-ticket-derivation-requirements.md` | DTK-HARNESS/OS候補14行。退役の判断根拠として読んだ。現行候補として採用せず、ticket要求へ戻さない。 |

候補文書の現状は`docs/governance/audits/source-rebaseline/candidate-source-target-inventory.md`および機構配置判断に従い、候補の存在・文言をL2の採否・承認・現行要求へ読み替えない。

## 判断記録に残る未決事項の集約

- **設計templateの責務と文言**：HELIX-BRAINが汎用パターンを扱い、各製品のヘリックスコアが固有の意味・設計を持つというPO指示と、現行HARNESS-L2-009／BRAIN候補／旧文面の間をどう接続するか。HELIX-OSの登録・適用・結果管理の境界も詰まっていない。
- **BRAINの稼働中の役割**：現行Concept記載の理解・計画・予測・診断・レビュー・配置案をBRAINに残すか、OS／Intelligenceへ移すか。
- **コネクタ担当**：BRAINと製品固有ヘリックスコアを接続する機構をHELIX-CONNECTに置くか、別の関係として扱うか。
- **LABOとIntelligenceのクローラー**：技術調査・改善研究を行うLABOと、クローラーを発行するIntelligenceの入力、取得、分析、採否の境界。
- **限定修復の接続**：限定修復はIntelligence候補へ移管済みで、HARNESSは修復後の要求revision・oracle・独立検証・consumer受入を保持する。OSの推進・検収とIntelligenceの候補実行条件との情報受渡しが未決。
- **機構の導入時期**：BRAIN／Intelligenceを1.0から接続できることとConceptの版表記との関係。ヘルプbot、crawler、全体監査の稼働時期、BRAINの「学習」が構造蓄積かモデル調整か。
- **原本と正本**：「原本」（HELIX保有側）と「正本」（利用者へ渡す成果物側）というPO発言の用語が、それぞれ何を指すか。POは対応をまだ確認していない。解体・破棄の内部要件はPOが不要と判断しており、再質問しない。
- **ticket要求identity**：OS ticket節の各行にどの要求IDを付けるか、単体・接続・構成体の何を扱うか。ID付け前に節の目的・要件境界を確認する。
- **旧ticket分類の対応**：旧Discovery/PoC/S4/Research/Scrum Reverse、Incident等の条件を現行ticket種別とHARNESS工程条件へどう対応させるか。9/24 PO判断済みのDiscovery／PoC分離・DECIDE・Researchの決定非関与を再質問しない。
- **WBS-ledgerの適用境界**：HDEC-L2D-S0-02はSHA-256 `34711045caea9a6bac6fa1084b056e393593efe76099b7f124af4e17265a84f6`の候補本文におけるHELIX-OS管理・推進・検収とHARNESS規範の分割を承認済み。分割後の別revision注記とDTK候補への参照関係はrecordへ併記した。承認を現行L2適用やticket要求の復活とは解釈しない。

## POへの質問案

以下は決定ではなく、未決の意味を確認する質問案である。決定済みの機構配置やticketモデルを聞き直さず、現在残る境界に絞る。

- 設計templateから要求への質問や設計成果を受け渡すとき、どの情報と結果が必要ですか。共通の設計パターン、製品固有の意味、工程の関係を要求文にどう表すと意図が伝わりますか。設計template systemをBRAINへ置く判断は前提として扱います。
- BRAINがHELIXについて持つ理解・計画・予測・診断・レビュー・配置案のうち、どの仕事と出力をBRAINに期待しますか。Conceptに列挙された各仕事の役割や境界で補足したい点がありますか。
- 共通パターンと製品固有の設計知識の間をつなぐ機能には、どのような仕事・入出力・失敗時の扱いを期待しますか。ConceptのHELIX-CONNECTは接続登録、契約版照合、通信、再送、追跡を担い、業務判断・承認は持たない共通部品として記載されています。この機能をBRAINと製品コア間に使う場合、期待する受け渡しや追加の接続条件は何ですか。
- Intelligenceがクローラーを発行し、LABOが技術調査を担う前提で、クローラーの取得範囲・取得情報・結果の受け渡しに必要な条件は何ですか。工程内Researchとの違いをどのように示すとよいですか。
- 限定修復の候補をIntelligenceに置き、修復後検証をHARNESSが保持する前提で、OSの推進・検収へどの情報を渡す必要がありますか。候補・作業・検収・再検証の記録間で不足している接点がありますか。
- BRAIN／Intelligenceを1.0からどの段階まで接続可能にしたいですか。接続可能な状態と、crawler・help bot・全体監査などの運用開始時期をどう区別しますか。「学習」は構造化した経験の保持とモデル調整のどちらを指すか、あるいは両方かを確認させてください。
- HELIX Web利用者へ渡す成果とHELIX側が保持する情報について、「原本」「正本」はそれぞれ何を指しますか。両者の対応関係をどのように表すのが適切ですか。
- OS ticket節の各行を要求として識別するとき、各ticket種別・対象粒度（単体／接続／構成体）・親要求をどの単位でidentity化しますか。行ごとにIDを付けるか、条件群を束ねるか、また旧Discovery／PoC／S4／Researchの条件をどの文言へ改めるかが未決です。
- HARNESS、BRAIN、OSにまたがる候補文言は、どの共通用語・役割記述で揃えると同じ意味を保てますか。機構ごとの追加条件と重複をどう示すと読み分けやすいですか。

WBS ledgerの候補本文・管理／推進／検収とHARNESS規範の分割はHDEC-L2D-S0-02で承認済みのため、この質問案では再質問しない。候補source間の参照整合は調査・編集側で照合する。

## 静的照合時の制限

旧archiveはテキストの読取り・検索だけを行った。旧script、tool、hook、CI、test、runtimeは実行していない。要求本文・候補本文・判断記録・機構配置は編集していない。今回の記録は要求の採否・承認・実装準備完了を意味しない。
