# P27 data取得の型と索引（N+1と照会計画）の観察（D01 Software architecture）

status: scaffold（調査材料。採否、要求、設計、実装、BRAINへの登録の決定ではない）
authority_effect: none
binding: [SCF-B-0156](../../../bindings/SCF-B-0156.json)
素材の状態：本書の観察はすべて「未評価の候補素材」である。外部repositoryで採られていることは、HELIXでの成立を意味しない。値（閾値、既定値、timeout、件数上限、比、行数の目安等）は持ち込まない。既定の挙動（非数値。例：違反時に例外にするか記録するか）は記載し、数値の既定値は持ち込まない。技術選定・採用推奨ではない。

埋めようとしたgap：SCF-B-0155 D01 §4「性能の構造（cache、索引、N+1、負荷の集中点）をarchitectureの判断として扱う知識」。旧HELIXの台帳自身が性能設計書を`todo`と記録していた（D01-M12）。第3弾のP17はこのgapのうちcache層・合流・接続pool・backpressure等を扱い、索引とN+1は扱っていない（P17 §見つからなかったこと・gap）。本書は残りの「索引とN+1」について、関連dataの読込み方式（遅延・事前・batch）、N+1の検出と禁止、要求単位のbatchとcache、索引の宣言と照会計画の確かめ方を、どの入力で何を決め、どこに置かれるかとして観察した。

## 調べたrepository
| repo | URL | 固定commit | ライセンス(SPDX) | archived | 取得日 | 選んだ理由 |
|---|---|---|---|---|---|---|
| graphql/dataloader | https://github.com/graphql/dataloader | 65be452f5ffad3eede2d862dc26c96003fa87ef3（default branch: main） | MIT | false | 2026-10-05 | 要求単位のbatchとmemoize cacheの参照実装。batchの区切り、batch関数の契約、cacheの寿命と権限の関係がsourceとREADMEに明記されている |
| rails/rails | https://github.com/rails/rails | 4088f9d2ef00f9b85493362fb6f4b2526bd5d314（main） | MIT | false | 2026-10-05 | Active Recordが、事前読込みの3方式（includes／preload／eager_load）、遅延読込みの禁止（strict_loading）、同種の事前読込みのbatch化、関連読込みを含むEXPLAINを同じ層に持つ |
| django/django | https://github.com/django/django | a461af8ce48762d7ec602260aaff81014ddccbcb（main） | BSD-3-Clause | false | 2026-10-05 | select_related／prefetch_relatedに加え、main（6.1予定）でfetch mode（FETCH_ONE／FETCH_PEERS／FETCH_RAISE）を導入した。索引をmodelのMetaに宣言する方式と、DBごとの差の扱いが文書にある |
| prisma/orm（旧名 prisma/prisma。GitHub APIの`full_name`は`prisma/orm`） | https://github.com/prisma/orm | c882b03377e70c090d7bbe05cf85bf04fe9e33b2（main） | Apache-2.0 | false | 2026-10-05 | 次世代版（Prisma Next）のADRが、1照会を1文に限る、透過的なdata loaderを採らない、EXPLAINを予算として扱う、という判断と却下した代替を記録している。ADRと実装の差も読める |
| HypoPG/hypopg | https://github.com/HypoPG/hypopg | a9cf38c3f88f348c992f3510a65047131fe09a97（REL1_STABLE） | NOASSERTION（LICENSE冒頭：「Portions Copyright (c) 2015-2026, PostgreSQL GLobal Development Group」「Portions Copyright (c) 1994, The Regents of the University of California」に続き「Permission to use, copy, modify, and distribute this software and its …」の許諾文） | false | 2026-10-05 | 実在しない索引（hypothetical index）をplannerに見せ、作らずに照会計画への効果を確かめる。既存索引を隠す機能もある |
| ankane/pghero | https://github.com/ankane/pghero | 0efe3327aab12e40a53ec4e2bbc90b06499c9a10（master） | MIT | false | 2026-10-05 | PostgreSQLの統計viewから未使用索引・重複索引・不足索引を検出し、照会統計から索引案を出す。EXPLAINの安全な実行の仕方も実装している（pganalyze系の候補のうち、sourceが公開され本体を読めるものとして選んだ） |

（prisma/prismaはGitHub上でprisma/ormへrenameされており、APIは`prisma/orm`を返した。固定commitの内容は、従来のPrisma（Rust query engine）ではなく次世代版の構成で、`docs/architecture docs/adrs/`にADRがある。本書のpermalinkは`prisma/orm`で書いた。）

## 観察

### P27-O01 関連の事前読込みを3方式に分け、条件から方式を自動で選ぶ（includes／preload／eager_load）
- 出典：rails、`activerecord/lib/active_record/relation/query_methods.rb` 行187–258（https://github.com/rails/rails/blob/4088f9d2ef00f9b85493362fb6f4b2526bd5d314/activerecord/lib/active_record/relation/query_methods.rb#L187-L258）、行264–330（https://github.com/rails/rails/blob/4088f9d2ef00f9b85493362fb6f4b2526bd5d314/activerecord/lib/active_record/relation/query_methods.rb#L264-L330）、`activerecord/lib/active_record/relation.rb` 行1296–1308（https://github.com/rails/rails/blob/4088f9d2ef00f9b85493362fb6f4b2526bd5d314/activerecord/lib/active_record/relation.rb#L1296-L1308）、行1379–1386（https://github.com/rails/rails/blob/4088f9d2ef00f9b85493362fb6f4b2526bd5d314/activerecord/lib/active_record/relation.rb#L1379-L1386）。信頼性ラベル：primary（公式source repositoryのコードとAPI文書）。本文確認：済
- 何をしているか：
  - `preload`は関連ごとに別の照会を出し、親のkeyの集合で子をまとめて取る。`eager_load`は`LEFT OUTER JOIN`で1つの照会にする。`includes`は利用者が方式を選ばず、Rails側が決める。
  - 決め方は`eager_loading?`にある。`eager_load_values`があるか、`includes_values`があり、かつ`joins`と重なる関連があるか、`references`で参照したtableのうち、まだJOINされていないもの（`build_joins`で得たJOIN済みtableと自tableを除いたもの）があるなら、JOIN方式にする（`references_eager_loaded_tables?`、`relation.rb` 行1547–1561、https://github.com/rails/rails/blob/4088f9d2ef00f9b85493362fb6f4b2526bd5d314/activerecord/lib/active_record/relation.rb#L1547-L1561）。それ以外の`includes`は`preload_associations`で`preload_values`に足され、別照会で読まれる。
  - 文字列の条件で関連tableを参照するときは、`references`で明示しないとJOINにならず、誤りになる（同ファイル行227、345–363）。Hashで条件を渡すと`where`が自動で参照を付ける。
- 解いている問題と前提：親を読んだ後に関連へ1件ずつアクセスすると、親の件数だけ追加の照会が出る（N+1）。これを、照会の時点で「どの関連を使うか」を宣言させることで防ぐ。宣言は呼出し側（relationを組む側）に置かれる。
- 必要な入力：使う関連の名前（入れ子を含む）、関連側の条件を親の照会の条件に使うかどうか、文字列条件で参照するtable名。
- trade-off・失敗の仕方：
  - API文書は、JOINは重複した行を多く生み、規模が大きいと性能が悪いと書き（行204–206、288–289）、別照会の方が多くの場合に速いとしている。
  - JOIN方式で関連側に条件を付けると、その条件が親の絞込みと子の読込みの両方に効く。条件に合う子だけが読まれ、他の子が欠けた状態で関連に入る（行246–249のNOTE）。
  - `includes`の方式は条件の書き方で切り替わるため、同じ`includes`でも照会の形が変わる。
- 反例・適用しない場合：DjangoはJOIN方式（select_related）を単一値の関連に限り、自動では切り替えない（P27-O05）。Prisma Nextは読取りの`include`を1文に入れ、暗黙の別照会を許さない（明示の組立てによる複数文はADRが認めている。P27-O09）。
- 互換・非互換：P27-O02（別照会のbatch化）がpreload側の実体である。P27-O03・O04（遅延読込みの禁止）と組み合わせて、宣言漏れを検出する。
- 限界：IN句の大きさ、JOINの行数など、方式を分ける値の目安は持ち込まない。

