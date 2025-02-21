import logging
from pathlib import Path

import rich_click as click
from rich.pretty import pprint
from rich.traceback import install

from s2dm.iris import get_iris, write_yaml

from . import __version__, log


@click.group(context_settings={"auto_envvar_prefix": "s2dm"})
@click.option(
    "-l",
    "--log-level",
    type=click.Choice(["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"], case_sensitive=False),
    default="INFO",
    help="Log level",
    show_default=True,
)
@click.option("--log-file", type=click.Path(dir_okay=False, writable=True, path_type=Path), help="Log file")
@click.version_option(__version__)
def cli(log_level: str, log_file: Path | None) -> None:
    if log_file:
        file_handler = logging.FileHandler(log_file, mode="w")
        file_handler.setFormatter(logging.Formatter("%(asctime)s:%(levelname)s:%(message)s"))
        log.addHandler(file_handler)

    log.setLevel(log_level)
    if log_level == "DEBUG":
        _ = install(show_locals=True)


@cli.command
@click.option("--schema", "-s", type=click.Path(exists=True), required=True, help="The graphql schema file")
@click.option("--namespace", "-n", required=True, help="The namespace")
@click.option("--output", "-o", type=click.Path(dir_okay=False, writable=True, path_type=Path), help="Output YAML")
def iris(schema: Path, namespace: str, output: Path) -> None:
    """Generate IRIs from a GraphQL schema."""
    result = get_iris(schema, namespace)
    pprint(result)
    write_yaml(result, output)
