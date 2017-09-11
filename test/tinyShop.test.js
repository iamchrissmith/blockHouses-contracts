const tinyShop = artifacts.require('./tinyShop.sol');
const expectedExceptionPromise = require('./expected_exception_testRPC_and_geth');

contract('tinyShop', (accounts) => {
  const owner = accounts[0];
  const admin = accounts[1];
  const user = accounts[2];

  let contract;

  beforeEach( () => {
    return tinyShop.new({from:owner})
      .then( (instance) => {
        contract = instance;
      });
  });

  it('should be owned by "owner"', () => {
    return contract.owner({from:owner})
      .then( (_owner) => {
        assert.strictEqual(_owner, owner, "Contract is not owned by 'owner'");
      });
  });

  

  describe('Product functionality', () => {

    describe('.newProduct', () => {
      it('an admin can create a new product', () => {
        return contract.newProduct(owner, "New Product", 2, 1, {from: admin})
          .then( tx => {
            const product = tx.logs[0].args.product;
            const productName = tx.logs[0].args.productName;
            const productPrice = tx.logs[0].args.productPrice;
            const productStock = tx.logs[0].args.currentStock;
            const titleHolder = tx.logs[0].args.titleHolder;
            assert.equal(productName, "New Product", "Product name is wrong");
            assert.equal(productPrice.toString(10), "2", "Product price is wrong");
            assert.equal(productStock.toString(10), "1", "Product stock is wrong");
            assert.equal(titleHolder, owner, "Product Title Holder is wrong");
            return contract.productExists(product,{from:owner});
          })
          .then( isProduct => {
            assert.isTrue(isProduct);
            return contract.getProductCount({from:owner});
          })
          .then( count => {
            assert.equal(count, 1, "Contract did increase number of products");
          })
      });

      it('a non-admin cannot create a product', () => {
        return expectedExceptionPromise( () => {
          return contract.newProduct("New Product", "New Product", 2, 1, {from: user});
        }, 3000000);
      });
    });

    describe('.isProduct', () => {
      it('it should report false if product does not exist', () => {
        return contract.productExists('0x0000', {from: owner})
          .then( (isProduct) => {
            assert.isFalse(isProduct, "The product should not be true");
          });
      });
    });

    describe('.getProductCount', () => {
      it('starts with 0 products', () => {
        return contract.getProductCount({from:owner})
        .then( count => {
          assert.equal(count, 0, "Contract did not start with 0 products")
        });
      });
    });
  });
});