# v1.3 §4.11 安全capability broker・physical identity 19条件の個別監査

- 対象revision: `c6e36f73616d6362ef7e09b9ab04ea22e036e55b`
- 固定比較revision: `f6dad2a33e24f000b87d7f09b8d40288257e74cc`
- 後発candidate pair decision source: `318ec4a04abb3c1cc17111b3d939f913facd5fd3`
- 旧source SHA-256: `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406`
- authority effect: `none`。採択、successor割当て、条件閉包、runtime実装・L11実行は主張しない。

## 対象選定と除外screen

queue `docs/governance/audits/requirements-stage/v13-condition-closure-work-queue-2026-09-30.json`（SHA-256 `a61ec098a6bd714fcbbb706d0d9afb4e7f2777b114bf23c8056fc130e30f60d9`、basis `2bf484b1a84af346feaf8cf7b72e59f3889e6333`）は303条件中255件をprimary residual（partial 84＋unresolved 171）としている。§4.11は19件すべてunresolved/primary_residualで、focused audit参照は各0件。baseline全件semantic auditには未解決recordがあるが、条件別f6 pair比較との混同はしない。

既監査のREQSRC-SUP除外: #2394 `00127–00131`、#2401 `00134,00135,00137–00141`、#2402 `00118,00120–00124,00132`、#2406 `00227–00233,00239,00259–00267`、#2407 `00225,00242–00246,00248–00249,00251,00255–00256`。#2396はqueue refreshで個別condition auditではない。今回のIDはこれらと重ならない。

| REQSRC-SUP ID | 旧source物理行 | source line SHA-256 | queue status |
|---|---:|---|---|
| `REQSRC-SUP-00343` | 445 | `ecfd89d3175c416c80404d9bfdf94652dfa93a8250893171ce1e8856e2ed3ca5` | `unresolved` / `unresolved_for_closure_work` |
| `REQSRC-SUP-00344` | 446 | `a1c2838673f915ee33fc8ce2026200039c0068c3a947eb3b1f13ec259981ea65` | `unresolved` / `unresolved_for_closure_work` |
| `REQSRC-SUP-00345` | 447 | `6204b068c301ffd51bf9af60f74b40f993572be0c9356edc0687c552776d677a` | `unresolved` / `unresolved_for_closure_work` |
| `REQSRC-SUP-00359` | 464 | `3721070ce3e925e8a21621f17e1f6ba354f421b67b764c023f416237f1ceaa20` | `unresolved` / `unresolved_for_closure_work` |
| `REQSRC-SUP-00360` | 465 | `0b4d1222817c8782b564016a9a2dcc45d8735aec3ce4d00eef35d90f6fe6653d` | `unresolved` / `unresolved_for_closure_work` |
| `REQSRC-SUP-00361` | 466 | `d627be7295a9d10b4e90da92700145f7bd8d2f522a2e6ea6a867e4055b8ccda8` | `unresolved` / `unresolved_for_closure_work` |
| `REQSRC-SUP-00362` | 467 | `61ed641d6b2140bd0a21e7cb439a213e057307ef8fc783d3ae9cf583fe355c85` | `unresolved` / `unresolved_for_closure_work` |
| `REQSRC-SUP-00363` | 468 | `97caefe790e5d17568d2d47649e4da91ad98cefc6da460d9df7a48360716c3eb` | `unresolved` / `unresolved_for_closure_work` |
| `REQSRC-SUP-00364` | 469 | `33e1516068f295831de97db481703edcbd649c3dd20fb91a868a9e0ae576829b` | `unresolved` / `unresolved_for_closure_work` |
| `REQSRC-SUP-00365` | 470 | `69b561571ffa2f6b0f9dda7bb81cd7d92854e2a085f2f267805a8f21cc65df00` | `unresolved` / `unresolved_for_closure_work` |
| `REQSRC-SUP-00367` | 474 | `bf243a9ec3038e51778ca94659bdab2ba9a16bf89c4e297bea3c39f21e0e3e34` | `unresolved` / `unresolved_for_closure_work` |
| `REQSRC-SUP-00369` | 476 | `77f607f5a88900faf140ff6ab33ae5a0876e1dec9cf8ad9d9739a198596e7a07` | `unresolved` / `unresolved_for_closure_work` |
| `REQSRC-SUP-00370` | 477 | `0dda8fd351fb25d6bac895d9096a27043740d4df7eccdb240b1de6e0961cefaf` | `unresolved` / `unresolved_for_closure_work` |
| `REQSRC-SUP-00371` | 479 | `b2744b91b963d600d8d7e99ce6511edf6b82cd06eb828dd77e9587124b662c4d` | `unresolved` / `unresolved_for_closure_work` |
| `REQSRC-SUP-00374` | 483 | `b74ce53ad69fed45ae0043a3eb964d83d48fa3f650f8703221ec5837b7252406` | `unresolved` / `unresolved_for_closure_work` |
| `REQSRC-SUP-00378` | 488 | `6c1fffd45916acf67ec3d93ce2fd43911d1e7f478530bd18673d34db69c9f9c1` | `unresolved` / `unresolved_for_closure_work` |
| `REQSRC-SUP-00387` | 501 | `2593d62f238cc9f993a822ccc36ec58e5443636bc004e54ab2edc2d66b1169db` | `unresolved` / `unresolved_for_closure_work` |
| `REQSRC-SUP-00388` | 502 | `eaf0ab21ea182d07cee7b89655535cb6376a40b17bc779aaea0a23cd9ef59569` | `unresolved` / `unresolved_for_closure_work` |
| `REQSRC-SUP-00389` | 503 | `3b6bc916572843b8c721e63879e9db393bf0c086f00755ba2f3e57166014189e` | `unresolved` / `unresolved_for_closure_work` |

旧consumerも参照した。L3 broker authorityにはoperation/target/provenance/data-sink/approval/rollback/runtimeをANDで判定する境界（lines 140–176）、SEC-AC設計には7 FR/ACと10 oracle（lines 18–30）、L6/L8 physical identity設計にはliteral、realpath/device/inode、mount/link、TOCTOUとfail code例（L6 lines 21–45、L8 lines 17–31）がある。PLAN-L3-62はrequirements authorityと5 atomic implementation sliceを分離し（lines 118–142）、PLAN-L7-601はphysical identityを後続brokerが使うvalue objectとして分離する（lines 102–115）。これらの旧test/runtimeは実行していない。参照path・file hash・該当行hashはJSONへ固定した。

### source・旧consumerの参照先

