# HELIX-OS Stage 4 L3/L10 起草・静的照合記録（2026-10-05）

本文commit: `62f269036a00a7cae06f8d47c21d7c3a4b9846fe`。起点main: `29e814a92af2aa52afcbcdd60549b32a2448513a`。

本記録は時点のsource照合・静的検証記録であり、L3承認、独立review、実行結果、採択、releaseを生成しない。対象はStage 4の6親に限り、他Stageと後続版/Web条件は混ぜていない。

## 対象と固定根拠

- `HELIXOS-L2-021` / `MPR-RC-HELIXOS-L2-021-002`（1.0候補、Stage 4）。L2 702–711 raw `c218690d2796bb4c91348c12c1d7ca5eab45004447c05f8dcdf3fd30ae735d2a`、L11 366–371 raw `21ab8d8199d2f8e1d9999a30d6502d6aa8d7dc3017fe394a3d090d4baf7a6462`。
- `HELIXOS-L2-022` / `MPR-RC-HELIXOS-L2-022-001`（1.0候補、Stage 4）。L2 712–721 raw `d78f600f299dfd4b9f35f7b2107d9aa076819cde6668274301c309a9e7e4b190`、L11 373–378 raw `844a21ece8560bc7fd0cad5b1982d96027847ac07a44518a85e5eab29539c7a8`。
- `HELIXOS-L2-024` / `MPR-RC-HELIXOS-L2-024-001`（1.0候補、Stage 4）。L2 732–741 raw `c95ed2214e72795a30ee2acaa3dd96bc77ccc41b66df4b3d44f83212ebaba780`、L11 387–392 raw `7e4f145d506c50084fcaa993a255e4dc098b4055c477f0917c1d0bccfea03e54`。
- `HELIXOS-L2-046` / `MPR-RC-HELIXOS-L2-046-001`（1.0候補、Stage 4）。L2 1177–1184 raw `65ebd519831b293afacb839c4d632107614352ad0169c38fc2bdfb8e289f85fe`、L11 794–800 raw `3cc2589095ed3c6a9431fc0fb286daddd423d4a5c7d0c2b46cab3a455f6efdc0`。
- `HELIXOS-L2-048` / `MPR-RC-HELIXOS-L2-048-001`（1.0候補、Stage 4）。L2 1195–1204 raw `5a3bfe0f5152ef8550ffd7933d33e0cf030d4a4f6f89bf64470a45e55db3da15`、L11 812–819 raw `543007c8f43b3372dee673dc94fdaceb3ca3d2a291dc9cbb674acac68369054d`。
- `HELIXOS-L2-052` / `MPR-RC-HELIXOS-L2-052-001`（1.0候補、Stage 4）。L2 1231–1241 raw `342aee2bec0e5f89f34e969d78f7dbfc70510c98afc62ec340f861a042a66e60`、L11 847–854 raw `70b5bb6bd967cfc15e85221ed6c1b842fb6fc92318b735867661223bf64ac1e2`。

PO採択の対象identityはbasis main 633bf12のdecision本文から、registration revisionとsemantic digestはG0対応表／register row pinから別に固定した。L3草稿の承認状態とは区別する。旧資産は以下の16有界spanを実bytesで照合し、全体SHA・raw LF-inclusive span SHA・literalをJSONへ保存した。

## 6 canonical本文

