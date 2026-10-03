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
- **`L10-BRAIN-001-C01` — 正常（`BRAIN-001-AC-01`）**: fixture: 4 separate change fixtures: Software Architecture初期domainの保持を基準に、(a)追加、(b)分割、(c)統合、(d)退役を一操作ずつ行い、各既存relation consumerを入力する。Reliability/Recoveryは追加候補として渡す。 **期待oracle**: 4種類の変更proposalでDomain meaning/stateが保たれ、各existing relation referenceを新しい/残存先で解決可能。初期Domainと追加候補を区別する。
- **`L10-BRAIN-001-C02` — 否定・境界（`BRAIN-001-AC-02`）**: fixture: product/project名をDomainとして固定、meaning重複/unknown、分割統合退役で既存relation consumerを落とす変異を各々投入。 **期待oracle**: 製品/project名をDomain化せず、meaning不明時はcandidateで停止しL1-001へ戻し、既存relation利用者を維持する。
- **`L10-BRAIN-001-C03` — 未見境界（`BRAIN-001-AC-01,AC-02`）**: fixture: 伏せた未列挙Domain候補と追加/分割/統合/退役の組合せを与える。初期Domain候補と追加候補を混同せず、scope未確定は候補/unknownに保つ。 **期待oracle**: 未見fixtureでも提示source/conditionの範囲を越えて推定せず、根拠なしはunknownまたは未評価に保つ。
- **観測点**: 列挙された初期Domain・identity/meaning/state・変更impact・候補/停止state。比較するsource/revision、状態、応答、ownerを同一fixtureで保持する。
- **判定**: C01が親の正常要求とowner境界を満たし、C02が否定/欠落条件を拒否またはunknownとして扱い、C03では根拠が足りる未見入力を同じcontractで評価し、根拠が不足する箇所のみunknown/未評価として扱い、要求意味・責務・承認gateを増やさず、候補値は根拠・比較・測定方法を持つこと。実装実行・合格主張はこの草稿に含まない。

## `HELIXBRAIN-L2-002` — paired L10 oracle（`BRAIN-002-FR-01`）

### 親revisionとauthority

- 親: `HELIXBRAIN-L2-002` — [`docs/governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L49)。PO固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、decision SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。
- L2 source: `docs/helix-brain/L2-requirements/brain-requirements.md:95–105` inclusive; file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `eaf7e9caf32537bd81df68203b5fd40150a05e419ef1519d03756a09e0d22665`。
- L11 source: `docs/helix-brain/L11-acceptance/brain-acceptance.md:30–30` inclusive; file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `7d42d53aa64d43765a52521af16a924cfaf74a8e232f102161869c767cb82756`。
- main633採択registration: `MPR-RC-HELIXBRAIN-L2-002-002` / candidate semantic digest `sha256:6ea1c1d2d7808649aaa553fbc6afcf814e72eeb24a0e83caf89c7d043fe70039`。後続register metadataからPO承認を継承しない。
- Version candidate `1.0`; sequence `Stage 2b`。実装・release許可ではない。

- Dependency: BRAIN L1-002、L2-001。PO束ね条件: §BRAIN-L1-002。 L10はL3 ACを実装・追加せず観測する。
- **`L10-BRAIN-002-C01` — 正常（`BRAIN-002-AC-01`）**: fixture: Domain→Dashboard Pattern→Navigation/KPI/Work Area Unit→Table/Filter/Status Partの完全な階層fixtureを投入し、各edgeに親子identityとrelation sourceを添える。 **期待oracle**: 各nodeのkind/identity/parentがDomain→Pattern→Unit→Partの順で保持され、単なるfile等とは異なる意味を返す。
- **`L10-BRAIN-002-C02` — 否定・境界（`BRAIN-002-AC-02`）**: fixture: parent欠落、階層kind入替、単なるfile/code snippet/UI component listをPatternと称する変異を個別および組合せで投入。 **期待oracle**: 孤立・誤種別はunknown/candidateにして意味未定はL1-002へ戻す。
- **`L10-BRAIN-002-C03` — 未見境界（`BRAIN-002-AC-01,AC-02`）**: fixture: 正常fixtureにない別Pattern/Unit/Partを伏せて投入し、追加構造でも各kind/parentが保持されるか確認。 **期待oracle**: 未見fixtureでも提示source/conditionの範囲を越えて推定せず、根拠なしはunknownまたは未評価に保つ。
- **観測点**: 4段階のkind・identity・責務・親子relation。比較するsource/revision、状態、応答、ownerを同一fixtureで保持する。
- **判定**: C01が親の正常要求とowner境界を満たし、C02が否定/欠落条件を拒否またはunknownとして扱い、C03では根拠が足りる未見入力を同じcontractで評価し、根拠が不足する箇所のみunknown/未評価として扱い、要求意味・責務・承認gateを増やさず、候補値は根拠・比較・測定方法を持つこと。実装実行・合格主張はこの草稿に含まない。

## `HELIXBRAIN-L2-003` — paired L10 oracle（`BRAIN-003-FR-01`）

### 親revisionとauthority

- 親: `HELIXBRAIN-L2-003` — [`docs/governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L50)。PO固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、decision SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。
- L2 source: `docs/helix-brain/L2-requirements/brain-requirements.md:106–116` inclusive; file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `8d4111686c3a35c5ca8e2980bbc7a613faebe784e539e986769c2383a2010b97`。
- L11 source: `docs/helix-brain/L11-acceptance/brain-acceptance.md:31–31` inclusive; file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `6d275b94b4e42f48730dd934f7ee025f357ff64fb4aaa479ca06919a0c543156`。
- main633採択registration: `MPR-RC-HELIXBRAIN-L2-003-002` / candidate semantic digest `sha256:0c9aa2e7b9c84e47147fc40fb2893ae58a7bbd08b5975dc925299a184824dc56`。後続register metadataからPO承認を継承しない。
- Version candidate `1.0`; sequence `Stage 2b`。実装・release許可ではない。

- Dependency: BRAIN L1-003、L2-002。PO束ね条件: §BRAIN-L1-003、旧DST-HARNESS-002のtemplate意味契約。 L10はL3 ACを実装・追加せず観測する。
- **`L10-BRAIN-003-C01` — 正常（`BRAIN-003-AC-01`）**: fixture: problem, assumptions, applicability, required input, constraint, trade-off, negative case, failure mode, compatible/incompatible pattern, evidence, maturityの全fieldにsource付き値を持つPattern descriptorを投入。 **期待oracle**: 全required descriptor fieldとsourceが対象scopeへ結び付き、適用条件を追える。
- **`L10-BRAIN-003-C02` — 否定・境界（`BRAIN-003-AC-02`）**: fixture: Pattern存在だけの入力、またはnegative/failure/evidence/maturity/required inputをそれぞれ欠落、unknown、incompatible条件をcompatibleへ反転するmutationを単独/組合せで投入。 **期待oracle**: Patternがあるだけでは採用・適用を断定せず、required input unknownはunknownとしてL1-003または要求ownerへ戻す。
- **`L10-BRAIN-003-C03` — 未見境界（`BRAIN-003-AC-01,AC-02`）**: fixture: 別Patternを伏せ、required input一つを未提供として適用照会する。未見候補を理由にapplicableへ推測しない。 **期待oracle**: 未見fixtureでも提示source/conditionの範囲を越えて推定せず、根拠なしはunknownまたは未評価に保つ。
- **観測点**: descriptor全項目・条件充足/不充足/unknown。比較するsource/revision、状態、応答、ownerを同一fixtureで保持する。
- **判定**: C01が親の正常要求とowner境界を満たし、C02が否定/欠落条件を拒否またはunknownとして扱い、C03では根拠が足りる未見入力を同じcontractで評価し、根拠が不足する箇所のみunknown/未評価として扱い、要求意味・責務・承認gateを増やさず、候補値は根拠・比較・測定方法を持つこと。実装実行・合格主張はこの草稿に含まない。

## `HELIXBRAIN-L2-004` — paired L10 oracle（`BRAIN-004-FR-01`）

### 親revisionとauthority

- 親: `HELIXBRAIN-L2-004` — [`docs/governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L51)。PO固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、decision SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。
- L2 source: `docs/helix-brain/L2-requirements/brain-requirements.md:117–127` inclusive; file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `193100e6119ce9c87cce9edfbc29813337368b840d159c1cc09aa50aa5fa41fa`。
- L11 source: `docs/helix-brain/L11-acceptance/brain-acceptance.md:32–32` inclusive; file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `7d5f1bc00d42a6a0d0582a43f6db0d86f037c4c875fcaf0d805e3e57f35c14ac`。
- main633採択registration: `MPR-RC-HELIXBRAIN-L2-004-002` / candidate semantic digest `sha256:ea1ad035c22d4c34626ec52cea621e47f304c66f97c0f44507a01e1325a3686b`。後続register metadataからPO承認を継承しない。
- Version candidate `1.0`; sequence `Stage 2b`。実装・release許可ではない。

- Dependency: BRAIN L1-004、L2-003/012。PO束ね条件: §BRAIN-L1-004。 L10はL3 ACを実装・追加せず観測する。
- **`L10-BRAIN-004-C01` — 正常（`BRAIN-004-AC-01`）**: fixture: 同じproblemに成立し得るStrong Consistency、Eventually Consistent、Compensating Transaction候補と各適用条件を投入し、known comparison axesを与える。 **期待oracle**: 候補群の長短/constraint/failure/cost/applicabilityが比較表現され、BRAINは特定候補を採択しない。
- **`L10-BRAIN-004-C02` — 否定・境界（`BRAIN-004-AC-02`）**: fixture: 一候補を唯一解と要求、またはweight/required product valueを削る変異を個別投入。existing candidate comparison output自体は保持する。 **期待oracle**: weight/value欠落時は比較情報を消さずselectionを保留しHARNESS-CORE/INTELLIGENCE/適切な判断先を示す。
- **`L10-BRAIN-004-C03` — 未見境界（`BRAIN-004-AC-01,AC-02`）**: fixture: 未見の追加Pattern候補を伏せ、weight不明のまま比較を要求する。既知候補比較は出したまま最終選択だけholdできるか見る。 **期待oracle**: 未見fixtureでも提示source/conditionの範囲を越えて推定せず、根拠なしはunknownまたは未評価に保つ。
- **観測点**: 各候補の長所短所・constraint/failure/cost・scope。比較するsource/revision、状態、応答、ownerを同一fixtureで保持する。
- **判定**: C01が親の正常要求とowner境界を満たし、C02が否定/欠落条件を拒否またはunknownとして扱い、C03では根拠が足りる未見入力を同じcontractで評価し、根拠が不足する箇所のみunknown/未評価として扱い、要求意味・責務・承認gateを増やさず、候補値は根拠・比較・測定方法を持つこと。実装実行・合格主張はこの草稿に含まない。

## `HELIXBRAIN-L2-005` — paired L10 oracle（`BRAIN-005-FR-01`）

### 親revisionとauthority

- 親: `HELIXBRAIN-L2-005` — [`docs/governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L52)。PO固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、decision SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。
- L2 source: `docs/helix-brain/L2-requirements/brain-requirements.md:128–138` inclusive; file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `2c6d2f6c24076429749a2303fe59dffe9c91f1a64fa0f8716bbf4740cbd917fa`。
- L11 source: `docs/helix-brain/L11-acceptance/brain-acceptance.md:33–33` inclusive; file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `e147986e41c25adbfa95ad2c395658058922f921fd9214b5a08cb802ca1c1917`。
- main633採択registration: `MPR-RC-HELIXBRAIN-L2-005-002` / candidate semantic digest `sha256:120d16b39c985bd7f62efe6974a71849cad4cb0f234c395a509dc6793ddd9ff0`。後続register metadataからPO承認を継承しない。
- Version candidate `1.0`; sequence `Stage 2b`。実装・release許可ではない。

