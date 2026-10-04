# P33 data modelと永続化の写像（Unit of Work・Identity Map・Data Mapper・集約と保存の単位・changeset・継承とvalue object・楽観lockの版列）の観察（D06 Data・Database）

status: scaffold（調査材料。採否、要求、設計、実装、BRAINへの登録の決定ではない）
authority_effect: none
binding: [SCF-B-0156](../../../bindings/SCF-B-0156.json)
素材の状態：本書の観察はすべて「未評価の候補素材」である。外部repositoryで採られていることは、HELIXでの成立を意味しない。値（閾値、既定値、上限、版番号の初期値等）は持ち込まない。技術選定・採用推奨ではない。
線引き：既定の挙動（例：既定でどの方式が選ばれるか、何が自動で起きるか）は非数値の事実として書く。数値の既定値・上限は、出典に書かれていても写さない。

埋めるgap：[D06](../../brain-domain-material-inventory-20261004/materials/D06-data-database.md) §4「data modelと永続化の写像（ORMの使い方、集約とtableの対応）」。旧台帳で永続化マッピング設計が`todo`（D06-M07）であり、ADR-007は重いORMを入れない判断だけである。N+1と索引はP27で扱ったため、本書は扱わない（O10のHibernateの主張に関わる範囲で名前を出すだけ）。

## 調べたrepository
| repo | URL | 固定commit | ライセンス(SPDX) | archived | 取得日 | 選んだ理由 |
|---|---|---|---|---|---|---|
| sqlalchemy/sqlalchemy | https://github.com/sqlalchemy/sqlalchemy | a9956b1ab72561c4642ff9dfdf9ae52f3eb5d307（default branch: main） | MIT | false | 2026-10-05 | Session（Unit of Work＋Identity Map）、flushの依存順序づけ、cascade、継承3方式、composite、版列を、設計文書と実装（`orm/unitofwork.py`）の両方で読める |
| elixir-ecto/ecto | https://github.com/elixir-ecto/ecto | 94d69279c517347ff0962b138f4ccd0556486ae2（master） | Apache-2.0 | false | 2026-10-05 | Unit of WorkもIdentity Mapも置かず、Repo・Schema・Changesetを分けた対照例。changesetによる変更の検証、validationとconstraintの境界、embeds、`optimistic_lock`をmoduledocとguideで読める |
| hibernate/hibernate-orm | https://github.com/hibernate/hibernate-orm | bc6aa6d42f3547a3e5b4204ada1e597ffcc5ed20（main） | Apache-2.0 | false | 2026-10-05 | 永続化contextの利点と制約、stateful／stateless sessionの対比、「集約をid参照の島に分ける」設計への反対意見、継承4方式、SQLの集約型へのembeddable写像、版なし楽観lockを文書に書いている |
| jOOQ/jOOQ | https://github.com/jOOQ/jOOQ | ccf5efc88a031b3a42a2d774363a0a9a59e042c1（main） | NOASSERTION（LICENSE冒頭：「Licensed under the Apache License, Version 2.0 (the "License");」。続けて「Other licenses:」の節に商用licenseがある旨を書く） | false | 2026-10-05 | ORMではなくSQLのDSLを主にし、表の行を表すrecordが自分で保存するAPI（`UpdatableRecord`）と、問合せの時点で入れ子のDTOへ写す方式（MULTISET）を持つ。object graphを持たない側の対照 |
| doctrine/orm | https://github.com/doctrine/orm | 1869102c90c3dc10c8c3dc33a19b0794c2790419（default branch: 3.7.x） | MIT | false | 2026-10-05 | 自らをData Mapperと書き、Identity Mapと変更検出（snapshotとの比較）、変更追跡の方針、transactional write-behind、cascadeとorphan removal、継承2方式、embeddable、版列を文書化している |

P27で読んだrails/django/prisma/orm（旧prisma/prisma）とは重ねていない。copyleftのrepositoryは今回の5本に無い。

## 観察

### P33-O01 Data Mapper：domain classと表を分け、写像を別に持つ
- 出典：
  - doctrine/orm、`docs/en/tutorials/getting-started.rst` 行28–38（https://github.com/doctrine/orm/blob/1869102c90c3dc10c8c3dc33a19b0794c2790419/docs/en/tutorials/getting-started.rst#L28-L38）、行43–49（https://github.com/doctrine/orm/blob/1869102c90c3dc10c8c3dc33a19b0794c2790419/docs/en/tutorials/getting-started.rst#L43-L49）
  - doctrine/orm、`docs/en/reference/unitofwork.rst` 行104–107（https://github.com/doctrine/orm/blob/1869102c90c3dc10c8c3dc33a19b0794c2790419/docs/en/reference/unitofwork.rst#L104-L107）
  - doctrine/orm、`docs/en/reference/architecture.rst` 行96–101（https://github.com/doctrine/orm/blob/1869102c90c3dc10c8c3dc33a19b0794c2790419/docs/en/reference/architecture.rst#L96-L101）
  - sqlalchemy、`doc/build/orm/mapping_styles.rst` 行20–38（https://github.com/sqlalchemy/sqlalchemy/blob/a9956b1ab72561c4642ff9dfdf9ae52f3eb5d307/doc/build/orm/mapping_styles.rst#L20-L38）、行145–170（https://github.com/sqlalchemy/sqlalchemy/blob/a9956b1ab72561c4642ff9dfdf9ae52f3eb5d307/doc/build/orm/mapping_styles.rst#L145-L170）
  - 信頼性ラベル：primary（公式source repositoryの設計文書）。本文確認：済
- 何をしているか：
  - Doctrineは、Data Mapper patternを中心に置き、domain・業務logicとRDBへの永続化を分けることを目指すと書く（getting-started 28–31）。entityは抽象基底classやinterfaceを継承しなくてよい（43–45）。Doctrineはentityのconstructorを呼ばない（architecture 98–101）。自らを「persistence-ignorance（PI）を目指すdata-mapper」と書き、DBを知らないPHP objectを写すとする（unitofwork 104–106）。
  - SQLAlchemyは、宣言的（Declarative）と命令的（imperative／classical）の2つの写像形式を持ち、どちらでも結果は「`Mapper`が、通常は`Table`で表されるselectableに対して構成され、classが計装（instrumented）された利用者定義class」になると書く（mapping_styles 20–38）。命令的形式では、表のmetadataを`Table`で別に作り、何も宣言を持たないclassに`registry.map_imperatively`で結びつける（145–170）。同じ節のtipは、命令的形式を「あまり使われない」形式とし、新規利用者には宣言的形式を勧めている（152–159）。
- 解いている問題と前提：domainのobject modelと関係表の形を、互いを知らずに変えられるようにする。前提は、写像の情報（どのattributeがどの列か）をclassの外か注釈に持てること。
- 必要な入力：domain class、表の定義、両者の対応（列、関連、継承の方式）。
- trade-off・失敗の仕方：Doctrineは、主にobjectで作業しないapplicationには向かないと書く（architecture.rst 行11–16。下の追加出典）。SQLAlchemyでは、classは計装されるため、完全にORMを知らないclassではない（mapping_styles 34–36の「instrumented」）。
  - 追加出典：doctrine/orm、`docs/en/reference/architecture.rst` 行11–16（https://github.com/doctrine/orm/blob/1869102c90c3dc10c8c3dc33a19b0794c2790419/docs/en/reference/architecture.rst#L11-L16）
- 反例・適用しない場合：jOOQは表の行を表すrecord自身が`store()`・`delete()`を持つ（P33-O14）。Ectoはschemaを「任意のdata sourceをstructへ写すもの」とし、表に限らないと書く（P33-O07）。
- 互換・非互換：P33-O02（Identity Map）、P33-O03（Unit of Work）と組み合わさる。P33-O14（recordが自分で保存する形）とは、保存の責務をどこに置くかで異なる。
- 限界：今回読んだ一次資料のうち、Active Recordを名指しして述べるのはHibernateの`Introduction.adoc`の折りたたみ節だけである（行408–421、https://github.com/hibernate/hibernate-orm/blob/bc6aa6d42f3547a3e5b4204ada1e597ffcc5ed20/documentation/src/main/asciidoc/introduction/Introduction.adoc#L408-L421）。この節は、entityをframeworkに依存しない普通のJava objectとする方式を自らの「traditional」な方式とし、別の方式としてActive Record（例としてPanache）を挙げ、entityとDAO/Repositoryの役割を1つのobjectにまとめる形だと書く。Active Recordでは永続化の操作をentityに置いてよいとしつつ、entityはorchestrationやtransactionの管理をしないという原則は変わらないと書く。ほかの4 repositoryの読んだ範囲では、この語を見ていない。Data Mapper側の各repositoryとActive Recordの対比は、本書の分類である。

### P33-O02 Identity Map：1つの永続化contextの中で、主keyごとにobjectを1つに保つ
- 出典：
  - sqlalchemy、`doc/build/orm/session_basics.rst` 行9–16（https://github.com/sqlalchemy/sqlalchemy/blob/a9956b1ab72561c4642ff9dfdf9ae52f3eb5d307/doc/build/orm/session_basics.rst#L9-L16）、行457–469（https://github.com/sqlalchemy/sqlalchemy/blob/a9956b1ab72561c4642ff9dfdf9ae52f3eb5d307/doc/build/orm/session_basics.rst#L457-L469）、行484–502（https://github.com/sqlalchemy/sqlalchemy/blob/a9956b1ab72561c4642ff9dfdf9ae52f3eb5d307/doc/build/orm/session_basics.rst#L484-L502）、行957–978（https://github.com/sqlalchemy/sqlalchemy/blob/a9956b1ab72561c4642ff9dfdf9ae52f3eb5d307/doc/build/orm/session_basics.rst#L957-L978）
  - doctrine/orm、`docs/en/reference/unitofwork.rst` 行9–30（https://github.com/doctrine/orm/blob/1869102c90c3dc10c8c3dc33a19b0794c2790419/docs/en/reference/unitofwork.rst#L9-L30）、行48–99（https://github.com/doctrine/orm/blob/1869102c90c3dc10c8c3dc33a19b0794c2790419/docs/en/reference/unitofwork.rst#L48-L99）
  - hibernate-orm、`documentation/src/main/asciidoc/introduction/Interacting.adoc` 行40–55（https://github.com/hibernate/hibernate-orm/blob/bc6aa6d42f3547a3e5b4204ada1e597ffcc5ed20/documentation/src/main/asciidoc/introduction/Interacting.adoc#L40-L55）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - SQLAlchemyの`Session`は、「同じ主keyを持つobjectは1つだけ」という意味で一意な写しを保つidentity mapを持つ（9–16）。`Session.get`は、まずidentity mapを見て、無ければDBへ問い合わせる（457–469）。同じ行を2つの問合せで取ると同じPython objectが返り、既に読み込まれたobjectの属性は行から再設定しない。文書はその設計上の前提を「完全に分離されたtransaction」と書き、分離されていない程度に応じてapplicationが必要に応じてrefreshする、とする（484–502）。
  - SQLAlchemyのFAQ節は、Sessionは問合せのcacheをしないと書く。主key以外の条件の問合せは常にSQLを発行し、返った行の主keyを見てから既存objectを探す。主keyでの取得だけが問合せを省ける。Sessionは既定でobjectを弱参照で持ち、全体から参照する「registry」ではないとする（957–978）。
  - Doctrineは、UnitOfWorkの中に「root entity名」と「id」の2段のkeyで参照を持つ（複合keyは並べてserializeしたid）（9–13）。主keyでの`find`を2回呼ぶとSELECTは1回で同じ参照が返る（15–30）。主key以外の条件では毎回DBへ行くが、行の主keyから既存objectを見つけて返す（48–83）。identity mapはflush時に管理中のobjectを列挙するのにも使われ、既知のobjectは`persist`を呼ばなくても変更がDBへ書かれる（85–99）。
  - Hibernateは、永続化context（first-level cache）が、読み込んだentityと新たに永続化したentityについて、識別子からinstanceへの一意な対応を持つと書く。instanceは同時に高々1つの永続化contextに属する。永続化contextの寿命は通常transactionと一致するが、複数のDB transactionにまたがる論理的なunit of workにすることもできる（40–55）。
