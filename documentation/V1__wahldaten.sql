CREATE TABLE Partei (
    parteiId integer primary key,
    parteiName varchar(50) not null UNIQUE,
    kurzbezeichnung varchar(10) not null UNIQUE
);

CREATE TABLE Wahlkreis (
    wahlkreisId integer primary key,
    wahlkreisName varchar(50) not null UNIQUE,
    bundesland char(2) check (
        bundesland in ('BW', 'BY', 'BE', 'BB', 'HB', 'HH', 'HE', 'MV',
         'NI', 'NW', 'RP', 'SL', 'SN', 'ST', 'SH', 'TH')),
    anzahlwahlberechtigte integer
);

CREATE TABLE DirektKandidat (
    DKId integer primary key,
    DKName varchar(50) not null,
    parteiId integer references Partei, -- NULL wenn der Kandidat zu keiner Partei gehört
    wahlkreisId integer references Wahlkreis
);

CREATE TABLE StimmZettel (
    StimmzettelId integer primary key,
    jahr integer check (jahr in (2017, 2021, 2025)),
    wahlkreisId integer references Wahlkreis
);

CREATE TABLE Erststimme (
    StimmzettelId integer primary key,
    kandidatId integer references Direktkandidat
);

CREATE TABLE Zweitstimme (
    StimmzettelId integer primary key,
    parteiId integer references Partei not null
);

CREATE TABLE ErststimmeErgebnisse (
    kandidatId integer references Direktkandidat,
    jahr integer,
    anzahlstimmen integer not null,
    primary key (kandidatId, jahr)
);

CREATE TABLE ZweitstimmeErgebnisse (
    parteiId integer references Partei,
    wahlkreisId integer references Wahlkreis,
    jahr integer check (jahr in (2017, 2021, 2025)),
    anzahlstimmen integer not null,
    primary key (parteiId, wahlkreisId, jahr)
);

CREATE TABLE Ergebnisse (
    parteiId integer references Partei,
    jahr integer check (jahr in (2017, 2021, 2025)),
    anzahlSitze integer not null,
    direktMandate integer not null,
    ueberhangsMandate integer not null,
    ausgleichsMandate integer not null,
    primary key (parteiId, jahr)
);