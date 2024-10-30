import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

import {readFileSync, writeFileSync} from 'fs';
import {join} from 'path';
import { parseUnits } from 'ethers/lib/utils';
import { getChainId } from 'hardhat';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
	// const provider = new JsonRpcProvider ();
	const {ethers,deployments, getNamedAccounts} = hre;
	const {deploy} = deployments;

	const {deployer} = await getNamedAccounts();
	console.log('start1 Deployr : ', deployer)
	// let contract_owner = await ethers.getSigner(deployer);
	// Connect to wallet to sign transactions
	// const contract_owner = new ethers.Wallet(
	// 	'Add your private key here',
	// 	provider
	//   );
	// console.log('start2 Deployr : ', contract_owner)

	console.log('Deployer: ', deployer)
	// const tt = await deploy('Tt', {
	// 	from: deployer,
	// 	args: ['USD Tether', 'USDT'],
	// 	log: true,
	// 	autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
	// });
	const usdtDecimals = '18'

	const usdtContractDeployResult = await deploy('TestToken', {
		from: deployer,
		args: ['USD Tether', 'USDT', usdtDecimals],
		log: true,
		autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
	});

	let aurContractDeployResult;
	if(/*await getChainId()== '1313161554' ||*/ await getChainId()== '1313161555'){
		aurContractDeployResult = await deploy('Aurora', {
			from: deployer,
			contract: 'TestToken',
			args: ['Aurora', 'AURORA', 18],
			log: true,
			autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
		});
	}

	const nft = await deploy('NFTReceipt', {
		from: deployer,
		args: [],
		log: true,
		autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
	});

	// await deploy('Nft', {
	// 	from: deployer,
	// 	args: [],
	// 	log: true,
	// 	autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
	// });

	const faucetContract = await ethers.getContract('Faucet');
	const usdt = await ethers.getContractAt('TestToken', usdtContractDeployResult.address);
	
	const tx = await usdt.transfer(faucetContract.address, parseUnits('1000000', usdtDecimals));
	await tx.wait();

	if(aurContractDeployResult){
		let aur = await ethers.getContractAt('TestToken', aurContractDeployResult.address);
	
		const tx = await aur.transfer(faucetContract.address, parseUnits('1000000', 18));
		await tx.wait();
	}

};
export default func;
func.tags = ['tokens'];
func.dependencies = ['Faucet'];
