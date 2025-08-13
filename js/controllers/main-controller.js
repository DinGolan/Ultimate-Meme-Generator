/***************************/
/* Ultimate Meme Generator */
/***************************/

'use strict';

// Function Implementations //
async function onInit() {
    try {
        await updateImageList();
        renderGallery();
        renderEmptyEditor();
    } catch (error) {
        console.error('Error Counting Images : ', error.message);

        const elGalleryContainer     = document.querySelector('.gallery-container');
        elGalleryContainer.innerHTML = `<p>[Error] No Images Found to Display ...</p>`;
    }
}