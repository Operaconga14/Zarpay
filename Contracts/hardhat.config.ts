import { HardhatUserConfig, vars } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import 'hardhat-deploy';
import '@nomiclabs/hardhat-ethers';
import 'hardhat-deploy-ethers';
// import 'hardhat-contract-sizer';
import {node_url, accounts, addForkConfiguration} from './utils/network';

// const INFURA_API_KEY = vars.get("INFURA_API_KEY");

const config: HardhatUserConfig = {
  solidity: {
		compilers: [
			{
				version: '0.8.18',
				settings: {
					optimizer: {
						enabled: true,
						runs: 200,
						details: {
							yul: true,
						},
					},
					viaIR: true,
				},
			},
			{
				version: '0.8.25',
				settings: {
					optimizer: {
						enabled: true,
						runs: 200,
						details: {
							yul: true,
						},
					},
					viaIR: true,
				},
			},
		],
	},

  namedAccounts: {
		deployer: 0,
		simpleERC20Beneficiary: 1,
	},
  ignition: {
    strategyConfig: {
      create2: {
        // To learn more about salts, see the CreateX documentation
        salt: "0x00056000000af000fb0000000000024360000000000000000000000000000000",
      },
    },
  },

	networks: addForkConfiguration({
		hardhat: {
			initialBaseFeePerGas: 0, // to fix : https://github.com/sc-forks/solidity-coverage/issues/652, see https://github.com/sc-forks/solidity-coverage/issues/652#issuecomment-896330136
		},
		// localhost: {
		// 	url: node_url('localhost'),
		// 	accounts: accounts(),
		// },
		ganache: {
			url: 'http://127.0.0.1:7545',
			accounts: [
				'7c764ca90dab0468b163bb8272e247eb06abd756072b7c80e9e2f88e24b3b518',
				'dac5005f97f0be8bb23879f38a9ca93c60410d20796806d23f03aac88a1964a3',
				'767b05471aa3713700998846d7be6038db16d5e29e7460c604bb382fcf4100a3',
				'67d7a67d19c2d63df22f4078f5e7732f500fe37bc42660510e09da038814fa5e',
			],
		},
		staging: {
			url: node_url('rinkeby'),
			accounts: accounts('rinkeby'),
		},
		production: {
			url: node_url('mainnet'),
			accounts: accounts('mainnet'),
		},
		mainnet: {
			url: node_url('mainnet'),
			accounts: accounts('mainnet'),
		},
		rinkeby: {
			url: node_url('rinkeby'),
			accounts: accounts('rinkeby'),
		},
		kovan: {
			url: node_url('kovan'),
			accounts: accounts('kovan'),
		},
		goerli: {
			url: node_url('goerli'),
			accounts: accounts('goerli'),
		},
		theta_t: {
			url: 'https://eth-rpc-api-testnet.thetatoken.org/rpc',
			accounts:
				vars.has('PRIVATE_KEY') ? [vars.get('PRIVATE_KEY'), vars.get('PRIVATE_KEY_2')] : [],
			chainId: 365,
		},
		okb_test: {
			url: 'https://okbtestrpc.okbchain.org',
			accounts:
				vars.has('PRIVATE_KEY') ? [vars.get('PRIVATE_KEY'), vars.get('PRIVATE_KEY_2')] : [],
			chainId: 195,
		},
		evmos_t: {
			url: 'https://eth.bd.evmos.dev:8545',
			accounts:
				vars.has('PRIVATE_KEY') ? [vars.get('PRIVATE_KEY'), vars.get('PRIVATE_KEY_2')] : [],
			chainId: 9000,
		},
		fantom_t: {
			url: "https://rpc.ankr.com/fantom_testnet/",
			accounts: vars.has('PRIVATE_KEY') ? [vars.get('PRIVATE_KEY'), vars.get('PRIVATE_KEY_2')] : [],
			chainId: 4002,
		  }, 
		fantom: {
			url: 'https://rpc.fantom.network',
			accounts: vars.has('PRIVATE_KEY') ? [vars.get('PRIVATE_KEY'), vars.get('PRIVATE_KEY_2')] : [],
			chainId: 250,
		},
		aurora: {
			url: "https://mainnet.aurora.dev",
			accounts: vars.has('PRIVATE_KEY') ? [vars.get('PRIVATE_KEY'), vars.get('PRIVATE_KEY_2')] : [],
			chainId: 1313161554 ,
		},
		aurora_t: {
			url: "https://testnet.aurora.dev/",
			accounts: vars.has('PRIVATE_KEY') ? [vars.get('PRIVATE_KEY'), vars.get('PRIVATE_KEY_2')] : [],
			chainId: 1313161555,
		},
		celo: {
			url: "https://forno.celo.org",
			accounts: vars.has('PRIVATE_KEY') ? [vars.get('PRIVATE_KEY'), vars.get('PRIVATE_KEY_2')] : [],
			chainId: 42220,
			
			
		},
		"celo_t": {// alfajores
			url: "https://alfajores-forno.celo-testnet.org",
			accounts: vars.has('PRIVATE_KEY') ? [vars.get('PRIVATE_KEY'), vars.get('PRIVATE_KEY_2')] : [],
			chainId: 44787,
			
			
		},

		"mumbai": { //polygon test
			url: "https://rpc-mumbai.maticvigil.com",
			accounts: vars.has('PRIVATE_KEY') ? [vars.get('PRIVATE_KEY'), vars.get('PRIVATE_KEY_2')] : [],
			chainId: 80001 ,
			
			
		},

		"base_t": { //Base test
			url: "https://sepolia.base.org",
			accounts: vars.has('PRIVATE_KEY') ? [vars.get('PRIVATE_KEY'), vars.get('PRIVATE_KEY_2')] : [],
			chainId: 84532 ,
			gasPrice: 350000000,
			
			
		},
	}),
	
	gasReporter: {
		currency: 'USD',
		gasPrice: 100,
		enabled: process.env.REPORT_GAS ? true : false,
		coinmarketcap: process.env.COINMARKETCAP_API_KEY,
		maxMethodDiff: 10,
	},
	
	mocha: {
		timeout: 0,
	},
	
	// contractSizer: {
	// 	alphaSort: true,
	// 	disambiguatePaths: false,
	// 	runOnCompile: true,
	// 	strict: true,
	// 	only: [':Faucet*',  'Pay*', 'Types', 'NFTReceipt', 'Error*', 'TestToken'],
	// }

};

export default config;
