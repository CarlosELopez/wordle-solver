const YELLOW_LETTER = 'y';
const GREEN_LETTER = 'g';
const GRAY_LETTER = '_';
const DO_NOTHING = 'x';

function legalChar(char) {
    return !(char !== YELLOW_LETTER && 
        char !== GREEN_LETTER &&
        char !== GRAY_LETTER &&
        char !== DO_NOTHING);
}

export function explainResultChars() {
    console.log(`    🟨 Enter ${YELLOW_LETTER} for a yellow square.`);
    console.log(`    🟩 Enter ${GREEN_LETTER} for a green square.`);
    console.log(`    ⬜ Enter ${GRAY_LETTER} for a gray square.`);
    console.log(`       Enter ${DO_NOTHING} to ignore this space.`);
}

export function validateGuessResult(result) {
    for(var i = 0; i < result.length; i++) {
        if(!legalChar(result[i])) {
            return false;
        }
    }
    return true;
}

export function processGrayLetter(words, letter) {
    console.log("Processing Gray words by letter: ", letter);
    words.forEach(word => {
        if (word.includes(letter)) {
            words.delete(word);
        }
    });
}

export function processGreenLetter(words, letter, index) {
    console.log(`Will keep words with a green ${letter} at ${index}`);
    words.forEach(word => {
        if (word[index] !== letter) {
            words.delete(word);
        }
    });
}

export function processYellowLetter(words, letter, index) {
    // Filter wordsLengthFive by the letter
    console.log("Processing Yellow words by letter: ", letter);
    words.forEach(word => {
        if (false === word.includes(letter)) {
            words.delete(word);
        }
    });

    words.forEach(word => {
        if(word[index] === letter) {
            words.delete(word);
        }
    })
}

export function trimSet(wordSet, word, guessResult) {
    for(var i = 0; i < guessResult.length; i++) {
        const squareResult = guessResult[i];
        if(squareResult !== GREEN_LETTER && 
            squareResult !== YELLOW_LETTER &&
            squareResult !== GRAY_LETTER)
        {
            throw new Error(`Invalid guessResult ${guessResult}`);
        }

        if(squareResult === GREEN_LETTER) {
            processGreenLetter(wordSet, word[i], i);
        }
        else if(squareResult === YELLOW_LETTER) {
            processYellowLetter(wordSet, word[i], i);
        }
        else if(squareResult === GRAY_LETTER) {
            processGrayLetter(wordSet, word[i], i);
        }
        // else do nothing
    }
}

export function listAllWords(words) {
    words.forEach(word => {
        console.log(word);
    });
    console.log(words.size, " words remain");
}
