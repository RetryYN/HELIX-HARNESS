# 交換可能な定義packageと変更影響simulationの上流research

status: proposed_upstream_waiting
program_id: RDP-004
parent_program: RDP-001
owner: HELIX-HARNESS product contract / HELIX-OS management
authority_effect: none

## 目的

Concept、企画、指示、要求、要点定義、設計、受入条件を文書ごとのべた書きだけに閉じず、stable identityと
型付きrelationを持つrepo-owned definition packageとして扱えるかを具体化する。変更案は正本を直接上書きせず
scenario overlayとして評価し、全体、製品責務、依存部分、V-model pair、検証、ticket、workflowへ生じる影響と
追跡不能箇所を実変更前に示す。

本researchは既存要求の置換・削減を行わない。現在の全source holding、原文、requirement identity、semantic atomを
入力母集団として保持し、構造化できない意味も`unresolved`として生存させる。Markdown、JSON、GitHub、HELIX-Web、
将来のDBは正本そのものではなく、同じ定義packageを読み書き・表示・投影する交換可能adapter候補として扱う。

## 技術的成立性

実現可能である。ただし、adapterの実装内へ要求や設計の意味を埋め込む構成にはしない。意味はversioned definition
packageに置き、adapterはcodec、validation、projection、read-afterだけを担う。これにより表示先や保存技術を交換しても、
identity、relation、責務、要求意味、判断履歴を維持できる。

成立に必要な最小構成は次の四層である。

1. definition model: stable ID、revision、product owner、authority state、kind、source、semantic digest、typed relationを持つ。
2. adapter port: Markdown／構造化file／GitHub／dashboard／materialized view間の入出力を、版付きcapabilityで接続する。
3. scenario・impact core: base revisionへ提案差分を重ね、直接・推移影響、責務衝突、stale、未解決edgeを決定論的に返す。
4. management runtime: HELIX-OSがpackageとadapterを登録し、対象revisionを選び、simulation結果と判断backflowを追跡する。

## 正本model候補

definition nodeは少なくとも次を表現する。field名とwire formatはL3で確定し、本researchでは固定しない。

- `definition_id`、`revision`、`kind`、`product_target`、`responsibility_owner`、`authority_state`。
- 原source locator／digest、保持するsemantic atom、human decision、supersession。
- `unit`／`connection`／`composite`と、Concept→企画→research→PoC／prototype→要求→設計→検証の工程位置。
- `derives_from`、`depends_on`、`constrains`、`connects`、`implements`、`verifies`、`supersedes`等の型付きrelation。
- 正常、取消、失敗、timeout、回復、非機能、security、data、権限、consumerの意味。

文書は人間が判断できる正規surfaceとして維持する。機械表現と文書のどちらをauthoring authorityにするかは、無損失の
round-trip、差分review、merge conflict、migration、長期可読性を比較して後続判断する。生成済み表示だけを正本にせず、
人間の訂正を失わないwrite-backまたは明示的な片方向生成境界を必須にする。

## scenarioと影響出力候補

scenario overlayは`base_revision`、提案patch、対象scope、actor／permission、対象product、仮定、未確定edgeを保持する。
simulationは少なくとも次を返す。

- 変更されたnodeと直接依存、推移依存、循環、孤立、未登録参照。
- HARNESS、HELIX-OS、HELIX-Web、HELIX-Web-OS間の責務移動、重複、欠落、接続要求への影響。
- Concept／L1／L2／L11、後続L3／L10、V-pair、Design Template、verification義務のstale候補。
- 要求engineの再評価対象、既存ticket／workflowへの影響、新規ticket候補、停止・差戻し条件。
- 影響を断定できた範囲、unknown edge、未登録path、coverage分母・分子、判断が必要な論点。

simulation結果は変更承認、要求採用、設計完成、ticket発行、実装許可を生成しない。relation未登録やcoverage不明を
「影響なし」と扱わずfail-closeし、`unknown`として人間と管理層へ返す。

## 製品責務境界

HELIX-HARNESSは次を製品契約として所有する。

