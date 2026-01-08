/**
 * ChargedUP: Behind The Scenes of an RC Car
 * Physics Module - Motor & Magnetic Field Simulator
 * December 20th
 * 
 * Implements magnetic field calculations, DC motor conceptual model,
 * and speed estimation with clear approximation disclaimers.
 */

window.ChargedUP = window.ChargedUP || {};

/* ============================================
   Physics Constants (with source citations)
   ============================================ */
const PHYSICS_CONSTANTS = {
    // Permeability of free space (NIST CODATA 2018)
    MU_0: 4 * Math.PI * 1e-7, // H/m ≈ 1.2566e-6

    // Relative permeability of common materials
    MU_R: {
        air: 1,
        ferrite: 2000,
        iron: 4000,
        steel: 4500
    },

    // Typical small DC motor parameters (educational approximations)
    MOTOR_DEFAULTS: {
        armatureResistance: 3, // Ω
        noLoadCurrent: 0.1, // A
        stallCurrent: 2, // A (at rated voltage)
        typicalRPM: 6000, // at no load
        coilTurns: 50
    }
};

/* ============================================
   Motor Presets
   ============================================ */
const MOTOR_PRESETS = {
    'small-dc-motor': {
        name: 'Small Brushed DC Motor (RC Toy)',
        armatureR: 3,
        coilTurns: 50,
        coilRadius: 0.01, // 1 cm
        coilLength: 0.02, // 2 cm
        ratedVoltage: 6,
        noLoadRPM: 6000,
        description: 'Typical motor found in small RC cars'
    },
    'hobby-motor': {
        name: 'Hobby Motor (540 size)',
        armatureR: 0.5,
        coilTurns: 30,
        coilRadius: 0.018,
        coilLength: 0.035,
        ratedVoltage: 7.2,
        noLoadRPM: 15000,
        description: 'Common in 1:10 scale RC vehicles'
    },
    'demo-solenoid': {
        name: 'Demo Coil/Solenoid',
        armatureR: 2,
        coilTurns: 100,
        coilRadius: 0.015,
        coilLength: 0.05,
        ratedVoltage: 6,
        noLoadRPM: null, // Not a rotating motor
        description: 'For B-field demonstration'
    }
};

/* ============================================
   Magnetic Field Calculator
   ============================================ */
class MagneticFieldCalculator {
    constructor() {
        this.constants = PHYSICS_CONSTANTS;
    }

    /**
     * Calculate B-field at center of a solenoid
     * Formula: B = μ₀ × μᵣ × N × I / L
     * 
     * @param {number} turns - Number of turns (N)
     * @param {number} current - Current in Amperes (I)
     * @param {number} length - Length in meters (L)
     * @param {string|number} material - Material name or μᵣ value
     * @returns {object} B-field results
     */
    computeBFieldSolenoid(turns, current, length, material = 'air') {
        const mu0 = this.constants.MU_0;
        const muR = typeof material === 'number'
            ? material
            : (this.constants.MU_R[material] || 1);

        const B = mu0 * muR * turns * current / length;

        return {
            B, // Tesla
            B_mT: B * 1000, // milliTesla
            B_uT: B * 1e6, // microTesla
            formula: 'B = μ₀ × μᵣ × N × I / L',
            inputs: { turns, current, length, muR },
            unit: 'T'
        };
    }

    /**
     * Calculate B-field at center of a single loop/coil
     * Formula: B ≈ μ₀ × N × I / (2 × r)
     * 
     * @param {number} turns - Number of turns (N)
     * @param {number} current - Current in Amperes (I)
     * @param {number} radius - Radius in meters (r)
     * @returns {object} B-field results
     */
    computeBFieldLoop(turns, current, radius) {
        const mu0 = this.constants.MU_0;
        const B = mu0 * turns * current / (2 * radius);

        return {
            B,
            B_mT: B * 1000,
            B_uT: B * 1e6,
            formula: 'B ≈ μ₀ × N × I / (2r)',
            inputs: { turns, current, radius },
            unit: 'T',
            note: 'Approximation valid at center of loop'
        };
    }

    /**
     * Calculate B-field around a straight wire
     * Formula: B = μ₀ × I / (2π × r)
     * 
     * @param {number} current - Current in Amperes (I)
     * @param {number} distance - Distance from wire in meters (r)
     * @returns {object} B-field results
     */
    computeBFieldWire(current, distance) {
        const mu0 = this.constants.MU_0;
        const B = mu0 * current / (2 * Math.PI * distance);

        return {
            B,
            B_mT: B * 1000,
            B_uT: B * 1e6,
            formula: 'B = μ₀ × I / (2πr)',
            inputs: { current, distance },
            unit: 'T',
            note: 'From Ampère\'s law for infinite straight wire'
        };
    }

