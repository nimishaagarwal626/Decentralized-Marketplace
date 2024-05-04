import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import NFTTile from "./NFTTile";
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { ethers } from "ethers";
import { GetIpfsUrlFromPinata } from "../utils";

export default function Marketplace() {
  const [data, setData] = useState([]);
  const [dataFetched, setDataFetched] = useState(false);

  useEffect(() => {
    async function getAllNFTs() {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          MarketplaceJSON.address,
          MarketplaceJSON.abi,
          signer
        );
        
        const transaction = await contract.getAllNFTs();
        const items = await Promise.all(
          transaction.map(async (i) => {
            const tokenURI = await contract.tokenURI(i.tokenId);
            const resolvedTokenURI = GetIpfsUrlFromPinata(tokenURI);
            const metaResponse = await axios.get(resolvedTokenURI);
            const meta = metaResponse.data;

            const price = ethers.utils.formatUnits(
              i.price.toString(),
              "ether"
            );
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
      } catch (error) {
        console.error("Error fetching NFTs:", error);
        // Handle error (e.g., show error message to user)
      }
    }

    if (!dataFetched) {
      getAllNFTs();
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners();
      }
    };
  }, [dataFetched]);

  return (
    <div>
      <Navbar />
      <div className="flex flex-col place-items-center mt-20">
        <div className="flex mt-5 justify-between flex-wrap max-w-screen-xl text-center">
          {data.map((value, index) => (
            <NFTTile data={value} key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