- Dependency: BRAIN L1-005、L2-001/002。PO束ね条件: §BRAIN-L1-005。 L10はL3 ACを実装・追加せず観測する。
- **`L10-BRAIN-005-C01` — 正常（`BRAIN-005-AC-01`）**: fixture: Authentication→Session→Frontend State→UX と Database→Performance→Infrastructure のtyped directed relation edgeをsourceとともに投入。 **期待oracle**: 全typed directed edgeが両endpoint・direction・meaning/sourceへtraceされる。
- **`L10-BRAIN-005-C02` — 否定・境界（`BRAIN-005-AC-02`）**: fixture: 両endpoint不明、relation direction/meaning欠落、name similarityのみのedge、因果未確認を個別および組合せで投入。 **期待oracle**: unknown endpointやunsupported causal edgeは確定せずL1-005へ戻す。
- **`L10-BRAIN-005-C03` — 未見境界（`BRAIN-005-AC-01,AC-02`）**: fixture: 別Domain間に名前が近いnode pairを伏せ、source/evidenceを与えないrelation claimを渡す。 **期待oracle**: 未見fixtureでも提示source/conditionの範囲を越えて推定せず、根拠なしはunknownまたは未評価に保つ。
- **観測点**: 両endpoint、許容type/meaning、cross-domain source trace。比較するsource/revision、状態、応答、ownerを同一fixtureで保持する。
- **判定**: C01が親の正常要求とowner境界を満たし、C02が否定/欠落条件を拒否またはunknownとして扱い、C03では根拠が足りる未見入力を同じcontractで評価し、根拠が不足する箇所のみunknown/未評価として扱い、要求意味・責務・承認gateを増やさず、候補値は根拠・比較・測定方法を持つこと。実装実行・合格主張はこの草稿に含まない。

## `HELIXBRAIN-L2-006` — paired L10 oracle（`BRAIN-006-FR-01`）

### 親revisionとauthority

- 親: `HELIXBRAIN-L2-006` — [`docs/governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L53)。PO固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、decision SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。
- L2 source: `docs/helix-brain/L2-requirements/brain-requirements.md:139–149` inclusive; file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `b0047df45ccdd705ebf1eae090a70184a07fe107ab649b4c5d69ca152ba3be8e`。
- L11 source: `docs/helix-brain/L11-acceptance/brain-acceptance.md:34–34` inclusive; file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `afd2970a8b0cf6ba6c990baea59f6768ffec47d2388ebd4a741d11dc2bf136a9`。
- main633採択registration: `MPR-RC-HELIXBRAIN-L2-006-002` / candidate semantic digest `sha256:f031680bdd08d3b7c3286ebb1a5ecab68efb8c4bfed7b8f005a55ff9bb141900`。後続register metadataからPO承認を継承しない。
- Version candidate `1.0`; sequence `Stage 2b`。実装・release許可ではない。

- Dependency: BRAIN L1-006、L2-001/002/003、Visual Design HARNESS接続L2-023。PO回答: 1.0から扱う、Visual Design HARNESS連携。 L10はL3 ACを実装・追加せず観測する。
- **`L10-BRAIN-006-C01` — 正常（`BRAIN-006-AC-01`）**: fixture: IA/Visual Hierarchy/Layout/Grid/Spacing/Typography/Navigation/Component Composition/Form/Feedback/Empty-Loading-Error/Responsive/Dashboard/Content Hierarchy/Accessibilityのknowledge fixtureに、製品固有「黒背景・青accent」、screen/flow/tokenを別source fieldとして添える。 **期待oracle**: 列挙されたknowledge elementがstructureとして返り、製品固有identity/contextが別fieldで維持される。
- **`L10-BRAIN-006-C02` — 否定・境界（`BRAIN-006-AC-02`）**: fixture: 製品固有Visual Identity/screen/flow/tokenをshared fieldへcopy、source productを削除、またはSystem Design自体の意味と称するmutationを個別に投入。 **期待oracle**: 分離不能は共有候補にせずVisual Design HARNESSまたはProduct Coreへ戻す。
- **`L10-BRAIN-006-C03` — 未見境界（`BRAIN-006-AC-01,AC-02`）**: fixture: 未見の製品横断UX patternを伏せ、同時に製品固有identityを含むsourceを渡してfield分離できるか確認。 **期待oracle**: 未見fixtureでも提示source/conditionの範囲を越えて推定せず、根拠なしはunknownまたは未評価に保つ。
- **観測点**: 列挙例の要素種別、shared/product field分類、source。比較するsource/revision、状態、応答、ownerを同一fixtureで保持する。
- **判定**: C01が親の正常要求とowner境界を満たし、C02が否定/欠落条件を拒否またはunknownとして扱い、C03では根拠が足りる未見入力を同じcontractで評価し、根拠が不足する箇所のみunknown/未評価として扱い、要求意味・責務・承認gateを増やさず、候補値は根拠・比較・測定方法を持つこと。実装実行・合格主張はこの草稿に含まない。

## `HELIXBRAIN-L2-009` — paired L10 oracle（`BRAIN-009-FR-01`）

### 親revisionとauthority

- 親: `HELIXBRAIN-L2-009` — [`docs/governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L56)。PO固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、decision SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。
- L2 source: `docs/helix-brain/L2-requirements/brain-requirements.md:172–182` inclusive; file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `ee09a8532ea8f1340c016c54098d90dffe7b2f8cd8e41401f7968362a44f7c7f`。
- L11 source: `docs/helix-brain/L11-acceptance/brain-acceptance.md:37–37` inclusive; file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `e547ea632dbfa78b7cbc732642ad6c860ee072dfa4e6a73c8a3053533d627817`。
- main633採択registration: `MPR-RC-HELIXBRAIN-L2-009-002` / candidate semantic digest `sha256:2357966979f49c70ea6881fddd664a9f121dc43849f8b2889768f931c5e89d01`。後続register metadataからPO承認を継承しない。
- Version candidate `1.0`; sequence `Stage 2b`。実装・release許可ではない。

- Dependency: BRAIN L1-009、L2-005/007/025。PO束ね条件: §BRAIN-L1-009。 L10はL3 ACを実装・追加せず観測する。
- **`L10-BRAIN-009-C01` — 正常（`BRAIN-009-AC-01`）**: fixture: Pattern AのUnit A1とPattern BのUnit B1に新relation candidateとsource/evaluation scopeを加える構成fixtureを投入。 **期待oracle**: 新relationを含むcomposite Pattern candidateとcomponent/source/evaluation scopeを返し、promotion前はcandidateのまま。
- **`L10-BRAIN-009-C02` — 否定・境界（`BRAIN-009-AC-02`）**: fixture: unit/relation sourceを個別欠落、evaluation scope unknown、構成だけでestablished/adoptedへ遷移する変異を個別/組合せで投入。 **期待oracle**: source/meaning不足は該当source ownerへ、構成meaning不明は固定親のBRAIN L1-009へ戻す。
- **`L10-BRAIN-009-C03` — 未見境界（`BRAIN-009-AC-01,AC-02`）**: fixture: 伏せたUnit/relation組合せを与え、candidate traceを確認する。relation意味が定まらない組合せはunknownのままにする。 **期待oracle**: 未見fixtureでも提示source/conditionの範囲を越えて推定せず、根拠なしはunknownまたは未評価に保つ。
- **観測点**: component trace・relation根拠・candidate state。比較するsource/revision、状態、応答、ownerを同一fixtureで保持する。
- **判定**: C01が親の正常要求とowner境界を満たし、C02が否定/欠落条件を拒否またはunknownとして扱い、C03では根拠が足りる未見入力を同じcontractで評価し、根拠が不足する箇所のみunknown/未評価として扱い、要求意味・責務・承認gateを増やさず、候補値は根拠・比較・測定方法を持つこと。実装実行・合格主張はこの草稿に含まない。

## `HELIXBRAIN-L2-010` — paired L10 oracle（`BRAIN-010-FR-01`）

### 親revisionとauthority

