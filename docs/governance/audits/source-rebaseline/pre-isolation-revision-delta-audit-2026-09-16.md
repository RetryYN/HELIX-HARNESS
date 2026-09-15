# archive隔離前に変更された旧revisionの保全監査

status: source_revisions_preserved_pending_semantic_review
authority_effect: none
baseline_commit: `6fabd12512a3659fff4a956692cdd61faeeb16ce`
pre_isolation_commit: `2d4991042be55268bac30a8bbcdac45b3865030a`
archive_commit: `064280b5c1c5c98f949e6e3be5ef87cbe4a4b658`

## 発見した欠落条件

[L2 source register](l2-source-register.md)は、2026-09-14に取得したmain
`6fabd12512a3659fff4a956692cdd61faeeb16ce`を監査基準としている。一方、4,020件のarchiveは、上流整理の変更を
積んだ直後の`2d4991042be55268bac30a8bbcdac45b3865030a`を隔離したsnapshotである。archive 4,020件はこの隔離直前treeと
全件byte一致するが、うち333 pathは監査基準revisionとbyteが異なる。

この二つを区別しない場合、隔離前に書き換えられた旧要求、候補、検証条件、PLAN内の意味を、archiveにある
新しい方のrevisionだけで置換したと誤認できる。そこで333件の基準revisionを
[`pre-isolation-revision-delta-source-holding.jsonl`](../../pre-isolation-revision-delta-source-holding.jsonl)へ
commit、path、Git blob OID、SHA-256付きで登録した。これは新しい要求の追加ではなく、既に存在した旧revisionの
所在を要求整理の母集団から落とさないためのsource holdingである。

## 静的照合結果

| 対象 | 件数 | 結果 |
|---|---:|---|
| archive root | 4,020 | 隔離直前commitの同一pathと4,020／4,020 blob一致 |
| 監査基準と隔離直前で同一 | 3,687 | 同じblobとしてarchiveに保持 |
| 監査基準と隔離直前で相違 | 333 | 両revisionのblob OID／SHA-256を機械台帳へ登録 |
| 基準側にだけある現行維持file | 5 | `.editorconfig`、`.gitattributes`、`.gitignore`、`LICENSE`、`THIRD_PARTY_NOTICES.md`。archive欠落ではなく現行pathで保持 |

333件の内訳は次のとおりである。

| source category | 件数 | 現在の扱い |
|---|---:|---|
| `legacy_plan_source` | 303 | 作業・判断史。要求意味を含む可能性を否定せず、個別採取まで未解決 |
| `requirement_or_prototype_source` | 12 | 基準revisionと隔離revisionの意味同値を未確認のまま両方保持 |
| `candidate_source` | 7 | 元candidate revisionを不採用扱いせず両方保持 |
| `verification_source` | 3 | 旧検証条件を現行合格へ使わず、要求atom確認用sourceとして保持 |
| `core_upstream_source` | 2 | 旧Concept／旧requirementsの基準revisionと隔離revisionを別sourceとして保持 |
| `other_legacy_asset` | 6 | config、script、test等。実行せず意味採取・技術代替判断待ち |

## revision境界

- `baseline_commit:path`は監査開始時に存在した旧revision、archive pathは隔離直前revisionである。
- 両者の差を同値、修正済み、不要、置換済みと判定していない。
- 基準revisionの`confirmed`、`draft`、`proposed`等のsource状態を、隔離revisionのmetadataから逆算しない。
- 後続の要求整理では、333件のうち意味を持つsourceについて両revisionを比較し、保持atom、表現変更、意味変更、
  技術代替、未解決を分ける。差が小さい、後の文面が正しそう、実装が消えた等の理由で基準revisionを落とさない。
- `git show`でbytesを取得できることは要求採用、authority昇格、実装許可を意味しない。

## read-after contract

機械台帳は333行を持ち、IDは`PREISO-REV-000001..000333`で重複しない。各行について次を再確認する。

1. `baseline_commit:path`のGit blob OIDとSHA-256が台帳に一致する。
2. `pre_isolation_commit:path`、archive path、archive commitのblobとSHA-256が一致する。
3. 二つのblobが相違し、`revision_relation`が意味同値未確認を示す。
4. `meaning_change_applied`はfalse、successorとhuman decisionは空である。
5. 台帳全体のSHA-256を管理層の生存中`source_holding`へ束縛する。

旧CI、旧test、旧runtimeはこの監査で実行していない。比較はGit object、file bytes、SHA-256、JSONL fieldの
read-only静的照合だけで行った。
