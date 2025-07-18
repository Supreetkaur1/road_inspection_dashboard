# 🛣️ NHAI Inspection Dashboard

A web dashboard designed for **real-time visualization of Network Survey Vehicle (NSV) data** during site inspections. Built as part of the **NHAI Hackathon 2025** challenge.

---

## ✨ Features

### 📊 Excel Analysis Module
- Upload `.CSV` or `.XLSX` files containing inspection data.
- Extract key threshold values.
- Calculate:
  - Number of cells exceeding threshold values.
  - Number of cells exceeding user-defined values.
- Display results clearly with a clean and responsive UI.

### 🎥 Video Comparison Module
- Upload two videos (e.g. from road inspection cameras).
- Watch them **side-by-side** with synchronized play/pause controls.
- Visually compare road conditions (e.g. before/after inspections).
- Add **bookmarks and notes** for future reference.

---

## 🎨 UI Highlights

- NHAI branding with official logo.
- Elegant light-yellow background for visual comfort.
- Navy-blue header with centered alignment.
- Stylish buttons and structured layout.
- Pure CSS used via `App.css` and `index.css` — **no Tailwind or external CSS frameworks**.

---

## 🧰 Tech Stack

| Tech               | Purpose                                    |
|--------------------|---------------------------------------------|
| React              | Frontend UI                                |
| HTML/CSS (Vanilla) | Styling (`App.css`, `index.css`)           |
| JavaScript         | Logic and interactivity                    |
| ExcelJS / SheetJS  | Excel/CSV parsing (if used)                |
| HTML5 Video        | Uploading and synchronized video playback  |

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v14 or above)
- npm or yarn

### Installation

```bash
git clone https://github.com/your-username/nhai-inspection-dashboard.git
cd nhai-inspection-dashboard
npm install
npm run dev    # or npm start if using Create React App
Then open:
http://localhost:5173

📁 Project Structure
bash
Copy
Edit
📦 nhai-inspection-dashboard/
├── public/
│   └── images/nhai-logo.png       # NHAI Logo
├── src/
│   ├── components/
│   │   └── Dashboard.jsx          # Main UI layout
│   ├── App.css                    # Core styling
│   ├── index.css                  # Global base styles
│   ├── App.jsx                    # App entry point
│   └── main.jsx                   # ReactDOM root
├── package.json
└── README.md
🧪 How to Use
Upload a .CSV or .XLSX file under Excel Analysis Features.

Use buttons to:

Show Threshold Values

Count cells exceeding default thresholds

Count cells exceeding a custom value (“X”)

Upload two videos using Upload Video 1 and Upload Video 2.

Use synchronized Play/Pause controls to inspect footage.

Add Bookmarks and Notes for points of interest.

🚧 Future Improvements
Add map-based route overlays for better spatial alignment.

User login with authentication and role-based access.

Export summary reports as PDF.

👩‍💻 Contributor
Supreet Kaur – Software Development Engineer

📄 License
This project is built for the NHAI Hackathon and is open for educational and non-commercial use.

