# confirmed175 条件比較: GD-01 / HM-01..08

## 目的と境界

基準main `105b9221f4de481ba59945be6df5cdd21f4358a3`で、旧screen要求9 identityを旧source/consumer詳細から固定L2/L11 revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`へ条件単位で照合した読み取り専用記録。採択・successor・closure・実装済みの主張はしない。旧CLI/runtime/CI/testは実行していない。

## 選定と重複検査

- QueueではGD-01とHM-01..08の9件すべてが `not_individually_compared`、既存evidenceは空。source-qualified identityで重複を検査し、既存screen個票PM-02..06との重複は0件。
- 初期候補FR-L1-36..44は、既存個票 `legacy-confirmed175-fr-l1-20-37-38-39-43-condition-audit-2026-09-30` がFR37/38/39/43を含むと判明したため取り下げた。FR36/40/41/42/44だけでは連続群にならない。
- 本群はscreen source内でGD-01と連続するHM-01..08。今回のsource-qualified identityは9件、重複なし。main `105b9221f4de481ba59945be6df5cdd21f4358a3`に存在する#2415/#2416/#2417の3個票もarchive path/file SHA/physical line/line SHAとidentityで再照合し、source-qualified overlapは全件0。各artifact SHAと行pinはJSONの`selection_and_duplicate_scan.post_merge_source_qualified_scan`に記録した。

## 個票

### GD-01

Source-qualified identity: `harness/L1-requirements/screen-requirements.md::GD-01`; queue status: `not_individually_compared`.

- 旧source `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/screen-requirements.md:240` line SHA-256 `231c62b933bd28f53fc1c71fe2b8c4a357449a3d74e725e7aaa5f3f9b5e717ba`: | **GD-01** | ガイド/ドキュメント統合ビュー | 左サイドナビ切替による静的知識ベース提供 | UX-03 / FR-L1-29 / FR-L1-44 |
- 旧source詳細 `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/screen-requirements.md:242` line SHA-256 `e0a4d8a9410fd0c525a3dc6920750c8d581f2eb9814bb7f1fc826dc010266587`; file SHA-256 `e5b6964567242a2440ded28ed99c1783f37a9326624c02283c7a975c3020063b`
- 旧L3 consumerのsource line SHA:
  - `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md:64` SHA-256 `3410f2690b471de5940c180ebc49d0343e52d54c730795d251c214820f9274e7` — | FR-27 | FR-L1-27 (workflow core、A-50) | GD-01 (ADR) / PM-02 | Research (主) | all | ADR 採用判断 (PO/TL) / generates skip 判断 |
- 旧consumer詳細: 旧§1.GD.01と§1.GDの静的知識ベース: Troubleshooting/Architecture/Onboarding/Tutorial/CLI Reference/FAQ/Changelogの左ナビ、Markdown本文、内部・外部docリンク、手動更新。検索はPhase B。ページ未存在は404。Learning Engine半自動更新はPhase B carry。
- 固定L2/L11参照:
  - **HARNESS-L2-019** (po_fixed_candidate_adopted)
    - `docs/helix-harness/L11-acceptance/product-acceptance.md:214` SHA-256 `5ea5e138c43ec73f080c8e4cc7e0032e01e2cdd8aff94ffe3f9288378419e376` — | HARNESS-L2-019 | 既存の要件・コード・PoCを持ち込み、どのリリース単位からでも入れ、変換の結果と、変換できなかった部分・由来の不明な部分の一覧が出る | 変換の結果を承認済みの要求・設計とする／変換できない部分を推定で埋める／入る先の単位を限る |
    - `docs/helix-harness/L2-requirements/product-requirements.md:333` SHA-256 `3a4f85c21226b57ec3b31dde122ab7572975f6b87b261c3e074c5886e2ec94c8` — | HARNESS-L2-019 | 単体（入口：フルリバース） | HARNESS-L1-003／HARNESS-L1-005 |
    - `docs/helix-harness/L2-requirements/product-requirements.md:419` SHA-256 `b71e05b82d9ba22df34f471b04bdf935f5143dabd7e24f740cb869fb6570f843` — ### HARNESS-L2-019 入口：フルリバース（単体）
  - **HARNESS-L2-001** (inside_po_fixed_l2_l11_bytes)
    - `docs/helix-harness/L11-acceptance/product-acceptance.md:21` SHA-256 `c4c9fa75277a9296c40e4dd1d443b58fe0edc36e1ef3d85bb1234408a0b928e1` — | HARNESS-L2-001 | L1–L12の成果と対を確認し、L2／L11とL3／L10の混同、片側欠落を識別できる。L2.5（Prototype・PoC）の結果を要求の合意と取り違えず、L2.5を飛ばした対象でも非適用の判定と理由が残る |
    - `docs/helix-harness/L2-requirements/product-requirements.md:40` SHA-256 `92bf45a12c93b0d0f566a0f82e33ad3d7349bdeb002e7445ecbc9fbf2655f72b` — | HARNESS-L2-001 | HARNESS-L1-001 |
    - `docs/helix-harness/L2-requirements/product-requirements.md:52` SHA-256 `19bc5f0236524bedabfd9c1ff2729b90699b4d2b0be0834f0ff11bbf8feb5e0e` — | HARNESS-L2-001 | 企画・要求・L2.5（Prototype・PoC）・要件・設計・実装・検証をL1–L12と正規V-pairで構成できる。画面や不確定要素のない対象ではL2.5を飛ばせる | v1.3 §2、HBR-P3、2026-09-24 PO判断 | L2要求とL11受入、L3要件とL10総合検証を混同せず、各層の成果と対が分かる。L2.5の結果を要求の合意と区別する |
    - `docs/helix-harness/L2-requirements/product-requirements.md:99` SHA-256 `178f3e8474016b318a3bef7238cc79f993151558adbde462afb2d0559076d15d` — | HARNESS-L2-001 | 正規pairはL1↔L12、L2↔L11、L3↔L10、L4↔L9、L5↔L8、L6↔L7。L0 charterは層外の上位根拠とし、旧物理pathの層番号を現行pairへ混入させない |
  - **HARNESS-L2-004** (inside_po_fixed_l2_l11_bytes)
    - `docs/helix-harness/L11-acceptance/product-acceptance.md:24` SHA-256 `2d548b5f31549a87687144145601848ec08fdd46311b50c3a05145d234f6609a` — | HARNESS-L2-004 | 要求変更から影響する設計・テストと再検証の範囲が導出され、変更した条件の検証漏れを識別できる |
    - `docs/helix-harness/L2-requirements/product-requirements.md:43` SHA-256 `88d505fd37dfbdd8d7c7df754b42a3ee0d8398da5c317dd26a9023cd1b6aa9ba` — | HARNESS-L2-004 | HARNESS-L1-003／HARNESS-L1-004／HARNESS-L1-006 |
    - `docs/helix-harness/L2-requirements/product-requirements.md:55` SHA-256 `7b09279d1e75c221cdc85f551026a6110496c42770c4721ad42e74acdcdd6006` — | HARNESS-L2-004 | 要求から設計・テストへの対応と、変更時の再検証範囲を導出できる | HBR-P3／P9、2026-09-24 PO判断 | 上下流traceとV-pairの欠落を識別し、変更した要求が検証から落ちない |
    - `docs/helix-harness/L2-requirements/product-requirements.md:114` SHA-256 `193360a5a5427242f2dc9e0df454508dee329ae07c2fd14ee63493b5b18ae8eb` — | HARNESS-L2-004 | 要求変更・public contract変更・設計trace欠落等の際は、影響する設計と対検証へ差し戻す。Scrumの実装事実もreview・release合流前に設計資産へ戻し、必要なpair凍結を確認する |
    - `docs/helix-harness/L2-requirements/product-requirements.md:117` SHA-256 `ab2b23fa7b1e333de3fa60239b371c4f42a6b54aed5cef65a5f9c8824a4866f2` — | HARNESS-L2-004 | [2026-09-26 PO判断](../../governance/decisions/harness-v-valley-process-po-decisions-2026-09-26.md)に従い、変更の影響は、要求・設計・検証の間のrelationから導く。証拠と影響はrelationを通じて上へ伝えるが、変更された下の構造の成立の状態を、上の構造へそのまま伝えない（単体の変更から接続や構成体をfailedにしない）。影響の状態をAffected、Unaffected、Unknownで区別し、成立の状態と混同しない。UnknownをUnaffectedとして扱わず、再検証の結果によってだけ、その構造の成立の状態を改める。旧AAFD（`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/agentic-audit-future-state-delta-acceptance.md:20-25,42`）の、影響を受けた集合だけを扱いunknownを補完しない条件を保ち、単体・接続・構成体のrelationへ当てる |
    - `docs/helix-harness/L2-requirements/product-requirements.md:195` SHA-256 `ece1218b189bed89be2ceed63ef17ab338125b19eababffe1ad30b82b05e3e5c` — | HARNESS-L2-004 | RFA-BR-03、DGH-BR-02 | 変更の影響要求・設計・対検証を再確定し、影響しない有効作業を一律失効させない |
  - **HARNESS-L2-005** (inside_po_fixed_l2_l11_bytes)
    - `docs/helix-harness/L11-acceptance/product-acceptance.md:25` SHA-256 `edeceea2b54fe31fe92460f610e19a49e32fde6a2d7a57c51d98c9b9afcbe371` — | HARNESS-L2-005 | ticketとの関係（Forward 小・中・大、V字の対、触るコネクタ、変更の種類）と、変更の内容・layer・riskから必要な検証が導出され、固定の段数ではなくその検証に合うCIをPRの前に組み立てる規則が導かれ、HELIX-OSの検収がその規則でCIを組み立てられる。省いた検査は記録され、合流先のticketで回収される。異なる言語・CI実装でも同じ検証契約を評価でき、特定Worker、旧job集合、CI greenを検証義務の代替にしない |
    - `docs/helix-harness/L2-requirements/product-requirements.md:44` SHA-256 `74fae9aa240f21074a24e5da08c19dba8ac26389d1c473f6f979ed3b789f0d1c` — | HARNESS-L2-005 | HARNESS-L1-004 |
    - `docs/helix-harness/L2-requirements/product-requirements.md:56` SHA-256 `7840e6369db64bfe553628e2cb0c5cafcd8537266b2637e64e5c9789778f81e4` — | HARNESS-L2-005 | ticketとの関係（Forward 小・中・大、V字の対、触るコネクタ、変更の種類）と、変更の内容・layer・riskから必要な検証義務と証拠条件を導出し、PRの前に回すCIを動的に組み立てるための規則を定められる。CIの組み立てと運転はHELIX-OSの検収が行う。言語・tool・実装方式に依存しない | HNFR-P3、v1.3 §4、旧GH-FR-025、新世代CI要求候補、2026-09-24 PO判断、[2026-09-26 PO判断](../../governance/decisions/harness-v-valley-process-po-decisions-2026-09-26.md) | CIの段数を固定せず、特定CIやWorkerに依存せず、対象revision、oracle、expected failure、証拠、有効期限、差戻し先を説明できる。全件の実行を既定にせず、省いた検査を記録して合流先のticketで回収する |
    - `docs/helix-harness/L2-requirements/product-requirements.md:118` SHA-256 `a84e1a518adfcb06d2a79c542160c401b3ad2e046f5dbe160ebdbc136c2db815` — | HARNESS-L2-005 | [2026-09-26 PO判断](../../governance/decisions/harness-v-valley-process-po-decisions-2026-09-26.md)に従い、検証の義務を構造の粒度ごとに別に導く。単体は単体の検証、接続は境界・結合の検証、構成体はシステムの検証とし、上の構造は固有のoracle、expected failure、証拠の条件を持つ。下の証明は上の証明の証拠として積み上げ、上の構造では、固有の義務との差分だけを証明する（構成的保証と差分証明）。すべての単体の合格は接続の前提の証拠であり、接続に固有の義務を満たして接続の合格となる。構成体も同じとする。下の証明と組み合わせの契約がそろい、未解決の構成体に固有の義務がないことをHARNESSの契約で示せるときは、構成体の合格を機械的に導いてよく、大きな端から端までの検証をやり直さない。構成体に固有の非機能（例：システム全体の応答時間）のように下の証明で表せない義務は、別に証明する |
    - `docs/helix-harness/L2-requirements/product-requirements.md:119` SHA-256 `bf3b23aa56993cf034e77229328dfeab07be101dc557846dcee285468d7fb82e` — | HARNESS-L2-005 | [2026-09-26 PO判断](../../governance/decisions/harness-v-valley-process-po-decisions-2026-09-26.md)に従い、PRの前に回すCIは、ticketとの関係から決める。Forward 小は原子CI、Forward 中は境界の証明（触ったコネクタの契約を含む）、Forward 大はシステムの証明を基本とする。認証、DBのmigration、security、releaseの変更のように危険度の高い変更は、小さな変更でも上の証明を早めに求める。mainの健全性は、変更がticketの範囲を超えていないかの確認で保ち、範囲の外への変更があれば止める。merge直後の全件実行と夜間の補完は既定にしない。省いた検査は記録し、合流先のticket（Forward 小は中か大、中は大）で回収する。回収されないまま残っていれば、Release Portで止める。影響が広がる密結合が見つかったら、その変更で影響する接続・構成体の検査をそのPRで広げ、成立するまで合流させない。そのうえで、CIを恒常的に重くして守らず、設計の不具合としてDesign-refactorを発行して結合を切る。検査をすり抜けて後で見つかった失敗は、HELIX-LABOが振り返り、原子CIやコネクタの契約が足りているかを評価して返す |
    - `docs/helix-harness/L2-requirements/product-requirements.md:120` SHA-256 `da55ac17a732605dd6cb45a28e31ae534179bfd870e1d2536b3a4b6cc1c78be6` — | HARNESS-L2-005 | 旧GH-FR-025（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/github-atomic-development-requirements.md:29,52-62`）は、PRでは影響範囲だけを検査し、省いた検査の集合を記録して、main合流の直後に全件で回収し、夜間に欠落を補完し、危険度の高い変更は最初から全件にしていた。保持する点は、影響する範囲だけを選ぶこと、省いた検査を記録して黙って捨てないこと、危険度の高い変更を軽い検査で通さないことである。変更する点は、範囲を決める元を変更の差分からticketへ移すこと、回収の場所をmerge直後の全件実行から合流先のticketへ移すこと、夜間の補完をやめることである。理由は、POの「既存の方式はちょっと推進が遅いから」と、危険度の高い変更の原因が密結合だったことである |
    - `docs/helix-harness/L2-requirements/product-requirements.md:121` SHA-256 `164544023a6646eda7f073c3dbd7b30b1fc33e1bb33b5d5649be7305ae15a923` — | HARNESS-L2-005 | 検証条件には対象要求revision、成果物、入力、oracle、expected failure、実結果、証拠の有効期限、差戻し先を含める。required／conditional／informational／N/Aを理由付きで区別し、unknownをskipへ変換しない。CI成功・画面表示・文書登録だけを利用者受入や全工程完了の証拠にしない |
