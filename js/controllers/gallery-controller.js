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
    renderMemeEditor();
    onResetTextInput();
}

function onRandomMeme() {
    if (!gImages.length) return;

    const randIdx   = Math.floor(Math.random() * gImages.length);
    const randImage = gImages[randIdx];

    const randText = getRandomText();

    gMeme = {
        selectedImageId: randImage.id,
        selectedLineIdx: 0,
        lines : [
            {
                text:  randText,
                size:  DEFAULT_LINE_SIZE,
                color: DEFAULT_COLOR,
                x:     DEFAULT_CORD,
                y:     DEFAULT_CORD,
                font:  DEFAULT_FONT,
                align: DEFAULT_ALIGN
            }
        ]
    };

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
}

function onGallerySearch(searchValue) {
    let emptyList = [];
    const term    = (searchValue || DEFAULT_TEXT).toLowerCase().trim();

    if (!term) {
        renderGallery(gImages);
        return;
    }

    const filteredImages = gImages.filter(img =>
        (img.keywords || emptyList).some(keyword => String(keyword)
                                             .toLowerCase()
                                             .includes(term))
    );

    renderGallery(filteredImages);
}

function onClearGalleryFilter() {
    const elGallerySearch = document.querySelector('.gallery-search');
    elGallerySearch.value = DEFAULT_TEXT;
    onGallerySuggest(DEFAULT_TEXT);
    renderGallery(gImages);
}

function onToggleClearButton(value) {
    const elClear    = document.querySelector('.clear-filter');
    const isEmpty    = !(value.trim());
    elClear.disabled = isEmpty;
    elClear.computedStyleMap.cursor = isEmpty ? 'not-allowed' : 'pointer';
}