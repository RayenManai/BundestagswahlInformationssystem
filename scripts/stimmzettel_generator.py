from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker

from backend.database.config import DATABASE_URL
from backend.database.models import *


def stimmzettel_generator(wahlkreisId: int=0, jahr: int=2021):
    engine = create_engine(DATABASE_URL, echo=True)
    Base.metadata.create_all(engine)
    new_session = sessionmaker(bind=engine)
    stmt = (select(ZweitstimmeErgebnisse).where(ZweitstimmeErgebnisse.wahlkreisId == wahlkreisId and ZweitstimmeErgebnisse.jahr == jahr)
            if wahlkreisId > 0
            else select(ZweitstimmeErgebnisse).where(ZweitstimmeErgebnisse.jahr == jahr))
    with (new_session() as session):
        rows = session.execute(stmt)
        i = 0
        for row in rows:
            for num_zettel in range(row[0].anzahlstimmen):
                i += 1
                zettel = StimmZettel(StimmzettelId=i, jahr=jahr, wahlkreisId=row[0].wahlkreisId)
                zweitstimme = Zweitstimme(StimmzettelId=i, parteiId=row[0].parteiId)
                session.add(zettel)
                session.add(zweitstimme)
        session.commit()

if __name__ == "__main__":
    stimmzettel_generator(1)