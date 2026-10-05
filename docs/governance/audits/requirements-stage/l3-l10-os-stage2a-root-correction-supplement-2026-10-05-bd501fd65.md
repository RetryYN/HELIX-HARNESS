# HELIX-OS Stage 2a root指摘の訂正追補

作成側の候補本文に対するrootの追加検収4項を記録する。要求意味・範囲・担当・版を変更せず、Stage2aの既存条件をL3/L10へ明示した。PO承認、独立review findingのclosure、実行合格、実装許可は生成しない。

- 本文revision: `bd501fd65c5ad682742abccc6892b15978d8e8f5`（parent `4e280091e09805993fe9a6681e6913a602dce3de`）
- 監査JSON: `docs/governance/audits/requirements-stage/l3-l10-os-stage2a-root-correction-supplement-2026-10-05-bd501fd65.json`
- 対象: OS Stage2a 015/016/017/018/019/020/023/027。approved Stage2b-014 prefixは承認済revision `6276adb92b3056b1e53055cd56f214ebc5d87158` の6ファイル全バイトと照合し、一致した。

## 訂正内容

1. **023の下位成功昇格反例** — unit successだけからconnection accepted、composite accepted、next-stage acceptedを生成する独立negative `CASE-OS-023-02l`、`02m`、`02n` を追加した。FR/AC、L2 current-condition参照、BR/NFR traceへ結び、各上位判定を別状態として保持する。
2. **018-002 receipt facet境界** — 欠落・unknown・stale・conflict・scope unknownは該当receipt facetだけを未完とし、assignment可否・継続は既存authority/制約で別に判定する。source選択後の参照欠落と、適用sourceがない非選択normalを区別し、scope unknown/conflictのcaseを独立させた。全assignment停止や追加事前gateは作らない。
3. **018-002 source pin型** — registered semantic digestとGit sourceのraw LF span SHA-256を分けて記録する。固定sourceはmain633のPO row 34、L2 1604–1619、L11 1259–1276。監査JSONにはそれぞれfull-file/raw-span hashとbyte数がある。
4. **019の旧記録case番号誤記** — immutable repair JSON/MDは変更せず、そこに記録されたrecord-count-only negativeの `CASE-OS-019-02f` は誤りで、既存 `CASE-OS-019-02e` が正しいと訂正履歴へ記録した。`02f`は別のreplay failure-position evidence negativeであり、canonical 019本文の意味は今回変更していない。

新設unique CASE rowは5件（018の04j/04k、023の02l/02m/02n）。既存018の04b–04iはID追加ではなく条件とoracleの更新。

## 固定根拠・現行本文

- Fixed parent revision: `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。
- PO decision revision: `633bf12ea8f948db8ba3d6600179c4a9507377a7`。
- L2-018-002 registered semantic digest: `5e2a621be8b4bda140bd796a48bedf2b3369daf5fad2665060ac41aa1a3174d2`。別識別のraw LF span SHA-256: `634b700e1ed79c60f53235f6fb0e73348b7cc07264d4e4f8afb69e107aa1996d`。
- L11-018-002 registered semantic digest: `e32e45319a3ac91004e3e1a985c7ff44e91b9e86f05b85c266d6b8d67acf87b5`。別識別のraw LF span SHA-256: `ba303351c99a385506d9f151d0b51c03fb08922ce7d2848ffb3b1f485c4c221c`。
- PO decision row 34 raw LF span SHA-256: `e4c090df44a79363fb9c54bf5d333b7c770bcaa9e550015c2b2247710acd2fd2`。
- 過去のimmutable repair JSON/MDとpublication repair JSON/MDのhash/byte lengthはJSONの `prior_immutable_records` に固定した。変更していない。

6 canonicalのfull SHA-256および今回変更した29 current lineのliteral/raw LF SHA-256は同梱JSONに記録した。

## 静的確認と限界

`scfctl validate` は147 bindingsでfail 0、`stale` は0、`residuals` は0、`govcheck` は `atoms=7622 requirements=57 files=58`、`git diff --check` はPASS。変更した5つのCASE IDそれぞれに機能検証表の具体行がある。

これは作成側の文書・参照・source hash確認である。独立review/PO承認/L10実行合格ではない。旧runtime、旧test/CI、Bunは実行していない。push、PR、mailbox操作はしていない。
