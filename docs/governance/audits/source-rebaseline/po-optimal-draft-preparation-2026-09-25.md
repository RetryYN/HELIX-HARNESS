# PO最適ドラフト準備の要求・候補調査

確認日: 2026-09-25
起点: `origin/main` `1f330f245ff7034dcc606a56c96f6c11ee012a8b`

## 目的と境界

PO最適ドラフトに先立ち、現行HARNESS L2・HELIX-OS L2・OSのticket節・機構別候補の文言と出典を、要求の文言を変えずに集める。ここにある仮参照IDは監査記録を指すだけで、要求ID、要求採否、合意、正本昇格を作らない。単体・接続・構成体の粒度評価も調査上の仮分類で、PO判断ではない。

要求・候補の現行文言と出典行は[全量JSONL](po-optimal-draft-preparation-items-2026-09-25.jsonl)に記録した。全611 recordの内訳は、現行L2主要求22、ticket節37（要求条件30、説明・見出し・旧定義比較7）、機構候補要求74（formal candidate ID 72、ID未付与条件2）、L2従属詳細347、L2詳細の見出し・出典・状態context 40、L3関係map 9、candidate L11受入39、責務・説明context 23、移管案内3、Intelligence移管pointer 3、退役DTK比較14である。調査上の分母はL2主要求22 + ticket条件30 + 候補要求74 = 126。HXT-RQ-01..07はOS L2詳細行にあるsource candidate IDとして従属詳細に保持し、独立candidate requirementには数えない。従属詳細、context、関係map、L11受入、移管案内、ticket説明、退役比較は要求identityの重複・誤生成を防ぐため分母から除外する。監査IDは調査recordを識別し、ID未付与条件に正式IDを与えない。旧監査のL1親対応表22行は要求でないため分母に含めない。

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
| HARNESS L2 | 9 | 主要求9行、詳細表はline 100を含む21行。ほかに要求形成、ticket core、CI、運用品質、security、提供条件、修復後検証等のnormative prose 78行、見出し・source/state context 15行を逐語記録 |
| HELIX-OS L2 | 13 | 主要求13行、OS L2詳細表とHXT candidate source ID行、統制節151–266および68–100・280–330・334–337・348–357・361–363・372–375・380–381・398–404・428–438・459–474・478–479・493–494・512–513のnormative prose 100行と見出し・出典・状態context 25行を逐語記録 |
| ticket節 | 19種類と周辺の作業条件 | 原文37行を保持し、条件30行・説明context7行を区別 |
| 機構候補 | 文書内のcandidate identityを維持 | HARNESS 5、OS 4、BRAIN 1、LABO 1、Intelligence 1の12文書。candidate要求74行、L11受入39行、context23行を分離。HXT-RQ-01..07はOS詳細条件のsource IDとして分母外。退役ticket候補14件は別比較source |

補足散文のsource censusはHARNESSの76–86、114–123、125–136、138–151、161–177、188–200、214–216、222–223、229–231、237–241、245–252、258–260、264–267、289–291行、OSの68–100、151–266、280–330、334–337、348–357、361–363、372–375、380–381、398–404、428–438、459–474、478–479、493–494、512–513行を対象にした。空行を除く現行source行は原文で記録し、要求条件は`l2_detail_clause`、見出し・出典・状態履歴・案内・L3 relation mapは理由を添えたcontext/pointerとして分離した。これらの従属detail/context/pointerは独立要求identityの分母に加えていない。

現行L2要求の粒度は、各要求ごとに既存監査の`unit`／`connection`／`composite`／`mixed`を参照した調査上の仮分類として記録し、HELIXOS-L2-005の一部移管、HELIXOS-L2-012/013の移管先candidateと案内行を分けた。これは9/15時点のproposal分類を含み、現在の採否ではない。candidate要求にも各行ごとの仮粒度・根拠・decision refsを記録し、candidate L11受入と責務説明contextを別record typeに分けた。JSONLの`source_attribution_as_written`と`acceptance_text`は現行sourceに逐語存在する場合のみ保持し、それ以外の分類・除外理由・調査者注記は`record_note`等へ分離した。`legacy_source_refs`は、source IDから旧pathと行を一意に照合できた範囲を記録し、見つからないHCV4・旧OS編成案・旧BR/FR等は未特定の検索範囲を明記した。旧sourceに直接結び付かない候補行は候補文書と行を固定し、旧出典との意味関係を推測で補わない。

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

