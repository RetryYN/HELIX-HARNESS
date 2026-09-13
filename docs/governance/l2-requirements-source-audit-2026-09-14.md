# HELIX要求文書の監査記録

本書は監査証跡であり、要求・承認・受入の正本ではない。今回対象とした文書整理と適用待ち差分の記録を行う。
基準はdevelopment repositoryのcommit `6fabd1251`と本作業の意図差分。
GitHub Issueの存在や状態は、要求の採否・充足の判定根拠にしない。

## 今回の完了範囲

POは追加確認に対し「今回は文書整理と適用待ち差分まで」と回答した。
正本JSON更新機構の設計・実装、canonicalへの差分適用、runtimeの移行、実操作によるL11受入は今回の対象外とする。
文書の対象別分離、出典・採用状態・未移管条件の明示、適用待ち差分の検証を今回の完了判定対象とする。
以下の「未実装」「未適用」「未受入」は成果物に残す状態情報であり、それらの実装完了を本作業の条件に追加しない。
文書自体の未照合・参照切れ・条件欠落は引き続き是正する。

## 対象別整理の現在地

2026-09-14のPO指示により、外部提供プロダクトをHARNESS、HELIX全体の管理・統制・継続改善をHELIX-OSとした。
HELIX-WebはOSが管理する個別プロダクトであり、固有要求の所属先を`docs/design/helix-web/`へ分離した。
HARNESSにL2／L11の6要求、OSに9要求、WebにVision由来8要求を設けた。詳細の入口は
[対象別移管状況](../design/helix/L2-requirements/README.md)を参照する。

HMC6件、AAFD4件、RCLS6件、PPS4件、CLR詳細8件の条件と反例をOS側へ移管した。
元の混在整理案は移管先への参照とし、原文候補の採否・未承認状態を保持した。
これらは文書整理であり、既存JSONのadmissionや実行機構の移行・利用者受入の完了ではない。
FRS・AVS・RFA・DGHもHARNESSの条件とOSの実行管理へ分割した。既存JSON153要求の本文を読んで対象別対応を作り、追補14契約も責務と状態を接続した。
JSON本文の意味是正、全詳細条件の採択・L3接続、Webの個別採択と残る将来契約は適用待ちであり、今回の作業範囲に含めない。
候補系列の対象と整理状態は[候補要求源の対象別台帳](audits/l2-requirements/candidate-source-target-inventory.md)へ記録した。

metadata検索の現時点の発見集合は21文書。下記の過去の検査結果・件数には対象別追加前のsnapshotが含まれるため、
現行差分全体の検証として読み替えない。特にdoctorのexit 1と独立review未完は未解消として扱う。

## 本文と対文書から確認した問題

| 対象 | 読取り範囲 | 所見 | 整備・残作業 |
| --- | --- | --- | --- |
| `docs/design/helix/L1-requirements/pillar-requirements.md` | 全文 | metadataはL2／L11だが表題はL1要件。Python意味コアを無権限workerとして扱いADR-010と矛盾。可視化節でdocsとDBの正本範囲が未分離 | 表題、現行分類、層別authority、要求とDB投影の責務を訂正。HBR9件・HNFR4件と追補の要求内容は保持。旧承認・実装状況を現行受入の証拠にしない旨を明記 |
| `docs/design/helix/L1-requirements/resident-lane-orchestration-requests.md` | 全文 | CN-1の「要求=L1」は現行層定義に反する。BR-2のIssue正本という表現は要求の意味正本と作業範囲の参照を混同する | L1企画／L2要求／L3要件を訂正しIssueの用途を作業範囲の参照に限定。現行L1／L12 metadataと既存承認は保持。具体要求のL2への接続は未検証 |
| `docs/design/helix/L2-screen/screen-mock-boundary.md` | 全文 | L2をモック接続だけで説明し、要求引出し・合意の工程が欠落。L2／L10を対としていた | L2要求引出し・プロト合意・L3受渡し・L11受入へ訂正。改訂版はdraft、freeze_blocking。要求・プロトrevisionと合意者を対応づける条件を明記。実際の合意証拠は未確認 |
| `docs/test-design/helix/L2-screen-ux-test-design.md` | 全文 | 旧L2／L10を規定し、旧doctor出力を合否条件に使用していた | canonical L11／L2を明記したdraftへ改訂。HUX-L2-01..03を要求対応・証跡欠落・revision不一致の検証へ具体化。実行結果と独立reviewは未取得。canonical再利用禁止は維持 |
| `docs/design/helix/L10-ux/ux-evidence-boundary.md` | 全文 | L10をL2モックの検証層と定義していた | canonical L11／L2を明記したdraftへ改訂。L3／L10総合テストとL2／L11受入を分離し、列挙したtest pathは現在の実行結果ではないことを明記 |

## REBASELINE是正差分の本文照合

柱要求の対文書`docs/test-design/helix/L1-pillar-operational-test-design.md`も全文を確認した。
HBR9件／HNFR4件にHOT13件が対応するが、本文は旧L14観測であり、現行L11受入の証拠ではない。
表題・metadataをL2／L11のdraft、freeze_blockingへ訂正し、旧シナリオ・条件・承認履歴は保持した。
個別delta・oracle・独立review・digest更新までのcanonical再利用禁止も維持する。

