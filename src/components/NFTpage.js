import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { ethers } from "ethers";
import { GetIpfsUrlFromPinata } from "../utils";
import { useParams } from "react-router-dom";

export default function NFTPage() {
  const { tokenId } = useParams();
  const [data, setData] = useState({});
  const [dataFetched, setDataFetched] = useState(false);
  const [message, setMessage] = useState("");
  const [currAddress, setCurrAddress] = useState("0x");
  const [error, setError] = useState(null);
  const [transactionId, setTransactionId] = useState(null);

  useEffect(() => {
    async function getNFTData(tokenId) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const addr = await signer.getAddress();

        const contract = new ethers.Contract(
          MarketplaceJSON.address,
          MarketplaceJSON.abi,
          signer
        );

        const tokenURI = await contract.tokenURI(tokenId);
        const resolvedTokenURI = GetIpfsUrlFromPinata(tokenURI);
        const metaResponse = await axios.get(resolvedTokenURI);
        const meta = metaResponse.data;

        const listedToken = await contract.getListedTokenForId(tokenId);

        const item = {
          price: meta.price,
          tokenId,
          seller: listedToken.seller,
          owner: listedToken.owner,
          image: meta.Image,
          name: meta.name,
          description: meta.description,
        };

        setData(item);
        setDataFetched(true);
        setCurrAddress(addr);
      } catch (error) {
        console.error("Error fetching NFT data:", error);
        setError("Error fetching NFT data. Please try again later.");
      }
    }

    if (!dataFetched) {
      getNFTData(tokenId);
    }
  }, [dataFetched, tokenId]);

  async function buyNFT(tokenId) {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const contract = new ethers.Contract(
        MarketplaceJSON.address,
        MarketplaceJSON.abi,
        signer
      );

      const salePrice = ethers.utils.parseUnits(data.price, "ether");
      setMessage("Buying the NFT... Please Wait (Up to 5 mins)");

      const transaction = await contract.executeSale(tokenId, {
        value: salePrice,
      });
      await transaction.wait();
      const txHash = transaction.hash;
      setTransactionId(txHash);
      alert("You successfully bought the NFT!");
      setMessage("");
    } catch (error) {
      console.error("Error buying NFT:", error);
      setError("Error buying NFT. Please try again later.");
    }
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      <Navbar />
      <div className="flex ml-20 mt-20">
        <img src={data.image} alt="" className="w-2/5" />
        <div className="text-xl ml-20 space-y-8 text-white shadow-2xl rounded-lg border-2 p-5">
          <div>Name: {data.name}</div>
          <div>Description: {data.description}</div>
          <div>Price: <span className="">{data.price} ETH</span></div>
          <div>Owner: <span className="text-sm">{data.owner}</span></div>
          <div>Seller: <span className="text-sm">{data.seller}</span></div>
          {currAddress !== data.owner && currAddress !== data.seller ? (
            <button
              className="enableEthereumButton bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
              onClick={() => buyNFT(tokenId)}
            >
              Buy this NFT
            </button>
          ) : (
            <div className="text-emerald-700">You are the owner of this NFT</div>
          )}
          <div className="text-green text-center mt-3">{message}</div>
          {transactionId && ( // Display transaction ID if available
            <div className="text-white text-center mt-3">
              Transaction ID: {transactionId}
            </div>
          )}
          {error && <div className="text-red-500 text-center mt-3">{error}</div>}
        </div>
      </div>
    </div>
  );
}
