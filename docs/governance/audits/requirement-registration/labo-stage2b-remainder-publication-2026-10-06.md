# LABO Stage 2b 残22親の本文公開候補・静的照合記録

- 起点main: `0757e15875f6defff8b3af41ff61882e685a1e24`
- 固定L2/L11: `f6dad2a33e24f000b87d7f09b8d40288257e74cc`
- PO親採択記録: `633bf12ea8f948db8ba3d6600179c4a9507377a7`
- G0順序根拠: `0757e15875f6defff8b3af41ff61882e685a1e24`
- 本文revision: `9c3e9f1200e9f5221a38b779d22fb2fba4c6e716`
- 範囲: `HELIXLABO-L2-012〜030, 034, 035, 058`（22親、Stage 2b、version target 1.0候補）
- 状態: L3/L10候補。Opus/Fable独立review・委任承認・実装・releaseを表さない。

6 canonical本文へmain時点の全文prefixを保持して残22親の追補を加えた。L2/L11はf6dad2a、PO adopted registrationは633bf12、実装順序はG0 addendumから照合した。Stage2b先行9親のL3承認はこの22親へ継承していない。

## 6 canonical SHA-256 / line pins

| Path | prefix SHA-256 | prefix lines | body SHA-256 | appended lines | appended raw SHA-256 |
|---|---|---:|---|---:|---|
| `docs/helix-labo/L3-requirements/functional-requirements.md` | `5abc0f1c0aa8b6ed29ff35dd8b473332d237ae3685673c938184f812e1b78857` | 553 | `b04b4fa8868fcfa54e01cfb26e8aba113cc9691dacfeed58b5b3ea9666280273` | 554–1376 | `97d96c9900f7b94775bd578d36622d4d6700bf9e5242294f485187fec37f153f` |
| `docs/helix-labo/L3-requirements/business-requirements.md` | `12fdf58a66b4108bf45dcccb9845062f23b8cc49f33c800eeb6a23b12db43aa1` | 25 | `86ab4cb31a146c7d4e882fa8ab37a2708cb61d00dc3f5f159b0cca40f09c3736` | 26–54 | `a4ebf4d10e68902834587a499267750ee2d32f9d4ee947bd7c546c62d25aa849` |
| `docs/helix-labo/L3-requirements/nfr-grade.md` | `39ecabeaec040cde052db5bb0eb77ac0446fe5951483d3ed4106768512a134ec` | 99 | `c1251f20c4aee6e17d92bda3b0885d7fe051d1e2f80af774c138c86d9642a022` | 100–130 | `3274e67f981f3b1cd859d0806ec33aa97a8c17dc840e788facbd0ad4da9c4c1c` |
| `docs/helix-labo/L10-verification/functional-verification.md` | `891ae5539580ffe9dcba38c539807e1adc9017021ff010dbd6d8d42cc4c37fa7` | 559 | `626fa9bf8aa0be3fe0c069b71a26baeff81788675403d0feb14d18fee2554a08` | 560–1518 | `3f3150da3c6c1fdd62299e003b57c98631455802eb5ede1e57589e921b7c41df` |
| `docs/helix-labo/L10-verification/business-verification.md` | `0d4dc09046dbe401846dd79241151a55bfc1c46a7514197a00602f209ffb5908` | 23 | `7b48d40ae07ac9ae1acbf60d6ddc33099457490777ada9254c1764ba556ed000` | 24–52 | `3fb54ba92ae0e19249e412de777c1b9b4137d21be09c404af5b6666a9151c042` |
| `docs/helix-labo/L10-verification/nfr-verification.md` | `dcbc66854fcbcb7b718e390b515d61fa80d2392e1d199c3c884d5ed0edf3aa52` | 84 | `80e3ddd0966d870e34d6cf2df4998246ac9c62d8287af4b4f4ddd7babf208749` | 85–115 | `dd3fe6e5bff2ba36d2cff3b64e657ebf01a997e7fed58b1546ad194b5edbe89b` |

## 親・source・case照合