- **設計templateの責務と文言**：HELIX-BRAINが汎用パターンを扱い、各製品コアが製品固有の要求・制約・設計義務を持つというPO指示と、現行HARNESS-L2-009／BRAIN候補／旧文面の間をどう接続するか。HELIX-OSの登録・適用・結果管理の境界も詰まっていない。
- **BRAINの稼働中の役割**：Conceptに列挙された理解・計画・予測・診断・レビュー・配置案について、稼働中にBRAINが担う仕事と他機構へ渡す出力・境界。
- **コネクタ担当**：接続機能が担う登録・契約版確認・通信・再送・追跡と、BRAINや製品固有コア間で必要な入出力。
- **LABOとIntelligenceのクローラー**：技術調査・改善研究を行うLABOと、クローラーを発行するIntelligenceの入力、取得、分析、採否の境界。
- **限定修復の接続**：限定修復はIntelligence候補へ移管済みで、HARNESSは修復後の要求revision・oracle・独立検証・consumer受入を保持する。OSの推進・検収とIntelligenceの候補実行条件との情報受渡しが未決。
- **機構の導入時期**：BRAIN／Intelligenceを1.0から接続することを前提に、ヘルプbot、crawler、全体監査の稼働時期、BRAINの「学習」が経験の構造化保持かモデル調整か。
- **原本と正本**：「原本」（HELIX保有側）と「正本」（利用者へ渡す成果物側）というPO発言の用語が、それぞれ何を指すか。POは対応をまだ確認していない。解体・破棄の内部要件はPOが不要と判断しており、再質問しない。
- **旧ticket条件の意味保持**：旧Discovery（不確実性の探索）・PoC（技術的成立性の実験）・S4（旧判断段階）・Research（参考情報の調査）等の記述から、承認済み現行モデルへ持ち越すべき利用者価値・制約が残っているか。Discovery／PoC分離、DECIDE判断、Researchは決定しないという決定は聞き直さない。
- **WBS-ledgerの適用境界**：HDEC-L2D-S0-02はSHA-256 `34711045caea9a6bac6fa1084b056e393593efe76099b7f124af4e17265a84f6`の候補本文におけるHELIX-OS管理・推進・検収とHARNESS規範の分割を承認済み。分割後の別revision注記とDTK候補への参照関係はrecordへ併記した。承認を現行L2適用やticket要求の復活とは解釈しない。

## POへの質問案

以下は決定ではなく、未決の意味を確認する質問案である。決定済みの機構配置やticketモデルを聞き直さず、現在残る境界に絞る。

- 要求から設計義務を導く設計templateや共通設計パターンを使うとき、要求側へ戻す質問・成果に何を含めると意図が伝わりますか。共通パターン、製品固有コア（製品側の要求・制約・設計義務を担う部分）の意味、工程条件をどう区別して伝える必要がありますか。
- Conceptに列挙された理解・計画・予測・診断・レビュー・配置案について、稼働中のこれらの仕事のうちBRAINに持たせるもの、他機構へ委ねるもの、または分担するものは何ですか。各仕事で必要な出力と受け渡し先も確認させてください。
- 共通パターンと製品固有の設計知識の間をつなぐ機能には、どのような仕事・入出力・失敗時の扱いを期待しますか。ConceptのHELIX-CONNECTは接続登録、契約版照合、通信、再送、追跡を担い、業務判断・承認は持たない共通部品として記載されています。この機能をBRAINと製品コア間に使う場合、期待する受け渡しや追加の接続条件は何ですか。
- クローラーによる技術情報の取得と、工程内Research（設計・実装で参照資料を集める活動）は、入力・成果・採否への関与をどのように区別するとよいですか。取得範囲と結果を次に渡す際に欠かせない条件は何ですか。
- 限定修復の候補をIntelligenceに置き、修復後検証をHARNESSが保持する前提で、OSの推進・検収へどの情報を渡す必要がありますか。候補・作業・検収・再検証の記録間で不足している接点がありますか。
- BRAIN／Intelligenceは1.0から接続します。crawler・help bot・全体監査は、どの準備条件や利用場面が整った時点で運用を始める想定ですか。「学習」は経験を構造化して保持すること、モデルを調整することのどちらを指しますか。
- HELIX Web利用者へ渡す成果とHELIX側が保持する情報について、「原本」「正本」はそれぞれ何を指しますか。両者の対応関係をどのように表すのが適切ですか。
- 旧ticket条件を承認済みの現行モデルへ対応づける草案を作ります。Discovery（探索）・PoC（技術成立性の実験）・S4（旧判断段階）・Research（参考情報の調査）等の記述で、利用者価値・制約・判断境界が欠けている箇所はありますか。必要な草案修正は作成側で示します。
- HARNESS、BRAIN、OSにまたがる候補文言は、どの共通用語・役割記述で揃えると同じ意味を保てますか。機構ごとの追加条件と重複をどう示すと読み分けやすいですか。

WBS ledgerの候補本文・管理／推進／検収とHARNESS規範の分割はHDEC-L2D-S0-02で承認済みのため、この質問案では再質問しない。候補source間の参照整合は調査・編集側で照合する。

## 静的照合時の制限

旧archiveはテキストの読取り・検索だけを行った。旧script、tool、hook、CI、test、runtimeは実行していない。要求本文・候補本文・判断記録・機構配置は編集していない。今回の記録は要求の採否・承認・実装準備完了を意味しない。
