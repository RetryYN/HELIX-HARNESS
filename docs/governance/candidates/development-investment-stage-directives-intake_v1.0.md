# 開発投資段階指示書の候補台帳

状態: candidate / unapproved。owner: #1727。

原文bytesは[履歴入力](../../archive/intake/development-investment-stage-directives-source_v1.0.md)へ保全した。
本書は72投資候補を既存Requirement／Capability／Issueへ照合するための入口であり、候補だけで
承認、v1必須化、一括Issue化、runtime権限追加、実装完了を成立させない。

## 保持対象

- INV-001〜072の72候補
- 導入帯P0〜P4
- 能力依存、既存導入束、共通受入、採否、段階引継ぎ、出典
- 分冊が参照した`06_ITEM_DIRECTIVES.md`は、履歴入力内の「INV-001〜072 個別実施カード」へ解決する

P0〜P4は導入帯であり、障害severity、V-model layer、M0〜M5、Release Waveではない。
各候補は`adopt / defer / reject / already_covered / needs_requirement_delta`へ分類し、既存ownerを
再利用する。履歴入力の記述だけで現在の実装状態や採否を確定しない。
