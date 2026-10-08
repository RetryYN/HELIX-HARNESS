---
title: "リポジトリ構成の基本案と、開発ソースの公開 PO decision record（2026-10-09）"
decision_record_id: HDEC-REPOSITORY-LAYOUT-2026-10-09
decision_status: recorded
decider_role: PO
decided_at: 2026-10-09
recorded_at: 2026-10-09
source: 2026-10-09（Asia/Tokyo）のClaude作業session（lane `review_merge`）でのPOの選択と発言
authority_effect: effective_when_this_record_is_admitted_to_main
---

# リポジトリ構成の基本案と、開発ソースの公開（2026-10-09）

## 記録の範囲

本書は、POが同じ日に示した二つの判断を記録する。

1. 開発repoから実行物・instance状態・配布先までの構成の基本案を採用する。具体は四つの論点とともにL4で決める。
2. 内部実装を含む開発ソースは、CIの条件のためpublicの開発repoで開発する。

本書から、実装、新世代CIの実装・起動、release、deployment、内部デプロイ、配布repoの作成・切替、visibility・LICENSEの変更、ディレクトリの作成、L2・Conceptの変更、新しい承認手続き、Issue closeを生成しない。

## 経緯

POは「フォルダ構造本当に今のままでいくの？」と問い、Claudeが示した構成の選択肢に対して「場当たり的な対応やめろ、リリース単位や内部デプロイなど総合的に考えたうえで更新性、保護性、依存関係などから開発するディレクトリ構成まですべて踏まえて提案しろ。」と述べた（原文）。

Claudeは、旧HELIXの構成資産（下表）と現行のConcept・判断記録・L2／L3を調べ、次の基本案を提示した。続けてPOは、出所を示さない評価文を貼り付け、末尾に「らしいよ？」と添えた。評価文は基本案を基に進めることに賛成し、四つの論点をL4で具体化するよう求めていた。評価文はPOの発言ではないため、本書では論点の要旨だけを「L4で具体化する論点」に記す。

## POの選択と発言

ClaudeはAskUserQuestionで次の二つを問うた。POの回答は次のとおりである（原文）。

> 問い：「この構成案（①〜④をL4で具体化する前提）を、PO判断として記録していい？」
>
> POの選択：「採用して記録 (Recommended)」
>
> 選択肢本文：「直下にdeclarations/・helix/・records/を置く構成を基本案にする。①〜④はL4の課題として明記する。判断記録のDraft PRと、共通カーネル15.5節を揃えるPRを出す。実装の解禁ではない」

> 問い：「内部実装（CORE、LABO、INTELLIGENCEなど）のソースの公開範囲はどうする？（実装を始める前に決めればいいから、今決めなくてもOK）」
>
> POの回答（自由記述）：「CIの条件上公開して開発しないと賄えない」

## 判断1：構成の基本案

```
/                          開発repo（public）
├─ AGENTS.md CLAUDE.md README LICENSE …    root configは増やさない
├─ docs/                   人が読む意味の正本（現行の配置を変えない）
├─ declarations/<所有機構>/<種類>/<identity>.json
│                          パックをまたぐ機械可読の宣言（OperationDecl、VerifierSet等）
├─ helix/<機構>/{units,connections,composites}/<型番>/
│                          実装。パックの宣言とsrc・testsを同じフォルダに置く
├─ records/<符号化したlog_id>/   開発repoの追記専用記録（機密を含まないもの）
├─ scaffold/  archive/  .github/   現行のまま
repoの外：成果物ストア（immutable artifact）、段階の実行環境、instanceの状態、配布repo（private）
```

