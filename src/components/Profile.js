import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import NFTTile from "./NFTTile";
import MarketplaceJSON from "../Marketplace.json";
import { ethers } from "ethers";
import axios from "axios";
import { GetIpfsUrlFromPinata } from "../utils";

function Profile() {
  const [data, setData] = useState([]);
  const [dataFetched, setDataFetched] = useState(false);
  const [address, setAddress] = useState("0x");
  const [totalPrice, setTotalPrice] = useState("0");
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchNFTData() {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const addr = await signer.getAddress();
        setAddress(addr);

        const contract = new ethers.Contract(
          MarketplaceJSON.address,
          MarketplaceJSON.abi,
          signer
        );

        const transaction = await contract.getMyNFTs();
        const items = await Promise.all(
          transaction.map(async (i) => {
            const tokenURI = await contract.tokenURI(i.tokenId);
            const resolvedTokenURI = GetIpfsUrlFromPinata(tokenURI);
            const metaResponse = await axios.get(resolvedTokenURI);
            const meta = metaResponse.data;

            const price = ethers.utils.formatUnits(i.price.toString(), "ether");
            const item = {
              price,
              tokenId: i.tokenId.toNumber(),
              seller: i.seller,
              owner: i.owner,
              image: meta.Image,
              name: meta.name,
              description: meta.description,
            };

            return item;
          })
        );

        setData(items);
        setDataFetched(true);

        const sumPrice = items.reduce((total, item) => {
          return total + parseFloat(item.price);
        }, 0);

        setTotalPrice(sumPrice.toFixed(3));
      } catch (error) {
        console.error("Error fetching NFT data:", error);
        setError("Error fetching NFT data. Please try again later.");
      }
    }

    if (!dataFetched) {
      fetchNFTData();
    }
  }, [dataFetched]);

  return (
    <div className="min-h-screen text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold">Wallet Address</h2>
          <p>{address}</p>
        </div>
        <div className="flex justify-center space-x-12 mb-8">
          <div>
            <h2 className="text-2xl font-bold">No. of NFTs</h2>
            <p>{data.length}</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold">Total Value</h2>
            <p>{totalPrice} ETH</p>
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Your NFTs</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {data.map((value, index) => (
              <NFTTile data={value} key={index} />
            ))}
          </div>
          <div className="mt-8 text-xl">
            {data.length === 0 && (
              <p>Oops, No NFT data to display (Are you logged in?)</p>
            )}
            {error && <p className="text-red-500">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
