import React, { useEffect, useState } from 'react';
import { Chessboard } from 'react-chessboard';
import Slider from 'react-slick';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const FinishedGames = () => {
  const [games, setGames] = useState([]);
  const navigate = useNavigate();
  axios.defaults.baseURL = process.env.REACT_APP_API_CONNECTION;

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 4,
    autoplay: true,
    autoplaySpeed: 4000,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  function analyzeGame(gameId) {
    navigate(`/analyzeGame/${gameId}`);
  }

  function navigateToProfile(addr) {
    navigate(`/profile/${addr}`);
  }

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await axios.get('/games/finished');
        const gamesData = response.data;
        setGames(gamesData);
      } catch (error) {
        console.error('Failed to fetch games', error);
      }
    };

    fetchGames();
  }, []);

  return (
    <>
    <div className='p-4'>
      <h2 className="text-xl font-semibold mb-4 text-purple-400">Recently Finished Games</h2>
            {games.length < 1 ? (
              <p className="text-white">No finished games.</p>
            ) : (
              <Slider {...settings}>
                {games.map((game) => (
                  <div key={game.roomId} className="p-4">
                    <div className="bg-gray-700 shadow rounded-lg p-4 hover:bg-gray-600 transition duration-500 ease-in-out flex flex-col items-center">
                      <div className="text-purple-500 font-semibold mb-2">
                        {game.winner === "draw" ? "draw" : `${game.winner.slice(0, 6)} wins`}
                      </div>
                      <div className="font-bold text-white w-full text-center">
                        <div
                          className="cursor-pointer hover:text-purple-400"
                          onClick={() => navigateToProfile(game.white)}
                        >
                          <div className=' inline-block w-3 h-3 bg-white mr-1'></div>
                          {game.white.slice(0, 6)}... ({game.whiteElo})
                        </div>
                        <div>
                          vs
                        </div>
                        <div
                          className="cursor-pointer hover:text-purple-400"
                          onClick={() => navigateToProfile(game.black)}
                        >
                          <div className=' inline-block w-3 h-3 bg-black mr-1'></div>
                          {game.black.slice(0, 6)}... ({game.blackElo})
                        </div>
                      </div>
                      <div onClick={() => analyzeGame(game.roomId)} className="cursor-pointer mt-2 w-full">
                        <Chessboard arePiecesDraggable={false} position={game.fen}  />
                      </div>
                    </div>
                  </div>
                ))}
              </Slider>
            )}
    </div>
      
    </>

  );
};

export default FinishedGames;
