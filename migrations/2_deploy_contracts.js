var BlockHub = artifacts.require('./BlockHub.sol');

module.exports = function(deployer) {
  deployer.deploy(BlockHub);
};