# HIL-12旧worker IPC contractの限定条件監査

## 基準と範囲

監査対象は旧補助contract `HR-FR-HIL-12`、対応する`HAC-HIL-12a/b/c`、`HAT-HIL-12`、および`HST-HIL-007`が参照する旧設計・consumer条件である。旧要求atomは`HIL-FR-27`、`HIL-TR-02/07/08/09/10`、`HIL-NFR-14`。24親contract全体、全旧要求の被覆、実装状態、requirements stageの閉包は判定しない。

現行照合基準は`origin/main` `d177ca92b5a1044a942d6a8c51db0962fe7e31fd`（2026-10-01）。archiveの旧source、旧testとconsumer文書を読むだけで、実行していない。新世代CIも実行していない。

| 旧source | path・位置 | SHA-256 / source ID |
|---|---|---|
| requirement atom | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:117, 179-194` | `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`; file `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb` |
| parent contract | `archive/legacy-generation-2026-09-14/root/requirements-ir/system_contracts.json:269-293` (`#/HR-FR-HIL-12`) | `LEGACY-ASSET-67761C517521603F844C`; file `2a7df673138568526e714342679ce2982238966b42f2d1967b2da92e9dbf02ab`; contract digest `fe7373f829aaac4acd8a7497c5d27454961c36270d22d2213498b979591619ad` |
| acceptance cases | `archive/legacy-generation-2026-09-14/root/requirements-ir/acceptance_cases.json:365-397` (`#/HAC-HIL-12a/b/c`) | `LEGACY-ASSET-4886CEF2A7AB5B7AA5C8`; file `4fabf58db6619ceaa5d0943fd295f5b0ec127be39f245428d203c6a3b366ae19` |
| system test | `archive/legacy-generation-2026-09-14/root/requirements-ir/system_tests.json:219-237` (`#/HAT-HIL-12`) | file `7ff2a798c120f7622d77dff2aba83992c03fb5a40cfa3b491572b4e8558c191a`; test status `designed_not_implemented` |
| assertion consumer | `archive/legacy-generation-2026-09-14/root/docs/governance/infinity-loop-system-assertion-cases.md:66-77` (`HST-CASE-007-01..12`) | `LEGACY-ASSET-7B1C7AED3AA401868455`; file `98d2f9c9721481e6b4363c0683c00b187ce789fd6a39723323eca72395102ea8` |
| L6 design consumer | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L6-function-design/python-worker-runtime.md:26-67` | `LEGACY-ASSET-FA37B89CBB3EBE4E9E8C`; file `f80c88da9c498ef1fa2b4b1ecdbb605951b52a4f435524cb494a5c46382f7d14` |
| test consumer | `archive/legacy-generation-2026-09-14/root/tests/infinity-loop-strict-design-contract.test.ts:297-320` | `LEGACY-ASSET-E4984136A19ADCADF97D`; file `efb2d92201285f249022d3929e4893efc770fbc5fecedc1961419ed6bddaed94` |

旧contractはNode supervisorがPython workerをversioned JSON Lines IPCで管理し、互換protocol・deadline/lease・authority mapのもとでterminal receiptを一つ記録し、schema検証済みresultだけをNode authorityでtransaction commitする要求である。HACは正常result一回commit、IPC異常時のterminal化とpartial result 0、cancel/timeout後のlate resultおよびdirect write拒否を分担する。旧HST設計は不正JSON、oversize、sequence欠落、timeout、cancel、crash、backpressure、親process消失、失効後result等を個別fixtureにする。L6/L7の18 assertionsとAPI bindingは設計上の期待値であり、実行済み証拠ではない。旧testはそのsource/設計所有関係の検査を記すだけで、本監査では起動していない。

## 現行authorityとL2/L11照合

現行OS L2/L11の採否は見出しmetadataではなく、`docs/governance/decisions/helix-os-requirements-po-decision-2026-09-28.md`と対象節で読む。同decisionは固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`のOS L2/L11本文に合意し、OS-L2-018/019/020を含む014〜029を明示採択した。現行mainでも対象6節のsection digestは固定revisionと一致する。

| 現行要求対 | 固定L2 section SHA-256 | 固定L11 section SHA-256 | HIL-12との関係・限界 |
|---|---|---|---|
| `HELIXOS-L2-018` | `4ca189ed491490e2ed1ee75095b64d2e294319e6132d4595d631fcd4ba8bc408` | `77e8ef58e9774503379bb3a84a0218fa29dbad536e142122c7bee8e8bc0b1d53` | Worker assignment/attempt、実行停止、成果回収、交代時のhandoff、独立reviewとlease/scopeの追跡をOS運転責務として採択。Node/Python、JSONL protocol、具体supervisor/schemaやworker実装を採択したものではない。 |
| `HELIXOS-L2-019` | `9362a64eef0f04968a8b1e89fde0027a145d5ab5c6aa9a6423d6e05e19ed447a` | `9e17211bf2f7f54a58e2be30e23335954d94e184573912ed4f3ac92246838351` | provenance、event/checkpoint、stale/拒否/未実行と成功の区別、再構築・継続を採択。旧IPC envelopeやprojection schemaそのもののsuccessorとはしない。 |
| `HELIXOS-L2-020` | `fa62debc978fba6f5ab4146c0d3515a7ce7b5b4df3e054bd953b0f55e2f8878a` | `a9e5f9430836d409a7885b548fa8bff7a874184c024e74e28627cb9d7c59c88c` | HARNESSが定めた検証義務の選択・隔離実行・結果回収・再開をOSが運転し、success/fail/denied/skipped/interrupted/staleを区別する。旧worker contract全体、旧schema又はPython方式の受入を意味しない。 |

