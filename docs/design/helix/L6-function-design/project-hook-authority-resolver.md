---
title: "project hook authority pure resolver 機能設計"
layer: L6
artifact_type: design
status: confirmed
created: 2026-08-22
updated: 2026-08-22
owner: Codex / TL
plan: docs/plans/PLAN-L7-651-project-hook-authority-resolver.md
parent_design: docs/design/helix/L5-detail/project-hook-authority-schema.md
pair_artifact: docs/test-design/helix/L8-project-hook-authority-resolver-unit-test-design.md
---

# project hook authority pure resolver 機能設計

`resolveProjectHookAuthority(raw)`はunknown inputだけを受け、strict parse後にphysical identity、root digest、観測HEAD、
candidate/current authority HEAD、観測/current authority三digestを順に比較する。全比較green時だけ
`helix-project-hook-authority-receipt.v1`をcanonical JSON digest付きで返す。

failureはL5正本のprecedenceどおり`schema_invalid`、`unsupported_physical_identity`、
`project_hook_source_stale_or_foreign`、`hook_lifecycle_policy_invalid`の順に評価し、hook execution、dispatch、Git、DB、GitHub writeを
全て0とする。lexical pathはreceipt表示用に保持するがsame判定へ使わない。assignment bindingのroot digestが選択rootと一致しない場合、
session rootやprimary rootへfallbackしない。parserとresolverはclock、filesystem、process、networkを呼ばずinputを変更しない。
resolutionの`ok:false` transport envelopeは`failure`を一つ持ち、その内側は`helix-project-hook-authority-failure.v1`の
exact setである`schema_version`、`code`、`json_pointer`、
`detail_digest`、`side_effects`、`preserved_terminal_result:null`を返す。raw Zod message、path bytes、source bytesを
detailへ露出せず、stable reasonのcanonical digestだけを保持する。

`node-stat`はLinux／macOSかつ全rootの`evidence_kind=stat`、`windows-file-id`はWindowsかつ全rootの
`evidence_kind=windows-file-id`に限る。platform、capture source、evidence kindの不可能な組合せをschema greenで相殺しない。
`timeout_ms + child_termination_grace_ms`は`hard_ceiling_ms=60000`以下に限定し、timeoutとgraceを
別々に上限内へ置いて合計60秒超過を作る設定も`hook_lifecycle_policy_invalid`で拒否する。

本sliceのruntime assetは`src/runtime/project-hook-authority.ts`、実行oracleは`tests/project-hook-authority.test.ts`である。
physical capture、unsupported platform、timeout supervisor、terminal payload preservation、4 surface wiringは後続sliceが所有する。

## 明示authority input provider

`resolveProjectHookAuthorityFromProvider(provider)`はControl Plane所有の明示input providerだけを受け、
`ok:true`のinputを変更せず`resolveProjectHookAuthority`へ渡す。provider結果は`ok/input`または
`ok/reason=authority_input_unavailable`のexact setとし、unknown field、throw、malformed、取得不能は全て
`project_hook_source_stale_or_foreign`、`/authority_input`、side effect全0へ決定的に閉じる。

provider固有の例外本文、path、credentialをfailureへ入れず、cwd、環境変数、primary shared tree、remote、
`origin/main`からauthority inputを生成しない。4 surface projectorは本portの同一resolution bytesだけを受ける後続責務とする。

## 4 surface同一bytes projector

`projectProjectHookAuthoritySurfaces(resolution)`は一度だけ解決済みのsuccess receiptまたはfailureをcanonical JSONへ変換し、
`session_start`、`doctor`、`status`、`dispatch`のexact 4 keyへ同じbytesを投影する。各surfaceでresolverやserializerを
再実行せず、repair hint、互換identity、surface固有fieldを追加しない。入力resolutionを変更せず、filesystem、process、DB、
GitHub writeを持たないpure projectorとする。actual consumer wiringは後続sliceが所有する。

実装oracleのexact declarationはpair先L8 test designを正本とする。

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": [
    "schema_invalid",
    "unsupported_physical_identity",
    "project_hook_source_stale_or_foreign",
    "hook_lifecycle_policy_invalid"
  ],
  "assets": [
    "src/runtime/project-hook-authority.ts",
    "tests/project-hook-authority.test.ts"
  ],
  "failure_reachability": [
    {
      "failure_code": "schema_invalid",
      "oracle_id": "U-CNWHOOKSCHEMA-001",
      "test_path": "tests/project-hook-authority.test.ts"
    },
    {
      "failure_code": "unsupported_physical_identity",
      "oracle_id": "U-CNWHOOKSCHEMA-003",
      "test_path": "tests/project-hook-authority.test.ts"
    },
    {
      "failure_code": "hook_lifecycle_policy_invalid",
      "oracle_id": "U-CNWHOOKSCHEMA-008",
      "test_path": "tests/project-hook-authority.test.ts"
    },
    {
      "failure_code": "project_hook_source_stale_or_foreign",
      "oracle_id": "U-CNWHOOKSCHEMA-006",
      "test_path": "tests/project-hook-authority.test.ts"
    }
  ]
}
```

## Assignment kernel接続

`createAssignmentProjectHookAuthorityProvider`はControl Planeの明示Assignment snapshotを
`ProjectHookCaptureRequest`へ一方向変換する。snapshotはassignment ID、専用worktree、loader/session root、
branch、candidate/current HEAD、lease/fence、assignment root digestをexactに持つ。取得不能、schema不正、
physical capture失敗は既存`authority_input_unavailable` reasonへ閉じ、cwd、env、primary tree、origin/mainから
補完しない。既存Assignment kernelのstate machineやlease更新は本adapterの責務外とする。
