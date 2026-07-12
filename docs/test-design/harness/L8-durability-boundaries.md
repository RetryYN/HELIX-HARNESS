---
layer: L8
sub_doc: unit-test-design
status: confirmed
pair_artifact: docs/design/harness/L6-function-design/durability-boundaries.md
plan: docs/plans/PLAN-L6-78-durability-boundary-design.md
---

# durability boundaries テスト・検証設計

| U-ID      | 対象                  | 反例と期待結果                                                                                     | test citation                                |
| --------- | --------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| U-DUR-001 | cause kind/digest     | Error/string/object/primitiveを有限kindとtyped SHA-256へ写し、同値入力はstable                     | `tests/doctor-cause-digest.test.ts`          |
| U-DUR-002 | hostile cause         | Proxy trap、throwing getter/toString、cycle、巨大値でもthrowせず`inaccessible`またはbounded digest | `tests/doctor-cause-digest.test.ts`          |
| U-DUR-003 | static ratchet        | doctorのanonymous cause-dropping catchとraw cause interpolationをallowlist外で0件にする            | `tests/doctor-cause-digest-contract.test.ts` |
| U-DUR-004 | read classification   | absent、invalid、orphan、live/stale claim、残留claim付きvalid manifestを9 variantへexact分類       | `tests/loop-store-durability.test.ts`        |
| U-DUR-005 | side-effect gate      | durable intent前/C5 uncertain時callback 0。gate後・completion前restartはambiguousで自動retry 0     | `tests/loop-store-durability.test.ts`        |
| U-DUR-006 | fault points          | C0-C6各境界のfailure/restartがL5 matrixどおりで未commitをauthoritativeにしない                     | `tests/loop-store-durability.test.ts`        |
| U-DUR-007 | claim/CAS concurrency | commit 1件以下。boot/PID/lease/digest変異、mutex action/digest、authority expiry、partial mutex、同時recoveryで奪取1件以下。通常writerの自動奪取0 | `tests/loop-store-durability.test.ts`、`tests/loop-store-durability-node.test.ts` |

redaction oracleはterminal/JSON/DB/artifact bytesをsecret、credential、PII、個人absolute path、raw SQL seedでscanする。
static ratchetの例外はcleanup fail-open markerと理由を同じ行に要求し、件数baselineではなく構文契約で管理する。
fault tableは各durability syscallの直前・直後を網羅し、restart read結果まで検査する。
platform oracleは`windows-latest`でnode durability suiteを実行し、hard-link atomic publish、regular file flush、
initial/second epoch pointer replacement、restartを検査する。required `harness-check`は`always()`で集約し、Windows jobが
success以外なら明示failする。このworkflow構造は`tests/harness-check-workflow.test.ts`でsilent removal/fail-openを拒否する。
trusted authority SSoT adapter未実装中はproduction recovery route 0件を正とし、plan-only packetをacceptするadapter追加を
greenとみなさない。
product oracleは`tests/durable-loop-store.test.ts`と`tests/orchestration/loop-bridge.test.ts`で、legacy source retirement、
epoch0 import、done marker、rollback拒否、dispatch前intent、worker/verifier completed resume、ambiguous callback 0、
state snapshot drift、verifier迂回finalizationを検査する。receipt oracleはlatest iteration indexだけでなくworker/verifier、
verdict、blocked reasonをstate transitionと照合し、中間orchestration stageをblocked・retry falseに固定する。
