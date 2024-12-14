from flask import Flask, request, jsonify
from sqlalchemy import create_engine, func, MetaData, Table
from sqlalchemy.orm import Session, sessionmaker

from backend.database.models import *
from backend.database.config import DATABASE_URL
app = Flask(__name__)

engine = create_engine(DATABASE_URL, echo=True)
metadata = MetaData()
landesergebnisse_2021 = Table('landesergebnisse_2021', metadata, autoload_with=engine)
landesergebnisse_2017 = Table('landesergebnisse_2017', metadata, autoload_with=engine)
partei_bundesland_zweitstimmen_neu_2021 = Table('partei_bundesland_zweitstimmen_neu_2021', metadata, autoload_with=engine)
partei_bundesland_zweitstimmen_neu_2017 = Table('partei_bundesland_zweitstimmen_neu_2017', metadata, autoload_with=engine)

def get_results_from_year(year: int, session: Session | sessionmaker) -> list[dict]:
    with (session if isinstance(session, Session) else sessionmaker()) as s:
         result = (s.query(Partei.kurzbezeichnung, Ergebnisse.anzahlSitze, Ergebnisse.direktMandate,
                       Ergebnisse.ueberhangsMandate,
                       func.sum(ZweitstimmeErgebnisse.anzahlstimmen).label("zweitstimmen"),
                       func.sum(DirektKandidatur.anzahlstimmen).label("erststimmen")).
         filter(Partei.parteiId == Ergebnisse.parteiId).
         filter(Partei.parteiId == ZweitstimmeErgebnisse.parteiId).
         filter(Partei.parteiId == Kandidat.parteiId).
         filter(Ergebnisse.jahr == year).
         filter(ZweitstimmeErgebnisse.jahr == year).
         filter(DirektKandidatur.jahr == year).
         filter(DirektKandidatur.kandidatId == Kandidat.kandidatId).
         filter(DirektKandidatur.wahlkreisId == ZweitstimmeErgebnisse.wahlkreisId).
         group_by(Partei.parteiId, Ergebnisse.anzahlSitze, Ergebnisse.direktMandate,
                  Ergebnisse.ueberhangsMandate)).all()
    return [{'id': r[0], 'seats': int(r[1]), 'numberOfDirektMandaten': int(r[2]),
             'numberOfUberhangMandaten': int(r[3]), 'firstVotes': int(r[4]),
             'secondVotes': int(r[5])} for r in result]

@app.route('/api/results', methods=['GET'])
def get_results(): #contains at most: year, bundesland, wahlkreis
    #values = request.args.to_dict()
    values = {'year': 2021, 'bundesland': 'SH'}
    assert "year" in values.keys(), "year must be specified"
    year = int(values["year"])
    new_session = sessionmaker(bind=engine)
    if "bundesland" not in values.keys() and "wahlkreis" not in values.keys():
        with new_session() as session:
            result1 = get_results_from_year(year, session)
            result2 =  get_results_from_year(2017, session) if year == 2021 else []
        return jsonify({'partiesResults': result1, 'partiesOldResults': result2,
                        'wahlberechtigte' : 0, 'wahlbeteiligte':0})
    if "bundesland" in values.keys() and "wahlkreis" not in values.keys():
        with new_session() as session:
            result = "SELECT * FROM mindestsitze_2021"
            result = result.group_by(Partei.kurzbezeichnung, landesergebnisse_2021.c.sitze, landesergebnisse_2021.c.direktmandate,
                                   landesergebnisse_2021.c.ueberhang)
            print(result.all())


if __name__ == "__main__":
    get_results()
    #app.run(host='127.0.0.1', port=5000, debug=True)