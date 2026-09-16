# A-123 Lower-L Reverse back-propagation 強化

日付: 2026-06-09
Context: A-122 / Phase2 pre-close hardening 後のユーザーレビュー

## トリガー

ユーザーは workflow の弱点を指摘した。下位 L layer で発見された追加や ticket が、Reverse 経由で上位 requirements/design layer へ戻されず、local carry/backlog のまま残り得る。この状態は whole-system consistency principle を破る。

## 所見

既存 governance には部分的な mechanism があった:

- requirements §1.10 E2 の `kind=add-impl` back-fill pairing。
- requirements §1.10 registration の FR-L1 delta registration と §1 back-merge。
- process mode docs で、add-feature の bottom-up work が Reverse fullback 経由で戻ること。

不足していた rule は、add-feature だけでなく任意の lower-layer discovery に対する cross-cutting completion guard だった:

- L6/L7 の test または implementation discovery。
- L8-L14 の verification finding。
- DB projection / guardrail / workflow automation の追加。
- requirements または acceptance semantics を変える improvement backlog item。

## 決定

Lower-layer discovery は completion 前に分類しなければならない:

- `local_impl_only`
- `requires_design_normalization`
- `requires_requirement_backprop`
- `requires_concept_policy`

Reverse back-prop が open の間、`requires_*` item は completed/confirmed/accepted と扱えない。

## 変更

- requirements v1.2 §6.8.8 `Lower-L discovery Reverse back-propagation` を追加。
- `docs/process/forward/overview.md` に `LOWER-L-REVERSE-BACKPROP` を追加。
- `docs/process/modes/README.md` に `LOWER-L-REVERSE-BACKPROP` を追加。
- 将来の doctor / plan-lint enforcement として `IMP-117` を追加。

## 例の紐付け

A-122 UT evidence history / GreenDefinition / Harness DB projection は local L5/L6 carry ではない。これは既存 FR-L1-05/06/07/17/18/20/45/50 の `requires_requirement_backprop` extension であり、前回の hardening pass で L1/L3/requirements へ back-propagate 済みである。

## 残る automation work

IMP-117 は implementation 待ちとして open のままである:

- lower L discovery から作成される PLAN/audit/backlog entry に `backprop_decision` field を必須化する。
- `helix doctor` / `plan-lint` では、まず warn-first とする。
- `requires_*` item が open の場合、G7 / accept で fail-close へ昇格する。