登録一覧、固定L2 raw span、L11 summary row、PO decision row、G0 assignment、旧候補行と実archive source span、現行FR range、L10 case ID/ACをJSONの親ごとのrecordに保持した。旧caseの集約変異は読み取り、追加C05以降のケースを一変数変異として分離した。ケース総数は22親で167 ID、ID重複なし。

| 親 | G0 | 固定L2 raw span | 現L11 row | PO row | L10 case数 |
|---|---|---|---:|---:|---:|
| `HELIXLABO-L2-012` | Stage 2b / 1.0 / MPR-RC-HELIXLABO-L2-012-001 | 167–170 `fa1281a914381cc416a7630bebb7a4547abc3fa7f78cf96d90f947be965ad728` | 63–63 | 60 | 6 |
| `HELIXLABO-L2-013` | Stage 2b / 1.0 / MPR-RC-HELIXLABO-L2-013-001 | 171–174 `58416ed8ae9464b5e48264a3a121c35fced5b290fd1343f12270fdf429fcc56c` | 64–64 | 61 | 6 |
| `HELIXLABO-L2-014` | Stage 2b / 1.0 / MPR-RC-HELIXLABO-L2-014-001 | 175–178 `0f2cd059b20388f4012379e895c7b124c2f1fdd6b0b1d17281b3ee248ae4385c` | 65–65 | 62 | 7 |
| `HELIXLABO-L2-015` | Stage 2b / 1.0 / MPR-RC-HELIXLABO-L2-015-001 | 179–182 `71522fc0ea82bd050c976d565aa4b0092df047538cd67634dd18cb52c434fbe3` | 66–66 | 63 | 8 |
| `HELIXLABO-L2-016` | Stage 2b / 1.0 / MPR-RC-HELIXLABO-L2-016-001 | 183–186 `7f79a3cecff61f2667bdce6214cf5e8de9c6b2ba6169de3ae28b33c01a42ede7` | 67–67 | 64 | 7 |
| `HELIXLABO-L2-017` | Stage 2b / 1.0 / MPR-RC-HELIXLABO-L2-017-001 | 187–190 `0a6fa1d91e9d1fd88e191ba8594b0348b092e82e1517fa68edc801bd8210c763` | 68–68 | 65 | 8 |
| `HELIXLABO-L2-018` | Stage 2b / 1.0 / MPR-RC-HELIXLABO-L2-018-001 | 191–194 `582e5b71bc97b9fe10e7ab1b22498b9dd023e91c393aaee3af8cedede135fd29` | 69–69 | 66 | 7 |
| `HELIXLABO-L2-019` | Stage 2b / 1.0 / MPR-RC-HELIXLABO-L2-019-001 | 195–198 `2c931ae3ef60fcd739ce16a8c03e1ddc1c80462b4c791b8f8a79ec4ff3707670` | 70–70 | 67 | 8 |
| `HELIXLABO-L2-020` | Stage 2b / 1.0 / MPR-RC-HELIXLABO-L2-020-001 | 199–202 `1de241d1126644a0f5bdf4775b091ae87977920a7552ea999b5094bc52480082` | 71–71 | 68 | 8 |
| `HELIXLABO-L2-021` | Stage 2b / 1.0 / MPR-RC-HELIXLABO-L2-021-001 | 203–206 `2a420b02039e3701f61387f78236753dfd59924b05bc4f0dfaa3215fec12a50b` | 72–72 | 69 | 8 |
| `HELIXLABO-L2-022` | Stage 2b / 1.0 / MPR-RC-HELIXLABO-L2-022-001 | 207–210 `c9de9a9d703d3a2605715ecd57511cea1cc8625891eafadea5eb2b01b6a3837d` | 73–73 | 70 | 8 |
| `HELIXLABO-L2-023` | Stage 2b / 1.0 / MPR-RC-HELIXLABO-L2-023-001 | 211–214 `c9cf147b928712f82694042c22cb9951530186f1dc3036ed36c19b2b1c487cc1` | 74–74 | 71 | 7 |
| `HELIXLABO-L2-024` | Stage 2b / 1.0 / MPR-RC-HELIXLABO-L2-024-001 | 215–218 `300c79db30dd775aa504d23005b53d51bb966b6c52b9d722aa2efa41239e7fa7` | 75–75 | 72 | 7 |
| `HELIXLABO-L2-025` | Stage 2b / 1.0 / MPR-RC-HELIXLABO-L2-025-001 | 219–222 `11ddd89eb4195637bea7e61ef1af9b2e6096603ab2b601da4f35aaac4ccafac0` | 76–76 | 73 | 7 |
| `HELIXLABO-L2-026` | Stage 2b / 1.0 / MPR-RC-HELIXLABO-L2-026-001 | 223–226 `a47b3ed9e39ae16dac5c50ab0d87282b5109c20874830693e5019e38742428ae` | 77–77 | 74 | 7 |
| `HELIXLABO-L2-027` | Stage 2b / 1.0 / MPR-RC-HELIXLABO-L2-027-001 | 227–230 `23833b323d44a786c302f054e22ead8a33e41ecdf66ff54fa1068ae1ac1eb30d` | 78–78 | 75 | 8 |
| `HELIXLABO-L2-028` | Stage 2b / 1.0 / MPR-RC-HELIXLABO-L2-028-001 | 231–234 `672081ff4372f097f39959b294ce961a35da899fb0e21b3d4a2f1cd3278851fd` | 79–79 | 76 | 8 |
| `HELIXLABO-L2-029` | Stage 2b / 1.0 / MPR-RC-HELIXLABO-L2-029-001 | 235–238 `10ee9155ebdbcb711715fddb6bddc644421559d8be4a3c404e22fdf3eedfdb29` | 80–80 | 77 | 8 |
| `HELIXLABO-L2-030` | Stage 2b / 1.0 / MPR-RC-HELIXLABO-L2-030-001 | 239–242 `9631b221fb6c1cb7b135324e0f914084146031297e2b82b95d64e14cc0df3613` | 81–81 | 78 | 8 |
| `HELIXLABO-L2-034` | Stage 2b / 1.0 / MPR-RC-HELIXLABO-L2-034-001 | 255–258 `ca533b2327c362fa9c455470b9e3a524ffb883f43b2641d897d5b133b8db3231` | 118–118 | 82 | 7 |
| `HELIXLABO-L2-035` | Stage 2b / 1.0 / MPR-RC-HELIXLABO-L2-035-001 | 259–262 `deba00a65917db6a1d3663472a52aaf23ea7a586fd4035e14ed7e72f2afcfb44` | 86–86 | 83 | 8 |
| `HELIXLABO-L2-058` | Stage 2b / 1.0 / MPR-RC-HELIXLABO-L2-058-001 | 403–415 `b2bbcdc2a4687314eef773ecae25517776e548be7df8c23818549eb6841ac9cf` | 156–162 | 98 | 11 |

## 静的確認と限界

- main prefix six-file byte match: PASS。
- 22 parent registration exact identity, fixed L2 span hashes, PO row literal, and G0 sequence/version candidate: PASS (as static byte/value verification).
- L10 case headings for target slice: 167 unique; each has explicit parent/AC locator. New case references resolve to current headings.
- Added BR/BV text: no independent business result is derived; functional AC/L10 remains the oracle.
- NFR candidate: planned population and observation/oracle axes are distinct; denominator 0/unknown is not converted to zero.
- `git diff --check`: PASS. Uniform Markdown table column counts: PASS.
- The four unresolved references in the previous canonical prefix are recorded as inherited and are not claimed fixed here.
- No old runtime, test, CI or Bun command was executed. No implementation, approval or release evidence was created.

## 旧sourceの扱い

旧infinity-loop L3/HAT、Universal Improvement Loop L3/paired acceptance、およびFRS candidate linesはparentごとにraw-LF pin済み。共通のsource/lineage/counterexample/normal-negative-case形式を類例として再導出し、旧engine order/runtime/authority gate/FRS bundle semanticsを移していない。旧archive sourceはmain 0757でpinし、local authoring source commitを正本として扱っていない。
