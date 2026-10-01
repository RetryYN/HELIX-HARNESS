# IR153 HIL-FR-61〜65 現行L2/L11条件別照合

基準commit: `432ca78c4465bee9d1463ff995e299f80ea1fff1`。対象は旧L1要求の5行（物理行151〜155）で、source assetは`LEGACY-ASSET-719D5EC9C06FC4AAD0FF`。旧source全体の移行、formal successor、実装成立は主張しない。旧source、IR、HR/HAC/HAT/HOTは読み取り照合のみとし、旧runtime、test、CI、CLIは実行していない。

## 参照sourceとauthority

旧要求sourceは`archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md`、file SHA-256 `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`。各物理行のSHA-256はJSONに収録した。要求IRは旧`requirements-ir/requirements.json`（SHA-256 `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`）で、61〜65の各statement semantic digestとprimary consumerはJSONに固定した。

旧consumer contextは`LEGACY-ASSET-C7F0C3B79CBAA72960BF`の旧`infinity-loop-functional-requirements.md:56-57,85-86`（file SHA `8a46a6a75f1c6159b45b09bd975298347f70997b7969231a0514c09db210dab6`）、`LEGACY-ASSET-FA8C6E69463183D6A19B`の旧`L3-infinity-loop-acceptance-test-design.md:54-55`（file SHA `a1c17544425ac8c2976236dc7899005ab1098e2e86195cbd99d54af13193941a`）、および`LEGACY-ASSET-AFE91778057B7E76BEEC`の旧`L1-infinity-loop-operational-test-design.md:81-83`（file SHA `4f8f67664e360dcb8b40f9c834953d026c9bf3b359a79a64e68fa2296689e576`。いずれも歴史的設計/oracleであり現行契約や実行証拠ではない。

## 条件別の照合結果

