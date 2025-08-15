/***************************/
/* Ultimate Meme Generator */
/***************************/

/*==============================*/
/*      GLOBAL VARIABLES        */
/*==============================*/
const MEME_STORAGE_KEY = 'savedMeme';

/*===========================*/
/*      LOCAL STORAGE        */
/*===========================*/
function saveMeme() {
    let emptyList = [];
    const memes   = loadFromStorage(MEME_STORAGE_KEY) || emptyList;

    const elCanvas      = document.querySelector('.meme-canvas');
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
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}