    /**
     * Generate step-by-step work for solenoid calculation
     */
    generateWorkSteps(type, inputs, result) {
        const mu0 = this.constants.MU_0.toExponential(4);

        if (type === 'solenoid') {
            return `
        <div class="work-step">
          <span class="work-step__number">1</span>
          <div class="work-step__content">
            <strong>Identify known values:</strong>
            <p class="work-step__formula">N = ${inputs.turns} turns</p>
            <p class="work-step__formula">I = ${inputs.current} A</p>
            <p class="work-step__formula">L = ${inputs.length} m</p>
            <p class="work-step__formula">μᵣ = ${inputs.muR}</p>
          </div>
        </div>
        
        <div class="work-step">
          <span class="work-step__number">2</span>
          <div class="work-step__content">
            <strong>Apply solenoid formula:</strong>
            <p class="work-step__formula">B = μ₀ × μᵣ × N × I / L</p>
            <p class="work-step__formula">B = (${mu0}) × ${inputs.muR} × ${inputs.turns} × ${inputs.current} / ${inputs.length}</p>
          </div>
        </div>
        
        <div class="work-step">
          <span class="work-step__number">3</span>
          <div class="work-step__content">
            <strong>Calculate:</strong>
            <p class="work-step__formula">B = <strong class="text-teal">${result.B.toExponential(4)} T</strong></p>
            <p class="work-step__formula">B = <strong class="text-cyan">${result.B_mT.toFixed(4)} mT</strong></p>
          </div>
        </div>
      `;
        }

        return '';
    }
}

/* ============================================
   Motor Speed Estimator (Conceptual Model)
   ============================================ */
class MotorSpeedEstimator {
    /**
     * IMPORTANT: This is a simplified educational model.
     * Real motor behavior depends on many factors not modeled here.
     * 
     * Simple proportional model:
     * Speed ≈ (V_applied - I × R_armature) / k
     * where k is the motor constant (approximated from no-load conditions)
     */

    constructor(preset = MOTOR_PRESETS['small-dc-motor']) {
        this.preset = preset;
        this.constants = PHYSICS_CONSTANTS.MOTOR_DEFAULTS;
    }

    /**
     * Calculate steady-state current given supply and motor resistance
     * I = V / (R_motor + R_internal)
     */
    computeLoadedCurrent(supplyVoltage, motorR, internalR = 0) {
        const totalR = motorR + internalR;
        if (totalR <= 0) return { current: 0, note: 'Invalid resistance' };

        const current = supplyVoltage / totalR;

        return {
            current,
            supplyVoltage,
            motorR,
            internalR,
            totalR,
            powerMotor: current * current * motorR,
            powerLoss: current * current * internalR,
            note: 'Simplified steady-state model (ignores back-EMF at startup)'
        };
    }

    /**
     * Estimate motor speed from current (proportional model)
     * 
     * This is a SIMPLIFIED educational approximation:
     * - At no-load, motor spins at max RPM with minimal current
     * - At stall, motor has zero RPM and maximum current
     * - Linear interpolation in between
     * 
     * DISCLAIMER: Actual motor behavior is more complex and depends
     * on load, back-EMF, magnetic saturation, friction, etc.
     */
    estimateSpeed(current, supplyVoltage) {
        const noLoadRPM = this.preset.noLoadRPM;
        const ratedVoltage = this.preset.ratedVoltage;
        const armatureR = this.preset.armatureR;

        if (!noLoadRPM) {
            return { rpm: null, note: 'Not a rotating motor' };
        }

        // Scale by voltage ratio
        const voltageRatio = Math.min(supplyVoltage / ratedVoltage, 1.5);

        // Back-EMF reduces effective voltage and thus speed
        // Simplified: RPM ∝ (V - IR)
        const backEMFvoltage = current * armatureR;
        const effectiveVoltage = supplyVoltage - backEMFvoltage;

        // Approximate RPM
        const speedRatio = Math.max(0, effectiveVoltage / ratedVoltage);
        const rpm = noLoadRPM * speedRatio * voltageRatio;

        return {
            rpm: Math.round(rpm),
            speedPercent: (speedRatio * 100).toFixed(1),
            effectiveVoltage: effectiveVoltage.toFixed(2),
            backEMFvoltage: backEMFvoltage.toFixed(2),
            disclaimer: '⚠️ Approximate educational estimate only. Actual RPM varies with load, motor design, and operating conditions.',
            note: 'Simple proportional model: RPM ∝ (V - IR)'
        };
    }

