# HELIX-SECURITY L10 NFR候補検証 — Stage 1（19親の候補）

> 状態：技術候補と測定設計。下記の数値・比較案は根拠付き候補で、実装値・PO承認値・実測結果ではない。parameterごとのPO確認は追加しない。要求の意味・scope・owner・versionを変える場合だけL2へ戻す。1.x/Web sinkや後続Stageは含めない。

## Stage 1の適用条件

| 候補 / parent AC | 入力・測定方法 | 候補oracle | 失敗・未評価のowner |
|---|---|---|---|
| `SEC-NFR-001` / `SECURITY-AC-005-01`, `SECURITY-AC-033-01` | 合成secret markerをcontext/log/artifact/Tool result/Worker payload/environmentを含むtask contextへ投入し、全出力を値非記録matcherで走査する。 | raw secret値露出0。fixture/result自体にも値を記録しない。 | 露出でoperationを停止し、credential/security ownerへ返す。 |
| `SEC-NFR-002` / `SECURITY-AC-008-01` | actor/target/operation/revision/environment/scope/expiryの7要素を一つずつdriftさせ、exact tuple正例とnegativeを測る。purposeはL2-006のegress条件で、このcaseへ混ぜない。 | exact 7要素tupleだけ対象operationを許可。各要素の欠落/不一致でallow 0。 | 拒否理由をSECURITY authority ownerへ返す。 |
| `SEC-NFR-003` / `SECURITY-AC-016-01` | public/customer-owned/service-internal/HELIX-confidential/HELIX-restricted/secretの各classとmissing/unknownを1つずつ入力し記録完全性を測る。 | 6/6 classを区別し、unknownをpublic/allowへ写像した件数0。1.x sink enforcementは対象外。 | missing/unknownをSECURITY分類ownerへ返し、unknown状態を維持する。 |
| `SEC-NFR-004` / `SECURITY-AC-020-01` | 8 Guard責務ごとに同一入力のBotなし/任意Bot補助と、rule未定義・適用不能・必要観測欠落入力を比較し、決定的判定/必須条件抜け/owner返却状態を測る。 | 決定ruleをBotに委ねた件数0、Guard条件抜け0。未定義・不適用・観測欠落は成功判定にせず該当enforcement ownerへunknown/holdを返す。候補Botの稼働数はpass条件でない。1.x sink enforcementを1.0 pass条件に含めない。 | policy/rule意味はSECURITY、物理実行・適用観測の不足は既存Worker/INFRASTRUCTURE ownerへ返す。 |
| `SEC-NFR-005` / `SECURITY-AC-009-01` | target scopeごとのrecipient集合と各受領/適用/未達/未観測を照合。無関係scopeも対照入力する。 | 該当recipientの未達/未観測をsuccess扱い0。無関係操作のglobal stopも0。固定latency値は置かない。 | 未達の該当recipient ownerへ返す。新しい汎用owner宛先を作らない。 |
| `SEC-NFR-006` / `SECURITY-AC-007-01` | 適用可能な9制御とSECURITY policy revisionの宣言値を入力。各宣言境界の直前/到達/超過状態を測り、request→Worker実行環境のeffective enforcement evidenceを突合する。 | 適用/観測証拠欠落0。宣言値超過やunknownをsuccessとして継続しない。未宣言timeout/resource値を補わない。 | 未定義値はunknownのままL1-007へ戻し、適用/観測はWorker実行環境とINFRASTRUCTUREが確認する。 |
| `SEC-NFR-007` / `SECURITY-AC-005-01`, `SECURITY-AC-008-01`, `SECURITY-AC-009-01`, `SECURITY-AC-033-01` | expiry `t`の直前、同時刻、直後にdispatch/resume/retryを試す。候補Aは有効条件`now < t`、候補Bは`now <= t`。revoke後とbinding/HEAD変更後も再照合する。 | 比較の推奨候補Aでは`t`到達時点でdeny、revoke/stale後のresume/retryも再照合前はallow 0。時間長さは新設しない。 | semanticsのscope変更が必要ならL2/POへ戻す。 |
| `SEC-NFR-008` / `SECURITY-AC-005-01`, `SECURITY-AC-009-01`, `SECURITY-AC-010-01`, `SECURITY-AC-013-01`, `SECURITY-AC-033-01` | decision evidence window中、source identity/revision・reason・recipient/owner stateが照合可能かを測る。raw secret scanも併行する。 | owner宣言window内の必要evidence参照可能、raw secret値0。未宣言retention期間を推定しない。 | evidence ownerへ不足を返す。retention期間の追加で要求meaningが変わる場合だけL2へ戻す。 |
| `SEC-NFR-014-01` / `SECURITY-AC-014-01` | 合成入力でmemory、training dataset、BRAIN knowledgeの3 target classを個別に入力し、source/provenance/classification、allow/deny/hold、理由のfield対応を測る。missing/unknown/wrong-targetも別fixtureにする。 | target別decision traceの欠落0件。handoff、LABO評価、保存、BRAIN登録の成立件数をこの候補の成功へ含めない。 | 不足したsource/classificationをhold/denyし、policy意味の不足はL1-014 ownerへ返す。実secretや実保存をfixtureに使わない。 |

