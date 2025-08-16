/***************************/
/* Ultimate Meme Generator */
/***************************/

/**
 * [TODO]:
 * (1) - Check the image resolution when I’m in mobile mode,
 *       meaning the canvas isn’t quite proportional when viewed on a mobile device.
 * (2) - Check MQ.css (Desktop Behavior).
 **/

'use strict';

/*==============================*/
/*      APPLICATION INIT        */
/*==============================*/
async function onInit() {
    try {
        const hasLocalImages = loadFromStorage(GALLERY_STORAGE_KEY);

        if (!hasLocalImages) {
            await updateImageList();
        }

        renderGallery();
        onInitGalleryFilter();
        renderKeywordCloud();
        renderEmptyEditor();
        renderSavedMemes();
    } catch (error) {
        console.error(`Error Counting Images : ${error.message}`);
        onNoImagesFound();
    }
}

function onNoImagesFound() {
    // Gallery //
    const elGalleryContainer = document.querySelector('.gallery-container');

    elGalleryContainer.classList.remove('gallery-container');
    elGalleryContainer.classList.add('gallery-message');
    elGalleryContainer.innerHTML = `<p class="info-message"><strong>[Error]</strong> No Images Found to Display ...</p>`;

    const elFlexibleBtn = document.querySelector('.btn-flexible');
    if (elFlexibleBtn) elFlexibleBtn.disabled = true;

    const elBtnUploadFromDevice = document.querySelector('.btn-upload-from-device');
    if (elBtnUploadFromDevice) elBtnUploadFromDevice.disabled = true;

    const elGallerySearch = document.querySelector('.gallery-search');
    if (elGallerySearch) elGallerySearch.disabled = true;

    // Meme Editor //
    const elEditor = document.querySelector('.editor-container');
    if (elEditor) elEditor.innerHTML = `<p class="info-message"><strong>[Error]</strong> Meme Editor Unavailable ...</p>`;

    const elSaveBtn = document.querySelector('.btn-save-meme');
    if (elSaveBtn) elSaveBtn.disabled = true;

    const elUploadBtn = document.querySelector('.btn-upload-meme');
    if (elUploadBtn) elUploadBtn.disabled = true;

    const elShareBtn = document.querySelector('.btn-share-meme');
    if (elShareBtn) elShareBtn.disabled = true;

    // Saved Memes //
    const elSavedMemes = document.querySelector('.saved-memes-container');
    if (elSavedMemes) elSavedMemes.innerHTML = `<p class="info-message"><strong>[Error]</strong> No Saved Memes Available ...</p>`;
}