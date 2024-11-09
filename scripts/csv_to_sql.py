import csv
from itertools import zip_longest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.database.models import *
from backend.database.config import DATABASE_URL

def csv_to_dict(csv_file: str, delimiter: str = ';', header_rows: int = 0, ignore_rows: list[int] = list) -> list[dict]:
    with open(csv_file, newline='') as file:
        lines = file.readlines()
        lines = [l for i, l in enumerate(lines) if i not in ignore_rows]
        reader = csv.reader(lines, delimiter=delimiter)
        headers = [next(reader) for _ in range(header_rows)]
        combined_headers = ['; '.join(filter(None, pair)) for pair in zip_longest(*headers, fillvalue="")]
        dict_list = [dict(zip(combined_headers, row)) for row in reader]
    return dict_list


def dict_to_sql(dict_list: list[dict], table_key_map: dict[declarative_base, dict[Column, str]]) -> None:
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
    session = new_session()
    for entry in dict_list:
        for table, column_to_key in table_key_map.items():
            column_to_value = {column.key: entry[key] if key is not None else 0 for column, key in column_to_key.items() }
            session.add(table(**column_to_value))
    session.commit()

def party_to_sql():
    return

results = csv_to_dict('../csv_data/btw21_wahlkreisnamen_utf8.csv', delimiter=';', ignore_rows=[0,1,2,3,4,5,6], header_rows=1)
mapping = {Wahlkreis: {Wahlkreis.wahlkreisName: 'WKR_NAME', Wahlkreis.wahlkreisId: 'WKR_NR', Wahlkreis.bundesland: 'LAND_ABK', Wahlkreis.anzahlwahlberechtigte: None}}
dict_to_sql(results, mapping)
#r = csv_to_dict('../csv_data/btwkr21_umrechnung_btw17.csv', header_rows=2, ignore_rows=[0, 1, 2, 3, 322])
#print(r)
#dict_to_sql(r,None)
