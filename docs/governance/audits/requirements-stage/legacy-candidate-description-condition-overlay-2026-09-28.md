# 旧candidate description-class 10行の条件分類追補（#2253/#2254後）

## 範囲と位置づけ

基準commit: `249b1f648ce8ece4c6de82917910a752fa94a449`。このappend-only監査は、旧candidate routing JSONLで `explanation` と分類された指定10行だけを、条件を含むsource lineとして再分類する。人間向け一覧は[JSON証跡](legacy-candidate-description-condition-overlay-2026-09-28.json)に対応する。旧sourceは参照のみであり、旧CLI/runtime/test/CIは実行していない。

対象10行は、個別の適用条件、拒否条件、順序・完了条件が行内に明記されているため、条件として再確認した。これはsource条件を失わず後続reviewへ送るための分類補正であり、要求採択、現行L2/L11へのcoverage、正式なsuccessor割当を意味しない。

## 固定snapshot・既訂正との関係

元routing JSONLの分類は `structure/explanation/requirement_atom = 926/2,959/870`。#2253は `LEGACY-CAND-LINE-000142` を、#2254は `LEGACY-CAND-LINE-003082` を各1行、`explanation` から条件/requirement atomへ訂正している。したがって本追補前の累積基準は `926/2,957/872`、condition内のunknown routeは576行である。今回の10行はこの2行とID集合が交差しない。

| 集計軸 | #2253/#2254後の基準 | 本追補後 |
|---|---:|---:|
| structure | 926 | 926 |
| explanation | 2,957 | 2,947 |
| condition（requirement atom相当の条件行） | 872 | 882 |
| 合計 | 4,755 | 4,755 |
| condition内のunknown route | 576 | 586 |

unknownはcondition行のroute状態であり、source classの追加bucketではない。今回の10行はsnapshot上では `non_requirement_source_structure_or_explanation` routeだが、条件として見直した後も条件別coverageは未確認のため、effective routeをunknownとして累積する。既存の141 source-relation-unresolved行と155 unadopted-candidate-relation行の数値は変わらない。

## 行別source evidence

### 1. `LEGACY-CAND-LINE-003505`

- 旧資産: `LEGACY-ASSET-AE48728497244121EEC3` — `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/refactoring-trigger-admission-acceptance.md:22`
- File SHA-256: `66609d952094050336a3e29abf088c18178590fb5998dbbd06dc1fecb4b79251`
- Line SHA-256: `d1a17300c71dc7c67a78a1eb308ba683a471da3ba2b3b55fc98e8cde6de0b98c`
- 原文: | RTG-AC-003 | RTG-R-02 | hard trigger、threshold、trend、recurrence、release boundary、provider change、safety-netを別々に実証する | 単一metric、LOC、file size、Issue数、AI評価だけでadmitしない |
- 条件として保全する意味: 複数のtrigger/admission要素を別々に実証し、単一metric等だけでadmitしない条件。
- 分類理由: 複合条件の個別実証と明示的な拒否条件が同一行にある。
- snapshot: `explanation` / `non_requirement_source_structure_or_explanation`
- current IDs: `[]`; adopted current IDs: `[]`; later candidate IDs: `[]`
- effective condition route: `unknown`。ID relationは参照事実として記録し、意味coverage・successor・採択の証拠とは扱わない。
- #2253/#2254訂正対象: いいえ。

### 2. `LEGACY-CAND-LINE-003504`

