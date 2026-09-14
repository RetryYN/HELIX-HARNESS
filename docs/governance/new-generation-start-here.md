# HELIX新世代 作業入口

status: upstream_rebuild
generation_boundary: 2026-09-14

## 現在の目的

旧HELIXを現行pathで延命せず、HELIX-HARNESSとHELIX-OSを分離して上流から組み直す。
HARNESSは外部提供するV-model開発基盤、HELIX-OSはHARNESS自身を含むHELIXプロジェクト群の管理・統制・継続改善機構である。
HELIX-WebはHARNESS Version 1完成後に展開する個別製品で、service runtimeはHELIX-OS外のHELIX-Web-OSが担う。

## 読込順

1. [Concept入口](../concept/README.md)
2. [製品責務境界](../concept/product-boundary.md)と[Concept本文](../concept/helix-concept-v4.1.md)
3. 対象製品のL1
   - [HELIX-HARNESS](../helix-harness/L1-planning/product-intent.md)
   - [HELIX-OS](../helix-os/L1-planning/system-intent.md)
   - [HELIX-Web](../helix-web/L1-planning/product-intent.md)
   - [HELIX-Web-OS](../helix-web-os/L1-planning/system-intent.md)
4. [対象別L2入口](audits/source-rebaseline/l2-source-register.md)と対応するL11
5. [企画・Vision→前提research→要求の被覆監査](audits/source-rebaseline/planning-research-requirement-flow-audit-2026-09-15.md)
6. [上流authority管理台帳](upstream-authority-register-2026-09-14.md)
7. [GitHub上流運用モデル](github-upstream-operating-model.md)
8. [旧要求の無損失carry-forward方針](legacy-requirement-carry-forward-policy.md)と[153要求の機械台帳](legacy-requirement-carry-forward.jsonl)
9. [旧世代archive-first隔離記録](archive-first-transition-record-2026-09-14.md)
10. [旧資産の完全一致再利用統制](legacy-asset-reuse-control.md)
11. 必要な場合だけ、[旧資産4,020件の明細台帳](legacy-asset-disposition.jsonl)を`asset_id`または`source_path`で照会し、
   指定された旧source／crosswalkを読む。明細台帳は機械参照用であり、AIの全文startup readには含めない。
   個別採否時は[判断ログ契約](legacy-asset-decision-log.md)に従う

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
一要求identityずつ後続PRで採否・具体化する。
