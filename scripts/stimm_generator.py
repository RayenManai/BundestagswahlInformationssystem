from sqlalchemy import create_engine, select, Select, func
from sqlalchemy.orm import sessionmaker
from pprint import pprint

from backend.database.config import DATABASE_URL
from backend.database.models import *


def statement_generator(stimme: int, wahlkreisId: int=0, jahr: int=2021, until: int=-1) -> tuple[sessionmaker[any], Select[any]]:
    engine = create_engine(DATABASE_URL, echo=True)
    Base.metadata.create_all(engine)
    new_session = sessionmaker(bind=engine)
    table = DirektKandidatur if stimme == 1 else ZweitstimmeErgebnisse if stimme == 2 else None
    stmt = (select(table).where(table.wahlkreisId == wahlkreisId).where(table.jahr == jahr)
            if until == -1 and wahlkreisId > 0
            else select(table).where(table.jahr == jahr) if until == -1
            else select(table).where(table.wahlkreisId.between(wahlkreisId, until)).where(table.jahr == jahr))
    return new_session, stmt


def erstimme_generator(wahlkreisId: int=0, jahr: int=2021, until: int=-1) -> None:
    new_session, stmt = statement_generator(stimme=1, wahlkreisId=wahlkreisId, jahr=jahr, until=until)
    with (new_session() as session):
        rows = session.execute(stmt)
        #subquery = stmt.subquery()
        #print(f'This has {session.scalar(select(func.count()).select_from(subquery))} rows')
        #[pprint(vars(row[0])) for row in rows]
        for row in rows:
            for _ in range(row[0].anzahlstimmen):
                session.add(Erststimme(kanditaturId=row[0].kandidaturId))
        session.commit()


def zweitstimme_generator(wahlkreisId: int=0, jahr: int=2021, until: int=-1) -> None:
    new_session, stmt = statement_generator(stimme=2, wahlkreisId=wahlkreisId, jahr=jahr, until=until)
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