# HELIX-LABO Stage 2b / L2-006〜010 候補source・pair記録

この時点記録は、固定PO採択済みのHELIXLABO-L2-006/007/008/009/010について、L3 functional ACとL10 fixture候補を追補した本文revisionを固定する。本文commitは `233353bdd4d8d6ff850c0b63cf3a8acf17f2731d`。対象は5親だけで、全て1.0 target candidateである。POのL2/L11採択は要件内容authorityを固定しているが、このL3本文の承認、独立review、root最終検収、実装・実行・release許可は成立していない。

## 対象と候補coverage

- 親: HELIXLABO-L2-006〜010、各15 FR acceptance conditions（5 FR / 15 AC）
- L10: full ID付き74 functional case families。6/7/8/9のそれぞれにnormal・unseen・一変数negativeを置き、010では16 mandatory fieldsの独立negativeとinvalid enumを分離した。
- `recommended_action`の8有効値（`maintain`, `redefine`, `replace`, `split`, `merge`, `systemize`, `operational_fallback`, `retire`）は`L10-LABO-010-CASE-01` と `L10-LABO-010-CASE-02`の各正常fixture familyで、全て別々の正常proposal subfixtureに一つずつ使用する。列挙外enumだけが別negativeでunknown/invalidとなる。
- 固定L2/L11本文は `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、PO採択登録は `633bf12ea8f948db8ba3d6600179c4a9507377a7`、G0は `1880c422311a7f8321dbb0e2b98fa12c69449201`。G0は順序だけで採択authorityではない。
- 独立BR/BV/BCASEは追加していない。固定親に独立business outcomeがなく、functional ACをL10 functional casesで照合する。

## 6 canonical本文hash

| 文書 | SHA-256 | bytes | lines | base prefix SHA-256 |
|---|---|---:|---:|---|
| `docs/helix-labo/L3-requirements/business-requirements.md` | `66834cf358a8b56c169262b6d6d03d91c4b8864cd627278b99bca4481c26cd51` | 3067 | 17 | `750843fb87bd8a7a3eb9afab6508cc5db658926adc1c500005b3e286a5db3df1` |
| `docs/helix-labo/L3-requirements/functional-requirements.md` | `3102e05826d745192aca8fcfa87111cb803f1011f15dae2f79159035150870dd` | 65358 | 346 | `d63760b3f0294f3478ea911fdeebdf2251abe5b72e6a8cc7e7d4228d14c7ed69` |
| `docs/helix-labo/L3-requirements/nfr-grade.md` | `b34773d43ab8684d5871404daf73ec9a758b930a97ec26dfc324439b953c8d2f` | 19301 | 61 | `e1db54f23ca252a3a68ecbb962c84e3d0a0d04f0baad20437a5db5b69a351b4b` |
| `docs/helix-labo/L10-verification/business-verification.md` | `0c49f3cf01136b7a3b82dbc70937337ae9356e0458c1895c0df46a79ac1313a3` | 2191 | 15 | `ff9e43ba3f1bd4c57a6c49e0fe233aeb87e49c423a8d5d92f26aca3926a18205` |
| `docs/helix-labo/L10-verification/functional-verification.md` | `c812c9b3feb454d4c9ae85287b1a28da00897b07bf753b5f0000eb850ff9e1a3` | 69499 | 348 | `245a4e84600ec9c78f41eddfe1cfbc6e677677a8966b6a6253b5a46ac4f835d6` |
| `docs/helix-labo/L10-verification/nfr-verification.md` | `e4392915a970750cc94c7fedf9f41d4b8a35ec09660a415f47823d6486f700f1` | 17283 | 62 | `83d9fa7aa8d1775390bbec927ed812f388219e0400008c2786da610b953e6247` |

6文書はbase `11e987b506ff4a85bd231671d7f172b4895d55cf` に対してappend-onlyで、既存全文prefixをbyte単位で保った。

## Sourceと旧HELIX対応

linked JSONには58 pin（53 fixed/decision/order authority pins、5 legacy pins）を含み、各pinのrevision、path、physical line bounds、full-file SHA、raw-LF inclusive span SHAを記録した。58件すべてについてGit blob、span hash、line boundsを再照合した。固定親句と各FR/AC、normal/negative/unseen case、owner/戻し先、registration semantic digestもJSONに記録した。

旧HELIX-Bench/paired testはfailure・missingを隠さずsource/version/scope/evidence lineageを残す一般的意味だけを項目ごとに再導出した。旧5 category/12 metrics、固定scorer、team/provider ranking、hidden oracle、task/run protocol、pricing、qualification/admissionは移さない。Assurance AllocationとOperational Fallbackの直接一致は計画で定義したbounded L3/test-design search内では見つからず、隣接hitは文脈確認後に除外した。旧runtime、test、CI、Bunは実行していない。

## 確認結果と未成立事項

`git diff --check`、6 canonical prefix一致、74 case IDと15 AC IDの参照解決を確認した。技術候補は固定親の列挙（14評価カテゴリ、6条件、5 scope level、16 fields、8 action）を根拠とし、未知・欠測・比較不能・中断は成功や0へ置換しない。分母やvalid/failed/missing/censoredの観測方法を候補として記録したが、性能閾値、最低sample数、weighted score、parameter別PO確認、新gateは作っていない。

これは作成者の静的照合記録である。独立review、root最終検収、PO L3承認は未成立で、候補本文のままである。