- 親: `HELIXBRAIN-L2-010` — [`docs/governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L57)。PO固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、decision SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。
- L2 source: `docs/helix-brain/L2-requirements/brain-requirements.md:183–193` inclusive; file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `1abd7a70802d2c58110fb869adf9d78b686c2dd6cb078edb0b38710d0ac1eace`。
- L11 source: `docs/helix-brain/L11-acceptance/brain-acceptance.md:38–38` inclusive; file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `885d2a34d5c05c01e6c192f12c1add9b7e35f505d4722c3c0e59af6d9cc4a650`。
- main633採択registration: `MPR-RC-HELIXBRAIN-L2-010-002` / candidate semantic digest `sha256:bb9b45219db15affd84fd2098e37930da414358e9170f42d9f308143a3090b2a`。後続register metadataからPO承認を継承しない。
- Version candidate `1.0`; sequence `Stage 2b`。実装・release許可ではない。

- Dependency: BRAIN L1-010、L2-003/005/007。PO束ね条件: §BRAIN-L1-010、DST-HARNESS-005 negative oracle。 L10はL3 ACを実装・追加せず観測する。
- **`L10-BRAIN-010-C01` — 正常（`BRAIN-010-AC-01`）**: fixture: Single Point of Failure、Network Partition、Dependency Failure、Storage Exhaustion、Queue Saturation、Connection Exhaustion、Resource Starvation、Cascading Failure、Region/Zone Failure、Deployment/Backup/Restore Failure、configuration driftの条件付きfailure entriesをそれぞれ正常source付きで投入し、反例条件も一つずつ含める。 **期待oracle**: 各条件付きfailureとcounterexampleがsource/scopeへtraceされ、別条件へ自動適用されない。
- **`L10-BRAIN-010-C02` — 否定・境界（`BRAIN-010-AC-02`）**: fixture: 各failure entryのcondition/provenance/alternativeを一つずつ削除し、さらにconditionだけ削ってuniversal banを要求するmutationを投入。 **期待oracle**: 条件や根拠不明のfindingはuniversal prohibitionにせず未確定/LABOへ戻す。
- **`L10-BRAIN-010-C03` — 未見境界（`BRAIN-010-AC-01,AC-02`）**: fixture: held-out failure conditionと反例を伏せ、known failure categoryに適用scopeを外挿せず扱えるか確認。 **期待oracle**: 未見fixtureでも提示source/conditionの範囲を越えて推定せず、根拠なしはunknownまたは未評価に保つ。
- **観測点**: failure typeと条件、alternative/provenance、scope。比較するsource/revision、状態、応答、ownerを同一fixtureで保持する。
- **判定**: C01が親の正常要求とowner境界を満たし、C02が否定/欠落条件を拒否またはunknownとして扱い、C03では根拠が足りる未見入力を同じcontractで評価し、根拠が不足する箇所のみunknown/未評価として扱い、要求意味・責務・承認gateを増やさず、候補値は根拠・比較・測定方法を持つこと。実装実行・合格主張はこの草稿に含まない。

## `HELIXBRAIN-L2-011` — paired L10 oracle（`BRAIN-011-FR-01`）

### 親revisionとauthority

- 親: `HELIXBRAIN-L2-011` — [`docs/governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L58)。PO固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、decision SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。
- L2 source: `docs/helix-brain/L2-requirements/brain-requirements.md:194–204` inclusive; file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `c85e5ab4be064db02eef9d05ef174f2754446afba55c99946ac5220c8c6ee198`。
- L11 source: `docs/helix-brain/L11-acceptance/brain-acceptance.md:39–39` inclusive; file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `0f6702b067bacfd28d5ceca6cd3c046edae2deb10cd4ed701647aac37a1e93c8`。
- main633採択registration: `MPR-RC-HELIXBRAIN-L2-011-002` / candidate semantic digest `sha256:726a83d698826a4376d6cf8bb47be6a10de671776d27d0b219ada48a38b77091`。後続register metadataからPO承認を継承しない。
- Version candidate `1.0`; sequence `Stage 2b`。実装・release許可ではない。

- Dependency: BRAIN L1-011、L2-007/018/020/025。PO束ね条件: §BRAIN-L1-011。 L10はL3 ACを実装・追加せず観測する。
- **`L10-BRAIN-011-C01` — 正常（`BRAIN-011-AC-01`）**: fixture: Product Core source「RetryYN管理画面では左側にこのmenu」を入力し、根拠付きで「高密度管理画面のpersistent navigation pattern」とsource/product contextを併記する一般化candidateを与える。 **期待oracle**: 共有可能構造候補と製品固有detail/sourceを分離し、一般化候補のsource linkが保たれる。
- **`L10-BRAIN-011-C02` — 否定・境界（`BRAIN-011-AC-02`）**: fixture: 製品source/product identityを消したgeneralization、または個別product文を無変更でuniversal patternとして昇格するmutationを投入。 **期待oracle**: 分離不能は採用せず提供元CORE/LABOへ戻す。
- **`L10-BRAIN-011-C03` — 未見境界（`BRAIN-011-AC-01,AC-02`）**: fixture: 別の未見product contextを伏せて渡し、sourceを保持したまま shared fieldとproduct fieldを分離可能か確認。 **期待oracle**: 未見fixtureでも提示source/conditionの範囲を越えて推定せず、根拠なしはunknownまたは未評価に保つ。
- **観測点**: field別shared/product-specific区分、source provenance。比較するsource/revision、状態、応答、ownerを同一fixtureで保持する。
- **判定**: C01が親の正常要求とowner境界を満たし、C02が否定/欠落条件を拒否またはunknownとして扱い、C03では根拠が足りる未見入力を同じcontractで評価し、根拠が不足する箇所のみunknown/未評価として扱い、要求意味・責務・承認gateを増やさず、候補値は根拠・比較・測定方法を持つこと。実装実行・合格主張はこの草稿に含まない。

## `HELIXBRAIN-L2-012` — paired L10 oracle（`BRAIN-012-FR-01`）

### 親revisionとauthority

- 親: `HELIXBRAIN-L2-012` — [`docs/governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L59)。PO固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、decision SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。
- L2 source: `docs/helix-brain/L2-requirements/brain-requirements.md:205–215` inclusive; file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `3a2b615ba985a12eaf601fb470c8974d9b2c51f68d7f10cfcc5913dcd22b32f2`。
- L11 source: `docs/helix-brain/L11-acceptance/brain-acceptance.md:40–40` inclusive; file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `f332f7974002d1d73fe5bc5b12c24d988913fd66717e4d6915dacc6eea238a27`。
- main633採択registration: `MPR-RC-HELIXBRAIN-L2-012-002` / candidate semantic digest `sha256:f574ca7fda5b129544983c786c5c5881fa7c479e00d96cdeaa60757b7964493f`。後続register metadataからPO承認を継承しない。
- Version candidate `1.0`; sequence `Stage 2b`。実装・release許可ではない。

- Dependency: BRAIN L1-012、L2-019/021/022。PO束ね条件: §BRAIN-L1-012およびConceptのBRAIN/INTELLIGENCE/OS境界。 L10はL3 ACを実装・追加せず観測する。
- **`L10-BRAIN-012-C01` — 正常（`BRAIN-012-AC-01`）**: fixture: design contextとknowledge domainに対し複数Pattern候補、required input、relation、alternative、constraint、evidence、versionを返す正常queryと、別ownerの採否recordを用意。 **期待oracle**: candidate/required input/relation/alternative/constraint/evidence/versionを返し、decision stateはconsumer owner側に残る。
- **`L10-BRAIN-012-C02` — 否定・境界（`BRAIN-012-AC-02`）**: fixture: required inputを欠落、複数candidateを一つにさせる、candidate responseをproduct adoptionまたはruntime decision receiptとする変異を個別/組合せで投入。 **期待oracle**: 選択不能/不足はHARNESS-CORE/INTELLIGENCE/人等の該当ownerへ返しBRAIN candidate stateを変えない。
- **`L10-BRAIN-012-C03` — 未見境界（`BRAIN-012-AC-01,AC-02`）**: fixture: 別Domain/製品contextの未見queryで候補を返し、BRAINが選択・runtime判断を行わないことを確認。 **期待oracle**: 未見fixtureでも提示source/conditionの範囲を越えて推定せず、根拠なしはunknownまたは未評価に保つ。
- **観測点**: candidate fieldsとconsumer adoption record separation。比較するsource/revision、状態、応答、ownerを同一fixtureで保持する。
- **判定**: C01が親の正常要求とowner境界を満たし、C02が否定/欠落条件を拒否またはunknownとして扱い、C03では根拠が足りる未見入力を同じcontractで評価し、根拠が不足する箇所のみunknown/未評価として扱い、要求意味・責務・承認gateを増やさず、候補値は根拠・比較・測定方法を持つこと。実装実行・合格主張はこの草稿に含まない。

## `HELIXBRAIN-L2-029` — paired L10 oracle（`BRAIN-029-FR-01`）

### 親revisionとauthority

- 親: `HELIXBRAIN-L2-029` — [`docs/governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L88)。PO固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、decision SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。
- L2 source: `docs/helix-brain/L2-requirements/brain-requirements.md:564–574` inclusive; file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `79ed972f758fddbe5d6488a67de19bd951562d4eccbc9c45ab86027d87493259`。
- L11 source: `docs/helix-brain/L11-acceptance/brain-acceptance.md:87–95` inclusive; file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `b5355a8dc68d145c5154bc0aadfd46fbbc914ee0a2d23d5e36053d372d623acf`。
- main633採択registration: `MPR-RC-HELIXBRAIN-L2-029-001` / candidate semantic digest `sha256:fd3bd6eaf17c5dad916dec0793c28544816c8b785e98fa854b49df843b11382d`。後続register metadataからPO承認を継承しない。
- Version candidate `1.0`; sequence `Stage 2b`。実装・release許可ではない。

- Dependency: primary BRAIN L1-003/005/009、consumer HARNESS L1-009/001。常時L2-008/003/005、構成時L2-009、比較時L2-004、source選択に応じCORE L2-018、LABO-evaluated inputならL2-020。PO固定G15束ね条件はL11 source spanに従う。 L10はL3 ACを実装・追加せず観測する。
- **`L10-BRAIN-029-C01` — 正常（`BRAIN-029-AC-01`）**: fixture: 承認後編集禁止というgeneralized problemに関係する複数Pattern/Unit候補を投入し、problem/applicability/required input/constraint/tradeoff/negative/source/versionとconflicts_with/alternative_to/compatible_withの両端identityを含める。 **期待oracle**: unit compositionとrelation endpoint/sourceをtrace可能なcandidateで返し、今回製品の採用決定を生成しない。
- **`L10-BRAIN-029-C02` — 否定・境界（`BRAIN-029-AC-02`）**: fixture: product-specific申請/API/permissionをshared knowledgeへ含める、incompatible relationを落とす、required input/source欠落、一回の製品適用で採用済みへ進める変異を個別/組合せで投入。 **期待oracle**: 根拠・入力不足はunknown/holdとしBRAIN L1-003/005/009または製品requirementはHARNESSへ戻す。
- **`L10-BRAIN-029-C03` — 未見境界（`BRAIN-029-AC-03`）**: fixture: 試験側に伏せた別DomainのPattern/Unit組合せまたはrequired input欠落を投入する。 **期待oracle**: conditionベースでapplicabilityと`conflicts_with`を照合し、Domain/oracle scope不明は未評価のまま保持する。全Domain網羅や製品採用を主張しない。
- **観測点**: candidate composition/source trace・condition・conflict/unknown・owner。比較するsource/revision、状態、応答、ownerを同一fixtureで保持する。
- **判定**: C01が親の正常要求とowner境界を満たし、C02が否定/欠落条件を拒否またはunknownとして扱い、C03の未見fixtureでunknown/未評価境界を保ち、要求意味・責務・承認gateを増やさず、候補値は根拠・比較・測定方法を持つこと。実装実行・合格主張はこの草稿に含まない。

## Stage 2b: Infrastructure対検証

## `HELIXBRAIN-L2-INFRA-001` — paired L10 oracle（`BRAIN-INFRA-001-FR-01`）

### 親revisionとauthority

