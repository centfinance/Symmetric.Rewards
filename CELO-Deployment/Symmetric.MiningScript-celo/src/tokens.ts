interface CapTiers {
    [address: string]: string;
}

const capTiers: CapTiers = require('../lib/whitelist');
import { BigNumber } from 'bignumber.js';
const { bnum } = require('./utils');
export const SYMM_TOKEN = '0x7c64aD5F9804458B8c9F93f7300c15D55956Ac2a';
export const SYMM_TOKEN2 = '0x8427bD503dd3169cCC9aFF7326c15258Bc305478';

export const uncappedTokens = Object.entries(capTiers)
    .filter(([address, capString]) => capString == 'uncapped')
    .map(([a, c]) => a);

const CAP_TIERS = {
    cap1: bnum(1000000),
    cap2: bnum(3000000),
    cap3: bnum(10000000),
    cap4: bnum(30000000),
    cap5: bnum(100000000),
};

interface TokenCaps {
    [address: string]: BigNumber;
}

export const tokenCaps: TokenCaps = Object.entries(capTiers).reduce(
    (aggregator, capTuple) => {
        const address = capTuple[0];
        const capString = capTuple[1];
        if (capString !== 'uncapped') {
            aggregator[address] = CAP_TIERS[capString];
        }
        return aggregator;
    },
    {}
);

export const equivalentSets = [
    [
      [
        '0xD629eb00dEced2a080B7EC630eF6aC117e614f1b', // cBTC
        '0xBe50a3013A1c94768A1ABb78c3cB79AB28fc1aCE' // WBTC
      ]
    ],
    [
      [
        '0x2DEf4285787d58a2f811AF24755A8150622f4361', // cETH
        '0xE919F65739c26a42616b7b8eedC6b5524d1e3aC4' // WETH
      ]
    ],
  ];

export const REP_TOKEN = '0x1985365e9f78359a9B6AD760e32412f4a445E862';
export const REP_TOKEN_V2 = '0x221657776846890989a759BA2973e427DfF5C9bB';
