"""Structured schema-validation violations shared across the constraint checker and schema loader."""

from dataclasses import dataclass
from enum import Enum


class ConstraintCode(str, Enum):
    SCHEMA_SPEC = "schema.spec"
    ENUM_DEFAULT = "schema.enum_default"
    INSTANCE_TAG_INVALID_REFERENCE = "instanceTag.invalid_reference"
    INSTANCE_TAG_MULTIPLE_FIELDS = "instanceTag.multiple_fields"
    INSTANCE_TAG_NON_ENUM_FIELD = "instanceTag.non_enum_field"
    MIN_GREATER_THAN_MAX = "min_greater_than_max"
    INVALID_MIN_MAX = "invalid_min_max"
    NAMING_CONVENTION = "naming_convention"


@dataclass(frozen=True)
class ConstraintViolation:
    code: ConstraintCode
    message: str

    def __str__(self) -> str:
        return self.message
