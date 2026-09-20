---
title: "旧要求・旧asset直接semantic review wave 6 review response"
status: candidate
authority_effect: none
source_revision: legacy-generation-2026-09-14
pr_class: research_premise
---

# wave 6 review response

独立review受領後にfindingと対応を記録する。

## round 1 — `RH-1918-GUI-01`

reviewed HEAD: `34c528884c82bd4d9c6bab36d50809eff395f9fe`

| finding | 対応 |
|---|---|
| `MAJOR-1918-01-01` | FR-64のdesignとimplementationへ同じ反証文を複写していた箇所を分離した。designはnetwork default denyと許可path/host外fail-closeを部分証拠として認め、未確認事項を推論API endpoint限定、versioned sandbox template、CLI設定merge/append、quarantine receiptへ限定した。implementationはnetwork namespace分離とhost+path allowlist未実装を区別した。`deny_all`という引用にない語を削除した。atom被覆とsemantic countは変更しない。 |
