import { useWallet } from '@solana/wallet-adapter-react'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EditProfileModal from '../components/editProfileModal'
import socket from './socket'
import ProfileInfo from '../components/profileInfo'
import UserGames from '../components/userGames'
import Heading from '../components/heading'

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
    const [limit, setLimit] = useState(10)
    const [games, setGames] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(0)

    const analyze = (roomId) => {
        navigate(`/analyzeGame/${roomId}`)
    }

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
        if (publicKey) {
            fetchData()
            fetchUserData()
        }
    }, [publicKey, currentPage])
    const fetchData = async () => {
        if (!publicKey) return
        const pageSize = 10 // Set the number of items per page
        try {
            const response = await axios.get(`/games/${publicKey.toBase58()}`, {
                params: {
                    page: currentPage,
                    pageSize: pageSize,
                },
            })

            setGames(response.data.games)
            setTotalPages(response.data.totalPages)
        } catch (error) {
            console.error('Error:', error)
        }
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

    function navigateToProfile(profile) {
        navigate(`/profile/${profile}`)
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
                        isEditOpen={isEditOpen}
                        setIsEditOpen={setIsEditOpen}
                        user={user}
                        setUser={setUser}
                        axios={axios}
                        publicKey={publicKey}
                    />
                )}
                <div className="grid gap-8 text-white md:grid-cols-3">
                    <aside className="col-span-1 space-y-8">
                        <ProfileInfo
                            user={user}
                            isOwned={true}
                            setIsEditOpen={setIsEditOpen}
                        />
                    </aside>

                    <main className="col-span-2 space-y-8">
                        {games.length === 0 ? (
                            <>
                                {' '}
                                <Heading>Your Games</Heading>{' '}
                                <p className="text-white">
                                    You haven't played any games.
                                </p>{' '}
                            </>
                        ) : (
                            <UserGames
                                games={games}
                                currentPage={currentPage}
                                setCurrentPage={setCurrentPage}
                                totalPages={totalPages}
                                publicKey={publicKey?.toBase58()}
                                navigateToProfile={navigateToProfile}
                                handleClaim={handleClaim}
                                analyze={analyze}
                                isOwner={true}
                            />
                        )}
                    </main>
                </div>
            </div>
        </div>
    )
}

export default Profile
