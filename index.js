import fs from 'fs';
import readline from 'readline-sync';
import { 
    validateGuessResult, 
    trimSet, 
    listAllWords,
    processYellowLetter,
    processGrayLetter,
    explainResultChars
} from './question-helpers.js';

const wordleUniverse = fs.readFileSync('wordle-words.txt', 'utf-8');
const wordleWords = new Set();
wordleUniverse.split("\n").forEach(line => {
    const word = line.trim();
    if (word.length === 5 && word.match(/^[A-Za-z]+$/)) {
        wordleWords.add(word.toLowerCase());
    }
});

function discriminateIndex(words, index) {
    const letterCount = {};
    words.forEach(word => {
        const char = word[index];
        if(letterCount[char] === undefined) {
            letterCount[char] = 0;
        }
        letterCount[char]++;
    });

    const perfectScore = words.size/2;
    const letterScore = {};
    let minScore = Number.MAX_SAFE_INTEGER;
    let bestCount = -1;
    let bestLetter = undefined;
    Object.keys(letterCount).forEach(letter => {
        var score = Math.abs(perfectScore-letterCount[letter]);
        var count = letterCount[letter];

        if (score < minScore) {
            minScore = score;
            bestLetter = letter;
            bestCount = count;
        }
        else if(score === minScore && count > bestCount) {
            bestCount = count;
        }

        // debug info only.
        letterScore[letter] = {
            score,
            count
        }
    });

    //console.log(letterScore);

    return { letter: bestLetter, count: letterCount[bestLetter], minScore, index };
}

function getRemainingWords(words, discriminatorLetter, index) {
    const remainingWordSet = new Set();
    words.forEach(word => {
        if(word[index] === discriminatorLetter) {
            remainingWordSet.add(word);
        }
    });
    return remainingWordSet;
}

function pickRandomWordFromSet(wordSet) {
    const words = [];
    wordSet.forEach(word => {
        words.push(word);
    });
    return words[Math.floor(Math.random() * words.length)];
}

function findDiscriminatorWord(wordSet) {

    let selectedDiscs = [];
    let possibleWords = wordSet;

    do {
        var discriminators = [];
        for(var i = 0; i < 5; i++) {
            const isNewIndex = selectedDiscs.find(disc => {
                return i == disc.index;
            });
            
            if(isNewIndex === undefined) {
                discriminators.push(discriminateIndex(possibleWords, i))
            }
        }
    
        let selectedDisc = null;
        let minScore = Number.MAX_SAFE_INTEGER;
        let maxCount = Number.MIN_SAFE_INTEGER;
        let discIndex;
        // Form word in reverse, this is an arbitary choice;
        for(i = 0; i < discriminators.length; i++) {
            const discriminator = discriminators[i];
            if(discriminator.minScore < minScore || 
                (discriminator.minScore === minScore && 
                    discriminator.count > maxCount))
            {
                minScore = discriminator.minScore;
                maxCount = discriminator.maxCount;
                selectedDisc = discriminator;
                discIndex = i;
            }
        }

        if(selectedDisc === null) {
            console.log('🔴 Something went wrong when finding discriminator. No words remain.');
            return;
        }

        // remove the selected letter
        discriminators.splice(discIndex, 1);
        
        // see how many words we have remaining.
        let remaining = getRemainingWords(possibleWords, selectedDisc.letter, selectedDisc.index);
        
        if(remaining.size > 0) {
            //console.log(`selected ${selectedDisc.letter}, ${selectedDisc.index}`);
            selectedDiscs.push(selectedDisc);
            possibleWords = remaining;
        }
        
    } while (selectedDiscs.length < 5);

    //console.log(selectedDiscs);
    //console.log(possibleWords);
    const suggestedWord = pickRandomWordFromSet(possibleWords);
    return suggestedWord;
}


// game loop
const remainingWords = wordleWords;

console.log('> 🤖 The robots are in charge');

while (true) {

    if(remainingWords.size <= 0) {
        console.log("🔴 The remaining words are empty! This is an inconsistent result. Please check your guesses.🔴")
    }

    var command = readline.question("Enter a command: (suggest, guess, list, remain?, yellow, gray, remove-recent, exit) ").trim().toLowerCase();

    if(command === "guess") {
        var word = readline.question("Enter your next word guess > ").trim().toLowerCase();

        // Give the user a bit of context
        explainResultChars();
        var result = readline.question("Enter the WORDLE result of this guess by > ").trim().toLowerCase();

        if(validateGuessResult(result)) {
            trimSet(remainingWords, word, result);
            listAllWords(remainingWords);
            console.log(findDiscriminatorWord(remainingWords));
        }
        else {
            console.log(`🔴 The WORDLE result '${result}' provided is not consistent`);
        }
    }
    else if(command === "list") {
        listAllWords(remainingWords);
    }
    else if(command === "suggest") {
        console.log(`Try this next: 🟡 ${findDiscriminatorWord(remainingWords)}`);
    }
    else if(command === "remain?") {
        var word = readline.question("Enter the word you want to check? > ").trim().toLowerCase();
        if(remainingWords.has(word)) {
            console.log(`🟢 ${word} is in the remaining set`);
        }
        else {
            console.log(`🔴 ${word} is NOT the remaining set`)
        }
    }
    else if(command === "yellow") {
        var letter = readline.question("Enter the letter you want to process > ").trim().toLowerCase();
        var index = Number.parseInt(readline.question("Enter the index > ").trim(), 10);

        processYellowLetter(remainingWords, letter, index);
    }
    else if(command === "gray") {
        var letter = readline.question("Enter the letter you want to process > ").trim().toLowerCase();

        processGrayLetter(remainingWords, letter);
    }
    else if(command === "remove-recent") {
        var word = readline.question("Enter the word you want to check? > ").trim().toLowerCase();
        console.log(`I will remove the word ${word}`);
        if(remainingWords.has(word)) {
            remainingWords.delete(word);
            console.log(`✔ ${word} has been removed`);
        }
        else {
            console.log(`❓ I was unable to find ${word} in the set.`);
        }
    }
    else if(command === "exit") {
        console.log('Bye bye 🤖');
    }

}
