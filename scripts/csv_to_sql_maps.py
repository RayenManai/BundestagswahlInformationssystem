import warnings

from backend.database.config import DATABASE_URL
from backend.database.models import *
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


class CSVKey:
    value: str
    value_type: type

    type_default = {
        int: 0,
        str: '',
        float: 0.,
        bool: False
    }

    def __init__(self, value: str, value_type: type) -> None:
        self.value = value
        self.value_type = value_type

    def as_type(self, text: str):
        try:
            return self.value_type(text)
        except Exception:
            return self.type_default[self.value_type]


class CSVKeys:
    keys: list[CSVKey]

    def __init__(self, values: list[str], value_types: list[type]) -> None:
        self.keys = [CSVKey(value, value_type) for value, value_type in zip(values, value_types)]

    def as_type(self, texts: list[str]):
        result = []
        for key, text in zip(self.keys, texts):
            result.append(key.as_type(text))
        return result

    @property
    def value(self):
        return [keys.value for keys in self.keys]


class DirectValue[_T]:
    value: _T

    def __init__(self, value: _T) -> None:
        self.value = value


CellValue = CSVKey | DirectValue | tuple[CSVKey, any] | tuple[CSVKeys, any]

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
    (14, 'V-Partei³', 'V-Partei³ - Partei für Veränderung, Vegetarier und Veganer'),
    (15, 'DiB', 'DEMOKRATIE IN BEWEGUNG'),
    (16, 'BP', 'Bayernpartei'),
    (17, 'Tierschutzallianz', 'Allianz für Menschenrechte, Tier- und Naturschutz'),
    (18, 'MLPD', 'Marxistisch-Leninistische Partei Deutschlands'),
    (19, 'Gesundheitsforschung', 'Partei für Gesundheitsforschung'),
    (20, 'MENSCHLICHE WELT', 'Menschliche Welt - für das Wohl und Glücklichsein aller'),
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
    (36, 'LfK', '>> Partei für Kinder, Jugendliche und Familien << – Lobbyisten für Kinder –'),
    (37, 'SSW', 'Südschleswigscher Wählerverband'),
    (38, 'Team Todenhöfer', 'Team Todenhöfer – Die Gerechtigkeitspartei'),
    (39, 'UNABHÄNGIGE', 'UNABHÄNGIGE für bürgernahe Demokratie'),
    (40, 'Volt', 'Volt Deutschland'),
    (41, 'Volksabstimmung', 'Ab jetzt...Demokratie durch Volksabstimmung - Politik für die Menschen'),
    (42, 'B*', 'bergpartei, die überpartei - ökoanarchistisch-realdadaistisches sammelbecken'),
    (43, 'sonstige', 'DIE SONSTIGEN - X'),
    (44, 'FAMILIE', 'Familien-Partei Deutschlands'),
    (45, 'Graue Panther', 'Graue Panther'),
    (46, 'KlimalisteBW', 'Klimaliste Baden-Württemberg'),
    (47, 'THP', 'Thüringer Heimatpartei'),
    (48, 'BGE', 'Bündnis Grundeinkommen'),
    (49, 'DM', 'Deutsche Mitte'),
    (50, 'MG', 'Militante Gruppe'),
    (51, 'AD-DEMOKRATEN', 'Allianz Deutscher Demokraten'),
    (52, 'PDV', 'Partei der Vernunft'),
    (53, 'DIE RECHTE', 'Die Rechte – Partei für Volksabstimmung, Souveränität und Heimatschutz')
]

def get_partei_from_kurzbezeichnung(bezeichnung: str) -> tuple[int | None, str | None, str | None]:
    if 'EB:' in bezeichnung:
        return None, None, None
    l = list(filter(lambda x:  bezeichnung== x[1], PARTY_MAPPER))
    if len(l) == 0:
        warnings.warn(f"Party {bezeichnung} not found")
        return None, None, None
    return l[0]

BUNDESLAND_MAPPER = [
    ('BW', 'Baden-Wuerttemberg'),
    ('BY', 'Bayern'),
    ('BE', 'Berlin'),
    ('BB', 'Brandenburg'),
    ('HB', 'Bremen'),
    ('HH', 'Hamburg'),
    ('HE', 'Hessen'),
    ('MV', 'Mecklenburg-Vorpemmern'),
    ('NI', 'Niedersachsen'),
    ('NW', 'Nordrhein-Westfalen'),
    ('RP', 'Rheinland-Pfalz'),
    ('SL', 'Saarland'),
    ('SN', 'Sachsen'),
    ('ST', 'Sachsen-Anhalt'),
    ('SH', 'Schleswig-Holstein'),
    ('TH', 'Thueringen')
    ]

BUNDESLAND_Struktur_MAPPER = [
    ('BW', 2021, 9313413, 35748),
    ('BY', 2021, 11328866, 70542),
    ('BE', 2021, 2942960, 891),
    ('BB', 2021, 2397701, 29654),
    ('HB', 2021, 548941, 419),
    ('HH', 2021, 1537766, 755),
    ('HE', 2021, 5222158, 21116),
    ('MV', 2021, 1532412, 23295),
    ('NI', 2021, 7207587, 47710),
    ('NW', 2021, 15415642, 34113),
    ('RP', 2021, 3610865, 19858),
    ('SL', 2021, 865191, 2572),
    ('SN', 2021, 3826905, 18450),
    ('ST', 2021, 2056177, 20464),
    ('SH', 2021, 2659792, 15804),
    ('TH', 2021, 1996822, 16202)
    ]

