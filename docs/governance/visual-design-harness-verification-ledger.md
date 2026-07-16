---
title: "Visual Design HARNESS verification adoption ledger"
status: draft
created: 2026-07-16
updated: 2026-07-16
owner: PO / TL / UIUX
scope: visual-design-only
---

# Visual Design HARNESS検証基盤台帳

## §0 ownership

Design HARNESSはvisual intent、visual contract、rendered visual evidence、human visual acceptanceだけを所有する。
一般要求、workflow、architecture、CI、DesignRefactor、semantic a11y全体をDesign HARNESSへ吸収しない。

```text
L5 Detailed Visual Contract ↔ L8 Atomic Visual Contract Verification
L4 Cross-screen Visual System ↔ L9 Cross-screen Visual Integration
L3 Screen FR/AC/NFR ↔ L10 Browser/Data Visual System Verification
L2 Prototype Agreement/Visual Intent ↔ L11 Human Visual Acceptance/Preference
```

L7はL6とのVisual TDD closureであり、UI-M0..M7 mission、required state、render/state/semantic oracleを閉じる。

## §1 existing asset disposition （日本語の契約見出し）

| source | capability | disposition | hardening / boundary | （日本語の機械契約記述）
|---|---|---|---|
| Hybrid ZIP `docs/51_画面検証(UIテスト)設計.yaml` | component→E2E→VRT→browser/responsive→a11y、empty/error/i18n、multi-browser/viewport | adopt-with-hardening | L8–L10へatomic matrixとして分解 |
| Hybrid ZIP `vmodel-visual-review/SKILL.md` | 9状態、viewport、font 200%、i18n/RTL/theme、VRT分類、baseline review、keyboard/grayscale/screen reader | adopt-with-hardening | raw skillをactive authorityにせずHARNESS contract/fixtureへ抽出 |
| Rebaseline `AC-DH-14..20` | responsive、motion、a11y、real data/render、isolated Node tools | adopt-with-hardening | package AC→current HIL/HAC/L8–L11 exact edgeを作る |
| Rebaseline semantic IDs / UI-M0..M7 / false completion | visual continuityとmission receipt | adopt-with-hardening | canonical L1–L12/TDDへremap |
| Rebaseline `ux-evidence.schema.json` | visual/token/a11y/VRT/responsive/motion/continuity/realData/review family | redesign | enum＋pathだけをtyped case/matrix/oracle/artifactへ分解 |
| UT receipt custody/fail-close | evidence lineageとmissing-family拒否 | adopt-with-hardening | marker存在でなく実evidence substanceへ |
| UT 5 UXV minimum | 15 screenに5 caseのaggregate minimum | reject as completion oracle | UT自身のA-181 findingをnegative fixture化 |
| 現行 `g10-ux-workflow.ts` | marker/manifest family lint | transition-only | `contract_present`だけを検査しvisual PASSにしない |
| 現行selected G10 evidence | RENDER/A11Y/BLOCKERをall passed | hard reject as visual evidence | browser/screenshot/axe 0、唯一commandがBun unit test |

## §2 known false-green fixture （日本語の契約見出し）

`.helix/evidence/g10-ux/20260705-selected-ux-evidence.json`は`UXV-RENDER/A11Y/BLOCKER`をpassed、
`all_mandatory_passed=true`とするが、唯一のcommandは`bun test tests/g10-ux-workflow.test.ts`である。RENDER/A11Y pathは
test/docで、browser render、screenshot、axe resultは0件である。

このartifactは`HIL_VISUAL_CONTRACT_ONLY_FALSE_PASS`のnegative fixtureとして保存し、状態を
`contract_present`または`designed_not_executed`へ降格する。実browser receiptなしのvisual `passed`をrejectする。

## §3 verification denominator （日本語の契約見出し）