### P27-O02 同じ形の事前読込みを照会単位にまとめ、段階ごとに進める（Preloader::Batch）
- 出典：rails、`activerecord/lib/active_record/associations/preloader/batch.rb` 行1–54（https://github.com/rails/rails/blob/4088f9d2ef00f9b85493362fb6f4b2526bd5d314/activerecord/lib/active_record/associations/preloader/batch.rb#L1-L54）、`activerecord/lib/active_record/associations/preloader/association.rb` 行9–39（https://github.com/rails/rails/blob/4088f9d2ef00f9b85493362fb6f4b2526bd5d314/activerecord/lib/active_record/associations/preloader/association.rb#L9-L39）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `Batch#call`は、複数のpreloaderの枝（branch）を集め、実行可能なloaderを1段ずつ処理する。各段で、既に読み込まれたrecordから関連を埋められるものを先に埋める（`associate_records_from_unscoped`）。
  - 後の段で読む予定のtableと同じtableを読むloaderは、その段では後回しにする（`future_tables`）。後回しにすると対象が空になる場合は、全loaderをそのまま実行する。
  - `group_and_load_similar`は、through関連を除くloaderを`[loader_query, klass]`でまとめ、同じ照会になるものを1回の`load_records_in_batch`で読む。`LoaderQuery#eql?`は、association keyの名前、table名、接続の指定名、照会の値（`values_for_queries`）が等しいことを同じ照会とみなす条件にしている。
- 解いている問題と前提：異なる親から同じtableの同じ形の関連を読むとき、親ごとに照会を出すと照会数が増える。照会の形が同じなら、keyの集合を合わせて1回で読める。
- 必要な入力：関連の木（入れ子）、各loaderの照会の形（scope、key列、接続先）、既に読み込まれたrecordの集合。
- trade-off・失敗の仕方：「同じ照会」の判定は値の等しさに依存し、scopeが少しでも違えば別の照会になる。through関連はまとめる対象から外れている。どの段で何が読まれるかは、関連の木と既読recordで変わり、呼出し側からは見えにくい。
- 反例・適用しない場合：DataLoaderは照会の形ではなく、loader instanceと実行の区切り（tick）でまとめる（P27-O07）。Djangoの`FETCH_PEERS`は、同じQuerySetから来たinstanceの集合（peers）でまとめる（P27-O06）。
- 互換・非互換：P27-O01のpreload方式の内部である。P27-O07と同じく「keyの集合で1回読む」形だが、まとめる範囲の決め方が異なる。
- 限界：`load_records_for_keys`（`association.rb` 行41–57、91–95、https://github.com/rails/rails/blob/4088f9d2ef00f9b85493362fb6f4b2526bd5d314/activerecord/lib/active_record/associations/preloader/association.rb#L41-L57）は、Ruby側ではkeyの集合を分割せず、`scope.where(association_key_name => keys)`の1回のINで読む。adapter側で分割されるかは確認していない。値は持ち込まない。

### P27-O03 遅延読込みを違反として扱い、宣言点を4つの粒度に置く（strict_loading）
- 出典：rails、`activerecord/lib/active_record/associations/association.rb` 行235–245（https://github.com/rails/rails/blob/4088f9d2ef00f9b85493362fb6f4b2526bd5d314/activerecord/lib/active_record/associations/association.rb#L235-L245）、行260–286（https://github.com/rails/rails/blob/4088f9d2ef00f9b85493362fb6f4b2526bd5d314/activerecord/lib/active_record/associations/association.rb#L260-L286）、`activerecord/lib/active_record/core.rb` 行93–94、261–270（https://github.com/rails/rails/blob/4088f9d2ef00f9b85493362fb6f4b2526bd5d314/activerecord/lib/active_record/core.rb#L261-L270）、`activerecord/lib/active_record.rb` 行422–426（https://github.com/rails/rails/blob/4088f9d2ef00f9b85493362fb6f4b2526bd5d314/activerecord/lib/active_record.rb#L422-L426）、`activerecord/lib/active_record/relation/query_methods.rb` 行1389–1401（https://github.com/rails/rails/blob/4088f9d2ef00f9b85493362fb6f4b2526bd5d314/activerecord/lib/active_record/relation/query_methods.rb#L1389-L1401）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 遅延読込みの入口`find_target`は、最初に`violates_strict_loading?`を確かめ、真なら`Base.strict_loading_violation!`を呼ぶ。
  - `violates_strict_loading?`は、targetを読む必要がない場合（`find_target?`が偽）、`skip_strict_loading`の中、validation中は違反にしない。関連の定義に`strict_loading:`の指定があればそれを優先し、なければ所有recordの`strict_loading?`（`n_plus_one_only`modeを除く）で決める。
  - 宣言点は4つある。classの既定（`strict_loading_by_default`、`strict_loading_mode`）、relation（`User.strict_loading`）、record（`strict_loading!`）、関連の定義（`has_many :comments, strict_loading: true`）。
  - 違反時の作用は全体設定`action_on_strict_loading_violation`で決まる。`:raise`なら`StrictLoadingViolationError`を送出し、`:log`なら`strict_loading_violation.active_record`の通知を出す。既定は`:raise`とcommentに書かれている。
- 解いている問題と前提：事前読込みの宣言漏れ（P27-O01）は、実行時に照会が増えるだけで機能上は正しく動くため、気づきにくい。遅延読込みそのものを違反にすると、宣言漏れが例外または通知として表に出る。
- 必要な入力：どの粒度で禁止するか（class、照会、record、関連）、違反を止めるか記録するか、validation等の例外にする文脈。
- trade-off・失敗の仕方：禁止は「読込みが起きた」ことを検出するもので、照会の数や重さを測るものではない。`:log`にすると違反は通知だけになり、処理は続く。validation中は違反にしない、という除外があるため、validationの中で起きる遅延読込みは検出されない（core.rb 行715のNOTE）。
- 反例・適用しない場合：Djangoの`FETCH_RAISE`は同じ目的だが、多対多・逆向きの多の関連（related manager）の照会には効かない（P27-O06）。Prisma Nextは遅延読込みの経路そのものを持たない（P27-O09）。
- 互換・非互換：P27-O04（N+1になるものだけを禁止するmode）と対になる。P27-O01の宣言と組み合わせて使う。
- 限界：classごとの既定値、環境ごとの切替えの値は持ち込まない。

### P27-O04 「N+1になる読込みだけ」を禁止する範囲の伝播（strict_loading_mode: :n_plus_one_only）
- 出典：rails、`activerecord/lib/active_record/core.rb` 行707–762（https://github.com/rails/rails/blob/4088f9d2ef00f9b85493362fb6f4b2526bd5d314/activerecord/lib/active_record/core.rb#L707-L762）、`activerecord/lib/active_record/associations/association.rb` 行123–129（https://github.com/rails/rails/blob/4088f9d2ef00f9b85493362fb6f4b2526bd5d314/activerecord/lib/active_record/associations/association.rb#L123-L129）、`activerecord/lib/active_record/reflection.rb` 行931、1021、1301–1305（https://github.com/rails/rails/blob/4088f9d2ef00f9b85493362fb6f4b2526bd5d314/activerecord/lib/active_record/reflection.rb#L1301-L1305）、`activerecord/lib/active_record/associations.rb` 行2033–2041（https://github.com/rails/rails/blob/4088f9d2ef00f9b85493362fb6f4b2526bd5d314/activerecord/lib/active_record/associations.rb#L2033-L2041）、`activerecord/lib/active_record/associations/collection_association.rb` 行301–307（https://github.com/rails/rails/blob/4088f9d2ef00f9b85493362fb6f4b2526bd5d314/activerecord/lib/active_record/associations/collection_association.rb#L301-L307）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `strict_loading!(value, mode:)`は、modeとして`:all`と`:n_plus_one_only`だけを受け付け、それ以外は`ArgumentError`にする。
  - `:n_plus_one_only`の所有recordは、自分の関連の遅延読込みでは違反にならない（`violates_strict_loading?`の最後の条件）。代わりに、遅延読込みで得たrecordへ`set_strict_loading`でmodeを伝える。所有側が`:n_plus_one_only`で、関連の`macro`が`:has_many`なら、読まれた各recordは`strict_loading!`（`:all`）になる。`ThroughReflection`は`AssociationReflection`のpublic methodを`delegate_reflection`へ委譲するため（reflection.rb 931、1301–1305）、`has_many :through`の`macro`も`HasManyReflection`の`:has_many`（同1021）になる。`has_and_belongs_to_many`は内部で`has_many :through`として定義される（associations.rb 2033–2041）ため、同じく`:has_many`として扱われる。条件から外れる関連は、`has_one :through`などの単一関連である。それ以外は、strictを無効にしたうえで所有側のmodeを引き継ぐ。
  - 文書の例では、1件のuserから`comments`を読むのは許され、その各commentからさらに`ratings`を読むと違反になる。
