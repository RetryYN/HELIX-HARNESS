# 開発投資段階指示書の取込み・原稿退役記録

観測日: 2026-09-11。owner: #1727。関連: #1500 / #1034 / #1293 / #1639。
本書は入力保全とroot原稿退役の検証記録であり、Requirement承認、v1対象追加、実装完了、
自動適用権限の正本ではない。

## 照合結果

受領原稿7件はすべてGit未追跡で、`origin/main`および全Git履歴に取り込み記録がなかった。
統合版は2515行で、共通境界、P0〜P4、INV-001〜072の個別カード、全件段階割当、能力依存、
既存導入束、共通受入、出典を含む。分割6冊は統合版の対応節と、末尾空行を除いて同じ内容である。

統合版を[履歴入力](../archive/intake/development-investment-stage-directives-source_v1.0.md)へbytes同一で保全し、
[候補入力台帳](candidates/development-investment-stage-directives-intake_v1.0.md)を日本語の非authority入口として分離した。
統合版は全72カードを持つため、分割文書の`06_ITEM_DIRECTIVES.md`という未実体参照は、同台帳の
「INV-001〜072 個別実施カード」節へ解決する。存在しない別文書を新設して第二正本にはしない。

## 入力bytesと保全先

| 退役対象のroot原稿 | 原稿SHA-256 | 保全方法 |
|---|---|---|
| `HELIX_STAGE_DIRECTIVES_COMPLETE.md` | `7b7d0600bccd9045aa1c11f9762886c982b38e9446197f9dcf00637116833b04` | 履歴入力へbytes同一で保全 |
| `00_COMMON_DIRECTIVE.md` | `c93cfcef15df6f6a0f6660708c8aac74ad86c33cf1ea1c4ee197130cf7da4fc2` | 候補入力台帳の共通指示節へ正規化同一で保全 |
| `01_P0_IMMEDIATE_DIRECTIVE.md` | `a28df5b78300b35bf9398a426bf20808f3798ca13bfd6cb84d6a1a1073b7d844` | 候補入力台帳のP0節へ正規化同一で保全 |
| `02_P1_EARLY_AUTOMATION_DIRECTIVE.md` | `aab83ebd4400875f6638b090f3f858b6eaa49c957bc16862d0b9410e3f0dac25` | 候補入力台帳のP1節へ正規化同一で保全 |
| `03_P2_INCREMENTAL_CONVERGENCE_DIRECTIVE.md` | `e7f248cf97e7968e4306a2920dd2a91342a7430e7c98fd3cf7b03f2c7af0717b` | 候補入力台帳のP2節へ正規化同一で保全 |
| `04_P3_KNOWLEDGE_INVESTMENT_DIRECTIVE.md` | `241c89b7e7d97033662e07a1e02589cf8df07ede2bb43c28614f54ceae44a63b` | 候補入力台帳のP3節へ正規化同一で保全 |
| `05_P4_INTELLIGENCE_RESEARCH_DIRECTIVE.md` | `9dc990cd8e48ca8c096dae9d195564d8342ecc08d3dd27dafc9ed93e94d7f463` | 候補入力台帳のP4節へ正規化同一で保全 |

## authority境界

- INV-001〜072は入力内の候補IDであり、登録済みRequirement／oracle IDではない。
- P0〜P4は導入優先帯であり、障害P0/P1、V-model layer、M0〜M5、Release Waveと混同しない。
- 72件を固定の完成率分母、v1必須集合、72個のIssueへ自動変換しない。
- 各候補は`adopt / defer / reject / already_covered / needs_requirement_delta`を既存owner単位で判定する。
- proposal、生成、限定適用、検収、公開を分け、候補文書から書込み・merge・publish権限を導出しない。
- 現行Requirement、IR、Capability、Issue、Release、独立review、CIの成立条件を上書きしない。

## 退役条件と結果

| U-ID | 対象 | 反例と期待結果 | test citation |
| --- | --- | --- | --- |
| U-DIS-001 | 統合原稿bytes | 保全先の1 byteでも変えるとSHA-256不一致でRED | `tests/development-investment-stage-directives.test.ts` |
| U-DIS-002 | 72候補とP0〜P4割当 | INV見出しまたは全件対応表の欠落・重複・範囲外段階をRED | `tests/development-investment-stage-directives.test.ts` |
| U-DIS-003 | candidate境界とroot退役 | 非authority境界、hash、移管先、root不存在のいずれかが欠けるとRED | `tests/development-investment-stage-directives.test.ts` |

候補入力台帳のbytes、72個の見出しexact set、P0〜P4の主段階割当、上記hashの相互参照を
`tests/development-investment-stage-directives.test.ts`で検査する。検査と独立review、CI、mainへの
read-afterが成立した後、rootの7原稿を削除する。削除は意味内容の消去ではなく、未追跡入力から
Git管理されたcandidateへのauthority境界付き移管である。
