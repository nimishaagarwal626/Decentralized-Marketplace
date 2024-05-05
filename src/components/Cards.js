import React from "react";
import { Link } from "react-router-dom";
import { GetIpfsUrlFromPinata } from "../utils";

function Cards({ data }) {
  const { tokenId, name, description, image, price, currentlyListed } = data;

  const IPFSUrl = GetIpfsUrlFromPinata(image);
  const isDisabled = !currentlyListed;

  const tileClass = `border-2 mx-4 my-6 flex flex-col items-center rounded-lg w-64 md:w-72 shadow-lg bg-gray-800 text-white ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`;

  return (
    <Link to={isDisabled ? '#' : `/nftPage/${tokenId}`} onClick={isDisabled ? (e) => e.preventDefault() : null}>
      <div className={tileClass}>
        <img
          src={IPFSUrl}
          alt={name}
          className="w-full h-56 md:h-64 object-cover rounded-t-lg"
        />
        <div className="flex flex-col justify-between p-4 h-32">
          <strong className="text-lg font-semibold">{name}</strong>
          <p className="text-sm overflow-hidden">{description}</p>
          <span>{price}</span>
          {isDisabled && (
            <div className="flex items-center justify-center text-red-500 text-lg font-bold mt-4">
              Sold Out
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default Cards;