- 解いている問題と前提：1件の親から関連を読むことは1回の照会で済み、N+1ではない。N+1になるのは、集合の各要素からさらに関連を読むときである。禁止の範囲を「集合の要素から先」に絞り、すべての遅延読込みを禁止したときの誤検出を減らす。
- 必要な入力：関連の種類（`macro`が`:has_many`かどうか。through・HABTMを含む）、所有recordのmode。
- trade-off・失敗の仕方：判定は関連の`macro`だけで行い、実際の件数は見ない。単一関連（`has_one`、`has_one :through`、`belongs_to`）で読んだrecordはstrictを無効にしてmodeだけを引き継ぐため、そこからさらに集合関連を読んだときに初めて要素がstrictになる。
- 反例・適用しない場合：Djangoのfetch modeは、modeを関連のinstanceへ引き継ぐが、N+1になるかどうかで範囲を変えるmodeはない（P27-O06）。
- 互換・非互換：P27-O03の範囲を狭めた変種である。
- 限界：through・HABTMの扱いは、reflectionの委譲とHABTMの定義のcodeから読んだもので、testやissueで確かめてはいない。

### P27-O05 JOINで取る関連と別照会で取る関連を、関連の多重度で分ける（select_related／prefetch_related／Prefetch）
- 出典：django、`docs/ref/models/querysets.txt` 行1065–1076（https://github.com/django/django/blob/a461af8ce48762d7ec602260aaff81014ddccbcb/docs/ref/models/querysets.txt#L1065-L1076）、行1174–1205（https://github.com/django/django/blob/a461af8ce48762d7ec602260aaff81014ddccbcb/docs/ref/models/querysets.txt#L1174-L1205）、行1367–1374（https://github.com/django/django/blob/a461af8ce48762d7ec602260aaff81014ddccbcb/docs/ref/models/querysets.txt#L1367-L1374）、行4300–4352（https://github.com/django/django/blob/a461af8ce48762d7ec602260aaff81014ddccbcb/docs/ref/models/querysets.txt#L4300-L4352）。信頼性ラベル：primary（公式repository内の参照文書）。本文確認：済
- 何をしているか：
  - `select_related`はSQLのJOINで関連のfieldをSELECTに含め、同じ照会で取る。多の側をJOINすると結果が大きくなるため、単一値の関連（foreign key、one-to-one）に限る。
  - `prefetch_related`は関連ごとに別の照会を出し、Python側で結び付ける。多対多、多対一の逆向き、GenericRelationも扱える。多くの場合`IN`演算子で実装されるため、大きなQuerySetでは大きな`IN`句ができ、DBによっては構文解析や実行に問題が出うる、と文書が注意している。
  - `Prefetch(lookup, queryset=None, to_attr=None)`で、別照会の基になるQuerySet（絞込み、`select_related`の追加）と、結果を置く属性名を指定できる。`to_attr`を使うと結果はlistに入り、元の関連managerの結果とは別になる。
  - `iterator()`で実行する場合、`prefetch_related`は`chunk_size`を指定したときだけ効く。
- 解いている問題と前提：N+1を防ぐ方式を、関連の多重度という構造上の性質で振り分ける。Railsの`includes`（P27-O01）のように条件で自動に切り替えず、利用者が方式を明示する。
- 必要な入力：関連の多重度、別照会側の絞込みと並び、結果を置く場所（既定の関連か、別の属性か）、結果を一括で持つか分割で読むか。
- trade-off・失敗の仕方：
  - `Prefetch`の`queryset`で絞り込んだ結果を既定の関連名に入れると、関連が絞込み済みの部分集合になる。`to_attr`を使えば別の名前に分けられる（文書の例は、`to_attr`を使った場合に元の`choice_set.all()`が全件を返すことを示している）。
  - GenericForeignKeyの事前読込みは、参照先のtableの数だけ照会が要り、照会数はdataに依存する（行1360–1366）。
- 反例・適用しない場合：Prisma Nextは読取りの`include`を1文に入れ、暗黙の別照会での結び付けを許さない（明示の組立てによる複数文や、変更後の読み戻しの別の文はある。P27-O09）。DataLoaderはORMの外で、任意のbackendに対して同じことをする（P27-O07）。
- 互換・非互換：P27-O06（fetch mode）は、宣言しなかった関連へのアクセスを扱う、補完の関係にある。文書は、fetch modeで足りない場合に`select_related`／`prefetch_related`を使うと書いている（P27-O06の出典）。
- 限界：`IN`句の大きさの目安などの値は持ち込まない。

### P27-O06 宣言しなかった読込みの振る舞いをmodeとして選ぶ（Djangoのfetch mode）
- 出典：django、`django/db/models/fetch_modes.py` 行1–61（https://github.com/django/django/blob/a461af8ce48762d7ec602260aaff81014ddccbcb/django/db/models/fetch_modes.py#L1-L61）、`django/db/models/query.py` 行175–185（https://github.com/django/django/blob/a461af8ce48762d7ec602260aaff81014ddccbcb/django/db/models/query.py#L175-L185）、`django/db/models/fields/related_descriptors.py` 行265–292（https://github.com/django/django/blob/a461af8ce48762d7ec602260aaff81014ddccbcb/django/db/models/fields/related_descriptors.py#L265-L292）、`docs/topics/db/fetch-modes.txt` 行1–143（https://github.com/django/django/blob/a461af8ce48762d7ec602260aaff81014ddccbcb/docs/topics/db/fetch-modes.txt#L1-L143）、`docs/topics/db/optimization.txt` 行197–232（https://github.com/django/django/blob/a461af8ce48762d7ec602260aaff81014ddccbcb/docs/topics/db/optimization.txt#L197-L232）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - fetch modeは、読み込まれていないfieldへのアクセス時の振る舞いを、`FetchMode.fetch(fetcher, instance)`という1つの口で切り替える。`FETCH_ONE`は当該instanceだけを読む（既定）。`FETCH_PEERS`は同じQuerySetから来たinstance（peers）のうち未読のものをまとめて読む。`FETCH_RAISE`は`FieldFetchBlocked`を送出する。
  - `FETCH_PEERS`では、QuerySetのiteratorが各instanceに共有のpeers listを持たせる（`track_peers`が真のとき、弱参照のlistに追加する）。foreign keyのdescriptorは`fetch_many`で未cacheのpeersに`prefetch_related_objects`を呼ぶ。peerが1件しか残っていなければ`fetch_one`になる。
  - 対象はforeign key、one-to-oneとその逆、`defer`／`only`で後回しにしたfield、generic relationである。fetch modeは読み込んだ関連objectへ引き継がれ、関係の木全体に効く。related managerにも引き継がれるが、managerの照会自体にはfetch modeは効かない（文書行32–35）。
  - modelの既定にするには、custom managerの`get_queryset()`で`fetch_mode()`を付ける。
- 解いている問題と前提：どの関連を使うかを事前に予測しにくい場合に、宣言（P27-O05）なしで、最初のアクセスを契機に「同じ集合の残り」をまとめて読む。文書は、同じ集合の要素は同じように処理される、という仮定に基づくと書いている。禁止（`FETCH_RAISE`）も同じ口で選べる。
- 必要な入力：QuerySetまたはmodel既定のmode、同じQuerySetから来たinstanceの集合（実行時に自動で作られる）。
- trade-off・失敗の仕方：
  - `FETCH_PEERS`は「集合の全要素が同じ関連を使う」という仮定が外れると、使わないdataまで読む。peersは弱参照で、捨てられたinstanceは対象から外れる（memory leakの回避と文書は書く）。
  - 多対多や逆向きの多の関連（related manager）の照会は対象外で、そこでのN+1は`FETCH_RAISE`でも止まらない。Railsの`strict_loading`（P27-O03）は`has_many`も対象にする。
  - main（6.1予定）の機能であり、release前の固定commitの観察である。
- 反例・適用しない場合：Prisma Nextは遅延読込みを持たない（P27-O09）。Railsは自動のbatch化（peers）を持たず、禁止（strict_loading）と宣言（preload）の組合せで扱う（P27-O03）。
- 互換・非互換：P27-O05と補完の関係。P27-O03と「禁止」の目的は同じで、範囲（関連の種類）が異なる。P27-O07と「最初のアクセスを契機にまとめる」点が近いが、まとめる単位がQuerySetの集合か実行の区切りかで異なる。
- 限界：fetch modeの導入の判断記録（ticketや議論）は読んでいない。

