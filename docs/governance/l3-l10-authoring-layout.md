# L3要件・L10総合検証の配置と著述規則

本書は、現行の本体8機構におけるL3要件と対となるL10総合検証の正本配置、および旧HELIX資産から初回起草するときの扱いを定める。これは配置・著述の規則であり、L2要求の意味、L3要件の承認、実装許可、実行許可を決めない。

## 配置

各機構の正本は、その機構の既存`docs/<mechanism>/`以下に置く。L3要件は`L3-requirements/`、L10総合検証は`L10-verification/`に分け、6文書を基本の対応単位とする。

| 機構 | L3要件 | L10総合検証 |
|---|---|---|
| HELIX-HARNESS | `docs/helix-harness/L3-requirements/` | `docs/helix-harness/L10-verification/` |
| HELIX-OS | `docs/helix-os/L3-requirements/` | `docs/helix-os/L10-verification/` |
| HELIX-BRAIN | `docs/helix-brain/L3-requirements/` | `docs/helix-brain/L10-verification/` |
| HELIX-LABO | `docs/helix-labo/L3-requirements/` | `docs/helix-labo/L10-verification/` |
| HELIX-INTELLIGENCE | `docs/helix-intelligence/L3-requirements/` | `docs/helix-intelligence/L10-verification/` |
| HELIX-SECURITY | `docs/helix-security/L3-requirements/` | `docs/helix-security/L10-verification/` |
| HELIX-INFRASTRUCTURE | `docs/helix-infrastructure/L3-requirements/` | `docs/helix-infrastructure/L10-verification/` |
| HELIX-CONNECT | `docs/helix-connect/L3-requirements/` | `docs/helix-connect/L10-verification/` |

L3は旧HELIXの3区分を起点に、現行の対象と承認済みL2要求へ合わせて次の名前を使う。

| L3文書 | 対応するL10文書 | 対応範囲 |
|---|---|---|
| `functional-requirements.md` | `functional-verification.md` | 機能要件、同じAC IDによる動作条件と総合検証 |
| `business-requirements.md` | `business-verification.md` | 機構の業務上の要件とその観測・検証条件 |
| `nfr-grade.md` | `nfr-verification.md` | NFR、根拠付きの候補値・閾値、計測と判定方法 |

`business-requirements.md`は、旧実体`business-detail.md`を起点に、現行L3で機構の業務要件を示す統一名として再導出した名前であり、旧本文の移動や複製を意味しない。これはL2の要求分類や意味を変更しない。画面・技術設計など別の責務をこの3文書へ追加せず、適用する設計層へつなぐ。

横断するACはL3文書を一つの正本箇所として定義し、親L2のexact identityと承認対象revisionへtraceする。関係するL3文書間で同じ条件を別ID・別文面で重複定義せず、L10からL3のACを参照する。L10はそのACを総合検証できる観測・oracle・判定へ結び、L3、L4〜L6の設計、対象revisionを参照する。L10から新しい要求やL3承認を作らない。

ここでいう「本体8機構」は対象機構の数であり、製品数ではない。HARNESS製品と各機構の責務は現在のConcept、対象別L1/L2、およびPOが確定したrevisionに従う。WebおよびWEB-OSの将来要件を1.0へ前倒ししない。

ここで確定するのは文書配置の判断である。まだ物理ディレクトリや空の文書を作らない。最初のL3本文を起草するとき、その本文と同時に対象機構の`L3-requirements/`と`L10-verification/`を作成する。旧G3の名称、runtime、sub-gate構成は移植しない。一方、FRとACの整合、L3/L10の対応、承認対象PO exact revisionへのtraceが揃わなければ、L3要件は完成扱いにしない。この完了条件に加えて通常のL3承認を超える新しいgateは設けず、人間承認は現在のauthority状態モデルと対象revisionが要求する範囲で扱う。

## 旧資産の扱いと責務

初回起草では旧HELIXのL3定義・旧L3文書を先に読み、各項目について「再利用」「再導出」「置換」のどれかと根拠を記録する。記録には旧ID、旧source path・行・SHA-256、現行の親L2 IDとrevision、現行owner、配置先、変更理由を含める。旧source IDは出自を辿るために保持し、旧番号を現行要件IDへ機械的に流用しない。現行の機構・要求・文書へ割り当てるIDと版の印は項目単位で管理し、将来版は`version_target`等の項目印で保持する。正本を`_vN`や日付付き複製に分けず、過去の本文はgit履歴で辿る。