    /**
     * Get dial position for gauge (0-180 degrees)
     */
    getGaugeAngle(rpm) {
        const maxRPM = this.preset.noLoadRPM || 6000;
        const ratio = Math.min(rpm / maxRPM, 1);
        return -90 + (ratio * 180); // -90 = left, 90 = right
    }
}

/* ============================================
   Motor Simulator UI Class
   ============================================ */
class MotorSimulatorUI {
    constructor() {
        this.fieldCalc = new MagneticFieldCalculator();
        this.speedEstimator = new MotorSpeedEstimator();
        this.currentPreset = null;
        this.init();
    }

    init() {
        this.bindElements();
        this.bindEvents();
        this.loadFromURL();
        this.checkBatteryImport();
    }

    bindElements() {
        // Preset buttons
        this.presetBtns = document.querySelectorAll('[data-motor-preset]');

        // Input elements
        this.inputVoltage = document.getElementById('input-supply-voltage');
        this.inputCurrent = document.getElementById('input-current');
        this.displayCurrent = document.getElementById('display-current');
        this.inputMotorR = document.getElementById('input-motor-r');
        this.inputCoilTurns = document.getElementById('input-coil-turns');
        this.inputCoilLength = document.getElementById('input-coil-length');
        this.inputMaterial = document.getElementById('input-material');
        this.inputBatteryR = document.getElementById('input-battery-r');

        // Import checkbox
        this.importBattery = document.getElementById('import-from-battery');

        // Result elements
        this.resultBField = document.getElementById('result-b-field');
        this.resultFormula = document.getElementById('result-formula');
        this.resultCurrent = document.getElementById('result-current');
        this.resultPower = document.getElementById('result-power');

        // Motor gauge elements
        this.gaugeValue = document.getElementById('gauge-value');
        this.gaugeDial = document.getElementById('gauge-dial');
        this.gaugeLabel = document.getElementById('gauge-label');

        // Work steps container
        this.workSteps = document.getElementById('physics-work-steps');

        // Canvas for field visualization
        this.fieldCanvas = document.getElementById('field-canvas');

        // Action buttons
        this.btnExport = document.getElementById('btn-physics-export');
        this.btnShare = document.getElementById('btn-physics-share');
    }

