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

bundesweit = (
'''
SELECT p.kurzbezeichnung AS "Partei_kurzbezeichnung", e."anzahlSitze" AS "Ergebnisse_anzahlSitze",
       e."direktMandate" AS "Ergebnisse_direktMandate",
       e."ueberhangsMandate" AS "Ergebnisse_ueberhangsMandate", 
       sum(d.anzahlstimmen) AS erststimmen, sum(z.anzahlstimmen) AS zweitstimmen
FROM "Partei" p, "Ergebnisse" e, "ZweitstimmeErgebnisse" z, "DirektKandidatur" d, "Kandidat" k
WHERE p."parteiId" = e."parteiId" AND p."parteiId" = z."parteiId"
  AND p."parteiId" = k."parteiId" AND e.jahr = :year AND z.jahr = :year
  AND d.jahr = :year AND d."kandidatId" = k."kandidatId"
  AND d."wahlkreisId" = z."wahlkreisId"
 GROUP BY p."parteiId", e."anzahlSitze", e."direktMandate", e."ueberhangsMandate"
''')

landesweit = (
'''
SELECT p.kurzbezeichnung, l.sitze, l."direktMandate", l.ueberhang, sum(d.anzahlstimmen) AS erststimmen, sum(z.anzahlstimmen) AS zweitstimmen
FROM "Partei" p, "Landesergebnisse" l, "DirektKandidatur" d, "Wahlkreis" w, "ZweitstimmeErgebnisse" z, "Kandidat" k
WHERE p."parteiId" = z."parteiId" AND p."parteiId" = l."parteiId" AND z."wahlkreisId" = w."wahlkreisId"
  AND d.jahr = :year AND l.jahr = :year AND z.jahr = :year
  AND w.bundesland = l.bundesland AND d."wahlkreisId" = w."wahlkreisId" AND k."kandidatId" = d."kandidatId"
  AND k."parteiId" = p."parteiId" AND w.bundesland = :bundesland AND k."parteiId" = p."parteiId"
GROUP BY p.kurzbezeichnung, l.sitze, l."direktMandate", l.ueberhang
'''
)

wahlkreisweit = (
'''
SELECT p.kurzbezeichnung, d.anzahlstimmen AS erststimmen, z.anzahlstimmen as zweitstimmen
FROM "Partei" p, "ZweitstimmeErgebnisse" z, "DirektKandidatur" d, "Kandidat" k
WHERE p."parteiId" = z."parteiId" AND d."kandidatId" = k."kandidatId" and k."parteiId" = p."parteiId"
    AND z.jahr = :year AND d.jahr = :year AND d."wahlkreisId" = :wahlkreis AND z."wahlkreisId" = :wahlkreis
    AND exists(select * from "Ergebnisse" e WHERE e."parteiId" = p."parteiId")
GROUP BY p.kurzbezeichnung, d.anzahlstimmen, z.anzahlstimmen
'''
)

angeordnete_bundesweit =(
'''
WITH ohneDirekt AS (
    (SELECT p."kandidatId"
    FROM "ParteiListe" p
    WHERE jahr = :year) except
    (SELECT d."kandidatId"
     FROM "Gewaehlte_direkt_kandidaten" g, "DirektKandidatur" d
     WHERE g."kandidaturId" = d."kandidaturId" AND d.jahr = :year
    )
),
listen_gewinner AS (
SELECT concat((CASE WHEN k.titel is NULL THEN '' ELSE concat(k.titel, ' ') END), k.vorname, ' ', k.name) as name, partei."kurzbezeichnung" as partei, l.bundesland,
l.sitze, l."direktMandate", l.ueberhang, row_number() over (PARTITION BY k."parteiId", p."landAbk" ORDER BY p."listenPlatz") AS platz
FROM "Kandidat" k, "ParteiListe" p, "Partei" partei, "Landesergebnisse" l, ohneDirekt o
WHERE p.jahr = :year AND l.jahr = :year
AND l."parteiId" = p."parteiId" AND p."parteiId" = k."parteiId" AND partei."parteiId" = p."parteiId"
AND k."kandidatId" = o."kandidatId" AND k."kandidatId" = p."kandidatId" AND l.bundesland = p."landAbk")
(SELECT l.name, l.partei, l.bundesland, false as direktMandat, false as ueberhangsMandat
FROM listen_gewinner l
WHERE l.platz <= l.sitze - l."direktMandate")
UNION
(
WITH only_direkt AS (
SELECT concat((CASE WHEN k.titel is NULL THEN '' ELSE concat(k.titel, ' ') END), k.vorname, ' ', k.name) as name, p."kurzbezeichnung" as partei, p."parteiId", w.bundesland as bundesland,
 d.anzahlstimmen
FROM "DirektKandidatur" d, "Kandidat" k, "Wahlkreis" w, "Partei" p, "Gewaehlte_direkt_kandidaten" g
WHERE g."kandidaturId" = d."kandidaturId" AND g."parteiId" = p."parteiId" AND d."kandidatId" = k."kandidatId"
AND d."wahlkreisId" = w."wahlkreisId" AND d.jahr = :year AND k."parteiId" = p."parteiId" 
) 
SELECT name, partei, o1.bundesland, true as direktMandat, (SELECT COUNT(*) 
                                                FROM only_direkt o2
                                                where o2.anzahlstimmen > o1.anzahlstimmen AND o1.bundesland = o2.bundesland
                                                AND o1."parteiId" = o2."parteiId"
                                                ) >= l.sitze - l.ueberhang
from only_direkt o1, "Landesergebnisse" l
where l."parteiId" = o1."parteiId" AND l.bundesland = o1.bundesland AND l.jahr = :year
)
'''
)