`docs/design/helix/L3-requirements/pillar-functional-requirements.md`は全文確認した。
§1の定義行は51要件、§2は102受入条件で重複IDは0。§0の展開表だけにP2-05..08とP6-06が欠落していたため、
本文の5要件を表へ反映し、表題・入力層をL2へ訂正した。46件は追加前の履歴と明記した。
旧L3／L12 pair等の本文は未整備部分を含む。本文のID対応だけで全条件の被覆を認定しない。

- HR-FR-P1-04／HAC-P1-04aのL2暗黙skipを要件v1.3 §3／4に従い訂正した。template生成とは別にUI合意／非UI適用性receiptを要求し、対応HATも更新した。
- HR-FR-P2-05／06をADR-010の層別authorityに訂正した。Pythonへrepositoryを渡さない境界を明記し、AC／HATにも反映した。runtime実装・admission済みの主張ではない。
- HAC-P6-03aには旧配布先を含む具体コマンドがある。列挙されたコマンドを現行の実行許可として扱わず、配布authorityと照合する。
- HBR-P0のForward一律収束を要件v1.3 §4／4.2の選択済みstyleへ更新した。HAT-P0-01／P1-03も同じ境界へ更新し、Discovery／PoCの暗黙内包を拒否する。

`docs/design/helix/L1-requirements/hybrid-rebaseline-v0.5.0-remediation-delta.md`を全文確認した。
途中の出力省略箇所は分割して読み直した。これは59所見の是正案であり、59要求の現行収載証拠ではない。

- 現行metadataはL2／L11、statusはproposed。L1要求という表題を訂正し、旧評価の「検証合格」を現行採用・合意・受入と解釈しない境界を追加した。
- CAPSULE-05はschema形式適合を目指す本文と「そのままではschema不合格」という注意文が矛盾していた。形式schemaと未記入placeholderの実行admissionを分離する記述へ訂正した。
- AUTH-005はIC-02と逆方向にerrata参照を直す案を併記していた。IC-02のv0.4.0へのファイル改名へ一本化し、同じ是正を二重計上しない旨を明記した。
- INF-01の固定115 HIL IDとcoverage ledger正本は現在の153 JSON要求の定義と一致しない。現行集合・意味正本には使わない。
- runtime-boundary、UWRS、AUTHにはADR-009単独のPython従属案が残る。冒頭のADR-010 supersessionが適用されるため、そのまま現行へ採用できない。
- chat-reqs F1は原発言からCHAT-IDへのprovenance不足と、取得不能の記録を要求する。「取得不能」の明示を要求の意味・人間合意の復元成功に読み替えない。
- AST/GHのファイル・ref・commit件数は旧観測値であり、現行sourceの完全性や採用数を固定する根拠にしない。

各所見から現行要件への個別移管・採否の照合は未完了。パッケージ内コマンド例は実行していない。

## 旧harness要求の照合

旧harnessの以下5文書を全文確認した。governance READMEが定めるcompatibility資料であり、
本文のconfirmedやcanonical_layerだけで現行要求へ再昇格させない。

| 文書 | 保持すべき要求内容 | 旧定義・未整合 |
| --- | --- | --- |
| `docs/design/harness/L1-requirements/screen-requirements.md` | 15画面の詳細、6遷移シナリオ、共通条件、BR／UX／FR trace、ペルソナ、カテゴリ境界、旧ID移行表 | 冒頭でL1要求・L2画面分離・L10実データ検証を正規式とし、現行L2／L11と矛盾。§5のPASSは現行合意・受入の証拠ではない。全画面not-implementedは文書内宣言であり、実装現況は別途検証が必要 |
| `docs/design/harness/L1-requirements/business-requirements.md` | BR-01..08／21／22の10件、UX-01..03の3件、D-01..09のKPI、業務フロー・責務境界・entity・carry。省略されたKPI部分は再読した | L1要求／L2画面限定と旧L0-L14 pairが残る。§7の対応表にBR-21がなく、§11のL3／L7接続をL11受入の証拠にはできない。AIのmerge/tag自律と不可逆操作承認の境界が曖昧。copy-paste指示と無人完走の適用範囲が未分離。§9には現行13要求と別の採用候補がある |
| `docs/design/harness/L1-requirements/functional-requirements.md` | FR-L1-01..51全件、8利用シナリオ、I/O、上流対応表、§7の追補要求束 | 現行style／L1-L12に更新した行と旧mode routing／drive／L2画面限定が混在。シナリオ1はL1からL3へ進みL2要求合意が欠落。FR-L1-29／30は旧L1要求・L10 UX。§5にはBR-22行がなく、本文でFR-L1-46..49への導出を宣言している。BR-13..20は同directory業務文書の確定10 BRに存在せず、出典namespaceの解決が必要 |
| `docs/design/harness/L1-requirements/nfr.md` | 15個のNFR IDと追補。移植性、更新性、runtime・言語非依存、fail-close、完成度、実装宣言の真実性、役割分離、機械とAI、二重検証、人間負担、local-first、途中導入、security | NFR-05の「GitHubをCI／証跡／権限の正本」は要求意味の正本を意味しない。旧L0-L14、本人環境第一級とLinux primaryの混在、古いmemory/state path、Resource Utilizationの対象／対象外重複あり。法令適合の宣言は本監査で検証していない |
| `docs/design/harness/L1-requirements/technical-requirements.md` | 技術制約・外部IF・既存制約・state・skill注入・共通工程・drift解消の7節と関連文書節 | 全OS第一級と現行OS tierが不一致。旧9-mode、専門職drive、旧pair、proseの未実装CLI例が残る。GitHub projection、要求意味正本、実行状態の責務を区別して移管する必要あり |

