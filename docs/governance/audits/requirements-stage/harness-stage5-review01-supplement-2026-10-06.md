# #2621 HARNESS Stage5 review01 補正追補（2026-10-06）

この追補は正式comment `6004989306`（Major 20 / Minor 19）に対する本文処置と静的照合の時点記録である。既存のsource audit、Root resolution audit、Root acceptance auditは変更していない。L3承認・実装許可・実行結果は生成しない。CASEはすべて未実行の設計fixtureである。

## 固定対象と検証

- 正式comment本文SHA-256: `880f709d6586d6752d128394c0b72ec672df34672a09383e279033131f0d6977`（API JSON SHA-256: `2e22635ee1853e1dbcfd244c28ccc3eb7d63a687b6e42a51900792b355690ccb`）。
- body commits: `72451ca6`, `808c225c`, `9d6792f0`。Stage5より前のprefixを末尾LFを正規化せず比較したところ、Worker body HEADでは1/6一致、5/6はStage5 suffix直前に余分なLFが1個あった。初回の検査は末尾LFを除去して比較しており6/6と誤記したため、ここに訂正する。
- CASE行: 174件、親別 021=16 / 025=33 / 033=36 / 035=32 / 037=57。NFR索引aliasを重複除外した設計fixture母集団は171件。全CASE literalと行SHA-256はJSONの`case_inventory.all_case_rows_literal_sha256_raw_lf`に保存。
- `git diff --check`成功。ID一意性、CASE→AC、NFR/NV→CASE参照を静的に照合。旧runtime/test/CLI/hook/CIは起動していない。

## Prefix比較の訂正

初回checkはStage5 suffixより前を`rstrip("\n")`で正規化してから比較していた。raw bytesの再比較では、body HEAD `9d6792f031785bd74f917f913f1eb76df45b49f7`時点で functional-verification のみ完全一致し、他の5本文はsuffix直前のLFが1個多かった。従ってprefix保持の完全一致は6/6ではなく1/6である。本文差分とこのWorker時点の検査誤りを追補に残し、後続の修正結果は独立検収で確認する。

## Finding処置