authority boundaryは採択済み`HELIXSECURITY-L2-008`とその対が持つoperation単位のallow/deny/constrainである（`docs/helix-security/L2-requirements/security-requirements.md:140-148`、L11 `security-acceptance.md:32`）。OSのassignment、実行環境、result receiptは認可正本を代行しない。HARNESSはverification/oracleの意味を持ち、OSは実行を運転する。これらの分担から旧Node/Python通信方式を必須技術として導かない。

後続判断は、採否範囲を明示して読む。2026-09-29の55候補受領資料は判断記録そのものではなく、その後の57候補decisionは同記録の列挙した57 identityに限定される。2026-09-30 live26 decisionも索引が固定した26 identityに限定される。いずれにも`HIL-12`またはOS-L2-018/019/020をHIL-12のformal successorへ結ぶ採択行はない。したがって、後続の候補採択・保留をHIL-12へ転用せず、2026-09-28の既決pairの採択状態と旧source holdingを分けて記録する。

## source carry-forwardと被覆判定

現行[旧補助contract再照合](legacy-auxiliary-contract-refinement-recheck-2026-09-28.md)のHIL-12行（45行目）は、OS-L2-018/019/020とSECURITY-L2-008を近接責務として照合し、status/receipt/provenance/中断・失敗と実行権限の分離は再導出可能、JSONL・Node/Python・transaction方式は未採択技術設計と整理する。本監査はそこから旧HAT/HSTと現行採択pairのrevision関係・source holdingをsource単位で固定する。旧要件全体の完全なatom inventoryや正式な責務移管の完了は主張しない。

| preserved source identity | carry source item | 現在のcarry state | successor assignment |
|---|---|---|---|
| `HR-FR-HIL-12` | `REQSRC-SUP-00619` | `preserved_pending_rehome`, `relation_status: unmapped` | `[]` |
| `HAC-HIL-12a/b/c` | `REQSRC-SUP-00555/00556/00557` | `preserved_pending_rehome`, `relation_status: unmapped` | 各`[]` |
| `HAT-HIL-12` | `REQSRC-SUP-00643` | `preserved_pending_rehome`, `relation_status: unmapped` | `[]` |

この照合から結論できることは、現行採択pairが一般的なworker execution、evidence continuity、CI運転の近接条件を持つこと、旧HIL-12が要求した技術名・protocol詳細が現行L2/L11の必須技術ではないこと、旧補助sourceとHAT/HACがcarry-forward上は正式successor未割当で保持されることまでである。`HR-FR-HIL-12`の一括successor割当、旧HAC/HATの合成受入、個別worker failure oracleのcoverage、implementation/execution closureは証明されない。特に`HIL-TR-02/07/08/09/10`と旧NFRの個別atomすべてについてformal successor mappingが閉じたとは主張しない。

旧sourceから保つ意味は、期限・lease・権限に拘束された実行、未検証・異常・遅延resultを成功へ昇格しないこと、実行主体が権威ある記録を不正に書き換えないこと、失敗状態と証拠を区別することである。現行の責務分担へ再導出する場合もこの意味を弱めない。変更されるのは、旧Node/Python/JSONL/schema/transaction設計を新世代の採択要件として移植せず、worker実行・検証義務・authorityを現行ownerへ分ける点であり、理由は固定済み現行L2/L11と機構境界である。旧asset ledger上の該当sourceはhistorical/snapshotとして保持し、実行・copy・retireを行わない。

## 静的確認

- 旧source JSONのarchive bytesとgovernance source snapshotのfile digestが一致することを上記SHA-256で照合した。
- 現行OS-L2/L11-018/019/020のsection digestを2026-09-28判断対象revisionと現行mainで比較し、一致を確認した。
- carry-forward JSONLの5件（parent contract、HAC 3件、HAT 1件）は、記録したsource item ID、未解決state、空successor集合と一致する。
- 後続57候補およびlive26 decisionの明示対象範囲に、HIL-12 successorを追加するidentityがないことを照合した。
- legacy runtime/test/CI、新世代CI、実装を実行していない。これはsource-status監査であり、動作検証ではない。