要求の親は、基準main `633bf12`時点で採択された374件の本体8機構L2要求と、そのPO採択対象revisionに限る。hold 5件とreject 5件からL3親要求を作らない。G0の版区分候補274件・後続版35件・Web条件付き3件・版未指定62件を区別し、適用条件と`version_target`を保持する。版未指定62件を1.0へ自動収載しない。これらの候補区分は実装・release許可を意味しない。

「business」の分類とownerは、旧ファイルの名前や内容だけで決めない。現在のL2とPOが確定した意味に沿って項目ごとに割り当てる。たとえば、HARNESSは工程標準・工程契約と検証義務を持ち、HELIX-OSは登録・進行統制・実行結果の回収を持ち、HELIX-LABOは観測の評価と改善提案を持つ。旧`business-detail.md`のBR-21、Learning Engine、HM-08、旧runtimeの評価値や承認動作をHARNESSへ一括で移さず、現行ownerに従って再導出する。旧`nfr-grade.md`のIPA grade、placeholder値、閾値、旧CI・runtime・approvalは現行値として継承しない。必要な技術値は根拠を添えた候補として起草し、値ごとのPO確認を新設しない。

要求の意味、適用範囲、owner、版を変える必要がある場合は、対応する上流L2へ差し戻してPO判断に上げる。技術値の候補化、測定方法の再導出、文書名・配置の整理だけを理由に新しいPO承認gateを作らない。旧sourceや旧test設計の実行結果は現行検証の証拠にしない。

## 根拠

旧sourceは再構築の起点として読む資料であり、その配置、承認状態、工程番号、実装方式を現行へ自動継承しない。以下の行番号は`archive/legacy-generation-2026-09-14/root/`からの相対pathである。SHA-256は旧source本文の値。

| 旧資産ID | 旧source path・行 | SHA-256 | この配置規則で保持・再導出する点 |
|---|---|---|---|
| `LEGACY-ASSET-FDBA655B1CFF75DCDC0E` | `docs/governance/repository-structure.md:57-74,122-138,146-159` | `6f8ee784049d03279641151714c3572656eb20c64cfb769853b6e885abf4f262` | 正本・移行記録・設計・テスト設計の置き場を区別する考え方を保持。旧`docs/process/`、`docs/design/`、`docs/test-design/`の物理配置やその機構外の規則は現行構造へ再導出する。 |
| `LEGACY-ASSET-9A772391C7FB1298D45F` | `docs/design/harness/L3-functional/README.md:16-56` | `949b0da00d2a417e1b36d3679b89735de7adadf831f567dbe383dfe6337f19e4` | L3をfunctional／business／NFRの3区分で扱い、FR+ACを対の検証へtraceする意味を保持。旧G3名・runtime・sub-gate構成は移植しない。 |
| `LEGACY-ASSET-B5B5E71B2AF1459D59A1` | `docs/design/harness/L3-functional/functional-requirements.md:22-40` | `a90609ad8145d8b9c1be6a6870b6ecad4bc71f3708fc977edd14f926c074257a` | 機能要件を動作とACへ結ぶ構造を再導出。旧FR件数、ID採番、画面・mode・drive表、runtime記述はそのまま移さない。 |
| `LEGACY-ASSET-A6E2C7F0565E5F804F06` | `docs/design/harness/L3-functional/business-detail.md:21-39,84-104` | `99a099d69cae60bd5d55c38221eb9ed814abf15ba59b3ac32f27d69fd0d6ad5d` | business分類が機能詳細と分けられていた点を起点にする。BR-21等の各意味・ownerを現行L2で再導出し、HARNESSへ丸ごと移さない。 |
| `LEGACY-ASSET-DB669724249A14A665F0` | `docs/design/harness/L3-functional/nfr-grade.md:21-34,58-74` | `2197b4d2f4118aae83202f9f886056fd9de360f21667e25fe9c9d906f76c832d` | NFRを測定・判定可能に結ぶ骨格を再導出。旧IPA値・数値・pass条件・CI/runtimeは現行値として採用しない。 |
| `LEGACY-ASSET-80FD1264A2C50E2E4AA4` | `docs/process/README.md:40-55` | `21a875ca5b46a8396485690a8405923ea197552fe4aa2302b1eaad6f7e650985` | L1〜L12のpair対応を確認する資料。旧物理層とcurrent layerのずれは現在のL1-L12 authorityに従って読み替える。 |
| `LEGACY-ASSET-F542125805B777D8A56A` | `docs/process/forward/L00-L06-design-phase.md:148-166` | `9f8fc48a087fa9ba6e629518fb376630d7863491d2f85be96a8b3fd0c6d2efc3` | L3のFR+AC、対となる検証設計、およびPOが承認した対象revisionを照合する完了の本質を保持する。旧G3名・runtime・sub-gate構成は移植しない。 |
| `LEGACY-ASSET-34DF3B535879CC73FA86` | `docs/process/forward/L08-L14-verification-phase.md:162-170,195-207` | `d7847b2e7c85673971cb01f8fc42c1325aeb331a0630ee53914a3162951dbd2a` | L10がL3条件を機能・system behavior等で検証し、失敗を適切な設計へ戻す関係を確認。旧physical L10 UXやL12本番受入の構成をそのまま移さない。 |
| `LEGACY-ASSET-67236142408F6AFEB787` | `docs/process/forward/overview.md:78-85,110-118` | `272e077e3c98d000bfec6b17a848c997e5eee08201345add3e2e54c5ea0f4c5a` | 要件文書とテスト設計を別artifactとして追跡する構造を確認。現行L10の文書名と配置は上記pairに合わせて再導出する。 |
| `LEGACY-ASSET-1B92155F959D7905DD1E` | `docs/test-design/harness/L3-acceptance-test-design.md:1-40` | `27a92c3be07aa06b9e8a598b7b2b7bcc357ccb6afa876e27e45cd85e7f3d00c1` | 複数L3文書を一つの対設計へtraceした過去の形を確認。旧AT-ID・件数・実行例・旧L12 pairを現行L10へ流用しない。 |

