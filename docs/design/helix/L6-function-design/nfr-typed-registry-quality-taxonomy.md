---
title: "NFR registry validator と doctor admission 機能設計"
layer: L6
artifact_type: design
status: draft
created: 2026-08-12
updated: 2026-08-12
owner: Codex / TL
plan: docs/plans/PLAN-L6-105-nfr-typed-registry-quality-taxonomy.md
pair_artifact: docs/test-design/helix/L8-nfr-typed-registry-quality-taxonomy-unit-test-design.md
---

# NFR registry validator と doctor admission 機能設計

## 1. module 構成

| path | responsibility |
|---|---|
| `src/requirements/nfr-registry.ts` | 型定義、pure structural analyzer、source binding、migration admission |
| `src/doctor/nfr-registry-check.ts` | config read／JSON parse／analyzer呼出し／LintResult変換 |
| `src/doctor/index.ts` | 既存doctor check registryへの配線 |
| `config/nfr-registry.json` | production declaration SSoT |

validation本体とdoctor I/Oを分離する。新規CLI、DB table、network adapter、常駐workerは追加しない。

## 2. public functions の契約

### 2.1 `analyzeNfrRegistry(input, repoRoot?)`

判定順序はroot exact schema、root identity、entry identity／taxonomy、authority、measurement context、
objective declaration、probe／oracle／owner／evidence、required traceの順とする。
`repoRoot` 未指定時はsource digest形式まで、指定時はrealpathと実bytes一致まで検査する。

成功は `{ ok: true, value }`、失敗は `{ ok: false, failureCodes, messages }`。
throw、warning-only、部分value返却を行わない。`parseNfrRegistry` は同じ契約のaliasである。

### 2.2 `admitNfrRegistryMigration(previous, candidate, repoRoot?)`

1. previousをstructural validateする。
2. candidateをcurrent source bytes付きでvalidateする。
3. stable IDごとに削除、revision逆行、material change、空bumpを比較する。
4. new IDがrevision 1で開始することを確認する。
5. finding 0ならcandidateを返す。

previousのsource bytesを再読しない。candidateを保存せず、callerへadmission verdictだけを返す。

### 2.3 `checkNfrRegistry(repoRoot)`

`config/nfr-registry.json` をUTF-8で読み、missingとinvalid JSONを別failureにする。
analyzer failureは先頭messageへordered failure codeを含め、詳細messageを後続へ保持する。
成功messageはentry数とstable ID traceを含み、doctorの既存合成結果へ返す。

## 3. filesystem boundary の制約

- `safeRepoPath` はabsolute／drive path／backslash／空・`.`・`..` segmentを拒否する。
- authority sourceとevidence pathは`.helix/`／`node_modules/`を拒否する。
- `realpathSync(repoRoot)` とsource realpathのrelative resultでsymlink escapeも拒否する。
- SHA-256はNode `createHash`でsource bytesへ直接適用する。
- source解決不能はdigest mismatchとしてfail-closeし、missingを無視しない。

## 4. production seed の初期値

`config/nfr-registry.json` は次の3 entryを持つ。

| ID（識別子） | family / characteristic（分類） | surface（対象） | oracle（検証） |
|---|---|---|---|
| `HR-NFR-REG-001` | standard / maintainability | typed registry構造 | `U-NFRREG-001` |
| `HR-NFR-REG-002` | standard / functional suitability | authority分離 | `U-NFRREG-005` |
| `HR-NFR-REG-003` | ai_specific / judgment reproducibility | taxonomy coverage（分類網羅） | `U-NFRREG-003` |

baseline、target、SLO、error budget、hard limitは初回登録時点で`unknown`とし、#220をreferenceにする。
unknownをgreen実測値へ読み替えない。

## 5. doctor integration の配線

doctor indexは`nfr-registry` checkをexactly once登録する。config missing、JSON invalid、schema drift、
required trace partialは`ok:false`となる。doctorはconfigの自動修復やrevision bumpを行わない。

## 6. 非機能境界

- pure analyzer／migration admissionは入力不変かつdeterministic。
- runtime authorityはNode 24。外部dependencyを追加しない。
- secret、credential、PII、absolute machine pathをdeclaration／messageへ含めない。
- #220の評価、#221のprobe／history、#223のdispositionをimportしない。

## 7. verification binding の対応

- L8: `tests/nfr-registry.test.ts` の `U-NFRREG-001..017`。
- L9: `tests/nfr-registry-doctor.test.ts` の `IT-NFRREG-001..003`。
- implementation PLAN: `PLAN-L7-550-nfr-typed-registry-quality-taxonomy`。
