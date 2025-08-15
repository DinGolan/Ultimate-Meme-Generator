/***************************/
/* Ultimate Meme Generator */
/***************************/

/*==============================*/
/*      GLOBAL VARIABLES        */
/*==============================*/
var gImages                = [];
var gFilteredKeywords      = [];
var gKeywordSearchCountMap = null;

/*==============================*/
/*   IMAGE LIST MANAGEMENT      */
/*==============================*/
function addImage(folderFiles, folderPath, allImages, idCounterRef) {
    folderFiles.forEach(fileName => {
        const fileUrl = `${folderPath}/${fileName}`;
        allImages.push({
            id: idCounterRef.value,
            url: fileUrl,
            keywords: getKeywordsForImage(idCounterRef.value)
        });

        idCounterRef.value++;
    });
}

function getImageById(imageId) {
    return gImages.find(image => image.id === imageId);
}

function setImage(imageId) {
    gMeme.selectedImageId = imageId;
}

/*==============================*/
/*    IMAGE KEYWORDS HANDLING   */
/*==============================*/
function getKeywordsForImage(imageId) {
    let emptyList = [];

    switch (imageId) {
        case 1:
            return ['trump', 'politics', 'angry'];

        case 2:
            return ['dogs', 'cute', 'love'];

        case 3:
            return ['baby', 'dog', 'sleep'];

        case 4:
            return ['cat', 'sleep', 'keyboard'];

        case 5:
            return ['baby', 'success', 'meme'];

        case 6:
            return ['aliens', 'history', 'conspiracy'];

        case 7:
            return ['baby', 'surprised', 'funny'];

        case 8:
            return ['sarcastic', 'funny', 'meme'];

        case 9:
            return ['baby', 'laugh', 'funny'];

        case 10:
            return ['obama', 'politics', 'laugh'];

        case 11:
            return ['nba', 'basketball', 'kiss'];

        case 12:
            return ['pointing', 'man', 'funny'];

        case 13:
            return ['leonardo', 'cheers', 'meme'];

        case 14:
            return ['morpheus', 'matrix', 'movie'];

        case 15:
            return ['sean', 'lotr', 'meme'];

        case 16:
            return ['picard', 'facepalm', 'meme'];

        case 17:
            return ['putin', 'politics', 'russia'];

        case 18:
            return ['buzz', 'woody', 'meme'];

        case 19:
            return ['pointing', 'man', 'funny'];

        case 20:
            return ['music', 'sing', 'movie'];

        case 21:
            return ['trump', 'politics', 'angry'];

        case 22:
            return ['dogs', 'cute', 'love'];

        case 23:
            return ['baby', 'success', 'meme'];

        case 24:
            return ['cat', 'sleep', 'keyboard'];

        case 25:
            return ['baby', 'dog', 'sleep'];

        case 26:
            return ['sarcastic', 'funny', 'meme'];

        case 27:
            return ['baby', 'laugh', 'funny'];

        case 28:
            return ['angry', 'yelling', 'meme'];

        case 29:
            return ['aliens', 'history', 'conspiracy'];

        case 30:
            return ['dr', 'evil', 'meme'];

        case 31:
            return ['kids', 'dancing', 'happy'];

        case 32:
            return ['trump', 'politics', 'angry'];

        case 33:
            return ['baby', 'surprised', 'meme'];

        case 34:
            return ['dog', 'puppy', 'cute'];

        case 35:
            return ['obama', 'politics', 'laugh'];

        case 36:
            return ['nba', 'basketball', 'kiss'];

        case 37:
            return ['leonardo', 'cheers', 'meme'];

        case 38:
            return ['morpheus', 'matrix', 'movie'];

        case 39:
            return ['sean', 'lotr', 'meme'];

        case 40:
            return ['oprah', 'tv', 'giveaway'];

        case 41:
            return ['picard', 'facepalm', 'meme'];

        case 42:
            return ['putin', 'politics', 'russia'];

        case 43:
            return ['buzz', 'woody', 'meme'];

        default:
            return emptyList;
    }
}

function buildKeywordSearchCountMap() {
    gKeywordSearchCountMap = {};

    for (let imageId = 1; imageId <= gImages.length; imageId++) {
        const keywords = getKeywordsForImage(imageId);
        keywords.forEach(keyword => {
            if (!gKeywordSearchCountMap[keyword]) {
                gKeywordSearchCountMap[keyword] = 0;
            }
        });
    }
}

/*==================*/
/*    RANDOM TEXT   */
/*==================*/
function getRandomText() {
    const randTexts = [
        '😎 Life is Good 😎',
        '🫢 Oops ... 🫢',
        '🤠 Feeling Awesome ! 🤠',
        '🫣 Why Not ? 🫣'
    ];

    const randIdx  = Math.floor(Math.random() * randTexts.length);
    const randText = randTexts[randIdx];

    return randText;
}

/*====================*/
/*   GALLERY FILTER   */
/*====================*/
function extractKeywordsFromImages(images) {
    const keywordsList = [];

    if (Array.isArray(images)) {
        for (const img of images) {
            if (Array.isArray(img.keywords)) {
                for (const keyword of img.keywords) {
                    const cleanKeyword = String(keyword).trim();
                    if (cleanKeyword) keywordsList.push(cleanKeyword);
                }
            }
        }
    }

    return keywordsList;
}