- **pathは正本にしない。** 正本は型番台帳の識別子である（2026-10-08の方針6、AC-HARNESS-L3-010-04）。構成は、所有、保護、変更の影響範囲、依存の向きを機械で照合するために使う。
- **`docs/`の既存の配置は変えない。** 監査記録が既存pathを参照しており（書き換えない記録）、構造の変更は具体的な支障が生じた場合に限る（`docs/governance/l3-l10-authoring-layout.md`）。L4〜L9も機構×層の同じ並びで足す。V字の各層の検証設計の正本は`docs/`に置く。
- **検証コードはパックの種類に対応させる。** unitには単体の検証、connectionには接続の検証、compositeには構成全体の検証を置く。
- **段階は開発中のtreeに依存しない**（HELIXOS-L2-014、AC-OS-014-07）。段階の実行物、実行環境、instanceの状態（案件data、実行時の記録）はrepoの外に置き、Gitへ入れない（AC-OS-014-05）。
- **配布は、配布する範囲を宣言して投影する。** HELIX自身を育てる部分を同梱しない（Concept「HELIX-HARNESS」の節）。配布先をprivateにする方針（[有償化ライセンスの判断記録](commercial-license-po-decisions-2026-09-27.md)）を保つ。
- 現行の共通カーネルL4（`docs/helix-harness/L4-basic-design/common-kernel.md` 15.4〜15.5節）は、`helix/`、`declarations/`、`records/`の配置と型番台帳をすでに提案している。本判断はこの提案を基本案として採る。同節を本書に揃える修正は、共通カーネルの後続PRで行う。

### L4で具体化する論点

次の四つは、基本案を確定させる前にL4で決め、独立reviewで確かめる。

1. **正本の一意化**：`docs/`（意味）、`declarations/`（パックをまたぐ宣言）、パックの宣言、型番台帳（登録の事実）の責務を分け、同じ項目を二か所に書かない。パックに型番を書いただけでは登録済みにしない。内部デプロイの状態は型番台帳に書かず、K7の`PointerMoved`から導く（15.4節を保つ）。
2. **releaseと切替と実行の区別**：検証済みの構成、成果物のdigest、対応環境、検証証拠、切戻し条件を一つのrevisionへ結ぶ記録（ReleaseManifest）を設計する。K7のpointerが動いたことと、実行環境が新しい世代を正常に起動したことは別の事実として記録する。rollbackでは構成と成果物を戻し、案件の状態と履歴は巻き戻さない。
3. **公開の範囲**：判断2のとおり、開発ソースはpublicである。配布の範囲（allowlist）と閲覧の範囲を同じものとして扱わない。
4. **recordsの物理配置**：論理のlog IDとwriter IDはmanifestに持たせ、物理pathは安全に符号化する。public repoへ入れる記録は、機密を含まない開発記録と許可された証拠に限る。Gitの履歴だけで追記専用性や発行者の真正性を主張せず、書込み権限、K5の整合性検証、K7の条件付き追記を物理実装でも成り立たせる。

## 判断2：開発ソースの公開

- 内部実装（HELIX-HARNESS-CORE、LABO、INTELLIGENCE等）を含む開発ソースは、CIの条件のため、publicの開発repoで開発する。非公開部分を別のprivate repoへ分けない。
- 開発repoをprivateにしない理由は、[有償化ライセンスの判断記録](commercial-license-po-decisions-2026-09-27.md)の「開発側はギットハブコスト観点からプライベートは無理」と同じ根拠である。開発repoのLICENSEは全権利留保のまま変えない。
- secrets、PII、credentials、案件data、instanceの実行記録はrepoへ入れない（AGENTS.md「現在の境界」）。
- [Concept](../../concept/helix-concept.md)の「HELIX-HARNESS-CORE（Webでは顧客製品ごとのHELIX-WEB-HARNESS-CORE）のJSONとPythonは公開しない」は、同じ段落の「HELIX-Webで利用者へ渡す成果物」に関する記述である。Claudeはこれを、利用者へ渡す成果物と配布物にCOREを含めない境界として読む。本書はConceptを変更しない。この読みと異なる意味であれば、Conceptの判断として別に扱う。

## 旧HELIXとの対応

