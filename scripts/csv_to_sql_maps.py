from backend.database.config import DATABASE_URL
from backend.database.models import *
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


class CSVKey:
    value: str

    def __init__(self, value: str) -> None:
        self.value = value


class DirectValue[_T]:
    value: _T

    def __init__(self, value: _T) -> None:
        self.value = value


CellValue = CSVKey | DirectValue


PARTY_MAPPER = [
    (1, 'CDU', 'Christlich Demokratische Union Deutschlands'),
    (2, 'SPD', 'Sozialdemokratische Partei Deutschlands'),
    (3, 'AfD', 'Alternative für Deutschland'),
    (4, 'FDP', 'Freie Demokratische Partei'),
    (5, 'DIE LINKE', 'DIE LINKE'),
    (6, 'GRÜNE', 'BÜNDNIS 90/DIE GRÜNEN'),
    (7, 'CSU', 'Christlich-Soziale Union in Bayern e.V.'),
    (8, 'FREIE WÄHLER', 'FREIE WÄHLER'),
    (9, 'Die PARTEI', 'Partei für Arbeit, Rechtsstaat, Tierschutz, Elitenförderung und basisdemokratische Initiative'),
    (10, 'Tierschutzpartei', 'PARTEI MENSCH UMWELT TIERSCHUTZ'),
    (11, 'NPD', 'Nationaldemokratische Partei Deutschlands'),
    (12, 'PIRATEN', 'Piratenpartei Deutschland'),
    (13, 'ÖDP', 'Ökologisch-Demokratische Partei'),
    (14, 'V-Partei³', 'V-Partei³ - Partei für Veränderung, Vegetarier und Vegane'),
    (15, 'DiB', 'DEMOKRATIE IN BEWEGUNG'),
    (16, 'BP', 'Bayernpartei'),
    (17, 'Tierschutzallianz', 'Allianz für Menschenrechte, Tier- und Naturschutz'),
    (18, 'MLPD', 'Marxistisch-Leninistische Partei Deutschlands'),
    (19, 'Gesundheitsforschung', 'Partei für Gesundheitsforschung'),
    (20, 'MENSCHLICHE WELT', 'Menschliche Welt'),
    (21, 'DKP', 'Deutsche Kommunistische Partei'),
    (22, 'Die Grauen', 'Die Grauen – Für alle Generationen'),
    (23, 'BüSo', 'Bürgerrechtsbewegung Solidarität'),
    (24, 'Die Humanisten', 'Partei der Humanisten'),
    (25, 'Gartenpartei', 'Gartenpartei'),
    (26, 'du.', 'Die Urbane. Eine HipHop Partei'),
    (27, 'SGP', 'Sozialistische Gleichheitspartei, Vierte Internationale'),
    (28, 'dieBasis', 'Basisdemokratische Partei Deutschland'),
    (29, 'Bündnis C', 'Bündnis C - Christen für Deutschland'),
    (30, 'BÜRGERBEWEGUNG', 'Bürgerbewegung für Fortschritt und Wandel'),
    (31, 'III. Weg', 'DER DRITTE WEG'),
    (32, 'BÜNDNIS21', 'diePinken/BÜNDNIS21'),
    (33, 'LIEBE', 'Europäische Partei LIEBE'),
    (34, 'LKR', 'Liberal-Konservative Reformer'),
    (35, 'PdF', 'Partei des Fortschritts'),
    (36, 'LfK', '>> Partei für Kinder, Jugendliche und Familien <<  – Lobbyisten für Kinder –'),
    (37, 'SSW', 'Südschleswigscher Wählerverband'),
    (38, 'Team Todenhöfer', 'Team Todenhöfer – Die Gerechtigkeitspartei'),
    (39, 'UNABHÄNGIGE', 'UNABHÄNGIGE für bürgernahe Demokratie'),
    (40, 'Volt', 'Volt Deutschland'),
    (41, 'Volksabstimmung', 'Ab jetzt…Demokratie durch Volksabstimmung'),
    (42, 'B*', 'bergpartei, die überpartei'),
    (43, 'sonstige', 'DIE SONSTIGEN'),
    (44, 'FAMILIE', 'Familien-Partei Deutschlands'),
    (45, 'Graue Panther', 'Graue Panther'),
    (46, 'KlimalisteBW', 'Klimaliste Baden-Württemberg'),
    (47, 'THP', 'Thüringer Heimatpartei')
]

CSV_MAPPER = {
    'btw21_wahlkreisnamen_utf8.csv':
        {Wahlkreis:
            [
                {Wahlkreis.wahlkreisName: CSVKey('WKR_NAME'),
                 Wahlkreis.wahlkreisId: CSVKey('WKR_NR'),
                 Wahlkreis.bundesland: CSVKey('LAND_ABK'),
                 Wahlkreis.anzahlwahlberechtigte: DirectValue[int](0)}
            ]
        },
    'btwkr21_umrechnung_btw17.csv':
        {ZweitstimmeErgebnisse:
            [
                {ZweitstimmeErgebnisse.parteiId: DirectValue[int](party_id),
                 ZweitstimmeErgebnisse.jahr: DirectValue[int](2017),
                 ZweitstimmeErgebnisse.wahlkreisId: CSVKey('Wkr-Nr.'),
                 ZweitstimmeErgebnisse.anzahlstimmen: CSVKey(f'{abbreviation}; Zweitstimmen')
                 } for (party_id, abbreviation, _) in PARTY_MAPPER if party_id < 25
            ]
        }
}

if __name__ == '__main__':
    engine = create_engine(DATABASE_URL, echo=True)
    Base.metadata.create_all(engine)
    new_session = sessionmaker(bind=engine)
    with new_session() as session:
        for party in PARTY_MAPPER:
            session.add(Partei(parteiId=party[0], parteiName=party[2], kurzbezeichnung=party[1]))
        session.commit()