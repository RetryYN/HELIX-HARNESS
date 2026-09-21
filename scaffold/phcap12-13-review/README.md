# PHCAP-12／13 Review convergence・Merge admission research premise

これは PHCAP-12（Review convergence）と PHCAP-13（Merge admission）の四製品・phase・旧asset実体を、`origin/main` の固定時点で照合する静的 research premise candidate である。`authority_effect: none`、`new_build_allowed: false` 相当の境界を維持し、要求採否、successor、owner、正式実装、L3／L10 freeze、受入、merge authorityを生成しない。

基準は `origin/main` の `fbeee47920ed8b2992ae123b00c224ff88987c50`（2026-09-22）である。phase inventory は PHCAP-12 を `scaffold_operating`／旧要約 `implemented_with_tests`／L9、移行 `degraded_to_operating_contract_and_gui_scaffold` とし、PHCAP-13 を `operating_contract_only`／旧要約 `implemented_with_draft_system_test_design`／L10、移行 `degraded_to_manual_operating_contract` と記録する。これは phase-level の歴史要約であり、現行実装・実行pass・受入を意味しない。

代表旧assetは9件である。PHCAP-12は独立review、cross-review、receipt／PLAN binding、review lane closure、L9 test design、binding test sourceを、PHCAP-13はmerge admission requirement、system test design、admission implementation sourceを対象にした。9件すべてで台帳は `disposition: unresolved`、`implementation_status: unknown`、`consumer_refs: []`、`decision_record_ref: null`、phase分類は旧実行false／consumer closure pendingである。archive sourceはbytes、line count、SHA-256、16個のexact anchorを静的に照合し、旧runtime／test／CI／hook／adapterは実行していない。

旧sourceに記載された receipt、CI、DB、consumer、failure／negative boundary、`confirmed`、`approve`、test case、planは歴史的候補として保持する。これらを現行実装、oracle、pass、read-after、consumer closure、authorityへ昇格させない。PHCAP-12のcandidate asset分母は303件、PHCAP-13は61件、両方にまたがる候補は20件、いずれかは344件であり、代表9件以外は残差である。

四製品の候補境界は次のとおりである。

- **HELIX-HARNESS** は V-model、review／evidence vocabulary、merge-facing obligationの契約候補を持つ。正式receipt、CI、DB convergence、ownerは未確定である。
- **HELIX-OS** は project群のreview handoff、progression、receipt／finding、merge admissionを管理する候補を持つ。SCF-B-0003はGUI通知の仮組みであり、独立review、canonical receipt、CI、DB convergence、merge authorityを証明しない。
- **HELIX-Web** は利用者向け結果表示・操作の隣接境界候補である。PHCAP-12/13のdirect evidence、review／merge owner、実装、受入はunknownであり、ref欠落から未実装を推定しない。
- **HELIX-Web-OS** は tenant／job／service runtime と bounded observation exportの隣接境界候補である。credential、tenant state、writer、merge authorityはOSと共有しない。

HARNESS→OSのreview contract／progression、OS→HARNESSのreceipt feedback、OS→Webのscoped result、Web→Web-OSのbounded service request、Web-OS→OSのpermitted observation exportを candidate connection として分離した。全edgeは `authority_effect: none`、実装unknown、consumer pendingであり、単体・接続・構成体を相互に完了へ変換しない。

`inventory.json` は phase record、9 assetのledger／phase snapshot、source／anchor digest、12 current ref、4 product unit、5 candidate edge、candidate asset分母、SCF-B-0003のscaffold-only context、failure／consumer残差を保持する。`validate.py` は台帳・bytes・exact span・current ref・四製品境界・unit capability／transition・edge meaning・phase join interpretation・分母・unknownを静的に検査し、`selfcheck.py` は authority、実装、意味反転、Web direct evidence、decision、failure、consumer、phase join、digest、未知keyの41件の陰性例を検査する。

```text
python3 -B scaffold/phcap12-13-review/generate.py
python3 -B scaffold/phcap12-13-review/validate.py
python3 -B scaffold/phcap12-13-review/selfcheck.py
python3 -B scaffold/tools/scfctl.py validate
python3 -B scaffold/tools/scfctl.py stale
python3 -B scaffold/tools/scfctl.py residuals
python3 -B scaffold/tools/scfctl.py selftest
git diff --check
```

これらは候補の静的整合だけを示し、正式設計・実装・受入・mergeを示さない。`origin/main` が変わった場合は停止してrebaselineする。Bindingは未使用の `SCF-B-0046` で、正式なreview／merge contractが承認・freezeされたときは、role／義務／consumer／oracle／negative caseを移管して `check-replacement` → `retire` を行う。