- 解いている問題と前提：同じ行を表す複数のobjectが別々に変更され、どちらが正しいか分からなくなること（Hibernateの言う「data aliasing」。P33-O06）。前提は、行を主keyで識別できることと、contextの寿命が限られていること。
- 必要な入力：主key（複合keyを含む）、継承階層のroot（Doctrineのkey）、contextの寿命（transaction単位か、それより長いか）。
- trade-off・失敗の仕方：主key以外の問合せは省けない（SQLAlchemy 957–969、Doctrine 74–78）。既に読み込んだobjectは、同じcontextでの再問合せでは更新されない（SQLAlchemy 496–502）。cacheとして使う設計ではないと明記されている（SQLAlchemy 971–976）。
- 反例・適用しない場合：Hibernateのstateless session（`EntityAgent`）は、この正規化を持たず、同じ行を表す別のobjectが返る（P33-O06）。Ectoは識別の写像を持たない（P33-O07。Ectoの文書に「identity map」の語は見つからなかった）。
- 互換・非互換：P33-O03（Unit of Work）、P33-O04（変更検出）の前提になる。P33-O06のstateless sessionとは非互換。
- 限界：弱参照か強参照かは実装の違いで、Hibernateは強参照（P33-O06）。容量・件数の値は持ち込まない。

### P33-O03 Unit of Work：変更を記録し、flushでまとめてDBへ書く（transactional write-behind）
- 出典：
  - sqlalchemy、`doc/build/orm/session_basics.rst` 行28–34（https://github.com/sqlalchemy/sqlalchemy/blob/a9956b1ab72561c4642ff9dfdf9ae52f3eb5d307/doc/build/orm/session_basics.rst#L28-L34）、行374–426（https://github.com/sqlalchemy/sqlalchemy/blob/a9956b1ab72561c4642ff9dfdf9ae52f3eb5d307/doc/build/orm/session_basics.rst#L374-L426）、行428–445（https://github.com/sqlalchemy/sqlalchemy/blob/a9956b1ab72561c4642ff9dfdf9ae52f3eb5d307/doc/build/orm/session_basics.rst#L428-L445）
  - sqlalchemy、`doc/build/glossary.rst` 行790–799（https://github.com/sqlalchemy/sqlalchemy/blob/a9956b1ab72561c4642ff9dfdf9ae52f3eb5d307/doc/build/glossary.rst#L790-L799）
  - doctrine/orm、`docs/en/reference/architecture.rst` 行184–207（https://github.com/doctrine/orm/blob/1869102c90c3dc10c8c3dc33a19b0794c2790419/docs/en/reference/architecture.rst#L184-L207）
  - doctrine/orm、`docs/en/reference/transactions-and-concurrency.rst` 行127–152（https://github.com/doctrine/orm/blob/1869102c90c3dc10c8c3dc33a19b0794c2790419/docs/en/reference/transactions-and-concurrency.rst#L127-L152）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - SQLAlchemyのglossaryは、unit of workを「ORM等が一連のobjectへの変更の一覧を保ち、保留中の変更を定期的にDBへflushする」構造と定義し、`Session`がこれを実装すると書く（790–799）。属性やcollectionの変更は変更eventとして`Session`に記録され、DBへ問い合わせる直前とcommit直前に保留中の変更をflushする（28–34）。
  - flushの時点：既定の設定では、問合せ（`Query`、2.0形式の`Session.execute`）の前、`commit`の中、`begin_nested`のSAVEPOINTの前に起きる（374–381）。autoflushは設定で無効にでき、`no_autoflush`で一時的に止められる（388–421）。ただし`commit`・`begin_nested`・2PCの`prepare`では、保留中の変更があればautoflush設定に関わらず必ずflushする（401–406、423–426）。
  - flushはDBAPIのtransactionの中でだけ行われ（driver levelのautocommitでない場合）、DB接続がtransactionの原子性を提供していることを前提に、flush中のどれかのDML文が失敗すれば全体がrollbackされる（433–436）。失敗後に同じ`Session`を使い続けるには、明示的な`rollback`が要る（428–445）。
  - Doctrineは、`EntityManager`と`UnitOfWork`が「transactional write-behind」を取り、SQLの実行を遅らせてtransactionの終わりにまとめ、書込みlockを早く解放すると書く。`EntityManager#flush()`で変更を永続化する（184–195）。`UnitOfWork`は次のflushで行うことを追跡する、Fowlerの言うUnit of Work patternの典型的な実装と書く（199–207）。
  - Doctrineの例外時：暗黙のtransaction境界でflush中に例外が起きると、transactionは自動でrollbackされ`EntityManager`は閉じられる。明示境界の場合は、直ちにrollbackし`EntityManager`を閉じて捨てるべき（should）と書く。その結果、管理中のobjectはすべてdetachされ、objectの状態はrollbackされず、DBと食い違う。例外後に別のunit of workを始めるなら新しい`EntityManager`で行うべき（should）とする（127–152）。
- 解いている問題と前提：個々の変更ごとにSQLを出す代わりに、変更をまとめて1つのtransactionの中で書き、書込みlockの保持時間を短くする（Doctrine）。前提は、objectの変更をORMが追跡できること（P33-O04）と、contextがtransactionと結びついていること。
- 必要な入力：変更を記録するcontext（Session／EntityManager）、flushの時点の規則、transaction境界。
- trade-off・失敗の仕方：
  - SQLの発行時点が書いた順と一致しない。SQLAlchemyでは問合せの前にautoflushが起きるため、問合せが変更の書込みを誘発する（392–399）。
  - 失敗後のmemory上のobjectはDBと一致しない。Doctrineはobjectの状態をrollbackしないと明記し、新しい`EntityManager`を使うよう書く（143–152）。SQLAlchemyは明示の`rollback`を求める（438–445）。
- 反例・適用しない場合：Ectoは変更をcontextに溜めず、`Repo.insert`／`update`の呼出しごとに書く（P33-O07）。Hibernateのstateless sessionには`flush()`が無く、操作は即座にDBへ出る（P33-O06）。
- 互換・非互換：P33-O02、P33-O04、P33-O05（flush時の順序づけ）と一体で働く。P33-O13の版列の照合はflush時に行われる（SQLAlchemy、Doctrine）。
- 限界：flushの時点や回数に関する値は持ち込まない。

### P33-O04 変更の検出：書込みの計装か、読込み時のsnapshotとの比較か
- 出典：
  - doctrine/orm、`docs/en/reference/unitofwork.rst` 行109–134（https://github.com/doctrine/orm/blob/1869102c90c3dc10c8c3dc33a19b0794c2790419/docs/en/reference/unitofwork.rst#L109-L134）
  - doctrine/orm、`docs/en/reference/change-tracking-policies.rst` 行8–45（https://github.com/doctrine/orm/blob/1869102c90c3dc10c8c3dc33a19b0794c2790419/docs/en/reference/change-tracking-policies.rst#L8-L45）
  - sqlalchemy、`doc/build/orm/session_basics.rst` 行28–31（https://github.com/sqlalchemy/sqlalchemy/blob/a9956b1ab72561c4642ff9dfdf9ae52f3eb5d307/doc/build/orm/session_basics.rst#L28-L31）
  - sqlalchemy、`doc/build/orm/composites.rst` 行420–428（https://github.com/sqlalchemy/sqlalchemy/blob/a9956b1ab72561c4642ff9dfdf9ae52f3eb5d307/doc/build/orm/composites.rst#L420-L428）
  - hibernate-orm、`documentation/src/main/asciidoc/introduction/Advanced.adoc` 行1399–1416（https://github.com/hibernate/hibernate-orm/blob/bc6aa6d42f3547a3e5b4204ada1e597ffcc5ed20/documentation/src/main/asciidoc/introduction/Advanced.adoc#L1399-L1416）
  - jOOQ、`jOOQ/src/main/java/org/jooq/conf/RecordDirtyTracking.java` 行24–37（https://github.com/jOOQ/jOOQ/blob/ccf5efc88a031b3a42a2d774363a0a9a59e042c1/jOOQ/src/main/java/org/jooq/conf/RecordDirtyTracking.java#L24-L37）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - Doctrine：読み込むたびに全propertyと関連の写しをUnitOfWorkに持ち、`flush`時にidentity map上の各objectで元の値と現在の値を比べる。変更があればUPDATEを予約し、変わった列だけを更新する（109–121）。
  - Doctrineの変更追跡の方針はclass（正確には階層）ごとに選べ、2つある（change-tracking-policies 8–11）。既定の「deferred implicit」は、commit時にpropertyごとに比べ、管理中のentityから参照される新しいentityも検出する（persistence by reachability）。flushごとに全管理中entityを調べる（16–26）。「deferred explicit」は、`persist`かsave cascadeで明示されたentityだけを比べ、自動の変更検出を手放す代わりにflushを軽くする（31–45）。
  - SQLAlchemy：ORMが管理するobjectは計装され、属性やcollectionが変更されるたびに変更eventが生成されて`Session`に記録される（session_basics 28–31）。compositeのvalue objectの中身をその場で変えた場合は自動では追跡されず、`MutableComposite`のmixinで親へeventを伝える必要がある（composites 420–428）。
  - Hibernate：bytecode enhancerを使わない場合は、読み書きの後の各entityのsnapshotを持ち、flush時に比べる。enhancerを使う場合は、fieldへの書込みを横取りして記録し、可変な値のfield（例：`byte[]`）だけsnapshotを持つ（1399–1404）。後者は前者より正確さが劣り、entity class外からのfieldへの書込みは検出されず永続化されないことがある、と注意している（1408–1412）。同じ節で、拡張bytecode enhancementは非推奨とされている（1414–1416）。
  - jOOQのrecordは、dirty判定を`touched()`の意味で行うか`modified()`の意味で行うかを設定（`RecordDirtyTracking`）で選ぶ（24–37）。
- 解いている問題と前提：利用者がUPDATEを明示せずに、変更された行と列だけを書く。snapshot方式は、objectが普通のclassのまま変更を見つけられる（Doctrineの永続化非依存。P33-O01）。計装方式は、比較の費用を避ける代わりに、classの書込み経路をORMが押さえることを前提にする。
- 必要な入力：比較の対象（管理中の全entityか、明示されたものだけか）、値の等価の定義（可変な値の扱い）、計装の手段。
- trade-off・失敗の仕方：
  - snapshot方式は、UnitOfWorkが大きいほどflushの計算が長くなる（Doctrine 123–125）。対処として、読取り専用のmark、一時的な読取り専用指定、変更追跡の方針の変更を挙げている（127–134）。
  - 計装方式は、計装されない経路（value objectの中身の直接変更、class外からのfield書込み）を取りこぼす（SQLAlchemy composites 423–425、Hibernate 1410–1411）。
- 反例・適用しない場合：Ectoのchangesetは、変更をobjectの差分ではなく、明示的なchangeの集合として持つ（P33-O08）。比較そのものが不要になる。
- 互換・非互換：P33-O03のflushの前段。P33-O12（value object）の可変性と関係する。
- 限界：比較の費用の大きさは書かれていない。値は持ち込まない。

