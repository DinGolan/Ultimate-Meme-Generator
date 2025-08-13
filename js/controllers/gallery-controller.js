/***************************/
/* Ultimate Meme Generator */
/***************************/

'use strict';

// Function Implementations //
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

function renderGallery() {
    const elGallery = document.querySelector('.gallery-container');

    let strHTML = '';
    gImages.forEach(image => {
            strHTML += `<img src="${image.url}"
                             alt="Meme - ${image.id}"
                             onclick="onImageSelect(${image.id})">`;
    });

    elGallery.innerHTML = strHTML;
}

function onImageSelect(imageId) {
    setImage(imageId);
    renderMemeEditor();
}