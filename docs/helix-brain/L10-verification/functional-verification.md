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

## Stage 2b追補 — 採択済み001〜006の部分草稿

**状態：候補のみ（独立review／L3承認前）。** Stage 1 prefixは最新main `a7ae47c0bd97cd53298594086923c73dfb2a712b`で承認済みのbytesを保持する。本追補はPO main `633bf12ea8f948db8ba3d6600179c4a9507377a7`の採択registrationと、固定L2/L11 `f6dad2a33e24f000b87d7f09b8d40288257e74cc`の001〜006だけを候補として具体化する。各親のversion targetは1.0、G0配属はStage 2bであり、release収載や全前Stage完了gate、実装・実行許可を生成しない。後続版・Web条件付き・保留/不採択を親にしない。

### HELIXBRAIN-L2-001 — BRAIN-001-FR-01との対

対象親・registration・revisionはL3本追補と同じ。全caseでfixture source、対象scope/revision、独立の期待値、入力と実出力、不足とownerを記録する。CASEが存在するだけでは合格にしない。fixture値は試験用であり、保存形式・runtime・製品採用を確定しない。

| CASE | 対応AC | 入力・独立変異 | 観測oracle |
|---|---|---|---|
| `L10-BRAIN-001-C01` | `BRAIN-001-AC-01` | 10初期領域を別identity/意味/状態で与え、各Patternの参照先を照合する。Visual DesignとUX / Interactionも初期集合に残る。 | 入力sourceの値と対象scopeに対する実出力を項目別に照合し、identity/意味/条件と責務の対応を確認する。候補の表示を採用/実行のreceiptにしない。 |
| `L10-BRAIN-001-C02` | `BRAIN-001-AC-02` | 正常fixtureから `Software Architecture` の識別/意味対応を、欠落・誤identity・意味誤対応へそれぞれ独立に変異させる。 | 当該初期Domainの各独立変異をAC-02の不成立として検出する。他Domainの被覆数や名前の存在で相殺しない。AC-03への戻し先判定はC13で別に照合する。 |
| `L10-BRAIN-001-C03` | `BRAIN-001-AC-02` | 正常fixtureから `Application Architecture` の識別/意味対応を、欠落・誤identity・意味誤対応へそれぞれ独立に変異させる。 | 当該初期Domainの各独立変異をAC-02の不成立として検出する。他Domainの被覆数や名前の存在で相殺しない。AC-03への戻し先判定はC13で別に照合する。 |
| `L10-BRAIN-001-C04` | `BRAIN-001-AC-02` | 正常fixtureから `Backend` の識別/意味対応を、欠落・誤identity・意味誤対応へそれぞれ独立に変異させる。 | 当該初期Domainの各独立変異をAC-02の不成立として検出する。他Domainの被覆数や名前の存在で相殺しない。AC-03への戻し先判定はC13で別に照合する。 |
| `L10-BRAIN-001-C05` | `BRAIN-001-AC-02` | 正常fixtureから `Frontend` の識別/意味対応を、欠落・誤identity・意味誤対応へそれぞれ独立に変異させる。 | 当該初期Domainの各独立変異をAC-02の不成立として検出する。他Domainの被覆数や名前の存在で相殺しない。AC-03への戻し先判定はC13で別に照合する。 |
| `L10-BRAIN-001-C06` | `BRAIN-001-AC-02` | 正常fixtureから `API / Integration` の識別/意味対応を、欠落・誤identity・意味誤対応へそれぞれ独立に変異させる。 | 当該初期Domainの各独立変異をAC-02の不成立として検出する。他Domainの被覆数や名前の存在で相殺しない。AC-03への戻し先判定はC13で別に照合する。 |
| `L10-BRAIN-001-C07` | `BRAIN-001-AC-02` | 正常fixtureから `Data / Database` の識別/意味対応を、欠落・誤identity・意味誤対応へそれぞれ独立に変異させる。 | 当該初期Domainの各独立変異をAC-02の不成立として検出する。他Domainの被覆数や名前の存在で相殺しない。AC-03への戻し先判定はC13で別に照合する。 |
| `L10-BRAIN-001-C08` | `BRAIN-001-AC-02` | 正常fixtureから `Infrastructure` の識別/意味対応を、欠落・誤identity・意味誤対応へそれぞれ独立に変異させる。 | 当該初期Domainの各独立変異をAC-02の不成立として検出する。他Domainの被覆数や名前の存在で相殺しない。AC-03への戻し先判定はC13で別に照合する。 |
| `L10-BRAIN-001-C09` | `BRAIN-001-AC-02` | 正常fixtureから `Security` の識別/意味対応を、欠落・誤identity・意味誤対応へそれぞれ独立に変異させる。 | 当該初期Domainの各独立変異をAC-02の不成立として検出する。他Domainの被覆数や名前の存在で相殺しない。AC-03への戻し先判定はC13で別に照合する。 |
| `L10-BRAIN-001-C10` | `BRAIN-001-AC-02` | 正常fixtureから `Visual Design` の識別/意味対応を、欠落・誤identity・意味誤対応へそれぞれ独立に変異させる。 | 当該初期Domainの各独立変異をAC-02の不成立として検出する。他Domainの被覆数や名前の存在で相殺しない。AC-03への戻し先判定はC13で別に照合する。 |
| `L10-BRAIN-001-C11` | `BRAIN-001-AC-02` | 正常fixtureから `UX / Interaction` の識別/意味対応を、欠落・誤identity・意味誤対応へそれぞれ独立に変異させる。 | 当該初期Domainの各独立変異をAC-02の不成立として検出する。他Domainの被覆数や名前の存在で相殺しない。AC-03への戻し先判定はC13で別に照合する。 |
| `L10-BRAIN-001-C12` | `BRAIN-001-AC-02` | 製品/project名をDomainに固定する入力、追加可能6領域の初版充実を必須とする入力、既存relation利用者を消す入力を個別に拒否する。 | 各反例を独立試行し、該当する固定L2/L11の禁止または不足を理由付きで示す。正当な別operationを同じ理由で一律に止めない。 |
| `L10-BRAIN-001-C13` | `BRAIN-001-AC-03` | 領域の分類意味が重複または不明なら候補のまま停止し、意味差をHELIXBRAIN-L1-001へ返す。 | 不足・不明な項目、停止した候補、戻し先、再提示に必要な意味/sourceを記録する。unknownをpassへ丸めず、別ownerのauthorityを生成しない。 |
| `L10-BRAIN-001-C14` | `BRAIN-001-AC-04` | 正常fixtureにないidentity/組合せを使うが、適用条件・meaning source・必要参照を親契約どおりに揃える。 未見Domainを初期enumにないことだけで拒否しない。意味と既存参照を照合し、追加/分割/統合/退役のいずれでも旧参照利用者を消さない。 | AC-01と同じ条件で照合する。親の必要入力が不明な枝は未見正常と偽らずAC-03へ分類する。 |
| `L10-BRAIN-001-C15` | `BRAIN-001-AC-01` | 追加 fixture：新Domain候補D-newを初期10以外で追加。意味が明確で旧Pattern参照は保持。 | 正常は既存参照/利用者と由来が保持されること、不明/不充足はその状態と戻し先が正しく保持されることを内容で照合する。 |
| `L10-BRAIN-001-C16` | `BRAIN-001-AC-01` | 分割 fixture：Domain DをD-a/D-bへ分割し、元Dを参照したPatternとrelation利用者の対応を表示する。 | 正常は既存参照/利用者と由来が保持されること、不明/不充足はその状態と戻し先が正しく保持されることを内容で照合する。 |
| `L10-BRAIN-001-C17` | `BRAIN-001-AC-01` | 統合 fixture：D-a/D-bをD-cへ統合し、両旧参照の由来を識別する。 | 正常は既存参照/利用者と由来が保持されること、不明/不充足はその状態と戻し先が正しく保持されることを内容で照合する。 |
| `L10-BRAIN-001-C18` | `BRAIN-001-AC-01` | 退役 fixture：Dを退役状態へ変え、Dを利用していたrelationと利用者の識別を保持する。 | 正常は既存参照/利用者と由来が保持されること、不明/不充足はその状態と戻し先が正しく保持されることを内容で照合する。 |

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
| `L10-BRAIN-002-C10` | `BRAIN-002-AC-02` | fileのみ、code片のみ、UI component集のみをPatternとして返す各入力を不合格とする。identity欠落・孤立・誤種別も項目別に検出する。 | 各反例を独立試行し、該当する固定L2/L11の禁止または不足を理由付きで示す。正当な別operationを同じ理由で一律に止めない。 |
| `L10-BRAIN-002-C11` | `BRAIN-002-AC-03` | 階層または要素の意味を決められない項目をunknown/候補保留とし、HELIXBRAIN-L1-002へ返す。 | 不足・不明な項目、停止した候補、戻し先、再提示に必要な意味/sourceを記録する。unknownをpassへ丸めず、別ownerのauthorityを生成しない。 |
| `L10-BRAIN-002-C12` | `BRAIN-002-AC-04` | 正常fixtureにないidentity/組合せを使うが、適用条件・meaning source・必要参照を親契約どおりに揃える。 未見の正当な構成にも同じidentity/親/責務照合を適用する。例の名前だけから意味を推測しない。 | AC-01と同じ条件で照合する。親の必要入力が不明な枝は未見正常と偽らずAC-03へ分類する。 |

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
| `L10-BRAIN-003-C14` | `BRAIN-003-AC-02` | descriptor各要素の欠落、negative/failure/evidence欠落、必要inputの一項目欠落、条件不充足、存在だけで採用する入力を個別に照合し、適用可能と断定しない。 | 各反例を独立試行し、該当する固定L2/L11の禁止または不足を理由付きで示す。正当な別operationを同じ理由で一律に止めない。 |
| `L10-BRAIN-003-C15` | `BRAIN-003-AC-03` | 条件の意味・必須inputが未定なら適用提案を停止し、HELIXBRAIN-L1-003または該当要求意味ownerへ返す。unknownを条件不充足や充足へ丸めない。 | 不足・不明な項目、停止した候補、戻し先、再提示に必要な意味/sourceを記録する。unknownをpassへ丸めず、別ownerのauthorityを生成しない。 |
| `L10-BRAIN-003-C16` | `BRAIN-003-AC-04` | 正常fixtureにないidentity/組合せを使うが、適用条件・meaning source・必要参照を親契約どおりに揃える。 未見scopeでも同じ条件とsourceを照合する。互換性やmaturityの存在だけで採用せず、未入力の必須条件は未解決のまま返す。 | AC-01と同じ条件で照合する。親の必要入力が不明な枝は未見正常と偽らずAC-03へ分類する。 |
| `L10-BRAIN-003-C17` | `BRAIN-003-AC-03` | 不充足 fixture：sourceの前提Qをfalseとする一変異。Pは存在しても当該適用は不成立。 | 正常は既存参照/利用者と由来が保持されること、不明/不充足はその状態と戻し先が正しく保持されることを内容で照合する。 |
| `L10-BRAIN-003-C18` | `BRAIN-003-AC-03` | unknown fixture：同じQの値をunknownにし、falseへ丸めず不足とownerを返す。 | 正常は既存参照/利用者と由来が保持されること、不明/不充足はその状態と戻し先が正しく保持されることを内容で照合する。 |

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
| `L10-BRAIN-004-C08` | `BRAIN-004-AC-02` | 候補一つだけを恒久正解とし他を上書き、稼働案件の採用をBRAINが確定、比較軸欠落を完全な比較と表示する各入力を個別に拒否する。 | 各反例を独立試行し、該当する固定L2/L11の禁止または不足を理由付きで示す。正当な別operationを同じ理由で一律に止めない。 |
| `L10-BRAIN-004-C09` | `BRAIN-004-AC-03` | 比較に必要な要求値/重みがなければ欠落を示して選択を保留し、HARNESS-CORE/INTELLIGENCE/人間の適切な判断先へ返す。 | 不足・不明な項目、停止した候補、戻し先、再提示に必要な意味/sourceを記録する。unknownをpassへ丸めず、別ownerのauthorityを生成しない。 |
| `L10-BRAIN-004-C10` | `BRAIN-004-AC-04` | 正常fixtureにないidentity/組合せを使うが、適用条件・meaning source・必要参照を親契約どおりに揃える。 未見Patternを含む比較でも候補集合と制約を保持し、比較表示を採用決定に変えない。成立判定不明の候補を成立済みと捏造しない。 | AC-01と同じ条件で照合する。親の必要入力が不明な枝は未見正常と偽らずAC-03へ分類する。 |

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
| `L10-BRAIN-005-C09` | `BRAIN-005-AC-02` | relation名だけ、unknown endpoint、未確認因果、名称類似だけのedgeを意味関係に確定する入力を個別に拒否する。領域横断edgeを脱落させない。 | 各反例を独立試行し、該当する固定L2/L11の禁止または不足を理由付きで示す。正当な別operationを同じ理由で一律に止めない。 |
| `L10-BRAIN-005-C10` | `BRAIN-005-AC-03` | 向きまたは意味が未定ならedgeを確定せずHELIXBRAIN-L1-005へ返す。既知の一方端点から他方を捏造しない。 | 不足・不明な項目、停止した候補、戻し先、再提示に必要な意味/sourceを記録する。unknownをpassへ丸めず、別ownerのauthorityを生成しない。 |
| `L10-BRAIN-005-C11` | `BRAIN-005-AC-04` | 正常fixtureにないidentity/組合せを使うが、適用条件・meaning source・必要参照を親契約どおりに揃える。 未見だがsourceで正当に定義されたedgeも方向/意味/両端identityで照合する。requires等を一律対称関係へ変えない。 | AC-01と同じ条件で照合する。親の必要入力が不明な枝は未見正常と偽らずAC-03へ分類する。 |

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
| `L10-BRAIN-009-C01` | `BRAIN-009-AC-01` | source/versionが有効な既存Unit二つ、両端identity、根拠付きrelation案を与える。比較を行わずsource未選択の構成も正常fixtureに含め、未選択sourceを未観測とする。出力candidateと構成根拠、LABO/OS/BRAIN状態を別々に観測し、昇格なしを確認する。 |
| `L10-BRAIN-009-C02` | `BRAIN-009-AC-02` | C01から一方のrelation端点だけを欠落させる。期待oracleは欠落端点を理由としてrelation適用を停止し、両端identityを補完せず、未確定意味をBRAIN-L1-009へ返すこと。 |
| `L10-BRAIN-009-C03` | `BRAIN-009-AC-02` | relation meaning/sourceの一方だけを欠落または不一致にするfixtureを別々に与える。unknown保持、適用可能判定なし、BRAIN-L1-009戻しを観測する。 |
| `L10-BRAIN-009-C04` | `BRAIN-009-AC-02` | LABO評価だけが未了の状態で昇格要求。候補維持、評価状態の不足を示す。 |
| `L10-BRAIN-009-C05` | `BRAIN-009-AC-02` | OS登録だけが未了の状態で昇格要求。LABO/BRAIN状態を代用せず候補維持する。 |
| `L10-BRAIN-009-C06` | `BRAIN-009-AC-02` | BRAIN独立検証だけが未了の状態で昇格要求。期待oracleはcandidateを維持し、独立検証未完を特定してBRAINの既存検証経路へ返す。 |
| `L10-BRAIN-009-C07` | `BRAIN-009-AC-03` | sourceがrelationの意味を決めない入力。適用可能へ推定せずunknownに保持しL1-009へ返す。 |
| `L10-BRAIN-009-C08` | `BRAIN-009-AC-04` | 既知fixtureと異なるsource定義済みUnit組合せを投入する。期待oracleは両端identity、relation meaning/source、scopeとcandidate状態を照合し、候補のまま返す。oracle未定の枝は未評価とする。 |
| `L10-BRAIN-009-C09` | `BRAIN-009-AC-02` | C01の他条件を維持し、L2-025の昇格経路だけを未完にする。期待oracleはcandidateを維持し、未完のL2-025経路を独立理由として示す。 |
| `L10-BRAIN-009-C10` | `BRAIN-009-AC-02` | C01の他条件を維持し、選択source identityだけを欠落させる。期待oracleはsource欠落を理由にcandidate適用/昇格を止め、BRAIN-L1-009へ不足を返す。 |
| `L10-BRAIN-009-C11` | `BRAIN-009-AC-02` | C01の他条件を維持し、選択source revisionだけを要求revisionと不一致にする。期待oracleはstale/mismatchを明示し旧sourceを再利用せず、candidate適用/昇格を止めてBRAIN-L1-009へ返す。 |

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

