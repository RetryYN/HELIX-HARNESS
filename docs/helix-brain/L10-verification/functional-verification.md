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
- **L10-BRAIN-INFRA-001-C02（個別欠落／AC-02）**：必須field/relation/列挙要素を一度に一つだけmissingにしたfixtureを列挙集合の各要素について作る。**期待oracle**：当該要素とmissing reasonを特定し、成功/適用扱いにせず止める。C02の分母は `20項目 + 追加/分割/統合/退役の4操作` とする。
- **L10-BRAIN-INFRA-001-C03（親固有negative／AC-02）**：列挙集合を固定enum化、未列挙領域を拒否、またはprovider accountや実resource stateを分類identityへ混ぜる。**期待oracle**：不成立reasonを特定し、分類の意味はHELIXBRAIN-L1-001、実resource stateはInfrastructure Runtime。
- **L10-BRAIN-INFRA-001-C04（unknown/stale/対象不一致／AC-02）**：固定L2が明示するidentity/condition/relationだけを対象に、unknown、矛盾、別対象を一項目ずつ変異する。L2がsource/evidenceを要求しない箇所へ新しいevidence義務を足さない。**期待oracle**：AC-02に従い不成立またはunknownと戻し先を示し、成功/適用扱いにしない。
- **L10-BRAIN-INFRA-001-C05（未見正常／AC-01）**：既存fixtureにないData Infrastructureをscopeとする分類案を用意し、固定親が許す追加候補として分類identity/意味変更案を明示する。**期待oracle**：追加候補は既存Subdomain集合を閉じず分類案として保持し、provider accountや実resource stateを分類identityへ混入しない。分類の意味変更はHELIXBRAIN-L1-001へ返す。

### `HELIXBRAIN-L2-INFRA-002` — BRAIN-INFRA-002-FR-01 / AC-01, AC-02

固定sourceはf6dad2a33e24f000b87d7f09b8d40288257e74cc、L2 lines 230–239、L11 line 42。各caseは独立fixtureで実施し、成功は実環境の成立を意味しない。

- **L10-BRAIN-INFRA-002-C01（正常／AC-01）**：Domain→Pattern→Design Unit→Part階層とActive/Passive・Blue-Green例の部品relationを全て含む宣言済み合成対象を与える。**期待oracle**：全必須要素を親の対象identityと対応付け、L2のscopeと責務を保持する。
- **L10-BRAIN-INFRA-002-C02（個別欠落／AC-02）**：必須field/relation/列挙要素を一度に一つだけmissingにしたfixtureを列挙集合の各要素について作る。**期待oracle**：当該要素とmissing reasonを特定し、成功/適用扱いにせず止める。C02の分母は `4階層nodeと、固定L2例に含まれる部品・relation endpoint` とする。
- **L10-BRAIN-INFRA-002-C03（親固有negative／AC-02）**：各階層、relation端点を独立に欠落させるほか、provider固有設定だけを一般Patternに見せる。**期待oracle**：不成立reasonを特定し、階層・一般性の判断はHELIXBRAIN-L1-002へ返し、provider固有設定はimplementation knowledge候補に分離する。新しいRuntime/implementation ownerを割り当てない。
- **L10-BRAIN-INFRA-002-C04（unknown/stale/対象不一致／AC-02）**：固定L2が明示するidentity/condition/relationだけを対象に、unknown、矛盾、別対象を一項目ずつ変異する。L2がsource/evidenceを要求しない箇所へ新しいevidence義務を足さない。**期待oracle**：AC-02に従い不成立またはunknownと戻し先を示し、成功/適用扱いにしない。
- **L10-BRAIN-INFRA-002-C05（未見正常／AC-01）**：未見のData Infrastructure→Queue-based Processing Pattern→Consumer Coordination→Acknowledgement Windowという合成階層を置き、各nodeのlevelとrelation endpointの型を宣言する。**期待oracle**：4階層と型付きrelationを保持し、provider固有設定は一般Patternと混同せずimplementation knowledge候補へ分離する。

### `HELIXBRAIN-L2-INFRA-003` — BRAIN-INFRA-003-FR-01 / AC-01, AC-02

固定sourceはf6dad2a33e24f000b87d7f09b8d40288257e74cc、L2 lines 240–249、L11 line 43。各caseは独立fixtureで実施し、成功は実環境の成立を意味しない。

