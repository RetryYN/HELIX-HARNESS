# HELIX新世代 作業入口

status: upstream_rebuild
generation_boundary: 2026-09-14

## 現在の目的

旧HELIXを現行pathで延命せず、HELIX-HARNESSとHELIX-OSを分離して上流から組み直す。
HARNESSは外部提供するV-model開発基盤、HELIX-OSはHARNESS自身を含むHELIXプロジェクト群の管理・統制・継続改善機構である。
HELIX-WebはHARNESS Version 1完成後に展開する個別製品で、service runtimeはHELIX-OS外のHELIX-Web-OSが担う。

## 読込順

1. [Concept入口](../concept/README.md)
2. [Concept本文](../concept/helix-concept-v4.1.md)と[製品責務境界](../concept/product-boundary.md)
3. [HELIX自体の5大目標候補](../concept/helix-five-goals.md)
4. [HELIXエージェントの七大原則候補](../concept/helix-principles.md)
5. 対象製品のL1
   - [HELIX-HARNESS](../helix-harness/L1-planning/product-intent.md)
   - [HELIX-OS](../helix-os/L1-planning/system-intent.md)
   - [HELIX-Web](../helix-web/L1-planning/product-intent.md)
   - [HELIX-Web-OS](../helix-web-os/L1-planning/system-intent.md)
   - [5大目標・七大原則のL1被覆監査](audits/source-rebaseline/l1-goals-principles-coverage-audit.md)
6. [対象別L2入口](audits/source-rebaseline/l2-source-register.md)と対応するL11
7. [企画・Vision→前提research→要求の被覆監査](audits/source-rebaseline/planning-research-requirement-flow-audit-2026-09-15.md)
8. [上流authority管理台帳](upstream-authority-register-2026-09-14.md)
9. [上流authority状態モデル](authority-state-model.md)
10. [GitHub上流運用モデル](github-upstream-operating-model.md)
11. [管理層の要求仮登録契約](management-provisional-requirement-registration.md)
12. [Repository foundation readiness](repository-foundation-readiness.md)
13. [旧要求の無損失carry-forward方針](legacy-requirement-carry-forward-policy.md)、[現在の管理状況](requirement-carry-forward-status.md)、[153要求の再配置wave](legacy-ir-rehome-wave-register.md)
    - 全要求の要否・再配置を扱う場合は、[要否・再配置review program](requirement-disposition-review-program.md)を親作業とし、[責務・機能重複review](requirement-overlap-review-program.md)、[技術代替可能性review](requirement-technical-substitutability-review-program.md)、個別要求の人間decision・要求PRを分ける
    - IDのない段落条件を扱う場合は、[semantic line全量保全inventory](legacy-requirement-semantic-line-inventory.md)と[atom化review contract](requirement-atomization-review-contract.md)を追加で読む
    - 旧candidate系列を扱う場合は、[旧candidate source全量inventory](legacy-candidate-source-inventory.md)から原文行へ戻る
14. [旧世代archive-first隔離記録](archive-first-transition-record-2026-09-14.md)
15. [旧資産の完全一致再利用統制](legacy-asset-reuse-control.md)
16. 必要な場合だけ、[旧資産4,020件の明細台帳](legacy-asset-disposition.jsonl)を`asset_id`または`source_path`で照会し、
   指定された旧source／crosswalkを読む。明細台帳は機械参照用であり、AIの全文startup readには含めない。
   個別採否時は[判断ログ契約](legacy-asset-decision-log.md)に従う

repository foundation、5大目標候補、七大原則候補の順に物理統合し、
Concept／製品責務境界→5大目標→七大原則→対象別L1の読込順へ収束させる。5大目標と七大原則の内容判断は、
各候補PRのmerge admissionと独立したまま扱う。repository foundationは構造整理の証拠だけで統合済みである。
Concept v4.1候補は、5大目標をHELIX全体の到達価値、七大原則をエージェント行動規律として接続する。
この接続から個別要求、workflow、技術選定、authorityを直接生成しない。

Conceptと対象別L1はcandidate、対象別L2／L11はdraftであり、まだcanonicalではない。
旧Concept、旧requirements、Requirement IR、候補群、設計、実装は新世代へ自動昇格しない。
この非昇格は旧要求の削減を意味しない。採用済み旧要求は`preserved_pending_rehome`として全件保持し、
対象別へ移す。実装・CI・物理配置を継承しないことと、要求意味を保持することを分ける。

## 現在許可される作業

- 旧sourceのinventory、意味分類、対象別crosswalk、archive隔離。
- Concept、対象別L1、L2／L11の起草、静的なID・参照・責務整合確認。
- exact revisionのremote syncと、明示的に許可されたGitHub review通路での意味review。
- GitHub PRを共有・review surfaceとして使うこと。

## 現在停止する作業

- L3以降の設計・実装、新世代CIの実装・起動、release、deployment。
- 旧CI、旧runtime、旧hook、旧test、旧AI promptの実行またはfallback。
- reviewer名だけを根拠にしたCLI、API、IDE、Worker、GitHub Appの起動。
- PR、Issue、CI、DB、memory、会話からの要求採否・人間承認・受入の生成。

## GitHubの位置づけ

PRは上流候補の差分共有と許可されたreviewに使う。旧workflowは非実行archiveへ移動済みであり、現時点で新世代CIはない。
required check、review、merge等のrepository設定が旧世代を前提にする場合、その設定変更はHELIX-OSのGitHub projection再構築として別に扱う。
PR #1797は`repository_foundation`に限定し、個別要求は[GitHub上流運用モデル](github-upstream-operating-model.md)に従って
一要求identityずつ後続PRで無損失に再配置・具体化する。保持・再配置、意味変更、retireを別decision種別として、すべての要求PRを対象revision付きの人間判断へ送る。
本PRのreview所見を理由に新しい要求本文を追加しない。既に置いた対象別L2／L11は未承認の整理案であり、個別要求の
追加・採否・分割・具体化は後続の要求整理PRで行う。foundationで追加できるのは、旧sourceの保存位置、digest、
仮登録、authority境界、後続PRの無損失条件に限る。
