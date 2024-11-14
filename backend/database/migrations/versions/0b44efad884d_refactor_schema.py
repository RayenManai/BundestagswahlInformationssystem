"""refactor_schema

Revision ID: 0b44efad884d
Revises: 
Create Date: 2024-11-14 21:37:13.417910

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0b44efad884d'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('Bundesland',
    sa.Column('kurzbezeichnung', sa.String(length=2), nullable=False),
    sa.Column('name', sa.String(length=100), nullable=False),
    sa.PrimaryKeyConstraint('kurzbezeichnung'),
    sa.UniqueConstraint('name')
    )
    op.create_table('Partei',
    sa.Column('parteiId', sa.Integer(), nullable=False),
    sa.Column('parteiName', sa.String(length=100), nullable=False),
    sa.Column('kurzbezeichnung', sa.String(length=25), nullable=False),
    sa.PrimaryKeyConstraint('parteiId'),
    sa.UniqueConstraint('kurzbezeichnung'),
    sa.UniqueConstraint('parteiName')
    )
    op.create_table('BundeslandStruktur',
    sa.Column('kurzbezeichnung', sa.String(length=2), nullable=False),
    sa.Column('jahr', sa.Integer(), nullable=False),
    sa.Column('bevoelkerung', sa.Integer(), nullable=True),
    sa.Column('flaeche', sa.Float(), nullable=True),
    sa.ForeignKeyConstraint(['kurzbezeichnung'], ['Bundesland.kurzbezeichnung'], ),
    sa.PrimaryKeyConstraint('kurzbezeichnung', 'jahr')
    )
    op.create_table('Ergebnisse',
    sa.Column('parteiId', sa.Integer(), nullable=False),
    sa.Column('jahr', sa.Integer(), nullable=False),
    sa.Column('anzahlSitze', sa.Integer(), nullable=False),
    sa.Column('direktMandate', sa.Integer(), nullable=False),
    sa.Column('ueberhangsMandate', sa.Integer(), nullable=False),
    sa.Column('ausgleichsMandate', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['parteiId'], ['Partei.parteiId'], ),
    sa.PrimaryKeyConstraint('parteiId', 'jahr')
    )
    op.create_table('Kandidat',
    sa.Column('kandidatId', sa.Integer(), nullable=False),
    sa.Column('titel', sa.String(length=15), nullable=True),
    sa.Column('name', sa.String(length=100), nullable=False),
    sa.Column('vorname', sa.String(length=100), nullable=False),
    sa.Column('parteiId', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['parteiId'], ['Partei.parteiId'], ),
    sa.PrimaryKeyConstraint('kandidatId')
    )
    op.create_table('Wahlkreis',
    sa.Column('wahlkreisId', sa.Integer(), nullable=False),
    sa.Column('wahlkreisName', sa.String(length=100), nullable=False),
    sa.Column('bundesland', sa.String(length=2), nullable=True),
    sa.ForeignKeyConstraint(['bundesland'], ['Bundesland.kurzbezeichnung'], ),
    sa.PrimaryKeyConstraint('wahlkreisId'),
    sa.UniqueConstraint('wahlkreisName')
    )
    op.create_table('DirektKandidatur',
    sa.Column('kandidaturId', sa.Integer(), nullable=False),
    sa.Column('kandidatId', sa.Integer(), nullable=True),
    sa.Column('wahlkreisId', sa.Integer(), nullable=True),
    sa.Column('jahr', sa.Integer(), nullable=True),
    sa.Column('anzahlstimmen', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['kandidatId'], ['Kandidat.kandidatId'], ),
    sa.ForeignKeyConstraint(['wahlkreisId'], ['Wahlkreis.wahlkreisId'], ),
    sa.PrimaryKeyConstraint('kandidaturId')
    )
    op.create_table('ParteiListe',
    sa.Column('parteiId', sa.Integer(), nullable=True),
    sa.Column('jahr', sa.Integer(), nullable=False),
    sa.Column('kandidatId', sa.Integer(), nullable=False),
    sa.Column('listenPlatz', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['kandidatId'], ['Kandidat.kandidatId'], ),
    sa.ForeignKeyConstraint(['parteiId'], ['Partei.parteiId'], ),
    sa.PrimaryKeyConstraint('jahr', 'kandidatId')
    )
    op.create_table('WalhkreisWahlInfo',
    sa.Column('walhkreisId', sa.Integer(), nullable=False),
    sa.Column('jahr', sa.Integer(), nullable=False),
    sa.Column('anzahlWahlBerechtigte', sa.Integer(), nullable=False),
    sa.Column('anzahlWaehlende', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['walhkreisId'], ['Wahlkreis.wahlkreisId'], ),
    sa.PrimaryKeyConstraint('walhkreisId', 'jahr')
    )
    op.create_table('ZweitstimmeErgebnisse',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('jahr', sa.Integer(), nullable=True),
    sa.Column('parteiId', sa.Integer(), nullable=True),
    sa.Column('wahlkreisId', sa.Integer(), nullable=True),
    sa.Column('anzahlstimmen', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['parteiId'], ['Partei.parteiId'], ),
    sa.ForeignKeyConstraint(['wahlkreisId'], ['Wahlkreis.wahlkreisId'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('Erststimme',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('kanditaturId', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['kanditaturId'], ['DirektKandidatur.kandidaturId'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('Zweitstimme',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('ZSErgebnisId', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['ZSErgebnisId'], ['ZweitstimmeErgebnisse.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('Zweitstimme')
    op.drop_table('Erststimme')
    op.drop_table('ZweitstimmeErgebnisse')
    op.drop_table('WalhkreisWahlInfo')
    op.drop_table('ParteiListe')
    op.drop_table('DirektKandidatur')
    op.drop_table('Wahlkreis')
    op.drop_table('Kandidat')
    op.drop_table('Ergebnisse')
    op.drop_table('BundeslandStruktur')
    op.drop_table('Partei')
    op.drop_table('Bundesland')
    # ### end Alembic commands ###