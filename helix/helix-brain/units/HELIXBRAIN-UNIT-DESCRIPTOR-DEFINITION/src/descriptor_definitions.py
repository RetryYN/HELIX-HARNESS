"""BRAIN032の局所入力検証。形とsource照合の責務を分ける。"""

import copy

from _source_validation import validate_source
from _supplied_shape import validate_supplied_shape


def validate_supply_input(raw: object) -> dict[str, object]:
    """原入力を保持し、供給形と合成snapshot内のsource対応を検査する。"""
    if type(raw) is not dict:
        return {
            "input": None,
            "input_issues": [{
                "locator": "",
                "reason": "SupplyInput root must be an object.",
                "source_ref": None,
            }],
            "unusable_source_refs": [],
        }
    issues = validate_supplied_shape(raw)
    if issues:
        return {"input": None, "input_issues": issues, "unusable_source_refs": []}
    unusable = []
    if "sources" not in raw:
        issues.append({
            "locator": "/sources",
            "reason": "Source collection is not supplied; source qualification is unresolved.",
            "source_ref": None,
        })
    else:
        # 欠落した資格入力はNoneで未供給を伝え、空配列に成功補完しない。
        qualifications = raw.get("qualifications")
        roots = raw.get("qualification_roots")
        for index, source in enumerate(raw["sources"]):
            source_issues = validate_source(source, qualifications, roots, index)
            issues.extend(source_issues)
            if source_issues and "ref" in source:
                unusable.append(copy.deepcopy(source["ref"]))
    return {
        "input": copy.deepcopy(raw),
        "input_issues": issues,
        "unusable_source_refs": unusable,
    }
