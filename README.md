# BlockHouses - Contracts

This repo holds the solidity contracts for running the BlockHouses Application.  [View the application repo](https://github.com/iamchrissmith/blockHouse-app) for more information about what these contracts do.

If you would like to install and run the app yourself, you will need this repo.

## To Install Contracts

1. If you have not created a common directory to hold this repo and the application, do so.
2. Clone this repo into that directory
3. `cd blockHouses-contract`
4. `npm install`
5. Make sure you have TestRPC running on your computer.  This setup is beyond the scope of this project, but you can find details at the [Ethereum TestRPC repo](https://github.com/ethereumjs/testrpc){:target="_blank"}
6. `truffle migrate --reset`
7. Now you should have the contracts deployed on your local blockchain. Follow the application setup instructions to get the site running locally.
8. Alternatively, you can visit our [heroku app](https://blockhouses.herokuapp.com/).  You will have to allow unsecured scripts to access the local TestRPC url.