### P33-O05 flush時の書込み順序：mapper間の依存をtopological sortし、循環があれば行単位に分ける
- 出典：
  - sqlalchemy、`lib/sqlalchemy/orm/unitofwork.py` 行10–16（https://github.com/sqlalchemy/sqlalchemy/blob/a9956b1ab72561c4642ff9dfdf9ae52f3eb5d307/lib/sqlalchemy/orm/unitofwork.py#L10-L16）、行390–440（https://github.com/sqlalchemy/sqlalchemy/blob/a9956b1ab72561c4642ff9dfdf9ae52f3eb5d307/lib/sqlalchemy/orm/unitofwork.py#L390-L440）、行442–467（https://github.com/sqlalchemy/sqlalchemy/blob/a9956b1ab72561c4642ff9dfdf9ae52f3eb5d307/lib/sqlalchemy/orm/unitofwork.py#L442-L467）、行469–488（https://github.com/sqlalchemy/sqlalchemy/blob/a9956b1ab72561c4642ff9dfdf9ae52f3eb5d307/lib/sqlalchemy/orm/unitofwork.py#L469-L488）
  - 信頼性ラベル：primary（実装）。本文確認：済
- 何をしているか：
  - module docstringは、flushがobjectを渡し、mapperとpropertyに基づいてflushの作業を組み立て、依存の順に並べて実行すると書く（10–16）。
  - `_generate_actions`は、まずpresort actionを、新しい作業が増えなくなるまで繰り返し実行する（presort actionがUOWに新しいstateを足しうる、とcomment）（395–404）。次にmapper間の依存graphの循環を`topological.find_cycles`で探す（406–409）。循環があれば、循環に含まれるmapper単位の作業をstate（行）単位の作業に分け、依存の辺をその行単位の作業へ付け替える（411–436）。
  - `execute`は、循環が無ければ`topological.sort`の順で各作業を実行し、循環があれば`sort_as_subsets`の部分集合ごとに`execute_aggregate`で実行する（442–467）。
  - `finalize_flush_changes`は、flushが成功しtransactionがcommitされた後に、削除したobjectを除き、それ以外を永続状態として登録する（469–488）。docstringはこれを「execute()が成功しtransactionがcommitされた後」に呼ばれると書く。
- 解いている問題と前提：利用者の書いた順ではなく、mappingの依存から書込みの順序を決める（docstring 10–16）。その具体例として「外部keyの参照先を先にINSERTし、参照元を先にDELETEする」と書くのは、docstringに無い一般知識による本書の補足である。自己参照など循環がある場合は、表単位では順序が決まらないため行単位にする。
- 必要な入力：mapper間の関連（どちらがどちらを参照するか）、各stateの操作種別（INSERT・UPDATE・DELETE）。
- trade-off・失敗の仕方：循環がある場合は行単位の作業に分かれるため、表単位でまとめて実行できる範囲が狭まる（実装からの推論。性能の記述は読んだ範囲に無い）。commented-outの`print`が残っている（449–454）ことから、順序の調査はこの関数で行われてきたと読めるが、意図の記述は無い。
- 反例・適用しない場合：Ecto.Multiは、追加した順に操作を実行する（P33-O09）。順序は利用者が書く。Hibernateのstateless sessionは各操作を即座に実行する（P33-O06）。
- 互換・非互換：P33-O03のflushの中身。P33-O09のcascadeで作業に加わったobjectも、ここで並べられる。
- 限界：DoctrineとHibernateのflush順序の実装（Doctrineの`UnitOfWork.php`のcommit順序計算等）は読んでいない。Doctrineの`unitofwork.rst`の「UnitOfWork」「Persisters」節は本文が「tbr」のままである（下の追加出典）。
  - 追加出典：doctrine/orm、`docs/en/reference/unitofwork.rst` 行165–173（https://github.com/doctrine/orm/blob/1869102c90c3dc10c8c3dc33a19b0794c2790419/docs/en/reference/unitofwork.rst#L165-L173）

### P33-O06 stateful sessionとstateless session：永続化contextを持つか持たないかを選べるようにする
- 出典：
  - hibernate-orm、`documentation/src/main/asciidoc/introduction/Interacting.adoc` 行67–94（https://github.com/hibernate/hibernate-orm/blob/bc6aa6d42f3547a3e5b4204ada1e597ffcc5ed20/documentation/src/main/asciidoc/introduction/Interacting.adoc#L67-L94）、行935–989（https://github.com/hibernate/hibernate-orm/blob/bc6aa6d42f3547a3e5b4204ada1e597ffcc5ed20/documentation/src/main/asciidoc/introduction/Interacting.adoc#L935-L989）
  - hibernate-orm、`documentation/src/main/asciidoc/introduction/Introduction.adoc` 行430–454（https://github.com/hibernate/hibernate-orm/blob/bc6aa6d42f3547a3e5b4204ada1e597ffcc5ed20/documentation/src/main/asciidoc/introduction/Introduction.adoc#L430-L454）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 永続化contextの利点として、data aliasingの回避、自動のdirty checking、同じunit of workでの繰返し取得の省略、複数操作の透過的なbatch化を挙げ、object graphの循環の検出にも使えると書く（67–76）。
  - 制約として、thread間で共有できないこと、無関係なtransaction間で再利用できないこと（分離性と原子性が壊れる）、全entityへの強参照を持つためunit of workの終わりに捨てる必要があることを挙げる（78–84）。永続化contextが性能を助けるか害するかはunit of workの性質によるので、stateful sessionとstateless sessionの両方を提供すると結ぶ（93–94）。
  - stateless session（`EntityAgent`。Hibernateでは`StatelessSession`でもある）は、常にdetachedのobjectを返し、関連の取得は`fetch()`の明示操作になる。更新は`insert`・`update`・`delete`・`upsert`の即時実行で、`CascadeType`に対応する操作が無いためcascadeしない。`flush()`も無く、`update()`は常に明示である（938–961）。
  - その代わり、同じ行を表す同一でない2つのobjectを得やすく、同じ行を2回`get`すると別のobjectが返る（962–983）。
  - Introductionは、stateful sessionを「より強力、あるいはより魔法的」とし、その魔法と引き換えに永続化操作の直接の制御を失い、未熟な利用者には罠がある、と書く。開発者の「かなりの少数」は永続化contextに不満を持ち、stateless sessionの方が合うだろうとする（450–454）。
- 解いている問題と前提：Unit of Work＋Identity Map（P33-O02、O03）の便利さと、暗黙の書込み・寿命管理の難しさを、利用者が場面ごとに選べるようにする。
- 必要な入力：作業の性質（object graphを編集するか、行を単発で読み書きするか、大量処理か）。
- trade-off・失敗の仕方：stateful側は、contextの寿命管理の誤りが多くの問題の原因になったと書く（86–91）。stateless側は、aliasingを防ぐ仕組みが無く、`fetch()`で同じ行の2つのobjectを容易に得る（985–989）。
- 反例・適用しない場合：SQLAlchemyとDoctrineの今回読んだ文書には、contextを持たない操作体系を並べて提供する記述は無かった（SQLAlchemyのbulk操作はP33-O09・O13の注意で触れるだけ）。Ectoは最初からcontextを持たない（P33-O07）。
- 互換・非互換：P33-O02・O03の代替。P33-O10でHibernateは、集約を分ける代わりにstateless sessionを使う道を挙げている。
- 限界：Introductionの行456–460には、`StatelessSession`の機能差を以前は誤りだったとする段落があるが、asciidocのcomment（行頭`//`）で、公開される本文ではないため、根拠にしていない。

### P33-O07 Unit of Workを置かない分け方：Repo（どこ）・Schema（何）・Query（読み方）・Changeset（変え方）
- 出典：
  - elixir-ecto/ecto、`lib/ecto.ex` 行3–25（https://github.com/elixir-ecto/ecto/blob/94d69279c517347ff0962b138f4ccd0556486ae2/lib/ecto.ex#L3-L25）、行173–213（https://github.com/elixir-ecto/ecto/blob/94d69279c517347ff0962b138f4ccd0556486ae2/lib/ecto.ex#L173-L213）、行359–361（https://github.com/elixir-ecto/ecto/blob/94d69279c517347ff0962b138f4ccd0556486ae2/lib/ecto.ex#L359-L361）
  - elixir-ecto/ecto、`guides/howtos/Data mapping and validation.md` 行5–17（https://github.com/elixir-ecto/ecto/blob/94d69279c517347ff0962b138f4ccd0556486ae2/guides/howtos/Data%20mapping%20and%20validation.md#L5-L17）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - Ectoは4つの部品に分かれる。`Ecto.Repo`はdata storeの包み（作成・更新・削除・問合せ）、`Ecto.Schema`は外部dataをElixirのstructへ写すもの、`Ecto.Query`は読み方、`Ecto.Changeset`は適用前の変更を追跡し検証するもの、と書く。要約は「Repo＝whereにdataがあるか、Schema＝whatか、Query＝how to readか、Changeset＝how to changeか」である（3–25）。
  - changesetを作り、`Repo.update(changeset)`等に渡すと`:ok`／`:error`のtupleが返る（186–194）。用途ごとに別のchangeset関数（登録用、更新用）を作れることを、明示的なchangesetの利点としている（196–207）。
  - Ectoは関連をlazy loadしないと書き、lazy loadは長期的に混乱と性能問題の源になるとする（359–361）。
  - guideは、schemaを「任意のdata sourceをstructへ写すもの」とし、DBの表だけを写すという理解は誤解だとする。DB⇔schema⇔form／APIの写像を1つのschemaで持つより、2つに分ける方がよい場面が多いと書く（5–17）。
- 解いている問題と前提：変更の発生と書込みを、暗黙のcontextではなく値（changeset）と明示の呼出しで結ぶ。前提は、利用者がどの時点で何を書くかを自分で書くこと。
- 必要な入力：変更ごとのchangeset関数、Repoへの明示の呼出し、関連の読込みの明示（preload）。
- trade-off・失敗の仕方：Identity Mapを持たないので、同じ行を表すstructが複数あってもEctoは区別しない（文書に「identity map」の語が無いことからの推論。読んだ範囲に明示の記述は無い）。並行更新の検出はP33-O13の`optimistic_lock`を明示で付ける。
- 反例・適用しない場合：SQLAlchemy・Doctrine・Hibernate（stateful）はUnit of Workを持つ（P33-O03）。
- 互換・非互換：P33-O08（changeset）、P33-O09（Ecto.Multi）と一体。P33-O02・O03とは非互換。P33-O06のstateless sessionと方向が近いが、HibernateはObjectに変更を書き、Ectoは変更を別の値（changeset）に持つ点で異なる。
- 限界：Repoの実装（`lib/ecto/repo.ex`の`insert`／`update`の経路、adapter）は読んでいない。

