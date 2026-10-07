# LABO Stage 5 parent 061 R4補強の時点監査

- 対象base: `a00711ee8a0817cf6553b8a671a0abee54ce6e73`
- Branch: `codex/labo-stage5-061-r4-repair`
- authority effect / approval effect: `none`。本記録は要件承認、実験許可、隔離実績、L10実行を生成しない。
- 固定sourceは`318ec4a04abb3c1cc17111b3d939f913facd5fd3`のL2:457–469/L11:205–215。旧sourceはR04/R08と対応acceptanceを実読した。SHAとspanは同名JSONに固定した。
- R4の親別分類根拠は `/tmp/root-labo-stage5-decision-residual-review-f0e210b3.md`（SHA-256 `821eb25720dd7d7637688a98f07980c0b5d1bbc54d76259e665ef3c7437b6d34`）であり、旧分類記録は変更していない。

## 実装した補強

- CASE-115: OS registration/delivery receiptは存在するが、実Worker-visible context参照/可視範囲が未確認のfixtureで、receipt成功だけから隔離を成功判定する変異を拒否する。未確認を保持し、実context/assignment証拠を既存実行主体へ返す。identity不明はunknownのまま。
- CASE-116: 比較結果を受けたLABOがWorkerを起動する単独変異を拒否し、OS assignment/実行状態を維持する。
- CASE-117: comparison receiptだけでLABOがcandidate採択を確定する単独変異を拒否し、未決状態を維持する。
- CASE-118: 後発のL2-061条件を固定L2-059 revisionに遡及適用して既存比較を無効化する単独変異を拒否し、059の固定状態を保持する。
- AC-02とCASE-03eを整合させ、task/oracle適用性unknownを既知の安全判定へ継承せず、固定task/oracle ownerへ返す。owner identityを特定できない場合はunknownを維持する。CASE-03e/18既存ケースの意味は保った。
- BR/FR/NFRとBV/FV/NFRVでscope、trace、個別fixture件数を同期。旧a4の132 IDは歴史起点として保持し、現行は136 unique ID（table rows）となる。

## 固定親と旧source

- L2-061:459は同じ評価engineを新設せず、固定L2-059 revisionへ遡及適用しないと明示する。L2-061:463は実際にWorkerへ渡したcontextを検証できない場合、隔離済みと推定しない。:464はLABOがWorkerを起動/割当せず、receiptからjudge任命権限を生成しない。:465–467は不一致runの保持、適用範囲、unknown task/oracleと実行context/assignment evidenceの返却を定める。
- L11-061:209–215は正常条件、各field欠落、不成立保持、未見taskへ既知安全性を無条件継承しない境界、適用不明をownerへ戻す接続を固定する。
- 旧 `LEGACY-ASSET-28FB139B26CD61CC51EE` R04/R08は15-field task snapshot、public/hidden分離、author/judge分離、historical evidenceの当時性を再導出する起点。旧 `LEGACY-ASSET-A952A3A175EB82A4781B` AC005/006/012/013はpaired consumerで、直接の要求根拠とは区別する。旧schema/runtime/test/CIを実行・移植していない。

## 六本文pin

| 文書 | base bytes SHA-256 | 修正後 bytes SHA-256 |
|---|---|---|
| BR `docs/helix-labo/L3-requirements/business-requirements.md` | `9f56b674f11f9b666bc546a20e7a7492d1dfe377a24495d351392698c8389777` (32852 bytes) | `de87a0a155e2ad9b12ce95d35f8a826ec93d9c612cf05fcd32d780153c46b9b6` (32933 bytes) |
| FR `docs/helix-labo/L3-requirements/functional-requirements.md` | `0f11b654be30baae1749800ce3c184a146ceb4bce22710f762ef368f5d40e536` (354627 bytes) | `781507b5c9089c055bb31ff5a922d7e8fc81031c273a1509b7aa7b07e423c99c` (355690 bytes) |
| NFR `docs/helix-labo/L3-requirements/nfr-grade.md` | `d5838368f1ec9ee9e57cc143aa6e346ae1ff7f924d46c234880798098936b773` (91404 bytes) | `2a8f9fc49c8f23b3876ca8b300f4c971a1b9c1779b2dfcc2a1202369ab4ae381` (91474 bytes) |
| BV `docs/helix-labo/L10-verification/business-verification.md` | `54e42a8af0d30f7eb1c2b75810b51fab6197558633ab3bac7a50b024e581445e` (31387 bytes) | `e8bff4f74988303135bfe50ac45d56a8bafd625b82ac9ecb891e3ed7a590cf8f` (31561 bytes) |
| FV `docs/helix-labo/L10-verification/functional-verification.md` | `304aebc0edf618fd0eba2d73b745611b1d259ffd94429c0375df16ca58874bb4` (693873 bytes) | `9cdc288ae8bc906d036fe7ce3d45a2c9529d30d6f9b86d47a888f48d2a09d34e` (695654 bytes) |
| NFRV `docs/helix-labo/L10-verification/nfr-verification.md` | `922f8fccc63917178606dbb5edd165f5bdc6805de3753ead6d703b8342fdb8b7` (82275 bytes) | `d92ab6df7bdb5b54e15856509be34ada3846cfdfd0e2403d817335283a81e3d6` (82388 bytes) |

## 静的検証と限界

- `git diff --check`: PASS。
- FV CASE ID: base 132、修正後136 unique table rows。CASE-115〜118は個別AC-03 negativeとして追加した。
- L3 trace/FR・FV・NFR・NFRV・BR・BVの範囲と件数を照合。CASE-03e/18既存unknown applicabilityと新CASE-115〜118は別predicateを保つ。
- L10実行、旧runtime/test/CIは未実施。CASEは設計候補であり、actual isolation/assignment/adoptionを確認した証拠ではない。
- fixed parent outside 061 R4、他stage、PO事後確認には触れていない。
