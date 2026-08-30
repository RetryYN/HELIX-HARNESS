# L12 reviewed-safe inventory lifecycle 単体テスト設計

## 対応設計

- L6: `docs/design/helix/L6-function-design/l12-reviewed-safe-inventory-lifecycle.md`
- 実装: `src/lint/l12-hybrid-inventory-lifecycle.ts`
- doctor: `src/doctor/index.ts`

## Oracle

### U-L12INV-001 reviewed-safe familyの対称retire

実inventoryを入力し、Document Semantic DiffのL6／L8／PLANがreviewed-safe registryに存在し、
authority-review一覧から全てretireされ、doctor checkがgreenになることを確認する。

### U-L12INV-002 片側更新と件数driftの拒否

次のmutationを独立に加えてredになることを確認する。

- reviewed-safe PLANを§7へ再挿入する。
- bulletを増やして表示件数を追従させない。
- L8だけreviewed-safe registryから除外する。

### U-L12INV-003 doctor集約配線の固定

inventory lifecycle checkがdoctorのcheck state、全体`ok`、違反messageへ全て接続されていることを固定する。
集約helperへfalse stateを入力して全体失敗へ変換する振る舞いを検査し、実配線は意味token単位で確認する。
隣接check名、空白、コメント等の無関係なsource layoutへ依存しない。check stateまたは従来のboolean chainの
片側だけを削除しても、`doctorAllChecksOk`との二重束縛により違反を合格へ変換できないことを確認する。

## 受入条件

- 実inventoryがgreen。
- family memberの片側登録、retire漏れ、件数driftがtyped findingとして検出される。
- doctorの集約判定へ接続され、単体lintだけのdead gateにならない。
