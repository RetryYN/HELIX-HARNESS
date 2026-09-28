# 旧補助96条件のnegative oracle・成果物照合

## 基準と範囲

対象は旧IRの `HR-FR-HIL-01..24` に結び付く24 system contract、72 acceptance case（各3件）、24 system test（計120 source identityのうち今回見るAC/HATは96件）。旧runtime、test、CIは実行していない。現行照合基準はmain `559ae3ba4bfe660d666a57f227466d7dcdd440d9`。

旧原文は次の3ファイルを直接読み、各行範囲を下表に示す。SHAはファイル全体のSHA-256。

| 旧source | SHA-256 | 対象 |
|---|---|---|
| `docs/governance/requirements-source/requirements-ir/system_contracts.json` | `2a7df673138568526e714342679ce2982238966b42f2d1967b2da92e9dbf02ab` | HIL-01..24の契約範囲 |
| `docs/governance/requirements-source/requirements-ir/acceptance_cases.json` | `4fabf58db6619ceaa5d0943fd295f5b0ec127be39f245428d203c6a3b366ae19` | HAC-HIL-01a..24c、各10行 |
| `docs/governance/requirements-source/requirements-ir/system_tests.json` | `7ff2a798c120f7622d77dff2aba83992c03fb5a40cfa3b491572b4e8558c191a` | HAT-HIL-01..24、各18–22行 |

各旧HATの `status` は `designed_not_implemented`。したがって、旧テスト結果の実績が存在するとは扱わない。補助source manifest `docs/governance/legacy-migration/requirement/legacy-requirement-supplementary-source-carry-forward.jsonl`（SHA-256 `1a0591e1da6f9579d970aedfccff90ac6a8e1aefbbe0f4047e3aeb950a8449bb`）のsource identity・atom登録と併せて原文を直接読んだ。この報告は原文条件の意味照合であって、manifestへの登録だけから被覆を推定していない。

現行本文の確認済みSHA-256：OS L2 `db2b119daa7fbc47b79b1652beba72149fb0d6969af7bb400c1650d77464f2b5`、OS L11 `86b7949cf7700300588e8dc2ccb4448e31111223d2f1cace81109533452d551e`、HARNESS L2 `1e4e5b9be4258bfe5e3ab6a4c6911a7cab380617a01d50fa5ac5472adb849c99`、HARNESS L11 `6262609e08a80b493d14cbbd9205befaff61e8046bc567128b37445f2b825974`、LABO L2 `c34b87dde7c94eecb7d4aa83146cf2f3de1b50c278bd0e99cbf9e96a01145f71`、LABO L11 `119fa43bce6753bdb0fed5420641617b9665907a7b1c3b2e6def590098e7442d`、SECURITY L2 `286385d4e59ea69667c095a0a483338d8fb8786c7c7ec2c381c127775b8435ca`、SECURITY L11 `a931c77c099d2fe9dcef184da6c0427db35653308c21d0ac90b6210c02dc4ef5`。

## 原文negative oracleとcurrent対照

旧source line欄は、各HIL契約、対応する3 HAC、HATの行。全行は上記のsource SHAで固定される。current欄は現行L2/L11の直接照合先と、意味被覆／非採択候補／旧方式として保持しない区分を示す。

