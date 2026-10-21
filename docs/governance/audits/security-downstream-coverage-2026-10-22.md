---
audit_record_id: AUDIT-SECURITY-DOWNSTREAM-COVERAGE-20261022-C1
authority_effect: none
source_revision: ba4ac1cdd76fdd0d907e684c035b059e8029b9da
audit_input_sha256: 6ae8be6b586679e5ea9a79b80e95679bf9473ea37a89bb2dc028133e79b0396a
scope: HELIX-SECURITY 12 parents / 35 pairs / 48 source documents
---

# SECURITY下流設計の存在・凍結記録照合（#3545 C1）

- 対象revision: `ba4ac1cdd76fdd0d907e684c035b059e8029b9da`。固定10/12監査JSON `docs/governance/audits/prerequisite-l3-l10-definition-audit-2026-10-12.json`（SHA-256 `6ae8be6b586679e5ea9a79b80e95679bf9473ea37a89bb2dc028133e79b0396a`、1,130,244 bytes）のHELIX-SECURITY 12親35組だけを対象。
- 監査authorityはなし。これは固定sourceの対応・凍結記録の所在照合であり、意味適合、実装準備、承認、全405組完了を生成しない。
## 凡例

- 5分類: ①対象pair/層の明示凍結記録、②同じ対象pair/層の凍結未完・未凍結が明示、③限定検索で対象層の凍結記録未確認、④対象artifactなし（記録不存在の断定ではない）、⑤明示的に範囲外。②は当該pair層の実スコープに対する凍結未完・未凍結が明示された場合に限る。未成立を記さない一般的な工程説明・前提素材、L6/L7のコード等だけに限定された凍結、全機構の残件、部分fixture凍結だけでは②/①にしない。L5/L8自身のremaining/completion_limitが実装前test/oracle凍結未成立を明記し、当該文書のchild scopeが対応する場合は②とし、「実装成果は層外。その前」か「層外実装前」かの語順では分けない。
- L4/L9 basicとL5/L8 detailを別々に分類。各layer sourceの存在とpair child refの確認は別事実。各refはactual contract/function/case/trace内の値を示し、approved snapshotやcase入力内の文字列、`id`自体をchild対応に使わない。001のreference_unit_casesはfunction_refとrequirement_refを持つ実unit case headerの参照であり、source_case_refが指すL9入力・期待のコピーから独立凍結や実検証を生成しない。`(+N)`は同一source・同じ参照形状にある同IDの追加出現数。代表は数値index順に選ぶ。件数を独立case数や意味網羅数に読み替えない。
- L9のL10は同一case entry内でID値まで一致を確認した場合だけ記載。別object・同じindexの近接・fixture全体の存在から補完しない。
- freeze検索: 固定48 JSONの全階層で、keyの`remaining/pending/unclosed/unfixed/unobserved/freeze/frozen/凍結`と文字列値の`freeze/frozen/凍結/未固定/未凍結`を所在の候補として列挙した。候補語自体は②判定でなく、該当scopeと値を個別読取した。部分凍結は部分のまま保持。

## 旧sourceと失敗根拠（10/12固定監査JSON `/legacy_basis` を直接確認）

- 旧source: `archive/legacy-generation-2026-09-14/root/CLAUDE.md:49-63,82-85`; `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-requests.md:23-67`; `archive/legacy-generation-2026-09-14/root/docs/design/helix/L4-basic-design/design-template-json-authority.md:16-60`; `archive/legacy-generation-2026-09-14/root/docs/governance/predecessor-harness-full-weakness-audit-2026-07-20.md:65-101`.
- 保持: 仕組み先行、意味と外部作用の分離、明示集合と必要安全依存、局所/接続/構成体の別証拠、template/pair/backflow。変更: 対象revision・pair oracle・独立承認を固定snapshot上で対応付け、旧runtime/CI/catalogは実行・採用しない。
- UTW-005/014/021/024/029はexact revision、欠落検知、自己申告による完了拒否、全量trace、consumer間の検証差を照合する失敗根拠。新gateは追加しない。

## source alias（S1–S48）

