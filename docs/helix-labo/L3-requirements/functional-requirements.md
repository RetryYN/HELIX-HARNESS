# HELIX-LABO L3 機能要件 — Stage 2b（002–010、候補）

状態：未承認のL3/L10候補。対象はStage 2bの採択親 HELIXLABO-L2-002〜010のみ。固定L2/L11が要件authority、PO記録は親の採択登録、G0記録は実装順序だけを示す。本文は実装・実行・リリース許可や要件承認を生成しない。Stage 2bの親・case範囲、source disposition、固定根拠は[このcutoutの不変監査記録](../../governance/audits/requirement-registration/labo-stage2b-002-010-publication-cutout-2026-10-05.json)に固定する。

## Stage 2b — 採択親 HELIXLABO-L2-002/003/004/005（候補、1.0）

このStage 2b cutoutの前半はPO採択された4親だけを扱い、後半で006–010を累積する。対象外Stage、保留・不採択・条件付き親を含めない。採択authorityはPO決定 `633bf12ea8f948db8ba3d6600179c4a9507377a7` の採択identity/revision/version行、意味の正本は `f6dad2a33e24f000b87d7f09b8d40288257e74cc` の固定L2/L11である。G0 addendum `1880c422311a7f8321dbb0e2b98fa12c69449201` はStage順序だけを示し、採択authorityではない。`1.0` はtarget候補であり、実装・実行・build・release版ではない。未承認L3候補を依存authorityとしない。

### authority pin（この4親）

| L2親identity | 仮登録identity | PO adoption row | 固定L2 source (f6dad2a) | 固定L11 source (f6dad2a) | G0 order row (1880c422) |
|---|---|---|---|---|---|
| HELIXLABO-L2-002 | `MPR-RC-HELIXLABO-L2-002-001` | PO decision `:49` | `labo-requirements.md:77-84` | `labo-acceptance.md:46,114` | addendum `:249` |
| HELIXLABO-L2-003 | `MPR-RC-HELIXLABO-L2-003-001` | PO decision `:50` | `labo-requirements.md:85-92` | `labo-acceptance.md:47` | addendum `:250` |
| HELIXLABO-L2-004 | `MPR-RC-HELIXLABO-L2-004-001` | PO decision `:51` | `labo-requirements.md:93-100` | `labo-acceptance.md:48` | addendum `:251` |
| HELIXLABO-L2-005 | `MPR-RC-HELIXLABO-L2-005-001` | PO decision `:52` | `labo-requirements.md:101-108` | `labo-acceptance.md:49` | addendum `:252` |

固定L2 full SHA-256 `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed`、L11 `bcd77438bf1afa4d33c31d35fa5138ea6f978f3d241d159bde35f0b0ccf83200`、PO decision `b0b4a3fc514494ea2a3e7b435c3788bf1297743a02816245e63efe8115bcb4b0`、G0 addendum `c30d5b2ca757952f9772573bffb95a03dfb8ccf686687b92bb70d2c93c956253`。raw-LF inclusive span hashは同梱の不変source/pair監査記録に記録する。

旧source `LEGACY-ASSET-28FB139B26CD61CC51EE` (`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/helix-bench-evaluation.md`, full SHA-256 `a1a5fea1fb89434fb025a9c0541f5cacb10ac9be66e97e7e7964975d2469b116`) と旧対 `LEGACY-ASSET-A952A3A175EB82A4781B` (`archive/legacy-generation-2026-09-14/root/docs/test-design/helix/helix-bench-evaluation-acceptance.md`, full SHA-256 `6b5a72da16fe56130350b6e8b8fc2606cb8c90015ff73f34ffb3b93625a0c185`) は先行起点である。source/version/scope/evidenceを保ち、failureを欠落扱いしない意味と正負caseのtraceだけ項目ごとに再導出する。旧5 category/12 metric、provider/team順位、hidden oracle/scorer、task portfolio、fixed protocol、runner、price、qualification/admissionは現行親にないため置換・除外する。旧L3定義と旧test-designの形式も意味を再導出し、旧runtimeやtestは実行しない。現行6正本のfunctional ACを唯一の条件正本とし、独立business outcomeがないためBR/BV/BCASEを複製しない。

### HELIXLABO-L2-002 — `LABO-002-FR-01`

許可source付きobservationから、要求→ticket→Worker→実装→atomic CI→boundary integration→proof CI→release→deployment→runtime→incident→recovery等のepisode候補を作る。requirement/revision、責務、product、mechanism、worker、provider/model/configuration、artifact、environment、resultのsource identity/revisionを追跡する。相関不能eventは孤立・不明として残し、部分episodeの不足fieldと未完義務を補完しない。時刻/pathの近接だけで因果を推論せず、誤相関が判明した場合も元eventを変更せずrelation訂正候補として扱う。