| 文書 | 固定SHA-256 | 参照行 |
|---|---|---:|
| [旧v1.3 source](../../../../archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md) | `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406` | 443–503 |
| [旧L3 broker authority](../../../../archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/security-capability-broker-authority.md) | `161722d80e7b0199310b1401992c3737bef2014b19b2776c0df4b15f833fe0a7` | 140–176 |
| [旧SEC-AC設計](../../../../archive/legacy-generation-2026-09-14/root/docs/test-design/helix/security-capability-broker-acceptance.md) | `b6f926f39cd824fc102cf82bd1625d14d298f666c931786fdc6c8117d06af1c4` | 18–30 |
| [旧L6 physical identity](../../../../archive/legacy-generation-2026-09-14/root/docs/design/helix/L6-function-design/physical-filesystem-identity.md) | `0efcda95d2d594441f78a1564b9d4f90875296e91be2a6209540107406703a4c` | 21–45 |
| [旧L8 physical identity oracle設計](../../../../archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L8-physical-filesystem-identity-unit-test-design.md) | `c9bd365178db38d40d3d0f9f6d12fb1c45e837d96f93b4452ea003fd8f9f94ea` | 17–31 |
| [旧PLAN-L3-62](../../../../archive/legacy-generation-2026-09-14/root/docs/plans/PLAN-L3-62-security-capability-broker-authority.md) | `ab38056d506369c383dab4ade8ad8de0719c273216cecdbf002ee5756196d3af` | 118–142 |
| [旧PLAN-L7-601](../../../../archive/legacy-generation-2026-09-14/root/docs/plans/PLAN-L7-601-physical-filesystem-identity.md) | `b861bd3471702f182fb97406bca7e6ef882915628e1abcc031d411fab8a765e4` | 102–115 |

## 固定f6 SECURITY L2/L11比較

f6 SECURITY L2 file SHA `027e6d25c8665e8aca006f23660c4ecfcc0ec0a92946be871e935ec5aa7a774c`、L11 file SHA `25635649f87c0e805a5d1cf35b5c1201144c851533808770cd4f9ac6ba067c01`。PO decision record `docs/governance/decisions/helix-security-requirements-po-decision-2026-09-28.md`（SHA `7ad58a3f7d7dd68806e6eeb2c4b6ec97f9b8f2145ae9aae7969f1eedf4a7baff`）はf6 fixed candidate bytesの対象を記録する。MPR登録状態・authority effectとは別軸。JSONに11 pairそれぞれのL2一覧行、detail heading、L11受入行、decision table rowのline/hashを収録した。

| 固定pair | L2一覧/節heading | L11受入row | 比較軸 |
|---|---|---:|---|
| `HELIXSECURITY-L2-005` | 43 / 110 | 29 | credential secret境界 |
| `HELIXSECURITY-L2-006` | 44 / 120 | 30 | network/egress先・data class・expiry |
| `HELIXSECURITY-L2-007` | 45 / 130 | 31 | Worker制約適用/host fallback |
| `HELIXSECURITY-L2-008` | 46 / 140 | 32 | operation別authority tuple |
| `HELIXSECURITY-L2-009` | 47 / 150 | 33 | revoke/quarantineのfailure伝播 |
| `HELIXSECURITY-L2-011` | 49 / 170 | 35 | capability drift |
| `HELIXSECURITY-L2-016` | 54 / 220 | 40 | classificationとunknown |
| `HELIXSECURITY-L2-020` | 58 / 260 | 44 | 決定的Guard/Bot責務 |
| `HELIXSECURITY-L2-022` | 60 / 282 | 46 | request→authority→OS assignment→Worker handoff |
| `HELIXSECURITY-L2-023` | 61 / 292 | 47 | update admission→HARNESS verification→OS promotion分離 |
| `HELIXSECURITY-L2-024` | 62 / 302 | 48 | policy・実resource・Worker物理強制のreceipt接続 |

## 後発57＋11 decision全identity/status screen

JSONには57件＋11件の全entryとstatus、decision row/hashを保持する（計68 screen entry、overlap 2、unique 66）。後発57候補decisionはadopted 42／conditionally_adopted 11／held 4。後続11候補decisionはtable adopted 10に加えscreen上not_adopted_current_revision 1。近接するSECURITY-029..034は全件adoptedだが、それぞれの候補scopeだけに効く。

### 57候補decision: `docs/governance/decisions/po-decision-2026-09-29-57candidates.md`（SHA `c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad`）

