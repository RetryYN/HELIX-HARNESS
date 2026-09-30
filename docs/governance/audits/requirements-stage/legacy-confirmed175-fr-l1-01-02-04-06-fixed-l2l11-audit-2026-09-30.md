# confirmed175 FR-L1-01/02/04/06 固定L2/L11条件照合監査

監査はread-only静的照合で、`authority_effect: none`。対象は旧FR-L1-01、02、04、06の4条件。旧原文はsource status `confirmed`、carry-forward state `preserved_pending_rehome`。固定対象はHARNESS/OSのL2/L11一式（revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`）。採択・successor・coverage完了・Step5完了を生成しない。

旧source: `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/functional-requirements.md`、asset `LEGACY-ASSET-6B6C5CB0E481BE01088B`、SHA-256 `a9c1064d359b0d9c7269a2253e416597de77fa91149c162f9a40467be3f1a008`。現行保持snapshotも同じdigest。asset ledgerはsource `confirmed`、`preserved_pending_rehome`、decision status `pending_human_confirmation`を記録する。

固定L2/L11本文SHA-256は、HARNESS L2 `aed75cb4bdd644eedd9d3eb408cf522af2c4fbf4272db7b775edc62fc383100a`、HARNESS L11 `09b2963187f9aaddbb1ad189d77e517e91914bd5ccdf2499dd9c11855139bcd4`、OS L2 `c92d3c052884c05fbbba89fc86f6e6e0c576846e87073327fb0917e32a1747cf`、OS L11 `925e06cd08056d9569dd31703d7f76e5be59b34f85980646c733367af5edd680`。PO判断記録が同revisionの対象bytesを固定している。

| 旧identity / 原文 | 現行固定条件で保持する意味 | 旧固有条件・非継承 | 未解決残差 |
|---|---|---|---|
| `FR-L1-01` (`functional-requirements.md:32`) — 現行V字モデル（L1〜L12）全工程のPLAN起票・進捗管理機能。L0は層外authority anchorとする | L0を層外authority anchorとして扱い、現行V字pairに沿って工程を管理する意味はHARNESS工程規則、採択済みHARNESS-L2-046のFull V/選択Scrum workflow、OS ticket/handoff上の対象・scope・依存・受入義務・戻し先に部分的に現れる。 | 旧L0-L14の番号/pathや、単一PLAN file内の工程表＋実装計画という物理形、旧plan_registry/schema/CLIは現行契約へ移していない。 | HARNESS-L2-046はFull Vと選択Production Scrum scopeのworkflow/backfillを追加する。旧PLAN単一ファイルの物理形、全開発styleのmode→工程/artifact対応、全工程進捗を一体管理するexact出力結合は固定L2/L11から確認できない。 |
| `FR-L1-02` (`functional-requirements.md:33`) — TDD 強制フロー (テストファースト順序厳守・実装先行禁止) | L6↔L7でRed→Green→Refactorと設計pairのtraceを保ち、検証のoracle/evidence義務を求める。 | 旧`helix sprint start/check`・gateや旧test/run/commit IDの機構は現行sourceへ転用しない。 | テストファーストの順序をすべての実装方式・対象で強制し、Red test前の実装を禁止する普遍条件は固定L2/L11に明示されていない。実装方式ごとの適用範囲、許容例外、反例/受入oracleも未確定であり、詳細確認を要する。 |
| `FR-L1-04` (`functional-requirements.md:35`) — PLAN kind による逸脱記録・ドキュメント生成計画 (kind + generates + requires) | 作業の種類/flowと依存を型付けし、対象と依存・受入義務・戻し先をticket/handoffに保持する方向は現行OS規則に部分的に再導出されている。 | 旧PLAN `kind` enum、`generates`宣言と `requires/blocks` のfrontmatter/data shape、旧PLAN lint/生成コマンドや固定PLAN registry schemaは現行規則として継承していない。 | 旧conditionのmode kind→成果物path→依存PLAN、kind付きPLAN record、`generates`による文書生成計画の具体field間対応は固定L2/L11にない。typed ticket graphを旧3 fieldと同一視できず、doc生成の記録/動作もこのtargetだけでは閉じない。 |
| `FR-L1-06` (`functional-requirements.md:37`) — V モデル本線 state 一元管理 (plan_registry / code_catalog / contract_registry / skill_catalog 等 6 種) | 成果物・要求・検証の関係、変更影響/再検証、provenance・event・訂正とhandoff evidenceを追跡する意味は複数の現行L2/L11契約に分散して保持される。 | 旧6 registry群のidentity/schema、単一`harness.db`によるmechanical SSoT、旧direct DB browsing、およびdrive別partitionはこの要求のsuccessor条件として継承していない。旧FR-L1-40のdrive条件をFR-L1-06の継承として足さない。 | PLAN/コード/test/coverageの全対象を一箇所で一致管理し、drift検証結果を利用者へ返すexact state set/owner/relation/oracleはこの固定L2/L11から条件全体としては確認できない。保存/traceの一般契約だけで、一元storeや全成果物の一致判定が成立したとはいえない。 |


## 2026-09-29後発採択pairとの比較

[57候補判断](../../decisions/po-decision-2026-09-29-57candidates.md)と別identity集合の[11候補判断](../../decisions/po-decision-2026-09-29-11candidates.md)に含まれる57＋11 identityを全件比較した。042/036以外ではHARNESS-L2-046がFull Vと選択されたProduction Scrum slice-delta/backfill workflowを、HARNESS-L2-040/041がcanonical layer ledger/catalog/coverageを、HELIXOS-L2-038がOS writer/snapshot/proposal appendを採択。HELIXOS-L2-033は選択engine/detector registryと同一snapshot rerun reproducibilityを、HELIXOS-L2-053はHARNESS-L2-052に依存するFR52操作のatomicityを定める。HARNESS-L2-034は要求別measurement/test evidence契約を定める。

これらの意味近接pairはFR-L1-01のworkflow（046）、FR-L1-02の選択検証/evidence（033/034/036）、FR-L1-04/06のlayer ledger/registry記録（033/040/041/038/053）に限定的に関係するが、全工程PLAN、汎用`kind`/`generates`/`requires`、全成果物の統合store/drift oracle、全対象のRed-before-Greenを定めない。各条件の限定効果をJSONへ記録し、残差は維持する。

## 照合根拠

- FR-L1-01: HARNESS L2 001/003（L2本文 `:52,54`、詳細 `:99,108,112-113`）、OS L2 017/019/023（`:662-670,682-690,722-730`）、両L11。工程/pair規則と対象・scope・依存・受入義務・戻し先は対応するが、旧PLANの単一ファイル形と全工程の明示的起票/進捗oracleは対応済みとしない。
- FR-L1-02: HARNESS L2 003/005（`:54,56,108-121`）とL11 `:23,25,43-57`。Red→Green→Refactorは保持点。全実装方式に対する普遍的な実装先行禁止の条件は確認できない。
- FR-L1-04: OS L2 017/023（`:662-670,722-730`）、HARNESS L2 001/002/003（`:52-54,98-105`）、OS L11 `:338-344,380-385`。typed ticket/workflowと依存は対応するが、旧`kind`/`generates`/`requires` exact fieldと文書生成計画は未閉包。
- FR-L1-06: HARNESS L2 004/005（`:55-56,114-121`）、OS L2 019/023（`:682-690,722-730`）、対応L11。trace、再検証義務、provenance/continuity/evidence handoffは保持点。旧6 registry、`harness.db`の機械SSoT、drive別physical partitionは現行条件へ足さない。FR-L1-40のdrive条件も本監査のsuccessorとして扱わない。

旧L3機能要求はFR-01 `:71-91`、FR-02 `:95-115`、FR-04 `:149-169`、FR-06 `:197-216`に正常/異常/boundary consumer条件を記述する。旧physical-data `:20-42,46-64,124-145,208-212`は旧PLAN/DB物理形を記述する。これらはfailure/consumerの把握に参照しただけで現行へ移さない。旧source/test/runtime/CIは実行していない。

## 重複照合

`PR base` (`942f2e985f3af161ea4027b1691659a436860bc2`) で該当4 identityを含むaudit pathを列挙したところ、既存のconfirmed175全量監査（4行OPEN）とREG-06 population/join auditのみだった。別の個別L2/L11条件照合は見つからなかった。PR #2387–2392の変更pathは別のFRS/World Governance/Concept-v4 source auditであり、指定identityの条件照合監査と重ならない。詳細はJSONの`duplicate_audit_scan`に記録した。

## 結論と限界

4件はすべて部分的な意味対応と未解決残差を持つ。2026-09-29に採択済みの関連pairを固定revisionと対L11で追加比較したが、formal successorはなく、既存full auditのOPEN状態も維持する。原要求は`preserved_pending_rehome`のまま、successor IDは付与しない。採択・完全coverage・Step5完了・実装成功は主張しない。