    bindEvents() {
        // Preset buttons
        this.presetBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const presetKey = btn.dataset.motorPreset;
                this.loadPreset(presetKey);
            });
        });

        // Current slider
        if (this.inputCurrent) {
            this.inputCurrent.addEventListener('input', () => {
                if (this.displayCurrent) {
                    this.displayCurrent.textContent = `${this.inputCurrent.value} A`;
                }
                this.calculate();
            });
        }

        // Other inputs
        const inputs = [
            this.inputVoltage, this.inputMotorR, this.inputCoilTurns,
            this.inputCoilLength, this.inputMaterial, this.inputBatteryR
        ];

        inputs.forEach(input => {
            if (input) {
                input.addEventListener('input', () => this.calculate());
                input.addEventListener('change', () => this.calculate());
            }
        });

        // Import from battery checkbox
        if (this.importBattery) {
            this.importBattery.addEventListener('change', () => {
                if (this.importBattery.checked) {
                    this.importBatteryData();
                }
            });
        }

        // Action buttons
        if (this.btnExport) {
            this.btnExport.addEventListener('click', () => this.exportResults());
        }

        if (this.btnShare) {
            this.btnShare.addEventListener('click', () => this.shareLink());
        }
    }

    loadPreset(presetKey) {
        const preset = MOTOR_PRESETS[presetKey];
        if (!preset) return;

        this.currentPreset = presetKey;
        this.speedEstimator = new MotorSpeedEstimator(preset);

        // Update inputs
        if (this.inputMotorR) this.inputMotorR.value = preset.armatureR;
        if (this.inputCoilTurns) this.inputCoilTurns.value = preset.coilTurns;
        if (this.inputCoilLength) this.inputCoilLength.value = preset.coilLength * 100; // cm
        if (this.inputVoltage) this.inputVoltage.value = preset.ratedVoltage;

        // Highlight active preset
        this.presetBtns.forEach(btn => {
            btn.classList.toggle('preset-btn--active', btn.dataset.motorPreset === presetKey);
        });

        this.calculate();
    }

    checkBatteryImport() {
        const params = new URLSearchParams(window.location.search);
        if (params.get('fromBattery') === 'true') {
            const voltage = parseFloat(params.get('voltage'));
            const current = parseFloat(params.get('current'));

            if (voltage && this.inputVoltage) this.inputVoltage.value = voltage;
            if (current && this.inputCurrent) {
                this.inputCurrent.value = current;
                if (this.displayCurrent) this.displayCurrent.textContent = `${current} A`;
            }

            this.calculate();
        }
    }

    importBatteryData() {
        const storedData = localStorage.getItem('chargedup_battery_for_physics');
        if (!storedData) {
            alert('No battery data found. Please run the battery calculator first.');
            this.importBattery.checked = false;
            return;
        }

        try {
            const data = JSON.parse(storedData);

            if (data.packVoltage && this.inputVoltage) {
                this.inputVoltage.value = data.packVoltage;
            }
            if (data.packInternalR && this.inputBatteryR) {
                this.inputBatteryR.value = data.packInternalR;
            }
            if (data.motorCurrent && this.inputCurrent) {
                this.inputCurrent.value = data.motorCurrent;
                if (this.displayCurrent) {
                    this.displayCurrent.textContent = `${data.motorCurrent} A`;
                }
            }

            this.calculate();
        } catch (e) {
            console.error('Failed to parse battery data:', e);
        }
    }

    calculate() {
        const voltage = parseFloat(this.inputVoltage?.value) || 6;
        const current = parseFloat(this.inputCurrent?.value) || 1;
        const motorR = parseFloat(this.inputMotorR?.value) || 3;
        const coilTurns = parseInt(this.inputCoilTurns?.value) || 50;
        const coilLengthCm = parseFloat(this.inputCoilLength?.value) || 5;
        const coilLength = coilLengthCm / 100; // Convert to meters
        const material = this.inputMaterial?.value || 'air';
        const batteryR = parseFloat(this.inputBatteryR?.value) || 0;

        // Calculate B-field
        const bFieldResult = this.fieldCalc.computeBFieldSolenoid(
            coilTurns, current, coilLength, material
        );

        // Calculate loaded current if battery R is specified
        const currentResult = this.speedEstimator.computeLoadedCurrent(
            voltage, motorR, batteryR
        );

        // Estimate motor speed
        const speedResult = this.speedEstimator.estimateSpeed(current, voltage);

        // Store results
        this.lastResults = {
            bField: bFieldResult,
            current: currentResult,
            speed: speedResult,
            inputs: { voltage, current, motorR, coilTurns, coilLength, material }
        };

        this.displayResults(bFieldResult, currentResult, speedResult);
        this.updateFieldCanvas(bFieldResult, current);
        this.updateWorkSteps('solenoid', bFieldResult.inputs, bFieldResult);
    }

    displayResults(bField, currentRes, speed) {
        // B-field result
        if (this.resultBField) {
            if (bField.B_mT > 0.001) {
                this.resultBField.textContent = `${bField.B_mT.toFixed(4)} mT`;
            } else {
                this.resultBField.textContent = `${bField.B_uT.toFixed(2)} μT`;
            }
        }

        if (this.resultFormula) {
            this.resultFormula.textContent = bField.formula;
        }

        if (this.resultCurrent) {
            this.resultCurrent.textContent = `${currentRes.current.toFixed(3)} A`;
        }

        if (this.resultPower) {
            this.resultPower.textContent = `${currentRes.powerMotor.toFixed(2)} W`;
        }

        // Update motor gauge
        if (speed.rpm !== null) {
            if (this.gaugeValue) {
                this.gaugeValue.textContent = `≈ ${speed.rpm} RPM`;
            }
            if (this.gaugeDial) {
                const angle = this.speedEstimator.getGaugeAngle(speed.rpm);
                this.gaugeDial.style.transform = `translateX(-50%) rotate(${angle}deg)`;
            }
            if (this.gaugeLabel) {
                this.gaugeLabel.textContent = speed.disclaimer;
            }
        }
    }

    updateFieldCanvas(bField, current) {
        if (!this.fieldCanvas) return;

        const ctx = this.fieldCanvas.getContext('2d');
        const w = this.fieldCanvas.width;
        const h = this.fieldCanvas.height;

        // Clear
        ctx.fillStyle = '#071733';
        ctx.fillRect(0, 0, w, h);

        // Draw solenoid coil
        const coilX = w * 0.3;
        const coilW = w * 0.4;
        const coilH = h * 0.4;
        const coilY = (h - coilH) / 2;

        ctx.strokeStyle = '#3EF1C6';
        ctx.lineWidth = 3;
        ctx.strokeRect(coilX, coilY, coilW, coilH);

        // Draw coil windings
        ctx.strokeStyle = 'rgba(0, 209, 255, 0.6)';
        ctx.lineWidth = 1;
        const turns = Math.min(20, bField.inputs.turns / 5);
        for (let i = 0; i < turns; i++) {
            const x = coilX + (i / turns) * coilW;
            ctx.beginPath();
            ctx.moveTo(x, coilY);
            ctx.lineTo(x, coilY + coilH);
            ctx.stroke();
        }

        // Draw field lines (density based on B-field strength)
        const intensity = Math.min(1, bField.B_mT / 10);
        const lineCount = Math.floor(3 + intensity * 10);

        ctx.strokeStyle = `rgba(0, 209, 255, ${0.3 + intensity * 0.5})`;
        ctx.lineWidth = 2;

        for (let i = 0; i < lineCount; i++) {
            const y = coilY + coilH * 0.2 + (i / lineCount) * coilH * 0.6;

            ctx.beginPath();
            // Field lines through center
            ctx.moveTo(coilX - 20, y);
            ctx.lineTo(coilX + coilW + 20, y);
            ctx.stroke();

            // Arrows showing direction
            if (current > 0) {
                ctx.beginPath();
                ctx.moveTo(coilX + coilW / 2, y);
                ctx.lineTo(coilX + coilW / 2 - 8, y - 4);
                ctx.lineTo(coilX + coilW / 2 - 8, y + 4);
                ctx.closePath();
                ctx.fillStyle = '#00D1FF';
                ctx.fill();
            }
        }

        // Label
        ctx.fillStyle = '#F8FAFC';
        ctx.font = '14px Inter, sans-serif';
        ctx.fillText('B-field inside coil', coilX + coilW / 2 - 50, coilY - 10);
        ctx.fillText(`B ≈ ${bField.B_mT.toFixed(3)} mT`, coilX + coilW / 2 - 40, h - 20);
    }

    updateWorkSteps(type, inputs, result) {
        if (this.workSteps) {
            this.workSteps.innerHTML = this.fieldCalc.generateWorkSteps(type, inputs, result);
        }
    }

    loadFromURL() {
        const params = new URLSearchParams(window.location.search);

        if (params.has('preset')) {
            this.loadPreset(params.get('preset'));
        } else {
            if (params.has('voltage') && this.inputVoltage) {
                this.inputVoltage.value = params.get('voltage');
            }
            if (params.has('current') && this.inputCurrent) {
                this.inputCurrent.value = params.get('current');
                if (this.displayCurrent) {
                    this.displayCurrent.textContent = `${params.get('current')} A`;
                }
            }
            if (params.has('turns') && this.inputCoilTurns) {
                this.inputCoilTurns.value = params.get('turns');
            }

            this.calculate();
        }
    }

    exportResults() {
        if (this.lastResults) {
            window.ChargedUP?.ExportUtils?.exportJSON(this.lastResults, 'chargedup-motor-results.json');
        }
    }

    shareLink() {
        const params = {
            voltage: this.inputVoltage?.value,
            current: this.inputCurrent?.value,
            motorR: this.inputMotorR?.value,
            turns: this.inputCoilTurns?.value,
            length: this.inputCoilLength?.value,
            material: this.inputMaterial?.value
        };

        const url = window.ChargedUP?.DeepLinking?.generateShareURL(params);
        window.ChargedUP?.DeepLinking?.copyToClipboard(url);
    }
}

