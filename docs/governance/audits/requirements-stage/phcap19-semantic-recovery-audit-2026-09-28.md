# PHCAP-19 意味監査

## 範囲と結論

`docs/governance/phase-capability-inventory.md`と同JSON、旧資産台帳、旧sourceを起点に、`main`の固定HEAD `559ae3ba4bfe660d666a57f227466d7dcdd440d9`（#2233 merge後）を読み取り専用で照合した。照合中に要求本文やGitHub状態を変更せず、archive内のruntime、test、CIも実行していない。

PHCAP-02〜20の19件は、台帳の移行状態で「縮退」17件、PHCAP-07「正式再実装なし」1件、PHCAP-08「意味同等性未解決」1件である。PHCAP-19は縮退17件の一つ。初期inventory JSONのPHCAP-19 `current.refs`はOSのL2/L11 pathだけで、後続のLABO・INTELLIGENCEの判断済みIDとその受入への接続がない。

phase inventoryの`draft_requirement`および「OS draftのみ」という記録は、固定`current_evidence_snapshot`の`e784fa68702af4b7c57911b866b48fe7df094f88`時点では正確である。その後に確定した対象revision付きPO判断が、現在の要求authority状態を更新している。この監査は、過去snapshotを書き換えることを推奨しない。

**現在のHEADでのPHCAP-19判定：** 改善循環の要求意味は、固定L2/L11一式のOS-L2-005/022、LABO-L2-050、および範囲を限定したINTELLIGENCE-L2-063に採択されている。これは要求意味の回復であり、実装の回復ではない。現行runtime、feedback receipt、L3/L10実装、受入実行の証拠は確認していない。したがって`implementation_recovered:false`とIssue未完了の境界は維持される。

## 旧sourceの資産ID・path・行数・SHA

次のasset ID、archive path、全行数、SHA-256を旧資産台帳とarchiveのbytesで照合した。

