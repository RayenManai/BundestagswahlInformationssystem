from flask import Flask, jsonify, request
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from flask_cors import CORS

import traceback

from backend.utils.TokenManager import TokenManager
from backend.utils.queries import run_sql_query, insert_vote
from backend.databases.voting.models import Waehler
from backend.databases.results.models import DirektKandidatur, Kandidat, Partei, ParteiListe, Wahlkreis, \
    ZweitstimmeErgebnisse
from backend.databases.voting.config import DATABASE_URL as TOKEN_DB_URL
from backend.databases.results.config import DATABASE_URL as RESULTS_DB_URL

app = Flask(__name__)
CORS(app)

voter_intermediate_db = set()

wahlkreis_stimmzettel_cache : list[None | dict] = [None] * 299

token_generator = TokenManager(token_lifetime=15)

jahr = 2021

voting_engine = create_engine(TOKEN_DB_URL, echo=True)
new_voting_session = sessionmaker(bind=voting_engine)

results_engine = create_engine(RESULTS_DB_URL, echo=True)
new_results_session = sessionmaker(bind=results_engine)

def get_stimmzettel(wahlkreis: int | None) -> dict:
    if wahlkreis is None or wahlkreis < 1 or wahlkreis > 299:
        return {"error": "Falsches format für das Wahlkreis"}
    zettel = wahlkreis_stimmzettel_cache[wahlkreis]

    # if already cached
    if zettel is not None:
        return zettel

    # if not cached yet
    try:
        with new_results_session() as session:

            kandidaten = session.query(DirektKandidatur.kandidaturId, Kandidat.titel, Kandidat.name, Kandidat.vorname,
                                   Partei.kurzbezeichnung, Partei.parteiName
                                       ).filter(
                Kandidat.kandidatId == DirektKandidatur.kandidatId
            ).filter(
                DirektKandidatur.jahr == jahr
            ).filter(
                DirektKandidatur.wahlkreisId == wahlkreis
            ).filter(
                Kandidat.parteiId == Partei.parteiId)
            kandidaten_out = {0: ("id", int), 1: ("titel", str), 2: ("name", str), 3: ("vorname", str),
                              4: ("parteiKurz", str), 5: ("partei", str)}
            kandidaten_result = run_sql_query(session, kandidaten, kandidaten_out)

            parteien = session.query(ZweitstimmeErgebnisse.id, Partei.kurzbezeichnung, Partei.parteiName, Kandidat.titel,
                                     Kandidat.name, Kandidat.vorname
                                     ).filter(
                Partei.parteiId == ParteiListe.parteiId
            ).filter(
                ParteiListe.kandidatId == Kandidat.kandidatId
            ).filter(
                ParteiListe.jahr == jahr
            ).filter(
                ParteiListe.landAbk == Wahlkreis.bundesland
            ).filter(
                Wahlkreis.wahlkreisId == wahlkreis
            ).filter(
                ZweitstimmeErgebnisse.parteiId == Partei.parteiId
            ).filter(
                ZweitstimmeErgebnisse.wahlkreisId == wahlkreis
            ).filter(
                ZweitstimmeErgebnisse.jahr == jahr
            ).filter(
                ParteiListe.listenPlatz <= 5
            )
            parteien_out = {0: ("id", int), 1: ("kurzbezeichnung", str), 2: ("parteiName", str), 3: ("titel", str),
                              4: ("name", str), 5: ("vorname", str)}
            parteien_tmp = run_sql_query(session, parteien, parteien_out)
            parteien_result = [{"id": partei[0], "name": partei[1], "kurzbezeichnung": partei[2],
                                "parteiListe": [{"titel": k["titel"], "name": k["name"],
                                                 "vorname": k["vorname"]}
                                                for k in parteien_tmp if k["id"] == partei[0]]}
                               for partei in set([(p["id"], p["parteiName"], p["kurzbezeichnung"])
                                                  for p in parteien_tmp])]
        zettel = {'firstVote': kandidaten_result, 'secondVote': parteien_result}

        # cache the Stimmzettel and return it
        wahlkreis_stimmzettel_cache[wahlkreis] = zettel
        return zettel

    except:
        traceback.print_stack()
        return {"error": "Something went wrong"}

def voter_has_voted(user_id: str) -> bool:
    with new_voting_session() as session:
        result = session.query(Waehler).filter(Waehler.waehlerId == user_id)
    return result.one_or_none() is not None

def add_voter(user_id: str) -> bool:
    try:
        with new_voting_session() as session:
            session.add(
                Waehler(waehlerId=user_id)
            )
            session.commit()
        return True
    except:
        traceback.print_stack()
        return False

@app.route("/token", methods=["POST"])
def generate_token():
    parameters = request.json
    ausweis_id = parameters["hash"]
    wahlkreis_nr = parameters["wahlkreis"]
    if ausweis_id in voter_intermediate_db:
        return jsonify({"error": "Wählerausweisnummer ist schon eingetragen"}), 403
    voter_intermediate_db.add(ausweis_id)
    if voter_has_voted(ausweis_id):
        voter_intermediate_db.remove(ausweis_id)
        return jsonify({"error": "Wähler hat schon gewählt"}), 403
    token = token_generator.generate_uvt(ausweis_id)
    adding = token_generator.add_token(token, wahlkreis_nr)
    if not adding:
        voter_intermediate_db.remove(ausweis_id)
        return jsonify({"error": "Cannot add token"}), 403
    adding = add_voter(ausweis_id)
    if not adding:
        voter_intermediate_db.remove(ausweis_id)
        return jsonify({"error": "Cannot add voter"}), 403
    voter_intermediate_db.remove(ausweis_id)
    return jsonify({"token": token}), 200

@app.route("/auth", methods=["POST"])
def auth():
    token = request.json.get("token")
    wahlkreis = token_generator.token_wahlkreis(token)
    if wahlkreis is None:
        return jsonify({"error": "Invalid token"}), 403
    result = get_stimmzettel(wahlkreis)
    return result, 200

@app.route("/vote", methods=["POST"])
def process_vote():
    vote = request.json
    token = vote["token"]
    first_vote = vote["firstVote"]
    second_vote = vote["secondVote"]
    wahlkreis = token_generator.token_wahlkreis(token)
    if wahlkreis is None:
        return jsonify({"error": "Invalid token"}), 403
    if not isinstance(first_vote, list) or not isinstance(second_vote, list):
        return jsonify({"message": "Voting process terminated"}), 200
    if len(first_vote) != 1 or len(second_vote) != 1:
        return jsonify({"message": "Voting process terminated"}), 200
    if not token_generator.invalidate_token(token):
        return jsonify({"error": "An error occurred"}), 500
    insert_vote(first_vote[0], second_vote[0])
    return jsonify({"message": "Voting process terminated"}), 200

if __name__ == "__main__":
    app.run(port=5001, debug=True)