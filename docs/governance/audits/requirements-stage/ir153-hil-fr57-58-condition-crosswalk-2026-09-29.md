# IR153 HIL-FR-57/58 Judgment Pack条件別crosswalk

基準HEAD: `17eb59cd9093c8daf12cb2fcc43c24c5e5406ea8`（origin/main）
記録種別: 条件単位の限定静的照合。`authority_effect: none`。
対象: IR153のHIL-FR-57、HIL-FR-58。旧source closure、正式successor割当、要求採択の追加、実装・実行・受入完了を主張しない。

## 対象選定と既存記録

IR153 carry-forward ledgerのHIL-FR-57/58は両方とも`preserved_pending_rehome`、formal successor未割当である。2026-09-28のIR45 row auditは両方を`partial_candidate_mapped_semantic_residual`としており、現行targetは主にHELIXINTELLIGENCE-L2-072候補とHARNESS/OS/LABOの分担契約を挙げている。本照合は、同じJudgment Pack familyの2 identityについて、これらの既存参照を旧sourceの条件・oracleへ戻して最新L2/L11と比較する。

重複範囲を確認した。IR45 row audit、2026-09-28 PO packetの072候補資料、2026-09-29 `specialist-worker-contract-condition-audit`（FR-59/60が対象）、および72候補のcoverage receiptは既存資料として保持する。本資料は新しいreceiptや要求を起こさず、FR-57/58の条件単位比較と現在のauthority境界を記録する。

## Sourceとrevision固定

