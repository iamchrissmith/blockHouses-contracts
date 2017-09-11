const BlockHub = artifacts.require('./BlockHub.sol');
const expectedExceptionPromise = require('./expected_exception_testRPC_and_geth');

contract('BlockHub', (accounts) => {
  const owner = accounts[0];
  const admin = accounts[1];
  const user = accounts[2];

  let blockhub;

  beforeEach( () => {
    return BlockHub.new({from:admin})
      .then( (instance) => {
        blockhub = instance;
      });
  });

  it('the owner should be an administrator', () => {
    return blockhub.isAdmin(admin, {from: admin})
      .then( isAdmin => {
        assert.isTrue(isAdmin, "The owner is not an admin by default");
      });
  });

  describe('House functionality', () => {
    describe('.newHouse', () => {
      it('an admin can create a new house', () => {
        return blockhub.newHouse(owner, 2, false, {from: admin})
          .then( tx => {
            const titleHolder = tx.logs[0].args.titleHolder;
            const house = tx.logs[0].args.house;
            const housePrice = tx.logs[0].args.housePrice;
            const isForSale = tx.logs[0].args.forSale;
            assert.equal(titleHolder, owner, "House Title Holder is wrong");
            assert.equal(housePrice.toString(10), "2", "House price is wrong");
            assert.isFalse(isForSale, "House should not be for sale");
            return blockhub.houseExists(house,{from:owner});
          })
          .then( isHouse => {
            assert.isTrue(isHouse, "House is not a house");
            return blockhub.getHouseCount({from:owner});
          })
          .then( count => {
            assert.equal(count, 1, "Contract did not increase number of houses");
          });
      });

      it('a non-admin cannot create a house', () => {
        return expectedExceptionPromise( () => {
          return blockhub.newHouse(owner, 2, false, {from: user});
        }, 3000000);
      });
    });

    describe('.isHouse', () => {
      it('it should report false if house does not exist', () => {
        return blockhub.houseExists('0x0000', {from: owner})
          .then( (isHouse) => {
            assert.isFalse(isHouse, "The house should not be true");
          });
      });
    });

    describe('.getHouseCount', () => {
      it('starts with 0 houses', () => {
        return blockhub.getHouseCount({from:owner})
        .then( count => {
          assert.equal(count, 0, "Contract did not start with 0 houses");
        });
      });
    });
  });
});