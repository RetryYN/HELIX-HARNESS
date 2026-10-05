# SECURITY Stage 1 review04 訂正記録

- 状態: ローカル訂正記録。root意味検収と修正後exact-HEAD独立review待ち。
- review comment: `5986446872`、本文SHA-256 `1fec910105adb9fc3434a2d700805c30352c711814c3a22756c503949f804d31`。
- 対象HEAD: `3f8e6f220eaeeab42618d97f005b5dab17bec66f`（親 `e345452486492b11d1396695b3ec5c40c537f050`）。本文変更はL3 functional requirementsとL10 functional verificationの2文書。
- 前回訂正監査 `docs/governance/audits/requirements-stage/l3-l10-security-stage1-claude-review03-correction-2026-10-05-4f1f93fb5.json` はSHA-256 `1df049d5d471125b6800b6bcb35c4e8c4c4dd1a158f966a7db6019d0952bc0f0` のまま保持した。

## 所見と対応

- **M5 / FV:49:** 固定L11:26の実原文へoracleを訂正した。命令様dataがtool args/system instruction/権限付きoperationへ直結せずdataとして保持されること、検出器不存在だけは不合格理由にならないこと、直結は不合格であることを維持した。
- **m1 / FR:322・FV:226:** 適用不能と観測不能のそれぞれの結果保持項目へ対象revisionを追加した。
- **m2 / FR:38:** R2289-02で訂正された三つのregistration pair（L2-001、L2-002、L2-003）をIDとsemantic digest付きで列挙した。old register 633bf12 rows 63/64/434とcurrent register 72fa2f0 rows 728/729/912の原bytesから、各pairのdigest不変を照合した。

## 照合と境界

前回訂正監査の24固定source pinsを、記録済みrevision/path/実行行で再計算し、24件すべてfull-file SHA、raw LF-inclusive span SHA、span byte数が一致した。registerの旧3行と現3行を加え、監査JSONに全6行pinを収録した。固定L11:26は633bf12とf6dad2aで本文が一致し、full SHA-256 `e4d92364e3a8c88332ee48358ac6b08c2d8cdd51cd5e00b111fff4c3f43b68d0`、span SHA-256 `e3be2a9d718395db4d018280b458e3c85e508bb68c59ae9828f1e486c99c3890`。

L2-033 candidate digestはこの訂正で再計算していない。review03監査の値は歴史値として保持し、新たな再現済み主張をしない。`verification_json_sha256`の対象artifactも特定できていないため未検証の歴史記録のままとする。これらは追加確認候補であり、訂正の完了・独立review閉鎖を意味しない。

6正本の現在SHAと6 register row pins、24既存固定source pinは同じJSONに記録した。
