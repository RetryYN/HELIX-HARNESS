# confirmed175 PM-01 / S-BR-001 固定f6条件照合

## 結果

confirmed175からsource-qualified identityを2件だけ取り出し、旧source・各identity固有のconsumer・固定f6dad2aのL2/L11・後続57/11/live26判断を静的比較した。2件は異なるsource、資産ID、consumerを持つため、条件は別々に照合した。source atomの閉鎖、formal successor、要求採択、L3承認、実装・実行、retire、Step5完了は主張しない。旧CLI、runtime、hook、test、CI、`harness.db`は実行していない。

| Source-qualified identity | 旧source | 固定pairとの比較 | successor |
|---|---|---|---|
| `harness/L1-requirements/screen-requirements.md::PM-01` | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/screen-requirements.md:45`（screen詳細: 52–61） | OSのsource/revision、portfolio state/trace、evidence、feedbackの意味と部分的に関連。画面受入は残る | なし |
| `helix/L1-requirements/skill-mechanism-migration-requests.md::S-BR-001` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/skill-mechanism-migration-requests.md:18` | LABO→BRAINの外部知識経路とowner境界に限定して関連。旧Skill移行条件の多くは未照合 | なし |

identity行、archive/holdingのsource SHA、資産台帳行、固定pair file/section SHA、後続判断94行の全文compact indexは[JSON記録](./legacy-confirmed175-pm01-sbr001-fixed-f6-condition-audit-2026-10-01.json)を参照。

## PM-01: 旧screenとconsumer

旧screen identityは4階層（俯瞰／工程／割当／詳細）の案件横断可視化を要求する。詳細行52–61では、L1–L12 heat mapと層外L0 anchor、割当負荷・AI slot使用率、sub-doc展開、filter、PM-02への遷移、30秒poll、gate fail時反映、緑／黄／赤／空／loading状態を記述する。screen-flow、ui-element、business-flowおよび`L1-operational-test-design.md`が別consumerであり、同じscreen要件の下流を構成する。旧行は`not-implemented`としており、実装・受入の証拠ではない。

固定f6のOS-015（source identity／authority記録）、OS-016（portfolio trace／state）、OS-019（evidence／continuity）、OS-022（改善候補の登録／還流）は情報系の一部を扱う。LABO-050はtarget-owner authorityと再観測を持つ内部改善循環で、弱い隣接記録に限る。これらはPM-01 dashboard自体、4階層selector、heat map、filter・click-through、polling、gate-fail即時描画、表示色やempty/loading stateを規定しない。APIやtraceの存在をscreen表示受入へ読み替えない。

後続の採択HARNESS-L2-039はExperience/UI/Frontend契約の同一scope化、OS-L2-108/109はartifact-consumer relationとprovenance chainに限る。PM-01 screen contractへのformal successorでも旧screen conditionの一括採択でもない。

## S-BR-001: skill migrationとconsumer

S-BR-001は専門知識・判断観点・手順を必要範囲で取得し、旧資産価値を保ちつつcontext負荷と重複を減らす利用者価値を示す。旧sourceのlines 22–35はIssue/owner接続、L3要求・L10受入との関係、canonical sourceとIR admissionの区別、およびprovider-neutralな測定境界を示す。別consumerは`skill-mechanism-migration-requirements.md`のS-R01–08（31–85）と`skill-mechanism-migration-acceptance.md`のS-AC群である。ここには棚卸し、分類・disposition、typed適用、必要範囲だけの供給、memory/continuation分離、効果測定、局所移管、rollback、consumer確認後のretire条件が記される。これらはS-BR-001一行に合算せず、consumer文脈として別に照合した。

固定f6のLABO-L2-033/051とBRAIN-L2-026/027は、provenance付き外部sourceの取得、LABOでの分解・比較・実験、BRAIN候補化という2.0経路を規定する。これは責務分割・外部知識の一部に限って関連し、旧Skill inventory/disposition、既存分類の再利用、typed target applicability、needed-only supply、context/memory境界、利用と実効果の分離計測、段階移行、consumer受領、rollback、retirementを定義しない。これら4件は2.0 scopeで、1.0必須依存ではない。

後続のHELIXINTELLIGENCE-L2-072は条件付きの1.0 judgment-pack候補とshadow評価、-074は評価済みfeedbackの配置proposal入力、HELIXBRAIN-L2-031は再利用知識候補、HELIXLABO-L2-063は修復再発評価から予防候補へのfeedbackを扱う。各scopeはS-BR-001のskill asset migration全体、動的取得、効果測定、移管・退役の受入と異なる。条件付き採択のconditionや個別scopeは横展開しない。

## 後続decision indexとauthority境界

compact indexは2026-09-29の57候補（53採択登録行／4保留）、同11候補（10／1）、2026-09-30 live26（25／1）の計94行を保持する。内訳は採択登録判断88行・保留／非採択6行で、条件付きscopeを持つ採択行もある。これは後続candidate decisionの全量indexであり、旧identity successor 88件、旧要求6件のretire、旧source atomsの閉鎖を意味しない。条件付き候補は決定記録の対象・owner・版・条件の範囲内でのみ参照する。

両identityは`preserved_pending_rehome`、formal successorなし、`authority_effect: none`。後続近接pairの採択から旧条件の採択、意味変更、L3承認、実装許可、runtime有効化、source retireを生成しない。unknown/staleや旧consumer未閉鎖を完了扱いしない。

## 検証範囲

JSON parse、source/section SHA、94行countと88/6内訳、Scaffold Binding、`git diff --check`を静的に検証する。旧実行物は検証に使わない。
