# HELIX-SECURITY L10 NFR候補検証（1.0採択親31件の草稿）

[L3 NFR候補](../L3-requirements/nfr-grade.md)の各candidate IDを個別に測る。下記値は根拠付き候補であり、実装値・PO承認値ではない。要求の意味・scope・owner・versionを変える場合だけL2/POへ戻す。

| 候補 / 親AC | 入力と測定方法 | 合格判定 | 失敗・戻し先 |
|---|---|---|---|
| `SEC-NFR-001` / `SECURITY-AC-005-01` | 合成secret markerをcontext/log/artifact/Tool result/Worker payload出力へ投入し、出力全てを値非記録のmatcherで走査する。 | raw secret値露出0。fixture/result自体にも値を記録しない。 | 露出でoperationを停止し、credential/security ownerへ返す。 |
| `SEC-NFR-002` / `SECURITY-AC-008-01` | actor/target/operation/revision/environment/scope/expiryの各tuple要素を一つずつdriftさせ、exact tuple正例とnegativeを測る。 | exact tupleだけ対象operationを許可。7要素の各欠落/不一致でallow 0。 | 拒否理由をSECURITY authority ownerへ返す。 |
| `SEC-NFR-003` / `SECURITY-AC-016-01` | public/customer-owned/service-internal/HELIX-confidential/HELIX-restricted/secretの各classとmissing/unknownを1つずつ入力し記録完全性を測る。 | 6/6 classを区別し、unknownをpublic/allowへ写像した件数0。1.x sink enforcementは対象外。 | missing/unknownをSECURITY分類ownerへ返し、unknown状態を維持する。 |
| `SEC-NFR-004` / `SECURITY-AC-020-01` | 8 Guard責務ごとにBotなしと任意Bot補助のfixtureを比較し、決定的判定/必須条件抜けを測る。 | 決定ruleをBotに委ねた件数0、Guard条件抜け0。候補Botの稼働数はpass条件でない。 | enforcement意味はSECURITY、実行適用はWorker ownerへ返す。 |
| `SEC-NFR-005` / `SECURITY-AC-009-01` | target scopeごとのrecipient集合と各受領/適用/未達/未観測を照合。無関係scopeも対照入力する。 | 該当recipientの未達/未観測をsuccess扱い0。無関係操作のglobal stopも0。固定latency値は置かない。 | 未達recipient ownerとOS/Worker/CONNECT等該当ownerへ戻す。 |
| `SEC-NFR-006` / `SECURITY-AC-007-01` | 適用可能な9制御とassignment/runtime ownerの宣言値を入力。各宣言境界の直前/到達/超過状態を測り、request→effective enforcement evidenceを突合する。 | 適用/観測証拠欠落0。宣言値超過やunknownをsuccessとして継続しない。未宣言timeout/resource値を補わない。 | SECURITY policy不足はL1-007、physical enforcementはWorker/INFRASTRUCTURE ownerへ返す。 |
| `SEC-NFR-007` / `SECURITY-AC-005-01`, `SECURITY-AC-008-01`, `SECURITY-AC-009-01`, `SECURITY-AC-033-01` | expiry `t`の直前、同時刻、直後にdispatch/resume/retryを試す。候補Aは有効条件`now < t`、候補Bは`now <= t`。revoke後とbinding/HEAD変更後も再照合する。 | 比較の推奨候補Aでは`t`到達時点でdeny、revoke/stale後のresume/retryも再照合前はallow 0。時間長さは新設しない。 | semanticsのscope変更が必要ならL2/POへ戻す。 |
| `SEC-NFR-008` / `SECURITY-AC-009-01`, `SECURITY-AC-010-01`, `SECURITY-AC-013-01` | decision evidence window中、source identity/revision・reason・recipient/owner stateが照合可能かを測る。raw secret scanも併行する。 | owner宣言window内の必要evidence参照可能、raw secret値0。未宣言retention期間を推定しない。 | evidence ownerへ不足を返す。retention期間の追加で要求meaningが変わる場合だけL2へ戻す。 |

