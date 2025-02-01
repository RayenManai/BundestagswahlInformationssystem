import hashlib
import traceback
import uuid
import threading
import heapq
from datetime import datetime, timedelta


from sqlalchemy import create_engine, insert, select
from sqlalchemy.orm import sessionmaker

from backend.databases.voting.config import DATABASE_URL as TOKEN_DB_URL
from backend.databases.voting.models import ValideToken, VerbrauchteToken

class TokenManager:

    def __init__(self, token_lifetime=1):
        self.__SECRET_KEY__ = uuid.uuid4().hex
        self._token_queue = []
        self._lock = threading.Lock()
        self._condition = threading.Condition(self._lock)
        self._voting_engine = create_engine(TOKEN_DB_URL, echo=True)
        self._new_voting_session = sessionmaker(bind=self._voting_engine)
        self._TOKEN_LIFE = token_lifetime
        threading.Thread(target=self.__main__, daemon=True).start()

    def generate_uvt(self, voter_id):
        """
        Generate a unique voter token (UVT) for the voter.
        Args:
            voter_id (str): Unique identifier of the voter.
        Returns:
            str: A unique voter token.
        """
        # Generate a random nonce to ensure uniqueness
        nonce = uuid.uuid4().hex

        # Generate a token using a hash
        raw_data = f"{voter_id}|{self.__SECRET_KEY__ }|{nonce}"
        token = hashlib.sha256(raw_data.encode()).hexdigest()
        return token

    def add_token(self, token, wahlkreis) -> bool:
        try:
            with self._new_voting_session() as session:
                start = datetime.now()
                end = start + timedelta(minutes=self._TOKEN_LIFE)
                with self._lock:
                    heapq.heappush(self._token_queue, (end, token))
                    self._condition.notify()
                session.add(
                    ValideToken(id=token, generiertAm=start, gueltigBis=end, wahlkreis=wahlkreis)
                )
                session.commit()
            return True
        except:
            traceback.print_stack()
            return False

    def invalidate_token(self, token: str) -> bool:
        try:
            i = 0
            while i < len(self._token_queue):
                if self._token_queue[i][1] == token:
                    break
            self._token_queue.pop(i)
            heapq.heapify(self._token_queue)
            with self._new_voting_session() as session:
                session.query(ValideToken).filter(ValideToken.id == token).delete()
                session.add(VerbrauchteToken(id=token))
                session.commit()
            return True
        except Exception as e:
            raise e
            return False

    def token_wahlkreis(self, token: str) -> int | None:
        with self._new_voting_session() as session:
            result = session.query(ValideToken).filter(ValideToken.id == token)
        token_entry = result.one_or_none()
        if token_entry is None:
            return None
        return token_entry.wahlkreis

    def _remove_expired_tokens(self):
        """Removes expired tokens from the queue."""
        now = datetime.now()
        invalid_tokens = []
        while self._token_queue and self._token_queue[0][0] <= now:
            invalid_tokens.append(heapq.heappop(self._token_queue)[1])
        with self._new_voting_session() as session:
            session.execute(insert(VerbrauchteToken).from_select(
                [ValideToken.id], select(ValideToken.id).where(ValideToken.gueltigBis <= now)))
            session.query(ValideToken).filter(ValideToken.gueltigBis <= now).delete()
            session.commit()

    def __main__(self):
        self._remove_expired_tokens()
        while True:
            with self._condition:
                while not self._token_queue:
                    self._condition.wait()  # Wait until a token is added

                # Calculate the time until the next token expires
                now = datetime.now()
                next_expiration = self._token_queue[0][0]
                timeout = (next_expiration - now).total_seconds()

                if timeout > 0:
                    self._condition.wait(timeout=timeout)

            # Remove expired tokens after waking up
            with self._lock:
                self._remove_expired_tokens()