# #2295後の候補register・判断revision照合（2026-09-29）

基準main: `c258bfe81624ab03b08fccf6bd1fccc5e279040a`（PR #2307 merge後）。
記録種別: 読取専用の候補register／PO判断revision照合。旧archiveはsourceとして読むだけで、旧workflow、CLI、hook、runtime、test、CIを実行しない。

本監査は#2295のPO判断記録が固定した57件のL2/L11 revisionと、基準main時点のlive candidate registerを再照合する。採択、要求意味の追加変更、formal successor、要求stage完了、実装・受入実行を生成しない。旧source母集団全体の未対応0も主張しない。

## 入力と判定方法

- 基準となる前回live inventoryは、#2295 merge main `10e061a406b8d5655cbac483a3e6ea4988ac2380`時点の[current authority overlay](current-authority-overlay-2026-09-29.md)である。同overlayは310 identities = 307 exact-revision decisioned + 3 undecidedと記録する。
- register照合は、同じ `docs/governance/management-provisional-requirement-register.jsonl` の#2295基準commit `10e061a406b8d5655cbac483a3e6ea4988ac2380` と現行基準commit `c258bfe81624ab03b08fccf6bd1fccc5e279040a` のtreeを比較した。各treeで`requirement_identity`ごとに最新registrationを選び、baselineに存在しないlive registrationを特定した。差分は7 identityで、5件が新規identity、2件が既決identityの後続registrationである。基準commitに含まれるregister本文自体をこの監査用に書き換えていない。
- authorityの正本は[57件のPO判断記録](../../decisions/po-decision-2026-09-29-57candidates.md)である。採否はidentityだけでなく同記録のregistrationとL2/L11本文digestに一致するrevisionに限る。append-only register、候補本文、receipt、PR mergeだけから採否を推定しない。
- 既存[受領handoff](po-decision-received-handoff-2026-09-29.md)は判断を記録するための受領・整理資料であり、それ自体はPO判断記録ではない。第2版の表題は55候補だが、同文書の第3版は57候補を扱うPO確定前の見解として記録する。これらを#2295の正式判断と合算したり、別判断として数えたりしない。

## live identity数とexact revision authority

| 時点／差分 | live identity | exact revision decisioned | 未判断 | 説明 |
|---|---:|---:|---:|---|
| #2295基準main `10e061a4` | 310 | 307 | 3 | 250件の8機構判断記録と#2295対象57件の合計307件。残り3 identityはoverlay記載の未判断候補。 |
| 基準main `c258bfe8` | 315 | 305 | 10 | 新規identity 5件で総数315。既決identity 2件に未判断の後続revisionがあるためexact decisionedを2減らす。従前の3件を加え、未判断は3 + 2 + 5 = 10。 |

この10件を現行registerで照合した結果を次に示す。`PO判断なし`は本監査が参照した基準mainまでに、そのlive registrationを固定した判断記録を確認できないという意味であり、候補を採択・保留・不採択へ振り分ける判断ではない。

| 区分 | identity | 現行latest registration | exact live revisionのPO判断 |
|---|---|---|---|
| 以前から未判断 | `HARNESS-L2-048` | `MPR-RC-HARNESS-L2-048-001` | なし。#2295対象外。 |
| 以前から未判断 | `HELIXBRAIN-L2-031` | `MPR-RC-HELIXBRAIN-L2-031-001` | なし。#2295対象外。 |
| 以前から未判断 | `HARNESS-L2-049` | `MPR-RC-HARNESS-L2-049-002` | なし。#2295対象外。 |
| 決定済みidentityの後続revision | `HARNESS-L2-041` | `MPR-RC-HARNESS-L2-041-003`（supersedes `-002`） | `-002`のみ#2295で採択。`-003`の追補は未判断。 |
| 決定済みidentityの後続revision | `HELIXOS-L2-038` | `MPR-RC-HELIXOS-L2-038-002`（supersedes `-001`） | `-001`のみ#2295で採択。`-002`の追補は未判断。 |
| 新規identity | `HARNESS-L2-050` | `MPR-RC-HARNESS-L2-050-001` | なし。 |
| 新規identity | `HARNESS-L2-051` | `MPR-RC-HARNESS-L2-051-001` | なし。 |
| 新規identity | `HARNESS-L2-052` | `MPR-RC-HARNESS-L2-052-001` | なし。 |
| 新規identity | `HARNESS-L2-053` | `MPR-RC-HARNESS-L2-053-001` | なし。 |
| 新規identity | `HELIXOS-L2-053` | `MPR-RC-HELIXOS-L2-053-001` | なし。 |

全10 latest registrationのregister stateは`registered_proposal`、`authority_effect: none`である。identity countの算術は`315 = 305 + 10`。#2295の57件は、#2295が固定したexact revisionに対する正式判断として保持する。後続revisionは、その基礎revisionの判断を継承しない。

## #2295後に追加・改訂された7 registration

