import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '@solana/wallet-adapter-react-ui/styles.css';
import { useWallet } from '@solana/wallet-adapter-react';


function Root() {
  
  const { connected } = useWallet();
  const navigate = useNavigate();

    useEffect(() => {
        if (connected) {
            navigate('/home');
        }
    }, [connected, navigate]);
  return (
    <div className=" min-h-screen w-screen bg-purple-700 flex justify-center items-center">
      <div className=" w-1/2 h-1/2 text-center text-white">
        <h1 className=" w-fit mx-auto text-6xl">Play Chess. Earn Solana.</h1>
        <h2 className="w-fit mx-auto text-2xl mt-8">The ultimate platform for chess lovers and crypto enthusiasts.</h2>
        <h2 className="w-fit mx-auto text-2xl mt-8">Join the fastest and most secure blockchain network and play chess with players from all over the world. Earn SOL tokens for every win and redeem them for amazing rewards.</h2>
        <div className='mt-10'>
        <WalletMultiButton
        >Start Playing Now</WalletMultiButton>
        </div>
        
      </div>
      
    </div>
  );
}

export default Root;