- **L10-BRAIN-INFRA-003-C01（正常／AC-01）**：20個のL2 atomic descriptor fieldと18個のL11列挙group（trade-off/evidenceを別々に含む）の双方、各fieldの根拠・適用scope・unknownを全て含む宣言済み合成対象を与える。**期待oracle**：全必須要素を親の対象identityと対応付け、L2のscopeと責務を保持する。
- **L10-BRAIN-INFRA-003-C02（個別欠落／AC-02）**：必須field/relation/列挙要素を一度に一つだけmissingにしたfixtureを列挙集合の各要素について作る。**期待oracle**：当該要素とmissing reasonを特定し、成功/適用扱いにせず止める。C02の分母はL2の20 atomic fieldとL11の18列挙groupへの対応。両集合を別分母として記録し、trade-offとevidenceは別々に検査する。
- **L10-BRAIN-INFRA-003-C03（親固有negative／AC-02）**：20 fieldそれぞれの欠落/stale/対象違いを単独変異し、一般性だけによる適用や未知値の成功丸めを試す。**期待oracle**：不成立reasonを特定し、製品要求値はProduct Core、評価不足はLABO、知識fieldの意味はHELIXBRAIN-L1-003。
- **L10-BRAIN-INFRA-003-C04（unknown/stale/対象不一致／AC-02）**：固定L2が明示するidentity/condition/relationだけを対象に、unknown、矛盾、別対象を一項目ずつ変異する。L2がsource/evidenceを要求しない箇所へ新しいevidence義務を足さない。**期待oracle**：AC-02に従い不成立またはunknownと戻し先を示し、成功/適用扱いにしない。
- **L10-BRAIN-INFRA-003-C05（未見正常／AC-01）**：既存例と異なる合成Queue-based Patternに20 atomic fieldを全て与え、L11の18 groupでtrade-offとevidenceも別々に表現する。**期待oracle**：全fieldと対応groupを同じPattern identityに結び、未指定の製品値をunknownのままにする。

### `HELIXBRAIN-L2-INFRA-004` — BRAIN-INFRA-004-FR-01 / AC-01, AC-02

固定sourceはf6dad2a33e24f000b87d7f09b8d40288257e74cc、L2 lines 250–259、L11 line 44。各caseは独立fixtureで実施し、成功は実環境の成立を意味しない。

- **L10-BRAIN-INFRA-004-C01（正常／AC-01）**：10種の要求特性→関連Pattern→必要Design Input relationを全て含む宣言済み合成対象を与える。**期待oracle**：全必須要素を親の対象identityと対応付け、L2のscopeと責務を保持する。
- **L10-BRAIN-INFRA-004-C02（個別欠落／AC-02）**：必須field/relation/列挙要素を一度に一つだけmissingにしたfixtureを列挙集合の各要素について作る。**期待oracle**：当該要素とmissing reasonを特定し、成功/適用扱いにせず止める。C02の分母は `列挙10特性と各Pattern/Inputのrelation` とする。
- **L10-BRAIN-INFRA-004-C03（親固有negative／AC-02）**：各relation/inputの欠落、unknown値の確定、BRAINによる閾値/RTO/RPO生成。**期待oracle**：不成立reasonを特定し、要求値と設計義務はHARNESS／製品COREへ戻す。
- **L10-BRAIN-INFRA-004-C04（unknown/stale/対象不一致／AC-02）**：固定L2が明示するidentity/condition/relationだけを対象に、unknown、矛盾、別対象を一項目ずつ変異する。L2がsource/evidenceを要求しない箇所へ新しいevidence義務を足さない。**期待oracle**：AC-02に従い不成立またはunknownと戻し先を示し、成功/適用扱いにしない。
- **L10-BRAIN-INFRA-004-C05（未見正常／AC-01）**：未見のPrivacy requirement characteristicからPattern、required design inputへの合成relationを用意し、要求値だけをunknownと宣言する。**期待oracle**：relation経路は保持し、値を創作せずHARNESS／製品COREの要求・設計義務へ戻す。

### `HELIXBRAIN-L2-INFRA-005` — BRAIN-INFRA-005-FR-01 / AC-01, AC-02

固定sourceはf6dad2a33e24f000b87d7f09b8d40288257e74cc、L2 lines 260–269、L11 line 45。各caseは独立fixtureで実施し、成功は実環境の成立を意味しない。

