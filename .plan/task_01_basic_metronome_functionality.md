**Goal**

The goal of this task is to develop the basic metronome functionality.

**Requirements**

Perfect micro timing is essential for our app.
Therefore it is not good enough to use e.g. `setInterval` and play a sound when the timer triggers.
This will likely lead to way too much jitter for the beat timing.
Ideally we need sub-milliseconds or even frame-perfect scheduling of the beats.
I think the Web Audio API should allow for such functionality?

**Open questions**

When taking an approach of "scheduling" audio events there is always a trade-off between "baking" audio events and keeping things dynamic.

For example the most extreme for of "baking" things is to pre-generate a full raw wave audio data.
This allows for frame perfect scheduling (because we're controlling the raw audio waveform data itself), it also requires to make everything fully static.

There are two issues with the fully static approach:

- It doesn't play nicely with the circular / infinite semantics of metronome output (eventually our app will play some more complex patterns, but always circular/looping like a drum machine -- of course the looping itself should stay 'in time', i.e., there must not be any delay or timing gap when looping around).
- Eventually there will be user facing controls that allow to modify the parameters like tempo etc. The audio output should react to the controls ideally with relative low latency, which doesn't work well with pre-rendering the audio.

Therefore we'll likely have to go for a more dynamic approach, but it would be good having to produce a literally "infinite" event sequence.
The ideal solution would be to have a pattern of a fixed length that loops around at a certain length, but that looping has to be in perfect timing as well.
