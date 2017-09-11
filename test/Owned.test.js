const Owned = artifacts.require('./Owned.sol');

contract('Owned', (accounts) => {
  const owner = accounts[0];

  let owned;

  beforeEach( () => {
    return Owned.new({from:owner})
      .then( (instance) => {
        owned = instance;
      });
  });

  it('should be owned by "owner"', () => {
    return owned.owner({from:owner})
      .then( (_owner) => {
        assert.strictEqual(_owner, owner, "owned is not owned by 'owner'");
      });
  });
});