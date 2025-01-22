import React, { useState, useEffect } from "react";
import "../App.css";
import * as Tone from "tone";
import { instruments } from "./Instruments.js"; // Import your instruments object
const APIKEY = "FTmHwtJOqb";

/**
 * This function takes the selectednotes and their details to save it to the RESTful api
 * @param  {string} data - selecteded notes and their details
 * @returns {json}
 */
async function SaveSample(data) {
  const baseURL = "https://comp2140.uqcloud.net/api/sample/";
  const url = `${baseURL}?api_key=${data.api_key}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Error saving sample: ${response.statusText}`);
  }

  const json = await response.json();
  return json;
}
const CreateSample = () => {
  const [selectedInstrument, setSelectedInstrument] = useState(null);
  const [selectedNotes, setSelectedNotes] = useState({
    guitar: [],
    piano: [],
    violin: [],
    drums: [],
  });
  const [inputValue, setInputValue] = useState("");

  /**
   * This function is used for keeping track of the selected instrument
   * @param  {string} instrument - selecteded instrument
   */
  const handleInstrumentClick = (instrument) => {
    if (!selectedNotes[instrument]) {
      setSelectedNotes({
        ...selectedNotes,
        [instrument]: [],
      });
    }
    setSelectedInstrument(instrument);
  };
  /**
   * This function handles the click event for a musical note in a grid.
   * @param {number} row - The row index of the clicked note.
   * @param {number} column - The column index of the clicked note.
   * @returns {void}
   */
  const handleNoteClick = (row, column) => {
    if (!selectedNotes[selectedInstrument]) return;
    const note = `${row}${column}`;
    if (selectedNotes[selectedInstrument].includes(note)) {
      setSelectedNotes({
        ...selectedNotes,
        [selectedInstrument]: selectedNotes[selectedInstrument].filter(
          (n) => n !== note
        ),
      });
    } else {
      setSelectedNotes({
        ...selectedNotes,
        [selectedInstrument]: [...selectedNotes[selectedInstrument], note],
      });
    }
  };
  /**
   * This function gets the CSS class for a musical note button based on its selection state.
   * @param {number} row - The row index of the musical note.
   * @param {number} column - The column index of the musical note.
   * @returns {string} - The CSS class for the button.
   */
  const getButtonClass = (row, column) => {
    const note = `${row}${column}`;
    return selectedNotes[selectedInstrument]?.includes(note)
      ? "toggle-selected"
      : "toggle";
  };
  const [isPlaying, setIsPlaying] = useState(false); //Keeping track of the preview button

  /**
   * This function handles the play back of the tones, It takes an instrument and their notes plays it out in a fixed interval
   */
  const playPreview = async () => {
    const selectedInstruments = Object.keys(selectedNotes).filter(
      (instrument) => selectedNotes[instrument].length > 0
    );

    if (selectedInstruments.length === 0) {
      return;
    }
    setIsPlaying(true);
    const playNextInstrument = async (index) => {
      if (index < selectedInstruments.length) {
        const currentInstrument = selectedInstruments[index];
        const instrument = instruments[currentInstrument];
        const selectedNotesArray = selectedNotes[currentInstrument];
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
        // Schedule the next instrument to play after a short delay
        setTimeout(() => {
          playNextInstrument(index + 1);
        }, selectedNotesArray.length * 100); // Adjust the delay as needed
        if (index === selectedInstruments.length - 1) {
          setIsPlaying(false); // Set button text back to "Preview" when finished
        }
      }
    };
    await playNextInstrument(0);
  };

  /**
   * This function handles the play back of the tones, It takes an instrument and their notes plays it out in a fixed interval
   * @param {string} note - Contains the click of the note
   */
  const playNote = (note) => {
    if (selectedInstrument && instruments[selectedInstrument]) {
      const matches = note.match(/^([a-zA-Z]+)(\d+)$/);
      if (matches && matches.length === 3) {
        const [, row, column] = matches;
        let adjustedColumn = column;

        if (parseInt(column, 10) > 9) {
          adjustedColumn = (parseInt(column, 10) % 9).toString();
        }
        const adjustedNote = `${row}${adjustedColumn}`;

        instruments[selectedInstrument].triggerAttackRelease(
          adjustedNote,
          "8n"
        );
      }
    }
  };

  /**
   * This function handles the save function, it compreses the information needed for the api and call the savesample function
   */
  const handleSaveClick = async () => {
    // Get the selected instruments
    const selectedInstruments = Object.keys(selectedNotes).filter(
      (instrument) => selectedNotes[instrument].length > 0
    );

    if (selectedInstruments.length === 0 || !inputValue) {
      // If no instruments are selected or no input value, do not save
      alert("Please select instruments and enter a name before saving.");
      return;
    }

    // Prepare recording_data for all selected instruments
    const recordingData = {};
    selectedInstruments.forEach((instrument) => {
      recordingData[instrument] = selectedNotes[instrument];
    });

    // Prepare data for the SaveSample function
    const data = {
      type: selectedInstruments.join(", "), // Combine selected instruments
      name: inputValue, // Use the input value as the name
      date: new Date().toUTCString().slice(5, 16), // Current date
      recording_data: JSON.stringify(recordingData), // Convert recordingData to JSON
      api_key: APIKEY, // API key from your original code
    };

    try {
      // Call the SaveSample function
      const response = await SaveSample(data);
      console.log("Save response:", response);
      alert("Sample saved successfully!");
      window.location.href = "/";
    } catch (error) {
      console.error("Save error:", error);
      alert("Error saving sample.");
    }
  };

  useEffect(() => {
    return () => {
      // Dispose of the instrument when the component unmounts (e.g., when leaving the page)
      if (selectedInstrument && instruments[selectedInstrument]) {
        instruments[selectedInstrument].dispose();
      }
      Tone.Transport.cancel();
      Tone.Transport.stop();
    };
  }, []);

  return (
    <>
      <h2 className="title">Edit Sample:</h2>
      <form className="card edit-card">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <div className="button-group-container">
          <button
            type="button"
            className="bright-button"
            onClick={handleSaveClick}
          >
            Save
          </button>
          <button
            type="button"
            onClick={playPreview}
            className={`bright-button ${isPlaying ? "active" : ""}`}
          >
            {isPlaying ? "Stop Preview" : "Preview"}
          </button>
        </div>
      </form>

      <div className="toggle-row-container">
        <div className="row-label">
          <h4>Instrument</h4>
        </div>
        <div className="sequence-row-container">
          <button
            className={
              selectedInstrument === "guitar" ? "toggle-selected" : "toggle"
            }
            onClick={() => handleInstrumentClick("guitar")}
          >
            Guitar
          </button>
          <button
            className={
              selectedInstrument === "piano" ? "toggle-selected" : "toggle"
            }
            onClick={() => handleInstrumentClick("piano")}
          >
            Piano
          </button>
          <button
            className={
              selectedInstrument === "violin" ? "toggle-selected" : "toggle"
            }
            onClick={() => handleInstrumentClick("violin")}
          >
            Violin
          </button>
          <button
            className={
              selectedInstrument === "drums" ? "toggle-selected" : "toggle"
            }
            onClick={() => handleInstrumentClick("drums")}
          >
            Drums
          </button>
        </div>
      </div>

      {["G", "A", "B", "C", "D", "E", "F"].map((note) => (
        <div key={note} className="sequence-row">
          <div className="row-label">
            <h4>{note}</h4>
          </div>
          <div className="sequence-row-container">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map(
              (column) => (
                <button
                  key={column}
                  className={getButtonClass(note, column)}
                  onClick={() => {
                    playNote(`${note}${column}`); // Play the note
                    handleNoteClick(note, column); // Handle the click
                  }}
                ></button>
              )
            )}
          </div>
        </div>
      ))}
    </>
  );
};

export default CreateSample;