既存15 NFRや7節を一括で棄却・現行採用しない。HIL/HBR/HNFR/refinementへの対応を要求単位で照合する。
読了済み5文書の要求単位の移管対応は継続中。
業務要求のKPIも保持対象として照合する。D-07はAI委譲工数率を要求するが、計測場所の
`drive:`集計だけでは工数の分子・分母を測れる証拠にならない。D-04の回帰発生総件数の
取得方法も本文では確定していない。旧目標値の存在と現行測定可能性・達成を区別する。

旧機能文書§7は同じFR IDへDB証跡・relation graph・外部検証profile・文書exportなどを
追補している。51 IDの存在だけで全条件を被覆したとは扱わず、移管時は追補本文まで照合する。
FR-L1-36／38／43の「実装済み」「昇格済み」と表のP2は、実装状態と優先度の区別が不明瞭である。
旧記述から現行の受入合格を認定しない。FR-L1-12／37の`helix task estimate`も
要求上の実行面の記載であり、現行CLIで利用可能な証拠にはしない。

画面要求の§5.4にはFR-L1-36／38／43／46..50の行がない。46..49はHM-02の詳細・逆traceに
存在するため、表の欠落を機能全体の未登録へ読み替えない。PM-05も詳細の対応FR欄には01のみ、
逆traceには01／31／42があり、同一文書内で参照集合が一致しない。
HM-04／HM-07の再実行トリガーは、CLIコピー優先・UI実行境界との照合が必要である。
PM-06のp95 2秒／50KB、Mermaid 1秒、fallback、共有範囲、renderer境界は独立した要求条件として保持する。
現行画面境界文書に柱要求§2.8との照合先を追加した。これは旧15画面の採用承認や移管完了ではない。

## 要求候補の本文照合

以下は`docs/governance/candidates/`配下の各要求文書の全文を読んだ結果である。
要求ID数は本文に明示されたIDの数であり、追補・複合条件を分解した要求総数ではない。
候補のmetadataや承認参照の存在だけで、承認の有効性やcanonical昇格を認定していない。