/* ============================================
   Right-Hand Rule Demonstrator
   ============================================ */
class RightHandRuleDemonstrator {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.mode = 'wire'; // 'wire' or 'loop'

        this.resize();
        this.draw();

        window.addEventListener('resize', () => {
            this.resize();
            this.draw();
        });
    }

    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = Math.min(rect.height || 250, 300);
    }

    setMode(mode) {
        this.mode = mode;
        this.draw();
    }

    draw() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Clear
        ctx.fillStyle = '#071733';
        ctx.fillRect(0, 0, w, h);

        if (this.mode === 'wire') {
            this.drawWireRule(ctx, w, h);
        } else {
            this.drawLoopRule(ctx, w, h);
        }
    }

    drawWireRule(ctx, w, h) {
        const centerX = w / 2;
        const centerY = h / 2;

        // Draw wire (vertical)
        ctx.strokeStyle = '#F8FAFC';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(centerX, 20);
        ctx.lineTo(centerX, h - 20);
        ctx.stroke();

        // Current direction arrow (up)
        ctx.fillStyle = '#3EF1C6';
        ctx.beginPath();
        ctx.moveTo(centerX, 30);
        ctx.lineTo(centerX - 10, 50);
        ctx.lineTo(centerX + 10, 50);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#F8FAFC';
        ctx.font = '14px Inter, sans-serif';
        ctx.fillText('I (current)', centerX + 15, 40);

        // Draw magnetic field circles
        ctx.strokeStyle = '#00D1FF';
        ctx.lineWidth = 2;

        [40, 70, 100].forEach(radius => {
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.stroke();

            // Arrow on circle (counterclockwise when viewed from above with current coming toward you)
            const arrowAngle = Math.PI / 4;
            const ax = centerX + radius * Math.cos(arrowAngle);
            const ay = centerY + radius * Math.sin(arrowAngle);

            ctx.fillStyle = '#00D1FF';
            ctx.beginPath();
            ctx.arc(ax, ay, 4, 0, Math.PI * 2);
            ctx.fill();
        });

        // Labels
        ctx.fillStyle = '#00D1FF';
        ctx.fillText('B-field (circles around wire)', 20, h - 20);

        // Thumb/fingers hint
        ctx.fillStyle = '#B6C0C9';
        ctx.font = '12px Inter, sans-serif';
        ctx.fillText('Thumb: current direction', 20, h - 50);
        ctx.fillText('Fingers: curl in B direction', 20, h - 35);
    }

    drawLoopRule(ctx, w, h) {
        const centerX = w / 2;
        const centerY = h / 2;
        const loopRadius = 60;

        // Draw loop
        ctx.strokeStyle = '#F8FAFC';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(centerX, centerY, loopRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Current direction arrows on loop
        ctx.fillStyle = '#3EF1C6';
        const arrowPositions = [0, Math.PI / 2, Math.PI, 3 * Math.PI / 2];
        arrowPositions.forEach(angle => {
            const x = centerX + loopRadius * Math.cos(angle);
            const y = centerY + loopRadius * Math.sin(angle);
            const tangent = angle + Math.PI / 2;

            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.fillStyle = '#F8FAFC';
        ctx.font = '12px Inter, sans-serif';
        ctx.fillText('I (counterclockwise)', centerX - 60, centerY + loopRadius + 25);

        // Draw B-field through center
        ctx.strokeStyle = '#00D1FF';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY + 30);
        ctx.lineTo(centerX, centerY - 50);
        ctx.stroke();

        // Arrow head (pointing up/out of page)
        ctx.fillStyle = '#00D1FF';
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - 50);
        ctx.lineTo(centerX - 8, centerY - 35);
        ctx.lineTo(centerX + 8, centerY - 35);
        ctx.closePath();
        ctx.fill();

        ctx.fillText('B (out of page)', centerX + 15, centerY - 40);

        // Fingers/thumb hint
        ctx.fillStyle = '#B6C0C9';
        ctx.fillText('Fingers: curl with current', 20, h - 35);
        ctx.fillText('Thumb: B-field direction', 20, h - 20);
    }
}

/* ============================================
   Initialize on DOM Ready
   ============================================ */
let motorSimulatorUI = null;
let rightHandRuleDemo = null;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize motor simulator if on physics page
    if (document.getElementById('motor-simulator')) {
        motorSimulatorUI = new MotorSimulatorUI();
    }

    // Initialize right-hand rule demo if canvas exists
    const rhrCanvas = document.getElementById('rhr-canvas');
    if (rhrCanvas) {
        rightHandRuleDemo = new RightHandRuleDemonstrator('rhr-canvas');
    }
});

// Export to global namespace
window.ChargedUP.MagneticFieldCalculator = MagneticFieldCalculator;
window.ChargedUP.MotorSpeedEstimator = MotorSpeedEstimator;
window.ChargedUP.MotorSimulatorUI = MotorSimulatorUI;
window.ChargedUP.RightHandRuleDemonstrator = RightHandRuleDemonstrator;
window.ChargedUP.MOTOR_PRESETS = MOTOR_PRESETS;
window.ChargedUP.PHYSICS_CONSTANTS = PHYSICS_CONSTANTS;
