"""Firebase ID-token verification.

The React app sends the signed-in user's Firebase ID token as
`Authorization: Bearer <token>`. We verify its signature against Google's
public certificates and check the audience and issuer, so only people who are
logged in to MindMate can use the AI endpoint (and spend Groq quota).
"""

import logging
import threading
import time

import requests
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from google.auth import jwt

from app.config import settings

logger = logging.getLogger("mindmate.auth")

CERTS_URL = (
    "https://www.googleapis.com/robot/v1/metadata/x509/"
    "securetoken@system.gserviceaccount.com"
)
CERTS_TTL_SECONDS = 3600

_cache: dict = {"certs": None, "fetched_at": 0.0}
_lock = threading.Lock()

bearer_scheme = HTTPBearer(auto_error=False)


class InvalidTokenError(Exception):
    """The token is missing, malformed, expired or not for this project."""


class AuthUnavailableError(Exception):
    """We could not fetch Google's certificates to check the token."""


def _fetch_certs() -> dict:
    response = requests.get(CERTS_URL, timeout=5)
    response.raise_for_status()
    return response.json()


def _get_certs(force_refresh: bool = False) -> dict:
    with _lock:
        expired = time.time() - _cache["fetched_at"] > CERTS_TTL_SECONDS

        if force_refresh or _cache["certs"] is None or expired:
            try:
                _cache["certs"] = _fetch_certs()
                _cache["fetched_at"] = time.time()
            except requests.RequestException as error:
                # Fall back to older certificates if we have them.
                if _cache["certs"] is None:
                    raise AuthUnavailableError(str(error)) from error
                logger.warning("Could not refresh Google certificates; using cached copy.")

        return _cache["certs"]


def verify_firebase_token(token: str) -> dict:
    """Returns the token's claims, or raises InvalidTokenError."""
    project_id = settings.FIREBASE_PROJECT_ID
    claims = None

    # Google rotates its keys, so if the key id is unknown try fresh certificates once.
    for force_refresh in (False, True):
        certs = _get_certs(force_refresh)

        try:
            claims = jwt.decode(
                token,
                certs=certs,
                audience=project_id,
                clock_skew_in_seconds=10,
            )
            break
        except ValueError as error:
            if force_refresh:
                raise InvalidTokenError(str(error)) from error

    if claims.get("iss") != f"https://securetoken.google.com/{project_id}":
        raise InvalidTokenError("Wrong token issuer.")

    subject = claims.get("sub")
    if not isinstance(subject, str) or not subject or len(subject) > 128:
        raise InvalidTokenError("Token has no valid subject.")

    return claims


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> dict:
    """FastAPI dependency: returns the verified token claims (claims['sub'] is the user id)."""
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=401,
            detail="Please log in to use MindMate.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        return verify_firebase_token(credentials.credentials)
    except InvalidTokenError:
        raise HTTPException(
            status_code=401,
            detail="Your session has expired. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except AuthUnavailableError:
        logger.error("Could not reach Google to verify a login token.")
        raise HTTPException(
            status_code=503,
            detail="We could not verify your login right now. Please try again.",
        )