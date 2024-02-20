import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
} from "react-router-dom";
import { createRoot } from 'react-dom/client';
import { ConnectionProvider, useWallet, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletMultiButton, WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, TorusWalletAdapter, SolongWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { useMemo } from 'react';
import { clusterApiUrl } from '@solana/web3.js';
import './index.css';
import '@solana/wallet-adapter-react-ui/styles.css';
import Root from './routes/root'
import Home from './routes/home'
import About from './routes/about'
import ErrorPage from "./error-page";
import Navbar from './components/Navbar';
import Play from './routes/play';
import Profile from './routes/profile';
import Rewards from './routes/rewards';
import GamePage from './routes/gamePage';
import AnalyzeGame from "./routes/analyzeGame";
import UserProfile from "./routes/userProfile";
import FakeNavbar from "./components/FakeNavbar";
import Explore from "./routes/explore";
import WatchGame from "./routes/watchGame";
import { AuthProvider } from "./middleware/authContext";

const App = () => {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new TorusWalletAdapter(),
    new SolongWalletAdapter(),
  ], [network]);

  const router = createBrowserRouter([{
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/home",
    element: <> <Navbar /> <Home /></>,
    errorElement: <ErrorPage />,
  },
  {
    path: "/explore",
    element: <> <Navbar /> <Explore /></>,
    errorElement: <ErrorPage />,
  },
  {
    path: "/play",
    element: <> <Navbar /> <Play /></>,
    errorElement: <ErrorPage />,
  },
  {
    path: "/game/",
    element: <> <GamePage /></>,
    errorElement: <ErrorPage />,
  },
  {
    path: "/watch/:roomId",
    element: <> <Navbar /><WatchGame /></>,
    errorElement: <ErrorPage />,
  },
  {
    path: "/analyzeGame/:gameId",
    element: <> <Navbar /><AnalyzeGame /></>,
    errorElement: <ErrorPage />,
  },
  {
    path: "/profile",
    element: <> <Navbar /> <Profile /></>,
    errorElement: <ErrorPage />,
  },
  {
    path: "/profile/:publicKey",
    element: <> <Navbar /> <UserProfile /></>,
    errorElement: <ErrorPage />,
  },
  {
    path: "/rewards",
    element: <> <Navbar /> <Rewards /></>,
    errorElement: <ErrorPage />,
  }]);

  return (

    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
export default App;


createRoot(document.getElementById("root")).render(<App />);