- 保持: 現行HARNESS-L2-001/004/005は文書・要求・変更・検証の関係と未確定情報の扱いを保持し、HARNESS-L2-019は要求と既存資産・未知/変換不能項目を取り込む境界を定義する。
- 変更/非継承: 現行は要求/資産のsource・scope・状態を正本へ結び、旧静的Knowledge Base画面/左ナビ/Markdownレンダラを固定受入にしていない。旧GUI実装・CLI Referenceの旧CLI内容は移さない。
- 数値・例外・反例: 旧要求内で「静的更新・Phase B半自動更新」の二段階、search Phase B、missing page=404が明記される。GD-01の上位行はUX-03/FR29/FR44、詳細カテゴリの束はFR19/27/32/44等で一致しておらず、画面内traceに内部差分がある。
- 未対応残差: カテゴリ構成・左nav/deep link/searchのPhase B境界・404・更新責務・Onboardingの具体的有用性はL2/L11に同一画面ACとしてない。HARNESS-L2-019の要求/資産intakeは既存repo向けbaseline view・setup workflow同等としない。
- 採択状態: 現行f6固定L2/L11文書のPO合意/候補採択状態を参照。画面要求の個別採択状態や実装済みを意味しない。後発57+11にsource-qualified legacy identityとの完全一致なし。
- 状態: `open_partial_correspondence`、successorなし、authority effect `none`。

### HM-01

Source-qualified identity: `harness/L1-requirements/screen-requirements.md::HM-01`; queue status: `not_individually_compared`.

- 旧source `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/screen-requirements.md:133` line SHA-256 `7f4e66676e84db409f0c80f0bacf84f0857499d43d3b363986e334e530f38c8c`: | **HM-01** | 機能一覧ビュー | FR-L1 51 件 × implementation_status 可視化 (3 階層プルダウン) | FR-L1-20 / FR-L1-29 |
- 旧source詳細 `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/screen-requirements.md:142` line SHA-256 `2aec83a7fb8b1cf0b43a098f6b64ad73bf02b9ef25564608373d621afef0502c`; file SHA-256 `e5b6964567242a2440ded28ed99c1783f37a9326624c02283c7a975c3020063b`
- 旧L3 consumerのsource line SHA:
  - `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md:45` SHA-256 `fa329048565f735b9519c542074631cf313efffda2d474987c63985243b0cbbc` — | FR-04 | FR-L1-04 | PM-02 / HM-01 | 全 mode | all | kind 不明時の選定 (TL) |
  - `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md:47` SHA-256 `c49412853db62d4f17348d7581c2212cb58a8e15618892b45aa381dbe02e449f` — | FR-06 | FR-L1-06 | HM-04 / HM-01 | 全 mode | all (drive 別区画 = FR-L1-40 連動) | state 不整合検出時の手動修正 (運用者) |
