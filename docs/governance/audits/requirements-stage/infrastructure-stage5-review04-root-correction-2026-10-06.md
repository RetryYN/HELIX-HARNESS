# INFRA Stage 5 review04 Root補正検収記録

authority_effect: none

本文revision `076caa751a504296d61e3be9dcd5cc86811d56b4`、base `6008fb947c73466c11084474b0e938d76e912fb7`。対象親HELIXINFRASTRUCTURE-L2-011。Opus正式6007974898とFable6008007980のMinor 8を補正検収した。修正後exact HEADの独立再レビュー待ち。

- **opus-m1**：FR table/FR rowsとFV oracle/ownerを同期。047/048にも同じ条件表現を保ち、Worker契約ownerはunknownのまま。
- **opus-m2**：OS runtimeはruntime={id=api-db-sim-01,revision=infra-runtime-sim@sim-r17}へ統一。045 mutationはlink.runtime_revisionだけをinfra-runtime-sim@sim-r16へ変更。
- **opus-m3**：049/050/051は正常入力を共有し、050 path.depends_on_os、051 authority.refだけ変異。058/064は049.normal参照。062 path object、065 authority.ref、066 post_recovery_syncだけを変異。os_state=down-sim・ticket none・authority.source/revision・Worker contract・recovery.result・syncを保持。
- **opus-m4**：measurement source owner=unknownを明記し、L2-003:59の条件付きreturnをoracleとownerへ記載。CASE075 normal literalはCASE022と同じ旨を注記。
- **opus-m5-fable-m6**：CASE004は項目02、FR index、FV target、FV inputの4値が一致するため保持。064/067/076はFR indexとFV target/inputのbaseline参照/literalを一致。067/072 FV入力を明示literal化。073はCORE以外の接続を072.normal.connectionsから参照。077/078はFR baseline={...} objectとFV target/inputをbyte一致。 Rootが以前「004 baseline.design」と結び付けた指摘は誤対応として撤回済み。正式finding中の004はCASE-INFRA-011-S5-004であり、L10定義は項目02 Topology。PO項目02、FR index、FV target、FV inputの同一fixture literalを照合しており、追加変更なし。
- **opus-m6**：Root訂正草稿がFV019–021の未処置、045 revision記法、049/058/064 3形/source追跡漏れを撤回・訂正として記録。旧audit JSON/MD bytesは書換禁止のまま。
- **fable-m7**：path object欠落を保持し、recovery.result=sim-verifiedだけから独立recoveryを推定しない。restore/稼働版等のbaselineにないfieldは参照しない。
- **fable-m8**：FRとFVの説明はbaseline literalまたは実在する正常CASE参照を許容する。要件の意味・owner・版は変更しない。

旧監査は不変。旧resource条件返却、runtime記法、独立復旧の正常3形/source追跡に関する過大claimを本JSONで撤回・訂正した。Root自身のCASE004誤対応も撤回する。CASE004は項目02 Topologyで4点一致、項目04はCASE010–012。

6本文main prefix一致、CASE86件は一意で元集合維持、FR欠落参照0。現L3最低18項目の表・FR索引・FV対象・FV入力の4点literalは18/18一致。追加064/067/072/073/076/077/078のFR/FV literal・参照も一致。これはPO原要求内に合成fixture値が存在するという主張ではない。

固定source既読7spanと旧source2spanのfull/spanを再計算し、主要句を再読した。govcheck7622/57/58、validate147/fail0、stale0、residuals0、diff-check成功。旧runtime/test/CI未実行。L3承認・実装許可・merge admissionは生成しない。
