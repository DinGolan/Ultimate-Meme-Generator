/***************************/
/* Ultimate Meme Generator */
/***************************/

'use strict';

// Constants //
const FONT_SIZE = 2;

// Global Variables //
var gMeme = {
    selectedImageId: null,
    selectedLineIdx: 0,
    lines: [
        {
            text: '',
            size: 30,
            color: 'white',
            x: 50,
            y: 50
        }
    ]
};

// Function Implementations //
function getMeme() {
    return gMeme;
}

function setLineText(newText) {
    const selectedLine = gMeme.lines[gMeme.selectedLineIdx];
    selectedLine.text  = newText;
}

function setLineColor(color) {
    const selectedLine = gMeme.lines[gMeme.selectedLineIdx];
    selectedLine.color = color;
}

function changeFontSize(diff) {
    const MIN_FONT_SIZE = 10;

    const selectedLine = gMeme.lines[gMeme.selectedLineIdx];
    selectedLine.size += diff;

    if (selectedLine.size < MIN_FONT_SIZE) {
        selectedLine.size = MIN_FONT_SIZE;
    }
}

function addLine() {
    const DEFAULT_FONT_SIZE = 30;
    const DEFAULT_COLOR     = 'white';
    const DEFAULT_X         = 200;
    const BOTTOM_LINE_Y     = 350;
    const MIDDLE_LINE_Y     = 200;

    const newY = gMeme.lines.length === 1 ? BOTTOM_LINE_Y : MIDDLE_LINE_Y;

    gMeme.lines.push({
        text: '',
        size: DEFAULT_FONT_SIZE,
        color: DEFAULT_COLOR,
        x: DEFAULT_X,
        y: newY
    });

    gMeme.selectedLineIdx = gMeme.lines.length - 1;
}

function switchLine() {
    if (!gMeme.lines.length) return;
    gMeme.selectedLineIdx = (gMeme.selectedLineIdx + 1) % gMeme.lines.length;
}

function getSelectedLine() {
    return gMeme.lines[gMeme.selectedLineIdx];
}