### P27-O07 実行の区切り（tick）でkeyを集め、batch関数の契約で結果を位置合わせする（DataLoader）
- 出典：graphql/dataloader、`src/index.js` 行74–113（https://github.com/graphql/dataloader/blob/65be452f5ffad3eede2d862dc26c96003fa87ef3/src/index.js#L74-L113）、行212–260（https://github.com/graphql/dataloader/blob/65be452f5ffad3eede2d862dc26c96003fa87ef3/src/index.js#L212-L260）、行272–382（https://github.com/graphql/dataloader/blob/65be452f5ffad3eede2d862dc26c96003fa87ef3/src/index.js#L272-L382）、`README.md` 行88–160（https://github.com/graphql/dataloader/blob/65be452f5ffad3eede2d862dc26c96003fa87ef3/README.md#L88-L160）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `load(key)`は、現在のbatchにkeyとresolve／rejectの組を積み、Promiseを返す。batchは`getCurrentBatch`で、未dispatchかつ上限件数内なら再利用され、そうでなければ新しく作られ、`batchScheduleFn`でdispatchが予約される。
  - 既定の予約`enqueuePostPromiseJob`は、Nodeでは解決済みPromiseの`then`の中で`process.nextTick`を呼び、現在の実行frameと、その後のPromise jobの処理が終わった後にdispatchする。Node以外では`setImmediate`、なければ`setTimeout`を使い、commentはmacrotaskになる分の性能上の不利を書いている。
  - 利用者が守る契約：READMEは、値の配列はkeyと同じ長さで、各位置がkeyの位置に対応することを契約とし、backendが順序を変えたり欠けたりする場合はbatch関数側で並べ直し、欠けをnullかErrorで埋めることを求めている。
  - runtimeが検出する違反：`dispatchBatch`が検出するのは形状と長さだけである。batch関数が同期的に例外を出す、Promiseを返さない、解決値がarray-likeでない、keyと長さが違う、のいずれかを`TypeError`にする（https://github.com/graphql/dataloader/blob/65be452f5ffad3eede2d862dc26c96003fa87ef3/src/index.js#L343-L380）。各位置の値`values[i]`がkey`i`に対応するかは検査せず、そのまま`callbacks[i]`へresolveする。
  - 値が`Error`のinstanceなら、そのkeyのPromiseだけをrejectする。
- 解いている問題と前提：GraphQLのresolverのように、互いを知らない多数の箇所が個別にkeyを要求する場合に、呼出し側を変えずに照会をまとめる。まとめる範囲は時間（実行の区切り）で決まり、照会の形は利用者のbatch関数が決める。
- 必要な入力：keyの配列を受けて同じ長さの値の配列を返すbatch関数、batchの上限件数、dispatchの予約関数、loaderをどの範囲で共有するか（P27-O08）。
- trade-off・失敗の仕方：
  - 既定の区切りは追加の待ちを入れない代わりに、別のtickに分かれた要求は別のbatchになる。READMEは、要求が数tickに分かれる場合に、待ち時間を入れる予約関数を与える例を示し、その分の遅延が増えると書いている（値は持ち込まない）。
  - runtimeが検出する形状・長さの違反（上記）は、batch全体の失敗になる（`failedDispatch`で全keyをreject）。一方、長さが同じで順序だけが違う値は検出されず、各keyの呼出し側に別のkeyの値が返りうる。位置の対応は、batch関数を書く利用者の責務である。
- 反例・適用しない場合：Prisma NextのADR 003は、自動のbatch化と透過的なdata loaderを、非決定性をもたらし予算とlintを複雑にするとして採らなかった（P27-O09）。RailsのPreloaderは時間ではなく照会の形でまとめる（P27-O02）。
- 互換・非互換：P27-O08（要求単位のcache）と同じloaderに同居する。P27-O06の`FETCH_PEERS`と、最初のアクセスを契機にまとめる点が近い。
- 限界：batchの上限件数、待ち時間の値は持ち込まない。他言語の移植（README「Other Implementations」）は読んでいない。

### P27-O08 cacheを要求の寿命に閉じ、要求ごとにloaderを作って要求の認証情報を束ねる（per-request memoization）
- 出典：graphql/dataloader、`README.md` 行186–302（https://github.com/graphql/dataloader/blob/65be452f5ffad3eede2d862dc26c96003fa87ef3/README.md#L186-L302）、行517–545（https://github.com/graphql/dataloader/blob/65be452f5ffad3eede2d862dc26c96003fa87ef3/README.md#L517-L545）、`src/index.js` 行83–110、150–203（https://github.com/graphql/dataloader/blob/65be452f5ffad3eede2d862dc26c96003fa87ef3/src/index.js#L150-L203）、行383–397（https://github.com/graphql/dataloader/blob/65be452f5ffad3eede2d862dc26c96003fa87ef3/src/index.js#L383-L397）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - cacheはkey→Promiseのmemoizeで、`load`の結果のPromiseそのものを保存する。cache hitは即座に解決せず、同じbatchのdispatch時に新しく読んだ値と同じmicrotaskで解決する。READMEは、こうしないと後続の依存する読込みが別のtickに分かれ、照会数が増えると例で説明している。
  - READMEは、このcacheがRedisやMemcache等の共有cacheの代わりではなく、1つの要求の中で同じdataを繰り返し読まないためのものだと書く。異なる利用者の要求で同じinstanceを使うと、他人のcache済みdataが見えうるため、要求の開始時に作り、要求の終わりで使わなくすることを勧めている（行200–203）。「Common Patterns」も、利用者ごとに権限が違うことを理由に、要求ごとに新しいloaderを作ることを勧め（行519–524）、要求の認証情報を渡してloader群を作る例を示している。
  - 同じ要求の中で更新した場合は`clear(key)`で無効化する。batch全体の失敗ではcacheしない（`failedDispatch`が各keyを`clear`する）。個別の値が`Error`のときはcacheされ、必要なら呼出し側が`clear`する。
  - `prime(key, value)`は、未cacheのときだけ値を入れる。`cacheKeyFn`でkeyの同一性を、`cacheMap`でcacheの実装を差し替えられる。
- 解いている問題と前提：同じ要求の中で同じkeyが何度も要求されることと、batchの位置合わせ（P27-O07）を両立する。cacheの寿命を要求に閉じることで、無効化の問題を「要求内の更新」だけに狭める。
- 必要な入力：loaderの寿命（要求単位）、要求の権限（認証情報）、要求内の更新の箇所、errorをcacheするかの方針。
- trade-off・失敗の仕方：
  - 要求をまたいでloaderを共有すると、権限の違う利用者にcache済みdataが見えうる（README）。
  - 個別の`Error`はcacheされるため、一時的な失敗も要求の終わりまで残る。
  - cacheは共有cacheの代わりにならず、要求をまたぐ重複は減らさない。
- 反例・適用しない場合：P17のcache層（要求をまたぐ共有cacheと無効化）とは寿命と目的が異なる。Djangoは評価済みQuerySetの結果を持つが、要求単位のloaderという形ではない（optimization.txt 行66–105。本書では詳しく読んでいない）。
- 互換・非互換：P27-O07と同じinstanceの性質である。要求ごとにloaderを作り要求の認証情報を束ねる点は、P05（認可model）の判定の結果をcacheが要求をまたいで持ち越さないための構造として読める。
- 限界：`cacheMap`にLRU等を入れる場合の挙動は読んでいない。

### P27-O09 1照会を1文に限り、関連の読込みを1文の中へ下ろす（Prisma NextのADR 003）
- 出典：prisma/orm、`docs/architecture docs/adrs/ADR 003 - One Query One Statement.md` 行1–103（https://github.com/prisma/orm/blob/c882b03377e70c090d7bbe05cf85bf04fe9e33b2/docs/architecture%20docs/adrs/ADR%20003%20-%20One%20Query%20One%20Statement.md#L1-L103）、`packages/3-extensions/sql-orm-client/src/query-plan-select.ts` 行1297–1377（https://github.com/prisma/orm/blob/c882b03377e70c090d7bbe05cf85bf04fe9e33b2/packages/3-extensions/sql-orm-client/src/query-plan-select.ts#L1297-L1377）、`packages/3-extensions/sql-orm-client/src/collection-dispatch.ts` 行413–429（https://github.com/prisma/orm/blob/c882b03377e70c090d7bbe05cf85bf04fe9e33b2/packages/3-extensions/sql-orm-client/src/collection-dispatch.ts#L413-L429）。信頼性ラベル：primary（公式repositoryのADRとコード）。本文確認：済
- 何をしているか：
  - ADR 003は、query laneが作るPlanはちょうど1つのDB文にcompileされなければならない、と決めている。隠れた追加の読み書きを許さない。CTE、lateral join、window関数、JSON集約、RETURNINGは1文に含めてよい。
  - 禁止するものとして、暗黙の2段目の読込み（idを取ってから関連を取る）、広く読んでからclient側で絞る・並べる・pageする、複数段のupsertを挙げる。複数文が要る場合は、transactionやpipelineという明示の組立てAPIで書き、各段を別のPlanとして検証する（行17、44）。1文の規則はPlan（query lane）単位のもので、明示の組立てによる複数文は認められている。
  - 変更（create、update、upsert等）に`include`を付けた場合、変更は識別列だけを返し、その後に読取りの経路を通して`identity IN (...)`で読み戻す別の文を出す（`collection-dispatch.ts`のcomment）。読み戻しは変更と同じruntime、つまり同じtransactionで走るとcommentは書いている。
  - 却下した代替として、DSL内の隠れた複数照会への展開、自動batchと透過的なdata loader（特定の場合には役立つが、非決定性を持ち込み、予算とlintを複雑にする）、stored procedureへの集約を記録している。
  - 実装では、ORM clientの`include`を、子の行を`json_agg`で1つのJSON配列列にまとめる相関subqueryとして親のSELECTの射影に入れる（`buildIncludeChildRowsAggregateSelect`、`buildCorrelatedIncludeProjection`）。ADRの例はN件の関連を`LEFT JOIN LATERAL`＋`json_agg`で下ろすと書いており、今回読んだ実装の箇所は相関subqueryの形だった。