- 親 `HELIXBRAIN-L2-INFRA-001`; PO decision [`helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L60), revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`, decision file SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。main633 adopted registration `MPR-RC-HELIXBRAIN-L2-INFRA-001-002` / semantic digest `sha256:9bd664fbf1d0b04f627fb4bc562a7ef63c19ac61813c12c5afe381481075ed60`。後続metadataから承認を継承しない。
- L2 `docs/helix-brain/L2-requirements/brain-requirements.md:220–229` (inclusive), file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `fcddad5c8f225147186c49fa08da577ae04be86a89f84d112dccf18956e21d6b`。
- L11 `docs/helix-brain/L11-acceptance/brain-acceptance.md:41–41` (inclusive), file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `b632016e7b0fb5e3c0ac0e3080f86283eac8e4bb39bee246d9e8373086f5e5a1`。
- Version candidate `1.0`, sequence `Stage 2b`; release/implementation authorizationではない。
- Dependency: 親L1-001; 常時 BRAIN L2-001の分類・変更境界。PO束ね条件 Infrastructure PO原文 INFRA-001。 L10はL3 AC候補のsystem boundary behaviorを観測し、FRの意味を増やさない。
- **`L10-BRAIN-INFRA-001-C01` — 正常** (`BRAIN-INFRA-001-AC-01`): fixture: Compute、Network、Storage、Database Infrastructure、Cache、Queue / Messaging、Load Balancing、Service Discovery、Deployment、Scaling、Availability、Reliability、Backup / Restore、Disaster Recovery、Observability、Capacity、Cost Architecture、Infrastructure Security、Environment、Runtime / Execution Platformの20初期Subdomainを含むsource付きDomain構造を作る。別のsource付き未列挙候補も渡し、追加/分割/統合/退役を別々の変更fixtureで行い、既存relation利用者の参照を維持する。 **期待oracle**: 親L2/L11が定める正常意味に沿って返却し、各field/関係（分類identity・親子relation・candidate state）をcandidate stateに保持する。入力source/revision/scopeとownerを追跡でき、実resource operationは行わない。
- **`L10-BRAIN-INFRA-001-C02` — 否定/境界** (`BRAIN-INFRA-001-AC-02`): fixture: 未列挙subdomainを一律拒否、実provider accountをdomain化、subdomain改変で既存referenceを削除するmutationをそれぞれ投入。 mutationを各々別fixtureと組合せfixtureに投入。 **期待oracle**: 全項目を候補として保持でき、resource状態を推測しない。 missing/invalid/unknownをsuccessに丸めず、reasonとreturn ownerを観測。
- **`L10-BRAIN-INFRA-001-C03` — 未見境界** (`BRAIN-INFRA-001-AC-01,AC-02`): fixture: 初期例にないsource付きSubdomain案と別の追加/統合履歴を伏せて投入し、open-listでidentity/referenceを保てるか確認。 **期待oracle**: source/conditionが十分な未見入力は同じcontractで評価し、根拠が不足する箇所だけunknown/未評価として保持する。C03は既存AC境界のfixtureで新しいgate/meaningを追加しない。
- **観測点**: 分類identity・親子relation・candidate state。parent revision、各field、scope、owner、返却state/sourceをfixture結果に残す。
- **判定**: C01は親正常例、C02は個別+組合せinvalid、C03はitem固有held-out boundaryを照合する。要求意味・責務・承認gateを増やさず、必要な技術候補値は根拠・比較・計測方法付きで提示する。未実行設計でありpassを主張しない。

## `HELIXBRAIN-L2-INFRA-002` — paired L10 oracle（`BRAIN-INFRA-002-FR-01`）

### 親revisionとauthority

- 親 `HELIXBRAIN-L2-INFRA-002`; PO decision [`helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L61), revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`, decision file SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。main633 adopted registration `MPR-RC-HELIXBRAIN-L2-INFRA-002-002` / semantic digest `sha256:367891a1596fc2be0e2eac038d4f385e5163ae7d368fe29460f3a483863ae7f2`。後続metadataから承認を継承しない。
- L2 `docs/helix-brain/L2-requirements/brain-requirements.md:230–239` (inclusive), file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `8aaa447b505de8ad93744994b01e5285fd496a7f11165912b14b83c9fdde7159`。
- L11 `docs/helix-brain/L11-acceptance/brain-acceptance.md:42–42` (inclusive), file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `3e262257957673c43a631480d175578b3cf9feb50f31230299ce1d5cd9c880a8`。
- Version candidate `1.0`, sequence `Stage 2b`; release/implementation authorizationではない。
- Dependency: 親L1-002; 常時 BRAIN L2-002/INFRA-001。INFRA-002の例の階層型とprovider implementation distinction。 L10はL3 AC候補のsystem boundary behaviorを観測し、FRの意味を増やさない。
- **`L10-BRAIN-INFRA-002-C01` — 正常** (`BRAIN-INFRA-002-AC-01`): fixture: Availability→Active/Passive→Primary/Standby/Health Detection/FailoverとDeployment→Blue-Green→Active/Candidate/Traffic Switch/Rollbackの両階層fixture。 **期待oracle**: 親L2/L11が定める正常意味に沿って返却し、各field/関係（抽象Pattern identity/parentと実装例の別field）をcandidate stateに保持する。入力source/revision/scopeとownerを追跡でき、実resource operationは行わない。
- **`L10-BRAIN-INFRA-002-C02` — 否定/境界** (`BRAIN-INFRA-002-AC-02`): fixture: Active/Passive hierarchyのparent/child入替、provider-specific configだけのPattern登録、unknown kindを個別に投入。 mutationを各々別fixtureと組合せfixtureに投入。 **期待oracle**: 構造不明はunknown/holdとし、知識ownerへ戻す。 missing/invalid/unknownをsuccessに丸めず、reasonとreturn ownerを観測。
- **`L10-BRAIN-INFRA-002-C03` — 未見境界** (`BRAIN-INFRA-002-AC-01,AC-02`): fixture: 未見のprovider implementation exampleを抽象pattern hierarchyへつなぎ、抽象kindとimplementation identityを維持。 **期待oracle**: source/conditionが十分な未見入力は同じcontractで評価し、根拠が不足する箇所だけunknown/未評価として保持する。C03は既存AC境界のfixtureで新しいgate/meaningを追加しない。
- **観測点**: 抽象Pattern identity/parentと実装例の別field。parent revision、各field、scope、owner、返却state/sourceをfixture結果に残す。
- **判定**: C01は親正常例、C02は個別+組合せinvalid、C03はitem固有held-out boundaryを照合する。要求意味・責務・承認gateを増やさず、必要な技術候補値は根拠・比較・計測方法付きで提示する。未実行設計でありpassを主張しない。

## `HELIXBRAIN-L2-INFRA-003` — paired L10 oracle（`BRAIN-INFRA-003-FR-01`）

### 親revisionとauthority

- 親 `HELIXBRAIN-L2-INFRA-003`; PO decision [`helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L62), revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`, decision file SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。main633 adopted registration `MPR-RC-HELIXBRAIN-L2-INFRA-003-002` / semantic digest `sha256:4009bed040b56dae56d064690b489f9c71e3e3b4f54cec68d17f695c94be58f2`。後続metadataから承認を継承しない。
- L2 `docs/helix-brain/L2-requirements/brain-requirements.md:240–249` (inclusive), file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `015454d12eb883ec17e4cd5752633486ebeb289378a7d00b24d2e8e2c6350f0b`。
- L11 `docs/helix-brain/L11-acceptance/brain-acceptance.md:43–43` (inclusive), file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `339434e6d8c6b7438f3c67efe7aa50788314c4fd6f1778fd557d7ff9e4759f6e`。
- Version candidate `1.0`, sequence `Stage 2b`; release/implementation authorizationではない。
- Dependency: 親L1-003; 常時 BRAIN L2-003/INFRA-002。列挙全descriptor fieldと欠落時unknown。 L10はL3 AC候補のsystem boundary behaviorを観測し、FRの意味を増やさない。
- **`L10-BRAIN-INFRA-003-C01` — 正常** (`BRAIN-INFRA-003-AC-01`): fixture: 全20 descriptor fieldをsource付きで持つInfrastructure Pattern fixtureとcomplete contextを投入。 **期待oracle**: 親L2/L11が定める正常意味に沿って返却し、各field/関係（列挙descriptor全field、input requiredness、applicability state）をcandidate stateに保持する。入力source/revision/scopeとownerを追跡でき、実resource operationは行わない。
- **`L10-BRAIN-INFRA-003-C02` — 否定/境界** (`BRAIN-INFRA-003-AC-02`): fixture: 20 fieldの各fieldをひとつずつ欠落/unknownにし、別fixtureでgeneral-only applicabilityを要求。 mutationを各々別fixtureと組合せfixtureに投入。 **期待oracle**: 未指定値はunknownとして不足input ownerへ返す。 missing/invalid/unknownをsuccessに丸めず、reasonとreturn ownerを観測。
- **`L10-BRAIN-INFRA-003-C03` — 未見境界** (`BRAIN-INFRA-003-AC-01,AC-02`): fixture: 未知workloadを持つ伏せたPatternを投げ、required inputがunknownのまま適用可能としない。 **期待oracle**: source/conditionが十分な未見入力は同じcontractで評価し、根拠が不足する箇所だけunknown/未評価として保持する。C03は既存AC境界のfixtureで新しいgate/meaningを追加しない。
- **観測点**: 列挙descriptor全field、input requiredness、applicability state。parent revision、各field、scope、owner、返却state/sourceをfixture結果に残す。
- **判定**: C01は親正常例、C02は個別+組合せinvalid、C03はitem固有held-out boundaryを照合する。要求意味・責務・承認gateを増やさず、必要な技術候補値は根拠・比較・計測方法付きで提示する。未実行設計でありpassを主張しない。

## `HELIXBRAIN-L2-INFRA-004` — paired L10 oracle（`BRAIN-INFRA-004-FR-01`）

### 親revisionとauthority

- 親 `HELIXBRAIN-L2-INFRA-004`; PO decision [`helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L63), revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`, decision file SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。main633 adopted registration `MPR-RC-HELIXBRAIN-L2-INFRA-004-002` / semantic digest `sha256:87d85b0d9999a9446560dd137911e6c75d29b74c468c2ca80d5c62d6a4d08d39`。後続metadataから承認を継承しない。
- L2 `docs/helix-brain/L2-requirements/brain-requirements.md:250–259` (inclusive), file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `d11834af6cc5a20da98d97ada275cd8bcdc17ec930daa1e8ce03b3b2d904bb84`。
- L11 `docs/helix-brain/L11-acceptance/brain-acceptance.md:44–44` (inclusive), file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `e78120ffe0c33badd64289c6b45c9d0b9010c23fc7b4f597be63deef04ccdbb0`。
- Version candidate `1.0`, sequence `Stage 2b`; release/implementation authorizationではない。
- Dependency: 親L1-003/005; 常時 BRAIN L2-003/005/022。列挙10 NFR特性relationとunknown input。 L10はL3 AC候補のsystem boundary behaviorを観測し、FRの意味を増やさない。
- **`L10-BRAIN-INFRA-004-C01` — 正常** (`BRAIN-INFRA-004-AC-01`): fixture: Availability/Performance/Capacity/Reliability/Recoverability/Security/Privacy/Observability/Maintainability/Costそれぞれについてinput sourceとPattern candidate relationを用意。 **期待oracle**: 親L2/L11が定める正常意味に沿って返却し、各field/関係（source/requirement identityとmapping rationale/unknown）をcandidate stateに保持する。入力source/revision/scopeとownerを追跡でき、実resource operationは行わない。
- **`L10-BRAIN-INFRA-004-C02` — 否定/境界** (`BRAIN-INFRA-004-AC-02`): fixture: 10 NFR fieldのsourceを一つずつ外す、target valueを要求するが未供給、mapping root/evidenceの欠落を個別/組合せ。 mutationを各々別fixtureと組合せfixtureに投入。 **期待oracle**: product valueは要求ownerへ戻しBRAINは推定値を作らない。 missing/invalid/unknownをsuccessに丸めず、reasonとreturn ownerを観測。
- **`L10-BRAIN-INFRA-004-C03` — 未見境界** (`BRAIN-INFRA-004-AC-01,AC-02`): fixture: 伏せた別NFR特性またはinput不足を加え、既知relationと未知mappingを区分する。 **期待oracle**: source/conditionが十分な未見入力は同じcontractで評価し、根拠が不足する箇所だけunknown/未評価として保持する。C03は既存AC境界のfixtureで新しいgate/meaningを追加しない。
- **観測点**: source/requirement identityとmapping rationale/unknown。parent revision、各field、scope、owner、返却state/sourceをfixture結果に残す。
- **判定**: C01は親正常例、C02は個別+組合せinvalid、C03はitem固有held-out boundaryを照合する。要求意味・責務・承認gateを増やさず、必要な技術候補値は根拠・比較・計測方法付きで提示する。未実行設計でありpassを主張しない。

## `HELIXBRAIN-L2-INFRA-005` — paired L10 oracle（`BRAIN-INFRA-005-FR-01`）

### 親revisionとauthority

- 親 `HELIXBRAIN-L2-INFRA-005`; PO decision [`helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L64), revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`, decision file SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。main633 adopted registration `MPR-RC-HELIXBRAIN-L2-INFRA-005-002` / semantic digest `sha256:8d75a00e618b3102fcb5953350a12071462f46bb247a3fc0bfacc50cff789dd3`。後続metadataから承認を継承しない。
- L2 `docs/helix-brain/L2-requirements/brain-requirements.md:260–269` (inclusive), file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `6421070da28271408c2276ea905ad647f4917e0a42a36d9aec81bc306540ff90`。
- L11 `docs/helix-brain/L11-acceptance/brain-acceptance.md:45–45` (inclusive), file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `027ec51b1800b025e0d7b8e4077316c8cadeea469e59638701e03548571833a8`。
- Version candidate `1.0`, sequence `Stage 2b`; release/implementation authorizationではない。
- Dependency: 親L1-010; 常時 BRAIN L2-010/INFRA-003。全failure exampleとoracle field。 L10はL3 AC候補のsystem boundary behaviorを観測し、FRの意味を増やさない。
- **`L10-BRAIN-INFRA-005-C01` — 正常** (`BRAIN-INFRA-005-AC-01`): fixture: Single Point of Failure、Network Partition、Dependency Failure、Storage Exhaustion、Queue Saturation、Connection Exhaustion、Resource Starvation、Cascading Failure、Region / Zone Failure、Deployment Failure、Backup Failure、Restore Failure、Configuration Driftの13類型を各々正常構成に関係づける。各recordにcondition、expected failure、detection、impact、containment、recovery、residual riskとsourceを与える。 **期待oracle**: 親L2/L11が定める正常意味に沿って返却し、各field/関係（各field/source、unknown、condition）をcandidate stateに保持する。入力source/revision/scopeとownerを追跡でき、実resource operationは行わない。
- **`L10-BRAIN-INFRA-005-C02` — 否定/境界** (`BRAIN-INFRA-005-AC-02`): fixture: 6 failure oracle fieldを各々欠落、conditionを削除、residual riskを隠すmutationを個別/組合せ投入。 mutationを各々別fixtureと組合せfixtureに投入。 **期待oracle**: 不足情報を提示しfailure source/evaluation ownerへ戻す。 missing/invalid/unknownをsuccessに丸めず、reasonとreturn ownerを観測。
- **`L10-BRAIN-INFRA-005-C03` — 未見境界** (`BRAIN-INFRA-005-AC-01,AC-02`): fixture: 未見failure categoryと不完全oracleを投入し、known fieldsから残りを推測しない。 **期待oracle**: source/conditionが十分な未見入力は同じcontractで評価し、根拠が不足する箇所だけunknown/未評価として保持する。C03は既存AC境界のfixtureで新しいgate/meaningを追加しない。
- **観測点**: 各field/source、unknown、condition。parent revision、各field、scope、owner、返却state/sourceをfixture結果に残す。
- **判定**: C01は親正常例、C02は個別+組合せinvalid、C03はitem固有held-out boundaryを照合する。要求意味・責務・承認gateを増やさず、必要な技術候補値は根拠・比較・計測方法付きで提示する。未実行設計でありpassを主張しない。

## `HELIXBRAIN-L2-INFRA-006` — paired L10 oracle（`BRAIN-INFRA-006-FR-01`）

### 親revisionとauthority

- 親 `HELIXBRAIN-L2-INFRA-006`; PO decision [`helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L65), revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`, decision file SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。main633 adopted registration `MPR-RC-HELIXBRAIN-L2-INFRA-006-003` / semantic digest `sha256:3815313a4d7eb5d3ddbf42d7131f9a285cc865fb26105ba5b6cf64c27f221f23`。後続metadataから承認を継承しない。
- L2 `docs/helix-brain/L2-requirements/brain-requirements.md:270–281` (inclusive), file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `3815313a4d7eb5d3ddbf42d7131f9a285cc865fb26105ba5b6cf64c27f221f23`。
- L11 `docs/helix-brain/L11-acceptance/brain-acceptance.md:46–46` (inclusive), file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `4d27eac75001098de566731352d2edf45c0f08c635044a26d1eaf83fab494d82`。
- Version candidate `1.0`, sequence `Stage 2b`; release/implementation authorizationではない。
- Dependency: 親L1-002/010; 常時 BRAIN L2-002/INFRA-005。INFRA-010 Backup/Restoreと相互参照してよいが成立前提にしない。 L10はL3 AC候補のsystem boundary behaviorを観測し、FRの意味を増やさない。
- **`L10-BRAIN-INFRA-006-C01` — 正常** (`BRAIN-INFRA-006-AC-01`): fixture: Retry/Timeout、Circuit Breaker/Failover、Graceful Degradation、Rollback/Restore/Rebuild/Reconciliation/Disaster Recoveryを条件付きRecovery Pattern candidateとして投入し、実行stateを付けない。 **期待oracle**: 親L2/L11が定める正常意味に沿って返却し、各field/関係（candidate knowledgeと運用実行stateの分離）をcandidate stateに保持する。入力source/revision/scopeとownerを追跡でき、実resource operationは行わない。
- **`L10-BRAIN-INFRA-006-C02` — 否定/境界** (`BRAIN-INFRA-006-AC-02`): fixture: prevention-only構成、recovery conditionなし、知識応答で実行成功/permissionを主張するmutationを分けて投入。 mutationを各々別fixtureと組合せfixtureに投入。 **期待oracle**: 実行/permission要求は運用ownerへ戻しBRAINでは操作しない。 missing/invalid/unknownをsuccessに丸めず、reasonとreturn ownerを観測。
- **`L10-BRAIN-INFRA-006-C03` — 未見境界** (`BRAIN-INFRA-006-AC-01,AC-02`): fixture: 伏せたfailure conditionへrecovery候補を渡し、意味不定はunknown、Backup itemの完成待ちを要求しない。 **期待oracle**: source/conditionが十分な未見入力は同じcontractで評価し、根拠が不足する箇所だけunknown/未評価として保持する。C03は既存AC境界のfixtureで新しいgate/meaningを追加しない。
- **観測点**: candidate knowledgeと運用実行stateの分離。parent revision、各field、scope、owner、返却state/sourceをfixture結果に残す。
- **判定**: C01は親正常例、C02は個別+組合せinvalid、C03はitem固有held-out boundaryを照合する。要求意味・責務・承認gateを増やさず、必要な技術候補値は根拠・比較・計測方法付きで提示する。未実行設計でありpassを主張しない。

## `HELIXBRAIN-L2-INFRA-007` — paired L10 oracle（`BRAIN-INFRA-007-FR-01`）

### 親revisionとauthority

- 親 `HELIXBRAIN-L2-INFRA-007`; PO decision [`helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L66), revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`, decision file SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。main633 adopted registration `MPR-RC-HELIXBRAIN-L2-INFRA-007-003` / semantic digest `sha256:6139e9c45d889da03b67d37437c39f361592a6a19bb2651b46397c6ddce31684`。後続metadataから承認を継承しない。
- L2 `docs/helix-brain/L2-requirements/brain-requirements.md:282–291` (inclusive), file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `79954786ae654f5969fcc002cfe57803966f0205f59305f90de56a7295ccb188`。
- L11 `docs/helix-brain/L11-acceptance/brain-acceptance.md:47–47` (inclusive), file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `8bcf9023a543c1772d888fabce7b4df40fb23c46e419475a52284be9aef0d2b2`。
- Version candidate `1.0`, sequence `Stage 2b`; release/implementation authorizationではない。
- Dependency: 親L1-004; 常時 BRAIN L2-004/INFRA-003/INFRA-006。6 deployment方式・比較軸、実action禁止。 L10はL3 AC候補のsystem boundary behaviorを観測し、FRの意味を増やさない。
- **`L10-BRAIN-INFRA-007-C01` — 正常** (`BRAIN-INFRA-007-AC-01`): fixture: 6 deployment methodと6 comparison characteristicにsource付き値を備えた同一problem fixtureを投入。 **期待oracle**: 親L2/L11が定める正常意味に沿って返却し、各field/関係（候補の違い、scope、owner境界）をcandidate stateに保持する。入力source/revision/scopeとownerを追跡でき、実resource operationは行わない。
- **`L10-BRAIN-INFRA-007-C02` — 否定/境界** (`BRAIN-INFRA-007-AC-02`): fixture: 6 methodのcharacteristicをひとつずつ外し、release/deploy actionをBRAIN応答に要求する変異を投入。 mutationを各々別fixtureと組合せfixtureに投入。 **期待oracle**: deployment/release ownerへ戻す。 missing/invalid/unknownをsuccessに丸めず、reasonとreturn ownerを観測。
- **`L10-BRAIN-INFRA-007-C03` — 未見境界** (`BRAIN-INFRA-007-AC-01,AC-02`): fixture: 未知のdeployment methodを比較候補に加え、評価軸が不明な部分をunknownとして保持し、実actionなし。 **期待oracle**: source/conditionが十分な未見入力は同じcontractで評価し、根拠が不足する箇所だけunknown/未評価として保持する。C03は既存AC境界のfixtureで新しいgate/meaningを追加しない。
- **観測点**: 候補の違い、scope、owner境界。parent revision、各field、scope、owner、返却state/sourceをfixture結果に残す。
- **判定**: C01は親正常例、C02は個別+組合せinvalid、C03はitem固有held-out boundaryを照合する。要求意味・責務・承認gateを増やさず、必要な技術候補値は根拠・比較・計測方法付きで提示する。未実行設計でありpassを主張しない。

## `HELIXBRAIN-L2-INFRA-008` — paired L10 oracle（`BRAIN-INFRA-008-FR-01`）

### 親revisionとauthority

- 親 `HELIXBRAIN-L2-INFRA-008`; PO decision [`helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L67), revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`, decision file SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。main633 adopted registration `MPR-RC-HELIXBRAIN-L2-INFRA-008-003` / semantic digest `sha256:6fbd7f1527b50a7c46cd201dbad52d7584616a7cb6f41cb2867cda550e1ad67a`。後続metadataから承認を継承しない。
- L2 `docs/helix-brain/L2-requirements/brain-requirements.md:292–301` (inclusive), file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `fd25f8a5431b39e11266b4cf65f056706d6a27932fb0af9fb5cf4ff703055fe8`。
- L11 `docs/helix-brain/L11-acceptance/brain-acceptance.md:48–48` (inclusive), file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `9c51887b271b926e70c837a48a05aa66e55f53ffb3f6337f53d613f4ae4de1f3`。
- Version candidate `1.0`, sequence `Stage 2b`; release/implementation authorizationではない。
- Dependency: 親L1-003; 常時 BRAIN L2-003/INFRA-003/INFRA-004。列挙8 patternと6 descriptor axes。 L10はL3 AC候補のsystem boundary behaviorを観測し、FRの意味を増やさない。
- **`L10-BRAIN-INFRA-008-C01` — 正常** (`BRAIN-INFRA-008-AC-01`): fixture: 8 scaling patternとtrigger/bottleneck/limit/statefulness/synchronization/saturationの入力・条件を持つworkload fixture。 **期待oracle**: 親L2/L11が定める正常意味に沿って返却し、各field/関係（trigger/bottleneck/limits/state/sync/saturation fields）をcandidate stateに保持する。入力source/revision/scopeとownerを追跡でき、実resource operationは行わない。
- **`L10-BRAIN-INFRA-008-C02` — 否定/境界** (`BRAIN-INFRA-008-AC-02`): fixture: 8 patternを個別にunknown resource/load sourceとし、thresholdを創作またはresource mutationを実行するよう要求。 mutationを各々別fixtureと組合せfixtureに投入。 **期待oracle**: 未知thresholdはproduct ownerへ戻し、BRAINはunknownにする。 missing/invalid/unknownをsuccessに丸めず、reasonとreturn ownerを観測。
- **`L10-BRAIN-INFRA-008-C03` — 未見境界** (`BRAIN-INFRA-008-AC-01,AC-02`): fixture: holdout workload/bottleneck組合せを使い、threshold不足をapplicableへ変換せずunknownのままにする。 **期待oracle**: source/conditionが十分な未見入力は同じcontractで評価し、根拠が不足する箇所だけunknown/未評価として保持する。C03は既存AC境界のfixtureで新しいgate/meaningを追加しない。
- **観測点**: trigger/bottleneck/limits/state/sync/saturation fields。parent revision、各field、scope、owner、返却state/sourceをfixture結果に残す。
- **判定**: C01は親正常例、C02は個別+組合せinvalid、C03はitem固有held-out boundaryを照合する。要求意味・責務・承認gateを増やさず、必要な技術候補値は根拠・比較・計測方法付きで提示する。未実行設計でありpassを主張しない。

## `HELIXBRAIN-L2-INFRA-009` — paired L10 oracle（`BRAIN-INFRA-009-FR-01`）

### 親revisionとauthority

- 親 `HELIXBRAIN-L2-INFRA-009`; PO decision [`helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L68), revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`, decision file SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。main633 adopted registration `MPR-RC-HELIXBRAIN-L2-INFRA-009-003` / semantic digest `sha256:0e2af1c81611096da7b50401d9c8f9342f585b89180fe1353fadda177c9d9ef9`。後続metadataから承認を継承しない。
- L2 `docs/helix-brain/L2-requirements/brain-requirements.md:302–311` (inclusive), file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `2286996c4a51098e495d602c94d5e641420d8f7110ba00a8ceed59e075f13f9c`。
- L11 `docs/helix-brain/L11-acceptance/brain-acceptance.md:49–49` (inclusive), file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `841445aa41dff273200edc6259212d00314c2058b2f9d6166a69a8fc64dc8693`。
- Version candidate `1.0`, sequence `Stage 2b`; release/implementation authorizationではない。
- Dependency: 親L1-003; 常時 BRAIN L2-003/INFRA-003/INFRA-005。各観測pointからpattern/failure trace。 L10はL3 AC候補のsystem boundary behaviorを観測し、FRの意味を増やさない。
- **`L10-BRAIN-INFRA-009-C01` — 正常** (`BRAIN-INFRA-009-AC-01`): fixture: 11 design observation pointsをsource付きPattern contextに結び、実sample値なしの設計fixtureを投入。 **期待oracle**: 親L2/L11が定める正常意味に沿って返却し、各field/関係（観測点候補/対象/sourceとactual signal valueの分離）をcandidate stateに保持する。入力source/revision/scopeとownerを追跡でき、実resource operationは行わない。
- **`L10-BRAIN-INFRA-009-C02` — 否定/境界** (`BRAIN-INFRA-009-AC-02`): fixture: 11 observation pointの各definitionを欠落させ、actual log/metric/trace値をBRAIN recordに混ぜるmutationを個別投入。 mutationを各々別fixtureと組合せfixtureに投入。 **期待oracle**: 収集値や機密は適切なdata/operation ownerへ戻す。 missing/invalid/unknownをsuccessに丸めず、reasonとreturn ownerを観測。
- **`L10-BRAIN-INFRA-009-C03` — 未見境界** (`BRAIN-INFRA-009-AC-01,AC-02`): fixture: 伏せたfailure signal/design targetを投入し、point designは候補にできてもlive valuesは取得/保存しない。 **期待oracle**: source/conditionが十分な未見入力は同じcontractで評価し、根拠が不足する箇所だけunknown/未評価として保持する。C03は既存AC境界のfixtureで新しいgate/meaningを追加しない。
- **観測点**: 観測点候補/対象/sourceとactual signal valueの分離。parent revision、各field、scope、owner、返却state/sourceをfixture結果に残す。
- **判定**: C01は親正常例、C02は個別+組合せinvalid、C03はitem固有held-out boundaryを照合する。要求意味・責務・承認gateを増やさず、必要な技術候補値は根拠・比較・計測方法付きで提示する。未実行設計でありpassを主張しない。

## `HELIXBRAIN-L2-INFRA-010` — paired L10 oracle（`BRAIN-INFRA-010-FR-01`）

### 親revisionとauthority

- 親 `HELIXBRAIN-L2-INFRA-010`; PO decision [`helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L69), revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`, decision file SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。main633 adopted registration `MPR-RC-HELIXBRAIN-L2-INFRA-010-002` / semantic digest `sha256:c1980982ae72265e879e460146c829aed253594de05f1a072f1913fe22264ddf`。後続metadataから承認を継承しない。
- L2 `docs/helix-brain/L2-requirements/brain-requirements.md:312–321` (inclusive), file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `e3d673a5ec89eb201512750f9cdef510099a2a1c69ccf3e706effe63696de6a9`。
- L11 `docs/helix-brain/L11-acceptance/brain-acceptance.md:50–50` (inclusive), file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `0d82dcad9c63929ef29003277754ad41eb50d85bb54d93193f0de5dfbf839687`。
- Version candidate `1.0`, sequence `Stage 2b`; release/implementation authorizationではない。
- Dependency: 親L1-003/010; 常時 BRAIN L2-005/INFRA-006。Backup/Restore/recoverability relation。 L10はL3 AC候補のsystem boundary behaviorを観測し、FRの意味を増やさない。
- **`L10-BRAIN-INFRA-010-C01` — 正常** (`BRAIN-INFRA-010-AC-01`): fixture: backup strategy+replication+restore pattern+restore verification+required conditionsをrelationするcandidateとproduct-source RTO/RPOを別fieldにする。 **期待oracle**: 親L2/L11が定める正常意味に沿って返却し、各field/関係（backup/restore/recoverability relationとtarget provenance）をcandidate stateに保持する。入力source/revision/scopeとownerを追跡でき、実resource operationは行わない。
- **`L10-BRAIN-INFRA-010-C02` — 否定/境界** (`BRAIN-INFRA-010-AC-02`): fixture: backup-only、restore validation欠落、RTO/RPOのproduct sourceなし、RTO/RPO sourceを古いrevisionへする各mutationを投入。 mutationを各々別fixtureと組合せfixtureに投入。 **期待oracle**: 未指定のactual targetはproduct requirement ownerへ戻す。 missing/invalid/unknownをsuccessに丸めず、reasonとreturn ownerを観測。
- **`L10-BRAIN-INFRA-010-C03` — 未見境界** (`BRAIN-INFRA-010-AC-01,AC-02`): fixture: 未見restore conditionを加え、verification欠落/target source missingをrecoverability proof扱いしない。 **期待oracle**: source/conditionが十分な未見入力は同じcontractで評価し、根拠が不足する箇所だけunknown/未評価として保持する。C03は既存AC境界のfixtureで新しいgate/meaningを追加しない。
- **観測点**: backup/restore/recoverability relationとtarget provenance。parent revision、各field、scope、owner、返却state/sourceをfixture結果に残す。
- **判定**: C01は親正常例、C02は個別+組合せinvalid、C03はitem固有held-out boundaryを照合する。要求意味・責務・承認gateを増やさず、必要な技術候補値は根拠・比較・計測方法付きで提示する。未実行設計でありpassを主張しない。

## `HELIXBRAIN-L2-INFRA-011` — paired L10 oracle（`BRAIN-INFRA-011-FR-01`）

### 親revisionとauthority

- 親 `HELIXBRAIN-L2-INFRA-011`; PO decision [`helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L70), revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`, decision file SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。main633 adopted registration `MPR-RC-HELIXBRAIN-L2-INFRA-011-002` / semantic digest `sha256:b54444968964df01a18e94c416d2c99fa2ad84a969c5714fccacb65913cea8a5`。後続metadataから承認を継承しない。
- L2 `docs/helix-brain/L2-requirements/brain-requirements.md:322–331` (inclusive), file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `ca1ab62c895b7cea2e8f92d29609affb34f3fc0163697ea9d7f814d4a9f60855`。
- L11 `docs/helix-brain/L11-acceptance/brain-acceptance.md:51–51` (inclusive), file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `865b51ab2c0cc7d3914201937ed583bfe61a13e1f5330038615fc71835fe048b`。
- Version candidate `1.0`, sequence `Stage 2b`; release/implementation authorizationではない。
- Dependency: 親L1-004; 常時 BRAIN L2-004/INFRA-003。source/time-dependent price handling。 L10はL3 AC候補のsystem boundary behaviorを観測し、FRの意味を増やさない。
- **`L10-BRAIN-INFRA-011-C01` — 正常** (`BRAIN-INFRA-011-AC-01`): fixture: fixed/variable tendencyとidle/scaling/redundancy/storage/network/operations costsをcontext/effective source/time付きで比較。 **期待oracle**: 親L2/L11が定める正常意味に沿って返却し、各field/関係（price factsとabstract cost characteristicの区分）をcandidate stateに保持する。入力source/revision/scopeとownerを追跡でき、実resource operationは行わない。
- **`L10-BRAIN-INFRA-011-C02` — 否定/境界** (`BRAIN-INFRA-011-AC-02`): fixture: priceからprovider/time/source/contextを別々に削除し、不変のuniversal priceと表示するmutationを個別投入。 mutationを各々別fixtureと組合せfixtureに投入。 **期待oracle**: 価格source/context不明はunknownとして提供元へ戻す。 missing/invalid/unknownをsuccessに丸めず、reasonとreturn ownerを観測。
- **`L10-BRAIN-INFRA-011-C03` — 未見境界** (`BRAIN-INFRA-011-AC-01,AC-02`): fixture: 新しい時点/provider price sourceを伏せ、abstract cost relationとtime-bound price factを混同しない。 **期待oracle**: source/conditionが十分な未見入力は同じcontractで評価し、根拠が不足する箇所だけunknown/未評価として保持する。C03は既存AC境界のfixtureで新しいgate/meaningを追加しない。
- **観測点**: price factsとabstract cost characteristicの区分。parent revision、各field、scope、owner、返却state/sourceをfixture結果に残す。
- **判定**: C01は親正常例、C02は個別+組合せinvalid、C03はitem固有held-out boundaryを照合する。要求意味・責務・承認gateを増やさず、必要な技術候補値は根拠・比較・計測方法付きで提示する。未実行設計でありpassを主張しない。

## `HELIXBRAIN-L2-INFRA-012` — paired L10 oracle（`BRAIN-INFRA-012-FR-01`）

### 親revisionとauthority

- 親 `HELIXBRAIN-L2-INFRA-012`; PO decision [`helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L71), revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`, decision file SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。main633 adopted registration `MPR-RC-HELIXBRAIN-L2-INFRA-012-002` / semantic digest `sha256:3004b829636d79c4e4a50198df61e72d37839c99c3177bdf9b7daac0d1f91889`。後続metadataから承認を継承しない。
- L2 `docs/helix-brain/L2-requirements/brain-requirements.md:332–341` (inclusive), file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `6321d9a2fa5685f623d8256c8aa156f6061b284694bfbbe1047b0f7b074e9c51`。
- L11 `docs/helix-brain/L11-acceptance/brain-acceptance.md:52–52` (inclusive), file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `4b9c41a61d3d6b032bacec1a588fe17e14026957888fdbba196cb14d38a55b07`。
- Version candidate `1.0`, sequence `Stage 2b`; release/implementation authorizationではない。
- Dependency: 親L1-005/011; 常時 BRAIN L2-005/011/INFRA-002。抽象Patternとimplementation例を別identity軸にする。 L10はL3 AC候補のsystem boundary behaviorを観測し、FRの意味を増やさない。
- **`L10-BRAIN-INFRA-012-C01` — 正常** (`BRAIN-INFRA-012-AC-01`): fixture: Object Storage abstractionとS3/GCS/Azure Blob/MinIO implementation examplesを別identity・version・relation source付きで投入。 **期待oracle**: 親L2/L11が定める正常意味に沿って返却し、各field/関係（identity axes・compatibility status/source）をcandidate stateに保持する。入力source/revision/scopeとownerを追跡でき、実resource operationは行わない。
- **`L10-BRAIN-INFRA-012-C02` — 否定/境界** (`BRAIN-INFRA-012-AC-02`): fixture: implementation例をabstract identityへ統合、compatibility evidenceなし、unknown statusをcompatible=trueに置換する変異を個別/組合せ。 mutationを各々別fixtureと組合せfixtureに投入。 **期待oracle**: compatibility根拠は検証ownerへ戻す。 missing/invalid/unknownをsuccessに丸めず、reasonとreturn ownerを観測。
- **`L10-BRAIN-INFRA-012-C03` — 未見境界** (`BRAIN-INFRA-012-AC-01,AC-02`): fixture: 未見provider exampleのcompatibility evidenceなし状態を渡し、identityは抽象軸を維持し適合はunknown。 **期待oracle**: source/conditionが十分な未見入力は同じcontractで評価し、根拠が不足する箇所だけunknown/未評価として保持する。C03は既存AC境界のfixtureで新しいgate/meaningを追加しない。
- **観測点**: identity axes・compatibility status/source。parent revision、各field、scope、owner、返却state/sourceをfixture結果に残す。
- **判定**: C01は親正常例、C02は個別+組合せinvalid、C03はitem固有held-out boundaryを照合する。要求意味・責務・承認gateを増やさず、必要な技術候補値は根拠・比較・計測方法付きで提示する。未実行設計でありpassを主張しない。

## `HELIXBRAIN-L2-INFRA-013` — paired L10 oracle（`BRAIN-INFRA-013-FR-01`）

### 親revisionとauthority

- 親 `HELIXBRAIN-L2-INFRA-013`; PO decision [`helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L72), revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`, decision file SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。main633 adopted registration `MPR-RC-HELIXBRAIN-L2-INFRA-013-003` / semantic digest `sha256:c80cb45639d03361769fe42b75d0917d7c58c2e4478ea327c2ce06053720601d`。後続metadataから承認を継承しない。
- L2 `docs/helix-brain/L2-requirements/brain-requirements.md:342–351` (inclusive), file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `915285630ae5080ac424fe09f181239d97410b0e9c6442a75c15ad3c33e38173`。
- L11 `docs/helix-brain/L11-acceptance/brain-acceptance.md:53–53` (inclusive), file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `87dab47321ea76f2ddd63ac283d420d153a7923e2d9960a80a2843424b009fb9`。
- Version candidate `1.0`, sequence `Stage 2b`; release/implementation authorizationではない。
- Dependency: 親L1-001/002; 常時 BRAIN L2-001/002/INFRA-012/024。abstract resource/capability、live state/authorityなし。 L10はL3 AC候補のsystem boundary behaviorを観測し、FRの意味を増やさない。
- **`L10-BRAIN-INFRA-013-C01` — 正常** (`BRAIN-INFRA-013-AC-01`): fixture: Local/VPS/Dedicated/Cloud/GPU/Distributed workerを同じabstract Resource/Capability structureで表現するfixture。 **期待oracle**: 親L2/L11が定める正常意味に沿って返却し、各field/関係（concept identityとsecret/state/authority exclusion）をcandidate stateに保持する。入力source/revision/scopeとownerを追跡でき、実resource operationは行わない。
- **`L10-BRAIN-INFRA-013-C02` — 否定/境界** (`BRAIN-INFRA-013-AC-02`): fixture: resource typeを限定しcloud必須とする、credential/state/permissionをabstract knowledgeに混入するmutationを投入。 mutationを各々別fixtureと組合せfixtureに投入。 **期待oracle**: actual resource/authority requestはINFRASTRUCTURE/SECURITY/OS ownerへ戻す。 missing/invalid/unknownをsuccessに丸めず、reasonとreturn ownerを観測。
- **`L10-BRAIN-INFRA-013-C03` — 未見境界** (`BRAIN-INFRA-013-AC-01,AC-02`): fixture: 未見実行基盤型をabstract modelへ投入し、Cloud前提や実resource discoveryなしでcandidateに留める。 **期待oracle**: source/conditionが十分な未見入力は同じcontractで評価し、根拠が不足する箇所だけunknown/未評価として保持する。C03は既存AC境界のfixtureで新しいgate/meaningを追加しない。
- **観測点**: concept identityとsecret/state/authority exclusion。parent revision、各field、scope、owner、返却state/sourceをfixture結果に残す。
- **判定**: C01は親正常例、C02は個別+組合せinvalid、C03はitem固有held-out boundaryを照合する。要求意味・責務・承認gateを増やさず、必要な技術候補値は根拠・比較・計測方法付きで提示する。未実行設計でありpassを主張しない。

## `HELIXBRAIN-L2-INFRA-014` — paired L10 oracle（`BRAIN-INFRA-014-FR-01`）

### 親revisionとauthority

- 親 `HELIXBRAIN-L2-INFRA-014`; PO decision [`helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L73), revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`, decision file SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。main633 adopted registration `MPR-RC-HELIXBRAIN-L2-INFRA-014-003` / semantic digest `sha256:e3484392ff5b91fa1b8c697282d133a6425141c87a1d5cbe145c3d21ec172cbe`。後続metadataから承認を継承しない。
- L2 `docs/helix-brain/L2-requirements/brain-requirements.md:352–361` (inclusive), file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `adc8d9d3b668980f2912b120e3d13889419670ed190ac7f78589d8f692d14479`。
- L11 `docs/helix-brain/L11-acceptance/brain-acceptance.md:54–54` (inclusive), file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `6d45f4349873d7a7365ad23af8a0a7e24a99755f7ed8d9feb33c96248663d28e`。
- Version candidate `1.0`, sequence `Stage 2b`; release/implementation authorizationではない。
- Dependency: 親L1-005; 常時 BRAIN L2-005/INFRA-001/002。typed endpoint relation graph。 L10はL3 AC候補のsystem boundary behaviorを観測し、FRの意味を増やさない。
- **`L10-BRAIN-INFRA-014-C01` — 正常** (`BRAIN-INFRA-014-AC-01`): fixture: Web→LB→App→DB→BackupおよびApp→Queue→Workerのnodesと9 typed relation examplesをsource付きで構成。 **期待oracle**: 親L2/L11が定める正常意味に沿って返却し、各field/関係（endpoint/type/meaning/sourceとunknown state）をcandidate stateに保持する。入力source/revision/scopeとownerを追跡でき、実resource operationは行わない。
- **`L10-BRAIN-INFRA-014-C02` — 否定/境界** (`BRAIN-INFRA-014-AC-02`): fixture: 9 relationのendpoint/type/meaning/sourceを各々欠落、name-only edge、runtime topology claimを個別/組合せ。 mutationを各々別fixtureと組合せfixtureに投入。 **期待oracle**: 意味不明は候補で停止しBRAIN relation ownerへ戻す。 missing/invalid/unknownをsuccessに丸めず、reasonとreturn ownerを観測。
- **`L10-BRAIN-INFRA-014-C03` — 未見境界** (`BRAIN-INFRA-014-AC-01,AC-02`): fixture: 伏せた別component topologyとunknown endpoint relationを投入し、未確定endpointをruntimeで解決しない。 **期待oracle**: source/conditionが十分な未見入力は同じcontractで評価し、根拠が不足する箇所だけunknown/未評価として保持する。C03は既存AC境界のfixtureで新しいgate/meaningを追加しない。
- **観測点**: endpoint/type/meaning/sourceとunknown state。parent revision、各field、scope、owner、返却state/sourceをfixture結果に残す。
- **判定**: C01は親正常例、C02は個別+組合せinvalid、C03はitem固有held-out boundaryを照合する。要求意味・責務・承認gateを増やさず、必要な技術候補値は根拠・比較・計測方法付きで提示する。未実行設計でありpassを主張しない。

## `HELIXBRAIN-L2-INFRA-015` — paired L10 oracle（`BRAIN-INFRA-015-FR-01`）

### 親revisionとauthority

- 親 `HELIXBRAIN-L2-INFRA-015`; PO decision [`helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L74), revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`, decision file SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。main633 adopted registration `MPR-RC-HELIXBRAIN-L2-INFRA-015-002` / semantic digest `sha256:72fb876a117134621b30cba2884641d273bbd16351b2045bdf98abc2d5f75f49`。後続metadataから承認を継承しない。
- L2 `docs/helix-brain/L2-requirements/brain-requirements.md:362–371` (inclusive), file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `11b9eff2eaac4b17aace22ac405581b9ceb7dab34b260320f246992b28f600af`。
- L11 `docs/helix-brain/L11-acceptance/brain-acceptance.md:55–55` (inclusive), file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `58e16ddb2d0ad5943173c42620ce1efba738620f464f2131dd2df242f7b5232f`。
- Version candidate `1.0`, sequence `Stage 2b`; release/implementation authorizationではない。
- Dependency: 親L1-005; 常時 BRAIN L2-005と各Domain identity/source。cross-domain scope/evidence。 L10はL3 AC候補のsystem boundary behaviorを観測し、FRの意味を増やさない。
- **`L10-BRAIN-INFRA-015-C01` — 正常** (`BRAIN-INFRA-015-AC-01`): fixture: 固定L2に列挙した4 cross-domain scenarioのrelation scope/evidenceをsource付きで投入。 **期待oracle**: 親L2/L11が定める正常意味に沿って返却し、各field/関係（relation category/scope/sourceとcausal claim distinction）をcandidate stateに保持する。入力source/revision/scopeとownerを追跡でき、実resource operationは行わない。
- **`L10-BRAIN-INFRA-015-C02` — 否定/境界** (`BRAIN-INFRA-015-AC-02`): fixture: 4 scenarioのscope/evidenceを外す、correlationからcause/constraintを断定する変異を別々に投入。 mutationを各々別fixtureと組合せfixtureに投入。 **期待oracle**: causal evidence不足はunknownでsource ownerへ戻す。 missing/invalid/unknownをsuccessに丸めず、reasonとreturn ownerを観測。
- **`L10-BRAIN-INFRA-015-C03` — 未見境界** (`BRAIN-INFRA-015-AC-01,AC-02`): fixture: 未見Security/UX cross-domain claimで根拠不足を含め、may-affect以上を因果確定しない。 **期待oracle**: source/conditionが十分な未見入力は同じcontractで評価し、根拠が不足する箇所だけunknown/未評価として保持する。C03は既存AC境界のfixtureで新しいgate/meaningを追加しない。
- **観測点**: relation category/scope/sourceとcausal claim distinction。parent revision、各field、scope、owner、返却state/sourceをfixture結果に残す。
- **判定**: C01は親正常例、C02は個別+組合せinvalid、C03はitem固有held-out boundaryを照合する。要求意味・責務・承認gateを増やさず、必要な技術候補値は根拠・比較・計測方法付きで提示する。未実行設計でありpassを主張しない。

## `HELIXBRAIN-L2-INFRA-016` — paired L10 oracle（`BRAIN-INFRA-016-FR-01`）

### 親revisionとauthority

- 親 `HELIXBRAIN-L2-INFRA-016`; PO decision [`helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L75), revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`, decision file SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。main633 adopted registration `MPR-RC-HELIXBRAIN-L2-INFRA-016-003` / semantic digest `sha256:a9b3694a104e24453025ca1bbefc2bdb0683078c5653ad1489a5c9c810ed1c8b`。後続metadataから承認を継承しない。
- L2 `docs/helix-brain/L2-requirements/brain-requirements.md:372–381` (inclusive), file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `835303e5f143675783dbef7891d035b443472a05847cdaaecb199eb801c2b7c9`。
- L11 `docs/helix-brain/L11-acceptance/brain-acceptance.md:56–56` (inclusive), file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `54fc593f9197339f43229875d327cf4e78ca084c7b146f44c4c16157fd8a026f`。
- Version candidate `1.0`, sequence `Stage 2b`; release/implementation authorizationではない。
- Dependency: 親L1-010; 常時 BRAIN L2-010/INFRA-005/006/009。各列挙条件/兆候/代替。 L10はL3 AC候補のsystem boundary behaviorを観測し、FRの意味を増やさない。
- **`L10-BRAIN-INFRA-016-C01` — 正常** (`BRAIN-INFRA-016-AC-01`): fixture: 11 listed Anti-Patternそれぞれにcondition、manifestation、detection clue、safer alternative/sourceを添えて投入。 **期待oracle**: 親L2/L11が定める正常意味に沿って返却し、各field/関係（condition/impact/counterexample/alternative/source）をcandidate stateに保持する。入力source/revision/scopeとownerを追跡でき、実resource operationは行わない。
- **`L10-BRAIN-INFRA-016-C02` — 否定/境界** (`BRAIN-INFRA-016-AC-02`): fixture: 11 Anti-Patternのcondition/detection/alternativeを個別に外す、全環境universal banを要求。 mutationを各々別fixtureと組合せfixtureに投入。 **期待oracle**: 評価scope不明はLABO/該当要求ownerへ戻す。 missing/invalid/unknownをsuccessに丸めず、reasonとreturn ownerを観測。
- **`L10-BRAIN-INFRA-016-C03` — 未見境界** (`BRAIN-INFRA-016-AC-01,AC-02`): fixture: 別contextのheld-out conditionとcounterexampleを渡し、anti-patternを全scope banへしない。 **期待oracle**: source/conditionが十分な未見入力は同じcontractで評価し、根拠が不足する箇所だけunknown/未評価として保持する。C03は既存AC境界のfixtureで新しいgate/meaningを追加しない。
- **観測点**: condition/impact/counterexample/alternative/source。parent revision、各field、scope、owner、返却state/sourceをfixture結果に残す。
- **判定**: C01は親正常例、C02は個別+組合せinvalid、C03はitem固有held-out boundaryを照合する。要求意味・責務・承認gateを増やさず、必要な技術候補値は根拠・比較・計測方法付きで提示する。未実行設計でありpassを主張しない。

## `HELIXBRAIN-L2-INFRA-017` — paired L10 oracle（`BRAIN-INFRA-017-FR-01`）

### 親revisionとauthority

- 親 `HELIXBRAIN-L2-INFRA-017`; PO decision [`helix-brain-requirements-po-decision-2026-09-28.md`](../../governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md#L76), revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`, decision file SHA-256 `fe6f8aa065cbb7a305d7e93aee81b9d954eb97cb09da845cdd7e5c935d73745a`。main633 adopted registration `MPR-RC-HELIXBRAIN-L2-INFRA-017-002` / semantic digest `sha256:191b4c13d075cd3a9cfbd938bf5d0a961615936e30a9266a904dc633c28fa348`。後続metadataから承認を継承しない。
- L2 `docs/helix-brain/L2-requirements/brain-requirements.md:382–391` (inclusive), file SHA `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`, raw span SHA `d7e5a7a4d029db3bd92db437043b07c7dc4d6923c481a338815382e23c6f4795`。
- L11 `docs/helix-brain/L11-acceptance/brain-acceptance.md:57–57` (inclusive), file SHA `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`, raw span SHA `9209db4b4e0810bad881e9a714120abaae22beb29bc0490e259d281423133420`。
- Version candidate `1.0`, sequence `Stage 2b`; release/implementation authorizationではない。
- Dependency: 親L1-007/008; 常時 BRAIN L2-007/008/020/025。evidence/scope/versionとproject-use state分離。 L10はL3 AC候補のsystem boundary behaviorを観測し、FRの意味を増やさない。
- **`L10-BRAIN-INFRA-017-C01` — 正常** (`BRAIN-INFRA-017-AC-01`): fixture: 6 maturity stateを異なるevidence/scope/version付きで別々に与え、single internal successとproject-use recordを含める。 **期待oracle**: 親L2/L11が定める正常意味に沿って返却し、各field/関係（claim/evidence scope alignment・候補state）をcandidate stateに保持する。入力source/revision/scopeとownerを追跡でき、実resource operationは行わない。
- **`L10-BRAIN-INFRA-017-C02` — 否定/境界** (`BRAIN-INFRA-017-AC-02`): fixture: 6 stateを同一値化、single successだけでmature/universal、BRAIN versionをproject-used versionと置換するmutationを個別/組合せ。 mutationを各々別fixtureと組合せfixtureに投入。 **期待oracle**: 追加evidence/evaluationが必要な場合candidateを保ちLABO評価ownerへ戻す。 missing/invalid/unknownをsuccessに丸めず、reasonとreturn ownerを観測。
- **`L10-BRAIN-INFRA-017-C03` — 未見境界** (`BRAIN-INFRA-017-AC-01,AC-02`): fixture: held-out scope/versionのevidenceと単一内部成功を用い、claim範囲を超えるmaturityを付けない。 **期待oracle**: source/conditionが十分な未見入力は同じcontractで評価し、根拠が不足する箇所だけunknown/未評価として保持する。C03は既存AC境界のfixtureで新しいgate/meaningを追加しない。
- **観測点**: claim/evidence scope alignment・候補state。parent revision、各field、scope、owner、返却state/sourceをfixture結果に残す。
- **判定**: C01は親正常例、C02は個別+組合せinvalid、C03はitem固有held-out boundaryを照合する。要求意味・責務・承認gateを増やさず、必要な技術候補値は根拠・比較・計測方法付きで提示する。未実行設計でありpassを主張しない。
## 結果記録上の制約

実装前の静的な設計であり、fixture/期待出力の定義までを行う。実行、CI、旧test、旧runtimeによる合格主張は含まない。検証実装と実測は下流責務であり、ここでL4/L7を定義しない。
