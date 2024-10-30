//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.17;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "./NFTReceipt.sol";
import "./Libraries/Errors.sol";


contract PayProcessorOld is Ownable {
    using SafeERC20 for IERC20;
    event StoreCreated( uint indexed storeId, string name, address indexed paymentAddress, string indexed txRef, uint currencyId,string txRefRaw);//txRef added twice, bcos , When searching you use the indexed parameter, when outputting you use the other one
    event OrderCreated(uint indexed storeId, uint indexed orderId, string orderMetadataUrl, address indexed token, uint amount);
    event PurchaseCompleted(address payer,uint indexed storeId, uint indexed orderId, uint receiptTokenId);

    enum OrderTypes{
        Full,
        Quick
    }

    struct Order{
        uint id;
        string metadataUrl;
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
    }

    
    mapping(uint => uint[]) public orderByStoreOwners;
    
    
    address private admin;
    address private adminPaymentAddress;
    uint adminFee = 100;// percent *100

    Order[] orders;
    uint orderCount=0; //

    Store[] stores;
    uint storeCount=0; //

    
    string public ipfsProductLink;
    // Flag to determine whether or not purchase orders can be accepted/emitted from contract.
    bool isOpen; 

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

    function changePaymentAddress(uint storeId, address _paymentAddress) public onlyOwner returns (address) {
        Store storage s = stores[storeId];        
        s.paymentAddress = _paymentAddress;
        return _paymentAddress;
    }

    

    function startOrder(uint storeId, string memory orderMetadataUrl, address token, uint amount, OrderTypes orderType) public  {
        require(stores[storeId].storeOpened, "StoreClosed");
        Order memory order = Order({
            token: token,
            amount: amount,
            customer: address(0), //will be set during completeOrder, customer is whoever paid
            metadataUrl: orderMetadataUrl,
            id: orderCount,
            paid: false,
            date: block.timestamp,
            orderType: orderType,
            storeId: storeId
        });
        orders.push(order);
        orderByStoreOwners[storeId].push(orderCount);
        emit OrderCreated(storeId, orderCount, orderMetadataUrl, token, amount);
        
        orderCount++;
    }

    function completeOrder(uint orderId) public payable {
        require(isOpen, "StoreClosed");

        Order storage order = orders[orderId];
        Store memory store = stores[order.storeId];
        require(!order.paid, "PAID");
        order.customer=msg.sender;
        // require(order.customer==msg.sender, "Not Customer");

        if(order.token==address(0)){
            require(msg.value==order.amount, "NotEnoughMoney");
            // if(msg.value != order.amount){
            //     revert(Errors.NotEnoughMoney());
            // }
            payable(store.paymentAddress).transfer(msg.value- (adminFee*msg.value/10000) );
            payable(adminPaymentAddress).transfer((adminFee*msg.value/10000));
        }else{
            IERC20 token = IERC20(order.token);
            token.safeTransferFrom(order.customer, store.paymentAddress, order.amount - (adminFee * order.amount /10000));
            token.safeTransferFrom(order.customer, adminPaymentAddress, ( adminFee * order.amount/10000));
            
        }
        
        order.paid=true;
        receiptNFT.safeMint(order.customer, string.concat(order.metadataUrl, "/nft.json"));
        
        emit PurchaseCompleted(msg.sender,store.id, orderId, receiptNFT.currentTokenCounter());
    }

    function registerStore(string memory name, address paymentAddress,   string memory txRef, string memory storeMetadataUrl,uint currencyId) public  {
        storeCount++;

        Store memory store = Store({
            name: name,
            paymentAddress: paymentAddress,
            metadataUrl: storeMetadataUrl,
            date: block.timestamp,
            storeOpened: true,
            id: storeCount,
            currencyId: currencyId
        });
        stores.push(store);
        emit StoreCreated( storeCount, name, paymentAddress, txRef, currencyId,txRef);
        
        
    }


    // function getOrder(uint orderId) public view returns(Order ) {
    //     return orders[orderId];
    // }

    function getOrderDetails(uint orderId) public view returns (uint, string memory, uint, address, bool, uint, OrderTypes ) {
        return (orders[orderId].storeId,  orders[orderId].metadataUrl, orders[orderId].amount, orders[orderId].token, orders[orderId].paid, orders[orderId].date, orders[orderId].orderType);
    }

    function getStore(uint storeId) public view returns(Store memory ) {
        return stores[storeId];
    }

    function getStoreOrderIds(uint storeId) public view returns(uint[] memory ) {
        return orderByStoreOwners[storeId];
    }
    

    

}
