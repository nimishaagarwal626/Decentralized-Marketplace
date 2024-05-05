<img width="1434" alt="Screenshot 2024-05-05 at 6 39 04 PM" src="https://github.com/nimishaagarwal626/Decentralized-Marketplace/assets/114453254/771efe6d-64e8-444f-8fc0-e8016582176b"># DECENTRALIZED-MARKETPLACE
Welcome to the decentralized NFT marketplace built on the Ethereum blockchain using Solidity. This marketplace allows users to list and purchase non-fungible tokens (NFTs) securely and transparently. The smart contract powering this marketplace is deployed on the Sepolia testnet network, and transactions are executed using the MetaMask wallet. On executio of buy and sell transaction, transaction id can be obtained and verified in sepolia.etherscan.io

# Website Link: https://decmarketplace.netlify.app/
<img width="1434" alt="Screenshot 2024-05-05 at 6 39 18 PM" src="https://github.com/nimishaagarwal626/Decentralized-Marketplace/assets/114453254/bce6e991-814a-4e20-9f77-043359ab31e9">


## Techstack used:
- Frontend: React JS, Tailwind CSS
- Contract: Solidity
- Wallet: Metamask
- Ethers used: Sepolia Testnet
- Solidity Deployment: Hardhat
- Application Deployment: Netlify

# Setup/Commands Used:
- npm install
- Account created in Alchemy to obtain sepoia https url
- Account created in Pinata for file upload and used ipfs for storage.
- npx hardhat run --networks sepolia scripts/deploy.js
- npm start

## Solidity Development:
This Solidity smart contract is present in contracts/NFTMarketplace.sol that allows users to:
- Create and list NFTs for sale.
- Browse and purchase listed NFTs.
- Manage ownership and pricing of NFTs in the marketplace.
- Functionalities:
    -> createToken(string tokenURI, uint256 price): Creates a new NFT and lists it for sale.
    -> getAllNFTs(): Retrieves all NFTs currently listed on the marketplace.
    -> getMyNFTs(): Retrieves NFTs owned or listed by the caller.
    -> executeSale(uint256 tokenId): Executes a purchase of a listed NFT.
- Requirements: 
    -> Solidity Compiler: Use Solidity version ^0.8.0.
    -> Hardhat: For development and testing.
    -> OpenZeppelin Contracts: Utilized for ERC721 token and extensions.

To list the item in the marketplace, solidity sets up the initial listing price to be 0.001 ethers.
To deploy the contract, deployment script is located in scripts/deploy.js
- Deployment: npx hardhat run --networks sepolia scripts/deploy.js

## Frontend Development:
### Connect Wallet
The Navbar component manages user wallet connection status and Ethereum address using React state variables. It enables wallet connection through MetaMask, leveraging React Router for navigation.

### List NFT
The ListNFT section allows users to list new NFTs within the marketplace. It integrates with Pinata for IPFS integration, uploading NFT metadata and images securely to IPFS. Key features include:
- File upload using Pinata for decentralized storage.
- Interaction with Ethereum contracts using ethers.js for NFT listing.

### Buying
The NFTPage component facilitates NFT purchases within the marketplace. It interacts with the blockchain to execute transactions for purchasing listed NFTs. Features include:
- Formatting sale price in Wei using ethers.js.
- Real-time feedback and transaction ID display upon successful purchase.

### Marketplace
The Marketplace section displays all listed NFTs within the marketplace application. Features include:
- Integration with Ethereum for fetching NFT data from the smart contract.
- IPFS integration via Pinata for fetching metadata and images.

### Profile
The Profile section displays user-specific NFT data within the marketplace. It integrates with Ethereum to fetch user-owned NFTs and associated metadata. Features include:
- Display of user wallet address, total NFT value, and owned NFTs.
- Error handling for transparent user feedback.


## Code Deployment
The code is deployed into production using Netlify. The Github account is connected to Netlify and on pushing any change to the github triggers automatic deployment.

## Challenges Faced And Resolution:
- Search for IPFS integration: I was trying to use infura ipfs but did not become successful. To figure out a different IPFS was a big task but then understanding pinata and its usage resolved the issue.

- After an NFT was sold, It was again getting listed for buying - After going through the sol file again and on execution of Sale, setting currentlyListed boolean to false and then accessing it on frontend resolved this issue.

# Notes:
- After selecting the file in list an NFT page, you must wait for a few seconds until it gets uploaded to Pinata. On Clicking list NFT immediately may cause upload error. If so click list NFT again.

- Public IPFS gateway may become unavailable sometimes which may cause application to not work. But we can always update the gateway url in utils.js file and the website would start working.
