# confirmed175 BR-02〜BR-05 条件別照合

監査時点: `2026-09-30`
基準: `codex/stage5-local-integration` `f53e387a5dc751e1a6386e0dcd8361af5b702b48`。mainのremote refは `0f5050e2b25cd622640c99c5de170cca087f7d8a`。
固定対象: 2026-09-28のHARNESS/OS/SECURITY判断記録が指す `f6dad2a33e24f000b87d7f09b8d40288257e74cc` のL2/L11本文。
状態: 読取専用の意味照合記録。`authority_effect: none`。採択、formal successor、被覆、Step5完了を主張しない。

## 範囲と既存状態

対象は旧confirmed identity `harness/L1-requirements/business-requirements.md::BR-02`〜`BR-05`、旧source行42〜45、共有資産 `LEGACY-ASSET-9F48ADEEB477DCA54039`。archiveとsource holdingのfile SHA-256はともに `09ad9a27afe25bd730f57319865d1f342e6b31729da2dd27f22ecd6cb753ac61`。行別SHAはBR-02 `8a9c0430…a02e2c`、BR-03 `86d0bd0c…e01424`、BR-04 `546b26ec…9bf5e`、BR-05 `cb912676…dea9ab`。

資産台帳は`source_snapshot_preservation`、`product_target: unresolved`、`source_authority_state: confirmed`、`carry_forward_state: preserved_pending_rehome`、`successor_requirement_ids: []`を保持する。既存の[confirmed175全量監査](legacy-confirmed175-full-audit-2026-09-28.md)の4個票はいずれも`OPEN`で「部分再導出／旧固有条件・反例・数値・出力の一部が未確認」とされる。本記録はその4件の状態や母集団集計を書き換えない。

HARNESS L2/L11本文SHAは `aed75cb4…83100a` / `09b29631…39bcd4`、OS L2/L11は `c92d3c05…1747cf` / `925e06cd…dedd680`、SECURITY L2/L11は `027e6d25…a774c` / `25635649…067c01`。全文と対象revisionは各判断記録を正本とした。対象外の後続候補は対応根拠に含めない。

## BR-02 — AI rosterの責務境界

**旧条件と補足**: 人間POとAI rosterの境界、作成と判断の分離、worker≠verifier、役割境界の機械強制。旧NFR-05（旧`nfr.md:49`）はCI実行・PR許可・権限証跡を対象HEAD/実行世代に結びGitHubに保存する。旧B1/B2（旧`business-requirements.md:248-249`）はsolo PO provisioningと旧L0-L3承認／L4以降AI verifierの境界を補足する。

**固定pairで確認できる条件**: OS-L2/L11-018はassignment/attempt、ticket・要求revision・authority・Worker・scope・期限・budget・evidenceの追跡、handoff、作成Workerの自己承認・自己独立review禁止を定める。L11は二重claim、制約reset、未評価Workerの評価済み扱い、自己承認等を反例に置く（OS L2 `:672-680`、L11 `:345-350`）。OS-020は検収の実行責務を分け、HARNESS-005は変更/risk別の検証義務・oracle・expected failure・evidenceを導く（OS L2 `:692-700`、L11 `:359-364`; HARNESS L2 `:56,118-121`、L11 `:25`）。

**残差と非継承境界**: 現行の独立性はidentity/context/authority等に結びつき、provider名のみで判定しない。旧「PO 1名」「L0/L1/L2-mock/L3」「別runtime/別model」を現行layerや具体的な構成要件へ写さない。旧NFR-05のGitHub権限証跡出力（対象HEAD/実行世代に結ぶ形）と同一schemaは固定pairで確認できない。採択pairには具体的なauthorization-evidence record schemaや実行世代不一致の出力例、数値閾値もない。旧境界や形式を足さず、条件別に未回復として残す。

## BR-03 — 安全な委譲と設計/testの非破壊、回帰検知

