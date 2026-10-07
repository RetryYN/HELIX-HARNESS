# SECURITY Stage 1 Worker isolation owner境界の修正監査（2026-10-07）

## 対象と修正前の問題

対象は既存Stage 1の固定採択親 `HELIXSECURITY-L2-033` に対するL3/L10のowner境界とnegative oracleに限る。作業基点は `5efdf02678baebdb4be14987f4f5ab7af85bf823`。最初の作業依頼にあった「Stage 2c」は本文の既存Stage割当てと異なるため、Stage 1へ訂正した。固定親の要求、version、許可されたcredential-use、secret/task境界、dispatch意味は変更しない。Stage 2cのL2-031および他Stageは対象外。

修正前のL3/L10はOSのassignment、SECURITYのpolicy、Worker実行環境のenforcementに触れていたが、OSが所有するWorker共通実行契約、INFRASTRUCTUREが所有する実資源とeffective stateの物理適用観測、Workerが制約下で作業する主体であることの区別がCASEまで一貫していなかった。「Worker環境owner」「L2-007の適用観測owner」も具体的なowner区分を示していなかった。さらにOS/INFRASTRUCTUREの契約identity・version・stateをまとめてunknownにするfixtureでは、各field単独の不足時も個別に確認できなかった。

## 固定根拠と旧source

- 固定親は `HELIXSECURITY-L2-033`、registration `MPR-RC-HELIXSECURITY-L2-033-002`。L2/L11 source revisionは `318ec4a04abb3c1cc17111b3d939f913facd5fd3`。PO採択は `docs/governance/decisions/po-decision-2026-09-29-57candidates.md` の行92/113/124、decision全文SHA-256 `c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad`。既存L3 pinのL2-033 digestは `b486a0c44e8f21a6f8738dedeac91dcb94da335b73409b6adeaecf8fa639bf1a`、固定L11既存033 span SHA-256は `6d83abe63e3e852d58d9a9a60ae39c6b29284b6b8ab781bdb86456e479e60be0`、P0追加受入digestは `e4bed8944412cc5ca6effc0c6ddd2a314ea309aa23f36c88d6467e3c7010d0a6`。
- 固定L2-007 `security-requirements.md:130–138` は、制約要求、実行環境への受渡し、適用証拠の対応を求める。unsupported・未適用・未観測は停止してunknownを保ち、物理enforcementが欠ける場合はINFRASTRUCTURE接続へ戻す。L2-033の固定L2 spanは `security-requirements.md:455` とP0補足 `:479–485`。いずれも変更していない。
- Worker owner decision `docs/governance/decisions/worker-execution-model-po-decisions-2026-09-26.md`（全文SHA-256 `1c93bf0aadccfdf6b536a32d3923a17fbd00a1fd830850f9369b5b6d6b12efb2`）では、共通実行契約をOS、authority・権限制約・隔離条件をSECURITY、実resourceをRuntime Infrastructure、配置案をINTELLIGENCEへ割り当てる。
- 既存owner根拠は、基点 `5efdf026...` の `governance-requirements.md:538–547`（OSの共通Worker契約・assignment、全文SHA-256 `97f9158bea0d5c39821bb6538887b909d04687798c8e836d151681ebb06f9bf7`）と `infrastructure-requirements.md:287–297`（INFRASTRUCTUREの実resource/state・利用可能なresourceへの隔離適用、全文SHA-256 `569cbf7767be79b07568663026a0ab05e9fe70ea29c3636401a5db1038b8183b`）。これらはowner区分の根拠であり、具体的なcontract identity・schema・現在のeffective stateを確定しない。
- 旧source起点はasset `LEGACY-ASSET-02319C2481B9E01698D5`、`archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md:428`（`HR-FR-P2-05`、全文SHA-256 `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406`）、台帳行 `docs/governance/legacy-asset-disposition.jsonl:956`。ここからWorker descriptor、現在HEAD、authority/rule/task境界、隔離、出力の非権威性を保持する。sourceは現在の物理enforcer contractを特定しない。旧runtime・hook・test・CLI・CIは実行していない。

## 修正内容と保持境界