| 要求文書 | 本文のID | 現行の宣言 | 確認結果 |
| --- | --- | --- | --- |
| `execution-ticket-requests.md` | HXT-RQ-01..07 | L2／L11、draft_candidate | 対文書`execution-ticket-validation.md`も全文確認。7要求それぞれに利用時の検証あり。非UIのN/A receiptはfreeze時の対象HEAD・理由・再評価条件を要求し、実行済みreceiptは存在すると主張していない。原稿内のL1表記は出典として隔離済み |
| `requirements-authority-materialization-requests.md` | RAMG-BR-001..007 | L1候補／L12、draft_candidate | Issueを正本にしないことを明示。RAMG-BR-006のsource-of-derivation列挙はL1/L3/L10でL2が欠落。`requirements-authority-materialization-acceptance.md`全文の14 oracleはL3／L10対であり、L2／L11の要求合意・受入の証拠ではない |
| `requirement-formation-scoped-admission-requests.md` | RFA-BR-01..03 | L1／L12、approved_pending_canonical_promotion | 目的・証拠・人間反応・限定scopeの反復を要求。`requirement-formation-scoped-admission-recognition.md`全文のRFA-OP-01..03はL12運用評価。L2合意を確認したことにはならない。GitHubコメントは承認参照として記載されているが本文監査でその有効性を検証したとはしない |
| `authority-vocabulary-requests.md` | AVS-BR-001..006 | L1候補／L12、draft_candidate | 相談・叱責を人間承認に昇格させず、指示と技術評価・完了証拠を分離する。L2への個別接続は本文にない |
| `design-grounding-human-convergence-requests.md` | DGH-BR-01..03 | L1／L12、draft_candidate | 外部根拠、人間反応、反復収束をDG/HR/DC各要件へ分解。L2の要求・プロト合意を示す記録は本文にない |
| `helix-concept-v4-requests.md` | HCV4-BR-001..006 | 本文に旧未承認表記が残存 | PLAN-L3-84のAuthority境界と照合し、本文SHA-256が候補承認対象`73e110…776a`と一致することを実測。承認済み候補・canonical昇格待ちのmetadataを追加し、承認対象本文は保持。L2合意済みとは扱わない |
| `world-governance-requests.md` | HWG-BR-01..03 | L1／L12、draft_candidate | 全機能の追跡、影響限定拡張、提供単位を要求。JSON意味正本と候補の非正本境界を明示。HWG-R01..09への分解だけでL2合意済みとはしない |
| `three-lane-capacity-profile-requests.md` | 3L-BR-010 | L1候補、pending_canonical_promotion | 作成・検収・統合capacityの分離と段階拡張を要求。目標並列数と実行権限の付与を分離。現行WIPの変更根拠にしない |
| `bugbot-bounded-repair-requests.md` | BBR-BR01..02 | L1候補、approved_pending_canonical_promotion | BRからR01..05、AC01..07への対応を明示。要求承認と個別修復の実行権限を分離。L2合意の記録は本文にない |
| `ci-event-concurrency-generation-requests.md` | CIG-BR-01..03 | L1／L12、draft_candidate | event classごとの証明義務、current mainの保全、cancel等の再構成を要求。Issue整理を承認・runtime有効化としない |
| `conversation-lifetime-reconstruction-requests.md` | CLR-BR-001 | L1候補、awaiting_human_approval | 詳細CLR-R01..08とCLR-AC01..08を全文確認。意図保存・再取得・条件付き切替・累積制約・最小packet・比較・段階導入をv4由来L2案へ接続。L10 oracleとL11合意・受入の成立を分離 |
| `instruction-path-change-resilience-requests.md` | IPC-BR-001 | L1候補、awaiting_human_approval | 要求・Policy等を正しい版で届け更新・縮退を反映する価値を明記。原稿の別添2文書が不存在と明示されている。元添付の内容を復元済みと扱わない |
| `agentic-audit-future-state-delta-requests.md` | AAFD-BR-01..04 | L1、draft_candidate | AI監査proposalの証拠束縛、UIL/TERの所有権、futureのstale化、モデル更新比較を要求。監査自由文から実行authorityを生成しない |
| `harness-memory-coordination-boundary-requests.md` | HMC-BR-001..006 | L1候補、本文で人間承認済み・正本化待ち | memoryを期限付き通知とpointerへ限定。要求・設計・長期知識をmemoryの正本にしない。BR-002の再取得先は作業状態中心であり、要求の意味をIssueから取得する許可にはならない |
| `producer-provenance-separation-requests.md` | PPS-BR-01..04 | L1／L12、draft_candidate | 成果生成・commit・公開・reviewを分離し、GitHub actorからproducerを推測しない。PPS-R01..07への対応あり。旧receiptの独立性を後付けしない |
| `rule-derivation-requests.md` | G-BR-001 | L1候補、approved_pending_canonical_promotion | 許容境界の実効化と根拠付き診断を要求。詳細8要求・8受入を参照。候補IDとIR登録、要求採用と実行有効化を分離 |
| `functional-release-slice-requests.md` | FRS-BR-001..009 | L1、draft_candidate、本文にv0.2承認記録 | 独立昇格・exact収載・成熟度・影響追跡・rollback・責務再編・全要求配置・限定先行投入・安全閉包を要求。旧構成や説明用の9群・17系統を固定分母にしない。L1/L3/L10記述だけではL2接続は未確認 |
| `mechanism-adequacy-requests.md` | R1..R6、受入条件1..6 | approved_pending_canonical_promotion、層metadataなし | 既存能力照合、六分類、反証可能性、AI設計引渡し、証拠と低費用、運用還流を詳細に保持。調査未完を能力不存在へ変換しない。§5はL1要求・L3要件・L10受入と記載しL2接続が未明示 |
| `responsibility-centric-learning-requests.md` | RCLS-BR-001..006 | L1候補／L12、draft_candidate | 責務owner、入力分類、最小packet、段階昇格、失効・隔離、authority保全を要求。Learningから要求やreleaseを直接変更しない |
| `security-engagement-authority-requests.md` | 固有要求IDなし、価値5項目 | layer L1、draft_candidate、本文でhuman gate成立済み | 認可scope、分離実行、finding区別、取消、機密保護を要求。metadataのpendingと本文の成立済みの意味を承認revisionで照合する必要あり。本監査は実行権限を付与しない |
| `infrastructure-operations-quality-l1-request-candidates.md` | NIO-L1-01..05 | 本文でcandidate / unapproved | 非機能の適用性、同一要求identityでの還流、状態分離、既存機構再利用、scope内自走を要求。数値SLO等は対象要求・Release契約の別承認と明示 |

上記21文書は、`*requests.md`20文書と`infrastructure-operations-quality-l1-request-candidates.md`の全文確認範囲である。
他の名称で保存されたintakeとL3候補を含む候補系列は、対象と整理状態を対象別台帳へ記録した。
個別条件の採否、承認revisionの確定、後継revisionへの昇格は適用待ちである。
候補間で同じ要求形成を扱う場合も、意味・責務・revisionを照合せず重複として削除しない。

## 別名のintake・提供構成の確認

要求候補21文書とは別に、以下の3文書を全文確認した。既存の読了件数へ重複算入しない。

| 文書 | 本文から確認した範囲 | 最新要求への取扱い |
|---|---|---|
| `development-investment-stage-directives-intake_v1.0.md` | INV-001..072の投資候補とP0..P4導入帯。候補／未承認と明記 | 72候補を現行必須要求やIssueへ一括変換しない。参照先の原文は2515行で、今回本文を読了していない。能力依存・個別条件・採否の照合は未完了 |
| `concept-vision-package-intake.md` | 2026-09-06受領10文書の取込説明、版／ownerの分離、原文欠落、既存責務との接続候補 | 文書中の通読・hash検証・過去PR状態は当時の作業者の記録。今回の検証結果として転用しない。Concept v0.1をv4承認の取消と解釈しない |
| `concept-vision-release-crosswalk.md` | Vision1.0..5.0、PKG-D01..13、既存RLS／FRSへの対応案、要求差分5件と受入候補 | 文書版・能力目標・公開SemVerを分離。Packageは選択view、Moduleはowner。成長機構無効での開発、対象製品ReleaseとHELIX自己Releaseの分離、版追跡、将来目標の隔離をL2の提供・運用要求へ照合する |

