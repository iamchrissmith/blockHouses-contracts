pragma solidity ^0.4.16;

import "./Adminable.sol";
import "./BlockHouse.sol";

contract BlockHub is Adminable, Stoppable {
  
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
    bool forSale,
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
  
  function newHouse(address _titleHolder, string _name, uint _price, uint _stock)
    public
    returns(address HouseContract)
  {
    House trustedHouse = new House(_titleHolder, _name, _price, _stock);
    houses.push(trustedHouse);
    houseExists[trustedHouse] = true;
    LogNewHouse(msg.sender, _titleHolder, trustedHouse, _name, _price, _stock);
    return trustedHouse;
  }

}
