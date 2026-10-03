# SCF-B-0113 HIL-NFR-01〜20 implementation evidence scaffold

このbundleは、固定BASE `0d51a994f418450efc40438244f0552e428fc207` におけるHIL-NFR-01〜20の20 source IDから派生した31 product unit（HELIX-OS 20、HELIX-HARNESS 11）、Wave1〜50の598 scan row、77 semantic review edge、旧asset 47件を静的に照合する研究用Scaffoldである。NFR全体は60 unitだが、本束はNFR-01〜20の31 unitだけをscopeとし、NFR-21〜40を混入させない。旧実装source、旧failure／degradation、旧consumer、現行実装、現行受入を別partitionに保持し、直接証拠がないstatusはunknown／pendingと理由、counter-evidence、未解決欄を伴って保留する。

対象成果物は次のとおりである。

- `inventory.json`: 20 source ID／31 unit／77 edge／47 assetの分母、product別unit数、Wave入力、current static refs 279件、BASE祖先性、入力digest、anchor hash provenance、partition／禁止推論／未解決宣言を固定する。
- `evidence.jsonl`: crosswalk source snapshot、source IR anchor、Wave edge、edge別anchor、旧asset ledger／history／failure／consumer、旧implementation／degradation／failure／consumer、representative asset完全record、current refs、未実装保留をunit別に記録する。
- `build.py`: crosswalk、decomposition、ledger、判断史、read-after、classification、Wave1〜50、現行contextを固定BASEのGit object bytesから読む。旧code／test／runtime／CIは実行しない。
- `validate.py`: 31 unit／77 edge／47 assetの集合、unit別edge／asset multisetと重複、unit schema/top-level key集合、old-asset wrapper境界、inventory宣言、source／IR anchor、edge別anchor、旧asset ledger完全一致、実装／degradation／failure／consumer partition、representative asset完全record、current status、未実装断定禁止、BASE全宣言・祖先性とinput digestをfail-closedで検査する。
- `selfcheck.py`: source／asset blob、anchor、edge／assetの欠落・重複、ledger、代表asset、implementation／degradation／failure／consumer、old-asset wrapper key／真偽値、unit schema/top-level、current／unimplemented、inventory negative-case/base宣言、input digest、BASEを壊す24負例と期待error codeを照合する。

製品unitとphaseはcrosswalk／decompositionの候補を別フィールドへ保持する。候補、原文、実装、受入を同一視せず、formal product／phase authority、successor、implementation claimを生成しない。

旧semantic reviewの`evidence_refs`はasset source pathと異なる原文pathを取り得るため、asset relationと各anchorを独立して照合する。Wave1〜17は選択spanのraw bytes（最終改行を含む）、Wave18〜50は各行のCR/LFを除いてLFでjoinし最終改行を付けない方式を採用し、edgeごとに宣言digest、BASE実digest、blob、line、hash basisを保持する。

## 検証

    python3 scaffold/nfr-implementation-evidence-0113/build.py
    SCF-B-0113 bundle generated

    python3 scaffold/nfr-implementation-evidence-0113/validate.py
    SCF-B-0113 validate: PASS (31 units; counts derived from fixed BASE; static-only)

    python3 scaffold/nfr-implementation-evidence-0113/selfcheck.py
    SCF-B-0113 selfcheck: PASS (24 negative cases; expected error codes matched)

    python3 scaffold/tools/scfctl.py validate

旧code／test／runtime／CI、新世代runtime／CIは実行しない。#1813は進捗参照のみであり、formal crosswalk／authority／successor、Issue close、mergeを行わない。

## 保留

旧unit実装成立、旧failure receipt、unit-level degradation、consumer closure、現行implementation／operation／acceptance、未実装判定、product authority、successor assignmentは保留する。candidate asset、catalog status、phase transition、coverage.failure、validator合格から実装・縮退・failure・未実装・受入・完了を生成しない。