### HELIXBRAIN-L2-011 — BRAIN-011-FR-01との対

| CASE | 対応AC | 入力・oracle |
|---|---|---|
| `L10-BRAIN-011-C01` | `BRAIN-011-AC-01` | source付き構造を一般化候補と製品固有残余に分離する。根拠、scope、元source traceを両側に保つ。 |
| `L10-BRAIN-011-C02` | `BRAIN-011-AC-02` | 製品名だけをgeneric候補へ漏らす。期待oracleは製品名をgeneric candidateから除き、製品固有残余と元source traceを保持する。 |
| `L10-BRAIN-011-C03` | `BRAIN-011-AC-02` | product requirementだけを汎用候補へ漏らす。期待oracleは汎用候補からその値を除き、元sourceの製品固有残余へ保持する。 |
| `L10-BRAIN-011-C04` | `BRAIN-011-AC-02` | 製品固有screenまたは具体APIだけを汎用候補へ漏らす。期待oracleはその製品固有要素を除外し残余とsource traceを保持する。汎用API構造自体は拒否しない。 |
| `L10-BRAIN-011-C05` | `BRAIN-011-AC-02` | business ruleだけを汎用候補へ漏らす。期待oracleは当該規則を製品固有残余へ保持し、汎用候補への混入を拒否する。 |
| `L10-BRAIN-011-C06` | `BRAIN-011-AC-02` | user judgmentだけを汎用候補へ漏らす。期待oracleは判断を汎用事実化せず、元sourceに結んだ残余として保持する。 |
| `L10-BRAIN-011-C07` | `BRAIN-011-AC-02` | 他条件を正常に保ちsource/provenance linkだけを消す。期待oracleは一般化確定を拒否し、失われた出所を示して固定親の提供元COREまたはLABOへ返す。 |
| `L10-BRAIN-011-C08` | `BRAIN-011-AC-03` | source meaningを分離不能にする。期待oracleはgeneric acceptanceを止め、固定親どおりprovider COREまたはLABOへ不足と理由を返す。ownerを推測しない。 |
| `L10-BRAIN-011-C09` | `BRAIN-011-AC-04` | 未見の別製品sourceを用い、根拠のある範囲だけ分離する。期待oracleはgeneric candidateとproduct-specific residual双方にsource traceを残し、根拠のない普遍化をunknownにする。 |