- 解いている問題と前提：ADRは、従来版が1つの高水準呼出しを複数の往復へ展開していたため、性能が予測しにくく、guardrailやagentが照会を推論しにくかったとする。文の境界を1つにすれば、EXPLAIN予算やplanのhashが1文に対して意味を持つ（P27-O10）。PostgreSQL等のSQL engineが1文の合成（JOIN、CTE、lateral、JSON集約）を持つことが前提である。
- 必要な入力：関連の木（多重度）、DBが1文の合成をどこまでできるかという能力（adapter capability）、複数文が要る処理の明示の組立て。
- trade-off・失敗の仕方：ADRは、高水準のpatternの一部がcompilerの仕事か明示の組立てになり、client側で結合していた既存codeは書き換えが要ると書いている。ADRのMVP範囲外として、DSL内の自動batchとN+1の除去を挙げている。1文に入れた結果が大きい・重い場合の扱いは、このADRでは予算（P27-O10）に委ねている。
- 反例・適用しない場合：Rails（P27-O01）とDjango（P27-O05）は別照会での結び付けを主な方式にし、文書もJOINより速い場合が多いとしている。DataLoader（P27-O07）は、このADRが却下した方式そのものである。
- 互換・非互換：P27-O10（文単位のEXPLAIN予算）の前提になる。P27-O03・O06の「遅延読込みの禁止」は、遅延読込みの経路がないこの方式では不要になる。
- 限界：ADRと実装の差（lateralか相関subqueryか）は、今回読んだ箇所だけの観察である。`where-binding.ts`には`join.lateral`の参照があるが読んでいない。

### P27-O10 EXPLAINを環境別の予算として設計し、実装は静的な行数推定から始めている（ADR 023・115と`budgets`）
- 出典：prisma/orm、`docs/architecture docs/adrs/ADR 023 - Budget Evaluation.md` 行1–86（https://github.com/prisma/orm/blob/c882b03377e70c090d7bbe05cf85bf04fe9e33b2/docs/architecture%20docs/adrs/ADR%20023%20-%20Budget%20Evaluation.md#L1-L86）、`docs/architecture docs/adrs/ADR 115 - Extension guardrails & EXPLAIN policies.md` 行20–93（https://github.com/prisma/orm/blob/c882b03377e70c090d7bbe05cf85bf04fe9e33b2/docs/architecture%20docs/adrs/ADR%20115%20-%20Extension%20guardrails%20%26%20EXPLAIN%20policies.md#L20-L93）、`packages/2-sql/5-runtime/src/middleware/budgets.ts` 行1–181（https://github.com/prisma/orm/blob/c882b03377e70c090d7bbe05cf85bf04fe9e33b2/packages/2-sql/5-runtime/src/middleware/budgets.ts#L1-L181）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - ADR 023は、予算を行数・待ち時間・SQLの大きさの3つに分け、安い静的検査を実行前に、測定を実行後に置く順序を決めている。EXPLAINはadapterを通して行い、CIとpreflightでは既定で行い、本番では既定で行わない。EXPLAIN ANALYZEは照会を実行するため既定で無効にする。結果はSQLの指紋（placeholder化した正規化SQL）とcontractのhash・adapterのprofile hashで鍵を作ってcacheし、contractやadapterが変わったら無効にする。
  - EXPLAINが使えない、無効、時間切れのときの代替として、読込みには一意keyの等値等で範囲が限られる場合を除きLIMITを求め、書込みにはWHEREと等値条件の索引の被覆を確かめる、とADRは書く。
  - ADR 115は、拡張（pgvector、PostGIS）について、演算子が対応する索引を要する、parameterの次元等が列と合う、等の静的前提と、EXPLAINを要求する条件を、拡張ごとのruleとして持たせる設計を記録している。本番では静的検査だけを既定にし、索引を暗黙に作ることは目標外としている。
  - 固定commitの`budgets.ts`は、EXPLAINを呼ばない。SELECTのASTから、主tableの行数見込み（設定値または既定値）とLIMITで行数を推定し、LIMITのないSELECT（groupなしの集約を除く）を予算超過として扱う。実行中は行を数え、上限を超えたらseverityやmodeに関係なく常に例外にする（行133–144）。実行後に待ち時間を比べる。違反をerrorにするかwarnにするかを設定のseverityと実行modeの`strict`で切り替えるのは、実行前の推定（行150–179）と待ち時間（行113–124）だけである。
- 解いている問題と前提：照会計画（索引が使われるか、何行読むか）を、人が個別にEXPLAINを読むのではなく、文単位の予算として機械で確かめる。1照会1文（P27-O09）が前提である。
- 必要な入力：環境（dev、CI、本番）、予算の種類ごとの上限とseverity、tableごとの行数見込み、EXPLAINのcache鍵の成分（SQLの指紋、schemaのhash、adapterのprofile）。
- trade-off・失敗の仕方：
  - ADRどおりなら、本番ではEXPLAINせず、CIでの見積りと本番のplanが食い違う可能性が残る。ADR 023はparameterをcache鍵に含めないため、parameterでplanが変わる照会は、adapterが`paramSensitive`を宣言しない限り同じ結果を使う。
  - 実装は静的推定だけで、実際の索引の有無はこの箇所では見ていない。ADRの記述をそのまま実装の保証として読むと誤る。
- 反例・適用しない場合：RailsとDjangoのEXPLAINは、利用者が呼ぶ診断の道具で、予算としての自動判定はない（P27-O11）。PgHeroは本番の統計から事後に検出する（P27-O14）。
- 互換・非互換：P27-O09を前提にする。P27-O13（仮想索引）とは、「作らずに計画を見る」点で補い合いうるが、ADR 115は索引を暗黙に作らないことだけを書き、仮想索引には触れていない。
- 限界：ADRのconfiguration例と`budgets.ts`には既定値（行数、待ち時間、timeout、sampling率等）があるが、持ち込まない。`lints.ts`（LIMITなし、WHEREなしのDELETE／UPDATE等）は見出しだけ確認した。

### P27-O11 ORMの照会単位でEXPLAINを取り、関連読込みの照会も含める（Rails／Django、PgHeroの安全な実行）
- 出典：rails、`activerecord/lib/active_record/relation.rb` 行316–345（https://github.com/rails/rails/blob/4088f9d2ef00f9b85493362fb6f4b2526bd5d314/activerecord/lib/active_record/relation.rb#L316-L345）、`activerecord/lib/active_record/explain.rb` 行1–37（https://github.com/rails/rails/blob/4088f9d2ef00f9b85493362fb6f4b2526bd5d314/activerecord/lib/active_record/explain.rb#L1-L37）。django、`docs/ref/models/querysets.txt` 行3148–3175（https://github.com/django/django/blob/a461af8ce48762d7ec602260aaff81014ddccbcb/docs/ref/models/querysets.txt#L3148-L3175）、`docs/topics/db/optimization.txt` 行10–31（https://github.com/django/django/blob/a461af8ce48762d7ec602260aaff81014ddccbcb/docs/topics/db/optimization.txt#L10-L31）。pghero、`lib/pghero/methods/explain.rb` 行1–40（https://github.com/ankane/pghero/blob/0efe3327aab12e40a53ec4e2bbc90b06499c9a10/lib/pghero/methods/explain.rb#L1-L40）、`app/controllers/pg_hero/home_controller.rb` 行304–339（https://github.com/ankane/pghero/blob/0efe3327aab12e40a53ec4e2bbc90b06499c9a10/app/controllers/pg_hero/home_controller.rb#L304-L339）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - Railsの`relation.explain`は、relationが出す照会を集めてそれぞれにEXPLAINを付ける。`collecting_queries_for_explain`が実行中の照会を登録簿に集め、`exec_explain`が各SQLとbind値にEXPLAINを実行する。文書は、eager loadingでは後の照会が前の照会の結果を要するため、このmethodは実際に照会を実行すると書いている。`count`や`first`等は`explain`の後に呼ぶことでEXPLAINの対象にできる。
  - Djangoの`QuerySet.explain(format=None, **options)`は、DBが照会をどう実行するか（索引やJOIN）を文字列で返す。出力はDBごとに大きく異なり、Oracleでは提供しない。最適化の文書は、まずprofileし、変更のたびにprofileすることを求め、`explain()`をその手段に挙げている。
  - PgHeroの`explain`は、EXPLAINをtransactionの中でstatement timeout付きで実行し、必ずrollbackする。複数文を1回で実行できるDB接続の場合は、`;`や`COMMIT`を含むSQLを拒否する（`explain_safe?`）。UIでは、ANALYZE（実行を伴う）を設定で別に許可する形にしている。設定のmodeが`analyze`のときだけ許可の旗が立ち（行312）、許可がないのにANALYZEを求めると要求を拒否する（行336–339）。
