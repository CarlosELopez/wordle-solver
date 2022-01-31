import fs from 'fs';
import readline from 'readline-sync';
import { 
    validateGuessResult, 
    trimSet, 
    listAllWords,
    processYellowLetter,
    processGrayLetter,
    explainResultChars,
    processGreenLetter
} from './question-helpers.js';

import {
    discriminateIndex,
    getRemainingWords,
    pickRandomWordFromSet,
    discriminateIndexReverse,
    findDiscriminatorWord,
    findWorstWord,
    analyzeRepeats
} from './word-set-helpers.js';

function readWordleUniverse() {
    const wordleUniverse = fs.readFileSync('wordle-words.txt', 'utf-8');
    const wordleWords = new Set();
    wordleUniverse.split("\n").forEach(line => {
        const word = line.trim();
        if (word.length === 5 && word.match(/^[A-Za-z]+$/)) {
            wordleWords.add(word.toLowerCase());
        }
    });
    return wordleWords;
}

// game loop
console.log('> 🤖 The robots are in control. Resistance is futile');

let remainingWords = readWordleUniverse();

while (true) {

    if(remainingWords.size <= 0) {
        console.log("🔴 The remaining words are empty! This is an inconsistent result. Please check your guesses.🔴")
    }

    var command = readline.question("\n\nEnter a command: (suggest, guess, list, remain?, yellow, gray, remove-recent, worst, reset-words, analyze-repeats, exit) ").trim().toLowerCase();

    if(command === "guess") {
        var word = readline.question("Enter your next word guess > ")
            .trim()
            .toLowerCase();

        // Give the user a bit of context
        explainResultChars();

        var result = readline.question("Enter the WORDLE result of this guess by > ")
            .trim()
            .toLowerCase();

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
    else if(command === "green") {
        var letter = readline.question("Enter the letter you want to process > ").trim().toLowerCase();
        var index = Number.parseInt(readline.question("Enter the index > ").trim(), 10);

        processGreenLetter(remainingWords, letter, index);
        listAllWords(remainingWords);
    }
    else if(command === "yellow") {
        var letter = readline.question("Enter the letter you want to process > ").trim().toLowerCase();
        var index = Number.parseInt(readline.question("Enter the index > ").trim(), 10);

        processYellowLetter(remainingWords, letter, index);
        listAllWords(remainingWords);
    }
    else if(command === "gray") {
        var letter = readline.question("Enter the letter you want to process > ").trim().toLowerCase();

        processGrayLetter(remainingWords, letter);
        listAllWords(remainingWords);
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
    else if (command === "worst") {
        console.log(findWorstWord(remainingWords));
    }
    else if (command === "reset-words") {
        remainingWords = readWordleUniverse();
        listAllWords(remainingWords);
        console.log('Reset words for you! Back to the beginning');
    }
    else if(command === "analyze-repeats") {
        analyzeRepeats(remainingWords);
    }
    else if(command === "exit") {
        console.log('Bye bye 🤖');
        break;
    }

}
