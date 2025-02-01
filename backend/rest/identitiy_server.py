import json
import os
import secrets
import requests
import traceback
import subprocess

import jose.jwt as jwt
from flask import Flask, jsonify, request
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from flask_cors import CORS

from backend.utils.TokenManager import TokenManager
from backend.utils.queries import run_sql_query, run_text_query, run_sql_script, aggregate_all_votes
from backend.databases.voting.models import Waehler, Erststimme, Zweitstimme
from backend.databases.results.models import DirektKandidatur, Kandidat, Partei, ParteiListe, Wahlkreis, \
    ZweitstimmeErgebnisse
from backend.databases.voting.config import DATABASE_URL as TOKEN_DB_URL, DATABASE_USERNAME as T_USER, \
    DATABASE_PWD as T_PWD, DATABASE_HOST as T_HOST, DATABASE_PORT as T_PORT, DATABASE_NAME as T_NAME
from backend.databases.results.config import DATABASE_URL as RESULTS_DB_URL, DATABASE_USERNAME as R_USER, \
    DATABASE_PWD as R_PWD, DATABASE_HOST as R_HOST, DATABASE_PORT as R_PORT, DATABASE_NAME as R_NAME

app = Flask(__name__)
CORS(app)

rest_dir = os.path.dirname(__file__)

app.config.update({
    "SECRET_KEY": secrets.token_hex(32),
    "OIDC_CLIENT_SECRETS": os.path.join(rest_dir, "../../.venv/client_secrets.json"),
    "OIDC_SCOPES": [],
    "OIDC_INTROSPECTION_AUTH_METHOD": "client_secret_post"
})

keycloak_config_file = os.path.join(rest_dir, "../../.venv/keycloak_config.json")
jwks_url = ""
audience = ""
issuer = ""

def validate_token(rq) -> bool:
    global jwks_url, audience, issuer
    if len(jwks_url) == 0 or len(audience) == 0 or len(issuer) == 0:
        values = json.load(open(keycloak_config_file, "r"))
        jwks_url = values["jwks_url"]
        issuer = values["issuer"]
        audience = values["audience"]
    try:
        token = rq.headers['Authorization'].split(None, 1)[1].strip()
        response = requests.get(jwks_url)
        response.raise_for_status()
        jwks = response.json()
        jwt.decode(
            token,
            jwks,
            audience=audience,
            issuer=issuer
        )
        return True
    except Exception:
        return False

voter_intermediate_db = set()

wahlkreis_stimmzettel_cache : list[None | dict] = [None] * 299

token_generator = TokenManager(token_lifetime=15)

jahr = 2021

voting_engine = create_engine(TOKEN_DB_URL, echo=False)
new_voting_session = sessionmaker(bind=voting_engine)

results_engine = create_engine(RESULTS_DB_URL, echo=False)
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
    if not validate_token(rq=request):
        return {"error": "You are not authorized to generate tokens"}, 403
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


def update_pgpass(db_config):
    PGPASS_PATH = os.path.expanduser("~/.pgpass")
    """Ensures .pgpass contains the required credentials."""
    line = f"{db_config['host']}:{db_config['port']}:{db_config['dbname']}:{db_config['user']}:{db_config['password']}"

    if not os.path.exists(PGPASS_PATH):
        with open(PGPASS_PATH, "x") as f:
            f.write(line + "\n")
    else:
        with open(PGPASS_PATH, "r") as f:
            lines = f.readlines()

        if line + "\n" not in lines:
            with open(PGPASS_PATH, "a") as f:
                f.write(line + "\n")

    os.chmod(PGPASS_PATH, 0o600)

@app.route("/end_election", methods=["POST"])
def refresh():
    """
    if not validate_token(rq=request):
        return {"error": "You are not authorized to end the votes"}, 403
    """
    output = subprocess.run(["psql", "--version"], stdout=subprocess.PIPE)
    if output.stdout is None:
        print("Please install psql before running this command")
        return {"error": "An error on the server side occured"}, 500
    update_pgpass({'host': T_HOST, 'port': T_PORT, 'dbname': T_NAME, 'user': T_USER, 'password': T_PWD})
    update_pgpass({'host': R_HOST, 'port': R_PORT, 'dbname': R_NAME, 'user': R_USER, 'password': R_PWD})
    export_cmd = (
        f"psql -h {T_HOST} -p {T_PORT} -U {T_USER} -d {T_NAME} "
        f"-c \"COPY (SELECT \\\"kandidaturId\\\" from Erststimme) TO STDOUT WITH CSV HEADER\" > erststimme.csv"
    )
    import_cmd = (
        f"psql -h {R_HOST} -p {R_PORT} -U {R_USER} -d {R_NAME} "
        f"-c \"COPY \\\"Erststimme\\\"(\\\"kanditaturId\\\") FROM STDIN WITH CSV HEADER\" < erststimme.csv"
    )
    copy_table(export_cmd, import_cmd)
    export_cmd = (
        f"psql -h {T_HOST} -p {T_PORT} -U {T_USER} -d {T_NAME} "
        f"-c \"COPY (SELECT \\\"ZSErgebnisId\\\" from Zweitstimme) TO STDOUT WITH CSV HEADER\" > zweitstimme.csv"
    )
    import_cmd = (
        f"psql -h {R_HOST} -p {R_PORT} -U {R_USER} -d {R_NAME} "
        f"-c \"COPY \\\"Zweitstimme\\\"(\\\"ZSErgebnisId\\\") FROM STDIN WITH CSV HEADER\" < zweitstimme.csv"
    )
    copy_table(export_cmd, import_cmd)
    run_text_query(engine=voting_engine, query='TRUNCATE TABLE erststimme; TRUNCATE TABLE zweitstimme')
    run_text_query(engine=results_engine, query=aggregate_all_votes)
    run_sql_script(engine=results_engine)
    return {"message": "Refreshed"}, 200

def copy_table(export_cmd, import_cmd):
    """Exports data from D1 and imports it into D2."""
    try:
        print(f"Exporting table from Voting DB...")
        subprocess.run(export_cmd, shell=True, check=True)
        print(f"Importing table into Results DB...")
        subprocess.run(import_cmd, shell=True, check=True)
        print("Data transfer completed.")
    except subprocess.CalledProcessError as e:
        print(f"Error during data transfer: {e}")

def insert_vote(first_vote, second_vote):
    engine = create_engine(TOKEN_DB_URL, echo=False)
    new_session = sessionmaker(bind=engine)
    with new_session() as session:
        try:
            session.add(Erststimme(kandidaturId=first_vote))
            session.add(Zweitstimme(ZSErgebnisId=second_vote))
            session.commit()
        except Exception as e:
            print(e)
            session.rollback()

if __name__ == "__main__":
    app.run(host='127.0.0.1', port=5001, debug=False, threaded=True)