"""added bundesland to parteiliste

Revision ID: ddfe542187d1
Revises: 882cb3e3a880
Create Date: 2024-11-15 16:52:24.063551

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ddfe542187d1'
down_revision: Union[str, None] = '882cb3e3a880'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('ParteiListe', sa.Column('landAbk', sa.String(length=2), nullable=True))
    op.create_foreign_key(None, 'ParteiListe', 'Bundesland', ['landAbk'], ['kurzbezeichnung'])
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, 'ParteiListe', type_='foreignkey')
    op.drop_column('ParteiListe', 'landAbk')
    # ### end Alembic commands ###
