import React, { useEffect, useState } from 'react';
import { Chessboard } from 'react-chessboard';
import Slider from 'react-slick';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CurrentlyPlayedGames = () => {
  const [games, setGames] = useState([]);
  const navigate = useNavigate();
  axios.defaults.baseURL = process.env.REACT_APP_API_CONNECTION;

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 2,
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

  function watchGame(gameId) {
    navigate(`/watch/${gameId}`);
  }

  function navigateToProfile(addr) {
    navigate(`/profile/${addr}`);
  }

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await axios.get('/games/currently-played');
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
        <h2 className="text-xl font-semibold mb-4 text-purple-400">Live Games</h2>
      {games.length < 1 ? (
        <p className="text-white">No games are being played currently.</p>
      ) : (
          <Slider {...settings}>
          {games.map((game) => (
            <div key={game.roomId} className="p-4">
              <div className="bg-gray-700 shadow rounded-lg p-4 hover:bg-gray-600 transition duration-500 ease-in-out">
                <div className="font-bold mb-2 text-white">
                  <span
                    className="cursor-pointer hover:text-purple-400"
                    onClick={() => navigateToProfile(game.white)}
                  >
                    {game.white ? `${game.white.slice(0,6)}... (${game.whiteElo})` : "none"}
                  </span>
                  {' - '}
                  <span
                    className="cursor-pointer hover:text-purple-400"
                    onClick={() => navigateToProfile(game.black)}
                  >
                    {game.black ? `${game.black.slice(0,6)}... (${game.blackElo})` : "none"}
                  </span>
                </div>
                <div onClick={() => watchGame(game.roomId)} className="cursor-pointer">
                  <Chessboard arePiecesDraggable={false} position={game.fen} />
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

export default CurrentlyPlayedGames;
