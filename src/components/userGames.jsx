import React from 'react'
import PageButton from './pageButton'
import { Chessboard } from 'react-chessboard'
import ClaimedLink from './claimedLink'
import Heading from './heading'
import ViewOnlyChessboard from './viewOnlyChessboard'

function UserGames({ games, currentPage, setCurrentPage, totalPages, publicKey, navigateToProfile, handleClaim, analyze, isOwner }) {

    return (
        <div>
            <Heading>{isOwner === false ? "User" : "Your"} Games</Heading>
            <div className=" rounded-lg bg-gray-800 py-4 px-0 md:px-4 shadow-lg">

                <table className="w-full table-fixed rounded-lg text-center text-white shadow-lg">
                    <thead>
                        <tr className="bg-gray-700 text-center">
                            <th className="px-4 py-2">Opponent</th>
                            <th className="px-4 py-2 hidden md:table-cell">
                                {isOwner === false ? "User" : "Your"} color
                            </th>
                            <th className="px-4 py-2">Result</th>
                            <th className="px-4 py-2">
                                Claim <span className='hidden md:inline'>reward</span>
                            </th>
                            <th className="px-4 py-2">Analyze</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Map through your games array to create table rows */}
                        {games.map((game, index) => {
                            // Determine the result based on the game data
                            let result
                            if (game.winner === 'draw') {
                                result = 'Draw'
                            } else if (
                                game.winner === 'white' &&
                                game.white === publicKey
                            ) {
                                result = 'Win'
                            } else if (
                                game.winner === 'black' &&
                                game.black === publicKey
                            ) {
                                result = 'Win'
                            } else {
                                result = 'Defeat'
                            }

                            // Determine the opponent based on the game data
                            let opponentElo =
                                game.white === publicKey
                                    ? game.blackElo
                                    : game.whiteElo
                            let opponent =
                                game.white === publicKey
                                    ? game.black
                                    : game.white
                            let opponentSliced = opponent
                                ? opponent.slice(0, 5)
                                : 'none'
                            let color =
                                game.white === publicKey
                                    ? 'White'
                                    : 'Black'
                            let colorTxId =
                                game.white === publicKey
                                    ? 'whiteTxnId'
                                    : 'blackTxnId'

                            // Return the JSX for the table row
                            return (
                                <tr
                                    key={index}
                                    className={`${index % 2 === 0
                                        ? 'bg-gray-800'
                                        : 'bg-gray-700'
                                        } hover:bg-gray-600`}
                                >
                                    <td className="p-4">
                                        <span
                                            className=" cursor-pointer hover:text-purple-400"
                                            onClick={() =>
                                                navigateToProfile(
                                                    opponent
                                                )
                                            }
                                        >
                                            {opponentSliced}...({opponentElo})
                                        </span>
                                    </td>
                                    <td className="p-4 hidden md:table-cell">{color}</td>
                                    <td className="p-4">
                                        {result}
                                    </td>
                                    <td className="p-4">
                                        {result !== 'Defeat' ? isOwner == false ? "awaiting claim" : (
                                            game[colorTxId] ? (
                                                <ClaimedLink
                                                    link={
                                                        game[
                                                        colorTxId
                                                        ]
                                                    }
                                                />
                                            ) : (
                                                <button
                                                    className="rounded-lg bg-purple-800 px-4 py-2 text-white hover:bg-purple-700"
                                                    onClick={() =>
                                                        handleClaim(
                                                            game.roomId
                                                        )
                                                    }
                                                >
                                                    {result ===
                                                        'Win'
                                                        ?
                                                        game.betAmount *
                                                        1.95 +
                                                        ' SOL'
                                                        : result ===
                                                            'Draw'
                                                            ?
                                                            game.betAmount *
                                                            0.95 +
                                                            ' SOL'
                                                            : ''}
                                                </button>
                                            )
                                        ) : (
                                            <span className=" cursor-default">
                                                {isOwner === false ? "User" : "You"} lost
                                            </span>
                                        )}
                                    </td>
                                    <td
                                        className="p-4"
                                        onClick={() =>
                                            analyze(game.roomId)
                                        }
                                    >
                                        <ViewOnlyChessboard
                                            fen={game.fen}
                                            orientation={
                                                color === 'White'
                                                    ? 'white'
                                                    : 'black'
                                            }
                                        />
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
                {/* Pagination Controls */}
                <div className="mt-4 flex items-center justify-center space-x-1 md:space-x-2">
                    <button
                        className={`rounded-lg px-4 py-2 shadow-md ${currentPage <= 1
                            ? 'cursor-not-allowed bg-gray-700 opacity-50'
                            : 'bg-indigo-600 text-white hover:bg-indigo-500'
                            }`}
                        disabled={currentPage <= 1}
                        onClick={() =>
                            setCurrentPage(currentPage - 1)
                        }
                    >
                        Previous
                    </button>

                    {/* Always display the first page button */}
                    <PageButton
                        pageNumber={1}
                        setCurrentPage={setCurrentPage}
                        isActive={currentPage === 1}
                    />
                    {/* Display "..." if there are pages before the current range */}
                    {currentPage > 3 && (
                        <div className="px-2 md:px-4 py-2 text-white">
                            ...
                        </div>
                    )}

                    {/* Calculate the range of pages to display */}
                    {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, index) => {
                            let page = currentPage - 2 + index // Start from two pages before the current page
                            const maxStartRange = totalPages - 4 // Maximum start range to ensure 5 buttons

                            if (currentPage < 3) {
                                // If currentPage is 1 or 2, start from the first page
                                page = 1 + index
                            } else if (
                                currentPage > maxStartRange
                            ) {
                                // If currentPage is near the end, adjust the start range
                                page = totalPages - 4 + index
                            }

                            // Only display if the page number is valid and not the first or last page
                            if (page > 1 && page < totalPages) {
                                return (
                                    <PageButton
                                        pageNumber={page}
                                        setCurrentPage={
                                            setCurrentPage
                                        }
                                        isActive={
                                            currentPage === page
                                        }
                                    />
                                )
                            }
                        }
                    )}

                    {/* Display "..." if there are pages after the current range */}
                    {currentPage < totalPages - 2 && (
                        <div className="px-2 md:px-4 py-2 text-white">
                            ...
                        </div>
                    )}
                    {/* Always display the last page button */}
                    {totalPages > 1 && (
                        <PageButton
                            pageNumber={totalPages}
                            setCurrentPage={setCurrentPage}
                            isActive={currentPage === totalPages}
                        />
                    )}

                    <button
                        className={`rounded-lg px-4 py-2 shadow-md ${currentPage >= totalPages
                            ? 'cursor-not-allowed bg-gray-700 opacity-50'
                            : 'bg-indigo-600 text-white hover:bg-indigo-500'
                            }`}
                        disabled={currentPage >= totalPages}
                        onClick={() =>
                            setCurrentPage(currentPage + 1)
                        }
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    )
}

export default UserGames