このcrosswalkの接続説明もL1／L3／L10中心でL2／L11合意が明示されていない。
新しいL2要求案のHCV4-L2-005へ単に13Packageを追加せず、既存RLS／FRSの要求・受入と意味差分を確認する。
sourceの個数や分類を全HELIXの固定分母にしない。原文にない添付や承認を再構成しない。

## Infinity Loop JSON正本の照合

`requirements-ir/requirements.json`の153件を機械走査し、参照先3shardと照合した。
`primary_system_contract_id`、`acceptance_ids`、`system_test_id`の参照先欠落は0件。
ただし、これはIDの到達性であり、要求と検証内容の意味的一致・実行合格の証明ではない。
153件すべてで`pending_resolution`が非空、`actor_ids`・`task_ids`・`surface_ids`は空である。
移管時に質問・回答・プロト・actor等の証拠を捏造しなかった旨が明記されている。
`definition_status: frozen`だけでL2の発見・合意証拠も揃ったと解釈してはならない。

業務要求HIL-BR-01..33の`statement.text`全件とL3契約／acceptance IDの対応を読んだ。
特に次の要求は本監査の進め方・正本整備に関わる。

| 要求ID | 本文の要求 | 監査への適用 |
| --- | --- | --- |
| HIL-BR-13 | 画面対象はプロト・walkthrough・要求への逆伝播・合意、非対象は証拠付きskip | 全要求へ画面を強制せず、適用性とN/A証拠も確認する |
| HIL-BR-14 | 移管元をbehavior単位へ分解し採否から検証まで追跡 | ファイル読了・一覧作成を要求移管済みとしない |
| HIL-BR-22..24 | 閉じた要求集合、要求atom、設計義務、原文・採否・oracle・revisionの履歴 | 153件を全HELIX要求の分母にせず、文書やtrace行の存在で定義完了としない |
| HIL-BR-25 | 各層の上下導出と正規V-pairの双方向対応 | L1→L3へのリンクだけでL2／L11を充足済みとしない |
| HIL-BR-26 | 可逆起草とcanonical admission、上位意味変更の承認を分離 | この整備差分を承認・IR admission・runtime移行の完了としない |

HIL-BR-03の永続知識をharness memoryへ昇格する要求と、HMC候補のcoordination限定は意味差分である。
候補を採用済みとみなしてJSON本文を先行変更せず、承認対象revisionと移管範囲を照合する。
続いてHIL-FR-01..69、HIL-NFR-01..40、HIL-TR-01..11の`statement.text`全件を読んだ。
HR-FR-HIL-01..24のbehavior・transition_contract・failure_and_evidence、
HAC-HIL-01a..24cの72件のstatement、およびHAT-HIL-01..24の全fieldも確認した。
24テストはすべて`designed_not_implemented`であり、実装・実行合格の証跡ではない。
下記は意味の不整合を確認できた項目である。ほかの項目に不整合がないと認定した一覧ではない。

| 対象 | 確認した不整合 | 修正すべき内容・照合根拠 |
| --- | --- | --- |
| HIL-FR-19 | プロトで発見した要求deltaの反映先をL1としている | L2要求への反映を基本とし、企画変更を含む場合だけL1へ逆伝播する。HIL-FR-05／31／49がL1企画とL2要求を明示的に分離している |
| HIL-FR-20 | agreement/skip欠落時の停止点をL1 freezeとL3開始としている | L2要求の合意・適用性記録からL3要件凍結への受渡しを規定する。L1企画と混同しない。HR-FR-HIL-15はcurrent agreement/no-UI receiptによるL3 freezeを規定する |
| HR-FR-HIL-20、HAC-HIL-20a、HAT-HIL-20 | Portfolioの接続先をForward/Scrum S0–S4としている | HIL-BR-28／HIL-FR-56の選択済みdevelopment styleと、Scrum非内包のDiscovery／PoC S0–S4を分離する。親要求を旧集約契約の表現へ戻さない |
| HIL-TR-07 | write authority変更をL4で決定すると読める | ADR-010のNode単一commit境界をL4設計の裁量で変更できないことを明示する。L4は承認済みauthority内の実装方式を具体化する |
| HIL-FR-04／HIL-NFR-03／HR-FR-HIL-04とHIL-BR-04 | 全IssueにReverseを要求する本文と、Reverseが適用されるIssueを条件化した本文が共存 | 現行workflow分類の正本・対象revisionと照合して適用条件を確定する。全要求をIssueへ強制登録する根拠にはしない |

この修正内容は監査上の提案であり、凍結済みJSONの新revision・承認・transaction receiptではない。
元JSONとcompatibility inputのdigestを直接書き換えて整合済みにはしていない。
原文・承認revision・refinement contractを照合したうえで、正規のJSON更新と全consumerへの波及確認が必要である。

## refinement契約の確認

`requirements-ir/refinement_contracts.json`のRLO-FR-001と3L-FR-001..008を全field読取りした。

