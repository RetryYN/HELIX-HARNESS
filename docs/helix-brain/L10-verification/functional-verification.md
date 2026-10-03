# HELIX-BRAIN L10 機能総合検証（部分草稿）

**状態：部分草稿・未承認・未実行。** 本書は`../L3-requirements/functional-requirements.md`のAC候補をシステム境界で照合する設計である。以下は検証fixtureとoracle設計であり、runtime実行結果・green・実装許可を意味しない。採否はL3と一体で通常のPO L3承認へ送る。

旧HELIXのtest-design起点として、旧L10定義 `archive/legacy-generation-2026-09-14/root/docs/process/forward/L08-L14-verification-phase.md:162-170,195-207`（`LEGACY-ASSET-34DF3B535879CC73FA86`、SHA-256 `d7847b2e7c85673971cb01f8fc42c1325aeb331a0630ee53914a3162951dbd2a`）の要件挙動をsystem-levelで照合する意味を保持する。旧test-designは旧L10文書そのものとは扱わず、ここでは対のoracle設計からfailure classだけを参照する。旧source/test/runtimeを実行しない。

## HELIXBRAIN-L2-007 — L10 oracle（対応 `BRAIN-007-FR-01`）

- 親：PO固定 `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2 `docs/helix-brain/L2-requirements/brain-requirements.md:150-160` span SHA-256 `f96983fecc67fdb539d5ff143ed758a9c2ae799ae3f4fb6fa24bad2c381a6774`。対L11 `docs/helix-brain/L11-acceptance/brain-acceptance.md` full SHA-256 `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`.
- 対応AC: `BRAIN-007-AC-01`, `BRAIN-007-AC-02`。各caseはシステム全体の受渡しとowner境界を照合し、単体componentの成功だけでは対全体を満たさない。

### 検証fixtureとcase

- **L10-BRAIN-007-C01**（AC `BRAIN-007-AC-01`／`BRAIN-007-AC-02`に対応）：L1-007、L2-011/025およびLABO→BRAIN L2-020の参照revisionを記録した上で、必須source/provenance/evidence/scope等が揃いLABO対象revisionが一致する候補を投入し、各owner stateが分離されることを確認する。 **期待oracle**：候補はsource identity/revisionと全入力fieldを保持し、LABO評価・OS登録・BRAIN独立検証・採否を別stateとして返す。
- **L10-BRAIN-007-C02**（AC `BRAIN-007-AC-01`／`BRAIN-007-AC-02`に対応）：source identityまたはrevisionの欠落・stale・danglingを個別に与え、昇格せず不足sourceを返す。 **期待oracle**：候補stateを維持しpromotionを止め、不足source/revisionを列挙してsource/evidence ownerへ返す。
- **L10-BRAIN-007-C03**（AC `BRAIN-007-AC-01`／`BRAIN-007-AC-02`に対応）：提案scopeとevaluated scopeを不一致にし、counterexampleまたはlimitationを欠落させてaccepted/matureを拒否する。 **期待oracle**：proposed/evaluated scope差またはcounterexample/limitation欠落を理由にaccepted/matureを拒み、候補の戻し先を示す。
- **L10-BRAIN-007-C04**（AC `BRAIN-007-AC-01`／`BRAIN-007-AC-02`に対応）：AI生成のみ、成功実績一件のみでaccepted/matureを要求し、昇格が起きないことを確認する。 **期待oracle**：accepted/matureへの遷移が起きず、AI生成または単一成功実績のみを根拠にできないことを返す。
- **L10-BRAIN-007-C05**（AC `BRAIN-007-AC-01`／`BRAIN-007-AC-02`に対応）：LABO評価対象revisionを候補revisionと不一致にする。 **期待oracle**：LABO結果を対象revision不一致として保留し、BRAIN candidate revisionと採否stateを変えない。
- **L10-BRAIN-007-C06**（AC `BRAIN-007-AC-01`／`BRAIN-007-AC-02`に対応）：BRAIN候補revisionが変わった後に古いevidenceを再利用する。 **期待oracle**：古いevidenceをstaleとして拒否し、現candidate revisionに対応するsource/evidenceの再提示先を示す。
- **L10-BRAIN-007-C07**（AC `BRAIN-007-AC-01`／`BRAIN-007-AC-02`に対応）：LABO評価またはOS登録receiptだけをBRAIN採用扱いにする。 **期待oracle**：LABO評価receiptとOS登録receiptは各ownerの別recordに留まり、BRAIN採否stateは未変更である。
- **L10-BRAIN-007-C08**（AC `BRAIN-007-AC-01`に対応）：現行契約に適合し、source/evidence/scope、LABO対象revision、OS登録・振分け、独立検証および既存採否根拠がすでに揃ったrecordを与える。 **期待oracle**：採用済みrecordから全根拠・owner stateをsourceまで遡れ、accepted/matureの根拠を表示できる。新しい実績数・threshold・actor承認を要求しない。

### 観測点とoracle

候補/採用状態；source/provenance/evidence参照とrevision；scope/counterexample/limitationの有無；LABO評価対象revision；LABO/OS/BRAIN検証/採否の別状態；失敗理由と戻し先。

**判定**：正常caseは各AC候補が親のfield/state/boundaryを満たす証拠を示す。反例caseでは該当情報が拒否/unknown/保留となり、誤った成功・昇格・owner間writebackを起こさない。部分成功は部分として記録し、残作業を成功に丸めない。

**旧test-design oracleの限定**：HAT-HIL-07およびMLP L6/L5設計のraw/secret混入、self-promotion、stale/dangling/untrusted/evidence欠落を失敗類型の起点とする。旧case件数、閾値、role schemaは継承しない。旧case ID・閾値・role schema・runtimeを使わず、現行L2/L11へ合わせた検証設計とする。

## HELIXBRAIN-L2-008 — L10 oracle（対応 `BRAIN-008-FR-01`）

- 親：PO固定 `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2 `docs/helix-brain/L2-requirements/brain-requirements.md:161-171` span SHA-256 `8982f6583ed81151b3519a26ba2ae858566650fdbc2cca43cfda29632dce7f87`。対L11 `docs/helix-brain/L11-acceptance/brain-acceptance.md` full SHA-256 `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`.
- 対応AC: `BRAIN-008-AC-01`, `BRAIN-008-AC-02`。各caseはシステム全体の受渡しとowner境界を照合し、単体componentの成功だけでは対全体を満たさない。