次の7件はpost-baseline inventoryに記録されたregistrationである。HIL-FR-46/47、50、52、53はasset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`の旧要求行を参照し、HARNESS-L2-051は別asset `LEGACY-ASSET-D27D4A1511BFD43623A9`のPHCAP-08 sourceを参照する。行位置、atom、receipt、holdingは候補単位の既存evidenceから読む。異なる候補が同じ旧行に触れる場合も、候補入力scopeを相互に拡張しない。

| live candidate | 旧source／限定入力 | source・coverage evidenceとholding | 現時点のPO判断境界 |
|---|---|---|---|
| `HARNESS-L2-041` / `MPR-RC-HARNESS-L2-041-003` | `infinity-loop-platform-requirements.md:137`、`HIL-FR-47`のtemplate extraction意味1 atom。 | [source lines](../requirement-registration/harness-layer-ledger-extraction-source-lines-2026-09-28.jsonl)、[receipt R3](../requirement-registration/harness-layer-ledger-extraction-coverage-receipt-2026-09-29-r3.json)。`MPR-SH-HARNESS-LAYER-LEDGER-EXTRACTION-001`はwriter/snapshot/proposal append条件を保持。 | #2295採択は`-002`とその旧L11 digestのみ。`-003`は原子obligation抽出・同一input/versionの非決定出力findingを追加する別L11 revisionで、PO判断前はapproved revisionではない。 |
| `HELIXOS-L2-038` / `MPR-RC-HELIXOS-L2-038-002` | 同旧文書`:136-137`、`HIL-FR-46/-47`のwriter・snapshot・proposal保存に関する2行。 | [OS writer receipt R2](../requirement-registration/os-layer-ledger-writer-coverage-receipt-2026-09-29-r2.json)。同じ`MPR-SH-HARNESS-LAYER-LEDGER-EXTRACTION-001`を参照し、`HARNESS-L2-041-003`もpreserved pending refに列挙。 | #2295採択は`-001`のみ。`-002`のwriter outcome oracleはHARNESS-041 `-003`のfinding意味契約が別途採択・有効化されることに依存する。二つの後続revisionを一つの判断で自動採択しない。 |
| `HARNESS-L2-050` / `MPR-RC-HARNESS-L2-050-001` | 同旧文書`:140`、`HIL-FR-50`の限定source row。 | [FR-50 source lines](../requirement-registration/harness-layer-ledger-refactor-source-lines-2026-09-29.jsonl)、[coverage receipt](../requirement-registration/harness-layer-ledger-refactor-coverage-receipt-2026-09-29.json)。`MPR-SH-SEMANTIC-LINE-003`の残余と`MPR-SH-IR-003#HIL-FR-50`を保持。 | 新規候補の採否は未判断。scopeはFR-50の局所候補であり、隣接FR-51..55や旧source全体のclosureではない。 |
| `HARNESS-L2-051` / `MPR-RC-HARNESS-L2-051-001` | asset `LEGACY-ASSET-D27D4A1511BFD43623A9`、`lifecycle-stage-completion-goals.md:47-68,70-72`の25 atom。 | [PHCAP08 source lines](../requirement-registration/phcap08-stage-exit-source-lines-2026-09-29.jsonl)、[coverage receipt](../requirement-registration/phcap08-stage-exit-coverage-receipt-2026-09-29.json)。25 atomの`carried_atom_refs`は空。`MPR-SH-PHCAP08-STAGE-EXIT-001`にstage-exit gate/receipt、unresolved-item/defer属性を保持。 | 新規候補の採否とstage-exit意味は未判断。候補を置いただけでは旧atomの後継にならず、同atomを現行条件へ再導出する場合もPOが対象revisionを判断する。 |
| `HARNESS-L2-052` / `MPR-RC-HARNESS-L2-052-001` | 同旧文書`:142`のうちcommand identity・同一payload冪等・異payload conflictに関するselected span。 | [FR-52 command source lines](../requirement-registration/hil-fr52-command-identity-source-lines-2026-09-29.jsonl)、[coverage receipt](../requirement-registration/harness-fr52-command-identity-coverage-receipt-2026-09-29.json)。`MPR-SH-IR-003#HIL-FR-52`とsemantic-line/O9の未選択範囲を保持。 | 新規候補の採否は未判断。HARNESSはcommand identity/replay payload意味、OSは複数artifactのatomic write/current/receipt責務を持つ別候補であり、同一候補や自動採択にまとめない。 |
| `HELIXOS-L2-053` / `MPR-RC-HELIXOS-L2-053-001` | 同旧文書`:142`のmulti-artifact atomicity、partial publish拒否、base CAS、receipt evidenceに関する4 atom。 | [OS FR-52 source lines](../requirement-registration/helixos-fr52-atomicity-source-lines-2026-09-29.jsonl)、[coverage receipt](../requirement-registration/helixos-fr52-atomicity-coverage-receipt-2026-09-29.json)。`MPR-SH-IR-003#HIL-FR-52`と未選択atomを保持。 | 新規候補の採否は未判断。L11のcommand-ID/payload意味はHARNESS-L2-052へ依存し、OS writer責務の候補採否はHARNESS側と別に読む。 |
| `HARNESS-L2-053` / `MPR-RC-HARNESS-L2-053-001` | 同旧文書`:143`、`HIL-FR-53`のstatement 1 atomと4 output atom。 | [asset identity source lines](../requirement-registration/harness-asset-identity-source-lines-2026-09-29.jsonl)、[coverage receipt](../requirement-registration/harness-asset-identity-coverage-receipt-2026-09-29.json)。`MPR-SH-IR-003#HIL-FR-53`の残余と`MPR-SH-O9-NAMING-001`を保持。 | 新規候補の採否は未判断。選択5 atomのreceiptから、FR-53全体、IR identity、旧行のremainderへのsuccessorを推定しない。 |

## stage 5への含意と限界

この差分監査が示すのは、現行candidate registerの315 identityのうち、exact revision decisioned 305、未判断10という候補authorityの状態だけである。#2295の57 revisionの判断は維持されるが、41/55受領時の候補集合や後から追加されたidentity/revisionに拡張されない。各source receiptも、そのreceiptに登録されたatom・scope以上の旧条件coverageを証明しない。

REG-06で残された他の旧source母集団、requirements-stageの全候補分岐、旧受入/negative oracleの網羅、未採択候補の全件処置、最後の総合整理finding 0件は本監査の範囲外であり未証明のままである。従って本書は旧source未対応0、要求stage 5/6完了、L3移行を宣言しない。