- 解いている問題と前提：N+1の対策（P27-O01・O05）や索引（P27-O12）が効いているかを、ORMの照会の単位で確かめる。ORMが組み立てたSQLを利用者が書き写さずに計画を見られる。
- 必要な入力：対象の照会（relation／QuerySet）、DBの種類と出力形式、ANALYZEを許すか（実行を伴うか）、時間の上限。
- trade-off・失敗の仕方：Railsのexplainは事前読込みの照会を集めるために実際に実行するため、副作用のない照会であっても負荷がかかる。Djangoの出力はDBに依存し、比べるには同じDBが要る。ANALYZEは実行を伴うため、PgHeroは別の許可にし、rollbackで書込みの影響を戻す。
- 反例・適用しない場合：Prisma NextのADRは、EXPLAINを利用者の呼出しではなく予算の自動判定に置く（P27-O10）。HypoPGは、存在しない索引でのEXPLAINを見せる（P27-O13）。
- 互換・非互換：P27-O13と組み合わせると、索引を作る前に計画を比べられる（HypoPGはANALYZEなしのEXPLAINだけで効く）。
- 限界：timeoutの値、出力の形式の詳細は持ち込まない。Railsの`ExplainRegistry`の集め方の詳細は読んでいない。

### P27-O12 索引をmodelに宣言し、DBが対応しない指定は無視される（DjangoのIndex）
- 出典：django、`docs/ref/models/indexes.txt` 行1–205（https://github.com/django/django/blob/a461af8ce48762d7ec602260aaff81014ddccbcb/docs/ref/models/indexes.txt#L1-L205）、`docs/topics/db/optimization.txt` 行33–50（https://github.com/django/django/blob/a461af8ce48762d7ec602260aaff81014ddccbcb/docs/topics/db/optimization.txt#L33-L50）、行158–195（https://github.com/django/django/blob/a461af8ce48762d7ec602260aaff81014ddccbcb/docs/topics/db/optimization.txt#L158-L195）。信頼性ラベル：primary（公式repository内の参照文書）。本文確認：済
- 何をしているか：
  - `Index(*expressions, fields=(), name=None, db_tablespace=None, opclasses=(), condition=None, include=None)`を`Meta.indexes`に宣言し、migrationでDBへ反映する。式による索引、列の並び（降順指定）、部分索引（`condition`にQを渡す）、covering index（`include`）、operator class（`opclasses`）を宣言できる。
  - DBごとの差を文書が列挙している。`opclasses`と`include`はPostgreSQL以外では無視される。`condition`はMySQL／MariaDBでは無視され、Oracleは部分索引を持たないため関数索引とCase式で代用できる。PostgreSQLでは条件中の関数がIMMUTABLEでなければならず、Djangoは検証しないためDB側のerrorになる。`condition`、`include`、`opclasses`を使うときは名前が必須である。
  - 最適化の文書は、索引をprofileで必要と分かった後に足すことを最優先とし、filter・exclude・order_byで頻繁に使うfieldを候補に挙げる。最良の索引はDBとapplicationに依存し、索引の維持の負担が照会の利得を上回りうるとも書く。一意で索引付きの列で1件を取ることも勧めている。
- 解いている問題と前提：索引をschema（model）と同じ場所に宣言して、版管理とmigrationに乗せる。照会の書き方（filter、order_by）と索引の宣言が同じcodebaseにある。
- 必要な入力：照会で使う列と並び、部分索引の条件、covering用の列、対象DBの対応範囲。
- trade-off・失敗の仕方：DBが対応しない指定は黙って無視されるため、同じ宣言でもDBによって索引の実体が変わる（例：MySQLでは部分索引が全体の索引になるのか作られないのかは、この文書の範囲では確かめていない）。宣言が照会で実際に使われるかは、宣言からは分からない（P27-O11、O14で確かめる）。
- 反例・適用しない場合：Prisma NextのADR 115は、索引を暗黙に作ることを目標外とし、索引の存在を前提条件として検査する側に置く（P27-O10）。PgHeroは本番の統計から逆向きに、使われていない索引を見つける（P27-O14）。
- 互換・非互換：P27-O13（作る前に効果を見る）、P27-O14（作った後に使用を見る）と、索引のlifecycleの前後をなす。
- 限界：Railsのmigrationでの索引宣言（`add_index`のoption）は今回読んでいない。

### P27-O13 実在しない索引をplannerにだけ見せて、作らずに計画への効果を確かめる（HypoPG）
- 出典：HypoPG/hypopg、`README.md` 行1–192（https://github.com/HypoPG/hypopg/blob/a9cf38c3f88f348c992f3510a65047131fe09a97/README.md#L1-L192）、`hypopg.c` 行424–460（https://github.com/HypoPG/hypopg/blob/a9cf38c3f88f348c992f3510a65047131fe09a97/hypopg.c#L424-L460）、行512–585（https://github.com/HypoPG/hypopg/blob/a9cf38c3f88f348c992f3510a65047131fe09a97/hypopg.c#L512-L585）、`docs/usage.rst` 行83–92、205–222（https://github.com/HypoPG/hypopg/blob/a9cf38c3f88f348c992f3510a65047131fe09a97/docs/usage.rst#L83-L92）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - `hypopg_create_index('CREATE INDEX ...')`で、DBに索引を作らず、backend（接続）のmemoryに仮想索引を登録する。plannerのhook（`get_relation_info_hook`、新しいPostgreSQLでは`build_simple_rel`のhook）で、対象tableの索引listに仮想索引を差し込む。
  - 差し込むのは、現在の文がANALYZEを含まないEXPLAINのときだけである（`hypo_is_simple_explain`がEXPLAINのoptionに`analyze`があれば偽を返す）。EXPLAIN ANALYZEは実際に実行するため、仮想索引は使われない。
  - 既存の索引を隠す`hypopg_hide_index`があり、同じhookの中で`hypo_hideIndexes`が適用される。隠すことも現在のsessionのEXPLAINにだけ効き、他のsessionには影響しない。
  - 仮想索引の大きさを推定する関数（`hypopg_relation_size`）がある。対応するaccess methodは限られている（btree、brin、hash、bloom）。
- 解いている問題と前提：索引の追加の効果を、作成の費用（CPU、disk、lock）を払わずに、plannerの判断で確かめる。既存索引の削除の効果も、消さずに確かめる。plannerの見積りが前提であり、実行時間ではない。
- 必要な入力：候補の索引定義（`CREATE INDEX`文）、確かめたい照会、隠したい既存索引、対象のaccess method。
- trade-off・失敗の仕方：見積りだけで、EXPLAIN ANALYZEの実測では確かめられない。仮想索引はbackendに閉じるため、connection poolを介すると別の接続で見えない。`CREATE INDEX`文の一部（索引名等）は無視される。対応しないaccess methodの索引は試せない。
- 反例・適用しない場合：PgHeroの索引案（P27-O14）は、plannerではなく列の統計から自前で推定する。Prisma NextのADRは、計画の確認をCIのEXPLAIN予算に置く（P27-O10）。
- 互換・非互換：P27-O11（EXPLAIN）を前提にした道具である。P27-O14の「重複・未使用索引」を、隠す機能で消す前に確かめる使い方が考えられるが、その組合せはどちらのrepoにも書かれていない。
- 限界：PostgreSQL専用。PostgreSQLのversionごとのhookの差の詳細と、`hypopg_index.c`の索引の推定の中身は読んでいない。

