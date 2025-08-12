/***************************/
/* Ultimate Meme Generator */
/***************************/

/**
 * [TODO] :
 * [1] - Fix The Issue with Folders.
 * [2] - Divide the function per folders.
 **/

// Global Variables //
var gImgCount     = 18;
var gSelectedImg  = null;
const folderPaths = ['img/meme_imgs_square', 'img/meme_imgs_aspect_ratios'];

// Function Implementations //
async function onInit() {
    try {
        await updateImgCount();
        renderGallery();
        renderEmptyEditor();
    } catch (err) {
        console.error('Error Counting Images : ', err.message);
        
        const elGalleryContainer     = document.querySelector('.gallery-container');
        elGalleryContainer.innerHTML = `<p>[Error] No Images Found to Display ...</p>`;
    }
}

function updateImgCount() {

    // Edge Case - Convert to List //
    if (!Array.isArray(folderPaths)) folderPaths = [folderPaths];

    return new Promise(async (resolve, reject) => {
        try {
            let totalCount = 0;

            for (let path of folderPaths) {
                const count = await countImagesInFolder(path);
                totalCount += count;
            }

            if (totalCount > 0) {
                gImgCount = totalCount;
                resolve(totalCount);
            } else {
                reject(new Error(
                    '[Error] No Images Found In Provided Folders ...'
                ));
            }

        } catch (err) {
            reject(err);
        }
    });
}

function countImagesInFolder(folderPath) {
    return new Promise((resolve) => {
        let count = 0;
        let index = 1;

        function checkNext() {
            const img  = new Image();
            img.src    = `${folderPath}/${index}.jpg`;
            img.onload = () => {
                count++;
                index++;
                checkNext();
            };

            img.onerror = () => {
                resolve(count);
            }
        }

        checkNext();
    });
}

function renderGallery() {
    const elGallery = document.querySelector('.gallery-container');
    
    let strHTML = '';

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