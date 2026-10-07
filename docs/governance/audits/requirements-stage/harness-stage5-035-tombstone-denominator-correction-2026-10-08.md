# HARNESS Stage5 035 S5-033 tombstone分母補正

- 基準main: `37a8283be429c57f3706153ad522e7ad288fecc3`
- branch: `codex/harness-stage5-035-tombstone-correction`
- 対象: `HARNESS-L2-035` の `NFR-C-HARNESS-035-01` planned CASE集合表示のみ
- authority effect: none。PO判断、実装/実行許可、NFR実測、L10結果を生成しない。
- 既存時点記録は変更せず、この補正記録を追加する。

## 根拠と補正

read-only意味監査で、NFR候補行とplanned集合表が `CASE-HARNESS-L10-035-S5-007–046` を計数範囲に含める一方、S5-033をID保全用tombstoneとしてfixture分母から除外する本文が見つかった。S5-033は非fixture行であり、運用負債欠測はS5-041だけを測る。固定L2-035:931–941および対L11:678–686は複雑さ・外部公開面・運用負債の三観点を別々に測り、欠測を相殺せずscope判定未完にする。旧根拠HIL-NFR-07（archive `infinity-loop-platform-requirements.md:187`）もこの三観点を列挙する。

NFR-gradeおよびNFR-verificationのplanned範囲を、`S5-007–032` と `S5-034–046` に分割し、S5-033除外を各範囲行に明記した。functional-verificationのS5-033 tombstoneとS5-041の既存CASE定義は変更していない。閾値・親意味・owner・gate・ID集合の変更はない。

## 対象revisionのSHA-256

| 文書 | base bytes | 修正後bytes | 状態 |
|---|---|---|---|
| BR | `9fb531a55c61c4836ae614cadbd850f3967119cb1f0f2eb36dad1e39ebab75e2` | `9fb531a55c61c4836ae614cadbd850f3967119cb1f0f2eb36dad1e39ebab75e2` | 不変 |
| FR | `2180967f0075f467c99a553d34f688a1fdf434703803b1a34e7e147d6a7d2df5` | `2180967f0075f467c99a553d34f688a1fdf434703803b1a34e7e147d6a7d2df5` | 不変 |
| NFR | `ee84bc87ff324eea929d266934c0debb856018aca25c0044f68b11c141c3263d` | `b83709b35a6f3ea93badf9e6586c01bef85ceabdbf19ec6c4b68208c3d47489a` | 変更 |
| BV | `864b0034aa84c4e9b29ec2ebb7bf2151a97dfdca0028c85ba2e0cee655d965ad` | `864b0034aa84c4e9b29ec2ebb7bf2151a97dfdca0028c85ba2e0cee655d965ad` | 不変 |
| FV | `d1c55ca4e6b432ccdc941d8d9813c88e5f33476ef2c2d55aa0bfafe549b6726f` | `d1c55ca4e6b432ccdc941d8d9813c88e5f33476ef2c2d55aa0bfafe549b6726f` | 不変 |
| NFRV | `17ee1dc8ab6786416680e496ba8fb83a714756dd8f853830afe036ddcc9b36e9` | `8a731bb2a1e27006cdead8430075889cea75ed7bd830c491727eca049e6ae912` | 変更 |

親別の固定L2/L11 span、旧source literal/full/span SHA、前後本文SHAは隣接JSONに固定した。従来のsource auditとRoot/review correction recordは不変。

## 静的検証と限界

- NFR grade/NFR verificationの035 planned範囲がS5-033を除き、S5-041を含むことを文字列検査した。
- FVのS5-033とS5-041、BR/FR/BV/FVのbytesがbaseから不変であることを確認した。
- `git diff --check`は監査作成後に実行し、結果をJSONへ反映する。
- CASE実行、旧CLI/runtime/test/CI、実測、L10実行、独立reviewは行っていない。