- **L10-BRAIN-INFRA-005-C01（正常／AC-01）**：13 failure例の各々についてexpected failure/detection/impact/containment/recovery/residual riskを全て含む宣言済み合成対象を与える。**期待oracle**：全必須要素を親の対象identityと対応付け、L2のscopeと責務を保持する。
- **L10-BRAIN-INFRA-005-C02（個別欠落／AC-02）**：必須field/relation/列挙要素を一度に一つだけmissingにしたfixtureを列挙集合の各要素について作る。**期待oracle**：当該要素とmissing reasonを特定し、成功/適用扱いにせず止める。C02の分母は `13 failure例 × 6観点 = 78対応cell` とする。
- **L10-BRAIN-INFRA-005-C03（親固有negative／AC-02）**：13例および6観点の各欠落を独立に試し、設計候補の存在を実incident証拠へ置換。**期待oracle**：不成立reasonを特定し、実incident/dataはLABO/Runtime、一般化範囲はHELIXBRAIN-L1-010。
- **L10-BRAIN-INFRA-005-C04（unknown/stale/対象不一致／AC-02）**：固定L2が明示するidentity/condition/relationだけを対象に、unknown、矛盾、別対象を一項目ずつ変異する。L2がsource/evidenceを要求しない箇所へ新しいevidence義務を足さない。**期待oracle**：AC-02に従い不成立またはunknownと戻し先を示し、成功/適用扱いにしない。
- **L10-BRAIN-INFRA-005-C05（未見正常／AC-01）**：未見のDependency Failure候補にexpected failure/detection/impact/containment/recovery/residual riskを全て合成入力する。**期待oracle**：設計知識と根拠relationとして保持し、実incident測定の証拠へ置き換えない。

### `HELIXBRAIN-L2-INFRA-006` — BRAIN-INFRA-006-FR-01 / AC-01, AC-02

固定sourceはf6dad2a33e24f000b87d7f09b8d40288257e74cc、L2 lines 270–281、L11 line 46。各caseは独立fixtureで実施し、成功は実環境の成立を意味しない。

- **L10-BRAIN-INFRA-006-C01（正常／AC-01）**：10 Recovery Pattern候補における予防と復旧の役割区別を全て含む宣言済み合成対象を与える。**期待oracle**：全必須要素を親の対象identityと対応付け、L2のscopeと責務を保持する。
- **L10-BRAIN-INFRA-006-C02（個別欠落／AC-02）**：必須field/relation/列挙要素を一度に一つだけmissingにしたfixtureを列挙集合の各要素について作る。**期待oracle**：当該要素とmissing reasonを特定し、成功/適用扱いにせず止める。C02の分母は `10 recovery候補と各候補の予防/復旧区分` とする。
- **L10-BRAIN-INFRA-006-C03（親固有negative／AC-02）**：各Pattern名/復旧条件の欠落、予防だけのrecoverability結論、未実行を実行成功扱い。**期待oracle**：不成立reasonを特定し、実行/rollbackはProductまたはRuntime owner、意味はHELIXBRAIN-L1-010。
- **L10-BRAIN-INFRA-006-C04（unknown/stale/対象不一致／AC-02）**：固定L2が明示するidentity/condition/relationだけを対象に、unknown、矛盾、別対象を一項目ずつ変異する。L2がsource/evidenceを要求しない箇所へ新しいevidence義務を足さない。**期待oracle**：AC-02に従い不成立またはunknownと戻し先を示し、成功/適用扱いにしない。
- **L10-BRAIN-INFRA-006-C05（未見正常／AC-01）**：既存列挙例と異なるReconciliation候補で予防策と復旧時の役割を別fieldに置き、実行結果は未観測とする。**期待oracle**：候補知識を保持し、実行・rollback成功を推定しない。

### `HELIXBRAIN-L2-INFRA-007` — BRAIN-INFRA-007-FR-01 / AC-01, AC-02

固定sourceはf6dad2a33e24f000b87d7f09b8d40288257e74cc、L2 lines 282–291、L11 line 47。各caseは独立fixtureで実施し、成功は実環境の成立を意味しない。

