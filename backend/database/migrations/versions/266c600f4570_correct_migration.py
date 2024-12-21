"""Correct migration

Revision ID: 266c600f4570
Revises: ddfe542187d1
Create Date: 2024-12-19 11:39:26.894753

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '266c600f4570'
down_revision: Union[str, None] = 'ddfe542187d1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('Landesergebnisse',
    sa.Column('parteiId', sa.Integer(), nullable=False),
    sa.Column('bundesland', sa.String(length=2), nullable=False),
    sa.Column('jahr', sa.Integer(), nullable=False),
    sa.Column('sitze', sa.Integer(), nullable=True),
    sa.Column('ueberhang', sa.Integer(), nullable=True),
    sa.Column('direktMandate', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['bundesland'], ['Bundesland.kurzbezeichnung'], ),
    sa.ForeignKeyConstraint(['parteiId'], ['Partei.parteiId'], ),
    sa.PrimaryKeyConstraint('parteiId', 'bundesland', 'jahr')
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('Landesergebnisse')
    # ### end Alembic commands ###