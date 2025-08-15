/***************************/
/* Ultimate Meme Generator */
/***************************/

'use strict';

/*==============================*/
/*      EDITOR RENDERING        */
/*==============================*/
function renderMemeEditor() {
    const stickers   = ['😂', '😍', '🔥', '😎', '🤔', '💯', '👍', '🎉'];
    let elEditor     = document.querySelector('.editor-container');

    let stickersHTML = '<div class="stickers-container">';
    stickers.forEach(sticker => {
        stickersHTML += `<button class="btn-sticker" onclick="onAddSticker('${sticker}')">${sticker}</button>`;
    });
    stickersHTML += '</div>';

    elEditor.innerHTML =
    `
        <canvas class="meme-canvas" width="400" height="400"></canvas>

        <!-- Add Sticker -->
        ${stickersHTML}

        <div>
            <!-- Text (Input) -->
            <input type="text" class="meme-text-input"
                   placeholder="Enter Meme Text"
                   oninput="onSetText(this.value)">

            <!-- Color -->
            <input type="color" class="meme-color-input"
                   value="#ffffff"
                   onchange="onSetColor(this.value)">

            <!-- Font Family -->
            <select onchange="onSetFontFamily(this.value)">
                <option value="Impact">Impact</option>
                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times New Roman</option>
            </select>

            <!-- Alignment -->
            <select onchange="onSetAlign(this.value)">
                <option value="left">Left</option>
                <option value="center" selected>Center</option>
                <option value="right">Right</option>
            </select>

            <!-- Font Size -->
            <button onclick="onIncreaseFont()">A+</button>
            <button onclick="onDecreaseFont()">A-</button>

            <!-- Position Arrows -->
            <button onclick="onMoveLine('up')">↑</button>
            <button onclick="onMoveLine('down')">↓</button>            

            <!-- Add / Delete -->
            <button onclick="onAddLine()">Add Line</button>
            <button onclick="onDeleteLine()">Delete Line</button>

            <!-- Switch Line -->
            <button onclick="onSwitchLine()">Switch Line</button>

            <!-- Download -->
            <button onclick="onDownloadMeme()">Download</button>
        </div>
    `;

    // Event Listener //
    const elMemeCanvas = document.querySelector('.meme-canvas');
    elMemeCanvas.addEventListener('click', onCanvasClick);

    // Mouse Events //
    elMemeCanvas.addEventListener('mousedown' , onCanvasMouseDown);
    elMemeCanvas.addEventListener('mousemove' , onCanvasMouseMove);
    elMemeCanvas.addEventListener('mouseup'   , onCanvasMouseUp);
    elMemeCanvas.addEventListener('mouseleave', onCanvasMouseUp);

    // Touch Events //
    elMemeCanvas.addEventListener('touchstart', onCanvasTouchStart);
    elMemeCanvas.addEventListener('touchmove' , onCanvasTouchMove);
    elMemeCanvas.addEventListener('touchend'  , onCanvasTouchEnd);

    onDrawMeme();
    onUpdateSwitchLineButton();
}

function renderEmptyEditor() {
    const elEditor     = document.querySelector('.editor-container');
    elEditor.innerHTML = `<p class="editor-placeholder">[Info] Editor will be displayed here ...</p>`;
}

/*==============================*/
/*     MEME DRAWING LOGIC       */
/*==============================*/
function onDrawMeme() {
    const meme = getMeme();

    let elCanvas = document.querySelector('.meme-canvas');
    let context  = elCanvas.getContext('2d');

    const imageData = getImageById(meme.selectedImageId);
    if (!imageData) {
        console.warn('[Warning] No image found for id :', meme.selectedImageId);
        return;
    }

    let image = new Image();
    image.src   = imageData.url;

    image.onload = () => {
        context.clearRect(0, 0, elCanvas.width, elCanvas.height);
        context.drawImage(image, 0, 0, elCanvas.width, elCanvas.height);

        meme.lines.forEach((line, idx) => {
            onDrawWrappedLine(context, line);

            if (idx === meme.selectedLineIdx) {
                onDrawTextFrame(context, line);
            }
        });
    };
}

function onDrawWrappedLine(context, line, padding = DEFAULT_PADDING) {
    const LINE_HEIGHT_FACTOR = 1.2;

    context.fillStyle = line.color || DEFAULT_COLOR;
    context.font      = `${line.size}px ${line.font || DEFAULT_FONT}`;
    context.textAlign = line.align || DEFAULT_ALIGN;

    const maxWidth     = context.canvas.width - (padding * 2) - 2;
    const lineHeight   = Math.round(line.size * LINE_HEIGHT_FACTOR);
    const wrappedLines = wrapText(context, line.text, maxWidth);

    wrappedLines.forEach((currentLine, idx) => {
        const y = line.y + (idx * lineHeight);
        context.fillText(currentLine, line.x, y);
    });

    onUpdateBoundingBox(context, line, wrappedLines, lineHeight);
}