- **L10-BRAIN-INFRA-007-C01（正常／AC-01）**：6 deployment方式をblast radius/rollback/duplication/availability/migration/observabilityで比較を全て含む宣言済み合成対象を与える。**期待oracle**：全必須要素を親の対象identityと対応付け、L2のscopeと責務を保持する。
- **L10-BRAIN-INFRA-007-C02（個別欠落／AC-02）**：必須field/relation/列挙要素を一度に一つだけmissingにしたfixtureを列挙集合の各要素について作る。**期待oracle**：当該要素とmissing reasonを特定し、成功/適用扱いにせず止める。C02の分母は `6方式 × 6比較軸 = 36対応cell` とする。
- **L10-BRAIN-INFRA-007-C03（親固有negative／AC-02）**：方式・比較軸欠落、migration条件推測、設計知識からのrelease/deployment実行。**期待oracle**：不成立reasonを特定し、release semanticsはProduct Core/HARNESS、実進行はOS/Runtime。
- **L10-BRAIN-INFRA-007-C04（unknown/stale/対象不一致／AC-02）**：固定L2が明示するidentity/condition/relationだけを対象に、unknown、矛盾、別対象を一項目ずつ変異する。L2がsource/evidenceを要求しない箇所へ新しいevidence義務を足さない。**期待oracle**：AC-02に従い不成立またはunknownと戻し先を示し、成功/適用扱いにしない。
- **L10-BRAIN-INFRA-007-C05（未見正常／AC-01）**：既存fixtureにないStaged Rollout案を6比較軸と共に宣言し、release actionは入力に含めない。**期待oracle**：比較可能な設計知識を保持し、release/deploymentを進行しない。

### `HELIXBRAIN-L2-INFRA-008` — BRAIN-INFRA-008-FR-01 / AC-01, AC-02

固定sourceはf6dad2a33e24f000b87d7f09b8d40288257e74cc、L2 lines 292–301、L11 line 48。各caseは独立fixtureで実施し、成功は実環境の成立を意味しない。

- **L10-BRAIN-INFRA-008-C01（正常／AC-01）**：8 scaling/capacity候補（Vertical Scaling、Horizontal Scaling、Queue-based Load Leveling、Sharding、Read Replica、Cache、Worker Pool、Backpressure）それぞれをtrigger/bottleneck/limit/statefulness/synchronization cost/saturation behaviorの6軸で記述を全て含む宣言済み合成対象を与える。**期待oracle**：全必須要素を親の対象identityと対応付け、L2のscopeと責務を保持する。
- **L10-BRAIN-INFRA-008-C02（個別欠落／AC-02）**：必須field/relation/列挙要素を一度に一つだけmissingにしたfixtureを列挙集合の各要素について作る。**期待oracle**：当該要素とmissing reasonを特定し、成功/適用扱いにせず止める。C02の分母は `8方式 × 6 descriptor軸 = 48対応cell` とする。
- **L10-BRAIN-INFRA-008-C03（親固有negative／AC-02）**：候補/field欠落、unknown workloadを適用許可や自動scalingへ変換、閾値創作。**期待oracle**：不成立reasonを特定し、workload/SLOは製品要求、構造評価はLABO。
- **L10-BRAIN-INFRA-008-C04（unknown/stale/対象不一致／AC-02）**：固定L2が明示するidentity/condition/relationだけを対象に、unknown、矛盾、別対象を一項目ずつ変異する。L2がsource/evidenceを要求しない箇所へ新しいevidence義務を足さない。**期待oracle**：AC-02に従い不成立またはunknownと戻し先を示し、成功/適用扱いにしない。
- **L10-BRAIN-INFRA-008-C05（未見正常／AC-01）**：固定8候補の一つであるWorker Poolについて、C01と異なる合成fixtureに6軸を記載し、workload量はunknownとする。**期待oracle**：既存候補の別fixtureとして保持し、unknown workloadを適用許可・自動scalingへ変えず閾値を作らない。

### `HELIXBRAIN-L2-INFRA-009` — BRAIN-INFRA-009-FR-01 / AC-01, AC-02

固定sourceはf6dad2a33e24f000b87d7f09b8d40288257e74cc、L2 lines 302–311、L11 line 49。各caseは独立fixtureで実施し、成功は実環境の成立を意味しない。

