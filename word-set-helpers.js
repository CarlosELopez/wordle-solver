
export function discriminateIndex(wordSet, index) {
    const letterCount = {};
    wordSet.forEach(word => {
        const char = word[index];
        if(letterCount[char] === undefined) {
            letterCount[char] = 0;
        }
        letterCount[char]++;
    });

    const perfectScore = wordSet.size/2; //arbitrary score: attempt a half split.
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

export function getRemainingWords(words, discriminatorLetter, index) {
    const remainingWordSet = new Set();
    words.forEach(word => {
        if(word[index] === discriminatorLetter) {
            remainingWordSet.add(word);
        }
    });
    return remainingWordSet;
}

export function pickRandomWordFromSet(wordSet) {
    const words = [];
    wordSet.forEach(word => {
        words.push(word);
    });
    return words[Math.floor(Math.random() * words.length)];
}

export function discriminateIndexReverse(wordSet, index) {
    const letterCount = {};
    wordSet.forEach(word => {
        const char = word[index];
        if (letterCount[char] === undefined) {
            letterCount[char] = 0;
        }
        letterCount[char]++;
    });

    const perfectScore = wordSet.size/2; //arbitrary score: attempt a half split.
    const letterScore = {};
    let maxScore = -1; //distance from perfect score. Maximize.
    let bestCount = -1;
    let bestLetter = undefined;
    Object.keys(letterCount).forEach(letter => {
        var score = Math.abs(perfectScore-letterCount[letter]);
        var count = letterCount[letter];

        if (score > maxScore) {
            maxScore = score;
            bestLetter = letter;
            bestCount = count;
        }
        else if(score === maxScore && count < bestCount) {
            bestCount = count;
        }

        // debug info only.
        letterScore[letter] = {
            score,
            count
        }
    });
    
    return { letter: bestLetter, count: letterCount[bestLetter], maxScore, index };
}

export function findWorstWord(wordSet) {

    let selectedDiscs = [];
    let possibleWords = wordSet;

    do {
        var discriminators = [];
        for(var i = 0; i < 5; i++) {
            const isNewIndex = selectedDiscs.find(disc => {
                return i == disc.index;
            });
            
            if(isNewIndex === undefined) {
                discriminators.push(discriminateIndexReverse(possibleWords, i))
            }
        }
    
        let selectedDisc = null;
        let maxScore = Number.MIN_SAFE_INTEGER;
        let minCount = Number.MAX_SAFE_INTEGER;
        let discIndex;
        // Form word in reverse, this is an arbitary choice;
        for(i = 0; i < discriminators.length; i++) {
            const discriminator = discriminators[i];
            if(discriminator.maxScore > maxScore || 
                (discriminator.maxScore === maxScore && 
                    discriminator.count < minCount))
            {
                maxScore = discriminator.minScore;
                minCount = discriminator.maxCount;
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
            console.log(`selected ${selectedDisc.letter}, ${selectedDisc.index}`);
            selectedDiscs.push(selectedDisc);
            possibleWords = remaining;
        }
        
    } while (selectedDiscs.length < 5);

    //console.log(selectedDiscs);
    console.log("Possible worst words: ", possibleWords);    
    return pickRandomWordFromSet(possibleWords);
}

export function findDiscriminatorWord(wordSet) {

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
    //console.log("possibleWords);
    const suggestedWord = pickRandomWordFromSet(possibleWords);
    return suggestedWord;
}

export function analyzeRepeats(wordSet) {

    const repeats = new Set();
    const maxRepeatCount = Number.MIN_SAFE_INTEGER;

    const repeatsThree = new Set();

    wordSet.forEach(word => {
        const charMap = {};

        for(var i = 0; i < word.length; i++) {
            const char = word[i];
            if(!charMap[char]) {
                charMap[char] = 0;
            }
            charMap[char]++;
        }

        const repeatCount = Math.max(...Object.values(charMap));
        if(repeatCount === 2) {
            repeats.add(word);
        }
        else if(repeatCount >= 3) {
            repeatsThree.add(word);
        }
    });

    console.log(repeats);
    console.log(repeatsThree);

}