### P27-O14 統計viewから未使用・重複・不足の索引を検出し、照会統計から索引案を出す（PgHero）
- 出典：pghero、`lib/pghero/methods/indexes.rb` 行49–101（https://github.com/ankane/pghero/blob/0efe3327aab12e40a53ec4e2bbc90b06499c9a10/lib/pghero/methods/indexes.rb#L49-L101）、行119–128、173–187（https://github.com/ankane/pghero/blob/0efe3327aab12e40a53ec4e2bbc90b06499c9a10/lib/pghero/methods/indexes.rb#L173-L187）、行330–332（https://github.com/ankane/pghero/blob/0efe3327aab12e40a53ec4e2bbc90b06499c9a10/lib/pghero/methods/indexes.rb#L330-L332）、`lib/pghero/methods/suggested_indexes.rb` 行1–236（https://github.com/ankane/pghero/blob/0efe3327aab12e40a53ec4e2bbc90b06499c9a10/lib/pghero/methods/suggested_indexes.rb#L1-L236）、`lib/pghero/methods/query_stats.rb` 行4–81（https://github.com/ankane/pghero/blob/0efe3327aab12e40a53ec4e2bbc90b06499c9a10/lib/pghero/methods/query_stats.rb#L4-L81）、行205–260（https://github.com/ankane/pghero/blob/0efe3327aab12e40a53ec4e2bbc90b06499c9a10/lib/pghero/methods/query_stats.rb#L205-L260）、行138–144。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 未使用索引（`unused_indexes`）：`pg_stat_user_indexes`の走査回数と`pg_index`を結び、一意索引を除き、走査回数が上限以下で大きさが下限以上のものを、大きさの順に返す。`across`に他のdatabase（replica等）を渡すと、それらでも未使用のものだけに絞る。統計のreset時刻を取る関数と、resetする関数がある。
  - 重複索引（`duplicate_indexes`）：同じtableの有効な索引のうち、主keyでも一意でもないものについて、列の並びが別の索引の先頭部分と一致し（`index_covers?`は先頭からの前方一致）、access method、式、部分索引の条件が同じものを、不要な索引と覆う索引の組として返す。無効な索引（作成中でないのに`valid`でないもの）も別に返す。
  - 不足索引（`missing_indexes`）：`pg_stat_user_tables`の順次走査と索引走査の回数から、索引の使用割合が低く行数の多いtableを返す。対象は索引走査が1回以上あるtableに限られる（行62の条件）。索引走査が一度もないtableは、この一覧には出ない。
  - 索引案（`suggested_indexes_by_query`）：照会統計（`query_stats(historical: true, ...)`）から時間のかかる照会を取り、`PgQuery`で構文解析して、単一tableのWHEREとORDER BYの列を取り出す。列の統計（行数、値の分布）から、各条件で残る行数を見積もり、絞込みの効きが大きい順に列を並べ、効きの小さい後続の列を落として索引案にする。既存の同種の索引が案を覆っていれば「覆われている」と説明を付け、案から外す。JOINや複数文、構文解析できない照会は、理由を付けて対象外にする。
  - 照会統計の由来（`query_stats.rb`）：現在の統計は`pg_stat_statements`を`pg_database`・`pg_roles`と結び、現在のdatabaseで呼出しのある照会を総時間等の順に取る（`current_query_stats`、行205–260）。過去の統計は、PgHero自身のtable（`pghero_query_stats`）に取り込んだものを期間で集計する（`historical_query_stats`、行263以降）。取込み（`capture_query_stats`、行138–144）は、現在の統計を保存し、`pg_stat_statements`をresetする。`query_stats`（行4–61）は両者を照会のhashと利用者でまとめて並べる。照会統計が使えるかは、`pg_stat_statements`を読めるかで判定する（行63–81）。
- 解いている問題と前提：索引が実際に使われているか、余分か、足りないかを、本番DBの統計から事後に見る。統計は前回のreset以降の累積で、serverごとに別である（そのため`across`がある）。
- 必要な入力：統計view（索引・tableの走査回数）、照会統計（`pg_stat_statements`と、PgHeroが取り込んだ過去の統計）、列の統計、統計の期間（reset時刻）、replica等の他のdatabase。
- trade-off・失敗の仕方：
  - 走査回数は統計の期間に依存し、resetの直後や、まれにしか走らない照会（月次処理等）で使う索引は未使用に見えうる。replicaでだけ使う索引は、primaryだけ見ると未使用に見える（`across`はその対策として読める）。
  - 重複の判定は列の前方一致で、一意索引・主keyは不要側にしない。`suggested_indexes.rb`のcomment（行38–40）は、索引案の被覆判定の文脈で、operator classが列名に含まれるため、operator classがあると列が一致しないと書いている。重複判定も同じ索引一覧の列の文字列で前方一致をとるため、同じくoperator classの違いで一致しなくなると推論できる（重複判定の側にこの旨のcommentはない）。
  - 索引案は単一table・単純な条件に限られ、行数の見積りは自前の近似である（`row_estimates`に「TODO better row estimation」のcomment）。`autoindex(create: true)`は案をそのまま`CREATE INDEX CONCURRENTLY`で作る。
- 反例・適用しない場合：HypoPGはplannerに判断させる（P27-O13）。DjangoとRailsは索引の要否を利用者のprofileに委ねる（P27-O11、O12）。
- 互換・非互換：P27-O13で「消す前・作る前」に計画を確かめ、本観察で「作った後」の使用を見る、という前後の関係にある。P27-O12の宣言と突き合わせれば、宣言はあるが使われていない索引が分かるが、その突合せはどのrepoにもない。
- 限界：走査回数の上限、大きさの下限、使用割合、行数の下限、列数の上限など、検出と索引案の判定にある値は持ち込まない。index bloatの推定SQLは読んでいない。

## 同じ問題の解き方の比較
| 問題 | repoA のやり方 | repoB のやり方 | 違いが生じる前提 |
|---|---|---|---|
| 関連をいつ読むか | Rails：`preload`（別照会）、`eager_load`（JOIN）、`includes`（条件から自動で選ぶ）（O01） | Django：多重度で分ける。単一値は`select_related`、多は`prefetch_related`、絞込みは`Prefetch`（O05）。Prisma Next：読取りの`include`は1文の中（相関subquery＋JSON集約）。暗黙の別照会は許さず、複数文は明示の組立てで書く。変更後の`include`は書込みの後に別の文で読み戻す（O09） | 方式を自動で切り替えるか、利用者が明示するか、1文に限るか |
| まとめる単位 | Rails Preloader：照会の形が同じloader（O02） | DataLoader：loader instanceと実行の区切り（tick）（O07）。Django `FETCH_PEERS`：同じQuerySetから来たinstance（O06） | ORMの内部か、ORMの外の任意のbackendか。宣言の有無 |
| N+1の検出・禁止 | Rails：遅延読込みを違反にし、raiseかlogを全体設定で選ぶ。宣言点はclass、照会、record、関連（O03）。N+1になるものだけのmodeもある（O04） | Django：`FETCH_RAISE`。ただしrelated managerの照会は対象外（O06）。Prisma Next：遅延読込みの経路自体がない（O09） | 遅延読込みを持つか。禁止の範囲を関連の種類で絞るか |
| 宣言しなかった読込みの扱い | Rails：既定は1件ずつ読む。禁止はstrict_loadingで別に宣言（O03） | Django：modeで選ぶ（1件ずつ／peersでbatch／禁止）（O06） | 振る舞いの切替えを1つの口に集めるか |
| 要求単位のcache | DataLoader：要求ごとにloaderを作り、要求の認証情報を束ねる。key→Promiseをmemoize（O08） | Prisma Next ADR：透過的なdata loaderを採らない（O09） | 照会の決定性と予算の検証を優先するか |
| 照会計画の確かめ方 | Rails／Django：利用者が照会単位でEXPLAINを呼ぶ。Railsは関連の照会も集める（O11） | Prisma Next：EXPLAINを環境別の予算とcacheで自動化する設計。実装は静的な行数推定（O10） | 診断の道具か、CIの自動判定か |
| 索引の追加前の確認 | HypoPG：仮想索引をplannerにだけ見せる。既存索引を隠す（O13） | PgHero：列の統計から自前で索引案を推定する（O14） | plannerに判断させるか、外で推定するか |
| 索引の追加前の手順 | Django：profileで必要と分かってから足すことを文書で求める（O12） | Rails／Django：利用者がEXPLAINを呼んで確かめる（O11） | 手順を文書で求めるか、道具を用意するか |
| 索引の追加後の確認 | PgHero：統計viewで未使用・重複・不足を検出（O14） | （今回読んだ他のrepoには、追加後の使用を確かめる仕組みはない） | 本番の統計を使えるか。統計の期間とserverの範囲 |
| 索引の宣言 | Django：modelの`Meta.indexes`。DBが対応しない指定は無視（O12） | Prisma Next ADR 115：索引を暗黙に作らず、拡張の演算子ごとに索引の存在を前提条件として検査する（O10） | schemaの宣言を正にするか、照会側の前提として検査するか |

