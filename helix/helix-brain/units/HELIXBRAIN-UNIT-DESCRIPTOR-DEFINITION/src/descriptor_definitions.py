"""BRAIN032の局所入力検証。実TDDで同じ公開関数を段階的に形成する。"""

import copy
import hashlib


def _ref_identity(ref):
    """Refの識別4項を返す。"""
    if not isinstance(ref, dict):
        return None
    return (
        ref.get("identity"),
        ref.get("revision"),
        ref.get("scope"),
        ref.get("owner"),
    )


def _source_unusable_reason(source, qualifications, roots):
    """供給sourceのbytes/digest/独立資格を実照合する。

    照合が成立する場合はNone、照合できない場合はInputIssueのreasonを返す。
    合成値を実資格/採用の証拠にしない。実root認証や発行元検証は本局所範囲外。
    """
    ref = source.get("ref") if isinstance(source, dict) else None
    content_bytes = source.get("content_bytes") if isinstance(source, dict) else None
    if not isinstance(ref, dict) or not isinstance(content_bytes, str):
        return "Supplied source lacks ref or content_bytes."
    declared = ref.get("sha256")
    measured = hashlib.sha256(content_bytes.encode("utf-8")).hexdigest()
    if declared != measured:
        return "Supplied source digest does not match content_bytes."
    qualification_ref = source.get("qualification_ref")
    if not isinstance(qualification_ref, dict):
        return "Supplied source lacks qualification_ref."
    matched = None
    for qualification in qualifications:
        if not isinstance(qualification, dict):
            continue
        if qualification.get("ref") != qualification_ref:
            continue
        if qualification.get("subject_ref") != ref:
            return "Qualification subject does not match supplied source ref."
        if qualification.get("subject_sha256") != measured:
            return "Qualification digest does not match measured bytes."
        matched = qualification
    if matched is None:
        return "No independent qualification resolves the supplied source."
    root_ref = matched.get("root_ref")
    if not isinstance(root_ref, dict):
        return "Qualification lacks root_ref."
    root_ids = [_ref_identity(root) for root in roots if isinstance(root, dict)]
    if _ref_identity(root_ref) not in root_ids:
        return "Qualification root is not among independent qualification_roots."
    return None


def validate_supply_input(raw: object) -> dict[str, object]:
    """root形を診断し、供給sourceのbytes/digest/独立資格を実照合する。"""
    if isinstance(raw, dict):
        sources = raw.get("sources")
        if not isinstance(sources, list):
            return {
                "input": None,
                "input_issues": [{
                    "locator": "/sources",
                    "reason": "SupplyInput sources must be an array.",
                    "source_ref": None,
                }],
                "unusable_source_refs": [],
            }
        qualifications = raw.get("qualifications")
        roots = raw.get("qualification_roots")
        if not isinstance(qualifications, list):
            qualifications = []
        if not isinstance(roots, list):
            roots = []
        unusable = []
        issues = []
        for index, source in enumerate(sources):
            reason = _source_unusable_reason(source, qualifications, roots)
            if reason is None:
                continue
            ref = source.get("ref") if isinstance(source, dict) else None
            issues.append({
                "locator": "/sources/%d" % index,
                "reason": reason,
                "source_ref": copy.deepcopy(ref),
            })
            unusable.append(copy.deepcopy(ref))
        return {
            "input": copy.deepcopy(raw),
            "input_issues": issues,
            "unusable_source_refs": unusable,
        }
    return {
        "input": None,
        "input_issues": [{
            "locator": "",
            "reason": "SupplyInput root must be an object.",
            "source_ref": None,
        }],
        "unusable_source_refs": [],
    }