共通機能caseと同じ合成入力を使い、未観測を0件実績にしない。値はcandidateでありL3承認・実装値・実行許可ではない。

## SECURITY-NFR-CASE-031-01 — 選択scopeの必須検査coverage

- **対応候補**: `SEC-NFR-031-01`（`SECURITY-AC-031-01..06`）
- **測定対象**：選択されたHELIXSECURITY-L2-031 operationのSECURITY-CASE-031-01〜06に結び付く、固定L2/L11必須条件の文書上の検証coverage候補。runtime実行、実credential、実canonical stateは測定対象外。
- **入力・分母**：親が明示する常時条件を分母へ置く。006/009/022/023/HARNESS/OS条件はそれぞれ外部送信、停止/逸脱、verification/adoptionへ進むfixtureに該当する場合だけ分母へ置く。選択payloadに限るmanifest条件はsource選択fixtureだけに適用する。条件外は未適用として別記し、missing/unknown/stale/未観測を成功0件へ混ぜない。
- **測定方法**：各FR/AC obligationとnormal・個別negative・未見正常CASEの対応表を作る。固定L2に記載された各必須conditionについて対応caseがあるか、各negativeが他条件と独立に変異されるか、failureのowner/未完義務/対象scopeが戻るかを照合する。多対多traceを許し、重複IDと未対応obligationを別に検出する。分母0は「該当なし」とし割合を算出しない。
- **根拠付き候補oracle**：選択scopeで必須condition fixture coverage 100%、各必須negativeの誤受入0件、対応必須証拠/owner戻しの未解消不一致0件。候補値は固定要求の受入検査に限定し、performance/quota/retention等の一般thresholdではない。
- **結果区分**：適用条件外、未選択/未観測、missing/unknown/stale、fixture不成立、negative不合格、未見正常不成立、owner返却保留、測定可能な結果を分けて記録する。測定不能や分母0をpassへ変換しない。
- **owner/限界**：policy/authorityはSECURITY、assignmentと未完義務はOS、enforcementはWorker、実資源・network・storage観測はINFRASTRUCTURE、proposal oracleはHARNESS。候補metricはL3承認、実装・実行許可、実測成功を生成しない。

Stage 2cの分母は検査結果を読む前に適用条件から固定する。適用される必須条件のmissing/unknown/stale/未観測は分母に残し、coverage未達または未評価として記録する。適用条件自体を決定できない場合は分母不明であり、「該当なし」や0件へ丸めない。


## Stage 3 — 技術候補の測定case