| alias | parent / layer | 固定source path | 正本の文書識別・対情報（実field） |
|---|---|---|---|
| S1 | HELIXSECURITY-L2-001 / L4 | `docs/helix-security/L4-basic-design/external-input-trust-boundary.json` | S1:162 `/document_id` = `HELIXSECURITY-L4-001`; S1:164 `/pair` = `L9` |
| S2 | HELIXSECURITY-L2-001 / L9 | `docs/helix-security/L9-integration-verification/external-input-trust-boundary.json` | S2:162 `/document_id` = `HELIXSECURITY-L9-001`; S2:164 `/pair` = `L4` |
| S3 | HELIXSECURITY-L2-001 / L5 | `docs/helix-security/L5-detail-design/external-input-trust-boundary.json` | S3:495 `/document_id` = `HELIXSECURITY-L5-001`; S3:497 `/pair` = `L8` |
| S4 | HELIXSECURITY-L2-001 / L8 | `docs/helix-security/L8-unit-verification/external-input-trust-boundary.json` | S4:495 `/document_id` = `HELIXSECURITY-L8-001`; S4:497 `/pair` = `L5` |
| S5 | HELIXSECURITY-L2-002 / L4 | `docs/helix-security/L4-basic-design/untrusted-command-isolation.json` | S5:152 `/document_id` = `HELIXSECURITY-L4-002`; S5:154 `/pair` = `L9` |
| S6 | HELIXSECURITY-L2-002 / L9 | `docs/helix-security/L9-integration-verification/untrusted-command-isolation.json` | S6:152 `/document_id` = `HELIXSECURITY-L9-002`; S6:154 `/pair` = `L4` |
| S7 | HELIXSECURITY-L2-002 / L5 | `docs/helix-security/L5-detail-design/untrusted-command-isolation.json` | S7:264 `/document_id` = `HELIXSECURITY-L5-002`; S7:266 `/pair` = `L8` |
| S8 | HELIXSECURITY-L2-002 / L8 | `docs/helix-security/L8-unit-verification/untrusted-command-isolation.json` | S8:264 `/document_id` = `HELIXSECURITY-L8-002`; S8:266 `/pair` = `L5` |
| S9 | HELIXSECURITY-L2-003 / L4 | `docs/helix-security/L4-basic-design/project-scope-isolation.json` | S9:138 `/document_id` = `HELIXSECURITY-L4-003`; S9:140 `/pair` = `L9` |
| S10 | HELIXSECURITY-L2-003 / L9 | `docs/helix-security/L9-integration-verification/project-scope-isolation.json` | S10:138 `/document_id` = `HELIXSECURITY-L9-003`; S10:140 `/pair` = `L4` |
| S11 | HELIXSECURITY-L2-003 / L5 | `docs/helix-security/L5-detail-design/project-scope-isolation.json` | S11:1969 `/document_id` = `HELIXSECURITY-L5-003`; S11:1971 `/pair` = `L8` |
| S12 | HELIXSECURITY-L2-003 / L8 | `docs/helix-security/L8-unit-verification/project-scope-isolation.json` | S12:1969 `/document_id` = `HELIXSECURITY-L8-003`; S12:1971 `/pair` = `L5` |
| S13 | HELIXSECURITY-L2-004 / L4 | `docs/helix-security/L4-basic-design/configuration-revision-integrity.json` | S13:147 `/document_id` = `HELIXSECURITY-L4-004`; S13:149 `/pair` = `L9` |
| S14 | HELIXSECURITY-L2-004 / L9 | `docs/helix-security/L9-integration-verification/configuration-revision-integrity.json` | S14:147 `/document_id` = `HELIXSECURITY-L9-004`; S14:149 `/pair` = `L4` |
| S15 | HELIXSECURITY-L2-004 / L5 | `docs/helix-security/L5-detail-design/configuration-revision-integrity.json` | S15:236 `/document_id` = `HELIXSECURITY-L5-004`; S15:238 `/paired_document` = `HELIXSECURITY-L8-004` |
| S16 | HELIXSECURITY-L2-004 / L8 | `docs/helix-security/L8-unit-verification/configuration-revision-integrity.json` | S16:236 `/document_id` = `HELIXSECURITY-L8-004`; S16:238 `/paired_document` = `HELIXSECURITY-L5-004` |
| S17 | HELIXSECURITY-L2-005 / L4 | `docs/helix-security/L4-basic-design/credential-value-boundary.json` | S17:157 `/document_id` = `HELIXSECURITY-L4-005`; S17:159 `/pair` = `L9` |
| S18 | HELIXSECURITY-L2-005 / L9 | `docs/helix-security/L9-integration-verification/credential-value-boundary.json` | S18:157 `/document_id` = `HELIXSECURITY-L9-005`; S18:159 `/pair` = `L4` |
| S19 | HELIXSECURITY-L2-005 / L5 | `docs/helix-security/L5-detail-design/credential-value-boundary.json` | S19:802 `/document_id` = `HELIXSECURITY-L5-005`; S19:804 `/pair` = `L8` |
| S20 | HELIXSECURITY-L2-005 / L8 | `docs/helix-security/L8-unit-verification/credential-value-boundary.json` | S20:802 `/document_id` = `HELIXSECURITY-L8-005`; S20:804 `/pair` = `L5` |
| S21 | HELIXSECURITY-L2-006 / L4 | `docs/helix-security/L4-basic-design/network-egress-boundary.json` | S21:161 `/document_id` = `HELIXSECURITY-L4-006`; S21:163 `/pair` = `L9` |
| S22 | HELIXSECURITY-L2-006 / L9 | `docs/helix-security/L9-integration-verification/network-egress-boundary.json` | S22:161 `/document_id` = `HELIXSECURITY-L9-006`; S22:163 `/pair` = `L4` |
| S23 | HELIXSECURITY-L2-006 / L5 | `docs/helix-security/L5-detail-design/network-egress-boundary.json` | S23:1548 `/document_id` = `HELIXSECURITY-L5-006-NETWORK-EGRESS-BOUNDARY`; S23:1550 `/pair` = `L8` |
| S24 | HELIXSECURITY-L2-006 / L8 | `docs/helix-security/L8-unit-verification/network-egress-boundary.json` | S24:1548 `/document_id` = `HELIXSECURITY-L8-006-NETWORK-EGRESS-BOUNDARY`; S24:1550 `/pair` = `L5` |
| S25 | HELIXSECURITY-L2-007 / L4 | `docs/helix-security/L4-basic-design/worker-control-enforcement.json` | S25:197 `/document_id` = `HELIXSECURITY-L4-007`; S25:199 `/pair` = `L9` |
| S26 | HELIXSECURITY-L2-007 / L9 | `docs/helix-security/L9-integration-verification/worker-control-enforcement.json` | S26:197 `/document_id` = `HELIXSECURITY-L9-007`; S26:199 `/pair` = `L4` |
| S27 | HELIXSECURITY-L2-007 / L5 | `docs/helix-security/L5-detail-design/worker-control-enforcement.json` | S27:898 `/document_id` = `HELIXSECURITY-L5-007`; S27:900 `/pair` = `L8` |
| S28 | HELIXSECURITY-L2-007 / L8 | `docs/helix-security/L8-unit-verification/worker-control-enforcement.json` | S28:898 `/document_id` = `HELIXSECURITY-L8-007`; S28:900 `/pair` = `L5` |
| S29 | HELIXSECURITY-L2-008 / L4 | `docs/helix-security/L4-basic-design/operation-authority-reuse.json` | S29:197 `/document_id` = `HELIXSECURITY-L4-008`; S29:199 `/pair` = `L9` |
| S30 | HELIXSECURITY-L2-008 / L9 | `docs/helix-security/L9-integration-verification/operation-authority-reuse.json` | S30:197 `/document_id` = `HELIXSECURITY-L9-008`; S30:199 `/pair` = `L4` |
| S31 | HELIXSECURITY-L2-008 / L5 | `docs/helix-security/L5-detail-design/operation-authority-reuse.json` | S31:415 `/document_id` = `HELIXSECURITY-L5-008`; S31:417 `/pair` = `L8` |
| S32 | HELIXSECURITY-L2-008 / L8 | `docs/helix-security/L8-unit-verification/operation-authority-reuse.json` | S32:415 `/document_id` = `HELIXSECURITY-L8-008`; S32:417 `/pair` = `L5` |
| S33 | HELIXSECURITY-L2-009 / L4 | `docs/helix-security/L4-basic-design/revoke-quarantine-propagation.json` | S33:207 `/document_id` = `HELIXSECURITY-L4-009`; S33:209 `/pair` = `L9` |
| S34 | HELIXSECURITY-L2-009 / L9 | `docs/helix-security/L9-integration-verification/revoke-quarantine-propagation.json` | S34:207 `/document_id` = `HELIXSECURITY-L9-009`; S34:209 `/pair` = `L4` |
| S35 | HELIXSECURITY-L2-009 / L5 | `docs/helix-security/L5-detail-design/revoke-quarantine-propagation.json` | S35:25 `/document_id` = `HELIXSECURITY-L5-009`; S35:28 `/pair` = `L5/L8` |
| S36 | HELIXSECURITY-L2-009 / L8 | `docs/helix-security/L8-unit-verification/revoke-quarantine-propagation.json` | S36:25 `/document_id` = `HELIXSECURITY-L8-009`; S36:28 `/pair` = `L5/L8` |
| S37 | HELIXSECURITY-L2-015 / L4 | `docs/helix-security/L4-basic-design/asset-identity-foundation.json` | S37:138 `/document_id` = `HELIXSECURITY-L4-015-BASIC-DESIGN`; S37:140 `/pair` = `L9` |
| S38 | HELIXSECURITY-L2-015 / L9 | `docs/helix-security/L9-integration-verification/asset-identity-foundation.json` | S38:138 `/document_id` = `HELIXSECURITY-L9-015-INTEGRATION-VERIFICATION`; S38:140 `/pair` = `L4` |
| S39 | HELIXSECURITY-L2-015 / L5 | `docs/helix-security/L5-detail-design/asset-identity-foundation.json` | S39:1420 `/document_id` = `HELIXSECURITY-L5-015-DETAIL-DESIGN`; S39:1423 `/pair` = `L8` |
| S40 | HELIXSECURITY-L2-015 / L8 | `docs/helix-security/L8-unit-verification/asset-identity-foundation.json` | S40:1412 `/document_id` = `HELIXSECURITY-L8-015-UNIT-VERIFICATION`; S40:1415 `/pair` = `L5` |
| S41 | HELIXSECURITY-L2-016 / L4 | `docs/helix-security/L4-basic-design/data-use-classification.json` | S41:2 `/document_id` = `HELIXSECURITY-L4-016-BASIC-DESIGN`; S41:6 `/pair` = `L9` |
| S42 | HELIXSECURITY-L2-016 / L9 | `docs/helix-security/L9-integration-verification/data-use-classification.json` | S42:2 `/document_id` = `HELIXSECURITY-L9-016-INTEGRATION-VERIFICATION`; S42:6 `/pair` = `L4` |
| S43 | HELIXSECURITY-L2-016 / L5 | `docs/helix-security/L5-detail-design/data-use-classification.json` | S43:726 `/document_id` = `HELIXSECURITY-L5-016`; S43:728 `/pair` = `L8` |
| S44 | HELIXSECURITY-L2-016 / L8 | `docs/helix-security/L8-unit-verification/data-use-classification.json` | S44:726 `/document_id` = `HELIXSECURITY-L8-016`; S44:728 `/pair` = `L5` |
| S45 | HELIXSECURITY-L2-024 / L4 | `docs/helix-security/L4-basic-design/policy-resource-enforcement-boundary.json` | S45:2 `/id` = `HELIXSECURITY-L4-024-BASIC-DESIGN`; S45:4 `/pair_id` = `HELIXSECURITY-L4L9-024-POLICY-RESOURCE-ENFORCEMENT` |
| S46 | HELIXSECURITY-L2-024 / L9 | `docs/helix-security/L9-integration-verification/policy-resource-enforcement-boundary.json` | S46:2 `/id` = `HELIXSECURITY-L9-024-INTEGRATION-VERIFICATION`; S46:4 `/pair_id` = `HELIXSECURITY-L4L9-024-POLICY-RESOURCE-ENFORCEMENT` |
| S47 | HELIXSECURITY-L2-024 / L5 | `docs/helix-security/L5-detail-design/policy-resource-enforcement-boundary.json` | S47:308 `/document_id` = `HELIXSECURITY-L5-024-DETAIL-DESIGN`; S47:310 `/pair` = `HELIXSECURITY-L5L8-024-POLICY-RESOURCE-ENFORCEMENT` |
| S48 | HELIXSECURITY-L2-024 / L8 | `docs/helix-security/L8-unit-verification/policy-resource-enforcement-boundary.json` | S48:308 `/document_id` = `HELIXSECURITY-L8-024-UNIT-VERIFICATION`; S48:310 `/pair` = `HELIXSECURITY-L5L8-024-POLICY-RESOURCE-ENFORCEMENT` |

