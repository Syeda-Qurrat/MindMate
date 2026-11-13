import math
import threading
import time
from collections import defaultdict, deque


class SlidingWindowRateLimiter:
    """Allows at most `max_calls` per `window_seconds` for each key (e.g. a user id).

    In-memory, so limits are per server process and reset when it restarts.
    That is enough to stop a single account from draining the Groq quota.
    """

    def __init__(self, max_calls: int, window_seconds: float = 60.0, clock=time.monotonic):
        self.max_calls = max_calls
        self.window = window_seconds
        self._clock = clock
        self._calls: dict[str, deque] = defaultdict(deque)
        self._lock = threading.Lock()
        self._hits = 0

    def hit(self, key: str) -> int:
        """Records a call. Returns 0 if allowed, otherwise the seconds to wait."""
        now = self._clock()

        with self._lock:
            self._hits += 1
            if self._hits % 500 == 0:
                self._cleanup(now)

            calls = self._calls[key]

            while calls and now - calls[0] >= self.window:
                calls.popleft()

            if len(calls) >= self.max_calls:
                return max(1, math.ceil(self.window - (now - calls[0])))

            calls.append(now)
            return 0

    def _cleanup(self, now: float) -> None:
        stale = [
            key for key, calls in self._calls.items()
            if not calls or now - calls[-1] >= self.window
        ]
        for key in stale:
            del self._calls[key]