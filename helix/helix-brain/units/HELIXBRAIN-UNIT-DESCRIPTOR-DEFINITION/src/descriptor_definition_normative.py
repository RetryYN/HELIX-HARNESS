"""L4固定DefinitionNormativeFrameをprivate値として構成する。

実行時の文書読込、registry照会、caller提供frameへの依存を持たない。
"""

from __future__ import annotations

import copy


_CATALOG = {
    "revision": "5a3cfa984fab34f31ce623d667db1670f80b1544",
    "path": "docs/helix-brain/L4-basic-design/template-semantic-supply.json",
    "file_sha256": "033cff2d2bbe00975b09ce2cbecb4f3d542bf4fae859912ac41f5a584561fdb2",
    "catalog_pointer": "/descriptor_meanings",
    "catalog_canonical_sha256": "224602413a177ad7f304bebfa9e0aea55293dc0a771b3e74d9c396c8d2f15651",
    "scope": {
        "parent_requirement": "HELIXBRAIN-L2-032",
        "functional_requirement": "HELIXBRAIN-L3-032-F01",
        "scope_kind": "generic_design_template_descriptor",
    },
    "entries": [
        {
            "descriptor": "template identity",
            "meaning": "機能としてのtemplate識別。filenameやviewの所在と分ける。",
            "entry_pointer": "/descriptor_meanings/0",
            "entry_canonical_sha256": "6901fa7408738f5e832a4f18dbc487d614f72cfd35328691c591dc3b5ee35892",
            "entry_value": {
                "descriptor": "template identity",
                "meaning": "機能としてのtemplate識別。filenameやviewの所在と分ける。",
            },
        },
        {
            "descriptor": "version",
            "meaning": "template内容の版。knowledge revision、pack "
            "contract/artifact版、version_targetと分ける。",
            "entry_pointer": "/descriptor_meanings/1",
            "entry_canonical_sha256": "04da83e4c3069f9fb655b447f11b36bb4c29a9e6ce49d886b97124fca100d376",
            "entry_value": {
                "descriptor": "version",
                "meaning": "template内容の版。knowledge revision、pack "
                "contract/artifact版、version_targetと分ける。",
            },
        },
        {
            "descriptor": "layer/pair",
            "meaning": "義務の適用層と対。HARNESSが定めた対を参照する。",
            "entry_pointer": "/descriptor_meanings/2",
            "entry_canonical_sha256": "a29d331c134f8c13aec9c0b1ae95cf282c9b8e37a719bea5af73fcc20afde956",
            "entry_value": {
                "descriptor": "layer/pair",
                "meaning": "義務の適用層と対。HARNESSが定めた対を参照する。",
            },
        },
        {
            "descriptor": "applicability",
            "meaning": "汎用問題・前提と適用条件。unknownを非適用にしない。",
            "entry_pointer": "/descriptor_meanings/3",
            "entry_canonical_sha256": "6c09e22c9fba27fcb4b3e7578f6208b0122fa0057009c0e4914a83e14fd78c2a",
            "entry_value": {
                "descriptor": "applicability",
                "meaning": "汎用問題・前提と適用条件。unknownを非適用にしない。",
            },
        },
        {
            "descriptor": "required input",
            "meaning": "適用に必要な入力の意味と根拠。定義と案件値を分ける。",
            "entry_pointer": "/descriptor_meanings/4",
            "entry_canonical_sha256": "839d2580be675088de0f1f06d6038f97a25d60a892e2caa1acd142b9e8d8878f",
            "entry_value": {
                "descriptor": "required input",
                "meaning": "適用に必要な入力の意味と根拠。定義と案件値を分ける。",
            },
        },
        {
            "descriptor": "required section",
            "meaning": "満たす必要のある節の意味と原適用条件。",
            "entry_pointer": "/descriptor_meanings/5",
            "entry_canonical_sha256": "a12258b58907d085d14fb35f898105a28babcda597cf1becfd591fdc53f5604c",
            "entry_value": {
                "descriptor": "required section",
                "meaning": "満たす必要のある節の意味と原適用条件。",
            },
        },
        {
            "descriptor": "required field",
            "meaning": "節に属する欄の意味・要否の条件。節のN/Aを全欄へ一律転写しない。",
            "entry_pointer": "/descriptor_meanings/6",
            "entry_canonical_sha256": "938d18ac4f080533bfbba789ab0f4059c4c1b5eb5fdf600b463ecae4f4525d32",
            "entry_value": {
                "descriptor": "required field",
                "meaning": "節に属する欄の意味・要否の条件。節のN/Aを全欄へ一律転写しない。",
            },
        },
        {
            "descriptor": "relation",
            "meaning": "関係の種類・向き・両端identity/revision。名称類似を意味関係にしない。",
            "entry_pointer": "/descriptor_meanings/7",
            "entry_canonical_sha256": "8ab78d7e5437f976d4ea8f2db03bf00c9d40822863ed9fcec848225991295ccc",
            "entry_value": {
                "descriptor": "relation",
                "meaning": "関係の種類・向き・両端identity/revision。名称類似を意味関係にしない。",
            },
        },
        {
            "descriptor": "意味owner",
            "meaning": "項目の意味を持つ責任者。製品判断や実運転のownerと分ける。",
            "entry_pointer": "/descriptor_meanings/8",
            "entry_canonical_sha256": "6be346c9044ad2b4de6604878a02c601a0b3d69248d6296b8a6426a2ef4575d6",
            "entry_value": {
                "descriptor": "意味owner",
                "meaning": "項目の意味を持つ責任者。製品判断や実運転のownerと分ける。",
            },
        },
        {
            "descriptor": "trace",
            "meaning": "source/provenance、項目根拠と知識revisionへの参照。",
            "entry_pointer": "/descriptor_meanings/9",
            "entry_canonical_sha256": "285caa757a62f912a9069d71f5d20ec6963faa28651ed6bd84dca59aa93c3e66",
            "entry_value": {
                "descriptor": "trace",
                "meaning": "source/provenance、項目根拠と知識revisionへの参照。",
            },
        },
        {
            "descriptor": "negative oracle",
            "meaning": "契約が不成立になる条件と検証で観測する差異。",
            "entry_pointer": "/descriptor_meanings/10",
            "entry_canonical_sha256": "d20235c446c11d57936bdcc05051be8eb7179643c26c2e6580aa2a0677e5c4b7",
            "entry_value": {
                "descriptor": "negative oracle",
                "meaning": "契約が不成立になる条件と検証で観測する差異。",
            },
        },
        {
            "descriptor": "measurement",
            "meaning": "適用義務の計測観点・根拠とoracleの関係。実値を創作しない。",
            "entry_pointer": "/descriptor_meanings/11",
            "entry_canonical_sha256": "60f658aea5c7582c64308336fe0a3fd63b4332dc936677313c783558ee78e453",
            "entry_value": {
                "descriptor": "measurement",
                "meaning": "適用義務の計測観点・根拠とoracleの関係。実値を創作しない。",
            },
        },
        {
            "descriptor": "completion",
            "meaning": "適用義務の成立条件と対oracleの関係。project成立の裁定ではない。",
            "entry_pointer": "/descriptor_meanings/12",
            "entry_canonical_sha256": "d17c62990c8bd1c2aa4ff4f932f37037eaab6a52d00742ff80d48a70e1842355",
            "entry_value": {
                "descriptor": "completion",
                "meaning": "適用義務の成立条件と対oracleの関係。project成立の裁定ではない。",
            },
        },
        {
            "descriptor": "downstream kind",
            "meaning": "義務を渡す対象の種類。単体・接続・構成体の違いを残す。",
            "entry_pointer": "/descriptor_meanings/13",
            "entry_canonical_sha256": "2762789dec1bdf37c8666ba0e10c4e70e3974cb7bd90e09fa856686aa3e9d2b1",
            "entry_value": {
                "descriptor": "downstream kind",
                "meaning": "義務を渡す対象の種類。単体・接続・構成体の違いを残す。",
            },
        },
        {
            "descriptor": "supersession",
            "meaning": "旧知識から新知識への明示関係。過去参照を黙って差し替えない。",
            "entry_pointer": "/descriptor_meanings/14",
            "entry_canonical_sha256": "727f71abc804868af8aa919927845314b6a82d9578b28de4aab886dd017a40a9",
            "entry_value": {
                "descriptor": "supersession",
                "meaning": "旧知識から新知識への明示関係。過去参照を黙って差し替えない。",
            },
        },
    ],
}


def definition_meaning_normative_frame(descriptor_kind: str) -> dict[str, object]:
    """指定kindに対応するL4固定entryの完全frameを返す。"""
    entry = next(
        (item for item in _CATALOG["entries"] if item["descriptor"] == descriptor_kind),
        None,
    )
    if entry is None:
        raise NotImplementedError(
            "F01/F02/unclosed/normative_descriptor_kind; "
            "Backflow HELIXBRAIN-L6-032-N03-PATH"
        )
    return {
        "revision": _CATALOG["revision"],
        "path": _CATALOG["path"],
        "file_sha256": _CATALOG["file_sha256"],
        "catalog_pointer": _CATALOG["catalog_pointer"],
        "catalog_canonical_sha256": _CATALOG["catalog_canonical_sha256"],
        "scope": copy.deepcopy(_CATALOG["scope"]),
        "entry_pointer": entry["entry_pointer"],
        "entry_canonical_sha256": entry["entry_canonical_sha256"],
        "entry_value": copy.deepcopy(entry["entry_value"]),
    }
