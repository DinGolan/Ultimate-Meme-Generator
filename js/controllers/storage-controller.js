/***************************/
/* Ultimate Meme Generator */
/***************************/

/*==============================*/
/*     SAVE TO LOCAL STORAGE    */
/*==============================*/
function onSaveMeme() {
    saveMeme();
    renderSavedMemes();
}

function renderSavedMemes() {
    const savedMemes  = getSavedMemes();
    const elContainer = document.querySelector('.saved-memes-container');

    if (!savedMemes || !savedMemes.length) {
        onRemoveSharedButtons();
        elContainer.innerHTML = '<p class="info-message"><strong>[Info]</strong> No Saved Memes Available ...</p>'
        return;
    }

    const strHTML = savedMemes.map((meme, idx) =>
        `
        <div class="saved-meme-card" src="${meme.imageBase64}" onclick="onEditSavedMeme(${idx})" title="Edit Meme">
            <img src="${meme.imageBase64}" alt="Saved Meme ${idx}">
            <button class="saved-meme-delete" title="Delete Meme"
                    onclick="onDeleteSavedMeme(${idx}, event)">x</button>
        </div>
        `
    );

    elContainer.innerHTML = strHTML.join(DEFAULT_TEXT);
}

function onEditSavedMeme(idx) {
    const savedMemes = getSavedMemes();
    if (savedMemes[idx]) {
        gMeme = savedMemes[idx].memeData;
        renderMemeEditor();
    }
}

function onDeleteSavedMeme(idx, event) {
    if (event) event.stopPropagation();

    const memes = getSavedMemes();
    if (!memes || idx < 0 || idx >= memes.length) return;

    memes.splice(idx, 1);
    saveToStorage(MEME_STORAGE_KEY, memes);

    renderSavedMemes();
}