function onUpdateBoundingBox(context, line, wrappedLines, lineHeight) {
    /**
     * [Details] :
     * - Updates the logical "box" dimensions for a given text line.
     *
     * [Purpose]:
     * - Calculates the bounding rectangle that tightly encloses the rendered text (taking into account font size, alignment, and text wrapping).
     * - This "box" is stored in `line.box` and is used for :
     *   (1) Hit detection (e.g., clicking on the text in the canvas).
     *   (2) Guiding the drawing of the visual selection frame around the active text.
     **/
    if (isNoText(wrappedLines)) {
        line.box = emptyBoxAt(line.x, line.y);
        return;
    }

    const { minX, maxX } = computeHorizontalBounds(context, line, wrappedLines);

    const paddingX = DEFAULT_PADDING / 2;
    const width    = (maxX - minX) + (paddingX * 2);

    const topY   = computeTopY(line) - (DEFAULT_PADDING / 2);
    const height = computeHeight(lineHeight, wrappedLines.length) + DEFAULT_PADDING;

    line.box = makeBox(minX - paddingX, topY, width, height);
}

function onDrawTextFrame(context, line) {
    /**
     * [Details] :
     * - Draws the visible "frame" for the currently selected text line.
     *
     * [Purpose]:
     * - Renders a highlighted rectangular outline on the canvas to indicate which text line is currently active for editing.
     * - The frame is derived from the logical bounding "box" stored in `line.box`.
     *
     * [Difference vs. "Box"]:
     * - The "box" is purely logical data (used for hit detection and positioning).
     * - The "frame" is the visual representation of the box on the canvas.
     **/
    if (!line.text || line.text.trim() === DEFAULT_TEXT) return;

    const LINE_WIDTH    = 2;
    const DEFAULT_COLOR = '#ffffffb3';

    // [Debug] //
    /**
     * console.log(`[Info] Selected Line Object : ${JSON.stringify(line, null, 2)}`);
     **/

    // [1] - Calculate initial rectangle position and size based on text metrics //
    let rectX      = line.box.x - Math.floor(DEFAULT_PADDING / 2);
    let rectY      = line.box.y;
    let rectWidth  = line.box.width  + DEFAULT_PADDING;
    let rectHeight = line.box.height + Math.floor(DEFAULT_PADDING / 4);

    // [2] - Get canvas dimensions to ensure the frame stays within bounds //
    const canvasWidth  = context.canvas.width;
    const canvasHeight = context.canvas.height;

    // [3] - Adjust rectangle position to prevent overflow beyond canvas borders //
    if (rectX < 0) rectX = 0;
    if (rectY < 0) rectY = 0;
    if (rectX + rectWidth  > canvasWidth)  rectX = canvasWidth  - rectWidth;
    if (rectY + rectHeight > canvasHeight) rectY = canvasHeight - rectHeight;

    // [4] - Set stroke style and draw the rectangle on the canvas //
    context.strokeStyle = DEFAULT_COLOR;
    context.lineWidth   = LINE_WIDTH;
    context.strokeRect(rectX, rectY, rectWidth, rectHeight);
}

/*==============================*/
/*   TEXT & STYLE INTERACTION   */
/*==============================*/
function onSetText(newText) {
    setLineText(newText);
    onDrawMeme();
}

function onSetColor(color) {
    setLineColor(color);
    onDrawMeme();
}

function onIncreaseFont() {
    const FONT_SIZE = 2;
    changeFontSize(FONT_SIZE);
    onDrawMeme();
}

function onDecreaseFont() {
    const FONT_SIZE = 2;
    changeFontSize(-1 * FONT_SIZE);
    onDrawMeme();
}

/*==============================*/
/*     CANVAS / UI ACTIONS      */
/*==============================*/
function onDownloadMeme() {
    let elCanvas  = document.querySelector('.meme-canvas');
    let link      = document.createElement('a');
    link.download = 'new-meme.jpg';
    link.href     = elCanvas.toDataURL('image/jpeg');
    link.click();

    onResetTextInput();
}

function onAddLine() {
    addLine();
    onUpdateEditorInputs();
    onDrawMeme();
    onUpdateSwitchLineButton();
}