- RLO-FR-001は`specified`、`approval: null`。RLO-FR-037..040の追加4要件とRLO-AC-027..030のみを持つ。常駐レーン全要件の収載を意味しない。
- 3L-FR-001..008は`frozen`。3L-R-01..25と3L-AC-001..027を持ち、承認対象revision・candidate HEAD・subject/source digestを保持する。JSON内の承認記録の存在と外部承認原文の有効性検証は区別する。
- 3L-R-11の現行WIP=2・条件付き3と、capacity profile候補の段階拡張は別revisionの意味である。候補本文の目標値を現行JSONへ先行適用しない。
- 3L-R-25の「Issue正本」はPhase A assignmentの参照として書かれている。要求の意味をIssue本文から変更する許可と解釈しない。
- 全14refinement契約の`source.requirement_path/acceptance_path`を機械照合し、記録されたSHA-256と実ファイルのbytesが全件一致した。

三社レーンL1文書は承認対象本文を保持し、metadataに確認済みのIR projectionと旧「admission待ち」の適用時点を追記した。
MIC／CNW／DIST-LITE／SYN／OPSの残る5契約も全fieldを読んだ。これでrefinement全14契約の本文確認済み。

| 契約 | 要件と受入の範囲 | 内容・注意点 |
| --- | --- | --- |
| MIC-FR-001 | MIC-R-01..07、MIC-AC-001..012 | READY割当、統合TL、独立reviewセル、束縛、競合排除、拡張、工程表投影。MIC-R-07はrepo-owned工程表とDBを計画・状態authority、GitHubをread-side projectionと明記。Issue closeやProjects操作で完了・leaseを確定しない |
| CNW-FR-001 rev2 | CNW-R-01..08、CNW-AC-001..013 | 親TLとworkerのidentity、policy由来spawn、退役、handback、hook rootとbounded lifecycle。モデル名・effortはこのrevisionの要件であり、全HELIX不変Conceptへ昇格させない |
| DIST-LITE-FR-001 rev2 | DIST-LITE-R-01..05、DIST-LITE-AC-001..009 | profile、配布先、allowlist、同一artifact昇格、consumer検証、条件付きrelease権限。配布先の意味宣言と実cutover receiptは別。sourceがHELIX-HARNESSであることを明示 |
| SYN-FR-001 | SYN-R-01..10、SYN-AC-001..014 | 意味接続、決定的合成、学習、Refactoring、置換、pair、CI、完了測定、shadow planner、model昇格。SYN-R-05は年齢・LOC・名前・AI意見だけの削除を拒否し、要求・parity・移行・rollbackで判断する |
| OPS-FR-001 | OPS-FR-001..006、OPS-R-01..13、OPS-AC-001..021 | 環境・配備・rollback・観測・incident・保守・診断・還流・release。集約FRが詳細R本文を内包するため、両方を独立要求の分母へ単純加算しない |

この5契約とRLOは`specified`かつ`approval: null`。他所の承認不存在を証明する値ではないが、JSON内のfreeze receipt成立も主張できない。
14契約全体の要件IDは78、受入IDは100で重複IDは0。契約内の要件→受入・受入→要件の参照先欠落は0件。
ID到達性の検査と内容の充足・実行証拠は別であり、全78件が原子的要求とも受入済みとも扱わない。
OPS-R-05は`bounded exposure`を含む4段階promotionを要求するが、OPS-AC-005は3段階で記載されている。
stage skip拒否のoracleがbounded exposureを検査するか、実テストと照合が必要である。

## 正本の判断根拠

- `docs/governance/l12-canonical-vmodel-direction-directive_v0.1.md`全文：L1企画、L2要求、L3要件凍結。L2のモックは要求引出しの装置。L2プロト合意なしのL3凍結は禁止。
- `docs/adr/ADR-010-python-semantic-core-node-commit-boundary.md`全文：承認済み要求・判断記録・ADRの下に、Python意味判断とNode実行境界の同格の層別authorityを置く。
- `docs/governance/downstream-canonical-reuse-authority-2026-07-19.md`全文、および`src/lint/canonical-reuse-authority.ts`全文：旧pairを持つ指定成果物は個別delta・oracle・独立review evidence・digest更新まで再利用禁止。
- `config/requirement-ir-authority.json`と`requirements-ir/manifest.json`全文：移管済み要求の機械意味正本はJSON。compatibility Markdownを別正本として編集してはならない。

現行Core Readの要件v1.3は、HARNESSの工程規則とHELIX-OSの実行・管理機構を同一本文に保持している。
[v1.3対象別責務対応](audits/l2-requirements/requirements-v1.3-target-crosswalk.md)で節・ID単位の主対象とL2親を整理した。
これはv1.3のauthority取消やL3分冊の完了ではなく、正規改訂時に継承・分割・supersedeと全projectionを同一revisionへ
更新するための適用待ち差分である。

## 最新要求のL2具体化

FRS v0.2はPLAN-L3-83のrepo-owned承認記録を読み、対象commit
`b3127cd0a8bb1f979499a831a7a9de6db4c2aa72`のrequests／requirements／acceptanceと現行3文書を比較した。
3文書ともfull-byte digestは一致しないが、差分全文を確認した結果、requestsの9要求本文と
requirementsの要件定義部分は変更されず、候補承認と正本化境界の説明が更新されていた。
acceptanceは同じ境界更新に加え、FRS-AC-020が「候補承認済みでも正本未昇格／IR未成立ならruntime投影拒否」へ
具体化されている。したがって現行3文書を承認commitとbyte一致とは主張しない。
承認対象・現行差分・候補状態を区別してL2へ具体化し、9要求のsource IDを全件対応づけた。
承認source URLの外部原文を今回再取得したとは主張しない。

