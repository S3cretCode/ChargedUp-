# Changelog - ChargedUP

All notable changes to this project are documented in this file.

## [2.0.0] - December 20th

### Major Update: Rebrand to "ChargedUP: Behind The Scenes of an RC Car"

Complete transformation from general electrochemistry/fields to focused RC car case study.

### Added

- **New Branding**: ChargedUP name and logo
- **Settings Panel**: Floating action button with dark/light theme and text size options
- **Battery Calculator** (`chemistry.js`):
  - Stoichiometry mode (Zn/MnO₂ reactions)
  - Commercial capacity mode (mAh input)
  - Internal resistance modeling
  - Voltage sag calculations
  - Runtime estimation
  - Presets: Single AA, 4×AA Alkaline, 4×AA NiMH, Stoichiometry example
- **Motor Simulator** (`physics.js`):
  - B-field calculations (solenoid, loop, wire)
  - Motor speed gauge with approximate RPM
  - Right-hand rule interactive demonstration
  - Import from battery calculator
  - Presets: RC Car Motor, Hobby Motor, Demo Coil
- **Integrated View**: Energy flow diagram showing battery → motor chain
- **Virtual Labs**: Interactive experiments for discharge and B-field
- **Glossary**: 30+ searchable/filterable terms
- **Sources**: APA-formatted citations for all calculations
- **About Page**: Rubric mapping and project details

### Changed

- All HTML pages updated with ChargedUP branding
- CSS design system updated with motor gauge and battery visuals
- All dates updated to December 20th
- Folder structure: proper `styles/`, `scripts/`, `assets/` organization
- Footer and headers reference RC car theme

### Technical

- Settings stored in localStorage
- Deep linking with URL parameters
- Chemistry → Physics data transfer via localStorage
- Canvas-based visualizations for electron flow and field lines

---

## [1.0.0] - Initial Release

Original Project ChargeLab with general electrochemistry and electromagnetic fields.

### Features

- Chemistry calculator with stoichiometry
- Physics calculator with basic formulas
- Landing page with mode toggle
- Responsive design
- Accessibility features