function onSwitchLine() {
    if (gMeme.lines.length <= 1) return;

    switchLine();
    onUpdateEditorInputs();
    onDrawMeme();
    onUpdateSwitchLineButton();
}

function onUpdateSwitchLineButton() {
    const elBtn = document.querySelector('button[onclick="onSwitchLine()"]');
    if (!elBtn) return;
    elBtn.disabled = (gMeme.lines.length <= 1);
}

function onCanvasClick(event) {
    const meme = getMeme();
    const { x, y } = getCanvasCoords(event);

    const clickedLineIdx = meme.lines.findIndex(line => isPointInLineBox(x, y, line));

    if (clickedLineIdx !== -1) {
        gMeme.selectedLineIdx = clickedLineIdx;
        onUpdateEditorInputs();
        onDrawMeme();
    }
}

function onUpdateEditorInputs() {
    const selectedLine = getSelectedLine();

    const elMemeTextInput  = document.querySelector('.meme-text-input');
    const elMemeColorInput = document.querySelector('.meme-color-input');
    const elFontSelect     = document.querySelector('select[onchange="onSetFontFamily(this.value)"]');
    const elAlignSelect    = document.querySelector('select[onchange="onSetAlign(this.value)"]');

    if (elMemeTextInput)  elMemeTextInput.value  = selectedLine.text  || DEFAULT_TEXT;
    if (elMemeColorInput) elMemeColorInput.value = selectedLine.color || DEFAULT_COLOR;
    if (elFontSelect)     elFontSelect.value     = selectedLine.font  || DEFAULT_FONT;
    if (elAlignSelect)    elAlignSelect.value    = selectedLine.align || DEFAULT_ALIGN;
}

function onResetTextInput(value = DEFAULT_TEXT) {
    const elInput = document.querySelector('.meme-text-input');
    if (!elInput) return;

    elInput.value = value;
    try { elInput.setSelectionRange(0, 0); } catch(_) {}

    elInput.focus();
}

function onSetFontFamily(font) {
    setLineFont(font);
    onDrawMeme();
}

function onSetAlign(align) {
    setLineAlign(align);
    onDrawMeme();
}

function onMoveLine(direction) {
    moveLine(direction);
    onDrawMeme();
}

function onDeleteLine() {
    deleteLine();
    onDrawMeme();
    onUpdateSwitchLineButton();
}

function onAddSticker(sticker) {
    addLine(sticker);
    onUpdateEditorInputs();
    onDrawMeme();
    onUpdateSwitchLineButton();
}

/*=============================*/
/*     DRAG & DROP - MOUSE     */
/*=============================*/
function onCanvasMouseDown(event) {
    const { x, y } = getCanvasCoords(event);
    startDragging(x, y);
}

function onCanvasMouseMove(event) {
    const elCanvas = event.target;
    const { x, y } = getCanvasCoords(event);
    const meme     = getMeme();

    const isOverText = meme.lines.some(line => isPointInLineBox(x, y, line));

    elCanvas.style.cursor = isOverText ? 'pointer' : 'default';

    if (!gDragState.isDragging) return;
    dragTo(x, y);
}

function onCanvasMouseUp() {
    stopDragging();
}

/*=============================*/
/*     DRAG & DROP - TOUCH     */
/*=============================*/
function onCanvasTouchStart(event) {
    const { x, y } = getCanvasCoords(event);
    startDragging(x, y);
}

function onCanvasTouchMove(event) {
    if (!gDragState.isDragging) return;

    const { x, y } = getCanvasCoords(event);
    dragTo(x, y);
    
    event.preventDefault();
}

function onCanvasTouchEnd() {
    stopDragging();
}

/*================================*/
/*     DRAG & DROP - GENERALS     */
/*================================*/
function startDragging(x, y) {
    const meme           = getMeme();
    const clickedLineIdx = meme.lines.findIndex(line => isPointInLineBox(x, y, line));

    if (clickedLineIdx !== -1) {
        gDragState.isDragging     = true;
        gDragState.draggedLineIdx = clickedLineIdx;
        gDragState.dragOffsetX    = x - meme.lines[clickedLineIdx].x;
        gDragState.dragOffsetY    = y - meme.lines[clickedLineIdx].y;
    }
}

function dragTo(x, y) {
    const meme = getMeme();

    meme.lines[gDragState.draggedLineIdx].x = x - gDragState.dragOffsetX;
    meme.lines[gDragState.draggedLineIdx].y = y - gDragState.dragOffsetY;

    onDrawMeme();
}

function stopDragging() {
    gDragState.isDragging     = false;
    gDragState.draggedLineIdx = null; 
}