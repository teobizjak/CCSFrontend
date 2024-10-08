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
import LearnMore from "./routes/learnMore";
import Footer from "./components/footer";
import PrivacyPolicy from "./components/privacy-policy";
import Team from "./routes/team";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  const network = WalletAdapterNetwork.Mainnet;
  //const network = 'mainnet';
  //const alchemyMainnetRpcUrl = `https://solana-mainnet.g.alchemy.com/v2/rUZ0WbYipzgAtwT7ViwNtN7VvVHzby5T`;
  const mainnetRpcUrl = `https://mainnet.helius-rpc.com/?api-key=dace1298-e730-46a5-adfa-797741a1383c`;
  //const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const endpoint = useMemo(() => mainnetRpcUrl, []);

  
  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new TorusWalletAdapter(),
    new SolongWalletAdapter(),
  ], [network]);

  const router = createBrowserRouter([{
    path: "/",
    element: <><Root /><Footer/></>,
    errorElement: <ErrorPage />,
  },
  {
    path: "/home",
    element: <> <Navbar /> <Home /><Footer/></>,
    errorElement: <ErrorPage />,
  },
  {
    path: "/explore",
    element: <> <Navbar /> <Explore /><Footer/></>,
    errorElement: <ErrorPage />,
  },
  {
    path: "/play",
    element: <> <Navbar /> <Play /><Footer/></>,
    errorElement: <ErrorPage />,
  },
  {
    path: "/game/",
    element: <> <GamePage /></>,
    errorElement: <ErrorPage />,
  },
  {
    path: "/watch/:roomId",
    element: <> <Navbar /><WatchGame /><Footer/></>,
    errorElement: <ErrorPage />,
  },
  {
    path: "/analyzeGame/:gameId",
    element: <> <Navbar /><AnalyzeGame /><Footer/></>,
    errorElement: <ErrorPage />,
  },
  {
    path: "/profile",
    element: <> <Navbar /> <Profile /><Footer/></>,
    errorElement: <ErrorPage />,
  },
  {
    path: "/profile/:publicKey",
    element: <> <Navbar /> <UserProfile /><Footer/></>,
    errorElement: <ErrorPage />,
  },
  {
    path: "/learnMore/",
    element: <> <Navbar /> <LearnMore /><Footer/></>,
    errorElement: <ErrorPage />,
  },
  {
    path: "/rewards",
    element: <> <Navbar /> <Rewards /><Footer/></>,
    errorElement: <ErrorPage />,
  },
  {
    path: "/team",
    element:<Team />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/privacy-policy/",
    element: <> <Navbar /><PrivacyPolicy /><Footer/></>,
    errorElement: <ErrorPage />,
  },]);

  return (

    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <AuthProvider>
            <RouterProvider router={router} />
            <ToastContainer/>
          </AuthProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
export default App;


createRoot(document.getElementById("root")).render(<App />);
