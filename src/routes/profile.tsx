import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EditProfileModal from '../components/editProfileModal'
import ProfilePhoto from '../components/profilePhoto'
import socket from './socket'
import ResultsTable from '../components/resultsTable'

function Profile() {
    const navigate = useNavigate()
    const { publicKey } = useWallet()
    // Replace this with your wallet name
    axios.defaults.baseURL = process.env.REACT_APP_API_CONNECTION

    const walletName = publicKey
        ? publicKey.toBase58().slice(0, 30) + '...'
        : 'please connect wallet'

    const [streak, setStreak] = useState('')
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [limit, setLimit] = useState(5)
    const [games, setGames] = useState([])

    const [user, setUser] = useState({
        firstName: '',
        lastName: '',
        walletAccount: publicKey?.toBase58(),
        won: 0,
        drawn: 0,
        lost: 0,
        paid: 0,
        winnings: 0,
        elo: 300,
        picture: 'avatar',
        readyToRedeem: 0,
        gamesUnderReview: 0,
    })

    const fetchUserData = async () => {
        try {
            const response = await axios.get(`/user/${publicKey}`)
            const userData = response.data
            setUser((prevUser) => ({
                ...prevUser,
                ...userData,
            }))
        } catch (error) {
            console.error('Error fetching user:', error)
        }
        try {
            const response = await axios.get(`/userGamesData/${publicKey}`)
            const userData = response.data
            setUser((prevUser) => ({
                ...prevUser,
                ...userData,
            }))
        } catch (error) {
            console.error('Error fetching user:', error)
        }
    }

    useEffect(() => {
        if (!publicKey) return
        fetchData()
        fetchUserData()
    }, [publicKey])

    function loadMore() {
        setLimit(limit + 5)
    }

    useEffect(() => {
        console.log(`getting games from ${publicKey}`)

        axios
            .get(`/games/${publicKey}`, {
                params: {
                    results: limit,
                },
            })

            .then((response) => {
                let sortedGames = [...response.data].sort(
                    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                )
                setGames(response.data)
            })
            .catch((error) => {
                console.error('Error:', error)
            })
    }, [limit, publicKey])
    useEffect(() => {
        if (publicKey) {
            socket.emit('updateUserToken', publicKey, (r) => {
                console.log(r)
                localStorage.setItem('token', r)
                console.log('token is')

                console.log(localStorage.getItem('token'))
            })
        }
    }, [])
    useEffect(() => {
        let str = ''
        games.map((game, index) => {
            let result
            if (game.winner === 'draw') {
                result = 'Draw'
                str += 'D'
            } else if (
                (game.winner === 'white' &&
                    game.white === publicKey?.toBase58()) ||
                (game.winner === 'black' &&
                    game.black === publicKey?.toBase58())
            ) {
                result = 'Win'
                str += 'W'
            } else {
                result = 'Defeat'
                str += 'L'
            }
            if (str.length > 5) {
                str = str.slice(0, 5)
            }
        })
        setStreak(str)
    }, [games])

    const handlePlay = () => {
        // Add your logic here
        console.log('Play the game')
        navigate('/play')
    }
    const fetchData = () => {
        console.log(`getting games from ${publicKey}`)

        axios
            .get(`/games/${publicKey}`, {
                params: {
                    results: limit,
                },
            })
            .then((response) => {
                setGames([])
                let sortedGames = [...response.data].sort(
                    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                )
                setGames(response.data)

                sortedGames.map((game, index) => {
                    let result
                    if (game.winner === 'draw') {
                        result = 'Draw'
                        str += 'D'
                    } else if (
                        (game.winner === 'white' &&
                            game.white === publicKey?.toBase58()) ||
                        (game.winner === 'black' &&
                            game.black === publicKey?.toBase58())
                    ) {
                        result = 'Win'
                        str += 'W'
                    } else {
                        result = 'Defeat'
                        str += 'L'
                    }
                    if (str.length > 5) {
                        str = str.slice(0, 5)
                    }
                })
                setStreak(str)
            })
            .catch((error) => {
                console.error('Error:', error)
            })
        let str = ''
    }

    // Handle the click event of the claim reward button
    const handleClaim = (roomId) => {
        // Add your logic here
        console.log(`Claim ${roomId}`)
        //for refreshing purposes
        axios
            .post(`/claim/${roomId}`)
            .then((response) => {
                console.log('response: ', response.data)
                fetchData()
                fetchUserData()
            })
            .catch((error) => {
                console.error('Error:', error)
            })
    }
    return (
        <div className="h-full w-full bg-gray-900">
            <div className="relative mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {isEditOpen && (
                    <EditProfileModal
                        setIsEditOpen={setIsEditOpen}
                        user={user}
                        setUser={setUser}
                        axios={axios}
                        publicKey={publicKey}
                    />
                )}
                <div className="grid gap-8 md:grid-cols-3 text-white">
                <div className="col-span-1 bg-gray-800 p-4 rounded-lg shadow-lg">
  <div className="flex gap-4 items-center">
    <div className="w-24 h-24 overflow-hidden rounded-full border-4 border-purple-500 shadow">
      <ProfilePhoto src={user.picture} className="object-cover w-full h-full" alt="Profile" />
    </div>
    <div className="text-white">
      <div className="text-xl font-semibold">
        {user.firstName || 'No Name'} {user.lastName || 'No Last Name'}
      </div>
      <div className="text-sm opacity-75">Address: {user.walletAccount?.slice(0, 8)}...</div>
      <div className="text-sm opacity-75">ELO: {user.elo}</div>
      <div className="text-sm opacity-75 flex items-center gap-2 mt-1">
        <i className="fas fa-chart-line text-purple-400"></i>
        Profit: {(user.winnings - user.paid).toFixed(3)} SOL
      </div>
    </div>
  </div>

  <div className="mt-8 space-y-4">
    <div className="grid grid-cols-3 gap-2 text-white">
      <div className="flex items-center">
        <i className="fas fa-trophy text-yellow-400"></i>
        Wins: {user.won}
      </div>
      <div className="flex items-center">
        <i className="fas fa-handshake text-blue-400"></i>
        Draws: {user.drawn}
      </div>
      <div className="flex items-center">
        <i className="fas fa-skull-crossbones text-red-400"></i>
        Defeats: {user.lost}
      </div>
    </div>

    <div className="grid grid-cols-2 gap-2 text-white">
      <div className="flex items-center">
        <i className="fas fa-wallet text-green-400"></i>
        Paid: {user.paid.toFixed(3)} SOL
      </div>
      <div className="flex items-center">
        <i className="fas fa-coins text-orange-400"></i>
        Earned: {user.winnings.toFixed(3)} SOL
      </div>
    </div>

    <div className="flex justify-between text-white">
      <div className="flex items-center">
        <i className="fas fa-cash-register text-pink-400"></i>
        Not Claimed: {user.readyToRedeem} SOL
      </div>
      <div className="flex items-center">
        <i className="fas fa-search text-teal-400"></i>
        Under Review: {user.gamesUnderReview}
      </div>
    </div>
    <div className="flex justify-around mt-4">
    <button className="bg-purple-800 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out">
      Edit Profile
    </button>
    <button className="bg-purple-800 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out">
      Play
    </button>
  </div>
  </div>
