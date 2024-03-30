import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { FaCheck, FaCopy, FaEye, FaHouseUser, FaTimes } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom';

function ReviewGames({ setActiveTab, token }) {
    const [gamesToReview, setGamesToReview] = useState([]);
    const [currentGroup, setCurrentGroup] = useState(0);
    axios.defaults.baseURL = process.env.REACT_APP_API_CONNECTION
    const navigate = useNavigate();

    useEffect(()=>{
        console.log(gamesToReview);
    }, [gamesToReview])

    const handleCheatedStatus = (gameId, cheated) => {
        console.log(`Game ID: ${gameId}, Cheated: ${cheated}. Veryfiing with token: Bearer ${token}`);
        let data = {
                gameId: gameId.toString(), // Passing group as a query 
                cheated: cheated,
            };
            axios.post('/reviewGame', data, {
            headers: {
                // Include the token in the Authorization header
                Authorization: `Bearer ${token}`
            }
        }).then((response) => {
                getGames(currentGroup);
        })
        
      };

      const copyToClipboard = (pgn) => {
        navigator.clipboard.writeText(pgn).then(() => {
          alert('PGN copied to clipboard!');
        }, () => {
          alert('Failed to copy PGN.');
        });
      };

    function getGames(group){
        setCurrentGroup(group);
        console.log("group is", group);
        axios.get('/gamesToReview', {
            headers: {
                Authorization: `Bearer ${token}`, // Assuming you're using a Bearer token
            },
            params: {
                group: group.toString(), // Passing group as a query parameter and converting to string
            },
        }) .then((response) => {
            if (response.data.valid) {
                setGamesToReview(response.data.games)
            }
        })
    }
    return (

        <>
            <div className='flex justify-between items-center w-full px-32 text-3xl text-white py-12'>
                <div><FaHouseUser className=' cursor-pointer hover:text-purple-500 duration-1000' onClick={() => { setActiveTab("teamHome") }} /></div>
                <div className='text-center'>Review Games</div>
                <div className='opacity-0'><FaHouseUser /></div>
            </div>
            <div className=' flex w-1/2 mx-auto justify-between text-white'>
            <div><button onClick={()=>{getGames("0")}} className="rounded-lg px-4 py-2 bg-purple-500">All</button></div>
            <div><button onClick={()=>{getGames("1")}} className="rounded-lg px-4 py-2 bg-purple-500">Group 1</button></div>
            <div><button onClick={()=>{getGames("2")}} className="rounded-lg px-4 py-2 bg-purple-500">Group 2</button></div>
            <div><button onClick={()=>{getGames("3")}} className="rounded-lg px-4 py-2 bg-purple-500">Group 3</button></div>
            <div><button onClick={()=>{getGames("4")}} className="rounded-lg px-4 py-2 bg-purple-500">Group 4</button></div>
            </div>
            <div className='px-32 mt-10'>
                {gamesToReview.length === 0 ? (<h1 className=' text-center text-white'>No games to review</h1>) : (
        <table className="w-full text-sm text-left text-white rounded bg-gray-750">
        <thead className="text-xs uppercase bg-purple-900 text-white">
          <tr>
            <th scope="col" className="px-6 py-3"><FaEye/></th>
            <th scope="col" className="px-6 py-3">White</th>
            <th scope="col" className="px-6 py-3">Black</th>
            <th scope="col" className="px-6 py-3">PGN</th>
            <th scope="col" className="px-6 py-3">Cheated</th>
          </tr>
        </thead>
        <tbody>
          {gamesToReview.map((game) => (
            <tr key={game.id} className=" border-b hover:bg-gray-900">
                <td className="px-6 py-4 cursor-pointer"><FaEye onClick={()=>{navigate(`/analyzeGame/${game.roomId}`);}}/></td>
              <td className="px-6 py-4">{game.white}</td>
              <td className="px-6 py-4">{game.black}</td>
              <td className="px-6 py-4">
                <FaCopy onClick={() => copyToClipboard(game.pgn)} className="cursor-pointer text-white hover:text-white"/>
              </td>
              <td className="px-6 py-4">
                <FaCheck className="inline text-xl text-green-700 cursor-pointer mr-2" onClick={() => handleCheatedStatus(game.roomId, true)}/>
                <FaTimes className="inline text-xl text-red-700 cursor-pointer ml-2" onClick={() => handleCheatedStatus(game.roomId, false)}/>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      )}
            </div>
        </>
    )
}

export default ReviewGames