**固定pairで確認できる条件**: HARNESS-L2-003は工程開始・凍結・再開条件、未合意/未検証での進行禁止を定め、L11は不確定要素をL2.5で確かめ、意味変更をBackflowする条件を置く。HARNESS-004は変更要求から影響する設計/testと再検証範囲を導出し、HARNESS-005は必要な検証義務・oracle・expected failure・証拠を定める（HARNESS L2 `:54-56,110-121`、L11 `:23-25`）。SECURITY-007/008はWorker環境制約と操作ごとのauthority、OS-018はassignment・scope・停止・handoffおよび自己承認防止を補う（SECURITY L2 `:130-148`、L11 `:31-32`; OS L2 `:672-680`、L11 `:345-350`）。

**残差と非継承境界**: 安全委譲・検証義務・独立reviewの目的は保持される。一方、旧agent guard、特定runtime/model、旧test/CI/job集合の実装形は現行pairへ持ち込まない。旧BR行自体に回帰率・許容数値の指定はない。pairにはoracleと反例、検査省略の記録があるが、BR-03専用の破壊的変更分類表、全ての回帰fixture、出力schemaは閉じていない。旧具体機構を追加せず、既存L2/L11が明記する条件と残差を分ける。

## BR-04 — PoC/検証成果の契約化と本実装への合流

**固定pairで確認できる条件**: HARNESS-L2-002/003はDiscoveryとPoCを開発方式やphaseと区別し、結果をBackflowに戻す。成功した検証だけで要求合意や採用を作らない。OS-L2-017/023はticket/workflow、対象・親revision・scope・依存・受入義務・戻し先、handoff/evidenceを束縛する。L11は同じ入力での再現、未解決入力/依存の停止、誤ったready化やunit成功からの完了推定を反例にする（HARNESS L2 `:53-54`、L11 `:22-23`; OS L2 `:662-670,722-730`、L11 `:338-344,380-385`）。

**残差と非継承境界**: 旧B3（`business-requirements.md:250`）の「2 sprint強制またはrejected判定ロジック」は現行pairの固定停止条件ではない。現行ticket入力にbudget/期限/停止条件があることから二回のsprint上限や同値な拒否判定を作らない。PoC知見の具体artifact、保持期間/consumer handoff、cutoff/rejection/promotionの成功例・反例・出力契約もこのpairだけでは確定しない。実験成功やticket closeからproduction昇格を導かず、旧Discovery workflow実装を継承しない。

## BR-05 — PLAN単位、phase-aware ID、規約違反の機械検知

**固定pairで確認できる条件**: OS-L2-017はtarget/kind/parent revision/scope/dependencies/acceptance obligation/return routeを持つticket graphとworkflow instanceを提供する。OS-L2-023はhandoffをrevision/digest、causal ID、scope、未完義務、停止理由、evidenceに束縛する。L11は入力からの再現、unsupported flowや未解決依存の拒否、unit成功からのticket完了誤推定の禁止を明示する。ticket定義index HXT-TYPE/FLOW/SYSも参照される（OS L2 `:662-670,722-730,752-778`、L11 `:338-344,380-385`）。

**残差と非継承境界**: 固定pairにphase-aware IDの構文、正規表現、具体的なID例・衝突例、ID検査の出力schemaはない。旧BR自身が起票規約とlint仕様をL3 FR/L5へ送っており、ここに数値範囲や閾値も定義していない。ticket graphやHXT indexは旧PLAN単位/ID規約の完全被覆証拠ではない。旧PLANファイル配置・phase label・ID prefix・lint挙動・CLI出力を新しい要求へ無断継承しない。

## 重複確認と静的検証

- local integration branchには既存full-auditのOPEN個票があり、BR-02〜05を完了済みとする別のcondition auditはない。出力は既存JSON/MDを改変せず別の時点監査として作成した。
- main remote ref `0f5050e…`を確認した。公開PR #2387–2392の個別diffをsource identity (`business-requirements.md::BR-02..05`、asset ID、旧source行42–45)で検索し、一致はなかった。各PRの変更出力pathも本記録と異なる。
- 旧source、holding copy、asset ledger、既存4個票、固定L2/L11、PO decision recordsを照合した。旧source line SHA、4個票のidentity/state、target file SHA、JSON構文、参照先path/IDを静的確認済み。
- 旧CLI/runtime/test/CIは実行していない。本文の読取り・ID参照確認は要件採用、実装、実行、受入の証拠ではない。