## pair別source参照と分類候補

最終列は固定入力JSONの値位置lineとJSON Pointer。各層の参照はsource alias・値位置line・JSON Pointerを併記する。L9の2本目は同一entryのL10実参照で、8組で値一致。2本目を記さない27組は、選択case内の直接L10参照未確認を意味する。003の別source-level scopeにある対参照は判定根拠で区別して示す。

| index | parent / L3 → L10 | L4 basic | L9 basic | L5 detail | L8 detail | basic (L4/L9) | detail (L5/L8) | audit lines |
|---:|---|---|---|---|---|---|---|---|---|
| 370 | HELIXSECURITY-L2-001 `HELIXSECURITY-L3-001-F01` → `HELIXSECURITY-L10-001-F01` | S1:192 `/contracts/0/requirement_ref` | S2:194 `/cases/0/requirement_ref` ← S2:195 `/cases/0/system_oracle_ref` | S3:1024 `/functions/0/requirement_refs/0`(+1) | S4:518 `/reference_unit_cases/0/requirement_ref`(+36) | ③ | ②[S3:210] | AUDIT:17498 `/pairs/370/requirement/entry/id`; 17511 `/pairs/370/oracle/entry/id` |
| 371 | HELIXSECURITY-L2-001 `HELIXSECURITY-L3-001-F02` → `HELIXSECURITY-L10-001-F02` | S1:221 `/contracts/1/requirement_ref` | S2:2561 `/cases/1/requirement_ref` ← S2:2562 `/cases/1/system_oracle_ref` | S3:1025 `/functions/0/requirement_refs/1`(+1) | S4:1449 `/reference_unit_cases/37/requirement_ref`(+230) | ③ | ②[S3:210] | AUDIT:17538 `/pairs/371/requirement/entry/id`; 17551 `/pairs/371/oracle/entry/id` |
| 372 | HELIXSECURITY-L2-002 `HELIXSECURITY-L3-002-F01` → `HELIXSECURITY-L10-002-F01` | S5:171 `/contracts/0/requirement_ref` | S6:171 `/cases/0/requirement_refs/0`(+57) | S7:821 `/functions/0/requirement_refs/0` | S8:381 `/unit_cases/0/requirement_trace/0`(+57) | ③ | ③ | AUDIT:17578 `/pairs/372/requirement/entry/id`; 17591 `/pairs/372/oracle/entry/id` |
| 373 | HELIXSECURITY-L2-002 `HELIXSECURITY-L3-002-N01` → `HELIXSECURITY-L10-002-N01` | S5:200 `/contracts/1/requirement_ref` | S6:172 `/cases/0/requirement_refs/1`(+57) | S7:905 `/functions/1/requirement_refs/0` | S8:382 `/unit_cases/0/requirement_trace/1`(+57) | ③ | ③ | AUDIT:17618 `/pairs/373/requirement/entry/id`; 17631 `/pairs/373/oracle/entry/id` |
| 374 | HELIXSECURITY-L2-003 `HELIXSECURITY-L3-003-F01` → `HELIXSECURITY-L10-003-F01` | S9:157 `/contracts/0/requirement_ref` | S10:204 `/cases/0/requirement_refs/0`(+204) | S11:3204 `/functions/0/requirement_refs/0`(+10) | S12:178641 `/contracts/0/requirement_ref` | ②[S10:29661] | ②[S11:1963] | AUDIT:17658 `/pairs/374/requirement/entry/id`; 17671 `/pairs/374/oracle/entry/id` |
| 375 | HELIXSECURITY-L2-003 `HELIXSECURITY-L3-003-F02` → `HELIXSECURITY-L10-003-F02` | S9:185 `/contracts/1/requirement_ref` | S10:205 `/cases/0/requirement_refs/1`(+204) | S11:3205 `/functions/0/requirement_refs/1`(+10) | S12:178734 `/contracts/1/requirement_ref` | ②[S10:29661] | ②[S11:1963] | AUDIT:17698 `/pairs/375/requirement/entry/id`; 17711 `/pairs/375/oracle/entry/id` |
| 376 | HELIXSECURITY-L2-004 `HELIXSECURITY-L3-004-F01` → `HELIXSECURITY-L10-004-F01` | S13:166 `/contracts/0/requirement_ref` | S14:214 `/cases/0/requirement_refs/0`(+365) | S15:539 `/functions/0/requirement_refs/0`(+1) | S16:273 `/pair_cases/0/requirement_ref` | ③ | ③ | AUDIT:17738 `/pairs/376/requirement/entry/id`; 17751 `/pairs/376/oracle/entry/id` |
| 377 | HELIXSECURITY-L2-004 `HELIXSECURITY-L3-004-N01` → `HELIXSECURITY-L10-004-N01` | S13:194 `/contracts/1/requirement_ref` | S14:215 `/cases/0/requirement_refs/1`(+365) | S15:540 `/functions/0/requirement_refs/1`(+1) | S16:1018 `/pair_cases/1/requirement_ref` | ③ | ③ | AUDIT:17778 `/pairs/377/requirement/entry/id`; 17791 `/pairs/377/oracle/entry/id` |
| 378 | HELIXSECURITY-L2-005 `HELIXSECURITY-L3-005-B01` → `HELIXSECURITY-L10-005-B01` | S17:234 `/contracts/2/requirement_ref` | S18:219 `/cases/0/requirement_refs/2`(+86) | S19:1891 `/functions/0/requirement_refs/2`(+11) | S20:166337 `/contracts/2/requirement_ref` | ③ | ②[S19:799] | AUDIT:17818 `/pairs/378/requirement/entry/id`; 17831 `/pairs/378/oracle/entry/id` |
| 379 | HELIXSECURITY-L2-005 `HELIXSECURITY-L3-005-F01` → `HELIXSECURITY-L10-005-F01` | S17:177 `/contracts/0/requirement_ref` | S18:217 `/cases/0/requirement_refs/0`(+86) | S19:1889 `/functions/0/requirement_refs/0`(+9) | S20:166222 `/contracts/0/requirement_ref` | ③ | ②[S19:799] | AUDIT:17858 `/pairs/379/requirement/entry/id`; 17871 `/pairs/379/oracle/entry/id` |
| 380 | HELIXSECURITY-L2-005 `HELIXSECURITY-L3-005-F02` → `HELIXSECURITY-L10-005-F02` | S17:206 `/contracts/1/requirement_ref` | S18:218 `/cases/0/requirement_refs/1`(+86) | S19:1890 `/functions/0/requirement_refs/1`(+7) | S20:166288 `/contracts/1/requirement_ref` | ③ | ②[S19:799] | AUDIT:17898 `/pairs/380/requirement/entry/id`; 17911 `/pairs/380/oracle/entry/id` |
| 381 | HELIXSECURITY-L2-006 `HELIXSECURITY-L3-006-F01` → `HELIXSECURITY-L10-006-F01` | S21:181 `/contracts/0/requirement_ref` | S22:216 `/cases/0/requirement_refs/0`(+117) | S23:3092 `/functions/0/requirement_refs/0`(+9) | S24:4922 `/cases/0/requirement_refs/0`(+62) | ③ | ②[S23:1546] | AUDIT:17938 `/pairs/381/requirement/entry/id`; 17951 `/pairs/381/oracle/entry/id` |
| 382 | HELIXSECURITY-L2-006 `HELIXSECURITY-L3-006-F02` → `HELIXSECURITY-L10-006-F02` | S21:209 `/contracts/1/requirement_ref` | S22:217 `/cases/0/requirement_refs/1`(+117) | S23:3093 `/functions/0/requirement_refs/1`(+8) | S24:4923 `/cases/0/requirement_refs/1`(+49) | ③ | ②[S23:1546] | AUDIT:17978 `/pairs/382/requirement/entry/id`; 17991 `/pairs/382/oracle/entry/id` |
| 383 | HELIXSECURITY-L2-007 `HELIXSECURITY-L3-007-F01` → `HELIXSECURITY-L10-007-F01` | S25:226 `/contracts/0/requirement_ref` | S26:284 `/cases/0/requirement_refs/0`(+420) | S27:3018 `/contracts/0/requirement_ref` | S28:3904 `/pair_cases/0/requirement_ref` | ③ | ②[S27:3413] | AUDIT:18018 `/pairs/383/requirement/entry/id`; 18031 `/pairs/383/oracle/entry/id` |
| 384 | HELIXSECURITY-L2-007 `HELIXSECURITY-L3-007-F02` → `HELIXSECURITY-L10-007-F02` | S25:242 `/contracts/1/requirement_ref` | S26:285 `/cases/0/requirement_refs/1`(+420) | S27:3051 `/contracts/1/requirement_ref` | S28:3941 `/pair_cases/1/requirement_ref` | ③ | ②[S27:3413] | AUDIT:18058 `/pairs/384/requirement/entry/id`; 18071 `/pairs/384/oracle/entry/id` |
| 385 | HELIXSECURITY-L2-007 `HELIXSECURITY-L3-007-F03` → `HELIXSECURITY-L10-007-F03` | S25:258 `/contracts/2/requirement_ref` | S26:286 `/cases/0/requirement_refs/2`(+420) | S27:3085 `/contracts/2/requirement_ref` | S28:3965 `/pair_cases/2/requirement_ref` | ③ | ②[S27:3413] | AUDIT:18098 `/pairs/385/requirement/entry/id`; 18111 `/pairs/385/oracle/entry/id` |
| 386 | HELIXSECURITY-L2-007 `HELIXSECURITY-L3-007-F04` → `HELIXSECURITY-L10-007-F04` | S25:274 `/contracts/3/requirement_ref` | S26:287 `/cases/0/requirement_refs/3`(+420) | S27:3119 `/contracts/3/requirement_ref` | S28:3986 `/pair_cases/3/requirement_ref` | ③ | ②[S27:3413] | AUDIT:18138 `/pairs/386/requirement/entry/id`; 18151 `/pairs/386/oracle/entry/id` |
| 387 | HELIXSECURITY-L2-007 `HELIXSECURITY-L3-007-F05` → `HELIXSECURITY-L10-007-F05` | S25:290 `/contracts/4/requirement_ref` | S26:288 `/cases/0/requirement_refs/4`(+420) | S27:3153 `/contracts/4/requirement_ref` | S28:4007 `/pair_cases/4/requirement_ref` | ③ | ②[S27:3413] | AUDIT:18178 `/pairs/387/requirement/entry/id`; 18191 `/pairs/387/oracle/entry/id` |
| 388 | HELIXSECURITY-L2-007 `HELIXSECURITY-L3-007-F06` → `HELIXSECURITY-L10-007-F06` | S25:306 `/contracts/5/requirement_ref` | S26:289 `/cases/0/requirement_refs/5`(+420) | S27:3187 `/contracts/5/requirement_ref` | S28:4029 `/pair_cases/5/requirement_ref` | ③ | ②[S27:3413] | AUDIT:18218 `/pairs/388/requirement/entry/id`; 18231 `/pairs/388/oracle/entry/id` |
| 389 | HELIXSECURITY-L2-007 `HELIXSECURITY-L3-007-F07` → `HELIXSECURITY-L10-007-F07` | S25:322 `/contracts/6/requirement_ref` | S26:290 `/cases/0/requirement_refs/6`(+420) | S27:3221 `/contracts/6/requirement_ref` | S28:4050 `/pair_cases/6/requirement_ref` | ③ | ②[S27:3413] | AUDIT:18258 `/pairs/389/requirement/entry/id`; 18271 `/pairs/389/oracle/entry/id` |
| 390 | HELIXSECURITY-L2-007 `HELIXSECURITY-L3-007-F08` → `HELIXSECURITY-L10-007-F08` | S25:338 `/contracts/7/requirement_ref` | S26:291 `/cases/0/requirement_refs/7`(+420) | S27:3255 `/contracts/7/requirement_ref` | S28:4070 `/pair_cases/7/requirement_ref` | ③ | ②[S27:3413] | AUDIT:18298 `/pairs/390/requirement/entry/id`; 18311 `/pairs/390/oracle/entry/id` |
| 391 | HELIXSECURITY-L2-007 `HELIXSECURITY-L3-007-F09` → `HELIXSECURITY-L10-007-F09` | S25:354 `/contracts/8/requirement_ref` | S26:292 `/cases/0/requirement_refs/8`(+420) | S27:3289 `/contracts/8/requirement_ref` | S28:4092 `/pair_cases/8/requirement_ref` | ③ | ②[S27:3413] | AUDIT:18338 `/pairs/391/requirement/entry/id`; 18351 `/pairs/391/oracle/entry/id` |
| 392 | HELIXSECURITY-L2-007 `HELIXSECURITY-L3-007-F10` → `HELIXSECURITY-L10-007-F10` | S25:370 `/contracts/9/requirement_ref` | S26:293 `/cases/0/requirement_refs/9`(+420) | S27:3323 `/contracts/9/requirement_ref` | S28:4117 `/pair_cases/9/requirement_ref` | ③ | ②[S27:3413] | AUDIT:18378 `/pairs/392/requirement/entry/id`; 18391 `/pairs/392/oracle/entry/id` |
| 393 | HELIXSECURITY-L2-007 `HELIXSECURITY-L3-007-N01` → `HELIXSECURITY-L10-007-N01` | S25:386 `/contracts/10/requirement_ref` | S26:294 `/cases/0/requirement_refs/10`(+420) | S27:3357 `/contracts/10/requirement_ref` | S28:4140 `/pair_cases/10/requirement_ref` | ③ | ②[S27:3413] | AUDIT:18418 `/pairs/393/requirement/entry/id`; 18431 `/pairs/393/oracle/entry/id` |
| 394 | HELIXSECURITY-L2-008 `HELIXSECURITY-L3-008-B01` → `HELIXSECURITY-L10-008-B01` | S29:218 `/contracts/0/requirement_ref` | S30:254 `/cases/0/requirement_refs/0`(+640) | S31:828 `/contracts/0/requirement_ref` | S32:2625 `/pair_cases/0/requirement_ref` | ③ | ②[S31:939] | AUDIT:18458 `/pairs/394/requirement/entry/id`; 18471 `/pairs/394/oracle/entry/id` |
| 395 | HELIXSECURITY-L2-008 `HELIXSECURITY-L3-008-F01` → `HELIXSECURITY-L10-008-F01` | S29:234 `/contracts/1/requirement_ref` | S30:255 `/cases/0/requirement_refs/1`(+640) | S31:862 `/contracts/1/requirement_ref` | S32:2696 `/pair_cases/1/requirement_ref` | ③ | ②[S31:939] | AUDIT:18498 `/pairs/395/requirement/entry/id`; 18511 `/pairs/395/oracle/entry/id` |
| 396 | HELIXSECURITY-L2-009 `HELIXSECURITY-L3-009-B01` → `HELIXSECURITY-L10-009-B01` | S33:229 `/contracts/0/requirement_ref` | S34:1988 `/cases/0/requirement_refs/0`(+355) | S35:1380 `/contracts/0/requirement_ref` | S36:1062 `/pair_cases/0/requirement_ref` | ③ | ③ | AUDIT:18538 `/pairs/396/requirement/entry/id`; 18551 `/pairs/396/oracle/entry/id` |
| 397 | HELIXSECURITY-L2-009 `HELIXSECURITY-L3-009-F01` → `HELIXSECURITY-L10-009-F01` | S33:244 `/contracts/1/requirement_ref` | S34:1989 `/cases/0/requirement_refs/1`(+355) | S35:1390 `/contracts/1/requirement_ref` | S36:1785 `/pair_cases/1/requirement_ref` | ③ | ③ | AUDIT:18578 `/pairs/397/requirement/entry/id`; 18591 `/pairs/397/oracle/entry/id` |
| 398 | HELIXSECURITY-L2-009 `HELIXSECURITY-L3-009-F02` → `HELIXSECURITY-L10-009-F02` | S33:259 `/contracts/2/requirement_ref` | S34:1990 `/cases/0/requirement_refs/2`(+355) | S35:1401 `/contracts/2/requirement_ref` | S36:2508 `/pair_cases/2/requirement_ref` | ③ | ③ | AUDIT:18618 `/pairs/398/requirement/entry/id`; 18631 `/pairs/398/oracle/entry/id` |
| 399 | HELIXSECURITY-L2-015 `HELIXSECURITY-L3-015-B01` → `HELIXSECURITY-L10-015-B01` | S37:174 `/contracts/1/requirement_trace/0` | S38:325 `/cases/0/requirement_trace/0`(+3) ← S38:326 `/cases/0/requirement_trace/1` | S39:1232 `/branch_oracles/0/requirement_trace/0`(+3) ← S39:1233 `/branch_oracles/0/requirement_trace/1` | S40:1478 `/unit_cases/0/requirement_trace/0`(+3) ← S40:1479 `/unit_cases/0/requirement_trace/1` | ③ | ③ | AUDIT:18658 `/pairs/399/requirement/entry/id`; 18671 `/pairs/399/oracle/entry/id` |
| 400 | HELIXSECURITY-L2-015 `HELIXSECURITY-L3-015-F01` → `HELIXSECURITY-L10-015-F01` | S37:163 `/contracts/0/requirement_trace/0`(+1) | S38:618 `/cases/1/requirement_trace/0`(+3) ← S38:619 `/cases/1/requirement_trace/1` | S39:1327 `/branch_oracles/4/requirement_trace/0`(+3) ← S39:1328 `/branch_oracles/4/requirement_trace/1` | S40:5831 `/unit_cases/4/requirement_trace/0`(+7) ← S40:5832 `/unit_cases/4/requirement_trace/1` | ③ | ③ | AUDIT:18698 `/pairs/400/requirement/entry/id`; 18711 `/pairs/400/oracle/entry/id` |
| 401 | HELIXSECURITY-L2-016 `HELIXSECURITY-L3-016-B01` → `HELIXSECURITY-L10-016-B01` | S41:298 `/contracts/0/requirement_ref` | S42:906 `/cases/0/requirement_ref`(+3) ← S42:909 `/cases/0/system_oracle_ref` | S43:1855 `/functions/0/requirement_refs/1`(+5) | S44:85225 `/contracts/0/requirement_ref` | ③ | ②[S43:721] | AUDIT:18738 `/pairs/401/requirement/entry/id`; 18751 `/pairs/401/oracle/entry/id` |
| 402 | HELIXSECURITY-L2-016 `HELIXSECURITY-L3-016-F01` → `HELIXSECURITY-L10-016-F01` | S41:320 `/contracts/1/requirement_ref` | S42:1178 `/cases/1/requirement_ref`(+4) ← S42:1181 `/cases/1/system_oracle_ref` | S43:1854 `/functions/0/requirement_refs/0`(+11) | S44:85248 `/contracts/1/requirement_ref` | ③ | ②[S43:721] | AUDIT:18778 `/pairs/402/requirement/entry/id`; 18791 `/pairs/402/oracle/entry/id` |
| 403 | HELIXSECURITY-L2-024 `HELIXSECURITY-L3-024-B01` → `HELIXSECURITY-L10-024-B01` | S45:50 `/contracts/0/requirement_ref` | S46:283 `/positive_cases/0/requirement_trace/0` ← S46:284 `/positive_cases/0/requirement_trace/1` | S47:658 `/functions/0/requirement_refs/0`(+1) | S48:6536 `/contracts/0/requirement_ref` | ③ | ③ | AUDIT:18818 `/pairs/403/requirement/entry/id`; 18831 `/pairs/403/oracle/entry/id` |
| 404 | HELIXSECURITY-L2-024 `HELIXSECURITY-L3-024-F01` → `HELIXSECURITY-L10-024-F01` | S45:73 `/contracts/1/requirement_ref` | S46:385 `/positive_cases/1/requirement_trace/0` ← S46:386 `/positive_cases/1/requirement_trace/1` | S47:659 `/functions/0/requirement_refs/1`(+1) | S48:6559 `/contracts/1/requirement_ref` | ③ | ③ | AUDIT:18858 `/pairs/404/requirement/entry/id`; 18871 `/pairs/404/oracle/entry/id` |