- **LABO-002-AC-01 — episodeとsource trace**：許可sourceの複数stage eventを与えると、選択したscopeで観測された親列挙stage/eventだけをepisode候補へ対応づけ、各eventをsource identity/revisionへ逆参照できる。未発生・未観測stageは生成せずpartial/unknownとして保つ。episode全field・環境・結果の来歴と部分性を保ち、元source canonical event/authorityを変更しない。
- **LABO-002-AC-02 — 孤立・欠測・未完保持**：相関不能event、欠測field/relation、未完義務は孤立/unknown/未完として明示する。存在しないstageや義務履行を生成せず、部分episodeを完了として表示しない。
- **LABO-002-AC-03 — 誤相関・訂正**：時刻/path近接だけの無関係event結合、欠けた義務の補完、訂正時の元event上書きは不成立。元eventを保持しrelationだけを訂正候補として記録し、source/関係の訂正は既存source契約上のownerへ返す。ownerやrouteを新設しない。
- **依存・版**：固定L2-001のobservation identity、requirement revision、ticket、responsibility、product、mechanism、worker、provider、model、configuration、artifact、CI/test、release、deployment、runtime、failure、rework、cost、time、resultと個別入力接続（021–030）、およびL2-011のAggregate→Correlate接続を成立前提として照合する。いずれかのidentity/field/source revision/scope/接続根拠がmissing, unknown, stale, wrong-revisionなら別sourceから補完せず、episodeを成立扱いにせず既存source/接続契約ownerへ戻す。`version_target: 1.0`。

### HELIXLABO-L2-003 — `LABO-003-FR-01`

Episodeとsource evidenceを、良かった点、悪かった点、条件依存、汎用候補、product固有、system化候補、operationで補う候補、unknown、unnecessaryの別々の根拠付き評価へ分解する。分類軸をepisode全体の採否へ丸めず、分類不能・反証・欠測はunknown/unresolvedで保持し、意味を変えず根拠へ戻る。

- **LABO-003-AC-01 — 分解と独立分類**：成功/失敗、条件付き事実、汎用/product固有、system/operation、unknown/unnecessaryが併存するepisodeで、親の各分類を独立して根拠付きで保持し、元episode/evidence identity/revisionへtraceできる。
- **LABO-003-AC-02 — unknown・条件境界**：episode全体の一括採否、unknownの推測分類、条件付き成功の無条件一般化はいずれも不成立。反証・分類不能・欠測を未確定のまま明示する。
- **LABO-003-AC-03 — evidence戻し**：分類根拠のsource identity/revisionまたは必要条件が欠落・矛盾する場合、補完分類せず元evidence/history sourceのownerへ理由付きで返す。sourceをLABOで修正しない。
- **依存・版**：固定L2-002のepisode identity/revision、source evidence identity/revision、event/result state、relationと未完・unknown、およびL2-012接続の同一scope/revision/evidence traceを前提として照合する。各fieldがmissing, unknown, stale, wrong-revisionなら他sourceや別episodeで補完せず分類を確定しない。source/evidence ownerまたは既存接続契約ownerへ戻す。`version_target: 1.0`。

### HELIXLABO-L2-004 — `LABO-004-FR-01`

既存方式A/Bとsource evidenceから `purpose, structure, behavior, assumption, constraint, guarantee, cost` の7軸を別fieldとして保持する比較仮説を作る。守では変更前に意味・目的・条件・構造を保持し、破では全体一致を仮定せず部分一致と条件依存差を比較し、離では有効部分の再構成案をcandidateとして提示する。candidateはauthority/採択済み状態ではない。原方式の意味が不明なら変換せずsource clarificationへ戻す。

- **LABO-004-AC-01 — 七軸・守破離**：方式A/Bの7軸をsource identity/revision付きで保持し、守の意味/目的/条件/構造、破の部分一致・条件差、離の根拠付き再構成candidateを区別して出す。
- **LABO-004-AC-02 — 部分一致とauthority**：一軸または条件だけ異なるfixtureで部分一致を全体同等としたり差異を隠したり、candidateをauthority/採択済みと表示したら不成立。差異と根拠を該当軸へ保つ。
- **LABO-004-AC-03 — source clarification**：元方式の意味/purpose/条件/evidenceを確認できないときは再構成へ進まず、identity/revisionと不足理由を保って元source ownerへ戻す。
- **依存・版**：固定L2-013の各分類根拠、反証、unknown、条件とDecompose→Vector接続のidentity/revision/scope/evidence trace、および比較対象source本文のidentity/revisionを前提として照合する。各軸または接続fieldがmissing, unknown, stale, wrong-revisionなら別軸・別sourceで補完せず、比較対象source/既存接続契約ownerへ戻す。`version_target: 1.0`。