### 検証fixtureとcase

- **L10-BRAIN-008-C01**（AC `BRAIN-008-AC-01`／`BRAIN-008-AC-02`に対応）：L1-008、L2-028、CORE/OS接続L2-018/019/025の参照revisionを記録し、Product Coreがrevision Rを参照後、BRAINでRをsupersededとしてR2を追加、既存参照がRを保持するfixtureを置く。 **期待oracle**：既存Core参照はrevision Rのままで、BRAINのR=superseded/R2=current等のstateとOS usage recordが別々に読める。
- **L10-BRAIN-008-C02**（AC `BRAIN-008-AC-01`／`BRAIN-008-AC-02`に対応）：unknown identity/revision/state、競合するstateを使い、currentへの暗黙解決がないことを確認する。 **期待oracle**：identity/revision/stateのunknownまたは競合をunknown/停止として返し、currentへの暗黙置換を行わない。
- **L10-BRAIN-008-C03**（AC `BRAIN-008-AC-01`／`BRAIN-008-AC-02`に対応）：version_targetをactual versionとして差し替え、解決されないことを確認する。 **期待oracle**：version_targetは目標印として扱われactual version不明を解消せず、候補利用を停止する。
- **L10-BRAIN-008-C04**（AC `BRAIN-008-AC-01`／`BRAIN-008-AC-02`に対応）：BRAIN ownerが知識stateを正当にR=currentからR=supersededへ更新する一方、既存OS project usage recordを同時に変えない。 **期待oracle**：BRAIN state更新を反映しつつ、OS usage historyは旧参照revisionを保持する。BRAINの正当な更新自体は拒否しない。
- **L10-BRAIN-008-C05**（AC `BRAIN-008-AC-01`／`BRAIN-008-AC-02`に対応）：OS ownerが利用中のexact revisionを保ったままproject usage recordを正当に更新する。 **期待oracle**：OS usage updateを反映しつつ、BRAIN lifecycle stateは不変。OSの正当なproject update自体は拒否しない。

### 観測点とoracle

Product Core参照identityとexact revision；BRAIN identity/revision/state/supersession relation；別recordとして保持されるOS usage；unknown/mismatch時の戻し先。

**判定**：正常caseは各AC候補が親のfield/state/boundaryを満たす証拠を示す。反例caseでは該当情報が拒否/unknown/保留となり、誤った成功・昇格・owner間writebackを起こさない。部分成功は部分として記録し、残作業を成功に丸めない。

**旧test-design oracleの限定**：旧distribution ST-DIST-001/007のversion/digest driftとSKAPP-FR-001/002のunknown/duplicate/conflicting identityを類例として使う。package/skill identity方式を移さない。旧case ID・閾値・role schema・runtimeを使わず、現行L2/L11へ合わせた検証設計とする。

## HELIXBRAIN-L2-028 — L10 oracle（対応 `BRAIN-028-FR-01`）