| 旧要求 | 現行の正確な行き先と保持 | 残差・authorityの区別 |
|---|---|---|
| FR61 line 151 | LABO-L2-065 / 対L11-065の選択資格scopeが、machine smokeとblind full-benchを別結果にし、correctness・mutation kill・instruction/scope・skill A/B・quality・concision・security・second-diff extensibilityの8軸すべてを同じfixture/rubric版で評価、不能軸を未完として残す。L11はmanifest、machine/blind score、fixture/rubric digestと、smokeだけで資格成立としない反例も明記する。 | exact revisionは2026-09-29 PO判断57候補行80で条件付き採択（D1、067と別指標、「最初のAttemptの結果」）。decisionはL2 digest `6f50887b…cf019`、L11 digest `c70905fd…d9b1b6`を固定。これは選択資格scope内の条件付き採択で、通常Workerすべてへのfull bench、旧FR61全体のsuccessor、admission実行を意味しない。source receiptは61/62の2原文行を対象にする。 |
| FR62 line 152 | 同じLABO-L2/L11-065は実taskごとの`first_pass`、`retry_count`、適用時のdiff/lint測定定義・単位・版・receipt、quality judge、L2-059の品質gateとretry/救援等を含むeffective costを結ぶ。異なるtask class/scope/定義/revisionを混ぜたtrendを拒み、用途別判断は既存ownerの判断または未決を参照する。 | 上記と同じexact pairの条件付き採択。`first_pass`と`retry_count`を067のfirst-eligible/repair-roundや068のAttempt countへ換算・統合しない。旧FR62の列挙出力をL2-065の採択だけで一般scorecard/全旧consumerへ広げない。採択済みL2-059の同条件比較・費用境界は補助条件であり、065の完全なsuccessor印とは区別する。 |
| FR63 line 153 | 採択済みLABO-L2-059 §effort選択（2026-09-28 `MPR-RC-HELIXLABO-L2-059-002`）は、同じtask class/snapshot/scope/oracle/run protocol下のeffort別実績を比較材料としてINTELLIGENCE-L2-010へ渡す。INTELLIGENCE-L2-010/-011は2026-09-28 PO判断 `HDEC-INTELLIGENCE-REQUIREMENTS-2026-09-28` で固定f6dad2a revision、MPR `-010-004`/`-011-004`として採択済み。前者はtask属性と実績に基づく配置proposal、後者は同一corpus/scopeのmodel/provider比較を返し、実割当はOSに残す。 | 旧条件のupper-tier low/medium既定、lightweight high既定と、品質不足時にeffort増を先決せずmodel/runtime escalationと比較して最小有効構成を選ぶ規則は、これらの採択済み本文にない。採択状態を認めたうえで、旧routing条件は未保持として残す。旧固定model階層や具体runtimeを現行へ推測移植しない。 |
| FR64 line 154 | SECURITYの2026-09-28 PO判断 `HDEC-SECURITY-REQUIREMENTS-2026-09-28` はf6dad2aのL2/L11固定revisionと明示28候補全件を採択している。現行baseのL2/L11 `HELIXSECURITY-L2-003/004/005/006/007/009`各対象節・受入行は固定revisionとbyte一致する。これらはproject/environment/worktree隔離、credential非露出、default-deny通信、write path/network/credential/environment/timeout/resource/diff/rollback制約の適用・観測、逸脱時の停止/quarantineを保持する。 | **採択済み一般条件**は上記。別途、書込を払い出しworktree/scratchだけへ限定、`.helix/`やDBの非bind、第三者CLI設定をbackup付きmerge/appendのみに限定、versioned template digestと実測egress差分を同じ逸脱/quarantine結果へ結ぶ条件は、当該採択本文で具体化されていない。これらを保持済み扱いせず、旧物理機構も推測移植しない。registerの`registered_proposal`/`authority_effect:none`は登録管理metadataで、PO判断の採択を覆さない。 |
| FR65 line 155 | 採択済みSECURITY-L2-007のL2/L11固定revisionにはenvironment variable最小化、timeoutを含む各制約の適用・観測義務がある。L11-007はtimeoutを含むいずれかの制約が未適用/unknown、またはhost fallbackなら不合格とする。raw secret境界は採択済みL2/L11-005にある。 | timeout保証と適用確認は採択済み。したがって「timeoutなしでも一般契約に通る」という反例は誤りとして除去した。promptをstdinで渡すこと、stdin消費CLIの明示close、timeoutなし委譲をlint/doctorで検出すること、およびwall-clockというsource固有表記は現行L2/L11に明示されていない。allow-list方式や複合出力manifestも特定されていないため、これらの条件のみ残差として保持する。 |

## SECURITY / INTELLIGENCEの採択revision照合

SECURITYの2026-09-28 PO判断（decision file SHA-256はpaired JSON）には、対象L1 revisionを確定し、f6dad2aのL2/L11一式と明示候補28件をすべて採用するとある。L2/L11のwhole-file bytesはその後追補により現baseで変化しているが、FR64/65で使用した003/004/005/006/007/009の各要件節・受入行は同decisionが固定した本文と個別にbyte一致する。Decision成立とMPRの`registered_proposal`/`authority_effect:none`は別の管理情報である。INTELLIGENCEの同日decisionもf6dad2aのL2/L11と明示54候補を採択しており、FR63で参照した010/011は現baseで固定section bytesと一致する。exact section digests、decision hashes、MPR IDsはJSONに収録した。

## 判断・限界

LABO-065の候補表記だけを根拠に未採択とはしていない。exact 2026-09-29 decision row 80が該当L2/L11 revisionを条件付き採択しているため、FR61/62はその選択scopeとD1境界で評価した。一方、Security L2/L11の候補記載や一般principle、旧HR/HAC/HAT/HOTのtraceだけからFR63〜65の上記不足条件を満たしたとは判定しない。旧FR63〜65も旧IR上はdefinition frozenだが、旧設計・oracleのstatusは現行authorityへ移らない。

残差があることは新候補の起草や特定実装方式の採用をこの監査で行ったことを意味しない。新ID予約と候補化が必要な残差の判断はrootへ引き継ぐ。formal successor、実行・受入成功、runtime実装を未確認のまま成立としない。
