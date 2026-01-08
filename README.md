# ChargedUP: Behind The Scenes of an RC Car

An interactive educational website connecting **battery chemistry** and **DC motors** through the real-world application of powering an RC toy car.

![ChargedUP](https://img.shields.io/badge/ChargedUP-RC%20Car%20Science-00D1FF)
![Grade 11](https://img.shields.io/badge/Grade-11-3EF1C6)
![License](https://img.shields.io/badge/License-MIT-blue)

## 🚀 Quick Start

1. **Clone or download** this repository
2. **Open `index.html`** in any modern web browser
3. No build step or server required — it's all static files!

Alternatively, deploy to GitHub Pages, Netlify, or any static hosting service.

## ✨ Features

### 🔋 Battery Chemistry

- AA Alkaline (Zn/MnO₂) and NiMH battery chemistry
- Stoichiometry calculations with limiting reagent identification
- Commercial capacity (mAh) to charge/energy conversions
- Internal resistance and voltage sag modeling
- Presets: Single AA, 4×AA packs

### ⚡ Motor Physics  

- Magnetic field calculations (solenoid, loops, wires)
- Right-hand rule demonstrations
- Motor speed estimator with visual gauge
- Back-EMF conceptual explanations
- Import battery data for integrated analysis

### 🔄 Integration

- Chemistry → Physics data transfer
- Energy flow visualization (Chemical → Electrical → Mechanical)
- Complete worked examples

### 🧪 Virtual Labs

- Battery discharge simulation
- Motor current & B-field visualization
- Guided experiments

### 🎨 User Experience

- Dark/Light theme toggle
- Text size options (small/default/large)
- Responsive design (mobile-friendly)
- Accessible (ARIA labels, keyboard navigation)
- Deep linking and JSON export

## 📁 Project Structure

```
ChargeLab/
├── index.html              # Landing page
├── chemistry.html          # Battery chemistry & calculator
├── physics.html            # Motor physics & simulator
├── integrated.html         # Combined energy chain view
├── simulations.html        # Virtual labs
├── glossary.html           # 30+ term definitions
├── sources.html            # APA citations
├── about.html              # Rubric mapping & info
├── styles/
│   └── style.css           # Complete design system
├── scripts/
│   ├── main.js             # Core app (settings, navigation)
│   ├── chemistry.js        # Battery calculator
│   └── physics.js          # Motor simulator
├── assets/
│   ├── logo.svg            # Site logo
│   └── favicon.svg         # Browser favicon
├── README.md               # This file
├── LICENSE                 # MIT License
├── CHANGELOG.md            # Version history
└── TEST_RESULTS.md         # Verification testing
```

## 📐 Key Formulas

### Chemistry

| Formula | Description |
|---------|-------------|
| `n = m / M` | Moles from mass |
| `Q = n × F` | Charge from moles (F = 96,485 C/mol) |
| `E = V × Q` | Energy from charge |
| `Q (C) = mAh × 3.6` | Capacity conversion |
| `V_loaded = V - IR` | Voltage under load |

### Physics

| Formula | Description |
|---------|-------------|
| `B = μ₀NI/L` | Solenoid B-field |
| `B = μ₀I/(2πr)` | Wire B-field |
| `P = VI = I²R` | Power |

## 🎓 Curriculum Alignment

### Chemistry 30S

- Mole concept and calculations
- Chemical equations and stoichiometry
- Oxidation-reduction reactions
- Electrochemical cells

### Physics 30S

- Electric circuits and current
- Magnetism and electromagnetism
- Magnetic fields from currents
- Energy conversion

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📚 Sources

Key references (full citations in `sources.html`):

- Linden & Reddy (2010) - Battery handbook
- Energizer (2018) - AA specifications
- Griffiths (2017) - Electromagnetism
- HyperPhysics - DC motor concepts

## 📄 License

MIT License - see [LICENSE](LICENSE) file.

## 🙏 Acknowledgments

- Manitoba Education curriculum guidelines
- NIST CODATA for physical constants
- IUPAC for atomic weights

---

**ChargedUP** • December 20th • Grade 11 Chemistry + Physics Final Project