- **L10-BRAIN-INFRA-009-C01（正常／AC-01）**：11設計観測点と関連Pattern/failureの関係。実telemetryはBRAIN外に置くを全て含む宣言済み合成対象を与える。**期待oracle**：全必須要素を親の対象identityと対応付け、L2のscopeと責務を保持する。
- **L10-BRAIN-INFRA-009-C02（個別欠落／AC-02）**：必須field/relation/列挙要素を一度に一つだけmissingにしたfixtureを列挙集合の各要素について作る。**期待oracle**：当該要素とmissing reasonを特定し、成功/適用扱いにせず止める。C02の分母は `11観測点とPattern/failure relation` とする。
- **L10-BRAIN-INFRA-009-C03（親固有negative／AC-02）**：各観測定義の欠落、raw telemetry混入、missing/stale/collector停止をhealthyへ写像。**期待oracle**：不成立reasonを特定し、runtime evidenceはInfrastructure Runtime/LABO、設計観測定義はHELIXBRAIN-L1-003。
- **L10-BRAIN-INFRA-009-C04（unknown/stale/対象不一致／AC-02）**：固定L2が明示するidentity/condition/relationだけを対象に、unknown、矛盾、別対象を一項目ずつ変異する。L2がsource/evidenceを要求しない箇所へ新しいevidence義務を足さない。**期待oracle**：AC-02に従い不成立またはunknownと戻し先を示し、成功/適用扱いにしない。
- **L10-BRAIN-INFRA-009-C05（未見正常／AC-01）**：既存例にないRecovery state観測点を合成し、対応するPattern/failureと意味だけを定義、実telemetry値は渡さない。**期待oracle**：設計観測点としてrelation保持し、実データはBRAINへ保存せず未観測をhealthyにしない。

### `HELIXBRAIN-L2-INFRA-010` — BRAIN-INFRA-010-FR-01 / AC-01, AC-02

固定sourceはf6dad2a33e24f000b87d7f09b8d40288257e74cc、L2 lines 312–321、L11 line 50。各caseは独立fixtureで実施し、成功は実環境の成立を意味しない。

- **L10-BRAIN-INFRA-010-C01（正常／AC-01）**：backup strategy/retention/replication/restore/recovery validationの別状態とrelationを全て含む宣言済み合成対象を与える。**期待oracle**：全必須要素を親の対象identityと対応付け、L2のscopeと責務を保持する。
- **L10-BRAIN-INFRA-010-C02（個別欠落／AC-02）**：必須field/relation/列挙要素を一度に一つだけmissingにしたfixtureを列挙集合の各要素について作る。**期待oracle**：当該要素とmissing reasonを特定し、成功/適用扱いにせず止める。C02の分母は `5 design element: strategy/retention/replication/restore/validation` とする。
- **L10-BRAIN-INFRA-010-C03（親固有negative／AC-02）**：backupのみ、restore未検証、recovery条件欠落、製品RTO/RPO創作。**期待oracle**：不成立reasonを特定し、実行値はProduct/Runtime、知識構造はHELIXBRAIN-L1-003/010。
- **L10-BRAIN-INFRA-010-C04（unknown/stale/対象不一致／AC-02）**：固定L2が明示するidentity/condition/relationだけを対象に、unknown、矛盾、別対象を一項目ずつ変異する。L2がsource/evidenceを要求しない箇所へ新しいevidence義務を足さない。**期待oracle**：AC-02に従い不成立またはunknownと戻し先を示し、成功/適用扱いにしない。
- **L10-BRAIN-INFRA-010-C05（未見正常／AC-01）**：未見のreplication/restore/recovery validation構造を合成し、製品RTO/RPO値は未指定にする。**期待oracle**：各知識要素のrelationを保ち、backupだけでrecoverabilityを結論せず製品値を創作しない。

### `HELIXBRAIN-L2-INFRA-011` — BRAIN-INFRA-011-FR-01 / AC-01, AC-02

固定sourceはf6dad2a33e24f000b87d7f09b8d40288257e74cc、L2 lines 322–331、L11 line 51。各caseは独立fixtureで実施し、成功は実環境の成立を意味しない。

- **L10-BRAIN-INFRA-011-C01（正常／AC-01）**：7 cost characteristic group/8 atomic characteristicを区別した宣言済み合成対象（構造costのみでよく価格値は任意）を与える。**期待oracle**：全必須要素を親の対象identityと対応付け、L2のscopeと責務を保持する。
- **L10-BRAIN-INFRA-011-C02（個別欠落／AC-02）**：必須field/relation/列挙要素を一度に一つだけmissingにしたfixtureを列挙集合の各要素について作る。**期待oracle**：当該要素とmissing reasonを特定し、成功/適用扱いにせず止める。C02では8 atomic characteristicと7 group対応を別々に1変数ずつ欠落させる。価格を含める任意枝ではprovider/time/source/scopeを個別に欠落・不一致へ変える。構造costのみの正常fixtureに価格sourceを要求しない。
- **L10-BRAIN-INFRA-011-C03（親固有negative／AC-02）**：軸欠落、source/timeなし価格の現行化、構造cost特性から価格/予算への変換。**期待oracle**：不成立reasonを特定し、価格/予算はProduct Core/OS、一般化costはLABO。
- **L10-BRAIN-INFRA-011-C04（unknown/stale/対象不一致／AC-02）**：固定L2が明示するidentity/condition/relationだけを対象に、unknown、矛盾、別対象を一項目ずつ変異する。L2がsource/evidenceを要求しない箇所へ新しいevidence義務を足さない。**期待oracle**：AC-02に従い不成立またはunknownと戻し先を示し、成功/適用扱いにしない。
- **L10-BRAIN-INFRA-011-C05（未見正常／AC-01）**：未見のPattern pairにfixed/variable cost tendency、idle resource、scaling、redundancy、storage、network、operational costの7 groupを記述し、fixed/variableは別のatomic characteristicとして保つ。具体価格は含めない。**期待oracle**：8 atomic characteristicを7 groupに対応させて構造cost比較を成立扱いにし、価格evidenceなしから具体価格・予算を生成しない。

