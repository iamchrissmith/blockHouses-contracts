pragma solidity ^0.4.11;

import './Stoppable.sol';

contract BlockHouse is Stoppable {

  address public titleHolder;
  uint    public price;
  bool    public forSale;

  mapping(address => uint) public balances;
  // do I want to add some sort of offer functionality mapping (offer from address with expiration)
  // could keep track of highest offer and have a sale expiration block number.  
  // then the holder would sell to the address that placed the highest offer
  // all other bidders would be able to pull their amount back out after the sale ended if they did not win.
  
  modifier onlyHolder {
    require(msg.sender == titleHolder); 
    _;
  }

  modifier onlyIfForSale {
    require(forSale);
    _;
  }
  
  event LogSale(address buyer, address seller, uint amount);
  event LogNewTitleHolder(address sender, address prevHolder, address newHolder);

  event LogBalanceUpdate(address balanceHolder, uint balance);
  event LogWithdrawal(address recipient, uint amount);
  
  event LogUpdatedHouse(address sender, uint housePrice, bool isForSale);
  event LogStartSelling(address sender);
  event LogStopSelling(address sender);
  
  function BlockHouse(address _titleHolder, uint _price, bool _forSale) {
    titleHolder = _titleHolder;
    price = _price;
    forSale = _forSale || false;
  }
  
  function buyHouse()
    public
    onlyIfRunning
    onlyIfForSale
    payable
    returns(bool success)
  {
    require(titleHolder != msg.sender);
    require(price == msg.value);
    
    forSale = false;
    LogSale(msg.sender, titleHolder, msg.value);
    balances[titleHolder] += msg.value;
    titleHolder = msg.sender;

    return true;
  }
  
  function updatePrice(uint newPrice)
    public
    onlyHolder
    onlyIfRunning
    returns(bool success)
  {
    price = newPrice;
    
    LogUpdatedHouse(msg.sender, price, forSale);
    
    return true;
  }

  function withdrawFunds()
    public
    onlyIfRunning
    returns(bool success)
  {
    require(balances[msg.sender] > 0);
    uint balanceToSend = balances[msg.sender];
    balances[msg.sender] = 0;
    
    msg.sender.transfer(balanceToSend);
    LogWithdrawal(msg.sender, balanceToSend);
    
    return true;
  }
  
  function changeTitleHolder(address newHolder) 
    public
    onlyHolder
    onlyIfRunning
    returns(bool success)
  {
    require(newHolder != 0);
    
    LogNewTitleHolder(msg.sender, titleHolder, newHolder);
    titleHolder = newHolder;
    return true;
  }
  
  function startSelling()
    public
    onlyHolder
    returns(bool success)
  {
    LogStartSelling(msg.sender);
    forSale = true;
    return true;
  }
  
  function stopSelling()
    public
    onlyHolder
    returns(bool success)
  {
    LogStopSelling(msg.sender);
    forSale = false;
    return true;
  }
}
