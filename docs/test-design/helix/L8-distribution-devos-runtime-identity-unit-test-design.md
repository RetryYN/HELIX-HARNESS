---
title: "DevOS distribution runtime identity L8単体テスト設計"
layer: L8
executed_at_layer: L7
artifact_type: test_design
sub_doc: unit-test-design
status: draft
created: 2026-08-23
updated: 2026-08-23
owner: QA / TL
plan: docs/plans/PLAN-L7-655-distribution-devos-runtime-identity.md
pair_artifact: docs/design/helix/L6-function-design/distribution-devos-runtime-identity.md
---

# DevOS distribution runtime identity L8単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-DISTID-001 | current identity | repository名／URL／sourceがDevOS exact setになる | `tests/distribution-identity.test.ts` |
| U-DISTID-002 | legacy adapter | 旧identity入力はwarning／converted_fromを残しcanonical outputをDevOSへ変換する | `tests/distribution-identity.test.ts` |
| U-DISTID-003 | explicit target | 別owner/repositoryを勝手にDevOSへ変換しない | `tests/distribution-identity.test.ts` |
| U-DISTID-004 | ambiguous input | owner欠落などの曖昧値をfail-closeする | `tests/distribution-identity.test.ts` |
| U-DISTID-005 | update check | package metadata／legacy cacheから旧URLをnetwork targetへ再出力しない | `tests/update-check.test.ts` |
| U-DISTID-006 | setup projection | setup／template／CI／tag pinがDevOS command bytesで一致する | `tests/setup.test.ts` |
| U-DISTID-007 | CLI projection | distribution各commandのdefault JSON outputがDevOSだけを返す | `tests/cli-surface.test.ts` |
| U-DISTID-008 | doctor／doc consistency | old current outputへの差戻しをhard gateで拒否する | `tests/doctor.test.ts`, `tests/doc-consistency.test.ts` |
| U-DISTID-009 | release plan | default repositoryをDevOSへ固定する | `tests/github-ops-guard.test.ts` |
| U-DISTID-010 | clean consumer | generated artifactがDevOS commandだけを実行する | `tests/distribution-acceptance.test.ts` |
| U-DISTID-011 | consumer doctor | setup projectionのDevOS command bytesを検査する | `tests/doctor.test.ts` |
| U-DISTID-012 | full doctor | source repositoryのDevOS projectionを検査する | `tests/slow/doctor.test.ts` |
| U-DISTID-013 | external evidence | current distribution source ledgerをDevOSへ束縛する | `tests/goal-evidence-audit.test.ts` |
| U-DISTID-014 | version-up | release remote／tag lookupをDevOSへ束縛する | `tests/version-up-readiness.test.ts` |

旧identity文字列の存在数だけでgreenにしない。compatibility adapterの入力fixtureとhistorical evidenceは許可し、
current output field、generated command、tag pinへ旧identityが現れた場合だけredにする。
