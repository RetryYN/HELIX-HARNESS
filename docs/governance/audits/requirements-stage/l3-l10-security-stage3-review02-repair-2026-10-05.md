# SECURITY Stage 3 Opus review02 修正記録

記録日: 2026-10-05
状態: 作成側修正を記録。独立再review・finding closure・PO承認は未成立。

本記録は作成側の修正と静的照合を固定する。Opus review02 の独立findingは、修正だけではclosureにならない。独立再reviewとPO判断は未成立。

## 固定revisionとレビュー本文

- base: `3b63e2a99f82d83e8ad76e9b33dc1199924f9a7c`
- 修正前のreview対象HEAD: `45a17041a20c12ddfb6aee035c0f2b91f4c4f16c`
- 修正本文commit: `180e67559bfad4946be9e8e544d9b496cd6d94ce`
- 対象: SECURITY-029, SECURITY-030, SECURITY-032, SECURITY-034, SECURITY-035 / Stage 3 only
- 正式comment: [#5989803834](https://github.com/RetryYN/HELIX-HARNESS/pull/2599#issuecomment-5989803834)。GitHub API生body UTF-8 7182 bytes、SHA-256 `e43fda5a17970badf34a92515e8fe0807f970a495bc3eede14c2386452d19bcf`。

## 指摘別処置

- **M1 — 修正済み** AC-029-04とCASE-029-04に常時/該当operation field欠落・unknownの結果、005 missingのdeny/stop、field別既存戻し先、参照専用旧資料の境界を追記。 独立review: 未実施.
- **M2 — 修正済み** CASE-035-01にprovider flagだけの成功主張を独立fixtureとして追加し、不適格・拒否/保留を明記。 独立review: 未実施.
- **M3 — 修正済み** 前回候補のCASE-035-03でINFRASTRUCTUREを戻し先に含めた誤りを除去。policy意味はSECURITY、enforcement/cleanup強制はWorker実行環境、assignment/未完義務はOSと固定配置に合わせた。 独立review: 未実施.
- **m1 — 修正済み** CASE-029-05の偽装と主Worker条件欠落に各既存ownerへの戻し先を追加。 独立review: 未実施.
- **m2 — 修正済み** CASE-029-06に確認先返却とOS assignmentへの未完義務継承を追加。 独立review: 未実施.
- **m3 — 修正済み** CASE-030-04に不足field/scopeの依存owner返却と昇格前状態・未完義務保持を追加。 独立review: 未実施.
- **m4 — 修正済み** CASE-032-03の031単独受入claimを不合格とし032を未評価/unknown保持に追加。 独立review: 未実施.
- **m5 — 修正済み** FR-032で候補はpolicy変更/失効主体、解除、追加承認、bypass許可を定義しないことを明示し、OSがactor新設しない役割と分けた。 独立review: 未実施.
- **m6 — 修正済み** CASE-034-04を既存L2-008 authority/L2-007制約へ戻し、本候補から許可を作らない表現へ修正。 独立review: 未実施.
- **m7 — 修正済み** FR-035-02のrun終端未確認は当該run完了を成功扱いしない表現へ揃えた。 独立review: 未実施.
- **m8 — 修正済み** AC-035-04、CASE-035-04、NFR-035-01のL3/L10両行へ006/007/008/OS-018非相殺を同期。前回Opus/Claude記録も008を落としていたため、本補正でcoverage漏れを記録する。 独立review: 未実施.
- **m9 — 修正済み** CASE-035-04のrevision/scope流用=hold、申告のみ=unknown、非相殺=不合格をfixture別に固定し、適用状態のみの申告変異を追加。 独立review: 未実施.

## 過去の検収漏れの訂正

本修正では、前回候補CASE-035-03からINFRASTRUCTUREへの戻し先を除いた。policy/authorityの意味はSECURITY、enforcementとcleanup強制はWorker実行環境、run/assignmentはOSに保持した。M3に関する前回Claude/root検収の記録でこの誤配置の解消確認が明確でなかったため、本記録で差分と固定owner境界を明示する。
m8ではL2-008 operation authorityが前回Opus所見文からも脱落していた。修正後は006/007/008/OS-018をAC、CASE、NFR grade、NFR verificationへ揃えている。

## 6文書と承認済みprefix

各文書の全文SHAと長さはJSON記録に固定した。全6文書でmain baseの既存承認済みbytesがcandidateの先頭とbyte一致する。

- `docs/helix-security/L3-requirements/business-requirements.md` — SHA-256 `0b2894925bc80895ff61723377f27b14b4cca32289756747c566e35cba049dee`, 1958 bytes; prefix `3b63e2a99f82d83e8ad76e9b33dc1199924f9a7c` 1430 bytes / `e6cfb2b5abff73254f0f8d860ffbd0590085fed224cf8f2fb61a02271d780ff9`: 一致.
- `docs/helix-security/L3-requirements/functional-requirements.md` — SHA-256 `8b0babb74dd5d5d2f7aee2742de5aecf07407c3029b1198ef6ad6d950fdf316b`, 100534 bytes; prefix `3b63e2a99f82d83e8ad76e9b33dc1199924f9a7c` 76904 bytes / `8e4c5064a0ab84345c31d6abf6a764c84eb34ad2c4ee41405c074507e175b165`: 一致.
- `docs/helix-security/L3-requirements/nfr-grade.md` — SHA-256 `abfb8ce0c2ec8f8baa035b301402f1f6e13b9ac31bfed27b27230d3daf2403cd`, 12910 bytes; prefix `3b63e2a99f82d83e8ad76e9b33dc1199924f9a7c` 9983 bytes / `bc2476eafc5922b451a7c967e9d05aa477e6649c58b77427cd24ed1d4de12427`: 一致.
- `docs/helix-security/L10-verification/business-verification.md` — SHA-256 `8683764bb26d0d1f582828096c050c264df45a4f0fdc2c94e34bb4dbf9e1eb7a`, 1461 bytes; prefix `3b63e2a99f82d83e8ad76e9b33dc1199924f9a7c` 933 bytes / `d136764cfef2b6eeca900c5046a1228764e414591cc58bd9b6e076fca62fc933`: 一致.
- `docs/helix-security/L10-verification/functional-verification.md` — SHA-256 `1047babfefeda159b7157dae4e7a718a325c46ccedac604eb34c629c7250d473`, 75382 bytes; prefix `3b63e2a99f82d83e8ad76e9b33dc1199924f9a7c` 62505 bytes / `f679d21ad0b707ac450473f6b21d1d1feb29d8c2982ed83c6d67133dc2ffe507`: 一致.
- `docs/helix-security/L10-verification/nfr-verification.md` — SHA-256 `ec648c78a3d4e164ab8ef8b4e23c30a2756cfed70b47c4514b3c0eb67db02be2`, 9670 bytes; prefix `3b63e2a99f82d83e8ad76e9b33dc1199924f9a7c` 7420 bytes / `683fd29048418b6e8d1e78ab27bc727dc026d7c5555c7a63662d27da7746fd18`: 一致.

修正後のcurrent literalはJSONの `current_changed_literal_pins` に物理行・全文literal・LF込みSHA-256で記録した。4 canonical文書の15変更行を含む。

## 固定authority source

根拠はmain `633bf12ea8f948db8ba3d6600179c4a9507377a7` のL2/L11およびPO placement decision。L2-005のcredential tupleはcredential-use時だけを対象とし、未発生fieldの捏造を要求しない。L2-029 unknown時のreject/return、L2-032のpolicy actor/解除/追加承認/bypass非生成、L2-034 read-only scope越境のL2-008/L2-007 return、L2-035のcompletion/unknown/noncompensation、L11-029/032/035のscope/unknown/noncompensationを固定spanとしてJSONに列挙した。PO placement Aはpolicy/authority=SECURITY、enforcement=Worker、run/assignment=OSの配置を固定し、新たな許可を与えない。

## 旧監査の不変性

- `docs/governance/audits/requirements-stage/l3-l10-security-stage3-public-cutout-2026-10-05.json` — `45a17041a20c12ddfb6aee035c0f2b91f4c4f16c` SHA-256 `a006159344512b6c473e0c981dafe6ce42b4c0aa37b073508f4583e3f3d941f5`; 現在bytes 不変.
- `docs/governance/audits/requirements-stage/l3-l10-security-stage3-public-cutout-2026-10-05.md` — `45a17041a20c12ddfb6aee035c0f2b91f4c4f16c` SHA-256 `7ddb4ce7916a69eac186e857ae952d5d5c2aa91eb6dc3e8fa527c0c8f40e5cad`; 現在bytes 不変.
- `docs/governance/audits/requirements-stage/l3-l10-security-stage3-review01-repair-2026-10-05.json` — `45a17041a20c12ddfb6aee035c0f2b91f4c4f16c` SHA-256 `05b83dc8f9881a7ff8defdb21860215ce0e62ac53af313d3f9e003cb588e1002`; 現在bytes 不変.
- `docs/governance/audits/requirements-stage/l3-l10-security-stage3-review01-repair-2026-10-05.md` — `45a17041a20c12ddfb6aee035c0f2b91f4c4f16c` SHA-256 `54f3c407bfaf64611957e9b0d22ddcf15d5e5beb9beba107a6f784d9e71e1295`; 現在bytes 不変.
- `docs/governance/audits/requirements-stage/l3-l10-security-stage3-root-correction-2026-10-05.json` — `45a17041a20c12ddfb6aee035c0f2b91f4c4f16c` SHA-256 `024c1fd5797e5a1d4b80fe1bede09bf1b82398cce1a511559f6e884a08fd0d0d`; 現在bytes 不変.
- `docs/governance/audits/requirements-stage/l3-l10-security-stage3-root-correction-2026-10-05.md` — `45a17041a20c12ddfb6aee035c0f2b91f4c4f16c` SHA-256 `7cdd326ce39ba507f44f9374cb1b0b52f9b8cb43a0f5913d24398cc53a1df5ed`; 現在bytes 不変.
- `docs/governance/audits/requirements-stage/l3-l10-security-stage3-030-source-pin-followup-2026-10-05.json` — `45a17041a20c12ddfb6aee035c0f2b91f4c4f16c` SHA-256 `16f66a8713c7f9d0be55071f3f95701b933243f85545c591312d5eedd0b7c6a9`; 現在bytes 不変.
- `docs/governance/audits/requirements-stage/l3-l10-security-stage3-030-source-pin-followup-2026-10-05.md` — `45a17041a20c12ddfb6aee035c0f2b91f4c4f16c` SHA-256 `aed7c23d6943eca596130a77324f3b60736517a243d42cdb05cdae75d7cd58ec`; 現在bytes 不変.
- `docs/governance/audits/requirements-stage/l3-l10-security-stage3-root-main-integration-2026-10-05.json` — `45a17041a20c12ddfb6aee035c0f2b91f4c4f16c` SHA-256 `678cee16665d2edcda633f0b0815490cb46c50882f16dc4600500d3fbd505836`; 現在bytes 不変.

## 静的検証と限界

- `scfctl validate`: 147 bindings, fail 0。`stale`: 0。`residuals`: 0。
- `govcheck`: `ok atoms=7622 requirements=57 files=58`。`git diff --check`: pass。
- 旧runtime、旧test/CI、Bunは実行していない。
- 5親の候補修正に限定した。独立再review、PO承認、実装・実運用の合格は記録していない。
