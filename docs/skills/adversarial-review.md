---
schema_version: skill.v1
name: adversarial-review
skill_type: review
applies_to:
  layers:
    - L2
    - L3
    - L4
    - L5
    - L6
    - L7
    - L8
    - L10
    - L12
  drive_models:
    - Forward
    - Add-feature
    - Reverse
    - Recovery
    - Refactor
---

# 敵対的 review（adversarial-review）

Forward cycle の judgement gate G2、G4、G5、G6、G7 で必要になる、前提を疑う独立 review
（FR-L1-13 workflow、FR-L1-21 cross-agent review）。敵対的 review は self-review と異なり、
reviewer が成果物を確認するのではなく、積極的に反証しようとする。

## この skill を読み込むタイミング

- hybrid または intra-runtime-subagent mode で pair-freeze、trace-freeze、accept gate を通過する。
- `helix review --uncommitted` の finding が曖昧で、独立した judgement が必要である。
- Recovery cycle で、元の failure path が閉じたことを示す必要がある。
- 新しい agent capability を持つ Add-feature PLAN に safety reasoning が必要である。

## 敵対構造の原理（投票との違い）

構造 gate（doctor green）は「壊れていない」ことの検出器であり、品質の証明ではない。
敵対的 review は投票（意見の集約）ではなく**敵対構造**である: 攻撃者の任務は成果物を破る
**具体的な反例の構築**、防御者の任務は提示情報の**引用による反駁**。意見は攻撃でも防御でもない。
判定原理は「合意」ではなく「**反駁されない攻撃が立っているか**」。人間確認（PO 抜き打ち）の
代替ではなく、人間が見る件数を減らすフィルタである。

### 攻撃者の規約

- 成立する攻撃は 4 種のみ: ①合否が分かれる 2 つの読み方の実証（判定不能）、②宣言テストが
  覆わない具体的な入力・状態・順序、③証跡から再確認手順が組めないことの特定（証跡の崩し）、
  ④テストが緑でも要件が満たされない反例シナリオ。
- 「曖昧だと思う」「不十分に見える」は攻撃ではない。**反例そのもの**を書く（再現条件つき）。
- 攻撃が構築できなければ no_attack を宣言し、試行した攻撃と不成立理由を**最低 3 件**記録する
  （試行ログなしの no_attack は無効 = OPEN 扱い）。
- 弱い攻撃を量産して義務を果たさない。成立条件を満たさない攻撃は防御者が容易に反駁する。

### 防御者の規約

- 反駁の根拠は**提示された成果物・design doc・test の引用のみ**。「常識的に考えて」
  「意図としては」は反駁ではない。
- 形式は「その反例は本文の『…』により排除される」。引用で排除できない攻撃には**反駁を書かない**
  （空欄のまま = 攻撃成立を認める。それが正しい判定であり、防御者の失点ではない）。
  無理に庇うのは改ざんに近い。守れない攻撃は通す。

### 判定と役割分離

- 反駁されない攻撃が 1 つでも → **FLAG**（是正へ。攻撃記録の編集・削除による握りつぶしは
  改ざんであり禁止）。
- 全攻撃が反駁済み → PASS。ただし PASS は「この攻撃者の攻撃に耐えた」以上の意味を持たない。
- no_attack（試行ログ 3 件以上）→ **PASS-WEAK**（人間確認の優先対象。攻撃が出ないことは
  安全の証明ではない）。
- **成果物の作成に関与したモデル・セッションは攻撃者にも防御者にも就けない。** 同系統モデルは
  盲点が相関するため、可能な限り別 runtime / model family へ回す（hybrid の judgement gate
  分離と同一方針）。reviewer には作業経過・会話履歴を渡さず、成果物と design 正本だけを渡す
  （経緯への同調を防ぐ）。

## 敵対的 stance

reviewer の出発点は、artifact が誤っている、または不完全であるという仮定である。
evidence はその仮定を覆す必要があり、覆い隠してはいけない。「Done の偽装」型
（AC 未検証のまま Done 宣言 / 垂直スライスの偽装 / AC の後付け緩和 — 詳細は
acceptance-criteria-thinking §2）を含め、特に probing する failure mode は次のとおり。

- **中身のない coverage。** `helix doctor` が green で `helix vmodel lint` が pass しても、
  design content が正しいとは限らない。各 design doc を読み、主張が本文で実際に裏付けられているか確認する。
- **gate 回避。** すべての `// biome-ignore` と `// @ts-ignore` に、PLAN-linked rationale があることを確認する。
  説明のない suppression は review fail とする。
- **trace 完全性。** PLAN の `review_evidence` field に記載されたすべての FR は、
  ID string だけではなく、実在する design doc または test assertion に対応している必要がある。
- **layer artifact 欠落。** 新しい function に対する L6 test-design doc が欠けている場合、
  L7 code が存在していても open obligation として記録する。
- **continuation 整合性。** session が runtime boundary をまたぐ場合、`helix status` が読む
  `harness.db` continuation projection の active PLAN・next action が、authored sources と一致することを確認する。

## gate 別 review 手順

**G2（pair-freeze: 実装へ進める設計準備）:**
1. `helix plan lint` が exit 0 になる。
2. `helix doctor` が exit 0 になる。
3. header table だけでなく、design doc 本文を読む。
4. design が stated layer の期待 granularity に合っていることを確認する
   （L5 = unit test boundary であり、L3 feature-level prose ではない）。
5. reviewer identity と outcome とともに、finding を PLAN `review_evidence` に記録する。

**G4/G5（trace-freeze: 実装完了）:**
1. `bun run typecheck`、`bun run lint`、`bun run test` がすべて HEAD で exit 0 になる。
2. `helix doctor` が exit 0 になる。
3. PLAN rationale なしの `.skip` または `todo` が Vitest scope に無いことを確認する。
4. test assertion を3件 spot-check する。指定された behaviour を実際に exercise しているか、
   happy path だけを verify していないかを確認する。
5. finding を記録する。

**G6/G7（accept: final acceptance）:**
1. `helix review --uncommitted` に blocking finding が無い。
2. すべての G4/G5 condition が引き続き green である。
3. 該当する ADR が `Accepted` になっている。
4. `harness.db` continuation projection が最新 event まで投影され、`helix status` と整合している。

## evidence format（証跡形式）

敵対的 review evidence は PLAN の `review_evidence` field に記録する。

```
reviewer: <agent-slug or "intra_runtime_subagent">
gate: G5
outcome: PASS | FAIL | CONDITIONAL
findings:
  - <specific finding or "none">
timestamp: <ISO-8601>
```

evidence が記録されていない gate は、`helix doctor` status に関係なく cleared ではない。

## アンチパターン（anti-pattern）

- `helix doctor` green を唯一の required check とみなす。doctor が見るのは structure であり substance ではない。
- partial diff だけを対象に review する。常に full PLAN scope を review する。
- hybrid mode で self-review だけを review evidence とする。hybrid mode では別 runtime または subagent family が必要である。
- 攻撃・防御を「意見」で済ませる（反例と引用が必須）。
- verdict を先に書いてから根拠を探す。基準ごとに evidence を cite してから
  PASS / FAIL / UNCERTAIN を宣言する（evidence → verdict の順序。根拠不足は推測で埋めず
  UNCERTAIN とする）。
- FLAG を残したまま gate を cleared 扱いにする（未完に正直であることが review の信頼を守る）。
