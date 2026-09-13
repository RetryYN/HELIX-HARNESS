# 最上位再整理案の検証と残確認

対象: `PLAN-L1-1769-top-level-reorganization`。
提案の受入確認であり、HELIX全体の再編・要求再承認・旧遺産撤去の完了記録ではない。

## 確認項目

| 項目 | 確認結果 | 限界 |
| --- | --- | --- |
| Vision／Concept原文保護 | 同梱checksumに対して10文書すべて一致 | 原文の主張や未同梱出典の真正性は認定しない |
| 要求再整理 | 提案§3に5分類、元ID・後継・AC・owner・残義務を規定 | 全要求の意味分類・承認は後続工程 |
| 自動走行・管理基盤 | 提案§4に8契約と保護する検証を規定 | 実装の全経路smokeではない |
| Issue母集団 | API pagination全18ページ、Issue722件、Open486件、Closed236件 | 観測後の更新は再取得が必要 |
| 既存階層契約診断 | `issue-hierarchy-census`で722件、finding 0 | parser適合。意味重複・native依存graph・終端完了は検査しない |
| 管理状態の残差 | Closedかつ宣言dispositionがactiveの230件を台帳から再計算可能 | 全230件が不具合または未完了であるとは断定しない |
| Issue再整理 | 保護2件、継続候補12件、進行中作業保護4件、未確定704件 | close承認・Issue書換えは0件 |
| Open PR | #1784、#1785、#1788、#1789を観測 | 各PRの品質・merge可否は既存独立検収の責務 |
| 独立文書レビュー | fresh contextの`intra_runtime_subagent`でCritical／Important 0 | 同一runtime系統。cross-providerのmerge承認ではない |

## 実行した検証

Node 24.15.0とlockに基づく依存を独立作業ツリーで使用した。

- `sha256sum -c SHA256SUMS.txt`（原文保存directory）: exit 0、10/10一致。
- `npm run helix -- github issue-hierarchy-census --repository RetryYN/HELIX-HARNESS --json`: exit 0、722件、finding 0。
- `npm run helix -- plan lint docs/plans/PLAN-L1-1769-top-level-reorganization.md --gate governance`: exit 0、frontmatter／cross-record 1件、compatibility-parent違反0。
- `npm run helix -- plan lint docs/plans/PLAN-L1-1769-top-level-reorganization.md`: exit 0。
- `npm run helix -- doctor --gate design-language --json`: exit 0。
- 提案内のrepo-relative参照6件の実在検査と、JSON台帳722 IDの一意性・Open486・全行close承認falseの明示検証: exit 0。

最初のPLAN lintは`sub_doc`未指定でexit 1となり、L1のbusiness分類を明示して再実行した。
失敗をbaseline緩和で回避していない。runtimeコードを変更していないため新規テストは追加しない。

## 原文と既存責務の照合

Concept v4の承認は、`PLAN-L3-84-helix-concept-v4-upgrade.md`と
Issue #1496の`L3-PO-1496-001`を照合した。対象は正本化工程への候補承認でありruntime昇格完了ではない。
Vision／Conceptの取込原文、既存crosswalk、requirements v1.3、ADR-009/010、L1〜L12 directiveを
提案の保護・移管・検証境界へ反映した。

旧機能source `RetryYN/ai-dev-kit-vscode`のREADME冒頭もread-onlyで確認した。
由来・対形成・回復の考え方だけを参照し、旧runtime・旧9-mode・旧layerを現行実行へ採用しない。
個別機能の採用を行う段階では、対象behaviorのsource inventoryを追加照合する。

## 次に解消すること

1. 未確定704件を要求・残義務・後継・進行中assignmentへ結合し、意味の採否を確定する。
2. Closed／active不一致を終端receiptと照合し、訂正が必要なものを既存ownerへ戻す。
3. 原文の保護から、要求の元ID→新ID／統合／廃止の全件対応へ進む。
4. 基盤の必要契約を実装・テスト・運用証拠へ結び、旧方式単位の撤去scopeを決める。
5. 終端処理はGH-FR-017、実cutoverは既存の承認契約に従う。

本PRはこの順序と判断基準をレビューするための成果物である。
POの追加指示に従いDraftで提出し、レビュー依頼・Ready化・mergeは行わない。
上記の内部文書確認は追加指示前に実施したもので、PRレビューへの送付やmerge承認ではない。

## 検証出力のSHA-256

| 検証 | 出力digest |
| --- | --- |
| Issue階層契約診断 | `3efac66bbce23cffc25c2a7e656489366fc03321127bcbed4a5904418168cf85` |
| PLAN governance | `0c409a5ff279398527c1e05e64ae1a48479bb4f1bdd4a10ee5d1f7c8cd8be0dc` |
| PLAN通常lint | `9cc2e72e322233ab9d243e41e13c926396bd7b634984173ffd52ca2b0201f231` |
| 初回design-language | `a460691d34741061ea57aa45bf9e068431008dd4ed9e5d6fe0b10045004eb8c5` |
| 参照・台帳の明示検証 | `e6c48d6b28ae85bdcfdfe18c39c152aa8f21027d3035ae1ddaf4e30f2ca6d32b` |