### `HELIXBRAIN-L2-INFRA-012` — BRAIN-INFRA-012-FR-01 / AC-01, AC-02

固定sourceはf6dad2a33e24f000b87d7f09b8d40288257e74cc、L2 lines 332–341、L11 line 52。各caseは独立fixtureで実施し、成功は実環境の成立を意味しない。

- **L10-BRAIN-INFRA-012-C01（正常／AC-01）**：Object Storage等の抽象PatternとS3/GCS/Azure Blob/MinIO等の実装identityおよびimplements/compatible_with/constraint_of関係を全て含む宣言済み合成対象を与える。**期待oracle**：全必須要素を親の対象identityと対応付け、L2のscopeと責務を保持する。
- **L10-BRAIN-INFRA-012-C02（個別欠落／AC-02）**：必須field/relation/列挙要素を一度に一つだけmissingにしたfixtureを列挙集合の各要素について作る。**期待oracle**：当該要素とmissing reasonを特定し、成功/適用扱いにせず止める。C02の分母は `1 abstract identity + 4 implementation example identity + 明示relation` とする。
- **L10-BRAIN-INFRA-012-C03（親固有negative／AC-02）**：identity統合、provider固定、根拠のないcompatibility、各relationの欠落。**期待oracle**：不成立reasonを特定し、互換条件のownerまたは該当Patternへ戻す。未確認compatibilityはunknown。
- **L10-BRAIN-INFRA-012-C04（unknown/stale/対象不一致／AC-02）**：固定L2が明示するidentity/condition/relationだけを対象に、unknown、矛盾、別対象を一項目ずつ変異する。L2がsource/evidenceを要求しない箇所へ新しいevidence義務を足さない。**期待oracle**：AC-02に従い不成立またはunknownと戻し先を示し、成功/適用扱いにしない。
- **L10-BRAIN-INFRA-012-C05（未見正常／AC-01）**：新provider implementation例のidentityとObject Storage抽象とのimplements relationだけを宣言し、compatibility根拠は未評価とする。**期待oracle**：抽象/実装identityは別に保持し、compatible_withを推定せずunknownを返す。

### `HELIXBRAIN-L2-INFRA-013` — BRAIN-INFRA-013-FR-01 / AC-01, AC-02

固定sourceはf6dad2a33e24f000b87d7f09b8d40288257e74cc、L2 lines 342–351、L11 line 53。各caseは独立fixtureで実施し、成功は実環境の成立を意味しない。

- **L10-BRAIN-INFRA-013-C01（正常／AC-01）**：Local/VPS/Dedicated/Cloud/GPU/Distributed workerのprovider非依存resource/capability表現を全て含む宣言済み合成対象を与える。**期待oracle**：全必須要素を親の対象identityと対応付け、L2のscopeと責務を保持する。
- **L10-BRAIN-INFRA-013-C02（個別欠落／AC-02）**：必須field/relation/列挙要素を一度に一つだけmissingにしたfixtureを列挙集合の各要素について作る。**期待oracle**：当該要素とmissing reasonを特定し、成功/適用扱いにせず止める。C02の分母は `6 resource classと抽象capability relation` とする。
- **L10-BRAIN-INFRA-013-C03（親固有negative／AC-02）**：cloud-only前提、knowledge identityとruntime stateの混同、credential/actionを知識化。**期待oracle**：不成立reasonを特定し、実stateはInfrastructure Runtime、securityはSECURITY。
- **L10-BRAIN-INFRA-013-C04（unknown/stale/対象不一致／AC-02）**：固定L2が明示するidentity/condition/relationだけを対象に、unknown、矛盾、別対象を一項目ずつ変異する。L2がsource/evidenceを要求しない箇所へ新しいevidence義務を足さない。**期待oracle**：AC-02に従い不成立またはunknownと戻し先を示し、成功/適用扱いにしない。
- **L10-BRAIN-INFRA-013-C05（未見正常／AC-01）**：未見のdistributed worker node候補をprovider非依存resource/capability modelに置き、実環境値は与えない。**期待oracle**：抽象resourceとして識別し、cloud/providerを必須化せず実状態・credential・操作権限を推定しない。

