import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';
import {parseEther} from 'ethers';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
	
	const {ethers, deployments, getNamedAccounts} = hre;
	const {deploy} = deployments;

	const {deployer, simpleERC20Beneficiary: buyer} = await getNamedAccounts();

	const nftReceipt = await ethers.getContract("NFTReceipt");

	await deploy('PayProcessor', {
		from: deployer,
		args: [
			deployer,
			deployer,
			nftReceipt.address
			/*ticketMarket.address*/
		],
		log: true,
		autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
	});
	const payProcessor = await ethers.getContract("PayProcessor")

	let isOpen = await payProcessor.isOpen();
	let tx;
	if(isOpen == false){
		tx = await payProcessor.toggleOpen();
		await tx.wait();
	}
	

	//test store
	tx = await payProcessor.registerStore('Store0', deployer, 'txRef0', '',1);
	await tx.wait();

	// tx = await payProcessor.registerStore('Store1', deployer, 'txRef1', '',1);
	// await tx.wait();


	
};
export default func;
func.tags = ['ZarPay'];
func.dependencies = ['tokens'];