旧HELIX資産のIDとsource digestは[資産明細台帳](legacy-asset-disposition.jsonl)にも登録されている。9/26の[docs/governance配置判断](decisions/governance-legacy-migration-layout-po-decisions-2026-09-26.md)（`HDEC-GOVERNANCE-LEGACY-MIGRATION-LAYOUT-2026-09-26`、本文SHA-256 `f4b48c25125081bb223857e7f8de73323b8ca7d2bbde114c395e2c83a4508376`、§「AIの問いとPOの選択」）は、現行規則と時点の記録を分けること、path変更時に参照を追従させることの前例として参照する。この判断記録自体は書き換えず、本書は現在の規則として同じファイルを更新する。

現行の責務再導出は、2026-09-28の対象別L1確定・L2/L11合意とその正確な対象revisionに従う。責務の根拠として、[HARNESS L2](../helix-harness/L2-requirements/product-requirements.md#提供プロダクトharnessの利用要求)の§「提供プロダクトHARNESSの利用要求」およびHARNESS-L2-001〜005、[LABO L2](../helix-labo/L2-requirements/labo-requirements.md)の冒頭とHELIXLABO-L2-006〜010、[OS L2](../helix-os/L2-requirements/governance-requirements.md)の冒頭・HELIXOS-L2-005・HELIXOS-L2-010を読む。これらはHARNESSの工程契約、LABOの評価・改善提案、OSの登録・統制という境界を示し、旧business-detailの配置だけからownerを決めない。

## L3-D0の整理範囲と締め

2026-10-04更新の作成レーンゴール（`scaffold/review-handoff/local/codex-goals-2026-10-03-l3.md`、全文SHA-256 `3561eb221023220ccd6dda9ace008882851eac343ca76611742b07b2e30703e5`）に従い、D0は#2559の研究束集約と現行参照訂正、governanceの現在／時点分割、本書のL3／L10配置決定で閉じる。これ以外の配置変更をD0へ追加しない。閉じた後の構造変更は、L3起草または参照維持に具体的な支障が生じた場合に限り、その支障を記録して行う。

要求段階終了時の物理714行、参照訂正後の1,075行（#2559訂正追記後は1,076行、本governance分割のsnapshot参照訂正後は1,077行）、要求候補384件の区別は[要求段階の現在状況](requirements-stage-closure.md#台帳行数と要求候補数の読み分け)に置く。時点の終了資料を現在の履歴行数で上書きしない。
