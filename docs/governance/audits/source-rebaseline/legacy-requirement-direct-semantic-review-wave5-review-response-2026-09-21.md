---
title: "旧要求・旧asset直接semantic review wave 5 review response"
status: candidate
authority_effect: none
source_revision: legacy-generation-2026-09-14
pr_class: research_premise
---

# wave 5 review response

独立review受領後にfindingと対応を記録する。

## round 1 — `RH-1917-GUI-01`

reviewed HEAD: `1561cf80ba8b988c4bf836e79c58a20f175d2240`

| finding | 対応 |
|---|---|
| `MINOR-1917-01-01` | Web/Web-OS正規unit 0件をcrosswalkと分解台帳の双方から独立に集計する検査へ変更し、方法書の根拠も両台帳へ修正した。 |
| `MINOR-1917-01-02` | BR-05の包含関係にある2入力spanを、両raw fragmentを保持する1 atomへ統合した。atom総数は16から15、BR-05は4から3へ修正した。別atom間のsource fragment包含重複を拒否する検査も追加した。 |

`Design` anchorはより具体的な`Design Template`へ変更する。修正後もsemantic countは`confirmed` 3、`rejected` 4、`unresolved` 2である。