- 親：PO固定 `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2 `docs/helix-brain/L2-requirements/brain-requirements.md:494-503` span SHA-256 `0120989594637907eed4c8a63a2b17619187739e1dd34d916a1dc15cb80e72c1`。対L11 `docs/helix-brain/L11-acceptance/brain-acceptance.md` full SHA-256 `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`.
- 対応AC: `BRAIN-028-AC-01`, `BRAIN-028-AC-02`。各caseはシステム全体の受渡しとowner境界を照合し、単体componentの成功だけでは対全体を満たさない。

### 検証fixtureとcase

- **L10-BRAIN-028-C01**（AC `BRAIN-028-AC-01`／`BRAIN-028-AC-02`に対応）：L2-008とHARNESS-L2-010/011 descriptor contractのrevisionを明示し、descriptor全fieldとknowledge revisionが一致、required versionが宣言range内となる正常case。 **期待oracle**：全fieldが契約と一致しrequired versionが宣言range内の場合だけ、同じknowledge identity/revisionのapplicable応答を返す。
- **L10-BRAIN-028-C02**（AC `BRAIN-028-AC-01`／`BRAIN-028-AC-02`に対応）：unknown descriptorまたはknowledge identity/revisionを与える。 **期待oracle**：未知identity/revisionをnot-applicableまたはunknownで返し、推定・最新置換を行わない。
- **L10-BRAIN-028-C03**（AC `BRAIN-028-AC-01`／`BRAIN-028-AC-02`に対応）：descriptor contract/artifact/dependency versionを不一致にする。 **期待oracle**：contract/artifact/dependencyの不一致fieldを特定してnot-applicableとし、共通契約ownerへ返す。
- **L10-BRAIN-028-C04**（AC `BRAIN-028-AC-01`／`BRAIN-028-AC-02`に対応）：required versionをrange外・range欠落・range解釈不能にする。 **期待oracle**：range外・range欠落・解釈不能をunknown/not-applicableにし、適用を止める。
- **L10-BRAIN-028-C05**（AC `BRAIN-028-AC-01`／`BRAIN-028-AC-02`に対応）：version_targetをactual contract/artifact/knowledge versionとして使用する。 **期待oracle**：version_targetによるactual version補完を拒み、未確定版をunknownのまま返す。
- **L10-BRAIN-028-C06**（AC `BRAIN-028-AC-01`／`BRAIN-028-AC-02`に対応）：common rollback/unfinished obligationをBRAIN側へ要求する。 **期待oracle**：common exchange/update/rollback/unfinished-obligationの操作・stateはBRAIN応答で変更せず、HARNESS ownerへ返す。

### 観測点とoracle

fieldごとのdescriptor/knowledge tuple；参照HARNESS contract revisionと宣言range；applicable/not-applicable/unknown応答；戻し先HARNESS/BRAIN。

**判定**：正常caseは各AC候補が親のfield/state/boundaryを満たす証拠を示す。反例caseでは該当情報が拒否/unknown/保留となり、誤った成功・昇格・owner間writebackを起こさない。部分成功は部分として記録し、残作業を成功に丸めない。

**旧test-design oracleの限定**：ST-DIST-001/007とWCC-FR-01/05のversion/schema drift境界を類例として使う。旧packet/schemaやrange grammarは継承しない。旧case ID・閾値・role schema・runtimeを使わず、現行L2/L11へ合わせた検証設計とする。

## Stage 2b追加paired oracle

## `HELIXBRAIN-L2-001` — paired L10 oracle（`BRAIN-001-FR-01`）

### 親revisionとauthority

- 親: `HELIXBRAIN-L2-001` — [`docs/governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L48)。PO固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、decision SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。
- L2 source: `docs/helix-brain/L2-requirements/brain-requirements.md:84–94` inclusive; file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `0cf2064672270ac0848848a6907e42b8abdab3f417fb1f0a9b550cef7cf5f259`。
- L11 source: `docs/helix-brain/L11-acceptance/brain-acceptance.md:29–29` inclusive; file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `ec39e3a80fddc529db9431b6124817f0eef9d5b0cdf291ff4bcfa8926add1834`。
- main633採択registration: `MPR-RC-HELIXBRAIN-L2-001-002` / candidate semantic digest `sha256:e708841bf5f5560a96915866d68dd4d37cd663bb250e61084e1d19ebf2eb4abf`。後続register metadataからPO承認を継承しない。
- Version candidate `1.0`; sequence `Stage 2b`。実装・release許可ではない。

- Dependency: BRAIN L1-001、Concept機構境界。PO束ね条件: §BRAIN-L1-001、§初期Domain候補、Visual Designの1.0回答。 L10はL3 ACを実装・追加せず観測する。
- **`L10-BRAIN-001-C01` — 正常**（`BRAIN-001-AC-01`）：fixture: Domain候補・操作種別・既存relation利用者; 正常条件を満たすsource/contextを与える。 **期待oracle**: 候補Domainのmeaning/stateと変更案の影響、既存relation利用者を識別する。 source/revision・ownerを記録し、親が求めない選択・実操作は行わない。
- **`L10-BRAIN-001-C02` — 否定/unknown**（`BRAIN-001-AC-02`）：fixture: 製品/project名、重複・不明なmeaning、既存利用者を消す分割・退役案は確定しない。meaning不明ならcandidateで止めL1-001へ戻す。 **期待oracle**: 意味不明時に候補で停止し、L1-001へ戻す。不足・不一致・unknownを成功へ丸めず理由と戻し先を観測する。
- **観測点**: 列挙された初期Domain・identity/meaning/state・変更impact・候補/停止state。比較するsource/revision、状態、応答、ownerを同一fixtureで保持する。
- **判定**: C01が親の正常要求とowner境界を満たし、C02が否定/欠落条件を拒否またはunknownとして扱い、固定L2/L11にないgate・thresholdを加えないこと。実装実行・合格主張はこの草稿に含まない。

## `HELIXBRAIN-L2-002` — paired L10 oracle（`BRAIN-002-FR-01`）

### 親revisionとauthority

