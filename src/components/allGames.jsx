import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Chessboard } from 'react-chessboard';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import PageButton from './pageButton';
import Heading from './heading';
import ClaimedLink from './claimedLink';

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
  function analyzeGame(gameId){
    navigate(`/analyzeGame/${gameId}`);
  }

  return (
    <>
    <div className='px-0 md:p-4'>
      <Heading>All Games</Heading>
        {/* Filter Controls */}
        <div className="mb-4">
          <label className="inline-flex items-center text-white">
            <input type="checkbox" className="form-checkbox text-purple-600" checked={isFinished} onChange={(e) => setIsFinished(e.target.checked)} />
            <span className="ml-2">Show Finished Games Only</span>
          </label>
        </div>

        {/* Games Table */}
        <div className='overflow-x-auto'>
        <table className="w-full table-fixed text-white text-center">
          <thead>
            <tr className="bg-gray-700">
              <th className="px-4 py-2">White</th>
              <th className="px-4 py-2">Black</th>
              <th className="px-4 py-2">Winner</th>
              <th className="hidden md:table-cell px-4 py-2">Date</th>
              <th className="hidden md:table-cell px-4 py-2">Claimed</th>
              <th className="px-4 py-2">Analyze</th>
            </tr>
          </thead>
          <tbody>
            {games.map((game, index) => (
              <tr key={game._id} className={` ${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700'} hover:bg-gray-600`}>
                <td className="px-4 py-2" >{game.white ? <span className="hover:text-purple-400 cursor-pointer" onClick={() => navigateToProfile(game.white)}>{game.white.slice(0, 5)  + "..." + "("+game.whiteElo+")"}</span>: "not found"}</td>
                <td className="px-4 py-2" >{game.black ? <span className="hover:text-purple-400 cursor-pointer" onClick={() => navigateToProfile(game.black)}>{game.black.slice(0, 5)  + "..."+ "("+game.blackElo+")"}</span> : "not found"}</td>
                <td className="px-4 py-2">{game.winner || 'In Progress'}</td>
                <td className="hidden md:table-cell px-4 py-2">{game.createdAt}</td>
                <td className="hidden md:table-cell px-4 py-2">{game.whiteTxnId ? <ClaimedLink link={game.whiteTxnId} /> : game.blackTxnId ? <ClaimedLink link={game.blackTxnId} /> : "not claimed"}</td>
                <td className="px-4 py-2">
                  <div className="max-w-xs mx-auto cursor-pointer" onClick={() => analyzeGame(game.roomId)}>
                    <Chessboard arePiecesDraggable={false} position={game.fen} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-center items-center space-x-1 md:space-x-2 mt-4">
    <button
      className={`px-2 py-1 md:px-4 md:py-2 rounded-lg shadow-md ${currentPage <= 1 ? 'cursor-not-allowed opacity-50 bg-gray-700' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}
      disabled={currentPage <= 1}
      onClick={() => setCurrentPage(currentPage - 1)}
    >
      Previous
    </button>

    {/* Always display the first page button */}
    <PageButton pageNumber={1} setCurrentPage={setCurrentPage} isActive={currentPage === 1} />
    {/* Display "..." if there are pages before the current range */}
    {currentPage > 3 && <div className="px-2 py-1 md:px-4 md:py-2 text-white">...</div>}

    {/* Calculate the range of pages to display */}
    {Array.from({ length: Math.min(4, totalPages) }, (_, index) => {
      let page = currentPage - 2 + index; // Start from two pages before the current page
      const maxStartRange = totalPages - 4; // Maximum start range to ensure 4 buttons

      if (currentPage < 3) {
        // If currentPage is 1 or 2, start from the first page
        page = 1 + index;
      } else if (currentPage > maxStartRange) {
        // If currentPage is near the end, adjust the start range
        page = totalPages - 3 + index;
      }

      // Only display if the page number is valid and not the first or last page
      if (page > 1 && page < totalPages) {
        return (
          <PageButton pageNumber={page} setCurrentPage={setCurrentPage} isActive={currentPage === page} />
        );
      }
    })}

    {/* Display "..." if there are pages after the current range */}
    {currentPage < totalPages - 2 && <div className="px-2 py-1 md:px-4 md:py-2 text-white">...</div>}
    {/* Always display the last page button */}
    {totalPages > 1 && (
      <PageButton pageNumber={totalPages} setCurrentPage={setCurrentPage} isActive={currentPage === totalPages} />
    )}

    <button
      className={`px-2 py-1 md:px-4 md:py-2 rounded-lg shadow-md ${currentPage >= totalPages ? 'cursor-not-allowed opacity-50 bg-gray-700' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}
      disabled={currentPage >= totalPages}
      onClick={() => setCurrentPage(currentPage + 1)}
    >
      Next
    </button>
  </div>
    </div>
      

    </>
  );
};

export default AllGames;
