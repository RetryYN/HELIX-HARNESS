---
title: "HELIX L6 機能設計 — UI Domain・Pattern Profile"
layer: L6
kind: add-design
status: draft
created: 2026-08-08
updated: 2026-08-08
owner: Claude / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
design_slice: HDS-UDP-01
related_l3: docs/design/helix/L3-requirements/ai-vision-design-harness-engine.md
related_l5: docs/design/helix/L5-detail/ui-domain-pattern-profile.md
pair_artifact: docs/test-design/helix/L6-ui-domain-pattern-profile-unit-test-design.md
next_pair_freeze: L7
requirements:
  - VDH-FR-003
  - VDH-FR-005
  - HR-FR-DHR-004
github_issue_id: 209
---

# HELIX L6 機能設計 — UI Domain・Pattern Profile

pure API は filesystem / clock / DB を直接読まず versioned input を受ける（#177 L6 と
同一方針）。registry への write は #177 の transaction 経路を typed consumer として使い、
本 module は write authority を持たない。

## §0 型とauthority

```ts
type UiEntityKindV1 = "page" | "user_flow" | "navigation" | "region_slot" | "ui_component" |
  "interaction_pattern" | "design_token" | "content" | "feedback" | "ui_state";
type UiSurfaceClassV1 = "operational" | "expressive" | "mixed";
type UdpAxisV1 = "device" | "input" | "role" | "locale" | "data_volume" | "network" |
  "concurrent_update" | "destructive_undo";
type UdpRiskClassV1 = "high" | "medium" | "low";
type UdpFailureV1 =
  | { code: "UDP_ID_INVALID" | "UDP_CONTRACT_CONFLICT" | "UDP_PRODUCT_VALUE_IN_COMMON_PACK"
      | "UDP_PROFILE_INCOMPLETE" | "UDP_CARTESIAN_EXPLOSION" | "UDP_PAIRWISE_UNCOVERED"
      | "UDP_RISK_UNCOVERED" | "UDP_TRACE_UNBOUND" | "UDP_STALE_INPUT";
      evidence_digest: string };
type UdpResultV1<T> = { ok: true; value: T } | { ok: false; failures: readonly UdpFailureV1[] };
```

## §1 public API／DbCの契約

| API | 完全signature | DbC | 主U |
|---|---|---|---|
| `canonicalizeUiDomain` | `(raw: unknown, policy: UdpPolicyV1) => UdpResultV1<UiDomainDeclarationV1>` | kind別prefix regex・class名/file path/DOM selector主キーの拒否・stable sort・dedup・semantic_digest採番。同義入力は同digest。schema_version不一致と`authority=stale|retired`のcanonical渡しは`UDP_STALE_INPUT`（全pure API共通の入口検査） | `U-UDP-001` |
| `validatePatternContract` | `(contract: PatternContractV1, domain: UiDomainDeclarationV1) => UdpResultV1<ValidatedContractV1>` | required/forbiddenの対象entity実在検査、同一対象への競合宣言は`UDP_CONTRACT_CONFLICT`、contract外entityの構成提案を許可しない判定基盤を返す。schema_version不一致とstale/retired入力は`UDP_STALE_INPUT`（共通入口検査） | `U-UDP-002` |
| `guardRulePackIsolation` | `(pack: CommonRulePackV1, profile: UiProfileV1) => UdpResultV1<IsolationReceiptV1>` | 共通Rule Pack内のproduct namespace値（profile_id参照・brand token実値・product文言）を`UDP_PRODUCT_VALUE_IN_COMMON_PACK`でfail-close。逆方向（profileが共通packを参照）は許可。schema_version不一致とstale/retired入力は`UDP_STALE_INPUT`（共通入口検査） | `U-UDP-003` |
| `validateUiProfile` | `(profile: UiProfileV1) => UdpResultV1<ValidatedProfileV1>` | information_priority・pattern/token許容集合・responsive宣言・motion budget + reduced-motion代替・a11y制約・brand制約・surface分類の必須完備。欠落は`UDP_PROFILE_INCOMPLETE`で欠落field全列挙。schema_version不一致とstale/retired入力は`UDP_STALE_INPUT`（共通入口検査） | `U-UDP-004` |
| `selectPairwiseFixtures` | `(input: PairwiseInputV1) => UdpResultV1<FixtureSelectionV1>` | 8軸の全2軸ペア被覆100% + high risk entry全件包含（部分指定entryは指定軸を固定seedに最低1 fixtureを決定的生成し、残余軸はpairwise補完・Cartesian展開なし）+ 決定的順序。全Cartesian要求は`UDP_CARTESIAN_EXPLOSION`、被覆欠落は`UDP_PAIRWISE_UNCOVERED`/`UDP_RISK_UNCOVERED`、schema_version不一致は`UDP_STALE_INPUT`（共通入口検査） | `U-UDP-005` |
| `evaluateUiDomainBundle` | `(raw: unknown) => UdpResultV1<UiDomainBundleReportV1>` | CLI 表面（`helix ui-domain check --input <file>`）の判定核。`ui-domain-bundle.v1` の bundle（domain 必須、contract / profile / pack / graph / pairwise は任意）を受け、canonicalize→（宣言があれば）contract / profile / pack 隔離 / consumer trace / pairwise 選定を section 別に評価し、section 名で帰属させた typed failure 一覧と全 section green の時のみ bundle_ok の決定的 report を返す。green section は各純関数の既存 digest を value_digest として引き上げ、report_digest は pass/fail 形状に加え value_digest を含む実内容 fingerprint とする（中身の異なる green bundle は異なる digest）。bundle schema 不一致・非 record は `UDP_STALE_INPUT`。section 内容が構造不正（schema_version は正しいが必須ネスト field 欠落・null 等）で純関数が throw する場合も当該 section の `UDP_STALE_INPUT`（section-malformed）へ fail-close し、他 section の評価結果を握り潰さない。依存 section（contract/trace→domain、pack→profile）の欠落・失敗は section-skipped の typed failure とし silent skip しない。CLI は read-only で DB / registry write を持たず、exit 0=全 green / exit 1=fail-close 所見または typed error とする | `U-UDP-007` |
| `buildUiConsumerTrace` | `(domain: UiDomainDeclarationV1, graph: RegistryGraphV1, policy: UdpPolicyV1) => UdpResultV1<ConsumerTraceV1>` | #177 共有 ID 空間（`SCR-`→screen / `FLW-`→flow / `CMP-`→component / `TOK-`→design_token / `CNT-`→content = `UI_REGISTRY_KIND_MAP`）の UI entity ごとに、registry graph に同一 `entity_id` の canonical node が存在し kind が対応することを検査し、trace entry（entity_id / registry_kind / registry_revision）を entity_id 昇順の決定的列 + `trace_digest` で返す。registry 側 node 欠落・kind 不対応・`authority≠canonical`（shadow / stale / retired）の参照は `UDP_TRACE_UNBOUND` で全列挙 fail-close（shadow は未成熟 node への binding を安全側で拒否する意図的仕様）。graph 側の重複 `entity_id` は並び順依存の後勝ちを許さず `UDP_STALE_INPUT` で fail-close。UI-local prefix（`NAV-`/`RGN-`/`PTN-`/`FBK-`/`UST-`）は registry binding を要求しない。schema_version 不一致は `UDP_STALE_INPUT`（共通入口検査）。台帳の複製新設をしない（read-only consumer、write は #177 transaction 経路のみ） | `IT-UDP-002` |

