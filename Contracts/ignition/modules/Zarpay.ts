import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { ethers } from "hardhat";

const usdtDecimals = 18

const ZarpayModule = buildModule("ZarpayModule", (m) => {
  const faucet = m.contract("Faucet", [], {
    
  });
  const faucetAddress = faucet.address;
  console.log('faucet : ', faucetAddress)
  // IgnitionModuleBuilder 
  // const usdtDecimals = m.getParameter("usdtDecimals", 18)
  

  const usdt = m.contract("TestToken", ['USD Tether', 'USDT', usdtDecimals], {
    after: [faucet],
  });

	const nft = m.contract("NFTReceipt", [], {
  }); 
  
  // const faucetAddress = m.readEventArgument(faucet, "Deployed", "addr")
  // // const usdtContract = m.contractAt("TestToken", usdt);
  // console.log('fuacet : ', faucetAddress)

  // m.call(usdt, 'transfer', [faucet, ethers.parseUnits('1000000', usdtDecimals)])

  /* 
  Instead of named accounts, you get access to the configured accounts
  through the `getAccount()` method.
 */
  const deployer = m.getAccount(0);
  const tokenOwner = m.getAccount(1);

  const payProcessor = m.contract("PayProcessor", 
    [
      deployer,
			deployer,
			nft
    ], {
    after: [nft]
    }
  ); 

	let isOpen = m.staticCall(payProcessor, 'isOpen', [], 0); 
  console.log('isOpen : ', isOpen.value)
	
	if(isOpen.value == false){
    m.call(payProcessor, 'toggleOpen', [])
	}
	
  //Test stores
  m.call(payProcessor, 'registerStore', ['Store0', deployer, 'txRef0', '',1])
  m.call(payProcessor, 'registerStore', ['Store0', deployer, 'txRef1', '',1], {id: 'registerstore2'})
	


  return { faucet,nft, usdt, payProcessor };
});

export default ZarpayModule;