## 親別件数

| parent | 組 | basic ②/③ | basic ② child IDs | detail ② child IDs | detail ②/③ |
|---|---:|---:|---|---|---:|
| HELIXSECURITY-L2-001 | 2 | 0/2 | なし | HELIXSECURITY-L3-001-F01, HELIXSECURITY-L3-001-F02 | 2/0 |
| HELIXSECURITY-L2-002 | 2 | 0/2 | なし | なし | 0/2 |
| HELIXSECURITY-L2-003 | 2 | 2/0 | HELIXSECURITY-L3-003-F01, HELIXSECURITY-L3-003-F02 | HELIXSECURITY-L3-003-F01, HELIXSECURITY-L3-003-F02 | 2/0 |
| HELIXSECURITY-L2-004 | 2 | 0/2 | なし | なし | 0/2 |
| HELIXSECURITY-L2-005 | 3 | 0/3 | なし | HELIXSECURITY-L3-005-B01, HELIXSECURITY-L3-005-F01, HELIXSECURITY-L3-005-F02 | 3/0 |
| HELIXSECURITY-L2-006 | 2 | 0/2 | なし | HELIXSECURITY-L3-006-F01, HELIXSECURITY-L3-006-F02 | 2/0 |
| HELIXSECURITY-L2-007 | 11 | 0/11 | なし | HELIXSECURITY-L3-007-F01, HELIXSECURITY-L3-007-F02, HELIXSECURITY-L3-007-F03, HELIXSECURITY-L3-007-F04, HELIXSECURITY-L3-007-F05, HELIXSECURITY-L3-007-F06, HELIXSECURITY-L3-007-F07, HELIXSECURITY-L3-007-F08, HELIXSECURITY-L3-007-F09, HELIXSECURITY-L3-007-F10, HELIXSECURITY-L3-007-N01 | 11/0 |
| HELIXSECURITY-L2-008 | 2 | 0/2 | なし | HELIXSECURITY-L3-008-B01, HELIXSECURITY-L3-008-F01 | 2/0 |
| HELIXSECURITY-L2-009 | 3 | 0/3 | なし | なし | 0/3 |
| HELIXSECURITY-L2-015 | 2 | 0/2 | なし | なし | 0/2 |
| HELIXSECURITY-L2-016 | 2 | 0/2 | なし | HELIXSECURITY-L3-016-B01, HELIXSECURITY-L3-016-F01 | 2/0 |
| HELIXSECURITY-L2-024 | 2 | 0/2 | なし | なし | 0/2 |
| **計** | **35** | **2/33** | | | **24/11** |

