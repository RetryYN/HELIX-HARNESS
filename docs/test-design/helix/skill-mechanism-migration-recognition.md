---
title: "HELIX L12 運用認識 — 新Skill機構への責務移行"
canonical_vmodel: L1-L12
canonical_layer: L12
canonical_pair: L1
status: confirmed
created: 2026-09-07
updated: 2026-09-07
owner: QA / Codex TL
plan: PLAN-L3-1594-skill-mechanism-migration
parent_design: docs/design/helix/L1-requirements/skill-mechanism-migration-requests.md
pair_artifact: docs/design/helix/L1-requirements/skill-mechanism-migration-requests.md
---

# 新Skill機構への責務移行の運用認識

## S-OR-001 ↔ S-BR-001

実運用episodeで、task／role／工程に必要なSkillだけが取得され、旧資産の必要能力が失われず、
重複注入と無関係なcontext bytesが旧経路との同条件比較で増えていないことを確認する。

要求sourceのcanonical化だけでは本認識を合格にしない。Requirement IR admission、runtime有効化、
実consumer episode、効果計測、独立review、rollback可能性を同一source revisionへ束縛する。
観測不能または少標本はunknownとし、Skill削減数や文書移動を利用者価値の成立証拠にしない。
