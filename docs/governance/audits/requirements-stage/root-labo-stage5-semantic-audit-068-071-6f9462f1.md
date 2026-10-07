# LABO Stage 5 意味監査：親068/069/070/071

監査基準はmain `6f9462f1706a9e8670b97ad259e96c8c40632a4`。これはread-onlyの本文意味監査で、親集合を068/069/070/071に限定した。`633bf12ea8f948db8ba3d6600179c4a9507377a7` は#2554のPO checkpointとして区別し、L2/L11本文revisionには代入していない。PO行と採択recordで示す本文revisionは、068/069が`318ec4a04abb3c1cc17111b3d939f913facd5fd3`、070/071が`ea6f756f96a7370de78e412d737c7a7ed472114a`である。固定L2/L11 spanは採択行記載のSHAと物理的に一致した。6本文全blob SHA、固定親のfull/span SHA、CASE全行ID・行SHAは対応JSONに収録した。

## 親ごとの照合

- **068 / PO 57候補行83 / L2:L541–550・L11:L278–286**：L2/L11のidentity-based Attempt count、完全性unknown、denied-with-identityとidentityなしintakeの区分、結果state分離、禁止field群をFR/ACと照合。L10 FVは45行（うち索引3）、正常範囲と単独変異、遅延・訂正・result receipt・scope/revision・衝突、生成禁止各fieldを含む。NFRはidentity/scope、完全性/unknown、state/correctionの3行で、固定閾値を新設しない。戻し先は既知のOS/観測source責務区分を保持し個体identity unknownと分ける。確認した範囲で新たなfalse-successは見つからなかった。
- **069 / PO 57候補行84 / L2:L552–559・L11:L288–295**：FR-01とAC-01〜04のticket family/scope/revision/relation、分母・分類・window・source completeness、成立/不成立/未評価、元closure保持、OS/識別可能source owner戻しをL10正常・負例と照合。FVは52行（索引5）。未見reason、欠落・stale・異scope、window未満、未追跡・打切り、単一事例からの因果claim、ticket/authority/配置変更禁止を確認した。固定閾値・統計/学習方式は足していない。
- **070 / PO live26行49 / L2:L561–574・L11:L297–307**：固定9 atomのduration、escaped defect、rollback/Recovery、overhead、freshness、067/068併記をFR/AC-01〜05、NFR、NFRV、130 FV行（索引8）と照合。CASE-01正常receipt値の一致、source-defined計算値、対象/source revision、scope、receipt/provenanceを期待値としている。単独欠落・stale・不一致では該当fieldのみunknown/invalid/unavailableへ分離し、一般sourceとquality/oracle不足で既存責務区分を分ける。数値閾値・期間・SLOを追加していない。
- **071 / PO live26行50、境界行72 / L2:L576–584・L11:L309–316**：FR-01〜03、AC-01〜03、NFR/NFRV、45 FV行（索引5）を照合。selected class×model revision×scope×evidence binding、record済major missとmodel updateのみの資格失効、title/qualification/permission/authority/assignment分離、許可・採否・完了等を生まない境界を確認。missing/stale/mismatchは既存source owner区分へ返し、source identity unknownを分離する。独自threshold/class集合/expiry/scheduleなし。

## 意味上の候補所見（いずれも非blocker）

1. **069のNFR/NFRV CASE索引追従漏れ**。L3 NFR比較再現性行249はCASE-01, 05–10, 20–26, 28–32を列挙するが、後から加わった必須出力項目の単独欠落CASE-44–47を挙げていない。権限分離行252とL10 NFRV owner/authority行191はCASE-34–43までで、ticket_issue出力を拒否するCASE-48がない。CASE-44–48はFVでAC-01/04に明示され、各単独変異・oracleは存在する。よってFR/AC未被覆やfalse-successではなく、計測索引の追従候補である。最小の修正は両NFR表の該当traceに44–48を追加すること。
2. **071 qualification→titleの逆向き独立negative不足**。固定L2はtitleとqualificationを別状態として相互推論しない。現FVにはtitle→qualification (CASE-12、r03 title-only) とqualification→permission/assignment/authority、title→permission/authority/assignmentなどがあるが、qualificationだけを変異させtitle outputの不変を照合するCASEは見つからない。L10 NFRVの方向別一覧もこの方向を列挙しない。正式判断recordの既知残余R4と一致する非blockerのcoverage候補で、要求の意味自体や既存正常pathの欠落は認めなかった。
3. **070のscorecardローカルな成功率生成negative**。068には`task_success_rate`/`attempt_success_rate`をそれぞれ単独で生成する禁止CASEがある。070はAC-05で換算・合算・代替を禁止し、068の分母に属する。しかし070の130 FV行には、070自身のscorecard出力でこの2つの率を生成する独立fixtureが見つからない。正式review記録R23にも残る非blocker候補であり、現行AC/068側の禁止から直ちに成功を誤認できるとは確認していない。修正検討時も固定9 atomの範囲を広げず、必要性は親の既存境界に限定して判断する。

## 旧sourceとconsumer

- **068/070**：旧`execution-ticket-requirements.md:399`のAttempt count/selected telemetry atomsを読んだ。068は旧sourceのS3C count atomだけに限り、paired consumer全体を確認済みと主張しない。070の既存起草監査は同じline 399と旧`execution-ticket-acceptance.md:92–140`を固定している。旧84 literal全体や旧consumerのclosureを現要件へ移していない。
- **069**：旧`execution-ticket-requirements.md:319`（post-close assessment）、旧`feedback-lifecycle.md:24`（件数低下だけで品質証明にしない）、旧`execution-ticket-acceptance.md:92–140`、旧L8 test-design:320–360を参照。返却後relation/元closure保持、観測window境界を意味再導出し、新しいO2 atomの理由分類・母数・window・評価方法は候補として明示されている。旧consumer全体の移管や不在は主張しない。
- **071**：旧3L-BR-008 request 67–69、旧L3 77–79、旧acceptance 44–47を読んだ。task class×model revision評価とfield separationを起点にする。旧7 class固定一覧、状態遷移、expiry、provider/lane、runtime/test behaviorは現行意味へ移していない。

## 範囲と限界

固定L2/L11の本文revisionとPO checkpointは別々に記録した。旧runtime、旧test/CI、fixture、実験、計測、承認状態の実行は行っていない。残余Minorをblockerに格上げしていない。今回のreadは4親の意味照合であり、274親すべての完了・意味完全性を主張しない。6本文のfull SHAと機械可読な全CASE行pinは同梱JSONで確認できる。

機械証拠: `/tmp/root-labo-stage5-semantic-audit-068-071-6f9462f1.json`