| layer | denominator | required evidence | （日本語の機械契約記述）
|---|---|---|
| L7 | screen/component mission×required state/oracle | source/test/contract ID、DOM/a11y tree、render、command digest | （日本語の機械契約記述）
| L8 | component/region/slot×9 state×theme×viewport×binding negative path | network/event/state trace、computed style/token、render/a11y artifact | （日本語の機械契約記述）
| L9 | screen×state×viewport×theme×locale×text scale×motion preference | baseline/candidate/diff heatmap、geometry、token provenance、a11y/perf report | （日本語の機械契約記述）
| L10 | AC×role×critical journey×browser/OS/viewport/DPR×data scenario | sanitized product snapshot、journey/video/render、timing、DB/API lineage | （日本語の機械契約記述）
| L11 | agreement criterion×current evidence packet×human actor | revision-bound annotated capture/session note、PASS/FAIL/UNCERTAIN、dissent/backprop | （日本語の機械契約記述）

coverage matrixはpairwiseで縮約可能だがcritical cellはfull matrixを維持する。縮約algorithm/versionと非選択cellの理由をreceipt化し、
resource制約によるrequired evidence dropを禁止する。aggregate screenshot 1枚を複数cellへ水増ししない。

## §4 evidence contract hardening （日本語の契約見出し）

全captureはcommit/tree/build、OS、browser engine/version、font set、DPR、viewport、locale、theme、timezone、text scale、
motion preference、fixture/product snapshot digest、tool versionを固定する。各evidence itemはfamily、case、oracle、expected/actual、
result、artifact digest、producer/verifier、provenanceを持つ。

baseline lifecycleは`proposed→independent_diff_review→human_approved→active→superseded/revoked`とし、自動更新、同run producerの
baseline更新＋PASS、failure解消目的のlaunderingを拒否する。flaky retry履歴、quarantine reason/expiry/ownerを保存し、quarantineを
greenへ算入しない。Linux deterministic render labをauthoritative、macOSをfirst-class portable、Windowsをcompatibility profileとする。

oracleはschema/DOM、token/computed style、geometry、pixel/perceptual diff、visual-a11y、interaction、performance、人間判断を
組み合わせる。pixel diff単独、AI vision単独、raw MCP screenshot単独を合格oracleにしない。

## §5 closure

| metric | current | verdict |
|---|---:|---|
| source capability inventory | main families identified | PARTIAL | （日本語の機械契約記述）
| L8–L11 layer contract | designed | DRAFT | （日本語の機械契約記述）
| typed evidence schema implementation | 0 | FAIL | （日本語の機械契約記述）
| actual browser/VRT/a11y runtime | 0 | FAIL | （日本語の機械契約記述）
| current false-green reclassification | design only | FAIL | （日本語の機械契約記述）
| L8/L9/L10 executed matrix cell | 0 | FAIL | （日本語の機械契約記述）
| L11 human acceptance receipt | 0 | FAIL | （日本語の機械契約記述）

実装指示前のためruntime未実装は期待状態である。ただし要件freezeにはsource atom、L1/L3/L4/L5 test design/L8–L11 gateのexact edgeと
人間authority境界を閉じる。

## §6 schema v2＋28 case独立semantic review

`scripts/audit/review-visual-design-harness.mjs`でL4 schema v2の14 table、L8–L11の28 case、Design AC closure
18件へのjoinを再生する。machine receiptは`docs/governance/generated/visual-design-harness-semantic-review-v1.json`
（SHA-256 `415e316adc768ffe03b564218ebb680a35fdcf899664e62cb8e007382fad26db`）である。

| review metric | result |
|---|---:|
| schema table | 14/14 |
| case | 28/28（L8 6 / L9 7 / L10 8 / L11 7） |
| corrected finding | 4 |
| case / obligation / oracle / failure orphan | 0 / 0 / 0 / 0 | （日本語の機械契約記述）
| authority / Design AC18 / schema orphan | 0 / 0 / 0 | （日本語の機械契約記述）
| CAS/security direct negative | `VIS-L8-B01` | （日本語の機械契約記述）
| baseline laundering direct negative | `VIS-L9-F05` | （日本語の機械契約記述）
| execution / authority activation / coverage | 0 / 0 / 0 | （日本語の機械契約記述）

是正は9状態fixture、critical matrix分母、producer identity blind境界、CAS digest/path/redaction/retentionの4点である。
semantic reviewは設計edgeの整合だけを閉じ、runtime execution、人間authority、coverage creditを昇格しない。
