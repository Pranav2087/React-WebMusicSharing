import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import "../App.css";
import { instruments } from "./Instruments.js";
import * as Tone from "tone";
const APIKEY = "FTmHwtJOqb";
const baseURL = "https://comp2140.uqcloud.net/api/";

const HomeScreen = () => {
  const [samples, setSamples] = useState([]);
  const [stopPlayback, setStopPlayback] = useState(false);
  const [playingButtonIndex, setPlayingButtonIndex] = useState(null); // Local state to track playing button

  useEffect(() => {
    async function fetchData() {
      try {
        const samplesData = await getSamples();
        setSamples(samplesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (stopPlayback) {
      Tone.Transport.stop();
      setStopPlayback(false);
      if (playingButtonIndex !== null) {
        setPlayingButtonIndex(null); // Reset the playing button immediately
      }
    }
  }, [stopPlayback, playingButtonIndex]);
/**
 * This function gets the data from the api
 */
  async function getSamples() {
    const url = `${baseURL}sample/?api_key=${APIKEY}`;
    const response = await fetch(url);
    const json = await response.json();
    return json;
  }

  /**
 * This function handles the play back of the tones, It takes an instrument and their notes plays it out in a fixed interval
 * @param {string} recording_data - contains the instrument data and notes
 * @param {string} buttonIndex - contains the index of the button clicked to identify the text change upon click for preview
 */
  const playPreview = async (recordingData, buttonIndex) => {
    if (playingButtonIndex === buttonIndex) {
      Tone.Transport.cancel();
      setStopPlayback(true);
    } else {
      try {
        const notes = JSON.parse(recordingData);
        const selectedInstruments = Object.keys(notes);
        const playNextInstrument = async (index) => {
          if (index < selectedInstruments.length) {
            const currentInstrument = selectedInstruments[index];
            const instrumentNotes = notes[currentInstrument];
            const instrument = instruments[currentInstrument];
            for (const note of instrumentNotes) {
              const matches = note.match(/^([a-zA-Z]+)(\d+)$/);
              if (matches && matches.length === 3) {
                const [, row, column] = matches;
                let adjustedColumn = column;

                if (parseInt(column, 10) > 9) {
                  adjustedColumn = (parseInt(column, 10) % 9).toString();
                }
                const adjustedNote = `${row}${adjustedColumn}`;
                instrument.triggerAttackRelease(adjustedNote, "8n");
                await new Promise((resolve) => setTimeout(resolve, 500));
              }
            }
            setTimeout(() => {
              playNextInstrument(index + 1);
            }, 100);
          }
          if (index === selectedInstruments.length) {
            setPlayingButtonIndex(null); // Reset the playing button when playback stops
          } else {
            setPlayingButtonIndex(buttonIndex); // Set the currently playing button index
          }
        };
        setPlayingButtonIndex(buttonIndex); // Set the currently playing button index
        await playNextInstrument(0);
      } catch (error) {
        console.error("Playback error:", error);
        setPlayingButtonIndex(null); // Reset the playing button on error
      }
    }
  };

  return (
    <div>
      <h2 className="title">My Songs</h2>
      <section className="sample">
        {samples.map((sample, index) => (
          <div className="card" key={sample.id}>
            <div className="song-details">
              <h3>{sample.name}</h3>
              <p>{sample.datetime.substring(0, 10)}</p>
            </div>
            <div className="button-group-container">
              <NavLink to={`/share/${sample.id}`} className="bright-button">
                Share
              </NavLink>
              <button
                className={`bright-button ${
                  playingButtonIndex === index ? "active" : ""
                }`}
                onClick={() => playPreview(sample.recording_data, index)}
              >
                {playingButtonIndex === index
                  ? "Stop Playing"
                  : "Preview"}
              </button>
              <button className="bright-button">Edit</button>
            </div>
          </div>
        ))}
      </section>
      <div className="create-card">
        <NavLink to="/createsample" className="bright-button">
          Create Sample
        </NavLink>
      </div>
    </div>
  );
};

export default HomeScreen;