- 旧consumer詳細: §1.HM.01: FR-L1全51件をimplementation_status=installed/partial/not-implemented、担当PLAN、対応画面で3階層（整備率%→P0/P1/P2→FR個別）表示。行クリックからPLAN・画面要求・PM-06 preview、status/priority filter、未実装export。30秒poll、緑/黄/赤/空。詳細§1. HM-01 table says FR20/29; screen §5 trace and cross refs differ.
- 固定L2/L11参照:
  - **HARNESS-L2-004** (inside_po_fixed_l2_l11_bytes)
    - `docs/helix-harness/L11-acceptance/product-acceptance.md:24` SHA-256 `2d548b5f31549a87687144145601848ec08fdd46311b50c3a05145d234f6609a` — | HARNESS-L2-004 | 要求変更から影響する設計・テストと再検証の範囲が導出され、変更した条件の検証漏れを識別できる |
    - `docs/helix-harness/L2-requirements/product-requirements.md:43` SHA-256 `88d505fd37dfbdd8d7c7df754b42a3ee0d8398da5c317dd26a9023cd1b6aa9ba` — | HARNESS-L2-004 | HARNESS-L1-003／HARNESS-L1-004／HARNESS-L1-006 |
    - `docs/helix-harness/L2-requirements/product-requirements.md:55` SHA-256 `7b09279d1e75c221cdc85f551026a6110496c42770c4721ad42e74acdcdd6006` — | HARNESS-L2-004 | 要求から設計・テストへの対応と、変更時の再検証範囲を導出できる | HBR-P3／P9、2026-09-24 PO判断 | 上下流traceとV-pairの欠落を識別し、変更した要求が検証から落ちない |
    - `docs/helix-harness/L2-requirements/product-requirements.md:114` SHA-256 `193360a5a5427242f2dc9e0df454508dee329ae07c2fd14ee63493b5b18ae8eb` — | HARNESS-L2-004 | 要求変更・public contract変更・設計trace欠落等の際は、影響する設計と対検証へ差し戻す。Scrumの実装事実もreview・release合流前に設計資産へ戻し、必要なpair凍結を確認する |
    - `docs/helix-harness/L2-requirements/product-requirements.md:117` SHA-256 `ab2b23fa7b1e333de3fa60239b371c4f42a6b54aed5cef65a5f9c8824a4866f2` — | HARNESS-L2-004 | [2026-09-26 PO判断](../../governance/decisions/harness-v-valley-process-po-decisions-2026-09-26.md)に従い、変更の影響は、要求・設計・検証の間のrelationから導く。証拠と影響はrelationを通じて上へ伝えるが、変更された下の構造の成立の状態を、上の構造へそのまま伝えない（単体の変更から接続や構成体をfailedにしない）。影響の状態をAffected、Unaffected、Unknownで区別し、成立の状態と混同しない。UnknownをUnaffectedとして扱わず、再検証の結果によってだけ、その構造の成立の状態を改める。旧AAFD（`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/agentic-audit-future-state-delta-acceptance.md:20-25,42`）の、影響を受けた集合だけを扱いunknownを補完しない条件を保ち、単体・接続・構成体のrelationへ当てる |
    - `docs/helix-harness/L2-requirements/product-requirements.md:195` SHA-256 `ece1218b189bed89be2ceed63ef17ab338125b19eababffe1ad30b82b05e3e5c` — | HARNESS-L2-004 | RFA-BR-03、DGH-BR-02 | 変更の影響要求・設計・対検証を再確定し、影響しない有効作業を一律失効させない |
  - **HARNESS-L2-005** (inside_po_fixed_l2_l11_bytes)
    - `docs/helix-harness/L11-acceptance/product-acceptance.md:25` SHA-256 `edeceea2b54fe31fe92460f610e19a49e32fde6a2d7a57c51d98c9b9afcbe371` — | HARNESS-L2-005 | ticketとの関係（Forward 小・中・大、V字の対、触るコネクタ、変更の種類）と、変更の内容・layer・riskから必要な検証が導出され、固定の段数ではなくその検証に合うCIをPRの前に組み立てる規則が導かれ、HELIX-OSの検収がその規則でCIを組み立てられる。省いた検査は記録され、合流先のticketで回収される。異なる言語・CI実装でも同じ検証契約を評価でき、特定Worker、旧job集合、CI greenを検証義務の代替にしない |
    - `docs/helix-harness/L2-requirements/product-requirements.md:44` SHA-256 `74fae9aa240f21074a24e5da08c19dba8ac26389d1c473f6f979ed3b789f0d1c` — | HARNESS-L2-005 | HARNESS-L1-004 |
    - `docs/helix-harness/L2-requirements/product-requirements.md:56` SHA-256 `7840e6369db64bfe553628e2cb0c5cafcd8537266b2637e64e5c9789778f81e4` — | HARNESS-L2-005 | ticketとの関係（Forward 小・中・大、V字の対、触るコネクタ、変更の種類）と、変更の内容・layer・riskから必要な検証義務と証拠条件を導出し、PRの前に回すCIを動的に組み立てるための規則を定められる。CIの組み立てと運転はHELIX-OSの検収が行う。言語・tool・実装方式に依存しない | HNFR-P3、v1.3 §4、旧GH-FR-025、新世代CI要求候補、2026-09-24 PO判断、[2026-09-26 PO判断](../../governance/decisions/harness-v-valley-process-po-decisions-2026-09-26.md) | CIの段数を固定せず、特定CIやWorkerに依存せず、対象revision、oracle、expected failure、証拠、有効期限、差戻し先を説明できる。全件の実行を既定にせず、省いた検査を記録して合流先のticketで回収する |
    - `docs/helix-harness/L2-requirements/product-requirements.md:118` SHA-256 `a84e1a518adfcb06d2a79c542160c401b3ad2e046f5dbe160ebdbc136c2db815` — | HARNESS-L2-005 | [2026-09-26 PO判断](../../governance/decisions/harness-v-valley-process-po-decisions-2026-09-26.md)に従い、検証の義務を構造の粒度ごとに別に導く。単体は単体の検証、接続は境界・結合の検証、構成体はシステムの検証とし、上の構造は固有のoracle、expected failure、証拠の条件を持つ。下の証明は上の証明の証拠として積み上げ、上の構造では、固有の義務との差分だけを証明する（構成的保証と差分証明）。すべての単体の合格は接続の前提の証拠であり、接続に固有の義務を満たして接続の合格となる。構成体も同じとする。下の証明と組み合わせの契約がそろい、未解決の構成体に固有の義務がないことをHARNESSの契約で示せるときは、構成体の合格を機械的に導いてよく、大きな端から端までの検証をやり直さない。構成体に固有の非機能（例：システム全体の応答時間）のように下の証明で表せない義務は、別に証明する |
    - `docs/helix-harness/L2-requirements/product-requirements.md:119` SHA-256 `bf3b23aa56993cf034e77229328dfeab07be101dc557846dcee285468d7fb82e` — | HARNESS-L2-005 | [2026-09-26 PO判断](../../governance/decisions/harness-v-valley-process-po-decisions-2026-09-26.md)に従い、PRの前に回すCIは、ticketとの関係から決める。Forward 小は原子CI、Forward 中は境界の証明（触ったコネクタの契約を含む）、Forward 大はシステムの証明を基本とする。認証、DBのmigration、security、releaseの変更のように危険度の高い変更は、小さな変更でも上の証明を早めに求める。mainの健全性は、変更がticketの範囲を超えていないかの確認で保ち、範囲の外への変更があれば止める。merge直後の全件実行と夜間の補完は既定にしない。省いた検査は記録し、合流先のticket（Forward 小は中か大、中は大）で回収する。回収されないまま残っていれば、Release Portで止める。影響が広がる密結合が見つかったら、その変更で影響する接続・構成体の検査をそのPRで広げ、成立するまで合流させない。そのうえで、CIを恒常的に重くして守らず、設計の不具合としてDesign-refactorを発行して結合を切る。検査をすり抜けて後で見つかった失敗は、HELIX-LABOが振り返り、原子CIやコネクタの契約が足りているかを評価して返す |
    - `docs/helix-harness/L2-requirements/product-requirements.md:120` SHA-256 `da55ac17a732605dd6cb45a28e31ae534179bfd870e1d2536b3a4b6cc1c78be6` — | HARNESS-L2-005 | 旧GH-FR-025（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/github-atomic-development-requirements.md:29,52-62`）は、PRでは影響範囲だけを検査し、省いた検査の集合を記録して、main合流の直後に全件で回収し、夜間に欠落を補完し、危険度の高い変更は最初から全件にしていた。保持する点は、影響する範囲だけを選ぶこと、省いた検査を記録して黙って捨てないこと、危険度の高い変更を軽い検査で通さないことである。変更する点は、範囲を決める元を変更の差分からticketへ移すこと、回収の場所をmerge直後の全件実行から合流先のticketへ移すこと、夜間の補完をやめることである。理由は、POの「既存の方式はちょっと推進が遅いから」と、危険度の高い変更の原因が密結合だったことである |
    - `docs/helix-harness/L2-requirements/product-requirements.md:121` SHA-256 `164544023a6646eda7f073c3dbd7b30b1fc33e1bb33b5d5649be7305ae15a923` — | HARNESS-L2-005 | 検証条件には対象要求revision、成果物、入力、oracle、expected failure、実結果、証拠の有効期限、差戻し先を含める。required／conditional／informational／N/Aを理由付きで区別し、unknownをskipへ変換しない。CI成功・画面表示・文書登録だけを利用者受入や全工程完了の証拠にしない |
  - **HELIXOS-L2-015** (po_fixed_candidate_adopted)
    - `docs/helix-os/L11-acceptance/governance-acceptance.md:320` SHA-256 `08e8c23d35394421a9648a364cae7a95711c86421ce6b9f942ad595a69b0d1cf` — ## HELIX-OS機能単位パックの受入候補（HELIXOS-L2-015〜025）
    - `docs/helix-os/L11-acceptance/governance-acceptance.md:324` SHA-256 `7a9013b9883ef3a38f8d1eb4b3dade78fb0db3bfc5a0ba7e8d9ecdddd5dfe1a7` — ### HELIXOS-L2-015 管理・authority記録の受入
    - `docs/helix-os/L2-requirements/governance-requirements.md:642` SHA-256 `1f89e6f1f9b7335b321c2a93b33c882149fe7798629ed97fd8d7cc8f556e80c7` — ### HELIXOS-L2-015 管理・authority記録（単体候補）
  - **HELIXOS-L2-019** (po_fixed_candidate_adopted)
    - `docs/helix-os/L11-acceptance/governance-acceptance.md:352` SHA-256 `241fbb855d59c68e2624fb6a90314819e38992edf467f73a8fdb73ca5e0fc332` — ### HELIXOS-L2-019 Evidence・continuityの受入
    - `docs/helix-os/L2-requirements/governance-requirements.md:682` SHA-256 `87db5d2abcbbaf27d5f9a74a85b9ceaac78965271d1af849a37a305ce30388ab` — ### HELIXOS-L2-019 Evidence・continuity（単体候補）
- 保持: HARNESS-L2-004の上下流trace/変更再検証範囲、HARNESS-L2-005の必要な検証義務と証拠条件が限定的に隣接する。
- 変更/非継承: 現行のtrace/verification scopeを扱うが旧51行のimplementation_status分類や整備率 dashboardは固定されていない。
- 数値・例外・反例: 全51件、3階層、30秒、3色+empty、PM-06からの画面要求preview/exportが具体条件。statusと設計traceは区別する。
- 未対応残差: 51行母集団の状態投影、割合計算、PLAN/screen deep links、polling、未実装export、各色の数値境界は未対応。旧FR number/CLI/UI実装は非継承。
- 採択状態: 現行f6固定L2/L11文書のPO合意/候補採択状態を参照。画面要求の個別採択状態や実装済みを意味しない。後発57+11にsource-qualified legacy identityとの完全一致なし。
- 状態: `open_partial_correspondence`、successorなし、authority effect `none`。

### HM-02

Source-qualified identity: `harness/L1-requirements/screen-requirements.md::HM-02`; queue status: `not_individually_compared`.

- 旧source `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/screen-requirements.md:134` line SHA-256 `731f01dd27b315d1d2a8c5e055b6736091a928223d4ef0fd9aab140ca4f5f58c`: | **HM-02** | カバレッジヒートマップビュー | 機能可視化・弱点診断 (観点 8 × 軸 5 = 40 通り heat map) | FR-L1-12 / BR-06 |
- 旧source詳細 `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/screen-requirements.md:153` line SHA-256 `a8071d6e450d6fb2875b5b8db15ca9c6223959a9fd701e7eeefdec7ac9576fb7`; file SHA-256 `e5b6964567242a2440ded28ed99c1783f37a9326624c02283c7a975c3020063b`
- 旧L3 consumerのsource line SHA:
  - `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md:53` SHA-256 `1cebab885419e5beaa7bd0be8140ce6136a7d76e2425d9b648522d764aaa8cb0` — | FR-12 | FR-L1-12 | HM-05 / HM-02 | 全 mode | all (drive 別 skill 選定) | skill 推奨 override (TL) |
- 旧consumer詳細: §1.HM.02: 8観点(skill/command/detector/template/state/hook/docs/tests)×5軸(L/drive/mode/phase/BR-FR)=40セルheat map、色密度、cell clickで不足項目/起票候補生成、観点/軸filter、30秒poll、高/中/低/未集計。
- 固定L2/L11参照:
  - **HARNESS-L2-004** (inside_po_fixed_l2_l11_bytes)
    - `docs/helix-harness/L11-acceptance/product-acceptance.md:24` SHA-256 `2d548b5f31549a87687144145601848ec08fdd46311b50c3a05145d234f6609a` — | HARNESS-L2-004 | 要求変更から影響する設計・テストと再検証の範囲が導出され、変更した条件の検証漏れを識別できる |
    - `docs/helix-harness/L2-requirements/product-requirements.md:43` SHA-256 `88d505fd37dfbdd8d7c7df754b42a3ee0d8398da5c317dd26a9023cd1b6aa9ba` — | HARNESS-L2-004 | HARNESS-L1-003／HARNESS-L1-004／HARNESS-L1-006 |
    - `docs/helix-harness/L2-requirements/product-requirements.md:55` SHA-256 `7b09279d1e75c221cdc85f551026a6110496c42770c4721ad42e74acdcdd6006` — | HARNESS-L2-004 | 要求から設計・テストへの対応と、変更時の再検証範囲を導出できる | HBR-P3／P9、2026-09-24 PO判断 | 上下流traceとV-pairの欠落を識別し、変更した要求が検証から落ちない |
    - `docs/helix-harness/L2-requirements/product-requirements.md:114` SHA-256 `193360a5a5427242f2dc9e0df454508dee329ae07c2fd14ee63493b5b18ae8eb` — | HARNESS-L2-004 | 要求変更・public contract変更・設計trace欠落等の際は、影響する設計と対検証へ差し戻す。Scrumの実装事実もreview・release合流前に設計資産へ戻し、必要なpair凍結を確認する |
    - `docs/helix-harness/L2-requirements/product-requirements.md:117` SHA-256 `ab2b23fa7b1e333de3fa60239b371c4f42a6b54aed5cef65a5f9c8824a4866f2` — | HARNESS-L2-004 | [2026-09-26 PO判断](../../governance/decisions/harness-v-valley-process-po-decisions-2026-09-26.md)に従い、変更の影響は、要求・設計・検証の間のrelationから導く。証拠と影響はrelationを通じて上へ伝えるが、変更された下の構造の成立の状態を、上の構造へそのまま伝えない（単体の変更から接続や構成体をfailedにしない）。影響の状態をAffected、Unaffected、Unknownで区別し、成立の状態と混同しない。UnknownをUnaffectedとして扱わず、再検証の結果によってだけ、その構造の成立の状態を改める。旧AAFD（`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/agentic-audit-future-state-delta-acceptance.md:20-25,42`）の、影響を受けた集合だけを扱いunknownを補完しない条件を保ち、単体・接続・構成体のrelationへ当てる |
    - `docs/helix-harness/L2-requirements/product-requirements.md:195` SHA-256 `ece1218b189bed89be2ceed63ef17ab338125b19eababffe1ad30b82b05e3e5c` — | HARNESS-L2-004 | RFA-BR-03、DGH-BR-02 | 変更の影響要求・設計・対検証を再確定し、影響しない有効作業を一律失効させない |
  - **HARNESS-L2-005** (inside_po_fixed_l2_l11_bytes)
    - `docs/helix-harness/L11-acceptance/product-acceptance.md:25` SHA-256 `edeceea2b54fe31fe92460f610e19a49e32fde6a2d7a57c51d98c9b9afcbe371` — | HARNESS-L2-005 | ticketとの関係（Forward 小・中・大、V字の対、触るコネクタ、変更の種類）と、変更の内容・layer・riskから必要な検証が導出され、固定の段数ではなくその検証に合うCIをPRの前に組み立てる規則が導かれ、HELIX-OSの検収がその規則でCIを組み立てられる。省いた検査は記録され、合流先のticketで回収される。異なる言語・CI実装でも同じ検証契約を評価でき、特定Worker、旧job集合、CI greenを検証義務の代替にしない |
    - `docs/helix-harness/L2-requirements/product-requirements.md:44` SHA-256 `74fae9aa240f21074a24e5da08c19dba8ac26389d1c473f6f979ed3b789f0d1c` — | HARNESS-L2-005 | HARNESS-L1-004 |
    - `docs/helix-harness/L2-requirements/product-requirements.md:56` SHA-256 `7840e6369db64bfe553628e2cb0c5cafcd8537266b2637e64e5c9789778f81e4` — | HARNESS-L2-005 | ticketとの関係（Forward 小・中・大、V字の対、触るコネクタ、変更の種類）と、変更の内容・layer・riskから必要な検証義務と証拠条件を導出し、PRの前に回すCIを動的に組み立てるための規則を定められる。CIの組み立てと運転はHELIX-OSの検収が行う。言語・tool・実装方式に依存しない | HNFR-P3、v1.3 §4、旧GH-FR-025、新世代CI要求候補、2026-09-24 PO判断、[2026-09-26 PO判断](../../governance/decisions/harness-v-valley-process-po-decisions-2026-09-26.md) | CIの段数を固定せず、特定CIやWorkerに依存せず、対象revision、oracle、expected failure、証拠、有効期限、差戻し先を説明できる。全件の実行を既定にせず、省いた検査を記録して合流先のticketで回収する |
    - `docs/helix-harness/L2-requirements/product-requirements.md:118` SHA-256 `a84e1a518adfcb06d2a79c542160c401b3ad2e046f5dbe160ebdbc136c2db815` — | HARNESS-L2-005 | [2026-09-26 PO判断](../../governance/decisions/harness-v-valley-process-po-decisions-2026-09-26.md)に従い、検証の義務を構造の粒度ごとに別に導く。単体は単体の検証、接続は境界・結合の検証、構成体はシステムの検証とし、上の構造は固有のoracle、expected failure、証拠の条件を持つ。下の証明は上の証明の証拠として積み上げ、上の構造では、固有の義務との差分だけを証明する（構成的保証と差分証明）。すべての単体の合格は接続の前提の証拠であり、接続に固有の義務を満たして接続の合格となる。構成体も同じとする。下の証明と組み合わせの契約がそろい、未解決の構成体に固有の義務がないことをHARNESSの契約で示せるときは、構成体の合格を機械的に導いてよく、大きな端から端までの検証をやり直さない。構成体に固有の非機能（例：システム全体の応答時間）のように下の証明で表せない義務は、別に証明する |
    - `docs/helix-harness/L2-requirements/product-requirements.md:119` SHA-256 `bf3b23aa56993cf034e77229328dfeab07be101dc557846dcee285468d7fb82e` — | HARNESS-L2-005 | [2026-09-26 PO判断](../../governance/decisions/harness-v-valley-process-po-decisions-2026-09-26.md)に従い、PRの前に回すCIは、ticketとの関係から決める。Forward 小は原子CI、Forward 中は境界の証明（触ったコネクタの契約を含む）、Forward 大はシステムの証明を基本とする。認証、DBのmigration、security、releaseの変更のように危険度の高い変更は、小さな変更でも上の証明を早めに求める。mainの健全性は、変更がticketの範囲を超えていないかの確認で保ち、範囲の外への変更があれば止める。merge直後の全件実行と夜間の補完は既定にしない。省いた検査は記録し、合流先のticket（Forward 小は中か大、中は大）で回収する。回収されないまま残っていれば、Release Portで止める。影響が広がる密結合が見つかったら、その変更で影響する接続・構成体の検査をそのPRで広げ、成立するまで合流させない。そのうえで、CIを恒常的に重くして守らず、設計の不具合としてDesign-refactorを発行して結合を切る。検査をすり抜けて後で見つかった失敗は、HELIX-LABOが振り返り、原子CIやコネクタの契約が足りているかを評価して返す |
    - `docs/helix-harness/L2-requirements/product-requirements.md:120` SHA-256 `da55ac17a732605dd6cb45a28e31ae534179bfd870e1d2536b3a4b6cc1c78be6` — | HARNESS-L2-005 | 旧GH-FR-025（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/github-atomic-development-requirements.md:29,52-62`）は、PRでは影響範囲だけを検査し、省いた検査の集合を記録して、main合流の直後に全件で回収し、夜間に欠落を補完し、危険度の高い変更は最初から全件にしていた。保持する点は、影響する範囲だけを選ぶこと、省いた検査を記録して黙って捨てないこと、危険度の高い変更を軽い検査で通さないことである。変更する点は、範囲を決める元を変更の差分からticketへ移すこと、回収の場所をmerge直後の全件実行から合流先のticketへ移すこと、夜間の補完をやめることである。理由は、POの「既存の方式はちょっと推進が遅いから」と、危険度の高い変更の原因が密結合だったことである |
    - `docs/helix-harness/L2-requirements/product-requirements.md:121` SHA-256 `164544023a6646eda7f073c3dbd7b30b1fc33e1bb33b5d5649be7305ae15a923` — | HARNESS-L2-005 | 検証条件には対象要求revision、成果物、入力、oracle、expected failure、実結果、証拠の有効期限、差戻し先を含める。required／conditional／informational／N/Aを理由付きで区別し、unknownをskipへ変換しない。CI成功・画面表示・文書登録だけを利用者受入や全工程完了の証拠にしない |
  - **HELIXOS-L2-022** (po_fixed_candidate_adopted)
    - `docs/helix-os/L11-acceptance/governance-acceptance.md:373` SHA-256 `d33dcec3b5c9dc145d167bb93becc88d1d74f3507e538a8cd2fb1d75643012e5` — ### HELIXOS-L2-022 改善候補登録・還流の受入
    - `docs/helix-os/L2-requirements/governance-requirements.md:712` SHA-256 `845e060ee7221a28faa4d64338d3c68561551dbf2dce48d68ad974a5d94ea143` — ### HELIXOS-L2-022 改善候補登録・還流（単体候補）
  - **HELIXLABO-L2-050** (po_fixed_candidate_adopted)
    - `docs/helix-labo/L11-acceptance/labo-acceptance.md:100` SHA-256 `ca538f4b591d4e7cf0938b15e4b6d611e0ea50014902e5273b96febdbc16f460` — | HELIXLABO-L2-050 | ObservedからLABO再観測までidentityと未完義務を追い、実験では同じticket/experiment/対象版にOS assignmentとWorker実行結果が対応することを確認し、target変更後の効果・退行を独立に評価できる。candidate、登録、変更、検証、運用、再観測を別状態で表示する | assignmentのない実行を割当済みとする、別ticket/experiment/対象版の証拠を結合する、Feedback発行、OS登録、target変更、CI成功だけで改善完了とする、採択前candidateを正本扱いする、元記録を書き換える |
    - `docs/helix-labo/L2-requirements/labo-requirements.md:40` SHA-256 `03d238e18417c2026f8527c52ccdbe3ed6dcc2bceeaa250b41cb3166a6bedd89` — | HELIXLABO-L2-050 | HELIXLABO-L1-008 | Feedbackから変更・検証・運用・再観測までの改善循環 |
    - `docs/helix-labo/L2-requirements/labo-requirements.md:298` SHA-256 `93336c61f015f82b11a7c919366fee4ef3f1cb9b29207e753d35d8479fd2224b` — ### HELIXLABO-L2-050 — 内部改善循環（1.0）