## Stage 2c — HELIXSECURITY-L2-031候補の測定case

| L10 case ID | NFR候補 | 入力・測定 | 合格oracle | 失敗／未評価 |
|---|---|---|---|---|
| `CASE-NFR-SECURITY-031-01` | `SEC-NFR-031-01` | 031 scope内のcopy-contained proposal positiveと、canonical repo/evidence/authority direct read/write、proposal-generated state change negativeを別々に与える。primary Workerはscope外対照にする。 | copy内の許可提案は可能。canonical read/writeおよびauthority/acceptance/merge/promote effect 0。 | direct-access可能なら不合格。実隔離の観測がなければ未評価としてINFRASTRUCTURE/Worker ownerへ戻す。 |
| `CASE-NFR-SECURITY-031-02` | `SEC-NFR-031-02` | 合成secret markerを非出力matcherで全出力先から検索し、有効な既存scoped credential capability positiveとscope/expiry/classification drift negativeを比較する。 | raw marker露出0。全既存条件を満たすcapabilityはcredential-useのみを理由に拒否されず、欠落条件は既存ownerへ戻る。 | markerは証拠へ書かない。入力class/authority不明はunknownであり、全credential use拒否または無条件allowなら不合格。 |
| `CASE-NFR-SECURITY-031-03` | `SEC-NFR-031-03` | receiptなしで開始するproposal fixtureに、Worker/INFRASTRUCTUREが返す適用観測を正常・欠落・false・driftで与え、同一tupleのpost-run receiptと別assignment/runtime/target receiptも比較する。 | 実行前receipt要求0、適用観測のpolicy条件との一致を照合し、欠落/非適用/driftは未完へ返す。同一tupleの後続receiptは結合し、異tuple流用・receipt単独の昇格0。 | 適用観測やreceipt tupleを観測できないfixtureは未評価。quota/retention閾値は測らない。 |

計測は合成fixtureに限定し、実runtimeや実secretを使わない。結果はL3承認や追加runtime使用許可を生成しない。

## Stage 3 — 技術候補の測定case

| NFR case ID | L3候補 | 測定・対照 | 候補oracle／未評価 |
|---|---|---|---|
| `CASE-NFR-SECURITY-029-01` | `SEC-NFR-029-01` | functional CASE-029-01..03の同一tupleと各適用証拠、read-only/networkなし、証拠流用を比較して欠落相殺・採用生成件数を計数する。 | 候補0件。証拠未観測/適用性unknownは未評価として型別ownerへ返す。provider訓練停止をローカル成功率へ換算しない。 |
| `CASE-NFR-SECURITY-030-01` | `SEC-NFR-030-01` | CASE-030-01..03で独立条件欠落と正常反復を対照にし、誤昇格・新規都度approve要求を計数する。 | 候補0件。意味上のrisk/owner/監視不明は未評価。総合点で不足を相殺しない。 |
| `CASE-NFR-SECURITY-032-01` | `SEC-NFR-032-01` | CASE-032-01..02の主/追加各marker/flag、policy適用状態を個別に比較する。 | 上書き・非適用時新規許否候補0。policy/適用観測なしはunknown。035のswitch能力はこの測定から生成しない。 |
| `CASE-NFR-SECURITY-034-01` | `SEC-NFR-034-01` | CASE-034-01..03でprofile/revision/capability/egress/authorityを一項目ずつ変え、scoped credential-useと未知正常profileを対照にする。 | 流用・write-probe誤認・正常credential-use追加deny候補0。能力/供給意味の未完は未closure。 |
| `CASE-NFR-SECURITY-035-01` | `SEC-NFR-035-01` | CASE-035-01..03で全三終端と次run、allowlist能力、deny設定能力/適用を別々に観測する。 | 残置・継承・YOLO代替・未観測成功claim候補0。能力/cleanupunknownは未完へ返す。主Workerは035の測定母集団に含めない。 |