| identity | status | MPR |
|---|---|---|
| `HARNESS-L2-034` | `adopted` | `MPR-RC-HARNESS-L2-034-003` |
| `HARNESS-L2-035` | `adopted` | `MPR-RC-HARNESS-L2-035-002` |
| `HARNESS-L2-036` | `adopted` | `MPR-RC-HARNESS-L2-036-002` |
| `HARNESS-L2-037` | `adopted` | `MPR-RC-HARNESS-L2-037-002` |
| `HARNESS-L2-038` | `adopted` | `MPR-RC-HARNESS-L2-038-001` |
| `HARNESS-L2-039` | `adopted` | `MPR-RC-HARNESS-L2-039-003` |
| `HARNESS-L2-040` | `adopted` | `MPR-RC-HARNESS-L2-040-002` |
| `HARNESS-L2-041` | `adopted` | `MPR-RC-HARNESS-L2-041-002` |
| `HARNESS-L2-042` | `adopted` | `MPR-RC-HARNESS-L2-042-001` |
| `HARNESS-L2-043` | `conditionally_adopted` | `MPR-RC-HARNESS-L2-043-002` |
| `HARNESS-L2-044` | `conditionally_adopted` | `MPR-RC-HARNESS-L2-044-002` |
| `HARNESS-L2-045` | `held` | `MPR-RC-HARNESS-L2-045-001` |
| `HARNESS-L2-046` | `adopted` | `MPR-RC-HARNESS-L2-046-001` |
| `HARNESS-L2-047` | `conditionally_adopted` | `MPR-RC-HARNESS-L2-047-001` |
| `HELIXOS-L2-030` | `held` | `MPR-RC-HELIXOS-L2-030-003` |
| `HELIXOS-L2-031` | `adopted` | `MPR-RC-HELIXOS-L2-031-001` |
| `HELIXOS-L2-032` | `adopted` | `MPR-RC-HELIXOS-L2-032-001` |
| `HELIXOS-L2-033` | `adopted` | `MPR-RC-HELIXOS-L2-033-001` |
| `HELIXOS-L2-034` | `adopted` | `MPR-RC-HELIXOS-L2-034-002` |
| `HELIXOS-L2-035` | `adopted` | `MPR-RC-HELIXOS-L2-035-001` |
| `HELIXOS-L2-036` | `adopted` | `MPR-RC-HELIXOS-L2-036-001` |
| `HELIXOS-L2-037` | `adopted` | `MPR-RC-HELIXOS-L2-037-001` |
| `HELIXOS-L2-038` | `adopted` | `MPR-RC-HELIXOS-L2-038-001` |
| `HELIXOS-L2-039` | `held` | `MPR-RC-HELIXOS-L2-039-001` |
| `HELIXOS-L2-040` | `adopted` | `MPR-RC-HELIXOS-L2-040-001` |
| `HELIXOS-L2-041` | `adopted` | `MPR-RC-HELIXOS-L2-041-001` |
| `HELIXOS-L2-042` | `adopted` | `MPR-RC-HELIXOS-L2-042-001` |
| `HELIXOS-L2-043` | `adopted` | `MPR-RC-HELIXOS-L2-043-002` |
| `HELIXOS-L2-044` | `adopted` | `MPR-RC-HELIXOS-L2-044-001` |
| `HELIXOS-L2-045` | `held` | `MPR-RC-HELIXOS-L2-045-001` |
| `HELIXOS-L2-046` | `adopted` | `MPR-RC-HELIXOS-L2-046-001` |
| `HELIXOS-L2-047` | `adopted` | `MPR-RC-HELIXOS-L2-047-004` |
| `HELIXOS-L2-048` | `adopted` | `MPR-RC-HELIXOS-L2-048-001` |
| `HELIXOS-L2-049` | `conditionally_adopted` | `MPR-RC-HELIXOS-L2-049-003` |
| `HELIXOS-L2-050` | `conditionally_adopted` | `MPR-RC-HELIXOS-L2-050-003` |
| `HELIXOS-L2-051` | `conditionally_adopted` | `MPR-RC-HELIXOS-L2-051-002` |
| `HELIXOS-L2-052` | `adopted` | `MPR-RC-HELIXOS-L2-052-001` |
| `HELIXLABO-L2-061` | `adopted` | `MPR-RC-HELIXLABO-L2-061-001` |
| `HELIXLABO-L2-062` | `adopted` | `MPR-RC-HELIXLABO-L2-062-001` |
| `HELIXLABO-L2-063` | `adopted` | `MPR-RC-HELIXLABO-L2-063-001` |
| `HELIXLABO-L2-064` | `adopted` | `MPR-RC-HELIXLABO-L2-064-002` |
| `HELIXLABO-L2-065` | `conditionally_adopted` | `MPR-RC-HELIXLABO-L2-065-001` |
| `HELIXLABO-L2-066` | `adopted` | `MPR-RC-HELIXLABO-L2-066-001` |
| `HELIXLABO-L2-067` | `conditionally_adopted` | `MPR-RC-HELIXLABO-L2-067-001` |
| `HELIXLABO-L2-068` | `adopted` | `MPR-RC-HELIXLABO-L2-068-001` |
| `HELIXLABO-L2-069` | `adopted` | `MPR-RC-HELIXLABO-L2-069-001` |
| `HELIXINTELLIGENCE-L2-072` | `conditionally_adopted` | `MPR-RC-HELIXINTELLIGENCE-L2-072-004` |
| `HELIXINTELLIGENCE-L2-073` | `adopted` | `MPR-RC-HELIXINTELLIGENCE-L2-073-002` |
| `HELIXINTELLIGENCE-L2-074` | `adopted` | `MPR-RC-HELIXINTELLIGENCE-L2-074-002` |
| `HELIXSECURITY-L2-029` | `adopted` | `MPR-RC-HELIXSECURITY-L2-029-002` |
| `HELIXSECURITY-L2-030` | `adopted` | `MPR-RC-HELIXSECURITY-L2-030-001` |
| `HELIXSECURITY-L2-031` | `adopted` | `MPR-RC-HELIXSECURITY-L2-031-001` |
| `HELIXSECURITY-L2-032` | `adopted` | `MPR-RC-HELIXSECURITY-L2-032-001` |
| `HELIXSECURITY-L2-033` | `adopted` | `MPR-RC-HELIXSECURITY-L2-033-002` |
| `HELIXSECURITY-L2-034` | `adopted` | `MPR-RC-HELIXSECURITY-L2-034-001` |
| `HELIXCONNECT-L2-008` | `conditionally_adopted` | `MPR-RC-HELIXCONNECT-L2-008-002` |
| `HELIXCONNECT-L2-009` | `conditionally_adopted` | `MPR-RC-HELIXCONNECT-L2-009-002` |

### 後続11候補decision: `docs/governance/decisions/po-decision-2026-09-29-11candidates.md`（SHA `6e10127a65a775b0a7554ccb359abdfc1221d17a2c48fb79321d59369df127c5`）

| identity | status | MPR |
|---|---|---|
| `HARNESS-L2-041` | `adopted` | `MPR-RC-HARNESS-L2-041-003` |
| `HARNESS-L2-048` | `adopted` | `MPR-RC-HARNESS-L2-048-001` |
| `HELIXBRAIN-L2-031` | `adopted` | `MPR-RC-HELIXBRAIN-L2-031-001` |
| `HARNESS-L2-050` | `adopted` | `MPR-RC-HARNESS-L2-050-001` |
| `HARNESS-L2-051` | `adopted` | `MPR-RC-HARNESS-L2-051-001` |
| `HARNESS-L2-052` | `adopted` | `MPR-RC-HARNESS-L2-052-001` |
| `HARNESS-L2-053` | `adopted` | `MPR-RC-HARNESS-L2-053-001` |
| `HARNESS-L2-054` | `adopted` | `MPR-RC-HARNESS-L2-054-001` |
| `HELIXOS-L2-038` | `adopted` | `MPR-RC-HELIXOS-L2-038-002` |
| `HELIXOS-L2-053` | `adopted` | `MPR-RC-HELIXOS-L2-053-001` |
| `HARNESS-L2-049` | `not_adopted_current_revision` | `MPR-RC-HARNESS-L2-049-002` |

近接SECURITY pairs: 029は第三者runtimeの委譲data/訓練、030はagentic自動適用範囲、031は主Worker外追加runtimeのproposal-only/隔離、032はWorker runtimeのpermanent bypass deny、033は外部AI Workerのcontext binding/出力非権威性、034はMCP profile別capability/probe。これらはbroker-wide typed tuple、physical filesystem identity、SEC-AC-001..010全体の実装・受入証拠を作らない。決定表ではstatus adoptedでもMPR登録/authorityとruntime実装は別。

## 個別条件比較

### REQSRC-SUP-00343 — 旧source line 445

- 原文: 安全境界は単一のrisk値、禁止command一覧、または`network_allowed` booleanへ畳み込まない。（SHA `ecfd89d3175c416c80404d9bfdf94652dfa93a8250893171ce1e8856e2ed3ca5`）
- 意味: 単一risk値、禁止command一覧、network_allowed booleanへ安全境界を縮約しない。
- queue/baseline: `unresolved` / `unresolved_for_closure_work`、個別audit ref 0件。
- 近い固定pairの保持点: SECURITY-008のoperation別authority、011のcapability drift、016の分類unknown、020の決定的Guardは、軸を混ぜずdeny/unknownを保つ方向で関連する。採択SECURITY-033はWorker context bindingだが、汎用brokerのtuple定義ではない。
- 変更・未継承: 現行f6/後発pairは関連する部分条件を分担するが、旧sourceの「単一risk値、禁止command一覧、network_allowed booleanへ安全境界を縮約しない。」全体を同等の採択successorとして明示していない。差分は次の残差に残る。
- 後発採択の限定効果: SECURITY-032の採択はWorker runtimeのbypass deny順序、SECURITY-033は外部Worker開始contextに限定。どちらもbroker全体の型分離を定義しない。
- 残差: 固定pairは個別capability等を分担し、旧sourceの「risk値等へ畳み込まない」境界を単一L2で置き換えていない。
- 反例: 能力・target・data/sink・impactをbool/risk scoreひとつにまとめ、network_allowed=trueでunknown targetを通す。
- 数値・例外境界: 数値スコアや重み付けは指定されない。禁止対象は少なくとも単一risk値、禁止command一覧だけ、network_allowed booleanへの還元。
- 判定: `unresolved`。このauditによるsuccessor・採択・closureなし。