- 保持: HARNESS-L2-004/005は要求・設計・検証traceと欠落、再検証scopeを扱い、HELIXOS-L2-022/HELIXLABO-L2-050は改善観測や候補還流に限定的に隣接する。
- 変更/非継承: 現行は関係と改善候補を扱うが、8×5 legacy taxonomyの全組合せ可視化や色密度を採択していない。
- 数値・例外・反例: 8×5=40は画面軸の組合せ数でcoverage pass-rateや品質閾値でない。未集計は低カバレッジと同一でない。
- 未対応残差: 40セルの母集団・coverage計算法/色閾値・clickから不足候補を生成する規則・30秒更新は未対応。
- 採択状態: 現行f6固定L2/L11文書のPO合意/候補採択状態を参照。画面要求の個別採択状態や実装済みを意味しない。後発57+11にsource-qualified legacy identityとの完全一致なし。
- 状態: `open_partial_correspondence`、successorなし、authority effect `none`。

### HM-03

Source-qualified identity: `harness/L1-requirements/screen-requirements.md::HM-03`; queue status: `not_individually_compared`.

- 旧source `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/screen-requirements.md:135` line SHA-256 `b97690a9f4f6303ca3bef618c6cd75aac4c5cee7be03919508ffc3963ce21fd9`: | **HM-03** | 配線図ビュー | 静的アーキ + 動的エラー赤表示 (CC1=a 採用) | FR-L1-07 / FR-L1-18 |
- 旧source詳細 `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/screen-requirements.md:164` line SHA-256 `30e5a573cc2df1ae9bfe6fdd8705c3eda7ec8f2d450b753aa1b8158d5fdc1df9`; file SHA-256 `e5b6964567242a2440ded28ed99c1783f37a9326624c02283c7a975c3020063b`
- 旧L3 consumerのsource line SHA:
  - `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md:48` SHA-256 `59799431ea84c70f029071a3976c1c96d04992cd11737950bc0928e06ddf14a5` — | FR-07 | FR-L1-07 | HM-04 / HM-03 | 全 mode | all | hook 発火失敗時の手動再実行 (運用者) |
  - `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md:49` SHA-256 `9a586eda0e4f9d976872cd51925efe4389e641137c15cfc8913dd48814a8e996` — | FR-08 | FR-L1-08 | PM-01 / HM-03 | Discovery / Recovery / Reverse / Refactor 自動起動 | all | mode 自動 routing の上書き判断 (PO/TL) |
  - `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md:50` SHA-256 `846b7aa2d0112d8e2ffbda760af2576c4a73e9958e84ea3a745aecad773fc1a0` — | FR-09 | FR-L1-09 | HM-05 / HM-03 | 全 mode | agent (主) / all | bypass 承認 (PO 専属 S-03) / budget 上限変更 (PO) |
  - `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md:802` SHA-256 `c7a5a81c68373ce7c1516bbc8f3ddc240b3f94ad8f5f0c4f4d2452ed0d0055e1` — | FR-09 | HM-05 / HM-03 | AC-FR-09-01〜03 → HM-05 agent guard audit ログ表示 |
- 旧consumer詳細: §1.HM.03: 静的architecture+hook失敗/provider接続失敗/9 drive状態の動的赤表示、接続の起点/終点/状態/最終check time、4象限(drift/劣化/暴走/障害)→Recovery/Incident/Reverse/Refactor遷移の表示carry（UI詳細はL2確定）。click detail/error highlight/GD Architecture link、30秒poll、hook失敗即時、緑/黄/赤/灰。
- 固定L2/L11参照:
  - **HARNESS-L2-004** (inside_po_fixed_l2_l11_bytes)
    - `docs/helix-harness/L11-acceptance/product-acceptance.md:24` SHA-256 `2d548b5f31549a87687144145601848ec08fdd46311b50c3a05145d234f6609a` — | HARNESS-L2-004 | 要求変更から影響する設計・テストと再検証の範囲が導出され、変更した条件の検証漏れを識別できる |
    - `docs/helix-harness/L2-requirements/product-requirements.md:43` SHA-256 `88d505fd37dfbdd8d7c7df754b42a3ee0d8398da5c317dd26a9023cd1b6aa9ba` — | HARNESS-L2-004 | HARNESS-L1-003／HARNESS-L1-004／HARNESS-L1-006 |
    - `docs/helix-harness/L2-requirements/product-requirements.md:55` SHA-256 `7b09279d1e75c221cdc85f551026a6110496c42770c4721ad42e74acdcdd6006` — | HARNESS-L2-004 | 要求から設計・テストへの対応と、変更時の再検証範囲を導出できる | HBR-P3／P9、2026-09-24 PO判断 | 上下流traceとV-pairの欠落を識別し、変更した要求が検証から落ちない |
    - `docs/helix-harness/L2-requirements/product-requirements.md:114` SHA-256 `193360a5a5427242f2dc9e0df454508dee329ae07c2fd14ee63493b5b18ae8eb` — | HARNESS-L2-004 | 要求変更・public contract変更・設計trace欠落等の際は、影響する設計と対検証へ差し戻す。Scrumの実装事実もreview・release合流前に設計資産へ戻し、必要なpair凍結を確認する |
    - `docs/helix-harness/L2-requirements/product-requirements.md:117` SHA-256 `ab2b23fa7b1e333de3fa60239b371c4f42a6b54aed5cef65a5f9c8824a4866f2` — | HARNESS-L2-004 | [2026-09-26 PO判断](../../governance/decisions/harness-v-valley-process-po-decisions-2026-09-26.md)に従い、変更の影響は、要求・設計・検証の間のrelationから導く。証拠と影響はrelationを通じて上へ伝えるが、変更された下の構造の成立の状態を、上の構造へそのまま伝えない（単体の変更から接続や構成体をfailedにしない）。影響の状態をAffected、Unaffected、Unknownで区別し、成立の状態と混同しない。UnknownをUnaffectedとして扱わず、再検証の結果によってだけ、その構造の成立の状態を改める。旧AAFD（`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/agentic-audit-future-state-delta-acceptance.md:20-25,42`）の、影響を受けた集合だけを扱いunknownを補完しない条件を保ち、単体・接続・構成体のrelationへ当てる |
    - `docs/helix-harness/L2-requirements/product-requirements.md:195` SHA-256 `ece1218b189bed89be2ceed63ef17ab338125b19eababffe1ad30b82b05e3e5c` — | HARNESS-L2-004 | RFA-BR-03、DGH-BR-02 | 変更の影響要求・設計・対検証を再確定し、影響しない有効作業を一律失効させない |
  - **HELIXOS-L2-019** (po_fixed_candidate_adopted)
    - `docs/helix-os/L11-acceptance/governance-acceptance.md:352` SHA-256 `241fbb855d59c68e2624fb6a90314819e38992edf467f73a8fdb73ca5e0fc332` — ### HELIXOS-L2-019 Evidence・continuityの受入
    - `docs/helix-os/L2-requirements/governance-requirements.md:682` SHA-256 `87db5d2abcbbaf27d5f9a74a85b9ceaac78965271d1af849a37a305ce30388ab` — ### HELIXOS-L2-019 Evidence・continuity（単体候補）
  - **HELIXINTELLIGENCE-L2-016** (po_fixed_candidate_adopted)
    - `docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md:77` SHA-256 `8a4b30d538a11914b3cbe31f447675fe2dfd1214c273e2f74789d14a4c116b54` — | HELIXINTELLIGENCE-L2-016 | repair対象のrevision/actor/write-set/side effect/budget/deadline/retry/impact/recoveryを束縛し、意味変更/未信頼/二重実行/循環/予算逸脱/不明副作用を止める | 候補/登録から包括write権限を得る、requirements/verificationを修復する、staleを適用する | target/scope/side effect不明または逸脱時はsource/SECURITY/OS ownerへ戻し修復停止 |
    - `docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md:169` SHA-256 `5c8d99c3d759a638e7beed5f0c7ee70ceaf61cf1791f6fa03e06371641f62e7a` — | HELIXINTELLIGENCE-L2-016 | 親: HELIXINTELLIGENCE-L1-016。単体（scope-bound repair candidateと適用結果）。接続context: HELIXINTELLIGENCE-L2-036, HELIXINTELLIGENCE-L2-037, HELIXINTELLIGENCE-L2-038, HELIXINTELLIGENCE-L2-039, HELIXINTELLIGENCE-L2-062。1.0。 | **正常**: 固定target revision、許可actor/write-set、限定side effect/budget/retry/recovery付きの既知局所欠陥に対する修復候補とOS割当Workerの修復結果を受け取り、修正後に元のtest/oracleが通り要求/設計/verification obligationが同一であることを照合する。**誤り**: seeded counterexample未修正、既存正常case退行、write-set逸脱、義務変更、二重実行なら不合格/停止。**未見**: 未公開の同scope variantで同じ既存oracleを再実行し、回帰なしを確認。新たな種類やscope外の問題は未評価として止める。SECURITY許可、Worker実行、HARNESS検証、OS検収は別stageであり、単体品質から接続成功を導かない。 |
    - `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:138` SHA-256 `5914325f22e56011eb9f0c7cce34d8d05e4e24b4bae09d6f11892251b1470a92` — ### HELIXINTELLIGENCE-L2-016 — 限定修復candidateと適用
  - **HELIXINTELLIGENCE-L2-017** (po_fixed_candidate_adopted)
    - `docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md:92` SHA-256 `44d573655a0173928b327377c177bf200e3036635bea86ba74de40ecd7d22528` — | HELIXINTELLIGENCE-L2-017 | 同一target revision/scopeでHELIXINTELLIGENCE-L2-036～HELIXINTELLIGENCE-L2-039のpermission/Worker/HARNESS/OS各結果を別々に保持し、未完義務を引き継ぐ | いずれかの結果で別ownerのpermission/execution/verification/acceptanceを代替する | 欠落stageのSECURITY/Worker/HARNESS/OS ownerへ戻し修復未完了 |
    - `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:33` SHA-256 `7fba84f5216a2d02863435dea35d1b7f53a2e26585ba14a67ac78bec7d51ad05` — | HELIXINTELLIGENCE-L2-017 | 接続横断境界 | HELIXINTELLIGENCE-L1-017 | 1.0 |
    - `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:202` SHA-256 `bd95075bf8622ec6fc66a48f5a91ea8108b91d2619136c2e5a1c87fd9f0aace7` — ### HELIXINTELLIGENCE-L2-017 — 限定修復の接続横断境界
- 保持: HARNESS-L2-004 trace欠落、HELIXOS-L2-019 authority/state continuity、HELIXINTELLIGENCE-L2-016/017 bounded diagnosis/repairが限定的に隣接。
- 変更/非継承: 現行topology/state/authorityは明確な責務・source・revisionに結び付ける。旧drive 9分類や4象限routingを自動推定する規則は引き継がない。
- 数値・例外・反例: 9 driveは旧screen上の区画数、30秒pollとhook failure即時更新は両方要求。色状態=未接続灰も独立。遷移詳細は旧文面自体がL2 carry。
- 未対応残差: 9 driveの定義と画面表示、4象限→modeの自動経路、error feed・last-check schema・poll interval/color/oracle、static diagram compositionは未対応。
- 採択状態: 現行f6固定L2/L11文書のPO合意/候補採択状態を参照。画面要求の個別採択状態や実装済みを意味しない。後発57+11にsource-qualified legacy identityとの完全一致なし。
- 状態: `open_partial_correspondence`、successorなし、authority effect `none`。

### HM-04

Source-qualified identity: `harness/L1-requirements/screen-requirements.md::HM-04`; queue status: `not_individually_compared`.

