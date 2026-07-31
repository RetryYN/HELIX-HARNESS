---
title: "Design Template JSON authority機能設計"
layer: L6
artifact_type: design
status: draft
created: 2026-07-31
updated: 2026-07-31
owner: SE
plan: docs/plans/PLAN-L6-86-design-template-json-authority.md
pair_artifact: docs/test-design/helix/L8-design-template-json-authority-unit-test-design.md
related_l5: docs/design/helix/L5-detail/design-template-json-authority.md
---

# Design Template JSON authority機能設計

## §1 module境界

実装候補は`src/design/design-template-authority.ts`の単一moduleとする。まずpure functionだけで成立させ、
repository loader、CLI、DB projection、Markdown writerは本sliceへ追加しない。JSON Schema libraryは
既存dependencyを再利用できる場合だけadapter側で使い、core resultをlibrary固有errorへ束縛しない。

```ts
type Finding = {
  code: DesignTemplateFindingCode;
  pointer: string;
  message: string;
};

type ValidationResult<T> =
  | { ok: true; value: T; findings: [] }
  | { ok: false; findings: Finding[] };
```

findingは`code -> pointer -> message`の順でstable sortし、入力順やruntime localeでdigestを変えない。

## §2 `validateDesignTemplate`

```ts
function validateDesignTemplate(
  input: unknown,
  context: {
    schemaVersion: "helix-design-template.v1";
    currentPairs: ReadonlyArray<readonly [string, string]>;
    allowedFieldPaths: ReadonlySet<string>;
  },
): ValidationResult<DesignTemplate>;
```

### DbC

- pre: inputはuntrustedであり、callerがparse済みと仮定しない。
- post: `ok=true`ならrequired field、identity、lifecycle、pair、predicate、trace、verification、
  measurement、completion、semantic digestが全て成立する。
- invariant: unknown property、unknown enum、unsafe integer、duplicate IDを保持したtyped valueを返さない。

### pseudocode

```text
parse strict schema
if parse findings exist -> return stable failure
validate stable identity and lifecycle transition
validate current L1-L12 layer pair
walk applicability tree with depth/node limits
validate trace, oracle, measurement and completion exact sets
recompute semantic digest and compare
return typed value only when findings = 0
```

## §3 `validateDesignTemplateRegistry`

```ts
function validateDesignTemplateRegistry(
  registry: unknown,
  templates: ReadonlyArray<DesignTemplate>,
): ValidationResult<DesignTemplateRegistry>;
```

- registry entryとtemplateのID/version/digest exact setを双方向比較する。
- duplicate identity、missing/extra entry、unknown latest解決、canonical normative owner重複を拒否する。
- deprecated entryはreplacement、consumer exact set、retention、removal triggerを要求する。
- logical digestはstable key順とtemplate ID/version順で計算し、observed timestampを含めない。

## §4 `evaluateTemplateApplicability`

```ts
function evaluateTemplateApplicability(
  predicate: PredicateNode,
  facts: Readonly<Record<string, unknown>>,
  limits?: { maxDepth: number; maxNodes: number },
): {
  outcome: "applicable" | "not_applicable" | "evaluation_error";
  findings: Finding[];
};
```

### DbC

- `all/any/not/comparison`はexactly-one variant。
- boolean short circuitを許可するが、unknown field/operator/type errorを隠さない。
- `evaluation_error`が1件でもあればapplicable/not_applicableを返さない。
- missing factをfalseへ丸めず、`exists`以外ではerrorにする。
- default limitはdepth 16、node 256とし、超過時はbounded failureを返す。

## §5 `compileTemplateShadowReport`

```ts
function compileTemplateShadowReport(input: {
  source: SourceArtifactSnapshot;
  candidate: DesignTemplate;
  mappings: ReadonlyArray<ShadowAtomMapping>;
  designDecisions: ReadonlyArray<DesignDecisionReceipt>;
}): ValidationResult<DesignShadowReport>;
```

### pseudocode

```text
validate source repository-relative path, digest and authority
validate candidate template
sort source atoms and mappings by stable pointer
reject duplicate source/target normative mapping
classify each atom exactly once
reject compatibility/historical -> current default promotion
compare requirement, owner, failure, oracle, measurement and pair meaning
require decision + independent review for each explained delta
derive exact | explained_delta | failed without caller override
return report with logical digest when blocking findings = 0
```

source proseの自然言語同値性をLLM推測で確定しない。compilerへ渡す`mappings`と`designDecisions`は
別authorityが作るproposalであり、本関数は完全性・一意性・authorityだけを検証する。

## §6 `verifyGeneratedDesignView`

```ts
function verifyGeneratedDesignView(input: {
  sourceSemanticDigest: string;
  embeddedSourceDigest: string;
  regeneratedLogicalDigest: string;
  checkedInLogicalDigest: string;
}): ValidationResult<{ current: true }>;
```

4 digestがexact一致する場合だけcurrentを返す。Markdown byteのtimestampや改行差はlogical projector側で
正規化済みとし、この関数で曖昧な差分除外を追加しない。直接編集は`generated_view_drift`とする。

## §7 errorとcapacity

throwはprogrammer errorに限定し、untrusted inputは全てtyped findingへ変換する。findingは最大512件、
templateはregistry当たり最大4096件、sectionはtemplate当たり128件、fieldはsection当たり256件とする。
上限超過はtruncate成功にせず`capacity_exceeded`でfail-closeする。

## §8 実装時の最小化条件

- schema type、finding type、stable sort、digest helperは既存共通ownerがあれば再利用する。
- class、DI container、repository、cache、worker、new detectorを追加しない。
- Red testが要求しない永続化、CLI、generated view writerは後続responsibilityへ送る。
- `validateDesignTemplate`とregistry validationで同じruleを複製せず、registryはvalidated valueだけを受ける。
