/**
 * ChargedUP: Behind The Scenes of an RC Car
 * Chemistry Module - Battery Calculator
 * December 20th
 * 
 * Implements stoichiometric and commercial capacity calculations for 
 * AA Alkaline and NiMH batteries.
 */

window.ChargedUP = window.ChargedUP || {};

/* ============================================
   Constants (with source citations)
   ============================================ */
const CHEMISTRY_CONSTANTS = {
    // Faraday constant (NIST CODATA 2018)
    FARADAY: 96485, // C/mol

    // Molar masses (IUPAC 2021)
    M_ZN: 65.38, // g/mol
    M_MNO2: 86.936, // g/mol (Mn: 54.938 + O2: 31.998)

    // Nominal cell voltages
    V_ALKALINE: 1.5, // V
    V_NIMH: 1.2, // V

    // Typical internal resistance (manufacturer data estimates)
    R_INTERNAL_ALKALINE: 0.3, // Ω (fresh cell, varies with discharge)
    R_INTERNAL_NIMH: 0.02, // Ω (lower for NiMH)

    // Typical AA capacities (mAh)
    CAPACITY_AA_ALKALINE: 2000, // mAh (approximate, varies by brand/load)
    CAPACITY_AA_NIMH: 2000 // mAh (typical, ranges 1900-2700)
};

/* ============================================
   Battery Presets
   ============================================ */
const BATTERY_PRESETS = {
    'single-aa-alkaline': {
        name: 'Single AA Alkaline',
        type: 'alkaline',
        cellCount: 1,
        series: 1,
        parallel: 1,
        voltage: 1.5, // Cell voltage
        capacityMah: 2000,
        internalR: 0.3,
        znMass: null, // Use commercial capacity
        mno2Mass: null
    },
    '4aa-alkaline': {
        name: '4×AA Alkaline Pack (Series)',
        type: 'alkaline',
        cellCount: 4,
        series: 4,
        parallel: 1,
        voltage: 1.5, // Cell voltage (pack = 4 × 1.5V = 6.0V)
        capacityMah: 2000, // Same as single cell in series
        internalR: 1.2, // 4 × 0.3Ω
        znMass: null,
        mno2Mass: null
    },
    '4aa-nimh': {
        name: '4×AA NiMH Pack (Series)',
        type: 'nimh',
        cellCount: 4,
        series: 4,
        parallel: 1,
        voltage: 1.2, // Cell voltage (pack = 4 × 1.2V = 4.8V)
        capacityMah: 2000,
        internalR: 0.08, // 4 × 0.02Ω
        znMass: null,
        mno2Mass: null
    },
    'stoichiometry-example': {
        name: 'Stoichiometry Example (1g Zn, 2g MnO₂)',
        type: 'alkaline',
        cellCount: 1,
        series: 1,
        parallel: 1,
        voltage: 1.5,
        capacityMah: null, // Use stoichiometry
        internalR: 0.3,
        znMass: 1.0,
        mno2Mass: 2.0
    }
};

/* ============================================
   Battery Calculator Class
   ============================================ */
class BatteryCalculator {
    constructor() {
        this.constants = CHEMISTRY_CONSTANTS;
        this.results = {};
    }