2026-09-14の`git fetch origin main`は成功し、取得したmainは監査基準と同じ`6fabd1251`だった。
更新日時やGitHubの状態だけでは要求の採否を決めず、次のrepo-owned本文・承認対象を確認した。

- Concept v4本文とL3候補18要件を全文確認。frontmatterを除いたSHA-256はPLAN-L3-84の承認対象と一致した。
  Conceptは`9b6ee7…2e8ea`、L3候補は`5ef796…8136e`。本文を保持し、候補承認済み・正本化待ちのmetadataを追加した。
- `concept-v4-derived-requirements.md`をL2 draftとして追加した。HCV4-BR6件を利用者要求・利用場面へ具体化し、
  L3候補18件とL11受入案6件へ対応づけた。既存13柱の継承／置換条件も全件を照合した。
- HMC-BR-001..006を全文確認し、期限付き通知、正本再取得、長期知識の分離、誤承認防止、
  配送／訂正／crash再開、provider設定混入拒否をL2案とL11条件へ反映した。
- 上記13柱とHMC6件の出典IDに対応漏れ・未知IDはなく、追加文書のMarkdownリンク先の存在を確認した。

これらは新しいL2合意やIR admissionの成立記録ではない。合意対象revision・プロト／適用性receipt・L11実結果は未登録。
runtime移行は要求文書整備の完了と別に扱い、未実装の条件を実装済みへ書き換えない。

## 適用待ちとして確定した範囲

Execution TicketのL2要求候補7件とL11受入候補を再照合した。HXT-RQ-02で要求された中断・待ちの観測、
成功条件にあるreceipt到達・欠損検出・replay一致を受入候補へ補った。改善なし・劣化・判定不能を
正当な測定結果として保持する条件も明記した。非UI N/A記録はv1.3 §3の6項目へ合わせた。
候補の状態は変更せず、実際の測定・利用者合意・受入済みとは扱わない。

要件正本v1.3の§4.9.1に残る「Markdownをcurrent authorityとして維持する」という移行前記述を、
現行`config/requirement-ir-authority.json`の`canonical_json_only`、compatibility read-only、JSON transaction方針へ訂正した。
冒頭の153/153 frozenはInfinity Loop由来の集合に限定し、HELIX全要求の網羅・実装・受入完了を意味しないと明記した。
§2からL2参照入口とv4由来draftへ接続し、GitHubの作業記録と要求の意味authorityを分離した。
これは新規要求の承認・IR admission・独立reviewを成立させる変更ではない。

v4由来L2案とL11案にはAVS6件・RFA3件・DGH3件、AAFD4件・RCLS6件・PPS4件の具体条件を追加した。
各候補の採用状態を保持し、案への収載だけでcurrent contractへ昇格しない。

153件のInfinity Loop要求だけをHELIX全要求の分母にしない。柱要求の追補、常駐レーン等のL1文書に混在する具体要求、要求候補、REBASELINE是正差分、旧harness要求からの未移管項目を照合対象として保持する。
各要求について、出典と本文、採否と承認revision、L2プロト合意、L3要件、L11受入の対応を確認する。
未確認・未移管・未合意・未受入を区別し、IDや文書が存在するだけでは接続済みとしない。

候補directoryの92文書は系列単位で対象別台帳へ収容した。L2接続済み、台帳接続、分解待ち、保留を区別し、
残る個別採否を今回の文書整理が完了していないという曖昧な一状態へまとめない。
旧HARNESS要求に残っていた「GitHub正本」は、CI実行・PR許可・権限証跡の保存を指すよう訂正し、
要求の意味・採否・合意revisionは対象別のローカル要求正本を参照すると明記した。
さらに現行Concept、運用テスト、Infinity Loop、Issue graph、三社・常駐レーンを横断し、Issue／PLAN／branch／leaseへ
使われていた「正本」を確認した。非凍結文書はGitHubを証拠・作業projectionへ限定した。Infinity Loop、三社・常駐レーンの
凍結sourceは語彙訂正だけでもRequirement IRのsource digestが失効するため本文を変更せず、`scope正本`等を
assignment scope authorityへ改訂する差分を適用待ちとする。現行L2案ではIssue本文から要求の意味・採否・完了を生成しない。

既存digest例外はまだ更新していない。本文の訂正が既存例外と不一致になる場合は検証結果として残し、
独立review済みという証跡を作らずに例外の期待値だけを追従させない。

## この差分の検証

現在差分でdoctorを再実行しexit 1を確認した（`/tmp/helix-l2-current-doctor.log`）。
主な未解決は`plan-specific-vpair-binding`38件、`l12-hybrid-recognition`のreviewed disposition 9件、
branch-kind、design-coverage 2件、hook trust、current-locationの旧L14完了claim、review receipt読取りである。
reviewed disposition対象は既存2文書に加え、PLAN-L3-1594／1639／75／78／88、PLAN-L5-104、PLAN-L7-578。
参照digestの変更もreview対象となるため、PLAN本文を変えていないことだけでreviewを省略しない。
このdoctorの実行中に追加した旧screen READMEとの工程対照表は検証snapshotへ含めない。

V-pair38件の詳細は全件`baseline_plan_semantic_drift`だった。`planSemanticDigest`が
`workflow_identity.registry_source_digest`を含むため、303 PLANの参照更新で既存免除の意味digestが失効する。
同じloader入力を使い、メモリ上だけで新registry digestを旧値へ戻してanalyzerを比較した結果は
現行38件／対照0件。ファイル・gate・免除台帳は変更していない。この結果は原因の切り分けであって
失効した免除の再承認ではない。新たなoracle欠落38件とは区別し、必要な再検証・免除解消を追跡する。

