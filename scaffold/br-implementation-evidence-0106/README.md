# SCF-B-0106 HIL-BR-21〜33 implementation evidence scaffold

このbundleは、固定BASE 5562f04da0f3205f9aa58205ec0d478419fc4f2e におけるHIL-BR-21〜33の13 source IDから派生した19 unit、Wave1〜50の全scan、対象55 semantic review edge、旧asset 38件を静的に照合する研究用Scaffoldである。旧実装source、旧failure／degradation、旧consumer、現行実装、現行受入を別フィールドで保持し、直接証拠がないstatusは理由とcounter-evidenceを添えてunknown／pendingにする。

対象は次の成果物である。

- inventory.json: 19 unit、55 edge、38 old asset、57 current static refs、入力path digest、BASE祖先性、証拠partition、anchor digest provenance。
- evidence.jsonl: source snapshot、候補asset、旧asset ledger／decision／read-after、旧実装・failure・degradation・consumer、現行候補参照、未解決欄をunit別に保持する。
- build.py: crosswalk、ledger、判断史、Wave1〜50を固定BASEのGit object bytesから読み、bundleを再生成する。旧code／test／runtime／CIは読取・実行しない。
- validate.py: 19 unit／55 edge／38 assetの集合、source snapshot、review edge、旧asset ledger完全一致、独立したevidence refのpath／line／blob、current span、input digest、BASE祖先性、consumer／counter-evidence／unresolvedをfail-closedで検査する。
- selfcheck.py: blob、current span、edge set、current／old status、ledger／consumer、counter-evidence、unresolved、input digest、anchor policy／resolutionを壊す13負例と期待error codeを照合する。

旧semantic reviewのevidence_refsはassetのsource_pathと異なる原文側pathを取り得るため、asset relationとanchorを別に検査する。anchor digestはWave1〜17では選択spanのraw bytes（最終改行を含む）、Wave18〜50では各行のCR/LFを除いてLFでjoinし最終改行を付けない方式で、legacy_anchor_resolutionに宣言digest、BASE実digest、blob、line、採用hash basisを記録する。

## 検証

    python3 scaffold/br-implementation-evidence-0106/validate.py
    SCF-B-0106 validate: PASS (19 units, 55 review edges, 38 old assets; static-only)

    python3 scaffold/br-implementation-evidence-0106/selfcheck.py
    SCF-B-0106 selfcheck: PASS (13 negative cases; expected error codes matched)

    python3 scaffold/tools/scfctl.py validate

旧code／test／runtime／CI、新世代runtime／CIは実行しない。#1813は進捗参照のみであり、formal crosswalk／authority／successor、Issue close、mergeを行わない。

## 保留

旧unit実装成立、旧failure receipt、unit-level degradation、consumer closure、現行implementation／operation／acceptance、未実装判定、product authority、successor assignmentは保留する。候補asset、catalog status、phase transition、validator合格から実装・縮退・未実装・受入・完了を生成しない。