- 旧source `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/screen-requirements.md:136` line SHA-256 `6afdbec89e1759f69ed63ecd87830feecbdf224e664bbfa1728eba702dfab963`: | **HM-04** | データベース閲覧ビュー | `.helix/` state 全 table + 整合性チェック結果 + artifact progress 赤黄緑 projection (CC1=a 採用) | FR-L1-07 / FR-L1-18 / FR-L1-51 |
- 旧source詳細 `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/screen-requirements.md:176` line SHA-256 `4a31a7d3f23135107a34444efa2d9981631ab80778d26e8b8770d454c47d45b9`; file SHA-256 `e5b6964567242a2440ded28ed99c1783f37a9326624c02283c7a975c3020063b`
- 旧L3 consumerのsource line SHA:
  - `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md:47` SHA-256 `c49412853db62d4f17348d7581c2212cb58a8e15618892b45aa381dbe02e449f` — | FR-06 | FR-L1-06 | HM-04 / HM-01 | 全 mode | all (drive 別区画 = FR-L1-40 連動) | state 不整合検出時の手動修正 (運用者) |
  - `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md:48` SHA-256 `59799431ea84c70f029071a3976c1c96d04992cd11737950bc0928e06ddf14a5` — | FR-07 | FR-L1-07 | HM-04 / HM-03 | 全 mode | all | hook 発火失敗時の手動再実行 (運用者) |
- 旧consumer詳細: §1.HM.04: `.helix/`全tableのrawに近い行、orphan/drift/invalid integrity checks、`artifact_progress`: red=依存未確認/未回収, yellow=実装中/未テスト, green=linked test+dependency clear。table/filter/recheck/copy instruction、30秒poll、green/yellow/red/empty。
- 固定L2/L11参照:
  - **HELIXOS-L2-015** (po_fixed_candidate_adopted)
    - `docs/helix-os/L11-acceptance/governance-acceptance.md:320` SHA-256 `08e8c23d35394421a9648a364cae7a95711c86421ce6b9f942ad595a69b0d1cf` — ## HELIX-OS機能単位パックの受入候補（HELIXOS-L2-015〜025）
    - `docs/helix-os/L11-acceptance/governance-acceptance.md:324` SHA-256 `7a9013b9883ef3a38f8d1eb4b3dade78fb0db3bfc5a0ba7e8d9ecdddd5dfe1a7` — ### HELIXOS-L2-015 管理・authority記録の受入
    - `docs/helix-os/L2-requirements/governance-requirements.md:642` SHA-256 `1f89e6f1f9b7335b321c2a93b33c882149fe7798629ed97fd8d7cc8f556e80c7` — ### HELIXOS-L2-015 管理・authority記録（単体候補）
  - **HELIXOS-L2-019** (po_fixed_candidate_adopted)
    - `docs/helix-os/L11-acceptance/governance-acceptance.md:352` SHA-256 `241fbb855d59c68e2624fb6a90314819e38992edf467f73a8fdb73ca5e0fc332` — ### HELIXOS-L2-019 Evidence・continuityの受入
    - `docs/helix-os/L2-requirements/governance-requirements.md:682` SHA-256 `87db5d2abcbbaf27d5f9a74a85b9ceaac78965271d1af849a37a305ce30388ab` — ### HELIXOS-L2-019 Evidence・continuity（単体候補）
  - **HELIXSECURITY-L2-007** (po_fixed_candidate_adopted)
    - `docs/helix-security/L11-acceptance/security-acceptance.md:31` SHA-256 `982d0033e8483b228cd8b3f645bea65ae979c07cc64f5c02986971092ac9b089` — | HELIXSECURITY-L2-007 | 1.0 | 各制約（write path、network、credential、environment、timeout、resource、diff検査、rollback、result collection）がWorker実行環境へ渡り、適用・観測状態を確認できる。いずれか未適用/unknownなのにhost fallbackで実行、制約をWorkerが自己拡張したら不合格。read-onlyでもwrite禁止の適用と操作対象scopeの実行後の変更なし観測を要する。rollbackだけは変更なしを確認できた場合に限り適用対象外とでき、変更有無がunknownなら成功扱いしない。後掲の9制御fixtureで条件を個別に確認する。 |
    - `docs/helix-security/L11-acceptance/security-acceptance.md:69` SHA-256 `77e0093c69fc8b12f991aec7a7451275739bd90c0ab489facfe812bbe79c02a2` — ## HELIXSECURITY-L2-007：9制御の受入fixture
    - `docs/helix-security/L2-requirements/security-requirements.md:45` SHA-256 `25fefefba408c4173c0475849bca4835dc0f3ff25f596601fff647b8aa28c162` — | HELIXSECURITY-L2-007 | connection | L1-007 | Worker実行環境への制約適用 | 1.0 |
    - `docs/helix-security/L2-requirements/security-requirements.md:130` SHA-256 `b4ca3f5bd1482136f4dd2d77d0ae83c486c2f4fa13584fee698f1717d933f086` — ### HELIXSECURITY-L2-007 Worker実行環境への制約適用（接続）
  - **HELIXSECURITY-L2-015** (po_fixed_candidate_adopted)
    - `docs/helix-security/L11-acceptance/security-acceptance.md:39` SHA-256 `e8de0c4447d62b99abcce59489a772eab623c0575eed7b480b17339c5e05cf96` — | HELIXSECURITY-L2-015 | 1.0基盤、保護運用1.x | §16列挙の HELIX-HARNESS-CORE（HELIX-JSON、Python meaning core、Requirement Engine、internal verification logic）、HELIX-BRAIN（Patterns、Units、Parts、accumulated design knowledge）、HELIX-INTELLIGENCE（internal prompts、judgment configuration、specialist models、routing / diagnostic logic）、HELIX-LABO（episodes、evaluation corpus、training material）、HELIX-OS（authority/state、topology、operation records）、HELIX-SECURITY（policies、credentials）をowner、identity、source、revision/digestで識別できる。列挙外資産も分類対象となり得る。内容をdumpせず識別不能をpublicと扱ったら不合格。受入は1.0 identity baseだけでWeb保護完了を宣言しない。 |
    - `docs/helix-security/L2-requirements/security-requirements.md:53` SHA-256 `0cc95f334b3ec9f44b9a30443f36cf153e77d4fd738162bea326408aaa5bcba1` — | HELIXSECURITY-L2-015 | unit | L1-015 | HELIX Asset identityと分類基盤 | 1.0の土台、実利用保護は1.x |
    - `docs/helix-security/L2-requirements/security-requirements.md:210` SHA-256 `2d5f674dd631290f5c533720db53c77143f75aa293e37c6d8dc7850dad007220` — ### HELIXSECURITY-L2-015 HELIX Asset identity基盤
  - **HELIXSECURITY-L2-016** (po_fixed_candidate_adopted)
    - `docs/helix-security/L11-acceptance/security-acceptance.md:40` SHA-256 `8e752b7c290cd2772287edf13470bbf38ae979e7bef1fcd99feac4d237c240b4` — | HELIXSECURITY-L2-016 | 1.0分類基盤、適用1.x | 1.0ではpublic/customer-owned/service-internal/HELIX-confidential/HELIX-restricted/secretの全6分類を定義し、asset identityへ分類とunknownを記録できる。分類不明をpublic/allowと扱う、または分類記録が欠ければ不合格。1.xではL2-019/025が各sinkへ分類を適用し、confidential以上を無条件出力しないことを別途受け入れる。1.x条件を1.0完了の証拠にしない。 |
    - `docs/helix-security/L2-requirements/security-requirements.md:54` SHA-256 `0706abc5252640fd9b1b4d1232df569bed375e30c49cb7f5634273c5b9f4567f` — | HELIXSECURITY-L2-016 | unit | L1-016 | Asset exposure classification | 1.0の区分基盤、公開時適用は1.x |
    - `docs/helix-security/L2-requirements/security-requirements.md:220` SHA-256 `a133c4076038688e34dc19e076b116c4a80a73539f321110cc8d996051d5c202` — ### HELIXSECURITY-L2-016 Asset exposure classification基盤
- 保持: OS-L2-015/019とSecurity-L2-007/015/016はasset identity、state/authority、worker制約、分類/unknownの保持を扱う。
- 変更/非継承: 現行記録はrevision/scope/authority・分類により管理する。旧`.helix/`DB schemaや全table browser、旧artifact_progress投影は正本化されていない。
- 数値・例外・反例: greenにはlinked test AND dependency clearの両方が必要。orphan/drift/invalidの分離。旧要求がCC1=aと記載するが数値判定閾値なし。
- 未対応残差: 旧DB schema/table一覧、整合性query、artifact_progress projectionと3色条件、30秒poll、recheck UI、AI instruction copy UIは未対応。
- 採択状態: 現行f6固定L2/L11文書のPO合意/候補採択状態を参照。画面要求の個別採択状態や実装済みを意味しない。後発57+11にsource-qualified legacy identityとの完全一致なし。
- 状態: `open_partial_correspondence`、successorなし、authority effect `none`。

### HM-05

Source-qualified identity: `harness/L1-requirements/screen-requirements.md::HM-05`; queue status: `not_individually_compared`.

- 旧source `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/screen-requirements.md:137` line SHA-256 `6b6a7af7b1c9914852ff3a7cc226a7aceab55bcae12578713d6655bfd7872366`: | **HM-05** | Audit / 実行ログビュー | AI 実行ログ + agent guard 判定 + budget + skill 注入タブ統合 (S8=b) | FR-L1-09 / FR-L1-20 / FR-L1-12 |
- 旧source詳細 `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/screen-requirements.md:188` line SHA-256 `a7c67be95cb0616b8a5f45671037425ad2dc8044de58a3fac6ce7d5d20d186c8`; file SHA-256 `e5b6964567242a2440ded28ed99c1783f37a9326624c02283c7a975c3020063b`
- 旧L3 consumerのsource line SHA:
  - `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md:50` SHA-256 `846b7aa2d0112d8e2ffbda760af2576c4a73e9958e84ea3a745aecad773fc1a0` — | FR-09 | FR-L1-09 | HM-05 / HM-03 | 全 mode | agent (主) / all | bypass 承認 (PO 専属 S-03) / budget 上限変更 (PO) |
  - `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md:53` SHA-256 `1cebab885419e5beaa7bd0be8140ce6136a7d76e2425d9b648522d764aaa8cb0` — | FR-12 | FR-L1-12 | HM-05 / HM-02 | 全 mode | all (drive 別 skill 選定) | skill 推奨 override (TL) |
  - `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md:56` SHA-256 `9a0d3436fe3de13bc15ec3e048a59652630f950556cfb3e2e51ae966e818c977` — | FR-15 | FR-L1-15 | PM-02 / HM-05 | Discovery | poc / all | 仮説起票 (PO) / S4 decide (PO 専属) |
  - `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md:67` SHA-256 `9063fac72596741c14c9fdf3fe05458aebdd8232c8253433edf54690c1fc762a` — | FR-45 | FR-L1-45 (BR-08 派生、A-49 back-propagation) | PM-03 / HM-05 | 全 mode (大規模 doc 改定 trigger) | all | doc-reviewer 召喚判断 / bypass (PO 専属 S-03) |
  - `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md:801` SHA-256 `c3fb6d00fc839394412a10a87dad788d83c98d7cb324906abe3a716d2d0a8a8c` — | FR-05 | PM-03 / HM-07 | AC-FR-05-01 → PM-03 Gate 判定 / AC-FR-05-03 → HM-05 audit log |
  - `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md:802` SHA-256 `c7a5a81c68373ce7c1516bbc8f3ddc240b3f94ad8f5f0c4f4d2452ed0d0055e1` — | FR-09 | HM-05 / HM-03 | AC-FR-09-01〜03 → HM-05 agent guard audit ログ表示 |
