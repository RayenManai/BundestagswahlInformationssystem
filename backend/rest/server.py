import logging
import time

from flask import Flask, jsonify, request, g
from flask_cors import CORS

from backend.utils.queries import (DATABASE_URL, create_engine, run_text_query, bundesweit, landesweit,
                                   beteiligung_bundesweit, wahlkreisweit, angeordnete_bundesweit,
                                   angeordnete_landesweit, get_wahlkreis_data, get_wahlkreis_data_2)

log = True

# Set up logging
if log:
    logger = logging.getLogger('performance_logger')
    logger.setLevel(logging.INFO)
    file_handler = logging.FileHandler('performance.log')
    file_handler.setLevel(logging.INFO)
    logger.addHandler(file_handler)
else:
    logger = None

app = Flask(__name__)
CORS(app)

engine = create_engine(DATABASE_URL, echo=True)

@app.before_request
def start_timer():
    if log:
        g.start_time = time.time()

@app.after_request
def log_response_time(response):
    if log and hasattr(g, 'start_time'):
        duration = time.time() - g.start_time
        logger.info(f"{request.method} {request.path} {response.status_code} {duration:.3f}s")
    return response


@app.route('/api/results', methods=['GET'])
def get_results(): #contains at most: year, bundesland, wahlkreis
    values = request.args.to_dict()
    assert "year" in values.keys(), "year must be specified"
    year = int(values["year"])
    output_format = {0: ('id', str), 1: ('seats', int), 2: ('numberOfDirektMandaten', int),
                     3: ('numberOfUberhangMandaten', int), 4: ('firstVotes', int), 5: ('secondVotes', int)}

    if "bundesland" not in values.keys() and "wahlkreis" not in values.keys():
        result1 = run_text_query(engine, bundesweit, {'year': year}, output_format)
        result2 = run_text_query(engine, bundesweit, {'year': 2017}, output_format) if year == 2021 else []
        result3 = run_text_query(engine, beteiligung_bundesweit, {'year': year},
                                 {0: ('wahlberechtigte', int), 1: ('wahlbeteiligte', int)})
        assert len(result3) == 1, "Something is wrong here!"
        return jsonify({'partiesResults': result1, 'partiesOldResults': result2,
                        'wahlberechtigte': result3[0]['wahlbeteiligte'],'wahlbeteiligte':result3[0]['wahlberechtigte']})

    if "bundesland" in values.keys() and "wahlkreis" not in values.keys():
        bundesland = values['bundesland']
        result1 = run_text_query(engine, landesweit, {'year': year, 'bundesland': bundesland}, output_format)
        result2 = run_text_query(engine, landesweit, {'year': 2017, 'bundesland': bundesland}, output_format) if year == 2021 else []
        result3 = run_text_query(engine, beteiligung_bundesweit, {'year': year, 'bundesland': bundesland},
                                 {0: ('wahlberechtigte', int), 1: ('wahlbeteiligte', int)})
        assert len(result3) == 1, "Something is wrong here!"
        return jsonify({'partiesResults': result1, 'partiesOldResults': result2,
                        'wahlberechtigte': result3[0]['wahlbeteiligte'],'wahlbeteiligte':result3[0]['wahlberechtigte']})

    assert "wahlkreis" in values.keys(), "wahlkreis must be specified"
    wahlkreis = values['wahlkreis']
    output_format = {0: ('id', str), 1: ('firstVotes', int), 2: ('secondVotes', int)}
    result1 = run_text_query(engine, wahlkreisweit, {'year': year, 'wahlkreis': wahlkreis}, output_format)
    result2 = run_text_query(engine, wahlkreisweit, {'year': year, 'wahlkreis': wahlkreis}, output_format) \
        if year == 2021 else []
    result3 = run_text_query(engine, beteiligung_bundesweit, {'year': year, 'wahlkreis': wahlkreis},
                             {0: ('wahlberechtigte', int), 1: ('wahlbeteiligte', int)})
    assert len(result3) == 1, "Something is wrong here!"
    return jsonify({'partiesResults': result1, 'partiesOldResults': result2,
                    'wahlberechtigte': result3[0]['wahlbeteiligte'],'wahlbeteiligte':result3[0]['wahlberechtigte']})

@app.route('/api/delegates', methods=['GET'])
def get_delegates():
    values = request.args.to_dict()
    assert "year" in values.keys(), "year must be specified"
    output_format = {0: ('name', str), 1: ('party', str), 2: ('bundesland', str),
                     3: ('direktMandat', bool), 4: ('UberhangMandat', bool)}
    if "bundesland" not in values.keys():
        result = run_text_query(engine, angeordnete_bundesweit, {'year': values['year']}, output_format)
    else:
        result = run_text_query(engine, angeordnete_landesweit, {'year': values['year'], 'bundesland': values['bundesland']}, output_format)
    return jsonify({'abgeordnete': result}), 200

@app.route('/api/statistik2/<int:jahr>', methods=['GET'])
def statistik_2(jahr):
    data = get_wahlkreis_data(jahr)
    formatted_data = [
        {
            'wahlkreisId': row[0],
            'weighted_age': row[1],
            'weighted_direction': row[2],
        } for row in data
    ]
    return jsonify(formatted_data)

@app.route('/api/statistik3/', methods=['GET'])
def statistik_3():
    data = get_wahlkreis_data_2()
    formatted_data = [
        {
            'wahlkreisId': row[0],
            'anzahl_stimmen_grune': row[1],
            'percent_stimmen_grune': row[2],
            'pkw_elektro_hybrid_percent': row[3],
        } for row in data
    ]
    return jsonify(formatted_data)


if __name__ == "__main__":
    app.run(host='127.0.0.1', port=5000, debug=True)