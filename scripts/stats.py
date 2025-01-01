from sqlalchemy import func, case, create_engine, literal_column, cast, Float, Numeric
from sqlalchemy.orm import sessionmaker

from backend.database.config import DATABASE_URL
from backend.database.models import WahlkreisInfo, ZweitstimmeErgebnisse, Base


def get_wahlkreis_data(jahr):
    age_midpoints = {
        'alter_unter_18': 9,
        'alter_18_24': 21,
        'alter_25_34': 30,
        'alter_35_59': 47,
        'alter_60_74': 67,
        'alter_75_mehr': 80
    }

    direction_map = {
        'Links': 0,
        'Mitte-links': 1,
        'Mitte': 2,
        'Mitte-rechts': 3,
        'Rechts': 4
    }

    direction_case = case(
        (ZweitstimmeErgebnisse.parteiId.in_([5]), literal_column(str(direction_map['Links']))), #id_5: DIE LINKE
        (ZweitstimmeErgebnisse.parteiId.in_([2, 6]), literal_column(str(direction_map['Mitte-links']))), #id_2_6: SPD,GRUNE
        (ZweitstimmeErgebnisse.parteiId.in_([4]), literal_column(str(direction_map['Mitte']))), #id_4: FDP
        (ZweitstimmeErgebnisse.parteiId.in_([1, 7]), literal_column(str(direction_map['Mitte-rechts']))), #id_1_7: CDU/CSU
        (ZweitstimmeErgebnisse.parteiId.in_([3]), literal_column(str(direction_map['Rechts']))), #id_3: AFD
        else_=literal_column("NULL")
    )

    engine = create_engine(DATABASE_URL, echo=True)
    Base.metadata.create_all(engine)
    new_session = sessionmaker(bind=engine)
    with new_session() as session:
        # Weighted age calculation
        weighted_age_subquery = (
            session.query(
                WahlkreisInfo.wahlkreisId.label('wahlkreisId'),
                (
                        func.sum(
                            WahlkreisInfo.alter_unter_18 * age_midpoints['alter_unter_18'] +
                            WahlkreisInfo.alter_18_24 * age_midpoints['alter_18_24'] +
                            WahlkreisInfo.alter_25_34 * age_midpoints['alter_25_34'] +
                            WahlkreisInfo.alter_35_59 * age_midpoints['alter_35_59'] +
                            WahlkreisInfo.alter_60_74 * age_midpoints['alter_60_74'] +
                            WahlkreisInfo.alter_75_mehr * age_midpoints['alter_75_mehr']
                        ) / 100
                ).label('weighted_age')
            ).filter(WahlkreisInfo.jahr == jahr).group_by(WahlkreisInfo.wahlkreisId)
        ).subquery()

        # Aggregated votes and weighted direction calculation
        votes_query = (
            session.query(
                ZweitstimmeErgebnisse.wahlkreisId.label('wahlkreisId'),
                func.sum(ZweitstimmeErgebnisse.anzahlstimmen).label('total_votes'),
                func.sum(
                    ZweitstimmeErgebnisse.anzahlstimmen * direction_case
                ).label('weighted_direction_value')
            ).filter(ZweitstimmeErgebnisse.jahr == jahr).group_by(ZweitstimmeErgebnisse.wahlkreisId)
        ).subquery()

        # Join weighted age and weighted direction
        combined_query = (
            session.query(
                weighted_age_subquery.c.wahlkreisId,
                cast(func.round(cast(weighted_age_subquery.c.weighted_age, Numeric), 3),Float),
                cast(func.round((votes_query.c.weighted_direction_value / votes_query.c.total_votes), 3), Float).label('weighted_direction')
            ).join(
                votes_query, votes_query.c.wahlkreisId == weighted_age_subquery.c.wahlkreisId
            )
        )
        return combined_query.all()

def get_wahlkreis_data_2():
    engine = create_engine(DATABASE_URL, echo=True)
    Base.metadata.create_all(engine)
    new_session = sessionmaker(bind=engine)

    with new_session() as session:
        # Subquery to get total votes for each wahlkreis
        total_votes_query = (
            session.query(
                ZweitstimmeErgebnisse.wahlkreisId,
                func.sum(ZweitstimmeErgebnisse.anzahlstimmen).label('total_votes')
            ).filter(ZweitstimmeErgebnisse.jahr == 2021)
            .group_by(ZweitstimmeErgebnisse.wahlkreisId)
        ).subquery()

        votes_query = (
            session.query(
                ZweitstimmeErgebnisse.wahlkreisId,
                ZweitstimmeErgebnisse.anzahlstimmen,
            ).filter(ZweitstimmeErgebnisse.parteiId == 6).filter(ZweitstimmeErgebnisse.jahr == 2021) #id 6: GRUNE
        ).subquery()

        # Query to get GRÜNE votes and compute percentage
        combined_query = (
            session.query(
                ZweitstimmeErgebnisse.wahlkreisId,
                ZweitstimmeErgebnisse.anzahlstimmen,
                cast(func.round(
                    ZweitstimmeErgebnisse.anzahlstimmen /
                    func.coalesce(total_votes_query.c.total_votes, 1) * 100, 3),  # Compute percentage
                    Float
                ).label('grune_percentage'),
                WahlkreisInfo.pkw_elektro_hybrid
            )
            .join(
                total_votes_query, ZweitstimmeErgebnisse.wahlkreisId == total_votes_query.c.wahlkreisId
            )
            .join(
                WahlkreisInfo, WahlkreisInfo.wahlkreisId == ZweitstimmeErgebnisse.wahlkreisId
            )
            .filter(ZweitstimmeErgebnisse.parteiId == 6)
            .filter(ZweitstimmeErgebnisse.jahr == 2021)
            .filter(WahlkreisInfo.jahr == 2021)
            .group_by(
                ZweitstimmeErgebnisse.wahlkreisId,
                ZweitstimmeErgebnisse.anzahlstimmen,
                total_votes_query.c.total_votes,
                WahlkreisInfo.pkw_elektro_hybrid
            )
        )
        return combined_query.all()

if __name__ == '__main__':
    print(get_wahlkreis_data_2())
