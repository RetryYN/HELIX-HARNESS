# LABO Stage 2b review02 repair04 時点記録

この監査はPR #2585の正式review comment 5987059108に対する作成側修正を記録する。固定親の意味、scope、owner、versionは変更していない。これは独立reviewの結果でもPO承認でもない。

- 対象親: HELIXLABO-L2-002〜010、Stage 2b、`version_target: 1.0`
- 正式comment: https://github.com/RetryYN/HELIX-HARNESS/pull/2585#issuecomment-5987059108
- comment本文UTF-8 SHA-256: `a595b3f0ea9cd1fc58c093c21b863dd49b43a2f88b0c309708343676b497cde0`
- 修正後canonical commit: `3d0823850147a849546cd43b82c17199efa07c49`
- 修正前canonical commit: `367440571fc7935b28d56c9ffaf7241789b4f130`
- 直前の不変時点記録: `docs/governance/audits/requirement-registration/labo-stage2b-002-010-review01-repair03-candidate-state-correction-2026-10-05.json` (`367440571fc7935b28d56c9ffaf7241789b4f130`, SHA-256 `19c1d84a175257c44917dcc7baa0b6f80ec0bceb9d4c694cc69a365cabf56497`)
- 本記録JSON SHA-256: `05d2b6978a81ef35b3943284a612f91ffa58886d759cd051bcaf3f21c1f5b943`

## 指摘ごとの処置

| ID | 状態 | 内容 |
|---|---|---|
| a1 | 対応を本文へ反映 | fixed L11 §24#3 line 113 is included in source pins and L3 old-source anchor |
| a2 | 対応を本文へ反映 | NV rows 002–005 carry full NFR IDs and match NG grade case sets |
| a3 | 対応を本文へ反映 | NV timing/volume is explicitly a new unapproved, unmeasured candidate and links to NG candidate section |
| a4 | 対応を本文へ反映 | old UIL-R-02 is pinned only as the 002 origin; 003/004 search boundaries explicitly exclude it |
| a5 | 対応を本文へ反映 | CASE-10 distinguishes mandatory contract identity/revision/scope from unknown/not_observed value state and event absence |
| a6 | 対応を本文へ反映 | CASE-14 is a standalone proximity-only negative with no valid relation baseline borrowed from CASE-13 |
| a7 | 対応を本文へ反映 | FV parent/AC/case matrix corrected for 002 CASE12/13, 003 CASE10 and 004 CASE10/11 |
| b1 | 対応を本文へ反映 | CASE-006-14 uses oracle or declared comparison condition |
| b2 | 対応を本文へ反映 | LABO-005-AC-03 removes unsupported ticket/registration/routing/target-authority/placement scope |
| b3 | 対応を本文へ反映 | CASE-005-12 and L3 trace preserve unfinished-duty relation |
| b4 | 対応を本文へ反映 | FV full trace and NFR grade/NFR verification case sets reconciled; 008/009 mismatches also corrected |
| b5 | 対応を本文へ反映 | CASE-007-19 separates given unfinished-duty evidence/no-evidence fixtures; actual operation status is not an input or oracle |
| c1 | 対応を本文へ反映 | old Bench source range includes R-08 lines 143–147 through line 147 |
| c2 | 対応を本文へ反映 | LABO-008-AC-03 and CASE-16/17 add L2-007/L2-017 dependency ID/revision/scope missing/stale fixtures |
| c3 | 対応を本文へ反映 | 008 return destination says exactly 現行責務のowner |
| c4 | 対応を本文へ反映 | FV trace mappings for 008/010 and NFR-009 case selection corrected |
| c5 | 対応を本文へ反映 | all canonical links now point to this repair04 immutable record |

## canonical bytes とStage1 prefix

| 文書 | bytes | 行数 | SHA-256 | 承認済Stage1 prefix bytes / SHA-256 |
|---|---:|---:|---|---|
| `docs/helix-labo/L3-requirements/functional-requirements.md` | 62912 | 306 | `96205e3b333f2f143c2828e35f58974fd930aac9dbca51d253b5c27372b7fa16` | 22967 / `6a2909c6163350025eadaa8fe028b9ab50376ebb07b6f2bd7666c17540261fb8` |
| `docs/helix-labo/L3-requirements/business-requirements.md` | 2465 | 14 | `a67c94c2f457b3d0b0421df7e4c49bd15455444e207a0435a35bb642d421b6ef` | 522 / `af7c875eb2e43b99f85c092baf7cbb0379ec6b8c5c08c9e01f39f8b72f1192d0` |
| `docs/helix-labo/L3-requirements/nfr-grade.md` | 20767 | 71 | `9d9ea267c863b298a90171dd196cefa99d1587e14bf859d4bf6a54771ca6f504` | 3200 / `95faea76e433f4144bf8b255b6b83a602161084b625a0bc095bda39d4bd416e8` |
| `docs/helix-labo/L10-verification/functional-verification.md` | 70877 | 333 | `8e7da2e15e77a7f7b95c1142fae42bf2d1f2ef4b2028087c65e54f3eb810787e` | 15814 / `79a5e56ca68681136355c1f2d62bff8e9b8bb0b119565edeb4c75a71fad6e8d8` |
| `docs/helix-labo/L10-verification/business-verification.md` | 2194 | 14 | `d89b00da2c10cb4b1f7f4fd0d97e4bca6889210c623c5ce3f6181de61cc52501` | 529 / `603612c09603d6be3c5b1d45bcbafbe7281457454474acef38d4ddb6e7e13d37` |
| `docs/helix-labo/L10-verification/nfr-verification.md` | 15779 | 52 | `1da09494237925f9b3e237a8a6209a051d0dff2bfff5186830b2d4f7e1d60fa0` | 3298 / `97545f30c540e63141e8cb53e27969b9f3d094d12580be03c99836086b7bc4eb` |

6文書のStage1 prefixは、承認済みcommit `fa642cddc3c4446e3635f1c6badd90209862cfac` にある対応prefix bytesと完全一致する。修正本文はこのprefixの後へ限定される。

## 監査範囲と静的確認

- current Stage2b suffixの563行を物理行・literal・LF込みraw SHA-256でpinし、今回変更された66行も個別にpinした。
- 固定sourceおよびlegacy source pin 93件を保持。過去のimmutable record 14件はrepair03からbyte-identicalで引き継ぎ、availabilityは元記録どおりとした。
- L10のfunctional case定義は143件、全ID一意、未解決case参照0件。新規追加はCASE-008-16/17。
- 13 NFR IDについて `nfr-grade.md` と `nfr-verification.md` のcase集合が一致。
- `git diff --check` はPASS。

この記録は作成側の修正証跡であり、修正後HEADに対するClaude/Opus独立review、要求承認、実行・運用許可を示さない。pushは行っていない。
