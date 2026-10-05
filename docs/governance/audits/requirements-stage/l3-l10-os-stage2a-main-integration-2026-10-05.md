# HELIX-OS Stage 2a main統合記録

統合merge commit `c6cb521c4ba9320b852df8931d17a73f9fc7187f`へ `origin/main` `02f40864ecfbe64d97f45fa67daafc9d9928e264` を通常mergeした。Stage2aの親・本文、意味、owner、versionは変更していない。本文のStage2b-014承認済みprefixも保持した。

- Stage2a対象: HELIXOS-L2-015, HELIXOS-L2-016, HELIXOS-L2-017, HELIXOS-L2-018, HELIXOS-L2-019, HELIXOS-L2-020, HELIXOS-L2-023, HELIXOS-L2-027
- version target: `1.0`候補
- Stage2a候補は未承認のまま。本統合は承認/admissionを生成しない。
- Stage2b `HELIXOS-L2-014`のみ、mainにadmitされたdecision record `docs/governance/decisions/helix-os-stage2b-l3-l10-po-decision-2026-10-05.md`（content revision `6276adb92b3056b1e53055cd56f214ebc5d87158`）の対象。Stage2aへ承認を継承しない。
- 旧main publication auditとrepair02 audit、repair02が保全した時点記録2件は変更していない。

## 6文書の統合後bytes

| 文書 | bytes | 行 | full SHA-256 | approved 014 prefix |
|---|---:|---:|---|---|
| `docs/helix-os/L3-requirements/functional-requirements.md` | 37121 | 158 | `2a30d207049d7152dae8375050d4e3523cb11ae72439ac1b9cfc93a76a479131` | 12600 bytes / `cb82838b9e18ac8df5e02b48b65f1c318b90c08aec3cecd67a5d97193e827ab5` |
| `docs/helix-os/L3-requirements/business-requirements.md` | 8144 | 49 | `13c43f5f3dcd1ff8aaf348d404fb962d0894f6e97b2abd41cda671ada1995f3b` | 855 bytes / `235787ab8c96e15ac91eec955ed5650a49a0993636e8523d006dc587f6d9a863` |
| `docs/helix-os/L3-requirements/nfr-grade.md` | 10095 | 57 | `28a8b3041a059066786ecf0a4ae7d582802094c6462563e0c3d64b8dd0a9db72` | 2732 bytes / `0c87bdde3491124ed8e6e8888115802f91ca1897e0760b44273d395967180326` |
| `docs/helix-os/L10-verification/functional-verification.md` | 39901 | 285 | `b9c9a503b568b1878672fcfd73eb35fee2234cab9f3b69305c7c79aeb8084cf5` | 19873 bytes / `6dcafdd7f88ad6acde046702d4c0b681c9d94973f2967f24625bf5264cb24476` |
| `docs/helix-os/L10-verification/business-verification.md` | 5385 | 34 | `f9189f593cd3dc078d405ad58e5e884240d7398c5e9f59faafa6bdff6119f6fb` | 891 bytes / `ffed2d5b4b688dd22aa8d3aae0b3b9faadd01a6074af530c8630da602f513629` |
| `docs/helix-os/L10-verification/nfr-verification.md` | 8192 | 53 | `4bde0b30cfea98e980474945be106eccd1ce4b1f6f997f51deec3cc853106b27` | 2608 bytes / `2c0060eaa9efc027d34011f1948d18cdec66665e17b8a5b2e9b9b29d9fb29748` |

## 静的確認

- 6 canonical文書は統合前のbytesと6/6一致。承認済み014 prefixも対象revision `6276adb92b3056b1e53055cd56f214ebc5d87158` と6/6完全一致。
- 18 current changed-line pinsのliteral/LF hash、48 inherited source pinsのfull-file/LF span、過去の時点記録2件を再計算しすべて一致。
- Stage2aのfunctional AC 28件、CASE 84件、未解決CASE参照0件。
- `origin/main`はmerge commitの祖先。conflictなし。`git diff --check` PASS。

監査JSON SHA-256: `73be71df8fd86b0db1292b69ea633706b438454735ed2ecffb4875e66e9eb54a`。旧runtime/test/CI/Bunは実行していない。push、PR作成、独立review依頼、release操作は行っていない。