- 親: `HELIXBRAIN-L2-002` — [`docs/governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L49)。PO固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、decision SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。
- L2 source: `docs/helix-brain/L2-requirements/brain-requirements.md:95–105` inclusive; file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `eaf7e9caf32537bd81df68203b5fd40150a05e419ef1519d03756a09e0d22665`。
- L11 source: `docs/helix-brain/L11-acceptance/brain-acceptance.md:30–30` inclusive; file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `7d42d53aa64d43765a52521af16a924cfaf74a8e232f102161869c767cb82756`。
- main633採択registration: `MPR-RC-HELIXBRAIN-L2-002-002` / candidate semantic digest `sha256:6ea1c1d2d7808649aaa553fbc6afcf814e72eeb24a0e83caf89c7d043fe70039`。後続register metadataからPO承認を継承しない。
- Version candidate `1.0`; sequence `Stage 2b`。実装・release許可ではない。

- Dependency: BRAIN L1-002、L2-001。PO束ね条件: §BRAIN-L1-002。 L10はL3 ACを実装・追加せず観測する。
- **`L10-BRAIN-002-C01` — 正常**（`BRAIN-002-AC-01`）：fixture: 各候補のkind/identityと親要素; 正常条件を満たすsource/contextを与える。 **期待oracle**: 各段階のidentity・責務・親と包含/構成relationを辿れる。 source/revision・ownerを記録し、親が求めない選択・実操作は行わない。
- **`L10-BRAIN-002-C02` — 否定/unknown**（`BRAIN-002-AC-02`）：fixture: 孤立要素、誤種別、階層を跨ぐidentity代入、単なるfile/snippet/component集は確定せずunknown/candidateとする。階層意味を決められなければL1-002へ戻す。 **期待oracle**: 階層またはkind不明はunknownで止めL1-002へ戻す。不足・不一致・unknownを成功へ丸めず理由と戻し先を観測する。
- **観測点**: 4段階のkind・identity・責務・親子relation。比較するsource/revision、状態、応答、ownerを同一fixtureで保持する。
- **判定**: C01が親の正常要求とowner境界を満たし、C02が否定/欠落条件を拒否またはunknownとして扱い、固定L2/L11にないgate・thresholdを加えないこと。実装実行・合格主張はこの草稿に含まない。

## `HELIXBRAIN-L2-003` — paired L10 oracle（`BRAIN-003-FR-01`）

### 親revisionとauthority

- 親: `HELIXBRAIN-L2-003` — [`docs/governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L50)。PO固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、decision SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。
- L2 source: `docs/helix-brain/L2-requirements/brain-requirements.md:106–116` inclusive; file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `8d4111686c3a35c5ca8e2980bbc7a613faebe784e539e986769c2383a2010b97`。
- L11 source: `docs/helix-brain/L11-acceptance/brain-acceptance.md:31–31` inclusive; file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `6d275b94b4e42f48730dd934f7ee025f357ff64fb4aaa479ca06919a0c543156`。
- main633採択registration: `MPR-RC-HELIXBRAIN-L2-003-002` / candidate semantic digest `sha256:0c9aa2e7b9c84e47147fc40fb2893ae58a7bbd08b5975dc925299a184824dc56`。後続register metadataからPO承認を継承しない。
- Version candidate `1.0`; sequence `Stage 2b`。実装・release許可ではない。

- Dependency: BRAIN L1-003、L2-002。PO束ね条件: §BRAIN-L1-003、旧DST-HARNESS-002のtemplate意味契約。 L10はL3 ACを実装・追加せず観測する。
- **`L10-BRAIN-003-C01` — 正常**（`BRAIN-003-AC-01`）：fixture: Pattern候補・source・対象problem/context・必須inputs; 正常条件を満たすsource/contextを与える。 **期待oracle**: 条件充足・不充足・unknownを区別し、required inputが全て解決したscope内でのみ候補の適用可能性を示す。 source/revision・ownerを記録し、親が求めない選択・実操作は行わない。
- **`L10-BRAIN-003-C02` — 否定/unknown**（`BRAIN-003-AC-02`）：fixture: input欠落・適用条件不明・failure/negative/evidence/maturity不足を推測補完せず停止する。 **期待oracle**: 意味・必須inputが未定ならL1-003または要求ownerへ返す。。不足・不一致・unknownを成功へ丸めず理由と戻し先を観測する。
- **観測点**: descriptor全項目・条件充足/不充足/unknown。比較するsource/revision、状態、応答、ownerを同一fixtureで保持する。
- **判定**: C01が親の正常要求とowner境界を満たし、C02が否定/欠落条件を拒否またはunknownとして扱い、固定L2/L11にないgate・thresholdを加えないこと。実装実行・合格主張はこの草稿に含まない。

## `HELIXBRAIN-L2-004` — paired L10 oracle（`BRAIN-004-FR-01`）

### 親revisionとauthority