## §2 schema

```ts
interface UiDomainEntityV1 { entity_id: string; kind: UiEntityKindV1; revision: number;
  authority: "shadow" | "canonical" | "stale" | "retired"; semantic_digest: string;
  source_pointer: string }
interface PatternContractV1 { schema_version: "ui-pattern-contract.v1"; pattern_id: string; required: readonly ContractTermV1[];
  forbidden: readonly ContractTermV1[]; revision: number }
interface ContractTermV1 { target_kind: UiEntityKindV1; target_id: string | null;
  condition: string }
interface UiProfileV1 { schema_version: "ui-profile.v1"; profile_id: string; surface_class: UiSurfaceClassV1;
  information_priority: readonly string[]; allowed_patterns: readonly string[];
  allowed_tokens: readonly string[]; responsive: ResponsiveDeclV1; motion: MotionDeclV1;
  accessibility: A11yDeclV1; brand: BrandDeclV1; revision: number }
interface MotionDeclV1 { budget_ms: number; reduced_motion_alternative: string }
interface CommonRulePackV1 { schema_version: "ui-common-rule-pack.v1"; pack_id: string;
  rules: readonly CommonRuleV1[]; revision: number }
interface PairwiseInputV1 { schema_version: "ui-pairwise-input.v1"; axes: Readonly<Record<UdpAxisV1, readonly string[]>>;
  risk_matrix: readonly RiskEntryV1[]; mode: "pairwise" }
interface RiskEntryV1 { levels: Partial<Record<UdpAxisV1, string>>; risk_class: UdpRiskClassV1 }
interface FixtureSelectionV1 { fixtures: readonly FixtureV1[]; pair_coverage: 1;
  high_risk_included: number; selection_digest: string }
interface FixtureV1 { fixture_id: string; levels: Readonly<Record<UdpAxisV1, string>>;
  risk_class: UdpRiskClassV1 }
```

`mode` に `"pairwise"` 以外（全積要求）を渡す入力型を定義しない（型で Cartesian を遮断し、
untyped 入力の `mode` 逸脱は `UDP_CARTESIAN_EXPLOSION`）。selection_digest は fixtures の
決定的 sha256（同一入力 → 同一 digest）。

## §3 完了境界

U-UDP-001〜005 の typed failure・mutation 反例（class/path 主キー、required/forbidden 競合、
product 値混入、reduced-motion 代替欠落、全積要求、ペア被覆欠落、high risk 欠落）と、
IT-UDP-001〜002 が green になるまで draft とする。実装スライスは
純関数群（canonicalize・contract・isolation・profile）→ pairwise selector →
registry consumer 接続 / CLI 表面 の順で #177 と同じ規律を踏襲する。