### `HELIXBRAIN-L2-INFRA-014` — BRAIN-INFRA-014-FR-01 / AC-01, AC-02

固定sourceはf6dad2a33e24f000b87d7f09b8d40288257e74cc、L2 lines 352–361、L11 line 54。各caseは独立fixtureで実施し、成功は実環境の成立を意味しない。

- **L10-BRAIN-INFRA-014-C01（正常／AC-01）**：9 topology relationのtype/両endpoint/意味を全て含む宣言済み合成対象を与える。**期待oracle**：全必須要素を親の対象identityと対応付け、L2のscopeと責務を保持する。
- **L10-BRAIN-INFRA-014-C02（個別欠落／AC-02）**：必須field/relation/列挙要素を一度に一つだけmissingにしたfixtureを列挙集合の各要素について作る。**期待oracle**：当該要素とmissing reasonを特定し、成功/適用扱いにせず止める。C02の分母は `9 relation type × type/endpoints/meaning` とする。
- **L10-BRAIN-INFRA-014-C03（親固有negative／AC-02）**：各relation type/端点/meaningの単独欠落、component listだけで成立、実状態の推定。**期待oracle**：不成立reasonを特定し、actual topologyはRuntime、relation意味はHELIXBRAIN-L1-005。
- **L10-BRAIN-INFRA-014-C04（unknown/stale/対象不一致／AC-02）**：固定L2が明示するidentity/condition/relationだけを対象に、unknown、矛盾、別対象を一項目ずつ変異する。L2がsource/evidenceを要求しない箇所へ新しいevidence義務を足さない。**期待oracle**：AC-02に従い不成立またはunknownと戻し先を示し、成功/適用扱いにしない。
- **L10-BRAIN-INFRA-014-C05（未見正常／AC-01）**：新しいsynthetic Application→Queue→Worker topologyをrelation endpoint/meaningつきで構成する。**期待oracle**：明示relationを保持し、未宣言の実topologyを補完しない。

### `HELIXBRAIN-L2-INFRA-015` — BRAIN-INFRA-015-FR-01 / AC-01, AC-02

固定sourceはf6dad2a33e24f000b87d7f09b8d40288257e74cc、L2 lines 362–371、L11 line 55。各caseは独立fixtureで実施し、成功は実環境の成立を意味しない。

- **L10-BRAIN-INFRA-015-C01（正常／AC-01）**：InfrastructureとAPI/Data/Security/Visual-UX等のaffects/constrains/may affect方向・根拠・不確かさを全て含む宣言済み合成対象を与える。**期待oracle**：全必須要素を親の対象identityと対応付け、L2のscopeと責務を保持する。
- **L10-BRAIN-INFRA-015-C02（個別欠落／AC-02）**：必須field/relation/列挙要素を一度に一つだけmissingにしたfixtureを列挙集合の各要素について作る。**期待oracle**：当該要素とmissing reasonを特定し、成功/適用扱いにせず止める。C02の分母は `固定例のDomain pair × direction/evidence/uncertainty` とする。
- **L10-BRAIN-INFRA-015-C03（親固有negative／AC-02）**：endpoint/方向/evidence欠落、可能性をcausesへ確定、他Domain ownerの判断代行。**期待oracle**：不成立reasonを特定し、関係先Domain ownerへ返す。因果確定は根拠が別途ない限り行わない。
- **L10-BRAIN-INFRA-015-C04（unknown/stale/対象不一致／AC-02）**：固定L2が明示するidentity/condition/relationだけを対象に、unknown、矛盾、別対象を一項目ずつ変異する。L2がsource/evidenceを要求しない箇所へ新しいevidence義務を足さない。**期待oracle**：AC-02に従い不成立またはunknownと戻し先を示し、成功/適用扱いにしない。
- **L10-BRAIN-INFRA-015-C05（未見正常／AC-01）**：Visual/UX→Frontend Deliveryへのmay affect relationを新規fixtureで、方向・根拠・不確かさを明記して与える。**期待oracle**：可能性として保持し、確定causesへ強めず関係先Domain ownerを識別する。

