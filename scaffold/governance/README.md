# scaffold/governance/ — 旧ルール群由来の仮のルール集

status: scaffold（仮組み。正式な規則・指示書・検査定義ではない）
authority_effect: none
binding: [`SCF-B-0002`](../bindings/SCF-B-0002.json)
replacement_issue: GitHub Issue #1866（差し替え台帳）
upstream: [旧HELIXのルール群から導いた要求候補](../../docs/governance/candidates/legacy-rule-derived-requirements.md)、[規則atom台帳](../../docs/governance/legacy-rule-atom-inventory.jsonl)

## これは何か

旧HELIXのルール群（規則atom 7,622件、要求候補57本）を、要求1本につき1 fileの仮のルール集として
governance領域に置き、**1件も落とさない**ことを機械で確かめる足場である。
正式な物（対象別L2本文への採否接続、HELIX-OSの規則・検査対応の運転、AGENTS／hook／検査定義への反映）が
できるまでの間、AI作業者が要求単位で旧ルールの意味を参照できるようにする。

正本は`docs/governance/`側にある。本directoryは正本からの決定的な写しであり、手で編集しない。

## 構成

| path | 役割 |
|---|---|
| [`index.md`](index.md) | 57要求＋LEGACY-ONLYの一覧、件数、接続先Issue |
| `rules/<要求ID>.md` | 要求文、主として対応づいた全atom（台帳の全field：規則・種類・強制・失敗時・旧実装固有の部分・副・出どころ・由来）、副として対応づいたatomのID |
| `rules/LEGACY-ONLY.md` | 旧実装に固有とした規則（除外理由付き）。要求にはしないが落とさない |
| `tools/gen_rulebook.py` | 正本からルール集を決定的に生成する。`--check`で一致確認 |
| `tools/govcheck.py` | 無損失・件数一致・再生成一致・stale・bindingの上流一致を検査する |
| `tools/govcheck_selftest.py` | 一時directoryの写しを壊して、govcheckが拒否することを確かめる否定例10件 |

## 使い方

```
python3 scaffold/governance/tools/govcheck.py        # 無損失確認（合格0／不合格1）
python3 scaffold/governance/tools/govcheck_selftest.py  # govcheckの否定例（一時directoryだけに書く）
python3 scaffold/governance/tools/gen_rulebook.py    # 正本が変わったら再生成し、SCF-B-0002の上流sha256を更新する
python3 scaffold/tools/scfctl.py validate            # binding の検査
```

## 無損失の定義（govcheckが確かめること）

1. 台帳の母数（7,622）と要求本数（57）を定数として検査する。母数が変わる時は正本側の判断として定数とbindingを更新する
2. 台帳の全atomが、ルール集のどれか1 fileにちょうど1回、主として現れる（欠落0、重複0、余分0、置き場違い0）。各行は台帳の全fieldの写しであり、件数だけでなく意味を落とさない（写しの一致は5で担保）
3. 副の対応づけが該当fileの「副」節にすべて現れる
4. 57本すべてにfileがあり、要求文（見出し→空行→要求文→空行の構造で読む。崩れていれば拒否）と主／副の件数が要求候補本文と一致する
5. ルール集が生成器の出力と一致する（手で書き換えていない）
6. ルール集とbindingが記録する正本のsha256が現物と一致する（違えば`stale`）
7. Issue対応表の群名が本文の群名と一致する（綴り違いで接続が静かに落ちない）

## 接続先（作業projection。正本ではない）

`index.md`のIssue列は、システム群ごとの要求整理Issueへの入力であることを示す。
枠 #1858、サービス④ #1854、フルリバース #1852、サービス⑥ #1856、サービス⑦ #1857、OS推進 #1859、OS検収 #1860、OS改善 #1861。
コア、チケット、OS管理、リサーチ、企画・探索の各群は対応するIssueが未作成で「—」とする。AIレーン設定の引き継ぎは #1864。

## しないこと

- このルール集をAGENTS.md、CLAUDE.md、hook、設定へ注入しない。指示書ではなく参照である。
- ルール集の存在や`govcheck`の合格から、要求の採否・人間承認・工程完了を生成しない。
- 生成器と検査は正本（`docs/governance/`）を書き換えない（registerへの登録行は人がPRで足す）。旧資産（`archive/`）を実行・読込しない。
