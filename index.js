const neataptic = require('neataptic'),
    jsonfile = require('jsonfile');

const vocabRegex = /([a-zA-Z0-9а-яёА-ЯЁ]+|\s+|[^a-zA-Z0-9а-яА-Я\s]+)/gu;
const initialIO = () => new Array(6).fill(0);
// const readline = require('readline');

// const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout
// });

let trainSet = [];

function decToBinArray(dec) {
    // console.log('decToBinArray: input: ', dec);
    let mask = 0x1;
    let outputArray = [];
    for (let i = 0; i < 6; i++) {
        let bit = (dec >> i) & mask;
        outputArray = [bit, ...outputArray];
    }
    // console.log('decToBinArray: output: ', outputArray);
    return outputArray;
}

function binArrayToDec(binArray) {
    let dec = 0;
    for (let i = binArray.length - 1; i >= 0; i--) {
        let temp = binArray[i] << ((binArray.length - 1) - i);
        // console.log(`temp: index: ${i}: value: ${temp}`);
        dec = dec | temp;
    }
    return dec;
}

// console.log(binArrayToDec(decToBinArray(0xA)));

// return;

let options = {
    memoryToMemory: true,    // default is false
    outputToMemory: true,    // default is false
    outputToGates: true,     // default is false
    inputToOutput: true,      // default is true
    inputToDeep: true         // default is true
};

let vocab = ['unknown', 'eof',];

let wordSet = [
    {
        input: "Привет, как тебя зовут?",
        output: "Сыч"
    },
    {
        input: "Привет, чем занимаешся?",
        output: "Работаю"
    },
    {
        input: "Зачем?",
        output: "Чтоб мог купить еду ))0"
    },
    {
        input: "Зачем тебе есть?",
        output: "Чтоб жить"
    },
    {
        input: "Как дела?",
        output: "Плохо"
    },
    {
        input: "Как плохо?",
        output: "Очень плохо"
    },
    {
        input: "Какой сейчас месяц?",
        output: "Фебрюль"
    },
    {
        input: "Как называется текущий месяц?",
        output: "Фебрюль"
    },
    {
        input: "В чём заключается твоя работа?",
        output: "В говнокоде"
    },
    {
        input: "В чём заключается твоя работа?",
        output: "В каждом"
    },
];
let longest = 0;
wordSet.forEach((item) => {
    let words = [...item.input.match(vocabRegex), 'eof', ...item.output.match(vocabRegex), 'eof'];
    let lengthQDouble = [...item.input.match(vocabRegex), 'eof', ...item.input.match(vocabRegex), 'eof'].length;
    let lengthADouble = [...item.output.match(vocabRegex), 'eof', ...item.output.match(vocabRegex), 'eof'].length;
    if (words.length > longest) longest = words.length;
    if (lengthQDouble > longest) longest = words.length;
    if (lengthADouble > longest) longest = words.length;
    words.forEach((item) => {
        if (vocab.indexOf(item) === -1) {
            vocab.push(item);
        }
    });
});

wordSet.forEach((item) => {
    let question = item.input.match(vocabRegex);
    let answer = item.output.match(vocabRegex);
    let train = [];

    for (let i = 0; i < 15; i++) {
        let vocabIndex = vocab.indexOf(question[i]);
        if (vocabIndex === -1 && question[i] !== 'undefined') {
            train.push({
                input: decToBinArray(1),
                output: initialIO()
            });
        }
        if (vocabIndex === -1 && question[i] === 'undefined') {
            train.push({
                input: decToBinArray(0),
                output: initialIO()
            });
        }
        if (vocabIndex !== -1) {
            train.push({
                input: decToBinArray(vocabIndex),
                output: initialIO()
            });
        }
    }
    /* ======================= */
    for (let i = 0; i < 15; i++) {
        let vocabIndex = vocab.indexOf(answer[i]);
        if (vocabIndex === -1 && (i >= answer.length)) {
            train.push({
                input: initialIO(),
                output: decToBinArray(1)
            });
        }
        if (vocabIndex === -1 && (i < answer.length)) {
            train.push({
                input: initialIO(),
                output: decToBinArray(0)
            });
        }
        if (vocabIndex !== -1) {
            train.push({
                input: initialIO(),
                output: decToBinArray(vocabIndex)
            });
        }
    }
    trainSet.push(...train);
});

// console.log('longest: ', longest);
// trainSet.forEach((item) => {
//     console.log('trainSet: ', item);
// })


// rl.question('What do you think of Node.js? ', (answer) => {
//     // TODO: Log the answer in a database
//     console.log(`Thank you for your valuable feedback: ${answer}`);
//
//     rl.close();
// });

// return;


// const dialogFile = 'dialogs.json';
// let dialog = null;
// let dialogDataSet = [];
// jsonfile.readFile(dialogFile, function (err, obj) {
//     dialog = obj;
//     //console.dir(obj.vocabulary.length)
// });

let network = new neataptic.architect.LSTM(6, 36, 36, 6, options);

network.train(trainSet, {
    log: 50,
    iterations: 6000,
    error: 0.015,
    clear: true,
    rate: 0.05,
});


trainSet.forEach((item) => {
    let output = network.activate(item.input).map((item) => {
        return Math.round(item);
    });
    let quest = "";
    let answ = "";
    quest += vocab[binArrayToDec(item.input)];
    answ += (binArrayToDec(output) === 1 || binArrayToDec(output) === 0) ? '' : vocab[binArrayToDec(output)];
    // item.input.forEach((item)=>{
    //     console.log('input: as array: ',item);
    //
    // });
    // output.forEach((item)=>{
    //     answ+=vocab[binArrayToDec(item)];
    // });

    console.log(`input: ${quest}\noutput: ${answ}\n`);
});


