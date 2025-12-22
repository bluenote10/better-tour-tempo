Remember to look into @.plan/project_scope.md to keep the project scope in mind.

Now it's time to introduce the golf specific interface.

I've prepared two sequence generators in `default-sequence.ts`: `create2To1RatioSequence` and `create3To1RatioSequence`.

Some background for better understanding:
The sequence contain essentially 3 (major) clicks:

- 1st click is start of backswing (golf club starts moving backward)
- 2nd click is start of forward swing (golf club is at top position and the actual forward swing starts)
- 3rd click is time of impact (golf club hits ball)

There are in general 2 modes to practice depending on the ratio of the backward swing time in relation to the forward swing time:
They are either in a 2:1 or 3:1 ratio.

So the UI first needs a kind of combobox or switch to allow for switching between 2:1 and 3:1 modes.
Note that 3:1 is actually more common to practice, and thus, should be the default in the app.

We will then have 2 sliders for:

- backward swing time
- forward swing time

They both should show the time in milliseconds.
The sliders will be coupled, because the ratio itself locks their ratio already.
I.e., changing one of the two sliders will necessarily also have to change the other.

Then we also need some preset buttons that can also set these two sliders to specific preset values.
These presets use namings commonly used in the golfing community, and have a historic origin:
They express the time and ration in terms of the number of video frames like "21/7".
They assume a video frame rate of 30 Hz, so "21/7" would be a backswing time of 700ms (21 \* 1/30) and forward swing time of 233 ms
Depending on whether the app has selected 2:1 or 3:1 ratio we need the following preset buttons:

- For 2:1: 10/5, 12/6, 14/7, 16/8, 18/9, 20/10
- For 3:1: 15/5, 18/6, 21/7, 24/8, 27/9, 30/10

Of course we also need a small helper function that converts from these user facing timing parameters to the internal `bpm` value.
The sequences are design in a way that the forward swing time corresponds to exactly 1 beat.
So essentially we'll have to take the forward swing time in millisecond, and pick the bpm value that correspond to a beat time of exactly that duration.
As an example: A forward swing time of 500ms will correspond to 120 bpm, because at 120 bpm a beat has a duration of half a second.

The UI should show the following things in a large display to the user:

- Backward swing time in ms (no digits after the comma)
- Forward swing time in ms (no digits after the comma)
- Time to impact time in ms (no digits after the comma), which is the sum of the two.
- BPM, but actually not the BPM we're using internally, but rather the BPM the correspond to using the "time to impact" as a basis of the calculation. The idea is that the "full swing time" gives a more stable bpm because it correspond more to the half period of a pendulum (whereas our internal BPM is more like a quarter of the pendulum period, which is less meaningful for a human).
