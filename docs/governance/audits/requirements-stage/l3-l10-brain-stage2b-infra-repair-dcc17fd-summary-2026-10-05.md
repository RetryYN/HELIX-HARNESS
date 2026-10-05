# BRAIN INFRA Stage 2b 修正追補記録

- 対象親: `HELIXBRAIN-L2-INFRA-001..017`、version 1.0、G0 Stage 2b。対象範囲を広げず、他Stage・未採択親をauthorityにしていない。
- 本文修正commit: `dcc17fd111a649d00fa2aec2ea6347fc69ad3d3a`。先行Stage 1の6文書prefixはbase `28b3d3645e6298c159758700c2edd3d396c336f5` と全てbyte一致。
- 主要修正: INFRA-003を20 atomic fieldと18 L11 group（trade-off/evidence別）へ訂正。INFRA-008を固定8候補×6軸=48 cellへ訂正。INFRA-011を7 group/8 atomicとして、具体価格がある場合だけprovider/time/source/scopeを要求。INFRA-017のmaturity state、BRAIN version、project usage versionを独立軸にし、failureを複数条件評価と共に保持。親ごとのC05未見正常fixtureを具体化し、002/008/011のケースを別途明確化した。
- NFR候補と測定表も同じfield数・分母・適用境界へ揃えた。001〜017全親のL1親、固定依存、戻し先をf6dad2aの固定L2/L11と照合した。
- 静的確認: fixed source pin 119件のfull SHA一致、114 bounded raw-span/object一致、現行本文847 line pin一致（mismatch 0）。構造数は17 FR、34 AC、85 CASE、NFR候補/測定17行ずつ、business reference 17行ずつ、独立business AC 0。
- 静的ツール: `scfctl validate` 147 bindings / 0 fail、`stale=0`、`residuals=0`、`govcheck` atoms=7622 / requirements=57 / files=58、`git diff --check` pass。テスト、旧runtime/CI/Bun、L10実行・測定は行っていない。
- 新追補監査: `l3-l10-brain-stage2b-infra-repair-dcc17fd-static-validation-2026-10-05.json`。SHA-256: `d9464e3fb6b23976d5b4a0f9cde76a45c6f84f0f40ca74b344d8f8ae1b8de6e4`.
- 旧監査 `l3-l10-brain-stage2b-infra-static-validation-2026-10-05-691f7a6179.json` は変更せず保存。旧SHA-256 `ebd9c73cac5d1ea1712321052a81d49df59d87067651d1a83d7993c533c88a4a`。

未成立: root検収と独立reviewは保留。L3のPO承認、実装/運用許可、L10の実行・実測を示さない。carry-forwardのC13/M12/minor/unreviewed所見は未解消のまま保持し、この修正でclosureを推定しない。push/PRなし。