旧source file: `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md`。file SHA-256: `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`。旧IR: `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json`, SHA-256 `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。Source line SHA-256はcarry-forward ledgerとIR45 row auditの記録を、archiveの該当行と照合した。

現行比較先は`docs/helix-intelligence/L2-requirements/intelligence-requirements.md`（file SHA-256 `14c6947262f7e7cc92e7200cafd301ebd49c4146c97f665f0548c6b2b2e9e16d`）と`docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md`（file SHA-256 `7467fad5256db9af823e7be860e21e52df58efb43ad4855c7127c2053106214d`）。L2-072はPO判断`docs/governance/decisions/po-decision-2026-09-29-57candidates.md:85`でrevision `MPR-RC-HELIXINTELLIGENCE-L2-072-004`、L2/L11の既存節と追補節を連結した複合semantic digest `02e8cd954584625a6f02a757e860aed71b0e5a173ba9c5c846c558c0339699e4`が「条件付き採択：B配置、1.0は候補生成とshadow評価まで」と確定している。対L11 section digestは`381e9d205a6d9fdeb61ec453dfb0ea768c13af6200494544c42cdf67062d302a`。

L2/L11本文に残る「未採択候補」「配置をPO確認に残す」というmetadataは、判断記録より前の固定本文の状態を表す。対象revisionの採択範囲は上記PO判断に従って読む。判断の条件は旧IR identity全体のsuccessor assignmentやsource closureを作らない。

## 旧配置との違い

旧IR carry-forward ledgerのtarget assessmentは`OS`、旧IR構造分類ではFR57のpack観点・反証質問・停止条件をHARNESS、registryの版・保持をOSへ分ける案だった（`docs/governance/legacy-migration/requirement/legacy-requirement-carry-forward.jsonl:90-91`、`docs/governance/legacy-migration/ir/legacy-ir-structure-classification.md:112`）。現行の2026-09-29 PO判断は、072の判断能力候補の意味・適用範囲をINTELLIGENCEへ置き、HARNESSは共通pack・工程・検証契約、OSは登録・状態・実行、LABOは比較・効果評価を保持するB配置を条件付き採択した（L2 `:580-587`; decision `:85`）。これは旧owner routingの完全一致再利用ではなく、候補内容の意味をINTELLIGENCEへ再導出し、共有contract・登録/運転・評価の責務を既存ownerに分けて保持する記録済み差分である。今回の照合はこの対象revision判断を権威状態として扱い、配置差分を理由に旧source identityをretireまたはsuccessor割当しない。

## 条件ごとの照合

| 旧identity・旧source (path:line; line SHA-256) | 旧条件と出力/oracle | 現行L2/L11比較 | 判定 |
|---|---|---|---|
| **HIL-FR-57** `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:147`; line SHA-256 `bf400678929dd5a360b3b3a355c96fab10830facda5f7d8111df82dc5fe59f4f`。IR pointer `#/HIL-FR-57`; ledger row `legacy-requirement-carry-forward.jsonl:90`。 | 工程別の判断目的・観点・反証質問・evidence要求・severity・escalation/停止条件・authority・domain/risk・model適性・versionを持つ。`judgment-core`、role judgment、task lens、専門skillをpackに合成し、重複を避ける。出力はpack、適用性/digest、source skill edge、conflict finding。 | 条件付き採択済みL2-072は、工程/domain/risk/failure mode/authority、scope/revision、選択source/version/applicability、必要evidence/unknown/contradictionから候補descriptorとsource/applicability traceを作る（L2 `:565-572`）。追補は判断目的・観点・反証質問・evidence・severity・escalation/停止条件・model適性・versionと各componentのidentity/version/applicability/source edgeを明記し、同義重複の整理時も由来を保ち、競合はconflict findingとして返す（L2 `:594-595`）。L11のFR57/58 fixtureはsource/version結合、重複整理時のsource edge保持、競合時のconflict/unknownを受入条件にする（L11 `:306-314`）。HARNESS-L2-010/011はpack identity/version・依存・呼出し範囲の共通契約であるが、個別のregistry digest算出/再現をFR57の受入として明記した記述はこのL2/L11範囲では特定できない。 | **部分被覆**。FR57の候補内容・構成source・非重複/競合条件はL2-072/L11に対応し、2026-09-29判断で限定採択されている。適用性/digestのうち、pack/sourceの対象revision・version・applicability追跡はあるが、digestの具体的生成・照合oracleは未確認。IR正式successorは未割当。 |
| **HIL-FR-58** `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:148`; line SHA-256 `b096435ba2e897bccd82ae2e590475a580a170f614cf3caf7ce6c151a8e1a833`。IR pointer `#/HIL-FR-58`; ledger row `legacy-requirement-carry-forward.jsonl:91`。 | finding、review reversal、retry、escaped defect、skill efficacyから不足観点をcandidate化するimprovement loop。candidateあり/なしshadow比較、false-positive/negative、独立review、rollbackを通ったversionのみactiveにし、判断結果を無監査で自己教師化しない。 | L2-072は同一scope/revision/case/oracleでcandidateあり/なしのshadow結果、false-positive/negative、unknown、反例、rollback先・条件・evidenceを同versionへ結び、shadowとindependent reviewを別証跡として要求する。両方が揃っても対象authority/OSが採択・active化するまで候補状態を維持する（L2 `:570`, `:596-598`）。L11 fixtureは比較不能時未評価、independent review、rollback欠落時の非active、owner採択なしの非強制を明示する（L11 `:310-312`）。一方、finding/reversal/retry/escaped defect/skill efficacyをINTELLIGENCEが不足観点候補化し1.0改善loopに使うことは対象候補から除き、LABOの1.0–2.x保持とINTELLIGENCEの3.0以降の改善利用へ版境界を置く（L2 `:596`; L11 `:313`）。 | **部分被覆・版境界あり**。旧FR58のshadow比較・誤判定観測・独立review・rollback・active境界は条件付き採択revisionに限定して保持される。source signalから改善candidateを作るloopは1.0範囲外に明示分離され、後続版側へ保全されているため、FR58全体の閉包とはしない。IR formal successorは未割当。 |

## 残る境界と検証限界

- IR153 ledgerは両identityを`preserved_pending_rehome`、successor ID空欄のまま保持する。この監査は状態を更新せず、条件対応の証拠だけを追加する。
- 条件付き採択の効力は072の指定revisionと「候補生成・shadow評価まで」に限る。候補記載、L11 oracle、判断記録からL3承認、実装許可、shadow実行、active化または受入実績は生じない。
- FR57のdigest oracle、旧IRに記載された下流pair条件、FR58改善signal群の後続版での具体的owner/condition closureは未解決として保持する。旧`別runtime`という独立性基準は2026-09-26 Worker判断に基づく現行identity/context/authority/route条件へ再導出されており、runtime差だけを合格根拠にしない。
- 旧archiveはsource行の参照・SHA照合のみ。旧code、CLI、runtime、test、CIは実行していない。受入fixtureは静的本文上のoracle比較であり、結果は未取得。

`formal_successor_claimed: false`
`coverage_claim: bounded partial condition mapping only`
`acceptance_execution_status: not run`
