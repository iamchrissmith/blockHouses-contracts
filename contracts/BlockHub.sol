pragma solidity ^0.4.11;

import "./Adminable.sol";
import "./BlockHouse.sol";

contract BlockHub is Adminable {
  
  address[] public houses;
  
  mapping(address => bool) public houseExists;
  
  modifier onlyIfHouse(address house) {
    require(houseExists[house]);
    _;
  }

  event LogNewHouse(
    address sender,
    address titleHolder,
    address house, 
    uint housePrice, 
    bool forSale
  );

  function BlockHub() {
    addAdmin(msg.sender);
  }
  
  function getHouseCount()
    public
    constant
    returns(uint houseCount)
  {
    return houses.length;
  }
  
  function newHouse(address _titleHolder, uint _price, bool isForSale)
    public
    returns(address houseAddress)
  {
    require(isAdmin(msg.sender));

    BlockHouse trustedHouse = new BlockHouse(_titleHolder, _price, isForSale);
    houses.push(trustedHouse);
    houseExists[trustedHouse] = true;
    LogNewHouse(msg.sender, _titleHolder, trustedHouse, _price, isForSale);
    return trustedHouse;
  }
}