| 資産ID | 旧source path | 全行数・SHA-256 | 証拠の種類と該当範囲 |
|---|---|---|---|
| `LEGACY-ASSET-02D897E62EF2FA267267` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/universal-improvement-loop-requirements.md` | 243行・`01de2c4ebed55686779fee30386f0056da1dd3c4642d0d20f3732becc67467d4` | 旧規範要求。UIL-R-01..15は43–200行、目的とauthority境界は31–40行、state/workflow境界は202–243行。 |
| `LEGACY-ASSET-D65FB82C21C5EDBDFCE4` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/memory-learning-promotion.md` | 272行・`70ed887f35ca38a6e406d91b750848a9b89cde73825358c554ad009d473a115a` | 詳細設計案。component分割72–89行、compaction 91–132行、learning promotion 147–180行、効果・rollback 182–224行。現行受入やruntimeの証拠ではない。 |
| `LEGACY-ASSET-C544D3D166699301485D` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L6-function-design/universal-improvement-source-registry.md` | 79行・`e83a626e133f5a5aa213ff2bd6ae0f1c819d0bb7a00679d8982884596b4ff645` | registry設計、型付きadmissionと失敗境界18–73行。現行registryではない。 |
| `LEGACY-ASSET-57A29D57A3AD07CA4DFF` | `archive/legacy-generation-2026-09-14/root/src/runtime/universal-improvement-finding-qualification.ts` | 569行・`01c69f48f4786a8e502e210b501b813cd9fbc2f61623c7a1955a6cf29c4f1ae8` | 旧実装sourceが存在する（trigger/disposition定義15–40行等）が、実行・回復していない。台帳の`implementation_status`は`unknown`。 |
| `LEGACY-ASSET-0B5B38F146D9538C9A36` | `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/universal-improvement-loop-acceptance.md` | 46行・`f370e2d36490a2b113110c0ecfbc82082f7619fd8d905fb0f5828f10db127943` | UIL-R-01以降と対応する旧L10 test design、18–46行。未実行であり、現行L11の証拠ではない。 |

L3 sourceは能力の規範条件、L5/L6は詳細設計、runtime fileは旧実装source、test-designは旧受入案である。これらの存在だけで現行採択や回復は証明されない。代表5資産すべてについて旧台帳の実装状態は`unknown`であり、source codeの静的存在だけから旧runtimeが運用可能だったとも判断しない。

## 現行要求意味の分類

ここでの「採択」は、固定L2/L11 revisionにおける要求意味の採択を指す。実装・test・運用の成立を意味しない。以下のSHA-256は監査した現行ファイルのexact bytesである。

| 旧能力 | 分類 | 現行のexact refsと判定 |
|---|---|---|
| 許可された観測、source/target revision・scope・evidenceのprovenance、比較と効果評価、観測からcandidate・decision・ticket/change・検証・再観測までの分離（UIL-R-01..03、09..10、15。旧L3 43–83、162–173、59–75行） | **循環契約の意味は現行L2/L11に採択済み。** | OS `HELIXOS-L2-005`（[要件](../../../helix-os/L2-requirements/governance-requirements.md)58、82–94行）と`HELIXOS-L2-022`（同712–720行）、OS L11-022（[受入](../../../helix-os/L11-acceptance/governance-acceptance.md)373–378行）。LABO `HELIXLABO-L2-001/002/006/008/010/019/050`（特に[要件](../../../helix-labo/L2-requirements/labo-requirements.md)298–302行）、LABO L11-050（[受入](../../../helix-labo/L11-acceptance/labo-acceptance.md)100、123–125行）。OS022とLABO050は2026-09-28判断に含まれる（[OS判断](../../decisions/helix-os-requirements-po-decision-2026-09-28.md#L48)、[LABO判断](../../decisions/helix-labo-requirements-po-decision-2026-09-28.md#L92)）。現行SHA: OS L2 `db2b119daa7fbc47b79b1652beba72149fb0d6969af7bb400c1650d77464f2b5`、OS L11 `86b7949cf7700300588e8dc2ccb4448e31111223d2f1cace81109533452d551e`、LABO L2 `c34b87dde7c94eecb7d4aa83146cf2f3de1b50c278bd0e99cbf9e96a01145f71`、LABO L11 `119fa43bce6753bdb0fed5420641617b9665907a7b1c3b2e6def590098e7442d`。 |
| OSの登録・routing・ticket化、LABOの観測・評価・Feedback、target ownerの採否・変更（UIL-R-04、07–08。旧L3 84–122、143–160行） | **高位の責務分割は採択済み。責務変更は判断記録済み。** | OS-L2-005/022とOS-L11-022、LABO-L2-010/019/050とLABO-L11-050。2026-09-26に「評価と改善提案はLABO、登録・routing・ticket化はOS、変更は対象owner」と記録（[責務分担判断](../../decisions/handoff-integration-po-decisions-2026-09-26.md#L85)）。loopを削除した判断ではない。 |
| 旧memory／Learning-Skill authority、provider-native knowledge store、知識の自動authority昇格 | **旧authority意味の変更・retirementを判断記録済み。** | HMC-BR-003は、規則を仕組みで吸収し、知識は1.0–2.xでLABOが評価・保持し3.0からINTELLIGENCEが改善に使うとする。旧「Learning／Skill authority」名を使わない（[2026-09-24判断](../../decisions/concept-requirement-po-decisions-2026-09-24.md#L68)、OS要件362行、OS L11 175行）。旧provider-native ownershipは現在の責務分割へ変更されたが、旧memory runtime移行を意味しない。 |
| 外部source／skill learning、LABOからBRAINへの外部知識評価loop | **後続版。** | LABO-L2-033/051は2.0（[LABO要件](../../../helix-labo/L2-requirements/labo-requirements.md)251–257、304–308行、[LABO判断](../../decisions/helix-labo-requirements-po-decision-2026-09-28.md#L93)）。INTELLIGENCEのlocal learning、training data separation、tuningは3.0（[INTELLIGENCE要件](../../../helix-intelligence/L2-requirements/intelligence-requirements.md)166–196、372–388行、[受入](../../../helix-intelligence/L11-acceptance/intelligence-acceptance.md)313行）。PHCAP-19の1.0依存ではない。 |
| LABO-L2-063の修復再発→予防candidate（反復閾値・母集団、warning、recipe lineage等） | **未採択candidateのみ。** | [LABO要件](../../../helix-labo/L2-requirements/labo-requirements.md)480–488行が未採択追補candidateと記載し、対の[受入](../../../helix-labo/L11-acceptance/labo-acceptance.md)225–231行も未採択とする。2026-09-28採択表に063は含まれない。main上にあることだけでは採択されない。詳細を現行1.0要求として扱わない。 |
| INTELLIGENCE-L2-063のowner-bound self-improvement handoff | **限定された意味で採択済み。別のlearning engineではない。** | 2026-09-28の採択表で1.0 composite（[判断](../../decisions/helix-intelligence-requirements-po-decision-2026-09-28.md#L93)）。[要件](../../../helix-intelligence/L2-requirements/intelligence-requirements.md)372–388行、[受入](../../../helix-intelligence/L11-acceptance/intelligence-acceptance.md)117行。効果評価はLABO、generic knowledgeの正本はBRAIN、実行はOSに残り、3.0 learningは依存に含めない。 |
| 旧UILの正確なsource-registry tuple、normalized event schema、candidate完全field set、deterministic replay/projection、detector independence、global counterfactual、terminal outcome、recipe/shadow/promotion state machine、個々の旧L10 oracle（UIL-R-01..15。旧L3 43–200行、L5/L6/L10各source） | **条件単位で未解決。採択済み欠陥やruntime要件の証拠ではない。** | 現行要求は循環の業務意味、provenance、authority、feedback後の評価を扱うが、旧各atomはcurrent L2/L11 identityへ結び付けられていない。旧設計・実装の特定fieldやstate machineをL3が`confirmed`だったことだけで継承できない。下のUIL-R別表のとおり、既存の要求意味、未採択candidate、後続版、変更済みauthorityと、なお対応不明な細部を分けている。未解決の細部に新しい人判断を仮定せず、上流意味を実際に変える場合だけ既存authorityに従う。 |

## UIL-R-01..15の個別分類

「詳細未解決」は、現在要求意味として保持すべき条件か、下流設計の詳細かをmappingが示していない、という意味である。要求の欠陥や再実装許可を断定するものではない。

| 旧要求 | 分類 | 理由・現行refs |
|---|---|---|
| UIL-R-01 source registry（旧L3 43–51行） | **詳細未解決** | OS/LABO要求はevidence-bound observationとsource authorityを扱うが、旧registry tuple/source-kind一覧をcurrent L2/L11 IDへ結び付けていない。 |
| UIL-R-02 normalization/baseline比較（53–57行） | **意味採択済み、正規化詳細は未解決** | LABO-L2-002/006とL11-006はrevision範囲付き比較、unknown、比較不能を保持する。event集合/digestの決定性はmappingされていない。 |
| UIL-R-15 observation generation/historical baseline（59–75行） | **意味採択済み、generation詳細は未解決** | OS-L2-005/022とLABO-L2-050はprovenance、revision、因果履歴、記録の非上書きを保持する。`baseline/candidate/post_main`のsealやmigration dispositionはmappingされていない。 |
| UIL-R-03 finding qualification、dedupe、expiry（78–82行） | **詳細未解決** | current loopはcandidateと未解決理由を扱うが、trigger種、dedupe key、expiry条件のcurrent identityがない。 |
| UIL-R-04 `UniversalImprovementCandidateV1` field set（84–121行） | **詳細未解決** | OS-L2-022とLABO-L2-010はrouting/Feedbackの意味と最低限の根拠を定めるが、旧schema全fieldの採択は示されていない。 |
| UIL-R-05 semantic/system impact（125–135行） | **意味採択済み、impact model詳細は未解決** | 既存owner/meaning-change routingとtarget別Feedbackを維持（OS-L2-005/022、LABO-L2-010/019）。stable-ID impact graphと旧3 scope classはmappingなし。 |
| UIL-R-06 counterfactual/global optimum（137–141行） | **比較評価の意味は採択済み、evaluator詳細は未解決** | LABO-L2-006/050は比較可能性、効果・退行、反例を扱う。旧multi-scope counterfactual/evaluator契約はmappingなし。 |
| UIL-R-07 typed improvement routing（145–153行） | **routingの意味は採択済み、旧enum詳細は未解決** | OS-L2-005/022と2026-09-26の責務分担判断は、提案をOSから対象ownerへ送る。`system_change_class`/`capability_expansion_kind`/`workflow_route`の個別fieldは対応付けなし。 |
| UIL-R-08 authority write guard（156–160行） | **意味採択済み** | OS-L2-005/022、LABO-L2-010/050と対のL11は、提案・評価だけで要求、authority、実装を直接変更しない境界を維持。 |
| UIL-R-09 change verification/effect measurement（164–167行） | **loop-level意味は採択済み、receipt詳細は未解決** | LABO-L2-050/L11-050は変更後検証、運用結果、再観測、効果・退行評価を要求する。artifact/cost/side-effectを含む旧receipt tupleはmappingなし。 |
| UIL-R-10 terminal outcomes（169–173行） | **詳細未解決** | candidate、decision、未完了は現行loopでも分離するが、旧5 terminal labelとreceipt digest方式のcurrent mappingがない。 |
| UIL-R-11 recipe promotion（177–181行） | **未採択candidateの詳細** | 修復再発からrecipe/予防へ進む具体条件は未採択LABO-L2-063（LABO要件480–488行、受入225–231行）。 |
| UIL-R-12 recurrence monitoring（183–186行） | **再観測の意味は採択済み、再発検出詳細は未採択candidate** | LABO-L2-050は再観測と効果評価を採択。反復finding aggregation/warningは未採択LABO-L2-063にあり、固定閾値はない。 |
| UIL-R-13 deterministic projection/replay（190–194行） | **設計詳細未解決** | 現行要求はsource/revision/未完義務を保持する。旧deterministic rebuildとDB/event-order invariantは詳細設計・runtime条件で、現行L2/L11採択は確認できない。 |
| UIL-R-14 AI-independent control boundary（196–200行） | **authority意味は採択済み、AI非依存の決定性は未解決** | OS/LABO要求はAI自己評価でauthorityを変更せず既存判断者を保つ。AI除去時の決定性を検査する旧testのcurrent L11 mappingはない。 |

## 確認できた残差と限界

1. **Crosswalk残差：** PHCAP-19の初期inventoryには後続の判断済みcurrent IDとcurrent file digestがない。固定2026-09-28判断ではOS-022とLABO-050が採択され、現行L2/L11に循環契約がある。inventoryの「OS draftのみ」/`draft_requirement`は固定snapshot時点の記録としては有効だが、その後の判断後の現authority状態ではない。inventory更新を行う場合はsnapshot provenanceを維持し、履歴証拠の扱いは既存inventory方針に従う。この監査はその記録を直接書き換える判断をしていない。
2. **条件coverage残差：** 初期inventoryはloop全体を説明するが、UIL-R-01..15、L5、L6、L10のsource atomを、採択済み要求意味・未採択candidate・後続版・変更/retirementへ個別対応していない。そのためloop-levelの回復は確認できるが、旧詳細すべてが回復・意図的retire・実装詳細のいずれかとまでは断定できない。
3. **実装・回復残差：** 現行runtimeまたはfeedback receiptは確認できず、現行L10も実行していない。これは実装/回復/受入証拠の残差であり、採択済み高位L2要求が欠けている証明ではない。旧source/test-designの存在はこの残差を解消しない。

新しいphase capability、runtime、receipt schema、L3設計、approval gateの新設を意味しない。次の妥当な作業は現行inventory authority内での静的なcondition-level source-to-current crosswalkであり、上流意味に実差分がある場合は既存authority規則に従う。

## PHCAP-02..20 source・current reference一覧

以下は初期inventoryのphase単位の代表sourceと、現行文書から確認した近接IDの一覧で、19件の遷移分類を再集計した。近接IDだけで旧sourceの全条件を満たすとは主張しない。旧pathはすべて`archive/legacy-generation-2026-09-14/root/`以下。SHAは省略せず全値を記す。

| PHCAP | 旧遷移分類 | 代表asset ID | 旧source path | 行数 | 旧source SHA-256 | 現行文書の近接ID（意味被覆未確定） |
|---|---|---|---|---:|---|---|
| PHCAP-02 | 縮退 | `LEGACY-ASSET-3DED4B36AC6A8AD9A68C` | `docs/design/helix/L6-function-design/requirement-discovery-event-projection.md` | 73 | `58daba2ec78e51651a7d4e46d1b900115273c55ba7a0dd772dee221caaf18ce4` | HELIXOS-L2-015、HARNESS-L2-024 |
| PHCAP-03 | 縮退 | `LEGACY-ASSET-90ECC62DFFEDE09800F0` | `docs/design/helix/L4-basic-design/requirement-refinement-authority.md` | 107 | `b421963155fcc5e503b144282e254fc860550c5360943482f09af7db7fb3a21f` | HARNESS-L2-008、HELIXOS-L2-015 |
| PHCAP-04 | 縮退 | `LEGACY-ASSET-9F48ADEEB477DCA54039` | `docs/design/harness/L1-requirements/business-requirements.md` | 394 | `09ad9a27afe25bd730f57319865d1f342e6b31729da2dd27f22ecd6cb753ac61` | HARNESS-L2-008、HELIXOS-L2-015 |
| PHCAP-05 | 縮退 | `LEGACY-ASSET-B3866EECAF22235E9EB5` | `docs/design/helix/L11-uat/uat-evidence-boundary.md` | 42 | `6e92ffa1941cf58dd44577dbbc32e9d67e3d61003230d200c4966589b0137934` | HARNESS-L2-022 |
| PHCAP-06 | 縮退 | `LEGACY-ASSET-F1F753F31DB8D874EF21` | `docs/design/helix/L3-requirements/system-synthesis-requirements.md` | 124 | `69c8a47a4b67729fceabb3df85ecd1c2caa0b9faa5e5b7d958eff48517fdbd79` | HARNESS-L2-009 |
| PHCAP-07 | 正式再実装なし | `LEGACY-ASSET-614BF1FA7A7310E3BB4A` | `docs/design/helix/L8-integration/integration-evidence-index.md` | 36 | `98b2936b0e10524baab67e503d270e2e2d07be2ce60db4613a865686cb8ed288` | HARNESS-L2-022、HELIXOS-L2-020 |
| PHCAP-08 | 意味同等性未解決 | `LEGACY-ASSET-D27D4A1511BFD43623A9` | `docs/design/helix/L3-requirements/lifecycle-stage-completion-goals.md` | 132 | `21ba24bf781048f1cb03a20172c8049a6112690cda3d0d0f7dd0ba3cb0bd7406` | HELIXOS-L2-016（同等性未解決のまま） |
| PHCAP-09 | 縮退 | `LEGACY-ASSET-3A15E5645D2D2A59DFF5` | `docs/governance/candidates/execution-ticket-requirements.md` | 512 | `f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b` | HELIXOS-L2-017、HARNESS-L2-019 |
| PHCAP-10 | 縮退 | `LEGACY-ASSET-F67008331E92FA0A5773` | `docs/design/helix/L4-basic-design/worker-isolation-broker.md` | 71 | `2ae62269bc67bd926c552fb1a418645a157feb0c701f3833494155cb3dabca26` | HELIXOS-L2-018、HELIXSECURITY-L2-007 |
| PHCAP-11 | 縮退 | `LEGACY-ASSET-DA012A9B04D5BE9419CE` | `docs/design/helix/L3-requirements/ci-system-synthesis-requirements.md` | 141 | `65400847881f1a72b273f0bdeff503a5ea302705cd0e71d7913fc7d0f8dd18fb` | HARNESS-L2-005、HELIXOS-L2-020 |
| PHCAP-12 | 縮退 | `LEGACY-ASSET-D107FD145A2588FAAD09` | `docs/design/helix/L4-basic-design/worker-independent-review.md` | 71 | `9fff293ed71c7a0be0e4dfcd7a5cca70eaacfdbf2cd553a605fd15510a3c99b3` | HELIXOS-L2-018、HARNESS-L2-005 |
| PHCAP-13 | 縮退 | `LEGACY-ASSET-8686BB8CF396BAF57F2E` | `docs/design/helix/L3-requirements/github-merge-admission-requirements.md` | 140 | `cdd4f9fd0ab9b4862ec52c6b6dbcd9fd5f97c5e7bb5440f1b2cda69d37c504f8` | HELIXOS-L2-019、HARNESS-L2-005 |
| PHCAP-14 | 縮退 | `LEGACY-ASSET-9B7682EBDEA171005D45` | `docs/design/helix/L3-requirements/distribution-package-release-requirements.md` | 116 | `c854d77696bba4904bc91c1d32b8f1bd714408480f16538b7eb7e77291104f1c` | HARNESS-L2-017、HELIXOS-L2-021 |
| PHCAP-15 | 縮退 | `LEGACY-ASSET-54330A68064B58B22259` | `docs/design/helix/L13-post-deploy/post-deploy-evidence-boundary.md` | 39 | `14ec3141c84e122085843b2b5a2ae0a0c83fe257694a76dcc0eb6ab9f5b365d8` | HARNESS-L2-017、HELIXOS-L2-021 |
| PHCAP-16 | 縮退 | `LEGACY-ASSET-17C4BF78919578FEBB18` | `docs/design/helix/L3-requirements/product-lifecycle-operations-requirements.md` | 209 | `ed4d21bf9a6ec0a922fda9d5906350cfa4c6a35edc4ecc0fd6d30dc3148dacb0` | HARNESS-L2-018、HELIXOS-L2-007 |
| PHCAP-17 | 縮退 | `LEGACY-ASSET-9E033C3E39BE107D4CF1` | `docs/process/modes/incident.md` | 100 | `bad6448a63dbc6b7867b9845ca8caf96ee144802961504f3793667f49fc28f7c` | HELIXOS-L2-010、HARNESS-L2-018、HXT-TYPE-11、HXT-FLOW-02 |
| PHCAP-18 | 縮退 | `LEGACY-ASSET-12E2CD9B07EFAC343ED0` | `docs/governance/candidates/refactoring-trigger-admission-requirements.md` | 81 | `4776830ec12a6a464732db56e6ff8d93f89e8e89a6dcb8c175728a82482cc754` | HARNESS-L2-016 |
| PHCAP-19 | 縮退 | `LEGACY-ASSET-02D897E62EF2FA267267` | `docs/design/helix/L3-requirements/universal-improvement-loop-requirements.md` | 243 | `01de2c4ebed55686779fee30386f0056da1dd3c4642d0d20f3732becc67467d4` | 初期inventoryはOS L2/L11のpathのみ。今回確認したrefs: OS-L2-005/022、LABO-L2-001/002/006/008/010/019/050、INTELLIGENCE-L2-063と各対のL11 |
| PHCAP-20 | 縮退 | `LEGACY-ASSET-899A61905AFBC415F595` | `docs/design/helix/L3-requirements/orchestration-memory.md` | 59 | `9c88351f237d00c809f2cf7796fa30942f0ee2c3ad071842e719861551ccca5c` | HELIXOS-L2-007 |

集計は「縮退」17件（02–06、09–20のうち07/08を除く）、「正式再実装なし」1件（07）、「意味同等性未解決」1件（08）である。この表の近接IDは旧sourceの全条件を充足する証明ではない。PHCAP-19は初期inventoryのOS path参照に対し、後続の判断済み現行文書との接続を本監査で照合した。
