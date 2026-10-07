# INFRA Stage 5 Worker共通契約owner review01修正追補（#2659 / #6039983344）

status: audit_supplement  
authority_effect: none  
reviewed_head: `01f6b8ca0a846b5cdec22750056be9540cb5dbbe`  
base: `5efdf02678baebdb4be14987f4f5ab7af85bf823`

## 修正内容

正式review01 comment `6039983344` のMajor 3件・Minor 4件に対応した。修正はINFRA Stage 5のL3/L10 functional pairと新しい監査追補だけである。

- Major 1: L10 CASE-049/050/051のWorker共通契約ownerをHELIX-OSに合わせた。具体contract identity/revision/sourceがunknownでも責務ownerはunknownにしない。資源source ownerは従来どおりunknownを保持する。
- Major 2: L3 CASE-071の契約欠落をHELIX-OS契約ownerへ返し、L10と一致させた。欠落した別fieldのownerが固定親で特定できないときだけunknownを残す。
- Major 3: 旧追補mdのCASE-049〜051修正済みという記述とevidence JSONの`all_worker_common_contract_owner_unknowns_resolved: true`は、当時のL10 CASE-049〜051に旧unknownが残っていたため全体完了の証拠として誤っていた。旧md/JSONは不変のまま保存し、この追補がその完了主張を訂正する。現在の修正後本文と旧記録を混同しない。
- Minor 1: 固定親の責務分担locatorをOS governance requirements **549行**、INFRA L2-025 **292行**へ直した。従来記録の548/291は各段落の直前行だった。HELIXOS-L2-004という要求IDと、governance requirementsの物理行538は`HELIXOS-L2-004（docs/helix-os/L2-requirements/governance-requirements.md:538）`と分けて示す。
- Minor 2: 項目07、L3 CASE-019、L10 CASE-047のresource不足・OS条件・SECURITY条件の戻し先を、それぞれの既存ownerへ戻す形にそろえた。
- Minor 3: 項目17の具体out-of-band contract identity/revision/sourceがmissing/unknown/staleの場合は未完状態を保持する。OS停止中にOS runtime、ticket、通常L2-009応答を開始条件にせず、復帰後に未完契約状態とoperation/resultをOS Work/Changeへ同期し、OS契約ownerへ返す。これは固定L11:148の独立復旧oracleに対応する。resource/recovery source owner unknownは維持した。
- Minor 4: OOB owner/戻し先の固定親locatorを読み直し、行番号を上記の実在箇所へ訂正した。

## 固定親と旧source

固定OS L2-004:538は共通Worker実行契約をHELIX-OSの責務とする。OS governance requirements:549はSECURITYのauthority/隔離、INFRASTRUCTUREの実資源・状態、INTELLIGENCEの配置案を分離する。INFRA L2-025:292も、実資源と状態・実資源上で適用する隔離条件をINFRASTRUCTUREに置き、Worker/ticketの正本を移さない。INFRA L2-010:132はOS停止時に独立resource/pathと別SECURITY authorityでrecoveryを開始できること、ticket/通常L2-009応答を開始条件にしないこと、復旧後のOS同期を定める。L11:148はoperation/resultの復旧後同期を確認する。

旧資産 `LEGACY-ASSET-9114D4E463E95B67DD0C` の `worker-common-contract.md:55–60, 95–99, 129` を起点として読んだ。版付きWorker descriptor、隔離された実行、receipt/evidenceの意味をsource lineageとして保持する。旧owner配置やCLI/wrapper/sandbox/runtime/testは現行に複製・実行しない。現行ownerはPOの2026-09-26判断:87–88と固定OS L2-004から再導出し、具体contract identityの欠落とは分離する。

## 検証と境界

静的確認では、Worker共通契約の責務ownerがunknownのまま残る修正対象表記がFR/FVにないこと、L3/FVのCASE-049/050/051およびCASE-071がOS ownerで一致すること、resource/recovery source ownerのunknownが残ること、項目07とCASE-019/047のOS/SECURITY戻し先が各々明示されること、項目17のOS停止・復帰後同期境界を確認する。旧root-correction/evidenceは書き換えていない。

fixtureは未実行。旧CLI/runtime/test/CI、新世代CIは実行していない。独立再review条件1/2、L3承認、実装・実行許可は未成立であり、本記録は作成側の修正証拠である。commit/push/comment/Ready/mergeは行っていない。

固定親、旧source、review comment、既存監査recordのfull/span SHA-256と修正本文SHA-256、静的照合結果は同directoryの`l3-infra-worker-contract-owner-review01-repair-evidence-2026-10-07-6039983344.json`に記録する。