- 旧consumer詳細: §1.HM.05: invocation_log全列(date/model/role/task/result/token/cost)、agent guard allow/block/bypass履歴、budget、warning、bypass approvals、skill injection tab、hook log carry（5 hookと登録成否/未登録エラー）。filter/date/agent/result、bypass expand、PM03 link、30秒poll。状態=正常/bypass黄/block多発赤/empty。
- 固定L2/L11参照:
  - **HELIXOS-L2-018** (po_fixed_candidate_adopted)
    - `docs/helix-os/L11-acceptance/governance-acceptance.md:345` SHA-256 `88f9bf170b147fd9a5d954bd4f0842472bc54d68e8813d68ab0fc16244980eba` — ### HELIXOS-L2-018 Worker割当・実行統制の受入
    - `docs/helix-os/L2-requirements/governance-requirements.md:672` SHA-256 `c22ab6ad7948d8381cbf1d48d08e19df3331c8a79240f69ac1f550151500e6b9` — ### HELIXOS-L2-018 Worker割当・実行統制（単体候補）
  - **HELIXOS-L2-019** (po_fixed_candidate_adopted)
    - `docs/helix-os/L11-acceptance/governance-acceptance.md:352` SHA-256 `241fbb855d59c68e2624fb6a90314819e38992edf467f73a8fdb73ca5e0fc332` — ### HELIXOS-L2-019 Evidence・continuityの受入
    - `docs/helix-os/L2-requirements/governance-requirements.md:682` SHA-256 `87db5d2abcbbaf27d5f9a74a85b9ceaac78965271d1af849a37a305ce30388ab` — ### HELIXOS-L2-019 Evidence・continuity（単体候補）
  - **HELIXSECURITY-L2-007** (po_fixed_candidate_adopted)
    - `docs/helix-security/L11-acceptance/security-acceptance.md:31` SHA-256 `982d0033e8483b228cd8b3f645bea65ae979c07cc64f5c02986971092ac9b089` — | HELIXSECURITY-L2-007 | 1.0 | 各制約（write path、network、credential、environment、timeout、resource、diff検査、rollback、result collection）がWorker実行環境へ渡り、適用・観測状態を確認できる。いずれか未適用/unknownなのにhost fallbackで実行、制約をWorkerが自己拡張したら不合格。read-onlyでもwrite禁止の適用と操作対象scopeの実行後の変更なし観測を要する。rollbackだけは変更なしを確認できた場合に限り適用対象外とでき、変更有無がunknownなら成功扱いしない。後掲の9制御fixtureで条件を個別に確認する。 |
    - `docs/helix-security/L11-acceptance/security-acceptance.md:69` SHA-256 `77e0093c69fc8b12f991aec7a7451275739bd90c0ab489facfe812bbe79c02a2` — ## HELIXSECURITY-L2-007：9制御の受入fixture
    - `docs/helix-security/L2-requirements/security-requirements.md:45` SHA-256 `25fefefba408c4173c0475849bca4835dc0f3ff25f596601fff647b8aa28c162` — | HELIXSECURITY-L2-007 | connection | L1-007 | Worker実行環境への制約適用 | 1.0 |
    - `docs/helix-security/L2-requirements/security-requirements.md:130` SHA-256 `b4ca3f5bd1482136f4dd2d77d0ae83c486c2f4fa13584fee698f1717d933f086` — ### HELIXSECURITY-L2-007 Worker実行環境への制約適用（接続）
  - **HELIXSECURITY-L2-008** (po_fixed_candidate_adopted)
    - `docs/helix-security/L11-acceptance/security-acceptance.md:32` SHA-256 `42b074eeb934dee84394e5602761373c484b493d58c29c2868c704d58b77a33b` — | HELIXSECURITY-L2-008 | 1.0 | 異なるread/write/execute/network/install/delete/merge/release/deploy/credential-use/security-change操作で別authorityを要求し、actor/target/operation/revision/environment/scope/expiryが完全一致したときだけ影響の大きいoperationを許可する。Agent利用権から包括write/deployが生じる、または欠落・期限切れ・driftを通すと不合格。 |
    - `docs/helix-security/L2-requirements/security-requirements.md:46` SHA-256 `c23883f5c0eb9ad1bc8d6b46c71a1bd6e642e2dce74f6d22c286c52434aca8cf` — | HELIXSECURITY-L2-008 | unit | L1-008 | 操作ごとのauthority | 1.0 |
    - `docs/helix-security/L2-requirements/security-requirements.md:140` SHA-256 `d92fd9c14e26727fd0d2caad3c3c49419171f4a387bc5fa07a5ce5544fc6904d` — ### HELIXSECURITY-L2-008 操作ごとのauthority
  - **HELIXLABO-L2-001** (po_fixed_candidate_adopted)
    - `docs/helix-labo/L11-acceptance/labo-acceptance.md:45` SHA-256 `a6f163d7edcc90c919f0f0b035173f27d2c69101f695b7209edd8e6d59a56fed` — | HELIXLABO-L2-001 | 複数sourceから許可された成功、失敗、拒否、取消、blocked、unknown、not_observedを入力し、それぞれのsource identity/revisionと列挙されたobservation fieldsを保持できる。元source authority/stateはsource側に残る | 成功ログだけを受け取り失敗・拒否を落とす、not_observedをsuccessへ変える、source revision不明をcurrentとして使う、権限外/secret dataを取り込む、LABO側記録をsource正本として書き戻す |
    - `docs/helix-labo/L2-requirements/labo-requirements.md:29` SHA-256 `d6668367958f2ecacd9f417a6283640cd5391c99a121aabf66b4a0526c075677` — | HELIXLABO-L2-001 | HELIXLABO-L1-001 | 許可観測の集積、source正本維持、成功・失敗・拒否・取消・停止・不明・未観測の区別 |
    - `docs/helix-labo/L2-requirements/labo-requirements.md:69` SHA-256 `dd55d6b5f012584da0b0589d2427ee1660f20f3f756de4f7180117b78b571867` — ### HELIXLABO-L2-001 — Aggregate Engine（集積）
- 保持: HELIXOS-L2-018/019 role/state、Security-L2-007/008 controls/operation authority、LABO-L2-001 evaluation boundaryが関連情報の責務に隣接。
- 変更/非継承: 現行authority/operation recordsは作成者/actor・対象・operation・scopeで明示する。旧invocation_log全列やguard/runtime/hookログを単一画面に集約する要件はない。
- 数値・例外・反例: allow/block/bypassは別値、bypass approval記録を含む。5 hookリストは旧screen内に列挙される。数字の警告閾値は記載されない。
- 未対応残差: 旧ログschema/retention/cost telemetry、guard判定集約、budget計算、5 hook別結果、red警告の閾値、30秒poll/画面操作は未対応。
- 採択状態: 現行f6固定L2/L11文書のPO合意/候補採択状態を参照。画面要求の個別採択状態や実装済みを意味しない。後発57+11にsource-qualified legacy identityとの完全一致なし。
- 状態: `open_partial_correspondence`、successorなし、authority effect `none`。

### HM-06

Source-qualified identity: `harness/L1-requirements/screen-requirements.md::HM-06`; queue status: `not_individually_compared`.

- 旧source `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/screen-requirements.md:138` line SHA-256 `6c9d2ad8c9902e1493b8913a225e3d60924a2edc72333db5a470d5a96385c33c`: | **HM-06** | Recovery ビュー | 暴走対応 + 再開ポイント + CLI ロールバックコマンドコピー (S5=b) | FR-L1-10 |
- 旧source詳細 `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/screen-requirements.md:199` line SHA-256 `dd1ea67e3af3143d14800f485f2e5367f76434a11925bf8f9015b807da991af7`; file SHA-256 `e5b6964567242a2440ded28ed99c1783f37a9326624c02283c7a975c3020063b`
- 旧L3 consumerのsource line SHA:
  - `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md:51` SHA-256 `59fe77dc9c90c9f222454646b2652c00396f9c1b7f18947cac9f7ef190adb1dd` — | FR-10 | FR-L1-10 | HM-06 / PM-03 | Recovery (主) / Incident | all | 再開ポイント選定 (PO/TL) / ロールバック実行 (運用者) |
  - `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md:57` SHA-256 `d179fb86182fc8e0638bc61926aad9a8db2c87b7399e166b64622544bbed4677` — | FR-16 | FR-L1-16 | PM-03 / HM-06 | Incident | troubleshoot / all | hotfix 緊急判断 (PO 専属) / postmortem 確定 (TL/PO) |
  - `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md:315` SHA-256 `e85fe7f8dc476822e32e6e28f2fbcb0688ac531c470d8801e982ea886e487d3e` — - **振る舞い**: HM-06 Recovery ビューに CLI ロールバックコマンドコピー UI (S5=b、UI 直接実行なし)
  - `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md:803` SHA-256 `15dfbd22fedead58582f7915149419e16a211440c08533d44467b55c282368c3` — | FR-10 | HM-06 / PM-03 | AC-FR-10-01 → HM-06 CLI ロールバックコマンドコピー UI / S5=b 整合 |
- 旧consumer詳細: §1.HM.06: 暴走日時/種別、最終正常gateのrestart points、認識訂正、recovery_log全列、rollback command clipboard copy（UIから直接rollbackはしない）、cutover state、HM05 audit link、Recovery後PM01。30秒poll、暴走即時通知、normal/red/yellow/green。
- 固定L2/L11参照:
  - **HELIXOS-L2-019** (po_fixed_candidate_adopted)
    - `docs/helix-os/L11-acceptance/governance-acceptance.md:352` SHA-256 `241fbb855d59c68e2624fb6a90314819e38992edf467f73a8fdb73ca5e0fc332` — ### HELIXOS-L2-019 Evidence・continuityの受入
    - `docs/helix-os/L2-requirements/governance-requirements.md:682` SHA-256 `87db5d2abcbbaf27d5f9a74a85b9ceaac78965271d1af849a37a305ce30388ab` — ### HELIXOS-L2-019 Evidence・continuity（単体候補）
  - **HELIXOS-L2-021** (po_fixed_candidate_adopted)
    - `docs/helix-os/L11-acceptance/governance-acceptance.md:366` SHA-256 `c9cda0832f3638575a32270be7f6650062cf8a9061786121dea510d5a629086b` — ### HELIXOS-L2-021 HARNESS構成版の対象project配布・更新・復旧の受入
    - `docs/helix-os/L2-requirements/governance-requirements.md:702` SHA-256 `3dfc9d43b5113c2763f42b6563337f87fa08325428d37213a0c5adacac081f37` — ### HELIXOS-L2-021 HARNESS構成版の対象project配布・更新・復旧（単体候補）
  - **HELIXSECURITY-L2-009** (po_fixed_candidate_adopted)
    - `docs/helix-security/L11-acceptance/security-acceptance.md:33` SHA-256 `689a9cc3102ffda09b85589d8a00450820594cfb5c20767c3b2f7b2aa47bf945` — | HELIXSECURITY-L2-009 | 1.0 | revoke、scope drift、credential漏洩、異常通信、runtime逸脱、unknownを投入すると、OSの新規割当停止、Workerの実行停止と途中成果物隔離、CONNECT通信停止、credential使用停止、artifact access停止の該当先へ伝わる。どれかの該当停止が確認できず成功扱いで継続したら不合格。unknownは列挙triggerの安全上の影響や不明な外部副作用に関するものとし、無関係な一般文書の意味unknownを全操作停止へ広げない。operation/project/worker/credential/connection/artifactの該当identityに束縛して伝播し、recipient別の受領・適用・未達・未観測を区別する。 |
    - `docs/helix-security/L2-requirements/security-requirements.md:47` SHA-256 `ea78aaddd0c7b2449d149e04844307f97c28d5d0c7fb8dabab62720c6db117e7` — | HELIXSECURITY-L2-009 | composite | L1-009 | revoke / quarantine伝播 | 1.0 |
    - `docs/helix-security/L2-requirements/security-requirements.md:150` SHA-256 `09dd8c61d9a58e0c78267f22b31efa037f3b8363ad27c0565495908db9a8d896` — ### HELIXSECURITY-L2-009 revoke / quarantine伝播（構成体）
- 保持: HELIXOS-L2-019/021はstate continuity/recovery、Security-L2-009は該当範囲のquarantine/stop propagationに限定的に隣接。
- 変更/非継承: 現行の再開/停止は同じticket・scope・revision等のauthority状態で判断する。旧CLI rollbackの組立・コピーやold cutover UIを継承しない。
- 数値・例外・反例: 旧仕様はrollbackをUIで実行せずコマンドcopyのみ。再開点は「最終正常gate」。暴走検出時は即時通知、その他30秒poll。
- 未対応残差: recovery_log field set、checkpoint選択、rollback CLI stringの安全生成/copy、cutover状態表示、警告色とpoll/通知規則は未対応。
- 採択状態: 現行f6固定L2/L11文書のPO合意/候補採択状態を参照。画面要求の個別採択状態や実装済みを意味しない。後発57+11にsource-qualified legacy identityとの完全一致なし。
- 状態: `open_partial_correspondence`、successorなし、authority effect `none`。

### HM-07

Source-qualified identity: `harness/L1-requirements/screen-requirements.md::HM-07`; queue status: `not_individually_compared`.

