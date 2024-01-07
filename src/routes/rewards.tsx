import { useWallet } from "@solana/wallet-adapter-react";


function Rewards() {
  const { publicKey } = useWallet();
  // Replace this with your wallet name

  const walletName = publicKey ? publicKey.toBase58().slice(0, 8) + '...' : "please connect wallet";

  return (
    <div className="h-full w-full bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-screen bg-purple-100">
        <h1 className="text-4xl font-bold text-center py-8 pt-20">
          Welcome, {walletName}. We are currently working on this site. Don't worry, your progress still counts towards the achievements
        </h1>
        
      </div>
    </div>
  );
}

export default Rewards;

