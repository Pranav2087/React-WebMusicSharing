  import * as Tone from "tone";

export const toneObject = Tone;

export const synth = new toneObject.PolySynth().toDestination();

export const instruments = {
  guitar: new toneObject.Sampler({
    urls: {
      "G1": "G3.mp3",
      "A1": "A3.mp3",
      "B1": "B3.mp3",
      "C2": "C3.mp3",
      "D1": "D3.mp3",
      "E1": "E3.mp3",
      "F1": "F3.mp3",
    },
    release: 1,
    baseUrl: "samples/guitar-acoustic/",
  }).toDestination(),

  piano: new toneObject.Sampler({
    urls: {
      "G1": "G1.mp3",
      "A1": "A1.mp3",
      "B1": "B1.mp3",
      "C1": "C1.mp3",
      "D1": "D1.mp3",
      "E1": "E1.mp3",
      "F1": "F1.mp3", 
    },
    release: 1,
    baseUrl: "samples/piano/",
  }).toDestination(),

  violin: new toneObject.Sampler({
    urls: {
      "G1": "G3.mp3",
      "A1": "A3.mp3",
      "B1": "A4.mp3",
      "C1": "C4.mp3",
      "D1": "C5.mp3",
      "E1": "E4.mp3",
      "F1": "E5.mp3", 
    },
    release: 1,
    baseUrl: "samples/violin/",
  }).toDestination(),

  drums: new toneObject.Sampler({
    urls: {
      "G1": "drums1.mp3",
      "A1": "drums2.mp3",
      "B1": "drums3.mp3",
      "C1": "drums4.mp3",
      "D1": "drums5.mp3",
      "E1": "drums6.mp3",
      "F1": "drums7.mp3", 
    },
    release: 1,
    baseUrl: "samples/drum-samples/",
  }).toDestination(),
};