### HELIXLABO-L2-005 — `LABO-005-FR-01`

L2-004等の仮説から `KEEP, REDUCE, SPLIT, MERGE, REDEFINE, REPLACE, RELOCATE, ABSTRACT, SPECIALIZE, REFRAME, DEFER, RETIRE` の12 operation候補を個別に表し、source identity/revision、保つ意味、変わる意味、適用条件、scopeを併記する。既存機構への吸収、責務移動、operationへの復帰、retireも比較対象に残す。機構追加件数を改善目的とせず、意味変更candidateは上流判断対象として示す。LABOは採択、実行、変更、退役を決定しない。

- **LABO-005-AC-01 — operation identityと差分**：12 operation identityを個別表現でき、各候補の維持/変更意味・条件・scopeが根拠sourceに結び付く。吸収、責務移動、operation復帰、退役も候補に含む。
- **LABO-005-AC-02 — 未確定維持**：scope/意味差分/根拠が不足または矛盾する候補を確定せずunknown/unresolvedのまま保持する。意味変更は明示する。
- **LABO-005-AC-03 — authority境界**：candidateを自動採択/実行/退役したり、意味変更を技術refactorへ偽装する出力は不成立。意味変更は既存の上流authority境界へ、元候補source不足はそのownerへ返す。新owner/approval gateは作らない。
- **依存・版**：固定L2-004/014のVector出力identity/revision/scope、元方式の意味と部分比較・条件差・evidenceを前提として照合する。いずれかのidentity/field/source revision/scope/接続根拠がmissing, unknown, stale, wrong-revisionなら別候補や別sourceで補完せずoperation candidateを確定せず、元仮説/sourceまたは既存接続契約ownerへ戻す。`version_target: 1.0`。

### 固定親句→FR/AC trace

