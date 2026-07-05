---
schema_version: skill.v1
name: api
skill_type: design-contract
applies_to:
  layers:
    - L3
    - L4
    - L5
    - L6
    - L7
    - L8
  drive_models:
    - Forward
    - Add-feature
    - Reverse
    - Retrofit
---

# API 設計

新規または変更された API surface（API 境界）に伴う REST/RPC endpoint design とバージョン方針、
HELIX V-model 上の責務を定義する。PLAN が API endpoint を追加・変更・削除する場合に使う。

## この skill を読む条件

- 新しい REST または RPC surface（境界）を定義する L4 basic-design doc を書く。
- `kind=add-impl` または `kind=add-design` の PLAN が `src/` routes または CLI command dispatch（command 分岐）に触れる。
- Reverse R1 pass で既存 HTTP surface を contract doc（契約 doc）に抽出する必要がある。
- L8 integration-test design で test 対象 API contract を指定する必要がある。

## API surface の V-model 責務

**L3 (functional design):** 各 endpoint に名前を付け、trigger、actor、
観測可能な outcome を記載する。implementation detail は書かず、
「caller から見えるもの」だけを書く。

**L4（basic design）:** method、path、request shape、response shape、error codes を定義する。
バージョン方針を指定する。L4 doc は `docs/design/<product>/L4-basic/` に置く。
pair-freeze 前に、`docs/test-design/` 配下の L8 integration-test design doc と対応させる。

**L5（detailed design）:** serialisation format、auth scheme、rate-limit policy を定義する。
pagination model を定義する。L6 unit-test design（error-path coverage、boundary values）と対応させる。

**L7 (implementation):** code は L4 contract と完全に一致しなければならない。
差分がある場合は、merge 前に L4 doc update と新しい pair-freeze が必要。

## Versioning rules（バージョン管理規則）

- すべての public routes は path level で `/v<N>/` prefix を持つ。
- Breaking changes（field removal、type change、status-code change）は new version が必要。
  additive changes（optional field、new endpoint）は non-breaking。
- バージョン判断は L4 doc の `## API Versioning` heading 配下に記録する。
  code comments だけに暗黙化しない。
- deprecated versions は L4 doc に sunset date を持ち、response header
  （`Deprecation: <date>`）を返す。

## API PLAN の pair-freeze checklist

- [ ] `docs/design/.../L4-basic/` に L4 doc があり、method、path、shapes、
      errors、versioning section を持つ。
- [ ] `docs/test-design/` に L8 integration-test design doc があり、L4 doc を path で参照している。
- [ ] `helix plan lint` が exit 0（PLAN `generates` が L4/L8 docs の両方を列挙する）。
- [ ] `helix doctor` exits 0.
- [ ] endpoint name が既存 routes と conflict しない
      （wiring が modules をまたぐ場合は dependency view として `helix graph` を使う）。
- [ ] 新しい resource または domain term がある場合、L0 glossary が更新されている。

## Reverse pass（既存 API の抽出）

Reverse drive が既存 `src/` code から始まる場合、tests を書く前に code 精査から
L4 contract doc を作る。`helix review --uncommitted` を使い、抽出した doc がすべての
handler path を覆っていることを確認する。R1 output（contract doc）は、その surface に対する
以後の Forward または Add-feature work の SSoT になる。
