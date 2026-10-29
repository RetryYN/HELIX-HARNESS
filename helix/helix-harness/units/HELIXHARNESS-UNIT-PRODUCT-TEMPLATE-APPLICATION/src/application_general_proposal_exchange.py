"""Public entrypoint and internal builder re-exports for FN13 general proposal exchange."""

from general_proposal_exchange_body import build_general_original_operation_proposal
from general_proposal_exchange_f02_detail import compare_candidate_universe_detail
from general_proposal_exchange_native import (
    build_application_analysis_detail,
    build_general_native_proposal_record_detail,
    build_native_proposal_record_detail,
    build_proposal_material_detail,
    form_native_proposal_record_detail,
    form_proposal_material_detail,
    read_proposal_native_material,
)
from general_proposal_exchange_publication import (
    publish_general_proposal_exchange,
    supply_core_proposal_publication_authority,
    supply_core_proposal_publication_header,
)


def publish_general_proposal_exchange_public(request):
    """HARNESS-L5-009-publish_general_proposal_exchange_public entrypoint."""
    return publish_general_proposal_exchange(request)


__all__ = [
    "build_application_analysis_detail",
    "build_general_native_proposal_record_detail",
    "build_general_original_operation_proposal",
    "build_native_proposal_record_detail",
    "build_proposal_material_detail",
    "compare_candidate_universe_detail",
    "form_native_proposal_record_detail",
    "form_proposal_material_detail",
    "publish_general_proposal_exchange",
    "publish_general_proposal_exchange_public",
    "read_proposal_native_material",
    "supply_core_proposal_publication_authority",
    "supply_core_proposal_publication_header",
]
