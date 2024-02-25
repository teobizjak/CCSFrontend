import { useNavigate } from "react-router-dom";
import { useWallet } from '@solana/wallet-adapter-react';
import React, { useEffect, useState } from "react";
import axios from "axios";
import socket from "./socket";
import ResultsTable from "../components/resultsTable";
import { getUserData } from "../functions/getUser";
import CurrentlyPlayedGames from "../components/currentlyPlayedGames";
import UserStats from "../components/userStats";
import FeaturedPlayers from "../components/featuredPlayers";
import RecentActivity from "../components/recentActivity";
import Forum from "../components/forum";
import QuestionList from "../components/questionList";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useAuth } from "../middleware/authContext";

const recentActivities = [
  {
    type: 'Game Played',
    description: 'Won against Player123',
    date: '2023-02-03'
  },
  // ... other activities
];

function Home() {
  

  interface UserData {
    createdAt?: string;
    drawn?: number;
    elo?: number;
    eloK?: number;
    firstName?: string;
    lastName?: string;
    lost?: number;
    paid?: number;
    siteTitle?: string;
    title?: string;
    picture?: string;
    reported?: number;
    updatedAt?: string;
    walletAddress?: string;
    winnings?: number;
    won?: number;
  }

  const navigate = useNavigate();
  const { publicKey } = useWallet();
  axios.defaults.baseURL = process.env.REACT_APP_API_CONNECTION;
  // Replace this with your wallet name

  const walletName = publicKey ? publicKey.toBase58().slice(0, 8) + '...' : "please connect wallet";
  const [streak, setStreak] = useState("");
  const [limit, setLimit] = useState(5);
  const [isUserStatsNull, setIsUserStatsNull] = useState(true);
  const [games, setGames] = useState([]);
  const [userData, setUserData] = useState<UserData>({});
  const [isToken, setIsToken] = useState(false);
  const { isTokenValid } = useAuth();

  function loadMore() {
    setLimit(limit + 5)
  }

  const fetchData = () => {
    console.log(`getting games from ${publicKey}`);
    if (publicKey != null) {
      setIsUserStatsNull(false);
    
    axios.get(`/games/${publicKey}`, {
      params: {
        results: limit
      }
    })
      .then(response => {
        setGames([]);
        let sortedGames = [...response.data.games].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setGames(response.data.games);
        if (response.data.games.length < 10) {

        }

        sortedGames.map((game, index) => {
          let result;
          if (game.winner === "draw") {
            result = "Draw";
            str += "D";
          } else if ((game.winner === "white" && game.white === publicKey?.toBase58()) || (game.winner === "black" && game.black === publicKey?.toBase58())) {
            result = "Win";
            str += "W";
          } else {
            result = "Defeat";
            str += "L";
          }
          if (str.length > 5) {
            str = str.slice(0, 5);
          }
        });
        setStreak(str);
      })
      .catch(error => {
        console.error('Error:', error);
      });
    }else{
      setStreak("")
    }
    let str = "";
  };


  useEffect(() => {
    async function fetchUserData() {
      const data = await getUserData(publicKey?.toBase58()); // Passing userId as a parameter
      console.log("userData", data);

      setUserData(data);
    }
    const verifyToken = async (token) => {
      try {
          const response = await axios.post('/verify-token', {
              token,
              publicKey: publicKey.toString(),
          })
          return response.data.valid
      } catch (error) {
          console.error('Token verification failed:', error)
          return false
      }
  }

  

  const checkAndHandleToken = async () => {
          console.log('public key:', publicKey.toBase58())
          const token = localStorage.getItem(`token-${publicKey.toString()}`)
          console.log('token in ls:', token)

          if (!token) {
              // No token found, generate a new one
              setIsToken(false)
          } else {
              // Token found, verify it
              
              const isValid = await verifyToken(token)
              if (!isValid) {
                  console.log('token not valid')

                  // Token is invalid, generate a new one
                  setIsToken(false)
              }else{
                setIsToken(true);
                console.log("token is valid");
                
              }
              // If the token is valid, do nothing
          }
  }
    if (publicKey) {
      checkAndHandleToken();
      fetchUserData();
      
    }else{
      setIsUserStatsNull(true);
    }
  }, [publicKey]);
  useEffect(() => {
    async function checkSiteTitle() {


      const { drawn, won, lost, siteTitle } = userData;
      if (publicKey && won && drawn && lost && siteTitle === undefined) {
        const totalGames = drawn + won + lost;
        if (totalGames <= 10) {
          // Execute something here if total of drawn, won, and lost is not more than 10
          const response = await axios.put(`/updateSiteTitle/${publicKey?.toBase58()}`);
          console.log('Success:', response.data);
          // Place your code for the action you want to execute here
        } else {
          console.log("Total games are more than 10, not executing the action.");
        }
      } else if (publicKey && siteTitle === undefined) {
        const response = await axios.put(`/updateSiteTitle/${publicKey?.toBase58()}`);
      }
    }
    checkSiteTitle();



  }, [userData]);


  useEffect(() => {
    fetchData();

  }, [limit, publicKey]);



  // Handle the click event of the play button
  const handlePlay = () => {
    // Add your logic here
    console.log("Play the game");
    navigate("/play");
  };

  // Handle the click event of the claim reward button
  const handleClaim = (roomId) => {
    // Add your logic here
    console.log(`Claim ${roomId}`);
    //for refreshing purposes
    axios.post(`/claim/${roomId}`)
      .then(response => {
        console.log("response: ", response.data);
        fetchData();

      })
      .catch(error => {
        console.error('Error:', error);
      });

  };
  function chkw() {
    console.dir(publicKey);

  }

  return (
    <div className="h-full w-full bg-gray-900">
  <div className="relative mx-auto min-h-screen max-w-7xl px-2 py-6 sm:px-4 md:px-6 md:py-8 lg:px-8">
    <header className="mb-12 text-3xl font-bold text-purple-300">
      Welcome, {publicKey ? publicKey.toBase58().slice(0, 8) + "... " : "please connect solana wallet... "}!
    </header>
    <div className="grid gap-8 text-white sm:grid-cols-1 md:grid-cols-3">
      <aside className="space-y-8 col-span-1 order-2">
        <div className=" sm:flex sm:justify-around md:block">
        <UserStats user={userData} streak={streak} isUserDataNull={isUserStatsNull} />
        <FeaturedPlayers />
        </div>
      </aside>
      <main className="md:col-span-2 sm:col-span-1 space-y-8 order-3 w-auto">
        <div className="mb-4">
          <div className="flex justify-center">
            {isTokenValid == true ? 
            <button className="bg-purple-600 hover:bg-purple-700 py-4 px-8 focus:outline-none shadow-xl focus:ring focus:ring-blue-300 text-white font-semibold rounded-lg  transition duration-150 ease-in-out" onClick={(()=>{navigate("/play")})}>
              Play
            </button>
            : publicKey ? <button className="bg-purple-600 hover:bg-purple-700 py-4 px-8 focus:outline-none shadow-xl focus:ring focus:ring-blue-300 text-white font-semibold rounded-lg  transition duration-150 ease-in-out">
            Authorize token
          </button>: <WalletMultiButton/>}
          </div>
        </div>
        <CurrentlyPlayedGames />
        <QuestionList />
        <Forum />
      </main>
    </div>
  </div>
</div>

  );
}

export default Home;

