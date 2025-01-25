from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class Waehler(Base):
    __tablename__ = 'waehler'
    waehlerId = Column(String(64), primary_key=True) # hashed value of the id
    # gewaehlt = Column(Boolean, nullable=False)
    # wahlkreis = Column(Integer, nullable=False)
    # __table_args__ = (
    #     CheckConstraint('wahlkreis BETWEEN 1 AND 299', name='check_wahlkreis_range'),
    # )

class ValideToken(Base):
    __tablename__ = 'validetoken'
    id = Column(String(64), primary_key=True)
    generiertAm = Column(DateTime, nullable=False)
    gueltigBis = Column(DateTime, nullable=True)
    wahlkreis = Column(Integer, nullable=False)

class VerbrauchteToken(Base):
    __tablename__ = 'verbrauchtetoken'
    id = Column(String(64), primary_key=True)