### P33-O08 changesetによる変更の検証：filtering・型変換・validation・constraintの境界
- 出典：
  - elixir-ecto/ecto、`lib/ecto/changeset.ex` 行3–35（https://github.com/elixir-ecto/ecto/blob/94d69279c517347ff0962b138f4ccd0556486ae2/lib/ecto/changeset.ex#L3-L35）、行44–75（https://github.com/elixir-ecto/ecto/blob/94d69279c517347ff0962b138f4ccd0556486ae2/lib/ecto/changeset.ex#L44-L75）、行77–94（https://github.com/elixir-ecto/ecto/blob/94d69279c517347ff0962b138f4ccd0556486ae2/lib/ecto/changeset.ex#L77-L94）、行124–152（https://github.com/elixir-ecto/ecto/blob/94d69279c517347ff0962b138f4ccd0556486ae2/lib/ecto/changeset.ex#L124-L152）
  - elixir-ecto/ecto、`lib/ecto.ex` 行178–184（https://github.com/elixir-ecto/ecto/blob/94d69279c517347ff0962b138f4ccd0556486ae2/lib/ecto.ex#L178-L184）
  - elixir-ecto/ecto、`guides/howtos/Data mapping and validation.md` 行42–56（https://github.com/elixir-ecto/ecto/blob/94d69279c517347ff0962b138f4ccd0556486ae2/guides/howtos/Data%20mapping%20and%20validation.md#L42-L56）、行102–104（https://github.com/elixir-ecto/ecto/blob/94d69279c517347ff0962b138f4ccd0556486ae2/guides/howtos/Data%20mapping%20and%20validation.md#L102-L104）、行106–124（https://github.com/elixir-ecto/ecto/blob/94d69279c517347ff0962b138f4ccd0556486ae2/guides/howtos/Data%20mapping%20and%20validation.md#L106-L124）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - changesetの4つの機能を、filtering（受け付けるdataを明示的に列挙する。利用者が`is_admin`を立てられないように）、型変換、validation、constraint（DBの助けを要する検査。例：emailが既に使われているか）と書く（13–35）。
  - 外部のdata（form等の文字列keyのmap）は`cast/4`で型変換・検証し、内部のdata（programが作ったもの）は`change/2`・`put_change/3`で扱う。atom keyのmapやstructなら検証済み、という区別でdataの性質を追える、と書く（44–75）。
  - validationは多くがDBと関わらず、挿入・更新の前に必ず実行される。DBに対するvalidationは安全でなく`unsafe_`接頭辞を持つ（例：`unsafe_validate_unique/4`）。constraintはDBに依存し常に安全である。validationはconstraintより先に検査され、validationが失敗するとconstraintは検査されない（77–94）。例では、ageが不正な間はunique constraintが検査されず、直した後にemailの重複がerrorとして返る（124–138）。validationとconstraintは検査の時点の境界を明示し、constraintをDBへ移すことで競合の無い検査になる、と書く（140–142）。
  - deferred constraint（transactionの終わりに検査されるもの）はchangesetでは扱えず、違反は`{:error, changeset}`ではなくtransactionの終わりの例外になる（146–152）。
  - validationは変更されたfieldだけを検査する。paramsに無いfieldは検査されない（ecto.ex 178–184）。
  - guideは、form用の`embedded_schema`（永続化しない）でcast・validateし、検証済みの値をaccountsとprofilesの2表へ分けて書く例を示す（42–104）。schema無しのchangeset（dataと型のtuple）も使えると書く（106–120）。最も大事なのはschemaの要否ではなく、大きな問題を独立に解ける小さな問題に分けることだ、と結ぶ（124）。
- 解いている問題と前提：外部入力とDBの表の形を同じものにせず、受付・変換・検証・DB制約の違反の報告を1つの値に集める。前提は、一意性などの検査をDBの制約として表せること。
- 必要な入力：受け付けるfieldの一覧、型、validationの規則、DB側の制約名と、それをerrorへ写す宣言（`unique_constraint`等）。
- trade-off・失敗の仕方：DBを問い合わせるvalidationは競合に弱い（`unsafe_`の名前で示す）。deferred constraintはchangesetのerrorにならない。変更されていないfieldは検証されないため、既存の不正な値は残りうる（178–184からの推論）。
- 反例・適用しない場合：SQLAlchemy・Doctrine・HibernateのUnit of Work型は、変更をobjectに直接書き、flush時に差分を出す（P33-O04）。検証の置き場所は今回読んだ範囲では写像の外である（Hibernateのbean validation等は読んでいない）。
- 互換・非互換：P33-O07の一部。P33-O09のcast_assoc／cast_embedで親のchangesetに子の検証が入る。P33-O13の`optimistic_lock`もchangesetに付ける。
- 限界：validationの数値条件（長さ、範囲）は持ち込まない。changeset.exの例にある数値の範囲も写していない。

### P33-O09 集約の境界と保存の単位：cascade・orphanの削除・親を通した子の変更・明示のtransaction
- 出典：
  - sqlalchemy、`doc/build/orm/cascades.rst` 行6–18（https://github.com/sqlalchemy/sqlalchemy/blob/a9956b1ab72561c4642ff9dfdf9ae52f3eb5d307/doc/build/orm/cascades.rst#L6-L18）、行52–58（https://github.com/sqlalchemy/sqlalchemy/blob/a9956b1ab72561c4642ff9dfdf9ae52f3eb5d307/doc/build/orm/cascades.rst#L52-L58）、行299–310（https://github.com/sqlalchemy/sqlalchemy/blob/a9956b1ab72561c4642ff9dfdf9ae52f3eb5d307/doc/build/orm/cascades.rst#L299-L310）、行628–645（https://github.com/sqlalchemy/sqlalchemy/blob/a9956b1ab72561c4642ff9dfdf9ae52f3eb5d307/doc/build/orm/cascades.rst#L628-L645）
  - doctrine/orm、`docs/en/reference/working-with-associations.rst` 行412–437（https://github.com/doctrine/orm/blob/1869102c90c3dc10c8c3dc33a19b0794c2790419/docs/en/reference/working-with-associations.rst#L412-L437）、行507–523（https://github.com/doctrine/orm/blob/1869102c90c3dc10c8c3dc33a19b0794c2790419/docs/en/reference/working-with-associations.rst#L507-L523）、行530–571（https://github.com/doctrine/orm/blob/1869102c90c3dc10c8c3dc33a19b0794c2790419/docs/en/reference/working-with-associations.rst#L530-L571）
  - elixir-ecto/ecto、`lib/ecto/changeset.ex` 行171–236（https://github.com/elixir-ecto/ecto/blob/94d69279c517347ff0962b138f4ccd0556486ae2/lib/ecto/changeset.ex#L171-L236）
  - elixir-ecto/ecto、`lib/ecto/multi.ex` 行3–37（https://github.com/elixir-ecto/ecto/blob/94d69279c517347ff0962b138f4ccd0556486ae2/lib/ecto/multi.ex#L3-L37）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - SQLAlchemy：cascadeは、`Session`に対する親objectへの操作を、関連の子objectへどう伝えるかを`relationship.cascade`で決める（6–11）。既定は`save-update, merge`で、親に付いている間だけ存在する子には`delete`と`delete-orphan`を足すのが典型と書く（13–18、52–58）。`delete-orphan`は、親から外された子を削除対象にし、子は同時に1つの親しか持たないことを含意する。大多数の場合は一対多にだけ付ける。多対一・多対多で使う場合は、`single_parent`で「many」側を1親に強制できる（can be forced）が、それは「many」関係の機能を大きく制限し、通常は望まれるものではない、と但し書きがある（628–645）。ORMの削除cascadeは、既定ではDBの`FOREIGN KEY`の`CASCADE`とは独立に働き、より効率的に連携させるには`passive_deletes`の指示を使うべき（should）とする（299–302）。また削除cascadeは`Session.delete`でunit of workに印を付けた場合だけに効き、bulkの`delete`構文には効かない（304–310）。
  - Doctrine：関連ごとに`persist`・`remove`・`detach`・`refresh`・`all`のcascadeを設定できる（412–418）。`cascade: persist`の主な用途は、関連entityをapplicationに「見せない」ことで、子を親を通してだけ扱う例を示す（420–437）。cascadeはmemory上で行われ、lazyの関連も読み込まれるため、大きなcollectionでは性能の負担が大きいと書き、DB側の削除cascade（`onDelete`）を使う道も示す。`cascade=all`を一律に付けないよう求める（507–523）。flush時に、`cascade: persist`の付いたcollectionの新しいentityは永続化され、付いていないcollectionの新しいentityは例外になりflushがrollbackされる（persistence by reachability）（530–547）。`orphanRemoval`は、子が「私有され、他から再利用されない」ことを前提にし、それを破ると他へ付け替えた子も削除される（549–564）。`orphanRemoval`は`cascade persist`と組み合わせるべき（should）と勧め、その理由をDoctrineの限界として書く（566–571）。
  - Ecto：`cast_assoc`／`cast_embed`は外部dataから親と子を一度に変更し、`put_assoc`／`put_embed`は関連を丸ごと置き換える（171–183）。これらは関連の扱いについて意見を持っており、違う挙動や明示の制御が要るなら`Ecto.Multi`で複数の操作を書く、とする（185–189）。親のchangesetで子が「置き換えられた」とき（例：既存の子のidを渡さなかった）の扱いを`:on_replace`で決め、既定（`:raise`）は親を通した削除を許さない。`:delete`・`:delete_if_exists`は、利用者が`nil`や空listを送るだけで関連dataを削除できるため注意を要すると書く（199–236）。
  - `Ecto.Multi`は、1つのDB transactionで行う複数のRepo操作を名前付きで束ね、実行せずに中身を調べられる。changesetがすべてvalidならtransactionを始め、追加した順に実行する。どれかのchangesetにerrorがあればtransactionを始めずに返す（関数を受ける変種はtransaction開始後に実行されるためこの事前検査をしない）（3–37）。操作の集合が動的なときに特に有用で、それ以外は`Repo.transact`の中の普通の制御flowの方が単純だと書く（21–26）。
- 解いている問題と前提：どの子objectが親と一緒に保存・削除されるか（保存の単位）を、関連の宣言で決める。前提は、子の所有者が1つであること（`delete-orphan`、`orphanRemoval`）。
- 必要な入力：関連ごとの所有の有無、子が他の親へ移りうるか、DB側の外部key制約とcascadeの有無、削除を親から許すか。
- trade-off・失敗の仕方：所有の前提が崩れると、他へ付け替えた子が消える（Doctrine 561–564）。ORMのcascadeとDBのcascadeは既定では別に動き（`passive_deletes`で連携できる。SQLAlchemy 299–302）、bulk操作ではORMのcascadeが効かない（SQLAlchemy 304–310）。memory上のcascadeは大きなcollectionで重い（Doctrine 514–516）。Ectoの`:delete`は入力だけで削除を起こせる（230–231）。
- 反例・適用しない場合：Hibernateは、集約をid参照の島に分けて関連を持たない設計に反対している（P33-O10）。jOOQは関連をobject graphとして持たず、問合せの時点で入れ子を作る（P33-O14）。
- 互換・非互換：P33-O03・O05のflushの中で働く。P33-O08のchangesetと組み合わさる（Ecto）。
- 限界：「集約（aggregate）」という語を、SQLAlchemy・Doctrine・Ectoは今回読んだcascadeの文書で使っていない。cascadeの宣言を集約の境界と読むのは本書の当てはめである。

### P33-O10 集約をid参照の島に分ける設計への、ORM側からの反対意見
- 出典：
  - hibernate-orm、`documentation/src/main/asciidoc/introduction/Entities.adoc` 行1145–1146（https://github.com/hibernate/hibernate-orm/blob/bc6aa6d42f3547a3e5b4204ada1e597ffcc5ed20/documentation/src/main/asciidoc/introduction/Entities.adoc#L1145-L1146）、行1149–1176（https://github.com/hibernate/hibernate-orm/blob/bc6aa6d42f3547a3e5b4204ada1e597ffcc5ed20/documentation/src/main/asciidoc/introduction/Entities.adoc#L1149-L1176）
  - 信頼性ラベル：primary（公式文書。ただし設計上の意見であり、実装の事実ではない）。本文確認：済
- 何をしているか：
  - 直前の段落で、`@ManyToOne`の代わりに識別子を持つ基本型の属性を置くことは、Javaの水準で関連として考えにくい場合には完全に許容できるが、この考えを行き過ぎることもできる、と書く（1145–1146）。
  - 折り畳みの節「Aggregates」で、entity classを「aggregate」という切り離された小さな島に分け、aggregate間に関連を置かず、`Item.product`を`productId`に置き換える、という主張を紹介する（1153–1159）。
  - これはdocument DBへのaccessなど一部の文脈では自然かもしれないと認めたうえで、Hibernate経由で関係DBへaccessする場合には通常意味をなさない、とする（1161–1162）。理由は、second-level cache、join・batch・subselectのfetchなど、関連のdataへのaccessを最適化する機能が、Hibernateが関連と知らなければ失われ、複数のaggregateにまたがる業務要求が来たときにN+1 selectに弱くなるからだ、と書く（1163–1169）。
  - 透過的なlazy fetchによる意図しない取得とN+1の懸念は正当だと認め、その対処としてstateless session（`EntityAgent`）やstatelessなJakarta Data repositoryで関連の取得を常に明示操作にすることを挙げる。`EntityAgent`は`update()`も常に明示なので、意図しない更新も防ぐ、とする（1174–1176）。
