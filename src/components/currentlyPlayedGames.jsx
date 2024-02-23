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
    slidesToShow: games.length > 1 ? 2 : 1,
    slidesToScroll: games.length > 1 ? 2 : 1,
    autoplay: true,
    autoplaySpeed: 4000,
    centerMode: games.length <= 1, // Enable center mode for single slide
    centerPadding: '50px', // Adjust this value as needed
    responsive: [
      {
        breakpoint: 1024, // Tailwind's lg breakpoint
        settings: {
          slidesToShow: games.length > 1 ? 2 : 1,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768, // Tailwind's sm breakpoint
        settings: {
          slidesToShow: 1, // Show only one slide on sm screens and below
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
      
        <div className='md:p-4 w-full md:w-auto'>
        <h2 className="text-xl font-semibold mb-4 text-purple-400">Live Games</h2>
      {games.length < 1 ? (
        <p className="text-white">No games are being played currently.</p>
      ) : games.length === 1 ? (
        <div className="max-w-md mx-auto p-4">
          <div className="bg-gray-700 shadow rounded-lg p-4 hover:bg-gray-600 transition duration-500 ease-in-out">
          <div className="font-bold mb-2 text-white text-center">
                <span
                  className="cursor-pointer hover:text-purple-400"
                  onClick={() => navigateToProfile(games[0].white)}
                >
                  {games[0].white ? `${games[0].white.slice(0,6)}... (${games[0].whiteElo})` : "none"}
                </span>
                {' - '}
                <span
                  className="cursor-pointer hover:text-purple-400"
                  onClick={() => navigateToProfile(games.black)}
                >
                  {games[0].black ? `${games[0].black.slice(0,6)}... (${games[0].blackElo})` : "none"}
                </span>
              </div>
              <div onClick={() => watchGame(games[0].roomId)} className="cursor-pointer">
                <Chessboard arePiecesDraggable={false} position={games[0].fen} />
              </div>
          </div>
        </div>
      ) : (
        <div className=' max-w-xs md:max-w-full mx-auto'>
        <Slider {...settings}>
        {games.map((game) => (
          <div key={game.roomId} className={`p-4`}>
            <div className="bg-gray-700 shadow rounded-lg p-4 hover:bg-gray-600 transition duration-500 ease-in-out">
              <div className="font-bold mb-2 text-white text-center">
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
      </div>
      
        )}
        </div>
        
      
    </>
  );
};

export default CurrentlyPlayedGames;
