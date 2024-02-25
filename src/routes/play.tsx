import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useEffect, useRef, useState } from 'react'
import { Chessboard } from 'react-chessboard'
import { useNavigate } from 'react-router-dom'
import { FaChessBoard } from 'react-icons/fa' // Import chess icons

function Play() {
    const navigate = useNavigate()
    // Replace this with your wallet address
    const { publicKey } = useWallet()
    const buttonColor = 'bg-purple-600 hover:bg-purple-700'
    const buttonRingColor = 'focus:ring focus:ring-purple-300'
    const [orientation, setOrientation] = useState('white')
    const [showDropdown, setShowDropdown] = useState(false)
    const dropdownRef = useRef(null)
    // Replace this with your wallet name

    const walletName = publicKey
        ? publicKey.toBase58().slice(0, 8) + '...'
        : 'please connect wallet'

    // Replace this with your available balance
    const [balance, setBalance] = useState(0)
    const { connection } = useConnection()

    const fetchBalance = async () => {
        if (publicKey && connection) {
            const balanceInLamports = await connection.getBalance(
                publicKey,
                'confirmed'
            )
            if (balanceInLamports) {
                // Convert the balance from lamports to SOL and round it to 3 decimal places
                const balanceInSol =
                    Math.round((balanceInLamports / 1e9) * 1000) / 1000
                setBalance(balanceInSol)
            }
        }
    }

    const handleChessboardClick = () => {
        if (orientation === 'white') {
            setOrientation('black')
        } else {
            setOrientation('white')
        }
    }

    useEffect(() => {
        fetchBalance()
    }, [publicKey, connection])

    // rest of your code...

    // The bet options in SOL
    const betOptions = [0.01, 0.05, 0.07, 0.1]

    // The selected bet amount
    const [bet, setBet] = useState(betOptions[0])

    // Handle the change event of the bet selector
    const handleChange = (event) => {
        setBet(event.target.value)
    }

    // Handle the click event of the play button
    const handlePlay = () => {
        // Add your logic here

        console.log(`Play with ${bet} SOL`)
        navigate('/game', { state: { bet: bet } })
    }
    useEffect(() => {
        function handleClickOutside(event) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setShowDropdown(false)
            }
        }

        // Add event listener when the component mounts
        document.addEventListener('mousedown', handleClickOutside)

        // Remove event listener on cleanup
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [dropdownRef]) // Ensure the effect runs only once

    return (
        <div className="h-full w-full bg-gray-900 text-white">
            <div className="mx-auto min-h-screen max-w-7xl px-4 sm:px-6 lg:px-8">
                <nav className="flex items-center justify-between md:py-8 py-6">
                    <div className="mx-auto flex text-4xl font-bold md:text-6xl">
                        <img
                            className=" mr-2 h-auto w-9 md:h-16 md:w-12"
                            src="/logo192.png"
                            alt="Logo"
                        />
                        <span className="my-auto h-full">CryptoChess</span>
                    </div>
                </nav>
                <div className="grid grid-cols-1 items-start gap-6 md:gap-10 py-8 md:grid-cols-2">
                    <div
                        className="order-2 md:order-1 transform rounded-xl bg-gray-800 p-4 shadow-xl transition duration-500 hover:scale-105"
                        onClick={handleChessboardClick}
                    >
                        <Chessboard
                            arePiecesDraggable={false}
                            position="start"
                            boardOrientation={orientation}
                        />
                    </div>
                    <div className=" order-1 md:order-2 my-auto flex h-fit flex-col items-center justify-center space-y-6">
                        <div className="z-20 rounded-xl bg-gradient-to-br from-purple-700 to-purple-800 p-6 shadow-xl transition duration-1000 hover:scale-105">
                            <p className="text-2xl font-semibold">
                                Balance: {balance} SOL
                            </p>
                            <p className=" my-2">Choose bet:</p>
                            <div className="relative" ref={dropdownRef}>
                                <div className="pointer-events-none absolute right-0 top-1/2 flex -translate-y-1/2 items-center px-2 text-gray-400">
                                    <svg
                                        className="h-4 w-4 -rotate-90 transform fill-current"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M5.516 7.548c.436-.446 1.045-.48 1.576 0 .53.48.53 1.214 0 1.694l-3.043 3.124 3.043 3.123c.53.48.53 1.214 0 1.694-.531.48-1.14.446-1.576 0l-4-4.123a1.227 1.227 0 010-1.694l4-4.123zm8.468 0c.436-.446 1.045-.48 1.576 0 .53.48.53 1.214 0 1.694l-3.043 3.124 3.043 3.123c.53.48.53 1.214 0 1.694-.531.48-1.14.446-1.576 0l-4-4.123a1.227 1.227 0 010-1.694l4-4.123z" />
                                    </svg>
                                </div>
                                <div
                                    className="w-full cursor-pointer rounded-md border border-gray-500 bg-gray-700 py-3 pl-4 pr-10 text-lg font-medium text-white shadow-inner focus:outline-none"
                                    onClick={() =>
                                        setShowDropdown(!showDropdown)
                                    }
                                >
                                    {bet} SOL
                                    {/* SVG Icon for dropdown */}
                                </div>
                                {showDropdown && (
                                    <div className="absolute z-20 mt-1 w-full rounded-md bg-gray-700 opacity-95 shadow-lg">
                                        {betOptions.map((option, index) => (
                                            <div
                                                key={index}
                                                className={`option-animation cursor-pointer px-4 py-2 duration-500 hover:bg-gray-600 hover:font-semibold ${
                                                    index === 0
                                                        ? 'rounded-t-md'
                                                        : ''
                                                } ${
                                                    index ===
                                                    betOptions.length - 1
                                                        ? 'rounded-b-md'
                                                        : ''
                                                }`}
                                                style={{
                                                    animationDelay: `${
                                                        index * 100
                                                    }ms`,
                                                }}
                                                onClick={() => {
                                                    setBet(option)
                                                    setShowDropdown(false)
                                                }}
                                            >
                                                {option} SOL
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <button
                            className="group relative overflow-hidden rounded-lg px-10 py-3 text-xl font-bold shadow-lg transition-all duration-300 hover:scale-105 hover:px-28"
                            onClick={handlePlay}
                        >
                            <div className="absolute inset-0 bg-gradient-to-tr from-purple-700 to-purple-800 transition-opacity duration-1000 group-hover:opacity-0"></div>
                            <div className="absolute inset-0 bg-gradient-to-tr from-purple-800 to-purple-700 opacity-0 transition-opacity duration-1000 group-hover:opacity-100"></div>
                            <span className="relative z-10">Play</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Play