- 解いている問題と前提：集約の境界を「関連を持たない」ことで表すか、関連を持ったまま取得と更新を明示にするかの選択。Hibernateの前提は関係DBで、関連の情報をORMが使って取得を最適化すること。
- 必要な入力：対象の保存方式（関係DBかdocument DBか）、集約をまたぐ読取りの要求の有無。
- trade-off・失敗の仕方：Hibernateの主張では、id参照にするとORMの取得最適化が失われN+1に弱くなる。逆に、関連を残して透過的なlazy fetchを使うと、意図しない取得が起きうる（1174）。
- 反例・適用しない場合：Hibernate自身が、document DBへのaccessでは自然でありうると書く（1161）。Ectoはlazy loadをせず（P33-O07）、関連の読込みを常に明示にしているため、この対立の片側（意図しない取得）がそもそも起きない。
- 互換・非互換：P33-O06（stateless session）を対処として挙げる。P33-O09のcascadeによる保存単位とは別の軸（読取りの単位）である。
- 限界：この節は意見の表明であり、id参照を勧める側の一次資料は今回読んでいない（DDDの文献はblog・書籍であり本書の根拠に使わない）。どちらの主張が正しいかの判断はしない。N+1の詳細はP27で扱った。

### P33-O11 継承の表への写し方：1表・結合表・具象表・写像上だけの継承
- 出典：
  - sqlalchemy、`doc/build/orm/inheritance.rst` 行6–19（https://github.com/sqlalchemy/sqlalchemy/blob/a9956b1ab72561c4642ff9dfdf9ae52f3eb5d307/doc/build/orm/inheritance.rst#L6-L19）、行33–42（https://github.com/sqlalchemy/sqlalchemy/blob/a9956b1ab72561c4642ff9dfdf9ae52f3eb5d307/doc/build/orm/inheritance.rst#L33-L42）、行85–96（https://github.com/sqlalchemy/sqlalchemy/blob/a9956b1ab72561c4642ff9dfdf9ae52f3eb5d307/doc/build/orm/inheritance.rst#L85-L96）、行268–280（https://github.com/sqlalchemy/sqlalchemy/blob/a9956b1ab72561c4642ff9dfdf9ae52f3eb5d307/doc/build/orm/inheritance.rst#L268-L280）、行745–770（https://github.com/sqlalchemy/sqlalchemy/blob/a9956b1ab72561c4642ff9dfdf9ae52f3eb5d307/doc/build/orm/inheritance.rst#L745-L770）
  - doctrine/orm、`docs/en/reference/inheritance-mapping.rst` 行10–30（https://github.com/doctrine/orm/blob/1869102c90c3dc10c8c3dc33a19b0794c2790419/docs/en/reference/inheritance-mapping.rst#L10-L30）、行133–155（https://github.com/doctrine/orm/blob/1869102c90c3dc10c8c3dc33a19b0794c2790419/docs/en/reference/inheritance-mapping.rst#L133-L155）、行169–178（https://github.com/doctrine/orm/blob/1869102c90c3dc10c8c3dc33a19b0794c2790419/docs/en/reference/inheritance-mapping.rst#L169-L178）、行235–258（https://github.com/doctrine/orm/blob/1869102c90c3dc10c8c3dc33a19b0794c2790419/docs/en/reference/inheritance-mapping.rst#L235-L258）、行263–271（https://github.com/doctrine/orm/blob/1869102c90c3dc10c8c3dc33a19b0794c2790419/docs/en/reference/inheritance-mapping.rst#L263-L271）
  - hibernate-orm、`documentation/src/main/asciidoc/userguide/chapters/domain/inheritance.adoc` 行7–12（https://github.com/hibernate/hibernate-orm/blob/bc6aa6d42f3547a3e5b4204ada1e597ffcc5ed20/documentation/src/main/asciidoc/userguide/chapters/domain/inheritance.adoc#L7-L12）、行37–41（https://github.com/hibernate/hibernate-orm/blob/bc6aa6d42f3547a3e5b4204ada1e597ffcc5ed20/documentation/src/main/asciidoc/userguide/chapters/domain/inheritance.adoc#L37-L41）、行311–314（https://github.com/hibernate/hibernate-orm/blob/bc6aa6d42f3547a3e5b4204ada1e597ffcc5ed20/documentation/src/main/asciidoc/userguide/chapters/domain/inheritance.adoc#L311-L314）、行316–325（https://github.com/hibernate/hibernate-orm/blob/bc6aa6d42f3547a3e5b4204ada1e597ffcc5ed20/documentation/src/main/asciidoc/userguide/chapters/domain/inheritance.adoc#L316-L325）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - SQLAlchemyは3方式を持つ。single table（複数の型を1表で表す）、concrete table（型ごとに独立の表）、joined table（階層を依存する表に分け、各表はそのclassに固有の属性だけを持つ）。単一の問合せで複数の型を返す多態的な読込みができる（6–19）。joinedでは、subclassの問合せは継承経路の全表をJOINし、行ごとにどのclassを作るかは基底classに置いた識別列（discriminator）またはSQL式で決める（33–42）。識別子は必須ではないが多態的な読込みには必要で、階層全体で1つしか置けない（85–96）。single tableは、他の型の行ではNULLになる列を持ち、識別列でWHEREを付けて絞る。joinedより単純で、1表だけで全classを読めるため問合せが効率的、と書く（268–280）。concreteは既定では多態的に問い合わせず、多態的な読込みはmapperに特別なSELECTを構成して有効にし、そのSELECTは通常（typically）全表のUNIONで作る（749–751）。joinedやsingleよりはるかに複雑で機能が限られ、多態的に使うとUNIONの大きな問合せになると警告し、多態的な読込みが不要な場合に向くとする（745–770）。
  - Doctrineは、entity継承の方式として2つ（single table、class table）を持ち、rootのentityに`InheritanceType`・`DiscriminatorColumn`・`DiscriminatorMap`を置く（133–147）。識別子の対応表を省くと自動生成されるが、計算が重いと書く（153–164。下の追加出典）。mapped superclassは、subclassへ状態と写像を与えるが自身はentityでなく、表を持たず、問合せできず、関連の`targetEntity`になれない（10–30）。多対一・一対一の関連先が継承階層に含まれる場合、性能上は葉のentity（subclassを持たない）であることが望ましいとし、そうでない場合はどのclassか事前に分からずproxyを作れないため、常にeagerに読み込まれる、と性能上の注意を書く（169–178）。single tableは型階層が単純で安定している場合に向き、型や列の追加は列の追加で済むが、大規模ではindexと列の配置に悪影響がありうる。root以外の列はNULLを許す必要がある（235–258）。class tableは、各classを自分の表と全親classの表に写し、子の表を外部keyで親の表へつなぐ。識別列は最上位の表に置く（263–271）。
  - Hibernateは4つを挙げる。MappedSuperclass（継承はdomain modelだけにあり、DB schemaには反映されない）、single table、joined table、table per class（各subclassの表が基底classの属性も持つ）（7–12）。MappedSuperclassでは基底classに対する多態的な問合せはできない（37–41）。table per classの多態的な問合せは複数のUNIONを要し、大きなclass階層では性能に注意せよ、と書く（311–314）。embeddable型にも識別列による継承がある（316–325）。
  - 追加出典：doctrine/orm、`docs/en/reference/inheritance-mapping.rst` 行157–164（https://github.com/doctrine/orm/blob/1869102c90c3dc10c8c3dc33a19b0794c2790419/docs/en/reference/inheritance-mapping.rst#L157-L164）
- 解いている問題と前提：関係DBは継承を持たない（Hibernateの`inheritance.adoc` 行7）ため、class階層を表の構成へ写す方式を選ぶ。選択の軸は、多態的な問合せが要るか、型の追加の頻度、NULL可の列を許せるか、JOINやUNIONの費用である。
- 必要な入力：階層の深さと安定性、多態的な問合せと多態的な関連の有無、subclass固有の列にNOT NULL制約を付けたいか。
- trade-off・失敗の仕方：single tableはsubclass固有の列にNOT NULLを付けられない（Doctrine 253–258）。joinedは継承経路の表をJOINする（SQLAlchemy 33–36）。具象表は多態的な問合せでUNIONが大きくなる（SQLAlchemy 758–760、Hibernate 313）。葉でない（subclassを持つ）entityを多態的な関連先にすると、eager読込みになる（Doctrine 169–178）。
- 反例・適用しない場合：Doctrineは具象表（table per class）を、今回読んだ文書のentity継承の方式として持たない（2方式。136–137）。Ectoのschema・changeset文書に継承の写像は見当たらなかった（§見つからなかったこと）。
- 互換・非互換：P33-O12のembeddableの継承（Hibernate）と同じ識別列の考え方。P33-O02のDoctrineのidentity mapはroot entity名をkeyにする。
- 限界：方式ごとの性能の大きさは書かれておらず、値も持ち込まない。識別子の値の形式（文字列、整数）は例であり、写していない。