- 旧資産: `LEGACY-ASSET-AE48728497244121EEC3` — `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/refactoring-trigger-admission-acceptance.md:21`
- File SHA-256: `66609d952094050336a3e29abf088c18178590fb5998dbbd06dc1fecb4b79251`
- Line SHA-256: `d34da3c2ae88839bb7b3f38ae5b2f305db3b2536f2d22d54f84813b9810efe67`
- 原文: | RTG-AC-002 | RTG-R-01 | threshold、window、minimum sample、hysteresis、cooldown、expiryを一件ずつ別判定する | stale policy、wrong baseline、window無視を拒否 |
- 条件として保全する意味: threshold、window、minimum sample、hysteresis、cooldown、expiryの個別判定、およびstale policy等の拒否。
- 分類理由: 判定対象と拒否する反例が具体的に列挙されている。
- snapshot: `explanation` / `non_requirement_source_structure_or_explanation`
- current IDs: `[]`; adopted current IDs: `[]`; later candidate IDs: `[]`
- effective condition route: `unknown`。ID relationは参照事実として記録し、意味coverage・successor・採択の証拠とは扱わない。
- #2253/#2254訂正対象: いいえ。

### 3. `LEGACY-CAND-LINE-003514`

- 旧資産: `LEGACY-ASSET-AE48728497244121EEC3` — `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/refactoring-trigger-admission-acceptance.md:31`
- File SHA-256: `66609d952094050336a3e29abf088c18178590fb5998dbbd06dc1fecb4b79251`
- Line SHA-256: `3ac63a4cfa41777d940bed5e6ee011c04aa00f487bed296cfb1c2a74aad55477`
- 原文: | RTG-AC-012 | RTG-R-06 | false-positive、missed-trigger、duplicate、coverage、lead time、rework、CI costをbefore／after比較する | 単一改善値だけでadoptionを確定しない |
- 条件として保全する意味: 複数品質指標のbefore/after比較を要求し、単一改善値だけでadoptionを確定しない。
- 分類理由: 比較対象とadoption否定条件が明記されている。
- snapshot: `explanation` / `non_requirement_source_structure_or_explanation`
- current IDs: `[]`; adopted current IDs: `[]`; later candidate IDs: `[]`
- effective condition route: `unknown`。ID relationは参照事実として記録し、意味coverage・successor・採択の証拠とは扱わない。
- #2253/#2254訂正対象: いいえ。

### 4. `LEGACY-CAND-LINE-003612`

- 旧資産: `LEGACY-ASSET-00C7DF9250F8A9A25B24` — `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/requirement-formation-scoped-admission-acceptance.md:37`
- File SHA-256: `c3f62478904e620eced270996360274e2840f9d94eca117d838d0e6dfeda7a86`
- Line SHA-256: `bafb2bae38d5e4363a90e58405e44e1e4544e85adfaa2b318bef2425a873065c`
- 原文: | RFA-AC-16 | RFA-GH-02 | dispatch/実行/ready/mergeが同authority/HEAD/scopeを照合。docs path免除・探索mergeの実装許可化・required skipを拒否 |
- 条件として保全する意味: dispatch/実行/ready/mergeでauthority・HEAD・scopeを照合し、免除・許可化・required skipを拒否する。
- 分類理由: 段階ごとの照合条件と禁止条件が明記されている。
- snapshot: `explanation` / `non_requirement_source_structure_or_explanation`
- current IDs: `[]`; adopted current IDs: `[]`; later candidate IDs: `[]`
- effective condition route: `unknown`。ID relationは参照事実として記録し、意味coverage・successor・採択の証拠とは扱わない。
- #2253/#2254訂正対象: いいえ。

### 5. `LEGACY-CAND-LINE-001588`

- 旧資産: `LEGACY-ASSET-3A15E5645D2D2A59DFF5` — `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:278`
- File SHA-256: `f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b`
- Line SHA-256: `4b9879f54e6dfe42569fb43355c3daab8338c104050f637e0c023bea4cd63a1a`
- 原文: Release側がTicket exact set、system acceptance、compatibility、Bundle/Module/version、rollback、配布artifactを評価する。Ticket closeやBench scoreだけでqualifiedにしない。性能SLOが明示されたReleaseのみ、鮮度・coverage・比較可能性を満たすmeasurement receiptをrelease obligationに束縛する。
- 条件として保全する意味: Ticket closeやBench scoreだけではqualificationしない。性能SLOが明示されたReleaseに限り、measurement receiptの鮮度・coverage・比較可能性をrelease obligationへ結ぶ。
- 分類理由: 適用条件（性能SLO明示時）と不適格条件が明記されている。
- snapshot: `explanation` / `non_requirement_source_structure_or_explanation`
- current IDs: `[]`; adopted current IDs: `[]`; later candidate IDs: `[]`
- effective condition route: `unknown`。ID relationは参照事実として記録し、意味coverage・successor・採択の証拠とは扱わない。
- #2253/#2254訂正対象: いいえ。

