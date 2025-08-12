/***************************/
/* Ultimate Meme Generator */
/***************************/

// Global Variables //
var gImgCount    = 18;
var gSelectedImg = null;

// Function Implementations //
function onInit() {
    renderEmptyGallery();
    renderEmptyEditor();
}

function renderGallery() {
    const elGallery = document.querySelector('.gallery-container');
    
    let strHTML = '';

    // [TODO] - Make gImgCount (Dynamic) //
    for (let i = 1; i <= gImgCount; i++) {
        strHTML += `<img src="img/meme_imgs_square/${i}.jpg" 
                         alt="Meme - ${i}"
                         onclick="onSelectImage(${i})">`;
    }

    elGallery.innerHTML = strHTML;
}

function onSelectImage(imgId) {
    gSelectedImg = imgId;
    renderMemeEditor();
}

function renderMemeEditor() {
    let elEditor = document.querySelector('.editor-container');

    elEditor.innerHTML = 
    `
        <canvas class="meme-canvas" width="400" height="400"></canvas>
        <div>
            <input type="text" class="meme-text-input" 
                   placeholder="Enter Meme Text" oninput="onSetText(this.value)">
            <input type="color" class="meme-color-input" value="#ffffff"
                   onchange="onSetColor(this.value)">
            <button onclick="onDownloadMeme()">Download</button>
        </div>
    `;

    drawMeme();
}

function renderEmptyEditor() {
    const elEditor     = document.querySelector('.editor-container');
    elEditor.innerHTML = `<p>Editor will be displayed here ...</p>`; 
}

function drawMeme(txt = '', color = '#ffffff') {
    let elCanvas = document.querySelector('.meme-canvas');
    let context  = elCanvas.getContext('2d');
    
    let img = new Image();
    img.src = `img/meme_imgs_square/${gSelectedImg}.jpg`;

    img.onload = () => {
        context.drawImage(img, 0, 0, elCanvas.width, elCanvas.height);
        context.fillStyle = color;
        context.font      = '30px Impact';
        context.textAlign = 'center';
        context.fillText(txt, elCanvas.width / 2, 50);
    };
}

function onSetText(txt) {
    const elMemeColorInput = document.querySelector('.meme-color-input');
    drawMeme(txt, elMemeColorInput.value);
}

function onSetColor(color) {
    const elMemeTextInput = document.querySelector('.meme-text-input').value
    drawMeme(elMemeTextInput.value, color);
}

function onDownloadMeme() {
    let elCanvas  = document.querySelector('.meme-canvas');
    let link      = document.createElement('a');
    link.download = 'new-meme.jpg';
    link.href     = elCanvas.toDataURL('image/jpeg');
    link.click();
}