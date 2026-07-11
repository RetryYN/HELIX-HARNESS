# Handover の mechanical / explicit 分離

この文書は、A-137 以後に HELIX-HARNESS が使う handover 分離を定義する。

## 1. Mechanical Handover（機械処理用引き継ぎ）

Mechanical handover は、機械可読の routing state である。

正本の場所:

- `.helix/handover/CURRENT.json`
- `.helix/handover/provider/CURRENT.json`
- `.helix/handover/provider/*.json`

必須 properties:

- ファイルに schema がある場合の schema/version marker
- provider handover package 用の `handover_kind: "mechanical"`
- active plan
- provider-specific な場合の runtime direction
- budget または execution note
- next action list
- relevant file list
- timestamp

Mechanical handover だけを、微妙な engineering judgement の唯一の保存場所にしてはならない。

## 2. Explicit Handover（人間向け引き継ぎ）

Explicit handover は、人間が読める judgement と narrative context である。

正本の場所:

- `docs/handover/session-handover-*.md`

provider-dispatch または cross-runtime handover で必須の sections:

- Mechanical Handover pointers
- Explicit Handover summary
- Work Completed
- Next Actions
- Carry
- Do Not Break

Explicit handover は mechanical handover files を引用してよいが、provider JSON を開かなくても理解できなければならない。

## 3. Naming Rule（命名ルール）

意図する意味が次のいずれかである場合、"goal complete treatment" のような曖昧な wording を使わない。

- `goal_complete`: goal 自体が達成され、必要な作業が残っていない状態。
- `completion_status`: plan、handover、audit の現在の status label。

混ざった wording ではなく、これらの具体的な term のどちらかを使う。

## 4. Verification

Provider handover tests は `handover_kind: "mechanical"` を assert しなければならない。

Handover review では次を verify しなければならない。

- mechanical state が存在し、active plan を指していること;
- explicit handover が人間の judgement のために存在すること;
- active plan がまだ `in_progress` である間、`Next Actions` が完了を主張していないこと;
- provider JSON が微妙な decision の唯一の source ではないこと。
