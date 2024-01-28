import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Chessboard } from 'react-chessboard';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import PageButton from './pageButton';

const AllGames = () => {
  const [games, setGames] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const navigate = useNavigate();
  axios.defaults.baseURL = process.env.REACT_APP_API_CONNECTION;

  useEffect(() => {
    const fetchGames = async () => {
      const limit = 10;
      const response = await axios.get(`/games?page=${currentPage}&limit=${limit}&isFinished=${isFinished}`);
      setGames(response.data.games.map(game => ({
        ...game,
        createdAt: moment(game.createdAt).format('D.M.YYYY H:mm')
      })));
      setTotalPages(Math.ceil(response.data.totalCount / limit));
    };

    fetchGames();
  }, [currentPage, isFinished]);

  function navigateToProfile(addr) {
    navigate(`/profile/${addr}`);
  }

  return (
    <>
      
      {/* Filter Controls */}
      <div className="mb-4">
        <label className="inline-flex items-center text-white">
          <input type="checkbox" className="form-checkbox text-purple-600" checked={isFinished} onChange={(e) => setIsFinished(e.target.checked)} />
          <span className="ml-2">Show Finished Games Only</span>
        </label>
      </div>

      {/* Games Table */}
      <table className="w-full table-fixed text-white text-center">
        <thead>
          <tr className="bg-gray-700">
            <th className="px-4 py-2">White Player</th>
            <th className="px-4 py-2">Black Player</th>
            <th className="px-4 py-2">Winner</th>
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2">Claimed</th>
            <th className="px-4 py-2">Analyze</th>
          </tr>
        </thead>
        <tbody>
          {games.map((game, index) => (
            <tr key={game._id} className={` ${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700'} hover:bg-gray-600`}>
              <td className="px-4 py-2" >{game.white ? <span className="hover:text-purple-400 cursor-pointer" onClick={() => navigateToProfile(game.white)}>{game.white.slice(0, 8)  + "..."}</span>: "not found"}</td>
              <td className="px-4 py-2" >{game.black ? <span className="hover:text-purple-400 cursor-pointer" onClick={() => navigateToProfile(game.black)}>{game.black.slice(0, 8)  + "..."}</span> : "not found"}</td>
              <td className="px-4 py-2">{game.winner || 'In Progress'}</td>
              <td className="px-4 py-2">{game.createdAt}</td>
              <td className="px-4 py-2">{game.whiteTxnId ? game.whiteTxnId.slice(0, 8) + "..." : game.blackTxnId ? game.blackTxnId.slice(0, 8) + "..." : "not claimed"}</td>
              <td className="px-4 py-2">
                <div className="max-w-xs mx-auto cursor-pointer">
                  <Chessboard arePiecesDraggable={false} position={game.fen} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

       {/* Pagination Controls */}
       <div className="flex justify-center items-center space-x-2 mt-4">
        <button className={`px-4 py-2 rounded-lg shadow-md ${currentPage <= 1 ? 'cursor-not-allowed opacity-50 bg-gray-700' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`} disabled={currentPage <= 1} onClick={() => setCurrentPage(currentPage - 1)}>Previous</button>
        {Array.from({ length: totalPages }, (_, index) => (
            <PageButton pageNumber={index + 1} setCurrentPage={setCurrentPage} isActive={currentPage === (index + 1)} />
        ))}
        <button className={`px-4 py-2 rounded-lg shadow-md ${currentPage >= totalPages ? 'cursor-not-allowed opacity-50 bg-gray-700' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`} disabled={currentPage >= totalPages} onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
      </div>
    </>
  );
};

export default AllGames;
