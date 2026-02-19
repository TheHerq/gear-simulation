// ============================================================
// Symulacja 100 Zębatek — Przełożenie Googol (10^100)
// Pure vanilla JS + Canvas
// ============================================================

(function () {
    "use strict";

    // === CONSTANTS ===
    const NUM_UNITS = 100;
    const LARGE_TEETH = 100;
    const SMALL_TEETH = 10;
    const RATIO = LARGE_TEETH / SMALL_TEETH; // 10:1

    // Visual sizes (pixels)
    const LARGE_RADIUS = 55;
    const SMALL_RADIUS = 11;
    const TOOTH_HEIGHT_LARGE = 6;
    const TOOTH_HEIGHT_SMALL = 5;

    // Layout
    const UNIT_SPACING_X = 140;
    const MESH_DISTANCE = SMALL_RADIUS + LARGE_RADIUS + TOOTH_HEIGHT_SMALL + TOOTH_HEIGHT_LARGE;
    const TOP_ROW_Y = 150;
    const BOTTOM_ROW_Y = TOP_ROW_Y + MESH_DISTANCE;
    const LEFT_MARGIN = 120;

    // Colors
    const COLORS = {
        largeFill: "rgba(83, 216, 251, 0.12)",
        largeStroke: "#53d8fb",
        largeBody: "rgba(83, 216, 251, 0.06)",
        smallFill: "rgba(233, 69, 96, 0.25)",
        smallStroke: "#e94560",
        axle: "#ffd700",
        hub: "#1a1a2e",
        label: "#ffffff",
        unitNum: "#ffd700",
        meshLine: "rgba(83, 216, 251, 0.12)",
        axisLine: "rgba(255, 215, 0, 0.08)",
        spoke: "rgba(83, 216, 251, 0.2)",
        spokeSmall: "rgba(233, 69, 96, 0.3)",
        bg: "#08080e"
    };

    // === STATE ===
    let gear1TotalRotations = 0;
    let prevSliderValue = 0;  // track previous slider position for accumulation
    let autoRotate = false;
    let speedRotPerSec = 1;
    let lastTimestamp = null;
    let animFrameId = null;
    let viewportOffsetX = 0;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartOffset = 0;

    // === DOM ELEMENTS ===
    const canvas = document.getElementById("gear-canvas");
    const ctx = canvas.getContext("2d");
    const container = document.getElementById("canvas-container");
    const manualSlider = document.getElementById("manual-slider");
    const sliderValue = document.getElementById("slider-value");
    const autoRotateBtn = document.getElementById("auto-rotate-btn");
    const resetBtn = document.getElementById("reset-btn");
    const speedValueInput = document.getElementById("speed-value");
    const speedUnitSelect = document.getElementById("speed-unit");
    const scrollLeftBtn = document.getElementById("scroll-left");
    const scrollRightBtn = document.getElementById("scroll-right");
    const viewportInfo = document.getElementById("viewport-info");
    const gotoGearInput = document.getElementById("goto-gear");
    const gotoBtn = document.getElementById("goto-btn");

    // === CANVAS SIZING ===
    function resizeCanvas() {
        canvas.width = container.clientWidth - 20;
        canvas.height = Math.max(container.clientHeight - 20, 420);
    }

    // === GEAR UNIT POSITIONS ===
    // Units alternate rows: even index (0,2,4...) = top, odd index (1,3,5...) = bottom
    function getUnitPosition(unitIndex) {
        const x = LEFT_MARGIN + unitIndex * UNIT_SPACING_X;
        const row = unitIndex % 2; // 0=top, 1=bottom
        const y = row === 0 ? TOP_ROW_Y : BOTTOM_ROW_Y;
        return { x, y, row };
    }

    // === ROTATION MATH ===
    // Unit N (0-indexed) rotates at gear1TotalRotations / 10^N
    function getUnitRotations(unitIndex) {
        if (unitIndex === 0) return gear1TotalRotations;
        const val = gear1TotalRotations / Math.pow(RATIO, unitIndex);
        return isFinite(val) ? val : 0;
    }

    // Visual angle in radians
    // Meshing gears rotate in opposite directions
    function getUnitAngle(unitIndex) {
        const rotations = getUnitRotations(unitIndex);
        // Keep angle bounded to avoid floating point issues with huge numbers
        // Only the fractional part matters for visual rotation
        const fractional = rotations % 1;
        const angle = fractional * 2 * Math.PI;
        const direction = (unitIndex % 2 === 0) ? 1 : -1;
        return isFinite(angle) ? angle * direction : 0;
    }

    // === FORMAT ROTATION COUNT ===
    function formatRotations(value) {
        if (!isFinite(value)) return "∞";
        if (value === 0) return "0";
        const absVal = Math.abs(value);
        if (absVal >= 1000000) {
            return value.toExponential(2);
        } else if (absVal >= 1) {
            return value.toFixed(2);
        } else if (absVal >= 0.001) {
            return value.toFixed(6);
        } else if (absVal > 0) {
            return value.toExponential(3);
        }
        return "0";
    }

    // === FORMAT SLIDER DISPLAY ===
    function formatSliderDisplay(value) {
        if (!isFinite(value)) return "∞";
        if (value === 0) return "0.00";
        const absVal = Math.abs(value);
        if (absVal >= 1e6) {
            return value.toExponential(2);
        } else {
            return value.toFixed(2);
        }
    }

    // === DRAW A GEAR ===
    function drawGear(cx, cy, radius, numTeeth, toothHeight, angle, fillColor, strokeColor, isSmall) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);

        const innerRadius = radius;
        const outerRadius = radius + toothHeight;
        const toothAngle = (2 * Math.PI) / numTeeth;

        // Draw gear outline with teeth
        ctx.beginPath();
        for (let i = 0; i < numTeeth; i++) {
            const a = i * toothAngle;
            // Tooth profile: gap -> rise -> top -> fall -> gap
            const gapFraction = 0.25;
            const riseFraction = 0.12;
            const topFraction = 0.26;
            // fallFraction = riseFraction, remaining = gap end

            const a_gapEnd = a + gapFraction * toothAngle;
            const a_riseEnd = a_gapEnd + riseFraction * toothAngle;
            const a_topEnd = a_riseEnd + topFraction * toothAngle;
            const a_fallEnd = a_topEnd + riseFraction * toothAngle;

            if (i === 0) {
                ctx.moveTo(Math.cos(a) * innerRadius, Math.sin(a) * innerRadius);
            }

            // Along inner radius (gap)
            ctx.lineTo(Math.cos(a_gapEnd) * innerRadius, Math.sin(a_gapEnd) * innerRadius);
            // Rise to outer
            ctx.lineTo(Math.cos(a_riseEnd) * outerRadius, Math.sin(a_riseEnd) * outerRadius);
            // Tooth top
            ctx.lineTo(Math.cos(a_topEnd) * outerRadius, Math.sin(a_topEnd) * outerRadius);
            // Fall to inner
            ctx.lineTo(Math.cos(a_fallEnd) * innerRadius, Math.sin(a_fallEnd) * innerRadius);
            // Continue to next tooth start
            ctx.lineTo(Math.cos(a + toothAngle) * innerRadius, Math.sin(a + toothAngle) * innerRadius);
        }
        ctx.closePath();

        ctx.fillStyle = fillColor;
        ctx.fill();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = isSmall ? 1.5 : 1;
        ctx.stroke();

        // Inner body circle for large gears
        if (!isSmall) {
            ctx.beginPath();
            ctx.arc(0, 0, innerRadius * 0.7, 0, 2 * Math.PI);
            ctx.fillStyle = COLORS.largeBody;
            ctx.fill();
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 0.5;
            ctx.globalAlpha = 0.4;
            ctx.stroke();
            ctx.globalAlpha = 1;
        }

        // Spokes
        const numSpokes = isSmall ? 3 : 6;
        ctx.strokeStyle = isSmall ? COLORS.spokeSmall : COLORS.spoke;
        ctx.lineWidth = isSmall ? 1 : 1.5;
        for (let i = 0; i < numSpokes; i++) {
            const sa = (i / numSpokes) * 2 * Math.PI;
            const hubR = isSmall ? 3 : radius * 0.12;
            const spokeEnd = isSmall ? innerRadius * 0.7 : innerRadius * 0.68;
            ctx.beginPath();
            ctx.moveTo(Math.cos(sa) * hubR, Math.sin(sa) * hubR);
            ctx.lineTo(Math.cos(sa) * spokeEnd, Math.sin(sa) * spokeEnd);
            ctx.stroke();
        }

        // Center hub
        const hubRadius = isSmall ? 3 : radius * 0.12;
        ctx.beginPath();
        ctx.arc(0, 0, hubRadius, 0, 2 * Math.PI);
        ctx.fillStyle = COLORS.hub;
        ctx.fill();
        ctx.strokeStyle = COLORS.axle;
        ctx.lineWidth = isSmall ? 1.5 : 2;
        ctx.stroke();

        ctx.restore();
    }

    // === DRAW ROTATION LABEL ===
    function drawLabel(cx, cy, unitIndex, isTopRow) {
        const rotations = getUnitRotations(unitIndex);
        const text = formatRotations(rotations) + " obr.";
        const unitNum = "#" + (unitIndex + 1);

        // Labels: above for top row, below for bottom row
        const offset = LARGE_RADIUS + TOOTH_HEIGHT_LARGE + 18;
        const labelY = isTopRow ? cy - offset : cy + offset + 12;

        ctx.save();
        ctx.textAlign = "center";

        // Unit number
        ctx.font = "bold 12px 'Courier New', monospace";
        ctx.fillStyle = COLORS.unitNum;
        ctx.fillText(unitNum, cx, labelY);

        // Rotation count
        ctx.font = "10px 'Courier New', monospace";
        ctx.fillStyle = COLORS.label;
        const countY = isTopRow ? labelY + 14 : labelY + 14;
        ctx.fillText(text, cx, countY);

        ctx.restore();
    }

    // === MAIN RENDER ===
    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Background
        ctx.fillStyle = COLORS.bg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Determine visible range (only draw what's on screen)
        const startUnit = Math.max(0, Math.floor((viewportOffsetX - LEFT_MARGIN - LARGE_RADIUS) / UNIT_SPACING_X));
        const visibleCount = Math.ceil(canvas.width / UNIT_SPACING_X) + 3;
        const endUnit = Math.min(NUM_UNITS, startUnit + visibleCount);

        ctx.save();
        ctx.translate(-viewportOffsetX, 0);

        // Draw axis lines (two parallel shafts)
        ctx.strokeStyle = COLORS.axisLine;
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 10]);
        const lineLeft = viewportOffsetX - 20;
        const lineRight = viewportOffsetX + canvas.width + 20;
        ctx.beginPath();
        ctx.moveTo(lineLeft, TOP_ROW_Y);
        ctx.lineTo(lineRight, TOP_ROW_Y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(lineLeft, BOTTOM_ROW_Y);
        ctx.lineTo(lineRight, BOTTOM_ROW_Y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw mesh connection lines between consecutive units
        for (let i = startUnit; i < Math.min(endUnit, NUM_UNITS - 1); i++) {
            const pos1 = getUnitPosition(i);
            const pos2 = getUnitPosition(i + 1);
            ctx.beginPath();
            ctx.moveTo(pos1.x, pos1.y);
            ctx.lineTo(pos2.x, pos2.y);
            ctx.strokeStyle = COLORS.meshLine;
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 6]);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Draw each visible gear unit
        for (let i = startUnit; i < endUnit; i++) {
            const pos = getUnitPosition(i);
            const angle = getUnitAngle(i);
            const isTopRow = pos.row === 0;

            // Large gear (100 teeth)
            drawGear(
                pos.x, pos.y,
                LARGE_RADIUS, LARGE_TEETH, TOOTH_HEIGHT_LARGE,
                angle,
                COLORS.largeFill, COLORS.largeStroke,
                false
            );

            // Small pinion (10 teeth) - same axle, same center, same angle
            drawGear(
                pos.x, pos.y,
                SMALL_RADIUS, SMALL_TEETH, TOOTH_HEIGHT_SMALL,
                angle,
                COLORS.smallFill, COLORS.smallStroke,
                true
            );

            // Rotation label
            drawLabel(pos.x, pos.y, i, isTopRow);
        }

        ctx.restore();

        // Update viewport info text
        const firstVis = Math.max(1, Math.floor(viewportOffsetX / UNIT_SPACING_X) + 1);
        const lastVis = Math.min(NUM_UNITS, firstVis + Math.floor(canvas.width / UNIT_SPACING_X) + 1);
        viewportInfo.textContent = "Z\u0119batki: " + firstVis + "\u2013" + lastVis;
    }

    // === ANIMATION LOOP ===
    function animate(timestamp) {
        if (autoRotate) {
            if (lastTimestamp === null) {
                lastTimestamp = timestamp;
            }
            const dt = (timestamp - lastTimestamp) / 1000;
            lastTimestamp = timestamp;

            // Clamp dt to avoid huge jumps on tab switch
            const clampedDt = Math.min(dt, 0.1);
            const increment = speedRotPerSec * clampedDt;
            // Protect against overflow - cap at a very large but finite number
            if (isFinite(increment)) {
                gear1TotalRotations += increment;
            }
            // Safety: if gear1TotalRotations somehow becomes non-finite, cap it
            if (!isFinite(gear1TotalRotations)) {
                gear1TotalRotations = Number.MAX_VALUE / 2;
            }

            // Update slider display (wraps every 10 rotations)
            const modVal = gear1TotalRotations % 10;
            const sliderPos = (isFinite(modVal) ? modVal / 10 : 0) * 3600;
            manualSlider.value = Math.abs(sliderPos) % 3600;
            sliderValue.textContent = formatSliderDisplay(gear1TotalRotations) + " obr.";
        }

        render();
        animFrameId = requestAnimationFrame(animate);
    }

    // === SPEED UPDATE ===
    function updateSpeed() {
        // Parse text input - supports plain numbers and scientific notation (e.g. 1e100)
        const raw = speedValueInput.value.trim();
        let val = parseFloat(raw);
        // Validate: must be a positive finite number, otherwise default to 1
        if (isNaN(val) || !isFinite(val) || val <= 0) {
            val = 1;
        }
        const unit = speedUnitSelect.value;
        speedRotPerSec = (unit === "per-minute") ? val / 60 : val;
    }

    // === SCROLL / PAN ===
    function getMaxScroll() {
        return Math.max(0, LEFT_MARGIN + NUM_UNITS * UNIT_SPACING_X - canvas.width + 100);
    }

    function scrollToUnit(unitIndex) {
        const targetX = Math.max(0, LEFT_MARGIN + unitIndex * UNIT_SPACING_X - canvas.width / 2);
        viewportOffsetX = Math.max(0, Math.min(targetX, getMaxScroll()));
    }

    function scrollByPx(dx) {
        viewportOffsetX = Math.max(0, Math.min(viewportOffsetX + dx, getMaxScroll()));
    }

    // === EVENT HANDLERS ===

    // Manual slider - accumulates rotations in both directions
    manualSlider.addEventListener("input", function () {
        if (autoRotate) return;
        const currentVal = parseFloat(this.value);
        const delta = Math.abs(currentVal - prevSliderValue);
        // Handle wrap-around: if delta is huge, slider jumped (shouldn't happen with range input)
        // Convert delta from slider units (degrees * 10) to rotations
        gear1TotalRotations += delta / 360;
        prevSliderValue = currentVal;
        sliderValue.textContent = formatSliderDisplay(gear1TotalRotations) + " obr.";
    });

    // Auto-rotate toggle
    autoRotateBtn.addEventListener("click", function () {
        autoRotate = !autoRotate;
        if (autoRotate) {
            this.textContent = "\u23F8\uFE0F Auto-obr\u00F3t: W\u0141";
            this.classList.add("active");
            lastTimestamp = null;
        } else {
            this.textContent = "\u25B6\uFE0F Auto-obr\u00F3t: WY\u0141";
            this.classList.remove("active");
        }
    });

    // Reset
    resetBtn.addEventListener("click", function () {
        gear1TotalRotations = 0;
        prevSliderValue = 0;
        manualSlider.value = 0;
        sliderValue.textContent = "0.00 obr.";
        autoRotate = false;
        autoRotateBtn.textContent = "\u25B6\uFE0F Auto-obr\u00F3t: WY\u0141";
        autoRotateBtn.classList.remove("active");
        lastTimestamp = null;
    });

    // Speed controls
    speedValueInput.addEventListener("input", updateSpeed);
    speedUnitSelect.addEventListener("change", updateSpeed);

    // Navigation buttons
    scrollLeftBtn.addEventListener("click", function () {
        scrollByPx(-UNIT_SPACING_X * 3);
    });
    scrollRightBtn.addEventListener("click", function () {
        scrollByPx(UNIT_SPACING_X * 3);
    });
    gotoBtn.addEventListener("click", function () {
        const n = parseInt(gotoGearInput.value) || 1;
        scrollToUnit(Math.max(0, Math.min(n - 1, NUM_UNITS - 1)));
    });
    gotoGearInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") gotoBtn.click();
    });

    // Mouse drag to pan
    canvas.addEventListener("mousedown", function (e) {
        isDragging = true;
        dragStartX = e.clientX;
        dragStartOffset = viewportOffsetX;
        canvas.style.cursor = "grabbing";
    });
    window.addEventListener("mousemove", function (e) {
        if (!isDragging) return;
        const dx = dragStartX - e.clientX;
        viewportOffsetX = Math.max(0, Math.min(dragStartOffset + dx, getMaxScroll()));
    });
    window.addEventListener("mouseup", function () {
        if (isDragging) {
            isDragging = false;
            canvas.style.cursor = "grab";
        }
    });

    // Mouse wheel horizontal scroll
    canvas.addEventListener("wheel", function (e) {
        e.preventDefault();
        const delta = e.deltaY !== 0 ? e.deltaY : e.deltaX;
        scrollByPx(delta * 0.8);
    }, { passive: false });

    // Touch support
    let touchStartX = 0;
    let touchStartOffset = 0;
    canvas.addEventListener("touchstart", function (e) {
        touchStartX = e.touches[0].clientX;
        touchStartOffset = viewportOffsetX;
    }, { passive: true });
    canvas.addEventListener("touchmove", function (e) {
        e.preventDefault();
        const dx = touchStartX - e.touches[0].clientX;
        viewportOffsetX = Math.max(0, Math.min(touchStartOffset + dx, getMaxScroll()));
    }, { passive: false });

    // Keyboard navigation
    window.addEventListener("keydown", function (e) {
        if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT") return;
        switch (e.key) {
            case "ArrowLeft":  scrollByPx(-UNIT_SPACING_X); break;
            case "ArrowRight": scrollByPx(UNIT_SPACING_X); break;
            case "Home":       viewportOffsetX = 0; break;
            case "End":        viewportOffsetX = getMaxScroll(); break;
        }
    });

    // Window resize
    window.addEventListener("resize", function () {
        resizeCanvas();
    });

    // === INITIALIZATION ===
    resizeCanvas();
    updateSpeed();
    animFrameId = requestAnimationFrame(animate);

    console.log("Gear simulation initialized: " + NUM_UNITS + " units, " + RATIO + ":1 per stage, total ratio: 10^" + NUM_UNITS);
})();
