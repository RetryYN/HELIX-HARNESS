# 要求指示書の配置・取込み後削除検証

観測日: 2026-09-06。owner: #1372、関連: #1556 / #1558 / #1500。
本書はローカル原稿削除の検証記録であり、要求・承認・runtimeの正本ではない。

## 照合範囲

受領原稿5件をmain `2b7452c467cfd5682f21666550c3461e80089eca` の取込台帳へ全文照合した。
改行と行末空白だけを正規化し、段落・順序・文言の省略を認めない比較が5件とも一致した。
その後のmain `548440db8b11287ff344b154b16c76a8878e6bcb` は同じ取込台帳を保持している。
個別要件と受入の対応表も照合した。要求の採用、canonical/IR昇格、runtime実装・有効化は別状態である。

以下のSHA-256は削除前原稿のbytesを対象とし、正規化後の表示本文のhashとは区別する。
回帰テストはhistorical fenceの本文だけを取り出し、CRLFをLFへ変換し、各行末空白と末尾空白を除去して末尾LFを1個付けたUTF-8 bytesを照合する。

| 削除した原稿 | 原稿SHA-256 | 保全先（下記の台帳） |
|---|---|---|
| `HELIX_DESIGN_GROUNDING_HUMAN_CONVERGENCE_INSTRUCTION_v0.1.md` | `31e12468698ac562a90c8bcc367214d82e14e99878ef52606cde011524cca54c` | Design |
| `HELIX_REQUIREMENT_FORMATION_AND_SCOPED_ADMISSION_v0.1.md` | `b43789be1b09335b23fee40da87aba87d5d6f851ea31c0d1445f253d8816028d` | Formation |
| `HELIX_REQUIREMENT_FORMATION_SCOPED_REFREEZE_v0.1.md` | `fd999154df042f810b4c738fa9b8391498d3883b2da003ae65183de4f47d57f5` | Formation |
| `HELIX_WORLD_GOVERNANCE_BASELINE_v0.1.md` | `96e3abeeb175413e00bf544a561c02655c627b30e4c79e7d00109dbe8ac91137` | World |
| `HELIX_WORLD_GOVERNANCE_INSTRUCTION_v0.1.md` | `0e6804d20731581ccd20877e1a3ebaa9954d835d4cc8fef597e5f4da25885c08` | World |

- Design: [原文・移管表](candidates/design-grounding-human-convergence-intake.md)、DG/HR/DC各4要求とAC1〜10。
- Formation: [原文・移管表](candidates/requirement-formation-scoped-admission-intake.md)、RF4/RC5/GH3要求とAC01〜18。
- World: [原文・移管表](candidates/world-governance-intake.md)、R01〜09とAC01〜10。

Designの原稿hashは、commit `e4f3a7fef` の同台帳にあるhistorical本文から末尾LFを1個除いたbytesで再現した。
上記回帰テスト規約による表示版digestは `6bb6b429f32833368a20c72f358cdfadec82992c4f9ec4729685f8a906c5b839` で、U-RSC-001のpinに対応する。
FormationとWorldの4件は同規約のdigestと原稿hashが一致する。この一致を原稿全件のbytes同一性へ一般化しない。

原稿はすべて未追跡ファイルだった。Git履歴は削除せず、上記mainの台帳から内容を復元できる。
既存の保存表示では一部の行末空白を正規化しているため、表示から復元したbytesと原稿hashが一致するとは主張しない。

## 削除と配置の結果

- ユーザーが指定した要求指示書5件のみ、理由記録付きone-shot foreign-edit手続きで削除した。
- 最初の長い理由は256文字上限により拒否された。理由を上限内へ整え、同じ対象集合で正規手続きを完了した。
- 削除後の不存在5/5とone-shot marker消費を確認した。
- ローカルrootで `HELIX*.md` / `HELIX*.zip` に該当する原稿は0件。
- 確認mainのtracked treeで対象5ファイル名を検索し、原文保全台帳以外の参照は0件だった。
  root原稿を要求取得・実行に使う既知consumerは見つからない。動的な外部consumer全体の不存在証明ではない。
- 要求候補は `docs/governance/candidates/`、原文はhistorical input-onlyの台帳へ分離されている。
- DB、LICENSE、AGENTS/CLAUDE、他の未コミット成果は削除対象外。リポジトリ全体の配置健全性を合格としたものではない。

## 保存後の回帰検証

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-RSC-001 | 原稿5件のhistorical本文 | 欠損・順序変更・文言変更をdigest不一致として検出する。改行と行末空白のみ正規化する | `tests/request-source-retention.test.ts` |
| U-RSC-002 | 取込台帳と削除記録 | 保全先リンクの欠落・存在しないpath・逆参照欠落を拒否する | `tests/request-source-retention.test.ts` |

この検証は原稿保全の退行を検出するもので、要求の正本昇格やruntime完成を判定しない。

## 配置正本の残る追従課題

[repository-structure](repository-structure.md)にはcutover中の廃止済み旧runtime保持や旧配布前提など、
冒頭directiveで互換負債とされる記述が残る。配置の全体見直しは#1372/#206と既存authorityの改版で追跡する。
本削除作業ではライセンス・配布契約を変更せず、未確認原稿や別writerの成果を廃棄しない。