- **M01** — S5-013の互換差を不合格/保留として扱い、L2にない009/template ownerを返し先から除去。設計/pair不足だけ026/022形成へ。（`CASE-HARNESS-L10-025-S5-013; FR-025 invariants`）
- **M02** — CORE connector契約version unknownはconnection/compositeを保留。固定L2に戻し先がないためownerを新設せず、形成不備のときだけ026/022へ。（`CASE-HARNESS-L10-025-S5-012; FR-025 invariants`）
- **M03** — alternativeをFR出力へ復元し、意味変更案を採用せずL2-008/上流へ戻すACと単独CASEを追加。（`AC-HARNESS-L3-025-05; CASE-HARNESS-L10-025-S5-031`）
- **M04** — receiptの対象revision単独不一致を、receipt自体は存在するCASEとして追加。（`CASE-HARNESS-L10-033-S5-026; AC-HARNESS-L3-033-05`）
- **M05** — 修正前receipt存在・結果passと修正後receipt存在・結果failを別々の単独fixtureに追加。（`CASE-HARNESS-L10-033-S5-027; CASE-HARNESS-L10-033-S5-028`）
- **M06** — 未選択consumerのreceiptをexecuted扱いする単独反例を追加。（`CASE-HARNESS-L10-033-S5-029; AC-HARNESS-L3-033-05`）
- **M07** — case/trace/run receiptから022段階状態を進めない単独反例を追加。（`CASE-HARNESS-L10-033-S5-030; AC-HARNESS-L3-033-04`）
- **M08** — 固定L2/L11範囲を拡張。pack更新後010/011再照合・未実行candidate再結付け、022契約更新後のstale再生成、旧receipt流用拒否をACとCASEに同期。（`FR-033; AC-HARNESS-L3-033-06; CASE-HARNESS-L10-033-S5-031..033`）
- **M09** — 候補生成に将来pass receipt不要のnormalと、receipt欠落だけで開始を拒否する反例を追加。FR入力に選択時014 pair/design、032 connection/consumer、OS-020または利用者CI executor identity/compatibilityを追記。（`CASE-HARNESS-L10-033-S5-034..035; FR-033 input; AC-HARNESS-L3-033-03`）
- **M10** — 安全処理未実施のsanitized incident inputを単独変異として追加し、security/data ownerへ戻す。（`CASE-HARNESS-L10-033-S5-036; AC-HARNESS-L3-033-07`）
- **M11** — FR親参照をL2:719–729,931–941へ拡張。複雑さ/公開面/運用負債の変更前後測定、測定前の起草開始、機能数だけで結論しない条件、欠測非相殺、閾値非創作をAC/CASE/NFRへ同期。（`FR-035; AC-HARNESS-L3-035-05/-06; CASE-HARNESS-L10-035-S5-027..029; NFR-035`）
- **M12** — OS registrationがあっても受入寄与relation欠落から人の合意や実行権限を作らない単独fixture追加。（`CASE-HARNESS-L10-035-S5-032; AC-HARNESS-L3-035-08`）
- **M13** — 上流訂正後に旧revisionの導出receiptだけを再利用するケースを追加し、source/要求形成ownerへ戻す。（`CASE-HARNESS-L10-035-S5-030; AC-HARNESS-L3-035-07`）
- **M14** — OS registration/ticket/runなしでCORE意味照合するnormalを追加。既存OS操作から意味照合を生成しない反例も追加。（`CASE-HARNESS-L10-035-S5-031..032; AC-HARNESS-L3-035-08`）
- **M15** — Phase2 L9 receiptのtarget revisionがmerge対象より古い単独CASE追加。（`CASE-HARNESS-L10-037-S5-043; AC-HARNESS-L3-037-03`）
- **M16** — merge receiptだけ、設計文書だけを与える2つの独立negativeを追加。（`CASE-HARNESS-L10-037-S5-044..045; AC-HARNESS-L3-037-04`）
- **M17** — HARNESSによるauthority書換え、OS passで意味gapを閉じる、Phase2でPhase1意味を上書きする各単独CASEを追加。（`CASE-HARNESS-L10-037-S5-046..048; AC-HARNESS-L3-037-03`）
- **M18** — Backflow後のaffected-pair stale再照合をFR不変条件へ追加。旧receipt流用negativeとfixture作成者に非開示の上流変更normal/再評価を追加。（`CASE-HARNESS-L10-037-S5-049..050; FR-037 invariants; AC-HARNESS-L3-037-03`）
- **M19** — 別々のPhase1/Phase2 L3 identityを一つへ黙って畳むnegativeを追加。（`CASE-HARNESS-L10-037-S5-051; AC-HARNESS-L3-037-03`）
- **M20** — 互換range外versionとgap listなしsuccessを独立fixtureに分離。（`CASE-HARNESS-L10-037-S5-052; CASE-HARNESS-L10-037-S5-057; AC-HARNESS-L3-037-01/-03`）
- **m01** — 固定親にないpermission/design ownerを削除。意味差は008/上流、design/pair欠落は026/022形成のみ。（`CASE-HARNESS-L10-025-S5-005; FR-025 invariants`）
- **m02** — 伏せた未見actor normalと、oracle未定transition negativeを別単独CASE化。（`CASE-HARNESS-L10-025-S5-032..033; AC-HARNESS-L3-025-06`）
- **m03** — FR-025 outputにalternativeを含む。（`FR-025 output`）
- **m04** — 026 output contract/scope交換後に026 receiptだけ旧revisionという交換前提をS5-009に明記。（`CASE-HARNESS-L10-025-S5-009; L11:350–356`）
- **m05** — 構成体固有oracle不足を要求/設計ownerへ戻す既存表現へ修正。（`CASE-HARNESS-L10-021-S5-002`）
- **m06** — 実行receiptの文言をOSのみに修正。LABOは評価/提案を返し、実行しない。（`CASE-HARNESS-L10-021-S5-005`）
- **m07** — NFR/NV planned集合を親ごとに全001–NNへ揃え、CASE列の通算を修正。現行174行、3 aliasを除く171独立実行fixture。（`nfr-grade.md; nfr-verification.md; parent totals 16/33/36/32/57`）
- **m08** — 033の005/024、006/025重複索引を明記。各pairのreturn ownerを揃え、alias行はplanned denominatorへ重複加算しない。（`CASE-HARNESS-L10-033-S5-005/006/024/025; NFR-033`）
- **m09** — FR-033入力へL2-014対設計と選択executor契約を追加。（`FR-033 input; L2:675–681`）
- **m10** — root-resolution既存監査は不変。追加したCASE-033-S5-030により022 stage conflation negativeを本文で検証予定にした。（`CASE-HARNESS-L10-033-S5-030; prior root audit hash-pinned`）
- **m11** — S5-018をA↔B相互edgeだけのrootless negativeへ限定、004自己循環は維持。初回追補に加えた相互negative重複行S5-033は保持せず、条件を018へ移行。（`CASE-HARNESS-L10-035-S5-004/018; CASE inventory records 033 absent`）
- **m12** — AC-035-01から固定L2にない009/template適用条件を除去。（`AC-HARNESS-L3-035-01`）
- **m13** — source provenance欠落はsource owner、形成不足は要求形成owner、上流意味変更だけ既存人間判断へ分岐。新owner/approvalは追加しない。（`FR-035 AC-04/invariants`）
- **m14** — FR-037戻し先を固定L2に列挙されたL2-009義務形成、L2-008/上流、L2-022形成、OS boundary、当該artifact/result source ownerへ区分。（`FR-037 invariants; CASE-HARNESS-L10-037-S5-016/017/019/027/043/046..050`）
- **m15** — AC-037-04に内部OS suite不要、旧構造差だけで拒否しない、新人間承認を固定しない境界を追記し各々単独CASE追加。（`AC-HARNESS-L3-037-04; CASE-HARNESS-L10-037-S5-054..056`）
- **m16** — S5-041 traceをAC-01へ変更。S5-005/023は重複索引として統合fixture扱い。S5-006/027はphase-L4対receipt scopeとreceipt対merge scopeへ分離し別条件化。（`CASE-HARNESS-L10-037-S5-005/006/023/027/041; NFR-037`）
- **m17** — L11 fixed range citation updated to 527–573, preserving exact meaning range.（`FR parent table for 037`）
- **m18** — M17 Phase2-overwrites-Phase1 case includes reverse direction of the same semantic invariant as an independent row.（`CASE-HARNESS-L10-037-S5-048`）
- **m19** — old-numbered Stage5 IDs are preserved; NFR indexes list complete parent ranges, include count arithmetic and explicit alias deduplication.（`NFR/NV parent-set tables; CASE inventory`）

