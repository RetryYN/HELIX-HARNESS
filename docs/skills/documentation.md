---
schema_version: skill.v1
name: documentation
skill_type: process
applies_to:
  layers:
    - L1
    - L2
    - L3
    - L4
    - L5
    - L6
    - L8
  drive_models:
    - Forward
    - Reverse
    - Add-feature
    - Retrofit
---

# ドキュメント（documentation）

HELIX における README、onboarding guide、runbook、doc-tree prose の作成と保守を扱う。
V-model design docs や ADRs とは別に、人間が読む運用ドキュメントを作る場合に適用する
（それらは `documentation-and-adrs` が扱う）。
README は導線と補助説明の surface であり、gate、証跡、完了条件の判定 surface へ紐づけない。

## この skill を読む条件

- `README.md`、onboarding guide、CLI usage reference を作成または更新する。
- 繰り返し使う運用手順（例: PAT rotation、`harness.db` rebuild、doctor triage）の runbook を作成する。
- 新しい `ut-tdd` command に対し、既存 doc に usage section が必要。
- PLAN が新しい command、flag、state path を導入した後の doc maintenance。

## 対象範囲（scope）

| 対象 | 対象外 |
|---|---|
| README / onboarding prose の整備 | V-model design docs（`docs/design/`） |
| CLI usage references の作成 | ADR authoring（`documentation-and-adrs` 参照） |
| Runbook と運用手順の整備 | PLAN files（`docs/plans/`） |
| doc-tree maintenance（dead links、stale paths）の実施 | L0 glossary back-merge（`gate-planning` 参照） |

README の修正は、利用者の導線を直すために行う。accept / freeze / evidence / completion は PLAN、
設計、テスト設計、governance、実装、検証ログの該当 surface で判断し、README だけを根拠にしない。

## 執筆基準（writing standards）

- **能動態と明示 actor.** 「開発者は `ut-tdd doctor` を実行する」と書き、
  「`ut-tdd doctor` が実行されるべき」とは書かない。
- **実行可能な例.** すべての code block は、current codebase に対して実際に動く command または output にする。
  pseudocode はそのように label する。
- **version drift を残さない。** command flag が変わった場合は、同じ commit で doc を更新する。
  removed flag を説明する doc は、doc が無いより悪い。
- **encoding は UTF-8 without BOM。** Half-width kana（U+FF61-FF9F）と U+FFFD は mojibake marker。
  external editor を通った doc は、commit 前に grep で scan する。

## README 構成基準（structure baseline）

HELIX README は最低限次を含む:

1. **目的** — 1 段落。このコンポーネントが何を行い、どの system に仕えるか。
2. **前提条件** — `bun`、`ut-tdd`、外部依存と最小 version。
3. **quick start** — 動作状態を得るための最小コマンド列。
4. **主要 command** — この context でよく使う `ut-tdd` commands の table。
5. **troubleshooting** — 最も多い failure 2-3 件と remediation（まず `ut-tdd doctor` triage）。

## Runbook 構成基準（structure baseline）

1. **trigger** — この runbook を起動する exact condition。
2. **影響** — condition が続く間に何が壊れる、または性能や品質が低下するか。
3. **手順** — numbered list。各 step は command または decision と expected output を持つ。
4. **検証** — procedure 成功の確認方法（`ut-tdd doctor`、`ut-tdd status`、targeted test）。
5. **escalation** — どこで止まり、human decision を呼ぶか。

## PLAN 出荷後の doc 保守

PLAN が `ut-tdd` command、flag、state path を追加または変更した場合:

1. `grep` で existing docs から old command / path の reference を探す。
2. implementation と同じ commit で各 reference を更新する。
3. breaking change（old command がもう動かない）の場合は、old text を黙って置換せず、
   `## Migration` heading の下に migration note を追加する。

## commit 前の文字化け確認

```bash
# docs/ 内の half-width kana と replacement character を scan する
grep -rP "[\xFF61-\xFF9F\xEF\xBF\xBD]" docs/
```

結果が clean の場合、mojibake marker が無いことを意味する。
結果が dirty の場合、file が移動または編集の過程で壊れたことを意味するため、lossy character repair を試みず、
最後の clean git revision から restore する。
