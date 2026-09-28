# LEGACY-CAND-LINE-003082の分類訂正監査

## 対象と訂正

4,755行semantic-routing snapshotの`LEGACY-CAND-LINE-003082`は、旧IPC-R07のL45を`explanation`、`non_requirement_source_structure_or_explanation`として記録している。本監査はこの分類を歴史的snapshotとして保持したまま、要求意味を持つ行として別途訂正する。既存snapshotのJSONL行、五atom follow-up監査、旧sourceは書き換えない。

| source atom | archive source | file SHA-256 | line SHA-256 | 原文 | snapshot上の旧分類 |
|---|---|---|---|---|---|
| `LEGACY-CAND-LINE-003082` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/instruction-path-change-resilience-requirements.md:45` | `4a0dc04f1cf100770c5cc0440b0ca9a056b7d443f8d0b04e0978483b442cfe04` | `04ae83fc736b4703e16f16c526e3e712d9c0c85b3c01ee76806868eae2153103` | 再読込不能なprovider/runtimeでは、安全なsession transitionとcoordination-only continuationを使う。 | `explanation`; `non_requirement_source_structure_or_explanation` |

この行はIPC-R07見出しに続く条件文で、再読込不能という適用条件と安全な継続を使うという規範的な要求を述べる。したがって説明分類ではなく`requirement_atom`として扱う。意味分類の訂正であり、旧候補の採択、現行authorityの決定、具体的なsession transition／coordination-onlyの機構定義ではない。

## 集計差分（snapshotを書き換えない）

分類訂正は元の4,755行JSONLへ反映せず、本監査と#2253の独立訂正監査を累積差分として読む。元snapshotの分類件数はstructure 926、explanation 2,959、requirement_atom 870で、unknown routeは574件だった。#2253の訂正監査が別の一行（AAFD）をexplanationからrequirement_atomへ訂正した後は926／2,958／871、unknown 575件となる。本監査のIPC L45（003082）の訂正をさらに加えた意味分類の累積値はstructure 926、explanation 2,957、requirement_atom 872、unknown route 576件である。候補総行数4,755は変わらない。これらは監査上の再分類差分であり、immutableな4755 JSONL自体の更新や要求採択を意味しない。

## IPC-R07との局所接続

直後の`LEGACY-CAND-LINE-003083`（L46、line SHA-256 `19cef28e6e21b22ef88dea26d6bf9ebc64dd865c638ebb2e151b2ced8f69cbc4`）は、継続時に持ち越さない情報と外部正本の再取得を定める。L45は適用条件と継続の概略、L46はその継続に付く情報境界を記す連続した二atomである。未採択の`HELIXOS-L2/L11-041`候補は両atomを限定的に保持するが、IPC-R07全体をrouteしたり、旧runtime/provider機構を移植したりしない。

L45にある`safe session transition`と`coordination-only continuation`の厳密な実装意味は旧sourceの語句を越えて特定しない。外部authority sourceの種類・意味・選択・適用条件も本監査では定義しない。L45/L46の候補への接続はPO未決であり、source atomの保持から採択を生成しない。

## 追跡

- 4,755行の固定snapshot: [legacy-candidate4755-semantic-routing-2026-09-28.jsonl](legacy-candidate4755-semantic-routing-2026-09-28.jsonl):3082–3083
- 原行保全台帳: [legacy-candidate-source-line-carry-forward.jsonl](../../legacy-migration/candidate/legacy-candidate-source-line-carry-forward.jsonl):3082–3083
- 限定候補のsource-linesとcoverage receipt: [source-lines](../requirement-registration/helixos-safe-continuation-source-lines-2026-09-28.jsonl)、[coverage receipt](../requirement-registration/helixos-safe-continuation-coverage-receipt-2026-09-28.json)
- 対象候補: [HELIXOS-L2-041](../../../helix-os/L2-requirements/governance-requirements.md#helixos-l2-041) と[対L11](../../../helix-os/L11-acceptance/governance-acceptance.md#helixos-l2-041)

この訂正監査は分類根拠と限定route準備の証拠であり、要求採択、旧IPC系列のclosure、実装、実行、受入完了を示さない。旧workflow、runtime、test、CIは実行していない。
