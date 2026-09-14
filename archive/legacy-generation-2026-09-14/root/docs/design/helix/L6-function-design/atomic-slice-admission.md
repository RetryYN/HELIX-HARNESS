---
title: "Atomic Slice Admission関数設計"
layer: L6
artifact_type: design
status: confirmed
created: 2026-08-02
updated: 2026-08-02
owner: SE
plan: docs/plans/PLAN-L6-93-atomic-slice-admission.md
pair_artifact: docs/test-design/helix/L8-atomic-slice-admission-runtime-unit-test-design.md
related_l5: docs/design/helix/L5-detail/atomic-slice-admission.md
queue_id: L3Q-IT-023
---

# Atomic Slice Admission関数設計

## 1. 実装責務

`src/runtime/atomic-slice-admission.ts`は、Issue／PLAN／PR manifestと既存guardが取得したsnapshotを
副作用なしでcanonical化し、1件のadmission decisionへ合成する。GitHub API、filesystem、DB、workflow、
parser、clockを参照しない。既存`github-guards`、`ddd-tdd-rules`、PLAN lintのownerを置換せず、結果の
合成境界だけを所有する。

behavior contract IDの文法判定は`src/schema/atomic-contract-id.ts`だけが所有する。同moduleはL3 `GH-AC-043`を
2〜6個のuppercase alphanumeric segmentへ投影し、PR scope、atomic slice、Issue closureの各consumerは
`isAtomicContractId`を共有する。consumer固有regex、7 segment以上のcompatibility受理、入力値の補正は行わない。

## 2. 公開関数

| 関数 | 入力 | 正常出力 | fail-close |
|---|---|---|---|
| `canonicalizeAtomicSliceSnapshot` | `AtomicSliceSnapshot` | bytewise sort済みsnapshot | 空・重複・unsafe path・不正HEAD/digestを`invalid_intent` |
| `evaluateAtomicSlice` | snapshot、任意expansion receipt | `AtomicSliceDecision` | no-code順序、current blocker、binding、exact set、staleを全件列挙 |
| `selectAtomicSliceDesignCandidate` | 同一oracleで測った候補metrics | 最小候補とrank | oracle 100%未満、非有限・負値、duplicate IDを拒否 |

L5の`requiredCompanionSet`は既存guardが生成済みの`requiredCompanionPaths`をsnapshotで受けるため公開関数化せず、
`validateScopeExpansion`は`evaluateAtomicSlice`からだけ呼ぶprivate helperとする。parser／detectorを複製しないための縮約である。
非`admitted`時の`acceptedPaths`は回復先となるoriginal expected setを表し、追加pathは`rejectedPaths`へ分離する。

schema versionはdecision digest内部の`helix-atomic-slice.v1`とし、canonical JSONはobject keyをbytewise昇順、
arrayは意味に応じてcanonical化した後にSHA-256へ渡す。観測時刻を入力に含めない。

## 3. 評価順序

1. 全入力をcanonical化し、重複を不正として保持する。
2. `no_change → delete → configure → reuse → modify → add_code`のprefix exact一致を検査する。
3. security／data loss／correctness／authority driftのsuccessor送りを拒否する。
4. contract／responsibility／model ownerのexactly-oneとsyntaxを検査する。
5. companionとpathの双方向exact setを比較する。
6. actual追加pathだけを独立runtime・同一HEAD・同一manifest receiptで許可する。
7. recovery failureをsplitより優先し、全failureをstable順でdecision digestへ含める。

複数behavior／responsibilityとcompanion／path mismatchが同時に成立する場合は、修復不能なscopeを
分割する前にmanifestを回復させるため`recovery_required`とする。`multiple_*`を含む全failureは消さずに返し、
回復後の再評価で`split_required`へ遷移する。この組合せ規則はL5の列挙順をfailure報告順として維持しつつ、
dispositionの安全側優先を明示するL6 projectionである。

canonicalizationはduplicateを静かに除去しない。pathはrepository-relative POSIX file pathだけを許可し、
absolute、parent traversal、backslash、NUL、directory root familyを拒否する。

## 4. 設計リファクタリング

`selectAtomicSliceDesignCandidate`はoracle pass rate 100%と有限・非負の測定値を必須とする。合格候補を
候補集合の最小`candidateAdmissionP95Ms`と同値の非悪化候補だけをqualification gateで残し、その後に
`newComponentCount`、`newStateCount`、`newPersistenceSurfaceCount`、`productionLocDelta`、
`candidateAdmissionP95Ms`、IDの順で決定的にrankする。測定欠落、test除外、timeout延長で小さく見せる候補は
unqualifiedである。今回の選択は既存ownerを読むpure moduleであり、新detector、schema、state、DB table、jobは0件。

## 5. 接続とretirement

本sliceはpure moduleとoracleだけを着地させる。CLI／workflow consumerへの接続は既存guardとのdual-greenを
別の同責務sliceで行い、旧consumer削除はconsumer=0 receipt後だけにする。L5/L8成果物を本L6/L7 pairの
所有物へ変更しない。`L9-atomic-slice-admission-system-test-design.md`はPLAN-L4-59の所有を維持し、
ST-ATOMIC-011を実行可能な4観測量へ具体化するだけである。本sliceの`generates`には含めず、ownerを移さない。