### REQSRC-SUP-00344 — 旧source line 446

- 原文: 次のtyped tupleを同一execution ticketとreceiptへ束縛し、未知・欠落・軸混同・複数候補は推測せず（SHA `a1c2838673f915ee33fc8ce2026200039c0068c3a947eb3b1f13ec259981ea65`）
- 意味: operation capability、target identity、execution provenance、data classification、sink authority、impact profile、approval binding、postcondition/rollback/expiryを同一ticket・receiptに束縛する。
- queue/baseline: `unresolved` / `unresolved_for_closure_work`、個別audit ref 0件。
- 近い固定pairの保持点: SECURITY-008はactor/target/operation/revision/environment/scope/expiryを、022はoperation request→OS assignment→Worker scope identityを別々に追える。SECURITY-033はWorker実行contextを束縛し、変更時の再照合を扱う。
- 変更・未継承: 現行f6/後発pairは関連する部分条件を分担するが、旧sourceの「operation capability、target identity、execution provenance、data classification、sink authority、impact profile、approval binding、postcondition/rollback/expiryを同一ticket・receiptに束縛する。」全体を同等の採択successorとして明示していない。差分は次の残差に残る。
- 後発採択の限定効果: SECURITY-033は外部AI Workerの開始context bindingに近いが、target/provenance/data/sink/impact/approval/postcondition等の全tupleを同一ticket/receiptへ束縛しない。
- 残差: 固定pair/後発pairに、旧8区分（末尾はpostcondition・rollback・expiry）をすべて同一ticket/receiptへ結ぶexact typed tupleはない。
- 反例: approvalのtargetは一致するがprovenanceやsinkが別ticket、又は複数の物理target候補から暗黙選択して実行。
- 数値・例外境界: 8項目グループを同じticket/receiptへ束縛。unknown・missing・軸混同・複数候補は次行の`unresolved`へ送る。
- 判定: `unresolved`。このauditによるsuccessor・採択・closureなし。

### REQSRC-SUP-00345 — 旧source line 447

- 原文: `unresolved`としてfail-closeする。（SHA `6204b068c301ffd51bf9af60f74b40f993572be0c9356edc0687c552776d677a`）
- 意味: unknown、missing、軸混同、複数候補を推測せず`unresolved`としてfail-closeする。
- queue/baseline: `unresolved` / `unresolved_for_closure_work`、個別audit ref 0件。
- 近い固定pairの保持点: SECURITY-008の欠落/expiry/drift拒否、009のunknown伝播、020の決定的Guard、023のunknown段階停止はfailure boundaryを保つ。SECURITY-031/032/034の限定candidateもそれぞれ追加runtime・bypass・MCP scopeでdeny/unknownを扱う。
- 変更・未継承: 現行f6/後発pairは関連する部分条件を分担するが、旧sourceの「unknown、missing、軸混同、複数候補を推測せず`unresolved`としてfail-closeする。」全体を同等の採択successorとして明示していない。差分は次の残差に残る。
- 後発採択の限定効果: SECURITY-031/032/034は追加runtime隔離・Worker bypass deny・MCP profileの各scope内でdeny条件を持つ。scope外のgeneric resolverのmissing/unknown/multiple処理は残る。
- 残差: 後発pairはそのscopeに限定され、broker全体のtyped resolverが全軸のunknown/複数値を一律拒否する統合条件とは別。
- 反例: brokerが複数physical targetを選択順で1件に決める、欠けたimpactを低値として継続する。
- 数値・例外境界: 4種の不確実状態（unknown、missing、axis mix、multiple candidates）を明記。数値閾値なし。
- 判定: `unresolved`。このauditによるsuccessor・採択・closureなし。

### REQSRC-SUP-00359 — 旧source line 464

- 原文: | `SEC-FR-CAP-001` | operation capabilityとimpactを独立typed fieldで保持し、未知・混同・欠落を拒否する | `SEC-AC-CAP-001`: 軸混同・未知・欠落をreason付き`unresolved`で拒否する |（SHA `3721070ce3e925e8a21621f17e1f6ba354f421b67b764c023f416237f1ceaa20`）
- 意味: SEC-FR-CAP-001 / SEC-AC-CAP-001: operation capabilityとimpactを独立typed fieldとし、未知・混同・欠落をreason付き`unresolved`で拒否する。
- queue/baseline: `unresolved` / `unresolved_for_closure_work`、個別audit ref 0件。
- 近い固定pairの保持点: SECURITY-008はread/write/execute/network/install/delete/merge/release/deploy等ごとにoperation別authorityを要求。011は同fileでも能力差分を検出。SECURITY-033はWorker開始contextを束縛する。
- 変更・未継承: 現行f6/後発pairは関連する部分条件を分担するが、旧sourceの「SEC-FR-CAP-001 / SEC-AC-CAP-001: operation capabilityとimpactを独立typed fieldとし、未知・混同・欠落をreason付き`unresolved`で拒否する。」全体を同等の採択successorとして明示していない。差分は次の残差に残る。
- 後発採択の限定効果: SECURITY-033はWorker dispatch context binding、SECURITY-031は追加runtime-only scope。汎用operation capabilityとimpactの独立typed axisを置き換えない。
- 残差: 固定pairは操作authorityやcapability driftを扱うが、operation capabilityとimpactを独立型で保つ全operation matrixとこのACのreason付き失敗を一括照合しない。
- 反例: read-onlyというpath名/ hash一致だけでwrite+shell+network capabilityを不変扱いする。
- 数値・例外境界: SEC-FR/ACの7対のうちpair 001。軸数の閾値以外のrisk scoreは設定なし。
- 判定: `unresolved`。このauditによるsuccessor・採択・closureなし。

### REQSRC-SUP-00360 — 旧source line 465

- 原文: | `SEC-FR-CAP-002` | lexical/physical target、target set、TOCTOU identityを実行直前に検証する | `SEC-AC-CAP-002`: exact physical identityとtarget setが一致するliteralだけを許可候補とし、symlink、junction、mount、hardlink、repo外、glob、TOCTOU変更を拒否する |（SHA `0b4d1222817c8782b564016a9a2dcc45d8735aec3ce4d00eef35d90f6fe6653d`）
- 意味: SEC-FR-CAP-002 / SEC-AC-CAP-002: execution直前にlexical/physical target、exact target set、TOCTOU identityを確認し、link・mount・hardlink・repo外・glob・driftを拒否する。
- queue/baseline: `unresolved` / `unresolved_for_closure_work`、個別audit ref 0件。
- 近い固定pairの保持点: 旧L6 value-object設計とL8 oracleはrealpath/type/device/inode/mount/hardlink/TOCTOUを具体化する。f6 SECURITY-008はtarget authority fieldを持つが、物理inode同一性までは要求しない。後発SECURITY-033はtarget HEAD/context変化時の再照合で近いがfilesystem identityと異なる。
- 変更・未継承: 現行f6/後発pairは関連する部分条件を分担するが、旧sourceの「SEC-FR-CAP-002 / SEC-AC-CAP-002: execution直前にlexical/physical target、exact target set、TOCTOU identityを確認し、link・mount・hardlink・repo外・glob・driftを拒否する。」全体を同等の採択successorとして明示していない。差分は次の残差に残る。
- 後発採択の限定効果: SECURITY-033はtarget HEAD等context driftの再照合に限る。filesystem realpath/device/inode/mount identityの採択pairではない。
- 残差: 現行固定pairと採択SECURITY-029..034から、physical identityの実装・採択済み成功証拠は導けない。
- 反例: repo内の文字列pathが同じでもsymlink/junctionを経由してrepo外実体へ到達し、許可する。
- 数値・例外境界: SEC-FR/AC pair 002。対象件数の一般数値なし。Windows alternate pathを含む具体反例がある。
- 判定: `unresolved`。このauditによるsuccessor・採択・closureなし。

