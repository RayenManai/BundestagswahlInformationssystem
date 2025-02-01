from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class Waehler(Base):
    __tablename__ = 'waehler'
    waehlerId = Column(String(64), primary_key=True) # hashed value of the id

class ValideToken(Base):
    __tablename__ = 'validetoken'
    id = Column(String(64), primary_key=True)
    generiertAm = Column(DateTime, nullable=False)
    gueltigBis = Column(DateTime, nullable=True)
    wahlkreis = Column(Integer, nullable=False)

class VerbrauchteToken(Base):
    __tablename__ = 'verbrauchtetoken'
    id = Column(String(64), primary_key=True)

class Erststimme(Base):
    __tablename__ = 'erststimme'
    id = Column(Integer, primary_key=True)
    kandidaturId = Column(Integer, nullable=False)

class Zweitstimme(Base):
    __tablename__ = 'zweitstimme'
    id = Column(Integer, primary_key=True)
    ZSErgebnisId = Column(Integer, nullable=False)