- 親: `HELIXBRAIN-L2-004` — [`docs/governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L51)。PO固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、decision SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。
- L2 source: `docs/helix-brain/L2-requirements/brain-requirements.md:117–127` inclusive; file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `193100e6119ce9c87cce9edfbc29813337368b840d159c1cc09aa50aa5fa41fa`。
- L11 source: `docs/helix-brain/L11-acceptance/brain-acceptance.md:32–32` inclusive; file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `7d5f1bc00d42a6a0d0582a43f6db0d86f037c4c875fcaf0d805e3e57f35c14ac`。
- main633採択registration: `MPR-RC-HELIXBRAIN-L2-004-002` / candidate semantic digest `sha256:ea1ad035c22d4c34626ec52cea621e47f304c66f97c0f44507a01e1325a3686b`。後続register metadataからPO承認を継承しない。
- Version candidate `1.0`; sequence `Stage 2b`。実装・release許可ではない。

- Dependency: BRAIN L1-004、L2-003/012。PO束ね条件: §BRAIN-L1-004。 L10はL3 ACを実装・追加せず観測する。
- **`L10-BRAIN-004-C01` — 正常**（`BRAIN-004-AC-01`）：fixture: 同一problemの複数候補・適用条件・requirement/weight; 正常条件を満たすsource/contextを与える。 **期待oracle**: Strong Consistency、Eventually Consistent、Compensating Transaction等の同一problemに成立し得る候補を併存させ、差と欠落する比較軸を示す。 source/revision・ownerを記録し、親が求めない選択・実操作は行わない。
- **`L10-BRAIN-004-C02` — 否定/unknown**（`BRAIN-004-AC-02`）：fixture: requirements/weightsが欠ける、または候補選定を求める場合は比較未確定として保留し、HARNESS-CORE/INTELLIGENCE/人間の適切な判断先へ返す。 **期待oracle**: BRAINは採用決定しない。要求値・重みの責任ownerへ戻す。不足・不一致・unknownを成功へ丸めず理由と戻し先を観測する。
- **観測点**: 各候補の長所短所・constraint/failure/cost・scope。比較するsource/revision、状態、応答、ownerを同一fixtureで保持する。
- **判定**: C01が親の正常要求とowner境界を満たし、C02が否定/欠落条件を拒否またはunknownとして扱い、固定L2/L11にないgate・thresholdを加えないこと。実装実行・合格主張はこの草稿に含まない。

## `HELIXBRAIN-L2-005` — paired L10 oracle（`BRAIN-005-FR-01`）

### 親revisionとauthority

- 親: `HELIXBRAIN-L2-005` — [`docs/governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L52)。PO固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、decision SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。
- L2 source: `docs/helix-brain/L2-requirements/brain-requirements.md:128–138` inclusive; file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `2c6d2f6c24076429749a2303fe59dffe9c91f1a64fa0f8716bbf4740cbd917fa`。
- L11 source: `docs/helix-brain/L11-acceptance/brain-acceptance.md:33–33` inclusive; file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `e147986e41c25adbfa95ad2c395658058922f921fd9214b5a08cb802ca1c1917`。
- main633採択registration: `MPR-RC-HELIXBRAIN-L2-005-002` / candidate semantic digest `sha256:120d16b39c985bd7f62efe6974a71849cad4cb0f234c395a509dc6793ddd9ff0`。後続register metadataからPO承認を継承しない。
- Version candidate `1.0`; sequence `Stage 2b`。実装・release許可ではない。

- Dependency: BRAIN L1-005、L2-001/002。PO束ね条件: §BRAIN-L1-005。 L10はL3 ACを実装・追加せず観測する。
- **`L10-BRAIN-005-C01` — 正常**（`BRAIN-005-AC-01`）：fixture: Pattern/Unit/Part endpoints・typed relation・source; 正常条件を満たすsource/contextを与える。 **期待oracle**: Authentication→Session→Frontend State→UX、Database→Performance→Infrastructure等のrelationをsourceとともに追跡する。 source/revision・ownerを記録し、親が求めない選択・実操作は行わない。
- **`L10-BRAIN-005-C02` — 否定/unknown**（`BRAIN-005-AC-02`）：fixture: unknown endpoint、根拠のないtype/meaning/name-only edgeは確定しない。方向・意味が決められない場合L1-005へ戻す。 **期待oracle**: unknown endpoint/meaningはunknownとして関係ownerへ戻す。不足・不一致・unknownを成功へ丸めず理由と戻し先を観測する。
- **観測点**: 両endpoint、許容type/meaning、cross-domain source trace。比較するsource/revision、状態、応答、ownerを同一fixtureで保持する。
- **判定**: C01が親の正常要求とowner境界を満たし、C02が否定/欠落条件を拒否またはunknownとして扱い、固定L2/L11にないgate・thresholdを加えないこと。実装実行・合格主張はこの草稿に含まない。

## `HELIXBRAIN-L2-006` — paired L10 oracle（`BRAIN-006-FR-01`）

### 親revisionとauthority