### 6. `LEGACY-CAND-LINE-001558`

- 旧資産: `LEGACY-ASSET-3A15E5645D2D2A59DFF5` — `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:218`
- File SHA-256: `f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b`
- Line SHA-256: `df44d56eb5da247d1f38a24e3a75ba1a08d559168f735cc52f10e089741ede27`
- 原文: admitted current contract、解決済み必要依存・gate・acceptance・riskを満たす集合を導出する。優先順位、現在capacity、競合lease、予算、capability freshnessによるdispatch可否は別projectionとし、取得不能をREADY/dispatch可へ推測しない。既存Work Graph/schedulerを使用する。
- 条件として保全する意味: admitted current contractと解決済み依存・gate・acceptance・riskを満たす集合を導出し、取得不能をREADY/dispatch可と推測しない。
- 分類理由: 導出に必要な前提と不確実時の拒否境界が明記されている。
- snapshot: `explanation` / `non_requirement_source_structure_or_explanation`
- current IDs: `[]`; adopted current IDs: `[]`; later candidate IDs: `[]`
- effective condition route: `unknown`。ID relationは参照事実として記録し、意味coverage・successor・採択の証拠とは扱わない。
- #2253/#2254訂正対象: いいえ。

### 7. `LEGACY-CAND-LINE-001656`

- 旧資産: `LEGACY-ASSET-3A15E5645D2D2A59DFF5` — `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:399`
- File SHA-256: `f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b`
- Line SHA-256: `58be97d309362b845682602ae352b1954ed433fbc4b6552791f89be07d70db4f`
- 原文: 追加するのは、first-pass acceptance、Attempt count、repair rounds、queue/active/review/Human待ち時間、escaped defects、rollback/Recovery、coverage、observer overhead、evidence freshnessなどである。これらは既存12指標のsilent renameではない。First-passの「初回」は最初のeligible candidateとし、内部で何度も修正した後の提出を隠さないためAttempt/repair回数を併記する。
- 条件として保全する意味: first-passの「初回」を最初のeligible candidateと定義し、内部の再修正を隠さないようAttempt/repair回数を併記する。
- 分類理由: 指標の母数定義と隠蔽防止条件が明記されている。
- snapshot: `explanation` / `non_requirement_source_structure_or_explanation`
- current IDs: `["HELIXOS-L2-004", "HELIXOS-L2-007", "HELIXOS-L2-008", "HELIXOS-L2-009", "HELIXOS-L2-010", "HELIXOS-L2-011", "HELIXOS-L2-014"]`; adopted current IDs: `["HELIXOS-L2-014"]`; later candidate IDs: `[]`
- effective condition route: `unknown`。ID relationは参照事実として記録し、意味coverage・successor・採択の証拠とは扱わない。
- #2253/#2254訂正対象: いいえ。

### 8. `LEGACY-CAND-LINE-001548`

