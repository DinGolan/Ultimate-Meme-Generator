/***************************/
/* Ultimate Meme Generator */
/***************************/

'use strict';

/*================================================*/
/* Meme Generator - Features Implementation Table */
/*================================================*/
/*
+------------------------------------------------------+-------------+
| Feature                                              | Status      |
+------------------------------------------------------+-------------+
| Add a download link                                  | Done        |
| Add a color picker button                            | Done        |
| Add increase / decrease font buttons                 | Done        |
| Add (to gMeme) a second line                         | Done        |
| Render the lines on the canvas                       | Done        |
| Add the button 'add line'                            | Done        |
| Add the button 'switch line'                         | Done        |
| Draw a frame around the selected line                | Done        |
| When drawing text, save location & size for clicks   | Done        |
| When a line is clicked - select it & sync editor     | Done        |
| Build the page layout                                | Done        |
| Make it look good on mobile (gallery + editor)       | Done        |
| Controls : font family, font size, alignment         | Done        |
| Up / down arrows for positioning text line           | Done        |
| Add a Delete-Line button                             | Done        |
| Add "I'm flexible" button - random meme generator    | Done        |
| Save created memes (localStorage) + Saved Memes view | Done        |
| Image gallery filter (with <datalist>)               | Done        |
| Add stickers (emoji characters)                      | Done        |
| Support Drag & Drop of lines/stickers on canvas      | Done        |
| Share on Facebook                                    | Done        |
| Pick image from user device (instead of gallery)     | Done        |
| Search by keywords in Image-Gallery                  | Done        |
| Inline (on Canvas) text editing                      | Done        |
| Resize / Rotate a line                               | Not Done    |
| Support various aspect-ratios of images              | Not Done    |
| Add website theme variations (celeb, kid, etc.)      | Not Done    |
| Use Web Share API to share meme                      | In Progress |
| Add i18n & translation (e.g. Hebrew)                 | Not Done    |
+------------------------------------------------------+-------------+
*/

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