# 実装順序のPO選択記録：Stage 2cを前倒し（2026-10-03）

## 対象とsource pin

この記録は、要求段階でL3開始時の判断として残されていた実装順序A/Bについて、POが選んだ案Bを受領・固定するdecision recordである。選択対象は実装順序だけであり、L3/L10の本文承認、1.0収載、要求の追加・変更、実装・実行・release許可を生成しない。

- 基準main: `633bf12ea8f948db8ba3d6600179c4a9507377a7`（#2554統合後）。
- PO source: `scaffold/review-handoff/local/codex-goals-2026-10-03-l3.md`。2026-10-03にshared local sourceとして受領し全文を読み、SHA-256=`b5030366fe27022695c9a51883e7cfe11656bc8ffce90c932598b85e9e9a79c4`、bytes=16787を固定した。このsource file自体は本recordのbase commit `4ef29ee37ee271d224b4f3e6c520b996075c66e3`に含まれない。
- 9/27順序案: `docs/governance/audits/requirements-stage/implementation-order-2026-09-27.md`、基準main上のSHA-256 `9b6c7233c57a42dc43c20146f776399a03c9aaf827f40f03a436cba15d7cb862`。
- 9/27機械照合: `docs/governance/audits/requirements-stage/implementation-order-assignments-2026-09-27.json`、基準main上のSHA-256 `78db3c793c17dbd80ad663a63aadd5f3c1c1e403da6b3bba75518ecfe5ba7f25`。JSON `source_revision`=`d308f4080da298172001ef97e9c4b5f66d32ed7d`。元source setのfile SHA一覧は追補JSONの`order_assignment_source.source_sha256`に保存する。
- 順序案本文・JSONは変更しない。全374採択候補のversion intent/Stage joinは、追補 [`implementation-order-addendum-2026-10-03.json`](../audits/requirements-stage/implementation-order-addendum-2026-10-03.json) を参照する。追補のMDはその人向け説明である。

## 受領した質問と選択肢（原文）

ゴールsource内の質問（line 11）:

> Claudeの質問：「L3の着手順は、Stage 1（共通の土台）→ Stage 2a（最初の一周を回す最小部分）までは共通です。その後に優先する枝はどちらにしますか？」

9/27順序案に保存された選択肢本文（`implementation-order-2026-09-27.md`「初回slice後の優先順の判断材料」）:

- 選択肢A: Stage 2b/3の基礎unitを先に広げ、各domainの能力・契約の幅を先に整える。運用を広げるときの依存見通しは得やすいが、低コストWorker支援やcase準備の効果を観測する時期が遅くなる。
- 選択肢B（推奨）: Stage 2a後、Stage 2cから適用oracle・scope・authorityが揃う小さなWorker支援/test生成枝を選び、Stage 2b/3と並行して進める。支援/生成単体から始め、相談・実行・compositeはその操作を選び必要なreceiptが発生した場合にだけ続ける。

POがgoal sourceに記録した選択（lines 12–13）:

> POの選択：「案B：支援・テスト生成を前倒し (Recommended)」
>
> 選択肢本文：「Stage 2aの後、Workerへの支援・テスト生成（Stage 2c、6件）を狭い範囲で先に進め、残りの基礎部分（2b、72件）と並行する。後続の作業コストが下がるかを早く確かめられる。9/27順序案の推奨。」

本記録は受領した原文を保存する。新しい質問、選択、approval procedureを作らない。

## 固定された元Stage 2c identity/revision

9/27 JSONの`stage_assignments.stage_2c`は6 identityを含む。identityは下表の基準main上のPO-adopted registration revisionとcandidate semantic digestへ固定する。9/27 JSON自体はidentity/stageのみを持ち、revision/digestを含まないため、registration/PO-decision joinは基準main `633bf12`で固定した。