### P33-O12 value objectの表への写し方：列への展開、prefix、SQLの集約型、JSON列
- 出典：
  - sqlalchemy、`doc/build/orm/composites.rst` 行8–16（https://github.com/sqlalchemy/sqlalchemy/blob/a9956b1ab72561c4642ff9dfdf9ae52f3eb5d307/doc/build/orm/composites.rst#L8-L16）、行231–239（https://github.com/sqlalchemy/sqlalchemy/blob/a9956b1ab72561c4642ff9dfdf9ae52f3eb5d307/doc/build/orm/composites.rst#L231-L239）、行244–245（https://github.com/sqlalchemy/sqlalchemy/blob/a9956b1ab72561c4642ff9dfdf9ae52f3eb5d307/doc/build/orm/composites.rst#L244-L245）
  - doctrine/orm、`docs/en/tutorials/embeddables.rst` 行4–11（https://github.com/doctrine/orm/blob/1869102c90c3dc10c8c3dc33a19b0794c2790419/docs/en/tutorials/embeddables.rst#L4-L11）、行62–71（https://github.com/doctrine/orm/blob/1869102c90c3dc10c8c3dc33a19b0794c2790419/docs/en/tutorials/embeddables.rst#L62-L71）、行83–90（https://github.com/doctrine/orm/blob/1869102c90c3dc10c8c3dc33a19b0794c2790419/docs/en/tutorials/embeddables.rst#L83-L90）、行113–114（https://github.com/doctrine/orm/blob/1869102c90c3dc10c8c3dc33a19b0794c2790419/docs/en/tutorials/embeddables.rst#L113-L114）、行139–144（https://github.com/doctrine/orm/blob/1869102c90c3dc10c8c3dc33a19b0794c2790419/docs/en/tutorials/embeddables.rst#L139-L144）
  - hibernate-orm、`documentation/src/main/asciidoc/userguide/chapters/domain/embeddables.adoc` 行10–15（https://github.com/hibernate/hibernate-orm/blob/bc6aa6d42f3547a3e5b4204ada1e597ffcc5ed20/documentation/src/main/asciidoc/userguide/chapters/domain/embeddables.adoc#L10-L15）、行573–586（https://github.com/hibernate/hibernate-orm/blob/bc6aa6d42f3547a3e5b4204ada1e597ffcc5ed20/documentation/src/main/asciidoc/userguide/chapters/domain/embeddables.adoc#L573-L586）、行638（https://github.com/hibernate/hibernate-orm/blob/bc6aa6d42f3547a3e5b4204ada1e597ffcc5ed20/documentation/src/main/asciidoc/userguide/chapters/domain/embeddables.adoc#L638-L638）
  - elixir-ecto/ecto、`lib/ecto.ex` 行363–371（https://github.com/elixir-ecto/ecto/blob/94d69279c517347ff0962b138f4ccd0556486ae2/lib/ecto.ex#L363-L371）
  - elixir-ecto/ecto、`guides/howtos/Embedded Schemas.md` 行3–12（https://github.com/elixir-ecto/ecto/blob/94d69279c517347ff0962b138f4ccd0556486ae2/guides/howtos/Embedded%20Schemas.md#L3-L12）、行64–68（https://github.com/elixir-ecto/ecto/blob/94d69279c517347ff0962b138f4ccd0556486ae2/guides/howtos/Embedded%20Schemas.md#L64-L68）、行103–109（https://github.com/elixir-ecto/ecto/blob/94d69279c517347ff0962b138f4ccd0556486ae2/guides/howtos/Embedded%20Schemas.md#L103-L109）、行113–121（https://github.com/elixir-ecto/ecto/blob/94d69279c517347ff0962b138f4ccd0556486ae2/guides/howtos/Embedded%20Schemas.md#L113-L121）、行142（https://github.com/elixir-ecto/ecto/blob/94d69279c517347ff0962b138f4ccd0556486ae2/guides/howtos/Embedded%20Schemas.md#L142-L142）、行221（https://github.com/elixir-ecto/ecto/blob/94d69279c517347ff0962b138f4ccd0556486ae2/guides/howtos/Embedded%20Schemas.md#L221-L221）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - SQLAlchemyの`composite`は、列の組を1つの利用者定義型（通常はdataclass）の1属性として表す（8–16）。composite全体を代入するとその列群がUPDATEされる（231–235）。その場での中身の変更は、`mutable`拡張を使わない限り追跡されない（237–239。P33-O04）。composite属性は既定で、列の値に関わらず常にobjectを返す（244–245。それを変える方法が続く）。
  - Doctrineのembeddableは、entityではなくentityに埋め込まれるclassで、DQLで問い合わせられる。日付範囲や住所のようなvalue objectが主な用途と書き、基本の`@Column`写像の属性だけを持てる（4–11）。DB schema上は、embeddableの全列がentityの表へ直接宣言したかのように展開される（62–64）。全fieldがnullableなら、nullではなくembeddableのobjectを得るためにconstructorで初期化する案を示す（69–71）。列名は既定でvalue object名のprefixが付き、`columnPrefix`で変えたり外したりできる（83–90、113–114）。DQLでは埋め込みのfieldを親の属性のように使える（139–144）。
  - Hibernateは、embeddable（歴史的にはcomponent）を値の合成と定義する（10–15）。通常は表の列をJava型に包むものだが、SQLの集約型（名前付きのobject型、JSON、XML）へ写すこともできる。その属性の読取りや更新の式は、SQL型の属性へのaccess式に解決される（573–584）。object・JSON・XML型はDBごとに対応が違い、すべての写像がすべてのDBで動くわけではない、と書き、対応表を載せる（586–636。https://github.com/hibernate/hibernate-orm/blob/bc6aa6d42f3547a3e5b4204ada1e597ffcc5ed20/documentation/src/main/asciidoc/userguide/chapters/domain/embeddables.adoc#L586-L636 。表の中身は写していない）。配列の集約写像に使うembeddableは関連の写像を持てない（638）。
  - Ectoのembedは、関連が親と子を別の表に置くのに対して、子を親と一緒に保存する。MongoDBのように埋め込みをnativeに持つDBもあり、PostgreSQLのようなDBはJSONBとARRAY列の組合せで実現する、と書く（ecto.ex 363–371）。guideは、embedded schemaの用途として、formの中間状態、親の中の単純なdata・頻繁に変わるdata・複雑な追跡と検証が要るdata、document DBを挙げる（3–12）。inlineで定義したembedは親の中に永続化され、`cast_embed`で`with`を要する（64–68）。独立moduleで定義したembedded schemaは複数の親に埋め込め、永続化に依存しない（103–109）。DBに保存するにはmigrationで`:map`型の列を足し、`:map`を勧める理由として、関係DBはそれをJSON（PostgreSQLではJSONB）で表すことが多く、adapterが効率的な保存方法を選べることを挙げる（113–121）。embedの検証の失敗は、親のchangesetにerrorが無くても親を不正にする（142）。JSONBのDBでは埋め込みdataへの問合せのjsonpathを組み立てる（221）。
- 解いている問題と前提：識別子を持たない値（住所、期間、座標等）を、親の行の一部として保存する。選択の軸は、列に展開して個々の列にDB制約と索引を付けるか、1つの列（JSON・struct）にまとめて形の変更を容易にするかである。
- 必要な入力：value objectの属性、列名の規則（prefix）、全属性がNULLのときの扱い、DBが集約型（JSON・struct・XML）に対応するか、埋め込みの中に関連を持つか。
- trade-off・失敗の仕方：
  - 列への展開（SQLAlchemy、Doctrine、Hibernateの通常のembeddable）は、全列がNULLのときにobjectかnullかの扱いが要る（SQLAlchemy 244–245、Doctrine 69–71）。
  - 集約型・JSON列（Hibernateの集約embeddable、Ectoのembed）は、DBの対応に依存する（Hibernate 586）。埋め込みの中で関連を持てない場合がある（Hibernate 638）。
  - 可変なvalue objectの中身の変更は、計装方式では取りこぼしうる（SQLAlchemy 237–239）。
- 反例・適用しない場合：value objectが識別子を持ち、他から参照されるならentityになる（Doctrine 4–5の「entityではない」の裏）。jOOQは写像を宣言せず、問合せでDTOへ写す（P33-O14）。
- 互換・非互換：P33-O04（変更検出）、P33-O08（Ectoの`cast_embed`で検証が親へ伝わる）、P33-O11（Hibernateのembeddable継承）。
- 限界：DBごとの対応表の中身は写していない（対応状況は版で変わる）。JSON列への問合せの性能は読んでいない。

### P33-O13 楽観lockの版列：UPDATE／DELETEのWHEREに版を足し、一致行数で衝突を検出する
- 出典：
  - sqlalchemy、`doc/build/orm/versioning.rst` 行6–27（https://github.com/sqlalchemy/sqlalchemy/blob/a9956b1ab72561c4642ff9dfdf9ae52f3eb5d307/doc/build/orm/versioning.rst#L6-L27）、行29–44（https://github.com/sqlalchemy/sqlalchemy/blob/a9956b1ab72561c4642ff9dfdf9ae52f3eb5d307/doc/build/orm/versioning.rst#L29-L44）、行66–89（https://github.com/sqlalchemy/sqlalchemy/blob/a9956b1ab72561c4642ff9dfdf9ae52f3eb5d307/doc/build/orm/versioning.rst#L66-L89）、行96–100（https://github.com/sqlalchemy/sqlalchemy/blob/a9956b1ab72561c4642ff9dfdf9ae52f3eb5d307/doc/build/orm/versioning.rst#L96-L100）、行174–183（https://github.com/sqlalchemy/sqlalchemy/blob/a9956b1ab72561c4642ff9dfdf9ae52f3eb5d307/doc/build/orm/versioning.rst#L174-L183）、行217–251（https://github.com/sqlalchemy/sqlalchemy/blob/a9956b1ab72561c4642ff9dfdf9ae52f3eb5d307/doc/build/orm/versioning.rst#L217-L251）
  - elixir-ecto/ecto、`lib/ecto/changeset.ex` 行3564–3583（https://github.com/elixir-ecto/ecto/blob/94d69279c517347ff0962b138f4ccd0556486ae2/lib/ecto/changeset.ex#L3564-L3583）、行3625–3640（https://github.com/elixir-ecto/ecto/blob/94d69279c517347ff0962b138f4ccd0556486ae2/lib/ecto/changeset.ex#L3625-L3640）、行3644–3665（https://github.com/elixir-ecto/ecto/blob/94d69279c517347ff0962b138f4ccd0556486ae2/lib/ecto/changeset.ex#L3644-L3665）
  - doctrine/orm、`docs/en/reference/transactions-and-concurrency.rst` 行169–187（https://github.com/doctrine/orm/blob/1869102c90c3dc10c8c3dc33a19b0794c2790419/docs/en/reference/transactions-and-concurrency.rst#L169-L187）、行237–249（https://github.com/doctrine/orm/blob/1869102c90c3dc10c8c3dc33a19b0794c2790419/docs/en/reference/transactions-and-concurrency.rst#L237-L249）、行258–271（https://github.com/doctrine/orm/blob/1869102c90c3dc10c8c3dc33a19b0794c2790419/docs/en/reference/transactions-and-concurrency.rst#L258-L271）、行304–327（https://github.com/doctrine/orm/blob/1869102c90c3dc10c8c3dc33a19b0794c2790419/docs/en/reference/transactions-and-concurrency.rst#L304-L327）
  - hibernate-orm、`documentation/src/main/asciidoc/userguide/chapters/locking/Locking.adoc` 行25–27（https://github.com/hibernate/hibernate-orm/blob/bc6aa6d42f3547a3e5b4204ada1e597ffcc5ed20/documentation/src/main/asciidoc/userguide/chapters/locking/Locking.adoc#L25-L27）、行43–46（https://github.com/hibernate/hibernate-orm/blob/bc6aa6d42f3547a3e5b4204ada1e597ffcc5ed20/documentation/src/main/asciidoc/userguide/chapters/locking/Locking.adoc#L43-L46）、行48–61（https://github.com/hibernate/hibernate-orm/blob/bc6aa6d42f3547a3e5b4204ada1e597ffcc5ed20/documentation/src/main/asciidoc/userguide/chapters/locking/Locking.adoc#L48-L61）、行110–117（https://github.com/hibernate/hibernate-orm/blob/bc6aa6d42f3547a3e5b4204ada1e597ffcc5ed20/documentation/src/main/asciidoc/userguide/chapters/locking/Locking.adoc#L110-L117）、行169–208（https://github.com/hibernate/hibernate-orm/blob/bc6aa6d42f3547a3e5b4204ada1e597ffcc5ed20/documentation/src/main/asciidoc/userguide/chapters/locking/Locking.adoc#L169-L208）、行214–235（https://github.com/hibernate/hibernate-orm/blob/bc6aa6d42f3547a3e5b4204ada1e597ffcc5ed20/documentation/src/main/asciidoc/userguide/chapters/locking/Locking.adoc#L214-L235）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - 共通の形：表に版の列を置き、UPDATE（とDELETE）の WHERE に「主key＝…かつ版＝読んだときの版」を足し、新しい版を書く。一致した行が無ければ、他が先に変えたとみなす。
  - SQLAlchemy：`version_id_col`は、UPDATEのたびに増えるか更新される1列で、ORMがUPDATE・DELETEを出すたびにmemory上の値とDBの値の一致を確かめる（6–10）。照合はmemory上の記録に依るため、`Session.flush`の中だけで働き、`Query.update`／`delete`の複数行のUPDATE・DELETEには効かない、と警告する（12–20）。目的は、並行transactionによる同じ行の変更の検出と、前のtransactionのdataを読み直さず使う場合（`expire_on_commit=False`等）の古い行の検出である（22–27）。transactionの分離levelがrepeatable readより低い場合に、transaction内の衝突検出として役立ち、repeatable read以上ではDBが行lockかMVCCのerrorで扱うので、transaction内の検出には通常役立たないがtransaction間の古さの検出には使える、と書く（29–44）。版列はNOT NULLにすることが強く勧められ、NULLの版は扱えない（66–68）。UPDATEが一致した行が1つでないと`StaleDataError`を送出する（82–89）。版の生成は`version_id_generator`で差し替えられ（日付やGUID）（96–100）、DBが生成する版（PostgreSQLの`xmin`等）を使う場合は、他のtransactionが再び更新する前に新しい版を取得する必要があり、RETURNINGで同時に取るのが望ましいとする（174–183）。`version_id_generator=False`にすると、版を利用者が明示で設定でき、版を変えずに更新すれば、その更新は版を進めずに以前の値で照合される。並行性に敏感な更新だけで版を進める方式に使える、と書く（217–251）。
  - Ecto：`optimistic_lock/3`は、悲観lockがtransaction全体で資源をlockするのに対し、更新の直前に資源が変わったかだけを確かめる、と書く。並行更新の確率が低い場面に向き、そうでなければ悲観lock等が合う、とする（3564–3575）。版のfieldをschemaに持ち、通常は整数だが他の型も使える（3579–3583）。衝突すると`Ecto.StaleEntryError`を送出し、削除にも使える。整数以外の型では次の値を作る関数を第3引数で渡す（3625–3640）。実装は、現在の値を`changeset.filters`へ入れ（WHEREの条件）、次の版の値は`prepare_changes`の中、すなわちRepoの中でだけ`changes`へ入れる（commentは「lockの変更を恒久的に追跡したくないから」）。現在の値が`nil`の場合はwarningをlogに出し、filterを付けない（3644–3665）。既定の加算関数は、整数の上限で巻き戻す（3667–3675。https://github.com/elixir-ecto/ecto/blob/94d69279c517347ff0962b138f4ccd0556486ae2/lib/ecto/changeset.ex#L3667-L3675 。上限の値は持ち込まない）。
  - Doctrine：DBのtransactionは1つのrequest内の並行制御には十分だが、利用者の「考える時間」をまたいでtransactionを張るべきではなく、複数requestにまたがる業務transactionでは、並行制御の一部がapplicationの責務になる、と書く（169–176）。版のfieldは整数かdatetimeで、長い会話の終わりに永続化するときにDBの版と比べ、一致しなければ`OptimisticLockException`を送出する（178–187）。timestampは高い並行性でDBの分解能次第で衝突しうるので、版番号を優先すべき（should）とする（237–241）。衝突時はflushで例外が出てtransactionがrollback（またはrollback mark）され、利用者に衝突を示すか、新しいtransactionで読み直して再試行する、と応答の例を挙げる（243–249）。`find`に期待する版を渡すと、読んだ時点で版を確かめられる（258–271）。正しく使うには、読んだときの版をformの隠しfield（またはsession）に入れて送り返す必要があり、そうしないと、後のrequestで読み直した最新の版と比べることになり、防ぎたかったlost updateが起きる、と書く（304–327）。
  - Hibernate：会話が複数のDB transactionにまたがる場合に、版の情報を保存して、同じentityを2つの会話が更新したときに後からcommitした側へ衝突を知らせる。ある程度の分離を保証し、読取りが多く書込みが時々の状況に向く、と書く（48–51）。版または時刻の列は、detachedのinstanceではnullになれず、nullの版を持つinstanceはtransientとみなされる（55–61）。applicationは、Hibernateが設定した版番号を変えてはならない（forbidden）。人為的に版を上げるには、lock modeの`OPTIMISTIC_FORCE_INCREMENT`等を使う（110–117）。既定では全属性の変更が版を上げるが、`@OptimisticLock`で特定の属性を版の対象から外せる。外した属性は並行更新でlost updateを許すことになる、と警告する（169–208）。版の列を持たない楽観lockもあり、`OptimisticLockType`の`ALL`（全field）か`DIRTY`（変更されたfield）をUPDATE・DELETEのWHEREに足す。既存のschemaの写像にも有用、と書く（214–235）。楽観lockの版を確かめる読取りの選択に、bootstrap時に解決したtransaction並行性の基準を使い（25–27）、通常の読取りも方言のcurrent readも必要な保証を与えない場合は、古いsnapshotに頼らず版の検証を拒否する、と書く（43–46）。