## Worker時点の未解消点

Rootの独立本文読取により、次の本文補正が必要と判明した。これは本追補作成時点では未修正で、Rootが引継ぎ後に補正する。

- M11: S5-027..029だけでは、運用負債のみ欠測、公開面のみ欠測、旧revision計測の流用、機能数だけで最小必要とする主張、根拠のない共通閾値で許可/拒否する主張を各単独CASEで検証できない。
- M12: S5-032のoracleに、OS registration/ticket/execution receiptが実行権限を作らない条件が明記されていない。
- body HEAD `9d6792f031785bd74f917f913f1eb76df45b49f7`に対するraw-byte prefix比較は1/6一致。残る5文書はStage5 suffix直前にLFが1個多い。初回の末尾LF正規化検査は6/6と誤報した。

従って本文はRootの後続修正と独立検収を残し、CASEはすべて未実行の設計fixtureである。

## CASEの保存と訂正

初回published HEADの139 CASE行を保持し、変更行はJSONに旧literal/SHAと新literal/SHAの対で記録した。新しい単独fixtureを追加し、同一条件として認めた索引aliasはNFR分母へ重複加算しない。035の作業中に追加した暫定S5-033は、L2:727の自己循環CASE-004と区別すべき相互edge条件をCASE-018へ移し、暫定行は最終本文に残していない。

## Sourceと旧監査

固定L2/L11の全文相当spanと旧sourceの読取spanはJSONにUTF-8 literal、raw-LF SHA-256、file SHA-256で保存した。旧035 sourceはHIL-FR-38/HIL-NFR-07/23およびHAT/HST/HOTの根拠から意味を再導出し、legacy runtime/testを実行していない。025の直接対応旧L3/paired consumerが特定できない点は既存inventoryの限定検索記録を参照し、旧asset不存在をarchive全体へ一般化しない。

旧監査ファイルの改変は禁止し、追補は本JSONと本Markdownだけへ追加する。JSONには既存source audit / root resolution / root acceptanceのSHA-256 pin、全CASE行、全findingのformal原文と処置を含む。