    /**
     * Calculate charge and energy from reactant masses (stoichiometry)
     * Reaction: Zn + 2MnO₂ → ZnO + Mn₂O₃
     * Electrons per reaction: 2
     */
    calculateFromMass(znMass, mno2Mass, voltage = 1.5, electronsPerRxn = 2) {
        const F = this.constants.FARADAY;
        const Mzn = this.constants.M_ZN;
        const Mmno2 = this.constants.M_MNO2;

        // Step 1: Calculate moles
        const molesZn = znMass / Mzn;
        const molesMnO2 = mno2Mass / Mmno2;

        // Step 2: Determine limiting reagent (ratio 1:2)
        const znNeeded = molesMnO2 / 2; // Zn needed for all MnO2
        const mno2Needed = molesZn * 2; // MnO2 needed for all Zn

        let limitingReagent, molesReaction, excessMoles, excessReagent;

        if (molesZn <= znNeeded) {
            limitingReagent = 'Zn';
            molesReaction = molesZn;
            excessMoles = molesMnO2 - mno2Needed;
            excessReagent = 'MnO₂';
        } else {
            limitingReagent = 'MnO₂';
            molesReaction = molesMnO2 / 2;
            excessMoles = molesZn - znNeeded;
            excessReagent = 'Zn';
        }

        // Step 3: Calculate electrons transferred
        const molesElectrons = molesReaction * electronsPerRxn;

        // Step 4: Calculate charge (Q = n × F)
        const chargeC = molesElectrons * F;

        // Step 5: Calculate energy (E = V × Q)
        const energyJ = voltage * chargeC;
        const energyWh = energyJ / 3600;

        // Step 6: Convert to capacity (mAh)
        const capacityAh = chargeC / 3600;
        const capacityMah = capacityAh * 1000;

        this.results = {
            method: 'stoichiometry',
            molesZn,
            molesMnO2,
            limitingReagent,
            excessReagent,
            excessMoles,
            molesReaction,
            molesElectrons,
            chargeC,
            voltage,
            energyJ,
            energyWh,
            capacityMah,
            electronsPerRxn
        };

        return this.results;
    }

    /**
     * Calculate charge and energy from commercial capacity (mAh)
     */
    calculateFromCapacity(capacityMah, voltage, cellCount = 1, seriesCount = 1, parallelCount = 1) {
        // Commercial capacity is given in mAh
        // Q (C) = capacity (Ah) × 3600
        const capacityAh = capacityMah / 1000;
        const chargeC = capacityAh * 3600;

        // Pack configuration
        const packVoltage = voltage * seriesCount;
        const packCapacityMah = capacityMah * parallelCount;
        const packChargeC = chargeC * parallelCount;

        // Energy for pack
        const energyJ = packVoltage * packChargeC;
        const energyWh = energyJ / 3600;

        this.results = {
            method: 'commercial',
            cellCapacityMah: capacityMah,
            cellVoltage: voltage,
            cellCount,
            seriesCount,
            parallelCount,
            packVoltage,
            packCapacityMah,
            chargeC: packChargeC,
            energyJ,
            energyWh
        };

        return this.results;
    }

    /**
     * Calculate loaded voltage with internal resistance
     * V_loaded = V_cell - I × R_internal
     */
    calculateLoadedVoltage(packVoltage, current, internalR) {
        const voltageDrop = current * internalR;
        const loadedVoltage = packVoltage - voltageDrop;
        const powerLoss = current * current * internalR; // I²R loss

        return {
            openCircuitVoltage: packVoltage,
            loadedVoltage: Math.max(0, loadedVoltage),
            voltageDrop,
            current,
            internalR,
            powerLossW: powerLoss
        };
    }

    /**
     * Estimate runtime given capacity and current draw
     */
    estimateRuntime(capacityMah, currentA) {
        if (currentA <= 0) return { hours: Infinity, minutes: Infinity };

        const capacityAh = capacityMah / 1000;
        const hours = capacityAh / currentA;
        const minutes = hours * 60;

        return {
            hours,
            minutes,
            capacityMah,
            currentA,
            note: 'Approximate - actual runtime depends on discharge curve and cutoff voltage'
        };
    }