- 親: `HELIXBRAIN-L2-006` — [`docs/governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L53)。PO固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、decision SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。
- L2 source: `docs/helix-brain/L2-requirements/brain-requirements.md:139–149` inclusive; file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `b0047df45ccdd705ebf1eae090a70184a07fe107ab649b4c5d69ca152ba3be8e`。
- L11 source: `docs/helix-brain/L11-acceptance/brain-acceptance.md:34–34` inclusive; file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `afd2970a8b0cf6ba6c990baea59f6768ffec47d2388ebd4a741d11dc2bf136a9`。
- main633採択registration: `MPR-RC-HELIXBRAIN-L2-006-002` / candidate semantic digest `sha256:f031680bdd08d3b7c3286ebb1a5ecab68efb8c4bfed7b8f005a55ff9bb141900`。後続register metadataからPO承認を継承しない。
- Version candidate `1.0`; sequence `Stage 2b`。実装・release許可ではない。

- Dependency: BRAIN L1-006、L2-001/002/003、Visual Design HARNESS接続L2-023。PO回答: 1.0から扱う、Visual Design HARNESS連携。 L10はL3 ACを実装・追加せず観測する。
- **`L10-BRAIN-006-C01` — 正常**（`BRAIN-006-AC-01`）：fixture: visual candidate・適用条件・product/source context; 正常条件を満たすsource/contextを与える。 **期待oracle**: shared knowledgeとproduct-specific source contextを分離して候補を出す。 source/revision・ownerを記録し、親が求めない選択・実操作は行わない。
- **`L10-BRAIN-006-C02` — 否定/unknown**（`BRAIN-006-AC-02`）：fixture: 製品名や固定styleを汎用知識へ混入する、または製品固有fieldを切り分けられない候補は共有知識にせずVisual Design HARNESSまたはProduct Coreへ戻す。 **期待oracle**: 分離不能は候補に入れずsource ownerへ戻す。不足・不一致・unknownを成功へ丸めず理由と戻し先を観測する。
- **観測点**: 列挙例の要素種別、shared/product field分類、source。比較するsource/revision、状態、応答、ownerを同一fixtureで保持する。
- **判定**: C01が親の正常要求とowner境界を満たし、C02が否定/欠落条件を拒否またはunknownとして扱い、固定L2/L11にないgate・thresholdを加えないこと。実装実行・合格主張はこの草稿に含まない。

## `HELIXBRAIN-L2-009` — paired L10 oracle（`BRAIN-009-FR-01`）

### 親revisionとauthority

- 親: `HELIXBRAIN-L2-009` — [`docs/governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L56)。PO固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、decision SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。
- L2 source: `docs/helix-brain/L2-requirements/brain-requirements.md:172–182` inclusive; file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `ee09a8532ea8f1340c016c54098d90dffe7b2f8cd8e41401f7968362a44f7c7f`。
- L11 source: `docs/helix-brain/L11-acceptance/brain-acceptance.md:37–37` inclusive; file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `e547ea632dbfa78b7cbc732642ad6c860ee072dfa4e6a73c8a3053533d627817`。
- main633採択registration: `MPR-RC-HELIXBRAIN-L2-009-002` / candidate semantic digest `sha256:2357966979f49c70ea6881fddd664a9f121dc43849f8b2889768f931c5e89d01`。後続register metadataからPO承認を継承しない。
- Version candidate `1.0`; sequence `Stage 2b`。実装・release許可ではない。

- Dependency: BRAIN L1-009、L2-005/007/025。PO束ね条件: §BRAIN-L1-009。 L10はL3 ACを実装・追加せず観測する。
- **`L10-BRAIN-009-C01` — 正常**（`BRAIN-009-AC-01`）：fixture: 既存unit・relation・source/evaluation scope; 正常条件を満たすsource/contextを与える。 **期待oracle**: Pattern AのUnit A1とPattern BのUnit B1を新relationで組む例等を、候補stateとcomponent/relation source付きで示す。 source/revision・ownerを記録し、親が求めない選択・実操作は行わない。
- **`L10-BRAIN-009-C02` — 否定/unknown**（`BRAIN-009-AC-02`）：fixture: component/relationの根拠不明、適用条件不明、候補を確立済みにする入力は停止する。 **期待oracle**: 不足根拠はsource ownerへ。昇格には既存評価/promotion経路のみ適用。。不足・不一致・unknownを成功へ丸めず理由と戻し先を観測する。
- **観測点**: component trace・relation根拠・candidate state。比較するsource/revision、状態、応答、ownerを同一fixtureで保持する。
- **判定**: C01が親の正常要求とowner境界を満たし、C02が否定/欠落条件を拒否またはunknownとして扱い、固定L2/L11にないgate・thresholdを加えないこと。実装実行・合格主張はこの草稿に含まない。

## `HELIXBRAIN-L2-010` — paired L10 oracle（`BRAIN-010-FR-01`）

### 親revisionとauthority

