import csv
from collections.abc import Callable
from itertools import zip_longest

import pandas as pd
from scripts.csv_to_sql_maps import *
from sqlalchemy import update


def csv_to_dict(csv_file: str, delimiter: str = ';', header_rows: int = 0, ignore_rows: list[int] = list) -> list[dict]:
    with open(csv_file, newline='') as file:
        lines = file.readlines()
        lines = [l for i, l in enumerate(lines) if i not in ignore_rows]
        reader = csv.reader(lines, delimiter=delimiter)
        headers = [next(reader) for _ in range(header_rows)]
        combined_headers = ['; '.join(filter(None, pair)) for pair in zip_longest(*headers, fillvalue="")]
        dict_list = [dict(zip(combined_headers, row)) for row in reader]
    return dict_list


def dict_to_sql(dict_list: list[dict], table_key_map: dict[declarative_base, list[dict[Column, CellValue]]],
                pred: Callable = lambda _ : True) -> None:
    """
    inserts in the tables the values from the dictionary list into the database
    :param dict_list: has the format [{'key1': value1, 'key2': value2, ...}, {'key1': value3, 'key2': value4, ...}, ...]
    :param table_key_map:has the format {table1: {column1: 'key1', column2: 'key2', ...}, ...}
    :return: None
    Each entry of the dict_list inserts the corresponding row in the tables specified
    """
    engine = create_engine(DATABASE_URL, echo=True)
    Base.metadata.create_all(engine)
    new_session = sessionmaker(bind=engine)
    with new_session() as session:
        for entry in dict_list:
            if pred(entry):
                for table, columns_to_key in table_key_map.items():
                    for column_to_key in columns_to_key:
                        column_to_value = {column.key: key.as_type(entry[key.value]) if isinstance(key, CSVKey) else
                        key.value if isinstance(key, CSVKey) or isinstance(key, DirectValue) else
                        key[1](key[0].as_type(entry[key[0].value])) if isinstance(key[0], CSVKey) else
                        key[1](key[0].as_type([entry[key[0].value[i]] for i in range(len(key[0].value))]))
                                           for column, key in column_to_key.items()}
                        session.add(table(**column_to_value))
        session.commit()


def csv_wahlberechtigte_2021():
    dictionary_list = csv_to_dict('../csv_data/kerg.csv', delimiter=';', ignore_rows=[0, 1], header_rows=3)
    return list(map(lambda entry: {'wahlkreisId': int(entry['Nr']),
                                   'wahlberechtigte': int(entry['Wahlberechtigte; Erststimmen; Endgültig'])},
                filter(lambda entry: len(entry['Nr']) == 3, dictionary_list)))

def csv_wahlende_2021():
    dictionary_list = csv_to_dict('../csv_data/kerg.csv', delimiter=';', ignore_rows=[0, 1], header_rows=3)
    return list(map(lambda entry: {'wahlkreisId': int(entry['Nr']),
                                   'Wählende': int(entry['Wählende; Erststimmen; Endgültig'])},
                filter(lambda entry: len(entry['Nr']) == 3, dictionary_list)))

def csv_wahlberechtigte_2017():
    dictionary_list = csv_to_dict('../csv_data/btwkr21_umrechnung_btw17.csv', delimiter=';', ignore_rows=[0, 1, 2, 3, 5, 322], header_rows=1)
    return list(map(lambda entry: {'wahlkreisId': int(entry['Wkr-Nr.']),
                                   'wahlberechtigte': int(entry['Wahlberechtigte'])},
                filter(lambda entry: int(entry['Wkr-Nr.']) <= 299, dictionary_list)))

def csv_wahlende_2017():
    dictionary_list = csv_to_dict('../csv_data/btwkr21_umrechnung_btw17.csv', delimiter=';', ignore_rows=[0, 1, 2, 3, 5, 322], header_rows=1)
    return list(map(lambda entry: {'wahlkreisId': int(entry['Wkr-Nr.']),
                                   'Wählende': int(entry['Wähler'])},
                filter(lambda entry: int(entry['Wkr-Nr.']) <= 299, dictionary_list)))

def create_wahlkreis():
    # insert Wahlkreisen
    results = csv_to_dict(**CSV_MAPPER['btw21_wahlkreisnamen_utf8.csv']['format'])
    mapping = CSV_MAPPER['btw21_wahlkreisnamen_utf8.csv']['mapping']
    dict_to_sql(results, mapping)

def create_zweitstimmeErgebnisse_2017():
    # insert ZweitstimmeErgebnisse 2017
    results = csv_to_dict(**CSV_MAPPER['btwkr21_umrechnung_btw17.csv']['format'])
    mapping = CSV_MAPPER['btwkr21_umrechnung_btw17.csv']['mapping']
    dict_to_sql(results, mapping)

def create_zweitstimmeErgebnisse_2021():
    # insert ZweitstimmeErgebnisse 2021
    results = csv_to_dict(**CSV_MAPPER['kerg.csv']['format'])
    mapping = CSV_MAPPER['kerg.csv']['mapping']
    dict_to_sql(results, mapping)

