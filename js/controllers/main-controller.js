/***************************/
/* Ultimate Meme Generator */
/***************************/

'use strict';

/*================================================*/
/* Meme Generator - Features Implementation Table */
/*================================================*/
/**
+--------+------------------------------------------------------+-------------+
| Number | Feature                                              | Status      |
+---------------------------------------------------------------+-------------+
|   1    | Add a download link                                  | Done        |
+--------+------------------------------------------------------+-------------+
|   2    | Add a color picker button                            | Done        |
+--------+------------------------------------------------------+-------------+
|   3    | Add increase / decrease font buttons                 | Done        |
+--------+------------------------------------------------------+-------------+
|   4    | Add (to gMeme) a second line                         | Done        |
+--------+------------------------------------------------------+-------------+
|   5    | Render the lines on the canvas                       | Done        |
+--------+------------------------------------------------------+-------------+
|   6    | Add the button 'add line'                            | Done        |
+--------+------------------------------------------------------+-------------+
|   7    | Add the button 'switch line'                         | Done        |
+--------+------------------------------------------------------+-------------+
|   8    | Draw a frame around the selected line                | Done        |
+--------+------------------------------------------------------+-------------+
|   9    | When drawing text, save location & size for clicks   | Done        |
+--------+------------------------------------------------------+-------------+
|   10   | When a line is clicked - select it & sync editor     | Done        |
+--------+------------------------------------------------------+-------------+
|   11   | Build the page layout                                | Done        |
+--------+------------------------------------------------------+-------------+
|   12   | Make it look good on mobile (gallery + editor)       | Done        |
+--------+------------------------------------------------------+-------------+
|   13   | Controls : font family, font size, alignment         | Done        |
+--------+------------------------------------------------------+-------------+
|   14   | Up / down arrows for positioning text line           | Done        |
+--------+------------------------------------------------------+-------------+
|   15   | Add a Delete-Line button                             | Done        |
+--------+------------------------------------------------------+-------------+
|   16   | Add "I'm flexible" button - random meme generator    | Done        |
+--------+------------------------------------------------------+-------------+
|   17   | Save created memes (localStorage) + Saved Memes view | Done        |
+--------+------------------------------------------------------+-------------+
|   18   | Image gallery filter (with <datalist>)               | Done        |
+--------+------------------------------------------------------+-------------+
|   19   | Add stickers (emoji characters)                      | Done        |
+--------+------------------------------------------------------+-------------+
|   20   | Support Drag & Drop of lines/stickers on canvas      | Done        |
+--------+------------------------------------------------------+-------------+
|   21   | Share on Facebook                                    | Done        |
+--------+------------------------------------------------------+-------------+
|   22   | Pick image from user device (instead of gallery)     | Done        |
+--------+------------------------------------------------------+-------------+
|   23   | Search by keywords in Image-Gallery                  | Done        |
+--------+------------------------------------------------------+-------------+
|   24   | Inline (on Canvas) text editing                      | Done        |
+--------+------------------------------------------------------+-------------+
|   25   | Resize / Rotate a line                               | Not Done    |
+--------+------------------------------------------------------+-------------+
|   26   | Support various aspect-ratios of images              | Not Done    |
+--------+------------------------------------------------------+-------------+
|   27   | Add website theme variations (celeb, kid, etc.)      | Not Done    |
+--------+------------------------------------------------------+-------------+
|   28   | Use Web Share API to share meme                      | In Progress |
+--------+------------------------------------------------------+-------------+
|   29   | Add i18n & translation (e.g. Hebrew)                 | Not Done    |
+---------------------------------------------------------------+-------------+
**/

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