| 旧identity | 旧行：契約 / 3 acceptance / system test | negative oracle・HAT出力証拠の重点 | 現行受入との照合と判定 |
|---|---|---|---|
| HIL-01 | contract 2–24 / HAC 2–34 / HAT 2–20 | 重複は副作用0、異payload conflict、injection dispatch 0。intake/contract revision/idempotency/trust receipt。 | OS L2 642–650,682–690・L11 324–330,352–357、SECURITY L2 70–88。source/revision/digest・untrusted data・重複/停止は再導出。Issueをwork authorityとする旧意味はlocal ticket authorityとprojectionへ変更済み。receipt全fieldの旧Issue schemaを復活させる根拠にはしない。 |
| HIL-02 | 25–46 / 35–67 / 21–39 | illegal transition/orphan/budget境界で停止。transition、closure query、checkpoint digest。 | OS L2 662–670,682–690・L11 338–357。causality、合法遷移、停止/再開と未完義務保持を確認。旧固定sequenceはPO決定で不採用。HATの具体closure/checkpoint出力は現行動的workflowに同じ固定列を要求する採択済み根拠ではなく、未完義務の証拠に置換して保持。 |
| HIL-03 | 47–68 / 68–100 / 40–59 | stale/duplicate job 0、誤disposition・partial promotion・successor再流入拒否。delivery/head、job、writer return、successor lineage。 | OS L2 034/035 (945,987)・L11 539,581は双方明記の未採択候補。034は原指示/finding disposition、035はPR event intake/idempotent jobに限定し、HARNESS接続・監査実行は035の受入外。採択済み現行L11でHAT-03の全receipt鎖を満たすとは言えない。source carry-forwardは未完候補。 |
| HIL-04 | 69–95 / 101–133 / 60–79 | hollow/skip/coverage欠落を拒否、stale/re-entry/escalation分岐。R0–R4/coverage/stale証拠。 | HARNESS L2 419–426・L11 53–56,214、OS L2 139。該当scopeのReverse/Backflow、authority/stale/unknownは再導出。固定R0–R4と全Issueへの一律Reverseは既決意味変更で不採用。旧route名や固定列のartifactは現行oracle欠落と同義でない。 |
| HIL-05 | 96–124 / 134–166 / 80–100 | AI terminal/cycle/missing receipt拒否、高影響はsnapshot-bound approval待ち。custody/authority graph/approval receipt。 | SECURITY L2 46,140・L11 32で操作別authorityを採択済み。OS 034、HARNESS 035は追加候補で未採択。既存SECURITY権限境界を保ちつつ、OSの原directive/finding証拠や旧graph schemaが採択済みとは扱わない。 |
| HIL-06 | 125–148 / 167–199 / 101–120 | failure/別lineage後に後続0、overbroad quarantine拒否。SHA/tree lineage/check/log/expiry。 | OS L2 692,913・L11 359,513、HARNESS L2 44,56,118–121・L11 25。動的CI・別HEAD/failure拒否は現行意味に保持。3段固定は不採用、限定quarantine OS032は候補で未採択。HATの実行証拠は新世代CI未構築のため未実行であり要求欠落とは別。 |
| HIL-07 | 149–171 / 200–232 / 121–140 | raw/secret/self-promotion/regression拒否。input/output digest、shadow metric、review/rollback。 | LABO L2 35,117・L11 51,225、OS L2 712・L11 373。再現可能評価・shadow候補とOS/target ownerの別authorityは保持。LABO063の再発→予防candidateは1.0未採択。3.0学習利用と1.0知識評価は混同しない。 |
| HIL-08 | 172–197 / 233–265 / 141–159 | registry drift/double claim/old fence拒否。registry/team digest/lease/fence/checkpoint/verify。 | OS L2 672–680・L11 345–350、HARNESS L2 59,70–75。assignment/attempt/resource/capability/head、handoff・未完義務を分担保持する。特定のteam registry/lease/fencing機能を現行採択済み要件とは確認できない。 |
| HIL-09 | 198–225 / 266–298 / 160–179 | parent-only/child omission/overlap、extra/missing refs、unverified objectをfreeze拒否。manifest/atom span/decision-edge-stale receipt。 | OS L2 642–660・HARNESS L2 59は関連するprovenance/extraction。OS PO判断 lines 56–59は旧source holdingを保ち、未完atomを残す。全source exact snapshot・ref denominator・atom traceの一回限りinventory obligationは現行採択L11に見つからず、移行scopeの未解決carry-forward。一般製品のcrawlerへ拡張しない。 |
| HIL-10 | 226–246 / 299–331 / 180–199 | unknown/partial/nondeterminism拒否、rerun差異隔離。version/config/input/output/artifact/finding/rerun digest。 | OS033 L2 929–944・L11 524–536は全negative oracleと証拠を明示するが、新候補未採択。OS020 L11 359–364はCI結果を別HEAD/旧CIから流用しない。現行の要求レベル保持候補は整っているが採択済み要件・実行結果ではない。 |
| HIL-11 | 247–268 / 332–364 / 200–218 | schema drift/regression/PII昇格0、cursor逆行/stale/tombstoneで再取得。connector/lineage/watermark/redaction/query。 | CONNECT L2 56–78はendpoint/compat/stale/safe-send、OS L2 642–650,682–690はsource provenance/event、HARNESS L2 59は選択source抽出。いずれもProduct Data canonical projection、watermark/cursor/tombstone lifecycleと同じではない。採択済み後継は確認できず、data-ingestion scopeを決める未採択判断・carry-forward。 |
| HIL-12 | 269–293 / 365–397 / 219–237 | invalid/oversize/timeout/crash/late/direct write拒否。protocol/version/sequence/terminal/transaction。 | OS L2 672–690、SECURITY L2 140–148、HARNESS L2 59がexecution/result/stopと権限境界を分担。Node supervisor/Python worker JSONL方式は現行必須設計ではない。採択済み要求として旧IPC方式や全項目schemaを復活させない。 |
| HIL-13 | 294–315 / 398–430 / 238–256 | Bun API/command/lock/CI残存とpartial claim拒否。environment/Node lock/CLI/build/test/package/zero-finding。 | HARNESS L2 52–60,395–402。旧要件はNode移行の技術条件。現行L2はその特定runtimeを採択しておらず、Bun現況も調査/実行していない。特定tool名不在を意味欠落とはしない。 |
| HIL-14 | 316–339 / 431–463 / 257–276 | adapter leak/path/process/lock anomaly、unlock/policy違反拒否。3OS matrix/offline digest/SBOM/secret/license。 | OS L2 702–710・L11 227–236,366–373、SECURITY L2 162–166・L11 29–32は選択構成の適格性/provenanceを扱うが、旧3-OS matrixとonline/offline同一lock/SBOM/policyの具体受入は確認できない。未採択のplatform-compatibility carry-forwardとして区別。 |
| HIL-15 | 340–363 / 464–496 / 277–296 | implicit no-UI skip/static-only/stale receiptによるfreeze拒否。applicability/artifact/state/walkthrough/delta/agreement。 | HARNESS L2 52–54,360–367・L11 21,41–42はUI prototypeとPoCを区別し、no-UI時も技術PoCの適用を判定、合意前freezeを拒否。旧の一律PLAN schemaは不要な下流方式。 |
| HIL-16 | 364–386 / 497–529 / 297–316 | lexical-only rename/unsupported abstraction/wrong route拒否。semantic signature/consumer/oracle/role/name/rollback。 | HARNESS L2 395–402・L11 148–149,290–324で意味保持変更とL4/L3/L2へのbackflow、routeを確認。旧role catalogの固定schemaは下流実装。 |
| HIL-17 | 387–415 / 530–562 / 317–337 | TBD/N/A/orphan/change omission/self-promotion/stale、template gapの独立review前active拒否。source/authority/oracle/template/obligation/change/review。 | HARNESS L2 59–67,176–179・L11 28–29,130–132は要求形成とdesign obligation/backflowを保持。原文atom単位authority ledger・typed-edge完全性・template-gap shadow reviewの一体closureは既存採択L11だけで確認できず、template/requirement-formation候補は未採択。理由付きN/Aの個別適用まで被覆済みとは数えない。 |
| HIL-18 | 416–440 / 563–595 / 338–359 | atom/edge/oracle欠落・stale・未実行oracle・pair破壊拒否。registry/snapshot/addition/pair/oracle/refactor receipt。 | HARNESS L2 52–60,115–116,430–445・L11 58–64。trace/pair/closureと下位成功≠構成体成功は保持。ただし旧固定L1–L12 ledger、L0 anchor、全pair、L6/L7専用oracleをまとめて満たした採択済みreceiptは確認できず、構成体範囲の残差。 |
| HIL-19 | 441–465 / 596–628 / 360–379 | no-authority/impact/transaction、partial/stale/oracle-loss拒否。decision/revision/transaction/rollback/identity receipt。 | OS L2 514–529・L11 241–250は許可scope内atomic apply、scope外判断/部分更新拒否、履歴・traceを明記し、rename/split/mergeにも適用可能。現行root判断は専用fixture名の追加不要、実行未取得は意味欠落でない。 |
| HIL-20 | 466–489 / 629–661 / 380–399 | obligations/negative/S4 edge欠落、固定冊数、別正本、premature promotion拒否。coverage/example/phase snapshot/S4/backprop receipt。 | HARNESS L2 60–67,383–385,430–445・L11 29,209。設計義務、negative coverage、backflowの意味を再導出し、固定例数/S0–S4 schemaは採用しない。個別要件から導いたoracleを満たす証拠と実行結果は別。 |
| HIL-21 | 490–514 / 662–694 / 400–419 | self-promotion/over-agent/unpermitted/self-verify拒否、catalog変更時stale/regenerate/retire。pack/shadow/agent contract/guard/lifecycle receipt。 | INT072 L2 561–587/L11 289–325候補、OS018、SECURITY008。072はjudgment pack shadow/独立review前制約に限定。最小team生成とcatalog stale lifecycleを072単体で閉じない。専門Worker契約の後継配置候補はID未割当で、P-SPECIALISTのA/B所属判断も未決。 |
| HIL-22 | 515–538 / 695–727 / 420–439 | smoke-only、重大failureの平均相殺、fixed price/effortを拒否。fixture/rubric/blind score/real cost/route receipt。 | LABO055 L2 150–164・L11 56,94–96は作業種別/model classの履歴・評価状態を扱い、割当はOS/INT所有。LABO065 L2 503 onward・L11 241–259はtask別qualification、8軸、同一fixture/rubric、machine/blind score分離、scope間推定拒否を補うが未採択候補。採択済み055だけでHAT-22のblind bench/output一式を閉じたとは言えない。 |
| HIL-23 | 539–567 / 728–760 / 440–458 | allowlist外egress/scope外diff/機密委譲/bypass、quota/egress driftでfail-close。sandbox/egress/payload/FS diff/audit receipt。 | SECURITY029/031 L2 405,427–444・L11 89–112・OS018 L2/L11。029/031は主Worker契約外追加runtimeに絞られ未採択。主Workerへ拡大せず、隔離・proposal-only候補の詳細を現行採択条件へ数えない。 |
| HIL-24 | 568–586 / 761–793 / 459–477 | generated index手編集・party混在拒否、cutover approval境界。source/generated index digest/party/cutover receipt。 | OS030 L2 879–902,1065–1073・L11 480–510,640–650にcandidate oracleあり。#2228 r2は独立review/read-after済みだが、main本文にあるのは未採択候補。SECURITY008の操作別authorityは採択済み。正本→生成indexのmanual edit拒否を採択済み機能として扱わない。 |

