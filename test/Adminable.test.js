const Adminable = artifacts.require('./Adminable.sol');
const expectedExceptionPromise = require('./expected_exception_testRPC_and_geth');

contract('Adminable', (accounts) => {
  const owner = accounts[0];
  const admin = accounts[1];
  const user = accounts[2];

  let adminable;

  beforeEach( () => {
    return Adminable.new({from:owner})
      .then( instance => {
        adminable = instance;
        return adminable.addAdmin(owner, {from:owner});
      });
  });
  
  it('be able to get the Admin count', () => {
    return adminable.getAdminCount({from:owner})
      .then( count => {
        assert.equal(count, 1, "Contract does not return the correct admin count");
      });
  });

  it('be able to return an Admin at specific index', () => {
    return adminable.getAdminAtIndex(0,{from:owner})
      .then( _address => {
        assert.equal(_address, owner, "Contract does not have the owner in adminsIndex");
      });
  });

  it('the owner should able to tell a non-admin address', () => {
    return adminable.isAdmin(user, {from: owner})
      .then( isAdmin => {
        assert.isFalse(isAdmin, "The non-admin address is marked as admin");
      });
  });

  it('the owner should be able to add other administrators', () => {
    return adminable.addAdmin(admin, {from: owner})
      .then( tx => {
        const eventAddress = tx.logs[0].args.adminAddress;
        const addedAt = tx.logs[0].args.adminIndex;
        assert.equal(eventAddress, admin, "The second admin's address was not correct");
        assert.equal(addedAt, 1, "The second admin index is not correct");
        return adminable.isAdmin(admin, {from: owner});
      })
      .then( isAdmin => {
        assert.isTrue(isAdmin, "The admin was not created");
        return adminable.getAdminCount({from:owner});
      })
      .then( count => {
        assert.equal(count, 2, "The Contract does not have enough admins");
      });
  });

  it('only the owner should be able to add other administrators', () => {
    return expectedExceptionPromise( () => {
      return adminable.addAdmin(user, {from: user});
    }, 3000000);
  });

  it('the owner should be able to remove other administrators', () => {
    return adminable.addAdmin(admin, {from: owner})
      .then( tx => {
        return adminable.isAdmin(admin, {from: owner});
      })
      .then( isAdmin => {
        assert.isTrue(isAdmin, "The admin was not created");
        return adminable.getAdminCount({from:owner});
      })
      .then( count => {
        assert.equal(count, 2, "The Contract does not have enough admins");
        return adminable.removeAdmin(admin, {from: owner});
      })
      .then( tx => {
        return adminable.getAdminCount({from:owner});
      })
      .then( count => {
        assert.equal(count, 1, "The Contract does not have the right amount of admins");
      });
  });

  it('only the owner should be able to remove other administrators', () => {
    return expectedExceptionPromise( () => {
      return adminable.removeAdmin(owner, {from: user});
    }, 3000000);
  });

  it('the owner should not be able to remove self as an administrator', () => {
    return expectedExceptionPromise( () => {
      return adminable.removeAdmin(owner, {from: owner}, 3000000);
    });
  });
});