    /**
     * Generate step-by-step work for stoichiometry calculation
     */
    generateWorkSteps() {
        if (!this.results || this.results.method !== 'stoichiometry') {
            return '';
        }

        const r = this.results;
        const F = this.constants.FARADAY;

        return `
      <div class="work-step">
        <span class="work-step__number">1</span>
        <div class="work-step__content">
          <strong>Calculate moles of each reactant:</strong>
          <p class="work-step__formula">n(Zn) = mass / M = ${r.molesZn.toFixed(5)} mol</p>
          <p class="work-step__formula">n(MnO₂) = mass / M = ${r.molesMnO2.toFixed(5)} mol</p>
        </div>
      </div>
      
      <div class="work-step">
        <span class="work-step__number">2</span>
        <div class="work-step__content">
          <strong>Identify limiting reagent (ratio 1:2):</strong>
          <p class="work-step__formula">Limiting reagent: <strong class="text-cyan">${r.limitingReagent}</strong></p>
          <p class="work-step__formula">Excess ${r.excessReagent}: ${r.excessMoles.toFixed(5)} mol</p>
        </div>
      </div>
      
      <div class="work-step">
        <span class="work-step__number">3</span>
        <div class="work-step__content">
          <strong>Calculate electrons transferred:</strong>
          <p class="work-step__formula">n(e⁻) = n(reaction) × ${r.electronsPerRxn} = ${r.molesElectrons.toFixed(5)} mol</p>
        </div>
      </div>
      
      <div class="work-step">
        <span class="work-step__number">4</span>
        <div class="work-step__content">
          <strong>Calculate total charge:</strong>
          <p class="work-step__formula">Q = n(e⁻) × F = ${r.molesElectrons.toFixed(5)} × ${F}</p>
          <p class="work-step__formula">Q = <strong class="text-teal">${r.chargeC.toFixed(2)} C</strong></p>
        </div>
      </div>
      
      <div class="work-step">
        <span class="work-step__number">5</span>
        <div class="work-step__content">
          <strong>Calculate energy:</strong>
          <p class="work-step__formula">E = V × Q = ${r.voltage} × ${r.chargeC.toFixed(2)}</p>
          <p class="work-step__formula">E = ${r.energyJ.toFixed(2)} J = <strong class="text-teal">${r.energyWh.toFixed(4)} Wh</strong></p>
        </div>
      </div>
      
      <div class="work-step">
        <span class="work-step__number">6</span>
        <div class="work-step__content">
          <strong>Convert to capacity (mAh):</strong>
          <p class="work-step__formula">Capacity = Q / 3.6 = <strong class="text-teal">${r.capacityMah.toFixed(2)} mAh</strong></p>
        </div>
      </div>
    `;
    }
}

/* ============================================
   Battery Calculator UI Class
   ============================================ */
class BatteryCalculatorUI {
    constructor() {
        this.calculator = new BatteryCalculator();
        this.currentPreset = null;
        this.init();
    }

    init() {
        this.bindElements();
        this.bindEvents();
        this.loadFromURL();
    }

    bindElements() {
        // Input elements
        this.presetBtns = document.querySelectorAll('[data-battery-preset]');
        this.inputMode = document.getElementById('input-mode');
        this.inputZnMass = document.getElementById('input-zn-mass');
        this.inputMno2Mass = document.getElementById('input-mno2-mass');
        this.inputCapacity = document.getElementById('input-capacity');
        this.inputVoltage = document.getElementById('input-voltage');
        this.inputCellCount = document.getElementById('input-cell-count');
        this.inputSeries = document.getElementById('input-series');
        this.inputParallel = document.getElementById('input-parallel');
        this.inputInternalR = document.getElementById('input-internal-r');
        this.inputMotorCurrent = document.getElementById('input-motor-current');

        // Display elements
        this.displayInternalR = document.getElementById('display-internal-r');

        // Result elements
        this.resultCharge = document.getElementById('result-charge');
        this.resultEnergy = document.getElementById('result-energy');
        this.resultEnergyWh = document.getElementById('result-energy-wh');
        this.resultCapacity = document.getElementById('result-capacity');
        this.resultPackVoltage = document.getElementById('result-pack-voltage');
        this.resultLoadedVoltage = document.getElementById('result-loaded-voltage');
        this.resultRuntime = document.getElementById('result-runtime');
        this.resultLimiting = document.getElementById('result-limiting');

        // Work steps container
        this.workSteps = document.getElementById('chemistry-work-steps');

        // Action buttons
        this.btnExport = document.getElementById('btn-chemistry-export');
        this.btnShare = document.getElementById('btn-chemistry-share');
        this.btnUseInPhysics = document.getElementById('btn-use-in-physics');
    }