L3はassignment/progressionとWorker共通実行契約をOS、authority/policyとcredential/egress条件をSECURITY、物理資源とeffective stateの適用・観測をINFRASTRUCTUREへ割り当て、Workerを制約下のexecution subjectとして明示した。bindingが欠落・unknown・stale・不一致の場合のdispatch停止、理由・対象revision・不足・戻し先の結果記録も保持した。具体contract identity/version/stateが未確定ならunknownのままとし、名前やschemaを補作しない。

L10の既存SECURITY-CASE-033-01はowner誤帰属negativeを維持し、OS共通Worker契約のidentity・version・state unknownと、INFRASTRUCTURE enforcement contractのidentity・version・effective state unknownを別々の `SECURITY-CASE-033-02`〜`SECURITY-CASE-033-07` へ分けた。各fixtureでは一つのfieldだけをunknownにし、同じcontract内の他fieldと他のbinding条件は固定する。すべて該当dispatchを止め、OS共通契約不足はOS、物理適用/effective state不足はINFRASTRUCTUREへ戻す。owner誤帰属negative 1は、OSの正常なassignment／共通契約確認結果を物理適用証拠へ読み替える変異だけを対象とし、assignment・contract fields・他binding条件は正常値に固定する。

変更した本文は親033に対応するfunctional requirements 2本のみ。他の4本文、固定親、PO decision、旧判断記録、別Stageは変更しない。要求の意味・scope・owner・version・credential-use許可を変更せず、新しい承認者や承認を作らない。

## 六本文の全文SHA-256

| 本文 | 基点 `5efdf02678baebdb4be14987f4f5ab7af85bf823` | 修正後 |
|---|---|---|
| `docs/helix-security/L3-requirements/business-requirements.md` | `6f6785a248a8e2d2e05944e936b2fcac09311cab5115c3610d62c330442414d2` | `6f6785a248a8e2d2e05944e936b2fcac09311cab5115c3610d62c330442414d2` |
| `docs/helix-security/L3-requirements/functional-requirements.md` | `6e9c8bef19fb87f01c138a8e3221dec43dfab54d7bf3b2d0499ce6e62ce90bee` | `0174003377d5c8586a69128d1f67b5ae6fa073cd4c025e1dba9922e692c5f744` |
| `docs/helix-security/L3-requirements/nfr-grade.md` | `f2fc75329497b8a7d15bb6d60783c4eb6d67dd262051d005b953c321b2970055` | `f2fc75329497b8a7d15bb6d60783c4eb6d67dd262051d005b953c321b2970055` |
| `docs/helix-security/L10-verification/business-verification.md` | `a9cdc5dcdc06c46995cf0117803efd42cff5fd7cd61648d46ea91725381327e0` | `a9cdc5dcdc06c46995cf0117803efd42cff5fd7cd61648d46ea91725381327e0` |
| `docs/helix-security/L10-verification/functional-verification.md` | `332100c33a03e916e2a11672b1b8a259d8545df6c64f68b0939219a6f6d4c021` | `9f6d37be4f71dc6709c00eb0010afa56dc8f3218524f6defea8c7a13b7ca6bba` |
| `docs/helix-security/L10-verification/nfr-verification.md` | `d48a883daf59e682bef8da78c4f3f27475cc9933f282a1ad04a52d632c6e9e40` | `d48a883daf59e682bef8da78c4f3f27475cc9933f282a1ad04a52d632c6e9e40` |

## 静的検証と限界

- `SECURITY-CASE-033-01`〜`SECURITY-CASE-033-07` を同一 `SECURITY-FR-033-01` / `SECURITY-AC-033-01` 配下で追跡する表記を確認する。identity・version・stateの6変異は各々単独で、残るfieldを固定し、OS/INFRASTRUCTUREの戻し先区分を保つ。OS owner誤帰属negativeはassignmentとcontract fieldsを正常値固定し、OS確認結果の物理適用証拠への読み替えだけを変異させる。
- L3のbinding missing/unknown/stale/mismatchでの停止と、理由・対象revision・不足・owner戻し先の結果記録が維持されていることを静的に確認する。
- `git diff --check`: PASS。
- 本検証は文書の参照・対応・責務境界の静的確認のみ。fixtureは未実行で、runtime動作や実環境のenforcement/effective stateは確認していない。
- commit/pushなし。
