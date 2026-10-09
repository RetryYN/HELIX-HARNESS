---
title: "要求整理完了時点への巻き戻しと、要件定義以下のカット PO decision record（2026-10-10）"
decision_record_id: HDEC-ROLLBACK-TO-REQUIREMENTS-CLOSURE-2026-10-10
decision_status: recorded
decider_role: PO
decided_at: 2026-10-10
recorded_at: 2026-10-10
source: 2026-10-10（Asia/Tokyo）のClaude作業session（lane `review_merge`）でのPOの発言と選択
authority_effect: effective_when_this_record_is_admitted_to_main
---

# 要求整理完了時点への巻き戻しと、要件定義以下のカット（2026-10-10）

## 記録の範囲

本書は、POが示した二つの判断を記録する。

- 開発を要求整理完了の時点まで巻き戻す。
- 要件定義（L3）以下の成果物をカットする。

本書から、Concept・L1・L2・L11の変更、新しい承認手続き・merge gate、実装、新世代CIの実装・起動、release、内部デプロイ、Issue closeを生成しない。

## 経緯

2026-10-10、POはStage 1の実装（`helix/`）とlocal CIの構成・命名に規則性が無いことを指摘した。Claudeが調べた結果は次のとおりである。

| 確かめた点 | 結果 |
|---|---|
| 七大原則「3. DDD設計/TDD開発」 | 守られていなかった。Stage 1の設計・実装の名前と構成を、domainの用語から決めていなかった |
| Conceptの「HELIX-HARNESS-COREの意味と設計はHELIX-JSONで管理する」 | 守られていなかった |
| 2026-09-25のPO判断「JSONを正本とし、Markdown・HTMLを生成する」 | 守られていなかった |
| 既存の設計・検証テンプレートseed | 使われていなかった |
| Concept「6. 証拠で閉じる」と七大原則「7. 確かな証拠と計測改善で品質を守れ」 | 守られていなかった。review側（Claude）は件数とSHA-256の一致だけでmergeしていた |
| 開発の規律に当たる要求 | 1.0の範囲から漏れていた。採択済みの`HARNESS-L2-048`（命名規律）は、版の印が無いことを理由に固定1.0 rosterの外に置かれ、L3が起こされていなかった。`HARNESS-L2-009`（Design Template）も同rosterに含まれていなかった |

七大原則（2026-09-16作成）とConceptは、L2要求の合意（2026-09-28）とL3要件の作成（2026-10-05以降）より前からあった。したがって、原則の不適用は要求の作成段階から始まっている。経緯の詳細は`FT-GOV-AGENTREAD-001`（PR #2820）に記録している。

## POの発言（原文）

> 使えるかじゃなくて、使えない。そもそも信用が、担保出来てないんだから。

> 悪いが前提が成立してないなら以下全部無駄だとおれは判断するしかない。

> なら要求整理完了の段階まで巻き戻せ。要件定義以下は要件を満たせて居ないからカット。

ClaudeはAskUserQuestionで次の二つを問い、POは次を選んだ（原文）。

> 問い：「カットした成果物（L3/L10、L4〜L9、helix/ コード、local-ci）の扱いはどうする？」
>
> POの選択：「main から削除 (Recommended)」

> 問い：「10/3 以降に作った L3 関連の判断記録と監査記録はどうする？」
>
> POの選択：「残して新判断で無効化 (Recommended)」

## 判断1：巻き戻す時点

巻き戻す時点は、要求整理完了の時点とする。これは[要求段階の現在状況](../requirements-stage-closure.md)が「終了基準main」とするmain `633bf12ea8f948db8ba3d6600179c4a9507377a7`（#2554統合後、2026-10-03）である。

## 判断2：カットする成果物

次の成果物をmainから削除する。内容はgitの履歴（`633bf12e`から`d695bc2d806acc46833cef1c271cb26e400f3257`まで）にだけ残す。正式な要求・設計・実装の根拠として再利用しない。失敗の分析のために履歴を読むことは妨げない。いずれも巻き戻し時点のmainには存在しなかった。

| 対象 | 内容 |
|---|---|
| `docs/<機構>/L3-requirements/`、`docs/<機構>/L10-verification/` | 全48本 |
| `docs/<機構>/L4-basic-design/`〜`L9-integration-verification/` | 全50本 |
| `helix/` | 全37本 |
| local CIと検出器 | `scaffold/local-ci/`、`scaffold/l3l10-checks/`、`.github/workflows/local-ci-merge-unit.yml` |
| Scaffold Binding | `SCF-B-0157`、`SCF-B-0158` |
| L3以下の作業正本 | `docs/governance/l3-l10-authoring-layout.md`、`docs/governance/l3-l10-po-post-confirmation.md`、`docs/governance/crosswalks/stage1-l3-l10-obligation-crosswalk.md` |
| L3以下のチケット | `FT-OS-LOCALCI-001`、`FT-OS-LOCALCI-002`、`FT-GOV-L3STATUS-001` |