angeordnete_landesweit = (
'''
WITH ohneDirekt AS (
    (SELECT p."kandidatId"
    FROM "ParteiListe" p
    WHERE jahr = :year AND "landAbk" = :bundesland) except
    (SELECT d."kandidatId"
     FROM "Gewaehlte_direkt_kandidaten" g, "DirektKandidatur" d, "Wahlkreis" w
     WHERE g."kandidaturId" = d."kandidaturId" AND d.jahr = :year AND w.bundesland = :bundesland AND d."wahlkreisId" = w."wahlkreisId"
    )
),
listen_gewinner AS (
SELECT concat((CASE WHEN k.titel is NULL THEN '' ELSE concat(k.titel, ' ') END), k.vorname, ' ', k.name) as name, partei."kurzbezeichnung" as partei,
l.sitze, l."direktMandate", l.ueberhang, row_number() over (PARTITION BY k."parteiId", p."landAbk" ORDER BY p."listenPlatz") AS platz
FROM "Kandidat" k, "ParteiListe" p, "Partei" partei, "Landesergebnisse" l, ohneDirekt o
WHERE p.jahr = :year AND l.jahr = :year
AND l."parteiId" = p."parteiId" AND p."parteiId" = k."parteiId" AND partei."parteiId" = p."parteiId"
AND k."kandidatId" = o."kandidatId" AND k."kandidatId" = p."kandidatId" AND l.bundesland = p."landAbk")
(SELECT l.name, l.partei, :bundesland as bundesland, false as direktMandat, false as ueberhangsMandat
FROM listen_gewinner l
WHERE l.platz <= l.sitze - l."direktMandate")
UNION
(
WITH only_direkt AS (
SELECT concat((CASE WHEN k.titel is NULL THEN '' ELSE concat(k.titel, ' ') END), k.vorname, ' ', k.name) as name, p."kurzbezeichnung" as partei, p."parteiId",
true as direktMandat, d.anzahlstimmen
FROM "DirektKandidatur" d, "Kandidat" k, "Wahlkreis" w, "Partei" p, "Gewaehlte_direkt_kandidaten" g
WHERE g."kandidaturId" = d."kandidaturId" AND g."parteiId" = p."parteiId" AND d."kandidatId" = k."kandidatId"
AND d."wahlkreisId" = w."wahlkreisId" AND d.jahr = :year AND k."parteiId" = p."parteiId" AND w.bundesland = :bundesland
) 
SELECT name, partei, :bundesland as bundesland, direktMandat, (SELECT COUNT(*) 
                                                FROM only_direkt o2
                                                where o2.anzahlstimmen > o1.anzahlstimmen
                                                AND o1."parteiId" = o2."parteiId"
                                                ) >= l.sitze - l.ueberhang
from only_direkt o1, "Landesergebnisse" l
where l."parteiId" = o1."parteiId" AND l.bundesland = :bundesland AND l.jahr = :year
)
'''
)

beteiligung_bundesweit = (
'''
SELECT sum(i."anzahlWaehlende") as waelende, sum(i."anzahlWahlBerechtigte") as berechtigte
FROM "Wahlkreis" w, "WahlkreisInfo" i
WHERE w."wahlkreisId" = i."wahlkreisId" AND i.jahr = :year
'''
)

beteiligung_landesweit = beteiligung_bundesweit + ' AND w.bundesland = :bundesland'

beteiligung_wahlkreis= beteiligung_bundesweit + ' AND w."wahlkreisId" = :wahlkreis'
