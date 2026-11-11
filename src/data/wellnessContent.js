// Written content for the Wellness page. General self-care guidance only -
// not medical advice.

export const CATEGORIES = [
  {
    id: 'breathing',
    label: 'Breathing',
    intro:
      'Slow breathing with a longer exhale is one of the quickest ways to calm a racing body. Practise when you are calm, so it is easy to reach for when you are not.',
    tips: [
      { title: 'Make the exhale longer', body: 'Breathing out for longer than you breathe in signals your body that it is safe to slow down.' },
      { title: 'Breathe low and gentle', body: 'Let your belly rise and fall. Breathe through your nose if you can, and never force or strain.' },
      { title: 'Practise before you need it', body: 'Two minutes a day builds the habit, so it works better on the morning of an exam or presentation.' },
      { title: 'Stop if it feels wrong', body: 'If you feel dizzy or tingly, return to normal breathing. Calm breathing is the gentlest option.' }
    ]
  },
  {
    id: 'stress',
    label: 'Stress management',
    intro:
      'Stress is easier to handle when you can see what is actually in your hands. Start by sorting the problem, then take one small step.',
    tips: [
      { title: 'Shrink the task', body: 'Write the next action so small you could start it in 10 minutes. Starting reduces dread more than planning does.' },
      { title: 'Sort what you can control', body: 'Spend your energy on what you can influence, and practise letting go of the rest. The tool above walks you through it.' },
      { title: 'Move for 10 minutes', body: 'A brisk walk, a stretch or a dance break helps your body burn off stress and gives your mind a reset.' },
      { title: 'Name the feeling', body: 'Saying "I feel overwhelmed because..." out loud or on paper often takes the edge off.' },
      { title: 'Talk before it piles up', body: 'Tell a friend, family member, mentor or counsellor. Stress shrinks when it is shared.' },
      { title: 'Watch the stress fuel', body: 'Lots of caffeine, doom-scrolling and skipped meals can make you feel more wired and anxious.' }
    ]
  },
  {
    id: 'mindfulness',
    label: 'Mindfulness',
    intro:
      'Mindfulness means noticing what is happening right now without judging it. A minute at a time is plenty.',
    tips: [
      { title: 'Try the STOP pause', body: 'Stop. Take a breath. Observe what you feel and think. Proceed with one small, kind choice.' },
      { title: 'Do one thing at a time', body: 'Single-tasking, such as reading without your phone, trains your attention and lowers mental clutter.' },
      { title: 'Walk mindfully', body: 'On your way to class, notice your feet touching the ground and the sounds around you for two minutes.' },
      { title: 'Notice thoughts as thoughts', body: 'Try "I am having the thought that I will fail". It creates a little distance from the worry.' },
      { title: 'Short and daily wins', body: 'Five minutes every day does more for you than one long session once in a while.' }
    ]
  },
  {
    id: 'sleep',
    label: 'Sleep',
    intro:
      'Good sleep supports mood, memory and focus. Most adults do best with about 7 to 9 hours, and a steady routine matters as much as the total.',
    tips: [
      { title: 'Keep a steady wake time', body: 'Try to wake within an hour of the same time every day, including weekends.' },
      { title: 'Get morning light', body: 'Ten minutes of daylight soon after waking helps set your body clock.' },
      { title: 'Cut caffeine early', body: 'Caffeine can linger for many hours. Try to stop about 8 hours before bed.' },
      { title: 'Dim down', body: 'Lower lights and put screens away 30 to 60 minutes before bed. Keep the room cool, dark and quiet.' },
      { title: "Don't fight the night", body: 'If you are awake for 20 minutes or more, get up, do something calm in dim light, and go back when sleepy.' },
      { title: 'Keep naps short', body: 'A nap of 20 to 30 minutes before mid-afternoon refreshes you without stealing night sleep. All-nighters usually backfire on memory and focus.' }
    ]
  },
  {
    id: 'study',
    label: 'Study-life balance',
    intro:
      'Rest is part of studying, not a reward for finishing. A balanced week protects both your grades and your wellbeing.',
    tips: [
      { title: 'Work in focused blocks', body: 'Use the timer above: a focused stretch, then a real break away from your phone.' },
      { title: 'Schedule rest like a class', body: 'Put exercise, meals, friends and downtime in your calendar so study does not swallow them.' },
      { title: 'Plan tomorrow tonight', body: 'Write your top three priorities before bed. Your mind can stop rehearsing them.' },
      { title: 'Space it out', body: 'Short, repeated revision sessions beat last-minute cramming for lasting memory.' },
      { title: 'Good enough is enough', body: 'Save your best effort for what matters most. Low-stakes tasks do not need perfection.' },
      { title: 'Ask early', body: 'If a deadline is out of reach, talk to your teacher or mentor sooner rather than later.' }
    ]
  },
  {
    id: 'selfcare',
    label: 'Self-care',
    intro:
      'Self-care is not just treats. It is the everyday basics, plus small things that make you feel like yourself.',
    tips: [
      { title: 'Basics first', body: 'Sleep, regular meals, water, movement and daylight carry more weight than any hack.' },
      { title: 'Schedule one small joy', body: 'Music, a hobby, a chat with a friend. Put it in your day on purpose.' },
      { title: 'Reach out to one person', body: 'A short message or call can lift both of you. Connection is a core need, not a luxury.' },
      { title: 'Go easy on scrolling', body: 'Constant comparison with other people\'s highlights can lower how you feel about your own life.' },
      { title: 'Speak to yourself kindly', body: 'Talk to yourself the way you would talk to a friend having the same bad day.' }
    ]
  }
]

