from os import path

from sqlalchemy import create_engine

from backend.databases.results.config import DATABASE_URL
from backend.utils.queries import run_sql_script, repo_directory


def refresh_einzelstimmen():
    engine = create_engine(DATABASE_URL, echo=True)
    autocommit_engine = engine.execution_options(isolation_level="AUTOCOMMIT")
    run_sql_script(autocommit_engine, path.join(repo_directory, "scripts/einzel_stimmen_regenerieren.sql"))

if __name__ == "__main__":
    refresh_einzelstimmen()