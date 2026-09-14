# 新世代上流再編 GitHub PR packet

status: ready_for_draft_pr
head_branch: `docs/l2-requirements-source-audit`
head_revision: `bind from remote branch immediately before review request`
base_branch: `main`

## PR title

```text
docs(governance): start HELIX new generation from upstream
```

## PR body

```text
旧HELIXのauthority、CI、AI instruction、runtime、testが現行pathに混在し、GitHub状態と旧実装から上流意味を逆算していた問題を解消します。

旧世代4020ファイルを元構造とSHA-256を保った非実行archiveへ隔離し、現行側をConcept、HELIX-HARNESS、HELIX-OS、HELIX-Web、HELIX-Web-OS、governanceへ物理分離しました。HARNESSは外部提供するV-model基盤、HELIX-OSはHARNESS自身を含むプロジェクト群の管理・統制・継続改善機構として要求を分冊しています。

このPRは上流候補の共有と意味reviewを目的とします。Concept／L1／L2の人間承認、L3以降、新世代CI／runtimeの実装、archive資産の意味採否・物理削除は成立させません。

静的確認:
- archive manifest 4020/4020 SHA-256一致
- 現行workflow YAML 0
- active Markdown相対リンク切れ0
- L2↔L11 ID集合: HARNESS 8、HELIX-OS 13、HELIX-Web 9、HELIX-Web-OS 6ですべて一致
- Concept＋4対象L1のSHA-256は判断packetと一致

旧CI、旧test、旧runtime、ローカルClaude CLIは実行していません。
```

## GitHub Claude review依頼文

```text
@claude このPRのexact HEADについて、コード実装や旧CIの成否ではなく、次の上流意味だけをread-onlyでレビューしてください。

1. HELIX-HARNESSとHELIX-OSの責務が分離され、HARNESS自身の継続改善責務がHELIX-OSにあること
2. HELIX-WebとHELIX-Web-OSのruntime authorityを分離し、許可logによる改善loopだけでHELIX-OSへ接続していること
3. 旧資産を非実行archiveとして保持し、新世代のbaseline、oracle、fallbackにしていないこと
4. Concept→対象別L1→L2／L11の順序とID接続に意味上の欠落・矛盾がないこと
5. GitHub、PR、review、CIから人間の上流承認を生成していないこと

Blockerがある場合はfile、該当箇所、矛盾する上流方針、必要な修正だけを示してください。承認やmergeは行わないでください。
```

## 境界

- Draft PRとして作成する。
- Claude reviewはGitHub上の通路だけを使い、CLI／API／IDE／HARNESS Workerへfallbackしない。
- review結果はfindingであり、人間承認・canonical化・mergeを自動成立させない。
- 旧`harness-check` required contextと旧repository workflow 4件は解除／disable済みである。
- CodeQL default setupは一時停止のscope不整合を是正して`configured`へ復元済みで、DependabotとともにGitHub管理の
  外部security projectionとして扱う。旧harness CIでもこのPRの意味gateでもない。
