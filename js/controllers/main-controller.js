/***************************/
/* Ultimate Meme Generator */
/***************************/

/**
 * [TODO]:
 * (1) - Resolve the text wrapping issue (search for occurrences of the keyword `Wrap`).
 * (2) - Check the image resolution when I’m in mobile mode,
 *       meaning the canvas isn’t quite proportional when viewed on a mobile device.
 * (3) - Investigate Web Share API behavior.
 * (4) - Check MQ.css (Desktop Behavior).
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
        renderEmptyEditor();
        renderSavedMemes();
    } catch (error) {
        console.error('Error Counting Images : ', error.message);
        onNoImagesFound();
    }
}

function onNoImagesFound() {
    // Gallery //
    const elGalleryContainer = document.querySelector('.gallery-container');

    elGalleryContainer.classList.remove('gallery-container');
    elGalleryContainer.classList.add('gallery-message');
    elGalleryContainer.innerHTML = `<p>[Error] No Images Found to Display ...</p>`;

    const elFlexibleBtn = document.querySelector('.btn-flexible');
    if (elFlexibleBtn) elFlexibleBtn.disabled = true;

    const elGallerySearch = document.querySelector('.gallery-search');
    if (elGallerySearch) elGallerySearch.disabled = true;

    // Meme Editor //
    const elEditor = document.querySelector('.editor-container');
    if (elEditor) elEditor.innerHTML = `<p class="editor-placeholder">[Error] Meme Editor Unavailable ...</p>`;

    // Saved Memes //
    const elSavedMemes = document.querySelector('.saved-memes-container');
    if (elSavedMemes) elSavedMemes.innerHTML = `<p>[Error] No Saved Memes Available ...</p>`;

    const elSaveBtn = document.querySelector('.btn-save-meme');
    if (elSaveBtn) elSaveBtn.disabled = true;
}