- 解いている問題と前提：lockを保持せずに、読み取ってから書くまでの間の他者の変更を検出し、lost updateを防ぐ。前提は、書く側が読んだ時点の版を保持していること（Doctrine 304–327）と、照合がORMの書込み経路を通ること（SQLAlchemy 12–20）。
- 必要な入力：版の列（型：整数・時刻・UUID・DB生成値）、版を進める規則（全変更か、一部の属性を除くか、明示の時だけか）、衝突時の応答（利用者へ示す、読み直して再試行）、request間で版を運ぶ手段。
- trade-off・失敗の仕方：
  - ORMを通らない一括UPDATE・DELETEでは照合されない（SQLAlchemy 12–20）。
  - 読んだときの版をrequest間で運ばないと、照合が意味を失う（Doctrine 322–327）。
  - 版の値がNULLだと照合されない（Ectoはwarningを出してfilterを付けない、SQLAlchemyは扱えない、Hibernateはtransientとみなす）。
  - 時刻の版は、DBの分解能次第で高い並行性のもとで衝突しうる（conflict）と書く（Doctrine 237–241）。その結果として衝突を見逃しうる、というのは本書の推論である。
  - 一部の属性を版から外すと、その属性はlost updateを許す（Hibernate 204–208）。
  - 版を誰が進めるかは実装で分かれる。SQLAlchemyは利用者が明示で設定する方式を許し（217–251）、Hibernateは利用者による変更を禁じる（115）。
- 反例・適用しない場合：並行更新が多い場合は悲観lockが合うとEctoは書く（3573–3575）。jOOQは、版・時刻の列が無い場合に`SELECT … FOR UPDATE`で比べる（P33-O14）。
- 互換・非互換：P33-O03（flush時の照合）、P33-O08（Ectoはchangesetに付ける）、P33-O14（jOOQの設定による有効化）。P08-O06（job完了時のfencing）とは、「所有・版を条件にした更新」という同じ形を別の目的で使っている。
- 限界：版の初期値、上限、巻戻しの値は持ち込まない。DBの分離levelごとの挙動はHibernateの文書の範囲で読んだだけで、各DBの文書は読んでいない。

### P33-O14 表の行を表すrecordが自分で保存する形と、問合せの時点で入れ子のDTOへ写す形（jOOQ）
- 出典：
  - jOOQ、`jOOQ/src/main/java/org/jooq/UpdatableRecord.java` 行77–110（https://github.com/jOOQ/jOOQ/blob/ccf5efc88a031b3a42a2d774363a0a9a59e042c1/jOOQ/src/main/java/org/jooq/UpdatableRecord.java#L77-L110）、行125–151（https://github.com/jOOQ/jOOQ/blob/ccf5efc88a031b3a42a2d774363a0a9a59e042c1/jOOQ/src/main/java/org/jooq/UpdatableRecord.java#L125-L151）、行168–217（https://github.com/jOOQ/jOOQ/blob/ccf5efc88a031b3a42a2d774363a0a9a59e042c1/jOOQ/src/main/java/org/jooq/UpdatableRecord.java#L168-L217）、行234–240（https://github.com/jOOQ/jOOQ/blob/ccf5efc88a031b3a42a2d774363a0a9a59e042c1/jOOQ/src/main/java/org/jooq/UpdatableRecord.java#L234-L240）
  - jOOQ、`jOOQ/src/main/java/org/jooq/DAO.java` 行70–84（https://github.com/jOOQ/jOOQ/blob/ccf5efc88a031b3a42a2d774363a0a9a59e042c1/jOOQ/src/main/java/org/jooq/DAO.java#L70-L84）
  - jOOQ、`README.md` 行4–13（https://github.com/jOOQ/jOOQ/blob/ccf5efc88a031b3a42a2d774363a0a9a59e042c1/README.md#L4-L13）、行43（https://github.com/jOOQ/jOOQ/blob/ccf5efc88a031b3a42a2d774363a0a9a59e042c1/README.md#L43-L43）、行75–106（https://github.com/jOOQ/jOOQ/blob/ccf5efc88a031b3a42a2d774363a0a9a59e042c1/README.md#L75-L106）、行124–142（https://github.com/jOOQ/jOOQ/blob/ccf5efc88a031b3a42a2d774363a0a9a59e042c1/README.md#L124-L142）
  - 信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - READMEは、jOOQを「SQL言語を型安全なJava APIとしてmodel化する内部DSLとsource code生成器」とし、主機能をcode生成器とDSL APIに置く。DAOは副次的な機能とされる（4–13）。「opt-inの楽観lock付きの、簡略化されたCRUDのためのUpdatableRecords」も挙げる（43）。
  - `UpdatableRecord`は、表またはviewを表し、主keyか少なくとも1つのunique keyを持つrecordで、その「main unique key」を使って`delete`・`refresh`・`store`・`merge`を行う。recordは`Configuration`に付け外しでき、付いていなければ保存の前に付ける必要がある（77–110）。
  - `store()`は、主keyの状態でINSERTかUPDATEかを決める。利用者のcodeが作ったrecordはINSERT、jOOQが読み込んだrecordで主keyに触れていなければUPDATE、主keyに触れていればINSERT（設定`isUpdatablePrimaryKeys`が無い場合）。主keyはRDBの正規化の原則から変わらないと期待し、主keyの変更は「複製したい」と解釈する、と書く。どちらの文でも、利用者が明示的に設定したfieldだけを書き（DBの`DEFAULT`を効かせるため）、変更が無ければ何も実行しない（125–151）。
  - 版・時刻の列がcode生成の設定で指定されていれば、INSERT・UPDATEでそれらの値を生成して設定する（168–182）。楽観lockは、設定`isExecuteWithOptimisticLocking`を有効にした場合だけ働く。版・時刻の列があれば、それをWHEREで比べる（好ましい方式と書く）。無ければ、`SELECT … FOR UPDATE`で行を悲観的にlockしてから最新の状態と比べる。SQLiteでは悲観lockができず、確認とUPDATEの間の競合を利用者が防ぐ必要がある（185–217）。UPDATE文の例は、`WHERE [key fields = key values] AND [version/timestamp fields = version/timestamp values]`の形である（234–240）。
  - `DAO`は、POJOと主keyの型に対する汎用のinterfaceで、生成されたDAO classが実装する（70–84）。
  - READMEの例は、`MULTISET`演算子で、映画ごとに入れ子の俳優listと分類listを1つの問合せで取り、constructor参照で`Film`・`Actor`のrecord型（DTO）へ写す（75–106）。commentは、`MULTISET`は入れ子のcollectionをSQLで作る標準演算子で、nativeに対応するか、SQL/JSONかSQL/XMLで模倣されると書く。暗黙のpath joinで外部keyの関係をたどり、外側の問合せとの相関を暗黙に付け、構造的なrecord型を独自のDTOへ写す（124–142）。
- 解いている問題と前提：object graphと永続化contextを持たずに、(a) 行単位の保存はrecord自身に持たせ、(b) 入れ子の読取り形は問合せごとに決める。前提は、表の構造からcodeを生成すること（DBが先）。
- 必要な入力：code生成の対象のschema、主keyまたはunique key、版・時刻の列の命名規則（code生成の設定）、楽観lockの有効化の設定、読取りごとのDTOの形。
- trade-off・失敗の仕方：
  - 主keyに触れると、UPDATEではなくINSERTになる（設定が無い場合）（136–142）。
  - 楽観lockは既定では有効でない（opt-in。README 43、`UpdatableRecord` 187–189）。版の列が無いときの比較は悲観lockに頼り、SQLiteでは競合を防げない（209–213）。
  - 読取りのDTOは問合せごとに作るため、同じ行を表す別のobjectが生まれうる（Identity Mapを持たない。README・javadocに明示の記述は無く、P33-O02との対比からの推論）。
