# Goal

Minimalistic web app with metronome like functionality to practice golf swing timing.

# Code style

- Type safety: Strong emphasis on type-safe patterns.
- Minimalistic: Avoid unnecessary code bloat as much as possible / keep things as minimal as possible.
  This includes: no excessive defensive programming; minimalistic code commenting; code repetitions should be recognized early and refactored to avoid the repetition; look for existing solutions; etc.

# AI behavior rules

ASK FOR FEEDBACK FREQUENTLY!

Whenever there is an important decision to make, first explain the options you see, and ask me which one to pick.
Never take such a decision yourself and set off on a long implementation path without an upfront approval.

After each implementation iteration use `npm run check-all` to verify nothing broke.

Keep your summary of what you did short.
Our working style should be that I know what you'll do beforehand, so I don't need lengthy summaries.
In particular, avoid praising your solution too much.

IMPORTANT when changing your approach (e.g. because an initial attempt failed):

- TELL ME ABOUT IT. Don't silently do something else!
- Be very mindful of CLEANING UP the left-overs of the unsuccessful approach. We must not leave around dead left-overs from things that became obsolete.