値は根拠付き候補であり、実測達成・L3承認・実runtime使用許可を表さない。fixtureは合成入力と観測契約の設計に限り、秘密値や実runtimeを使った測定は行っていない。


## Stage 4 — 接続の候補値と測定

| 候補／測定case | 親AC | 候補・比較・根拠 | 測定／未評価 |
|---|---|---|---|
| `SEC-NFR-021-01` / `CASE-NFR-SECURITY-021-01` | `SECURITY-AC-021-01..03` | source/revision誤結合、deny/unknownのallow化、受領から信頼・保存生成を各0件。A=伝送成功のみ、B=分類と受領traceを独立照合。固定021のowner分離を測れるBを候補とする。 | 二source交換、deny/unknown、外部自称許可、未見正常sourceを対照に各違反を別計数。保存014/027の未実施を受領失敗にしない。 必要観測なしは未評価、意味上の違反候補0件。 |
| `SEC-NFR-022-01` / `CASE-NFR-SECURITY-022-01` | `SECURITY-AC-022-01..03` | 七要素tuple不一致の割当・実行許可、判断成功による適用欠落相殺を各0件。A=初回判定だけ、B=判断・割当・適用の各対象を再照合。固定022と008/009の条件を保つBを候補とする。 | 七要素を個別変更し期限切れ/revokeと実適用欠落を別計数。異tuple実行と未観測成功claimを測り、latency上限は未指定とする。 必要観測なしは未評価、意味上の違反候補0件。 |
| `SEC-NFR-023-01` / `CASE-NFR-SECURITY-023-01` | `SECURITY-AC-023-01..04` | 不足・失敗・別revisionの昇格と将来receiptの実行前要求を各0件。A=最終greenだけ、B=候補/admission/実行/検証/昇格の段階別記録。固定023の失敗ownerを保存するBを候補とする。 | 一段階ずつ失敗・欠落・revision変更し、未見正常候補と比較。段階別未完率・誤昇格・将来receipt要求を独立計数し、固定timeoutを作らない。 必要観測なしは未評価、意味上の違反候補0件。 |
| `SEC-NFR-024-01` / `CASE-NFR-SECURITY-024-01` | `SECURITY-AC-024-01..03` | policy宣言・資源状態・実強制の欠落相殺、raw値の無条件保存・露出を各0件。A=資源readyだけ、B=三ownerの適用条件と観測を独立照合。固定024と005/007の責務を保つBを候補とする。 | 三者各一観測欠落、環境変更、合成marker混入、有効scoped利用を比較。marker値を記録せず漏えい件数と誤deny件数を別計数。 必要観測なしは未評価、意味上の違反候補0件。 |
| `SEC-NFR-026-01` / `CASE-NFR-SECURITY-026-01` | `SECURITY-AC-026-01..03` | 決定GuardのBot委譲、自称回答による許可化、後続Bot能力の1.0合格条件化を各0件。A=Bot成功を総合判定、B=Guardと必要時の意味判断材料を別照合。固定020/026の版境界を保つBを候補とする。 | Botなし/補助あり/unknown、scope拡張と自称回答、未見正常eventを比較し各誤判定を別計数。後続意味検出のprecision/recallを1.0達成率へ含めない。 必要観測なしは未評価、意味上の違反候補0件。 |

## Stage 5 — 027構成体の技術候補

| 候補／L10測定case | 親AC | 候補・比較・根拠 | 測定／未評価 |
|---|---|---|---|
| `SEC-NFR-027-01` / `CASE-NFR-SECURITY-027-01` | `SECURITY-AC-027-01..04` | 経路間証拠流用、deny/holdの成功保存化、単体/一経路からの構成体成立を各0件。A=単体014または最終aggregateのみ、B=三経路ごとの判断とsink結果を照合。固定027が各経路の独立追跡を要求するためBを候補とする。時間・retention・quota値は未指定のままとする。 | 同番号functional caseで三経路正常、各field個別変異、未見正常、一経路unknownを比較。違反件数と経路別未評価を別計数し、候補0件。必要観測なしは未評価であり構成体合格を主張しない。 |