    bindEvents() {
        // Preset buttons
        this.presetBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const presetKey = btn.dataset.batteryPreset;
                this.loadPreset(presetKey);
            });
        });

        // Input changes
        const inputs = [
            this.inputZnMass, this.inputMno2Mass, this.inputCapacity,
            this.inputVoltage, this.inputCellCount, this.inputSeries,
            this.inputParallel, this.inputMotorCurrent
        ];

        inputs.forEach(input => {
            if (input) {
                input.addEventListener('input', () => this.calculate());
            }
        });

        // Internal resistance slider
        if (this.inputInternalR) {
            this.inputInternalR.addEventListener('input', () => {
                if (this.displayInternalR) {
                    this.displayInternalR.textContent = `${this.inputInternalR.value} Ω`;
                }
                this.calculate();
            });
        }

        // Mode toggle (stoichiometry vs commercial)
        if (this.inputMode) {
            this.inputMode.addEventListener('change', () => {
                this.toggleInputMode();
                this.calculate();
            });
        }

        // Action buttons
        if (this.btnExport) {
            this.btnExport.addEventListener('click', () => this.exportResults());
        }

        if (this.btnShare) {
            this.btnShare.addEventListener('click', () => this.shareLink());
        }

        if (this.btnUseInPhysics) {
            this.btnUseInPhysics.addEventListener('click', () => this.transferToPhysics());
        }
    }

    loadPreset(presetKey) {
        const preset = BATTERY_PRESETS[presetKey];
        if (!preset) return;

        this.currentPreset = presetKey;

        // Update inputs based on preset
        if (preset.znMass !== null && this.inputZnMass) {
            this.inputZnMass.value = preset.znMass;
        }
        if (preset.mno2Mass !== null && this.inputMno2Mass) {
            this.inputMno2Mass.value = preset.mno2Mass;
        }
        if (preset.capacityMah !== null && this.inputCapacity) {
            this.inputCapacity.value = preset.capacityMah;
        }
        if (this.inputVoltage) {
            this.inputVoltage.value = preset.voltage;
        }
        if (this.inputSeries) {
            this.inputSeries.value = preset.series;
        }
        if (this.inputParallel) {
            this.inputParallel.value = preset.parallel;
        }
        if (this.inputInternalR) {
            this.inputInternalR.value = preset.internalR;
            if (this.displayInternalR) {
                this.displayInternalR.textContent = `${preset.internalR} Ω`;
            }
        }

        // Toggle mode based on preset
        const useCommercial = preset.znMass === null;
        if (this.inputMode) {
            this.inputMode.value = useCommercial ? 'commercial' : 'stoichiometry';
            this.toggleInputMode();
        }

        // Highlight active preset
        this.presetBtns.forEach(btn => {
            btn.classList.toggle('preset-btn--active', btn.dataset.batteryPreset === presetKey);
        });

        this.calculate();
    }

    toggleInputMode() {
        const mode = this.inputMode?.value || 'commercial';
        const stoichInputs = document.getElementById('stoich-inputs');
        const commercialInputs = document.getElementById('commercial-inputs');

        if (stoichInputs) {
            stoichInputs.style.display = mode === 'stoichiometry' ? 'block' : 'none';
        }
        if (commercialInputs) {
            commercialInputs.style.display = mode === 'commercial' ? 'block' : 'none';
        }
    }

    calculate() {
        const mode = this.inputMode?.value || 'commercial';
        const voltage = parseFloat(this.inputVoltage?.value) || 1.5;
        const series = parseInt(this.inputSeries?.value) || 1;
        const parallel = parseInt(this.inputParallel?.value) || 1;
        const internalR = parseFloat(this.inputInternalR?.value) || 0.3;
        const motorCurrent = parseFloat(this.inputMotorCurrent?.value) || 0;

        let results;

        if (mode === 'stoichiometry') {
            const znMass = parseFloat(this.inputZnMass?.value) || 1;
            const mno2Mass = parseFloat(this.inputMno2Mass?.value) || 2;
            results = this.calculator.calculateFromMass(znMass, mno2Mass, voltage);
        } else {
            const capacity = parseFloat(this.inputCapacity?.value) || 2000;
            results = this.calculator.calculateFromCapacity(capacity, voltage, series * parallel, series, parallel);
        }

        // Calculate loaded voltage if motor current is specified
        const packVoltage = voltage * series;
        const packInternalR = internalR * series / parallel;

        let loadedResults = null;
        if (motorCurrent > 0) {
            loadedResults = this.calculator.calculateLoadedVoltage(packVoltage, motorCurrent, packInternalR);
        }

        // Calculate runtime
        const capacityMah = results.packCapacityMah || results.capacityMah || 0;
        const runtime = motorCurrent > 0 ? this.calculator.estimateRuntime(capacityMah, motorCurrent) : null;

        // Store for physics transfer
        this.lastResults = {
            ...results,
            loadedResults,
            runtime,
            packVoltage,
            packInternalR,
            motorCurrent
        };

        // Save to localStorage for physics import
        window.ChargedUP?.AppState?.save('battery_results', JSON.stringify(this.lastResults));

        this.displayResults(results, loadedResults, runtime);
    }

    displayResults(results, loadedResults, runtime) {
        // Update result displays
        if (this.resultCharge) {
            this.resultCharge.textContent = `${results.chargeC?.toFixed(2) || '—'} C`;
        }
        if (this.resultEnergy) {
            this.resultEnergy.textContent = `${results.energyJ?.toFixed(2) || '—'} J`;
        }
        if (this.resultEnergyWh) {
            this.resultEnergyWh.textContent = `${results.energyWh?.toFixed(4) || '—'} Wh`;
        }
        if (this.resultCapacity) {
            const cap = results.packCapacityMah || results.capacityMah;
            this.resultCapacity.textContent = `${cap?.toFixed(0) || '—'} mAh`;
        }
        if (this.resultPackVoltage) {
            const v = results.packVoltage || results.voltage;
            this.resultPackVoltage.textContent = `${v?.toFixed(2) || '—'} V`;
        }
        if (this.resultLoadedVoltage && loadedResults) {
            this.resultLoadedVoltage.textContent = `${loadedResults.loadedVoltage?.toFixed(2)} V`;
        }
        if (this.resultRuntime && runtime) {
            if (runtime.minutes < 60) {
                this.resultRuntime.textContent = `≈ ${runtime.minutes.toFixed(1)} min`;
            } else {
                this.resultRuntime.textContent = `≈ ${runtime.hours.toFixed(2)} hrs`;
            }
        }
        if (this.resultLimiting && results.limitingReagent) {
            this.resultLimiting.textContent = results.limitingReagent;
        }

        // Update work steps
        if (this.workSteps && results.method === 'stoichiometry') {
            this.workSteps.innerHTML = this.calculator.generateWorkSteps();
        }
    }

    loadFromURL() {
        const params = new URLSearchParams(window.location.search);

        if (params.has('preset')) {
            this.loadPreset(params.get('preset'));
        } else {
            // Load individual params
            if (params.has('znMass') && this.inputZnMass) {
                this.inputZnMass.value = params.get('znMass');
            }
            if (params.has('mno2Mass') && this.inputMno2Mass) {
                this.inputMno2Mass.value = params.get('mno2Mass');
            }
            if (params.has('capacity') && this.inputCapacity) {
                this.inputCapacity.value = params.get('capacity');
            }
            if (params.has('voltage') && this.inputVoltage) {
                this.inputVoltage.value = params.get('voltage');
            }

            this.calculate();
        }
    }

    exportResults() {
        if (this.lastResults) {
            window.ChargedUP?.ExportUtils?.exportJSON(this.lastResults, 'chargedup-battery-results.json');
        }
    }

    shareLink() {
        const params = {
            mode: this.inputMode?.value,
            voltage: this.inputVoltage?.value,
            series: this.inputSeries?.value,
            internalR: this.inputInternalR?.value
        };

        if (this.inputMode?.value === 'stoichiometry') {
            params.znMass = this.inputZnMass?.value;
            params.mno2Mass = this.inputMno2Mass?.value;
        } else {
            params.capacity = this.inputCapacity?.value;
        }

        const url = window.ChargedUP?.DeepLinking?.generateShareURL(params);
        window.ChargedUP?.DeepLinking?.copyToClipboard(url);
    }

    transferToPhysics() {
        if (!this.lastResults) {
            this.calculate();
        }

        // Save to localStorage
        localStorage.setItem('chargedup_battery_for_physics', JSON.stringify(this.lastResults));

        // Navigate to physics with params
        const params = new URLSearchParams({
            fromBattery: 'true',
            voltage: this.lastResults.packVoltage || this.lastResults.voltage,
            current: this.lastResults.motorCurrent || 0.5
        });

        window.location.href = `physics.html?${params.toString()}`;
    }
}

