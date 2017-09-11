const Stoppable = artifacts.require('./Stoppable.sol');
const expectedExceptionPromise = require('./expected_exception_testRPC_and_geth');

contract('Stoppable', (accounts) => {
  const owner = accounts[0];

  let stoppable;

  beforeEach( () => {
    return Stoppable.new({from:owner})
      .then( (instance) => {
        stoppable = instance;
      });
  });

  it('should be running by default', () => {
    return stoppable.running({from:owner})
      .then( (isRunning) => {
        assert.isTrue(isRunning, "is not running by default");
      });
  });

  it('Owner should be able to stop the contract', () => {
    return stoppable.runSwitch(false, {from:owner})
      .then( tx => {
        return stoppable.running({from:owner});
      })
      .then( isRunning => {
        assert.isFalse(isRunning, "Stoppable did not turn off");
      });
  });

  it('Non-Owner should not be able to stop the contract', () => {
    return expectedExceptionPromise( () => {
      return stoppable.runSwitch(true, {from:accounts[1]});
    });
  });
});