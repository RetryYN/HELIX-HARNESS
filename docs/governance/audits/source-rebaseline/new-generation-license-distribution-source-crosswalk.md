# 新世代の利用許諾・配布と旧Commercial License候補の対応

確認日: 2026-09-14

## 目的

`helix-commercial-license-{requirements,acceptance}.md`の旧要件12件、旧受入12件を、提供プロダクトHARNESS、
内部統制HELIX-OS、HELIX-Web等の個別製品へ再分類する。旧候補は「HELIX全体」を一つの商用方針で覆い、
旧Module／Slice／Bundle／Lite／Full／Geneと既存Release管理を前提にするため、製品scope・契約方針・実装方式を継承しない。

本表は法的助言や契約書ではなく、要求源と未決事項の整理である。現行LICENSE、過去版の許諾、repository visibility、
package metadata、価格、契約、課金、公開、配布を変更しない。

## 上位方針の再分類

| 旧方針 | 新世代での扱い | 接続先 | 状態 |
|---|---|---|---|
| HELIX全体を有償商用提供する | 一括採用しない。外部提供物HARNESS、内部HELIX-OS、各個別製品を別scopeで判断する | HARNESS-L2-006、HELIXOS-L2-001／006、各製品L2 | product_scope_rewrite_required |
| 単一共通契約 | 同一提供物の重複契約正本を避ける意味だけ保持し、異なる製品を無条件に一契約へ統合しない | 対象別license authority候補 | legal_decision_pending |
| 利用者生成物とHELIX資産の区別 | 所有・利用許諾・第三者条件・学習同意を分ける候補として保持 | HARNESS L2／L11、各製品L2／L11 | legal_reapproval_required |
| Built with HELIX等の任意紹介 | 利用許諾と宣伝利用同意を分ける候補として保持 | HARNESSまたは対象製品L2／L11 | product_and_legal_reapproval |

## 要件の再分類

| 旧ID | 保持候補の意味 | 新世代接続先 | 持ち込まない条件 | 状態 |
|---|---|---|---|---|
| CL-R-01 | 提供物・asset・契約版の対応と未所属・競合を追跡する | HARNESS-L2-006、HELIXOS-L2-002／006／007 | HELIX全体、旧Module／Slice／Bundle等を一契約へ固定しない | scope_rewrite_required |
| CL-R-02／03 | 有償、評価、内部利用、SaaS、OEM、再配布等の許諾範囲を区別する | HARNESSまたは各製品L2 | 通常有償を承認済みとせず、最終条文・価格・契約をこの候補から生成しない | legal_decision_pending |
| CL-R-04 | 第一者・利用者・第三者・権利不明、所有・利用許諾・再利用・学習同意を分ける | HARNESS／各製品L2、HELIXOS-L2-002／007 | RetryYN／利用者の権利帰属を候補文書だけで確定しない | legal_reapproval_required |
| CL-R-05／06 | 適用版、source、license text、asset集合、例外、metadata、通知、配布表示を一致させる | HARNESS-L2-006、HELIXOS-L2-006／007 | 旧HEAD、旧license digest、既存builder／repositoryを固定しない | distribution_rederivation_required |
| CL-R-07 | 製品版・構成版・契約版を別軸で追跡する | HARNESS-L2-006、HELIXOS-L2-006／007 | 既存Release／Capability管理、旧Module／Bundleを再利用しない | semantic_atom_candidate |
| CL-R-08 | 権利不明assetの提供を止め、無関係な作業と区別する | HARNESS-L2-003／006、HELIXOS-L2-003／006 | 候補から法的権利・停止scope・公開権限を推定しない | authority_rederivation_required |
| CL-R-09 | 導入・更新・復旧時にもartifactと適用許諾版を一致させる | HARNESS-L2-006、HELIXOS-L2-006／007 | 旧consumer、builder、rollback経路を固定しない | distribution_rederivation_required |
| CL-R-10 | 最終条文・権利者・適用開始版・公開判断を別々に確認して発効する | HELIXOS-L2-001／006／007 | candidate merge、PR、CI、配布成功を契約発効にしない | action_authority_rederivation |
| CL-R-11 | 紹介依頼を利用条件と分け、宣伝利用を別同意へ束縛する | HARNESSまたは各製品L2／L11 | 紹介文言や同意方式を未承認のまま製品へ埋め込まない | product_and_legal_reapproval |
| CL-R-12 | 発効後に提供機能、告知、履歴版許諾、問い合わせ、秘密情報非露出を確認する | 各製品L12、HELIXOS-L2-006／007 | 旧L12、既存distribution read-afterを新世代の運用証拠にしない | observation_rederivation_required |

## 受入候補の再分類

| 旧ID | 保持候補の反例 | 新世代接続先 | 持ち込まない条件 | 状態 |
|---|---|---|---|---|
| CL-AC-01..04 | 対象漏れ、許諾範囲の推測、所有・第三者条件・学習同意の混同を拒否する | HARNESS／各製品L11、HELIXOS L11 | 旧asset分類と旧製品境界をoracleにしない | split_oracle_reapproval |
| CL-AC-05..10 | 適用版不一致、表示不一致、重複契約、権利不明、復旧時偽装、未発効を拒否する | HARNESS L11、HELIXOS L11／L10 | 旧HEAD、MIT／有償という特定遷移、既存builder／consumerを固定しない | distribution_oracle_rederivation |
| CL-AC-11 | 紹介拒否と利用条件、宣伝利用同意を分ける | 対象製品L11 | 未承認の表示・同意UIを実装前提にしない | product_oracle_reapproval |
| CL-AC-12 | 発効後の契約・提供・更新・履歴・問い合わせ・秘密非露出を観測する | 対象製品L12、HELIXOS L12候補 | 既存配布結果を新世代の実結果にしない | observation_rederivation_required |

## 未決事項

次は要求整理で確定せず、対象製品ごとの正式な事業・法務判断を必要とする。

- 契約主体、権利者、対象asset、第三者条件、価格、期間、更新・解約、責任範囲、保証、準拠法、紛争処理。
- HARNESSの提供方式、評価版、内部利用、SaaS／OEM／再配布条件、source visibility。
- HELIX-Webその他の個別製品の契約、課金、privacy、利用規約、紹介・宣伝同意。
- 既存版・第三者asset・contributor・商標・データ・モデル・学習資産の権利棚卸し。

## 新世代の責務境界

1. HARNESSは外部提供物として、利用者が提供範囲・適用許諾版・第三者通知・導入条件を確認できる要求を持つ。
2. HELIX-OSは、承認済み契約・asset・artifact・releaseを対応づけ、配布・更新・復旧・停止の操作と証拠を管理する。
3. HELIX-OS自身を外部提供物として扱わず、内部利用条件や第三者asset管理は別scopeで記録する。
4. HELIX-Web等の個別製品は、それぞれの利用形態・data・課金・表示に対応する契約要求を所有する。
5. 旧文書・コード・package・LICENSEはarchive sourceとして保全し、新世代の契約内容や許諾を逆生成しない。

## 次工程

Concept v4.1と対象別L1／L2の製品scope確定後、HARNESSおよび各個別製品の許諾要求を個別に起草・承認する。
権利棚卸しと正式な法務判断が完了するまで契約発効・LICENSE変更・課金・公開・配布を行わない。
