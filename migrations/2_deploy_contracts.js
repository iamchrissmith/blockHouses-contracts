// var BlockHub = artifacts.require('./BlockHub.sol');

// module.exports = function(deployer) {
//   deployer.deploy(BlockHub);
// };

const Owned = artifacts.require('./Owned.sol');

module.exports = function(deployer) {
  deployer.deploy(Owned);
};