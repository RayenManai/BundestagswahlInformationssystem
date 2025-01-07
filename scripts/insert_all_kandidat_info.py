import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.database.config import DATABASE_URL
from backend.database.models import Kandidat, DirektKandidatur, ParteiListe
from scripts.csv_to_sql_maps import get_partei_from_kurzbezeichnung


def insert_candidates():
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    session = Session()

    csv_file_path = "merged_kandidaten.csv"
    data = pd.read_csv(csv_file_path)

    expected_columns = ['id', 'Titel', 'Nachname', 'Vornamen', "Geburtsjahr", "Gruppenname", "WahlkreisNr", "LandId", "Listenplatz", "Jahr"]

    if not all(col in data.columns for col in expected_columns):
        raise ValueError(f"CSV is missing one or more required columns: {expected_columns}")

    # Main iteration and insertion logic
    try:
        existing_kandidats = set()
        for _, row in data.iterrows():
            if int(row['id']) not in existing_kandidats:
                entry_kandidat = Kandidat(
                    kandidatId= int(row['id']),
                    titel=row['Titel'] if pd.notna(row['Titel']) else None,
                    geburtsjahr=int(row['Geburtsjahr']),
                    name=row['Nachname'],
                    vorname=row['Vornamen'],
                    parteiId=get_partei_from_kurzbezeichnung(row['Gruppenname'])[0],
                )
                session.add(entry_kandidat)
                existing_kandidats.add(int(row['id']))

        session.commit()
        print("Data inserted successfully.")
    except Exception as e:
        session.rollback()
        print(f"An error occurred: {e}")
    finally:
        session.close()


def insert_direktkandidaturs():
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    session = Session()

    csv_file_path = "merged_kandidaten.csv"
    data = pd.read_csv(csv_file_path)

    expected_columns = ['id', 'Titel', 'Nachname', 'Vornamen', "Geburtsjahr", "Gruppenname", "WahlkreisNr", "LandId",
                        "Listenplatz", "Jahr"]

    if not all(col in data.columns for col in expected_columns):
        raise ValueError(f"CSV is missing one or more required columns: {expected_columns}")

    # Main iteration and insertion logic
    try:
        for _, row in data.iterrows():
            if pd.notna(row['WahlkreisNr']):
                entry_direkt_kandidatur = DirektKandidatur(
                    kandidatId=int(row['id']),
                    jahr=int(row['Jahr']),
                    wahlkreisId=int(row['WahlkreisNr']),
                    anzahlstimmen=0
                )
                session.add(entry_direkt_kandidatur)

        session.commit()
        print("Data inserted successfully.")
    except Exception as e:
        session.rollback()
        print(f"An error occurred: {e}")
    finally:
        session.close()

def insert_partei_listen():
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    session = Session()

    csv_file_path = "merged_kandidaten.csv"
    data = pd.read_csv(csv_file_path)

    expected_columns = ['id', 'Titel', 'Nachname', 'Vornamen', "Geburtsjahr", "Gruppenname", "WahlkreisNr", "LandId",
                        "Listenplatz", "Jahr"]

    if not all(col in data.columns for col in expected_columns):
        raise ValueError(f"CSV is missing one or more required columns: {expected_columns}")

    # Main iteration and insertion logic
    try:
        for _, row in data.iterrows():
            if pd.notna(row['Listenplatz']):
                entry_partei_listen = ParteiListe(
                    kandidatId=row['id'],
                    jahr=row['Jahr'],
                    parteiId=get_partei_from_kurzbezeichnung(row['Gruppenname'])[0],
                    listenPlatz=int(row['Listenplatz']),
                    landAbk=row['LandId']
                )
                session.add(entry_partei_listen)

        session.commit()
        print("Data inserted successfully.")
    except Exception as e:
        session.rollback()
        print(f"An error occurred: {e}")
    finally:
        session.close()

if __name__ == '__main__':
    insert_candidates()
    insert_direktkandidaturs()
    insert_partei_listen()