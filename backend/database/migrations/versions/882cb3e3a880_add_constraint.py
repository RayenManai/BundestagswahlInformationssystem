"""add constraint

Revision ID: 882cb3e3a880
Revises: cdab1b2212d7
Create Date: 2024-11-15 00:33:21.817097

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '882cb3e3a880'
down_revision: Union[str, None] = 'cdab1b2212d7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_unique_constraint('Kandidat Unicity', 'Kandidat', ['name', 'vorname', 'geburtsjahr'])
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint('Kandidat Unicity', 'Kandidat', type_='unique')
    # ### end Alembic commands ###