def create_direkt_kandidaturen_2017():
    results = csv_to_dict(**CSV_MAPPER['merged_kandidaten.csv']['format'])
    mapping = CSV_MAPPER['merged_kandidaten.csv']['mapping']
    aggregated_results = csv_to_dict(**CSV_MAPPER['btwkr21_umrechnung_btw17.csv']['format'])
    df = pd.DataFrame.from_records(aggregated_results)
    def determine_anzahl_stimmen(partei_wahlkreis):
        partei, wahlkreis = partei_wahlkreis[0], partei_wahlkreis[1]
        try:
            return int(df[df['Wkr-Nr.'].astype(int) == int(wahlkreis)][f'{partei}; Erststimmen'].iloc[0])
        except:
            return 0

    anzahl_stimmen = (CSVKeys(values=['Gruppenname', 'WahlkreisNr'], value_types=[str, float]) , determine_anzahl_stimmen)
    mapping[DirektKandidatur][0][DirektKandidatur.anzahlstimmen] = anzahl_stimmen
    dict_to_sql(results, mapping, pred=lambda entry: entry['WahlkreisNr'] is not None and len(entry['WahlkreisNr']) > 0 and int(float(entry['Jahr'])) == 2017)

def create_direkt_kandidaturen_2021():
    results = csv_to_dict(**CSV_MAPPER['merged_kandidaten.csv']['format'])
    mapping = CSV_MAPPER['merged_kandidaten.csv']['mapping']
    aggregated_results = csv_to_dict(**CSV_MAPPER['kerg.csv']['format'])
    df = pd.DataFrame.from_records(aggregated_results)
    def determine_anzahl_stimmen(partei_wahlkreis):
        partei, wahlkreis = partei_wahlkreis[0], partei_wahlkreis[1]
        try:
            partei_name = get_partei_from_kurzbezeichnung(partei)[2]
            return int(df[df['Nr'].astype(int) == int(wahlkreis)][f'{partei_name}; Erststimmen; Endgültig'].iloc[0])
        except:
            return 0

    anzahl_stimmen = (CSVKeys(values=['Gruppenname', 'WahlkreisNr'], value_types=[str, float]) , determine_anzahl_stimmen)
    mapping[DirektKandidatur][0][DirektKandidatur.anzahlstimmen] = anzahl_stimmen
    dict_to_sql(results, mapping, pred=lambda entry: entry['WahlkreisNr'] is not None and len(entry['WahlkreisNr']) > 0 and int(float(entry['Jahr'])) == 2021)

def create_wahlkreisinfo_2021():
    results = csv_to_dict(**CSV_MAPPER['strukturdaten_2021.csv']['format'])
    mapping = CSV_MAPPER['strukturdaten_2021.csv']['mapping']
    dict_to_sql(results, mapping)

def update_wahlkreisinfo_2021():
    engine = create_engine(DATABASE_URL, echo=True)
    Base.metadata.create_all(engine)
    new_session = sessionmaker(bind=engine)
    with new_session() as session:
        data1 = csv_wahlberechtigte_2021()
        data2 = csv_wahlende_2021()

        for entry in data1:
            stmt = (
                update(WahlkreisInfo)
                .where(WahlkreisInfo.wahlkreisId == entry['wahlkreisId'])
                .where(WahlkreisInfo.jahr == 2021)
                .values(anzahlWahlBerechtigte=entry['wahlberechtigte'])
            )
            session.execute(stmt)
        for entry in data2:
            stmt = (
                update(WahlkreisInfo)
                .where(WahlkreisInfo.wahlkreisId == entry['wahlkreisId'])
                .where(WahlkreisInfo.jahr == 2021)
                .values(anzahlWaehlende=entry['Wählende'])
            )
            session.execute(stmt)
        session.commit()

def update_wahlkreisinfo_2017():
    engine = create_engine(DATABASE_URL, echo=True)
    Base.metadata.create_all(engine)
    new_session = sessionmaker(bind=engine)
    with new_session() as session:
        data1 = csv_wahlberechtigte_2017()
        data2 = csv_wahlende_2017()

        for entry in data1:
            stmt = (
                update(WahlkreisInfo)
                .where(WahlkreisInfo.wahlkreisId == entry['wahlkreisId'])
                .where(WahlkreisInfo.jahr == 2017)
                .values(anzahlWahlBerechtigte=entry['wahlberechtigte'])
            )
            session.execute(stmt)
        for entry in data2:
            stmt = (
                update(WahlkreisInfo)
                .where(WahlkreisInfo.wahlkreisId == entry['wahlkreisId'])
                .where(WahlkreisInfo.jahr == 2017)
                .values(anzahlWaehlende=entry['Wählende'])
            )
            session.execute(stmt)
        session.commit()

def create_wahlkreisinfo_2017():
    results = csv_to_dict(**CSV_MAPPER['btw2017_strukturdaten.csv']['format'])
    mapping = CSV_MAPPER['btw2017_strukturdaten.csv']['mapping']
    dict_to_sql(results, mapping)

if __name__ == '__main__':
    #create_wahlkreis()
    #create_zweitstimmeErgebnisse_2017()
    #create_zweitstimmeErgebnisse_2021()
    #create_direkt_kandidaturen_2017()
    #create_direkt_kandidaturen_2021()
    create_wahlkreisinfo_2021()
    create_wahlkreisinfo_2017()
    update_wahlkreisinfo_2021()
    update_wahlkreisinfo_2017()




