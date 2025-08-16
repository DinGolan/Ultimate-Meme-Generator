/***************************/
/* Ultimate Meme Generator */
/***************************/

'use strict';

/*==============================*/
/*      CONSTANT DEFINITIONS    */
/*==============================*/
const DEFAULT_TEXT      = '';
const DEFAULT_LINE_SIZE = 30;
const DEFAULT_CORD      = 200;
const DEFAULT_COLOR     = '#ffffff';
const DEFAULT_FONT      = 'Impact';
const DEFAULT_ALIGN     = 'center';
const DEFAULT_CARET_IDX = 0;
const DEFAULT_PADDING   = 10;
const DEFAULT_FORMAT    = 'jpeg';

/*==============================*/
/*      GLOBAL STATE OBJECT     */
/*==============================*/
var gMeme          = null;
var gDragState     = null;
var gCaretVisible  = true;
var gCaretInterval = null;

initMeme(null);
initDragState();

/*==============================*/
/*    BASIC GETTERS / SETTERS   */
/*==============================*/
function getMeme() {
    return gMeme;
}

function initMeme(selectedImageId, text = DEFAULT_TEXT) {
     gMeme = {
        selectedImageId: selectedImageId,
        selectedLineIdx: 0,
        lines : [
            {
                text:  text,
                size:  DEFAULT_LINE_SIZE,
                color: DEFAULT_COLOR,
                x:     DEFAULT_CORD,
                y:     DEFAULT_CORD,
                font:  DEFAULT_FONT,
                align: DEFAULT_ALIGN
            }
        ]
    };
}

