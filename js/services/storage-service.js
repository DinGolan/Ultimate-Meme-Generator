/***************************/
/* Ultimate Meme Generator */
/***************************/

/*==============================*/
/*      GLOBAL VARIABLES        */
/*==============================*/
const MEME_STORAGE_KEY    = 'savedMeme';
const GALLERY_STORAGE_KEY = 'savedGallery';

/*===========================*/
/*      LOCAL STORAGE        */
/*===========================*/
function saveMeme() {
    let emptyList = [];
    const memes   = loadFromStorage(MEME_STORAGE_KEY) || emptyList;

    const elCanvas = document.querySelector('.meme-canvas');
    if (!elCanvas) {
        alert('[Error] Cannot Save Meme - No Image Selected !');
        return;
    }

    const memeImageData = elCanvas.toDataURL('image/png');

    const savedMeme = {
        memeData: JSON.parse(JSON.stringify(gMeme)),
        imageBase64: memeImageData
    };

    memes.push(savedMeme);
    saveToStorage(MEME_STORAGE_KEY, memes);
}

function getSavedMemes() {
    let emptyList = [];
    return loadFromStorage(MEME_STORAGE_KEY) || emptyList;
}

function saveToStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function loadFromStorage(key) {
    const data       = localStorage.getItem(key);
    const parsedData = data ? JSON.parse(data) : null;

    if (key === GALLERY_STORAGE_KEY && parsedData) {
        gImages = parsedData;
        buildKeywordSearchCountMap();
    }

    return parsedData;
}