# 共通ルール参照・Claude／Codex引継ぎ経路の調査

status: research_reference
authority_effect: none
as_of: 2026-09-20
source_repository_revision: 3469266e5f7a4b455f98ccd0f40923a40f5e4562

## 判断論点と結論

要求整理中の反復読込みとreview対象の取り違えを減らすため、旧経路のどこを参考に仮組みするかを調べた。
旧資産の実行・copy採用は行わない。現行の規則参照とexact SHAへの対応を小さな仮設パケットに限定する。

親は承認済みConcept v4.1とHELIX-OS L1（HELIXOS-L1-002／003／004／008／009）。
Concept SHA-256: `181b0c555f4e27f83a1f92d315aee0e66a9f3f645e3cebe0a1b8d487878efaad`。
OS L1 SHA-256: `0f7f30d9d6984578f09c31ed1ef4e826d7c360bf752297982bde5201e7e99ca8`。
[承認record](../../decisions/concept-v4.1-and-four-l1-approval-2026-09-17.md)を参照する。以下から新要求の承認を作らない。

## 既存接続

GitHub Issue #1864が旧AIレーン設定の意味引継ぎ、#1859が推進、#1860が検収、#1866が仮設の置換・撤去を担う。
2026-09-20にGitHubから各接続先を照会した。#1864の11論点のうち、本仮組みが補助するのは規則参照、
委譲ブリーフ、作成／reviewの分離、同じHEADへの指摘返却である。11論点全体の移管完了を意味しない。

現行SCF-B-0002には7,622 atom／57要求の参照集とgovcheckがある。この既存資産を参照し、規則集を増殖させない。
新しい作業は[FT-OS-REVIEWHANDOFF-001](../../feature-tickets/FT-OS-REVIEWHANDOFF-001.md)へ束縛する。

## 読み取った旧source

pathはすべて `archive/legacy-generation-2026-09-14/root/` 相対。行範囲は調査した入口であり、全依存閉包の監査ではない。
SHA-256はfile全体を既存asset台帳と照合した値。全5件のdispositionは`unresolved`のまま変更しない。
規則の現行採用、旧testのoracle化、実装の再利用判断は行わない。

| source | 調査範囲 | asset ID | file SHA-256 | 参考になる意味 | そのまま使えない理由 |
|---|---|---|---|---|---|
| `.claude/CLAUDE.md` | 80–127 | `LEGACY-ASSET-317AE893EF4ADD3AF492` | `a8dd3ed8854e85ee4e749eb0e3e83195d076586611b697727099f946f42dfaa9` | 委譲contextを固定し、作成とreviewを分離する | 旧wrapperと旧PLAN／CIを前提とする。命令としては使用しない |
| `src/runtime/worker-context-packet.ts` | 1–148 | `LEGACY-ASSET-447711D94AA87E82F544` | `e0019264841da35c7018cd41931073234f6ddd1926d6f923ba675c1b445e035f` | 対象HEAD、規則digest、scope、出力形式を束縛する | authority pathが旧v1.3・旧L3・旧role判断へ固定されている |
| `src/runtime/claude-pr-convergence.ts` | 1–150、937–1020、1419–1465 | `LEGACY-ASSET-AC2078FFF049D6B56D19` | `059f5e925c727fe8003c9e6c72b595d4697bd4d930d97a92cd4a9ee1f5ebdff8` | 双方向のruntime区別、receiptとread-afterの照合 | 旧memory dispatch、CI run、receipt永続化、merge判定に結合する。読解は列挙範囲中心で、依存閉包は未監査 |
| `src/lint/rule-drift.ts` | 1–100 | `LEGACY-ASSET-9B572F6E5E5E57606D81` | `84c5fd0bb7453f51978528948cb420a5884ced0a1ddc3a44ef08a75a94dda4c3` | 複数adapterの参照ずれを検出する | 旧wrapperと旧project名を必須markerにしており、そのまま適用すると旧規則を復活させる |
| `src/runtime/worker-output-admission.ts` | 1–150 | `LEGACY-ASSET-012EA51D011B87B05A5D` | `dfdbf9bdb2ab14dd8302ad2b9c8f6c717b5527727ca59b6b5cdb87e9983e0bf5` | 依頼digestと出力schemaへの対応を確認する | 旧descriptor／schema registryに依存。本人性と意味の正しさの証明ではない |

## 仮組みへの限定投影

| 観測 | 今回の一時契約 | 残る事項 |
|---|---|---|
| 両runtimeが違う規則を読める | 同じcontent SHAの規則・decision・候補参照を種別とbytes digest付きで列挙 | 必読資料の全文context化、実読確認はしない |
| 依頼と応答が別revisionになり得る | request ID、base SHA、content SHA、payload digestの一致確認 | GitHubの最新SHA取得と配送read-afterは手動・別scope |
| 一方向固定では逆向きreviewが成立しない | authorはclaude／codexの両方を指定可能 | runtime本人性と独立性は別の証拠が必要 |
| 旧rule-driftは旧命令を強制する | 現行原文を参照し、旧候補を指示へ昇格しない | 旧11論点の採否は#1864に残す |
| 旧receiptにはCI・memory依存がある | 仮設の依頼／応答の静的検査だけに限定 | 起動、認証、費用、timeout、隔離、merge admissionは未実装 |

## 未確認・再調査条件

Claude／Codexの実通信、provider設定、全依存閉包、性能改善率は未検証。
起動経路の明示許可と上流契約が揃ったとき、または参照したsourceのdigestが変わったときに再調査する。
仮設パケットの整合検査は実review・正式L11・採用判断を証明しない。

## 最初の適用候補

S0のL2／L11適用差分、または本仮設PR自体を一往復の対象とする。
評価は依頼準備時間、再読量、SHA取り違えの検出、review往復数。測定前に高速化率を主張しない。
S0適用に残る人間判断とS1-01 deferを変更しない。
