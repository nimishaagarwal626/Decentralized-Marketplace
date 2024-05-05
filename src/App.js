import './App.css';
import Marketplace from './components/Marketplace';
import Profile from './components/Profile';
import ListNFT from './components/ListNFT';
import NFTPage from './components/NFTpage';
import {
  Routes,
  Route,
} from "react-router-dom";

function App() {
  return (
    <div className="container">
        <Routes>
          <Route path="/" element={<Marketplace />}/>
          <Route path="/nftPage" element={<NFTPage />}/>        
          <Route path="/profile" element={<Profile />}/>
          <Route path="/ListNFT" element={<ListNFT />}/>             
        </Routes>
    </div>
  );
}

export default App;