### REQSRC-SUP-00361 — 旧source line 466

- 原文: | `SEC-FR-CAP-003` | direct/bounded/script/generated/unknown provenanceを区別し、未検証間接実行をhostへ渡さない | `SEC-AC-CAP-003`: bounded以外の間接実行をsandboxまたは拒否へ送る |（SHA `d627be7295a9d10b4e90da92700145f7bd8d2f522a2e6ea6a867e4055b8ccda8`）
- 意味: SEC-FR-CAP-003 / SEC-AC-CAP-003: direct/bounded/script/generated/unknown provenanceを区別し、未検証の間接実行をhostへ渡さずsandbox又は拒否へ送る。
- queue/baseline: `unresolved` / `unresolved_for_closure_work`、個別audit ref 0件。
- 近い固定pairの保持点: 固定SECURITY-007はWorker制約の適用・観測を扱う。後発採択029/031/033は第三者/追加Worker runtimeのデータ・隔離・実行contextに限定して近い。
- 変更・未継承: 現行f6/後発pairは関連する部分条件を分担するが、旧sourceの「SEC-FR-CAP-003 / SEC-AC-CAP-003: direct/bounded/script/generated/unknown provenanceを区別し、未検証の間接実行をhostへ渡さずsandbox又は拒否へ送る。」全体を同等の採択successorとして明示していない。差分は次の残差に残る。
- 後発採択の限定効果: SECURITY-029/031/033は外部または追加Worker runtimeのdata/trust/contextに限る。script/generated command provenanceのboundednessを定めない。
- 残差: それらは外部Worker/runtimeのtrust/data/contextであり、shell wrapper、generated command、dynamic interpreter等のprovenanceをbrokerでboundするSEC-AC-CAP-003とは別。
- 反例: 解析深度を超えたscriptをdirect commandと見なしhost上で実行。
- 数値・例外境界: FR/AC pair 003。provenanceは5区分（direct/bounded/script/generated/unknown）。
- 判定: `unresolved`。このauditによるsuccessor・採択・closureなし。

### REQSRC-SUP-00362 — 旧source line 467

- 原文: | `SEC-FR-CAP-004` | data classificationとsink authorityを分離し、credential、PII、archive egressをbroker外で拒否する | `SEC-AC-CAP-004`: data/sinkの直積を検査し、credential、PII、archive、unknownを拒否する |（SHA `61ed641d6b2140bd0a21e7cb439a213e057307ef8fc783d3ae9cf583fe355c85`）
- 意味: SEC-FR-CAP-004 / SEC-AC-CAP-004: data classificationとsink authorityを分離し、credential/PII/archive/unknownのegressをbroker外で拒否する。
- queue/baseline: `unresolved` / `unresolved_for_closure_work`、個別audit ref 0件。
- 近い固定pairの保持点: SECURITY-005はcredential、006は送信先/protocol/data class/bytes/purpose/authority/expiry、016は全6分類を記録する。後発029/033はWorkerへ渡すdata/context scopeの限定効果を持つ。
- 変更・未継承: 現行f6/後発pairは関連する部分条件を分担するが、旧sourceの「SEC-FR-CAP-004 / SEC-AC-CAP-004: data classificationとsink authorityを分離し、credential/PII/archive/unknownのegressをbroker外で拒否する。」全体を同等の採択successorとして明示していない。差分は次の残差に残る。
- 後発採択の限定効果: SECURITY-029/033はWorker data scopeに限って近接する。全sink直積とcredential/PII/archive/unknown egress拒否のbroker oracleにはならない。
- 残差: 006/016は送信と分類の1.0境界を保持するが、SEC-AC-CAP-004の全data×sink直積、archive/unknown拒否、値をログへ出さないbroker oracleを一体で置き換えない。
- 反例: credentialがsecret分類と記録されていても、sink未許可のためbroker外へ送信する。
- 数値・例外境界: FR/AC pair 004。旧ACはpublic/repository/sensitive/PII/credential/unknownと複数sinkの直積fixtureを列挙。分類数は後発016の1.0基盤で6、1.x sink適用は別。
- 判定: `unresolved`。このauditによるsuccessor・採択・closureなし。

### REQSRC-SUP-00363 — 旧source line 468

- 原文: | `SEC-FR-CAP-005` | external/destructive actionをexact target、dry-run、postcondition、rollback、expiry、action bindingへ束縛する | `SEC-AC-CAP-005`: tupleが揃うまで`approval_required`または`unresolved`で実行を拒否する |（SHA `97caefe790e5d17568d2d47649e4da91ad98cefc6da460d9df7a48360716c3eb`）
- 意味: SEC-FR-CAP-005 / SEC-AC-CAP-005: external/destructive actionをexact target・dry-run・postcondition・rollback・expiry・action bindingへ結び、tuple不足時`approval_required`又は`unresolved`で拒否する。
- queue/baseline: `unresolved` / `unresolved_for_closure_work`、個別audit ref 0件。
- 近い固定pairの保持点: SECURITY-008は操作ごとにactor等を照合し、022は判断からassignmentのhandoff、023は後段promotionを分離する。後発030はagentic自動適用範囲の確認、033はWorker context変更時の再照合に限って近い。
- 変更・未継承: 現行f6/後発pairは関連する部分条件を分担するが、旧sourceの「SEC-FR-CAP-005 / SEC-AC-CAP-005: external/destructive actionをexact target・dry-run・postcondition・rollback・expiry・action bindingへ結び、tuple不足時`approval_required`又は`unresolved`で拒否する。」全体を同等の採択successorとして明示していない。差分は次の残差に残る。
- 後発採択の限定効果: SECURITY-030のscopeはagentic auto-apply拡張時確認、033はWorker context recheck。旧action bindingのdry-run/postcondition/rollback/expiry全tupleを閉じない。
- 残差: 固定pairはaction-bindingの複数fieldを分担するが、旧AC-005のdry-run/postcondition/rollback/expiry欠落・drift oracleと全体のexact-target bindingを同時に満たしたとはいえない。
- 反例: dry-run後にtargetが変わる、rollbackが欠けるのに古いapprovalでdestructive applyを許可する。
- 数値・例外境界: FR/AC pair 005。postcondition/rollback/expiryの数値やapproval期限期間は定義されず、期限fieldの束縛が要件。
- 判定: `unresolved`。このauditによるsuccessor・採択・closureなし。

