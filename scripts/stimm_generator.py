from sqlalchemy import create_engine, select, Select
from sqlalchemy.orm import sessionmaker, Session

from backend.database.config import DATABASE_URL
from backend.database.models import *


def statement_generator(stimme: int, wahlkreisId: int=0, jahr: int=2021) -> tuple[sessionmaker[any], Select[any]]:
    engine = create_engine(DATABASE_URL, echo=True)
    Base.metadata.create_all(engine)
    new_session = sessionmaker(bind=engine)
    table = DirektKandidatur if stimme == 1 else ZweitstimmeErgebnisse if stimme == 2 else None
    stmt = (select(table).where(table.wahlkreisId == wahlkreisId).where(table.jahr == jahr)
            if wahlkreisId > 0
            else select(table).where(table.jahr == jahr))
    return new_session, stmt


def erstimme_generator(wahlkreisId: int=0, jahr: int=2021):
    new_session, stmt = statement_generator(stimme=1, wahlkreisId=wahlkreisId, jahr=jahr)
    with (new_session() as session):
        rows = session.execute(stmt)
        for row in rows:
            for _ in range(row[0].anzahlstimmen):
                session.add(Erststimme(kanditaturId=row[0].kandidaturId))
        session.commit()


def zweitstimme_generator(wahlkreisId: int=0, jahr: int=2021):
    new_session, stmt = statement_generator(stimme=2, wahlkreisId=wahlkreisId, jahr=jahr)
    with (new_session() as session):
        rows = session.execute(stmt)
        for row in rows:
            for _ in range(row[0].anzahlstimmen):
                session.add(Zweitstimme(ZSErgebnisId=row[0].id))
        session.commit()

if __name__ == "__main__":
    erstimme_generator(wahlkreisId=0, jahr=2021)
    zweitstimme_generator(wahlkreisId=0, jahr=2021)
    erstimme_generator(wahlkreisId=0, jahr=2017)
    zweitstimme_generator(wahlkreisId=0, jahr=2017)