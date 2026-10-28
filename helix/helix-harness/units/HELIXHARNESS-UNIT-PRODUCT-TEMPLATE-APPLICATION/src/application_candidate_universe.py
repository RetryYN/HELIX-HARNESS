"""Candidate universe comparison (HARNESS-L5-009-compare_candidate_universe / FN2)."""

import copy


def _same_member_ref(left, right):
    if not isinstance(left, dict) or not isinstance(right, dict):
        return False
    return (
        left.get("identity") == right.get("identity")
        and left.get("revision") == right.get("revision")
        and left.get("scope") == right.get("scope")
        and left.get("owner") == right.get("owner")
        and left.get("source_locator") == right.get("source_locator")
    )


def _evaluate_universe_members(u, binding, expected_revision):
    candidate_member_refs = []
    findings = []
    seen_identities = set()
    product_scope = binding.get("product_scope")

    for member in u.get("members", []):
        if member.get("scope") != product_scope:
            code = "foreign_product_in_set"
            findings.append(
                {
                    "code": code,
                    "rule_ref": f"HARNESS-L5-009-R-{code}",
                    "subject_ref": copy.deepcopy(member),
                    "binding": copy.deepcopy(binding),
                    "axis": "candidate_set",
                    "state": "conflict",
                    "source_refs": [
                        copy.deepcopy(member),
                        copy.deepcopy(u["ref"]),
                        copy.deepcopy(u["source_ref"]),
                    ],
                    "reason": "Candidate universe contains a template member from a foreign product scope.",
                    "backflow_owner": "core_owner",
                }
            )
            continue

        if member.get("revision") != expected_revision:
            code = "foreign_revision_in_set"
            findings.append(
                {
                    "code": code,
                    "rule_ref": f"HARNESS-L5-009-R-{code}",
                    "subject_ref": copy.deepcopy(member),
                    "binding": copy.deepcopy(binding),
                    "axis": "candidate_set",
                    "state": "conflict",
                    "source_refs": [
                        copy.deepcopy(member),
                        copy.deepcopy(u["ref"]),
                        copy.deepcopy(u["source_ref"]),
                    ],
                    "reason": f"Candidate universe member revision {member.get('revision')} does not match expected binding revision {expected_revision}.",
                    "backflow_owner": "core_owner",
                }
            )
            continue

        member_id = member.get("identity")
        if member_id in seen_identities:
            code = "duplicate_template_identity"
            findings.append(
                {
                    "code": code,
                    "rule_ref": f"HARNESS-L5-009-R-{code}",
                    "subject_ref": copy.deepcopy(member),
                    "binding": copy.deepcopy(binding),
                    "axis": "candidate_set",
                    "state": "conflict",
                    "source_refs": [
                        copy.deepcopy(member),
                        copy.deepcopy(u["ref"]),
                        copy.deepcopy(u["source_ref"]),
                    ],
                    "reason": f"Duplicate template identity {member_id} in candidate universe.",
                    "backflow_owner": "core_owner",
                }
            )
            candidate_member_refs.append(copy.deepcopy(member))
            continue

        seen_identities.add(member_id)
        candidate_member_refs.append(copy.deepcopy(member))

    return candidate_member_refs, findings