### REQSRC-SUP-00364 — 旧source line 469

- 原文: | `SEC-FR-CAP-006` | hook/sandbox coverageをruntime別に検査し、unsupported surfaceをhost実行へfallbackしない | `SEC-AC-CAP-006`: unsupported、trust drift、sandbox unavailableをfail-closeする |（SHA `33e1516068f295831de97db481703edcbd649c3dd20fb91a868a9e0ae576829b`）
- 意味: SEC-FR-CAP-006 / SEC-AC-CAP-006: hook/sandbox coverageをruntime別に判定し、unsupported surface・trust drift・sandbox unavailableをhost fallbackせずfail-closeする。
- queue/baseline: `unresolved` / `unresolved_for_closure_work`、個別audit ref 0件。
- 近い固定pairの保持点: SECURITY-007はWorker制約適用、020はGuardの決定責務、024はpolicyと実資源・Worker物理強制をreceiptで対応させる。後発031（追加runtime隔離）・034（MCP profile capability/probe）は狭いruntime候補として関連。
- 変更・未継承: 現行f6/後発pairは関連する部分条件を分担するが、旧sourceの「SEC-FR-CAP-006 / SEC-AC-CAP-006: hook/sandbox coverageをruntime別に判定し、unsupported surface・trust drift・sandbox unavailableをhost fallbackせずfail-closeする。」全体を同等の採択successorとして明示していない。差分は次の残差に残る。
- 後発採択の限定効果: SECURITY-031は主Worker外の追加runtimeのみ、034はMCP tool profileのみ。全host/IDE/hosted/hook/sandbox surfaceのcoverageとは範囲が異なる。
- 残差: 固定pair・後発pairは全host/IDE/hosted surfaces別coverageとunsupported時のfail-closeを列挙したSEC-AC-CAP-006全体の代替ではない。
- 反例: Cursor/hosted runtimeでsandboxが使えない場合に既定host実行へfallbackする。
- 数値・例外境界: FR/AC pair 006。旧AC fixtureはClaude、Codex CLI/IDE、Cursor、hosted tool、workerを列挙。5つのruntime familyを明示。
- 判定: `unresolved`。このauditによるsuccessor・採択・closureなし。

### REQSRC-SUP-00365 — 旧source line 470

- 原文: | `SEC-FR-CAP-007` | canonical safety failureをlegacy greenで相殺せず、値非表示のreceiptへ全reasonを記録する | `SEC-AC-CAP-007`: canonical failureをlegacy／別scannerのgreenで相殺せず、redacted receiptだけを残す |（SHA `69b561571ffa2f6b0f9dda7bb81cd7d92854e2a085f2f267805a8f21cc65df00`）
- 意味: SEC-FR-CAP-007 / SEC-AC-CAP-007: canonical safety failureをlegacy/別scanner greenで相殺せず、全reasonをredacted receiptに記録する。
- queue/baseline: `unresolved` / `unresolved_for_closure_work`、個別audit ref 0件。
- 近い固定pairの保持点: SECURITY-009は停止伝播、020はGuard決定境界、023は段階別失敗停止。後発032はpermanent bypass denyの優先順位で、033はWorker出力を非権威とする。
- 変更・未継承: 現行f6/後発pairは関連する部分条件を分担するが、旧sourceの「SEC-FR-CAP-007 / SEC-AC-CAP-007: canonical safety failureをlegacy/別scanner greenで相殺せず、全reasonをredacted receiptに記録する。」全体を同等の採択successorとして明示していない。差分は次の残差に残る。
- 後発採択の限定効果: SECURITY-032はWorker runtime内のpermanent bypass deny優先順位、033は出力非権威性。canonical failureの全reasonをredacted receiptへ記録する条件は置換しない。
- 残差: これらの局所fail-stop/denyは、全canonical failureのAND gateとraw値非表示の全reason receiptを証明しない。後発pairに旧SEC-AC-CAP-007のredacted receipt oracleはない。
- 反例: canonical target identity失敗をlegacy guard greenで相殺し、raw pathやsecretをreceipt/logへ書く。
- 数値・例外境界: FR/AC pair 007。旧test designにはreceipt redactionと10種ACの番号があるが、実行結果ではない。
- 判定: `unresolved`。このauditによるsuccessor・採択・closureなし。

### REQSRC-SUP-00367 — 旧source line 474

- 原文: path targetは入力の字面だけで許可しない。`lexical_target`はrepo-relative POSIX pathまたは（SHA `bf243a9ec3038e51778ca94659bdab2ba9a16bf89c4e297bea3c39f21e0e3e34`）
- 意味: 入力字面だけでpath targetを許可せず、`lexical_target`と`physical_target`を分け、realpath・祖先link・mount・device/inode・typeを確認する。
- queue/baseline: `unresolved` / `unresolved_for_closure_work`、個別audit ref 0件。
- 近い固定pairの保持点: 旧L6 function design lines21–45はrepo-relative literalを物理identityへbindし、broker全実行許可とは分ける。f6 SECURITY-008はtarget/authorityを要求するがphysical resolutionの細部はない。後発033のtarget HEAD再照合はrepository revision bindingに限られる。
- 変更・未継承: 現行f6/後発pairは関連する部分条件を分担するが、旧sourceの「入力字面だけでpath targetを許可せず、`lexical_target`と`physical_target`を分け、realpath・祖先link・mount・device/inode・typeを確認する。」全体を同等の採択successorとして明示していない。差分は次の残差に残る。
- 後発採択の限定効果: SECURITY-033のtarget HEAD/context再照合はrevision bindingであり、pathのphysical inode・mount・link identityを検証しない。
- 残差: 旧L6設計はsource meaningを具体化する過去のconsumerだが、固定f6 L2/L11の採択証拠ではない。後発Worker context bindingもfile-system identityのsuccessorではない。
- 反例: `../`、絶対path、junction解決後のrealpathを字面検査だけで許可。
- 数値・例外境界: ここでは個別cardinality数値なし。typed external targetは許可候補として別型で保持。
- 判定: `unresolved`。このauditによるsuccessor・採択・closureなし。

### REQSRC-SUP-00369 — 旧source line 476