- 旧資産: `LEGACY-ASSET-3A15E5645D2D2A59DFF5` — `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:198`
- File SHA-256: `f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b`
- Line SHA-256: `12da676f826da1ea6bed76202f42039fcfd540b88f396f482114c67cb2c4b903`
- 原文: 確定したRequirement IR、Design/PLAN、Responsibility、Verification Obligationとcompiler policyから同一入力に同一byte/digestのcandidateを生成する。AIによる分解案は候補であり、未確定objective/scope/acceptance/dependencyをcompilerが推測しない。Release配置・可変priority・measurement policyは生成物への外部bindingとする。
- 条件として保全する意味: 同一確定入力から同一byte/digestを生成し、未確定objective/scope/acceptance/dependencyをcompilerが推測しない。
- 分類理由: 再現性条件と未確定値の推測禁止が明記されている。
- snapshot: `explanation` / `non_requirement_source_structure_or_explanation`
- current IDs: `[]`; adopted current IDs: `[]`; later candidate IDs: `[]`
- effective condition route: `unknown`。ID relationは参照事実として記録し、意味coverage・successor・採択の証拠とは扱わない。
- #2253/#2254訂正対象: いいえ。

### 9. `LEGACY-CAND-LINE-001709`

- 旧資産: `LEGACY-ASSET-3A15E5645D2D2A59DFF5` — `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:486`
- File SHA-256: `f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b`
- Line SHA-256: `7d8bec078693bcd37d9a1a34ed2aa61401596d19365575894cc534853693f870`
- 原文: inventory-only → shadow_compile → dual-read/比較 → bounded canary → cutover → rollback window → consumer-zeroの条件を定義する。実験mode shadowとは命名を分ける。恒久dual-writeを作らない。
- 条件として保全する意味: inventory-onlyからconsumer-zeroまでの順序、bounded canary、cutover、rollback windowを定義し、恒久dual-writeを作らない。
- 分類理由: 段階順序と切替・rollbackの終了条件が明記されている。
- snapshot: `explanation` / `non_requirement_source_structure_or_explanation`
- current IDs: `[]`; adopted current IDs: `[]`; later candidate IDs: `[]`
- effective condition route: `unknown`。ID relationは参照事実として記録し、意味coverage・successor・採択の証拠とは扱わない。
- #2253/#2254訂正対象: いいえ。

### 10. `LEGACY-CAND-LINE-003614`

- 旧資産: `LEGACY-ASSET-00C7DF9250F8A9A25B24` — `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/requirement-formation-scoped-admission-acceptance.md:39`
- File SHA-256: `c3f62478904e620eced270996360274e2840f9d94eca117d838d0e6dfeda7a86`
- Line SHA-256: `bc7a92b5e25c9d81c38c1d138b4dd278eb0d647ca431109a63ac8278455002ad`
- 原文: | RFA-AC-18 | RFA-RF-01..04, RFA-RC-01..05, RFA-GH-01..03 | 限定調査→候補→独立検証→scope再freeze→IR→許可作業→main read-after→L12までE2E。候補保存だけの完了主張を拒否 |
- 条件として保全する意味: 限定調査から候補、独立検証、scope再freeze、IR、許可作業、main read-after、L12までを完了列とし、候補保存だけの完了主張を拒否する。
- 分類理由: 完了とみなす手順の終端条件と否定条件が明記されている。
- snapshot: `explanation` / `non_requirement_source_structure_or_explanation`
- current IDs: `[]`; adopted current IDs: `[]`; later candidate IDs: `[]`
- effective condition route: `unknown`。ID relationは参照事実として記録し、意味coverage・successor・採択の証拠とは扱わない。
- #2253/#2254訂正対象: いいえ。

## 検証と限界

対象10 IDはrouting JSONL内に各1行あり、全てsnapshot classが `explanation` だった。旧asset ledger上のasset IDとsource pathを照合し、archive file SHA-256と原文line SHA-256を再計算してJSONL記録と照合した。JSONの構文、リンク先、集計式も静的確認した。

この10行だけを条件へ再分類した限定追補である。現行ID relationがある場合も意味coverageを確定していない。旧candidate本文の採択、後継要求割当、受入完了、旧source全体のno-loss閉包、requirements-stage完了は主張しない。元4,755行routing JSONLおよび先行訂正監査は書き換えていない。
