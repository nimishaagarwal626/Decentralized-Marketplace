import React from "react";
import { Link } from "react-router-dom";
import { GetIpfsUrlFromPinata } from "../utils";

function NFTTile({ data }) {
  const { tokenId, name, description, image, price } = data;

  const IPFSUrl = GetIpfsUrlFromPinata(image);

  return (
    <Link to={`/nftPage/${tokenId}`}>
      <div className="border-2 mx-4 my-6 flex flex-col items-center rounded-lg w-64 md:w-72 shadow-lg bg-gray-800 text-white">
        <img
          src={IPFSUrl}
          alt={name}
          className="w-full h-56 md:h-64 object-cover rounded-t-lg"
        />
        <div className="flex flex-col justify-between p-4 h-32">
          <strong className="text-lg font-semibold">{name}</strong>
          <p className="text-sm overflow-hidden">{description}</p>
          <span>{price}</span>
        </div>
      </div>
    </Link>
  );
}

export default NFTTile;
