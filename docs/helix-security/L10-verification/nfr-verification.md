# HELIX-SECURITY L10 NFR候補検証（Stage 1 草稿）

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
| `CASE-NFR-SECURITY-031-03` | `SEC-NFR-031-03` | receiptなしで開始するproposal fixture、同じtupleのpost-run receipt、別assignment/runtime/target receiptを比較する。 | 実行前receipt要求0、同一tuple後続receiptは結合、異tupleの流用0。receipt単独の昇格0。 | receipt順序・tupleを観測できないfixtureは未評価。quota/retention閾値は測らない。 |

計測は合成fixtureに限定し、実runtimeや実secretを使わない。結果はL3承認や追加runtime使用許可を生成しない。
