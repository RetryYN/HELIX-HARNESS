# HELIX-BRAIN L10 機能総合検証 — Stage 1（007/008/028）

**状態：部分草稿・未承認・未実行。** 下記は`../L3-requirements/functional-requirements.md`のAC候補に対するsystem-level fixture/oracle設計であり、runtime実行結果・合格・実装許可を意味しない。対象は`HELIXBRAIN-L2-007/008/028`のみ。旧L10定義は `LEGACY-ASSET-34DF3B535879CC73FA86`（`archive/legacy-generation-2026-09-14/root/docs/process/forward/L08-L14-verification-phase.md:162-170,195-207`、SHA-256 `d7847b2e7c85673971cb01f8fc42c1325aeb331a0630ee53914a3162951dbd2a`）の要件挙動をsystem-levelで照合する意味を保持する。旧case ID・閾値・runtimeは移さず実行しない。

旧L3定義 `LEGACY-ASSET-F542125805B777D8A56A`（`archive/legacy-generation-2026-09-14/root/docs/process/forward/L00-L06-design-phase.md:148-168`、SHA-256 `9f8fc48a087fa9ba6e629518fb376630d7863491d2f85be96a8b3fd0c6d2efc3`）にあるFR/AC↔検証の関係を起点とする。fixed/candidate source pinと旧asset対照は対応する静的監査記録に収録する。

## HELIXBRAIN-L2-007 — L10 oracle（対応 `BRAIN-007-FR-01`）

- 親：PO固定 `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2 `docs/helix-brain/L2-requirements/brain-requirements.md:150-160` span SHA-256 `f96983fecc67fdb539d5ff143ed758a9c2ae799ae3f4fb6fa24bad2c381a6774`。対L11 `docs/helix-brain/L11-acceptance/brain-acceptance.md` full SHA-256 `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`.
- main633採択registration: `MPR-RC-HELIXBRAIN-L2-007-002` / semantic digest `sha256:9584e757b02bf75f698a055eedb9df6d72aa7bdc07e82808fd92d786861c24ee`。後続metadataから承認を継承しない。
- 対応AC: `BRAIN-007-AC-01`, `BRAIN-007-AC-02`。各caseはシステム全体の受渡しとowner境界を照合し、単体componentの成功だけでは対全体を満たさない。

### 検証fixtureとcase

- **L10-BRAIN-007-C01**（AC `BRAIN-007-AC-01`／`BRAIN-007-AC-02`に対応）：L1-007、L2-011/025およびLABO→BRAIN `HELIXBRAIN-L2-020`の参照revisionを記録した上で、必須source/provenance/evidence/scope等が揃いLABO対象revisionが一致する候補を投入し、各owner stateが分離されることを確認する。 **期待oracle**：候補はsource identity/revisionと全入力fieldを保持し、LABO評価・OS登録・BRAIN独立検証・採否を別stateとして返す。
- **L10-BRAIN-007-C02**（AC `BRAIN-007-AC-01`／`BRAIN-007-AC-02`に対応）：source identity、revision、provenance、evidence、adopted reason、evaluated scope、counterexample、limitationの欠落・stale・danglingをfieldごとに個別に与える。加えてLABO評価未実施なのに評価済みclaimを返す変異を個別に与える。 **期待oracle**：candidate stateを維持しpromotionを止める。根拠fieldの不足・staleは未採用候補へ戻してpromotionを停止し、LABO未評価はLABOの既存評価契約へ戻す。上流意味変更が必要な場合だけL1へ戻す。
- **L10-BRAIN-007-C03**（AC `BRAIN-007-AC-02`）：evaluated scope、counterexample、limitation、adopted reasonをそれぞれ個別に欠落させる。**期待oracle**：該当fieldを特定しaccepted/matureを拒否する。未採用候補へ戻してpromotionを停止し、上流意味変更が必要な場合だけ該当L1へ戻す。
- **L10-BRAIN-007-C04**（AC `BRAIN-007-AC-01`／`BRAIN-007-AC-02`に対応）：AI生成のみ、成功実績一件のみでaccepted/matureを要求し、昇格が起きないことを確認する。 **期待oracle**：accepted/matureへの遷移が起きず、AI生成または単一成功実績のみを根拠にできないことを返す。
- **L10-BRAIN-007-C05**（AC `BRAIN-007-AC-01`／`BRAIN-007-AC-02`に対応）：LABO評価対象revisionを候補revisionと不一致にする。 **期待oracle**：LABO結果を対象revision不一致として保留し、評価の修正・再提示を既存LABO評価契約へ返す。BRAIN candidate revisionと採否stateは変えない。
- **L10-BRAIN-007-C06**（AC `BRAIN-007-AC-01`／`BRAIN-007-AC-02`に対応）：BRAIN候補revisionが変わった後に古いevidenceを再利用する。 **期待oracle**：古いevidenceをstaleとして拒否し、現candidate revisionに対応するsource/evidence不足を示し、未採用候補へ戻してpromotionを停止する。
- **L10-BRAIN-007-C07**（AC `BRAIN-007-AC-02`）：LABO評価receiptのみ、OS登録receiptのみ、OS振分け状態のみ、BRAIN独立検証recordのみをそれぞれ独立した変異として採用扱いにする。**期待oracle**：各recordはそれぞれの状態として保持され、採否stateは未変更。LABO評価、OS登録・振分け、独立検証、採否の4状態を別々に観測する。採否の順序は依存先L2-025の条件で、本caseのoracleでは判定しない。
- **L10-BRAIN-007-C08**（AC `BRAIN-007-AC-01`に対応）：現行契約に適合し、source/evidence/scope、LABO対象revision、OS登録・振分け、独立検証および既存採否根拠がすでに揃ったrecordを与える。 **期待oracle**：採用済みrecordから全根拠・owner stateをsourceまで遡れ、accepted/matureの根拠を表示できる。新しい実績数・threshold・actor承認を要求しない。

- **L10-BRAIN-007-C09 — 未見正常（`BRAIN-007-AC-01`）**：既存fixtureにないPattern/Unit/Part候補の組合せを使うが、8由来field、LABO対象revision、必要なowner記録は全て固定契約どおり与える。**期待oracle**：C01と同じAC-01に従って候補または既存採用記録のsource-to-decision traceとLABO/OS/BRAIN各stateを照合する。新しい実績数、threshold、actor承認は要求しない。必須入力を満たせない場合は正常fixtureとして扱わず、該当AC-02のunknown/holdへ分類する。

### 観測点とoracle

候補/採用状態；source/provenance/evidence参照とrevision；scope/counterexample/limitationの有無；LABO評価対象revision；LABO/OS/BRAIN検証/採否の別状態；失敗理由と戻し先。

**判定**：正常caseは各AC候補が親のfield/state/boundaryを満たす証拠を示す。反例caseでは該当情報が拒否/unknown/保留となり、誤った成功・昇格・owner間writebackを起こさない。部分成功は部分として記録し、残作業を成功に丸めない。

**旧test-design oracleの限定**：HAT-HIL-07およびMLP L6/L5設計のraw/secret混入、self-promotion、stale/dangling/untrusted/evidence欠落を失敗類型の起点とする。旧case件数、閾値、role schemaは継承しない。旧case ID・閾値・role schema・runtimeを使わず、現行L2/L11へ合わせた検証設計とする。

## HELIXBRAIN-L2-008 — L10 oracle（対応 `BRAIN-008-FR-01`）

- 親：PO固定 `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2 `docs/helix-brain/L2-requirements/brain-requirements.md:161-171` span SHA-256 `8982f6583ed81151b3519a26ba2ae858566650fdbc2cca43cfda29632dce7f87`。対L11 `docs/helix-brain/L11-acceptance/brain-acceptance.md` full SHA-256 `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`.
- main633採択registration: `MPR-RC-HELIXBRAIN-L2-008-002` / semantic digest `sha256:90cc1f814eda48b0da887912b3a0862b94291e3264cd6c84225d14e19bc0900e`。後続metadataから承認を継承しない。
- 対応AC: `BRAIN-008-AC-01`, `BRAIN-008-AC-02`。各caseはシステム全体の受渡しとowner境界を照合し、単体componentの成功だけでは対全体を満たさない。

### 検証fixtureとcase

- **L10-BRAIN-008-C01**（AC `BRAIN-008-AC-01`／`BRAIN-008-AC-02`に対応）：L1-008、L2-028、CORE/OS接続L2-018/019/025の参照revisionを記録し、Product Coreがrevision Rを参照後、BRAINでRをsupersededとしてR2を追加、既存参照がRを保持するfixtureを置く。 **期待oracle**：既存Core参照はrevision Rのままで、BRAINのR=superseded/R2=current等のstateとOS usage recordが別々に読める。
- **L10-BRAIN-008-C02**（AC `BRAIN-008-AC-01`／`BRAIN-008-AC-02`に対応）：unknown identity/revision/state、競合するstate、実knowledge versionの欠落/不一致、Product Coreのexact revisionとOS usage recordを個別に変更するfixtureを使い、currentへの暗黙解決がないことを確認する。 **期待oracle**：identity/revision/state/versionのunknownまたは競合をunknown/停止として返し、currentへの暗黙置換を行わない。BRAIN lifecycle変更だけではOS usageを変えず、OS usage変更だけではBRAIN lifecycleを変えない。知識構造/version不明はBRAIN、project-use state不明はOSへ戻す。上流意味変更が必要ならL1-008へ戻す。
- **L10-BRAIN-008-C03**（AC `BRAIN-008-AC-01`／`BRAIN-008-AC-02`に対応）：version_targetをactual versionとして差し替え、解決されないことを確認する。 **期待oracle**：version_targetは目標印として扱われactual version不明を解消せず、候補利用を停止する。
- **L10-BRAIN-008-C04**（AC `BRAIN-008-AC-01`／`BRAIN-008-AC-02`に対応）：BRAIN ownerが知識stateを正当にR=currentからR=supersededへ更新する一方、既存OS project usage recordを同時に変えない。 **期待oracle**：BRAIN state更新を反映しつつ、OS usage historyは旧参照revisionを保持する。BRAINの正当な更新自体は拒否しない。
- **L10-BRAIN-008-C05**（AC `BRAIN-008-AC-01`／`BRAIN-008-AC-02`に対応）：OS ownerが利用中のexact revisionを保ったままproject usage recordを正当に更新する。 **期待oracle**：OS usage updateを反映しつつ、BRAIN lifecycle stateは不変。OSの正当なproject update自体は拒否しない。

- **L10-BRAIN-008-C06 — 未見正常（`BRAIN-008-AC-01`）**：既存fixtureにない組合せで、Product Coreのexact knowledge identity/revision参照、BRAINの列挙stateとOS project-use recordを同時に与える。全値は固定L2/L11が列挙した範囲から採る。**期待oracle**：C01と同じAC-01に従い、指定exact revision、BRAIN state、OS usageを別々に識別し、旧参照を黙って置換しない。列挙範囲外または値不明なら正常例と呼ばずAC-02の停止/owner戻しとして扱う。

- **L10-BRAIN-008-C07 — 5状態の個別識別**（`BRAIN-008-AC-01`）：current、superseded、deprecated、experimental、retiredを別々のfixtureに与える。**期待oracle**：各stateをそのまま識別し、Product Coreのexact参照とOS usageを別recordとして保持する。状態間の遷移順や利用可否規則を新設しない。
- **L10-BRAIN-008-C08 — 参照先の黙った置換**（`BRAIN-008-AC-02`）：exact revision Rをpinした参照にR2を返す。**期待oracle**：置換を拒否または検出し、R/R2不一致を示して候補利用を停止しBRAINへ戻す。Rの参照を黙ってR2へ更新しない。
- **L10-BRAIN-008-C09 — 同revision内容の書換え**（`BRAIN-008-AC-02`）：Rの事前内容を固定したfixtureで同じrevision Rの内容を書き換える。**期待oracle**：事前内容との差を拒否または検出し、候補利用を停止してBRAINへ戻す。比較用fixtureは製品digest方式を決めない。

### 観測点とoracle

Product Core参照identityとexact revision；BRAIN identity/revision/state/supersession relation；別recordとして保持されるOS usage；unknown/mismatch時の戻し先。

**判定**：正常caseは各AC候補が親のfield/state/boundaryを満たす証拠を示す。反例caseでは該当情報が拒否/unknown/保留となり、誤った成功・昇格・owner間writebackを起こさない。部分成功は部分として記録し、残作業を成功に丸めない。

**旧test-design oracleの限定**：旧distribution ST-DIST-001/007のversion/digest driftとSKAPP-FR-001/002のunknown/duplicate/conflicting identityを類例として使う。package/skill identity方式を移さない。旧case ID・閾値・role schema・runtimeを使わず、現行L2/L11へ合わせた検証設計とする。

## HELIXBRAIN-L2-028 — L10 oracle（対応 `BRAIN-028-FR-01`）

