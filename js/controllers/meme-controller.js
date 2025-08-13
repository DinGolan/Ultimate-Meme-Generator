/***************************/
/* Ultimate Meme Generator */
/***************************/

'use strict';

// Function Implementations //
function renderMemeEditor() {
    let elEditor = document.querySelector('.editor-container');

    elEditor.innerHTML =
    `
        <canvas class="meme-canvas" width="400" height="400"></canvas>
        <div>
            <input type="text" class="meme-text-input"
                   placeholder="Enter Meme Text"
                   oninput="onSetText(this.value)">

            <input type="color" class="meme-color-input"
                   value="#ffffff"
                   onchange="onSetColor(this.value)">

            <button onclick="onIncreaseFont()">A+</button>

            <button onclick="onDecreaseFont()">A-</button>

            <button onclick="onAddLine()">Add Line</button>

            <button onclick="onSwitchLine()">Switch Line</button>

            <button onclick="onDownloadMeme()">Download</button>
        </div>
    `;

    onDrawMeme();
}

function renderEmptyEditor() {
    const elEditor     = document.querySelector('.editor-container');
    elEditor.innerHTML = `<p>[Info] Editor will be displayed here ...</p>`;
}

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
            onDrawTextLine(context, line);

            if (idx === meme.selectedLineIdx) {
                onDrawTextFrame(context, line);
            }
        });
    };
}

function onDrawTextLine(context, line) {
    context.fillStyle = line.color;
    context.font      = `${line.size}px Impact`;
    context.textAlign = 'center';
    context.fillText(line.text, line.x, line.y);
}

function onDrawTextFrame(context, line) {
    /**
     * [Details] :
     * - Draws a visible rectangular frame around the given text line on the canvas.
     *
     * [Purpose] :
     * - Visually highlights the currently selected line so the user knows which one is active.
     *
     * [Notes] :
     * - Draws the rectangle with a small padding around the text :
     *   > X Position - start from the horizontal center of the text (line.x), shift left by half the text width, and add 5px extra padding.
     *   > Y Position - start from the top of the text (line.y - textHeight).
     *   > Width      - text width plus 10px padding (5px on each side).
     *   > Height     - text height plus 5px padding at the bottom.
     **/
    const PADDING       = 5;
    const LINE_WIDTH    = 2;
    const DEFAULT_COLOR = 'red';

    // [Debug] //
    console.log(`[Info] Selected Line Object : ${JSON.stringify(line, null, 2)}`);

    const textWidth  = context.measureText(line.text).width + (PADDING * 2);
    const textHeight = line.size + PADDING;
    const side       = Math.max(textWidth, textHeight);

    context.strokeStyle = DEFAULT_COLOR;
    context.lineWidth   = LINE_WIDTH;
    context.strokeRect(line.x - (side / 2),
                       line.y - side,
                       side,
                       side);
}

function onSetText(newText) {
    setLineText(newText);
    onDrawMeme();
}

function onSetColor(color) {
    setLineColor(color);
    onDrawMeme();
}

function onIncreaseFont() {
    changeFontSize(FONT_SIZE);
    onDrawMeme();
}

function onDecreaseFont() {
    changeFontSize(-1 * FONT_SIZE);
    onDrawMeme();
}

function onDownloadMeme() {
    let elCanvas  = document.querySelector('.meme-canvas');
    let link      = document.createElement('a');
    link.download = 'new-meme.jpg';
    link.href     = elCanvas.toDataURL('image/jpeg');
    link.click();
}

function onAddLine() {
    addLine();
    onDrawMeme();
}

function onSwitchLine() {
    switchLine();
    onDrawMeme();
}