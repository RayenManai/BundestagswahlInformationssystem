from flask import Flask, jsonify
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.database.config import DATABASE_URL
from backend.database.models import Base
from scripts.stats import get_wahlkreis_data, get_wahlkreis_data_2
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

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

if __name__ == '__main__':
    app.run(debug=True)