| Identity | Stage | registration revision | candidate semantic digest | PO decision locator |
|---|---|---|---|---|
| `HARNESS-L2-030` | `Stage 2c` | `MPR-RC-HARNESS-L2-030-002` | `sha256:579043ac6abf9bff8712355ff96da3cd6287b286947074a11efc583c1f38e0a1` | `docs/governance/decisions/helix-harness-requirements-po-decision-2026-09-28.md#L59` |
| `HARNESS-L2-031` | `Stage 2c` | `MPR-RC-HARNESS-L2-031-002` | `sha256:ca1e113a5980df023bdb27bb461e1fc57137d14da060d26180e4d70abdf90611` | `docs/governance/decisions/helix-harness-requirements-po-decision-2026-09-28.md#L60` |
| `HARNESS-L2-032` | `Stage 2c` | `MPR-RC-HARNESS-L2-032-002` | `sha256:83967a4eb0b9671293bc0d6006652c0ca42648836e108f6093c01e55ff77c569` | `docs/governance/decisions/helix-harness-requirements-po-decision-2026-09-28.md#L61` |
| `HELIXINTELLIGENCE-L2-068` | `Stage 2c` | `MPR-RC-HELIXINTELLIGENCE-L2-068-002` | `sha256:d5145aae05dffd5bc61d795748060fca95f446be0b100b786a178bcf503452bf` | `docs/governance/decisions/helix-intelligence-requirements-po-decision-2026-09-28.md#L98` |
| `HELIXOS-L2-028` | `Stage 2c` | `MPR-RC-HELIXOS-L2-028-001` | `sha256:f41238ee4660d455d6f6a144bdab4a35ef9704aac190835a24589853ed3e4fab` | `docs/governance/decisions/helix-os-requirements-po-decision-2026-09-28.md#L48` |
| `HELIXOS-L2-029` | `Stage 2c` | `MPR-RC-HELIXOS-L2-029-003` | `sha256:59a37b8d83fb269c12263089d937e696d0b9bfe8684d46822e267588802878f8` | `docs/governance/decisions/helix-os-requirements-po-decision-2026-09-28.md#L27` |


上記6件以外の追加候補も、Stage 2cへ置く場合は9/27順序案が定めた小scope、必要契約、Stage 2bとの並行可能性を保つ。Stage 2c全件開始・完了は2bまたは後続Stageの全体gateではない。

## 順序追補とversion境界

基準main `633bf12ea8f948db8ba3d6600179c4a9507377a7`時点の最新candidate register/PO decision joinは374 adopted / 5 hold / 5 rejected / 0 unrecordedで閉じる。これは#2554統合時点のsnapshotであり、R2289等の後続metadata訂正後にある最新register rowからPO approvalを継承しない。374は次の版intentへ一件ずつ分類する。

| version intent | adopted | Stage/扱い |
|---|---:|---|
| `1.0 target candidate` | 274 | 9/27 core 214件と後続PO判断で採択された1.0 target 60件 |
| `later-version hold` | 35 | 9/27 hold 33件と追加採択HARNESS-086、LABO-062 |
| `conditional Web/WEB-OS` | 3 | 9/27のLABO Web source 3件。conditionalのまま |
| `version unspecified` | 62 | L2/POが対象版を未指定。Stage配属は順序案であり1.0収載、版選択、承認gateを意味しない |

版intentとStage順序は独立軸である。Later 35とcurrent disposition hold 5は異なる集合である。Current hold 5とcurrent-revision reject 5（別紙JSONの`excluded_not_l3_parent`）はいずれもL3の親ではない。Version-unspecified 62件の対象版を本記録で選ばず、1.0への自動収載も行わない。Bun禁止はgoalの作業制約として即時適用する一方、HELIXOS-L2-132のversion-unspecifiedというL2状態は維持する。

Routing/transfer declaration 22件は9/27付属JSONの別分母であり、374採択candidate分母に加算しない。HELIXOS-L2-001は旧routing declarationとのidentity collisionを保持するが、routing populationをL3 candidateとして重複加算しない。

各374行のPO decision locator、exact registration revision、candidate semantic digest、version evidence、L2 section locator/SHA、Stage、reason、直接依存ID/source lineはpaired JSONに固定する。Source hashは三種を分離する: `candidate_semantic_digest`はMPR/decisionの候補digest、`source_section_normalized_text_sha256`はCR/LFを除いた各論理行をLFで結合し末尾LFを付けずにhashした値、`source_section_raw_bytes_sha256`は1-based inclusiveの`start_line..end_line`を元ファイルbytesから改行込みで抜いたSHA-256である。各recordの`source_section_line_span.end_line_inclusive=true`。R2289等のregister metadata/locator訂正後も、要求approval parentはPO decisionが固定したregistration revisionとcandidate semantic digestである。latest register metadataから新しいapprovalを継承しない。

