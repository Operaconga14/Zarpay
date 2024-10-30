//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.23;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "./NFTReceipt.sol";
import "./Libraries/Errors.sol";

error ContractClosed();
error StoreClosed();
error DuplicateOrder();
error NotEnoughMoney();
error NotStoreOwner();

// This implements a payment by customers calling submitOrder
// Anothr type of processor should create a temporary wallet that receives the payment on behalf of the merchant, 
// and notifies the merchant, This can be used for an API type of integration as opposed to hostedPay, 
// drawback is gas cost to transfer from temporary wallet to merchants wallet
contract PayProcessor is Ownable {
    using SafeERC20 for IERC20;
    event StoreCreated( uint indexed storeId, string name, address indexed paymentAddress, string indexed txRef, uint currencyId,string txRefRaw);//txRef added twice, bcos , When searching you use the indexed parameter, when outputting you use the other one
    //event OrderCreated(uint indexed storeId, uint indexed orderId, string orderMetadataUrl, address indexed token, uint amount);
    event PurchaseCompleted(address indexed payer, uint indexed storeId,bytes32 indexed orderTransactionReference, uint receiptTokenId, uint amount, address token);

    enum OrderTypes{
        Full,
        Quick
    }

    struct Order{
        bytes32 transactionReference;
        string metadataUrl; //nft MetadataUrl
        uint amount;
        address token;
        address customer;
        bool paid;
        uint date;
        OrderTypes orderType;
        uint storeId;
    }

    struct Store{
        uint id;
        string metadataUrl;
        uint date;
        string name; // (Store name).
        address paymentAddress; // Designated payment address for incoming orders.
        bool storeOpened;
        uint currencyId;
        address storeOwner;
    }

    
    // mapping(uint => uint[]) public orderByStoreOwners;
    
    mapping(uint => bytes32[]) public orderByStoreOwners; //storeId->orderTxRef
    mapping(bytes32 => bool) public ordersExisting;
    mapping(bytes32 => Order) public orders;
    
    address private admin;
    address private adminPaymentAddress;
    uint adminFee = 100;// percent *100

    // Order[] orders;
    // uint orderCount=0; //

    Store[] stores;
    uint public storeCount=0; //

    
    string public ipfsProductLink;
    // Flag to determine whether or not purchase orders can be accepted/emitted from contract.
    bool public isOpen; 

    NFTReceipt receiptNFT;

    constructor( address _admin, address _adminPaymentAddress, address _receiptNFT) Ownable(msg.sender) {
        admin=_admin;
        adminPaymentAddress=_adminPaymentAddress;        
        receiptNFT=NFTReceipt(_receiptNFT);
        
        // transferOwnership(merchant);
    }

    function toggleOpen() public onlyOwner returns (bool) {
        isOpen = !isOpen;
        return isOpen;
    }

    
    function changePaymentAddress(uint storeId, address _paymentAddress) public returns (address) {
        Store storage s = stores[storeId];  
        if(s.storeOwner != _msgSender()) revert NotStoreOwner();     
        s.paymentAddress = _paymentAddress;
        return _paymentAddress;
    }

    
    function registerStore(string memory name, address paymentAddress,   string memory txRef, string memory storeMetadataUrl,uint currencyId) public  {
        

        Store memory store = Store({
            name: name,
            paymentAddress: paymentAddress,
            metadataUrl: storeMetadataUrl,
            date: block.timestamp,
            storeOpened: true,
            id: storeCount,
            currencyId: currencyId,
            storeOwner: msg.sender
        });
        stores.push(store);
        emit StoreCreated( storeCount, name, paymentAddress, txRef, currencyId,txRef);
        
        storeCount++;
        
    }

    

    function submitOrder(uint storeId, bytes32 transactionReference, address token, uint amount, 
    OrderTypes orderType, string memory orderMetadataUrl) public payable  {
        if(!isOpen) revert ContractClosed();
        if(!stores[storeId].storeOpened) revert StoreClosed();
        if(ordersExisting[transactionReference]) revert DuplicateOrder();
        
        Order memory order = Order({
            transactionReference: transactionReference,
            token: token,
            amount: amount,
            customer: msg.sender, // address(0), //will be set during completeOrder, customer is whoever paid
            metadataUrl: orderMetadataUrl,
            // id: orderCount,
            paid: false,
            date: block.timestamp,
            orderType: orderType,
            storeId: storeId
        });
        
        // emit OrderCreated(storeId, orderCount, orderMetadataUrl, token, amount);
        
        // orderCount++;
        Store memory store = stores[storeId];

        if(token==address(0)){
            if(msg.value<amount) revert NotEnoughMoney(); 
            // if(msg.value != order.amount){
            //     revert(Errors.NotEnoughMoney());
            // }
            amount=msg.value;
            payable(store.paymentAddress).transfer(amount- (adminFee* amount/10000) );
            payable(adminPaymentAddress).transfer((adminFee * amount/10000));
        }else{
            IERC20 token = IERC20(token);
            token.safeTransferFrom(order.customer, store.paymentAddress, order.amount - (adminFee * order.amount /10000));
            token.safeTransferFrom(order.customer, adminPaymentAddress, ( adminFee * order.amount/10000));
            
        }
        
        order.paid=true;
        ordersExisting[transactionReference]=true;
        orders[transactionReference] = order;
        orderByStoreOwners[storeId].push(transactionReference);

        // receiptNFT.safeMint(order.customer, string.concat(order.metadataUrl, "/nft.json"));
        receiptNFT.safeMint(order.customer, order.metadataUrl);
        
        emit PurchaseCompleted(msg.sender,storeId, transactionReference, receiptNFT.currentTokenCounter(), amount, token);
    }

    function getOrderDetails(bytes32 transactionReference) public view returns (uint, string memory, uint, address, bool, uint, OrderTypes ) {
        Order memory order = orders[transactionReference];
        return (order.storeId,  order.metadataUrl, order.amount, order.token, order.paid, order.date, order.orderType);
    }

    function getStore(uint storeId) public view returns(Store memory ) {
        return stores[storeId];
    }

    function getStoreOrderCount(uint storeId) public view returns(uint ) {
        return orderByStoreOwners[storeId].length;
    }

    function getStoreOrderIds(uint storeId, uint skip, uint take) public view returns(bytes32[] memory ) {
        
        bytes32[] memory b = new bytes32[](take);
        for(uint i = 0; i < take; i++){
            b[i]=orderByStoreOwners[storeId][skip + i];
        }
        return b;
    }
}
