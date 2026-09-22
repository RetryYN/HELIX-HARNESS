# SCF-B-0104 HIL-BR-06〜20 implementation evidence scaffold

このbundleは、固定BASE 36784d25aa4cc53d89c28c2ff81b4009db234605 におけるHIL-BR-06〜20の15 source IDから派生した23 unit、Wave1〜50の598 scan row、対象68 semantic review edge、旧asset 47件を静的に照合する研究用Scaffoldである。旧実装source、旧failure／degradation、旧consumer、現行実装、現行受入を別フィールドで保持し、直接証拠がないstatusは理由とcounter-evidenceを添えてunknown／pendingにする。

対象は次の成果物である。

- inventory.json: 23 unit、68 edge、47 old asset、72 current static refs、入力path digest、BASE祖先性、証拠partition、anchor digest provenance。
- evidence.jsonl: source snapshot、候補asset、旧asset ledger／decision／read-after、旧実装・failure・degradation・consumer、現行候補参照、未解決欄をunit別に保持する。
- build.py: crosswalk、ledger、判断史、Wave1〜50を固定BASEのGit object bytesから読み、bundleを再生成する。旧code／test／runtime／CIは読取・実行しない。
- validate.py: 23 unit／68 edge／47 assetの集合、source snapshot、review edge、旧asset ledger完全一致、独立したevidence refのpath／line／blob、current span、input digest、BASE祖先性、consumer／counter-evidence／unresolvedをfail-closedで検査する。
- selfcheck.py: blob、current span、edge set、current／old status、ledger／consumer、counter-evidence、unresolved、input digest、anchor policy／resolutionを壊す13負例と期待error codeを照合する。

旧semantic reviewのevidence_refsはassetのsource_pathと異なる原文側pathを取り得るため、asset relationとanchorを別に検査する。anchor digestはWave1〜17では選択spanのraw bytes（最終改行を含む）、Wave18〜50では各行のCR/LFを除いてLFでjoinし最終改行を付けない方式で、legacy_anchor_resolutionに宣言digest、BASE実digest、blob、line、採用hash basisを記録する。

## 検証

    python3 scaffold/br-implementation-evidence-0104/validate.py
    SCF-B-0104 validate: PASS (23 units, 68 review edges, 47 old assets; static-only)

    python3 scaffold/br-implementation-evidence-0104/selfcheck.py
    SCF-B-0104 selfcheck: PASS (13 negative cases; expected error codes matched)

    python3 scaffold/tools/scfctl.py validate

旧code／test／runtime／CI、新世代runtime／CIは実行しない。#1813は進捗参照のみであり、formal crosswalk／authority／successor、Issue close、mergeを行わない。

## 保留

旧unit実装成立、旧failure receipt、unit-level degradation、consumer closure、現行implementation／operation／acceptance、未実装判定、product authority、successor assignmentは保留する。候補asset、catalog status、phase transition、validator合格から実装・縮退・未実装・受入・完了を生成しない。
