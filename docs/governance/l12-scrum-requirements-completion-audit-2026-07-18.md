# L1〜L12＋Scrum要件定義 完了監査（2026-07-18）

## 判定

要件定義scopeは **14/14 FR、14/14 AC、pair 14/14で100%**。後続のschema、runtime、DB projection、template、tag、UI実装の完成率とは分離し、本監査は実装完了を主張しない。

正本は`helix-harness-requirements_v1.3.md`、L3機械入口は`l12-scrum-rebaseline-requirements.md`と`scrum-reverse-verification-engine.md`、対になる受入設計は同名のacceptance文書である。

## PO目的との証拠対応

| 目的 | 正本要件 | 対受入証拠 | 判定 |
|---|---|---|---|
| 本格systemはV、段階release・小規模systemはScrum | v1.3 §4、L12R-FR-002 | L12R-AC-004/005 | 閉鎖 |
| ScrumをVへ戻し設計資産を作る | v1.3 §4.1、SRV-FR-001〜003 | SRV-AC-001〜003 | 閉鎖 |
| Scrum Reverseから設計Refactorへ接続 | v1.3 §4.2、SRV-FR-004〜006 | SRV-AC-004〜006 | 閉鎖 |
| 性能Refactorを証拠駆動にする | v1.3 §4.2、SRV-FR-007/013 | SRV-AC-007/013 | 閉鎖 |
| test以外の検証・計測基盤を設計エンジンへ組込む | v1.3 §4.3、SRV-FR-008/009/012 | SRV-AC-008/009/012 | 閉鎖 |
| NFRを含むsystem完成度を機械判定する | v1.3 §4.3、SRV-FR-010/011 | SRV-AC-010/011 | 閉鎖 |
| 成功・失敗をmemory、gate、skill、template改善へ戻す | SRV-FR-014 | SRV-AC-014 | 閉鎖 |
| L1〜L12＋Scrumを工程正本にする | v1.3 §1〜§2、L12R-FR-001/003 | L12R-AC-001〜003/007 | 閉鎖 |
| 画面prototypeまたは明示N/AをL3前に強制する | v1.3 §3、L12R-FR-004 | L12R-AC-006 | 閉鎖 |
| 旧L0〜L14を互換入力へ限定する | v1.3 §9〜§10、L12R-FR-005/006 | L12R-AC-008〜010、`layer-authority-drift.test.ts` | 閉鎖 |

## 完了率の分母

- FR分母: `SRV-FR-001`〜`SRV-FR-014` = 14。未定義、重複、orphanは0。
- AC分母: `SRV-AC-001`〜`SRV-AC-014` = 14。各FRへexactly oneで対応。
- 品質領域分母: 性能、信頼性、可用性、回復性、security、privacy、accessibility、互換性、運用性、保守性、cost/resource、data quality、observability = 13。全件をapplicableまたは理由付きN/Aへdispositionする。
- 工程分母: L1〜L12 exactly once、V-pair 6組。Scrum sliceもSR4まで閉じなければrelease-readyにしない。

## 反証検査

次のいずれかが真なら要件定義完了判定を撤回する。

1. FRに対応ACがない、または複数ACが曖昧に競合する。
2. Scrum sliceがSR0〜SR4なしにrelease-readyになる。
3. RefactorがRedesign / Design Refactor / Performance Refactor / Retrofitの複数へ同時routeされる。
4. test greenだけで必須metricのmissing、stale、nonrepresentative、threshold failを無視できる。
5. authority文書が旧L0〜L14をcurrent canonicalとして再表示する。
6. UIなし案件が理由・判定者・HEAD・再評価条件を持つN/A receiptなしにL2を飛ばす。

## 後続境界

本監査の次はL4以降でschema、state transition、generator、DB projection、GitHub gate、measurement probeを実装・検証する。要件定義完了を理由に、未実装のruntime behaviorやsystem completionをgreen表示してはならない。