export const GROUNDING_STEPS = [
  { count: 5, sense: 'see', prompt: 'Look around and notice 5 things you can see.', hint: 'A pen, the light on the wall, a plant, your hands...' },
  { count: 4, sense: 'feel', prompt: 'Notice 4 things you can feel.', hint: 'Your feet on the floor, the chair under you, the fabric of your clothes...' },
  { count: 3, sense: 'hear', prompt: 'Listen for 3 things you can hear.', hint: 'Traffic, a fan, voices, your own breathing...' },
  { count: 2, sense: 'smell', prompt: 'Notice 2 things you can smell.', hint: 'Coffee, soap, fresh air. If nothing, recall a smell you like.' },
  { count: 1, sense: 'taste', prompt: 'Notice 1 thing you can taste.', hint: 'Take a sip of water, or notice the taste in your mouth.' }
]

export const MINDFUL_PROMPTS = [
  'Settle into a comfortable position. Let your shoulders drop.',
  'Notice your breath as it is. There is nothing to change.',
  'Feel where your body touches the chair or floor.',
  'If your mind wanders, that is normal. Gently bring it back to your breath.',
  'Notice any sounds around you without labelling them as good or bad.',
  'Soften your jaw, your forehead and your hands.',
  'Take one slow breath in, and a long breath out.'
]

export const SLEEP_CHECKLIST = [
  'Set a steady alarm for tomorrow',
  'My last caffeine was at least 8 hours ago',
  'Phone on silent and away from the bed',
  'Lights and screens dimmed',
  "Wrote down tomorrow's top three tasks",
  'Room is cool, dark and quiet',
  '5 minutes of slow breathing or gentle stretching'
]

export const SELF_CARE_MENU = [
  {
    id: 'short',
    label: '5 minutes',
    ideas: [
      'Drink a glass of water and stretch your arms and neck',
      'Step outside for fresh air and daylight',
      'Send a kind message to a friend',
      'Tidy one small corner of your desk',
      'Write down three things that went okay today'
    ]
  },
  {
    id: 'medium',
    label: '15 minutes',
    ideas: [
      'Go for a short walk without your phone',
      'Take a warm shower and reset',
      'Listen to a favourite playlist, start to finish',
      'Journal about what is on your mind',
      'Cook or prepare a simple, nourishing snack'
    ]
  },
  {
    id: 'long',
    label: '30+ minutes',
    ideas: [
      'Call someone from home',
      'Play a sport or work out',
      'Spend time on a hobby you enjoy',
      'Meet a friend for tea or a meal',
      'Spend time in a park or somewhere green'
    ]
  }
]

// Edit these for your region. Verified: Tele-MANAS is India's free, 24/7
// government mental health helpline (14416 or 1-800-891-4416).
export const HELP_RESOURCES = {
  warningSigns: [
    'Feeling very low, anxious or hopeless most days for two weeks or more',
    'Panic attacks, or worry that gets in the way of daily life',
    'Trouble sleeping, eating or studying that does not improve',
    'Any thoughts of harming yourself or ending your life'
  ],
  contacts: [
    {
      name: 'Tele-MANAS (India)',
      detail: 'Free, confidential mental health support, 24/7, in many languages.',
      phone: '14416',
      altPhone: '1-800-891-4416'
    },
    {
      name: 'Emergency services (India)',
      detail: 'If you or someone else is in immediate danger.',
      phone: '112'
    }
  ]
}