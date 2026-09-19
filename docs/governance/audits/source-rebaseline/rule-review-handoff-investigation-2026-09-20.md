# 共通ルール参照・Claude／Codex引継ぎ経路の調査

status: research_reference
authority_effect: none
as_of: 2026-09-20
source_repository_revision: 3469266e5f7a4b455f98ccd0f40923a40f5e4562

## 判断論点と結論

要求整理中の反復読込みとreview対象の取り違えを減らすため、旧経路のどこを参考に仮組みするかを調べた。
旧資産の実行・copy採用は行わない。現行の規則参照とexact SHAのパケットを、既存VS Code GUIの実行／レビュー・マージレーン間で通知する仮組みへ接続する。

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
| 旧receiptにはCI・memory依存がある | 仮設の依頼／応答の静的検査だけに限定 | 新規provider起動、認証、merge admissionは対象外。通知timeoutとGUI宛先bindingを仮組みで追加 |

## 未確認・再調査条件

GUIへのlive ACK、全依存閉包、性能改善率は別途検証が必要。native hook形式と別process transportを合成入力で検査する。
起動経路の明示許可と上流契約が揃ったとき、または参照したsourceのdigestが変わったときに再調査する。
仮設パケットの整合検査は実review・正式L11・採用判断を証明しない。

## 最初の適用候補

S0のL2／L11適用差分、または本仮設PR自体を一往復の対象とする。
評価は依頼準備時間、再読量、SHA取り違えの検出、review往復数。測定前に高速化率を主張しない。
S0適用に残る人間判断とS1-01 deferを変更しない。


## GUI経路の追加調査とscope訂正

ユーザーは同じVS Code内のClaude Code拡張とCodex拡張の既存GUIセッションを明示した。
パケットのみの前版では、実行レーンとレビュー／マージレーンを接続できないため訂正する。

- 旧`PLAN-L7-469-claude-memory-async-wake.md`の目的・完了条件、旧`src/cli.ts:4707–4730`、
  旧`src/runtime/claude-memory-wake.ts:1539–1649`では、共有通知のclaimとClaude Stop asyncRewakeによる既存VS Codeセッションの再開を確認した。
- 旧`resident-lane-orchestration-requests.md:174–189`は、逆方向のCodexをCLI委譲とし、対称な既存GUI間通知を保証していない。
- 現地でopenai.chatgpt 26.5908.31748、anthropic.claude-code 2.1.278の拡張packageを確認。利用中の各processは別途確認し、最新版directoryの存在を稼働版の証拠にしない。
- Codexの公開command一覧には既存threadへ通知を送るcommandを確認できなかった。非公開IPCや別app-serverを起動して既存GUI接続の代わりにしない。

[Codex公式hooks](https://developers.openai.com/codex/hooks)を2026-09-20に確認。
Stopは同期で継続理由を返せるが、通常async hookの完了はidle threadを自動再開しない。新しいhookは利用者trustが必要。
[Claude公式hooks](https://code.claude.com/docs/en/hooks)ではasyncRewakeのexit 2によるidle再開を確認した。
この非対称性をREADMEへ明記し、Codexは期限付き同期Stop待受で接続する。
冷停止・待受期限後まで任意に起こせるとの主張はしない。

旧sourceはreferenceとしてのみ読んだ。旧hook／memory／CIをコピー・起動せず、新しい仮設通知箱とnative hook接続を作る。
配送先PID／session、秘密を含み得る利用者設定、通知payloadはrepo-owned文書に転記しない。

追加sourceのfile単位照合（全件reference、disposition変更なし）:

| source | asset ID | SHA-256 |
|---|---|---|
| `docs/plans/PLAN-L7-469-claude-memory-async-wake.md` | `LEGACY-ASSET-7A959ABA8C7F81DC3C64` | `dc8ceaa4f65392a8b5bd5cd92fece3b2ec053fc4b6b409106434693873014450` |
| `src/cli.ts` | `LEGACY-ASSET-FA8D4E24D8399E8350F1` | `608660021df710e6c91239dbfbb4d23e9357d73bc0b7c9ffd5c4f5b4544f0dad` |
| `src/runtime/claude-memory-wake.ts` | `LEGACY-ASSET-0F66E2A823A36187D315` | `34e6e1e49170ae9e19beb8543291cbbb2294a124f59049a50e756771d52bdc91` |
| `docs/design/helix/L1-requirements/resident-lane-orchestration-requests.md` | `LEGACY-ASSET-2B0DE689AA572DE66181` | `0ff33afc0cf22a4cf1ffb3f33334069f1d624f0f67f56451b16632ed6d5d52fe` |
| `.claude/settings.json` | `LEGACY-ASSET-F27AC6F39D89FE021C56` | `df8a6f6d51152446708f93558917c1d760a1d9f5639c31d5474a350d1e697ef1` |
