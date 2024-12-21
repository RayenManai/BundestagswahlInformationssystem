from flask import Flask, jsonify
from sqlalchemy import create_engine, text, MetaData, Table

from backend.database.config import DATABASE_URL
app = Flask(__name__)

engine = create_engine(DATABASE_URL, echo=True)
metadata = MetaData()
landesergebnisse_2021 = Table('landesergebnisse_2021', metadata, autoload_with=engine)
landesergebnisse_2017 = Table('landesergebnisse_2017', metadata, autoload_with=engine)
partei_bundesland_zweitstimmen_neu_2021 = Table('partei_bundesland_zweitstimmen_neu_2021', metadata, autoload_with=engine)
partei_bundesland_zweitstimmen_neu_2017 = Table('partei_bundesland_zweitstimmen_neu_2017', metadata, autoload_with=engine)

def run_from_file(file: str, params: dict=None) -> list[dict]:
    if params is None:
        params = {}
    with open(file, 'r') as f:
        query = f.read()
    with engine.connect() as c:
         result = (c.execute(text(query.format(**params)), parameters=params)).fetchall()
    return [{'id': r[0], 'seats': int(r[1]), 'numberOfDirektMandaten': int(r[2]),
             'numberOfUberhangMandaten': int(r[3]), 'firstVotes': int(r[4]),
             'secondVotes': int(r[5])} for r in result]

@app.route('/api/results', methods=['GET'])
def get_results(): #contains at most: year, bundesland, wahlkreis
    #values = request.args.to_dict()
    values = {'year': 2021, 'bundesland': 'SH'}
    assert "year" in values.keys(), "year must be specified"
    year = int(values["year"])
    #new_session = sessionmaker(bind=engine)
    if "bundesland" not in values.keys() and "wahlkreis" not in values.keys():
        result1 = run_from_file('../queries/Q1/bundesweit.sql', {'year': year})
        result2 = run_from_file('../queries/Q1/bundesweit.sql', {'year': 2017}) if year == 2021 else []
        return jsonify({'partiesResults': result1, 'partiesOldResults': result2,
                        'wahlberechtigte' : 0, 'wahlbeteiligte':0})
    if "bundesland" in values.keys() and "wahlkreis" not in values.keys():
        bundesland = values['bundesland']
        result1 = run_from_file('../queries/Q1/landesweit.sql', {'year': year, 'bundesland': bundesland})
        result2 = run_from_file('../queries/Q1/landesweit.sql', {'year': 2017, 'bundesland': bundesland}) if year == 2021 else []
        return jsonify({'partiesResults': result1, 'partiesOldResults': result2,
                        'wahlberechtigte': 0, 'wahlbeteiligte': 0})
    assert "wahlkreis" in values.keys(), "wahlkreis must be specified"
    wahlkreis = values['wahlkreis']
    result1 = run_from_file('../queries/Q1/landesweit.sql', {'year': year, 'bundesland': bundesland})
    result2 = run_from_file('../queries/Q1/landesweit.sql',
                            {'year': 2017, 'bundesland': bundesland}) if year == 2021 else []
    return jsonify({'partiesResults': result1, 'partiesOldResults': result2,
                    'wahlberechtigte': 0, 'wahlbeteiligte': 0})



if __name__ == "__main__":
    get_results()
    #app.run(host='127.0.0.1', port=5000, debug=True)