- definition packageの意味schema、relation語彙、revision・supersession、無損失条件。
- adapter portとcapability negotiation、deterministic normalization、round-trip／loss検出契約。
- scenario overlay、semantic diff、impact traversal、coverage、unknown、staleの判定規則。
- 要求engine、Design Template、V-model工程、検証義務、typed ticketへの接続規則。

HELIX-OSは次を管理・統制・継続改善の責務として所有する。

- project／productごとのdefinition package、adapter、schema version、permissionのregistry。
- exact base revisionを用いたscenario実行、結果・ログ・evidence・人間decisionの追跡。
- GitHub／dashboard／将来DBへのprojection、read-after、drift、rollback、再構築、echo抑止。
- 利用結果と利用者指示との差を、HARNESS要求engineやtemplateの改善候補へ戻す因果関係。

各個別productは自身のConcept、企画、要求、設計、受入内容を所有する。HELIX-OSは管理登録によって意味を変更せず、
adapterは変換によって新しい要求意味やrelationを発明しない。

## 既存上流との接続

- [FT-HARNESS-REQENG-001](feature-tickets/FT-HARNESS-REQENG-001.md): semantic diff、relation候補、impact候補を生成するcore。
- [FT-HARNESS-DESIGNTPL-001](feature-tickets/FT-HARNESS-DESIGNTPL-001.md): definition kindから設計義務を導き、不足を要求へ戻す。
- [FT-OS-REQREG-001](feature-tickets/FT-OS-REQREG-001.md): 未分類原event、候補、simulation evidenceを失わず登録する入口。
- [FT-OS-DESIGNTPL-001](feature-tickets/FT-OS-DESIGNTPL-001.md): templateと適用結果のversioned lifecycleを管理する。
- [FT-OS-GITHUBSYNC-001](feature-tickets/FT-OS-GITHUBSYNC-001.md): local definitionからGitHubへ一方向投影し、remote evidenceを逆流させず登録する。
- [RDP-002](requirement-overlap-review-program.md): simulationで見つけた責務・機能重複を、原identityを保った比較対象へ渡す。
- [RDP-003](requirement-technical-substitutability-review-program.md): adapter、DB、graph実装等の方式を意味機能から分けて比較する。

この接続は依存関係の候補であり、既存ticketのscopeや優先順を暗黙変更しない。要求engineが意味候補を出し、
Design Templateが設計義務を出し、HELIX-OSが登録・実行・projectionする境界を維持する。

## researchで比較する論点

1. repo-owned Markdown＋sidecar graph、repo-owned structured package＋生成Markdown、両者併用のauthoringとreview特性。
2. relation graph、property graph、DAG制約、event log＋materialized viewの表現力とmigration可能性。
3. patch／overlay形式、schema evolution、adapter version不一致、部分読込、巨大graphでのbounded execution。
4. 完全round-trip、canonical normalization、semantic digest、rename／split／merge時のidentity保持。
5. 未登録依存を検出するcoverage計測と、動的依存・外部system・人間運用をunknownとして残す方法。
6. 旧sourceからの段階移管で、原文、atom、relation、判断履歴を一件も落とさないmigration oracle。

## 完了条件

- 全旧要求を保持したfixtureで、definition nodeへ変換できたatomと`unresolved` atomを合算し未計上0を示す。
- 同じscenario inputとversioned package／adapterから同一の正規化結果とimpact digestを再生成できる。
- adapter交換後もidentity、意味atom、relation、authority state、人間decisionが欠落しないことを検証できる。
- 直接・推移影響、責務境界、V-pair、verification、ticket候補、unknown edgeとcoverageを別々に表示できる。
- DBまたはGitHubを失ってもrepo-owned authorityからprojectionを再構築できる。
- HARNESS製品契約とHELIX-OS管理runtimeのL2／L11候補、後続research／PoC ticket境界を人間が判断できる。

## 現在の停止条件

Concept v4.1、対象別L1、対象別L2は未承認である。現在は上流research候補とIssue projectionだけを作り、schema、
storage、graph engine、adapter、DB、dashboard、runtime、新世代CI、PoCを実装しない。simulationで得た候補から既存要求を
削除・統合・縮退せず、個別要求の意味変更は対象revision付き人間decisionへ分ける。
