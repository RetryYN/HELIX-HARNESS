# IR153 HIL-FR-66〜70 現行L2/L11条件照合（2026-10-02）

## 対象と固定pin

基準は `432ca78c4465bee9d1463ff995e299f80ea1fff1`、専用worktreeは `/home/tenni/.helix-worktrees/hil-fr66-70-current-audit-432`。旧L1資産 `LEGACY-ASSET-719D5EC9C06FC4AAD0FF` の対象物理行は156〜159、file SHA-256は `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`。旧IRは `requirements-ir/requirements.json`、file SHA-256 `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。各行のLFを含むphysical-line hash、IR statement/record semantic digest、legacy ledger row、consumer file hashはpaired JSONに固定した。

FR66–69は全て旧IR revision 1 / specified / frozen、system contract `HR-FR-HIL-23`、acceptance IDs `HAC-HIL-23a/b/c`、system test `HAT-HIL-23`、下流状態 `pending_pair_descent`。共有リンクは由来確認であり、各FRへ独立条件として重複計上しない。HR23の条件・受入は旧functional requirements `:57,86`、HAT-HIL-23は旧L3 test design `:55`、HOT-HIL-56は旧L1 operational test design `:83`を参照する。HATは旧generated definitions `:575`で`designed_not_implemented`。実行済み証拠として扱っていない。旧archiveのruntime/CLI/test/CI等は実行していない。

FR70は旧L1本文と旧IRの該当範囲を検索したが定義がない。本監査はこの範囲でFR70を創作しない。

## 採択状態と現行pair

| 現行pair | exact decision | 照合に使う意味 | 適用境界 |
|---|---|---|---|
| HELIXOS-L2-042 + L11 | `MPR-RC-HELIXOS-L2-042-001`、2026-09-29 57候補判断 row 65。L2 section `75e8b9f7…258e71`、L11 `0f23c039…f76a4df` | Worker成果をassignment scopeに結び、strict schemaとbytes digestの両方が成立するまで未検証。digest単独は正しさ/authorityではない。 | 結果適格性の意味を保持。出力中のcode実行禁止、全第三者Worker、個別FS差分拒否を自動的に含むとはしない。
| HELIXOS-L2-043 + L11 | `MPR-RC-HELIXOS-L2-043-002`、同判断 row 66。L2 `e286b34a…7d9a68`、L11 `136c2c20…078976b` | approval request / tool call / resultを別eventとし、assignment/source/revision/actor/因果関係に結ぶ。欠落は未完で、eventから許可/承認/writeを作らない。 | transport/schema/adapter/runtimeを決めず、旧Node-only approval/write-decision意味も明示的に未計上。
| HELIXSECURITY-L2-031 + L11 | `MPR-RC-HELIXSECURITY-L2-031-001`、同判断 row 90。L2 `db2fd296…532765`、L11 `858ca59a…9f852a` | proposal-only、canonical stateへの直接read/write禁止、選択した追加runtimeの隔離・payload manifest・result/diff receipt・逸脱時隔離。 | 追加runtime（主Worker契約外）に限定。全Worker一般へ拡張しない。
| HELIXLABO-L2-059 + L11 | `MPR-RC-HELIXLABO-L2-059-002`、2026-09-28 LABO decision `:99` | task/cohort条件、Worker/model/effort、費用と人介入などのtask評価材料。 | per-task比較/scorecard grain。per-third-party-delegation security rowと同じものではない。
| HELIXSECURITY-L2-003〜009の選択pair | `HDEC-SECURITY-REQUIREMENTS-2026-09-28`：f6dad2a固定のL2/L11一式＋28明示候補全件を採択。現baseの003/004/005/006/007/008/009の対象section/受入rowはbyte一致。MPRの`registered_proposal / authority_effect:none`とPO採択を混同しない。 | FR64/65の一般隔離・secret/egress/timeout/diff/stop条件に使う。個別の旧CLI/sandbox条件まで拡張しない。 |
| HELIXLABO-L2-065 + L11 | `MPR-RC-HELIXLABO-L2-065-001`、2026-09-29 row 80、条件付き採択D1 | 初回/再試行・資格scope・task scorecard。059とは別の追加観測。 | qualification/task telemetry。sandbox template、bypass interval、quota、security FS findingを持つaudit contractではない。

SECURITYの2026-09-28 PO判断 `HDEC-SECURITY-REQUIREMENTS-2026-09-28` は、f6dad2a固定L2/L11一式と明示28候補全件を採択した。現baseの対象SECURITY-L2-003〜009節と対応L11行はその固定本文と一致する。MPRの`registered_proposal / authority_effect:none`はregister管理状態であり、PO採択結果を覆さない。current section hashesはpaired JSONで、物理行locator末尾の空行LFを除去して末尾LFを1つに正規化したcanonical digestとして記録した。採択decisionが固定したexact digest値は変更していない。decision SHAもpaired JSONに記録した。

## 条件ごとの照合

| 旧条件 | 現行exact行き先 | 判定 |
|---|---|---|
| FR66: 全第三者Worker成果（file含む）のstrict schema/digest/authority-policy再検証、strict-default tiered levels、revalidation receipt | 採択OS042 + L11はassignment-bound worker resultのstrict schema/digestを扱う。採択SECURITY-008/L11はoperationごとのactor/target/operation/revision/environment/scope/expiry authorityを要求。HARNESS-022 + L11はstage別oracle/evidenceを扱う。 | schema/digestと独立のoperation authorityは採択済み。staged strict-default verification policy全体、全third-party output適用、およびoutput→authority-policy判断receiptの結合はこのexact pair setでは明示されない。HARNESS product stageとverification levelは別概念。 |
| FR66: 出力中command/SQL/absolute path/codeを実行しない | 採択SECURITY-008/L11はexecute/install等をoperation-specific authorityへ束縛する。SEC031 proposal-only/canonical boundaryは追加runtimeだけ。OS042は成果適格性。 | 未許可実行を止めるoperation authorityは採択済みだが、他の適用可能権限内でも出力に含まれるcommand/SQL/path/code自体を実行しないというcontent-origin禁止は明記されない。schema/digestやeventから同条件を推定せずsource holding。 |
| FR66: 委譲後FS差分、許可path外write・指示外install/network/test痕跡をrejectし、finding/decisionを出力 | 採択済みSECURITY-006/007/009 L2/L11固定revisionはegress制限、Worker制約適用・観測、逸脱時停止/quarantine。SEC031 L2/L11は追加runtimeのisolated copy/diff/fail-closeを限定する。 | 一般egress/write-path/diff/逸脱処置は採択済み。旧sourceの「指示外」install/network/test痕跡との照合・拒否を全third-party委譲で明示する義務は見つからず、細部をsource holdingに残す。SEC 005–009の採択は9/28正本に基づく。 |
| FR67: task必要filesのみのsparse worktree、git historyなし | SEC031のowner-issued minimal payload manifest/isolated copyはselected extra-runtimeのみ | 最小payloadは部分対応。全Workerのtask-file限定、history exclusionの明示保証なし。
| FR67: payout前secret scan passとreceipt | 採択済みSECURITY-005/L11固定revisionはraw credential/store境界とrepository contamination/external-send detectionを保持。SEC031は追加runtimeのcredential非到達を補強する。 | 一般credential/secret boundaryは採択済み。payout前secret-scan-pass gateとscan receipt outputは現行採択本文に明示されず、別条件としてsource holding。 |
| FR67: payout manifest path+digest | SEC031 L2 431/434/440・L11 107/109/112 | 選択ファイルが必要な追加runtime payloadに対するpath/digest manifestは保持。全FR67 closureは含意しない。
| FR68: process/stdout委譲からstructured approval/tool/result event adapterへ | OS043 + L11 exact adoption | typed event意味と相関は保持。OS043はtransport/schema/adapter/runtimeを明示的に未定義なので、process/stdoutの置換やadapter実装を採択要求とは書かない。
| FR68: Node-only code-held approval response policy / policy digest | 採択OS043/L11はevent相関と権限境界を採択。採択済みSECURITY-008/L11固定revisionはoperationごとのauthorityを定めるが、OS043は唯一のapproval/write-decision ownerを選ばないと明記する。 | operation-specific authorityは採択済み。ただしNode control planeのコード保持policy、unique owner移管、policy digest outputはどのexact pairにも明記されず、旧意味はOS043のsource boundaryで未計上。event相関で充足扱いしない。 |
| FR68: ACP compatibilityを評価、adapter contract versionを出力 | 採択OS043はtransport/adapter/runtimeを対象外 | ACP評価のdecision/記録、delegation adapter契約版の保証は見つからず保持。ACP採用自体や特定runtimeは要求しない。
| FR69: third-party delegation毎にruntime/model/effort・送信分類 | SEC031追加runtime identity/classification、LABO059/065 task scorecard | 異なるscope/grainの部分証拠。per-task model/effortをper-delegation security rowへ昇格させない。
| FR69: sandbox-template版、bypass有効区間、FS差分結果、quota状態 | SEC031の追加runtime差分逸脱・quota failure処置。LABO scorecardはdiff-size等。 | 失敗時の一部結果はあるが、四fieldをdelegation単位に記録する採択要件は確認できない。diff-size metricはsecurity FS findingではない。
| FR69: delegation row/digest chainをTask Performance Scorecardと同一evidence面で共有 | OS042 result bytes digest、OS043 event links、LABO059/065 task scorecard | 個別digest/evidenceは各契約にあるが、security delegation rowから対応scorecard rowへ結ぶdigest/join保証はない。名称・generic traceだけでは closure にしない。

各 current section の正確な引用、section digest、decision file SHA、source line/IR hashはpaired JSONに格納した。要求/採択の採否と実装実績を混ぜず、source条件を満たす実装が存在するとは主張しない。

## 検証範囲

paired JSON parse、旧source file/line hash、現行section/full-file pins、decision rowsとの一致と`git diff --check`を静的検証する。旧test/runtime/CLI/CI、新世代runtime、共通8 gate、137比較は実行しない（137と共通gateはroot担当）。今回変更は監査MD/JSONのみ。