## 実際に残るnegative-oracle／成果物の弱点

1. **移行inventoryの一回限りreceipt閉包がない（HIL-09）。** 旧HAT-09はexact two sealed Git authorities、advertised ref/content/edge分母、atom span、未検証object、stale triggerを出力証拠まで指定する（system_tests.json:160–179）。現行OS-015/016のprovenance/staleとHARNESS-027の選択source抽出は隣接能力であり、全source snapshot/census receiptの代替だとは本文が言っていない。既決OS PO decision `docs/governance/decisions/helix-os-requirements-po-decision-2026-09-28.md:56–59` は未完atom/holdingを明示しており、ここは旧移行義務の未割当として残す。これは現行採択製品の一般機能不具合とは判定しない。

2. **Product Data projectionの負例が現行採択接続契約から欠ける（HIL-11）。** 旧HAT-11はfull/incremental、schema drift、cursor逆行、PII、tombstone/stale-current、watermark・再取得を一つのsource contractと証拠に束ねる（acceptance_cases.json:332–364、system_tests.json:200–218）。現行CONNECT/OS/HARNESS参照は通信・event/source provenance・選択source抽出であり、正規entity projectionの状態/再取得と異なる。既採択scopeにこのdata-ingestion capabilityを含むという証拠を見つけておらず、scope/後継先が未決のcarry-forwardとして保持する。CONNECTの既存L11をこの不在だけで欠陥とはしない。