def _evaluate_universe_claims(claims, binding, universe_refs, candidate_member_refs):
    findings = []
    missing_member_refs = []
    extra_member_refs = []

    for claim in claims:
        kind = claim.get("kind")
        if kind == "os_used_set":
            code = "proposed_as_used"
            findings.append(
                {
                    "code": code,
                    "rule_ref": f"HARNESS-L5-009-R-{code}",
                    "subject_ref": copy.deepcopy(claim["subject_ref"]),
                    "binding": copy.deepcopy(binding),
                    "axis": "used_set_claim",
                    "state": "conflict",
                    "source_refs": [
                        copy.deepcopy(claim["ref"]),
                        *copy.deepcopy(claim.get("basis_refs", [])),
                        *copy.deepcopy(universe_refs),
                    ],
                    "reason": "Proposed candidate set cannot be converted into OS registered selected/used set.",
                    "backflow_owner": "os_owner",
                }
            )
        elif kind in ("candidate-exact-set", "candidate_members"):
            proposed = claim.get("proposed_value")
            proposed_refs = (
                [p for p in proposed if isinstance(p, dict)]
                if isinstance(proposed, list)
                else []
            )
            missing = [
                copy.deepcopy(m)
                for m in candidate_member_refs
                if not any(_same_member_ref(m, p) for p in proposed_refs)
            ]
            extra = [
                copy.deepcopy(p)
                for p in proposed_refs
                if not any(_same_member_ref(p, m) for m in candidate_member_refs)
            ]
            if missing or extra:
                missing_member_refs.extend(missing)
                extra_member_refs.extend(extra)
                code = "same_count_wrong_member"
                findings.append(
                    {
                        "code": code,
                        "rule_ref": f"HARNESS-L5-009-R-{code}",
                        "subject_ref": copy.deepcopy(claim["subject_ref"]),
                        "binding": copy.deepcopy(binding),
                        "axis": "candidate_set_equivalence",
                        "state": "conflict",
                        "source_refs": [
                            copy.deepcopy(claim["ref"]),
                            *copy.deepcopy(universe_refs),
                            *copy.deepcopy(missing),
                            *copy.deepcopy(extra),
                        ],
                        "reason": "Claimed candidate member set has missing or extra members compared to qualified candidate universe.",
                        "backflow_owner": "oracle_owner",
                    }
                )

    return findings, missing_member_refs, extra_member_refs


def compare_candidate_universe(context):
    """Compare candidate universe against binding, applicability boundary, and claims."""
    validated = context["validated"]
    inp = validated["input"]
    binding = copy.deepcopy(inp["binding"])
    universes = inp.get("universes")

    matching_universes = (
        [u for u in universes if isinstance(u, dict) and u.get("binding") == binding]
        if isinstance(universes, list)
        else []
    )

    if not matching_universes or any(
        u.get("members") is None or not u.get("boundary_refs")
        for u in matching_universes
    ):
        code = "universe_missing"
        subject_ref = copy.deepcopy(
            binding.get("template_ref") or binding["application_contract_ref"]
        )
        finding = {
            "code": code,
            "rule_ref": f"HARNESS-L5-009-R-{code}",
            "subject_ref": subject_ref,
            "binding": copy.deepcopy(binding),
            "axis": "candidate_universe",
            "state": "missing",
            "source_refs": [
                copy.deepcopy(binding["application_contract_ref"]),
                copy.deepcopy(binding["requirement_ref"]),
            ],
            "reason": "Candidate universe or comparison boundary is missing for target binding.",
            "backflow_owner": "core_owner",
        }
        return {
            "producer_symbol": "compare_candidate_universe",
            "input_binding": binding,
            "original_axes": [],
            "findings": [finding],
            "material": {
                "universe_refs": [],
                "candidate_member_refs": [],
                "missing_member_refs": [],
                "extra_member_refs": [],
            },
        }

    template_ref = binding.get("template_ref")
    expected_revision = (
        template_ref.get("revision")
        if isinstance(template_ref, dict)
        else matching_universes[0]["ref"].get("revision")
    )

    universe_refs = []
    candidate_member_refs = []
    findings = []

    for u in matching_universes:
        universe_refs.append(copy.deepcopy(u["ref"]))
        u_members, u_findings = _evaluate_universe_members(
            u, binding, expected_revision
        )
        candidate_member_refs.extend(u_members)
        findings.extend(u_findings)

    claim_findings, missing_member_refs, extra_member_refs = _evaluate_universe_claims(
        inp.get("claims", []),
        binding,
        universe_refs,
        candidate_member_refs,
    )
    findings.extend(claim_findings)

    return {
        "producer_symbol": "compare_candidate_universe",
        "input_binding": binding,
        "original_axes": [],
        "findings": findings,
        "material": {
            "universe_refs": universe_refs,
            "candidate_member_refs": candidate_member_refs,
            "missing_member_refs": missing_member_refs,
            "extra_member_refs": extra_member_refs,
        },
    }
