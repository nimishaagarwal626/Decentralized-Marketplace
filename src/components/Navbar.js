import { Link } from "react-router-dom";
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { ethers } from "ethers";

function Navbar() {
  const [connected, setConnected] = useState(false);
  const location = useLocation();
  const [currAddress, setCurrAddress] = useState('0x');

  useEffect(() => {
    const checkEthereumConnection = async () => {
      if (window.ethereum === undefined) return;

      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });

        if (chainId !== '0xaa36a7') {
          // Incorrect network, prompt user to switch
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xaa36a7' }],
          });
        }

        setConnected(true);
        const signer = provider.getSigner();
        const addr = await signer.getAddress();
        setCurrAddress(addr);
      } catch (error) {
        console.error('Error connecting to Ethereum:', error.message);
        setConnected(false);
      }
    };

    checkEthereumConnection();

    const handleAccountsChanged = (accounts) => {
      window.location.reload(); // Refresh on account change
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);

    return () => {
      window.ethereum.off('accountsChanged', handleAccountsChanged);
    };
  }, []);

  const connectWebsite = async () => {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
    } catch (error) {
      console.error('Error connecting to Ethereum:', error.message);
    }
  };

  return (
    <div className="">
      <nav className="w-screen">
        <ul className='flex items-end justify-between py-3 bg-transparent text-white pr-5'>
          <li className='flex items-end ml-5 pb-2'>
            <Link to="/">
              <div className='inline-block font-bold text-4xl ml-2'>
                Marketplace
              </div><br/>
              <div className='inline-block font-bold text-sm ml-2'>
              Buy And Sell Items
              </div>
            </Link>
          </li>
          <li className='w-2/6'>
            <ul className='lg:flex justify-between font-bold mr-10 text-lg'>
              <li className={location.pathname === "/" ? 'border-b-2 hover:pb-0 p-2' : 'hover:border-b-2 hover:pb-0 p-2'}>
                <Link to="/">Marketplace</Link>
              </li>
              <li className={location.pathname === "/ListNFT" ? 'border-b-2 hover:pb-0 p-2' : 'hover:border-b-2 hover:pb-0 p-2'}>
                <Link to="/ListNFT">List My NFT</Link>
              </li>
              <li className={location.pathname === "/profile" ? 'border-b-2 hover:pb-0 p-2' : 'hover:border-b-2 hover:pb-0 p-2'}>
                <Link to="/profile">Profile</Link>
              </li>
              <li>
                <button
                  className='shadow-xl shadow-black text-white bg-[#122543] md:text-xs p-2 rounded-full'
                  onClick={connectWebsite}
                >
                  {connected ? `${currAddress.substring(0, 4)}...${currAddress.slice(-4)}` : "Connect Wallet"}
                </button>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Navbar;