- 反例・適用しない場合：SQLAlchemy・Doctrine・HibernateのData Mapper＋Unit of Workでは、保存はcontextが担い、domain objectは自分で保存しない（P33-O01、O03）。
- 互換・非互換：P33-O13の版列（同じWHEREの形）。P33-O10の論点（集約をまたぐ読取り）に対して、問合せの時点で入れ子を組み立てる別の答え方になっている。P33-O01とは保存の責務の置き場所で異なる。
- 限界：jOOQの公式manualはrepository外（Webサイト）にあり、READMEのlink先は読んでいない。`UpdatableRecordImpl`の実装、`DAOImpl`の実装は読んでいない。`store()`の楽観lockの説明中に「executed `DELETE` statement」と書かれた行（198–200）があるが、`store()`の説明の中でDELETEと書いている理由は確認していない。この観察を「Active Record」と呼ぶのは本書の分類で、jOOQの文書はその語を使っていない。

## 同じ問題の解き方の比較
| 問題 | repoA のやり方 | repoB のやり方 | 違いが生じる前提 |
|---|---|---|---|
| 保存の責務をどこに置くか | SQLAlchemy／Doctrine／Hibernate（stateful）：context（Session・EntityManager）が変更を集めてflushする（O01、O03） | Ecto：Repoへの明示の呼出しごとに書く（O07）。jOOQ：recordが`store()`する（O14）。Hibernate（stateless）：即時の`insert`・`update`（O06） | object graphを編集するか、行を単発で書くか。暗黙の書込みを許すか |
| 同じ行の重複object | SQLAlchemy／Doctrine／Hibernate（stateful）：主keyでIdentity Mapを持つ（O02） | Hibernate（stateless）：持たず、別objectが返ると明記（O06）。Ecto・jOOQ：持たない（文書に記述が無く、推論） | contextの寿命を管理できるか。thread間で共有しないか |
| 変更の検出 | Doctrine：読込み時のsnapshotとflush時の比較（O04）。Hibernate：enhancerを使わない場合はsnapshot、使う場合は書込みの横取り | SQLAlchemy：属性の計装による変更event（O04）。Ecto：changesetに変更を明示で持つ（O08）。jOOQ：recordのtouched／modifiedの印 | domain classを普通のclassに保つか。比較の費用を許すか |
| 書込みの順序 | SQLAlchemy：mapper依存のtopological sort、循環は行単位（O05） | Ecto.Multi：追加した順（O09）。Hibernate stateless：呼んだ順に即時（O06） | 依存をORMが知っているか、利用者が書くか |
| 入力の検証 | Ecto：changesetでfiltering・cast・validation・constraint。validationが先、DB constraintが後（O08） | SQLAlchemy／Doctrine／Hibernate：今回読んだ範囲では写像の外 | 外部入力の受付と永続化を同じ値で扱うか |
| 保存の単位（集約の境界） | SQLAlchemy：`delete-orphan`と`single_parent`。Doctrine：`cascade: persist`、persistence by reachability、`orphanRemoval`（O09） | Ecto：`cast_assoc`の`:on_replace`、明示の`Ecto.Multi`（O09）。Hibernate：id参照の島に分けることに反対し、stateless sessionを代わりに挙げる（O10）。jOOQ：問合せの時点でMULTISETにより入れ子を作る（O14） | 子の所有者が1つか。関連の情報をORMの最適化に使うか |
| 継承の写し方 | SQLAlchemy：single・joined・concreteの3方式（O11） | Doctrine：single・class tableの2方式とmapped superclass。Hibernate：MappedSuperclass・single・joined・table per classの4方式 | 多態的な問合せの要否。NOT NULLを付けたいか。JOIN・UNIONの費用 |
| value object | SQLAlchemy composite・Doctrine embeddable・Hibernate embeddable：親の表の列へ展開（O12） | Hibernate：SQLの集約型（struct・JSON・XML）。Ecto：embedを`:map`列（JSON）に保存 | 列ごとにDB制約・索引を付けたいか。DBが集約型に対応するか |
| 楽観lockの版 | SQLAlchemy／Ecto／Doctrine／Hibernate：版列をWHEREに足し、一致行数で衝突を検出（O13） | Hibernate：版列なしで全fieldか変更fieldをWHEREに足す方式も持つ。jOOQ：版列が無ければ`SELECT … FOR UPDATE`（O14） | 版列を足せるか（既存schema）。誰が版を進めるか（ORMか利用者か） |
| 版を誰が進めるか | SQLAlchemy：生成関数を差し替え、`False`で利用者が明示で設定でき、版を進めない更新もできる（O13） | Hibernate：利用者による変更を禁じ、lock modeで強制的に進める。特定属性を版の対象から外せる | 一部の更新だけを衝突検出の対象にしたいか |

## 見つからなかったこと・gap
- Active Recordを名指しした一次資料は、Hibernateの`Introduction.adoc`の折りたたみ節（行408–421）だけだった。これはData Mapper側（Hibernate）が別方式として触れたもので、Active Record側の一次資料ではない（Doctrineは自らをData Mapperと書く）。Active Record側から両者を対比した一次資料は今回の範囲には無い。P27で読んだrails（Active Recordの実装）の箇所とは重ねていない。
- 集約（DDDの意味のaggregate）とtableの対応を正面から扱う設計文書は、Hibernateの反対意見（O10）だけだった。SQLAlchemy・Doctrine・Ectoの今回読んだ文書は、cascadeや所有を関連の宣言として書き、「aggregate」という語では説明していない（O09の限界）。id参照を勧める側の一次資料（OSSの設計文書）は今回見つけていない。
- Ectoのschema・changeset・guideに、継承の表への写し方の記述は見当たらなかった（`guides/howtos/Polymorphic associations with many to many.md`は題名だけを確認し、本文は読んでいない）。
- DoctrineとHibernateのflushの順序計算の実装（Doctrineの`src/UnitOfWork.php`、Hibernateの`ActionQueue`等）は読んでいない。Doctrineの`unitofwork.rst`の「Persisters」「UnitOfWork」等の節は本文が「tbr」のままである（O05の追加出典）。
- SQLAlchemyの`version_id_col`の照合を実装する`orm/persistence.py`は読んでいない（文書だけ）。
- Hibernateの`Locking.adoc`の悲観lockの節、`PersistenceContext.adoc`のflush mode・merge・detachの詳細は読んでいない。
- 読込み時に別の型（read model）へ写すCQRS的な分け方は、Ectoのguide（formとDBで別のschema。O08）とjOOQのDTO写像（O14）が近いが、どちらも読取り専用のmodelとしてではなく、写像の分け方として書いている。

## 検索範囲と結果（読んだpath、検索した語、読んでいないもの）
- 方法：5 repositoryを一時領域へ`git clone --filter=blob:none --no-checkout`し（`core.hooksPath`を無効化）、固定commitのfileを`git show <sha>:<path>`で読んだ。checkoutもbuild・test・script・hook・package managerの実行もしていない。SPDX・default branch・archived・HEAD SHAは`gh api`で取得した。
- sqlalchemy：`doc/build/orm/session_basics.rst`（1–50、369–515、955–980）、`versioning.rst`（全体）、`inheritance.rst`（1–100、265–282、742–850）、`composites.rst`（1–30、225–245、420–430）、`cascades.rst`（1–60、295–320、622–650）、`mapping_styles.rst`（1–40、145–200）、`glossary.rst`（788–812）、`lib/sqlalchemy/orm/unitofwork.py`（1–31、386–500）。読んでいないもの：`orm/persistence.py`、`orm/session.py`、`orm/dependency.py`、`inheritance_loading.rst`、`session_state_management.rst`、`dataclasses.rst`。
- ecto：`lib/ecto.ex`（1–80、170–215、350–372）、`lib/ecto/changeset.ex`（1–240、3555–3680）、`lib/ecto/multi.ex`（1–60）、`guides/howtos/Data mapping and validation.md`（全体）、`guides/howtos/Embedded Schemas.md`（1–68、100–122、199–221と見出し）。読んでいないもの：`lib/ecto/repo.ex`の本体、`lib/ecto/schema.ex`の本体、`lib/ecto/changeset/relation.ex`、`lib/ecto/embedded.ex`、`Polymorphic associations with many to many.md`、ecto_sql（別repository）。
- hibernate-orm：`documentation/src/main/asciidoc/introduction/Introduction.adoc`（408–421、428–460）、`Interacting.adoc`（見出し一覧、40–96、935–992）、`Entities.adoc`（1145–1182）、`Advanced.adoc`（1385–1420）、`userguide/chapters/locking/Locking.adoc`（1–260）、`userguide/chapters/domain/inheritance.adoc`（1–44、300–330）、`embeddables.adoc`（1–30、568–640）。読んでいないもの：`hibernate-core`の実装、`PersistenceContext.adoc`、`Locking.adoc`の261行目以降（悲観lock）、`include::`で取り込まれるtest code。
- jOOQ：`LICENSE`（冒頭）、`README.md`（1–160）、`jOOQ/src/main/java/org/jooq/UpdatableRecord.java`（1–260）、`DAO.java`（60–110）、`conf/RecordDirtyTracking.java`（全体）。読んでいないもの：`impl/UpdatableRecordImpl.java`、`impl/DAOImpl.java`、`impl/DefaultRecordMapper.java`、公式manual（Webサイト。repository外）。
- doctrine/orm：`docs/en/reference/architecture.rst`（全体）、`unitofwork.rst`（全体）、`change-tracking-policies.rst`（1–58）、`inheritance-mapping.rst`（1–30、123–180、232–300）、`transactions-and-concurrency.rst`（見出し一覧、124–330）、`working-with-associations.rst`（410–445、490–600）、`docs/en/tutorials/embeddables.rst`（1–144）、`getting-started.rst`（24–60）。読んでいないもの：`src/UnitOfWork.php`、`src/Persisters/`、`working-with-objects.rst`、`unitofwork-associations.rst`。
- 検索した語：`identity map`、`unit of work`、`flush`、`autoflush`、`active record`／`active.record`／`activerecord`、`data mapper`／`data-mapper`（sqlalchemyの`doc`で0件、doctrineの`docs`で2件）、`aggregate`、`stateless`、`persistence context`、`dirty check`、`lazy`、`identity map`（ectoの`lib/ecto.ex`・`README.md`・`repo.ex`・`schema.ex`・`association.ex`で0件）、`orphan`、`cascade`、`version`、`optimistic_lock`、`StaleEntryError`、`OptimisticLockType`。
- 選ばなかった候補：P27で読んだrails/rails・django/django・prisma/orm（旧prisma/prisma）は重ねないため除いた。typeorm、MikroORM、EF Core（dotnet/efcore）は今回は5本で足りると判断し、読んでいない。

## BRAINの属性について未決の事項（由来の種類、scope、評価根拠、版、状態）
- 由来の種類：大半はORMの公式文書（設計文書・利用者向け文書）で、実装はSQLAlchemyの`unitofwork.py`、Ectoの`optimistic_lock/3`、jOOQのjavadocだけである。Hibernateの「Aggregates」の節（O10）は設計上の意見の表明で、事実の記述と同列に扱えない。意見と事実の区別をどの属性で持つかは未決。
- scope：観察は関係DBとORM・DSLの境界に限っている。HELIXのD06で、写像の知識を保存方式（P19）や性能（P27）とどう分けて持つかは未決。O12のJSON列・集約型は保存方式の選択（P19）とも重なり、主な領域の決め方は未決。
- 評価根拠：HELIXでの成功・失敗の証拠は無い。外部ORMでの採用を、HELIXでの妥当性の根拠にしない（HELIXBRAIN-L2-026／027の経路で扱う）。旧HELIXのADR-007（重いORMを入れない判断。D06 §4）との関係づけも行っていない。
- 版：固定commit SHAで版を表す。Hibernateの文書は版の進行に伴う変化が明示されている（`StatelessSession`の評価、bytecode enhancementの非推奨）。再観察の要否は未決。
- 状態：全観察（P33-O01〜O14）は未評価の候補素材である。HELIX-BRAINへの登録・採否・選定は行っていない。
