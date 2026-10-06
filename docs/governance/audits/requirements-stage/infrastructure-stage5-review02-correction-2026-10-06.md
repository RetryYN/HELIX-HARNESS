# INFRASTRUCTURE Stage 5 review02 補正記録

- 対象: PR #2622、comment `6006546472`。本文SHA-256: `841a68a1300bdc57bac0c41063c29aad4e09b261d670cf663ac747c4c8a2ca91`。
- 本文commit: `94ca245e0360ddb17fe7cbe594e554dd577dbbac`。この監査は本文と別commitにする。
- Worker時点の補正記録であり、独立reviewまたはL3承認ではない。

## 28所見の処置

- **m1** — BR range/census stale at 76 処置: BR/BV/FV/NG/NV now name 001–086 and seven format bins.
- **m2** — item 06 owner cell English 処置: Japanese owner boundary distinguishes unknown resource source from CORE design mismatch.
- **m3** — item 06 table/index/FV inconsistency 処置: 016–018 share one pre-mutation storage baseline; unparented size/location removed; network path points to item 02 path-sim-01.
- **m4** — item 03 fields and 079 placement 処置: Table/unit/079 use production_evidence fields; 079 has an environment-boundary table.
- **m5** — item 02 owner-term drift 処置: Normalized to resource source owner unknown; only declared design mismatch returns CORE.
- **m6** — item 06 owner distinction 処置: Unknown resource source owner and CORE design mismatch are separate.
- **m7** — prior audit m3/m5/m6 overclaimed fixed 処置: Prior audit immutable; current correction and historical overstatement are recorded here.
- **m8** — item 02 selectors/shape incomplete 処置: FR/FV 004–006 use nested path fields and aligned selectors/returns.
- **m9** — item 09 recovery state missing 処置: Added recovery_state to normal baseline and preserved it in related variants.
- **m10** — item 08 startup-request return omitted 処置: Added fixed L2-003:59 conditional OS/INTELLIGENCE return; no request added to fixture.
- **m11** — OS owner applicability derivation absent 処置: FR item 11 records unit fixture scope as a derivation, not L2-005:79 text; audit compares L2/L11 and OPS legacy sources.
- **m12** — invented Worker contract owner 処置: Worker contract owner is unknown when fixed parent does not name it; other named owner returns retained.
- **m13** — scope/environment conflated 処置: Separated infra stage scope and verification environment across connection/operation fixtures.
- **m14** — 059 restore result and 075 normal fixture 処置: Added restore.result; 075 explicitly normal/no mutation.
- **m15** — read-only write-set/action incomplete 処置: Existing S5-055/086 correction retained and AC/NFR state empty write-set, write denial, and read-only boundary.
- **m16** — S5-058 normal return 処置: Prior normal-no-return correction retained; unknown source owner is informational in normal fixture.
- **m17** — old L11 crosswalk mapping wrong 処置: Old audit immutable; this audit remaps 067 to actual-stage inclusion and 077–086 to actual exclusions/environment/operation clauses.
- **m18** — Worker owner mismatch item16/connectors 処置: Same correction as m12; unknown for unnamed Worker contract owner.
- **m19** — item10 input/oracle direction and state distinction 処置: 029 has explicit baseline/mutation; 030 mutates only classification source while retaining runtime state.
- **m20** — item10 baseline split 処置: FR item10 and CASE 028–030 share one literal.
- **m21** — 083/084 OS return omitted 処置: Retain single duty mutation; return to recovery design and OS work/change owners from S5-056 operation baseline.
- **m22** — 081 pending unsupported 処置: Use fixed-parent denied state.
- **m23** — FR/FV restore/067/078 baseline mismatch 処置: Aligned restore, requested_evidence, and excluded WEB runtime baseline.
- **m24** — FR 077–085 detached rows 処置: Separated 077/078, 079, and 080–086 with explicit headers.
- **m25** — connection selectors/identity mismatch 処置: 042 mutates condition; 043–045 have nested link identity and 045 mutates runtime revision only.
- **m26** — NG/NV denominator bins mismatch 処置: NFR docs use FV’s same seven format categories and total 86.
- **m27** — review01/Fable additional finding audit absent 処置: Prior m16/m17 and Fable M1 disposition added here, old audits untouched.
- **m28** — item 06 network path ref absent 処置: Item06/016–018 reference item02 path-sim-01; topology axes remain item02.

## 固定親と旧source

固定L2/L11 revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`を照合し、L2-005:76–80、L2-010:129–134、L2-011:138–147、L11-010:132–134、L11-011:144–152を確認した。旧OPS-R-02 `LEGACY-ASSET-17C4BF78919578FEBB18` 74–79行とOPS-AC-002 `LEGACY-ASSET-F46AB11BD14F2C0469F4` 26–29行はPlan/Receipt、before/after証拠の比較に使い、empty-write-setやOS owner適用除外の直接根拠とはしていない。全source file/span SHAはJSONに固定した。

OS ownerの適用範囲について、L2-005:79は復旧失敗をrecovery design owner/OSへ戻すと記すが、「OS操作要求なしなら適用外」とは述べていない。unit fixture 032/033/059–061はOS操作要求またはOS Work/Change identityを入力に持たないため、そこから特定OS ownerを識別しないのはfixture scopeに基づくL3導出であり、操作契約の免除ではない。状態変更CASE 083/084はS5-056のOS work/change参照を保持し、recovery design ownerとOS work/change ownerの両方へ戻す。

## 過去監査

review01 root/worker記録、Fable m16/m17記録、旧L11 crosswalk JSONは変更していない。067は実際にOS Stageへ収載するときだけL11:144へ対応し、077/078は後続版/WEB scope境界、079–086は環境/operation/partial-result境界へ写像する訂正を本監査に固定した。過去にm3/m5/m6をfixedと記した監査内容は当時のsnapshotとして保持し、本監査は現在の本文所見を訂正する。

## 静的確認と限界

六文書のStage 5前prefix bytesは直前本文commitと一致する。FVは001–086の86見出しで、既存001–085を保持する。BR/BV/NG/NV/FVは86件、同一の七形式区分。`git diff --check`と参照・fixture・AC/censusの静的照合を実施した。旧CLI、旧runtime、test、CIは起動せず、runtime oracleは実行していない。Fable意見は正式review commentで未取得とされ、この補正記録は独立reviewではない。
