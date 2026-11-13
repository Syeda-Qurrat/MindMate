"""Server-side safety net for messages that suggest self-harm or suicide.

The AI model is also told how to respond, but a fixed, reviewed reply is more
reliable than hoping the model gets it right, and it does not use any quota.
This is a keyword check, so it will miss indirect wording and can flag harmless
phrases. It is a backstop, not a diagnosis.

Edit CRISIS_REPLY and the helpline numbers for your region.
"""

import re

_PATTERNS = [
    r"\bkill(ing)?\s+(my\s*self|myself)\b",
    r"\b(end|take|ending|taking)\s+(my|my\s+own)\s+life\b",
    r"\bsuicid\w*",
    r"\b(want|wanted|wanna)\s+(to\s+)?die\b",
    r"\bwish\s+i\s+(was|were)\s+(dead|never\s+born)\b",
    r"\bdon'?t\s+want\s+to\s+(live|be\s+alive|exist)\b",
    r"\bno\s+(reason|point)\s+(to|in)\s+(live|living|going\s+on)\b",
    r"\bnothing\s+to\s+live\s+for\b",
    r"\b(hurt|harm|cut|cutting|injure|injuring)\s+(my\s*self|myself)\b",
    r"\bself[\s-]?harm\w*",
    r"\bend\s+it\s+all\b",
    r"\bbetter\s+off\s+(dead|without\s+me)\b",
    # Hindi / Hinglish
    r"\bmarna\s+chah(ta|ti|te)\b",
    r"\bjeena\s+nahi\s+chah(ta|ti)\b",
    r"\bjeene\s+ka\s+(mann|man)\s+nahi\b",
    r"\b(khud\s?kushi|a{1,2}tma?\s?hatya)\b",
]

_SUBSTRINGS = ["आत्महत्या", "मरना चाहत", "जीना नहीं चाहत"]

_COMPILED = [re.compile(pattern, re.IGNORECASE) for pattern in _PATTERNS]

CRISIS_REPLY = """I'm really glad you told me, and I'm so sorry you're hurting this much. 💜 What you're feeling matters, and you deserve support from a real person right now.

**If you might act on these thoughts, or you are in immediate danger, please call your local emergency number (112 in India) or go to the nearest hospital, and try not to be alone.**

**You can also talk to someone right now, free and confidential:**
- Tele-MANAS (India, 24/7): **14416** or **1-800-891-4416**

If you can, please tell someone close to you, such as a friend, family member, hostel warden or counsellor, how you feel and ask them to stay with you.

I'm an AI, so I can't replace that kind of help, but I'm here and I'll keep listening. Are you safe right now? And if I've misunderstood you, just tell me."""


def detect_crisis(text: str) -> bool:
    normalized = " ".join(text.lower().replace("\u2019", "'").split())

    if any(re.search(pattern, normalized) for pattern in _COMPILED):
        return True

    return any(fragment in normalized for fragment in _SUBSTRINGS)