- 親: `HELIXBRAIN-L2-010` — [`docs/governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L57)。PO固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、decision SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。
- L2 source: `docs/helix-brain/L2-requirements/brain-requirements.md:183–193` inclusive; file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `1abd7a70802d2c58110fb869adf9d78b686c2dd6cb078edb0b38710d0ac1eace`。
- L11 source: `docs/helix-brain/L11-acceptance/brain-acceptance.md:38–38` inclusive; file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `885d2a34d5c05c01e6c192f12c1add9b7e35f505d4722c3c0e59af6d9cc4a650`。
- main633採択registration: `MPR-RC-HELIXBRAIN-L2-010-002` / candidate semantic digest `sha256:bb9b45219db15affd84fd2098e37930da414358e9170f42d9f308143a3090b2a`。後続register metadataからPO承認を継承しない。
- Version candidate `1.0`; sequence `Stage 2b`。実装・release許可ではない。

- Dependency: BRAIN L1-010、L2-003/005/007。PO束ね条件: §BRAIN-L1-010、DST-HARNESS-005 negative oracle。 L10はL3 ACを実装・追加せず観測する。
- **`L10-BRAIN-010-C01` — 正常**（`BRAIN-010-AC-01`）：fixture: failure observation・context/condition・impact・alternative・source/evidence; 正常条件を満たすsource/contextを与える。 **期待oracle**: 成功・反例・条件依存・退行の例を個別scope/contextで候補化する。 source/revision・ownerを記録し、親が求めない選択・実操作は行わない。
- **`L10-BRAIN-010-C02` — 否定/unknown**（`BRAIN-010-AC-02`）：fixture: condition/source/evidenceや代替根拠なしの否定を適用せず、scope不明findingをuniversal prohibitionにしない。評価scopeを定められないfindingはLABOへ返す。 **期待oracle**: 不明条件はLABO評価へ返し、普遍禁止を作らない。。不足・不一致・unknownを成功へ丸めず理由と戻し先を観測する。
- **観測点**: failure typeと条件、alternative/provenance、scope。比較するsource/revision、状態、応答、ownerを同一fixtureで保持する。
- **判定**: C01が親の正常要求とowner境界を満たし、C02が否定/欠落条件を拒否またはunknownとして扱い、固定L2/L11にないgate・thresholdを加えないこと。実装実行・合格主張はこの草稿に含まない。

## `HELIXBRAIN-L2-011` — paired L10 oracle（`BRAIN-011-FR-01`）

### 親revisionとauthority

- 親: `HELIXBRAIN-L2-011` — [`docs/governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L58)。PO固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、decision SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。
- L2 source: `docs/helix-brain/L2-requirements/brain-requirements.md:194–204` inclusive; file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `c85e5ab4be064db02eef9d05ef174f2754446afba55c99946ac5220c8c6ee198`。
- L11 source: `docs/helix-brain/L11-acceptance/brain-acceptance.md:39–39` inclusive; file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `0f6702b067bacfd28d5ceca6cd3c046edae2deb10cd4ed701647aac37a1e93c8`。
- main633採択registration: `MPR-RC-HELIXBRAIN-L2-011-002` / candidate semantic digest `sha256:726a83d698826a4376d6cf8bb47be6a10de671776d27d0b219ada48a38b77091`。後続register metadataからPO承認を継承しない。
- Version candidate `1.0`; sequence `Stage 2b`。実装・release許可ではない。

- Dependency: BRAIN L1-011、L2-007/018/020/025。PO束ね条件: §BRAIN-L1-011。 L10はL3 ACを実装・追加せず観測する。
- **`L10-BRAIN-011-C01` — 正常**（`BRAIN-011-AC-01`）：fixture: Product Core source context・候補knowledge・一般化根拠; 正常条件を満たすsource/contextを与える。 **期待oracle**: 製品識別子を含むsourceから独立したreusable conditionを提示し、source/provenanceを保持する。 source/revision・ownerを記録し、親が求めない選択・実操作は行わない。
- **`L10-BRAIN-011-C02` — 否定/unknown**（`BRAIN-011-AC-02`）：fixture: 一般化がProduct Core固有meaningを変える、または未分離要素を含む場合採用しない。共有範囲の人間判断が必要な場合は既存判断先へ送る。 **期待oracle**: 分離不能は提供元CORE/LABOへ戻す。不足・不一致・unknownを成功へ丸めず理由と戻し先を観測する。
- **観測点**: field別shared/product-specific区分、source provenance。比較するsource/revision、状態、応答、ownerを同一fixtureで保持する。
- **判定**: C01が親の正常要求とowner境界を満たし、C02が否定/欠落条件を拒否またはunknownとして扱い、固定L2/L11にないgate・thresholdを加えないこと。実装実行・合格主張はこの草稿に含まない。

## `HELIXBRAIN-L2-012` — paired L10 oracle（`BRAIN-012-FR-01`）

### 親revisionとauthority

