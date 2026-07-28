"""Helpers for consistent JSON CLI output formatting."""

import json
from typing import Any


def format_json_output(data: Any) -> str:
    """Serialize data to stable, human-readable JSON."""
    return json.dumps(data, indent=2, ensure_ascii=False)