## L3/L10文書の配置状況

L3本文起草はL3-D0の置き場所決定を待つ。候補配置は各8機構の`docs/<mechanism>/L3-requirements/`に`functional-requirements.md`、`business-requirements.md`、`nfr-grade.md`、対となる`L10-verification/`に`functional-verification.md`、`business-verification.md`、`nfr-verification.md`を置き、`docs/governance/l3-l10-authoring-layout.md`でcanonical説明する案である。これはL3-D0の置き場所決定・検収前の予定locatorであり、最初の文書をpublishするとき存在・決定結果を再確認する。要求の意味を変更しない。

## 旧HELIX起点と再利用記録

旧HELIXの起点をlegacy asset registerとarchive本文で照合した（参照読取のみ）。

| 用途 | Legacy asset | source path / line | SHA-256 |
|---|---|---|---|
| L3層定義 | `LEGACY-ASSET-F542125805B777D8A56A` | `archive/legacy-generation-2026-09-14/root/docs/process/forward/L00-L06-design-phase.md:13-21,101,148-168` | `9f8fc48a087fa9ba6e629518fb376630d7863491d2f85be96a8b3fd0c6d2efc3` |
| L3 gate | `LEGACY-ASSET-B30F3C82B6B0FDC0D2A8` | `archive/legacy-generation-2026-09-14/root/docs/process/gates.md:41,64` | `dcbc0009d6fd7576cd305f90cfbf47916f666ada0031711f1fa1f952b7014b08` |
| L3 authoring boundary | `LEGACY-ASSET-6EBDB617A8104A7756D0` | `archive/legacy-generation-2026-09-14/root/CLAUDE.md:82-85` | `7bdfc0bc578359e42efae4242ee42b53abd6e2ec23874f1294d3ec0e278c8feb` |
| HELIX shared L3 requirements | `LEGACY-ASSET-EE5DBACC7F28F7D1F605` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md:22-349` | `7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544` |
| HELIX-HARNESS L3 requirements | `LEGACY-ASSET-B5B5E71B2AF1459D59A1` | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md:28+` | `a90609ad8145d8b9c1be6a6870b6ecad4bc71f3708fc977edd14f926c074257a` |
| HELIX-HARNESS L3 acceptance design | `LEGACY-ASSET-1B92155F959D7905DD1E` | `archive/legacy-generation-2026-09-14/root/docs/test-design/harness/L3-acceptance-test-design.md:26-243` | `27a92c3be07aa06b9e8a598b7b2b7bcc357ccb6afa876e27e45cd85e7f3d00c1` |
| HELIX shared L3/L10 acceptance design | `LEGACY-ASSET-44DD86E3DEC09E65EF51` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md` | `df81469f13deb45e7da4c74d90c7f3d3b1be5f26ccf63b706e6e230bc5b4c3b6` |

旧HELIX L3定義・要件/acceptance pairを起点にする（旧asset ID・path・line・SHAをdecision recordへ固定した）。旧から引き継ぐ保持点は、L3のFR/business/NFRをL10検証設計とpair化し、親要求へtraceすること、要件をAIが起草しPOが承認する責務境界である。旧実行可能schema/runtime/test/CLI/CIは移植・実行しない。後続本文で項目ごとに完全一致再利用・意味の再導出・置換を明記する。今回の順序記録は要求意味、owner、scope、version targetを変えない。

## authority境界

本decisionはStage順序とsource receiptだけを記録する。L3/L10承認、未指定versionの選択、release contents、実装・run許可、またはPOへの個別parameter質問を生成しない。要求の意味/scope/owner/versionを変える必要が生じた場合は既存の要求段階へ戻し、PO判断を求める。技術値は根拠と比較案を付けてL3案として作成し、通常のL3承認へ含める。
