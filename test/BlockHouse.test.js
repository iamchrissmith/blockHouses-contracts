const BlockHouse = artifacts.require('./BlockHouse.sol');
const expectedExceptionPromise = require('./expected_exception_testRPC_and_geth');

contract('BlockHouse', (accounts) => {
  const titlee = accounts[0];
  const admin = accounts[1];
  const user = accounts[2];
  const price = 10000;

  let blockhouse;

  beforeEach( () => {
    return BlockHouse.new(titlee, price, false, {from:admin})
      .then( instance => {
        blockhouse = instance;
      });
  });

  it('should be titled to titlee', () => {
    return blockhouse.titleHolder({from:titlee})
      .then( _titlee => {
        assert.strictEqual(_titlee, titlee, "BlockHouse is not titled to 'titlee'");
      });
  });

  it('titlee should be able to make the house forSale', () => {
    return blockhouse.startSelling({from:titlee})
      .then( tx => {
        return blockhouse.forSale({from:titlee});
      })
      .then( isForSale => {
        assert.isTrue(isForSale, "BlockHouse is not for sale");
      });
  });

  it('titlee should be able to make the house not forSale', () => {
    return blockhouse.startSelling({from:titlee})
      .then( tx => {
        return blockhouse.stopSelling({from:titlee});
      })
      .then( tx => {
        return blockhouse.forSale({from:titlee});
      })
      .then( isForSale => {
        assert.isFalse(isForSale, "BlockHouse is still for sale");
      });
  });

  it('non-titlee should not be able to make the house as forSale', () => {
    return expectedExceptionPromise( () => {
      return blockhouse.startSelling({from:admin});
    }, 3000000);
  });

  describe('Purchasing', () => {
    describe('.buyHouse', () => {
      it('a user should be able to purchase a BlockHouse', () => {
        return blockhouse.startSelling({from:titlee})
          .then( tx => {
            return blockhouse.buyHouse({from:user, value:price})
          })
          .then( tx => {
            const eventLog = tx.logs[0].args;
            assert.equal(eventLog.buyer, user, "User was not the purchaser");
            assert.equal(eventLog.seller, titlee, "Owner was not reported correctly");
            assert.equal(eventLog.amount.toString(10), price.toString(10), "BlockHouse price incorrect");
          });
      });

      it('the titlee should not be able to purchase their own blockhouse', () => {
        return blockhouse.startSelling({from:titlee})
          .then( tx => {
            return expectedExceptionPromise( () => {
              return blockhouse.buyHouse({from:titlee, value:price});
            }, 3000000);
          });
      });

      it('BlockHouse should be marked as not forSale and have a new titlee after being sold', () => {
        return blockhouse.startSelling({from:titlee})
          .then( tx => {
            return blockhouse.buyHouse({from:user, value:price})
          })
          .then( tx => {
            return blockhouse.forSale({from:user});
          })
          .then( isForSale => {
            assert.isFalse(isForSale, "BlockHouse still marked for sale after a sale.");
            return blockhouse.titleHolder({from:user});
          })
          .then( _titlee => {
            assert.equal(_titlee, user, "Purchaser was not made the titlee");
          });
      });

      it('a user must send the exact price - too low', () => {
        return blockhouse.startSelling({from:titlee})
          .then( tx => {
            return expectedExceptionPromise( () => {
              return blockhouse.buyHouse({from:user, value:price - 1});
            }, 3000000);
          });
      });

      it('a user must send the exact price - too high', () => {
        return blockhouse.startSelling({from:titlee})
          .then( tx => {
            return expectedExceptionPromise( () => {
              return blockhouse.buyHouse({from:user, value:price + 1});
            }, 3000000);
          });
      });
    });

    describe('.withdrawFunds', () => {
      it('after a purchase the titlee should be able to withdraw their funds', () => {
        const gasPrice = 1;
        let transactionCost;
        let titleeBalance;

        return blockhouse.startSelling({from:titlee})
          .then( tx => {
            return blockhouse.buyHouse({from:user, value:price});
          })
          .then( tx => {
            return web3.eth.getBalance(titlee);
          })
          .then( balance => {
            titleeBalance = balance;
            return blockhouse.balances(titlee, {from:titlee});
          })
          .then( heldBalance => {
            assert.equal(heldBalance.toString(10), price.toString(10), "Owner balance incorrect");
            return blockhouse.withdrawFunds({from:titlee, gasPrice: gasPrice});
          })
          .then( tx => {
            transactionCost = tx.receipt.gasUsed * gasPrice;
            return web3.eth.getBalance(titlee);
          })
          .then( newBalance => {
            assert.equal(titleeBalance.plus(price).minus(transactionCost).toString(10), newBalance.toString(10), `Owner balance did not increase by ${price}`);
          });
      });
    });
  });

  describe('.changeTitleHodler', () => {
    it('titlee should be able to transfer ownership without a sale', () => {
      return blockhouse.changeTitleHolder(user, {from:titlee})
        .then( tx => {
          return blockhouse.titleHolder({from:titlee});
        })
        .then( _titlee => {
          assert.equal(_titlee, user, "Ownership did not transfer");
        });
    });
  });


  //   describe('.removeBlockHouse', () => {
  //     it('the blockhouse titlee can delete the blockhouse', () => {
  //       let blockhouseSku;
  //       return blockhouse.addAdmin(admin, {from: owner})
  //         .then( (tx) => {
  //           return blockhouse.addBlockHouse("New BlockHouse", "New BlockHouse", 2, 1, {from: admin})
  //         })
  //         .then( (tx) => {
  //           blockhouseSku = tx.logs[0].args.sku;
  //           return blockhouse.isBlockHouse(blockhouseSku, {from: admin});
  //         })
  //         .then( (isBlockHouse) => {
  //           assert.isTrue(isBlockHouse, "The blockhouse was not created");
  //           return blockhouse.removeBlockHouse(blockhouseSku, {from: admin});
  //         })
  //         .then( (tx) => {
  //           return blockhouse.isBlockHouse(blockhouseSku, {from:admin});
  //         })
  //         .then( (isBlockHouse) => {
  //           assert.isFalse(isBlockHouse, "BlockHouse was not deleted");
  //         });
  //     });

  //     it('cannot delete blockhouse if not owner of blockhouse', () => {
  //       let blockhouseSku;
  //       return blockhouse.addAdmin(admin, {from: owner})
  //         .then( (tx) => {
  //           return blockhouse.addBlockHouse("New BlockHouse", "New BlockHouse", 2, 1, {from: admin})
  //         })
  //         .then( (tx) => {
  //           blockhouseSku = tx.logs[0].args.sku;
  //           const blockhouseOwner = tx.logs[0].args.owner;
  //           assert.equal(blockhouseOwner, admin, "BlockHouse owner is wrong");
  //           return blockhouse.isBlockHouse(blockhouseSku, {from: owner});
  //         })
  //         .then( (isBlockHouse) => {
  //           assert.isTrue(isBlockHouse, "The blockhouse was not created");
  //           return expectedExceptionPromise( () => {
  //             return blockhouse.removeBlockHouse(blockhouseSku, {from: owner});
  //           }, 3000000);
  //         });
  //     });
  //   })

});