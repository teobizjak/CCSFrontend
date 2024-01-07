import React, { useMemo } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';
import {
    createBrowserRouter,
    createRoutesFromElements,
    RouterProvider,
    Route,
  } from "react-router-dom";
import { clusterApiUrl } from '@solana/web3.js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {PhantomWalletAdapter, SolflareWalletAdapter, TorusWalletAdapter} from '@solana/wallet-adapter-wallets';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';

import Root from './routes/root'
import Home from './routes/home'
import About from './routes/about'
import ErrorPage from "./error-page";
import Navbar from './components/Navbar';
import Play from './routes/play';
import Profile from './routes/profile';
import Rewards from './routes/rewards';
import GamePage from './routes/gamePage';

function App() {
  const solNetwork = WalletAdapterNetwork.Mainnet; // or Devnet or Testnet
  const endpoint = useMemo(() => clusterApiUrl(solNetwork), [solNetwork]);

  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
  ], [solNetwork]);

  const router = createBrowserRouter([{
    path: "/",
    element: <Root/>,
    errorElement: <ErrorPage />,
  },
{
  path: "/home",
    element: <> <Navbar/> <Home /></>,
    errorElement: <ErrorPage />,
},
{
  path: "/play",
    element: <> <Navbar/> <Play /></>,
    errorElement: <ErrorPage />,
},
{
  path: "/game/",
  element: <> <Navbar/> <GamePage /></>,
  errorElement: <ErrorPage />,
},
{
path: "/profile",
element: <> <Navbar/> <Profile /></>,
errorElement: <ErrorPage />,
},
{
path: "/rewards",
element: <> <Navbar/> <Rewards /></>,
errorElement: <ErrorPage />,
}]);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets}>
        <WalletModalProvider>
          <RouterProvider router={router} />  
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);


