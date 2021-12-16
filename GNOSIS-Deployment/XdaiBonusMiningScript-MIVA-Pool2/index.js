require('regenerator-runtime/runtime');
const Web3 = require('web3');
const cliProgress = require('cli-progress');
const { argv } = require('yargs');

const { fetchAllPools } = require('./lib/subgraph');
const poolAbi = require('./abi/BPool.json');
const tokenAbi = require('./abi/BToken.json');

const { getPoolDataAtBlock, processPoolData } = require('./lib/blockData');
const { sumUserLiquidity } = require('./lib/userRewardCalculation');
const { REP_TOKEN, REP_TOKEN_V2, SYMM_TOKEN } = require('./lib/tokens');
const {
    ensureDirectoryExists,
    pricesAvailable,
    readPrices,
    writePrices,
    writePools,
    // writeTokens,
    writeBlockRewards,
} = require('./lib/fileService');
const { bnum, fetchMIVA } = require('./lib/utils');

const ENDPOINT = process.env.ENDPOINT_URL;
const MIVAENDPOINT = process.env.MIVA_ENDPOINT_URL
//const ENDPOINT = "ws://localhost:8546"

const web3 = new Web3(new Web3.providers.WebsocketProvider(ENDPOINT));



if (!argv.startBlock || !argv.endBlock || !argv.week) {
    console.log(
        'Usage: node index.js --week 1 --startBlock 10131642 --endBlock 10156690'
    );
    process.exit();
}
console.log(`ENDPOINT: ${process.env.SUBGRAPH_URL}`);
// Parameters for the week's interval
const END_BLOCK = argv.endBlock; // Closest block to reference time at end of week
const START_BLOCK = argv.startBlock; // Closest block to reference time at beginning of week
const WEEK = argv.week; // Week for mining distributions. Ex: 1

// Distribution parameters
const STAKE_PER_WEEK = bnum(99.75);
const BLOCKS_PER_SNAPSHOT = 679; // 256;

const NUM_SNAPSHOTS = Math.ceil(
    (END_BLOCK - START_BLOCK) / BLOCKS_PER_SNAPSHOT
);
const BAL_PER_SNAPSHOT = STAKE_PER_WEEK.div(bnum(NUM_SNAPSHOTS)); // Ceiling because it includes end block

(async function () {
    console.log(
        'Computing rewards for week ' +
            WEEK +
            '\n (from block ' +
            START_BLOCK +
            ' to ' +
            END_BLOCK +
            ')'
    );

    const multibar = new cliProgress.MultiBar(
        {
            clearOnComplete: false,
            format: '[{bar}] {percentage}% | ETA: {eta}s | {value}/{total} | {task}',
        },
        cliProgress.Presets.shades_classic
    );

    // Setup data directory
    ensureDirectoryExists(WEEK);

    //node index.js --week 24 --startBlock 15297640 --endBlock 15297643
    // get start and end time
    let startBlockTimestamp = (await web3.eth.getBlock(START_BLOCK)).timestamp;
    let endBlockTimestamp = (await web3.eth.getBlock(END_BLOCK)).timestamp;
    console.log(
        ' (from timestamp ' +
            startBlockTimestamp +
            ' to ' +
            endBlockTimestamp +
            ')\nBal Per snapshot ' +
            BAL_PER_SNAPSHOT
    );


    let blockNums = Array.from(
        { length: NUM_SNAPSHOTS },
        (x, i) => END_BLOCK - BLOCKS_PER_SNAPSHOT * i
    ).filter((blockNum) => !(argv.skipBlock && blockNum >= argv.skipBlock));

    console.log('Looping of Blocks... ');
    for (let blockNum of blockNums) {
        let x = await fetchMIVA(blockNum);
        console.log(x);
        writeBlockRewards(WEEK, blockNum, x);
    }
    return;
})();
