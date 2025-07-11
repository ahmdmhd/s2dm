from pathlib import Path

from s2dm import log


def write_aggregated_schema(aggregated_schema: str, output_path: Path) -> None:
    """
    Write the aggregated GraphQL schema to the specified output file.

    Args:
        aggregated_schema: The complete aggregated GraphQL schema string
        output_path: Path where the schema should be written
    """
    log.info(f"Writing aggregated schema to: {output_path}")

    try:
        output_path.write_text(aggregated_schema, encoding="utf-8")
        log.info(f"Successfully wrote {len(aggregated_schema)} characters to {output_path}")
    except Exception as e:
        log.error(f"Failed to write schema to {output_path}: {e}")
        raise