3. **原文atom/template完全性をfreeze時に拒否する受入の確定が未完（HIL-17/18）。** 旧HAT-17/18はTBD/N/A/orphan/変更欠落、未実行oracle、片edge、全層pair欠落、独立review前のtemplate gapを個別に拒否する（system_tests.json:317–359）。HARNESS-008/009・022とL11は要求根拠/設計義務/backflow及びcomposite未完を扱うが、要求ごとの完全なsource atom・typed edge・template gap closureを同じ採択済みL11 oracleだとは確認できない。未採択候補/receiptと意味決定の状態を別に示し、generic owner参照だけで被覆済みにしない。

4. **Task資格benchのnegative/output oracleは候補に存在するが未採択（HIL-22）。** LABO065の受入候補は8品質軸、同一fixture/rubric digest、blind judgeとmachine scoreの分離、unknown scope不適格、重大security/scope failureを平均で相殺しない反例を明記する（`docs/helix-labo/L11-acceptance/labo-acceptance.md:241–259`, `docs/helix-labo/L2-requirements/labo-requirements.md` のL2-065節）。採択済LABO055の履歴水準を、HAT-22の資格試験結果やblind scorecard receiptに読み替えない。新たなbench要件の採択・実行をこの監査から生成しない。

5. **候補L11存在と採択済みL11証拠を混同する危険（HIL-03/10/21/23/24）。** OS034/035、OS033、INT072、SECURITY029/031、OS030はいずれも対応するnegative oracle/output artifactを本文化しているが、本文自身が候補・未採択を明示する。HAT-03の全PR disposition lineage、HAT-10のengine/detector rerun digest、HAT-21のteam lifecycle、HAT-23の追加runtime隔離receipt、HAT-24の生成index再導出receiptを、現行採択済み受入や実行成功として報告しない。対象のPO採択未了を、L11記述自体の欠落とは区別する。

