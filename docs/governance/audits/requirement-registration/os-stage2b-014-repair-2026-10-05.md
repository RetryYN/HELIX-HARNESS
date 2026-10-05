# HELIX-OS Stage 2b / L2-014 修正候補記録

この記録は、HELIX-OS Stage 2b の `HELIXOS-L2-014` に関する候補文書の修正時点を固定する。本文commitは `8be3417f08e33a736b69e10973d564bbeb58cd56`。これは作成者の静的記録であり、PO承認、独立review、root最終検収、実装許可、配布許可を生成しない。

## 修正内容

- L3 `AC-OS-014-06` は、prior構成・artifact/configurationへのrollbackと、切替後に進んだ案件stateおよびrecordの継承を別々に照合する。古い案件checkpointで更新を巻き戻さない。
- L10 `CASE-OS-014-06` は、切替後のstate更新とrecord追加を含む正常例、値と複数record eventを使う未見正常例、古checkpointがstate更新またはrecord/historyを失わせる独立negativeを記録する。構成rollbackの成功だけからstate/record継承を合格にしない。不足の戻し先は案件state/record custodyをOS、rollback target/procedure/data compatibilityをINFRASTRUCTURE-019、backup/restore/evidenceをINFRASTRUCTURE-017/018としている。
- FRの既存prefix physical line 13は、親別crosswalk/L10参照に、このimmutable auditへの参照を一つ追加した。これは固定時点記録の参照訂正で、要求意味、scope、owner、versionを変更しない。FRを除く5文書の既存prefix bytesはbase本文と同一である。

## 本文hash

| Canonical文書 | SHA-256 | bytes | lines |
|---|---|---:|---:|
| `docs/helix-os/L3-requirements/business-requirements.md` | `6108f12bb7f4c4fef4953bfad5376d633d810d40ab053d7c6efc89f743e8a5c9` | 8498 | 49 |
| `docs/helix-os/L3-requirements/functional-requirements.md` | `38fcc959a284410d450f8ec38857ae78a5a4277d9169762318ad910755f37c23` | 51683 | 194 |
| `docs/helix-os/L3-requirements/nfr-grade.md` | `701871ddb7b82576f937c1f61ad43b46bbad041e4097d0eb2a392a3862e60a9f` | 13327 | 71 |
| `docs/helix-os/L10-verification/business-verification.md` | `5342ef7983a22a237f812ab44a23061914555d70dde1b1f6316f02584b37ce6b` | 5816 | 34 |
| `docs/helix-os/L10-verification/functional-verification.md` | `5b55db6768f2eb332626cc4046e15ae432ff999ed8d9e4640364b04af864354e` | 48791 | 401 |
| `docs/helix-os/L10-verification/nfr-verification.md` | `2b85fa2db0e4b666d78c64a159d361516b70a1bdd52817989bb9c1e834102d84` | 10745 | 65 |

## 確認結果と限界

`git diff --check` は通過。固定Git revisionから37件のsource pinについて、Git blob全体またはbounded raw-LF span、物理行範囲、SHA-256を照合した。旧test、runtime、CI、Bunは実行していない。既存の2 NFR候補および11 AC/CASE familyのID対応は維持した。詳細なsource pins、親trace、prefix exception、candidate状態は同じstemのJSON記録にある。

この記録の作成者は独立reviewを行っていない。root最終検収、独立review、POのL3承認は未成立であり、本文は候補のままである。