function setLineText(newText) {
    const selectedLine = gMeme.lines[gMeme.selectedLineIdx];
    selectedLine.text  = newText;

    if (selectedLine.caretIndex === undefined) {
        selectedLine.caretIndex = newText.length;
    } else {
        selectedLine.caretIndex = Math.min(selectedLine.caretIndex, newText.length);
    }
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

/*==============================*/
/*     LINE CREATION / ADDING   */
/*==============================*/
function addLine(initialText = DEFAULT_TEXT) {
    const DEFAULT_CANVAS_SIZE = 400;

    const alignments = ['left', 'right', 'center'];
    const randIdx    = Math.floor(Math.random() * alignments.length);
    const alignment  = alignments[randIdx];

    const elCanvas     = document.querySelector('.meme-canvas');
    const canvasWidth  = elCanvas ? elCanvas.width  : DEFAULT_CANVAS_SIZE;
    const canvasHeight = elCanvas ? elCanvas.height : DEFAULT_CANVAS_SIZE;

    let newY = calculateNewLineY(canvasHeight);
    let newX = calculateNewLineX(elCanvas, canvasWidth, alignment, DEFAULT_TEXT);

    const pos = ensureUniquePosition(newX, newY);
    newX      = pos.x;
    newY      = pos.y;

    const newLineObj = createLineObject(initialText, newX, newY, alignment);
    gMeme.lines.push(newLineObj);

    gMeme.selectedLineIdx = gMeme.lines.length - 1;
}

function calculateNewLineY(canvasHeight) {
    const availableHeight = canvasHeight - (DEFAULT_PADDING * 6);
    const randOffset      = Math.random() * availableHeight;
    return Math.floor(randOffset + (DEFAULT_PADDING * 3));
}

function calculateNewLineX(elCanvas, canvasWidth, alignment, text) {
    const DEFAULT_FONT_SIZE = 30;

    const context = elCanvas.getContext('2d');

    /**
     * [Notes] :
     * - If the provided text is empty or only contains whitespace, use a placeholder string ("Sample") when measuring text width.
     * - This prevents measureText() from returning 0 and placing the frame too close to the canvas edges when no text is yet set.
     **/
    const sampleText = (text && text.trim() !== DEFAULT_TEXT) ? text : 'Sample';
    context.font     = `${DEFAULT_FONT_SIZE}px Impact`;
    const textWidth  = context.measureText(sampleText).width;

    const leftX   = DEFAULT_PADDING + (textWidth / 2);
    const rightX  = canvasWidth - DEFAULT_PADDING - (textWidth / 2);
    const centerX = canvasWidth / 2;

    switch (alignment) {
        case 'left':
            return leftX;

        case 'right':
            return rightX;

        case 'center':
        default:
            return centerX;
    }
}

function createLineObject(text, x, y, alignment) {
    const DEFAULT_COLOR     = '#ffffff';
    const DEFAULT_FONT_SIZE = 30;

    return {
        text,
        size:  DEFAULT_FONT_SIZE,
        color: DEFAULT_COLOR,
        x,
        y,
        align:      alignment,
        font:       DEFAULT_FONT,
        align:      alignment,
        caretIndex: text.length
    };
}

function ensureUniquePosition(x, y) {
    const OFFSET = 20;

    let collision = gMeme.lines.some(line => line.x === x && line.y === y);
    while (collision) {
        y        += OFFSET;
        collision = gMeme.lines.some(line => line.x === x && line.y === y);
    }

    return { x, y };
}

/*==============================*/
/*     LINE SELECTION CONTROL   */
/*==============================*/
function switchLine() {
    if (!gMeme.lines.length || gMeme.lines.length === 1) return;
    gMeme.selectedLineIdx = (gMeme.selectedLineIdx + 1) % gMeme.lines.length;
}

function getSelectedLine() {
    return gMeme.lines[gMeme.selectedLineIdx];
}

/*==============================*/
/*        TEXT WRAPPING         */
/*==============================*/
function wrapText(context, text, maxWidth) {
    const LINE_HEIGHT_FACTOR = 1.2;

    let line    = DEFAULT_TEXT;
    const lines = [];

    const words      = splitTextToWords(text);
    const lineHeight = Math.round(getSelectedLine().size * LINE_HEIGHT_FACTOR);
    const maxLines   = Math.floor(context.canvas.height / lineHeight);

    for (let i = 0; i < words.length; i++) {
        const testLine = buildTestLine(line, words[i]);
        const testWidth = context.measureText(testLine).width;

        if (testWidth <= maxWidth) {
            line = testLine;
        } else {
            if (line) lines.push(line);

            if (isWordTooLong(context, words[i], maxWidth)) {
                const remainingPart = breakLongWord(context, words[i], maxWidth, lines);
                line                = remainingPart;
            } else {
                line = words[i];
            }
        }

        if (lines.length >= maxLines) break;
    }

    pushFinalLineIfValid(context, line, maxLines, maxWidth, lines);

    return lines;
}

function splitTextToWords(text) {
    const whitespaceRegex = /\s+/;
    const words           = (text || DEFAULT_TEXT).split(whitespaceRegex);
    return words;
}

function buildTestLine(currentLine, newWord) {
    return currentLine ? currentLine + ' ' + newWord : newWord;
}

function isWordTooLong(context, word, maxWidth) {
    const wordWidth = context.measureText(word).width;
    return wordWidth > maxWidth;
}

function breakLongWord(context, word, maxWidth, lines) {
    let part = DEFAULT_TEXT;

    for (const ch of word) {
        const attempt = part + ch;

        const attemptWidth = context.measureText(attempt).width;
        if (attemptWidth <= maxWidth) {
            part = attempt;
        } else {
            lines.push(part);
            part = ch;
        }
    }

    return part;
}

function pushFinalLineIfValid(context, line, maxLines, maxWidth, lines) {
    if (!line || lines.length >= maxLines) return;

    if (context.measureText(line).width <= maxWidth) {
        lines.push(line);
    } else {
        const remainingPart = breakLongWord(context, line, maxWidth, lines);
        if (remainingPart) lines.push(remainingPart);
    }
}

/*==============================*/
/*       TEXT STYLE CONTROL     */
/*==============================*/
function setLineFont(font) {
    const selectedLine = gMeme.lines[gMeme.selectedLineIdx];
    selectedLine.font  = font;
}

function setLineAlign(align) {
    const selectedLine = gMeme.lines[gMeme.selectedLineIdx];
    selectedLine.align = align;

    const elCanvas  = document.querySelector('.meme-canvas');
    const context   = elCanvas.getContext('2d');
    const textWidth = context.measureText(selectedLine.text || 'Sample').width;

    switch (align) {
        case 'left':
            selectedLine.x = (textWidth / 2) + DEFAULT_PADDING;
            break;

        case 'right':
            selectedLine.x = elCanvas.width - (textWidth / 2) - DEFAULT_PADDING;
            break;

        case 'center':
        default:
            selectedLine.x = elCanvas.width / 2;
            break;
    }
}

function moveLine(direction) {
    const OFFSET       = 5;
    const selectedLine = gMeme.lines[gMeme.selectedLineIdx];
    if (direction === 'up')   selectedLine.y -= OFFSET;
    if (direction === 'down') selectedLine.y += OFFSET;
}

/*==============================*/
/*        LINE DELETION         */
/*==============================*/
function deleteLine() {
    if (!gMeme.lines.length) return;

    gMeme.lines.splice(gMeme.selectedLineIdx, 1);

    if (gMeme.lines.length === 0) {
        gMeme.lines.push({
            text:       DEFAULT_TEXT,
            size:       DEFAULT_LINE_SIZE,
            color:      DEFAULT_COLOR,
            x:          DEFAULT_CORD,
            y:          DEFAULT_CORD,
            font:       DEFAULT_FONT,
            align:      DEFAULT_ALIGN,
            caretIndex: DEFAULT_CARET_IDX
        });

        deactivateCaret();
    }

    gMeme.selectedLineIdx = Math.max(0, gMeme.selectedLineIdx - 1);

    onUpdateEditorInputs();
    onDrawMeme();
}

/*==============================*/
/*         BOX FUNCTIONS        */
/*==============================*/
function isNoText(wrappedLines) {
    return !wrappedLines || wrappedLines.length === 0;
}

function emptyBoxAt(x, y) {
    return { x, y, width: 0, height: 0 };
}

function computeHorizontalBounds(context, line, wrappedLines) {
    let minX =  Infinity;
    let maxX = -Infinity;

    wrappedLines.forEach(text => {
        let textWidth = context.measureText(text).width;
        textWidth     = Math.max(1, textWidth);
        const startX  = computeStartX(line, textWidth);

        minX = Math.min(minX, startX);
        maxX = Math.max(maxX, startX + textWidth);
    });

    return {
        minX: Math.floor(minX),
        maxX: Math.ceil(maxX)
    };
}

function computeStartX(line, textWidth) {
    const align = line.align || DEFAULT_ALIGN;
    switch (align) {
        case 'left'  : return line.x;
        case 'right' : return line.x - textWidth;
        case 'center': return line.x - (textWidth / 2);
        default:       return line.x - (textWidth / 2);
    }
}

function computeTopY(line) {
    return Math.floor(line.y - line.size);
}

function computeHeight(lineHeight, linesCount) {
    return Math.ceil(lineHeight * linesCount);
}

function makeBox(x, y, width, height) {
    const newWidth  = Math.max(0, Math.ceil(width));
    const newHeight = Math.max(0, Math.ceil(height));

    return {
        x,
        y,
        width:  newWidth,
        height: newHeight
    };
}

function isPointInLineBox(x, y, line) {
    if (!line || !line.box) return false;

    return (
        x >= line.box.x                  &&
        x <= line.box.x + line.box.width &&
        y >= line.box.y                  &&
        y <= line.box.y + line.box.height
    );
}

/*=============================*/
/*     DRAG & DROP - MOUSE     */
/*=============================*/
function initDragState() {
    gDragState = {
        isDragging: false,
        draggedLineIdx: null,
        dragOffsetX: 0,
        dragOffsetY: 0
    };
}

function getCanvasCoords(event) {
    const rect   = event.target.getBoundingClientRect();
    const scaleX = event.target.width  / rect.width;
    const scaleY = event.target.height / rect.height;

    if (event.type.startsWith('touch')) {
        const touch = event.touches[0];
        return {
            x: (touch.clientX - rect.left) * scaleX,
            y: (touch.clientY - rect.top)  * scaleY
        };
    } else {
        return {
            x: (event.clientX - rect.left) * scaleX,
            y: (event.clientY - rect.top)  * scaleY
        };
    }
}

/*================*/
/*     UPLOAD     */
/*================*/
async function uploadImage(imageDataUrl, onSuccess) {
    const CLOUD_NAME  = 'webify';
    const PRESET_NAME = 'webify';
    const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

    const formData = new FormData();
    formData.append('file', imageDataUrl);
    formData.append('upload_preset', PRESET_NAME);

    try {
        const res = await fetch(UPLOAD_URL, {
            method: 'POST',
            body: formData
        });

        const data = await res.json();

        onSuccess(data.secure_url);
    } catch(error) {
        console.error(`[Error] Upload Failed : ${error}`);
    }
}

/*===============*/
/*     SHARE     */
/*===============*/
function detectImageFormat() {
    let extension = DEFAULT_FORMAT;
    let format    = `image/${DEFAULT_FORMAT}`;

    const selectedImage = getImageById(gMeme.selectedImageId);
    if (selectedImage && selectedImage.url) {
        const lowerUrl = selectedImage.url.toLowerCase();
        if (lowerUrl.endsWith('.png')) {
            extension = 'png';
            format    = `image/${extension}`;
        }
        else if (lowerUrl.endsWith('.jpg')) {
            extension = 'jpg';
            format    = `image/${extension}`;
        }
    }

    return { format, extension };
}

function shareCanvasBlob(elCanvas, format, extension) {
    const dataUrl = elCanvas.toDataURL(format);

    const byteString  = atob(dataUrl.split(',')[1]);
    const mimeString  = dataUrl.split(',')[0].split(':')[1].split(';')[0];
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const intArray    = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
        intArray[i] = byteString.charCodeAt(i);
    }

    const blob = new Blob([arrayBuffer], { type: mimeString });
    const file = new File([blob], `meme.${extension}`, { type: format });

    if (!navigator.canShare || !navigator.canShare({ files: [file] })) {
        console.warn('[Warning] Sharing Files Isn\'t Supported on This Browser / Device ...');

        const isFallback = true;
        onDownloadMeme(extension, isFallback);
        return;
    }

    navigator.share({
        title: 'My Meme',
        text: 'Check Out My Meme!',
        files: [file]
    })
    .catch(error => {
        if (error.name === 'AbortError' || error.name === 'NotAllowedError') {
            console.warn('[Warning] User Canceled or Sharing was Blocked ...');
        } else {
            console.error(`[Error] Share Failed: ${error}`);
        }

        const isFallback = true;
        onDownloadMeme(extension, isFallback);
    });
}

/*=============================*/
/*     INLINE TEXT EDITING     */
/*=============================*/
function getLineIndexAtCoords(x, y) {
    return gMeme.lines.findIndex(line => line && line.box && isPointInLineBox(x, y, line));
}

function activateCaret() {
    const milliSeconds = 500;

    if (gCaretInterval) return;

    gCaretVisible = true;
    gCaretInterval = setInterval(() => {
        gCaretVisible = !gCaretVisible;
        onDrawMeme();
    }, milliSeconds);
}

function deactivateCaret() {
    if (gCaretInterval) {
        clearInterval(gCaretInterval);
        gCaretInterval = null;
    }

    gCaretVisible = false;
}