### HELIXBRAIN-L2-012 — BRAIN-012-FR-01との対

| CASE | 対応AC | 入力・oracle |
|---|---|---|
| `L10-BRAIN-012-C01` | `BRAIN-012-AC-01` | 複数candidateとrequired input/relation/alternative/constraint/evidence/versionを返し、decisionは未決に保つ。 |
| `L10-BRAIN-012-C02` | `BRAIN-012-AC-02` | 他の返却値を保ちdecision statusだけをadoptedへ変える。期待oracleはBRAIN起因の採用stateを拒否し、decision未決と候補tupleを保持する。 |
| `L10-BRAIN-012-C03` | `BRAIN-012-AC-02` | 正常tupleへ製品固有案のselected表示だけを加える。期待oracleは選択表示を拒否し、候補状態とdecision未決を維持する。 |
| `L10-BRAIN-012-C04` | `BRAIN-012-AC-02` | 正常tupleへruntime/operation decisionだけを加える。期待oracleはBRAINによるdecision生成を拒否し、固定親の既存ownerへ返す。 |
| `L10-BRAIN-012-C05` | `BRAIN-012-AC-02` | required inputを一つ欠落させる。期待oracleはそのinputの欠落を特定し、候補tupleの成立を止めunknown/不足として返す。 |
| `L10-BRAIN-012-C06` | `BRAIN-012-AC-02` | relation返却だけを欠落させる。期待oracleはrelation不足を特定し、他のtuple項目で補完せず候補tupleを不成立にする。 |
| `L10-BRAIN-012-C07` | `BRAIN-012-AC-02` | alternative返却だけを欠落させる。期待oracleはalternative不足を特定し、sourceにない値を生成せず候補tupleを不成立にする。 |
| `L10-BRAIN-012-C08` | `BRAIN-012-AC-02` | constraint、evidence、versionをそれぞれ一つだけ欠落させる独立fixture。各fixtureの期待oracleは当該field名と不足理由を返し、候補tuple成立を拒否する。 |
| `L10-BRAIN-012-C09` | `BRAIN-012-AC-03` | 要求意味またはweight未確定。期待oracleは選択を生成せずunknown/未決を示し、固定親の既存decision ownerへ不足理由を返す。 |
| `L10-BRAIN-012-C10` | `BRAIN-012-AC-04` | 未見・曖昧queryを与える。期待oracleは根拠ある候補、個別不足、unknownを区別して返し、候補数や受領を採用と解釈しない。 |

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
| `L10-BRAIN-029-C07` | `BRAIN-029-AC-02` | 製品名/具体API/製品固有permission値または製品固有requirementを一つずつ汎用候補へ混入する独立fixture。期待oracleは当該要素だけを除外し、製品固有残余を保持してHARNESSへ返す。汎用permission構造は正常に保持する。 |
| `L10-BRAIN-029-C08` | `BRAIN-029-AC-02` | 常時必須inputを一つだけ欠落させる。期待oracleは当該input名を不足として示し、未選択sourceから補完せずunknown/不成立を返す。 |
| `L10-BRAIN-029-C09` | `BRAIN-029-AC-02` | 選択source identity欠落、選択source revision欠落、選択source identity不一致、選択source revision不一致を個別fixtureにする。期待oracleは欠落/stale/mismatchを区別し、誤ったsource結合をせずcandidate適用を止めて該当ownerへ返す。 |
| `L10-BRAIN-029-C10` | `BRAIN-029-AC-02` | sourceが互換でないと示すrelationを`compatible_with`として扱う変異を与える。期待oracleはsource meaningと矛盾するedgeを拒否し、互換candidateを返さない。 |
| `L10-BRAIN-029-C11` | `BRAIN-029-AC-02` | relation meaning欠落と片端identity欠落を別々のfixtureで与える。期待oracleは欠落したfieldを特定し、いずれもrelation成立を推定しない。 |
| `L10-BRAIN-029-C12` | `BRAIN-029-AC-02` | 一回の製品適用を根拠に確立Patternへ昇格させる変異を与える。期待oracleはcandidate stateを維持し、単一適用による昇格を拒否する。 |
| `L10-BRAIN-029-C13` | `BRAIN-029-AC-04` | relation meaning/condition不明のfixtureと選択source未充足のfixtureを分ける。期待oracleは各不足をunknownとして保持し、知識意味はBRAIN-L1-003/005/009、製品意味はHARNESSへ返す。 |
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
| `L10-BRAIN-029-C24` | `BRAIN-029-AC-02` | 常時必須L2-008 identity/version/provenanceのmissing変異を他条件を正常に保って単独投入する。L2-008のidentity/version/provenanceのうち一つだけを欠落させる独立fixture。期待oracleは欠落fieldを名指しし、構成適用を止めBRAIN-L1-008へ返す。 |
| `L10-BRAIN-029-C25` | `BRAIN-029-AC-02` | 常時必須L2-008 identity/version/provenanceのunknown変異を他条件を正常に保って単独投入する。L2-008のidentity/version/provenanceのうち一つだけをunknownにする独立fixture。期待oracleはunknownをcurrent等へ推定せず停止しBRAIN-L1-008へ返す。 |
| `L10-BRAIN-029-C26` | `BRAIN-029-AC-02` | 常時必須L2-008 identity/version/provenanceのstale変異を他条件を正常に保って単独投入する。L2-008のidentity/version/provenance sourceのうち一つだけをstaleにする独立fixture。期待oracleはstale fieldを特定し停止してBRAIN-L1-008へ返す。 |
| `L10-BRAIN-029-C27` | `BRAIN-029-AC-02` | 常時必須L2-008 identity/version/provenanceのrevision mismatch変異を他条件を正常に保って単独投入する。L2-008のidentity/version/provenance source revisionを一つだけ不一致にする独立fixture。期待oracleは旧revisionを流用せず停止しBRAIN-L1-008へ返す。 |
| `L10-BRAIN-029-C28` | `BRAIN-029-AC-02` | 比較時のみL2-004のmissing変異を他条件を正常に保って単独投入する。比較操作を選択し、L2-004の比較基準だけを欠落させる。期待oracleは比較結果を出さず、比較基準不足としてBRAIN-L1-004へ返す。 |
| `L10-BRAIN-029-C29` | `BRAIN-029-AC-02` | 比較時のみL2-004のunknown変異を他条件を正常に保って単独投入する。比較操作を選択し、L2-004の比較基準だけをunknownにする。期待oracleは比較優劣を決めずunknownで停止しBRAIN-L1-004へ返す。 |
| `L10-BRAIN-029-C30` | `BRAIN-029-AC-02` | 比較時のみL2-004のstale変異を他条件を正常に保って単独投入する。比較操作を選択し、L2-004の比較sourceだけをstaleにする。期待oracleは古い基準で比較せず停止しBRAIN-L1-004へ返す。 |
| `L10-BRAIN-029-C31` | `BRAIN-029-AC-02` | 比較時のみL2-004のrevision mismatch変異を他条件を正常に保って単独投入する。比較操作を選択し、L2-004の比較source revisionだけを不一致にする。期待oracleは旧revisionを流用せず比較を止めBRAIN-L1-004へ返す。 |
| `L10-BRAIN-029-C32` | `BRAIN-029-AC-02` | 構成操作時のみL2-009のmissing変異を他条件を正常に保って単独投入する。構成candidate操作を選択し、L2-009の構成条件だけを欠落させる。期待oracleは構成candidateを返さず不足をBRAIN-L1-009へ返す。 |
| `L10-BRAIN-029-C33` | `BRAIN-029-AC-02` | 構成操作時のみL2-009のunknown変異を他条件を正常に保って単独投入する。構成candidate操作を選択し、L2-009の構成条件だけをunknownにする。期待oracleはunknownを保持してcandidate適用を止めBRAIN-L1-009へ返す。 |
| `L10-BRAIN-029-C34` | `BRAIN-029-AC-02` | 構成操作時のみL2-009のstale変異を他条件を正常に保って単独投入する。構成candidate操作を選択し、L2-009のsourceだけをstaleにする。期待oracleは旧sourceで構成せず停止してBRAIN-L1-009へ返す。 |
| `L10-BRAIN-029-C35` | `BRAIN-029-AC-02` | 構成操作時のみL2-009のrevision mismatch変異を他条件を正常に保って単独投入する。構成candidate操作を選択し、L2-009のsource revisionだけを不一致にする。期待oracleは旧revisionを流用せず停止してBRAIN-L1-009へ返す。 |
| `L10-BRAIN-029-C36` | `BRAIN-029-AC-02` | 選択CORE sourceのL2-018のmissing変異を他条件を正常に保って単独投入する。CORE sourceを選択し、そのL2-018 source identity/revision/provenanceの一つだけを欠落させる独立fixture。期待oracleは選択sourceを未充足としてcandidate適用を止め、固定CORE提供元へ返す。 |
| `L10-BRAIN-029-C37` | `BRAIN-029-AC-02` | 選択CORE sourceのL2-018のunknown変異を他条件を正常に保って単独投入する。CORE sourceを選択し、そのL2-018 source identity/revision/provenanceの一つだけをunknownにする独立fixture。期待oracleは未解決を保持しcandidate適用を止め、固定CORE提供元へ返す。 |
| `L10-BRAIN-029-C38` | `BRAIN-029-AC-02` | 選択CORE sourceのL2-018のstale変異を他条件を正常に保って単独投入する。CORE sourceを選択し、そのL2-018 sourceだけをstaleにする。期待oracleは古いsourceを流用せずcandidate適用を止め、固定CORE提供元へ返す。 |
| `L10-BRAIN-029-C39` | `BRAIN-029-AC-02` | 選択CORE sourceのL2-018のrevision mismatch変異を他条件を正常に保って単独投入する。CORE source revisionだけを要求revisionと不一致にする。期待oracleは別revisionを流用せずcandidate適用を止め、固定CORE提供元へ返す。 |
| `L10-BRAIN-029-C40` | `BRAIN-029-AC-02` | 選択LABO-evaluated sourceのL2-020のmissing変異を他条件を正常に保って単独投入する。LABO評価済みsourceを選択し、そのL2-020 source/scope/evaluationの一要素だけを欠落させる独立fixture。期待oracleは評価済みと扱わず不足をLABOへ返しcandidate適用を止める。 |
| `L10-BRAIN-029-C41` | `BRAIN-029-AC-02` | 選択LABO-evaluated sourceのL2-020のunknown変異を他条件を正常に保って単独投入する。LABO評価済みsourceを選択し、そのL2-020 source/scope/evaluationの一要素だけをunknownにする独立fixture。期待oracleはunknownを保持しLABOへ返してcandidate適用を止める。 |
| `L10-BRAIN-029-C42` | `BRAIN-029-AC-02` | 選択LABO-evaluated sourceのL2-020のstale変異を他条件を正常に保って単独投入する。LABO評価済みsourceだけをstaleにする。期待oracleは古い評価を使わずLABOへ返してcandidate適用を止める。 |
| `L10-BRAIN-029-C43` | `BRAIN-029-AC-02` | 選択LABO-evaluated sourceのL2-020のrevision mismatch変異を他条件を正常に保って単独投入する。LABO evaluation revisionだけを候補source revisionと不一致にする。期待oracleはrevision不一致を明示しLABOへ返してcandidate適用を止める。 |
| `L10-BRAIN-029-C44` | `BRAIN-029-AC-02` | 正常tupleからproblemだけを欠落させる。期待oracleは当該fieldだけを不足として識別し、他の正常fieldで補完せずcandidate構成を止める。 |
| `L10-BRAIN-029-C45` | `BRAIN-029-AC-02` | 正常tupleからapplicabilityだけを欠落させる。期待oracleは当該fieldだけを不足として識別し、他の正常fieldで補完せずcandidate構成を止める。 |
| `L10-BRAIN-029-C46` | `BRAIN-029-AC-02` | 正常tupleからrequired inputだけを欠落させる。期待oracleは当該fieldだけを不足として識別し、他の正常fieldで補完せずcandidate構成を止める。 |
| `L10-BRAIN-029-C47` | `BRAIN-029-AC-02` | 正常tupleからconstraintだけを欠落させる。期待oracleは当該fieldだけを不足として識別し、他の正常fieldで補完せずcandidate構成を止める。 |
| `L10-BRAIN-029-C48` | `BRAIN-029-AC-02` | 正常tupleからtrade-offだけを欠落させる。期待oracleは当該fieldだけを不足として識別し、他の正常fieldで補完せずcandidate構成を止める。 |
| `L10-BRAIN-029-C49` | `BRAIN-029-AC-02` | 正常tupleからnegative/failureだけを欠落させる。期待oracleは当該fieldだけを不足として識別し、他の正常fieldで補完せずcandidate構成を止める。 |
| `L10-BRAIN-029-C50` | `BRAIN-029-AC-02` | 正常tupleからidentity/source/versionだけを欠落させる。期待oracleは当該fieldだけを不足として識別し、他の正常fieldで補完せずcandidate構成を止める。 |
| `L10-BRAIN-029-C51` | `BRAIN-029-AC-02` | 正常tupleからrelation type/両端identity/meaningだけを欠落させる。期待oracleは当該fieldだけを不足として識別し、他の正常fieldで補完せずcandidate構成を止める。 |
| `L10-BRAIN-029-C52` | `BRAIN-029-AC-01` | 比較操作なし・構成candidate操作あり、CORE/LABO source未選択の正常入力を与える。期待oracleは未選択sourceを未観測として扱い、L2-004/018/020の値を要求せず、L2-009の構成条件と常時必須L2-003/005/008を照合してcandidate stateを返す。 |
