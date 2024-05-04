export const GetIpfsUrlFromPinata = (pinataUrl) => {
    console.log("pinataUrl", pinataUrl);

    // Check if pinataUrl is a valid string
    if (typeof pinataUrl !== 'string' || !pinataUrl.trim()) {
        // Handle invalid input (e.g., return null or throw an error)
        console.error('Invalid pinataUrl:', pinataUrl);
        return null;
    }

    // Split the pinataUrl by "/"
    const IPFSUrlParts = pinataUrl.split("/");

    // Extract the last part (IPFS hash)
    const IPFSHash = IPFSUrlParts[IPFSUrlParts.length - 1];

    // Construct the IPFS URL using cf-ipfs.com gateway
    const IPFSUrl = `https://dweb.link/ipfs/${IPFSHash}`;

    return IPFSUrl;
};
