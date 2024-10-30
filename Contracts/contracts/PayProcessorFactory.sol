// // SPDX-License-Identifier: MIT

// pragma solidity ^0.8.17;
// import "./PayProcessor.sol";

// contract PayProcessorFactory{

//     event PayProcessorCreated(address merchant, address processorAddress);
    
//     mapping(address => address[]) public ownerAddresses;

//     uint public payProcessorCount;

//     address private adminPaymentAddress;

//     address owner;

//     address public receiptNFT;

//     constructor(address _receiptNFT){
//         owner=msg.sender;
//         adminPaymentAddress=owner;
//         receiptNFT=_receiptNFT;
//     }


//     // @Todo - Support a single address creating diff sales pages - to support multistore locations etc
//     function createPOS(string memory _name, address _paymentAddress, string memory _ipfsProductLink) public {

//         // require(ownerAddresses[msg.sender]==address(0), 'AlreadyRegistered');
        
//         PayProcessor processor = new PayProcessor(_name, _paymentAddress, address(this), adminPaymentAddress,  msg.sender, _ipfsProductLink, receiptNFT);
//         address processorAddress = address(processor);
        
//         ownerAddresses[msg.sender].push(processorAddress);
//         emit PayProcessorCreated(msg.sender, processorAddress);
//         payProcessorCount++;       

//     }

    

   

//     function  getOwnerPOSAddresses(address _owner) public view returns(address[] memory) {
//         return ownerAddresses[_owner];
//     }

//     function  changePaymentAddress(address _adminPaymentAddress) public  {
//         require(msg.sender==owner, 'OnlyOwner');
//         adminPaymentAddress = _adminPaymentAddress;
//     }

//     function  changeOwner(address newOwner) public  {
//         require(msg.sender==owner, 'OnlyOwner');
//         owner = newOwner;
//     }

    


// }