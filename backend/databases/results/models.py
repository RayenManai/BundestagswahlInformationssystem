from sqlalchemy import Column, Integer, String, ForeignKey, CheckConstraint, Float, ForeignKeyConstraint, \
    UniqueConstraint
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class Partei(Base):
    __tablename__ = 'Partei'
    parteiId = Column(Integer, primary_key=True)
    parteiName = Column(String(100), nullable=False, unique=True)
    kurzbezeichnung = Column(String(25), nullable=False, unique=True)


class Wahlkreis(Base):
    __tablename__ = 'Wahlkreis'
    wahlkreisId = Column(Integer, primary_key=True)
    wahlkreisName = Column(String(100), nullable=False, unique=True)
    bundesland = Column(String(2), ForeignKey('Bundesland.kurzbezeichnung'))

class WahlkreisInfo(Base):
    __tablename__ = 'WahlkreisInfo'
    wahlkreisId = Column(Integer, ForeignKey('Wahlkreis.wahlkreisId'), primary_key=True)
    jahr = Column(Integer, primary_key=True)
    anzahlWahlBerechtigte = Column(Integer, nullable=False)
    anzahlWaehlende = Column(Integer, nullable=False)
    flaeche = Column(Float, nullable=False)  # km2
    bevoelkerung = Column(Float, nullable=False)  # in 1000
    auslaender_percent = Column(Float, nullable=False)
    alter_unter_18 = Column(Float, nullable=False)  # percent
    alter_18_24 = Column(Float, nullable=False)
    alter_25_34 = Column(Float, nullable=False)
    alter_35_59 = Column(Float, nullable=False)
    alter_60_74 = Column(Float, nullable=False)
    alter_75_mehr = Column(Float, nullable=False)
    pkw_bestand = Column(Float, nullable=False)  # je 1000 EW
    pkw_elektro_hybrid = Column(Float, nullable=False)  # percent
    bruttoinlandsprodukt = Column(Float, nullable=False)  # EUR je EW
    arbeitslosenquote = Column(Float, nullable=False)

class Bundesland(Base):
    __tablename__ = 'Bundesland'
    kurzbezeichnung = Column(String(2), CheckConstraint(
        "kurzbezeichnung in ('BW', 'BY', 'BE', 'BB', 'HB', 'HH', 'HE', 'MV', 'NI', 'NW', 'RP', 'SL', 'SN', 'ST', 'SH', 'TH')"),
                             primary_key=True)
    name = Column(String(100), nullable=False, unique=True)

class BundeslandStruktur(Base):
    __tablename__ = 'BundeslandStruktur'
    kurzbezeichnung = Column(String(2), ForeignKey('Bundesland.kurzbezeichnung'), primary_key=True)
    jahr= Column(Integer, primary_key=True)
    bevoelkerung = Column(Integer)
    flaeche = Column(Float)


class Kandidat(Base):
    __tablename__ = 'Kandidat'
    kandidatId = Column(Integer, primary_key=True)
    titel = Column(String(15))
    name = Column(String(100), nullable=False)
    geburtsjahr  = Column(Integer, nullable=False)
    vorname = Column(String(100), nullable=False)
    parteiId = Column(Integer, ForeignKey('Partei.parteiId'))
    __table_args__ = (
        UniqueConstraint('name', 'vorname', 'geburtsjahr', name='Kandidat Unicity'),
    )


class DirektKandidatur(Base):
    __tablename__ = 'DirektKandidatur'
    kandidaturId = Column(Integer, primary_key=True)
    kandidatId = Column(Integer, ForeignKey('Kandidat.kandidatId'))
    wahlkreisId = Column(Integer, ForeignKey('Wahlkreis.wahlkreisId'))
    jahr = Column(Integer)
    anzahlstimmen = Column(Integer, nullable=False)


class ParteiListe(Base):
    __tablename__ = 'ParteiListe'
    parteiId = Column(Integer, ForeignKey('Partei.parteiId'))
    jahr = Column(Integer, primary_key=True)
    kandidatId = Column(Integer, ForeignKey('Kandidat.kandidatId'), primary_key=True)
    listenPlatz = Column(Integer)
    landAbk = Column(String(2), ForeignKey('Bundesland.kurzbezeichnung'))


class Erststimme(Base):
    __tablename__ = 'Erststimme'
    id = Column(Integer, primary_key=True)
    kanditaturId = Column(Integer, ForeignKey('DirektKandidatur.kandidaturId'))

class Zweitstimme(Base):
    __tablename__ = 'Zweitstimme'
    id = Column(Integer, primary_key=True)
    ZSErgebnisId = Column(Integer, ForeignKey('ZweitstimmeErgebnisse.id'))

class ZweitstimmeErgebnisse(Base):
    __tablename__ = 'ZweitstimmeErgebnisse'
    id = Column(Integer, primary_key=True)
    jahr = Column(Integer)
    parteiId = Column(Integer, ForeignKey('Partei.parteiId'))
    wahlkreisId = Column(Integer, ForeignKey('Wahlkreis.wahlkreisId'))
    anzahlstimmen = Column(Integer, nullable=False)

class Ergebnisse(Base):
    __tablename__ = 'Ergebnisse'
    parteiId = Column(Integer, ForeignKey('Partei.parteiId'), primary_key=True)
    jahr = Column(Integer, CheckConstraint("jahr in (2017, 2021, 2025)"), primary_key=True)
    anzahlSitze = Column(Integer, nullable=False)
    direktMandate = Column(Integer, nullable=False)
    ueberhangsMandate = Column(Integer, nullable=False)
    ausgleichsMandate = Column(Integer, nullable=False)


class Landesergebnisse(Base):
    __tablename__ = 'Landesergebnisse'
    parteiId = Column(Integer, ForeignKey('Partei.parteiId'), primary_key=True)
    bundesland = Column(String(2), ForeignKey('Bundesland.kurzbezeichnung'), primary_key=True)
    jahr = Column(Integer, primary_key=True)
    sitze = Column(Integer)
    ueberhang = Column(Integer)
    direktMandate = Column(Integer)


class Gewaehlte_direkt_kandidaten(Base):
    __tablename__ = 'Gewaehlte_direkt_kandidaten'
    kandidaturId = Column(Integer, ForeignKey('DirektKandidatur.kandidaturId'), primary_key=True)
    parteiId = Column(Integer, ForeignKey('Partei.parteiId'))
    gewonnene_stimmen = Column(Integer, nullable=False)