- 旧source `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/screen-requirements.md:139` line SHA-256 `caa6c2fb90bf684685d3a163cf4db938b3e6a7def34cb030e5b11e155fd3155c`: | **HM-07** | Doctor 結果ビュー | `helix doctor` 全量検出の構造化表示 | FR-L1-18 / `helix doctor` |
- 旧source詳細 `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/screen-requirements.md:210` line SHA-256 `b4e61871f23b925dd7eb7f98e4cab128c1e12788fce422b6caffd5c494e61850`; file SHA-256 `e5b6964567242a2440ded28ed99c1783f37a9326624c02283c7a975c3020063b`
- 旧L3 consumerのsource line SHA:
  - `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md:43` SHA-256 `5549e646a34bf8418004199fbc421ebac59b9786c1a2d1d0bd26d8992268e247` — | FR-02 | FR-L1-02 | PM-02 (L7) / HM-07 | Forward | all (be/fe/fullstack 中心) | TDD Red のテスト観点承認 (TL) |
  - `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md:44` SHA-256 `39d73dbcb0a8b9278808e7beacc99497b7026712d3736314be32297854bf9612` — | FR-03 | FR-L1-03 | PM-04 / HM-07 | Forward / Reverse | all | trace 抜け検出時の修正方針 (TL/PO) |
  - `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md:46` SHA-256 `0a7b6a72330006923090e90e062df1d667201b6bc9a8878e05f6d6f4b5326c44` — | FR-05 | FR-L1-05 | PM-03 / HM-07 | 全 mode | all | gate fail 時の bypass / 修正判断 (PO の S-03) |
  - `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md:52` SHA-256 `fcec909b5387cf6837e856a39d5fb41fca48319cd25242f840288e565b65a27b` — | FR-11 | FR-L1-11 | PM-03 / HM-07 | 全 mode 横断 | all | interrupt 発生時の優先度判断 (PO) / debt 返済 PLAN 採用 (TL) |
  - `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md:55` SHA-256 `a55250fdbe115ff60520a9352beb6146f0e70280c5db2348b09d268b2fdcfd9c` — | FR-14 | FR-L1-14 | PM-02 / HM-07 | Reverse | reverse / all | R4 routing 先選定 (L1/L3/L4/L5/gap-only) (TL) / promotion strategy (PO/TL) |
  - `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md:58` SHA-256 `5943c76c04db6cc93fb31e03eb2e4a8ba9389477eefd8c1a7bbf46991461b50d` — | FR-17 | FR-L1-17 | PM-03 / HM-07 | 全 mode | all | CI fail 時の修正 vs 再実行判断 (TL) |
  - `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md:59` SHA-256 `e4acee2c5b65218eb2892744538fa6352df15f96122f728e95196b3f27a4389e` — | FR-18 | FR-L1-18 | HM-07 / PM-04 | 全 mode | all | doctor 検出結果の優先度トリアージ (TL/運用者) |
  - `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md:62` SHA-256 `02dc908b129d773aa40d675787353e8db9f4259891bbab3599899a32e4a756a8` — | FR-25 | FR-L1-25 (workflow core、A-50) | PM-02 (Refactor) / HM-07 | Refactor (主) | all | refactor 範囲承認 (TL) / regression 結果判断 |
  - `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md:507` SHA-256 `57904f285dacd4936d1f9f0505db2e5c574c04eb3f11b25e42842b45dab24d54` — - **振る舞い**: `helix doctor` で依存漏れ / 契約漏れ / 接続欠損 / デグレ を全件集約 → HM-07 Doctor 結果ビューに表示
  - `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md:512` SHA-256 `1f9f1898b8efcbae7499c0a6aad0aa3e34a5df085be15f96c8614fbf017c0e11` — - **期待結果**: HM-07 ビューに `All clean (0 detections)` 表示 / 終了コード 0 / audit に実行記録
  - `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md:517` SHA-256 `bd4909ff600c95c8dee2a53153f392ce838d953b939f1addc031c769626489f8` — - **期待結果**: HM-07 ビューに 3 件分類表示 (severity 別) / each 検出に next_action 提示 / error 1 件で終了コード 1
  - `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md:800` SHA-256 `d5eb2934955231fd42f82153cd6b4a3b49138a79f4ab05323b021aaea4e2c286` — | FR-03 | PM-04 / HM-07 | AC-FR-03-01 → PM-04 trace ビュー / AC-FR-03-02 → HM-07 Doctor 結果 |
  - `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md:801` SHA-256 `c3fb6d00fc839394412a10a87dad788d83c98d7cb324906abe3a716d2d0a8a8c` — | FR-05 | PM-03 / HM-07 | AC-FR-05-01 → PM-03 Gate 判定 / AC-FR-05-03 → HM-05 audit log |
  - `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md:804` SHA-256 `0c3bf5501e3dc33fef4920d7edd85ea476a00e221a5ec2db9d0c6dd01c6c741a` — | FR-18 | HM-07 / PM-04 | AC-FR-18-01〜03 → HM-07 Doctor 結果ビュー、severity 別表示 |
