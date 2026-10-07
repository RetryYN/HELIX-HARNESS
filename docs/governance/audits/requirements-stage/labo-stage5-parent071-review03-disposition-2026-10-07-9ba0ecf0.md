# HELIX-LABO-L2-071 review03 統合後時点監査

- 本文revision/body commit: `9ba0ecf0b3b91f7130c6e29b5ed47c304c7ab7bc`、親 `c46921306a92bf500bf68021451b6b02fb1448d9`、base `0acbed34bfda48e32092feb63db61d2eff6d5ec4`。対象PR #2645。worktree status: `## l3-labo-stage5-parent071...origin/l3-labo-stage5-parent071 [ahead 1]`。
- 本記録は/tmpの静的時点監査。独立review、fixture実行、資格/permission/assignment実状態、L3承認を示さない。過去監査は変更していない。

## 候補処置とRoot統合
- v1候補（JSON SHA `4b5b930b…c8ec8`）はRoot返却・不採用。M1の返却先、正常入力時の誤出力訂正、SECURITY/OS既存責務との区別を明確にできていなかった。
- v2候補 `/tmp/labo071-review03-M1-M3-exact-candidate-2026-10-07-v2.json` SHA `d5eec2110a3775628fc4055edf5e3f51425fc5695dec1d961bafc4da5aee9bc1` はRootが全差分とfixed sourceを再読して採用。Root統合では既存prefixの区切りLFを保持してsuffixを置換。base revisionからの追加領域は `0x0a + v2 after_suffix` で、6文書すべて実bytesと一致する。Rootが新規LFを付加したとは記録しない。
- Rootがgovcheckとdiff検査PASSを報告。本監査では再実行していない。

## 六本文actual pins
| 文書 | full bytes / SHA-256 | base-prefix bytes | suffix bytes / raw-LF SHA-256 |
|---|---:|---:|---:|
| `docs/helix-labo/L3-requirements/business-requirements.md` | 23554 / `2dd7a80e980b398edd0c7c9aadfe3f7ddcf940e01d8a98019e2b87b29df0a68d` | 17356 | 6198 / `f88cbd8bd1e5cf72569f158025c85dcf04d4af6c516d9f4a476fb7050eb22589` |
| `docs/helix-labo/L3-requirements/functional-requirements.md` | 322914 / `b257cd28667e337282444e9454bed5f77be149ed970521f751b7addcf10b227d` | 314755 | 8159 / `1c66432bf993e9e80c0ddf74cf109b752fc5c5329bb607bef12eeb03d07903e9` |
| `docs/helix-labo/L3-requirements/nfr-grade.md` | 77681 / `a74e197f67f7ab76743ee5dbab6495e1d6f871333b7294a33f3ad8103275b578` | 70949 | 6732 / `fe29e9ae3cb0f070990d2afd2bb66d696cee7b5d0ea80ce289c4fa3075a43a62` |
| `docs/helix-labo/L10-verification/business-verification.md` | 21287 / `9dde43b0f457050a8eb0a7601651413d79642c2e844fef469108c0a6595157d4` | 15331 | 5956 / `305754a89def7ef7570f70e08b6aca08b13de53bbc426a99a257bd1a145e77d7` |
| `docs/helix-labo/L10-verification/functional-verification.md` | 517945 / `b1c3a6aa50ff3dabd766eb5b3f6bad5b950afe5603be9b67eab1a1e2a8ba0130` | 487997 | 29948 / `c6706385f04bb0722838431b202fd0b4997268e455198bb26df91eb7cab26870` |
| `docs/helix-labo/L10-verification/nfr-verification.md` | 67755 / `2c369556d4a5c4188fd8e4ddf857e0061a059c108b879883a3d737556a792960` | 60801 | 6954 / `62ec5644b04f4e6e7b4846d43f39f42ae77da5315297c7713b718248a3f7005c` |

全6文書でbase prefix byte exact、full bytes/SHAはRoot checkpointと一致。suffix raw bytesはLFを後付けせずhash計算。

## 固定source・PO・履歴
- 固定採択source revision `ea6f756f96a7370de78e412d737c7a7ed472114a`。L2物理行576–584、3254 bytes、SHA `3036e4c300ee6f78e74b819657d456c0bad08b8ccb483882cfc3b59fa5bbbe1f`。L11物理行309–316、1769 bytes、SHA `029c6bcea5a206a15c8bbe9706ff25917fbf9a6496b3891288fc2660634f7bc0`。formal review03/04のL11:327–328は原文の引用誤りとして保持し、source citationには用いない。
- PO row50は記録revision `3795bf0dcb731231a0b5ca1faa3cb67bdfeda22a`から再計算。source revision ea6f、PO記録revision 3795、decision basis 81d1は区別。
- 旧24 CASEのraw literalはlegacy source `a4a365dcdfe824ebb28d040c8bc3bc924556efad`のsource inventoryとして別保持。旧current 35定義IDをすべて維持し、9件を追加して44 unique定義。定義行は全て6列。実行を意味しない。
- formal review03 comment6025651335（6124 bytes、raw SHA `d011b286…3033166`）とreview04 comment6025698442（1904 bytes、raw SHA `da13494b…fdfb92f`）の全文、R1–R10、reviewer omission経緯はJSONに保存。R1/R2解消、R3–R7維持、R8はM1へ昇格、R9/R10は非blocking残余として保持し、追加closureなし。
- M1の固定根拠返却とindividual identity unknown、M2の正常入力/候補誤出力の区別、M3の5方向とSECURITY/OS責務、03c/03dのP0/A0/H0、expired/revoked代替単一変異はv2記述とactual bodyで一致。

## 検証限界
- Git commit上の六全文、prefix/suffix、source line spans、PO row、case ID/列数を静的検算した。Root報告のgov/diff PASSと独立review・fixture実行は区別する。
- JSON: `docs/governance/audits/requirements-stage/labo-stage5-parent071-review03-disposition-2026-10-07-9ba0ecf0.json`