## 判断3：判断記録と監査記録の扱い

巻き戻し時点より後に作った判断記録と監査記録は、書き換えず、削除しない。本書により、次の判断の効力を失わせる。

- 各機構×StageのL3／L10承認（直接のPO判断と委任による承認）の判断記録。
- L3／L10の事後確認の判断記録（2026-10-08の3件）。ただし、`po-l3-l10-post-confirmation-and-internal-deployment-policy6-2026-10-08.md`の「判断2：内部デプロイ方針6（型番とディレクトリ構成）の確定」は効力を保つ。
- [L4〜L6設計の解禁とCommon Kernel traceの判断](l4-l6-design-unlock-and-common-kernel-trace-po-decision-2026-10-08.md)。
- [Stage 1実装・CI解禁の判断](stage1-implementation-and-ci-unlock-po-decision-2026-10-09.md)。

[実装順序のPO選択記録](implementation-order-po-decision-2026-10-03.md)はL3の着手順の選択である。L3を再開するときに改めて確かめる。

次の判断は、L3以下の成果物ではないため効力を保つ。

- [L3／L10承認の委任](l3-l10-approval-delegation-po-decision-2026-10-05.md)と[別系統reviewの判断](l3-l10-delegation-cross-runtime-review-po-decision-2026-10-08.md)。L3を再開するときの手続きとして残す。
- [リポジトリ構成の基本案と開発ソースの公開](repository-layout-and-source-visibility-po-decision-2026-10-09.md)。同判断を具体化したL4はカットするため、再開時に改めて起草する。
- [Stage・release・内部デプロイの方針](stage-release-internal-deployment-po-decisions-2026-10-07.md)。
- [失敗から学ぶ原則](learn-from-failures-principle-po-decision-2026-10-09.md)。
- [開発repositoryのチケット方針](dev-repo-ticket-policy-po-decision-2026-10-09.md)。
- [原子PRの単位](pr-atomicity-unit-po-decisions-2026-10-05.md)。
- [開発コンパイラの段階](development-compiler-stages-po-decisions-2026-10-06.md)。
- [HELIX-Web文書の統合](helix-web-docs-consolidation-po-decisions-2026-10-03.md)。

## 判断4：残すもの

次はカットしない。

- Concept、各機構のL1、L2、L11と、巻き戻し時点より後のそれらの修正。修正は、2026-10-08のPO発言によるConceptの追記と、HELIX-Web文書統合のpath修正である。
- 七大原則、`AGENTS.md`・`CLAUDE.md`・運用モデル。
- 設計・検証テンプレートseedとBRAINの素材（`SCF-B-0153`〜`SCF-B-0156`）。

## 再開の条件

L3を再開する前に、前提を機構として成立させる。前提とは、Concept、七大原則、JSON正本、設計・検証テンプレート、および開発の規律に当たる要求である。

- 1.0の範囲から漏れた規律の要求（`HARNESS-L2-048`、`HARNESS-L2-009`ほか）の版は、POの判断に属する。
- 再開の順序と範囲は、POの指示を受けてから決める。

## 旧HELIXとの対応

| 旧source | 保持する点 | 変える点 |
|---|---|---|
| 旧`CLAUDE.md`「HELIX 再構築方針」「precedence（拘束原則）」（`archive/legacy-generation-2026-09-14/root/CLAUDE.md` 49–63行、SHA-256 `7bdfc0bc578359e42efae4242ee42b53abd6e2ec23874f1294d3ec0e278c8feb`）：仕組み（Vモデル工程・gate・harnessルール）を個別機能より上に置き、個別機能は仕組みを超えない | 仕組みを先に成立させ、その上に個別機能を積む | 規律を文書の規則でなく機構として成立させる（[失敗から学ぶ原則](learn-from-failures-principle-po-decision-2026-10-09.md)）。前身harnessの弱点ledger（`archive/legacy-generation-2026-09-14/root/docs/governance/predecessor-harness-full-weakness-audit-2026-07-20.md` 65–101行のUTW-002・004・021・025）による |

## 本書から生成しないもの

本書は次を生成しない。

- Concept・L1・L2・L11の変更、および要求の採否・版の変更。
- 新しい承認手続き・merge gate。
- 実装、CI、release、内部デプロイ。
- Issue close。
- 外部repositoryへの書込み。