| 旧source | 保持する点 | 変える点・理由 |
|---|---|---|
| `LEGACY-ASSET-FDBA655B1CFF75DCDC0E`／`archive/legacy-generation-2026-09-14/root/docs/governance/repository-structure.md`（§1 13–97行、§2 102–120行、§6 146–150行、§7 152–159行、§8 161–173行）／SHA-256 `6f8ee784049d03279641151714c3572656eb20c64cfb769853b6e885abf4f262` | 構成の正本を一つの文書に置くこと。正本、生成物、履歴の区別。空のフォルダを実装の許可と読まないこと。root configを増やさない原則 | `src/<domain>/`を`helix/<機構>/{units,connections,composites}/<型番>/`へ置き換える。旧の平置きの`tests/`はsrcとの対応が崩れたため、パックへ同居させる。平置きの`config/`は所有機構ごとの`declarations/`へ分ける。旧`.helix/`がruntime state（generated、gitignored）と監査証跡（tracked）を分けていた点を保持し、現行ではruntime stateをrepoの外へ、公開できる開発記録を`records/`へ置く。旧のroot configの具体（Node／TypeScript／Vitest、Bunのlock）は引き継がない |
| `LEGACY-ASSET-A2F6A697D7FFFD490B57`／`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/release-module-bundle-composition-requirements.md`（54–58行 RLS-R-03、110–115行 RLS-R-11、133–135行）／SHA-256 `336d361ec89c36ca377113aca2f08b6b510cd0127ddbba191d311cec4990c89c` | 各pathがちょうど一つの所有単位に属すること。変更されたpathから所有単位、組合せ、検証の範囲を導くこと。同じrepoのまま分割しないこと | 所有単位を旧Module・Bundleから、現行のパック（unit、connection、composite）と型番台帳へ置き換える。所属はpath名でなくパックの宣言と台帳で決める（方針6） |
| `LEGACY-ASSET-809B35B3C91567A97AF5`／`archive/legacy-generation-2026-09-14/root/docs/design/harness/L5-detailed-design/source-boundary-architecture.md`（11–18行、47–57行）／SHA-256 `6bee024905701ca99ccd09e2a357e3b91fbf5370e4118630cfb1da5119d07610` | 依存はdefault denyとし、許可した向きだけを明示する。空のpolicyを暗黙の許可にしない（旧の失敗：32 moduleのうち29がEMPTY） | 依存の宣言をパックの宣言へ置き、機構をまたぐ結合をconnectionに限る。具体はL4〜L5で決める |
| `LEGACY-ASSET-8195605FB59B8B837EFF`／`archive/legacy-generation-2026-09-14/root/docs/adr/ADR-005-distribution-model-and-central-ui.md`（16–36行）／SHA-256 `dc6f09d05556442518fb09dd7fa38536562b0ab60e6947d044593500e5d3f16f` | 開発repoと配布物を分け、配布物を版で固定すること | 配布の運転はHELIX-OSが担い（Concept）、配布先はprivateとする（2026-09-27判断）。旧の配布repo名と中央Web UIの構成は採らない |

旧HELIXの構成で記録された失敗と、Claudeの観測を分けて記す。

- 記録された失敗：層の定義を切り替えたとき、物理pathのatomic renameは別のcutoverへ回し、legacy pathを読み替える規則を置いた。正規化の対象は58文書のblocker manifestになった（`LEGACY-ASSET-75E1420CE980CB881C48`／`archive/legacy-generation-2026-09-14/root/docs/governance/l3-progression-authority-rebaseline-2026-07-19.md` 4行、19–35行／SHA-256 `f7e425c53a42b7a04d02b277d869b9e1dee9ed48b2126505add49569546cfd8d`）。58件はlayer・pair・runtime等のauthorityの正規化を含み、pathを直さなかったことだけが原因とは言えない。
- Claudeの観測（2026-10-09、archiveの静的計数。旧の監査結果ではない）：`src/cli.ts`は17,133行、`src/`直下のdirectoryは37個、`tests/`直下の`.ts`は566個で、`tests/`はsrcの階層を写していない。

本基本案は、層の名前を`docs/`の並びに限り、実装の構成をパックの単位に揃えることで、pathと意味のずれ、実装の平置きと巨大化を避けることを設計上のねらいとする。

## 本書から生成しないもの

実装、新世代CIの実装・起動、release、deployment、内部デプロイ、配布repoの作成・切替、repositoryのvisibility・LICENSE・branch protectionの変更、ディレクトリや空の文書の作成、L2・Conceptの変更、v0.1の宣言、新しい承認手続き・merge gate、Issue close。
