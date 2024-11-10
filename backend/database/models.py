from sqlalchemy import Column, Integer, String, ForeignKey, CheckConstraint
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
    bundesland = Column(String(2), CheckConstraint("bundesland in ('BW', 'BY', 'BE', 'BB', 'HB', 'HH', 'HE', 'MV', 'NI', 'NW', 'RP', 'SL', 'SN', 'ST', 'SH', 'TH')"))
    anzahlwahlberechtigte = Column(Integer)

class DirektKandidat(Base):
    __tablename__ = 'DirektKandidat'
    DKId = Column(Integer, primary_key=True)
    DKName = Column(String(100), nullable=False)
    parteiId = Column(Integer, ForeignKey('Partei.parteiId'))
    wahlkreisId = Column(Integer, ForeignKey('Wahlkreis.wahlkreisId'))

class StimmZettel(Base):
    __tablename__ = 'StimmZettel'
    StimmzettelId = Column(Integer, primary_key=True)
    jahr = Column(Integer, CheckConstraint("jahr in (2017, 2021, 2025)"))
    wahlkreisId = Column(Integer, ForeignKey('Wahlkreis.wahlkreisId'))

class Erststimme(Base):
    __tablename__ = 'Erststimme'
    StimmzettelId = Column(Integer, primary_key=True)
    kandidatId = Column(Integer, ForeignKey('DirektKandidat.DKId'))

class Zweitstimme(Base):
    __tablename__ = 'Zweitstimme'
    StimmzettelId = Column(Integer, primary_key=True)
    parteiId = Column(Integer, ForeignKey('Partei.parteiId'), nullable=False)

class ErststimmeErgebnisse(Base):
    __tablename__ = 'ErststimmeErgebnisse'
    kandidatId = Column(Integer, ForeignKey('DirektKandidat.DKId'), primary_key=True)
    jahr = Column(Integer, primary_key=True)
    anzahlstimmen = Column(Integer, nullable=False)

class ZweitstimmeErgebnisse(Base):
    __tablename__ = 'ZweitstimmeErgebnisse'
    parteiId = Column(Integer, ForeignKey('Partei.parteiId'), primary_key=True)
    wahlkreisId = Column(Integer, ForeignKey('Wahlkreis.wahlkreisId'), primary_key=True)
    jahr = Column(Integer, CheckConstraint("jahr in (2017, 2021, 2025)"), primary_key=True)
    anzahlstimmen = Column(Integer, nullable=False)

class Ergebnisse(Base):
    __tablename__ = 'Ergebnisse'
    parteiId = Column(Integer, ForeignKey('Partei.parteiId'), primary_key=True)
    jahr = Column(Integer, CheckConstraint("jahr in (2017, 2021, 2025)"), primary_key=True)
    anzahlSitze = Column(Integer, nullable=False)
    direktMandate = Column(Integer, nullable=False)
    ueberhangsMandate = Column(Integer, nullable=False)
    ausgleichsMandate = Column(Integer, nullable=False)