- 親: `HELIXBRAIN-L2-012` — [`docs/governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L59)。PO固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、decision SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。
- L2 source: `docs/helix-brain/L2-requirements/brain-requirements.md:205–215` inclusive; file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `3a2b615ba985a12eaf601fb470c8974d9b2c51f68d7f10cfcc5913dcd22b32f2`。
- L11 source: `docs/helix-brain/L11-acceptance/brain-acceptance.md:40–40` inclusive; file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `f332f7974002d1d73fe5bc5b12c24d988913fd66717e4d6915dacc6eea238a27`。
- main633採択registration: `MPR-RC-HELIXBRAIN-L2-012-002` / candidate semantic digest `sha256:f574ca7fda5b129544983c786c5c5881fa7c479e00d96cdeaa60757b7964493f`。後続register metadataからPO承認を継承しない。
- Version candidate `1.0`; sequence `Stage 2b`。実装・release許可ではない。

- Dependency: BRAIN L1-012、L2-019/021/022。PO束ね条件: §BRAIN-L1-012およびConceptのBRAIN/INTELLIGENCE/OS境界。 L10はL3 ACを実装・追加せず観測する。
- **`L10-BRAIN-012-C01` — 正常**（`BRAIN-012-AC-01`）：fixture: design context・knowledge domain・versioned candidates; 正常条件を満たすsource/contextを与える。 **期待oracle**: 必要input不足・複数候補・判断不能のとき候補・不足・代替・evidenceを分離して返す。 source/revision・ownerを記録し、親が求めない選択・実操作は行わない。
- **`L10-BRAIN-012-C02` — 否定/unknown**（`BRAIN-012-AC-02`）：fixture: 候補応答を採用済み/製品固有判断へ読み替える受け手を拒否する。要求意味/weight不明は適切なdecision ownerへ戻す。 **期待oracle**: BRAIN authorityを拡張せず採否ownerへ返す。。不足・不一致・unknownを成功へ丸めず理由と戻し先を観測する。
- **観測点**: candidate fieldsとconsumer adoption record separation。比較するsource/revision、状態、応答、ownerを同一fixtureで保持する。
- **判定**: C01が親の正常要求とowner境界を満たし、C02が否定/欠落条件を拒否またはunknownとして扱い、固定L2/L11にないgate・thresholdを加えないこと。実装実行・合格主張はこの草稿に含まない。

## `HELIXBRAIN-L2-029` — paired L10 oracle（`BRAIN-029-FR-01`）

### 親revisionとauthority

- 親: `HELIXBRAIN-L2-029` — [`docs/governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L88)。PO固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、decision SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。
- L2 source: `docs/helix-brain/L2-requirements/brain-requirements.md:564–574` inclusive; file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `79ed972f758fddbe5d6488a67de19bd951562d4eccbc9c45ab86027d87493259`。
- L11 source: `docs/helix-brain/L11-acceptance/brain-acceptance.md:87–95` inclusive; file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `b5355a8dc68d145c5154bc0aadfd46fbbc914ee0a2d23d5e36053d372d623acf`。
- main633採択registration: `MPR-RC-HELIXBRAIN-L2-029-001` / candidate semantic digest `sha256:fd3bd6eaf17c5dad916dec0793c28544816c8b785e98fa854b49df843b11382d`。後続register metadataからPO承認を継承しない。
- Version candidate `1.0`; sequence `Stage 2b`。実装・release許可ではない。

- Dependency: primary BRAIN L1-003/005/009、consumer HARNESS L1-009/001。常時L2-008/003/005、構成時L2-009、比較時L2-004、source選択に応じCORE L2-018、LABO-evaluated inputならL2-020。PO固定G15束ね条件はL11 source spanに従う。 L10はL3 ACを実装・追加せず観測する。
- **`L10-BRAIN-029-C01` — 正常**（`BRAIN-029-AC-01`）：fixture: generalized problem、Pattern/Unit/Part identity/source/version、applicability/inputs/relations; 正常条件を満たすsource/contextを与える。 **期待oracle**: 承認後編集禁止というgeneralized problemについてimmutable record/state transition/API command guard/permission/data invariant等の複数candidateを構成し、適合・矛盾・必要inputを示す。ただし製品の申請設計・確立Patternとしない。 source/revision・ownerを記録し、親が求めない選択・実操作は行わない。
- **`L10-BRAIN-029-C02` — 否定/unknown**（`BRAIN-029-AC-02`）：fixture: unknown endpoint、required input欠落、product-specific screen/API rule混入、競合Patternをcompatibleとする、または一件のproduct useだけで採用済みにする入力は不成立。meaningはBRAIN L1-003/005/009、product requirementはHARNESSへ戻す。 **期待oracle**: 不足はBRAIN meaning ownerまたはHARNESS product requirement ownerへ戻す。不足・不一致・unknownを成功へ丸めず理由と戻し先を観測する。
- **`L10-BRAIN-029-C03` — 未見境界**（`BRAIN-029-AC-03`）：fixture: 試験側に伏せた別DomainのPattern/Unit組合せまたはrequired input欠落を加える。**期待oracle**: conditionに基づく適用可否・`conflicts_with`・unknownを照合し、scope/oracleが決められない場合は未評価として保持する。全Domain網羅や製品適用可否を主張しない。
- **観測点**: candidate composition/source trace・condition・conflict/unknown・owner。比較するsource/revision、状態、応答、ownerを同一fixtureで保持する。
- **判定**: C01が親の正常要求とowner境界を満たし、C02が否定/欠落条件を拒否またはunknownとして扱い、固定L2/L11にないgate・thresholdを加えないこと。実装実行・合格主張はこの草稿に含まない。

## 結果記録上の制約

実装前の静的な設計であり、fixture/期待出力の定義までを行う。実行、CI、旧test、旧runtimeによる合格主張は含まない。検証実装と実測は下流責務であり、ここでL4/L7を定義しない。
