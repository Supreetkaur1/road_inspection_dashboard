// Full updated App.jsx with proper UI ordering
import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import './App.css';

function App() {
  const [videoUrl1, setVideoUrl1] = useState(null);
  const [videoUrl2, setVideoUrl2] = useState(null);
  const [data, setData] = useState([]);
  const [message, setMessage] = useState('');
  const [frameInput, setFrameInput] = useState('');
  const [bookmarks, setBookmarks] = useState([]);
  const [bookmarkLabel, setBookmarkLabel] = useState('');

  const videoRef1 = useRef(null);
  const videoRef2 = useRef(null);

  const thresholds = {
    'L1 Lane Roughness BI (in mm/km)': 2440, 'L2 Lane Roughness BI (in mm/km)': 2416,
    'L3 Lane Roughness BI (in mm/km)': 2416, 'L4 Lane Roughness BI (in mm/km)': 2416,
    'R1 Lane Roughness BI (in mm/km)': 2554, 'R2 Lane Roughness BI (in mm/km)': 2407,
    'R3 Lane Roughness BI (in mm/km)': 2416, 'R4 Lane Roughness BI (in mm/km)': 2407,
    'L1 Rut Depth (in mm)': null, 'L2 Rut Depth (in mm)': 5.1, 'L3 Rut Depth (in mm)': 5.1, 'L4 Rut Depth (in mm)': 5.1,
    'R1 Rut Depth (in mm)': null, 'R2 Rut Depth (in mm)': 5.1, 'R3 Rut Depth (in mm)': null, 'R4 Rut Depth (in mm)': null,
    'L1 Crack Area (in % area)': null, 'L2 Crack Area (in % area)': null, 'L3 Crack Area (in % area)': null, 'L4 Crack Area (in % area)': null,
    'R1 Crack Area (in % area)': null, 'R2 Crack Area (in % area)': null, 'R3 Crack Area (in % area)': null, 'R4 Crack Area (in % area)': null,
    'L1 Area (% area)': null, 'L2 Area (% area)': null, 'L3 Area (% area)': null, 'L4 Area (% area)': null,
    'R1 Area (% area)': null, 'R2 Area (% area)': null, 'R3 Area (% area)': null, 'R4 Area (% area)': null,
  };

  const includedColumns = Object.keys(thresholds);

  const handleVideoUpload1 = (e) => {
    const file = e.target.files[0];
    if (file) setVideoUrl1(URL.createObjectURL(file));
  };

  const handleVideoUpload2 = (e) => {
    const file = e.target.files[0];
    if (file) setVideoUrl2(URL.createObjectURL(file));
  };

  const handleDataUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'csv') {
      Papa.parse(file, {
        complete: (results) => setData(results.data),
        skipEmptyLines: true,
      });
    } else if (ext === 'xlsx') {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const workbook = XLSX.read(evt.target.result, { type: 'binary' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: false });
        setData(jsonData);
      };
      reader.readAsBinaryString(file);
    } else {
      alert('Unsupported file type. Please upload .csv or .xlsx');
    }
  };

  const checkViolationsAtFrame = () => {
    if (!frameInput || data.length < 3) return setMessage('Invalid frame or no data loaded.');
    const frameNum = parseInt(frameInput);
    if (isNaN(frameNum)) return setMessage('Enter a valid number.');
    const header = data[1];
    const row = data[frameNum + 1];
    if (!row) return setMessage('Frame out of range.');

    const violations = includedColumns.reduce((acc, col) => {
      const idx = header.indexOf(col);
      const threshold = thresholds[col];
      const val = parseFloat(row[idx]);
      if (idx !== -1 && threshold !== null && !isNaN(val) && val >= threshold) {
        acc.push(`${col}: ${val} ≥ ${threshold}`);
      }
      return acc;
    }, []);

    setMessage(
      violations.length > 0
        ? `Frame ${frameNum} — Violations found:\n${violations.join('\n')}`
        : `Frame ${frameNum} — No threshold violations.`
    );
  };

  const handlePlayPause = () => {
    const paused = (videoRef1.current?.paused || videoRef2.current?.paused);
    if (paused) {
      videoRef1.current?.play();
      videoRef2.current?.play();
    } else {
      videoRef1.current?.pause();
      videoRef2.current?.pause();
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return [hrs, mins, secs].map((v) => String(v).padStart(2, '0')).join(':');
  };

  const handleBookmark = (videoRef, videoNumber) => {
    const current = videoRef.current?.currentTime;
    if (!current) return;
    const entry = {
      video: videoNumber,
      time: formatTime(current),
      label: bookmarkLabel || '(no label)',
      note: ''
    };
    setBookmarks((prev) => [...prev, entry]);
    setBookmarkLabel('');
  };

  const updateNote = (index, newNote) => {
    const updated = [...bookmarks];
    updated[index].note = newNote;
    setBookmarks(updated);
  };

  const showThresholdValues = () => {
    if (data.length < 2) return setMessage('No data loaded.');
    const header = data[1];
    const rows = data.slice(2);
    let results = [];

    includedColumns.forEach((colName) => {
      const idx = header.indexOf(colName);
      if (idx === -1) return;
      const threshold = thresholds[colName];
      if (threshold === null) return;

      const exceeding = rows.some(row => parseFloat(row[idx]) >= threshold);
      if (exceeding) results.push(`${colName}: ${threshold}`);
    });

    if (results.length) {
      setMessage(results.join('\n'));
    } else {
      setMessage('No columns with cells exceeding thresholds.');
    }
  };

  const countExceedingThreshold = () => {
    const column = prompt('Enter column name exactly:');
    if (!includedColumns.includes(column)) {
      return setMessage('Column not in analysis list.');
    }
    if (data.length < 2) return setMessage('No data loaded.');
    const header = data[1];
    const idx = header.indexOf(column);
    if (idx === -1) return setMessage('Column not found in sheet.');

    const threshold = thresholds[column];
    if (threshold === null) return setMessage('No threshold defined for this column.');

    let count = 0;
    data.slice(2).forEach(row => {
      const val = parseFloat(row[idx]);
      if (!isNaN(val) && val >= threshold) count++;
    });

    setMessage(`Cells >= threshold (${threshold}): ${count}`);
  };

  const countExceedingCustom = () => {
    const column = prompt('Enter column name exactly:');
    if (!includedColumns.includes(column)) {
      return setMessage('Column not in analysis list.');
    }
    if (data.length < 2) return setMessage('No data loaded.');
    const header = data[1];
    const idx = header.indexOf(column);
    if (idx === -1) return setMessage('Column not found in sheet.');

    const xStr = prompt('Enter value to compare:');
    const x = parseFloat(xStr);
    if (isNaN(x)) return setMessage('Invalid number.');

    let count = 0;
    data.slice(2).forEach(row => {
      const val = parseFloat(row[idx]);
      if (!isNaN(val) && val >= x) count++;
    });

    setMessage(`Cells >= ${x}: ${count}`);
  };

  return (
    <div className="container">
      <h1>NHAI Inspection Dashboard</h1>

      <div className="card">
        <div className="field">
          <label>Upload CSV or XLSX:</label>
          <input type="file" accept=".csv,.xlsx" onChange={handleDataUpload} />
        </div>

        {data.length > 0 && (
          <>
            <div className="analysis-buttons">
              <h2>Excel Analysis Features</h2>
              <div className="button-row">
                <button onClick={showThresholdValues}>Show Threshold Values</button>
                <button onClick={countExceedingThreshold}>Number of cells exceeding threshold</button>
                <button onClick={countExceedingCustom}>Number of cells exceeding 'x' value</button>
              </div>
            </div>
            {message && !message.startsWith("Frame") && (
              <div className="result">
                <pre>{message}</pre>
              </div>
            )}
          </>
        )}

        <div className="field">
          <label>Upload Video 1:</label>
          <input type="file" accept="video/*" onChange={handleVideoUpload1} />
        </div>

        <div className="field">
          <label>Upload Video 2:</label>
          <input type="file" accept="video/*" onChange={handleVideoUpload2} />
        </div>

        {videoUrl1 || videoUrl2 ? (
          <div className="video-preview">
            {videoUrl1 && <video ref={videoRef1} src={videoUrl1} controls width="48%" style={{ marginRight: '2%' }} />}
            {videoUrl2 && <video ref={videoRef2} src={videoUrl2} controls width="48%" />}
          </div>
        ) : null}

        <div className="field">
          <button onClick={handlePlayPause}>▶️ Parallel Play/Pause</button>
        </div>

        <div className="field">
          <label>Check Violations at Frame:</label>
          <input
            type="number"
            value={frameInput}
            onChange={(e) => setFrameInput(e.target.value)}
            placeholder="Enter frame number"
          />
          <button onClick={checkViolationsAtFrame}>Check</button>
          {message.startsWith("Frame") && (
            <div className="result">
              <pre>{message}</pre>
            </div>
          )}
        </div>

        <div className="field">
          <label>Bookmark Label:</label>
          <input
            type="text"
            value={bookmarkLabel}
            onChange={(e) => setBookmarkLabel(e.target.value)}
            placeholder="Label for bookmark"
          />
          <div style={{ marginTop: '10px' }}>
            {videoUrl1 && <button onClick={() => handleBookmark(videoRef1, 1)}>📌 Bookmark Video 1</button>}
            {videoUrl2 && <button onClick={() => handleBookmark(videoRef2, 2)}>📌 Bookmark Video 2</button>}
          </div>
        </div>

        {bookmarks.length > 0 && (
          <div className="result">
            <h3>🔖 Saved Bookmarks + Notes</h3>
            <ul>
              {bookmarks.map((bm, i) => (
                <li key={i}>
                  <strong>Video {bm.video}</strong> — {bm.time} — {bm.label}
                  <br />
                  <textarea
                    value={bm.note}
                    onChange={(e) => updateNote(i, e.target.value)}
                    placeholder="Add a note..."
                    rows={2}
                    style={{ width: '100%', marginTop: '5px' }}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