- 旧consumer詳細: §1.HM.07: `helix doctor`全量結果（V-model順序/entity coverage/hook/phase/carry）をerror/warn/info分類しD-03件数集計。詳細展開/PM04 trace・PM02工程遷移/再実行/copy、doctor実行時即時+30秒poll。clean=0件、warn、error (D-03=0件違反)、not yet。
- 固定L2/L11参照:
  - **HARNESS-L2-005** (inside_po_fixed_l2_l11_bytes)
    - `docs/helix-harness/L11-acceptance/product-acceptance.md:25` SHA-256 `edeceea2b54fe31fe92460f610e19a49e32fde6a2d7a57c51d98c9b9afcbe371` — | HARNESS-L2-005 | ticketとの関係（Forward 小・中・大、V字の対、触るコネクタ、変更の種類）と、変更の内容・layer・riskから必要な検証が導出され、固定の段数ではなくその検証に合うCIをPRの前に組み立てる規則が導かれ、HELIX-OSの検収がその規則でCIを組み立てられる。省いた検査は記録され、合流先のticketで回収される。異なる言語・CI実装でも同じ検証契約を評価でき、特定Worker、旧job集合、CI greenを検証義務の代替にしない |
    - `docs/helix-harness/L2-requirements/product-requirements.md:44` SHA-256 `74fae9aa240f21074a24e5da08c19dba8ac26389d1c473f6f979ed3b789f0d1c` — | HARNESS-L2-005 | HARNESS-L1-004 |
    - `docs/helix-harness/L2-requirements/product-requirements.md:56` SHA-256 `7840e6369db64bfe553628e2cb0c5cafcd8537266b2637e64e5c9789778f81e4` — | HARNESS-L2-005 | ticketとの関係（Forward 小・中・大、V字の対、触るコネクタ、変更の種類）と、変更の内容・layer・riskから必要な検証義務と証拠条件を導出し、PRの前に回すCIを動的に組み立てるための規則を定められる。CIの組み立てと運転はHELIX-OSの検収が行う。言語・tool・実装方式に依存しない | HNFR-P3、v1.3 §4、旧GH-FR-025、新世代CI要求候補、2026-09-24 PO判断、[2026-09-26 PO判断](../../governance/decisions/harness-v-valley-process-po-decisions-2026-09-26.md) | CIの段数を固定せず、特定CIやWorkerに依存せず、対象revision、oracle、expected failure、証拠、有効期限、差戻し先を説明できる。全件の実行を既定にせず、省いた検査を記録して合流先のticketで回収する |
    - `docs/helix-harness/L2-requirements/product-requirements.md:118` SHA-256 `a84e1a518adfcb06d2a79c542160c401b3ad2e046f5dbe160ebdbc136c2db815` — | HARNESS-L2-005 | [2026-09-26 PO判断](../../governance/decisions/harness-v-valley-process-po-decisions-2026-09-26.md)に従い、検証の義務を構造の粒度ごとに別に導く。単体は単体の検証、接続は境界・結合の検証、構成体はシステムの検証とし、上の構造は固有のoracle、expected failure、証拠の条件を持つ。下の証明は上の証明の証拠として積み上げ、上の構造では、固有の義務との差分だけを証明する（構成的保証と差分証明）。すべての単体の合格は接続の前提の証拠であり、接続に固有の義務を満たして接続の合格となる。構成体も同じとする。下の証明と組み合わせの契約がそろい、未解決の構成体に固有の義務がないことをHARNESSの契約で示せるときは、構成体の合格を機械的に導いてよく、大きな端から端までの検証をやり直さない。構成体に固有の非機能（例：システム全体の応答時間）のように下の証明で表せない義務は、別に証明する |
    - `docs/helix-harness/L2-requirements/product-requirements.md:119` SHA-256 `bf3b23aa56993cf034e77229328dfeab07be101dc557846dcee285468d7fb82e` — | HARNESS-L2-005 | [2026-09-26 PO判断](../../governance/decisions/harness-v-valley-process-po-decisions-2026-09-26.md)に従い、PRの前に回すCIは、ticketとの関係から決める。Forward 小は原子CI、Forward 中は境界の証明（触ったコネクタの契約を含む）、Forward 大はシステムの証明を基本とする。認証、DBのmigration、security、releaseの変更のように危険度の高い変更は、小さな変更でも上の証明を早めに求める。mainの健全性は、変更がticketの範囲を超えていないかの確認で保ち、範囲の外への変更があれば止める。merge直後の全件実行と夜間の補完は既定にしない。省いた検査は記録し、合流先のticket（Forward 小は中か大、中は大）で回収する。回収されないまま残っていれば、Release Portで止める。影響が広がる密結合が見つかったら、その変更で影響する接続・構成体の検査をそのPRで広げ、成立するまで合流させない。そのうえで、CIを恒常的に重くして守らず、設計の不具合としてDesign-refactorを発行して結合を切る。検査をすり抜けて後で見つかった失敗は、HELIX-LABOが振り返り、原子CIやコネクタの契約が足りているかを評価して返す |
    - `docs/helix-harness/L2-requirements/product-requirements.md:120` SHA-256 `da55ac17a732605dd6cb45a28e31ae534179bfd870e1d2536b3a4b6cc1c78be6` — | HARNESS-L2-005 | 旧GH-FR-025（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/github-atomic-development-requirements.md:29,52-62`）は、PRでは影響範囲だけを検査し、省いた検査の集合を記録して、main合流の直後に全件で回収し、夜間に欠落を補完し、危険度の高い変更は最初から全件にしていた。保持する点は、影響する範囲だけを選ぶこと、省いた検査を記録して黙って捨てないこと、危険度の高い変更を軽い検査で通さないことである。変更する点は、範囲を決める元を変更の差分からticketへ移すこと、回収の場所をmerge直後の全件実行から合流先のticketへ移すこと、夜間の補完をやめることである。理由は、POの「既存の方式はちょっと推進が遅いから」と、危険度の高い変更の原因が密結合だったことである |
    - `docs/helix-harness/L2-requirements/product-requirements.md:121` SHA-256 `164544023a6646eda7f073c3dbd7b30b1fc33e1bb33b5d5649be7305ae15a923` — | HARNESS-L2-005 | 検証条件には対象要求revision、成果物、入力、oracle、expected failure、実結果、証拠の有効期限、差戻し先を含める。required／conditional／informational／N/Aを理由付きで区別し、unknownをskipへ変換しない。CI成功・画面表示・文書登録だけを利用者受入や全工程完了の証拠にしない |
  - **HELIXSECURITY-L2-007** (po_fixed_candidate_adopted)
    - `docs/helix-security/L11-acceptance/security-acceptance.md:31` SHA-256 `982d0033e8483b228cd8b3f645bea65ae979c07cc64f5c02986971092ac9b089` — | HELIXSECURITY-L2-007 | 1.0 | 各制約（write path、network、credential、environment、timeout、resource、diff検査、rollback、result collection）がWorker実行環境へ渡り、適用・観測状態を確認できる。いずれか未適用/unknownなのにhost fallbackで実行、制約をWorkerが自己拡張したら不合格。read-onlyでもwrite禁止の適用と操作対象scopeの実行後の変更なし観測を要する。rollbackだけは変更なしを確認できた場合に限り適用対象外とでき、変更有無がunknownなら成功扱いしない。後掲の9制御fixtureで条件を個別に確認する。 |
    - `docs/helix-security/L11-acceptance/security-acceptance.md:69` SHA-256 `77e0093c69fc8b12f991aec7a7451275739bd90c0ab489facfe812bbe79c02a2` — ## HELIXSECURITY-L2-007：9制御の受入fixture
    - `docs/helix-security/L2-requirements/security-requirements.md:45` SHA-256 `25fefefba408c4173c0475849bca4835dc0f3ff25f596601fff647b8aa28c162` — | HELIXSECURITY-L2-007 | connection | L1-007 | Worker実行環境への制約適用 | 1.0 |
    - `docs/helix-security/L2-requirements/security-requirements.md:130` SHA-256 `b4ca3f5bd1482136f4dd2d77d0ae83c486c2f4fa13584fee698f1717d933f086` — ### HELIXSECURITY-L2-007 Worker実行環境への制約適用（接続）
  - **HELIXSECURITY-L2-020** (po_fixed_candidate_adopted)
    - `docs/helix-security/L11-acceptance/security-acceptance.md:44` SHA-256 `03eed81aae087260e49576bbdc6036f45206f8fb346afdce9699c27932997ec8` — | HELIXSECURITY-L2-020 | Guard 1.0、Bot必要時 | Injection Guard、Scope Guard、Hook Guard、Secret Guard、Egress Guard、Runtime Guard、Permission Guard、Core Asset Guardの決定的判定をGuard側に置く。Bot候補例のSecurity Audit Bot、Injection Analysis Bot、Core Probe Detection Bot、Supply-chain Review Bot、Security Diagnosis Botはsemantic judgement/diagnosisのため必要に応じINTELLIGENCEへ接続する。候補例は全Botの初版実装・運用を要求しない。Bot不在を理由に決定的制約が抜ける、Botが包括Write権を持つ、候補を全て1.0必須runtimeとするなら不合格。Core Asset Guardの名称を保持しつつ、1.0のGuard基盤とL2-019/025の1.x公開sink適用を別に判定する。名称の列挙だけで完全なasset-specific egress/Web保護を1.0へ前倒しせず、逆に1.0のcredential・一般egress・operation guardを延期しない。 |
    - `docs/helix-security/L2-requirements/security-requirements.md:58` SHA-256 `e12ff3eeb8363b1f95fd142533f2cb9de75ea654a802692372fc98ccb1bae740` — | HELIXSECURITY-L2-020 | unit | L1-020 | GuardとBotの責務境界 | Guard 1.0、Botは必要時 |
    - `docs/helix-security/L2-requirements/security-requirements.md:260` SHA-256 `01e26f73bbc3ad3dcc4b77549e8c5547c2b4f67839efbdd67eadd603834fc14a` — ### HELIXSECURITY-L2-020 GuardとBotの責務境界
  - **HELIXOS-L2-019** (po_fixed_candidate_adopted)
    - `docs/helix-os/L11-acceptance/governance-acceptance.md:352` SHA-256 `241fbb855d59c68e2624fb6a90314819e38992edf467f73a8fdb73ca5e0fc332` — ### HELIXOS-L2-019 Evidence・continuityの受入
    - `docs/helix-os/L2-requirements/governance-requirements.md:682` SHA-256 `87db5d2abcbbaf27d5f9a74a85b9ceaac78965271d1af849a37a305ce30388ab` — ### HELIXOS-L2-019 Evidence・continuity（単体候補）
- 保持: HARNESS-L2-005の検証義務/証拠、HELIXOS-L2-019、Security-L2-007/020の制約適用/Guard responsibilityに隣接する。
- 変更/非継承: 現行静的確認は文書revision、ID mapping、参照、scope/responsibilityを確認する。旧doctor command/全量結果画面は新runtime要件ではない。
- 数値・例外・反例: 4分類のうち「実行前」は取得前状態でcleanと異なる。D-03=0件の意味はdoctor rule文脈依存。即時結果と30秒pollの併記。
- 未対応残差: 旧doctor rule set、error/warn/info分類、D-03集計、PM04/PM02 deep links、再実行UI/copy/更新頻度は未対応。旧CLI実行結果は移管しない。
- 採択状態: 現行f6固定L2/L11文書のPO合意/候補採択状態を参照。画面要求の個別採択状態や実装済みを意味しない。後発57+11にsource-qualified legacy identityとの完全一致なし。
- 状態: `open_partial_correspondence`、successorなし、authority effect `none`。

### HM-08

Source-qualified identity: `harness/L1-requirements/screen-requirements.md::HM-08`; queue status: `not_individually_compared`.

- 旧source `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/screen-requirements.md:140` line SHA-256 `38329cb6810fd26aeaba24c1bac4803aaf98d445fbce77b9281a0e25bbd979b7`: | **HM-08** | AI 効果データ + Learning Engine ビュー | BR-21 連動、skill/model 評価 + recipe 蓄積 + L3 forward carry | BR-21 / FR-L1-12 |
- 旧source詳細 `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/screen-requirements.md:221` line SHA-256 `e4eeb45ee67fb265bff048b2772e6de7471e2e52534b5e62c5e975f2b26d430b`; file SHA-256 `e5b6964567242a2440ded28ed99c1783f37a9326624c02283c7a975c3020063b`
- 旧L3 consumerのsource line SHA:
  - `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md:891` SHA-256 `fa234f703b8f7726f6f1be75220905d094a4176d745cb0dd9f7222760190b364` — | **D-14** (SPACE Satisfaction) | reviewer cognitive load Likert 1-5 (G2/G4/G7 後) | Phase A NFR | CC2 measurable proxy、HM-08 連動 |
- 旧consumer詳細: §1.HM.08: BR-21、skill/model評価、recipe蓄積、task success/cost efficiency、filter/detail/HM05/GD01 links、30秒poll、data/collecting/empty. 上位行140はBR-21/FR12/L3 forward carryだが詳細lines 273-280はBR21/FR19/20で、screen-internal trace conflict。
- 固定L2/L11参照:
  - **HELIXLABO-L2-050** (po_fixed_candidate_adopted)
    - `docs/helix-labo/L11-acceptance/labo-acceptance.md:100` SHA-256 `ca538f4b591d4e7cf0938b15e4b6d611e0ea50014902e5273b96febdbc16f460` — | HELIXLABO-L2-050 | ObservedからLABO再観測までidentityと未完義務を追い、実験では同じticket/experiment/対象版にOS assignmentとWorker実行結果が対応することを確認し、target変更後の効果・退行を独立に評価できる。candidate、登録、変更、検証、運用、再観測を別状態で表示する | assignmentのない実行を割当済みとする、別ticket/experiment/対象版の証拠を結合する、Feedback発行、OS登録、target変更、CI成功だけで改善完了とする、採択前candidateを正本扱いする、元記録を書き換える |
    - `docs/helix-labo/L2-requirements/labo-requirements.md:40` SHA-256 `03d238e18417c2026f8527c52ccdbe3ed6dcc2bceeaa250b41cb3166a6bedd89` — | HELIXLABO-L2-050 | HELIXLABO-L1-008 | Feedbackから変更・検証・運用・再観測までの改善循環 |
    - `docs/helix-labo/L2-requirements/labo-requirements.md:298` SHA-256 `93336c61f015f82b11a7c919366fee4ef3f1cb9b29207e753d35d8479fd2224b` — ### HELIXLABO-L2-050 — 内部改善循環（1.0）
  - **HELIXLABO-L2-055** (po_fixed_candidate_adopted)
    - `docs/helix-labo/L11-acceptance/labo-acceptance.md:56` SHA-256 `ab34f5aa8d2993ef4caaca48bda35bcb4e3cbf43e5819dc5b5eb73db655065ed` — | HELIXLABO-L2-055 | Worker作業履歴を作業種別・model classごとに集計し、水準・根拠・評価範囲と評価済み/未評価状態を生成できる。配置案・指定・割当ては生成しない | 未評価modelを評価済みと表示する、履歴だけで未知jobの成功を保証する、LABO/Benchが配置案・指定・割当て・権限変更を行う |
    - `docs/helix-labo/L11-acceptance/labo-acceptance.md:191` SHA-256 `553ab0696c23122911abfc8eb5ba33129436c82f6b61ae2ec58308f09a32f5e8` — ### HELIXLABO-L2-055 — Bench分母・欠測・採点根拠
    - `docs/helix-labo/L2-requirements/labo-requirements.md:45` SHA-256 `e7dca21158224a017ed478d27b95996887fa48ef34b62ee12e72c31e45ab2027` — | HELIXLABO-L2-055 | HELIXLABO-L1-011 | 単体要求：HELIX-BenchがWorker履歴から作業種別・model class別の水準、根拠、未評価状態を生成する。配置と割当ては行わない |
    - `docs/helix-labo/L2-requirements/labo-requirements.md:150` SHA-256 `6330f8400512c454e76a4873d6df075c0e59b3f0987c8a30a1e362051cf2c51b` — ### HELIXLABO-L2-055 — HELIX-Bench 作業水準生成（1.0）
  - **HELIXINTELLIGENCE-L2-063** (po_fixed_candidate_adopted)
    - `docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md:117` SHA-256 `5a757ecc4605ab597254191f36ca296d65bc7980f3a71bbdb522527f1f96a294` — | HELIXINTELLIGENCE-L2-063 | LABO/BRAIN/INTELLIGENCE/OS/HARNESS間の自己改善loopで、各正本owner・効果評価を保持する | INTELLIGENCE単独で過去効果やBRAIN knowledgeを確定する |
    - `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:372` SHA-256 `65cc621b4d41c02ff16127cde0fb8f37e23f6776735ef1342bd935fb5a4c0f87` — ### HELIXINTELLIGENCE-L2-063 — 継続的自己改善
- 保持: LABO-L2-050/055 worker/history evidence、INTELLIGENCE-L2-063 task assistance/quality contextは隣接するが、evaluation semanticsを規定しない。
- 変更/非継承: 現行Worker history/evidenceとtask-scoped intelligenceは限定的に保持。旧Learning Engine、skill/model score、recipe system、L3 forward carryを画面合意として採択していない。
- 数値・例外・反例: BR/FR mapping itself conflicts inside source. 30sec polling and no-data versus accumulating/data are explicit legacy display states, not accepted current thresholds.
- 未対応残差: skill/model metric definitions, recipe accumulation, cost efficiency model, DB projection, filter/drill-down, freshness/state display, BR21 ownership/FR mapping resolution are open.
- 採択状態: 現行f6固定L2/L11文書のPO合意/候補採択状態を参照。画面要求の個別採択状態や実装済みを意味しない。後発57+11にsource-qualified legacy identityとの完全一致なし。
- 状態: `open_partial_correspondence`、successorなし、authority effect `none`。

## 後発57+11判断

両方の決定記録のcandidate identity表を全件確認した。57候補は42採択/11条件付き採択/4保留、11候補は8採択/2依存付き採択/1現revision不採択。選択した旧source-qualified identityとの完全一致は0件。候補採択状態は旧screen個票の採択やL2/L11 coverageとは別で、後発pairからscreen successor/closureを生成しない。

## 固定L2/L11バイト

- `docs/helix-harness/L11-acceptance/product-acceptance.md` @ `f6dad2a33e24f000b87d7f09b8d40288257e74cc` SHA-256 `09b2963187f9aaddbb1ad189d77e517e91914bd5ccdf2499dd9c11855139bcd4`
- `docs/helix-harness/L2-requirements/product-requirements.md` @ `f6dad2a33e24f000b87d7f09b8d40288257e74cc` SHA-256 `aed75cb4bdd644eedd9d3eb408cf522af2c4fbf4272db7b775edc62fc383100a`
- `docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md` @ `f6dad2a33e24f000b87d7f09b8d40288257e74cc` SHA-256 `4b96aa9565325a35d3ca10813453434df9ec15f21ea64f5db22740fdb3218e3a`
- `docs/helix-intelligence/L2-requirements/intelligence-requirements.md` @ `f6dad2a33e24f000b87d7f09b8d40288257e74cc` SHA-256 `40497f22a3ec2aff462b617764df7da6d09b427d95ed91d2ee737535c2e91260`
- `docs/helix-labo/L11-acceptance/labo-acceptance.md` @ `f6dad2a33e24f000b87d7f09b8d40288257e74cc` SHA-256 `bcd77438bf1afa4d33c31d35fa5138ea6f978f3d241d159bde35f0b0ccf83200`
- `docs/helix-labo/L2-requirements/labo-requirements.md` @ `f6dad2a33e24f000b87d7f09b8d40288257e74cc` SHA-256 `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`
- `docs/helix-os/L11-acceptance/governance-acceptance.md` @ `f6dad2a33e24f000b87d7f09b8d40288257e74cc` SHA-256 `925e06cd08056d9569dd31703d7f76e5be59b34f85980646c733367af5edd680`
- `docs/helix-os/L2-requirements/governance-requirements.md` @ `f6dad2a33e24f000b87d7f09b8d40288257e74cc` SHA-256 `c92d3c052884c05fbbba89fc86f6e6e0c576846e87073327fb0917e32a1747cf`
- `docs/helix-security/L11-acceptance/security-acceptance.md` @ `f6dad2a33e24f000b87d7f09b8d40288257e74cc` SHA-256 `25635649f87c0e805a5d1cf35b5c1201144c851533808770cd4f9ac6ba067c01`
- `docs/helix-security/L2-requirements/security-requirements.md` @ `f6dad2a33e24f000b87d7f09b8d40288257e74cc` SHA-256 `027e6d25c8665e8aca006f23660c4ecfcc0ec0a92946be871e935ec5aa7a774c`

## current-input pins

- `docs/governance/audits/requirements-stage/confirmed175-condition-comparison-queue-2026-09-30.json` SHA-256 `2dbfb06c11ac42a940c0d6b5c188a76e685ea4c00e4d9af10b432198ad17b353`
- `docs/governance/audits/requirements-stage/legacy-confirmed175-full-audit-2026-09-28.json` SHA-256 `ca08a81d97e39e94aa02151c7cc4e48f621f9d30baccc1cf9b715331fed38f45`
- `docs/governance/audits/requirements-stage/legacy-source-origin-reg06-population-audit-2026-09-28.json` SHA-256 `286352584c5ef17195b71c57be165eaf2b1d2da1a2877b53258b65e6ec58f4e6`
- `docs/governance/legacy-asset-disposition.jsonl` SHA-256 `cd73ac407937ad86c6be2c0b27d70863b1873fe39c2d6c0f89620e648dccad8c`
- `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/screen-requirements.md` SHA-256 `e5b6964567242a2440ded28ed99c1783f37a9326624c02283c7a975c3020063b`
- `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md` SHA-256 `a90609ad8145d8b9c1be6a6870b6ecad4bc71f3708fc977edd14f926c074257a`
- `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/functional-requirements.md` SHA-256 `a9c1064d359b0d9c7269a2253e416597de77fa91149c162f9a40467be3f1a008`
- `docs/governance/decisions/po-decision-2026-09-29-57candidates.md` SHA-256 `c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad`
- `docs/governance/decisions/po-decision-2026-09-29-11candidates.md` SHA-256 `6e10127a65a775b0a7554ccb359abdfc1221d17a2c48fb79321d59369df127c5`

## 追加のcurrent-input pins

- `AGENTS.md` SHA-256 `96e0ae7e0c23d95481133c65103004422806503528628f2057ddd56926076302`
- `CLAUDE.md` SHA-256 `aaad70a2b77dfe2db896ce8baeba3ce074534718f339bd04d48f9e25259b532f`
- `docs/governance/new-generation-start-here.md` SHA-256 `94ba0d22bf33338960db9c9fa1a61f438ec24e9b44643631c8bf1cdcf19bb154`
- `docs/governance/decisions/helix-harness-requirements-po-decision-2026-09-28.md` SHA-256 `c7a6d39ceb853fe6c00ccc336ffa7bbbd6c7e87a0aaba172f43f490dd0a7fd23`
- `docs/governance/decisions/helix-os-requirements-po-decision-2026-09-28.md` SHA-256 `5f54e68009fe291853d2d55df241e8220cfdd93eadd1b2a203bb126596b321da`

## 方法と限界

- 旧screen sourceの要約行と各画面詳細、旧L3の画面/運用者責務trace行を読んだ。旧L3/functional/screenのtrace資料は参照に留め、旧実行を証拠にしない。
- L2/L11のtarget行はf6の正確なバイトからline SHA-256を採取した。target IDが見つかることは旧screen atomの完全被覆を意味しない。
- `.helix/`、old `helix` CLI、old runtime/schema、旧テスト/CIは現行経路に移植・実行していない。
- 本記録は条件比較であり、採択判断、source disposition、successor assignment、実装許可、L3承認、受入実行、source retire、Step 5完了ではない。

## 非主張

- 採択要求・successor IDは作成していない。
- 9 identityの全条件closure/complete coverageを主張しない。
- 旧CLI/CI/runtime/testを現行の経路として使用していない。
