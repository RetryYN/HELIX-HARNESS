# HELIX-BRAIN L10 機能総合検証 — Stage 1（007/008/028）

**状態：部分草稿・未承認・未実行。** 下記は`../L3-requirements/functional-requirements.md`のAC候補に対するsystem-level fixture/oracle設計であり、runtime実行結果・合格・実装許可を意味しない。対象は`HELIXBRAIN-L2-007/008/028`のみ。旧L10定義は `LEGACY-ASSET-34DF3B535879CC73FA86`（`archive/legacy-generation-2026-09-14/root/docs/process/forward/L08-L14-verification-phase.md:162-170,195-207`、SHA-256 `d7847b2e7c85673971cb01f8fc42c1325aeb331a0630ee53914a3162951dbd2a`）の要件挙動をsystem-levelで照合する意味を保持する。旧case ID・閾値・runtimeは移さず実行しない。

旧L3定義 `LEGACY-ASSET-F542125805B777D8A56A`（`archive/legacy-generation-2026-09-14/root/docs/process/forward/L00-L06-design-phase.md:148-168`、SHA-256 `9f8fc48a087fa9ba6e629518fb376630d7863491d2f85be96a8b3fd0c6d2efc3`）にあるFR/AC↔検証の関係を起点とする。fixed/candidate source pinと旧asset対照は対応する静的監査記録に収録する。

## HELIXBRAIN-L2-007 — L10 oracle（対応 `BRAIN-007-FR-01`）