- 原文: device/inode、file typeを検証する。`target_set`はexact member list、cardinality、glob・再帰・（SHA `77f607f5a88900faf140ff6ab33ae5a0876e1dec9cf8ad9d9739a198596e7a07`）
- 意味: `target_set`にexact member list/cardinalityとglob・再帰・生成展開有無を保持する。
- queue/baseline: `unresolved` / `unresolved_for_closure_work`、個別audit ref 0件。
- 近い固定pairの保持点: 旧L6/L8はduplicate・glob・件数不一致の拒否を細分化。固定008/020はoperation/Guardの境界でありmember集合の整合oracleではない。
- 変更・未継承: 現行f6/後発pairは関連する部分条件を分担するが、旧sourceの「`target_set`にexact member list/cardinalityとglob・再帰・生成展開有無を保持する。」全体を同等の採択successorとして明示していない。差分は次の残差に残る。
- 後発採択の限定効果: SECURITY-033はWorkerのcurrent target bindingまで。target_setのexact member list/cardinality/glob/recursion条件は対象外。
- 残差: 固定f6 L2/L11、採択SECURITY-029..034のどれにもpackage/command target setをexact member単位で束縛するACはない。
- 反例: glob展開で意図しない第2 fileが実行対象に追加されても元のtarget1個のapprovalを適用。
- 数値・例外境界: exact member setとcardinalityを保持。初期sliceの単一数値は次条件00370で1。
- 判定: `unresolved`。このauditによるsuccessor・採択・closureなし。

### REQSRC-SUP-00370 — 旧source line 477

- 原文: 生成展開の有無を保持し、単一artifactの初期sliceではcardinality=1かつliteral expansionだけを許可する。（SHA `0dda8fd351fb25d6bac895d9096a27043740d4df7eccdb240b1de6e0961cefaf`）
- 意味: 初期single-artifact sliceではcardinality=1かつliteral expansionだけを許可する。
- queue/baseline: `unresolved` / `unresolved_for_closure_work`、個別audit ref 0件。
- 近い固定pairの保持点: 旧L6/L8 consumerは対象件数の一致とliteral targetを確認する。後発security候補はWorker/MCP単位であり、filesystem artifactのcardinalityを定義しない。
- 変更・未継承: 現行f6/後発pairは関連する部分条件を分担するが、旧sourceの「初期single-artifact sliceではcardinality=1かつliteral expansionだけを許可する。」全体を同等の採択successorとして明示していない。差分は次の残差に残る。
- 後発採択の限定効果: SECURITY-029..034にfilesystem single-artifact initial sliceのcardinality=1規則はない。
- 残差: この数値制約は一般の複数target許可ではなく初期sliceだけの例外境界。f6 pairに同じinitial slice ruleはない。
- 反例: literal 1件以外を展開するglob/recursive setを単一artifact sliceの対象として通す。
- 数値・例外境界: 明示値`cardinality=1`、`literal`限定。別scopeへの一般化をしない。
- 判定: `unresolved`。このauditによるsuccessor・採択・closureなし。

### REQSRC-SUP-00371 — 旧source line 479

- 原文: 次のいずれかに該当する場合はhost実行を拒否する。（SHA `b2744b91b963d600d8d7e99ce6511edf6b82cd06eb828dd77e9587124b662c4d`）
- 意味: 所定のlexical/physical target failure時はhost実行を拒否する。
- queue/baseline: `unresolved` / `unresolved_for_closure_work`、個別audit ref 0件。
- 近い固定pairの保持点: SECURITY-008/020/024は操作authority、決定的Guard、物理強制の要求を保持する。旧L6/L8はfailure identityを具体化する。後発031/034は限定runtime scopeでunsupported/boundaryを扱う。
- 変更・未継承: 現行f6/後発pairは関連する部分条件を分担するが、旧sourceの「所定のlexical/physical target failure時はhost実行を拒否する。」全体を同等の採択successorとして明示していない。差分は次の残差に残る。
- 後発採択の限定効果: SECURITY-031/034のunsupported/runtime scopeは個別候補に限る。4種のphysical-target rejection setを網羅しない。
- 残差: 固定pairの「worker physical enforcement」はbrokerの4種target failureを同一受入として閉じない。
- 反例: absolute/traversal path、repo外realpath、unsupported file type、target identity driftのいずれかを通知せずhost executionする。
- 数値・例外境界: 旧sourceにhost拒否理由4群（lexical invalid、physical boundary/link/type、device/inode/mount/hardlink、判定後digest drift）。reject threshold以外の数値なし。
- 判定: `unresolved`。このauditによるsuccessor・採択・closureなし。

### REQSRC-SUP-00374 — 旧source line 483

- 原文: - device/inodeが取得できない、rootと異なるdevice、hardlink alias（`nlink > 1`）、mount boundaryが未検証。（SHA `b74ce53ad69fed45ae0043a3eb964d83d48fa3f650f8703221ec5837b7252406`）
- 意味: device/inode取得不能、rootと異なるdevice、hardlink alias（`nlink > 1`）、mount boundary未検証では拒否する。
- queue/baseline: `unresolved` / `unresolved_for_closure_work`、個別audit ref 0件。
- 近い固定pairの保持点: SECURITY-024はSECURITY policy・INFRASTRUCTURE資源状態・Worker物理強制のreceipt対応を要求するが、device/inode等の検査fieldは書かない。旧L6/L8 consumerはこれらの個別fail codeを扱う。
- 変更・未継承: 現行f6/後発pairは関連する部分条件を分担するが、旧sourceの「device/inode取得不能、rootと異なるdevice、hardlink alias（`nlink > 1`）、mount boundary未検証では拒否する。」全体を同等の採択successorとして明示していない。差分は次の残差に残る。
- 後発採択の限定効果: SECURITY-024は実resourceとWorker physical enforcementをreceiptで結ぶが、SECURITY-029..034も含めdevice/inode/nlink/mount failure oracleの採択後pairはない。
- 残差: 現行f6 pairの実資源対応を、mount boundary/device identityの物理検証済み証拠へ読み替えない。
- 反例: 同一inodeへのhardlink別名があるfileをdistinct safe targetとして通す、mount情報取得失敗をgreenにする。
- 数値・例外境界: hardlinkの境界は明示`nlink > 1`。rootとのdevice差異とmount未検証は拒否。
- 判定: `unresolved`。このauditによるsuccessor・採択・closureなし。

### REQSRC-SUP-00378 — 旧source line 488

- 原文: reason code、policy version、expiryだけをreceiptへ記録する。判定と実行の間に変更があれば自動再実行せず、新しいpreflightを要求する。（SHA `6c1fffd45916acf67ec3d93ce2fd43911d1e7f478530bd18673d34db69c9f9c1`）
- 意味: receiptは許可fieldだけ記録し、raw command/secret/PII/個人absolute pathを含めず、判定後driftは自動再実行せず新しいpreflightを求める。
- queue/baseline: `unresolved` / `unresolved_for_closure_work`、個別audit ref 0件。
- 近い固定pairの保持点: SECURITY-005/008はcredential露出抑止・expiry付きauthorityを、後発033はWorker/context変更時の旧binding流用禁止を関連境界として持つ。旧L6/L8はredaction/value-object receiptを記述する。
- 変更・未継承: 現行f6/後発pairは関連する部分条件を分担するが、旧sourceの「receiptは許可fieldだけ記録し、raw command/secret/PII/個人absolute pathを含めず、判定後driftは自動再実行せず新しいpreflightを求める。」全体を同等の採択successorとして明示していない。差分は次の残差に残る。
- 後発採択の限定効果: SECURITY-033はcontext変更時に古いbindingを流用しない点で近いが、receiptのredaction field set/expiryと新規physical preflightを定めない。
- 残差: いずれも旧source列挙のreceipt schema8項目と再preflight条件を同じ契約として定めない。
- 反例: receiptにabsolute host pathやcommandを残す、またはTOCTOU後に新しいpreflightなしで自動retryする。
- 数値・例外境界: receipt許可項目8（lexical target、target type、cardinality、physical/repository identity digest、reason code、policy version、expiry）。実行時点で変化すれば新preflight。
- 判定: `unresolved`。このauditによるsuccessor・採択・closureなし。