CSV_MAPPER = {
    'btw21_wahlkreisnamen_utf8.csv':
        {
            'format': {
                'csv_file': '../csv_data/btw21_wahlkreisnamen_utf8.csv',
                'delimiter': ';',
                'ignore_rows': [0, 1, 2, 3, 4, 5, 6],
                'header_rows': 1,
            },
            'mapping': {Wahlkreis:
                [
                    {Wahlkreis.wahlkreisName: CSVKey('WKR_NAME', str),
                     Wahlkreis.wahlkreisId: CSVKey('WKR_NR', int),
                     Wahlkreis.bundesland: CSVKey('LAND_ABK', str)
                     }
                ]
            }
        },
    'btwkr21_umrechnung_btw17.csv':
        {
            'format': {
                'csv_file': '../csv_data/btwkr21_umrechnung_btw17.csv',
                'delimiter': ';',
                'ignore_rows': [0, 1, 2, 3, 17, 31, 62, 65, 164, 204, 229, 315, 276, 320, 99, 76, 24, 181, 86, 213, 321,
                                322],
                'header_rows': 2,
            },
            'mapping':
                {ZweitstimmeErgebnisse:
                    [
                        {ZweitstimmeErgebnisse.parteiId: DirectValue[int](party_id),
                         ZweitstimmeErgebnisse.jahr: DirectValue[int](2017),
                         ZweitstimmeErgebnisse.wahlkreisId: CSVKey('Wkr-Nr.', int),
                         ZweitstimmeErgebnisse.anzahlstimmen: CSVKey(f'{abbreviation}; Zweitstimmen', int)
                         } for (party_id, abbreviation, _) in PARTY_MAPPER if party_id < 25
                    ]
                }},
    'kerg.csv':
        {
            'format': {
                'csv_file': '../csv_data/kerg.csv',
                'delimiter': ';',
                'ignore_rows': [0, 1, 16, 17, 24, 25, 32, 33, 64, 65, 68, 69, 80, 81, 91, 92, 105, 106, 171, 172, 189,
                                190, 213, 214, 223, 224, 240, 241, 288, 289, 328, 329, 334, 335, 336],
                'header_rows': 3,
            },
            'mapping':
                {ZweitstimmeErgebnisse:
                    [
                        {ZweitstimmeErgebnisse.parteiId: DirectValue[int](party_id),
                         ZweitstimmeErgebnisse.jahr: DirectValue[int](2021),
                         ZweitstimmeErgebnisse.wahlkreisId: CSVKey('Nr', int),
                         ZweitstimmeErgebnisse.anzahlstimmen: CSVKey(f'{name}; Zweitstimmen; Endgültig', int)
                         } for (party_id, _, name) in PARTY_MAPPER if party_id < 48
                    ]
                }
        },
    'kandidaten_2017.csv':
        {
            'format': {
                'csv_file': '../csv_data/kandidaten_2017.csv',
                'delimiter': ';',
                'ignore_rows': [],
                'header_rows': 1,
            },
            'mapping': {

            }
        },
    'merged_kandidaten.csv': {
        'format': {
            'csv_file': 'merged_kandidaten.csv',
            'delimiter': ',',
            'ignore_rows': [],
            'header_rows': 1,
        },
        'mapping': {
            DirektKandidatur: [
                {DirektKandidatur.kandidatId: (CSVKey('id', float), int),
                 DirektKandidatur.jahr: (CSVKey('Jahr', float), int),
                 DirektKandidatur.wahlkreisId: (CSVKey('WahlkreisNr', float), int),
                 DirektKandidatur.anzahlstimmen: DirectValue[float](0.),
                 }
            ]
        }
    }
}


def create_partei():
    engine = create_engine(DATABASE_URL, echo=True)
    Base.metadata.create_all(engine)
    new_session = sessionmaker(bind=engine)
    with new_session() as session:
        for party in PARTY_MAPPER:
            session.add(Partei(parteiId=party[0], parteiName=party[2], kurzbezeichnung=party[1]))
        session.commit()

def create_bundesland():
    engine = create_engine(DATABASE_URL, echo=True)
    Base.metadata.create_all(engine)
    new_session = sessionmaker(bind=engine)
    with new_session() as session:
        for bd_land in BUNDESLAND_MAPPER:
            session.add(Bundesland(kurzbezeichnung=bd_land[0], name=bd_land[1]))
        session.commit()

def create_bundesland_struktur():
    engine = create_engine(DATABASE_URL, echo=True)
    Base.metadata.create_all(engine)
    new_session = sessionmaker(bind=engine)
    with new_session() as session:
        for bd_land in BUNDESLAND_Struktur_MAPPER:
            session.add(BundeslandStruktur(kurzbezeichnung=bd_land[0], jahr=bd_land[1], bevoelkerung=bd_land[2], flaeche=bd_land[3]))
        session.commit()

if __name__ == '__main__':
    #create_partei()
    #create_bundesland()
    create_bundesland_struktur()
