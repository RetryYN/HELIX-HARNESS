# 新世代の限定修復と旧Bugbot候補の対応

確認日: 2026-09-14

## 目的

`bugbot-bounded-repair-{requests,requirements,acceptance}.md`と`bugbot-intake-source.md`を、新世代の
HELIX-OS Worker統制とHARNESS検証契約へ再分類する。旧候補は利用要求2件、要件5件、受入7件である。
別紙02／03／05は未提供であり、原稿が言及する18シナリオの全件被覆は確認できない。

旧候補の承認はGH-FR-011、既存CI、既存Authoring／Recovery、event／receipt／DB、GitHub read-afterを前提にするため、
新世代へ継承しない。本表は要求源の照合であり、自動修復権限、runtime admission、実装、CI、consumer実証を成立させない。

## 要求の再分類

| 旧ID | 保持候補の意味 | 新世代接続先 | 持ち込まない条件 | 状態 |
|---|---|---|---|---|
| BBR-BR01 | 定型逸脱だけを機械修復へ渡し、意味判断をWorkerへ返す | HELIXOS-L2-004／005／008 | 旧bugbot、旧検査入口、既存CI自己修復を再利用しない | semantic_atom_candidate |
| BBR-BR02 | 権限・所有・予算・独立検証を越えず、他作業を壊さない | HARNESS-L2-005、HELIXOS-L2-004／007／009 | 旧lease／fence／transaction／DBを固定しない | split_reapproval_required |
| BBR-R01 | 対象revision、観測、期待、根拠、強制度を明示して逸脱を検出する | HARNESS-L2-005、HELIXOS-L2-002／008 | push前／PR／CIという旧入口、daemon禁止という旧構成判断を固定しない | contract_rederivation_required |
| BBR-R02 | 検出、提案、許可、適用、検収、保留を別状態にする | HELIXOS-L2-001／004／005 | 登録済みであることを許可・安全性の代替にしない | semantic_atom_candidate |
| BBR-R03 | 修復identity、入力、write-set、副作用、予算、事前・事後条件、失敗処理を操作authorityへ束縛する | HELIXOS-L2-004／007／009 | GH-FR-011、旧Policy、旧generator、既存CASを包括的write権限にしない | authority_rederivation_required |
| BBR-R04 | 冪等性、重複排除、累積予算、循環・期限での停止、不明副作用の非再試行 | HELIXOS-L2-004／007／009 | session切替、旧Recovery、旧CI／review更新方式を固定しない | operational_rederivation_required |
| BBR-R05 | guard解除、検査削除、閾値緩和、scope拡張、他者変更破棄、無許可外部操作を修復とみなさない | HARNESS-L2-005、HELIXOS-L2-001／004／007 | 禁止一覧だけで安全を証明せず、操作別authorityとpositive contractも要求する | semantic_atom_candidate |

## 受入候補の再分類

| 旧ID | 保持候補の反例 | 新世代接続先 | 持ち込まない条件 | 状態 |
|---|---|---|---|---|
| BBR-AC01／02 | 合法な途中状態を誤拒否せず、意味判断・承認不足・unknownを適切な処理先へ分ける | HELIXOS L11／L10候補 | 旧Policy、旧失敗code、旧worker routeをoracleにしない | oracle_rederivation_required |
| BBR-AC03 | write-set逸脱、stale、所有競合、未信頼実装、権限不足を個別に拒否する | HELIXOS L11／L10候補 | 旧HEAD／bytes／lease／fence／CI fixtureを継承しない | authority_oracle_rewrite |
| BBR-AC04／05 | 二重実行、予算reset、循環、部分失敗、CAS競合、不明副作用の再試行を拒否する | HELIXOS L11／L10候補 | 既存event／receipt／DB replayを合格条件にしない | oracle_rederivation_required |
| BBR-AC06 | 必須義務削除や旧policyへの巻戻しによるgreen化を拒否する | HARNESS L11、HELIXOS L11／L10候補 | 既存CI greenやmutation testを新世代の実結果へ転用しない | split_oracle_reapproval |
| BBR-AC07 | 検出から独立検証までを一つの実consumerで確認し、生成・適用・検収を別証拠にする | 対象製品L11、HELIXOS L11／L10候補 | 旧consumer、main read-after、PR／CI／reviewを固定しない | consumer_oracle_rederivation |

## 新世代の限定修復境界

1. HARNESSは、修復後も満たす要求、検証義務、expected failure、独立性、差戻し条件を定める。
2. HELIX-OSは、逸脱検出、候補生成、Worker返却、操作authority照合、隔離適用、停止・復旧、証拠回収を統制する。
3. 修復候補や登録済み実装は実行許可ではない。対象、revision、actor、write-set、予算、影響、復旧、検証を操作ごとに束縛する。
4. 自動修復は要求・設計・検証義務・authorityを変更しない。意味矛盾は最上流の対象層へ変更候補として戻す。
5. 旧実装はarchive sourceとして意味と反例を保全する。新世代runtimeへ再接続せず、承認上流から実装・検証を降ろし直す。

## 次工程

Concept v4.1とHELIX-OS L1／L2の承認後、限定修復の利用者価値、操作境界、停止条件を新IDで採否する。
HARNESSの検証契約と対になるL3／L10、実consumerのL11はその後に導出する。要求整理が閉じるまで旧bugbot、
既存CI、旧自己修復、旧DB／transactionを実行しない。
