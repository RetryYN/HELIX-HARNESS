# SCF-B-0110 HIL-FR-21〜40 implementation evidence scaffold

このbundleは、固定BASE `5562f04da0f3205f9aa58205ec0d478419fc4f2e` におけるHIL-FR-21〜40の20 source IDから派生した27 product unit、Wave1〜50の598 scan row、79 semantic review edge、旧asset 50件を静的に照合する研究用Scaffoldである。旧実装source、旧failure／degradation、旧consumer、現行実装、現行受入を別partitionに保持し、直接証拠がないstatusはunknown／pendingと理由、counter-evidence、未解決欄を伴って保留する。

対象成果物は次のとおりである。

- `inventory.json`: source／unit／edge／asset分母、product別unit数、Wave入力、current static refs、BASE祖先性、入力digest、anchor hash provenance、partition／禁止推論／未解決宣言を固定する。
- `evidence.jsonl`: crosswalk source snapshot、source IR anchor、Wave edge、edge別anchor resolution、旧asset ledger／history／failure／consumer、旧implementation／degradation／failure／consumer、representative asset完全record、current refs、未実装保留をunit別に記録する。
- `build.py`: crosswalk、decomposition、ledger、判断史、read-after、classification、Wave1〜50、現行contextを固定BASEのGit object bytesから読む。旧code／test／runtime／CIは実行しない。
- `validate.py`: 27 unit／79 edge／50 assetの集合、unit別edge／asset multisetと重複、unit schema/top-level key集合、old-asset wrapper境界、inventory宣言、source／IR anchor、edge別anchor、旧asset ledger完全一致、実装／degradation／failure／consumer partition、representative asset完全record、current status、未実装断定禁止、BASE全宣言・祖先性とinput digestをfail-closedで検査する。
- `selfcheck.py`: source／asset blob、anchor、edge／assetの欠落・重複、ledger、代表asset、implementation／degradation／failure／consumer、old-asset wrapper、unit schema/top-level、current／unimplemented、inventory negative-case/base宣言、input digest、BASEを壊す23負例と期待error codeを照合する。

旧semantic reviewの`evidence_refs`はasset source pathと異なる原文pathを取り得るため、asset relationと各anchorを独立して照合する。Wave1〜17は選択spanのraw bytes（最終改行を含む）、Wave18〜50は各行のCR/LFを除いてLFでjoinし最終改行を付けない方式を採用し、edgeごとに宣言digest、BASE実digest、blob、line、hash basisを保持する。

## 検証

    python3 scaffold/fr-implementation-evidence-0110/build.py
    SCF-B-0110 bundle generated

    python3 scaffold/fr-implementation-evidence-0110/validate.py
    SCF-B-0110 validate: PASS (27 units, 79 review edges, 50 old assets; static-only)

    python3 scaffold/fr-implementation-evidence-0110/selfcheck.py
    SCF-B-0110 selfcheck: PASS (23 negative cases; expected error codes matched)

    python3 scaffold/tools/scfctl.py validate

旧code／test／runtime／CI、新世代runtime／CIは実行しない。#1813は進捗参照のみであり、formal crosswalk／authority／successor、Issue close、mergeを行わない。

## 保留

旧unit実装成立、旧failure receipt、unit-level degradation、consumer closure、現行implementation／operation／acceptance、未実装判定、product authority、successor assignmentは保留する。candidate asset、catalog status、phase transition、coverage.failure、validator合格から実装・縮退・failure・未実装・受入・完了を生成しない。