</div>


                  <div className=' col-span-2 bg-gray-800 p-4 rounded-lg shadow-lg'>
                    
                  </div>
                  </div>
                    <div className="flex h-full flex-col items-center justify-center">
                        <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-purple-900">
                            <ProfilePhoto
                                src={user.picture}
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <div className="mt-4 text-2xl font-bold text-gray-900">
                            {user.firstName ? user.firstName : 'no name'}{' '}
                            {user.lastName ? user.lastName : 'no last name'}{' '}
                            {'(' + user.elo + ')'}
                        </div>
                        <div className="mt-2 text-lg text-gray-700">
                            {user.walletAccount}
                        </div>
                        <div className="mt-4 flex space-x-4">
                            <div className="rounded-lg bg-purple-200 p-2">
                                <div className="text-sm text-gray-600">
                                    Wins
                                </div>
                                <div className="text-xl text-gray-900">
                                    {user.won}
                                </div>
                            </div>
                            <div className="rounded-lg bg-purple-200 p-2">
                                <div className="text-sm text-gray-600">
                                    Draws
                                </div>
                                <div className="text-xl text-gray-900">
                                    {user.drawn}
                                </div>
                            </div>
                            <div className="rounded-lg bg-purple-200 p-2">
                                <div className="text-sm text-gray-600">
                                    Defeats
                                </div>
                                <div className="text-xl text-gray-900">
                                    {user.lost}
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 flex space-x-4">
                            <div className="rounded-lg bg-purple-200 p-2">
                                <div className="text-sm text-gray-600">
                                    Money paid
                                </div>
                                <div className="text-xl text-gray-900">
                                    {user.paid.toFixed(2)} SOL
                                </div>
                            </div>
                            <div className="rounded-lg bg-purple-200 p-2">
                                <div className="text-sm text-gray-600">
                                    Money earned
                                </div>
                                <div className="text-xl text-gray-900">
                                    {user.winnings.toFixed(4)} SOL
                                </div>
                            </div>
                            <div className="rounded-lg bg-purple-200 p-2">
                                <div className="text-sm text-gray-600">
                                    Profit
                                </div>
                                <div className="text-xl text-gray-900">
                                    {(user.winnings - user.paid).toFixed(4)} SOL
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 flex space-x-4">
                            <div className="rounded-lg bg-purple-200 p-2">
                                <div className="text-sm text-gray-600">
                                    Money ready to be redeemed
                                </div>
                                <div className="text-xl text-gray-900">
                                    {user.readyToRedeem}
                                </div>
                            </div>
                            <div className="rounded-lg bg-purple-200 p-2">
                                <div className="text-sm text-gray-600">
                                    Games under review
                                </div>
                                <div className="text-xl text-gray-900">
                                    {user.gamesUnderReview}
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 flex space-x-4">
                            <button
                                className="rounded-lg bg-purple-900 px-4 py-2 text-white hover:bg-purple-800"
                                onClick={() => setIsEditOpen(true)}
                            >
                                Edit profile
                            </button>
                            <button
                                className="rounded-lg bg-purple-900 px-4 py-2 text-white hover:bg-purple-800"
                                onClick={handlePlay}
                            >
                                Play new game
                            </button>
                        </div>
                        <ResultsTable
                            games={games}
                            handleClaim={handleClaim}
                            publicKey={publicKey}
                            loadMore={loadMore}
                        />
                    </div>
            </div>
        </div>
    )
}

export default Profile
