# OS Stage 2a 親023 handoff binding negative-case 追補監査

基準main: `e028e18c90e83295c84d77c4829702a349bce0dc`。固定親revision: `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。本記録はStage 2a親023のL3/L10設計補強に限る。

## 目的と範囲

固定L2-023はsubject revision/digest・因果ID・scope・未完義務・停止理由・証拠をhandoffへ束縛する。L11-023は各値の一致を確認し、不一致なら接続を未成立として発生側sourceまたは管理へ返し、receiverが未完義務を受理するまで元作業を完了にしない。本追補は既存AC-OS-023-02に4項目の独立negative oracleを追加する。L2/L11の意味、owner、version target、評価閾値を変更しない。

|根拠|固定revision span|全文SHA-256|span SHA-256|
|---|---|---|---|
|`docs/helix-os/L2-requirements/governance-requirements.md`|722-731行|`c92d3c052884c05fbbba89fc86f6e6e0c576846e87073327fb0917e32a1747cf`|`9e07b91bc6da6705d31bd24c2b6078807ad644d7266ba068a3c8aa5dbf849248`|
|`docs/helix-os/L11-acceptance/governance-acceptance.md`|380-386行|`925e06cd08056d9569dd31703d7f76e5be59b34f85980646c733367af5edd680`|`215240e3045227f84a8f485fd17752e2def2c15c3db538e797ebbd8b58f4536d`|

## 旧sourceを起点にした判断

|legacy source / asset|実読span|全文SHA-256|意味上の扱い|
|---|---|---|---|
|`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/resident-lane-orchestration-requirements.md` / `LEGACY-ASSET-50CA1C554747F12266D3`|534-541行 (`3250dddef98742feda21824c750b397eba492513e603d3672a8619e5fd3b38dd`); 545-552行 (`b37ed732d6fc1b8c24cad052a355472b3199d3c9220da3d0877f80b96bd1ed53`); 717-745行 (`130e2e132478a52856b1416bd5cd1a44a958a77cb875db60c86984db22e851f9`)|`17bc83614d7f5f75b61831eb447a23ee706cb8a6d9e54477736e553ff956dcfd`|RLO-FR-011..015のinput/receipt・stale返却を意味再導出。lane/lease/branch/Issue/CI runtimeは現行へ移植しない。|
|`archive/legacy-generation-2026-09-14/root/docs/test-design/helix/resident-lane-orchestration-acceptance.md` / `LEGACY-ASSET-437A6A68F9A9E0AE1B9E`|17-55行 (`36e097a074fe674fddd2719b6c196163a6aa625908c90f0125ff42a99e2a41da`)|`63ac3d0fbc36f014977998f9073846bfc01e5d352e07c1e10d408f0eab0ad707`|RLO-AC-011..015のexact HEAD・review receipt・stale receipt反例を比較起点にし、旧ID/実行testは移植しない。|

旧assetの扱い: 旧RLO-FR-011..013/014..015とRLO-AC-011..015は、scope-bound worker inputs、exact HEAD/receipt、stale/incorrect receiver/reviewの反例という比較起点として意味を再導出した。現行CASE ID、固定L2 owner、connection unresolvedと未完保持は固定親から再導出し、旧resident-lane/lease/branch/Issue/CI runtime mechanismは置換・実行対象外とする。旧IDや旧test/runtimeを現行要件・oracleへ直接移植していない。

## 新しい独立CASEと期待oracle

各CASEは対象のbinding一項目だけを変え、その他のbindingはnormal CASEと同じに保つ。各異常でhandoffの受領/connectionを成立させず、ticketと未完義務を保持し、固定L2-023:729/L11-023:385の既存返却先（発生側sourceまたは管理）へ戻す。

|ID|単独mutation|期待結果|
|---|---|---|
|`CASE-OS-023-02o`|causal ID欠落|handoffをunresolvedにし、ticket/unfinished dutyを保持。発生側sourceまたは管理へ返す。|
|`CASE-OS-023-02p`|scope値を別scopeへ変更|handoffをunresolvedにし、scopeを補正・推測せず、ticket/unfinished dutyを保持してsource/管理へ返す。|
|`CASE-OS-023-02q`|receiver受領setからunfinished dutyを1件欠落|受領成立にせず、未完duty/ticketを保持してsource/管理へ返す。|
|`CASE-OS-023-02r`|stop reason値を別値へ変更|handoffをunresolvedにし、unfinished stateを保持してsource/管理へ返す。|

## 6本文traceとSHA-256

|本文|before SHA-256|after SHA-256|before bytes|after bytes|確認span（after SHA-256）|
|---|---|---|---:|---:|---|
|`docs/helix-os/L3-requirements/business-requirements.md`|`cbe1866df47503b17e8a11b786dee8da58cd8a2a0a99778b64bd4a669b2fa702`|`60b43aab032c879b32f29566c482a4c0f984d7f4c522614befba02994895d5ab`|20354|20430|43-45行 `9c5c209bcb134214b501f983a472c128297f2f95a4e742ffe15214625aad7548`|
|`docs/helix-os/L3-requirements/functional-requirements.md`|`68bf95443b494e16bb2a72506358536d7d8740fb620e09d55ed0b922d3b9ed03`|`600bb2594c7a67181f66a3b51d5fbf4cf0df4fd74bf4a55c997162b9634f8362`|201811|202905|112-124行 `e22da667f97e2b041ad5b3be04faedaf9993307a6bc84665166565e5dbfe5c1d`; 188-195行 `e9e28b32de2115dd573e59144588716e9b0fd69312fa51a59812b35b4a9d8f81`|
|`docs/helix-os/L3-requirements/nfr-grade.md`|`d4e76c3dc15b28894937ddc0e39cb223aeef106284fae13b8ea4212dfce02726`|`1ceab93e59396cc0a43aebb53295f44e3816e5d96c43adde7cf722ce7a04770f`|33002|33282|69-72行 `c296d25cdfa2d4ad3cf399555371108963f2fbd11a99b2cc04cdce38c9594cec`|
|`docs/helix-os/L10-verification/business-verification.md`|`f785e13aa9a1ef8494154f03e20d0582418916281c51a6b729d385d5b66ef051`|`254351ea2067e4bb19e50adee9c544d589a2b2adc589568addb30c59982d03e9`|17774|17850|27-30行 `c86168787a9ba690c57409fe636dea0bbe3fced47d12a26ff43794388b841bd1`|
|`docs/helix-os/L10-verification/functional-verification.md`|`2c2ce95380e2deb5478bb06c27057d519373bfeabc9259799e400b390e0c5d3e`|`bc6228c177167bf3a0a3281407685fab08b283d8572676acfe03a43d1a3cdb6d`|241506|242247|481-510行 `63d6d84867844ece4086399fb5ee76f8cd205bb3a09eb7928bb76e9b9e28a29e`|
|`docs/helix-os/L10-verification/nfr-verification.md`|`156c0b6cf45630ba44f3540ceb97dae511fb7bdd93148e1a99ef4e0adfd9e543`|`254904085a70f5f632c3bbefaf220eb15e953df99ee3b62092171389abc5b675`|29758|30057|59-62行 `4c6756b13e5ddd2b8bc19b03b453322ad8f1ed3ce45eb7f6627388a95db477de`|

同期箇所: functional-requirements.mdのL2 crosswalk該当行とAC-023-02、business-requirements.md BR-023、business-verification.md BV-023、nfr-grade.md NFR-023-01、nfr-verification.md CASE-NFR-OS-023-01。019の期限projection CASE索引は別scopeのため変更していない。

## 先行監査への日本語補正

先行する意味監査の時点記録は書き換えない。本追補で英語の要約記述を日本語で補正し、所見を「L2意味の追加・変更」ではなく「固定親にすでにある4項目のbindingについて、L10単独negative oracleが欠けていた設計被覆」と特定する。正常trace/NFR censusが存在することと、各欠落mutationを拒否するfixtureがあることを区別する。

## 静的検証

- 新CASE ID 02o–02rの衝突なし。Functional VerificationのAC-023-02表に各1行あり、BR/BV/FR crosswalk/FR AC02/NFR/NFRVを同期した。
- 変更対象は6本文と本追補MD/JSONのみ。固定L2/L11、他親/他Stage、owner、意味、version、閾値、019索引に変更なし。
- `git diff --check`、ID存在・一意性・参照整合を静的確認する。旧runtime/test/CIおよびfixtureは実行しない。

JSON pin: `docs/governance/audits/requirements-stage/os-stage2a-parent023-binding-negative-cases-2026-10-08.json`。
