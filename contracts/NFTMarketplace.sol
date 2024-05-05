//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFTMarketplace is ERC721URIStorage {

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    Counters.Counter private _itemsSold;
    address payable owner;
    uint256 listPrice = 0.001 ether;

    //The structure to store info about a listed token
    struct ListedToken {
        uint256 tokenId;
        address payable owner;
        address payable seller;
        uint256 price;
        bool currentlyListed;
    }

    //the event emitted when a token is successfully listed
    event TokenListedSuccess (
        uint256 indexed tokenId,
        address owner,
        address seller,
        uint256 price,
        bool currentlyListed
    );

    //This mapping maps tokenId to token info and is helpful when retrieving details about a tokenId
    mapping(uint256 => ListedToken) private idToListedToken;

    constructor() ERC721("NFTMarketplace", "NFTM") {
        owner = payable(msg.sender);
    }

    // Function to retrieve the current listing price
    function getListPrice() public view returns (uint256) {
        return listPrice;
    }

    // Function to get details of the latest listed token
    function getLatestIdToListedToken() public view returns (ListedToken memory) {
        uint256 currentTokenId = _tokenIds.current();
        return idToListedToken[currentTokenId];
    }

    // Function to get details of a specific listed token by tokenId
    function getListedTokenForId(uint256 tokenId) public view returns (ListedToken memory) {
        return idToListedToken[tokenId];
    }

     // Function to get the current tokenId being created
    function getCurrentToken() public view returns (uint256) {
        return _tokenIds.current();
    }

      /**
     * @notice Creates a new NFT and lists it for sale with the specified tokenURI and price.
     * @dev Mints a new NFT, assigns the tokenURI metadata, and lists it for sale in the marketplace.
     *      Transfers the ownership of the newly created NFT to the marketplace contract.
     * @param tokenURI The URI for the metadata of the new NFT.
     * @param price The listing price for the new NFT.
     * @return The ID of the newly created NFT.
     */
    function createToken(string memory tokenURI, uint256 price) public payable returns (uint) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        // Mint a new NFT with the newly generated token ID and assign the tokenURI metadata
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        // List the newly created NFT for sale in the marketplace with the specified price
        createListedToken(newTokenId, price);

        return newTokenId;
    }

    /**
     * @notice Creates a new listing for an NFT with the specified tokenId and price.
     * @dev Marks the specified NFT as listed for sale with the given price.
     *      Transfers the ownership of the NFT to the marketplace contract.
     * @param tokenId The ID of the NFT to be listed for sale.
     * @param price The listing price for the NFT.
     */
    function createListedToken(uint256 tokenId, uint256 price) private {
        // Validate that the sent value matches the expected listing price
        require(msg.value == listPrice, "Hopefully sending the correct price");
        // Validate that the listing price is greater than zero
        require(price > 0, "Make sure the price isn't negative");

        // Create a new ListedToken struct for the specified tokenId and price
        idToListedToken[tokenId] = ListedToken(
            tokenId,
            payable(address(this)),
            payable(msg.sender),
            price,
            true
        );

        // Transfer ownership of the NFT to the marketplace contract
        _transfer(msg.sender, address(this), tokenId);
        emit TokenListedSuccess(
            tokenId,
            address(this),
            msg.sender,
            price,
            true
        );
    }
    
        /**
     * @notice Retrieves all NFTs currently listed for sale in the marketplace.
     * @dev Iterates through all listed tokens to collect their details into an array.
     * @return An array of ListedToken structs representing all currently listed NFTs.
     */
    function getAllNFTs() public view returns (ListedToken[] memory) {
        // Get the total number of tokens currently in existence
        uint nftCount = _tokenIds.current();
         // Initialize an array to store all listed tokens
        ListedToken[] memory tokens = new ListedToken[](nftCount);

        uint currentIndex = 0;
        uint currentId;

         // Iterate through all tokens to collect their details
        for(uint i=0;i<nftCount;i++)
        {
            currentId = i + 1;
            ListedToken storage currentItem = idToListedToken[currentId]; // Retrieve the details of the current token from the idToListedToken mapping
            tokens[currentIndex] = currentItem; // Store the current token details in the tokens array at the currentIndex
            currentIndex += 1;
        }
        return tokens;
    }
    
        /**
     * @notice Retrieves all NFTs owned or listed by the caller.
     * @dev Iterates through all listed tokens to find those owned or listed by the caller.
     * @return An array of ListedToken structs representing the caller's owned or listed NFTs.
     */
    function getMyNFTs() public view returns (ListedToken[] memory) {
        // Get the total number of tokens currently in existence
        uint totalItemCount = _tokenIds.current();
        // Initialize counters and variables for processing
        uint itemCount = 0;
        uint currentIndex = 0;
        uint currentId;

        // Loop through all tokens to count those owned or listed by the caller
        for(uint i=0; i < totalItemCount; i++)
        {
            if(idToListedToken[i+1].owner == msg.sender || idToListedToken[i+1].seller == msg.sender){
                itemCount += 1;
            }
        }
        // Initialize an array to store the caller's owned or listed tokens
        ListedToken[] memory items = new ListedToken[](itemCount);

        // Loop through all tokens again to populate the items array with caller's tokens
        for(uint i=0; i < totalItemCount; i++) {
            if(idToListedToken[i+1].owner == msg.sender || idToListedToken[i+1].seller == msg.sender) {
                currentId = i+1;
                ListedToken storage currentItem = idToListedToken[currentId]; // Get the token details
                items[currentIndex] = currentItem; // Store the token in the items array
                currentIndex += 1;
            }
        }
        return items;
    }

    /**
     * @notice Executes the purchase of a listed NFT.
     * @dev Transfers the ownership of the specified NFT to the buyer and handles the fund transfer.
     * @param tokenId The ID of the NFT to be purchased.
     */
    function executeSale(uint256 tokenId) public payable {
        uint price = idToListedToken[tokenId].price;
        address seller = idToListedToken[tokenId].seller;
        require(msg.value == price, "Please submit the asking price in order to complete the purchase");

        //update the details of the token
        idToListedToken[tokenId].currentlyListed = false;
        idToListedToken[tokenId].seller = payable(msg.sender);
        _itemsSold.increment();

        //Actually transfer the token to the new owner
        _transfer(address(this), msg.sender, tokenId);
        approve(address(this), tokenId);

        // Transfer funds to seller and contract owner
        payable(owner).transfer(listPrice);
        payable(seller).transfer(msg.value);
    }
}