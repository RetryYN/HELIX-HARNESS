---
schema_version: skill.v1
name: api-and-interface-design
skill_type: design-contract
applies_to:
  layers:
    - L2
    - L3
    - L4
  drive_models:
    - Forward
    - Discovery
    - Add-feature
    - Reverse
    - Refactor
---

# API と interface design

L2/L3 boundary design では、screen / IA boundary、component interaction contract、
user-facing information architecture から具体的な L4 module interface への遷移を扱う。
この skill が管理するのは *boundary をどこに引くか* と *何がそこを越えるか* であり、
endpoint shape（`api.md` を参照）や compatibility contract（`api-contract.md` を参照）ではない。

## この skill を読む条件

- L2 screen / IA design で、user action が越える system boundary を特定する必要がある。
- L3 functional design が新しい component boundary を導入する、または既存 boundary を rename する。
- Discovery Scrum S2 PoC で、code を書く前に boundary sketch が必要。
- Refactor PLAN で、pair-freeze 前に external interface boundary が変わらないことを確認する必要がある。

## L2 boundary obligations（L2 boundary 責務）

L2 での問いは、どの screen または IA node が system boundary を越えて data を produce / consume するかである。
boundary crossing ごとに次を記録する:

- Source screen または agent action。
- Target component（CLI module、DB table、external service）を記録する。
- Data direction（read / write / event）を記録する。
- Ownership: 各側の schema を誰が control するか。

L2 design doc には `flowchart` または component diagram（Mermaid inline）を置く。
diagram 内のすべての boundary は、named L3 functional requirement、または PLAN に `requires`
dependency を持つ placeholder へ map する。

## L3 functional boundary の rule

- 各 IA boundary は、L3 doc 内の named **interface point** になる。
  actor、trigger、その actor が観測できる system response を含める。
- L3 では transport や encoding を説明しない。それは L4 の責務である。
- boundary が別 PLAN の scope と共有される場合は、ownership を重複させず PLAN に `placeholder_dep` を作る。

## L4 への遷移

L4 basic-design doc は、各 L3 interface point を具体的な module boundary
（function signature、command path、HTTP route）へ解決する。
L4 doc は、自分が実装する L3 interface-point name を参照しなければならない。
これは `helix vmodel lint` が検査する trace edge である。

## Pair-freeze checklist（L2/L3 boundary 設計）

- [ ] L2 doc に boundary diagram（Mermaid flowchart または component）がある。
- [ ] diagram 内のすべての boundary に named L3 interface point がある。
- [ ] 各 interface point について、それを解決する L4 doc の PLAN に一致する
      `requires` または `placeholder_dep` がある。
- [ ] 2 つの PLAN が同じ boundary を同時 ownership していない（`helix graph` で確認）。
- [ ] `helix plan lint` と `helix doctor` が 0 で終了する。
- [ ] Refactor PLAN では、対応する contract version bump なしに externally visible boundary name が
      変わっていないことを `helix review --uncommitted` で確認する。

## Discovery drive usage（Discovery drive での利用）

Discovery drive の Scrum S2 PoC では、lightweight boundary sketch
（PLAN doc 自体に置く informal component diagram）で十分。
S3 verify 前に、その sketch を正式な L2 または L3 design doc へ昇格し、PLAN の `generates` field から参照する。