## PO意味変更・不採用と保持範囲

- HIL-01のIssueをcanonical work authorityとする旧契約は、既決GitHub運用でlocal ticket authority / Issue projectionに変更済み。旧schemaを戻さず、source/digest/untrusted-dataの意味を現行境界へ対応させる。
- HIL-02/04/06の固定workflow段数・sequence・R0–R4一律適用は、現行の動的workflow/適用scopeと衝突するため旧形式を復活させない。因果・合法遷移・stale/unknown拒否・未完義務維持は残す。
- HIL-12/13/14のNode/Python IPC、Bun移行、旧OS matrix等は技術方式や未採択scope。原文の技術名だけの不在をcurrent意味欠落とはしない。
- HIL-19の可逆範囲内自動適用はOS L2 523–529/L11 245–250に対応。専用rename/split/merge fixture名が未列挙なことは、現在のscope/partial/stale/history拒否を弱めない。
- HIL-21の専門team最小化はINT072の判断pack候補だけでは閉じない。専門Worker契約の後継配置候補はID未割当、P-SPECIALISTのA/B配置判断は未決であり、候補名の存在をPO採択とは扱わない。
- HIL-23は第三者runtimeへの安全境界の原文条件を主Worker全般へ拡張しない。SECURITY029/031の対象は主Worker契約外runtimeに限定された未採択candidate。
- HIL-24のOS030 r2追補はindependent review/read-after済みで正本index→生成indexの決定論・手編集拒否を具体化するが、採択未了。source acceptance source rowの不変保持と現在のauthority ruleを分ける。

## 判定

24 HATはいずれも旧側では設計済み・未実装であり、今回の照合は「昔のCIが通ったか」ではなく、旧negative oracleと成果物条件が現行L2/L11のどこへ保持されたかを確認した。24契約/72 acceptance/24 testの範囲では、明確な未採択・未割当候補として少なくともHIL-09、HIL-11、HIL-17/18の要素、HIL-21、HIL-22、HIL-23、HIL-24の採否境界が残る。うちOS030、OS033/034/035、INT072、SECURITY029/031、LABO065は候補L11に内容oracleがあるが、採択・実行結果はない。ほかの旧技術固有条件は意味変更・非採用・下流設計へ区別し、単にartifact名が現行本文にないことから新しい必須oracleを推定しない。