- 親：PO固定 `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2 `docs/helix-brain/L2-requirements/brain-requirements.md:150-160` span SHA-256 `f96983fecc67fdb539d5ff143ed758a9c2ae799ae3f4fb6fa24bad2c381a6774`。対L11 `docs/helix-brain/L11-acceptance/brain-acceptance.md` full SHA-256 `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`.
- main633採択registration: `MPR-RC-HELIXBRAIN-L2-007-002` / semantic digest `sha256:9584e757b02bf75f698a055eedb9df6d72aa7bdc07e82808fd92d786861c24ee`。後続metadataから承認を継承しない。
- 対応AC: `BRAIN-007-AC-01`, `BRAIN-007-AC-02`。各caseはシステム全体の受渡しとowner境界を照合し、単体componentの成功だけでは対全体を満たさない。

### 検証fixtureとcase

- **L10-BRAIN-007-C01**（AC `BRAIN-007-AC-01`／`BRAIN-007-AC-02`に対応）：L1-007、L2-011/025およびLABO→BRAIN `HELIXBRAIN-L2-020`の参照revisionを記録した上で、必須source/provenance/evidence/scope等が揃いLABO対象revisionが一致する候補を投入し、各owner stateが分離されることを確認する。 **期待oracle**：候補はsource identity/revisionと全入力fieldを保持し、LABO評価・OS登録・BRAIN独立検証・採否を別stateとして返す。
- **L10-BRAIN-007-C02**（AC `BRAIN-007-AC-01`／`BRAIN-007-AC-02`に対応）：source identity、revision、provenance、evidence、adopted reason、evaluated scope、counterexample、limitationの欠落・stale・danglingをfieldごとに個別に与える。加えてLABO評価未実施なのに評価済みclaimを返す変異を個別に与える。 **期待oracle**：candidate stateを維持しpromotionを止める。根拠fieldの不足・staleはsource/evidenceの既存ownerへ示し、LABO未評価はLABOの既存評価契約へ戻す。上流意味変更が必要な場合だけL1へ戻す。
- **L10-BRAIN-007-C03**（AC `BRAIN-007-AC-01`／`BRAIN-007-AC-02`に対応）：提案scopeとevaluated scopeを不一致にし、counterexample、limitationまたは採用理由を欠落させてaccepted/matureを拒否する。 **期待oracle**：proposed/evaluated scope差または必要field欠落を理由にaccepted/matureを拒み、候補の戻し先を示す。
- **L10-BRAIN-007-C04**（AC `BRAIN-007-AC-01`／`BRAIN-007-AC-02`に対応）：AI生成のみ、成功実績一件のみでaccepted/matureを要求し、昇格が起きないことを確認する。 **期待oracle**：accepted/matureへの遷移が起きず、AI生成または単一成功実績のみを根拠にできないことを返す。
- **L10-BRAIN-007-C05**（AC `BRAIN-007-AC-01`／`BRAIN-007-AC-02`に対応）：LABO評価対象revisionを候補revisionと不一致にする。 **期待oracle**：LABO結果を対象revision不一致として保留し、評価の修正・再提示を既存LABO評価契約へ返す。BRAIN candidate revisionと採否stateは変えない。
- **L10-BRAIN-007-C06**（AC `BRAIN-007-AC-01`／`BRAIN-007-AC-02`に対応）：BRAIN候補revisionが変わった後に古いevidenceを再利用する。 **期待oracle**：古いevidenceをstaleとして拒否し、現candidate revisionに対応するsource/evidenceの再提示先を示す。
- **L10-BRAIN-007-C07**（AC `BRAIN-007-AC-01`／`BRAIN-007-AC-02`に対応）：LABO評価またはOS登録receiptだけをBRAIN採用扱いにする。 **期待oracle**：LABO評価receiptとOS登録receiptは各ownerの別recordに留まり、BRAIN採否stateは未変更である。
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
- **L10-BRAIN-008-C02**（AC `BRAIN-008-AC-01`／`BRAIN-008-AC-02`に対応）：unknown identity/revision/state、競合するstate、実knowledge versionの欠落/不一致、Product Coreのexact revisionとOS usage recordを個別に変更するfixtureを使い、currentへの暗黙解決がないことを確認する。 **期待oracle**：identity/revision/state/versionのunknownまたは競合をunknown/停止として返し、currentへの暗黙置換を行わない。BRAIN lifecycle変更だけではOS usageを変えず、OS usage変更だけではBRAIN lifecycleを変えない。知識構造/meaning/version不明はBRAIN、project-use state不明はOSへ戻す。
- **L10-BRAIN-008-C03**（AC `BRAIN-008-AC-01`／`BRAIN-008-AC-02`に対応）：version_targetをactual versionとして差し替え、解決されないことを確認する。 **期待oracle**：version_targetは目標印として扱われactual version不明を解消せず、候補利用を停止する。
- **L10-BRAIN-008-C04**（AC `BRAIN-008-AC-01`／`BRAIN-008-AC-02`に対応）：BRAIN ownerが知識stateを正当にR=currentからR=supersededへ更新する一方、既存OS project usage recordを同時に変えない。 **期待oracle**：BRAIN state更新を反映しつつ、OS usage historyは旧参照revisionを保持する。BRAINの正当な更新自体は拒否しない。
- **L10-BRAIN-008-C05**（AC `BRAIN-008-AC-01`／`BRAIN-008-AC-02`に対応）：OS ownerが利用中のexact revisionを保ったままproject usage recordを正当に更新する。 **期待oracle**：OS usage updateを反映しつつ、BRAIN lifecycle stateは不変。OSの正当なproject update自体は拒否しない。

- **L10-BRAIN-008-C06 — 未見正常（`BRAIN-008-AC-01`）**：既存fixtureにない組合せで、Product Coreのexact knowledge identity/revision参照、BRAINの列挙stateとOS project-use recordを同時に与える。全値は固定L2/L11が列挙した範囲から採る。**期待oracle**：C01と同じAC-01に従い、指定exact revision、BRAIN state、OS usageを別々に識別し、旧参照を黙って置換しない。列挙範囲外または値不明なら正常例と呼ばずAC-02の停止/owner戻しとして扱う。

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
- **L10-BRAIN-028-C02**（AC `BRAIN-028-AC-01`／`BRAIN-028-AC-02`に対応）：descriptor/knowledge identityまたはrevisionがunknown、range外、必要field欠落のfixtureに加え、旧版への黙った置換と互換range不明時fallbackを個別に与える。 **期待oracle**：unknown/mismatch/range外をnot-applicableまたはunknownで返し、推定・最新置換・旧版fallbackを行わない。
- **L10-BRAIN-028-C03**（AC `BRAIN-028-AC-01`／`BRAIN-028-AC-02`に対応）：descriptor kind、dependency identity、verification scope、contract/artifact/dependency version、knowledge version/stateをそれぞれ単独で欠落/不一致にし、unknown identity、range外・range欠落・range解釈不能、version_targetの実版代用、common lifecycleをBRAIN側へ移す変異も別々に与える。 **期待oracle**：descriptor kind、dependency identity/version、verification scope、contract/artifact/dependency versionまたはrangeの不一致はHARNESSへ返す。knowledge version/stateの不一致はBRAINへ返す。該当fieldを特定しnot-applicable/unknownとする。relation endpointの判定・conflict解消はこの親のoracleへ加えない。
- **L10-BRAIN-028-C04**（AC `BRAIN-028-AC-01`／`BRAIN-028-AC-02`に対応）：required versionをrange外・range欠落・range解釈不能にする。 **期待oracle**：range外・range欠落・解釈不能をunknown/not-applicableにし、適用を止める。
- **L10-BRAIN-028-C05**（AC `BRAIN-028-AC-01`／`BRAIN-028-AC-02`に対応）：version_targetをactual contract/artifact/knowledge versionとして使用する。 **期待oracle**：version_targetによるactual version補完を拒み、未確定版をunknownのまま返す。
- **L10-BRAIN-028-C06**（AC `BRAIN-028-AC-01`／`BRAIN-028-AC-02`に対応）：common rollback/unfinished obligationをBRAIN側へ要求する。 **期待oracle**：common exchange/update/rollback/unfinished-obligationの操作・stateはBRAIN応答で変更せず、HARNESS ownerへ返す。
- **L10-BRAIN-028-C07 — 未見正常（`BRAIN-028-AC-01`）**：C01と異なるdescriptor/knowledge組合せを用いる。BRAIN-L2-028が列挙するdescriptor fieldと意味、採択HARNESS L2-010/011のpack/call境界依存revision、およびBRAIN exact knowledge tupleを満たすよう、fixture内でidentity/revisionを明示する。固定sourceに具体値がないfieldの値は宣言済み合成fixture値とし、製品値として採択しない。試験fixture内でrangeとrequired versionを明示し内側関係を与えるが、これらのfixture値は試験入力に限り製品値・構文・比較規則として採択しない。**期待oracle**：C01と同じAC-01に従い、そのexact knowledge identity/revisionに対するapplicable応答を返す。range field自体が欠落または読めない場合は正常fixtureと偽らずunknown/未評価に留める。新しいrange syntax/comparator/product valueは採択しない。

### 観測点とoracle

fieldごとのdescriptor/knowledge tuple；参照HARNESS contract revisionと宣言range；applicable/not-applicable/unknown応答；戻し先HARNESS/BRAIN。

**判定**：正常caseは各AC候補が親のfield/state/boundaryを満たす証拠を示す。反例caseでは該当情報が拒否/unknown/保留となり、誤った成功・昇格・owner間writebackを起こさない。部分成功は部分として記録し、残作業を成功に丸めない。

**旧test-design oracleの限定**：ST-DIST-001/007とWCC-FR-01/05のversion/schema drift境界を類例として使う。旧packet/schemaやrange grammarは継承しない。旧case ID・閾値・role schema・runtimeを使わず、現行L2/L11へ合わせた検証設計とする。
