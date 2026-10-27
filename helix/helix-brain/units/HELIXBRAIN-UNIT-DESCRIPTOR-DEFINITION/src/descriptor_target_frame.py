"""同walkの返却だけからDescriptorTargetCallFrameを構成する。"""
from __future__ import annotations


def build_descriptor_claim_uses(validated, evaluation, reads, intents):
    """Claim出現0件の閉じた経路。供給Claimの未対応を空usesにしない。"""
    if (not isinstance(evaluation, dict)
            or set(evaluation) != {"comparison", "assessments"}
            or not isinstance(evaluation["assessments"], list)):
        raise NotImplementedError(
            "F05/F06/unclosed/descriptor_claim_uses; owner=knowledge_owner; "
            "Backflow HELIXBRAIN-L6-032-FN4-ORACLE"
        )
    raw = validated["input"]
    if raw is None:
        if reads == [] and intents == [] and evaluation["assessments"] == []:
            return []
    else:
        claims = raw["claims"] if "claims" in raw else []
        if isinstance(claims, list) and not claims and reads == [] and intents == []:
            return []
    raise NotImplementedError(
        "F05/F06/unclosed/descriptor_claim_uses; owner=knowledge_owner; "
        "Backflow HELIXBRAIN-L6-032-FN4-ORACLE"
    )