| 固定親句 | FR / AC | L10 case | 照合点 |
|---|---|---|---|
| 002 source eventから要求→recovery等のepisodeを結び、identity/environment/resultを追う | `LABO-002-FR-01`; `LABO-002-AC-01` | `L10-LABO-002-CASE-01, L10-LABO-002-CASE-02, L10-LABO-002-CASE-07` | 全列挙stage、field、source/revision逆参照 |
| 002 correlation不能eventを孤立/不明で保持 | `LABO-002-AC-02` | `L10-LABO-002-CASE-03, L10-LABO-002-CASE-08` | 孤立/欠測維持、補完なし |
| 002時刻/pathのみの因果断定、無関係event結合禁止 | `LABO-002-AC-03` | `L10-LABO-002-CASE-04` | 近接だけでは結合せず因果不確定 |
| 002未完義務補完禁止、訂正で元eventを変更しない | `LABO-002-AC-02, LABO-002-AC-03` | `L10-LABO-002-CASE-05, L10-LABO-002-CASE-06` | 不足を露呈しrelationのみ訂正 |
| 002依存L2-001の全列挙fieldとL2-011接続identity/revision/scopeを独立照合 | `LABO-002-AC-01, LABO-002-AC-03` | `L10-LABO-002-CASE-09, L10-LABO-002-CASE-10, L10-LABO-002-CASE-11` | 各fieldのmissing/unknown/stale/wrong-revisionを別fixtureにし、別source補完なし・固定source/connection owner戻し |
| 003列挙分類軸の根拠付き独立分類 | `LABO-003-FR-01`; `LABO-003-AC-01` | `L10-LABO-003-CASE-01, L10-LABO-003-CASE-07` | 全分類軸を独立保持、未見例も同一AC |
| 003一括採否/unknown推測/条件付き成功一般化禁止 | `LABO-003-AC-02` | `L10-LABO-003-CASE-02, L10-LABO-003-CASE-03, L10-LABO-003-CASE-04` | 条件差・unknown・反証を別々に保つ |
| 003意味を変えずevidenceへ戻る | `LABO-003-AC-03` | `L10-LABO-003-CASE-05, L10-LABO-003-CASE-06` | source/revision保持と元owner戻し |
| 003 L2-002/012依存fieldと9分類各根拠の個別不足/矛盾 | `LABO-003-AC-01, LABO-003-AC-02, LABO-003-AC-03` | `L10-LABO-003-CASE-08, L10-LABO-003-CASE-09` | 一field/一分類だけ変異させ、別episode/evidence補完なし・元owner戻し |
| 004七軸比較、守破離、部分一致/条件差、離candidate | `LABO-004-FR-01`; `LABO-004-AC-01, LABO-004-AC-02` | `L10-LABO-004-CASE-01, L10-LABO-004-CASE-02, L10-LABO-004-CASE-03, L10-LABO-004-CASE-07` | 七軸・段階・差異・未見正常 |
| 004原意味が不明なら変換せず明確化 | `LABO-004-AC-03` | `L10-LABO-004-CASE-04, L10-LABO-004-CASE-05` | source identity/revisionと不足理由を戻す |
| 004 candidateはauthorityでない | `LABO-004-AC-02` | `L10-LABO-004-CASE-06` | 採択状態を生成しない |
| 004 L2-013依存field、比較source、七軸の単独欠落/不一致 | `LABO-004-AC-01, LABO-004-AC-03` | `L10-LABO-004-CASE-08, L10-LABO-004-CASE-09` | 他軸/他sourceで補完せず、比較を確定せず既存ownerへ戻す |
| 005 12 operationごとに維持/変更意味・条件・scopeを比較 | `LABO-005-FR-01`; `LABO-005-AC-01` | `L10-LABO-005-CASE-01, L10-LABO-005-CASE-08` | 12個別identity、根拠付き差分 |
| 005吸収/移管/operation復帰/retireを残し機構数を目的化しない | `LABO-005-AC-01` | `L10-LABO-005-CASE-01, L10-LABO-005-CASE-02` | 代替候補も保持 |
| 005意味変更は上流判断、LABOが採択/retireしない | `LABO-005-AC-02, LABO-005-AC-03` | `L10-LABO-005-CASE-03, L10-LABO-005-CASE-04, L10-LABO-005-CASE-05, L10-LABO-005-CASE-06` | unknown保持、意味変更表示、権限外出力なし |
| 005 L2-004/014依存と全候補tuple（維持/変更意味・条件・scope）の個別欠落/不一致 | `LABO-005-AC-01, LABO-005-AC-02, LABO-005-AC-03` | `L10-LABO-005-CASE-09, L10-LABO-005-CASE-10, L10-LABO-005-CASE-11` | 補完せずcandidateを未確定にし、元仮説/sourceまたは既存connection ownerへ戻す |

### 旧source item dispositionとpair層差

- `LEGACY-ASSET-28FB139B26CD61CC51EE` §1 R-01/R-02の5 category/12 metricは本4親の固定分類語彙と一致しない。failure/missingを隠さない意味のみ再導出し、旧category/metric identity・順序・provider/team順位は置換・除外。
- 同asset §1 R-03〜R-05のprovider/team/profile軸、task snapshot、run protocolは固定親の入力契約ではない。source identity/revision/scope追跡の意味だけ再導出し、axis、15-field snapshot、seed/timeout/retry/cache/hardware protocolは持ち込まない。
- 同asset §1 R-06〜R-08のhidden oracle/scorer、accepted-change scoring/cost、blind judgeは固定親にない。evidenceとversionを保ち自己申告で確定しない意味だけ再導出し、scorer/価格/hidden dataset/judge条件は除外。
- 同asset §2 fixed portfolioと§3 runner/admission/price/implementation exclusionsは旧Bench固有であり、この4親へ移さない。
- `LEGACY-ASSET-A952A3A175EB82A4781B` の旧L10 AC-001–014は現行親のACと一致しない。positive/negative/traceの意味のみ再導出し、旧ID/runner/threshold/countは置換。
- 旧forward L3定義とREADME/test-designの配置差は自動移植せず、現行6文書のfunctional AC正本とL10照合pairへ置換する。本Stage 2bに独立business outcomeはないためBR/BV/BCASEを作らない。

## Stage 2b — HELIXLABO-L2-006/007/008/009/010（候補、1.0）

このStage 2b cutoutの後半は、前半の002–005に続く5親のL3候補である。各親のversion targetはPOが採択した1.0 target candidateで、実際の契約版・成果物版、実装・実行・release許可を意味しない。意味・scope・owner・versionを変更しない。固定L2/L11が要件authority、PO decision `633bf12ea8f948db8ba3d6600179c4a9507377a7` が採択登録、G0 `1880c422311a7f8321dbb0e2b98fa12c69449201` はStage順序だけの記録である。他Stageの候補本文をauthorityとして使わない。