- 親：PO固定 `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2 `docs/helix-brain/L2-requirements/brain-requirements.md:494-503` span SHA-256 `0120989594637907eed4c8a63a2b17619187739e1dd34d916a1dc15cb80e72c1`。対L11 `docs/helix-brain/L11-acceptance/brain-acceptance.md` full SHA-256 `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`.
- main633採択registration: `MPR-RC-HELIXBRAIN-L2-028-002` / semantic digest `sha256:e3d58bda2215f1a5aeb846d7160f31d832c8e46866a8a53c5e8115664cd72df8`。後続metadataから承認を継承しない。
- 対応AC: `BRAIN-028-AC-01`, `BRAIN-028-AC-02`。各caseはシステム全体の受渡しとowner境界を照合し、単体componentの成功だけでは対全体を満たさない。

### 検証fixtureとcase

- **L10-BRAIN-028-C01**（AC `BRAIN-028-AC-01`／`BRAIN-028-AC-02`に対応）：L2-008、BRAIN-L2-028が指定するdescriptor、および採択HARNESS-L2-010/011のpack/call境界依存のrevisionを明示し、descriptorのkind、dependency identity/version、verification scopeを含む固定source上の全fieldとknowledge revisionが一致する正常case。試験fixture内でdescriptorにrangeを宣言し、required versionをそのrange内に置く。fixture値は試験入力であり、range構文や製品値の決定ではない。 **期待oracle**：全fieldが契約と一致しrequired versionが宣言range内の場合だけ、同じknowledge identity/revisionのapplicable応答を返す。
- **L10-BRAIN-028-C02**（AC `BRAIN-028-AC-01`／`BRAIN-028-AC-02`に対応）：descriptor/knowledge identityまたはrevisionがunknown、range外、必要field欠落のfixtureに加え、旧版への黙った置換と互換range不明時fallbackを個別に与える。 **期待oracle**：unknown/mismatch/range外をnot-applicableまたはunknownで返し、推定・最新置換・旧版fallbackを行わない。 knowledge identity/revision unknownはBRAIN（L2-008）、descriptor identity/revision unknownはHARNESS ownerへ戻し、停止理由と戻し先を別々に観測する。range欠落・解釈不能はunknown／未評価とし、not-applicableへ丸めない。
- **L10-BRAIN-028-C03**（AC `BRAIN-028-AC-01`／`BRAIN-028-AC-02`に対応）：descriptor kind、dependency identity、verification scope、contract/artifact/dependency version、knowledge version/stateをそれぞれ単独で欠落/不一致にし、range外・range欠落・range解釈不能も別々に与える。unknown identityはC02、version_targetの実版代用はC05、common lifecycleの再定義はC06で照合する。 **期待oracle**：descriptor kind、dependency identity/version、verification scope、contract/artifact/dependency versionまたはrangeの不一致はHARNESSへ返す。knowledge version/stateの不一致はBRAIN（L2-008）へ返す。各fieldの単独欠落・不一致で適用を止め、not-applicableまたはunknownを返して該当fieldを特定する。range外はnot-applicableまたはunknown、range欠落・解釈不能はunknown／未評価として適用を止める。relation endpointの判定・conflict解消はこの親のoracleへ加えない。
- **L10-BRAIN-028-C04**（AC `BRAIN-028-AC-02`）：required versionをrange外にする変異と、rangeを欠落・解釈不能にする変異を別々に与える。**期待oracle**：range外はnot-applicableまたはunknown、range欠落・解釈不能はunknown／未評価。適用を止め、該当range fieldとHARNESS ownerへの戻しを観測する。
- **L10-BRAIN-028-C05**（AC `BRAIN-028-AC-01`／`BRAIN-028-AC-02`に対応）：version_targetをactual contract/artifact/knowledge versionとして使用する。 **期待oracle**：version_targetによるactual version補完を拒み、未確定版をunknownのまま返す。
- **L10-BRAIN-028-C06**（AC `BRAIN-028-AC-02`）：BRAIN descriptorまたは知識recordが独自のexchange、update、rollback、unfinished-obligation定義を持つ変異を各々独立に与える。加えてcommon lifecycle操作をBRAINへ要求する。**期待oracle**：独自定義を受理せず、該当定義とHARNESS契約への戻し先を示す。common lifecycle操作・stateをBRAINで変更せずHARNESS ownerへ返す。
- **L10-BRAIN-028-C07 — 未見正常（`BRAIN-028-AC-01`）**：C01と異なるdescriptor/knowledge組合せを用いる。BRAIN-L2-028が列挙するdescriptor fieldと意味、採択HARNESS L2-010/011のpack/call境界依存revision、およびBRAIN exact knowledge tupleを満たすよう、fixture内でidentity/revisionを明示する。固定sourceに具体値がないfieldの値は宣言済み合成fixture値とし、製品値として採択しない。試験fixture内でrangeとrequired versionを明示し内側関係を与えるが、これらのfixture値は試験入力に限り製品値・構文・比較規則として採択しない。**期待oracle**：C01と同じAC-01に従い、そのexact knowledge identity/revisionに対するapplicable応答を返す。range field自体が欠落または読めない場合は正常fixtureと偽らずunknown/未評価に留める。新しいrange syntax/comparator/product valueは採択しない。

- **L10-BRAIN-028-C08 — version軸の取り違え**（`BRAIN-028-AC-02`）：descriptor identity、knowledge identity、contract、artifact、dependency、knowledge versionおよびknowledge revisionに互いに異なる合成値を与える。artifact version欄にknowledge revisionを置く変異、knowledge version欄にcontract versionを置く変異、descriptor各version間の入替え、descriptor identity欄へのknowledge identity代入、その逆の代入をそれぞれ独立に与える。**期待oracle**：誤受理せず、取り違えたfieldと期待軸を特定する。knowledge側はBRAIN（L2-008）、descriptor側はHARNESS ownerへ戻す。合成値は製品version値や構文を決めない。

### 観測点とoracle

fieldごとのdescriptor/knowledge tuple；参照HARNESS contract revisionと宣言range；applicable/not-applicable/unknown応答；戻し先HARNESS owner／BRAIN（L2-008）。

**判定**：正常caseは各AC候補が親のfield/state/boundaryを満たす証拠を示す。反例caseでは該当情報が拒否/unknown/保留となり、誤った成功・昇格・owner間writebackを起こさない。部分成功は部分として記録し、残作業を成功に丸めない。

**旧test-design oracleの限定**：ST-DIST-001/007とWCC-FR-01/05のversion/schema drift境界を類例として使う。旧packet/schemaやrange grammarは継承しない。旧case ID・閾値・role schema・runtimeを使わず、現行L2/L11へ合わせた検証設計とする。


## Stage 2b — HELIX-BRAIN INFRA L10 総合検証候補（001–017）

**状態：部分草稿・未承認・未実行。** CASEは対応ACを親ごとに照合し、独立review/POのL3承認や実測を生成しない。通常のL3承認を超えるsub-gateを作らない。

### `HELIXBRAIN-L2-INFRA-001` — BRAIN-INFRA-001-FR-01 / AC-01, AC-02

固定sourceはf6dad2a33e24f000b87d7f09b8d40288257e74cc、L2 lines 220–229、L11 line 41。各caseは独立fixtureで実施し、成功は実環境の成立を意味しない。

- **L10-BRAIN-INFRA-001-C01（正常／AC-01）**：20初期subdomainの全列挙と追加・分割・統合・退役可能性を全て含む宣言済み合成対象を与える。**期待oracle**：全必須要素を親の対象identityと対応付け、L2のscopeと責務を保持する。
- **L10-BRAIN-INFRA-001-C02（個別欠落／AC-02）**：必須field/relation/列挙要素を一度に一つだけmissingにしたfixtureを列挙集合の各要素について作る。**期待oracle**：当該要素とmissing reasonを特定し、成功/適用扱いにせず止める。C02の分母は `20初期subdomainと追加/分割/統合/退役の4操作` とする。
- **L10-BRAIN-INFRA-001-C03（親固有negative／AC-02）**：列挙集合を固定enum化、未列挙領域を拒否、またはprovider accountや実resource stateを分類identityへ混ぜる、Domainを実Runtime resource一覧として固定する。**期待oracle**：不成立reasonを特定し、分類の意味はHELIXBRAIN-L1-001、実resource stateはInfrastructure Runtime。
- **L10-BRAIN-INFRA-001-C04（unknown/stale/対象不一致／AC-02）**：固定L2が明示するidentity/condition/relationだけを対象に、unknown、矛盾、別対象を一項目ずつ変異する。L2がsource/evidenceを要求しない箇所へ新しいevidence義務を足さない。**期待oracle**：AC-02に従い不成立またはunknownと戻し先を示し、成功/適用扱いにしない。
- **L10-BRAIN-INFRA-001-C05（未見正常／AC-01）**：既存fixtureにないData Infrastructureをscopeとする分類案を用意し、固定親が許す追加候補として分類identity/意味変更案を明示する。**期待oracle**：追加候補は既存Subdomain集合を閉じず分類案として保持し、provider accountや実resource stateを分類identityへ混入しない。分類の意味変更はHELIXBRAIN-L1-001へ返す。

### `HELIXBRAIN-L2-INFRA-002` — BRAIN-INFRA-002-FR-01 / AC-01, AC-02

固定sourceはf6dad2a33e24f000b87d7f09b8d40288257e74cc、L2 lines 230–239、L11 line 42。各caseは独立fixtureで実施し、成功は実環境の成立を意味しない。

- **L10-BRAIN-INFRA-002-C01（正常／AC-01）**：Domain→Pattern→Design Unit→Part階層とActive/Passive・Blue-Green例の部品relationを全て含む宣言済み合成対象を与える。**期待oracle**：全必須要素を親の対象identityと対応付け、L2のscopeと責務を保持する。
- **L10-BRAIN-INFRA-002-C02（個別欠落／AC-02）**：必須field/relation/列挙要素を一度に一つだけmissingにしたfixtureを列挙集合の各要素について作る。**期待oracle**：当該要素とmissing reasonを特定し、成功/適用扱いにせず止める。C02の分母は `Domain 2、Pattern 2、Part 8と、固定2例に明記されたrelation endpoint` とする。
- **L10-BRAIN-INFRA-002-C03（親固有negative／AC-02）**：各階層、relation端点を独立に欠落させるほか、provider固有設定だけを一般Patternに見せる。**期待oracle**：不成立reasonを特定し、階層・一般性の判断はHELIXBRAIN-L1-002へ返し、provider固有設定はimplementation knowledge候補に分離する。新しいRuntime/implementation ownerを割り当てない。
- **L10-BRAIN-INFRA-002-C04（unknown/stale/対象不一致／AC-02）**：固定L2が明示するidentity/condition/relationだけを対象に、unknown、矛盾、別対象を一項目ずつ変異する。L2がsource/evidenceを要求しない箇所へ新しいevidence義務を足さない。**期待oracle**：AC-02に従い不成立またはunknownと戻し先を示し、成功/適用扱いにしない。
- **L10-BRAIN-INFRA-002-C05（未見正常／AC-01）**：未見のData Infrastructure→Queue-based Processing Pattern→Consumer Coordination→Acknowledgement Windowという合成階層を置き、各nodeのlevelとrelation endpointの型を宣言する。**期待oracle**：4階層と型付きrelationを保持し、provider固有設定は一般Patternと混同せずimplementation knowledge候補へ分離する。

### `HELIXBRAIN-L2-INFRA-003` — BRAIN-INFRA-003-FR-01 / AC-01, AC-02

固定sourceはf6dad2a33e24f000b87d7f09b8d40288257e74cc、L2 lines 240–249、L11 line 43。各caseは独立fixtureで実施し、成功は実環境の成立を意味しない。

- **L10-BRAIN-INFRA-003-C01（正常／AC-01）**：20個のL2 atomic descriptor fieldと18個のL11列挙group（trade-off/evidenceを別々に含む）を保持する。L2が求めていないfield別evidence義務や適用scopeは加えず、欠落fieldはunknownとする宣言済み合成対象を与える。**期待oracle**：全必須要素を親の対象identityと対応付け、L2のscopeと責務を保持する。
- **L10-BRAIN-INFRA-003-C02（個別欠落／AC-02）**：必須field/relation/列挙要素を一度に一つだけmissingにしたfixtureを列挙集合の各要素について作る。**期待oracle**：当該要素とmissing reasonを特定し、成功/適用扱いにせず止める。C02の分母はL2の20 atomic fieldとL11の18列挙groupへの対応。両集合を別分母として記録し、trade-offとevidenceは別々に検査する。
- **L10-BRAIN-INFRA-003-C03（親固有negative／AC-02）**：20 fieldそれぞれの欠落/stale/対象違いを単独変異し、一般性だけによる適用や未知値の成功丸めを試す。別fixtureでは根拠のないRTO/RPO数値をdescriptor条件として生成・確定する一変異を与える。**期待oracle**：各fixtureで不成立reasonを特定し、数値条件を適用・成功扱いにせず、要求値はProduct Core、評価不足はLABO、知識fieldの意味はHELIXBRAIN-L1-003へ戻す。
- **L10-BRAIN-INFRA-003-C04（unknown/stale/対象不一致／AC-02）**：固定L2が明示するidentity/condition/relationだけを対象に、unknown、矛盾、別対象を一項目ずつ変異する。L2がsource/evidenceを要求しない箇所へ新しいevidence義務を足さない。**期待oracle**：AC-02に従い不成立またはunknownと戻し先を示し、成功/適用扱いにしない。
- **L10-BRAIN-INFRA-003-C05（未見正常／AC-01）**：既存例と異なる合成Queue-based Patternに20 atomic fieldを全て与え、L11の18 groupでtrade-offとevidenceも別々に表現する。**期待oracle**：全fieldと対応groupを同じPattern identityに結び、未指定の製品値をunknownのままにする。

### `HELIXBRAIN-L2-INFRA-004` — BRAIN-INFRA-004-FR-01 / AC-01, AC-02

固定sourceはf6dad2a33e24f000b87d7f09b8d40288257e74cc、L2 lines 250–259、L11 line 44。各caseは独立fixtureで実施し、成功は実環境の成立を意味しない。

- **L10-BRAIN-INFRA-004-C01（正常／AC-01）**：10種の要求特性→関連Pattern→必要Design Input relationを全て含む宣言済み合成対象を与える。**期待oracle**：全必須要素を親の対象identityと対応付け、L2のscopeと責務を保持する。
- **L10-BRAIN-INFRA-004-C02（個別欠落／AC-02）**：必須field/relation/列挙要素を一度に一つだけmissingにしたfixtureを列挙集合の各要素について作る。**期待oracle**：当該要素とmissing reasonを特定し、成功/適用扱いにせず止める。C02の分母は `列挙10特性と各Pattern/Inputのrelation` とする。
- **L10-BRAIN-INFRA-004-C03（親固有negative／AC-02）**：各relation/inputの欠落、unknown値の確定、BRAINによる閾値/RTO/RPO生成。**期待oracle**：不成立reasonを特定し、要求値と設計義務はHARNESS／製品COREへ戻す。
- **L10-BRAIN-INFRA-004-C04（unknown/stale/対象不一致／AC-02）**：固定L2が明示するidentity/condition/relationだけを対象に、unknown、矛盾、別対象を一項目ずつ変異する。L2がsource/evidenceを要求しない箇所へ新しいevidence義務を足さない。**期待oracle**：AC-02に従い不成立またはunknownと戻し先を示し、成功/適用扱いにしない。
- **L10-BRAIN-INFRA-004-C05（未見正常／AC-01）**：列挙外のPortability characteristicからPattern、required design inputへの合成relationを用意し、要求値だけをunknownと宣言する。**期待oracle**：relation経路は保持し、値を創作せずHARNESS／製品COREの要求・設計義務へ戻す。

### `HELIXBRAIN-L2-INFRA-005` — BRAIN-INFRA-005-FR-01 / AC-01, AC-02

固定sourceはf6dad2a33e24f000b87d7f09b8d40288257e74cc、L2 lines 260–269、L11 line 45。各caseは独立fixtureで実施し、成功は実環境の成立を意味しない。

- **L10-BRAIN-INFRA-005-C01（正常／AC-01）**：13 failure例の各々についてexpected failure/detection/impact/containment/recovery/residual riskを持ち、対応する正常構成のPattern/Design Unitと同一knowledge identity・階層・relationから辿れる宣言済み合成対象を与える。**期待oracle**：failureと正常構成の関係を同じ知識モデルで保持する。
- **L10-BRAIN-INFRA-005-C02（個別欠落／AC-02）**：必須field/relation/列挙要素を一度に一つだけmissingにしたfixtureを列挙集合の各要素について作る。**期待oracle**：当該要素とmissing reasonを特定し、成功/適用扱いにせず止める。C02の分母は `列挙13 failure例 × 6観点 = 78対応cell` とする。
- **L10-BRAIN-INFRA-005-C03（親固有negative／AC-02）**：13例/6観点の個別欠落、およびfailureを別型/annotationだけにして正常構成から辿れない変異を各独立fixtureで試す。設計候補の存在を実incident証拠へ置換しない。**期待oracle**：不成立reasonを特定し、実incident/dataはLABO/Runtime、一般化範囲はHELIXBRAIN-L1-010。
- **L10-BRAIN-INFRA-005-C04（unknown/stale/対象不一致／AC-02）**：固定L2が明示するidentity/condition/relationだけを対象に、unknown、矛盾、別対象を一項目ずつ変異する。L2がsource/evidenceを要求しない箇所へ新しいevidence義務を足さない。**期待oracle**：AC-02に従い不成立またはunknownと戻し先を示し、成功/適用扱いにしない。
- **L10-BRAIN-INFRA-005-C05（未見正常／AC-01）**：列挙外のControl-plane partition failure候補にexpected failure/detection/impact/containment/recovery/residual riskを全て合成入力する。**期待oracle**：設計知識と根拠relationとして保持し、実incident測定の証拠へ置き換えない。

### `HELIXBRAIN-L2-INFRA-006` — BRAIN-INFRA-006-FR-01 / AC-01, AC-02

固定sourceはf6dad2a33e24f000b87d7f09b8d40288257e74cc、L2 lines 270–281、L11 line 46。各caseは独立fixtureで実施し、成功は実環境の成立を意味しない。

- **L10-BRAIN-INFRA-006-C01（正常／AC-01）**：INFRA-010知識を登録しない/unknownとし、10 Recovery Pattern候補の予防/復旧区分とINFRA-010への未解決relationを含む合成対象を与える。**期待oracle**：006の知識を成立させ、010への参照をunknownで保持し、どちらも他方の完成待ちにしない。
- **L10-BRAIN-INFRA-006-C02（個別欠落／AC-02）**：必須field/relation/列挙要素を一度に一つだけmissingにしたfixtureを列挙集合の各要素について作る。**期待oracle**：当該要素とmissing reasonを特定し、成功/適用扱いにせず止める。C02の分母は `10 recovery候補と各候補の予防/復旧区分` とする。
- **L10-BRAIN-INFRA-006-C03（親固有negative／AC-02）**：各Pattern名/復旧条件の欠落、予防だけのrecoverability結論、未実行を実行成功扱い。**期待oracle**：不成立reasonを特定し、実行/rollbackはProductまたはRuntime owner、意味はHELIXBRAIN-L1-010。
- **L10-BRAIN-INFRA-006-C04（unknown/stale/対象不一致／AC-02）**：固定L2が明示するidentity/condition/relationだけを対象に、unknown、矛盾、別対象を一項目ずつ変異する。L2がsource/evidenceを要求しない箇所へ新しいevidence義務を足さない。**期待oracle**：AC-02に従い不成立またはunknownと戻し先を示し、成功/適用扱いにしない。
- **L10-BRAIN-INFRA-006-C05（未見正常／AC-01）**：C01とは異なる合成fixtureで列挙外のCross-region Restore Rehearsal候補で予防策と復旧時の役割を別fieldに置き、実行結果は未観測とする。**期待oracle**：候補知識を保持し、実行・rollback成功を推定しない。
- **L10-BRAIN-INFRA-006-C06（親固有pair／AC-01/02）**：通常fixtureでは10候補を維持しINFRA-010 relationをunknownとして与える。**AC-01期待oracle**：006候補を独立に保持し、unknown relationのまま評価する。独立した一変異fixtureでは006成立に010完成を要求する。**AC-02期待oracle**：その追加gateを不成立として検出し、006候補を010完成待ちにせずrelation unknownを保つ。

### `HELIXBRAIN-L2-INFRA-007` — BRAIN-INFRA-007-FR-01 / AC-01, AC-02

固定sourceはf6dad2a33e24f000b87d7f09b8d40288257e74cc、L2 lines 282–291、L11 line 47。各caseは独立fixtureで実施し、成功は実環境の成立を意味しない。

- **L10-BRAIN-INFRA-007-C01（正常／AC-01）**：6 deployment方式をblast radius/rollback/duplication/availability/migration/observabilityで比較を全て含む宣言済み合成対象を与える。**期待oracle**：全必須要素を親の対象identityと対応付け、L2のscopeと責務を保持する。
- **L10-BRAIN-INFRA-007-C02（個別欠落／AC-02）**：必須field/relation/列挙要素を一度に一つだけmissingにしたfixtureを列挙集合の各要素について作る。**期待oracle**：当該要素とmissing reasonを特定し、成功/適用扱いにせず止める。C02の分母は `6方式 × 6比較軸 = 36対応cell` とする。
- **L10-BRAIN-INFRA-007-C03（親固有negative／AC-02）**：方式・比較軸欠落、migration条件推測、release/deployment実行を一変数で試す。段階前進またはrelease状態遷移は別fixtureで検証する。**期待oracle**：不成立reasonを特定し、release semanticsはProduct Core/HARNESS、実進行はOS/Runtime。
- **L10-BRAIN-INFRA-007-C04（unknown/stale/対象不一致／AC-02）**：固定L2が明示するidentity/condition/relationだけを対象に、unknown、矛盾、別対象を一項目ずつ変異する。L2がsource/evidenceを要求しない箇所へ新しいevidence義務を足さない。**期待oracle**：AC-02に従い不成立またはunknownと戻し先を示し、成功/適用扱いにしない。
- **L10-BRAIN-INFRA-007-C05（未見正常／AC-01）**：固定6方式のStaged RolloutをC01と異なる合成fixture・6比較軸で与える。**期待oracle**：比較可能な設計知識を保持する。これは実行/進行negativeを検査するcaseではない。
- **L10-BRAIN-INFRA-007-C06（親固有negative／AC-02）**：他条件を固定し、設計知識の出力後にrelease段階を前進またはrelease stateを遷移させる変異だけを与える。**期待oracle**：release/deploymentは進行せず、Product Core/HARNESSはsemantics、実進行の戻し先はOS/Runtimeと特定する。確認 `BRAIN-INFRA-007-AC-02`。

### `HELIXBRAIN-L2-INFRA-008` — BRAIN-INFRA-008-FR-01 / AC-01, AC-02

固定sourceはf6dad2a33e24f000b87d7f09b8d40288257e74cc、L2 lines 292–301、L11 line 48。各caseは独立fixtureで実施し、成功は実環境の成立を意味しない。

- **L10-BRAIN-INFRA-008-C01（正常／AC-01）**：8 scaling/capacity候補（Vertical Scaling、Horizontal Scaling、Queue-based Load Leveling、Sharding、Read Replica、Cache、Worker Pool、Backpressure）それぞれをtrigger/bottleneck/limit/statefulness/synchronization cost/saturation behaviorの6軸で記述を全て含む宣言済み合成対象を与える。**期待oracle**：全必須要素を親の対象identityと対応付け、L2のscopeと責務を保持する。
- **L10-BRAIN-INFRA-008-C02（個別欠落／AC-02）**：必須field/relation/列挙要素を一度に一つだけmissingにしたfixtureを列挙集合の各要素について作る。**期待oracle**：当該要素とmissing reasonを特定し、成功/適用扱いにせず止める。C02の分母は `8方式 × 6 descriptor軸 = 48対応cell` とする。
- **L10-BRAIN-INFRA-008-C03（親固有negative／AC-02）**：候補/field欠落、根拠のない特定規模値の創作、unknown workloadを適用許可へ変換する変異、既知workloadで自動scaling実行能力をBRAIN知識へ加える変異、unknown workloadで同能力を加える変異、根拠のない負荷閾値創作をそれぞれ別fixtureで試す。**期待oracle**：各fixtureを不成立とし、workload値・規模・SLOは製品要求、構造評価はLABOへ戻す。
- **L10-BRAIN-INFRA-008-C04（unknown/stale/対象不一致／AC-02）**：固定L2が明示するidentity/condition/relationだけを対象に、unknown、矛盾、別対象を一項目ずつ変異する。L2がsource/evidenceを要求しない箇所へ新しいevidence義務を足さない。**期待oracle**：AC-02に従い不成立またはunknownと戻し先を示し、成功/適用扱いにしない。
- **L10-BRAIN-INFRA-008-C05（未見正常／AC-01）**：固定8候補の一つであるWorker Poolについて、C01と異なる合成fixtureに6軸を記載し、workload量はunknownとする。**期待oracle**：未指定workloadをunknownとして保持し、適用可能へ丸めず、自動scaling能力や閾値を作らない。欠けたworkloadをmissing/unknownとして示し、固定L2の要求値戻し先を示す。

### `HELIXBRAIN-L2-INFRA-009` — BRAIN-INFRA-009-FR-01 / AC-01, AC-02

固定sourceはf6dad2a33e24f000b87d7f09b8d40288257e74cc、L2 lines 302–311、L11 line 49。各caseは独立fixtureで実施し、成功は実環境の成立を意味しない。

- **L10-BRAIN-INFRA-009-C01（正常／AC-01）**：11設計観測点と関連Pattern/failureの関係を全て含み、実telemetryはBRAIN外に置く宣言済み合成対象を与える。**期待oracle**：全必須要素を親の対象identityと対応付け、L2のscopeと責務を保持する。
- **L10-BRAIN-INFRA-009-C02（個別欠落／AC-02）**：必須field/relation/列挙要素を一度に一つだけmissingにしたfixtureを列挙集合の各要素について作る。**期待oracle**：当該要素とmissing reasonを特定し、成功/適用扱いにせず止める。C02の分母は `11観測点とPattern/failure relation` とする。
- **L10-BRAIN-INFRA-009-C03（親固有negative／AC-02）**：各観測定義の欠落、raw telemetryの知識化、missing/stale/collector停止をhealthyへ写像。**期待oracle**：不成立reasonを特定し、runtime evidenceはInfrastructure Runtime/LABO、設計観測定義はHELIXBRAIN-L1-003。
- **L10-BRAIN-INFRA-009-C04（unknown/stale/対象不一致／AC-02）**：固定L2が明示するidentity/condition/relationだけを対象に、unknown、矛盾、別対象を一項目ずつ変異する。L2がsource/evidenceを要求しない箇所へ新しいevidence義務を足さない。**期待oracle**：AC-02に従い不成立またはunknownと戻し先を示し、成功/適用扱いにしない。
- **L10-BRAIN-INFRA-009-C05（未見正常／AC-01）**：列挙外のpost-restore consistency checkpoint観測点を合成し、対応するPattern/failureと意味だけを定義、実telemetry値は渡さない。**期待oracle**：設計観測点としてrelation保持し、実データはBRAINへ保存せず未観測をhealthyにしない。

### `HELIXBRAIN-L2-INFRA-010` — BRAIN-INFRA-010-FR-01 / AC-01, AC-02

固定sourceはf6dad2a33e24f000b87d7f09b8d40288257e74cc、L2 lines 312–321、L11 line 50。各caseは独立fixtureで実施し、成功は実環境の成立を意味しない。

- **L10-BRAIN-INFRA-010-C01（正常／AC-01）**：backup-only、restore verificationあり、required recovery conditions充足の3状態を別々に示し、3条件全てが揃う場合だけRecoverability Evidence Candidateとする合成fixtureを与える。**期待oracle**：Candidateは復旧可能の確定でないと識別する。
- **L10-BRAIN-INFRA-010-C02（個別欠落／AC-02）**：必須field/relation/列挙要素を一度に一つだけmissingにしたfixtureを列挙集合の各要素について作る。**期待oracle**：当該要素とmissing reasonを特定し、成功/適用扱いにせず止める。C02の分母は `strategy/retention/replication/restore/recovery validation + backup-only/restore-verified/required-conditions states` とする。
- **L10-BRAIN-INFRA-010-C03（親固有negative／AC-02）**：backupのみ、restore verificationありだがrequired recovery conditionsを欠く状態、recovery conditionsを満たすがrestore verificationを欠く状態を独立fixtureで与える。別の独立fixtureでは、根拠のない一律RTO/RPO値をBRAINが生成・確定する変異を与える。**期待oracle**：3条件が揃わないfixtureではCandidateを成立扱いしない。RTO/RPO創作fixtureでは創作値を製品値またはCandidate根拠として受理せず不成立とする。実backup/restore実行と値は製品/Runtime、知識構造はHELIXBRAIN-L1-003/010へ戻す。
- **L10-BRAIN-INFRA-010-C04（unknown/stale/対象不一致／AC-02）**：固定L2が明示するidentity/condition/relationだけを対象に、unknown、矛盾、別対象を一項目ずつ変異する。L2がsource/evidenceを要求しない箇所へ新しいevidence義務を足さない。**期待oracle**：AC-02に従い不成立またはunknownと戻し先を示し、成功/適用扱いにしない。
- **L10-BRAIN-INFRA-010-C05（未見正常／AC-01）**：未見のreplication/restore/recovery validation構造を合成し、製品RTO/RPO値は未指定にする。**期待oracle**：各知識要素のrelationを保ち、backupだけでrecoverabilityを結論せず製品値を創作しない。

### `HELIXBRAIN-L2-INFRA-011` — BRAIN-INFRA-011-FR-01 / AC-01, AC-02

固定sourceはf6dad2a33e24f000b87d7f09b8d40288257e74cc、L2 lines 322–331、L11 line 51。各caseは独立fixtureで実施し、成功は実環境の成立を意味しない。

- **L10-BRAIN-INFRA-011-C01（正常／AC-01）**：7 cost characteristic group/8 atomic characteristicを区別した宣言済み合成対象（構造costのみでよく価格値は任意）を与える。**期待oracle**：全必須要素を親の対象identityと対応付け、L2のscopeと責務を保持する。
- **L10-BRAIN-INFRA-011-C02（個別欠落／AC-02）**：必須field/relation/列挙要素を一度に一つだけmissingにしたfixtureを列挙集合の各要素について作る。**期待oracle**：当該要素とmissing reasonを特定し、成功/適用扱いにせず止める。C02では8 atomic characteristicと7 group対応を別々に1変数ずつ欠落させる。価格を含める任意枝ではprovider/time/sourceを個別に欠落・不一致へ変える。scope欠落だけではrejectしない。構造costのみの正常fixtureに価格sourceを要求しない。
- **L10-BRAIN-INFRA-011-C03（親固有negative／AC-02）**：軸欠落、時点・出典がある価格を恒久characteristic/定数として保存・再提示する変異、source/timeなし価格の現行化、構造cost特性から価格/予算への変換を個別に試す。**期待oracle**：不成立reasonを特定し、価格/予算はProduct Core/OS、一般化costはLABO。
- **L10-BRAIN-INFRA-011-C04（unknown/stale/対象不一致／AC-02）**：固定L2が明示するidentity/condition/relationだけを対象に、unknown、矛盾、別対象を一項目ずつ変異する。L2がsource/evidenceを要求しない箇所へ新しいevidence義務を足さない。**期待oracle**：AC-02に従い不成立またはunknownと戻し先を示し、成功/適用扱いにしない。
- **L10-BRAIN-INFRA-011-C05（未見正常／AC-01）**：未見のPattern pairにfixed/variable cost tendency、idle resource、scaling、redundancy、storage、network、operational costの7 groupを記述し、fixed/variableは別のatomic characteristicとして保つ。具体価格は含めない。**期待oracle**：8 atomic characteristicを7 groupに対応させて構造cost比較を成立扱いにし、価格evidenceなしから具体価格・予算を生成しない。

### `HELIXBRAIN-L2-INFRA-012` — BRAIN-INFRA-012-FR-01 / AC-01, AC-02

固定sourceはf6dad2a33e24f000b87d7f09b8d40288257e74cc、L2 lines 332–341、L11 line 52。各caseは独立fixtureで実施し、成功は実環境の成立を意味しない。

- **L10-BRAIN-INFRA-012-C01（正常／AC-01）**：Object Storage等の抽象PatternとS3/GCS/Azure Blob/MinIO等の実装identityおよびimplements/compatible_with/constraint_of関係を全て含む宣言済み合成対象を与える。**期待oracle**：全必須要素を親の対象identityと対応付け、L2のscopeと責務を保持する。
- **L10-BRAIN-INFRA-012-C02（個別欠落／AC-02）**：必須field/relation/列挙要素を一度に一つだけmissingにしたfixtureを列挙集合の各要素について作る。**期待oracle**：当該要素とmissing reasonを特定し、成功/適用扱いにせず止める。C02の分母は `1 abstract identity + 4 implementation example identity + 明示relation` とする。
- **L10-BRAIN-INFRA-012-C03（親固有negative／AC-02）**：identity統合、provider固定、provider固有factの根拠欠落、fact版欠落、relation欠落を一変数ずつ独立fixtureで試す。**期待oracle**：不成立reasonを特定し、互換条件のownerまたは該当Patternへ戻す。未確認compatibilityはunknown。
- **L10-BRAIN-INFRA-012-C04（unknown/stale/対象不一致／AC-02）**：固定L2が明示するidentity/condition/relationだけを対象に、unknown、矛盾、別対象を一項目ずつ変異する。L2がsource/evidenceを要求しない箇所へ新しいevidence義務を足さない。**期待oracle**：AC-02に従い不成立またはunknownと戻し先を示し、成功/適用扱いにしない。
- **L10-BRAIN-INFRA-012-C05（未見正常／AC-01）**：固定4実装例に含まれないfixture-only implementation identityを使い、Object Storage抽象identityと明示relationを保つ。provider固有fact/compatibilityは未評価としてunknownで表現する。**期待oracle**：列挙外identityを抽象Patternへ結び、compatibilityを確定せずunknownのまま記録できる。固定L2の4例分母を増やさず、新provider承認gateを作らない。
- **L10-BRAIN-INFRA-012-C06（正常／AC-01）**：S3 implementationからGCS implementationへproviderだけを入替え、Object Storage抽象identityとimplements/compatible_with/constraint_ofの方向・relation意味を保つ独立fixtureを与える。**期待oracle**：抽象identityとrelation意味は不変で、未評価のcompatibilityだけunknown。

### `HELIXBRAIN-L2-INFRA-013` — BRAIN-INFRA-013-FR-01 / AC-01, AC-02

固定sourceはf6dad2a33e24f000b87d7f09b8d40288257e74cc、L2 lines 342–351、L11 line 53。各caseは独立fixtureで実施し、成功は実環境の成立を意味しない。

- **L10-BRAIN-INFRA-013-C01（正常／AC-01）**：Local/VPS/Dedicated/Cloud/GPU/Distributed workerのprovider非依存resource/capability表現を全て含む宣言済み合成対象を与える。**期待oracle**：全必須要素を親の対象identityと対応付け、L2のscopeと責務を保持する。
- **L10-BRAIN-INFRA-013-C02（個別欠落／AC-02）**：必須field/relation/列挙要素を一度に一つだけmissingにしたfixtureを列挙集合の各要素について作る。**期待oracle**：当該要素とmissing reasonを特定し、成功/適用扱いにせず止める。C02の分母は `6 resource classと抽象capability relation` とする。
- **L10-BRAIN-INFRA-013-C03（親固有negative／AC-02）**：cloud-only前提、特定providerの必須化、特定計算機構成の必須化、knowledge identityとruntime stateの混同、credential/actionを知識化を各独立fixtureで試す。**期待oracle**：不成立reasonを特定し、実stateはInfrastructure Runtime、securityはSECURITY。
- **L10-BRAIN-INFRA-013-C04（unknown/stale/対象不一致／AC-02）**：固定L2が明示するidentity/condition/relationだけを対象に、unknown、矛盾、別対象を一項目ずつ変異する。L2がsource/evidenceを要求しない箇所へ新しいevidence義務を足さない。**期待oracle**：AC-02に従い不成立またはunknownと戻し先を示し、成功/適用扱いにしない。
- **L10-BRAIN-INFRA-013-C05（未見正常／AC-01）**：列挙外のedge device resource classをprovider非依存resource/capability modelに置き、実環境値は与えない。**期待oracle**：抽象resourceとして識別し、cloud/providerを必須化せず実状態・credential・操作権限を推定しない。

### `HELIXBRAIN-L2-INFRA-014` — BRAIN-INFRA-014-FR-01 / AC-01, AC-02

固定sourceはf6dad2a33e24f000b87d7f09b8d40288257e74cc、L2 lines 352–361、L11 line 54。各caseは独立fixtureで実施し、成功は実環境の成立を意味しない。

- **L10-BRAIN-INFRA-014-C01（正常／AC-01）**：固定2例（Web→Load Balancer→Application→Database→Backup、およびApplication→Queue→Worker）と各relation type/両endpoint/意味を与え、別の未定edgeはunknownとして明示する。**期待oracle**：固定例と未定edgeの両方を保持する。
- **L10-BRAIN-INFRA-014-C02（個別欠落／AC-02）**：必須field/relation/列挙要素を一度に一つだけmissingにしたfixtureを列挙集合の各要素について作る。**期待oracle**：当該要素とmissing reasonを特定し、成功/適用扱いにせず止める。C02の分母は `2 fixed topology examples + 9 relation types × endpoints/meaning` とする。
- **L10-BRAIN-INFRA-014-C03（親固有negative／AC-02）**：各relation type/端点/meaningの単独欠落、component listだけで成立、実状態の推定。**期待oracle**：不成立reasonを特定し、actual topologyはRuntime、relation意味はHELIXBRAIN-L1-005。
- **L10-BRAIN-INFRA-014-C04（unknown/stale/対象不一致／AC-02）**：固定L2が明示するidentity/condition/relationだけを対象に、unknown、矛盾、別対象、未定edgeを確定edgeへ変える変異を一項目ずつ独立に行う。L2がsource/evidenceを要求しない箇所へ新しいevidence義務を足さない。**期待oracle**：AC-02に従い不成立またはunknownと戻し先を示し、成功/適用扱いにしない。
- **L10-BRAIN-INFRA-014-C05（未見正常／AC-01）**：列挙外のAPI Gateway→Function→Object Store topologyをrelation endpoint/meaningつきで構成する。**期待oracle**：明示relationを保持し、未宣言の実topologyを補完しない。

### `HELIXBRAIN-L2-INFRA-015` — BRAIN-INFRA-015-FR-01 / AC-01, AC-02

固定sourceはf6dad2a33e24f000b87d7f09b8d40288257e74cc、L2 lines 362–371、L11 line 55。各caseは独立fixtureで実施し、成功は実環境の成立を意味しない。

- **L10-BRAIN-INFRA-015-C01（正常／AC-01）**：InfrastructureとAPI/Data/Security/Visual-UX等のaffects/constrains/may affect方向・根拠・不確かさを全て含む宣言済み合成対象を与える。**期待oracle**：全必須要素を親の対象identityと対応付け、L2のscopeと責務を保持する。
- **L10-BRAIN-INFRA-015-C02（個別欠落／AC-02）**：必須field/relation/列挙要素を一度に一つだけmissingにしたfixtureを列挙集合の各要素について作る。**期待oracle**：当該要素とmissing reasonを特定し、成功/適用扱いにせず止める。C02の分母は `固定例のDomain pair × direction/evidence/uncertainty` とする。
- **L10-BRAIN-INFRA-015-C03（親固有negative／AC-02）**：affects/constrains/causesを根拠なく確定する、may affectを確定causesへ強める変異を別々に試す。may affectの根拠がない場合は可能性とunknownを保持できる。endpoint/方向の欠落、他Domain ownerの判断代行も個別fixtureとする。**期待oracle**：不成立reasonを特定し、関係先Domain ownerへ返す。因果確定は根拠が別途ない限り行わない。
- **L10-BRAIN-INFRA-015-C04（unknown/stale/対象不一致／AC-02）**：固定L2が明示するidentity/condition/relationだけを対象に、unknown、矛盾、別対象を一項目ずつ変異する。L2がsource/evidenceを要求しない箇所へ新しいevidence義務を足さない。**期待oracle**：AC-02に従い不成立またはunknownと戻し先を示し、成功/適用扱いにしない。
- **L10-BRAIN-INFRA-015-C05（未見正常／AC-01）**：列挙外のData→Observability may affect relationを新規fixtureで与え、方向を示し根拠はunknownと宣言する。**期待oracle**：可能性として保持し、確定causesへ強めず関係先Domain ownerを識別する。

### `HELIXBRAIN-L2-INFRA-016` — BRAIN-INFRA-016-FR-01 / AC-01, AC-02

固定sourceはf6dad2a33e24f000b87d7f09b8d40288257e74cc、L2 lines 372–381、L11 line 56。各caseは独立fixtureで実施し、成功は実環境の成立を意味しない。

- **L10-BRAIN-INFRA-016-C01（正常／AC-01）**：11 anti-patternごとに成立条件、failure manifestation、detection clue、safer alternativeの4項目を含む宣言済み合成対象を与える。**期待oracle**：全必須要素を親の対象identityと対応付け、L2のscopeと責務を保持する。
- **L10-BRAIN-INFRA-016-C02（個別欠落／AC-02）**：必須field/relation/列挙要素を一度に一つだけmissingにしたfixtureを列挙集合の各要素について作る。**期待oracle**：当該要素とmissing reasonを特定し、成功/適用扱いにせず止める。C02の分母は `11 anti-pattern × condition/manifestation/detection clue/alternative = 44 cells` とする。
- **L10-BRAIN-INFRA-016-C03（親固有negative／AC-02）**：11例の各々でcondition、manifestation、detection clue、alternativeを一度に1つだけ欠落させる個別fixtureを与える。L11兆候fieldはmanifestationとdetection clueの双方に対応する。加えて条件外をuniversal banにする変異を別fixtureにする。**期待oracle**：不成立reasonを特定し、適用証拠がunknownならLABOへ返す。
- **L10-BRAIN-INFRA-016-C04（unknown/stale/対象不一致／AC-02）**：固定L2が明示するidentity/condition/relationだけを対象に、unknown、矛盾、別対象を一項目ずつ変異する。L2がsource/evidenceを要求しない箇所へ新しいevidence義務を足さない。**期待oracle**：AC-02に従い不成立またはunknownと戻し先を示し、成功/適用扱いにしない。
- **L10-BRAIN-INFRA-016-C05（未見正常／AC-01）**：未見の条件付きUnbounded Queue例へ成立条件、兆候、安全な代替を記載し条件外の状態をunknownとする。**期待oracle**：条件付きAnti-Patternとして保持し、全状況禁止へ一般化しない。

### `HELIXBRAIN-L2-INFRA-017` — BRAIN-INFRA-017-FR-01 / AC-01, AC-02

固定sourceはf6dad2a33e24f000b87d7f09b8d40288257e74cc、L2 lines 382–391、L11 line 57。各caseは独立fixtureで実施し、成功は実環境の成立を意味しない。

- **L10-BRAIN-INFRA-017-C01（正常／AC-01）**：maturity state、BRAIN version、project usage versionを異なる値で持ち、対象revisionと、利用実績・failure・反例・LABO評価の4入力を結ぶ宣言済み合成対象を与える。**期待oracle**：全必須要素を親の対象identityと対応付け、L2のscopeと責務を保持する。
- **L10-BRAIN-INFRA-017-C02（個別欠落／AC-02）**：必須field/relation/列挙要素を一度に一つだけmissingにしたfixtureを列挙集合の各要素について作る。**期待oracle**：当該要素とmissing reasonを特定し、成功/適用扱いにせず止める。C02の分母は6 maturity state、BRAIN version、project usage version、および固定L2の4 input category（利用実績・failure・反例・LABO評価）と対象revision。固定L2に無いscopeを必須field/分母にしない。各対象fieldを個別欠落させる。
- **L10-BRAIN-INFRA-017-C03（親固有negative／AC-02）**：3軸の代入/欠落、4入力categoryの個別欠落、universal/mature誤昇格、failure隠蔽を個別fixtureで試す。**期待oracle**：不成立reasonを特定し、不足評価は昇格推定せずexperimental/observed candidateに留める。failureを保持したまま複数条件評価の入力として記録し、3軸の相互代入でstateを変更しない。
- **L10-BRAIN-INFRA-017-C04（unknown/stale/対象不一致／AC-02）**：固定L2が明示するidentity/condition/relationだけを対象に、unknown、矛盾、別対象を一項目ずつ変異する。L2がsource/evidenceを要求しない箇所へ新しいevidence義務を足さない。**期待oracle**：AC-02に従い不成立またはunknownと戻し先を示し、成功/適用扱いにしない。
- **L10-BRAIN-INFRA-017-C05（未見正常／AC-01）**：既存fixtureと異なるPatternへ4入力を揃え、maturity state/BRAIN version/project usage versionを異なる値で与える。複数条件評価やfailureは混ぜず、C06–C08で個別に照合する。**期待oracle**：3軸と固定4入力を同一対象revisionに保ち、failureを隠さず状態遷移を新閾値から推定しない。scopeは固定L2が列挙する必須inputに追加しない。
- **L10-BRAIN-INFRA-017-C06（個別pair／AC-01/02）**：通常fixtureでは他入力を同じまま一回だけの内部Product success inputを与える。**AC-01期待oracle**：一回のsuccessとして記録し、固定親が定めないmaturity値を推定しない。独立した一変異fixtureでは同じsuccessだけからuniversal/matureへ昇格する。**AC-02期待oracle**：誤昇格を不成立として検出する。
- **L10-BRAIN-INFRA-017-C07（個別例／AC-01）**：別fixtureで、複数条件のLABO評価inputを与える。**期待oracle**：評価入力・対象revisionを保持し、成功/成熟状態への遷移値は固定親に無いため推定しない。
- **L10-BRAIN-INFRA-017-C08（個別pair／AC-01/02）**：通常fixtureではfailure発見inputだけを与える。**AC-01期待oracle**：failureを対象revisionへ結び、C06/C07の入力と混合せず保持する。独立した一変異fixtureではfailureを隠すか成功inputへ変換する。**AC-02期待oracle**：failure隠蔽・success変換を不成立として検出し、maturity昇格を推定しない。

## Stage 2b追補 — 採択済み001〜006の部分草稿

**状態：候補のみ（独立review／L3承認前）。** Stage 1 prefixはPO承認済みのbytesを保持し、既存INFRA Stage2b 17親suffixは最新main `4729c34ec29c2c72f345993958bbc94e1ed6f131`のbytesをそのまま保持する。本追補はPO main `633bf12ea8f948db8ba3d6600179c4a9507377a7`の採択registrationと、固定L2/L11 `f6dad2a33e24f000b87d7f09b8d40288257e74cc`の001〜006だけを候補として具体化する。各親のversion targetは1.0、G0配属はStage 2bであり、release収載や全前Stage完了gate、実装・実行許可を生成しない。後続版・Web条件付き・保留/不採択を親にしない。

### HELIXBRAIN-L2-001 — BRAIN-001-FR-01との対

対象親・registration・revisionはL3本追補と同じ。全caseでfixture source、対象scope/revision、独立の期待値、入力と実出力、不足とownerを記録する。CASEが存在するだけでは合格にしない。fixture値は試験用であり、保存形式・runtime・製品採用を確定しない。

| CASE | 対応AC | 入力・独立変異 | 観測oracle |
|---|---|---|---|
| `L10-BRAIN-001-C01` | `BRAIN-001-AC-01` | 10初期領域を別identity/意味/状態で与え、各Domainのstateもfixture sourceが宣言するstateと照合し、各Patternの参照先を確認する。Visual DesignとUX / Interactionも初期集合に残る。 | 入力sourceの値と対象scopeに対する実出力を項目別に照合し、identity/意味/条件と責務の対応を確認する。候補の表示を採用/実行のreceiptにしない。 |
| `L10-BRAIN-001-C02` | `BRAIN-001-AC-02` | 正常fixtureから `Software Architecture` の識別/意味対応を、欠落・誤identity・意味誤対応へそれぞれ独立に変異させる。 | 当該初期Domainの各独立変異をAC-02の不成立として検出する。他Domainの被覆数や名前の存在で相殺しない。状態fieldも入力どおり保持する。AC-03への戻し先判定はC13で別に照合する。 |
| `L10-BRAIN-001-C03` | `BRAIN-001-AC-02` | 正常fixtureから `Application Architecture` の識別/意味対応を、欠落・誤identity・意味誤対応へそれぞれ独立に変異させる。 | 当該初期Domainの各独立変異をAC-02の不成立として検出する。他Domainの被覆数や名前の存在で相殺しない。状態fieldも入力どおり保持する。AC-03への戻し先判定はC13で別に照合する。 |
| `L10-BRAIN-001-C04` | `BRAIN-001-AC-02` | 正常fixtureから `Backend` の識別/意味対応を、欠落・誤identity・意味誤対応へそれぞれ独立に変異させる。 | 当該初期Domainの各独立変異をAC-02の不成立として検出する。他Domainの被覆数や名前の存在で相殺しない。状態fieldも入力どおり保持する。AC-03への戻し先判定はC13で別に照合する。 |
| `L10-BRAIN-001-C05` | `BRAIN-001-AC-02` | 正常fixtureから `Frontend` の識別/意味対応を、欠落・誤identity・意味誤対応へそれぞれ独立に変異させる。 | 当該初期Domainの各独立変異をAC-02の不成立として検出する。他Domainの被覆数や名前の存在で相殺しない。状態fieldも入力どおり保持する。AC-03への戻し先判定はC13で別に照合する。 |
| `L10-BRAIN-001-C06` | `BRAIN-001-AC-02` | 正常fixtureから `API / Integration` の識別/意味対応を、欠落・誤identity・意味誤対応へそれぞれ独立に変異させる。 | 当該初期Domainの各独立変異をAC-02の不成立として検出する。他Domainの被覆数や名前の存在で相殺しない。状態fieldも入力どおり保持する。AC-03への戻し先判定はC13で別に照合する。 |
| `L10-BRAIN-001-C07` | `BRAIN-001-AC-02` | 正常fixtureから `Data / Database` の識別/意味対応を、欠落・誤identity・意味誤対応へそれぞれ独立に変異させる。 | 当該初期Domainの各独立変異をAC-02の不成立として検出する。他Domainの被覆数や名前の存在で相殺しない。状態fieldも入力どおり保持する。AC-03への戻し先判定はC13で別に照合する。 |
| `L10-BRAIN-001-C08` | `BRAIN-001-AC-02` | 正常fixtureから `Infrastructure` の識別/意味対応を、欠落・誤identity・意味誤対応へそれぞれ独立に変異させる。 | 当該初期Domainの各独立変異をAC-02の不成立として検出する。他Domainの被覆数や名前の存在で相殺しない。状態fieldも入力どおり保持する。AC-03への戻し先判定はC13で別に照合する。 |
| `L10-BRAIN-001-C09` | `BRAIN-001-AC-02` | 正常fixtureから `Security` の識別/意味対応を、欠落・誤identity・意味誤対応へそれぞれ独立に変異させる。 | 当該初期Domainの各独立変異をAC-02の不成立として検出する。他Domainの被覆数や名前の存在で相殺しない。状態fieldも入力どおり保持する。AC-03への戻し先判定はC13で別に照合する。 |
| `L10-BRAIN-001-C10` | `BRAIN-001-AC-02` | 正常fixtureから `Visual Design` の識別/意味対応を、欠落・誤identity・意味誤対応へそれぞれ独立に変異させる。 | 当該初期Domainの各独立変異をAC-02の不成立として検出する。他Domainの被覆数や名前の存在で相殺しない。状態fieldも入力どおり保持する。AC-03への戻し先判定はC13で別に照合する。 |
| `L10-BRAIN-001-C11` | `BRAIN-001-AC-02` | 正常fixtureから `UX / Interaction` の識別/意味対応を、欠落・誤identity・意味誤対応へそれぞれ独立に変異させる。 | 当該初期Domainの各独立変異をAC-02の不成立として検出する。他Domainの被覆数や名前の存在で相殺しない。状態fieldも入力どおり保持する。AC-03への戻し先判定はC13で別に照合する。 |
| `L10-BRAIN-001-C12` | `BRAIN-001-AC-02` | 製品/project名をDomainに固定する入力だけを独立fixtureで与える。 | 製品/project名のDomain固定を拒否し、対象状態と他の正常Domainを保つ。 |
| `L10-BRAIN-001-C13` | `BRAIN-001-AC-03` | 領域の分類意味が重複または不明なら候補のまま停止し、意味差をHELIXBRAIN-L1-001へ返す。 | 不足・不明な項目、停止した候補、戻し先、再提示に必要な意味/sourceを記録する。unknownをpassへ丸めず、別ownerのauthorityを生成しない。 |
| `L10-BRAIN-001-C14` | `BRAIN-001-AC-04` | 正常fixtureにないidentity/組合せを使うが、適用条件・meaning source・必要参照を親契約どおりに揃える。 未見Domainを初期enumにないことだけで拒否しない。意味と既存参照を照合し、追加/分割/統合/退役のいずれでも旧参照利用者を消さない。 | AC-01と同じ条件で照合する。親の必要入力が不明な枝は未見正常と偽らずAC-03へ分類する。 |
| `L10-BRAIN-001-C15` | `BRAIN-001-AC-01` | 新Domain候補D-newを初期10以外で追加する。意味が明確で、旧Pattern/relation参照利用者が保持される。 | 追加後のDomain identity・意味・state・既存利用者traceを照合し、追加操作が成立することを確認する。 |
| `L10-BRAIN-001-C16` | `BRAIN-001-AC-01` | Domain DをD-a/D-bへ分割し、元Dを参照したPatternとrelation利用者の対応を保持する。 | 分割後のstateと旧参照利用者を追跡し、分割操作が成立することを確認する。 |
| `L10-BRAIN-001-C17` | `BRAIN-001-AC-01` | D-a/D-bをD-cへ統合し、両旧参照の由来と利用者を保持する。 | 統合後のstate、由来、旧利用者relationを照合し、統合操作が成立することを確認する。 |
| `L10-BRAIN-001-C18` | `BRAIN-001-AC-01` | Domain Dを退役stateへ変え、Dを利用していたrelation/利用者を保持する。 | 退役stateと旧参照利用者を照合し、退役操作が成立することを確認する。 |
| `L10-BRAIN-001-C19` | `BRAIN-001-AC-02` | 追加可能な6領域を初版で全て充実必須とする一変異を与える。 | 初版充実の必須化を拒否し、6領域の候補性を保つ。 |
| `L10-BRAIN-001-C20` | `BRAIN-001-AC-02` | 既存relation利用者だけを消去する一変異を与える。 | 消去を不成立とし旧Domain利用者/relation参照を保つ。 |
| `L10-BRAIN-001-C21` | `BRAIN-001-AC-02` | 正常fixtureから一つの初期Domainのstateだけを欠落させる。 | state欠落を個別に検出し、他Domainの正常stateで補わない。 |

### HELIXBRAIN-L2-002 — BRAIN-002-FR-01との対

対象親・registration・revisionはL3本追補と同じ。全caseでfixture source、対象scope/revision、独立の期待値、入力と実出力、不足とownerを記録する。CASEが存在するだけでは合格にしない。fixture値は試験用であり、保存形式・runtime・製品採用を確定しない。

| CASE | 対応AC | 入力・独立変異 | 観測oracle |
|---|---|---|---|
| `L10-BRAIN-002-C01` | `BRAIN-002-AC-01` | Visual Design Domain→Dashboard Pattern→Navigation/KPI/Work Area Unit→Table/Filter/Status Partを、各段階のidentity/責務/親とrelation付きで辿る。 | 入力sourceの値と対象scopeに対する実出力を項目別に照合し、identity/意味/条件と責務の対応を確認する。候補の表示を採用/実行のreceiptにしない。 |
| `L10-BRAIN-002-C02` | `BRAIN-002-AC-02` | 正常fixtureの `Domain identity` だけを欠落/不明/元sourceと意味不整合にする。各変異は混ぜず別試行とする。 | 対象項目の欠落/不明/不整合を特定し、その項目の成立を成功にしない。他項目の被覆数や名前の存在で相殺しない。意味未定は対応AC-03の候補保留/owner戻しを観測する。 |
| `L10-BRAIN-002-C03` | `BRAIN-002-AC-02` | 正常fixtureの `Pattern identity` だけを欠落/不明/元sourceと意味不整合にする。各変異は混ぜず別試行とする。 | 対象項目の欠落/不明/不整合を特定し、その項目の成立を成功にしない。他項目の被覆数や名前の存在で相殺しない。意味未定は対応AC-03の候補保留/owner戻しを観測する。 |
| `L10-BRAIN-002-C04` | `BRAIN-002-AC-02` | 正常fixtureの `Design Unit identity` だけを欠落/不明/元sourceと意味不整合にする。各変異は混ぜず別試行とする。 | 対象項目の欠落/不明/不整合を特定し、その項目の成立を成功にしない。他項目の被覆数や名前の存在で相殺しない。意味未定は対応AC-03の候補保留/owner戻しを観測する。 |
| `L10-BRAIN-002-C05` | `BRAIN-002-AC-02` | 正常fixtureの `Part identity` だけを欠落/不明/元sourceと意味不整合にする。各変異は混ぜず別試行とする。 | 対象項目の欠落/不明/不整合を特定し、その項目の成立を成功にしない。他項目の被覆数や名前の存在で相殺しない。意味未定は対応AC-03の候補保留/owner戻しを観測する。 |
| `L10-BRAIN-002-C06` | `BRAIN-002-AC-02` | 正常fixtureの `包含relation` だけを欠落/不明/元sourceと意味不整合にする。各変異は混ぜず別試行とする。 | 対象項目の欠落/不明/不整合を特定し、その項目の成立を成功にしない。他項目の被覆数や名前の存在で相殺しない。意味未定は対応AC-03の候補保留/owner戻しを観測する。 |
| `L10-BRAIN-002-C07` | `BRAIN-002-AC-02` | 正常fixtureの `構成relation` だけを欠落/不明/元sourceと意味不整合にする。各変異は混ぜず別試行とする。 | 対象項目の欠落/不明/不整合を特定し、その項目の成立を成功にしない。他項目の被覆数や名前の存在で相殺しない。意味未定は対応AC-03の候補保留/owner戻しを観測する。 |
| `L10-BRAIN-002-C08` | `BRAIN-002-AC-02` | 正常fixtureの `各段階の親` だけを欠落/不明/元sourceと意味不整合にする。各変異は混ぜず別試行とする。 | 対象項目の欠落/不明/不整合を特定し、その項目の成立を成功にしない。他項目の被覆数や名前の存在で相殺しない。意味未定は対応AC-03の候補保留/owner戻しを観測する。 |
| `L10-BRAIN-002-C09` | `BRAIN-002-AC-02` | 正常fixtureの `各段階の責務` だけを欠落/不明/元sourceと意味不整合にする。各変異は混ぜず別試行とする。 | 対象項目の欠落/不明/不整合を特定し、その項目の成立を成功にしない。他項目の被覆数や名前の存在で相殺しない。意味未定は対応AC-03の候補保留/owner戻しを観測する。 |
| `L10-BRAIN-002-C10` | `BRAIN-002-AC-02` | 他の正常条件を保ち、fileのみをPattern知識として返す変異を与える。 | fileの存在だけをPattern成立とせず、不成立理由を特定する。 |
| `L10-BRAIN-002-C11` | `BRAIN-002-AC-02` | 他の正常条件を保ち、code snippetのみをPattern知識として返す変異を与える。 | code snippetの存在だけをPattern成立とせず、不成立理由を特定する。 |
| `L10-BRAIN-002-C12` | `BRAIN-002-AC-02` | 他の正常条件を保ち、UI component集のみをPattern知識として返す変異を与える。 | UI component集の存在だけをPattern成立とせず、不成立理由を特定する。 |
| `L10-BRAIN-002-C13` | `BRAIN-002-AC-03` | 有効な親階層を持たない孤立要素だけを与える。 | 要素をunknown／候補保留として保持し、HELIXBRAIN-L1-002へ返す。孤立をpassにも確定失敗にも丸めない。 |
| `L10-BRAIN-002-C14` | `BRAIN-002-AC-03` | 正常階層の要素一つだけを誤種別にする。 | 当該要素をunknown／候補保留として保持し、HELIXBRAIN-L1-002へ返す。誤種別を正しい型へ推測しない。 |
| `L10-BRAIN-002-C15` | `BRAIN-002-AC-04` | 正常fixtureにないidentity/組合せを使うが、適用条件・meaning source・必要参照を親契約どおりに揃える。未見の正当な構成にも同じidentity/親/責務照合を適用する。 | AC-01と同じ条件で照合する。親の必要入力が不明な枝は未見正常と偽らずAC-03へ分類する。 |

### HELIXBRAIN-L2-003 — BRAIN-003-FR-01との対

対象親・registration・revisionはL3本追補と同じ。全caseでfixture source、対象scope/revision、独立の期待値、入力と実出力、不足とownerを記録する。CASEが存在するだけでは合格にしない。fixture値は試験用であり、保存形式・runtime・製品採用を確定しない。

| CASE | 対応AC | 入力・独立変異 | 観測oracle |
|---|---|---|---|
| `L10-BRAIN-003-C01` | `BRAIN-003-AC-01` | fixture sourceが宣言する問題・前提・applicabilityとrequired inputを満たすPattern候補Pを受け、各descriptor値を元sourceへ辿り、当該scopeの条件充足を表示する。採用決定は返さない。 | 入力sourceの値と対象scopeに対する実出力を項目別に照合し、identity/意味/条件と責務の対応を確認する。候補の表示を採用/実行のreceiptにしない。 |
| `L10-BRAIN-003-C02` | `BRAIN-003-AC-02` | 正常fixtureの `problem` だけを欠落/不明/元sourceと意味不整合にする。各変異は混ぜず別試行とする。 | 対象項目の欠落/不明/不整合を特定し、その項目の成立を成功にしない。他項目の被覆数や名前の存在で相殺しない。意味未定は対応AC-03の候補保留/owner戻しを観測する。 |
| `L10-BRAIN-003-C03` | `BRAIN-003-AC-02` | 正常fixtureの `前提` だけを欠落/不明/元sourceと意味不整合にする。各変異は混ぜず別試行とする。 | 対象項目の欠落/不明/不整合を特定し、その項目の成立を成功にしない。他項目の被覆数や名前の存在で相殺しない。意味未定は対応AC-03の候補保留/owner戻しを観測する。 |
| `L10-BRAIN-003-C04` | `BRAIN-003-AC-02` | 正常fixtureの `applicability` だけを欠落/不明/元sourceと意味不整合にする。各変異は混ぜず別試行とする。 | 対象項目の欠落/不明/不整合を特定し、その項目の成立を成功にしない。他項目の被覆数や名前の存在で相殺しない。意味未定は対応AC-03の候補保留/owner戻しを観測する。 |
| `L10-BRAIN-003-C05` | `BRAIN-003-AC-02` | 正常fixtureの `required input` だけを欠落/不明/元sourceと意味不整合にする。各変異は混ぜず別試行とする。 | 対象項目の欠落/不明/不整合を特定し、その項目の成立を成功にしない。他項目の被覆数や名前の存在で相殺しない。意味未定は対応AC-03の候補保留/owner戻しを観測する。 |
| `L10-BRAIN-003-C06` | `BRAIN-003-AC-02` | 正常fixtureの `constraint` だけを欠落/不明/元sourceと意味不整合にする。各変異は混ぜず別試行とする。 | 対象項目の欠落/不明/不整合を特定し、その項目の成立を成功にしない。他項目の被覆数や名前の存在で相殺しない。意味未定は対応AC-03の候補保留/owner戻しを観測する。 |
| `L10-BRAIN-003-C07` | `BRAIN-003-AC-02` | 正常fixtureの `trade-off` だけを欠落/不明/元sourceと意味不整合にする。各変異は混ぜず別試行とする。 | 対象項目の欠落/不明/不整合を特定し、その項目の成立を成功にしない。他項目の被覆数や名前の存在で相殺しない。意味未定は対応AC-03の候補保留/owner戻しを観測する。 |
| `L10-BRAIN-003-C08` | `BRAIN-003-AC-02` | 正常fixtureの `negative case` だけを欠落/不明/元sourceと意味不整合にする。各変異は混ぜず別試行とする。 | 対象項目の欠落/不明/不整合を特定し、その項目の成立を成功にしない。他項目の被覆数や名前の存在で相殺しない。意味未定は対応AC-03の候補保留/owner戻しを観測する。 |
| `L10-BRAIN-003-C09` | `BRAIN-003-AC-02` | 正常fixtureの `failure mode` だけを欠落/不明/元sourceと意味不整合にする。各変異は混ぜず別試行とする。 | 対象項目の欠落/不明/不整合を特定し、その項目の成立を成功にしない。他項目の被覆数や名前の存在で相殺しない。意味未定は対応AC-03の候補保留/owner戻しを観測する。 |
| `L10-BRAIN-003-C10` | `BRAIN-003-AC-02` | 正常fixtureの `compatible pattern` だけを欠落/不明/元sourceと意味不整合にする。各変異は混ぜず別試行とする。 | 対象項目の欠落/不明/不整合を特定し、その項目の成立を成功にしない。他項目の被覆数や名前の存在で相殺しない。意味未定は対応AC-03の候補保留/owner戻しを観測する。 |
| `L10-BRAIN-003-C11` | `BRAIN-003-AC-02` | 正常fixtureの `incompatible pattern` だけを欠落/不明/元sourceと意味不整合にする。各変異は混ぜず別試行とする。 | 対象項目の欠落/不明/不整合を特定し、その項目の成立を成功にしない。他項目の被覆数や名前の存在で相殺しない。意味未定は対応AC-03の候補保留/owner戻しを観測する。 |
| `L10-BRAIN-003-C12` | `BRAIN-003-AC-02` | 正常fixtureの `evidence` だけを欠落/不明/元sourceと意味不整合にする。各変異は混ぜず別試行とする。 | 対象項目の欠落/不明/不整合を特定し、その項目の成立を成功にしない。他項目の被覆数や名前の存在で相殺しない。意味未定は対応AC-03の候補保留/owner戻しを観測する。 |
| `L10-BRAIN-003-C13` | `BRAIN-003-AC-02` | 正常fixtureの `maturity` だけを欠落/不明/元sourceと意味不整合にする。各変異は混ぜず別試行とする。 | 対象項目の欠落/不明/不整合を特定し、その項目の成立を成功にしない。他項目の被覆数や名前の存在で相殺しない。意味未定は対応AC-03の候補保留/owner戻しを観測する。 |
| `L10-BRAIN-003-C14` | `BRAIN-003-AC-02` | negative caseだけを正常descriptorから欠落させる。 | negative caseの欠落を個別検出し、適用可能にしない。 |
| `L10-BRAIN-003-C15` | `BRAIN-003-AC-03` | 条件の意味・必須inputが未定なら適用提案を停止し、HELIXBRAIN-L1-003または該当要求意味ownerへ返す。unknownを条件不充足や充足へ丸めない。 | 不足・不明な項目、停止した候補、戻し先、再提示に必要な意味/sourceを記録する。unknownをpassへ丸めず、別ownerのauthorityを生成しない。 |
| `L10-BRAIN-003-C16` | `BRAIN-003-AC-04` | 正常fixtureにないidentity/組合せを使うが、適用条件・meaning source・必要参照を親契約どおりに揃える。 未見scopeでも同じ条件とsourceを照合する。互換性やmaturityの存在だけで採用せず、未入力の必須条件は未解決のまま返す。 | AC-01と同じ条件で照合する。親の必要入力が不明な枝は未見正常と偽らずAC-03へ分類する。 |
| `L10-BRAIN-003-C17` | `BRAIN-003-AC-02` | 不充足 fixture：sourceの前提Qをfalseとする一変異。Pは存在しても当該適用は不成立。 | 期待oracleはsource前提falseを条件不充足として記録し、適用可能・unknownのどちらにも丸めず、候補の適用提案を止める。 |
| `L10-BRAIN-003-C18` | `BRAIN-003-AC-03` | unknown fixture：同じQの値をunknownにし、falseへ丸めず不足とownerを返す。 | 期待oracleはQ=unknownをunknownとして保持し、不充足へ丸めず、不足項目とHELIXBRAIN-L1-003への戻し先を記録する。 |
| `L10-BRAIN-003-C19` | `BRAIN-003-AC-02` | failure modeだけを正常descriptorから欠落させる。 | failure modeの欠落を個別検出し、適用可能にしない。 |
| `L10-BRAIN-003-C20` | `BRAIN-003-AC-02` | evidenceだけを正常descriptorから欠落させる。 | evidenceの欠落を個別検出し、適用可能にしない。 |
| `L10-BRAIN-003-C21` | `BRAIN-003-AC-02` | 利用時required inputを一項目だけ欠落させる。 | required input欠落を示し当該適用を不成立にする。 |
| `L10-BRAIN-003-C22` | `BRAIN-003-AC-02` | source条件を一つだけfalseにする。 | 条件不充足と適用不成立を記録し、条件依存の判定を保つ。 |
| `L10-BRAIN-003-C23` | `BRAIN-003-AC-02` | Patternが存在するだけで今回の適用可能/採用済みとする。 | 存在を適用可能/採用へ変換した結果を拒否する。 |

### HELIXBRAIN-L2-004 — BRAIN-004-FR-01との対

対象親・registration・revisionはL3本追補と同じ。全caseでfixture source、対象scope/revision、独立の期待値、入力と実出力、不足とownerを記録する。CASEが存在するだけでは合格にしない。fixture値は試験用であり、保存形式・runtime・製品採用を確定しない。

| CASE | 対応AC | 入力・独立変異 | 観測oracle |
|---|---|---|---|
| `L10-BRAIN-004-C01` | `BRAIN-004-AC-01` | 同問題のStrong Consistency、Eventual Consistency、Compensating Transactionを、fixture source別の6比較軸とsource/適用条件付きで併存させる。数値や長短は各入力sourceどおりで、BRAINが新規に事実を断定しない。 | 入力sourceの値と対象scopeに対する実出力を項目別に照合し、identity/意味/条件と責務の対応を確認する。候補の表示を採用/実行のreceiptにしない。 |
| `L10-BRAIN-004-C02` | `BRAIN-004-AC-02` | 正常fixtureの `長所` だけを欠落/不明/元sourceと意味不整合にする。各変異は混ぜず別試行とする。 | 対象項目の欠落/不明/不整合を特定し、その項目の成立を成功にしない。他項目の被覆数や名前の存在で相殺しない。意味未定は対応AC-03の候補保留/owner戻しを観測する。 |
| `L10-BRAIN-004-C03` | `BRAIN-004-AC-02` | 正常fixtureの `短所` だけを欠落/不明/元sourceと意味不整合にする。各変異は混ぜず別試行とする。 | 対象項目の欠落/不明/不整合を特定し、その項目の成立を成功にしない。他項目の被覆数や名前の存在で相殺しない。意味未定は対応AC-03の候補保留/owner戻しを観測する。 |
| `L10-BRAIN-004-C04` | `BRAIN-004-AC-02` | 正常fixtureの `constraint` だけを欠落/不明/元sourceと意味不整合にする。各変異は混ぜず別試行とする。 | 対象項目の欠落/不明/不整合を特定し、その項目の成立を成功にしない。他項目の被覆数や名前の存在で相殺しない。意味未定は対応AC-03の候補保留/owner戻しを観測する。 |
| `L10-BRAIN-004-C05` | `BRAIN-004-AC-02` | 正常fixtureの `failure` だけを欠落/不明/元sourceと意味不整合にする。各変異は混ぜず別試行とする。 | 対象項目の欠落/不明/不整合を特定し、その項目の成立を成功にしない。他項目の被覆数や名前の存在で相殺しない。意味未定は対応AC-03の候補保留/owner戻しを観測する。 |
| `L10-BRAIN-004-C06` | `BRAIN-004-AC-02` | 正常fixtureの `cost` だけを欠落/不明/元sourceと意味不整合にする。各変異は混ぜず別試行とする。 | 対象項目の欠落/不明/不整合を特定し、その項目の成立を成功にしない。他項目の被覆数や名前の存在で相殺しない。意味未定は対応AC-03の候補保留/owner戻しを観測する。 |
| `L10-BRAIN-004-C07` | `BRAIN-004-AC-02` | 正常fixtureの `適用条件` だけを欠落/不明/元sourceと意味不整合にする。各変異は混ぜず別試行とする。 | 対象項目の欠落/不明/不整合を特定し、その項目の成立を成功にしない。他項目の被覆数や名前の存在で相殺しない。意味未定は対応AC-03の候補保留/owner戻しを観測する。 |
| `L10-BRAIN-004-C08` | `BRAIN-004-AC-02` | 一候補だけを恒久正解として他候補を上書きする変異を与える。 | 上書きを不成立とし複数の根拠付き候補を保持する。 |
| `L10-BRAIN-004-C09` | `BRAIN-004-AC-03` | 比較に必要な要求値/重みがなければ欠落を示して選択を保留し、HARNESS-CORE/INTELLIGENCE/人間の適切な判断先へ返す。 | 不足・不明な項目、停止した候補、戻し先、再提示に必要な意味/sourceを記録する。unknownをpassへ丸めず、別ownerのauthorityを生成しない。 |
| `L10-BRAIN-004-C10` | `BRAIN-004-AC-04` | 正常fixtureにないidentity/組合せを使うが、適用条件・meaning source・必要参照を親契約どおりに揃える。 未見Patternを含む比較でも候補集合と制約を保持し、比較表示を採用決定に変えない。成立判定不明の候補を成立済みと捏造しない。 | AC-01と同じ条件で照合する。親の必要入力が不明な枝は未見正常と偽らずAC-03へ分類する。 |
| `L10-BRAIN-004-C11` | `BRAIN-004-AC-02` | BRAINが稼働案件の選択を確定する一変異を与える。 | 選択確定を拒否し、「HARNESS-CORE／INTELLIGENCE／人間の適切な判断先」への未決状態を保つ。 |
| `L10-BRAIN-004-C12` | `BRAIN-004-AC-02` | 六比較軸のうち一軸だけを欠落させながら完全比較と表示する。 | 欠落軸を明示し、完全な比較として扱わない。 |

### HELIXBRAIN-L2-005 — BRAIN-005-FR-01との対

対象親・registration・revisionはL3本追補と同じ。全caseでfixture source、対象scope/revision、独立の期待値、入力と実出力、不足とownerを記録する。CASEが存在するだけでは合格にしない。fixture値は試験用であり、保存形式・runtime・製品採用を確定しない。

| CASE | 対応AC | 入力・独立変異 | 観測oracle |
|---|---|---|---|
| `L10-BRAIN-005-C01` | `BRAIN-005-AC-01` | Authentication→Session→Frontend State→UXとDatabase→Performance→Infrastructureの各edgeを、sourceが宣言したrelation種類/方向/意味/端点付きで辿る。7種類はそれぞれ独立fixtureで照合する。 | 入力sourceの値と対象scopeに対する実出力を項目別に照合し、identity/意味/条件と責務の対応を確認する。候補の表示を採用/実行のreceiptにしない。 |
| `L10-BRAIN-005-C02` | `BRAIN-005-AC-02` | `requires` edgeの正常入力と、そのedgeだけの端点欠落・向き/意味未定・名前類似だけ・因果根拠不明を別々のfixtureとして与える。 | 対象項目の欠落/不明/不整合を特定し、その項目の成立を成功にしない。他項目の被覆数や名前の存在で相殺しない。意味未定は対応AC-03の候補保留/owner戻しを観測する。 |
| `L10-BRAIN-005-C03` | `BRAIN-005-AC-02` | `depends_on` edgeの正常入力と、そのedgeだけの端点欠落・向き/意味未定・名前類似だけ・因果根拠不明を別々のfixtureとして与える。 | 対象項目の欠落/不明/不整合を特定し、その項目の成立を成功にしない。他項目の被覆数や名前の存在で相殺しない。意味未定は対応AC-03の候補保留/owner戻しを観測する。 |
| `L10-BRAIN-005-C04` | `BRAIN-005-AC-02` | `compatible_with` edgeの正常入力と、そのedgeだけの端点欠落・向き/意味未定・名前類似だけ・因果根拠不明を別々のfixtureとして与える。 | 対象項目の欠落/不明/不整合を特定し、その項目の成立を成功にしない。他項目の被覆数や名前の存在で相殺しない。意味未定は対応AC-03の候補保留/owner戻しを観測する。 |
| `L10-BRAIN-005-C05` | `BRAIN-005-AC-02` | `conflicts_with` edgeの正常入力と、そのedgeだけの端点欠落・向き/意味未定・名前類似だけ・因果根拠不明を別々のfixtureとして与える。 | 対象項目の欠落/不明/不整合を特定し、その項目の成立を成功にしない。他項目の被覆数や名前の存在で相殺しない。意味未定は対応AC-03の候補保留/owner戻しを観測する。 |
| `L10-BRAIN-005-C06` | `BRAIN-005-AC-02` | `affects` edgeの正常入力と、そのedgeだけの端点欠落・向き/意味未定・名前類似だけ・因果根拠不明を別々のfixtureとして与える。 | 対象項目の欠落/不明/不整合を特定し、その項目の成立を成功にしない。他項目の被覆数や名前の存在で相殺しない。意味未定は対応AC-03の候補保留/owner戻しを観測する。 |
| `L10-BRAIN-005-C07` | `BRAIN-005-AC-02` | `alternative_to` edgeの正常入力と、そのedgeだけの端点欠落・向き/意味未定・名前類似だけ・因果根拠不明を別々のfixtureとして与える。 | 対象項目の欠落/不明/不整合を特定し、その項目の成立を成功にしない。他項目の被覆数や名前の存在で相殺しない。意味未定は対応AC-03の候補保留/owner戻しを観測する。 |
| `L10-BRAIN-005-C08` | `BRAIN-005-AC-02` | `composed_of` edgeの正常入力と、そのedgeだけの端点欠落・向き/意味未定・名前類似だけ・因果根拠不明を別々のfixtureとして与える。 | 対象項目の欠落/不明/不整合を特定し、その項目の成立を成功にしない。他項目の被覆数や名前の存在で相殺しない。意味未定は対応AC-03の候補保留/owner戻しを観測する。 |
| `L10-BRAIN-005-C09` | `BRAIN-005-AC-02` | relation名だけ、unknown endpoint、未確認因果、名称類似だけのedgeを意味関係に確定する入力を個別に拒否する。領域横断edge脱落の検証は別case C13で行う。 | 各反例を独立試行し、該当する固定L2/L11の禁止または不足を理由付きで示す。正当な別operationを同じ理由で一律に止めない。 |
| `L10-BRAIN-005-C10` | `BRAIN-005-AC-03` | 向きまたは意味が未定ならedgeを確定せずHELIXBRAIN-L1-005へ返す。既知の一方端点から他方を捏造しない。 | 不足・不明な項目、停止した候補、戻し先、再提示に必要な意味/sourceを記録する。unknownをpassへ丸めず、別ownerのauthorityを生成しない。 |
| `L10-BRAIN-005-C11` | `BRAIN-005-AC-04` | 正常fixtureにないidentity/組合せを使うが、適用条件・meaning source・必要参照を親契約どおりに揃える。 未見だがsourceで正当に定義されたedgeも方向/意味/両端identityで照合する。requires等を一律対称関係へ変えない。 | AC-01と同じ条件で照合する。親の必要入力が不明な枝は未見正常と偽らずAC-03へ分類する。 |
| `L10-BRAIN-005-C12` | `BRAIN-005-AC-02` | source-backed directed relationを逆方向にした一変異を与える。 | sourceにない逆向きedgeを不成立とし、宣言方向を保持する。 |
| `L10-BRAIN-005-C13` | `BRAIN-005-AC-02` | 正常graphから領域横断edgeだけを落とす。 | edge欠落を個別検出し、領域をまたぐ関係を保持する。 |

### HELIXBRAIN-L2-006 — BRAIN-006-FR-01との対

対象親・registration・revisionはL3本追補と同じ。全caseでfixture source、対象scope/revision、独立の期待値、入力と実出力、不足とownerを記録する。CASEが存在するだけでは合格にしない。fixture値は試験用であり、保存形式・runtime・製品採用を確定しない。

| CASE | 対応AC | 入力・独立変異 | 観測oracle |
|---|---|---|---|
| `L10-BRAIN-006-C01` | `BRAIN-006-AC-01` | 15知識例の各要素を、source/適用条件とPattern/Unit/Partの意味に結んで識別する。製品固有のscreen/flow/tokenを汎用知識の値として取り込まない。 | 入力sourceの値と対象scopeに対する実出力を項目別に照合し、identity/意味/条件と責務の対応を確認する。候補の表示を採用/実行のreceiptにしない。 |
| `L10-BRAIN-006-C02` | `BRAIN-006-AC-02` | 正常fixtureから `Information Architecture` の識別/意味対応を、欠落・誤identity・意味誤対応へそれぞれ独立に変異させる。 | 当該15知識例の欠落/識別不能/意味誤対応を特定し、AC-02の不成立と判定する。他例の被覆数や名前の存在で相殺しない。この一般知識要素の不足だけからAC-03の製品owner戻しを導かない。 |
| `L10-BRAIN-006-C03` | `BRAIN-006-AC-02` | 正常fixtureから `Visual Hierarchy` の識別/意味対応を、欠落・誤identity・意味誤対応へそれぞれ独立に変異させる。 | 当該15知識例の欠落/識別不能/意味誤対応を特定し、AC-02の不成立と判定する。他例の被覆数や名前の存在で相殺しない。この一般知識要素の不足だけからAC-03の製品owner戻しを導かない。 |
| `L10-BRAIN-006-C04` | `BRAIN-006-AC-02` | 正常fixtureから `Layout` の識別/意味対応を、欠落・誤identity・意味誤対応へそれぞれ独立に変異させる。 | 当該15知識例の欠落/識別不能/意味誤対応を特定し、AC-02の不成立と判定する。他例の被覆数や名前の存在で相殺しない。この一般知識要素の不足だけからAC-03の製品owner戻しを導かない。 |
| `L10-BRAIN-006-C05` | `BRAIN-006-AC-02` | 正常fixtureから `Grid` の識別/意味対応を、欠落・誤identity・意味誤対応へそれぞれ独立に変異させる。 | 当該15知識例の欠落/識別不能/意味誤対応を特定し、AC-02の不成立と判定する。他例の被覆数や名前の存在で相殺しない。この一般知識要素の不足だけからAC-03の製品owner戻しを導かない。 |
| `L10-BRAIN-006-C06` | `BRAIN-006-AC-02` | 正常fixtureから `Spacing / Density` の識別/意味対応を、欠落・誤identity・意味誤対応へそれぞれ独立に変異させる。 | 当該15知識例の欠落/識別不能/意味誤対応を特定し、AC-02の不成立と判定する。他例の被覆数や名前の存在で相殺しない。この一般知識要素の不足だけからAC-03の製品owner戻しを導かない。 |
| `L10-BRAIN-006-C07` | `BRAIN-006-AC-02` | 正常fixtureから `Typography` の識別/意味対応を、欠落・誤identity・意味誤対応へそれぞれ独立に変異させる。 | 当該15知識例の欠落/識別不能/意味誤対応を特定し、AC-02の不成立と判定する。他例の被覆数や名前の存在で相殺しない。この一般知識要素の不足だけからAC-03の製品owner戻しを導かない。 |
| `L10-BRAIN-006-C08` | `BRAIN-006-AC-02` | 正常fixtureから `Navigation` の識別/意味対応を、欠落・誤identity・意味誤対応へそれぞれ独立に変異させる。 | 当該15知識例の欠落/識別不能/意味誤対応を特定し、AC-02の不成立と判定する。他例の被覆数や名前の存在で相殺しない。この一般知識要素の不足だけからAC-03の製品owner戻しを導かない。 |
| `L10-BRAIN-006-C09` | `BRAIN-006-AC-02` | 正常fixtureから `Component Composition` の識別/意味対応を、欠落・誤identity・意味誤対応へそれぞれ独立に変異させる。 | 当該15知識例の欠落/識別不能/意味誤対応を特定し、AC-02の不成立と判定する。他例の被覆数や名前の存在で相殺しない。この一般知識要素の不足だけからAC-03の製品owner戻しを導かない。 |
| `L10-BRAIN-006-C10` | `BRAIN-006-AC-02` | 正常fixtureから `Form` の識別/意味対応を、欠落・誤identity・意味誤対応へそれぞれ独立に変異させる。 | 当該15知識例の欠落/識別不能/意味誤対応を特定し、AC-02の不成立と判定する。他例の被覆数や名前の存在で相殺しない。この一般知識要素の不足だけからAC-03の製品owner戻しを導かない。 |
| `L10-BRAIN-006-C11` | `BRAIN-006-AC-02` | 正常fixtureから `Feedback` の識別/意味対応を、欠落・誤identity・意味誤対応へそれぞれ独立に変異させる。 | 当該15知識例の欠落/識別不能/意味誤対応を特定し、AC-02の不成立と判定する。他例の被覆数や名前の存在で相殺しない。この一般知識要素の不足だけからAC-03の製品owner戻しを導かない。 |
| `L10-BRAIN-006-C12` | `BRAIN-006-AC-02` | 正常fixtureから `Empty / Loading / Error State` の識別/意味対応を、欠落・誤identity・意味誤対応へそれぞれ独立に変異させる。 | 当該15知識例の欠落/識別不能/意味誤対応を特定し、AC-02の不成立と判定する。他例の被覆数や名前の存在で相殺しない。この一般知識要素の不足だけからAC-03の製品owner戻しを導かない。 |
| `L10-BRAIN-006-C13` | `BRAIN-006-AC-02` | 正常fixtureから `Responsive Design` の識別/意味対応を、欠落・誤identity・意味誤対応へそれぞれ独立に変異させる。 | 当該15知識例の欠落/識別不能/意味誤対応を特定し、AC-02の不成立と判定する。他例の被覆数や名前の存在で相殺しない。この一般知識要素の不足だけからAC-03の製品owner戻しを導かない。 |
| `L10-BRAIN-006-C14` | `BRAIN-006-AC-02` | 正常fixtureから `Dashboard` の識別/意味対応を、欠落・誤identity・意味誤対応へそれぞれ独立に変異させる。 | 当該15知識例の欠落/識別不能/意味誤対応を特定し、AC-02の不成立と判定する。他例の被覆数や名前の存在で相殺しない。この一般知識要素の不足だけからAC-03の製品owner戻しを導かない。 |
| `L10-BRAIN-006-C15` | `BRAIN-006-AC-02` | 正常fixtureから `Content Hierarchy` の識別/意味対応を、欠落・誤identity・意味誤対応へそれぞれ独立に変異させる。 | 当該15知識例の欠落/識別不能/意味誤対応を特定し、AC-02の不成立と判定する。他例の被覆数や名前の存在で相殺しない。この一般知識要素の不足だけからAC-03の製品owner戻しを導かない。 |
| `L10-BRAIN-006-C16` | `BRAIN-006-AC-02` | 正常fixtureから `Accessibility` の識別/意味対応を、欠落・誤identity・意味誤対応へそれぞれ独立に変異させる。 | 当該15知識例の欠落/識別不能/意味誤対応を特定し、AC-02の不成立と判定する。他例の被覆数や名前の存在で相殺しない。この一般知識要素の不足だけからAC-03の製品owner戻しを導かない。 |
| `L10-BRAIN-006-C17` | `BRAIN-006-AC-02` | 「黒背景・青accent」の製品Visual Identity、製品名、固定style、製品screen/flow/tokenを個別に汎用知識へ混入させる入力を拒否する。装飾だけとして構造や体験要素を落とす入力も不合格。 | 各反例を独立試行し、該当する固定L2/L11の禁止または不足を理由付きで示す。正当な別operationを同じ理由で一律に止めない。 |
| `L10-BRAIN-006-C18` | `BRAIN-006-AC-03` | 製品固有識別要素を切分け不能なら共有知識へ入れずVisual Design HARNESSまたは製品COREへ返す。 | 不足・不明な項目、停止した候補、戻し先、再提示に必要な意味/sourceを記録する。unknownをpassへ丸めず、別ownerのauthorityを生成しない。 |
| `L10-BRAIN-006-C19` | `BRAIN-006-AC-04` | 正常fixtureにないidentity/組合せを使うが、適用条件・meaning source・必要参照を親契約どおりに揃える。 未見の正当な画面構造を汎用知識条件で照合し、製品Visual Identityや設計選択は代行しない。Visual Design HARNESSの生成/評価とSystem Designを混同しない。 | AC-01と同じ条件で照合する。親の必要入力が不明な枝は未見正常と偽らずunknownのまま記録し、この理由だけで製品ownerへ戻さない。AC-03は製品固有要素を切り分けられない場合に限って適用する。 |

## Stage 2b追補 — 採択済み009/010/011/012/029との対

**状態：候補のみ（独立review／L3承認前）。** 各caseは対象親の固定L2/L11に限り、入力source、親revision、選択scope、独立oracle、実際の出力/不足、ownerを記録する。CASEの存在だけでは合格でない。値はfixtureであり製品schema/runtime/採用結果を確定しない。親はPO main `633bf12ea8f948db8ba3d6600179c4a9507377a7`の採択registrationと固定L2/L11 `f6dad2a33e24f000b87d7f09b8d40288257e74cc`に限定する。後続版/Web/hold/rejectを含めず、前Stageの一括完了gateも加えない。

### HELIXBRAIN-L2-009 — BRAIN-009-FR-01との対

| CASE | 対応AC | 入力・oracle |
|---|---|---|
| `L10-BRAIN-009-C01` | `BRAIN-009-AC-01` | 異なるPatternに属するsource/version有効な既存Unit二つ、両端identity、根拠付きrelation案を与える。選択された入力だけで出力candidateと構成根拠を観測し、昇格なしを確認する。 |
| `L10-BRAIN-009-C02` | `BRAIN-009-AC-02` | C01から一方のrelation端点だけを欠落させる。期待oracleは欠落端点を理由としてrelation適用を停止し、両端identityを補完せず、未確定意味をBRAIN-L1-009へ返すこと。 |
| `L10-BRAIN-009-C03` | `BRAIN-009-AC-02` | relation meaning/sourceの一方だけを欠落または不一致にするfixtureを別々に与える。unknown保持、適用可能判定なし、BRAIN-L1-009戻しを観測する。 |
| `L10-BRAIN-009-C04` | `BRAIN-009-AC-02` | 他の状態を成立させLABO評価だけを未完にして昇格要求。候補維持、不足を特定しLABOの既存評価ownerへ戻す（固定L2-025:471）。 |
| `L10-BRAIN-009-C05` | `BRAIN-009-AC-02` | 他の状態を成立させOS登録/振分けだけを未完にして昇格要求。LABO/BRAIN状態を代用せず候補維持し、OSの既存登録/進行ownerへ戻す（固定L2-025:471）。 |
| `L10-BRAIN-009-C06` | `BRAIN-009-AC-02` | LABO評価・OS登録/振分けは成立し、BRAIN変更手続き内の独立検証だけを未完にして昇格要求。candidateを維持し、独立検証未完を特定してBRAIN change ownerへ戻す（固定L2-025:469–471）。 |
| `L10-BRAIN-009-C07` | `BRAIN-009-AC-03` | sourceがrelationの意味を決めない入力。適用可能へ推定せずunknownに保持しL1-009へ返す。 |
| `L10-BRAIN-009-C08` | `BRAIN-009-AC-04` | 既知fixtureと異なるsource定義済みUnit組合せを投入する。期待oracleは両端identity、relation meaning/source、scopeとcandidate状態を照合し、候補のまま返す。oracle未定の枝は未評価とする。 |
| `L10-BRAIN-009-C09` | `BRAIN-009-AC-02` | C01の他条件を維持し、LABO評価・OS登録/振分け・BRAIN独立検証は成立したが、L2-025の既存採否経路だけが未完のfixtureにする。候補を維持し、既存経路の未完を理由としてBRAIN change ownerへ戻す（固定L2-025:469–471）。 |
| `L10-BRAIN-009-C10` | `BRAIN-009-AC-02` | C01の他条件を維持し、選択source identityだけを欠落させる。期待oracleはsource欠落を理由にcandidate適用/昇格を止め、BRAIN-L1-009へ不足を返す。 |
| `L10-BRAIN-009-C11` | `BRAIN-009-AC-02` | C01の他条件を維持し、選択source revisionだけを要求revisionと不一致にする。期待oracleはstale/mismatchを明示し旧sourceを再利用せず、candidate適用/昇格を止めてBRAIN-L1-009へ返す。 |
| `L10-BRAIN-009-C12` | `BRAIN-009-AC-01` | C01と同じ二Unit/relation候補について、LABO評価、OS登録/振分け、BRAIN変更手続き内の独立検証および既存L2-025採否経路が同一candidate identity/revisionで全て成立した正常入力を与える。既存経路が定める次状態をpositive oracleとして観測し、BRAINが候補生成だけで即時昇格させないことを別のC01正常fixtureと合わせて確認する。 |
| `L10-BRAIN-009-C13` | `BRAIN-009-AC-02` | C01のrelationは根拠付きのまま、一方の必須Unitだけsource/根拠を欠落させる。 期待oracle：Unit根拠欠落だけでcandidate適用を止め、該当不足をL1-009へ返す。relation正常で欠落Unitを補完しない。 |

### HELIXBRAIN-L2-010 — BRAIN-010-FR-01との対

| CASE | 対応AC | 入力・oracle |
|---|---|---|
| `L10-BRAIN-010-C01` | `BRAIN-010-AC-01` | L11列挙の各failure family（Single Point of Failure、Network Partition、Dependency Failure、Storage Exhaustion、Queue Saturation、Connection Exhaustion、Resource Starvation、Cascading Failure、Region/Zone Failure、Deployment/Backup/Restore Failure、configuration drift等）を別の正常fixtureとして選ぶ。さらに5入力種Anti-Pattern、Failure Pattern、Invalid Combination、Context-dependent Failure、Regression caseをそれぞれ正常fixtureにし、sourceがalternative candidateを持つ場合はその内容・条件・sourceを保持し、条件付き禁止構造は条件付きのまま参照する。期待oracleは条件、影響、反例、evidence/source/scopeとsource提供alternativeの有無を区別し、sourceにないalternativeはunknownのままにする。未選択family/入力種は未観測と記録する。 |
| `L10-BRAIN-010-C02` | `BRAIN-010-AC-02` | 正常fixtureから成立前提だけを外す。failure適用の断定なし、失われた前提を示す。 |
| `L10-BRAIN-010-C03` | `BRAIN-010-AC-02` | 条件付き禁止だけを常時禁止へ変える。普遍禁止の出力を不合格にする。 |
| `L10-BRAIN-010-C04` | `BRAIN-010-AC-02` | 条件付きfailureだけを常時適用へ変える。普遍適用の出力を不合格にする。 |
| `L10-BRAIN-010-C05` | `BRAIN-010-AC-02` | 影響だけを欠落させる。影響不明を空欄なしの成功へ変えない。 |
| `L10-BRAIN-010-C06` | `BRAIN-010-AC-02` | 反例だけを欠落させる。反例不足を特定する。 |
| `L10-BRAIN-010-C07` | `BRAIN-010-AC-02` | evidence、sourceまたはscope bindingを一つずつ欠落/stale化する独立fixture。根拠を誤結合せず条件付き適用の成立を止める。 |
| `L10-BRAIN-010-C08` | `BRAIN-010-AC-03` | 条件/scope未定のfinding。unknownを維持し固定L2のLABO評価へ戻す。 |
| `L10-BRAIN-010-C09` | `BRAIN-010-AC-04` | 未見failure形態だが独立source、条件、scope、反例、oracleが揃う例を照合する。期待oracleはsourceが与えた代替候補/条件付き禁止だけを返し、代替不在または条件未定の部分をunknownのままにし、全分類網羅を主張しない。 |
| `L10-BRAIN-010-C10` | `BRAIN-010-AC-02` | 成功fixtureだけをknowledgeとして保存し、source提供の反例を落とす一変異を与える。 期待oracle：成功だけの保持を不成立とし、sourceにある反例と条件を保つ。 |
| `L10-BRAIN-010-C11` | `BRAIN-010-AC-02` | Regression caseの固有source/evidence/成立条件だけを欠落させる。 期待oracle：Regression caseを他failure familyや成功例で代用せず、欠落を個別理由として保持する。 |

### HELIXBRAIN-L2-011 — BRAIN-011-FR-01との対

| CASE | 対応AC | 入力・oracle |
|---|---|---|
| `L10-BRAIN-011-C01` | `BRAIN-011-AC-01` | source付き構造を一般化候補と製品固有残余に分離する。根拠、scope、元source traceを両側に保つ。 |
| `L10-BRAIN-011-C02` | `BRAIN-011-AC-02` | 製品名だけをgeneric候補へ漏らす。期待oracleは製品名をgeneric candidateから除き、製品固有残余と元source traceを保持する。 |
| `L10-BRAIN-011-C03` | `BRAIN-011-AC-02` | product requirementだけを汎用候補へ漏らす。期待oracleは汎用候補からその値を除き、元sourceの製品固有残余へ保持する。 |
| `L10-BRAIN-011-C04` | `BRAIN-011-AC-02` | 製品固有screenだけを汎用候補へ漏らす。 期待oracle：screen混入を拒否し、製品固有残余と元source traceを保持する。 |
| `L10-BRAIN-011-C05` | `BRAIN-011-AC-02` | business ruleだけを汎用候補へ漏らす。期待oracleは当該規則を製品固有残余へ保持し、汎用候補への混入を拒否する。 |
| `L10-BRAIN-011-C06` | `BRAIN-011-AC-02` | user judgmentだけを汎用候補へ漏らす。期待oracleは判断を汎用事実化せず、元sourceに結んだ残余として保持する。 |
| `L10-BRAIN-011-C07` | `BRAIN-011-AC-02` | 他条件を正常に保ちsource/provenance linkだけを消す。期待oracleは一般化確定を拒否し、失われた出所を示して固定親の提供元COREまたはLABOへ返す。 |
| `L10-BRAIN-011-C08` | `BRAIN-011-AC-03` | source meaningを分離不能にする。期待oracleはgeneric acceptanceを止め、固定親どおりprovider COREまたはLABOへ不足と理由を返す。ownerを推測しない。 |
| `L10-BRAIN-011-C09` | `BRAIN-011-AC-04` | 未見の別製品sourceを用い、根拠のある範囲だけ分離する。期待oracleはgeneric candidateとproduct-specific residual双方にsource traceを残し、根拠のない普遍化をunknownにする。 |
| `L10-BRAIN-011-C10` | `BRAIN-011-AC-03` | sourceから共有範囲の決定を要する意味が一つだけ未決のfixtureを与える。 期待oracle：人の既存判断点へ送る。既存CORE/LABO ownerへの自動割当や返却で代替した結果は不合格とし、共有範囲を確定しない。 |
| `L10-BRAIN-011-C11` | `BRAIN-011-AC-02` | 他要素を正常に保ち、sourceが支える再利用条件の根拠範囲を超えて一般化する変異だけを与える。 期待oracle：根拠を超えた一般化を不成立として検出し、一般化の根拠sourceと製品固有残余を保つ。 |
| `L10-BRAIN-011-C12` | `BRAIN-011-AC-02` | 他要素を正常に保ち、一般化候補を確立済み事実として扱う変異だけを与える。 期待oracle：候補状態を維持し、確定事実化を不成立として検出する。候補sourceと製品固有残余を保つ。 |

### HELIXBRAIN-L2-012 — BRAIN-012-FR-01との対

| CASE | 対応AC | 入力・oracle |
|---|---|---|
| `L10-BRAIN-012-C01` | `BRAIN-012-AC-01` | query側にdesign contextと必要知識領域がある複数候補入力を与え、sourceにあるrequired input/relation/alternative/constraint/evidence/versionを返し、decisionは未決に保つ。 |
| `L10-BRAIN-012-C02` | `BRAIN-012-AC-02` | 他の返却値を保ちdecision statusだけをadoptedへ変える。期待oracleはBRAIN起因の採用stateを拒否し、decision未決と候補tupleを保持する。 |
| `L10-BRAIN-012-C03` | `BRAIN-012-AC-02` | 正常tupleへ製品固有案のselected表示だけを加える。期待oracleは選択表示を拒否し、候補状態とdecision未決を維持する。 |
| `L10-BRAIN-012-C04` | `BRAIN-012-AC-02` | 正常tupleへruntime/operation decisionだけを加える。期待oracleはBRAINによるdecision生成を拒否し、固定親の既存ownerへ返す。 |
| `L10-BRAIN-012-C05` | `BRAIN-012-AC-02` | sourceが返却対象として宣言するrequired input fieldを一つ欠落させる（問い合わせ側のinput不足とは別fixture）。期待oracleはそのinputの欠落を特定し、当該返却fieldの欠落を示し候補tupleを不成立として返す。 |
| `L10-BRAIN-012-C06` | `BRAIN-012-AC-02` | sourceが返却対象として宣言するrelation fieldだけを欠落させる。期待oracleはsourceにrelationがない場合は不在を記録して正常とし、relationがsourceにあるのに返却fieldだけを落とした場合に限り不足を示す。 |
| `L10-BRAIN-012-C07` | `BRAIN-012-AC-02` | sourceが返却対象として宣言するalternative fieldだけを欠落させる。期待oracleはsourceにalternativeがない場合は不在を記録して正常とし、alternativeがsourceにあるのに返却fieldだけを落とした場合に限り不足を示す。 |
| `L10-BRAIN-012-C08` | `BRAIN-012-AC-02` | sourceが返却対象として宣言するconstraint、evidence、version fieldを、それぞれ一つだけ欠落させる独立fixture。各fixtureの期待oracleは当該field名と不足理由を返し、候補tuple成立を拒否する。 |
| `L10-BRAIN-012-C09` | `BRAIN-012-AC-03` | 要求意味またはweight未確定。期待oracleは選択を生成せずunknown/未決を示し、固定親の既存decision ownerへ不足理由を返す。 |
| `L10-BRAIN-012-C10` | `BRAIN-012-AC-04` | 未見・曖昧queryを与える。期待oracleは根拠ある候補、個別不足、unknownを区別して返し、候補数や受領を採用と解釈しない。 |
| `L10-BRAIN-012-C11` | `BRAIN-012-AC-01` | 利用要求/問い合わせのdesign contextはあるが必要知識領域inputの一つが欠落したrequestを与える。期待oracleは問い合わせ側の欠落inputを特定し、decisionを生成せず、sourceにあるcandidateとrequired input不足を返す。C05–C08のsource返却field欠落とは異なるinput-side fixtureとしてAC-01へtraceする。 |
| `L10-BRAIN-012-C12` | `BRAIN-012-AC-03` | BRAINのknowledge shortageを理由に新しいadoption/operation authorityを発生させる一変異を与える。 期待oracle：authority拡張を拒否し、既存判断ownerへ返す。 |
| `L10-BRAIN-012-C13` | `BRAIN-012-AC-01` | request contextと必要知識領域を満たし、sourceにrelationまたはalternativeがないcandidateを返す。 期待oracle：sourceにないedge/valueを創作せず、そのfieldの不在を表したcandidateとrequired inputを返す。decisionは未決のまま。 |

### HELIXBRAIN-L2-029 — BRAIN-029-FR-01との対

L2-029の常時必須・操作時のみ・入力元に応じて必須・参照のみの依存区分を保持する。HELIXBRAIN-L2-030のconnection/receipt条件は本親のoracleにしない。候補の正常照合では汎用permission構造を許し、製品固有permission値は候補へ混入させない。

| CASE | 対応AC | 入力・oracle |
|---|---|---|
| `L10-BRAIN-029-C01` | `BRAIN-029-AC-01` | L11の一般化課題とsource/version付き複数Pattern/Unit候補を与え、problem/applicability/required input/constraint/trade-off/negative case、汎用permission構造、relation両端を照合する。期待oracleはsource identityと各fieldを候補へ保持し、candidateのみを返して製品選択をしない。 |
| `L10-BRAIN-029-C02` | `BRAIN-029-AC-03` | 選択edgeが`compatible_with`であるsource-backed fixtureを与える。期待oracleはtype、両端identity、source/version、meaningを保持してcandidate edgeとして返し、確立済みrelationへ昇格しない。 |
| `L10-BRAIN-029-C03` | `BRAIN-029-AC-03` | 選択edgeが`conflicts_with`であるsource-backed fixtureを与える。期待oracleはconflict meaningと両端identity/source/versionを保持し、`compatible_with`等へ対称化・同一化しない。 |
| `L10-BRAIN-029-C04` | `BRAIN-029-AC-03` | 選択edgeが`alternative_to`であるsource-backed fixtureを与える。期待oracleは両端identity、source/version、alternative meaningを保持し、どちらかの候補を選ばない。 |
| `L10-BRAIN-029-C05` | `BRAIN-029-AC-03` | 選択edgeが`depends_on`であるsource-backed fixtureを与える。期待oracleはsourceの方向、依存先identity、meaningを保持し、逆方向へ入れ替えない。 |
| `L10-BRAIN-029-C06` | `BRAIN-029-AC-03` | 選択edgeが`composed_of`であるsource-backed fixtureを与える。期待oracleは構成端点、meaning、source/versionを保持し、relationを別typeへ読み替えない。 |
| `L10-BRAIN-029-C07` | `BRAIN-029-AC-02` | 他条件を正常に保った5個の独立fixtureを与える：(a)製品名だけ、(b)製品固有screenだけ、(c)具体APIだけ、(d)製品固有permission値だけ、(e)製品固有requirementだけを汎用候補へ混入する。期待oracleは各fixtureで当該要素だけを汎用候補から除外し、製品固有残余と元source traceを保持してHARNESSへ返す。汎用permission構造は正常に保持する。 |
| `L10-BRAIN-029-C08` | `BRAIN-029-AC-02` | 常時必須inputを一つだけ欠落させる。期待oracleは当該input名を不足として示し、未選択sourceから補完せずunknown/不成立を返す。当該inputの知識意味・適用条件はprimary L1-003、relation条件はprimary L1-005、候補構成/source結合はprimary L1-009へ返す。製品固有要件の不足はCORE source選択の有無によらずHARNESSへ返す。選択CORE source自体のidentity/revision/provenance不足だけは製品Coreへ返す。 |
| `L10-BRAIN-029-C09` | `BRAIN-029-AC-02` | 選択source identity欠落、選択source revision欠落、選択source identity不一致、選択source revision不一致を個別fixtureにする。期待oracleは欠落/stale/mismatchを区別し誤結合を止める。知識候補sourceのidentity/version/provenanceはprimary L1-009へ返す。選択CORE source自体のidentity/revision/provenance欠落は製品Coreへ返し、製品固有要件の不足はHARNESSへ返す。 |
| `L10-BRAIN-029-C10` | `BRAIN-029-AC-02` | sourceが互換でないと示すrelationを`compatible_with`として扱う変異を与える。期待oracleはedgeを拒否して互換candidateを返さず、relation meaningの矛盾を明示してBRAIN-L1-005へ返す（固定L2:573）。 |
| `L10-BRAIN-029-C11` | `BRAIN-029-AC-02` | relation meaning欠落と片端identity欠落を別々のfixtureで与える。期待oracleは欠落fieldを特定しrelation成立を推定せず、relation意味/endpoint不明をBRAIN-L1-005へ返す（固定L2:573）。 |
| `L10-BRAIN-029-C12` | `BRAIN-029-AC-02` | 一回の製品適用を根拠に確立Patternへ昇格させる変異を与える。期待oracleはcandidate stateを維持し、単一適用による即時昇格を拒否する。昇格はBRAIN-L1-009の構成candidate条件とL2-025の既存LABO→OS→BRAIN独立検証→採否経路にのみ従い、候補構成/source条件不足はBRAIN-L1-009へ返す（固定L2:573）。 |
| `L10-BRAIN-029-C13` | `BRAIN-029-AC-04` | relation meaning/condition不明のfixtureと選択source未充足のfixtureを分ける。期待oracleは各不足をunknownとして保持し、知識意味・条件・relationはBRAIN-L1-003/005/009、製品固有要件はHARNESSへ返す。 |
| `L10-BRAIN-029-C14` | `BRAIN-029-AC-04` | 未選択CORE source、未選択LABO source、説明資料だけの入力を個別に与える。期待oracleは各sourceを未観測または背景参照として記録し、必須条件を満たす根拠に昇格しない。 |
| `L10-BRAIN-029-C15` | `BRAIN-029-AC-05` | L11の未見別Domainまたは必須input欠落例を投入する。期待oracleはsourceで定義された条件だけ照合し、oracle未定枝をunknown/未評価とし、全領域の網羅を主張しない。 |
| `L10-BRAIN-029-C16` | `BRAIN-029-AC-02` | 常時必須L2-003 applicabilityのmissing変異を他条件を正常に保って単独投入する。L2-003のapplicabilityだけを欠落させる。期待oracleは常時必須fieldの不足と特定し、構成適用を止めてBRAIN-L1-003へ返す。 |
| `L10-BRAIN-029-C17` | `BRAIN-029-AC-02` | 常時必須L2-003 applicabilityのunknown変異を他条件を正常に保って単独投入する。L2-003のapplicabilityだけをunknownにする。期待oracleは不明を適用可能へ丸めず、unknownで停止しBRAIN-L1-003へ返す。 |
| `L10-BRAIN-029-C18` | `BRAIN-029-AC-02` | 常時必須L2-003 applicabilityのstale変異を他条件を正常に保って単独投入する。L2-003のapplicability sourceだけをstaleにする。期待oracleはstale理由を示し、構成適用を止めBRAIN-L1-003へ返す。 |
| `L10-BRAIN-029-C19` | `BRAIN-029-AC-02` | 常時必須L2-003 applicabilityのrevision mismatch変異を他条件を正常に保って単独投入する。L2-003のapplicability source revisionだけを要求revisionと不一致にする。期待oracleは旧revisionを流用せず停止しBRAIN-L1-003へ返す。 |
| `L10-BRAIN-029-C20` | `BRAIN-029-AC-02` | 常時必須L2-005 relation meaningのmissing変異を他条件を正常に保って単独投入する。L2-005のrelation meaningだけを欠落させる。期待oracleはrelation meaning不足を示し、edge成立を推定せずBRAIN-L1-005へ返す。 |
| `L10-BRAIN-029-C21` | `BRAIN-029-AC-02` | 常時必須L2-005 relation meaningのunknown変異を他条件を正常に保って単独投入する。L2-005のrelation meaningだけをunknownにする。期待oracleはunknownを保持し、互換/不成立へ丸めずBRAIN-L1-005へ返す。 |
| `L10-BRAIN-029-C22` | `BRAIN-029-AC-02` | 常時必須L2-005 relation meaningのstale変異を他条件を正常に保って単独投入する。L2-005のrelation meaning sourceだけをstaleにする。期待oracleはstale根拠を拒否しedge適用を止めBRAIN-L1-005へ返す。 |
| `L10-BRAIN-029-C23` | `BRAIN-029-AC-02` | 常時必須L2-005 relation meaningのrevision mismatch変異を他条件を正常に保って単独投入する。L2-005のrelation meaning revisionだけを不一致にする。期待oracleは旧revisionを再利用せずedge適用を止めBRAIN-L1-005へ返す。 |
| `L10-BRAIN-029-C24` | `BRAIN-029-AC-02` | 常時必須L2-008 identity/version/provenanceのmissing変異を他条件を正常に保って単独投入する。L2-008のidentity/version/provenanceのうち一つだけを欠落させる独立fixture。期待oracleは欠落fieldを名指しし、構成適用を止めprimary L1-009へ返す。 |
| `L10-BRAIN-029-C25` | `BRAIN-029-AC-02` | 常時必須L2-008 identity/version/provenanceのunknown変異を他条件を正常に保って単独投入する。L2-008のidentity/version/provenanceのうち一つだけをunknownにする独立fixture。期待oracleはunknownをcurrent等へ推定せず停止しprimary L1-009へ返す。 |
| `L10-BRAIN-029-C26` | `BRAIN-029-AC-02` | 常時必須L2-008 identity/version/provenanceのstale変異を他条件を正常に保って単独投入する。L2-008のidentity/version/provenance sourceのうち一つだけをstaleにする独立fixture。期待oracleはstale fieldを特定し停止してprimary L1-009へ返す。 |
| `L10-BRAIN-029-C27` | `BRAIN-029-AC-02` | 常時必須L2-008 identity/version/provenanceのrevision mismatch変異を他条件を正常に保って単独投入する。L2-008のidentity/version/provenance source revisionを一つだけ不一致にする独立fixture。期待oracleは旧revisionを流用せず停止しprimary L1-009へ返す。 |
| `L10-BRAIN-029-C28` | `BRAIN-029-AC-02` | 比較時のみL2-004のmissing変異を他条件を正常に保って単独投入する。比較操作を選択し、L2-004の比較基準だけを欠落させる。期待oracleは比較結果を出さず、比較基準不足としてprimary L1-009へ返す。 |
| `L10-BRAIN-029-C29` | `BRAIN-029-AC-02` | 比較時のみL2-004のunknown変異を他条件を正常に保って単独投入する。比較操作を選択し、L2-004の比較基準だけをunknownにする。期待oracleは比較優劣を決めずunknownで停止しprimary L1-009へ返す。 |
| `L10-BRAIN-029-C30` | `BRAIN-029-AC-02` | 比較時のみL2-004のstale変異を他条件を正常に保って単独投入する。比較操作を選択し、L2-004の比較sourceだけをstaleにする。期待oracleは古い基準で比較せず停止しprimary L1-009へ返す。 |
| `L10-BRAIN-029-C31` | `BRAIN-029-AC-02` | 比較時のみL2-004のrevision mismatch変異を他条件を正常に保って単独投入する。比較操作を選択し、L2-004の比較source revisionだけを不一致にする。期待oracleは旧revisionを流用せず比較を止めprimary L1-009へ返す。 |
| `L10-BRAIN-029-C32` | `BRAIN-029-AC-02` | 構成操作時のみL2-009のmissing変異を他条件を正常に保って単独投入する。構成candidate操作を選択し、L2-009の構成条件だけを欠落させる。期待oracleは構成candidateを返さず不足をprimary L1-009へ返す。 |
| `L10-BRAIN-029-C33` | `BRAIN-029-AC-02` | 構成操作時のみL2-009のunknown変異を他条件を正常に保って単独投入する。構成candidate操作を選択し、L2-009の構成条件だけをunknownにする。期待oracleはunknownを保持してcandidate適用を止めprimary L1-009へ返す。 |
| `L10-BRAIN-029-C34` | `BRAIN-029-AC-02` | 構成操作時のみL2-009のstale変異を他条件を正常に保って単独投入する。構成candidate操作を選択し、L2-009のsourceだけをstaleにする。期待oracleは旧sourceで構成せず停止してprimary L1-009へ返す。 |
| `L10-BRAIN-029-C35` | `BRAIN-029-AC-02` | 構成操作時のみL2-009のrevision mismatch変異を他条件を正常に保って単独投入する。構成candidate操作を選択し、L2-009のsource revisionだけを不一致にする。期待oracleは旧revisionを流用せず停止してprimary L1-009へ返す。 |
| `L10-BRAIN-029-C36` | `BRAIN-029-AC-02` | 選択CORE sourceのL2-018 source identityだけを欠落させる。他条件は正常に保ち、candidate適用を止めて選択元である製品Core（HELIX-HARNESS-CORE）へ返す（固定L2-018:401）。 |
| `L10-BRAIN-029-C37` | `BRAIN-029-AC-02` | 選択CORE sourceのL2-018 source revisionだけをunknownにする。他条件は正常に保ち、unknownを保持してcandidate適用を止め、製品Core（HELIX-HARNESS-CORE）へ返す（固定L2-018:401）。 |
| `L10-BRAIN-029-C38` | `BRAIN-029-AC-02` | 選択CORE sourceのL2-018 provenanceだけをstaleにする。他条件は正常に保ち、古いprovenanceを流用せずcandidate適用を止め、製品Core（HELIX-HARNESS-CORE）へ返す（固定L2-018:401）。 |
| `L10-BRAIN-029-C39` | `BRAIN-029-AC-02` | 選択CORE sourceのL2-018 source revisionを要求revisionと不一致にする。他条件は正常に保ち、別revisionを流用せずcandidate適用を止め、製品Core（HELIX-HARNESS-CORE）へ返す（固定L2-018:401）。 |
| `L10-BRAIN-029-C40` | `BRAIN-029-AC-02` | 選択LABO-evaluated sourceのL2-020のmissing変異を他条件を正常に保って単独投入する。LABO評価済みsourceを選択し、そのL2-020 source/scope/evaluationの一要素だけを欠落させる独立fixture。期待oracleは評価済みと扱わず不足をprimary L1-003/009へ返しcandidate適用を止める。 |
| `L10-BRAIN-029-C41` | `BRAIN-029-AC-02` | 選択LABO-evaluated sourceのL2-020のunknown変異を他条件を正常に保って単独投入する。LABO評価済みsourceを選択し、そのL2-020 source/scope/evaluationの一要素だけをunknownにする独立fixture。期待oracleはunknownを保持しprimary L1-003/009へ返してcandidate適用を止める。 |
| `L10-BRAIN-029-C42` | `BRAIN-029-AC-02` | 選択LABO-evaluated sourceのL2-020のstale変異を他条件を正常に保って単独投入する。LABO評価済みsourceだけをstaleにする。期待oracleは古い評価を使わずprimary L1-003/009へ返してcandidate適用を止める。 |
| `L10-BRAIN-029-C43` | `BRAIN-029-AC-02` | 選択LABO-evaluated sourceのL2-020のrevision mismatch変異を他条件を正常に保って単独投入する。LABO evaluation revisionだけを候補source revisionと不一致にする。期待oracleはrevision不一致を明示しprimary L1-003/009へ返してcandidate適用を止める。 |
| `L10-BRAIN-029-C44` | `BRAIN-029-AC-02` | 正常tupleからproblemだけを欠落させる。期待oracleは当該fieldだけを不足として識別し他fieldで補完せず候補構成を止める。知識problem不足はprimary L1-003へ、製品固有要件不足はHARNESSへ返す。 |
| `L10-BRAIN-029-C45` | `BRAIN-029-AC-02` | 正常tupleからapplicabilityだけを欠落させる。期待oracleは当該fieldだけを不足として識別し、他の正常fieldで補完せずcandidate構成を止める。適用条件の不足をprimary L1-003へ返す。 |
| `L10-BRAIN-029-C46` | `BRAIN-029-AC-02` | 正常tupleからrequired inputだけを欠落させる。期待oracleは当該fieldだけを不足として識別し、他の正常fieldで補完せずcandidate構成を止める。required inputの不足をprimary L1-003へ返す。 |
| `L10-BRAIN-029-C47` | `BRAIN-029-AC-02` | 正常tupleからconstraintだけを欠落させる。期待oracleは当該fieldだけを不足として識別し他fieldで補完せず候補構成を止める。知識constraint不足はprimary L1-003へ、製品固有要件不足はHARNESSへ返す。 |
| `L10-BRAIN-029-C48` | `BRAIN-029-AC-02` | 正常tupleからtrade-offだけを欠落させる。期待oracleは当該fieldだけを不足として識別し、他の正常fieldで補完せずcandidate構成を止める。知識trade-offの不足をprimary L1-003へ返す。 |
| `L10-BRAIN-029-C49` | `BRAIN-029-AC-02` | 正常tupleからnegative/failureだけを欠落させる。期待oracleは当該fieldだけを不足として識別し、他の正常fieldで補完せずcandidate構成を止める。知識negative/failureの不足をprimary L1-003へ返す。 |
| `L10-BRAIN-029-C50` | `BRAIN-029-AC-02` | 正常tupleからidentity/source/versionだけを欠落させる。期待oracleは当該fieldだけを不足として識別し他fieldで補完せず候補構成を止める。BRAIN候補source結合不足はprimary L1-009へ返す。選択CORE source自体のidentity/revision/provenance不足だけは製品Coreへ返し、製品固有要件不足はHARNESSへ返す。 |
| `L10-BRAIN-029-C51` | `BRAIN-029-AC-02` | 正常tupleからrelation type/両端identity/meaningだけを欠落させる。期待oracleは当該fieldだけを不足として識別し、他の正常fieldで補完せずcandidate構成を止める。relation意味・端点の不足をprimary L1-005へ返す。 |
| `L10-BRAIN-029-C52` | `BRAIN-029-AC-01` | 比較操作なし・構成candidate操作あり、CORE/LABO source未選択の正常入力を与える。期待oracleは未選択sourceを未観測として扱い、L2-004/018/020の値を要求せず、L2-009の構成条件と常時必須L2-003/005/008を照合してcandidate stateを返す。 |
| `L10-BRAIN-029-C53` | `BRAIN-029-AC-02` | sourceが互換不能と示す二Patternを選び、relation edgeを記録せず同じ構成candidateへ入れる。 期待oracle：L11:91の反例を個別検出し、関係のない二候補をcompatibleと推定せず構成成立を止める。relation意味・構成根拠の不足をprimary L1-005/009へ返す。 |

## Stage 4 — 採択済み親018/019/020/021/022/023/030のL10候補

**状態：未承認・未実行。** 固定L2/L11 `f6dad2a33e24f000b87d7f09b8d40288257e74cc`とmain `633bf12ea8f948db8ba3d6600179c4a9507377a7`の採択登録を対象とし、Stage 4の7親だけを照合する。全caseは宣言済み合成fixtureで、製品値を決定しない。旧test/runtime/CIを実行せず、旧case ID・閾値を移植しない。source / full-span pinsは本追補の時点監査へ記録する。


### 固定親句からAC/CASEへの対応

CASE番号は各親見出し内で一意。各列の固定句は親source全文と時点監査のraw pinに照合する。

| 親 | 固定親の条件（物理source） | FR/AC | 独立CASE |
|---|---|---|---|
| `HELIXBRAIN-L2-018` | 候補/source/provenance/revisionとreceiver identity（L2:394–403） | `BRAIN-018-FR-01`; `BRAIN-018-AC-01` | `L10-BRAIN-018-C01` |
| `HELIXBRAIN-L2-018` | product-specific relation保持、raw original禁止（L2:397–402） | `BRAIN-018-AC-01`, `BRAIN-018-AC-02` | `L10-BRAIN-018-C02`, `L10-BRAIN-018-C03`, `L10-BRAIN-018-C04`, `L10-BRAIN-018-C05`, `L10-BRAIN-018-C06`, `L10-BRAIN-018-C07`, `L10-BRAIN-018-C08`, `L10-BRAIN-018-R-product-relation-missing`, `L10-BRAIN-018-R-contract-identity-missing`, `L10-BRAIN-018-R-contract-version-unknown` |
| `HELIXBRAIN-L2-018` | candidate receiptはaccepted/matureでない。分離不能はProduct Core（L2:400–403; L11:58） | `BRAIN-018-AC-02`, `BRAIN-018-AC-03` | `L10-BRAIN-018-C09`, `L10-BRAIN-018-C10`, `L10-BRAIN-018-C11`, `L10-BRAIN-018-C12`, `L10-BRAIN-018-C13`, `L10-BRAIN-018-C14`, `L10-BRAIN-018-C15` |
| `HELIXBRAIN-L2-019` | query scope/required input/constraint（L2:404–410） | `BRAIN-019-AC-01`, `BRAIN-019-AC-02` | `L10-BRAIN-019-C01`, `L10-BRAIN-019-C02`, `L10-BRAIN-019-C03`, `L10-BRAIN-019-R-query-constraint`, `L10-BRAIN-019-R-query-identity`, `L10-BRAIN-019-R-query-version`, `L10-BRAIN-019-R-contract-identity-missing`, `L10-BRAIN-019-R-contract-version-unknown` |
| `HELIXBRAIN-L2-019` | 候補response全field・exact version（L2:407–410） | `BRAIN-019-AC-01`, `BRAIN-019-AC-02` | `L10-BRAIN-019-C04`, `L10-BRAIN-019-C05`, `L10-BRAIN-019-C06`, `L10-BRAIN-019-C07`, `L10-BRAIN-019-C08`, `L10-BRAIN-019-C09`, `L10-BRAIN-019-C10`, `L10-BRAIN-019-C11`, `L10-BRAIN-019-C12`, `L10-BRAIN-019-C13`, `L10-BRAIN-019-R-response-required`, `L10-BRAIN-019-R-response-constraint`, `L10-BRAIN-019-R-response-applicability` |
| `HELIXBRAIN-L2-019` | 複数候補を保ちunknownを推薦化せず採用しない（L2:408–411; L11:59） | `BRAIN-019-AC-01`, `BRAIN-019-AC-02`, `BRAIN-019-AC-03` | `L10-BRAIN-019-C14`, `L10-BRAIN-019-C15`, `L10-BRAIN-019-R-multiple-candidates` |
| `HELIXBRAIN-L2-020` | evaluation対象/candidate revision、scope/method/evidence/result/failure/counterexample/unassessed range（L2:414–420） | `BRAIN-020-AC-01`, `BRAIN-020-AC-02` | `L10-BRAIN-020-C01`, `L10-BRAIN-020-C02`, `L10-BRAIN-020-C03`, `L10-BRAIN-020-C04`, `L10-BRAIN-020-C05`, `L10-BRAIN-020-C06`, `L10-BRAIN-020-C07`, `L10-BRAIN-020-C08`, `L10-BRAIN-020-C09`, `L10-BRAIN-020-C10`, `L10-BRAIN-020-R-source-identity-missing`, `L10-BRAIN-020-R-version-missing`, `L10-BRAIN-020-R-evaluation-identity-missing`, `L10-BRAIN-020-R-contract-identity-missing`, `L10-BRAIN-020-R-contract-version-unknown` |
| `HELIXBRAIN-L2-020` | generic provenance/identity/stateと選択時INFRA-017同revision state/evidence（L2:419–420; L11:60） | `BRAIN-020-AC-01`, `BRAIN-020-AC-02` | `L10-BRAIN-020-R-007008-provenance-missing`, `L10-BRAIN-020-R-identity-missing`, `L10-BRAIN-020-R-state-missing`, `L10-BRAIN-020-R-infra-state-normal`, `L10-BRAIN-020-R-infra-state-missing`, `L10-BRAIN-020-R-infra-evidence-missing`, `L10-BRAIN-020-R-infra-revision`, `L10-BRAIN-020-R-infra-unselected` |
| `HELIXBRAIN-L2-020` | 単一成功/AI生成/evaluation resultのみで成熟・採用せず、OS登録・独立検証を先取りしない（L2:418–421; L11:60） | `BRAIN-020-AC-02`, `BRAIN-020-AC-03` | `L10-BRAIN-020-C11`, `L10-BRAIN-020-C12`, `L10-BRAIN-020-C13`, `L10-BRAIN-020-C14`, `L10-BRAIN-020-R-evaluation-promotion`, `L10-BRAIN-020-R-independent-verification`, `L10-BRAIN-020-R-os-registration-pending` |
| `HELIXBRAIN-L2-021` | INTELLIGENCE query/scopeにsource/version付き判断材料を返す（L2:424–430） | `BRAIN-021-AC-01`, `BRAIN-021-AC-02` | `L10-BRAIN-021-C01`, `L10-BRAIN-021-C02`, `L10-BRAIN-021-C03`, `L10-BRAIN-021-C04`, `L10-BRAIN-021-C05`, `L10-BRAIN-021-C06`, `L10-BRAIN-021-C07`, `L10-BRAIN-021-C08`, `L10-BRAIN-021-C09`, `L10-BRAIN-021-C10`, `L10-BRAIN-021-C11`, `L10-BRAIN-021-C12`, `L10-BRAIN-021-R-version-mismatch`, `L10-BRAIN-021-R-contract-identity-missing`, `L10-BRAIN-021-R-contract-version-unknown` |
| `HELIXBRAIN-L2-021` | BRAIN runtime conclusion/選択なし、INTELLIGENCEによる改変・採用なし（L2:429–433; L11:61） | `BRAIN-021-AC-02`, `BRAIN-021-AC-03` | `L10-BRAIN-021-C13`, `L10-BRAIN-021-C14`, `L10-BRAIN-021-C15`, `L10-BRAIN-021-R-adoption` |
| `HELIXBRAIN-L2-022` | required input/dependencyからHARNESS-L2-009 obligationへの双方向trace（L2:434–440） | `BRAIN-022-AC-01`, `BRAIN-022-AC-02` | `L10-BRAIN-022-C01`, `L10-BRAIN-022-C03`, `L10-BRAIN-022-C04`, `L10-BRAIN-022-C05`, `L10-BRAIN-022-C06`, `L10-BRAIN-022-C07`, `L10-BRAIN-022-C08`, `L10-BRAIN-022-R-field-definition-missing` |
| `HELIXBRAIN-L2-022` | 値unknown/open obligation、製品値/設計選択/工程表等の単独決定禁止（L2:439–443; L11:62） | `BRAIN-022-AC-01`, `BRAIN-022-AC-02`, `BRAIN-022-AC-03` | `L10-BRAIN-022-C02`, `L10-BRAIN-022-C09`, `L10-BRAIN-022-C10`, `L10-BRAIN-022-C11`, `L10-BRAIN-022-C12`, `L10-BRAIN-022-C13`, `L10-BRAIN-022-R-design-choice`, `L10-BRAIN-022-R-priority` |
| `HELIXBRAIN-L2-023` | generic Visual Design/UXとProduct Core残余、applicability/required input/counterexample（L2:444–450） | `BRAIN-023-AC-01`, `BRAIN-023-AC-02` | `L10-BRAIN-023-C01`, `L10-BRAIN-023-C02`, `L10-BRAIN-023-C03`, `L10-BRAIN-023-C04`, `L10-BRAIN-023-C05`, `L10-BRAIN-023-C07`, `L10-BRAIN-023-C08`, `L10-BRAIN-023-R-applicability-missing`, `L10-BRAIN-023-R-required-input-missing`, `L10-BRAIN-023-R-counterexample-missing` |
| `HELIXBRAIN-L2-023` | LABO経由利用結果、直接昇格禁止、未評価保持（L2:448–453; L11:63） | `BRAIN-023-AC-01`, `BRAIN-023-AC-02`, `BRAIN-023-AC-03` | `L10-BRAIN-023-C06`, `L10-BRAIN-023-C09`, `L10-BRAIN-023-C10` |
| `HELIXBRAIN-L2-030` | 常時contract identity/version/compatibility、schema/scope/correlation、receiver HARNESS-L2-009（L2:575–584; L11:85, 97–117） | `BRAIN-030-AC-01`, `BRAIN-030-AC-02` | `L10-BRAIN-030-C01`, `L10-BRAIN-030-C03`, `L10-BRAIN-030-C04`, `L10-BRAIN-030-C05`, `L10-BRAIN-030-C06`, `L10-BRAIN-030-C07`, `L10-BRAIN-030-C08`, `L10-BRAIN-030-C09`, `L10-BRAIN-030-C10`, `L10-BRAIN-030-C11`, `L10-BRAIN-030-C12`, `L10-BRAIN-030-C13`, `L10-BRAIN-030-C14`, `L10-BRAIN-030-C15`, `L10-BRAIN-030-C16`, `L10-BRAIN-030-R-compatibility-range-missing` |
| `HELIXBRAIN-L2-030` | 選択knowledge各field、未選択source未観測、reference-only境界（L2:576–583; L11:97–110） | `BRAIN-030-AC-01`, `BRAIN-030-AC-03`, `BRAIN-030-AC-05` | `L10-BRAIN-030-C02`, `L10-BRAIN-030-C17`, `L10-BRAIN-030-C18`, `L10-BRAIN-030-C19`, `L10-BRAIN-030-C20`, `L10-BRAIN-030-C21`, `L10-BRAIN-030-C22`, `L10-BRAIN-030-C23`, `L10-BRAIN-030-C24`, `L10-BRAIN-030-C25`, `L10-BRAIN-030-C31`, `L10-BRAIN-030-C32`, `L10-BRAIN-030-C33`, `L10-BRAIN-030-C34`, `L10-BRAIN-030-C35`, `L10-BRAIN-030-R-correlation-mismatch`, `L10-BRAIN-030-R-version-stale`, `L10-BRAIN-030-R-version-mismatch`, `L10-BRAIN-030-R-source-mismatch`, `L10-BRAIN-030-R-applicability-unknown`, `L10-BRAIN-030-R-reference-substitution`, `L10-BRAIN-030-R-relation-conflict` |
| `HELIXBRAIN-L2-030` | 双方向trace/obligation receipt、未完義務、製品固有結論禁止・非昇格（L2:580–584; L11:85, 101–117） | `BRAIN-030-AC-04`, `BRAIN-030-AC-05` | `L10-BRAIN-030-C26`, `L10-BRAIN-030-C27`, `L10-BRAIN-030-C28`, `L10-BRAIN-030-C29`, `L10-BRAIN-030-C30`, `L10-BRAIN-030-R-reverse-revision`, `L10-BRAIN-030-R-reverse-field`, `L10-BRAIN-030-R-reverse-scope`, `L10-BRAIN-030-R-obligation-receipt`, `L10-BRAIN-030-R-design-completion`, `L10-BRAIN-030-R-implementation-ready`, `L10-BRAIN-030-R-state-conclusion`, `L10-BRAIN-030-R-permission-conclusion`, `L10-BRAIN-030-R-design-conclusion`, `L10-BRAIN-030-R-screen-conclusion`, `L10-BRAIN-030-R-db-conclusion`, `L10-BRAIN-030-R-mixed-fields` |


### HELIXBRAIN-L2-018 — `BRAIN-018-FR-01`

- **L10-BRAIN-018-C01 (AC-01, 正常)**：HELIX-HARNESS-COREが抽出済candidate、source/provenance/revision、generic candidateと製品固有残余の関係、receiver identityを渡し、raw originalなし。**期待**：candidate receiptを返すがaccepted/matureにはしない。
- **L10-BRAIN-018-C02 (AC-02, 個別negative)**：raw originalを入力に追加する。**期待**：intakeを拒否しProduct Coreへ戻す。
- **L10-BRAIN-018-C03 (AC-02, 独立negative)**：同じ親のC01正常fixtureで他fieldを保持し、製品名だけをgeneric candidateへ混入する。**期待**：該当fieldだけを特定して隔離し、Product Coreへ戻す。
- **L10-BRAIN-018-C04 (AC-02, 独立negative)**：同じ親のC01正常fixtureで他fieldを保持し、製品要求だけをgeneric candidateへ混入する。**期待**：該当fieldだけを特定して隔離し、Product Coreへ戻す。
- **L10-BRAIN-018-C05 (AC-02, 独立negative)**：同じ親のC01正常fixtureで他fieldを保持し、画面だけをgeneric candidateへ混入する。**期待**：該当fieldだけを特定して隔離し、Product Coreへ戻す。
- **L10-BRAIN-018-C06 (AC-02, 独立negative)**：同じ親のC01正常fixtureで他fieldを保持し、業務規則だけをgeneric candidateへ混入する。**期待**：該当fieldだけを特定して隔離し、Product Coreへ戻す。
- **L10-BRAIN-018-C07 (AC-02, 独立negative)**：同じ親のC01正常fixtureで他fieldを保持し、利用者判断だけをgeneric candidateへ混入する。**期待**：該当fieldだけを特定して隔離し、Product Coreへ戻す。
- **L10-BRAIN-018-C08 (AC-02, 独立negative)**：同親C01の正常fixtureで他fieldを保ち、raw originalを汎用知識として保存する試行だけを加える。**期待**：保存を拒み、原本の保持期限/破棄証拠を新設せずProduct Coreへ戻す。
- **L10-BRAIN-018-C09 (AC-02, 独立negative)**：同じ親のC01正常fixtureで他fieldを保持し、source identity欠落させる。**期待**：receiptを確定せず不足fieldを示し、由来不明はProduct Coreへ戻す。
- **L10-BRAIN-018-C10 (AC-02, 独立negative)**：同じ親のC01正常fixtureで他fieldを保持し、source revision欠落させる。**期待**：receiptを確定せず不足fieldを示し、由来不明はProduct Coreへ戻す。
- **L10-BRAIN-018-C11 (AC-02, 独立negative)**：同じ親のC01正常fixtureで他fieldを保持し、provenance欠落させる。**期待**：receiptを確定せず不足fieldを示し、由来不明はProduct Coreへ戻す。
- **L10-BRAIN-018-C12 (AC-02, 独立negative)**：同じ親のC01正常fixtureで他fieldを保持し、receiver identity欠落させる。**期待**：receiptを確定せず不足fieldを示し、由来不明はProduct Coreへ戻す。
- **L10-BRAIN-018-C13 (AC-02, 独立negative)**：他条件を正常に保ちreceipt受領のみでaccepted/matureへ進める変異。**期待**：candidate stateを保持し昇格を拒否する。
- **L10-BRAIN-018-C14 (AC-03, 未見正常)**：未見製品領域の合成sourceでgeneric部分と製品固有残余を根拠付きで分離する。**期待**：分離できるcandidateのみ受領する。
- **L10-BRAIN-018-C15 (AC-03, 局所unknown)**：同じ未見sourceの一fieldだけ意味境界が不明。**期待**：該当部分のみunknown/隔離し、既知部分のcandidateを全体昇格しない。
- **L10-BRAIN-018-R-product-relation-missing (AC-02, 独立negative)**：同親C01の正常fixtureで他fieldを保ち、抽出candidateと製品固有残余のrelationだけを欠落させる。**期待**：relationを推測せず該当candidateを隔離しProduct Coreへ返す。

- **L10-BRAIN-018-R-contract-identity-missing (AC-02, 独立negative)**：同親C01正常fixtureで他fieldを保持し、HELIX-HARNESS-COREの候補出力contract identityだけを欠落させる。**期待**：contractに結び付けられない候補receiptを保留しProduct Coreへ戻す。
- **L10-BRAIN-018-R-contract-version-unknown (AC-02, 独立negative)**：同親C01正常fixtureで他fieldを保持し、候補出力contract versionだけをunknownにする。**期待**：versionを推測せずreceiptを保留しProduct Coreへ戻す。

### HELIXBRAIN-L2-019 — `BRAIN-019-FR-01`

- **L10-BRAIN-019-C01 (AC-01, 正常)**：scope・required input・constraintと二つ以上の成立候補A/Bを与え、両候補にsource identity/version、relation（conflicts_with/alternative_to）、condition、required input、counterexample、evidence、maturityを対応付ける。**期待**：HARNESS-CORE向けreceiptで両候補と未決選択を保持し、BRAINは採用先を選ばない。
- **L10-BRAIN-019-C02 (AC-02, 個別negative)**：同じ親のC01正常fixtureで他fieldを保持し、query対象scope欠落させる。**期待**：query不足はProduct Coreへ照会する。
- **L10-BRAIN-019-C03 (AC-02, 個別negative)**：同じ親のC01正常fixtureで他fieldを保持し、query required input欠落させる。**期待**：query不足はProduct Coreへ照会する。
- **L10-BRAIN-019-C04 (AC-02, 個別negative)**：同じ親のC01正常fixtureで他fieldを保持し、candidate identity欠落させる。**期待**：candidate identity不足をBRAINのL2-003/008または親L1へ戻し、query不足と混同しない。
- **L10-BRAIN-019-C05 (AC-02, 個別negative)**：同親C01正常fixtureで他fieldを保持し、candidate versionだけを欠落させる。**期待**：推薦を保留し、BRAIN L2-003/008または親L1へ戻す。
- **L10-BRAIN-019-C06 (AC-02, 個別negative)**：同親C01正常fixtureで他fieldを保持し、参照revisionだけを不一致にする。**期待**：推薦を保留し、BRAIN L2-003/008または親L1へ戻す。
- **L10-BRAIN-019-C07 (AC-02, 独立negative)**：同親C01正常fixtureで他fieldを保持し、alternative fieldだけを欠落させる。**期待**：当該候補のresponseを不完全として推薦せず、BRAIN L2-008へ返す。
- **L10-BRAIN-019-C08 (AC-02, 独立negative)**：同親C01正常fixtureで他fieldを保持し、relation fieldだけを欠落させる。**期待**：当該候補のresponseを不完全として推薦せず、BRAIN L2-008へ返す。
- **L10-BRAIN-019-C09 (AC-02, 独立negative)**：同親C01正常fixtureで他fieldを保持し、trade-off fieldだけを欠落させる。**期待**：当該候補のresponseを不完全として推薦せず、BRAIN L2-008へ返す。
- **L10-BRAIN-019-C10 (AC-02, 独立negative)**：同親C01正常fixtureで他fieldを保持し、counterexample fieldだけを欠落させる。**期待**：当該候補のresponseを不完全として推薦せず、BRAIN L2-008へ返す。
- **L10-BRAIN-019-C11 (AC-02, 独立negative)**：同親C01正常fixtureで他fieldを保持し、evidence fieldだけを欠落させる。**期待**：当該候補のresponseを不完全として推薦せず、BRAIN L2-008へ返す。
- **L10-BRAIN-019-C12 (AC-02, 独立negative)**：同親C01正常fixtureで他fieldを保持し、maturity fieldだけを欠落させる。**期待**：当該候補のresponseを不完全として推薦せず、BRAIN L2-008へ返す。
- **L10-BRAIN-019-C13 (AC-02, 独立negative)**：候補の適用可能性unknownを推薦へ変換。**期待**：推薦なし/保留を維持する。
- **L10-BRAIN-019-C14 (AC-02, 独立negative)**：candidate responseを案件採用決定として返す。**期待**：採用stateを作らず候補として返す。
- **L10-BRAIN-019-C15 (AC-03, 未見正常/局所unknown)**：未見課題でquery fieldは揃い、候補A/BのうちBだけ適用可否unknown。**期待**：Aは既知情報を返し、Bだけ保留し、未知を不存在または適用可能としない。

- **L10-BRAIN-019-R-query-constraint (AC-02, 独立fixture)**：同親C01の正常source/revision/scopeと他必須fieldを保持し、query constraintだけを欠落。**期待**：不足inputをProduct Coreへ照会し知識候補を採用しない。
- **L10-BRAIN-019-R-query-identity (AC-02, 独立fixture)**：同親C01の正常source/revision/scopeと他必須fieldを保持し、参照可能knowledge identityだけを欠落。**期待**：不足queryをProduct Coreへ戻す。
- **L10-BRAIN-019-R-query-version (AC-02, 独立fixture)**：同親C01の正常source/revision/scopeと他必須fieldを保持し、参照可能knowledge versionだけを欠落。**期待**：不足queryをProduct Coreへ戻す。
- **L10-BRAIN-019-R-response-required (AC-02, 独立fixture)**：同親C01の正常source/revision/scopeと他必須fieldを保持し、候補response required inputだけを欠落。**期待**：候補の欠落fieldを保持しBRAIN L2-003/008または親L1へ戻す。
- **L10-BRAIN-019-R-response-constraint (AC-02, 独立fixture)**：同親C01の正常source/revision/scopeと他必須fieldを保持し、候補constraintだけを欠落。**期待**：候補の欠落fieldを保持しBRAIN L2-003/008または親L1へ戻す。
- **L10-BRAIN-019-R-response-applicability (AC-02, 独立fixture)**：同親C01の正常source/revision/scopeと他必須fieldを保持し、候補applicabilityだけを欠落。**期待**：適用確定せず候補の不足をBRAINへ戻す。
- **L10-BRAIN-019-R-multiple-candidates (AC-02, 独立fixture)**：同親C01の正常source/revision/scopeと他必須fieldを保持し、二つの成立候補のうち一方だけを根拠なく消去。**期待**：複数成立候補を保ち選択は接続先に残す。

- **L10-BRAIN-019-R-contract-identity-missing (AC-02, 独立negative)**：同親C01正常fixtureで他fieldを保持し、HARNESS-CORE受領contract identityだけを欠落させる。**期待**：受領contractへ結べないresponseを保留しProduct Coreへ照会する。
- **L10-BRAIN-019-R-contract-version-unknown (AC-02, 独立negative)**：同親C01正常fixtureで他fieldを保持し、HARNESS-CORE受領contract versionだけをunknownにする。**期待**：versionを推測せずresponseを保留しProduct Coreへ照会する。

### HELIXBRAIN-L2-020 — `BRAIN-020-FR-01`

- **L10-BRAIN-020-C01 (AC-01, 正常)**：candidate revisionと一致するLABO evaluation receiptにscope/method/evidence/result/failure/counterexample/unassessed rangeおよびsource/version/evaluation identityを与える。**期待**：全項目を結び、候補input receiptとして返す。OS登録・独立検証・採否は未決。
- **L10-BRAIN-020-C02 (AC-02, 個別negative)**：同じ親のC01正常fixtureで他fieldを保持し、evaluation target revision不一致にする。**期待**：評価receiptの受渡しを止めLABOへ戻す。
- **L10-BRAIN-020-C03 (AC-02, 個別negative)**：同じ親のC01正常fixtureで他fieldを保持し、candidate revision不一致にする。**期待**：評価receiptの受渡しを止めLABOへ戻す。
- **L10-BRAIN-020-C04 (AC-02, 独立negative)**：同親C01正常fixtureで他fieldを保持し、evaluation scopeだけを欠落させる。**期待**：候補をunknown/unfinishedに保ち、evaluation不足をLABOへ戻す。
- **L10-BRAIN-020-C05 (AC-02, 独立negative)**：同親C01正常fixtureで他fieldを保持し、methodだけを欠落させる。**期待**：候補をunknown/unfinishedに保ち、evaluation不足をLABOへ戻す。
- **L10-BRAIN-020-C06 (AC-02, 独立negative)**：同親C01正常fixtureで他fieldを保持し、evidenceだけを欠落させる。**期待**：候補をunknown/unfinishedに保ち、evaluation evidence不足をLABOへ戻す。
- **L10-BRAIN-020-C07 (AC-02, 独立negative)**：同親C01正常fixtureで他fieldを保持し、resultだけを欠落させる。**期待**：候補をunknown/unfinishedに保ち、evaluation不足をLABOへ戻す。
- **L10-BRAIN-020-C08 (AC-02, 独立negative)**：同親C01正常fixtureで他fieldを保持し、failure fieldだけを欠落させる。**期待**：候補をunknown/unfinishedに保ち、failure evidence不足をLABOへ戻す。
- **L10-BRAIN-020-C09 (AC-02, 独立negative)**：同親C01正常fixtureで他fieldを保持し、counterexampleだけを欠落させる。**期待**：候補をunknown/unfinishedに保ち、反例不足をLABOへ戻す。
- **L10-BRAIN-020-C10 (AC-02, 独立negative)**：同親C01正常fixtureで他fieldを保持し、unassessed rangeだけを欠落させる。**期待**：候補をunknown/unfinishedに保ち、未評価範囲不足をLABOへ戻す。
- **L10-BRAIN-020-C11 (AC-02, 独立negative)**：一回の成功だけで成熟/採用へ進める。**期待**：成熟/採用へ進めず、候補をLABOへ評価不足として戻す。OS登録とBRAIN独立検証の状態は変更しない。
- **L10-BRAIN-020-C12 (AC-02, 独立negative)**：AI生成だけで確立Patternにする。**期待**：AI生成だけで確立Patternにせずcandidateを保持し、評価の不足をLABOへ戻す。OS登録とBRAIN独立検証の状態は変更しない。
- **L10-BRAIN-020-C13 (AC-02, 独立negative)**：receipt内容からOS registration stateを決める。**期待**：OS状態を変更せずOSへ返す。
- **L10-BRAIN-020-C14 (AC-03, 未見正常)**：未見scopeの測定済範囲と未評価範囲を分け同一candidate revisionへ結ぶ。**期待**：測定済部分のみ保持し未評価範囲を全体へ一般化しない。

- **L10-BRAIN-020-R-source-identity-missing (AC-02, 独立fixture)**：同親C01の正常source/revision/scopeと他必須fieldを保持し、evaluation receiptのsource identityだけを欠落。**期待**：L2-007 generic provenanceの欠落をunknownとして保持し、candidate evidenceをLABOへ戻す。
- **L10-BRAIN-020-R-version-missing (AC-02, 独立fixture)**：同親C01の正常source/revision/scopeと他必須fieldを保持し、evaluation receiptのversionだけを欠落。**期待**：L2-007 generic provenanceの欠落をunknownとして保持し、candidate evidenceをLABOへ戻す。
- **L10-BRAIN-020-R-evaluation-identity-missing (AC-02, 独立fixture)**：同親C01の正常source/revision/scopeと他必須fieldを保持し、evaluation receiptのevaluation identityだけを欠落。**期待**：L2-007 generic provenanceの欠落をunknownとして保持し、candidate evidenceをLABOへ戻す。
- **L10-BRAIN-020-R-evaluation-promotion (AC-02, 独立fixture)**：同親C01の正常source/revision/scopeと他必須fieldを保持し、評価resultだけでacceptedへ昇格。**期待**：候補のまま保ち評価・OS登録・BRAIN独立検証・採否を別stateで追う。
- **L10-BRAIN-020-R-independent-verification (AC-02, 独立fixture)**：同親C01の正常source/revision/scopeと他必須fieldを保持し、BRAIN内独立検証だけを省いてmatureへ昇格。**期待**：昇格を拒否しBRAIN内独立検証を未完として保持。
- **L10-BRAIN-020-R-infra-state-normal (AC-01, 独立fixture)**：同親C01の正常source/revision/scopeと他必須fieldを保持し、Infrastructure candidateのmaturity評価を選択し、INFRA017 state/evidenceも同candidate revisionへ結ぶ。**期待**：該当時だけstate/evidenceを保持しcandidateとして受領、採用を生成しない。
- **L10-BRAIN-020-R-infra-state-missing (AC-02, 独立fixture)**：同親C01の正常source/revision/scopeと他必須fieldを保持し、Infrastructure maturity評価を選択したままstateだけ欠落。**期待**：当該stateをunknownとし昇格しない。Infrastructure state/evidence不足はINFRASTRUCTURE、evaluation contract不足はLABOへ戻す。OS登録状態の正本はOSへ返す。
- **L10-BRAIN-020-R-infra-evidence-missing (AC-02, 独立fixture)**：同親C01の正常source/revision/scopeと他必須fieldを保持し、Infrastructure maturity評価を選択したままevidenceだけ欠落。**期待**：当該Infrastructure state/evidence不足はINFRASTRUCTUREへ返しcandidateを保持する。
- **L10-BRAIN-020-R-infra-revision (AC-02, 独立fixture)**：同親C01の正常source/revision/scopeと他必須fieldを保持し、Infrastructure state/evidenceだけを別candidate revisionへ結合。**期待**：誤結合を拒否しInfrastructure state/evidence不足をINFRASTRUCTUREへ戻す。
- **L10-BRAIN-020-R-infra-unselected (AC-03, 独立fixture)**：同親C01の正常source/revision/scopeと他必須fieldを保持し、非Infrastructure candidateを未見scopeで評価し、INFRA017を選択しない。**期待**：条件付き依存を強制せず対象revisionのcandidateだけを受領。
- **L10-BRAIN-020-R-007008-provenance-missing (AC-02, 独立negative)**：同親C01の正常fixtureで他fieldを保ち、L2-007 generic provenanceだけを欠落させる。**期待**：候補をunknown/unfinishedに保ちprovenance不足をLABOへ返す。
- **L10-BRAIN-020-R-identity-missing (AC-02, 独立negative)**：同親C01の正常fixtureで他fieldを保ち、L2-008 identityだけを欠落させる。**期待**：L2-008 identityの欠落をunknownとして保持し、知識identityをBRAINへ戻す。
- **L10-BRAIN-020-R-state-missing (AC-02, 独立negative)**：同親C01の正常fixtureで他fieldを保ち、L2-008 generic stateだけを欠落させる。**期待**：L2-008 generic knowledge stateの欠落をunknownとして保持し、知識stateの責務としてBRAINへ戻す。
- **L10-BRAIN-020-R-os-registration-pending (AC-02, 独立negative)**：同親C01の正常fixtureで評価が存在する一方、OS登録/振分けが未了のstateだけを与え、BRAIN maturity/採否を先取りする。**期待**：OS登録stateは未完のままOSへ戻し、BRAINは確立/採用にしない。

- **L10-BRAIN-020-R-contract-identity-missing (AC-02, 独立negative)**：同親C01正常fixtureで他fieldを保持し、LABO evaluation contract identityだけを欠落させる。**期待**：evaluation receiptを受領せずLABOへ不足を返す。
- **L10-BRAIN-020-R-contract-version-unknown (AC-02, 独立negative)**：同親C01正常fixtureで他fieldを保持し、LABO evaluation contract versionだけをunknownにする。**期待**：versionを推測せずevaluation receiptを保留しLABOへ返す。

### HELIXBRAIN-L2-021 — `BRAIN-021-FR-01`

- **L10-BRAIN-021-C01 (AC-01, 正常)**：有効scope/source/revisionとrequired input、conditions、alternative、constraint、counterexample、evidenceを与える。**期待**：source付き判断材料を返すがruntime結論・knowledge adoptionを行わない。
- **L10-BRAIN-021-C02 (AC-02, 独立negative)**：同じ親のC01正常fixtureで他fieldを保持し、query scope欠落させる。**期待**：scope不足/不一致をINTELLIGENCEへ返し、BRAIN側knowledge状態を変えない。
- **L10-BRAIN-021-C03 (AC-02, 独立negative)**：同じ親のC01正常fixtureで他fieldを保持し、query scopeを別対象にする。**期待**：scope不足/不一致をINTELLIGENCEへ返し、BRAIN側knowledge状態を変えない。
- **L10-BRAIN-021-C04 (AC-02, 独立negative)**：同じ親のC01正常fixtureで他fieldを保持し、knowledge source identity欠落させる。**期待**：knowledge identity/source/version不整合をBRAINの該当親L1へ戻す。
- **L10-BRAIN-021-C05 (AC-02, 独立negative)**：同じ親のC01正常fixtureで他fieldを保持し、knowledge version欠落させる。**期待**：knowledge identity/source/version不整合をBRAINの該当親L1へ戻す。
- **L10-BRAIN-021-C06 (AC-02, 独立negative)**：同じ親のC01正常fixtureで他fieldを保持し、knowledge version staleにする。**期待**：knowledge identity/source/version不整合をBRAINの該当親L1へ戻す。
- **L10-BRAIN-021-C07 (AC-02, 独立negative)**：同じ親のC01正常fixtureで他fieldを保持し、required input欠落させる。**期待**：当該候補の判断材料が不完全として推薦せず、field/sourceの補完をBRAINの該当親L1へ戻す。
- **L10-BRAIN-021-C08 (AC-02, 独立negative)**：同じ親のC01正常fixtureで他fieldを保持し、condition欠落させる。**期待**：当該候補の判断材料が不完全として推薦せず、field/sourceの補完をBRAINの該当親L1へ戻す。
- **L10-BRAIN-021-C09 (AC-02, 独立negative)**：同じ親のC01正常fixtureで他fieldを保持し、alternative欠落させる。**期待**：当該候補の判断材料が不完全として推薦せず、field/sourceの補完をBRAINの該当親L1へ戻す。
- **L10-BRAIN-021-C10 (AC-02, 独立negative)**：同じ親のC01正常fixtureで他fieldを保持し、constraint欠落させる。**期待**：当該候補の判断材料が不完全として推薦せず、field/sourceの補完をBRAINの該当親L1へ戻す。
- **L10-BRAIN-021-C11 (AC-02, 独立negative)**：同じ親のC01正常fixtureで他fieldを保持し、counterexample欠落させる。**期待**：当該候補の判断材料が不完全として推薦せず、field/sourceの補完をBRAINの該当親L1へ戻す。
- **L10-BRAIN-021-C12 (AC-02, 独立negative)**：同じ親のC01正常fixtureで他fieldを保持し、evidence欠落させる。**期待**：当該候補の判断材料が不完全として推薦せず、field/sourceの補完をBRAINの該当親L1へ戻す。
- **L10-BRAIN-021-C13 (AC-02, 独立negative)**：BRAINがruntime選択/結論を回答へ追加する。**期待**：runtime結論を出さず、意味判断はINTELLIGENCEへ残す。
- **L10-BRAIN-021-C14 (AC-02, 独立negative)**：INTELLIGENCEがBRAIN knowledge revisionを暗黙変更する。**期待**：変更/採用を拒否し、知識stateのauthorityをBRAINに残す。
- **L10-BRAIN-021-C15 (AC-03, 未見正常/局所unknown)**：未知query種でも有効source/scopeの既知fieldは返し、判断内容一項目だけunknownとする。**期待**：未知部分のみunknown、runtime actionは生成しない。

- **L10-BRAIN-021-R-version-mismatch (AC-02, 独立fixture)**：同親C01の正常source/revision/scopeと他必須fieldを保持し、knowledge versionだけをqueryが参照するrevisionと不一致にする。**期待**：知識版不整合をBRAIN L1へ返す。
- **L10-BRAIN-021-R-adoption (AC-02, 独立negative)**：正常判断材料を返す同一scopeで、INTELLIGENCEがそのcandidateをBRAIN knowledgeの採用/改変済みstateとして確定する変異だけを与える。**期待**：runtime選択だけでなくknowledge adoptionも拒否し、BRAINの既存知識stateを保持する。

- **L10-BRAIN-021-R-contract-identity-missing (AC-02, 独立negative)**：同親C01正常fixtureで他fieldを保持し、INTELLIGENCE query/response contract identityだけを欠落させる。**期待**：responseを確定せずINTELLIGENCEへ不足を返す。
- **L10-BRAIN-021-R-contract-version-unknown (AC-02, 独立negative)**：同親C01正常fixtureで他fieldを保持し、INTELLIGENCE query/response contract versionだけをunknownにする。**期待**：versionを推測せずresponseを保留しINTELLIGENCEへ返す。

### HELIXBRAIN-L2-022 — `BRAIN-022-FR-01`

- **L10-BRAIN-022-C01 (AC-01, 正常)**：Pattern required field複数とdependencyをHARNESS-L2-009 obligationへ結び、同一source revision/fieldへのforward/reverse traceを与える。**期待**：両traceを保持する。
- **L10-BRAIN-022-C02 (AC-01/03, 未見正常)**：未見Patternでfield定義が存在し、value一つだけunknown。**期待**：identityとunknown理由を渡し、該当obligationをopenにする。
- **L10-BRAIN-022-C03 (AC-02, 独立negative)**：同じ親のC01正常fixtureで他fieldを保持し、required inputだけを欠落させる。**期待**：完了扱いせず、required inputをBRAIN L1-003へ返す。
- **L10-BRAIN-022-C04 (AC-02, 独立negative)**：同じ親のC01正常fixtureで他fieldを保持し、dependency endpointだけを欠落させる。**期待**：義務対応付けを完了扱いせず、dependency定義をBRAIN L1-005へ返す。
- **L10-BRAIN-022-C05 (AC-02, 独立negative)**：同じ親のC01正常fixtureで他fieldを保持し、dependency revisionだけを誤らせる。**期待**：完了扱いせず、BRAIN L1-003/005へ返す。
- **L10-BRAIN-022-C06 (AC-02, 独立negative)**：同じ親のC01正常fixtureで他fieldを保持し、reverse traceだけを欠落させる。**期待**：完了扱いせず、HARNESSへ返す。
- **L10-BRAIN-022-C07 (AC-02, 独立negative)**：同じ親のC01正常fixtureで他fieldを保持し、reverse traceのfieldだけを誤らせる。**期待**：完了扱いせず、HARNESSへ返す。
- **L10-BRAIN-022-C08 (AC-02, 独立negative)**：同じ親のC01正常fixtureで他fieldを保持し、forward traceの結合先だけを誤らせる。**期待**：完了扱いせず、HARNESSへ返す。
- **L10-BRAIN-022-C09 (AC-02, 独立negative)**：同じ親のC01正常fixtureで他fieldを保持し、製品固有値決定する。**期待**：BRAINは決定せずHARNESSへ戻す。
- **L10-BRAIN-022-C10 (AC-02, 独立negative)**：同じ親のC01正常fixtureで他fieldを保持し、工程表決定する。**期待**：BRAINは決定せずHARNESSへ戻す。
- **L10-BRAIN-022-C11 (AC-02, 独立negative)**：同じ親のC01正常fixtureで他fieldを保持し、遷移図決定する。**期待**：BRAINは決定せずHARNESSへ戻す。
- **L10-BRAIN-022-C12 (AC-02, 独立negative)**：未充足inputを完了義務とする。**期待**：義務をopenのまま保つ。
- **L10-BRAIN-022-C13 (AC-03, unknown)**：field definition自体が存在しない。**期待**：value unknownへ読み替えずBRAINへ返す。
- **L10-BRAIN-022-R-design-choice (AC-02, 独立negative)**：同親C01の正常fixtureで他fieldを保ち、BRAINが製品固有の設計選択だけを単独で確定する。**期待**：選択を拒否しHARNESSへ導出を残す。
- **L10-BRAIN-022-R-field-definition-missing (AC-02, 独立negative)**：同親C01の正常fixtureで他fieldを保ち、required-field定義そのものだけを欠落させる。**期待**：定義済fieldの値unknownに読み替えず、BRAIN L1-003/005へ返す。

- **L10-BRAIN-022-R-priority (AC-02, 独立fixture)**：同親C01の正常source/revision/scopeと他必須fieldを保持し、BRAINが実装優先順位だけを単独決定する。**期待**：単独決定を拒否しHARNESSへ導出を残す。

### HELIXBRAIN-L2-023 — `BRAIN-023-FR-01`

- **L10-BRAIN-023-C01 (AC-01, 正常)**：Visual Design課題/source/scopeにgeneric candidateとProduct Core残余を与え、LABO経由evaluation provenanceを付ける。**期待**：区分とsource relationを保持しcandidateのまま返す。
- **L10-BRAIN-023-C02 (AC-02, 独立negative)**：同親C01正常fixtureで他fieldを保ち、製品固有Visual Identityだけをgeneric knowledgeへ混入する。**期待**：混入を拒み、その要素をProduct Coreへ返す。
- **L10-BRAIN-023-C03 (AC-02, 独立negative)**：同親C01正常fixtureで他fieldを保ち、製品固有screenだけをgeneric knowledgeへ混入する。**期待**：混入を拒み、その要素をProduct Coreへ返す。
- **L10-BRAIN-023-C04 (AC-02, 独立negative)**：同親C01正常fixtureで他fieldを保ち、製品固有flowだけをgeneric knowledgeへ混入する。**期待**：混入を拒み、その要素をProduct Coreへ返す。
- **L10-BRAIN-023-C05 (AC-02, 独立negative)**：同親C01正常fixtureで他fieldを保ち、製品固有tokenだけをgeneric knowledgeへ混入する。**期待**：混入を拒み、その要素をProduct Coreへ返す。
- **L10-BRAIN-023-C06 (AC-02, 独立negative)**：LABO routeなしで利用結果をgeneric BRAIN knowledgeへ昇格する。**期待**：promotionを止めLABOへ返す。
- **L10-BRAIN-023-C07 (AC-02, 独立negative)**：同じ親のC01正常fixtureで他fieldを保持し、Product Core scope relation欠落させる。**期待**：scope relation欠落をunknownとして保持し、該当Product Coreへ戻す。
- **L10-BRAIN-023-C08 (AC-02, 独立negative)**：同じ親のC01正常fixtureで他fieldを保持し、source relation欠落させる。**期待**：source relation欠落をunknownとして保持し、LABOへ戻す。
- **L10-BRAIN-023-C09 (AC-03, 未見正常)**：未見screen種から根拠あるgeneric部分と製品固有残余を分離する。**期待**：generic部分だけcandidateとして返す。
- **L10-BRAIN-023-C10 (AC-03, 局所未評価)**：当該candidateの一部evaluationがLABO未経由。**期待**：未評価部分だけ保留し他の根拠ある候補を確立済みにしない。
- **L10-BRAIN-023-R-applicability-missing (AC-02, 独立negative)**：同親C01正常fixtureで他fieldを保ち、applicability conditionだけを欠落させる。**期待**：適用可能を推定せず候補を保留しBRAINの該当親L1へ戻す。
- **L10-BRAIN-023-R-required-input-missing (AC-02, 独立negative)**：同親C01正常fixtureで他fieldを保ち、required inputだけを欠落させる。**期待**：候補を適用確定せずBRAINの該当親L1へ戻す。
- **L10-BRAIN-023-R-counterexample-missing (AC-02, 独立negative)**：同親C01正常fixtureで他fieldを保ち、counterexampleだけを欠落させる。**期待**：反例不明を正常適用とせずBRAINの該当親L1へ戻す。

### HELIXBRAIN-L2-030 — `BRAIN-030-FR-01`

- **L10-BRAIN-030-C01 (AC-01, 正常)**：常時contract identity/version/compatibility、query/receipt schema、scope/correlation identity、receiver HARNESS-L2-009 contractを揃え、knowledge sourceを選択しない。**期待**：常時接続条件のみ照合し未選択sourceを未観測とする。
- **L10-BRAIN-030-C02 (AC-01, 正常)**：同じ常時条件と二つの成立候補knowledge identity/version/source/required fieldを用い、source-declared `conflicts_with` と `alternative_to` の関係を付ける。**期待**：HARNESSは両候補と関係を保持し、BRAINは採用先を選ばない。各fieldとHARNESS-L2-009 obligation receipt identityを結び、未充足状態をreceiptに残す。義務openを保ち、充足・complete/readyを生成しない。
- **L10-BRAIN-030-C03 (AC-02, 独立negative)**：同じ親のC01正常fixtureで他fieldを保持し、contract identity missingにする。**期待**：呼出しを保留し責任owner未指定をunknownとして記録する。
- **L10-BRAIN-030-C04 (AC-02, 独立negative)**：同じ親のC01正常fixtureで他fieldを保持し、contract version missingにする。**期待**：呼出しを保留し責任owner未指定をunknownとして記録する。
- **L10-BRAIN-030-C05 (AC-02, 独立negative)**：同じ親のC01正常fixtureで他fieldを保持し、contract version staleにする。**期待**：呼出しを保留し責任owner未指定をunknownとして記録する。
- **L10-BRAIN-030-C06 (AC-02, 独立negative)**：同じ親のC01正常fixtureで他fieldを保持し、contract version unknownにする。**期待**：呼出しを保留し責任owner未指定をunknownとして記録する。
- **L10-BRAIN-030-C07 (AC-02, 独立negative)**：compatibility mismatchのみを与える。**期待**：宣言rangeを補わずunknown/保留としowner未指定のまま記録する。
- **L10-BRAIN-030-C08 (AC-02, 独立negative)**：同じ親のC01正常fixtureで他fieldを保持し、query schema missingにする。**期待**：各々保留しreceiver contract不整合としてHARNESSへ戻す。
- **L10-BRAIN-030-C09 (AC-02, 独立negative)**：同じ親のC01正常fixtureで他fieldを保持し、query schema mismatchにする。**期待**：各々保留しreceiver contract不整合としてHARNESSへ戻す。
- **L10-BRAIN-030-C10 (AC-02, 独立negative)**：同じ親のC01正常fixtureで他fieldを保持し、receipt schema missingにする。**期待**：各々保留しreceiver contract不整合としてHARNESSへ戻す。
- **L10-BRAIN-030-C11 (AC-02, 独立negative)**：同じ親のC01正常fixtureで他fieldを保持し、receipt schema mismatchにする。**期待**：各々保留しreceiver contract不整合としてHARNESSへ戻す。
- **L10-BRAIN-030-C12 (AC-02, 独立negative)**：同じ親のC01正常fixtureで他fieldを保持し、scope identity欠落させる。**期待**：receiver scope/correlation identity欠落としてHARNESSへ戻す。
- **L10-BRAIN-030-C13 (AC-02, 独立negative)**：同じ親のC01正常fixtureで他fieldを保持し、correlation identity欠落させる。**期待**：receiver scope/correlation identity欠落としてHARNESSへ戻す。
- **L10-BRAIN-030-C14 (AC-02, 独立negative)**：scope mismatchのみを与える。**期待**：誤対象のreceiptを拒み、scope/receiver不一致をHARNESSへ返す。
- **L10-BRAIN-030-C15 (AC-02, 独立negative)**：receiver HARNESS-L2-009 contract missingのみを与える。**期待**：receiver contract不整合としてHARNESSへ返す。
- **L10-BRAIN-030-C16 (AC-02, 独立negative)**：receiver HARNESS-L2-009 contract mismatchのみを与える。**期待**：receiver contract不整合としてHARNESSへ返す。
- **L10-BRAIN-030-C17 (AC-03, 独立negative)**：同じ親のC02選択knowledge正常fixtureで他fieldを保持し、選択knowledge identity欠落させる。**期待**：選択knowledgeの当該受渡しだけを止め、knowledge source/definition/meaningの不足はBRAINへ返す。field定義missingはvalue unknownにしない。
- **L10-BRAIN-030-C18 (AC-03, 独立negative)**：同じ親のC02選択knowledge正常fixtureで他fieldを保持し、選択knowledge version欠落させる。**期待**：選択knowledgeの当該受渡しだけを止め、knowledge source/definition/meaningの不足はBRAINへ返す。field定義missingはvalue unknownにしない。
- **L10-BRAIN-030-C19 (AC-03, 独立negative)**：同じ親のC02選択knowledge正常fixtureで他fieldを保持し、選択knowledge source欠落させる。**期待**：選択knowledgeの当該受渡しだけを止め、knowledge source/definition/meaningの不足はBRAINへ返す。field定義missingはvalue unknownにしない。
- **L10-BRAIN-030-C20 (AC-03, 独立negative)**：同じ親のC02選択knowledge正常fixtureで他fieldを保持し、選択knowledge applicability欠落させる。**期待**：選択knowledgeの当該受渡しだけを止め、knowledge source/definition/meaningの不足はBRAINへ返す。field定義missingはvalue unknownにしない。
- **L10-BRAIN-030-C21 (AC-03, 独立negative)**：同じ親のC02選択knowledge正常fixtureで他fieldを保持し、required-field definition missingにする。**期待**：選択knowledgeの当該受渡しだけを止め、knowledge source/definition/meaningの不足はBRAINへ返す。field定義missingはvalue unknownにしない。
- **L10-BRAIN-030-C22 (AC-03, 独立negative)**：同じ親のC02選択knowledge正常fixtureで他fieldを保持し、required-field definition mismatchにする。**期待**：選択knowledgeの当該受渡しだけを止め、knowledge source/definition/meaningの不足はBRAINへ返す。field定義missingはvalue unknownにしない。
- **L10-BRAIN-030-C23 (AC-05, 正常境界)**：同じ親のC02選択knowledge正常fixtureで他fieldを保持し、定義済required valueを一つだけ未設定にする。**期待**：field定義は保持し、値未設定理由とfield identityをreceiptへ残して受領可能とするが、義務はopenのまま保つ。
- **L10-BRAIN-030-C24 (AC-03, 独立negative)**：同じ親のC02選択knowledge正常fixtureで他fieldを保持し、選択knowledge relation欠落させる。**期待**：選択knowledgeの当該受渡しだけを止め、knowledge source/definition/meaningの不足はBRAINへ返す。field定義missingはvalue unknownにしない。
- **L10-BRAIN-030-C25 (AC-03, 独立negative)**：同じ親のC02選択knowledge正常fixtureで他fieldを保持し、選択knowledge negative case欠落させる。**期待**：選択knowledgeの当該受渡しだけを止め、knowledge source/definition/meaningの不足はBRAINへ返す。field定義missingはvalue unknownにしない。
- **L10-BRAIN-030-C26 (AC-04, 独立negative)**：同じ親のC02選択knowledge正常fixtureで他fieldを保持し、forward trace欠落させる。**期待**：obligation receiptを不成立にし、HARNESSへ返す。
- **L10-BRAIN-030-C27 (AC-04, 独立negative)**：同じ親のC02選択knowledge正常fixtureで他fieldを保持し、reverse traceだけを欠落させる。**期待**：obligation receiptを不成立にし、HARNESSへ返す。
- **L10-BRAIN-030-C28 (AC-04, 独立negative)**：未充足義務だけを閉じる。**期待**：義務openと候補stateを保つ。
- **L10-BRAIN-030-C29 (AC-04, 独立negative)**：別Patternの成功で欠けた選択Pattern fieldを相殺する。**期待**：相殺を拒否する。
- **L10-BRAIN-030-C30 (AC-04, 独立negative)**：BRAINが製品固有API結論だけを出力する。**期待**：結論を返さずHARNESSへ戻す。
- **L10-BRAIN-030-C31 (AC-05, 未見正常)**：未見互換pairを固定source上の宣言範囲内で与え、選択knowledgeは全fieldとtraceを満たす。**期待**：同契約で照合し候補receiptを作る。
- **L10-BRAIN-030-C32 (AC-05, 局所unknown)**：異なる未見pairで互換範囲が未宣言。**期待**：compatibilityだけunknown/holdとし範囲を創作しない。
- **L10-BRAIN-030-C33 (AC-05, 複数field正常境界)**：選択knowledgeに定義済みfieldがあり値だけunknown。**期待**：receiptにfield identity/reasonを残しobligation open。
- **L10-BRAIN-030-C34 (AC-05, 個別negative)**：knowledge revisionにrequired-field definition自体がない。**期待**：値unknownとして受領せずBRAINへ返す。
- **L10-BRAIN-030-C35 (AC-05, 正常境界)**：別queryでknowledgeを未選択にする。**期待**：その知識sourceを未観測として扱い、欠落扱いも適用可推定もしない。

- **L10-BRAIN-030-R-compatibility-range-missing (AC-02, 独立negative)**：同親C01正常fixtureでcontract identity/versionと他条件を保持し、宣言されたcompatibility rangeだけを欠落させる。**期待**：範囲を補わず当該呼出しを保留しcompatibility unknownを記録する。contract-range ownerが親で特定されないためunknownを維持する。
- **L10-BRAIN-030-R-reference-substitution (AC-03, 独立negative)**：同親C02正常fixtureで選択knowledgeのrequired fieldとauthority receiptを保ち、参照資料だけをそれらの代替として使う。**期待**：参照資料によるrequired-field/receipt/authorityの代替を拒否し、reference-only資料は背景に限定する。選択knowledgeの不足はBRAINへ戻す。
- **L10-BRAIN-030-R-correlation-mismatch (AC-02, 独立fixture)**：同親C02の選択knowledge source/revision/scopeと他必須fieldを保持し、correlation identityだけを別queryへ結合する。**期待**：receiver scope/schema不整合としてHARNESSへ戻し受領しない。
- **L10-BRAIN-030-R-version-stale (AC-03, 独立fixture)**：同親C02の選択knowledge source/revision/scopeと他必須fieldを保持し、選択knowledge versionだけをstaleにする。**期待**：knowledge受渡しを保留しBRAINへ戻す。
- **L10-BRAIN-030-R-version-mismatch (AC-03, 独立fixture)**：同親C02の選択knowledge source/revision/scopeと他必須fieldを保持し、選択knowledge versionだけをsourceと不一致にする。**期待**：誤結合を拒否しBRAINへ戻す。
- **L10-BRAIN-030-R-source-mismatch (AC-03, 独立fixture)**：同親C02の選択knowledge source/revision/scopeと他必須fieldを保持し、選択knowledge sourceだけを別identityへ結合する。**期待**：由来不整合としてBRAINへ戻す。
- **L10-BRAIN-030-R-applicability-unknown (AC-05, 独立fixture)**：同親C02の選択knowledge source/revision/scopeと他必須fieldを保持し、適用条件だけをunknownにして適用可能と表示する。**期待**：適用可能と推定せず当該適用を保留し、候補判断材料にunknownを保持して義務open。
- **L10-BRAIN-030-R-reverse-revision (AC-04, 独立fixture)**：同親C02の選択knowledge source/revision/scopeと他必須fieldを保持し、逆trace先knowledge revisionだけを別revisionへ変える。**期待**：誤結合を拒否し対応付け不備をHARNESSへ戻す。
- **L10-BRAIN-030-R-reverse-field (AC-04, 独立fixture)**：同親C02の選択knowledge source/revision/scopeと他必須fieldを保持し、逆trace先required fieldだけを別fieldへ変える。**期待**：誤結合を拒否し対応付け不備をHARNESSへ戻す。
- **L10-BRAIN-030-R-reverse-scope (AC-04, 独立fixture)**：同親C02の選択knowledge source/revision/scopeと他必須fieldを保持し、逆trace先scopeだけを別scopeへ変える。**期待**：scope誤結合を拒否しHARNESSへ戻す。
- **L10-BRAIN-030-R-obligation-receipt (AC-04, 独立fixture)**：同親C02の選択knowledge source/revision/scopeと他必須fieldを保持し、HARNESS義務identityのreceiptだけを欠落する。**期待**：知識receiptと義務receiptを区別し義務対応付け未完をHARNESSへ戻す。
- **L10-BRAIN-030-R-design-completion (AC-04, 独立fixture)**：同親C02の選択knowledge source/revision/scopeと他必須fieldを保持し、receiptだけからdesign completeへ昇格する。**期待**：設計義務未充足を保持しdesign completionを生成しない。
- **L10-BRAIN-030-R-implementation-ready (AC-04, 独立fixture)**：同親C02の選択knowledge source/revision/scopeと他必須fieldを保持し、receiptだけからimplementation readyへ昇格する。**期待**：義務openを保持しimplementation readinessを生成しない。
- **L10-BRAIN-030-R-state-conclusion (AC-04, 独立fixture)**：同親C02の選択knowledge source/revision/scopeと他必須fieldを保持し、BRAINが製品固有state結論だけを出力する。**期待**：製品結論を拒否しHARNESSへ戻す。
- **L10-BRAIN-030-R-permission-conclusion (AC-04, 独立fixture)**：同親C02の選択knowledge source/revision/scopeと他必須fieldを保持し、BRAINが製品permission結論だけを出力する。**期待**：製品結論を拒否しHARNESSへ戻す。
- **L10-BRAIN-030-R-design-conclusion (AC-04, 独立fixture)**：同親C02の選択knowledge source/revision/scopeと他必須fieldを保持し、BRAINが製品設計選択だけを単独決定する。**期待**：製品結論を拒否しHARNESSへ戻す。
- **L10-BRAIN-030-R-screen-conclusion (AC-04, 独立fixture)**：同親C02の選択knowledge source/revision/scopeと他必須fieldを保持し、BRAINが製品screen結論だけを出力する。**期待**：製品結論を拒否しHARNESSへ戻す。
- **L10-BRAIN-030-R-db-conclusion (AC-04, 独立fixture)**：同親C02の選択knowledge source/revision/scopeと他必須fieldを保持し、BRAINが製品DB結論だけを出力する。**期待**：製品結論を拒否しHARNESSへ戻す。
- **L10-BRAIN-030-R-mixed-fields (AC-05, 独立fixture)**：同親C02の選択knowledge source/revision/scopeと他必須fieldを保持し、C23の単一field境界とは別に、複数Pattern/Unit/Partで定義済fieldを複数選び既知値と未設定値を混在させ、field identity/理由/双方向traceを保持する。**期待**：知識receiptのみ受領可能、未設定値ごとの義務はopen、設計完成/実装準備は未成立。値を創作しない。

- **L10-BRAIN-030-R-relation-conflict (AC-03, 独立negative)**：同query/scope/revisionの選択knowledge tupleとrequired fieldsを保ち、relation根拠だけをsourceと矛盾させる。**期待**：矛盾を隠さず当該knowledge受渡しを不合格としてBRAINへ戻し、他Pattern成功で相殺しない。

各caseは独立fixtureであり、親の範囲外条件を追加しない。正常caseは宣言済み合成identity/revision/valueを使い、unknown/未観測と欠落を区別する。判定はdocument-level oracle設計で、実行結果ではない。
