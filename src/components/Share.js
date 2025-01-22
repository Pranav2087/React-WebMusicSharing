import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../App.css";
import { instruments } from "./Instruments.js";
import * as Tone from "tone";

const Share = () => {
  const { id } = useParams();
  const [sampleData, setSampleData] = useState({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [stopPlayback, setStopPlayback] = useState(false);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const sample = await getSample(id);
        setSampleData(sample);
      } catch (error) {
        console.error("Error fetching sample data:", error);
      }
    }
    fetchData();
  }, [id]);

  useEffect(() => {
    if (stopPlayback) {
      Tone.Transport.stop();
      setIsPlaying(false);
      setStopPlayback(false);
    }
  }, [stopPlayback]);

  useEffect(() => {
    async function fetchLocationData() {
      try {
        const locations = await getSamples();
        setLocations(locations);
      } catch (error) {
        console.error("Error fetching location data:", error);
      }
    }
    fetchLocationData();
  }, []);

  /**
   * This function renders the list of locations with sharing status buttons.
   */
  const renderLocations = () => {
    return locations.map((location) => (
      <div key={location.id} className="toggle-row-container">
        <div className="location-name-label">
          <h4>{location.name}</h4>
        </div>
        <div className="sequence-row-container">
          <button
            className={`toggle-selected ${location.sharing ? "active" : ""}`}
          >
            {location.sharing ? "Shared" : "Not Shared"}
          </button>
          <button className="toggle">Not Shared</button>
        </div>
      </div>
    ));
  };

  /**
   * This function gets the data of the sample with the respective ID
   * @param  {string} ID - Passed from the homescreen which contains the ID for the Sample
   */
  const getSample = async (id) => {
    const url = `https://comp2140.uqcloud.net/api/sample/${id}/?api_key=FTmHwtJOqb`;
    const response = await fetch(url);
    const json = await response.json();
    return json;
  };

  /**
   * This function gets the data for the location
   * @param  {string} ID - Passed from the homescreen which contains the ID for the Sample
   */
  const getSamples = async () => {
    const APIKEY = "FTmHwtJOqb";
    const baseURL = "https://comp2140.uqcloud.net/api/";
    const url = `${baseURL}location/?api_key=${APIKEY}`;
    const response = await fetch(url);
    const json = await response.json();
    return json;
  };

  /**
   * This function takes care of the playback of the tones
   */
  const playPreview = async () => {
    if (isPlaying) {
      Tone.Transport.cancel(); // Stop all scheduled events
      setIsPlaying(false);
    } else {
      const { recording_data } = sampleData;
      if (!recording_data) return;
      setIsPlaying(true);
      try {
        const recordingData = JSON.parse(recording_data);
        const selectedInstruments = Object.keys(recordingData);
        // Stop all scheduled events before starting playback
        Tone.Transport.cancel();
        for (let index = 0; index < selectedInstruments.length; index++) {
          const currentInstrument = selectedInstruments[index];
          const instrument = instruments[currentInstrument];
          const selectedNotesArray = recordingData[currentInstrument];
          for (const note of selectedNotesArray) {
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
        }
        setIsPlaying(false);
      } catch (error) {
        console.error("Playback error:", error);
        setIsPlaying(false);
      }
    }
  };

  return (
    <div>
      <h2 className="title">Share This Sample</h2>
      <div className="card">
        <div className="song-details">
          <h3>{sampleData.name}</h3>
          <p>
            {sampleData.datetime ? sampleData.datetime.substring(0, 10) : ""}
          </p>
        </div>
        <div className="buttons">
          <button
            type="button"
            className={`bright-button ${isPlaying ? "active" : ""}`}
            onClick={playPreview}
          >
            {isPlaying ? "Stop Playing" : "Preview"}
          </button>
        </div>
      </div>
      {renderLocations()}
    </div>
  );
};

export default Share;
