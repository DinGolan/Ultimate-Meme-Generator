/***************************/
/* Ultimate Meme Generator */
/***************************/

'use strict';

/*==============================*/
/*    IMAGE LIST MANAGEMENT     */
/*==============================*/
async function updateImageList() {
    /**
     * [Details] :
     * - Asynchronously updates a global image list (gImageList) by fetching a single JSON file that contains a list of image files for multiple folders.
     * - This function consolidates multiple image lists into one master list.
     * - It prevents 404 errors by relying on a pre-defined JSON manifest rather than attempting to load files sequentially until a failure.
     **/
    const jsonUrl        = 'json/images.json';
    const folderMappings = [
        { key: "meme_images_square"       , path: "img/meme_images_square"        },
        { key: "meme_images_aspect_ratios", path: "img/meme_images_aspect_ratios" }
    ];

    let allImages    = [];
    let idCounterRef = { value: 1 };

    try {

        // Fetch the single JSON file from the specified URL //
        const response = await fetch(jsonUrl);
        if (!response.ok) {
            throw new Error(`[Error] Failed to fetch main image JSON. Status : ${response.status}`);
        }

        // Parse the JSON data from the response body //
        const jsonData = await response.json();

        folderMappings.forEach(folderMapping => {
            const folderFiles = jsonData[folderMapping.key];
            const folderPath  = folderMapping.path;

            if (folderFiles && Array.isArray(folderFiles)) {
                addImage(folderFiles, folderPath, allImages, idCounterRef);
            } else {
                console.warn(`[Warning] No Images found for folder key : ${folderMapping.key}`);
            }
        });

    } catch(error) {
        console.error('[Error] An error occurred while updating the image list :', error);
    }

    gImages = allImages;

    buildKeywordSearchCountMap();
}

/*==============================*/
/*     GALLERY RENDERING        */
/*==============================*/
function renderGallery(images = gImages) {
    const elGallery = document.querySelector('.gallery-container');

    let strHTML = DEFAULT_TEXT;
    images.forEach(image => {
        strHTML += `
            <img src="${image.url}"
                 alt="Meme - ${image.id}"
                 onclick="onImageSelect(${image.id})">
        `;
    });

    elGallery.innerHTML = strHTML;
}

/*==============================*/
/*   IMAGE SELECTION HANDLING   */
/*==============================*/
function onImageSelect(imageId) {
    setImage(imageId);
    onResetTextInput();
    onRemoveSharedButtons();
    renderMemeEditor();
}

function onRandomMeme() {
    if (!gImages.length) return;

    const randIdx   = Math.floor(Math.random() * gImages.length);
    const randImage = gImages[randIdx];

    const randText = getRandomText();
    initMeme(randImage.id, randText);
    initDragState();

    onRemoveSharedButtons();
    renderMemeEditor();
}

/*====================*/
/*   GALLERY FILTER   */
/*====================*/
function onInitGalleryFilter() {
    const MIN_RANGE = 0;
    const MAX_RANGE = 5;

    const elDataList   = document.querySelector('.gallery-keywords');
    const keywordsList = extractKeywordsFromImages(gImages);
    gFilteredKeywords  = [...new Set(keywordsList)].sort((a, b) => a.localeCompare(b));

    elDataList.innerHTML = gFilteredKeywords
                           .slice(MIN_RANGE, MAX_RANGE)
                           .map(keyword => `<option value="${keyword}"></option>`)
                           .join(DEFAULT_TEXT);
}

function onGallerySuggest(value) {
    const MIN_RANGE = 0;
    const MAX_RANGE = 5;

    const term       = (value || DEFAULT_TEXT).toLowerCase().trim();
    const elDataList = document.querySelector('.gallery-keywords');

    const matches = term
                    ? gFilteredKeywords
                      .filter(keyword => keyword.toLowerCase()
                      .includes(term))
                      .slice(MIN_RANGE, MAX_RANGE)
                    : gFilteredKeywords.slice(MIN_RANGE, MAX_RANGE);

    elDataList.innerHTML = matches
                           .map(keyword => `<option value="${keyword}"></option>`)
                           .join(DEFAULT_TEXT);

    onToggleClearButton(value);
}

function onGallerySearch(searchValue) {
    let emptyList = [];
    const term    = (searchValue || DEFAULT_TEXT).toLowerCase().trim();

    if (!term) {
        onToggleClearButton(searchValue);
        renderGallery(gImages);
        return;
    }

    const filteredImages = gImages.filter(image =>
        (image.keywords || emptyList).some(keyword => String(keyword)
                                                      .toLowerCase()
                                                      .includes(term))
    );

    onToggleClearButton(searchValue);
    renderGallery(filteredImages);
}

function onClearGalleryFilter() {
    const elGallerySearch = document.querySelector('.gallery-search');
    elGallerySearch.value = DEFAULT_TEXT;
    onGallerySuggest(DEFAULT_TEXT);
    onToggleClearButton(DEFAULT_TEXT);
    onRemoveSharedButtons();
    renderGallery(gImages);
}

function onToggleClearButton(value) {
    const elClear    = document.querySelector('.clear-filter');
    const isEmpty    = !(value.trim());
    elClear.disabled = isEmpty;
    elClear.style.cursor = isEmpty ? 'not-allowed' : 'pointer';
}

/*========================*/
/*   UPLOAD FROM DEVICE   */
/*========================*/
function onTriggerUploadFromDevice() {
    const elFileInput = document.querySelector('.file-upload-from-device');
    if (elFileInput) elFileInput.click();
}

function onUserUploadImage(externalEvent) {
    const file = externalEvent.target.files[0];
    if (!file) return;

    if (!isValidFile(file)) {
        alert('[Error] Invalid Type File of File Size ...');
        return;
    }

    const reader  = new FileReader();
    reader.onload = function(internalEvent) {
        const image  = new Image();
        image.onload = () => handleImageLoad(image, file.name);
        image.src    = internalEvent.target.result;
    };

    reader.readAsDataURL(file);
}

function onLoadImageToCanvas(image) {
    gMeme.selectedImgId = null;
    gMeme.image         = image;

    const elCanvas = document.querySelector('.meme-canvas');
    if (!elCanvas) {
        console.error('[Error] Element Not Found ...');
        return;
    }

    const context  = elCanvas.getContext('2d');

    elCanvas.width  = image.width;
    elCanvas.height = image.height;

    context.drawImage(image, 0, 0, elCanvas.width, elCanvas.height);

    onDrawMeme();
}