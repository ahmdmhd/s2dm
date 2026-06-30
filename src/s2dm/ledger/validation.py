"""Validate ledger annotations before they are applied to a schema."""

from pathlib import Path

from modl.ledger import LedgerValidationError, validate_model_labels


def validate_modl_annotation(labels: list[tuple[str, str]], ledger_dir: Path) -> bool:
    """Return whether the model's ``(label, kind)`` labels match the ledger at ``ledger_dir``."""
    try:
        validate_model_labels(labels, ledger_dir)
    except LedgerValidationError:
        return False
    return True