## 見つからなかったこと・gap
- N+1を照会の数として数える仕組み（ある処理で発行された照会の数を数え、上限で止める）は、今回読んだ範囲では見つからなかった。Railsのstrict_loadingとDjangoの`FETCH_RAISE`は「遅延読込みが起きたこと」を検出し、Prisma Nextの予算は行数・待ち時間・SQLの大きさで、照会の数ではない。test用の照会数の検査（Djangoの`assertNumQueries`等）は今回読んでいない。
- Railsの`:n_plus_one_only`で、through・HABTMの集合関連が`:has_many`として扱われること（O04）は、reflectionの委譲とHABTMの定義のcodeから読んだ。testやissueでは確認していない。
- Prisma NextのADR 023とADR 115が書くEXPLAINの実行、cache、拡張ruleが、固定commitのどこに実装されているかは見つけられなかった（`budgets.ts`はEXPLAINを呼ばない）。ADRの状態（採択済みか、将来の設計か）を示す欄も、今回読んだADRの本文にはなかった。
- DataLoaderのcacheと共有cache（P17）の二層をどう組み合わせるか（要求単位のmemoizeの下に共有cacheを置く場合の無効化）は、READMEは「代わりではない」と書くだけで、組合せの設計は書かれていなかった。
- 索引の宣言（Django、Railsのmigration）と、本番の使用統計（PgHero）を突き合わせて、宣言はあるが使われていない索引を見つける仕組みは、どのrepoにもなかった。
- pganalyze系の索引分析（pganalyze Index Advisor等）は、本体のsourceが公開されていないため選ばなかった。pganalyzeの公開repository（collector等）は今回読んでいない。
- ADR形式の設計記録はPrisma Nextにだけあり、Rails、Django、DataLoader、HypoPG、PgHeroでは、判断の根拠はAPI文書、README、code commentにあった。

## 検索範囲と結果（読んだpath、検索した語、読んでいないもの）
- 方法：6 repoを作業用の一時領域へ `git clone --filter=blob:none --no-checkout` し、固定commitの必要なpathだけをcheckoutした（core.hooksPathを無効化）。読むだけで、build・test・script・hook・package managerは実行していない。GitHub APIはSPDX、default branch、archived、repository名の確認に使った。
- graphql/dataloader：`src/index.js`（74–205、210–400、410–440）、`README.md`（1–160、186–304、386–404、517–547）。読んでいないもの：`src/__tests__`、`examples/`、`index.d.ts`、CHANGELOG。
- rails/rails：`activerecord/lib/active_record/relation/query_methods.rb`（187–363、1389–1401）、`relation.rb`（316–345、1296–1308、1379–1386）、`relation.rb`の`ExplainProxy`（6–50付近）、`explain.rb`（1–40）、`core.rb`（88–96、255–270、705–762）、`active_record.rb`（416–426）、`associations/association.rb`（118–128、230–295）、`associations/collection_association.rb`（296–310）、`reflection.rb`（931、1021、1299–1306）、`associations.rb`（2030–2042）、`relation.rb`（1545–1562）、`associations/preloader/association.rb`（41–57、89–96）、`associations/preloader/batch.rb`（全体）、`associations/preloader/association.rb`（9–44、165–177）。`strict_loading`をactiverecord/lib全体でgrepした。読んでいないもの：`associations/preloader/branch.rb`・`through_association.rb`、`explain_registry.rb`、guides（`active_record_querying.md`はcheckoutしたが読んでいない）、CHANGELOG、test、migrationの`add_index`。
- django/django：`django/db/models/fetch_modes.py`（全体）、`django/db/models/query.py`（grepで`fetch_mode`の箇所、175–195）、`django/db/models/fields/related_descriptors.py`（245–292、grepで`fetch_mode`の箇所）、`django/db/models/query_utils.py`（265–285、deferred fieldの`fetch`呼出し）、`django/core/exceptions.py`（`FieldFetchBlocked`の定義）、`docs/topics/db/fetch-modes.txt`（全体）、`docs/topics/db/optimization.txt`（1–60、120–240）、`docs/ref/models/querysets.txt`（1044–1215、1360–1380、3148–3185、4300–4352）、`docs/ref/models/indexes.txt`（全体）。読んでいないもの：`prefetch_related_objects`の実装本体、`docs/ref/contrib/postgres/indexes.txt`（checkoutのみ）、release notes、ticket。
- prisma/orm：`docs/architecture docs/adrs/ADR 003`（全体）、`ADR 023`（1–120）、`ADR 115`（1–150）、`ADR 174`（冒頭。MongoDBのaggregate rootと関連の埋込みで、本テーマの対象外と判断した）、`packages/2-sql/5-runtime/src/middleware/budgets.ts`（全体）、`lints.ts`（grepで見出し）、`packages/3-extensions/sql-orm-client/src/query-plan-select.ts`（1285–1378、1500–1540）、`collection-dispatch.ts`（grep、405–430）。ADRの一覧をgrepで`N+1`、`lateral`、`EXPLAIN`、`capabilit`について絞った。読んでいないもの：`ADR 022`（lint taxonomy）、`ADR 029`、`ADR 065`、`where-binding.ts`、`test/`配下のbatching系test（題名のみ）、従来版のRust query engine（別repository）。
- HypoPG/hypopg：`README.md`（全体）、`hypopg.c`（grepした宣言・hookの行、420–460、512–585）、`docs/hypothetical_indexes.rst`（冒頭）、`docs/usage.rst`（80–100、205–225）、`LICENSE`（冒頭）。読んでいないもの：`hypopg_index.c`、`import/`、`test/`、`expected/`。
- ankane/pghero：`lib/pghero/methods/indexes.rb`（49–190、325–336）、`suggested_indexes.rb`（1–240）、`query_stats.rb`（1–145、205–290）、`explain.rb`（1–50）、`lib/pghero.rb`（80–90）、`app/controllers/pg_hero/home_controller.rb`（300–350）、`guides/Docker.md`（grepの該当行のみ）。読んでいないもの：`index_bloat`のSQL、`query_stats.rb`の上記以外（`combine_query_stats`、`insert_query_stats`等）、`row_estimates`の本体（239行以降）、test。
- 検索した語：`strict_loading`、`n_plus_one_only`、`eager_loading?`、`preload`、`FETCH_PEERS`、`fetch_mode`、`track_peers`、`batchScheduleFn`、`maxBatchSize`、`cacheMap`、`lateral`、`json_agg`、`N+1`、`EXPLAIN`、`budget`、`hypopg`、`analyze`、`unused`、`duplicate`、`index_covers`。
- 選ばなかった候補：pganalyze系（索引分析の本体が非公開のため。§gap）。従来版Prisma（prisma/prisma-engines）の`relationLoadStrategy`（join／query）は、今回のrepositoryの固定commitに含まれず、読んでいない。

## BRAINの属性について未決の事項（由来の種類、scope、評価根拠、版、状態）
- 由来の種類：コード（Rails、Django、DataLoader、HypoPG、PgHero、Prisma Nextの`budgets.ts`・`query-plan-select.ts`）、API文書・README（同repo内）、ADR（Prisma Next）が混在する。Prisma NextではADR（EXPLAINの予算）と実装（静的推定）が食い違っており、どちらを観察の由来とするか、両方を別の由来として持つかは未決。
- scope：観察はORMとDBの境界（関連の読込み、照会計画、索引）に限っている。D01の「architectureの判断」として扱うか、D06（data）やD03（backend）の実装の知識として扱うかは未決。DataLoader（O07・O08）はD05（API）やD04（frontendのdata取得、P09）にも当たる。
- 評価根拠：HELIXでの成功・失敗の証拠はない。外部repoでの採用を、HELIXでの妥当性の根拠にしない（HELIXBRAIN-L2-026／027の経路で扱う）。
- 版：固定commit SHAで版を表す。Djangoのfetch modeはmain（6.1予定）でrelease前、Prisma Nextは次世代版でADRの状態が明示されておらず、上流の後続commitで変わりうる。prisma/prismaからprisma/ormへのrenameのように、repository名自体が変わることもある。再観察の要否と、repository名の変化をどう記録するかは未決。
- 状態：全観察（P27-O01〜O14）は未評価の候補素材である。HELIX-BRAINへの登録・採否・選定は行っていない。
