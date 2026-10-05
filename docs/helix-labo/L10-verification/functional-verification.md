# HELIX-LABO L10 総合検証 — Stage 2b（002–010、候補）

状態：未承認のL3/L10候補。対象はStage 2bの採択親 HELIXLABO-L2-002〜010のみ。固定L2/L11が要件authority、PO記録は親の採択登録、G0記録は実装順序だけを示す。本文は実装・実行・リリース許可や要件承認を生成しない。Stage 2bの親・case範囲、source disposition、固定根拠は[このcutoutの不変監査記録](../../governance/audits/requirement-registration/labo-stage2b-002-010-publication-cutout-2026-10-05.json)に固定する。

## Stage 2b — HELIXLABO-L2-002/003/004/005 のシステム検証候補

状態：未実行の合成fixtureとoracle設計。固定parentは `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、PO adoption basisは `633bf12ea8f948db8ba3d6600179c4a9507377a7`、G0順序sourceは `1880c422311a7f8321dbb0e2b98fa12c69449201`。L3 functional ACが唯一の条件正本で、本書は完全IDで同じACを照合する。未承認L3や後続親を依存authorityにしない。通常例とnegativeは示す一変数以外を共通baselineに保ち、未見正常例は同一fixed scopeの未見identityで既存ACを再確認する。owner戻し先は固定契約が指定する既存source/authorityだけを使い、新ownerを作らない。

### 002 — HELIXLABO-L2-002 / `LABO-002-FR-01`

- **L10-LABO-002-CASE-01 normal observed trace** (`LABO-002-AC-01`) — source identity/revision付きで、要求・ticket・Worker・実装・atomic CI・boundary integration・proof CI・release・deployment・runtime・incident・recovery等、選択scope内で実際に観測された固定L2列挙eventだけを与える。期待：episode候補から各eventへ逆参照でき、列挙field・environment・resultが保たれる。未発生eventを生成せず、source canonical eventは不変。
- **L10-LABO-002-CASE-02 normal partial episode** (`LABO-002-AC-01`, `LABO-002-AC-02`) — 有効なsourceを保ちつつ未発生stageがある部分episodeを与える。期待：観測済eventは結び、未発生/未完義務は明記し、完了補完をしない。
- **L10-LABO-002-CASE-03 normal orphan** (`LABO-002-AC-02`) — 他eventと安全に結べない有効source eventだけを与える。期待：孤立eventとしてsource/revision付きで残し、成功/失敗の推測やdropをしない。
- **L10-LABO-002-CASE-04 negative false relation** (`LABO-002-AC-03`) — event内容を固定し、時刻またはpathだけが一致する無関係eventを一つ加える。期待：一episodeに結合せず、因果を断定しない。
- **L10-LABO-002-CASE-05 negative missing obligation** (`LABO-002-AC-02`, `LABO-002-AC-03`) — 他fieldを固定し、未完義務だけを欠落させた入力/出力を与える。期待：未完を保持し、完了補完を拒否する。
- **L10-LABO-002-CASE-06 negative correction overwrite** (`LABO-002-AC-03`) — 同一event identity/revisionに対する誤relationの訂正を与える。期待：訂正relationだけを変え、元event payload/identity/revisionを保持する。
- **L10-LABO-002-CASE-07 unseen normal** (`LABO-002-AC-01`) — 既存fixtureにない許可source/event identityで、選択scope内で観測されたstage traceを与える。期待：CASE-01と同じ逆参照・列挙field保持を満たし、未発生stageを生成せずscope外へ一般化しない。
- **L10-LABO-002-CASE-08 negative source identity missing** (`LABO-002-AC-01`, `LABO-002-AC-03`) — 他条件一定でsource identityまたはrevisionだけを欠落させる。期待：episode成功扱いにせずmissing/unknownを明示し、元source/関係契約のownerへ戻す。

- **L10-LABO-002-CASE-09 negative L2-001 dependency identity/revision** (`LABO-002-AC-03`) — 共通baselineからobservation source identityだけをmissing、次に別fixtureでrevisionだけをstale/wrong-revisionへ変える。期待：episode成功扱いにせず、元observation/契約ownerへ返す。別sourceで補完しない。
- **L10-LABO-002-CASE-10 negative L2-001 field census** (`LABO-002-AC-01`, `LABO-002-AC-03`) — `episode_id, requirement_revision, ticket_id, responsibility_id, product, mechanism, worker, provider, model, configuration, artifact, CI/test, release, deployment, runtime, failure, rework, cost, time, result`の各fieldについて、共通baselineから一fieldだけを順にmissing, unknown, stale, wrong-revisionへ変えた独立fixtureを作る。期待：当該fieldごとに不成立/partialを記録し、他sourceから埋めず、対応source ownerへ返す。
- **L10-LABO-002-CASE-11 negative L2-011 connection receipt** (`LABO-002-AC-03`) — L2-011のAggregate→Correlate接続を同一baselineでidentity/revision/scope/欠測表示/episode↔observation逆参照の各field一つずつmissing/unknown/stale/wrong-revisionにした独立fixtureで照合する。期待：接続成立を主張せず、欠けたfieldを他sourceで補完せず、既存connection/source ownerへ戻す。

### 003 — HELIXLABO-L2-003 / `LABO-003-FR-01`

- **L10-LABO-003-CASE-01 normal mixed decomposition** (`LABO-003-AC-01`) — 一episode内に良かった点/悪かった点、条件依存、汎用/product固有、system/operation、unknown/unnecessaryの複数根拠を与える。期待：各親分類区分を独立し、source evidence/revision付きで保持する。
- **L10-LABO-003-CASE-02 negative whole-episode binary adoption** (`LABO-003-AC-02`) — CASE-01と同一入力に対して全体を採用/不採用の一値へ丸める要求だけを加える。期待：一括分類をせず各軸を維持。
- **L10-LABO-003-CASE-03 negative unknown guessed** (`LABO-003-AC-02`) — unknown根拠だけを与え、他分類の証拠は固定する。期待：unknownを推測で汎用/不要/成功等へ変換しない。
- **L10-LABO-003-CASE-04 negative conditional success generalized** (`LABO-003-AC-02`) — 成功条件だけ一つある入力を無条件一般化しようとする。期待：条件依存を明記し、scope外の成功主張を拒否。
- **L10-LABO-003-CASE-05 negative missing source evidence** (`LABO-003-AC-03`) — source evidence identity/revisionだけを欠落。期待：分類を確定せず理由付きで元evidence/history source ownerへ戻す。
- **L10-LABO-003-CASE-06 negative evidence contradiction** (`LABO-003-AC-03`) — 同一分類軸について根拠source間に矛盾を一つ置く。期待：conflict/未確定を保持し、根拠を上書きせずsource ownerへ返す。
- **L10-LABO-003-CASE-07 unseen normal** (`LABO-003-AC-01`) — 未見episode identityだが固定scope内で各分類根拠が揃った入力。期待：CASE-01と同一分類構造/traceで扱い、能力を範囲外へ一般化しない。

- **L10-LABO-003-CASE-08 negative L2-002/L2-012 dependency field** (`LABO-003-AC-01`, `LABO-003-AC-03`) — episode ID/revision、source evidence identity/revision、event/result state、relation/未完状態、L2-012接続のscope/revision/evidence traceの各fieldを一つだけmissing, unknown, stale, wrong-revisionに変える独立fixture群。期待：分類を確定せず、別episode/sourceで補完せず、該当evidenceまたは接続ownerへ返す。
- **L10-LABO-003-CASE-09 negative individual classification basis** (`LABO-003-AC-01`, `LABO-003-AC-02`, `LABO-003-AC-03`) — 良かった点、悪かった点、条件依存、汎用候補、product固有、system化候補、operationで補う候補、unknown、不必要の9分類それぞれについて、共通baselineの一分類だけ根拠を欠落、反証と矛盾、または誤った分類根拠へ置換する独立fixtureを作る。期待：他分類は保持し、当該分類だけunresolved/unknownとして元evidence ownerへ返す。根拠のない分類を作らない。

### 004 — HELIXLABO-L2-004 / `LABO-004-FR-01`

- **L10-LABO-004-CASE-01 normal full axes** (`LABO-004-AC-01`) — 方式A/B双方のpurpose, structure, behavior, assumption, constraint, guarantee, costを独立source付きで与える。期待：7/7軸とrevisionを保ち、守で元の意味/目的/条件/構造を先に保持、破で部分比較、離で根拠付きcandidateを示す。
- **L10-LABO-004-CASE-02 normal partial match** (`LABO-004-AC-01`, `LABO-004-AC-02`) — CASE-01の一軸だけ異なり、他軸は一致する比較対象。期待：一致部分と異なる軸を分け、全体同等とはしない。
- **L10-LABO-004-CASE-03 normal condition-dependent difference** (`LABO-004-AC-01`, `LABO-004-AC-02`) — 一つの前提/条件だけを変更し、それ以外は共通にする。期待：条件依存差と適用scopeを軸別に示す。
- **L10-LABO-004-CASE-04 negative original meaning unavailable** (`LABO-004-AC-03`) — 原方式のpurpose/meaning本文だけを利用不能にする。期待：変換candidateを出さずsource clarificationへ戻す。
- **L10-LABO-004-CASE-05 negative source evidence missing** (`LABO-004-AC-03`) — 意味本文は保持し、evidence identity/revisionだけ欠落。期待：再構成を保留し元source ownerへ不足を返す。
- **L10-LABO-004-CASE-06 negative candidate marked adopted** (`LABO-004-AC-02`) — candidate内容は同一でadopted/authority表示だけを付与する要求。期待：採択状態を出力しない。
- **L10-LABO-004-CASE-07 unseen normal** (`LABO-004-AC-01`) — 未見方式identityで7軸すべてと根拠source revisionが揃う。期待：CASE-01の比較traceを保ち、同等性をscope外へ拡張しない。

- **L10-LABO-004-CASE-08 negative L2-013 dependency and comparison-source fields** (`LABO-004-AC-01`, `LABO-004-AC-03`) — L2-013各分類根拠・反証・unknown・条件・接続identity/revision/scope/evidence trace、および方式A/Bの比較source identity/revisionについて、各field一つだけmissing, unknown, stale, wrong-revisionへ変えた独立fixtureを作る。期待：欠損軸を他source/軸で補完せず、比較を確定せず、既存evidence/source/connection ownerへ戻す。
- **L10-LABO-004-CASE-09 negative seven-axis census** (`LABO-004-AC-01`, `LABO-004-AC-02`, `LABO-004-AC-03`) — `purpose, structure, behavior, assumption, constraint, guarantee, cost`の各軸を一つずつmissingまたは異なる値へ変更した別fixtureで照合する。期待：欠損/差分軸を明記し、残り6軸だけで全体同等を主張せず、根拠不足は元source ownerへ戻す。

### 005 — HELIXLABO-L2-005 / `LABO-005-FR-01`

- **L10-LABO-005-CASE-01 normal 12 operations** (`LABO-005-AC-01`) — 12 operationを別々のcandidate rowとして与え、各々のsource identity/revision、維持意味、変更意味、条件、scopeを明示する。期待：12 identityを欠落なく個別保持し、候補の実行/採択をしない。
- **L10-LABO-005-CASE-02 normal alternatives retained** (`LABO-005-AC-01`) — 既存機構へ吸収、責務移動、operationへ戻す、retireを候補に並べ、追加機構候補も比較目的で残す。期待：親の全選択肢と各meaning/condition/scopeを記録し、追加件数の増減自体を改善指標にしない。
- **L10-LABO-005-CASE-03 negative meaning change hidden** (`LABO-005-AC-02`, `LABO-005-AC-03`) — 変更候補のmeaning fieldだけを隠す/同一扱いにする。期待：意味差を明示し、未確定ならunknown、判断を上流へ戻す。
- **L10-LABO-005-CASE-04 negative automatic adoption** (`LABO-005-AC-03`) — candidate identityだけで採択/実施状態を生成する要求。期待：candidate-only状態で止め、operation changeを行わない。
- **L10-LABO-005-CASE-05 negative automatic retire** (`LABO-005-AC-03`) — RETIRE candidateだけを根拠に対象を退役させる要求。期待：退役を実行せず上流判断対象として残す。
- **L10-LABO-005-CASE-06 negative mechanism-count objective** (`LABO-005-AC-03`) — 新機構の追加件数または増加だけを改善目的/成功指標として与える。期待：件数増加を成果理由として採用せず、また件数最小化という逆向きの制限も作らず、meaning/condition/scopeに基づく候補比較を維持する。
- **L10-LABO-005-CASE-07 negative insufficient source/condition** (`LABO-005-AC-02`, `LABO-005-AC-03`) — source revisionまたは適用条件だけを欠落させる。期待：候補をunknown/unresolvedに保ち、元候補source ownerへ不足を返す。
- **L10-LABO-005-CASE-08 unseen normal** (`LABO-005-AC-01`) — 未見candidate identityだが固定12 operation vocabulary中のoperationでsource, meaning delta, condition, scopeが揃う。期待：既存ACで根拠付きcandidateとしてtraceでき、採択/実行しない。

- **L10-LABO-005-CASE-09 negative L2-004/L2-014 dependency fields** (`LABO-005-AC-01`, `LABO-005-AC-02`, `LABO-005-AC-03`) — Vector output identity/revision/scope、元意味、部分比較、条件差、evidence、L2-014接続traceの各fieldを一つだけmissing, unknown, stale, wrong-revisionに変えた独立fixture群。期待：候補を確定せず別sourceで補完せず、元仮説/sourceまたは既存接続ownerへ戻す。
- **L10-LABO-005-CASE-10 negative candidate tuple census** (`LABO-005-AC-01`, `LABO-005-AC-02`) — 12 operationそれぞれについて、候補の維持意味、変更意味、適用条件、scopeの4 fieldを一つだけmissingまたはbaselineからmismatchにする別fixtureを作る。期待：対象fieldだけunresolvedにし候補を確定しない。ほかのoperationやsourceで補完しない。
- **L10-LABO-005-CASE-11 negative individual dependency identity/revision** (`LABO-005-AC-01`, `LABO-005-AC-02`, `LABO-005-AC-03`) — L2-004/014の各parent identity、source revision、version、scopeを一つずつmissing/stale/wrong-revisionとする独立fixture。期待：candidateを実行・採択せず、当該元仮説/契約ownerへ戻す。

### L3 ACとcase対応・共通oracle

| 親句 | L3 functional AC | L10 case |
|---|---|---|
| 002 episode chain/field/source | `LABO-002-AC-01` | `L10-LABO-002-CASE-01, L10-LABO-002-CASE-02, L10-LABO-002-CASE-07, L10-LABO-002-CASE-10` |
| 002 orphan/missing/incomplete | `LABO-002-AC-02` | `L10-LABO-002-CASE-02, L10-LABO-002-CASE-03, L10-LABO-002-CASE-05, L10-LABO-002-CASE-08` |
| 002 false correlation/correction and dependency rejection | `LABO-002-AC-03` | `L10-LABO-002-CASE-04, L10-LABO-002-CASE-06, L10-LABO-002-CASE-08, L10-LABO-002-CASE-09, L10-LABO-002-CASE-10, L10-LABO-002-CASE-11` |
| 003 independent categories/evidence | `LABO-003-AC-01` | `L10-LABO-003-CASE-01, L10-LABO-003-CASE-07, L10-LABO-003-CASE-08, L10-LABO-003-CASE-09` |
| 003 unknown/condition/contradiction | `LABO-003-AC-02` | `L10-LABO-003-CASE-02, L10-LABO-003-CASE-03, L10-LABO-003-CASE-04, L10-LABO-003-CASE-06, L10-LABO-003-CASE-09` |
| 003 return to evidence source | `LABO-003-AC-03` | `L10-LABO-003-CASE-05, L10-LABO-003-CASE-06, L10-LABO-003-CASE-08, L10-LABO-003-CASE-09` |
| 004 seven axes/守破離 candidate | `LABO-004-AC-01` | `L10-LABO-004-CASE-01, L10-LABO-004-CASE-02, L10-LABO-004-CASE-03, L10-LABO-004-CASE-07, L10-LABO-004-CASE-08, L10-LABO-004-CASE-09` |
| 004 partial match/not authority | `LABO-004-AC-02` | `L10-LABO-004-CASE-02, L10-LABO-004-CASE-06, L10-LABO-004-CASE-09` |
| 004 clarification before transformation | `LABO-004-AC-03` | `L10-LABO-004-CASE-04, L10-LABO-004-CASE-05, L10-LABO-004-CASE-08, L10-LABO-004-CASE-09` |
| 005 12 operations/delta/conditions/scope | `LABO-005-AC-01` | `L10-LABO-005-CASE-01, L10-LABO-005-CASE-02, L10-LABO-005-CASE-08, L10-LABO-005-CASE-09, L10-LABO-005-CASE-10, L10-LABO-005-CASE-11` |
| 005 unresolved meaning/conditions | `LABO-005-AC-02` | `L10-LABO-005-CASE-03, L10-LABO-005-CASE-07, L10-LABO-005-CASE-09, L10-LABO-005-CASE-10, L10-LABO-005-CASE-11` |
| 005 no LABO decision/adoption/retirement | `LABO-005-AC-03` | `L10-LABO-005-CASE-03, L10-LABO-005-CASE-04, L10-LABO-005-CASE-05, L10-LABO-005-CASE-06, L10-LABO-005-CASE-07, L10-LABO-005-CASE-09, L10-LABO-005-CASE-11` |

判定ではmissing/unknownを実測zeroや成功として扱わない。source identity/revision不足は元source owner、relationの誤りはその関係を供給した既存source/contract owner、上流meaning変更判断は既存上流authorityへ戻す。LABOはsource stateを変更せず、Worker/モデルの配置・資格を決めず、candidateを採択・実行しない。旧L10/test/runtimeを実行していない。

## Stage 2b — HELIXLABO-L2-006/007/008/009/010 総合verification oracle

状態：未実行の合成fixture・oracle設計。対象は固定された5親だけ。固定L2/L11 revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、PO adoption `633bf12ea8f948db8ba3d6600179c4a9507377a7`、G0順序記録 `1880c422311a7f8321dbb0e2b98fa12c69449201`。G0は順序のみで採択authorityではない。固定source pins、旧資産起点/差分、case countは[本件不変source/pair監査記録](../../governance/audits/requirement-registration/labo-stage2b-002-010-publication-cutout-2026-10-05.json)に固定する。各caseは[L3 functional AC](../L3-requirements/functional-requirements.md)を照合し、実行、assignment、資格、system/operation変更、target registration/routing、PO判断を生成しない。通常例・negativeは記載した一変数だけを変え、未見正常は固定scope内の未見identityで既存ACを再確認する。

### HELIXLABO-L2-006 — Experiment Engine (`LABO-006-FR-01`)

固定親の14列挙evaluation categoriesは各々別に扱い、success/failureおよびFP/FNの値はそれぞれ分けて観測する。比較baselineは同じticket/experiment/target version、宣言条件、oracle、scopeに結ばれたbaseline/current、candidate、hybridのarmである。assignment/ticketはOS、実行result/contractはWorkerまたは提供source、oracle/仮説/条件は原source ownerの責務で、LABOは補わない。

- **L10-LABO-006-CASE-01 normal comparison**（`LABO-006-AC-01`, `LABO-006-AC-02`）— 同じOS ticket/operation identity、assignment identity、experiment identity、target revision、比較条件、oracle identity/revision/scopeを持つbaseline/current、candidate、hybridの別armを与える。Worker result source/contractを同assignment・experiment・対象版へ結び、品質、success/failure、FP/FN、rework、speed、CI/Worker time、token/API cost、人間介入、context、complexity、recovery time、release lead、ops load、cross-product reuseを個別に観測する。期待：arm/14列挙category（success/failureとFP/FNは個別値）ごとに結果と出典を保持し、総合加点や「一度動いた」だけの改善認定をしない。
- **L10-LABO-006-CASE-02 unseen normal**（`LABO-006-AC-01`, `LABO-006-AC-02`）— 未見experiment/target revisionと異なる有効oracleの組合せだが、各armのsource identity、同一条件、assignment/result linkが完全なfixture。期待：L10-LABO-006-CASE-01と同じdimension別比較を同一scope内で行い、異なるoracle結果を混ぜず、scope外へ一般化しない。
- **L10-LABO-006-CASE-03 negative comparison condition**（`LABO-006-AC-01`, `LABO-006-AC-03`）— L10-LABO-006-CASE-01からcandidate armの評価条件だけを変える。期待：同条件比較にせず、該当armをincomparableとして残す。
- **L10-LABO-006-CASE-04 negative oracle identity**（`LABO-006-AC-01`, `LABO-006-AC-03`）— 他fieldは同じままcandidate armのoracle identityだけ欠落または別identityにする別fixture。期待：oracle差を隠さず比較不能/unknownとし、improvementを生成しない。
- **L10-LABO-006-CASE-05 negative oracle revision or scope**（`LABO-006-AC-01`, `LABO-006-AC-03`）— oracle revisionだけstale/wrong revisionとするfixtureと、oracle適用scopeだけ外すfixtureを独立に作る。期待：該当比較をunassessed/incomparableにし、元oracle ownerへ戻す。
- **L10-LABO-006-CASE-06 negative OS assignment missing**（`LABO-006-AC-02`, `LABO-006-AC-03`）— 他identity/linkを保ちOS assignment identityだけ欠落させる。期待：実行を割当済みとして扱わずOSへ戻す。
- **L10-LABO-006-CASE-07 negative Worker result contract/source**（`LABO-006-AC-02`, `LABO-006-AC-03`）— assignmentを保ちWorker result contract/source linkだけ欠落または不一致にする独立fixture。期待：結果をscoreせず、result source ownerへ戻す。
- **L10-LABO-006-CASE-08 negative ticket identity**（`LABO-006-AC-02`）— Worker/experiment/resultは同じままticket identityだけを変える。期待：別ticketの観測を結合しない。
- **L10-LABO-006-CASE-09 negative experiment identity**（`LABO-006-AC-02`）— 他identityを保ちexperiment identityだけを変える。期待：別experimentを結合しない。
- **L10-LABO-006-CASE-10 negative target version**（`LABO-006-AC-02`, `LABO-006-AC-03`）— 他fieldを保ちresult target versionだけ不一致にする。期待：同じ対象版の比較として扱わず、元source ownerへ戻す。
- **L10-LABO-006-CASE-11 negative single metric missing**（`LABO-006-AC-03`）— L10-LABO-006-CASE-01の一dimensionの観測値だけ欠落させ、別fixtureで別dimensionを欠落させる。期待：当該dimensionだけunknown/missingで保持し、他metricから補完せず、ゼロへ置換しない。
- **L10-LABO-006-CASE-12 negative interrupted run**（`LABO-006-AC-03`）— 1 armだけ実験を中断し、他条件は完全なままにする。期待：partial/interrupted結果を保持しsuccess/improvementへ変換しない。
- **L10-LABO-006-CASE-13 negative LABO assignment request**（`LABO-006-AC-02`）— 同一比較情報に「LABOがWorkerを選び割当・起動する」という要求だけ追加する。期待：LABO assignmentを生成せずOS assignment ownerへ戻す。
- **L10-LABO-006-CASE-14 negative required quality reduced for speed**（`LABO-006-AC-01`）— L10-LABO-006-CASE-01と同じticket/experiment/target revision、比較条件、oracle identity/revision/scope、OS assignment、Worker result linkを保ち、candidate armはoracleが事前に宣言した必要品質条件を下回る一方、speed観測はbaseline/currentより改善したfixtureとする。品質とspeed以外のdimension値は同一にする。期待：品質条件の不成立とspeed改善を別dimensionに記録し、品質低下を理由付きで残す。speedで品質違反を相殺せず、比較全体をimprovementとしない。新しい品質閾値は作らない。

観測点：14列挙categoryの各field/出典、ticket・experiment・target版・oracle・assignment・resultの同一性、比較可能/incomparable/unassessed/interrupted状態、戻し先。

### HELIXLABO-L2-007 — Assurance Allocation Engine (`LABO-007-FR-01`)

六条件を別々に照合する: 同条件再現性、機械判定可能性、oracle適用性、副作用限定、retry/rollback可能性、冪等性。

- **L10-LABO-007-CASE-01 normal six conditions**（`LABO-007-AC-01`, `LABO-007-AC-02`）— declared scopeのrule candidateに六条件それぞれのevidence locatorが揃ったfixture。期待：supported状態を条件別に記録し、systemization candidateとoperation continuation candidateの両方、および条件・限界を示す。既存authorityへ採用を委ねる。
- **L10-LABO-007-CASE-02 unseen normal operation continuation**（`LABO-007-AC-01`, `LABO-007-AC-02`）— 未見candidateに一条件unknown、残り条件のevidence、文脈依存を含むoperation continuationの根拠を与える。期待：unknownを維持し、operation continuation candidateを消さず、systemization可と判定しない。
- **L10-LABO-007-CASE-03 negative repeatability**（`LABO-007-AC-01`）— 共通baselineから同条件再現性evidenceだけを除く。期待：当該条件unknown、他条件の状態は維持。
- **L10-LABO-007-CASE-04 negative machine decidability**（`LABO-007-AC-01`）— 機械判定可能性evidenceだけを除く。期待：当該条件unknown、system化を確定しない。
- **L10-LABO-007-CASE-05 negative oracle**（`LABO-007-AC-01`）— oracle identity/revision/applicability evidenceだけを除く。期待：当該条件unknown、推測oracleを作らない。
- **L10-LABO-007-CASE-06 negative side effect boundary**（`LABO-007-AC-01`）— side-effect bound evidenceだけを外す。期待：boundedと判定しない。
- **L10-LABO-007-CASE-07 negative retry/rollback**（`LABO-007-AC-01`）— retry/rollback可能性evidenceだけを外す。期待：条件unknownとして保持。
- **L10-LABO-007-CASE-08 negative idempotency**（`LABO-007-AC-01`）— idempotency evidenceだけを外す。期待：条件unknownとして保持。
- **L10-LABO-007-CASE-09 negative connection counterexample loss**（`LABO-007-AC-01`, `LABO-007-AC-02`）— L2-016経由evidenceからcounterexampleだけ欠落させる。期待：comparability/counterexample不足を明記し、systemization evidenceに昇格しない。
- **L10-LABO-007-CASE-10 negative shadow auto-promotion**（`LABO-007-AC-03`）— other evidenceを変えずstage label `Shadow`から自動Mechanism Candidate/productionへ昇格する要求だけを加える。期待：自動遷移・承認・資格を生成しない。
- **L10-LABO-007-CASE-11 negative operation candidate erased**（`LABO-007-AC-02`, `LABO-007-AC-03`）— high FPまたは例外多数のoperation continuation候補だけをsystemization-only表示へ消す要求。期待：operation候補と限界を保持する。
- **L10-LABO-007-CASE-12 negative new qualification gate**（`LABO-007-AC-03`）— stage名から追加approval/qualification gateが必要とする提案だけを追加。期待：固定親にないgateを生成しない。

観測点：6条件別supported/contradicted/unknown、各locator、candidate種別・scope・counterexample・unresolved condition。総合scoreまたは自動昇格なし。

### HELIXLABO-L2-008 — Operational Fallback Engine (`LABO-008-FR-01`)

- **L10-LABO-008-CASE-01 normal continue/modify candidate**（`LABO-008-AC-01`, `LABO-008-AC-02`）— current system version、owner-provided outcome、例外、FP、workaround/cost、guarantee、conditions、unfinished dutiesを含み、証拠がsystem継続または修正候補を支えるfixture。期待：候補種別と全evidence・保証・未完義務を保持する。
- **L10-LABO-008-CASE-02 unseen normal operational fallback**（`LABO-008-AC-01`, `LABO-008-AC-02`）— 未見revisionの運用結果からoperation復帰候補が支持され、operation条件・current guarantee・unfinished dutyが揃うfixture。期待：fallbackを正規の改善candidateとして示し、失敗/retireへ読み替えず、切替実行をしない。
- **L10-LABO-008-CASE-03 negative current version**（`LABO-008-AC-01`, `LABO-008-AC-03`）— current system versionだけmissing/stale。期待：currentとして使わずunknownで現responsibility ownerへ戻す。
- **L10-LABO-008-CASE-04 negative operational result**（`LABO-008-AC-01`）— owner-provided operational resultだけを欠落させる。期待：結果を捏造せずunresolved。
- **L10-LABO-008-CASE-05 negative exception evidence**（`LABO-008-AC-01`）— 例外発生は宣言されているがexception evidenceだけ欠落する。期待：例外を消さず根拠不足を保持。
- **L10-LABO-008-CASE-06 negative false-positive evidence**（`LABO-008-AC-01`）— FPなしと主張しながらFP observationだけ欠落。期待：no-FP claimを確定しない。
- **L10-LABO-008-CASE-07 negative workaround burden**（`LABO-008-AC-01`）— workaround existsを維持し負担fieldだけ欠落。期待：負担をゼロにしない。
- **L10-LABO-008-CASE-08 negative change cost**（`LABO-008-AC-01`）— change-cost observationだけmissing。期待：費用ゼロや無費用改善へ変換しない。
- **L10-LABO-008-CASE-09 negative guarantee/condition**（`LABO-008-AC-02`）— guaranteeまたは復帰先operation conditionを個別subfixtureで一つだけ欠落。期待：未確定とし候補を完結表示しない。
- **L10-LABO-008-CASE-10 negative unfinished duty loss**（`LABO-008-AC-02`）— fallback candidateからunfinished duty identityだけを除く。期待：元義務を保持し候補に再掲、義務完了としない。
- **L10-LABO-008-CASE-11 negative disputed owner**（`LABO-008-AC-03`）— 他情報を固定し現在のresponsibility ownerだけunknown/conflict。期待：routeを推測せずunresolvedとして保持。
- **L10-LABO-008-CASE-12 negative LABO executes switch**（`LABO-008-AC-03`）— valid fallback candidateへsystem/operationを即時切替える要求だけを加える。期待：候補を保ち、切替を実行しない。

観測点：source revision別のevidence、候補種別、現行保証・復帰条件・unfinished-duty identity、owner不確定状態、実切替なし。

### HELIXLABO-L2-009 — Generalization Engine (`LABO-009-FR-01`)

正常例はscope段階を取り違えないよう、各scope claimを独立fixtureとする。

- **L10-LABO-009-CASE-01 normal single episode scope**（`LABO-009-AC-01`）— 一episode内のevidenceとapplicability conditionだけを与える。期待：single-episode claimに限定し、反復以上へ一般化しない。
- **L10-LABO-009-CASE-02 normal repeated episodes scope**（`LABO-009-AC-01`）— 複数episodeの同条件evidence、sample conditions、反例を与える。期待：支持範囲をrepeated episodesに限る。
- **L10-LABO-009-CASE-03 normal cross-project scope**（`LABO-009-AC-01`）— 複数project identityと適用条件・反例を提供する。期待：cross-project evidenceを保ち、cross-product/general structureへ拡張しない。
- **L10-LABO-009-CASE-04 normal cross-product scope**（`LABO-009-AC-01`, `LABO-009-AC-02`）— 複数productの明示identity、各evidence/sample condition、counterexampleとproduct-specific/generalの区別がある。期待：その証拠が支える場合に限りcross-productまで示し、5段階scopeごとのFeedback先を分け、product固有meaningをBRAINへ送らない。
- **L10-LABO-009-CASE-05 normal general-structure scope**（`LABO-009-AC-01`, `LABO-009-AC-02`）— product固有条件を超えたgeneric-structure claimを支える明示evidence、scope、counterexampleを与える。期待：evidenceが直接支持する範囲だけgeneral structureを示し、上位scopeのFeedback先を下位scopeと混同しない。
- **L10-LABO-009-CASE-06 unseen normal bounded scope**（`LABO-009-AC-01`, `LABO-009-AC-02`）— 未見のmulti-project identityを持つevidenceと、一条件外のcounterexampleを与える。期待：支持scopeをevidenceが支える段階へ狭め、counterexample・sample conditionを保持する。
- **L10-LABO-009-CASE-07 negative invalid experiment evidence**（`LABO-009-AC-01`, `LABO-009-AC-03`）— 他条件を保ちexperiment result/oracle validityだけ欠落またはincomparableにする。期待：scope unassessed、元experiment/oracle ownerへ戻す。
- **L10-LABO-009-CASE-08 negative sample condition**（`LABO-009-AC-01`, `LABO-009-AC-03`）— sample conditionだけ欠落。期待：母集団や適用範囲を推測しない。
- **L10-LABO-009-CASE-09 negative counterexample omitted**（`LABO-009-AC-01`, `LABO-009-AC-03`）— 他evidenceは同じでcounterexampleだけを隠す。期待：counterexampleなしの広いclaimを出さない。
- **L10-LABO-009-CASE-10 negative applicability boundary**（`LABO-009-AC-01`, `LABO-009-AC-03`）— scope applicability limitだけ欠落/矛盾にする。期待：scope unknownのままとする。
- **L10-LABO-009-CASE-11 negative unsupported cross-product**（`LABO-009-AC-01`）— cross-product evidenceだけないのにcross-product claimを出す要求。期待：支持済みの下位scopeまでに留める。
- **L10-LABO-009-CASE-12 negative product-specific to BRAIN**（`LABO-009-AC-02`）— product-specific meaningの行先だけBRAINへ変える要求。期待：target product ownerの意味を保ちBRAINへrouteしない。
- **L10-LABO-009-CASE-13 negative unsupported generic structure**（`LABO-009-AC-01`, `LABO-009-AC-03`）— generic-structure evidenceなしでそのclaimだけ出す。期待：generic構造を認定せずunknown。
- **L10-LABO-009-CASE-14 negative single episode overgeneralization**（`LABO-009-AC-01`）— L10-LABO-009-CASE-01と同じ一episode evidenceからrepeated/cross-project以上のscopeを主張。期待：single episodeを超えない。

観測点：5 level別evidence/counterexample/sample condition、主張scopeと最大supported scope、scope別Feedback destination。最小標本数を追加しない。

### HELIXLABO-L2-010 — Feedback Derivation Engine (`LABO-010-FR-01`)

各正常fixtureで、次の8 valid actionを8つの別target-specific proposal rowに一つずつ使う: `maintain`, `redefine`, `replace`, `split`, `merge`, `systemize`, `operational_fallback`, `retire`。8値は全て有効normal inputでありnegative扱いしない。各rowは16 mandatory fieldsを全て持つ。

- **L10-LABO-010-CASE-01 normal complete proposal family**（`LABO-010-AC-01`, `LABO-010-AC-02`, `LABO-010-AC-03`）— 完全なsource/evidence/scope付きの一target evidenceを共通baselineとし、actionを支持する根拠だけを変えた8個の独立subfixtureを用意する。各subfixtureは16 fieldを全て持つ1 proposal rowを出し、valid action set `maintain`, `redefine`, `replace`, `split`, `merge`, `systemize`, `operational_fallback`, `retire` を8件それぞれ一度ずつ使う。期待：列挙値を保持し、target-specific candidateとしてのみ記録する。LABOから登録/routing/ticket/変更を行わない。
- **L10-LABO-010-CASE-02 unseen normal multi-target family**（`LABO-010-AC-01`, `LABO-010-AC-02`, `LABO-010-AC-03`）— 未見のepisode/target identityから2つ以上のtarget identityを別々に扱う。各targetについて、actionを支持する根拠だけを変えた8個の独立subfixtureを用意し、各々に16 field完備の1 proposal rowを出してvalid action set `maintain`, `redefine`, `replace`, `split`, `merge`, `systemize`, `operational_fallback`, `retire` を8件それぞれ一度ずつ使う。期待：target間でresponsibility/evidenceを混ぜず、すべて提案状態に留める。
- **L10-LABO-010-CASE-03 negative source_episode**（`LABO-010-AC-01`）— L10-LABO-010-CASE-01から`source_episode`だけ欠落させる。期待：推定せず未確定。
- **L10-LABO-010-CASE-04 negative source_revision**（`LABO-010-AC-01`）— `source_revision`だけmissing/staleにする。期待：同じrevisionと偽装しない。
- **L10-LABO-010-CASE-05 negative target_mechanism**（`LABO-010-AC-01`, `LABO-010-AC-03`）— `target_mechanism`だけ欠落/unknownにする。期待：targetを確定しない。
- **L10-LABO-010-CASE-06 negative target_responsibility**（`LABO-010-AC-01`, `LABO-010-AC-03`）— `target_responsibility`だけ欠落/矛盾にする。期待：ownerを推測しない。
- **L10-LABO-010-CASE-07 negative observation**（`LABO-010-AC-01`）— `observation`だけ欠落。期待：別fieldから補完しない。
- **L10-LABO-010-CASE-08 negative evidence**（`LABO-010-AC-01`）— `evidence` identity/revisionだけ欠落またはstaleにする。期待：proposalをevidence-supportedとしない。
- **L10-LABO-010-CASE-09 negative failure_or_success**（`LABO-010-AC-01`）— `failure_or_success`だけunknown/missingにする。期待：成功/失敗を推定しない。
- **L10-LABO-010-CASE-10 negative hypothesis**（`LABO-010-AC-01`）— `hypothesis`だけ欠落。期待：根拠なく仮説を補わない。
- **L10-LABO-010-CASE-11 negative experiment**（`LABO-010-AC-01`）— `experiment` identity/result linkだけ欠落または別experimentへする。期待：別実験で補完しない。
- **L10-LABO-010-CASE-12 negative result**（`LABO-010-AC-01`）— `result`だけ欠落/unknownにする。期待：結果を確定しない。
- **L10-LABO-010-CASE-13 negative counterexample**（`LABO-010-AC-01`, `LABO-010-AC-03`）— `counterexample`だけ欠落。期待：counterevidenceを捨てない。
- **L10-LABO-010-CASE-14 negative scope**（`LABO-010-AC-01`, `LABO-010-AC-03`）— `scope`だけmissingまたはL2-009支持範囲より広くする。期待：範囲unknown/unresolved。
- **L10-LABO-010-CASE-15 negative confidence**（`LABO-010-AC-01`）— `confidence`だけ欠落/unknownとする。期待：別fieldから数値補完しない。
- **L10-LABO-010-CASE-16 negative regression_risk**（`LABO-010-AC-01`）— `regression_risk`だけ欠落。期待：リスクなしへ変換しない。
- **L10-LABO-010-CASE-17 negative recommended_action**（`LABO-010-AC-01`, `LABO-010-AC-02`）— `recommended_action`だけunknown/missingにする。期待：8 valid actionのどれかを推測しない。
- **L10-LABO-010-CASE-18 negative revalidation_condition**（`LABO-010-AC-01`）— `revalidation_condition`だけ欠落。期待：再確認条件を作らない。
- **L10-LABO-010-CASE-19 negative invalid action enum**（`LABO-010-AC-02`）— 完備proposalの`recommended_action`だけを列挙外値に変更する。期待：invalid/unknownで保留し、8 valid actionの一つへ写像しない。L10-LABO-010-CASE-01/02で有効とした8値はnegativeに使わない。
- **L10-LABO-010-CASE-20 negative unknown target**（`LABO-010-AC-03`）— `target_mechanism`だけunknown。期待：OS routing candidateに留め、確定target/routingを生成しない。
- **L10-LABO-010-CASE-21 negative target responsibility revision**（`LABO-010-AC-03`）— 他fieldを固定しtarget responsibility source revisionだけwrong/stale。期待：target owner/OS sourceへ戻し、責務を推測しない。
- **L10-LABO-010-CASE-22 negative overbroad scope/counterexample**（`LABO-010-AC-03`）— source scopeは維持し、proposal scopeだけL2-009 supported levelを越える。期待：広いproposalを確定しない。
- **L10-LABO-010-CASE-23 negative auto registration/routing**（`LABO-010-AC-03`）— 完備proposalからOS ticket/registration/routingまたはtarget authority changeを生成する要求だけを加える。期待：proposalを保持し、その行為を実行しない。

### 固定親句→FR/AC→L10 caseの完全対応

各case IDを省略せず記載し、複数ACの対応も明示する。

| 固定親句・AC | 対応L10 case ID |
|---|---|
| baseline/current・candidate・hybridと14比較軸、および必要品質の速度相殺禁止 (`LABO-006-AC-01`) | `L10-LABO-006-CASE-01`, `L10-LABO-006-CASE-02`, `L10-LABO-006-CASE-03`, `L10-LABO-006-CASE-04`, `L10-LABO-006-CASE-05`, `L10-LABO-006-CASE-11`, `L10-LABO-006-CASE-14` |
| OS assignment/Worker resultを同じticket・experiment・対象版へ束縛 (`LABO-006-AC-02`) | `L10-LABO-006-CASE-01`, `L10-LABO-006-CASE-02`, `L10-LABO-006-CASE-06`, `L10-LABO-006-CASE-07`, `L10-LABO-006-CASE-08`, `L10-LABO-006-CASE-09`, `L10-LABO-006-CASE-10`, `L10-LABO-006-CASE-13` |
| 比較不能・失敗・反例・欠測・中断の保持 (`LABO-006-AC-03`) | `L10-LABO-006-CASE-03`, `L10-LABO-006-CASE-04`, `L10-LABO-006-CASE-05`, `L10-LABO-006-CASE-06`, `L10-LABO-006-CASE-07`, `L10-LABO-006-CASE-10`, `L10-LABO-006-CASE-11`, `L10-LABO-006-CASE-12` |
| 6 assurance conditionsを別々に評価 (`LABO-007-AC-01`) | `L10-LABO-007-CASE-01`, `L10-LABO-007-CASE-02`, `L10-LABO-007-CASE-03`, `L10-LABO-007-CASE-04`, `L10-LABO-007-CASE-05`, `L10-LABO-007-CASE-06`, `L10-LABO-007-CASE-07`, `L10-LABO-007-CASE-08`, `L10-LABO-007-CASE-09` |
| systemization/operation continuationの両候補と限界 (`LABO-007-AC-02`) | `L10-LABO-007-CASE-01`, `L10-LABO-007-CASE-02`, `L10-LABO-007-CASE-09`, `L10-LABO-007-CASE-11` |
| 自動昇格・資格・新gateを生成しない (`LABO-007-AC-03`) | `L10-LABO-007-CASE-10`, `L10-LABO-007-CASE-11`, `L10-LABO-007-CASE-12` |
| 運用証拠に基づくcontinue/modify/fallback候補 (`LABO-008-AC-01`) | `L10-LABO-008-CASE-01`, `L10-LABO-008-CASE-02`, `L10-LABO-008-CASE-03`, `L10-LABO-008-CASE-04`, `L10-LABO-008-CASE-05`, `L10-LABO-008-CASE-06`, `L10-LABO-008-CASE-07`, `L10-LABO-008-CASE-08` |
| 保証・復帰条件・unfinished duty保持 (`LABO-008-AC-02`) | `L10-LABO-008-CASE-01`, `L10-LABO-008-CASE-02`, `L10-LABO-008-CASE-09`, `L10-LABO-008-CASE-10` |
| LABOはswitchせず不明ownerを推測しない (`LABO-008-AC-03`) | `L10-LABO-008-CASE-03`, `L10-LABO-008-CASE-04`, `L10-LABO-008-CASE-05`, `L10-LABO-008-CASE-06`, `L10-LABO-008-CASE-07`, `L10-LABO-008-CASE-08`, `L10-LABO-008-CASE-09`, `L10-LABO-008-CASE-10`, `L10-LABO-008-CASE-11`, `L10-LABO-008-CASE-12` |
| 5 scope levelsの証拠・sample条件 (`LABO-009-AC-01`) | `L10-LABO-009-CASE-01`, `L10-LABO-009-CASE-02`, `L10-LABO-009-CASE-03`, `L10-LABO-009-CASE-04`, `L10-LABO-009-CASE-05`, `L10-LABO-009-CASE-06`, `L10-LABO-009-CASE-07`, `L10-LABO-009-CASE-08`, `L10-LABO-009-CASE-09`, `L10-LABO-009-CASE-10`, `L10-LABO-009-CASE-11`, `L10-LABO-009-CASE-13`, `L10-LABO-009-CASE-14` |
| counterexampleによるscope縮小とFeedback先分離 (`LABO-009-AC-02`) | `L10-LABO-009-CASE-04`, `L10-LABO-009-CASE-05`, `L10-LABO-009-CASE-06`, `L10-LABO-009-CASE-12` |
| missing/unknown/incomparableを未確定に保つ (`LABO-009-AC-03`) | `L10-LABO-009-CASE-06`, `L10-LABO-009-CASE-07`, `L10-LABO-009-CASE-08`, `L10-LABO-009-CASE-09`, `L10-LABO-009-CASE-10`, `L10-LABO-009-CASE-13` |
| 全16 mandatory fields (`LABO-010-AC-01`) | `L10-LABO-010-CASE-01`, `L10-LABO-010-CASE-02`, `L10-LABO-010-CASE-03`, `L10-LABO-010-CASE-04`, `L10-LABO-010-CASE-05`, `L10-LABO-010-CASE-06`, `L10-LABO-010-CASE-07`, `L10-LABO-010-CASE-08`, `L10-LABO-010-CASE-09`, `L10-LABO-010-CASE-10`, `L10-LABO-010-CASE-11`, `L10-LABO-010-CASE-12`, `L10-LABO-010-CASE-13`, `L10-LABO-010-CASE-14`, `L10-LABO-010-CASE-15`, `L10-LABO-010-CASE-16`, `L10-LABO-010-CASE-17`, `L10-LABO-010-CASE-18` |
| 8 valid actionと列挙外unknown (`LABO-010-AC-02`) | `L10-LABO-010-CASE-01`, `L10-LABO-010-CASE-02`, `L10-LABO-010-CASE-17`, `L10-LABO-010-CASE-19` |
| target-specific proposal/OS・target authority境界 (`LABO-010-AC-03`) | `L10-LABO-010-CASE-01`, `L10-LABO-010-CASE-02`, `L10-LABO-010-CASE-05`, `L10-LABO-010-CASE-06`, `L10-LABO-010-CASE-13`, `L10-LABO-010-CASE-14`, `L10-LABO-010-CASE-20`, `L10-LABO-010-CASE-21`, `L10-LABO-010-CASE-22`, `L10-LABO-010-CASE-23` |