/* ============================================
   Battery Discharge Animation
   ============================================ */
class BatteryAnimation {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.electrons = [];
        this.running = false;

        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }

    start() {
        this.running = true;
        this.createElectrons();
        this.animate();
    }

    stop() {
        this.running = false;
    }

    createElectrons() {
        this.electrons = [];
        for (let i = 0; i < 15; i++) {
            this.electrons.push({
                x: 50,
                y: this.canvas.height / 2 + (Math.random() - 0.5) * 40,
                speed: 2 + Math.random() * 2,
                delay: i * 200
            });
        }
    }

    animate() {
        if (!this.running) return;

        this.ctx.fillStyle = 'rgba(7, 23, 51, 0.3)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const now = Date.now();

        this.electrons.forEach(e => {
            if (now < e.delay) return;

            e.x += e.speed;

            // Reset when reaching end
            if (e.x > this.canvas.width - 50) {
                e.x = 50;
                e.y = this.canvas.height / 2 + (Math.random() - 0.5) * 40;
            }

            // Draw electron
            this.ctx.beginPath();
            this.ctx.arc(e.x, e.y, 5, 0, Math.PI * 2);
            this.ctx.fillStyle = '#00D1FF';
            this.ctx.fill();

            // Glow effect
            this.ctx.beginPath();
            this.ctx.arc(e.x, e.y, 8, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(0, 209, 255, 0.3)';
            this.ctx.fill();
        });

        // Draw wire path
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(50, this.canvas.height / 2);
        this.ctx.lineTo(this.canvas.width - 50, this.canvas.height / 2);
        this.ctx.stroke();

        requestAnimationFrame(() => this.animate());
    }
}

/* ============================================
   Initialize on DOM Ready
   ============================================ */
let batteryCalculatorUI = null;
let batteryAnimation = null;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize calculator if on chemistry page
    if (document.getElementById('battery-calculator')) {
        batteryCalculatorUI = new BatteryCalculatorUI();
    }

    // Initialize animation if canvas exists
    const animCanvas = document.getElementById('electron-flow-canvas');
    if (animCanvas) {
        batteryAnimation = new BatteryAnimation('electron-flow-canvas');
        batteryAnimation.start();
    }
});

// Export to global namespace
window.ChargedUP.BatteryCalculator = BatteryCalculator;
window.ChargedUP.BatteryCalculatorUI = BatteryCalculatorUI;
window.ChargedUP.BatteryAnimation = BatteryAnimation;
window.ChargedUP.BATTERY_PRESETS = BATTERY_PRESETS;
window.ChargedUP.CHEMISTRY_CONSTANTS = CHEMISTRY_CONSTANTS;