### `HELIXBRAIN-L2-INFRA-016` — BRAIN-INFRA-016-FR-01 / AC-01, AC-02

固定sourceはf6dad2a33e24f000b87d7f09b8d40288257e74cc、L2 lines 372–381、L11 line 56。各caseは独立fixtureで実施し、成功は実環境の成立を意味しない。

- **L10-BRAIN-INFRA-016-C01（正常／AC-01）**：11 anti-patternの各成立条件/failure sign/safer alternativeを全て含む宣言済み合成対象を与える。**期待oracle**：全必須要素を親の対象identityと対応付け、L2のscopeと責務を保持する。
- **L10-BRAIN-INFRA-016-C02（個別欠落／AC-02）**：必須field/relation/列挙要素を一度に一つだけmissingにしたfixtureを列挙集合の各要素について作る。**期待oracle**：当該要素とmissing reasonを特定し、成功/適用扱いにせず止める。C02の分母は `11 anti-pattern × condition/sign/alternative` とする。
- **L10-BRAIN-INFRA-016-C03（親固有negative／AC-02）**：要素欠落、条件を外したuniversal ban、evidence不足の確定分類。**期待oracle**：不成立reasonを特定し、適用証拠がunknownならLABOへ返す。
- **L10-BRAIN-INFRA-016-C04（unknown/stale/対象不一致／AC-02）**：固定L2が明示するidentity/condition/relationだけを対象に、unknown、矛盾、別対象を一項目ずつ変異する。L2がsource/evidenceを要求しない箇所へ新しいevidence義務を足さない。**期待oracle**：AC-02に従い不成立またはunknownと戻し先を示し、成功/適用扱いにしない。
- **L10-BRAIN-INFRA-016-C05（未見正常／AC-01）**：未見の条件付きUnbounded Queue例へ成立条件、兆候、安全な代替を記載し条件外の状態をunknownとする。**期待oracle**：条件付きAnti-Patternとして保持し、全状況禁止へ一般化しない。

### `HELIXBRAIN-L2-INFRA-017` — BRAIN-INFRA-017-FR-01 / AC-01, AC-02

固定sourceはf6dad2a33e24f000b87d7f09b8d40288257e74cc、L2 lines 382–391、L11 line 57。各caseは独立fixtureで実施し、成功は実環境の成立を意味しない。

- **L10-BRAIN-INFRA-017-C01（正常／AC-01）**：maturity state、BRAIN version、project usage versionを異なる値で持ち、対象revision/evidence/failure/counterexample/LABO評価を結ぶ宣言済み合成対象を与える。**期待oracle**：全必須要素を親の対象identityと対応付け、L2のscopeと責務を保持する。
- **L10-BRAIN-INFRA-017-C02（個別欠落／AC-02）**：必須field/relation/列挙要素を一度に一つだけmissingにしたfixtureを列挙集合の各要素について作る。**期待oracle**：当該要素とmissing reasonを特定し、成功/適用扱いにせず止める。C02の分母は6 maturity stateと、別軸のBRAIN version・project usage version、および固定L2が要求するevidence/scope/counterexample/LABO evaluation。各fieldを一つずつ独立欠落させる。
- **L10-BRAIN-INFRA-017-C03（親固有negative／AC-02）**：maturity/version/project-use各軸を他軸へ代入する、各軸を一つずつ欠落させる、単一内部successからuniversal/mature昇格、failure/適用限界の隠蔽。**期待oracle**：不成立reasonを特定し、不足評価は昇格推定せずexperimental/observed candidateに留める。failureを保持したまま複数条件評価の入力として記録し、3軸の相互代入でstateを変更しない。
- **L10-BRAIN-INFRA-017-C04（unknown/stale/対象不一致／AC-02）**：固定L2が明示するidentity/condition/relationだけを対象に、unknown、矛盾、別対象を一項目ずつ変異する。L2がsource/evidenceを要求しない箇所へ新しいevidence義務を足さない。**期待oracle**：AC-02に従い不成立またはunknownと戻し先を示し、成功/適用扱いにしない。
- **L10-BRAIN-INFRA-017-C05（未見正常／AC-01）**：既存fixtureと異なるPatternについて複数条件でLABO評価し一条件でfailureを観測する一方、maturity state/BRAIN version/project usage versionを互いに異なる値で与える。**期待oracle**：3軸とfailure/scope/評価結果を同一対象revisionに保ち、failureを隠さず状態遷移を新閾値から推定しない。
