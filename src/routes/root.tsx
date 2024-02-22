import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '@solana/wallet-adapter-react-ui/styles.css'
import { useWallet } from '@solana/wallet-adapter-react'
import backgroundVideo from '../assets/heroBgVideo.mp4'

function Root() {
    const [walletProvider, setWalletProvider] = useState('')
    const { connected } = useWallet()
    const navigate = useNavigate()
    useEffect(() => {
        checkForStorage()
    }, [])
    function checkForStorage() {
        if (localStorage.getItem('walletName') !== null) {
            setWalletProvider(localStorage.getItem('walletName'))
        }
    }

    useEffect(() => {
        if (connected) {
            //navigate('/home');
        }
    }, [connected, navigate])
    function clearStorageWallet() {
        localStorage.removeItem('walletName')
        window.location.reload()
    }
    return (
        <div className="m-0 flex min-h-screen items-center justify-center overflow-hidden p-0">
            <video
                src={backgroundVideo}
                autoPlay
                loop
                muted
                className="absolute h-full w-full object-cover opacity-75"
            ></video>
            {/* Adding a semi-transparent overlay for better text contrast */}
            <div className="absolute h-full w-full bg-black bg-opacity-90"></div>
            <div className="z-10 max-w-2xl space-y-6 px-4 py-6 text-center text-white">
                {/* Main heading with increased prominence */}
                <h1 className="text-4xl md:text-6xl lg:text-8xl font-extrabold text-purple-600">
    Play Chess. Earn Solana.
</h1>

                {/* Subheadings with adjusted font size and color for hierarchy */}
                <h2 className="text-lg md:text-xl lg:text-2xl text-gray-200">
                    The ultimate platform for chess lovers and crypto
                    enthusiasts.
                </h2>
                <p className=" text-base md:text-lg lg:text-xl text-gray-300">
                    Join the fastest and most secure blockchain network. Play
                    with global players and earn SOL tokens for every win.
                </p>
                {/* Improved button visibility and interactive feedback */}
                <div className="mt-4 flex items-center justify-center space-x-4">
                <button
    onClick={() => navigate('/home')}
    className="mt-4 transform rounded-lg bg-gradient-to-r from-purple-600 to-purple-800 px-4 py-2 md:px-8 md:py-4 font-bold text-white shadow transition-all duration-300 ease-in-out hover:scale-110 hover:from-purple-800 hover:to-purple-600"
>
    Play Now
</button>

                    {/* Secondary button with improved visibility */}
                </div>
                {/* Call to action button with gradient and animation to draw attention */}
                
            </div>
        </div>
    )
}

export default Root