柱要求のP0／P1／P6／P7と対応HOTを、選択済みstyle、人間判断境界、development配布source、
memoryの正本反映・retire条件へ更新した。HOTの当該行は現行L11受入案として未実行と明記した。
13柱と13 HOTの親ID対応一致を再検査し、移行成功を件数・digestの不変で判定する旧条件を除いた。
配布追補にあるL1表記・旧setup表記・GitHub tagを要求正本と読める記述も訂正した。
303 PLAN参照更新後の`plan lint --gate governance`はexit 0、1252 PLANを検査した。

v1.3本文の訂正に伴いworkflow classification registryのsource digestを実測値へ更新し、
既存`projectWorkflowClassificationCatalog`からcatalogを再生成した。HEADとの差分をJSON比較し、
registry／catalogの変更は3つの参照digestだけで、分類identity・policy・signal bindingに変更がないことを確認した。
`requirement-authority`、`l3-requirement-discovery-json-authority`、`workflow-classification-catalog`の再検証は
25件中24件成功、1件失敗。要件文書digest不一致は解消したが、U-RAC-005はPLANの旧registry digestを
`PLAN workflow identity authority drift`として検出した。この失敗実行を成功証拠にはしない。

後続で303 PLANの`workflow_identity`を読取り、全targetの現行registry登録を確認して参照digestを更新した。
HEADとの差分検証で、PLAN本文・承認記録を変更せず当該digestだけの変更であることを確認した。
execution policy registryとSkill applicability registryの参照も更新し、既存`projectWorkflowExecutionPolicy`で
生成projectionを再生成した。3 JSONをHEADと比較し、6参照digest以外の変更がないことを確認した。
更新後、Node 24.15.0で`tests/requirement-authority.test.ts`と`tests/skill-applicability-registry.test.ts`は
37件成功・exit 0、`tests/workflow-execution-policy-registry.test.ts`と
`tests/workflow-execution-policy-projection.test.ts`は20件成功・exit 0。
これによりU-RAC-005のDB投影失敗は解消した。全L2の意味網羅・独立review・全doctor合格は別の未完了項目である。

`npx --yes --package=node@24.15.0 -c 'node_modules/.bin/vitest run tests/runtime-authority-requirements.test.ts tests/vmodel-pair.test.ts tests/resident-lane-orchestration-requirements.test.ts'`
はexit 0、3ファイル71テスト成功。`git diff --check`もexit 0。
検査対象は文書間pairの構造と常駐レーンの既存要求契約であり、全L2要求の網羅性・合意・実操作受入を証明しない。

`npm run helix -- plan lint --gate governance`（Node 24.15.0）はexit 0。
frontmatter／cross-recordは1252 PLAN、compatibility parentは1252 PLANを検査した。

`npm run helix -- doctor --include-working-tree --summary-json`（Node 24.15.0）はexit 1で終了した。
この実行時点の変更に対応する不合格は次の4文書である。以後のL3／v4／L11追加差分はこの実行には含まれない。

- `resident-lane-orchestration-requests.md`、`docs/governance/README.md`：`l12-hybrid-recognition`がreviewed dispositionを要求。
- `hybrid-rebaseline-v0.5.0-remediation-delta.md`、`pillar-requirements.md`：`l3-progression-authority`がdigest mismatchを検出。

ほかにbranch-kind、design-coverage、hook trust、project-current-location、review receipt読取り、
green-command evidence欠落の診断がある。変更前との同条件比較は未実施のため、既存不具合と断定しない。
全文doctorの合格、独立review済み、全要求監査完了は主張しない。reviewed dispositionのdigest登録は更新していない。
上記の分類参照digest更新とは区別する。

対象別要求とHMC／AAFD／RCLS／PPS／CLR移管後に、Node 24.15.0で
`node_modules/.bin/vitest run tests/vmodel-pair.test.ts`を実行し、57件成功・exit 0を確認した。
`git diff --check`もexit 0。前者は既存pair構造検査であり、候補条件の意味網羅、JSON移管、L11実操作受入、doctor全体の合格を証明しない。

## 対象別整理後の横断検査

153のcanonical要求IDを3対応表で過不足・重複なく参照していること、追補14契約の対応、
HARNESS6／OS9／Web8のL2・L11 ID集合と双方向pair path一致、対象要求文書群の106リンクの存在を確認した。
`git diff -- requirements-ir config/requirement-ir-authority.json`は差分なし。canonical JSONの意味是正は未実施である。
これらは構造と配置の検証であり、全条件の意味被覆や利用者受入の証明ではない。

横断テスト実行は69件中68件成功・1件失敗。要求authority検査は成功したが、L2フォルダへ置いた監査5文書が
pair-missingとなった。監査資料と是正proposalを`docs/governance/audits/l2-requirements/`へ移し、相対参照を更新した。
配置是正後の`tests/vmodel-pair.test.ts`は57件成功・exit 0。監査資料に架空のL11を追加したり、検査を弱めたりして解消していない。
移動後の監査文書の参照先も存在確認済み。要求の意味是正・正本transactionの未完状態は変わらない。