- `docs/helix-os/L3-requirements/functional-requirements.md`: base prefix 438行 / `e47646114f696ca3284a143b65cc36d61253587f81e0ba439aa890f4e391db0a` を完全保持。body SHA `6838803f4453c10c498021d83f86ff6ccfca1faf36a1be87aedf9ad805519ebd`、追補行 439–529、追補raw SHA `7eb669af09e594827c84fe2f605cc95afc9a608601dad366560ac96546bba538`。
- `docs/helix-os/L3-requirements/business-requirements.md`: base prefix 77行 / `cb510502fdc387dab5cbd212c3d9b6c9d56a4fee2e542c4ab9b9afb5790db125` を完全保持。body SHA `c2175d8336265ec672c2d3b444fc41d958d263d4c4f16af164119708fc7a0f21`、追補行 78–90、追補raw SHA `c8d6ab9d3f77920cd21b595c00dd0268142da05c2a8009c3bc62ea3b75d51919`。
- `docs/helix-os/L3-requirements/nfr-grade.md`: base prefix 101行 / `c766bd6e73521f93c5973df56255a96f55b4839b2e41d5c7bef449365d66c7e1` を完全保持。body SHA `413ad7dc42de004f62b545861a3efd73885ef3f36adc73b281a8cabe320c9b6a`、追補行 102–114、追補raw SHA `f1ba74570b0ce78705ceabe2e386b2fd3e0c1881ce9a6841430e43e4ed563a12`。
- `docs/helix-os/L10-verification/functional-verification.md`: base prefix 770行 / `3fa371924de7bbfbefcfe78a12fe9b8eae159337dcaa0d3deb90be8d7752219d` を完全保持。body SHA `794ce24acc3cfba3c254b69e4998c09ba4a8bd642faa5f118ae8267aaa2cd7a3`、追補行 771–879、追補raw SHA `7817b457c721bd31ece50770c323ca137f81c7fbddeb33eea8c40ac38f4a0d59`。
- `docs/helix-os/L10-verification/business-verification.md`: base prefix 64行 / `2829e339489fe717b22c3dd4a322fbb51b2eb6e72d1336fe4d7c0c1bb83c96d6` を完全保持。body SHA `b7e35b94385dbf325c3db4862f84d4d2366a5a687aa954b60fdf00e2a9be652c`、追補行 65–78、追補raw SHA `1b4a11a9aa40cd044e585f24d699df4699b7dd959069d98da19b05174f6bbb69`。
- `docs/helix-os/L10-verification/nfr-verification.md`: base prefix 100行 / `f68c1ac1c9b23ad81d138f89b8bd1d5316c18ab7d758b70257232d1bc4531a60` を完全保持。body SHA `c1896af784399bbf050ed02b83a2794a6dacbe0934172b3dbe94aac963479691`、追補行 101–122、追補raw SHA `b29d3c5ea5a21be83e28a3743d706ac78758ad4512ce46b922e855a7d801959e`。

## 被覆・判断

functional AC 18件、functional CASE 96件（summary 18件＋単独変異fixture 78件）。NFR候補6件とNFR CASE 6件。独立business outcomeがないため独立business CASEは0件とし、business verificationで機能CASEへの境界参照を置いた。

022は観測から再観測までの候補→LABO評価→既存判断→ticket→変更/検証を保持。024は permission/data-use・HARNESS/OS/LABO境界を維持。046は既存契約が定めるdispatchからmerge admissionまでの照合のみ。048はLABO評価、INTELLIGENCE案、OS ticketを分離。052は所有されたlocal worktreeの適格性とexact reviewed pair/read-afterを対象とする。ここに記したCASEは合成fixtureで、merge、削除、force、rebase、実配布等を行わない。

旧sourceの各行に対する再利用／再導出／置換とsource限界はfunctional-requirements.mdのStage 4 crosswalkおよびJSONに親別に記録した。RFAはG0/L2が特定するRFA-AC-16一行に限り、source closureを拡張しない。旧grouped CASEは個別変異CASEへ展開し、重複件数にしない。

## 検証結果と未確認

- git_diff_check: PASS
- six_prefix_bytes_exact: PASS
- legacy_full_and_bounded_raw_span_hashes: PASS (16 spans)
- case_ids_unique: PASS
- case_ac_references_resolve: PASS
- table_column_count: PASS (Stage4 tables)
- old_runtime_ci_bun: not invoked
- meaning_review_or_independent_review: not performed by this authoring/static record

canonical変更前prefixの完全一致、旧source16 spanのfull/raw hash、Stage4 CASEの一意性、AC参照解決、表列数を静的に確認した。旧runtime、旧CI、Bunは起動していない。内容の意味レビューと独立reviewは未実施であり、root検収に残る。

機械根拠JSON: `docs/governance/audits/requirements-stage/helix-os-stage4-l3-l10-authoring-audit-2026-10-05.json`。JSON SHA-256 `74d53d3e4a6d47a74ff620c109de8110f74d411f4482b2fd49c4ac6d12c45018`。