①④⑤は基本・詳細とも0件。基本②2・③33、詳細②24・③11。

## 凍結記録の分類根拠と境界

- 固定48 layer JSONの全階層で `remaining/pending/unclosed/unfixed/unobserved` と freeze/frozen/凍結/未固定/未凍結等のkey/valueを検索し、候補ごとに実scopeと文脈を読んだ。単語や残件の存在だけでは②にしない。①〜⑤の意味は凡例に従い、記録未確認は不存在の断定ではない。
- Basic②はSEC003 F01/F02のみ。S10:29481 `/owner_context_port_conditions/status` は「source-level対照条件。入力/expected whole freeze、候補実行、runtime観測ではない。」、S10:29661 `/owner_context_port_conditions/not_established/0` は条件入力とexpected wholeの未固定を記す。S10:29483 `/owner_context_port_conditions/requirement_refs/0` とS10:29484 `/owner_context_port_conditions/requirement_refs/1` が両pairを特定し、S10:29493 `/owner_context_port_conditions/current_l4_binding/pointer` はL4 S9:276 `/private_composition_contracts/1` に結ぶ。L4/L9の他sourceは同じ層の凍結未成立をpair scopeで明示せず③。
- SEC002基本のS5:148 `/remaining/1` とS6:148 `/remaining/1` は、全不正shape・正本schema/codec・001/016分類・008authorityの独立接続と全oracle凍結を横断列挙する。現L4/L9のF01/N01別freeze状態を示すnamed記録とは確認できないため、372/373は③を保つ。
- Detail②は当該L5/L8文書の実装前test/oracle freeze未成立を明記する24組。001: S3:210 `/remaining/2` とS4:210 `/remaining/2`（2組）、003: S11:1963 `/completion_limit/3` とS12:1963 `/completion_limit/3`（2組）、005: S19:799 `/completion_limit/4` とS20:799 `/completion_limit/4`（3組）、006: S23:1546 `/remaining/2` とS24:1546 `/remaining/2`（2組）、007: S27:3413 `/remaining/3` とS28:4238 `/remaining/3`（11組）、008: S31:939 `/remaining/3` とS32:2786 `/remaining/3`（2組）、016: S43:721 `/completion_limit/3` とS44:721 `/completion_limit/3`（2組）。文書のactual child refsはpair表に示す。
- 007/008の「層外実装前test/oracle凍結…未成立」は、003/005/006/016の「実装成果は層外。その前の凍結…未成立」と同じ未成立記録として扱う。B2で除いたOS017/019/020の前提素材・実TDDではないという工程説明とは、凍結自体を未成立と明記する点が異なる。全92親430対の閉包等は②の根拠にせず、当該source-localなfreeze句とchild refsを根拠にする。003のS11:5706 `/owner_context_detail_contract/verification_boundary` は当該算法の有限raw/expectedとwhole branch closureの限界を補足する。004/009/015/024の部分期待・実行準備・外部接続等の残件は、それ自体ではpair層の未凍結証拠にならず③。
- 部分固定は全pair凍結へ拡張しない。003 S12:179265 `/same_frame_invocation_contract/cases/0/freeze_lineage`（15ケースのうち先頭の記録）、S12:200292 `/owner_context_binding_verification/pre_freeze_lineage`、004 S16:130186 `/expectation_freeze`（finite expected input）、005 S20:114635 `/cases/61/oracle_basis/0`（15 root NORMAL）、006 S24:73804 `/cases/86/oracle_basis/0`、008 S32:2772 `/fixture_contract/expected_freeze`、016 S44:731 `/oracle_contract/freeze_basis` は部分的な材料/期待の記録。
- 015のL5 child refは未確認ではない。S39:1232 `/branch_oracles/0/requirement_trace/0` (+3同shape) とS39:1233 `/branch_oracles/0/requirement_trace/1`の同entry L10 refがB01を結び、S39:1327 `/branch_oracles/4/requirement_trace/0` (+3同shape) とS39:1328 `/branch_oracles/4/requirement_trace/1`がF01を結ぶ。L8も表のS40 `/unit_cases/0`・`/unit_cases/4`の同一entryでL3/L10が対応する。L5のbranch oracle内のtraceであり、純粋関数間の直接edgeを証明するものではない。参照存在はfreeze状態①を意味しないためdetailは③。
- 監査入力は `/pairs/{index}/requirement/entry/id` と `/pairs/{index}/oracle/entry/id` のID値開始行を使う。source alias表は固定BASEのpathと正本にある文書識別・対情報の実fieldを列挙する。024基本対は`document_id`ではなく`id`・`pair_id`であり、field名を推定して補わない。artifact不在と子参照未確認を区別する。
- SECURITY 35/405のみを本監査で扱う。HARNESS 126、OS 79、BRAIN 70は別監査、Cの残り95組は未監査。これは意味適合・設計承認・freeze gate・実装許可を生成せず、#3545全405組の完了でもない。