| 親 | 採択registration | 固定L2 | 対L11 | PO row | G0 order row | 採択依存 |
|---|---|---|---|---:|---:|---|
| `HELIXLABO-L2-006` | `MPR-RC-HELIXLABO-L2-006-001` | `labo-requirements.md:109-116` | `labo-acceptance.md:50` | 53 | 253 | L2-005/015/022/028 |
| `HELIXLABO-L2-007` | `MPR-RC-HELIXLABO-L2-007-001` | `labo-requirements.md:117-124` | `labo-acceptance.md:51` | 54 | 254 | L2-006/016 |
| `HELIXLABO-L2-008` | `MPR-RC-HELIXLABO-L2-008-001` | `labo-requirements.md:125-132` | `labo-acceptance.md:52` | 55 | 255 | L2-007/017 |
| `HELIXLABO-L2-009` | `MPR-RC-HELIXLABO-L2-009-001` | `labo-requirements.md:133-140` | `labo-acceptance.md:53` | 56 | 256 | L2-006/018 |
| `HELIXLABO-L2-010` | `MPR-RC-HELIXLABO-L2-010-001` | `labo-requirements.md:141-148` | `labo-acceptance.md:54` | 57 | 257 | L2-009/019 |

L2/L11固定revisionは `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、PO adoption decisionは `633bf12ea8f948db8ba3d6600179c4a9507377a7`、順序記録は `1880c422311a7f8321dbb0e2b98fa12c69449201`。各registrationのsemantic digest、全file/span SHAは、この本文と同時点の不変監査記録に固定する。L2の依存はG0の短い要約だけでなく、固定L2本文の全句から照合する。

### HELIXLABO-L2-006 — `LABO-006-FR-01` Experiment Engine

baseline/current、candidate、hybridの仮説、条件、適用scope、oracleと評価条件を、OSが割当てたWorkerによる実験結果と同一ticket・experiment・対象版へ結んで比較する。比較結果には、品質、success/failure、false positive/negative、再作業、速度、CI/Worker時間、token/API費用、人間介入、context、複雑度、復旧時間、release lead time、運用負荷、cross-product再利用性を個別に記録し、失敗・反例・適用範囲・費用・限界を保持する。比較不能・中断・unknownをsuccessまたはimprovementへ変換しない。

依存は、L2-005/015が供給する比較armの仮説・条件・scope・oracle・version alignment、L2-022が供給するOS ticket/operation/assignment/source observation identity+revision、L2-028が供給するWorker result contract/task class/assignment identity/source/target-version linkである。assignmentと実行はOSの権限に従うWorkerが担い、LABOはWorkerを選定・割当・起動せず、元source truthやoracle条件を修正しない。

- **LABO-006-AC-01 — 比較armと個別軸**：同じ宣言条件・scope・oracleでbaseline/current、candidate、hybridを別armとして保持し、親の評価対象各dimensionを独立に出力する。Weighted score、平均点または単一「動いた」結果で失敗・品質低下・反例を相殺しない。oracleが宣言した必要品質条件を下回る結果を、速度改善など別dimensionで相殺して比較全体の改善としない。
- **LABO-006-AC-02 — 実行・identity束縛**：OS割当、ticket、experiment identity、Worker result contract/source、対象版が一致した観測のみを同一比較に結ぶ。LABOがassignmentを作る・変更する・Workerを指定する出力をしない。
- **LABO-006-AC-03 — 比較可能性・失敗・欠測**：arm間の条件/oracle/version差、個別metric欠測、反例、中断、判定不能をsource・理由付きで保持し、無効比較や部分観測を成功、ゼロ費用、improvementへ補完しない。assignment/source/link不足はOS、Worker result contract/source不足はその提供owner、仮説・oracle・比較条件の不足は元のexperiment/oracle ownerへ戻す。

### HELIXLABO-L2-007 — `LABO-007-FR-01` Assurance Allocation Engine

反復episode、L2-006の比較可能な実験証拠、rule candidateとoracleを入力し、同条件再現性、機械判定可能性、oracleの適用性、副作用範囲、retry/rollback可能性、冪等性の6条件をそれぞれ評価する。出力はsystemization candidateとoperation continuation candidate、およびscope・限界・未確定条件の並列評価とする。文脈依存、意味判断、例外多数、不完全oracle、高い誤検知、過剰拘束はoperation continuationの妥当な候補として保持する。

L2-016が供給するconnectionをまたぐ比較可能性、counterexample保持、oracle/interruption/undecidable stateも入力証拠として追跡する。`Operation → Repeated Stable Decision → Rule Candidate → Shadow → Mechanism Candidate`は評価を説明する状態名であり、自動昇格、資格判定、新承認手続きではない。LABOはoperationの採択・実行、system化の承認を行わない。

- **LABO-007-AC-01 — 六条件の独立評価**：6条件をそれぞれsupported / contradicted / unknownと証拠locator付きで示す。同じscope・条件・oracleに基づく比較可能な証拠を保ち、1条件の証拠で他条件を補わない。
- **LABO-007-AC-02 — 両候補と運用継続**：systemizationとoperation continuationを同じ証拠範囲で評価し、文脈依存等の限界・反例・未完条件を保持する。未知条件があるがoperation継続を支える根拠がある場合、その候補を消さずunresolved条件を併記する。
- **LABO-007-AC-03 — 段階とauthorityの分離**：候補段階を観測記述として扱い、自動昇格・新gate・承認・qualification・operation実行を生成しない。experiment/oracle不足は元source ownerへ、system/operation責任文脈は現在の責務ownerへ戻し、新ownerを作らない。

### HELIXLABO-L2-008 — `LABO-008-FR-01` Operational Fallback Engine

version付きのcurrent system-rule、owner提供の運用結果、例外、誤検知、回避運用とその負担、変更費用を入力し、system継続・修正またはoperationへの復帰の再評価candidateを示す。各candidateには適用するoperation条件、現行保証、根拠と未完義務を保持する。systemの永続固定を仮定せず、operationへ戻る案をfailureやretirementに読み替えない。L2-017のcurrent guarantee、再評価candidate、unfinished duties、owner提供結果を現責務ownerの情報として参照する。

- **LABO-008-AC-01 — 根拠付き選択肢**：current system versionに対応する運用結果と例外・誤検知・workaround・変更費用をsource付きで示し、continue / modify / operational fallbackの候補を根拠・適用条件とともに出す。
- **LABO-008-AC-02 — 保証と未完義務**：候補ごとに現行保証、復帰先operationの条件、未完義務・owner提供結果を保持し、未知/欠落を完了や義務消失へ変換しない。
- **LABO-008-AC-03 — 切替とowner境界**：LABOはsystem変更やoperation切替を実行しない。version、運用結果、例外、誤検知、workaround burden、費用、保証、責務ownerのどれかがmissing/stale/conflictならunknown/unresolvedとして現行責務ownerへ戻す。

### HELIXLABO-L2-009 — `LABO-009-FR-01` Generalization Engine

L2-006の評価済みexperiment群、counterexample、sample conditionsとL2-018の比較結果・適用限界から、支持されるscopeを5段階 `single episode`, `repeated episodes`, `cross-project`, `cross-product`, `general structure`のいずれまでか示す。一事例から反復・project・productを越える主張を作らない。各段階の根拠、標本条件、反例、applicability limitを結ぶ。Feedback先をscopeごとに分け、product固有meaningをBRAINへ送らず、generic structureは直接の根拠なしに認定しない。反例またはscope外条件があれば支持範囲を狭め、元evidence ownerへ戻す。

- **LABO-009-AC-01 — 五scopeの根拠**：5段階を明示して評価し、各claimの支持/反証evidence identity、sample conditions、適用境界を列記する。支持される範囲より広いscopeを出力しない。
- **LABO-009-AC-02 — 反例とFeedback先**：counterexample・applicability limitで主張scopeを狭め、元evidenceへtraceする。product固有meaningと汎用構造を混同せず、product固有meaningをBRAINへrouteしない。
- **LABO-009-AC-03 — 推測防止**：scope/sample/evaluation result/反例がmissing, unknown, staleまたは比較不能ならscopeをunknown/unassessedに保つ。単一episodeから上位scopeを認定せず、根拠を作らない。戻し先はexperiment/evidenceの元ownerであり、LABOがscope基準やsample thresholdを新設しない。

### HELIXLABO-L2-010 — `LABO-010-FR-01` Feedback Derivation Engine

評価済みepisode、実験、反例、適用範囲から、必要に応じて複数のtarget-specific Feedback proposalを作る。各proposalは親が列挙する16 fieldをすべてsource/evidenceへ結び、欠落を推測補完しない。`recommended_action`の有効語彙は正確に `maintain`, `redefine`, `replace`, `split`, `merge`, `systemize`, `operational_fallback`, `retire` の8値とする。親の8値を含む有効proposalは候補として通常に記録する。未知・無効enumはunknownとして保持し、近い値へ変換しない。

Feedbackは非権威の提案であり、登録とroutingはOS、内容変更はtarget ownerが担う。target identity/responsibility、scope、evidence、counterexample、regression risk、revalidation conditionを分け、複数targetへの分解はtargetごとに別proposalとして保持する。LABOはticket、target変更、許可、配置、採択、retireを生成・実行しない。L2-019からのunknown targetはrouting candidateに留め、確定routingにしない。

- **LABO-010-AC-01 — 16 mandatory fields**：`source_episode`, `source_revision`, `target_mechanism`, `target_responsibility`, `observation`, `evidence`, `failure_or_success`, `hypothesis`, `experiment`, `result`, `counterexample`, `scope`, `confidence`, `regression_risk`, `recommended_action`, `revalidation_condition`を各proposalに明示する。source/valueを別fieldから推測せず、field missing/conflictはproposalを未確定へ保つ。
- **LABO-010-AC-02 — 8 valid actions and unknown enum**：上記8有効actionは個別proposal valueとして受け付け、meaning/scope/evidenceを維持する。列挙外の値、または値が不明な場合はunknown/invalidのまま保持し、有効値へ補正しない。
- **LABO-010-AC-03 — target別提案と権限境界**：複数targetを含む根拠はtargetごとに分離し、各targetのresponsibility/evidence/applicabilityを保つ。提案からOS registration/routing、ticket、target authority変更を生成しない。mandatory field/evidenceは該当source ownerへ、target責務の不明はOS routing ownerおよびtarget responsibility sourceへ候補として戻す。

### 親句→FR/AC対応

| 固定親句 | L3 FR / AC |
|---|---|
| 006 baseline/current・candidate・hybridの比較、親が列挙する全evaluation dimensions、失敗/反例/費用/限界、およびoracle所定の必要品質を速度で相殺しない | `LABO-006-FR-01`; `LABO-006-AC-01`, `LABO-006-AC-03`; L10: `L10-LABO-006-CASE-01`, `L10-LABO-006-CASE-14`（品質違反と速度改善を別軸で保持し全体改善としない） |
| 006 OS assignment下のWorker実行結果、同じticket/experiment/target versionへのlink、LABOは割当しない | `LABO-006-FR-01`; `LABO-006-AC-02`, `LABO-006-AC-03` |
| 007 six conditionsを個別評価、比較可能なL2-006/016 evidence | `LABO-007-FR-01`; `LABO-007-AC-01`, `LABO-007-AC-02` |
| 007 systemizationとoperation continuation、適用限界、段階は説明用で自動昇格・新承認なし | `LABO-007-FR-01`; `LABO-007-AC-02`, `LABO-007-AC-03` |
| 008 continue/modify/operation fallback、根拠・条件・保証・未完義務、LABO切替なし | `LABO-008-FR-01`; `LABO-008-AC-01`, `LABO-008-AC-02`, `LABO-008-AC-03` |
| 009 five scope levels、標本条件/反例/applicability、counterexampleでnarrow | `LABO-009-FR-01`; `LABO-009-AC-01`, `LABO-009-AC-03` |
| 009 scope別Feedback先、product-specificをBRAINへ送らずgeneric structureを推測しない | `LABO-009-FR-01`; `LABO-009-AC-02`, `LABO-009-AC-03` |
| 010 target-specific Feedback proposal、16 field/8 action enum | `LABO-010-FR-01`; `LABO-010-AC-01`, `LABO-010-AC-02` |
| 010 proposalはnon-authority、OS registration/routing、target owner changes、欠落根拠を差戻す | `LABO-010-FR-01`; `LABO-010-AC-03` |

### 旧source項目別disposition

この5親に対する起点は旧Bench要件・旧paired test・旧L3定義とREADME、および関連する旧Universal Improvement Loopである。以下のdispositionは同一要求の完全一致を意味しない。項目ごとに固定親から意味を再導出し、固定親にない旧制約・runtime・資格・scorerを持ち込まない。各registration semantic digest、fixed/legacy sourceのfull SHAとraw-LF bounded span、親別trace、case count、静的確認は[本件の不変source/pair監査記録](../../governance/audits/requirement-registration/labo-stage2b-002-010-publication-cutout-2026-10-05.json)を参照する。

| 旧source | 対象項目と扱い |
|---|---|
| `LEGACY-ASSET-28FB139B26CD61CC51EE` — `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/helix-bench-evaluation.md:35-141` | failure/missingを隠さず、source・version・scope・comparison条件とevidenceのlineageを持つ考えは006/007/009/010の各句へ意味再導出。旧5 category/12 metrics、team/provider順位、scorer、hidden oracle、fixed task portfolio・protocol、価格/accepted-change、qualification/admissionは本親の根拠でなく置換/除外。 |
| `LEGACY-ASSET-A952A3A175EB82A4781B` — `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/helix-bench-evaluation-acceptance.md:19-45` | positive/negative oracleの分離・trace形式だけをL10対へ再導出。旧AC IDs、metric、runner、threshold、admissionは置換/除外。 |
| `LEGACY-ASSET-F542125805B777D8A56A` — `archive/legacy-generation-2026-09-14/root/docs/process/forward/L00-L06-design-phase.md:148-168` | FR/ACと対のverification designという意味を再導出。旧G3/runtime/sub-gate/engineering disciplineを現行gateにしない。 |
| `LEGACY-ASSET-9A772391C7FB1298D45F` — `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/README.md:19-56` | 責務文書の分割という意図だけ再導出し、旧3文書/L3→L12一文書配置を現行6 canonicalのL3↔L10 pairへ置換。 |
| `LEGACY-ASSET-02D897E62EF2FA267267` — `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/universal-improvement-loop-requirements.md:68-103` | incomparable/interrupted evidenceとlineageを保つ一般的意味だけ関連sourceとして再導出。event trigger、eligibility gate、merge/post-main lifecycle、workflow routing、candidate schemaは移さない。 |

Assurance AllocationまたはOperational Fallbackと完全一致する旧L3要件は、旧HELIX-Bench L3-requirementsと旧test-design/helixの上記bounded searchで見つからなかった。隣接hitは原文文脈を読み、別概念として除外した。この範囲限定の不在確認をarchive全体の不存在とはしない。旧test/runtime/CIは実行していない。

| 固定parent | 旧source項目と判定 | 現行で保つ意味 / 置換・除外 |
|---|---|---|
| `HELIXLABO-L2-006` | 旧Bench `LEGACY-ASSET-28FB139B26CD61CC51EE` R-01/R-02, R-04–R-07（`helix-bench-evaluation.md:35-141`）とpaired AC-002/005/007/008/010/011（`helix-bench-evaluation-acceptance.md:19-45`） | failure/missingを捨てず、source/version/condition/oracleの差で比較無効を表示し、metric別evidenceとcostを記録する意味だけ再導出。旧5 category/12 metric、scorer/weight、team/provider axis、hidden oracle、fixed snapshot/protocol/hardware、accepted-change priceを置換/除外。 |
| `HELIXLABO-L2-007` | bounded old L3/test-design searchで同じAssurance Allocation要件は不在。隣接のsystem synthesis等のhitは文脈上別概念として除外。旧Bench R-06/R-08や旧UIL sourceはこの親の条件ではない。 | 六条件、両候補、operation継続、説明上の段階とno-auto-promotionは固定L2/L11から再導出。旧scorer/admission/qualification/shadow lifecycleを根拠に追加せず、旧source未発見だけを理由にL2意味を変更しない。 |
| `HELIXLABO-L2-008` | bounded old L3/test-design searchで同じOperational Fallback要件は不在。隣接する一般改善・運用記述を本親の直接起点としない。旧UILのevent trigger/lifecycleは異なる。 | current system evidence、continue/modify/operation復帰候補、保証/条件/未完義務は固定L2/L11から再導出。旧fallback workflow、退役条件、trigger、実切替を持ち込まない。 |
| `HELIXLABO-L2-009` | 旧Bench R-03/R-04/R-05（同一条件比較・snapshot/protocol）とpaired AC-003/005/007が比較可能性を扱う。 | scope・sample condition・counterexampleを保持する一般意味だけ再導出。固定親の五scopeを正本とし、旧team/profile/cohortやfixed sample/workload thresholdは置換/除外。 |
| `HELIXLABO-L2-010` | 旧Bench R-06/R-08、paired AC-008/012のevidence lineageは一般比較起点。旧UIL R-04 candidate schemaとadmission/route lifecycleは存在するが別責務なので移植しない。 | 正確な16 field、8 valid action、proposal-only/OS registration・routing/target-owner changesは固定L2/L11から再導出。旧candidate schema、event trigger、hidden oracle、eligibility/admission、ticket creationを置換/除外。 |

上記の旧source asset/path、commit、full-file SHA、個別raw-LF span SHA、bounded search条件・hit除外理由はlinked immutable auditに記録する。再利用は既存の数値・schema・runtimeをcopyすることではなく、source/evidence/failure/unknownを隠さない一般的意味の再導出に限る。
