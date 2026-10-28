"""Finite raw-Ref projection from BRAIN candidates to CORE universes/templates."""

from __future__ import annotations

import copy
from typing import Any

from candidate_ref_projection_aggregate import input_presence_owners, project_link
from candidate_ref_projection_json import (
    collection_sha256,
    read_collection,
    template_non_ref_sha256,
)


_CANDIDATE_PATH = ("brain_supply_analysis", "candidate_refs")
_UNIVERSE_PATH = ("core_application", "universes")
_TEMPLATE_PATH = ("core_application", "templates")
_NOT_ESTABLISHED = "not_established_by_this_ref_projection"


def project_cross_design_candidate_refs(raw_root: Any) -> dict[str, Any]:
    """Project raw candidate Ref occurrences without qualifying or selecting them."""
    candidates = read_collection(raw_root, _CANDIDATE_PATH)
    universes = read_collection(raw_root, _UNIVERSE_PATH)
    templates = read_collection(raw_root, _TEMPLATE_PATH)

    links = []
    if candidates.presence == "value":
        links = [
            project_link(candidate, index, universes, templates)
            for index, candidate in enumerate(candidates.value)
        ]

    universe_count = (
        len(universes.value) if universes.presence in {"empty", "value"} else None
    )
    result = {
        "candidate_refs_presence": candidates.presence,
        "links": links,
        "universes_presence": universes.presence,
        "universe_count": universe_count,
        "universes_sha256": collection_sha256(universes),
        "templates_presence": templates.presence,
        "template_non_ref_sha256": template_non_ref_sha256(templates),
        "qualification": _NOT_ESTABLISHED,
        "selection": _NOT_ESTABLISHED,
        "return_owner_candidates": input_presence_owners(candidates.presence),
        "side_effect_count": 0,
    }
    if candidates.presence != "absent":
        result["candidate_refs"] = copy.deepcopy(candidates.value)
    return result
