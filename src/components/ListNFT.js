import React, { useState } from "react";
import { ethers } from "ethers";
import Navbar from "./Navbar";
import Marketplace from "../Marketplace.json";
import { uploadFileToIPFS, uploadJSONToIPFS } from "../pinata";

export default function ListNFT() {
  const [formParams, setFormParams] = useState({
    name: "",
    description: "",
    price: "",
  });
  const [fileURL, setFileURL] = useState(null);
  const [message, setMessage] = useState("");
  const [transactionHash, setTransactionHash] = useState("");

  async function onChangeFile(e) {
    const file = e.target.files[0];
    try {
      const response = await uploadFileToIPFS(file);
      if (response.success) {
        setFileURL(response.pinataURL);
      }
    } catch (error) {
      console.error("Error during file upload", error);
    }
  }

  async function uploadMetadataToIPFS() {
    const { name, description, price } = formParams;
    if (!name || !description || !price || !fileURL) {
      setMessage("Please fill out all fields and upload an image.");
      return;
    }

    const nftJSON = {
      name,
      description,
      price,
      Image: fileURL,
      sold: false
    };

    try {
      const response = await uploadJSONToIPFS(nftJSON);
      if (response.success) {
        return response.pinataURL;
      }
    } catch (error) {
      console.error("Error uploading JSON:", error);
    }
  }

  async function listNFT(e) {
    e.preventDefault();
    setMessage("Please wait... Uploading NFT.");

    try {
      const metadataURL = await uploadMetadataToIPFS();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        Marketplace.address,
        Marketplace.abi,
        signer
      );

      const price = ethers.utils.parseUnits(formParams.price, "ether");
      const listingPrice = await contract.getListPrice();

      const transaction = await contract.createToken(metadataURL, price, {
        value: listingPrice,
      });
      await transaction.wait();
      setTransactionHash(transaction.hash);

      setMessage("NFT listed successfully!");
      setFormParams({ name: "", description: "", price: "" });
    } catch (error) {
      console.error("Error listing NFT:", error);
      setMessage("Failed to list NFT. Please try again.");
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <div className="bg-[#151c25] shadow-xl rounded-xl w-11/12 md:w-2/5 p-6">
          <h3 className="text-5xl font-bold text-[#e32970] mb-6 text-center">
            Add NFT
          </h3>
          <form>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm text-[#e32970]">
                NFT Name
              </label>
              <input
                type="text"
                id="name"
                placeholder="Enter NFT Name"
                value={formParams.name}
                onChange={(e) =>
                  setFormParams({ ...formParams, name: e.target.value })
                }
                className="mt-1 p-2 w-full rounded border border-gray-300 focus:outline-none focus:ring focus:ring-indigo-500"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm text-[#e32970]">
                Description
              </label>
              <textarea
                type="text"
                id="description"
                placeholder="Enter Description"
                value={formParams.description}
                onChange={(e) =>
                  setFormParams({ ...formParams, description: e.target.value })
                }
                className="mt-1 p-2 w-full rounded border border-gray-300 focus:outline-none focus:ring focus:ring-indigo-500"
              ></textarea>
            </div>
            <div className="mb-4">
              <label htmlFor="price" className="block text-sm text-[#e32970]">
                Price (ETH)
              </label>
              <input
                type="number"
                id="price"
                placeholder="Enter Price (ETH)"
                value={formParams.price}
                onChange={(e) =>
                  setFormParams({ ...formParams, price: e.target.value })
                }
                className="mt-1 p-2 w-full rounded border border-gray-300 focus:outline-none focus:ring focus:ring-indigo-500"
              />
            </div>
            <div className="mb-4">
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={onChangeFile}
                className="mt-1 p-2 w-full rounded border border-gray-300 focus:outline-none focus:ring focus:ring-indigo-500 text-white"
              />
            </div>
            {message && (
              <p className="text-red-500 text-sm mb-4">{message}</p>
            )}
            {transactionHash && (
              <p className="text-green-500 text-sm mb-4">
                Transaction Hash: {transactionHash}
              </p>
            )}
            <button
              type="submit"
              onClick={listNFT}
              className="w-full bg-[#e32970] hover:bg-[#bd255f] text-white font-bold py-2 px-4 rounded-full focus:outline-  none focus:ring focus:ring-indigo-500"
            >
              List NFT
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
