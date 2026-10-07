# INFRA Stage 5 Worker共通契約owner表記の再導出（#2652 / #6038681135）

status: audit_supplement
authority_effect: none
base_revision: `5efdf02678baebdb4be14987f4f5ab7af85bf823`
fixed_l2_l11_revision: `f6dad2a33e24f000b87d7f09b8d40288257e74cc`
formal_review: https://github.com/RetryYN/HELIX-HARNESS/pull/2652#issuecomment-6038681135

## 再導出

Claudeのformal reviewは、INFRA L3のStage 5 parent 011における7か所の「Worker契約の責務ownerは固定親で未特定=unknown」を、既存上流から導ける責務ownerへ直すよう依頼している。これは要求のowner・範囲を変更する判断ではなく、固定sourceの責務分担をfixture表記へ反映する修正である。

2026-09-26のWorker実行モデルPO判断はWorker共通実行契約のownerをHELIX-OSと定める。固定HELIXOS-L2-004:538も同契約をOSが持つと記す。よってWorker共通実行契約の責務ownerはHELIX-OS（HELIXOS-L2-004）と記録する。一方、各fixtureで参照する具体contract identity、revision、sourceがmissing／unknown／staleであるかは独立した入力状態であり、ownerのunknownへ読み替えない。これらの欠落・不一致は未完として保持し、既存OS契約ownerへ戻す。

責務境界は分けて保持する。固定INFRASTRUCTURE-L2-025/L11-025は、INFRASTRUCTUREが実資源・状態を持ち、その資源で利用できる方式によって隔離条件を適用する。固定SECURITY-L2-007はscope/authority制約と隔離条件を定め、具体enforcerはWorker実行環境とする。固定SECURITY L11:31は制約の実適用と観測を要する。責務の分担は固定OS L2:548とINFRA L2-025:291から導く。したがって、この追補でOSへresource stateやisolation policyを移さず、SECURITYへ実資源の所有を移さない。

## 変更範囲

L3機能要件の7位置（Stage 5 fixture tableの項目07・16、CASE 019・021・046・047・048）に、OS責務ownerと具体contract identity/revision状態の区別を追記した。対となるL10はCASE 019・021・046・047・048とcomposite CASE 071で、欠落・staleを未完としてOS契約ownerへ返すoracleを対応づけた。全CASEは仕様fixtureで未実行である。

この差分はINFRA L3/L10の機能要件ペアに限る。SECURITY Stage 2c parent 033は変更していない。資源状態やresource source、recovery sourceが固定親で特定されないため`unknown`である箇所はこの修正の対象外として保持する。合成fixtureのunknownは、実資源のownerまたは実適用状態を新たに特定したことを意味しない。

## 旧HELIX起点と扱い

旧資産 `LEGACY-ASSET-9114D4E463E95B67DD0C`（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/worker-common-contract.md`）を読み、旧Worker共通契約が版付きdescriptor、隔離worktree、receipt等を一体の契約として記述していた点を起点として確認した。旧実装方式やCLI/sandbox/runtime/testは再利用・実行しない。現行ではPO判断により責務をOS（共通実行契約）、SECURITY（authority/制約）、INFRASTRUCTURE（実資源と実適用観測）へ分けるため、ownerは旧記述を転記せず現行固定L2から再導出する。

固定source本文のSHA-256、参照行のraw-byte SHA-256、旧資産台帳行、6文書snapshotと静的対応検証は、同じdirectoryの`l3-infra-worker-contract-owner-correction-evidence-2026-10-07-6038681135.json`に記録する。

本追補は承認、要求採択、実装・実行、release許可を生成しない。旧CLI・runtime・test・CIを実行していない。

## Root検収の追補

項目17およびCASE049〜051にも残っていたWorker共通契約ownerのunknownをOSへ直した。契約責務の所在と、OS停止中に使える独立recovery経路は別である。resource/recovery source ownerのunknown、OS ticketなし、OS runtime非依存を保持した。証拠JSONにあった固定SECURITY L11:183〜186の範囲外・空spanを削除し、実在する31行と上記固定L2からの再導出に訂正した。全full/span pinをRootが再計算した。
