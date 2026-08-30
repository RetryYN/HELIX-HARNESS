---
title: "CI Responsibility Registry機能設計"
layer: L6
kind: function-design
status: confirmed
created: 2026-08-30
updated: 2026-08-30
owner: Codex / TL
plan: PLAN-L7-705-ci-responsibility-registry
parent_design: docs/design/helix/L3-requirements/ci-system-synthesis-requirements.md
pair_artifact: docs/test-design/helix/L8-ci-responsibility-registry-unit-test-design.md
---

# CI Responsibility Registry機能設計

## §1 責務境界

本機能はCIS-R-04〜06を所有し、verification capabilityとsemantic impact graphをversioned registryへ投影する。
実行順序、runner選択、required obligation省略は所有しない。`src/runtime/impact-ci.ts`、Lite selector、Module／Bundle
CIはadapterであり、pathやtest filenameを新しい意味正本へ昇格させない。

## §2 typed contract

- semantic nodeはIssue、PLAN、requirement、design、contract、Module、Bundle、V-pair、runtime、DB、distribution、
  security、artifactを別kindで保持する。
- capabilityはstable ID、responsibility ID、単一owner、typed oracle exact set、environment、cost、risk、
  obligation class、parallelism、artifact I/O、freshness、applicability、dependency、retirement traceを必須とする。
- obligation classは`local`、`boundary`、`global_invariant`、`release_only`へ分離する。
- graph edgeはrepo authorityから明示された`refines／implements／verifies／contains／consumes／depends_on`だけを受理する。
  名称類似、path近接、LLM推測でedgeを追加しない。

## §3 admissionと導出

registry admissionはunknown identity、orphan、owner欠落、同一responsibilityの複数owner、dependency cycle、oracle欠落、
不完全なretirementを個別findingでfail-closeする。導出はIssue／PLANとchanged artifactのtyped nodeをseedとして明示edgeの
有向closureを計算し、active capabilityのapplicabilityとのintersectionを4 classへexact partitionする。逆向き探索で
unrelated consumer／releaseを混入させない。未知artifactは
空集合へ落とさずfail-closeする。registry digestは同一bytes意味集合へ束縛し、legacy greenでcurrent欠落を相殺しない。

## §4 retirement

retired capabilityにはreplacement、rollback、consumer exact set、履歴receiptを必須とし、consumer／dependency edgeを履歴として保持する。
replacementが無い削除やownerの後勝ちは禁止する。
