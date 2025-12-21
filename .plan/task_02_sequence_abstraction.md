It's time to introduce a `Sequence` abstraction to allow for passing more complex drum-machine like patterns to the `MetronomeEngine`.

A `Sequence` should basically contain:

- An array of `Click` structures.
- A `maxBeat` value that denotes the length of the sequence, i.e., the point where the sequence should "loop around". Sequence start at beat 0.

Sequences operate entirely in the "beat time domain", i.e., they do not contain absolute times but rather tempo agnostic beat times.

A `Click` structure should contain:

- The soundtype, currently `synth1`, `synth2`, `sample`.
- The `beat` where the click should be located in beat time.
- A `volume` value denoting the loudness of that click, 1.0 being full scale, 0.0 fully silence.

Note: The order of the clicks in the array can be arbitrary, i.e., the elements can have a different order than what the beat time of a click expresses.

This will mean that we need to change the logic around the `nextNoteTime` in `MetronomeEngine`.

I'd like to introduce a new abstraction `ClickIterator` that actually handles the "give me the next click(s) to play that are inside the scheduling window.
The entire responsibility of finding right clicks to schedule should be part of that class.
This class for instance will have to sort the click events by their beat time, and have some internal state of the last "current click" so that we can iterate the beats practically in O(1) instead of having to do an O(N) search through all the clicks on every callback.
Handling of the loop around will get interesting, and should be handled carefully.

This new class will require decent unit test coverage.
Let's add vitest to the project and set up unit tests for that iteration logic.

Note that we also should get rid of the notion of `beatsPerMeasure`:
Eventually this app will turn into a "golf swing timing trainer" encoding events in the golf swing like backswing, forward swing, impact with different sounds.
The notion of beats and measure will be hidden to the user and will actually not play role.
Internally in the sequence generation we will be operating in beats and tempo will be controlled in bpm, but we don't need any other typical music related functionality, in particular not the notion of a "measure".
