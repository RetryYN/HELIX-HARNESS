# v1.3 execution policy lines 167–171 condition audit

対象は旧v1.3 `helix-harness-requirements_v1.3.md`の物理行167–171、`REQSRC-SUP-00127`〜`REQSRC-SUP-00131`である。archive source SHA-256は`788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406`。行ごとの原文・line SHA-256は同梱JSONに保持する。

比較基準はPO固定commit `f6dad2a33e24f000b87d7f09b8d40288257e74cc`のHARNESS L2/L11 bytesと、作業基準 `origin/main` HEAD `0f5050e2b25cd622640c99c5de170cca087f7d8a`の現行L2/L11である。固定L2 SHA-256は`aed75cb4bdd644eedd9d3eb408cf522af2c4fbf4272db7b775edc62fc383100a`、固定L11は`09b2963187f9aaddbb1ad189d77e517e91914bd5ccdf2499dd9c11855139bcd4`。現行L2/L11 SHA-256はそれぞれ`78c32b598f449cf80d90e0e35eab6d39b94bd150abbfd543bc75bdb8be949ae6`と`a216403173175d9683737b1ab82f7e0ff1a1e85f31b1b155ad63ee3c00cc096e`である。

## 行単位の比較

| 旧source item | 状態 | 比較結果 |
|---|---|---|
| `REQSRC-SUP-00127` line 167 | `partial` | 固定L2-003は画面・不確定要素に応じたL2.5 Prototype/PoC適用を扱う。だが、`design-bottomup`がbackend-derived trigger／方向条件を`SCREEN_DESIGN` specialist workflowへ渡す条件は確認できない。画面条件と上流工程は保持されるが、旧triggerと専門workflowへの接続は残差。 |
| `REQSRC-SUP-00128` line 168 | `partial` | 固定L2-002/003は開発方式、ticket、工程条件を扱い、HARNESSが個別の動的workflowを生成しない責務境界を持つ。一方、旧`design-bottomup`を互換入力として保持し、同名workflow modelを作らないというalias固有の条件はない。 |
| `REQSRC-SUP-00129` line 169 | `partial` | 固定L2-003はL7–L12のright-armを区別し、L2-018/021と対L11はL12運用評価・運用検証を含む。旧`operation_verification`／`verification`値をそのscopeへのcompatibility inputとして解釈する条件はない。 |
| `REQSRC-SUP-00130` line 170 | `partial` | L2-003/018/021と対L11に運用評価の意味があるが、旧verification aliasを受けても新しい同名workflow modelを作らないというtyped compatibility条件は固定L2/L11で確認できない。 |
| `REQSRC-SUP-00131` line 171 | `missing` | 固定L2/L11は構成体固有のNFRや計測義務を扱う（L2-005/009/021/022、対L11）。しかし必要なNFR計測を`NFR_MEASUREMENT` capabilityへ接続する要件は固定revisionにない。現行mainにはHARNESS-L2-034の計測契約候補と対L11があるが、PO決定の採択範囲外の候補であり、この判定をcoveredへ変更しない。 |

## 固定・現行revisionとauthority境界

POの2026-09-28判断記録は固定L2/L11 revisionと明示候補集合を指定し、本文bytesと採択を判断記録から読むよう定める。固定範囲は既存HARNESS-L2-001〜009のrouting条件と明示候補24件を含む。後発L2-034候補は同判断の採択範囲外である。現行mainで固定比較箇所の意味変更は見つからず、後発の追加候補は上記のとおり未採択として別扱いした。

この監査は5行の条件比較であり、要求採択、形式的successor割当、実装・受入実行、stage終了を生成しない。状態集計は`covered: 0`、`partial: 4`、`missing: 1`。旧runtime、test、CIは実行していない。

比較参照の主要箇所:

- 固定HARNESS L2: `product-requirements.md:98–112`（L2-002/003のworkflow・screen/L2.5・right-arm意味）、`:108–112`（L7–L12と状態遷移）、`:156–157`（品質条件とL12観測への接続）、`:411–417`（L2-018）、`:438–455`（L2-021/022）
- 固定HARNESS L11: `product-acceptance.md:35–43`（style/ticket/screen/L2.5）、`:43`（受入・運用評価状態の分離）、`:211–217`（L2-016〜022 acceptance row）
- 現行HARNESS L2/L11: 同じ既採択条項に加え、L2 `:693–717`とL11 `:465–483`にL2-034計測候補を追加。候補状態のため既採択条件として計上しない。
- 判断記録: `docs/governance/decisions/helix-harness-requirements-po-decision-2026-09-28.md:58–68`