| NFR case ID | L3候補 | 測定・対照 | 候補oracle／未評価 |
|---|---|---|---|
| `CASE-NFR-SECURITY-029-01` | `SEC-NFR-029-01` | functional CASE-029-01..06の同一tupleと各適用証拠、read-only/networkなし、証拠流用を比較して欠落相殺・採用生成件数を計数する。 | 候補0件。証拠未観測/適用性unknownは未評価として型別ownerへ返す。provider訓練停止をローカル成功率へ換算しない。 |
| `CASE-NFR-SECURITY-030-01` | `SEC-NFR-030-01` | CASE-030-01..04で独立条件欠落と正常反復を対照にし、誤昇格・新規都度approve要求を計数する。 | 候補0件。意味上のrisk/owner/監視不明は未評価。総合点で不足を相殺しない。 |
| `CASE-NFR-SECURITY-032-01` | `SEC-NFR-032-01` | CASE-032-01..03の主/追加各marker/flag、policy適用状態を個別に比較する。 | 上書き・非適用時新規許否候補0。policy/適用観測なしはunknown。035のswitch能力はこの測定から生成しない。CASE-032-03ではWorker迂回、新actor、旧runtime、031結果流用を個別に拒否する。 |
| `CASE-NFR-SECURITY-034-01` | `SEC-NFR-034-01` | CASE-034-01..04でprofile/revision/capability/egress/authorityを一項目ずつ変え、scoped credential-useと未知正常profileを対照にする。 | 流用・write-probe誤認・正常credential-use追加deny候補0。能力/供給意味の未完は未closure。CASE-034-04の越境/実read-only超過/1.x代用も照合する。 |
| `CASE-NFR-SECURITY-035-01` | `SEC-NFR-035-01` | CASE-035-01..04で全三終端と次run、allowlist能力、deny設定能力/適用、006/007/008/OS-018非相殺を別々に観測する。 | 残置・継承・YOLO代替・未観測成功claim候補0。能力/cleanupunknownは未完へ返す。主Workerは035の測定母集団に含めない。CASE-035-04はtarget/repository/runtime間binding、申告のみの能力、非相殺条件を分離する。 |

値は根拠付き候補であり、実測達成・L3承認・実runtime使用許可を表さない。fixtureは合成入力と観測契約の設計に限り、秘密値や実runtimeを使った測定は行っていない。

## Stage 4 — 測定候補case

数値は固定親の必須条件を照合する候補oracleであり、実測・承認SLOではない。適用外、未選択/未観測、missing/unknown/stale、fixture不成立を成功の0件へ丸めない。

| NFR case | L3候補 | 入力・測定方法 | 候補oracle / owner・未評価 |
|---|---|---|---|
| `CASE-NFR-SECURITY-021-01` | `SEC-NFR-021-01` | SECURITY-CASE-021-01〜08のsource→CONNECT→SECURITY→consumer bindingと、receiptからのtrust昇格を照合。 | applicableな各stageの欠落・誤昇格候補0。CONNECTは通信/再送、SECURITYはtrust、consumer ownerは受領を保持。未選択consumerは未観測。 |
| `CASE-NFR-SECURITY-022-01` | `SEC-NFR-022-01` | SECURITY-CASE-022-01〜18でauthority tuple要素を個別変異し、request/decision/assignment/Worker evidenceを突合。 | request単独allowとtuple不一致allow候補0。通常既決authorityの再利用は追加承認なし。OS/Worker/SECURITY owner別に不足を返す。 |
| `CASE-NFR-SECURITY-023-01` | `SEC-NFR-023-01` | SECURITY-CASE-023-01〜11の4段階stateとreceiptをphase別に計測。 | failure/unknown後の段階success/promotion誤表示候補0。未実行/未観測は未評価、各段階を既存ownerへ返す。 |
| `CASE-NFR-SECURITY-024-01` | `SEC-NFR-024-01` | SECURITY-CASE-024-01〜14でpolicy/resource/enforcement revision binding、L11が対象とする通常resource state/backup、L2-024が対象とするsnapshotの無条件保存を別々に測る。 | 誤結合・固定L11受入違反・L2-024の無条件保存違反候補0。L2-005/008のcredential-useだけから保存許可を導かない。INFRA stateとWorker enforcementはSECURITY policyから独立に観測する。 |
| `CASE-NFR-SECURITY-026-01` | `SEC-NFR-026-01` | SECURITY-CASE-026-01〜13でBot absent、限定semantic input、semantic unknown、必要時のINTELLIGENCE発行/限定Worker境界を比較。 | deterministic Guard omission、semantic→authority昇格、発行元/authority境界の不一致受入候補0。1.x semantic runtimeは1.0分母に含めず、意味判断不足はINTELLIGENCEへ戻す。 |