### REQSRC-SUP-00387 — 旧source line 501

- 原文: 独立reviewとmain read-afterを持つ。既存の限定guardのgreenで未実装sliceを相殺しない。本版の昇格は（SHA `2593d62f238cc9f993a822ccc36ec58e5443636bc004e54ab2edc2d66b1169db`）
- 意味: 5つのimplementation sliceを順序付け、各sliceにL4/L5設計・L8/L9/L10 oracle・mutation・DB/receipt projection・独立review・main read-afterを求め、限定guardのgreenで未実装sliceを相殺しない。
- queue/baseline: `unresolved` / `unresolved_for_closure_work`、個別audit ref 0件。
- 近い固定pairの保持点: f6 SECURITY L2/11は要求・受入条件を固定する。後発29–34は新しい要求候補のdecision statusを示す。
- 変更・未継承: 現行f6/後発pairは関連する部分条件を分担するが、旧sourceの「5つのimplementation sliceを順序付け、各sliceにL4/L5設計・L8/L9/L10 oracle・mutation・DB/receipt projection・独立review・main read-afterを求め、限定guardのgreenで未実装sliceを相殺しない。」全体を同等の採択successorとして明示していない。差分は次の残差に残る。
- 後発採択の限定効果: SECURITY-029..034の採択はrequirements candidateのstatusであり、旧5 sliceそれぞれのruntime/oracle/review/main read-after実行を示さない。
- 残差: どの採択pair/decisionも、この旧sourceの5 sliceすべてのimplementation・oracle・independent review/read-after実施証跡ではない。CI/runtimeは本監査では実行禁止。
- 反例: 一つのsliceのreviewまたはexisting guard greenで残りの4 sliceやruntime coverageを完了扱いする。
- 数値・例外境界: slice順は5段（physical identity→recursive/provenance→credential sink/GitHub target→network/cloud destructive adapter→hook parity/unsupported/doctor）。各sliceの独立review+main read-afterを要求。
- 判定: `unresolved`。このauditによるsuccessor・採択・closureなし。

### REQSRC-SUP-00388 — 旧source line 502

- 原文: requirements authorityを更新するものであり、credential、外部control plane、network/cloud、sandbox（SHA `eaf0ab21ea182d07cee7b89655535cb6376a40b17bc779aaea0a23cd9ef59569`）
- 意味: 本版はrequirements authorityを更新するが、credential・external control plane・network/cloud・sandbox cutoverを自動許可しない。
- queue/baseline: `unresolved` / `unresolved_for_closure_work`、個別audit ref 0件。
- 近い固定pairの保持点: SECURITY-005/006/008/007は個別credential/egress/authority/Worker limitsを保持。
- 変更・未継承: 現行f6/後発pairは関連する部分条件を分担するが、旧sourceの「本版はrequirements authorityを更新するが、credential・external control plane・network/cloud・sandbox cutoverを自動許可しない。」全体を同等の採択successorとして明示していない。差分は次の残差に残る。
- 後発採択の限定効果: SECURITY-030/031の採択scopeからcredential、network/cloud、external control-planeやsandbox cutoverの実行許可は生成されない。
- 残差: candidate adoptionやMPR registrationから実credential操作、external apply、network/cloud/destructive action、sandbox cutoverを生成しないという旧source境界は、要求採択と実行許可を別に保つ。
- 反例: requirements更新を、credential利用やexternal control-plane操作の包括権限として解釈する。
- 数値・例外境界: 列挙4種のcutover/authority対象を自動許可しない。閾値なし。
- 判定: `unresolved`。このauditによるsuccessor・採択・closureなし。

### REQSRC-SUP-00389 — 旧source line 503

- 原文: cutoverを自動許可するものではない。（SHA `3b6bc916572843b8c721e63879e9db393bf0c086f00755ba2f3e57166014189e`）
- 意味: broker requirements昇格はnetwork/cloud/sandbox cutoverを自動許可しない。
- queue/baseline: `unresolved` / `unresolved_for_closure_work`、個別audit ref 0件。
- 近い固定pairの保持点: SECURITY-008は操作別authority、009停止伝播、024物理強制の接続を要求する。後発031等は追加runtime候補内のproposal-only境界を持つ。
- 変更・未継承: 現行f6/後発pairは関連する部分条件を分担するが、旧sourceの「broker requirements昇格はnetwork/cloud/sandbox cutoverを自動許可しない。」全体を同等の採択successorとして明示していない。差分は次の残差に残る。
- 後発採択の限定効果: SECURITY-031の追加runtime proposal-onlyはその追加runtime範囲に限定。generic network/cloud/sandbox cutoverの自動許可・完了証拠ではない。
- 残差: 外部実作用・cutoverに対する対象revisionの個別authorityが必要な意味は保持されるが、どの採択候補も旧sourceの全cutover列挙の自動実施を許可しない。
- 反例: sandboxが実装済みというだけで、network/cloud destructive adapterを有効化する。
- 数値・例外境界: cutover自動許可なし。旧source内に数値閾値なし。
- 判定: `unresolved`。このauditによるsuccessor・採択・closureなし。

## 共通数値・例外境界

- typed tupleは8 top-level groups。末尾はpostcondition、rollback、expiryの3要素を含む。unknown／missing／axis mix／multiple candidatesは`unresolved` fail-close。
- SEC-FR/SEC-ACは7対、旧security acceptance設計は001..010の10 oracle。旧計画は5段のimplementation sliceを順序付ける。
- 初期physical artifact sliceは`cardinality=1`かつliteral expansionのみ。hardlink aliasは`nlink > 1`で拒否。
- host拒否の例外境界にはabsolute/traversal/Windows alternate path、repo外realpath、symlink/junction、unsupported file type、device/inode取得不能、別device、hardlink、未検証mount、判定後digest driftがある。
- receipt許可fieldは8項目。raw command、secret、PII、個人absolute pathを含めない。判定後driftは自動retryせず新規preflight。unsupported runtime/sandbox不可用はhost fallbackしない。
- requirements authority更新からcredential、external control plane、network/cloud、sandbox cutoverの自動許可は生じない。

## 静的検証

- queue上の19 source-qualified IDとstatusを確認。source file/line SHA、consumer file/line SHA、f6 target file/row SHA、decision file/row SHAをJSONに固定。
- 後発57＋11 screenは全68 identity/statusを収録し、採択SECURITY-029..034のdecision row SHAとL2/L11 heading pinsを別掲。
- JSON妥当性、Markdown見出しとJSON ID集合一致、参照解決、source/hash再計算、diff whitespaceを確認。
- 旧runtime/test/CLI/CIを実行せず、実credential/network/cloud/host actionも行っていない。
