import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useNavigate } from 'react-router-dom'
import '@solana/wallet-adapter-react-ui/styles.css'
import { useWallet } from '@solana/wallet-adapter-react'
import ProfilePhoto from './profilePhoto'
import { FaCheck, FaCross, FaEraser, FaExclamation, FaTimes } from 'react-icons/fa'
import AuthorizationModal from './authorizationModal'
import axios from 'axios'
import { Connection, clusterApiUrl } from '@solana/web3.js'

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false)
    const { connected, publicKey, signMessage } = useWallet()
    const navigate = useNavigate()
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isTokenValid, setIsTokenValid] = useState(false);
    axios.defaults.baseURL = process.env.REACT_APP_API_CONNECTION;

    function clearStorageWallet() {
      localStorage.removeItem('walletName')
      window.location.reload()
  }
    const generateAndSignToken = async () => {
      setIsAuthModalOpen(true);
      if (!publicKey || !signMessage) return

      try {
          // Step 1: Generate a message or token
          const array = new Uint8Array(10);
          
          const nonce = crypto.getRandomValues(array).toString();
          const message = `Please sign this message to authenticate. Nonce: ${nonce}`;
          console.log("message is ", message);
          
          const encodedMessage = new TextEncoder().encode(message)

          // Step 2: Use the wallet to sign the message
          const signature = await signMessage(encodedMessage)

          // Step 3: Send the signed message to the server
          axios
              .post('/verify-signature', {
                  signature: Array.from(signature), // Convert the signature to a normal array for JSON serialization
                  publicKey: publicKey.toString(),
                  message: message // Convert the public key to a string
              })
              .then((response) => {
                  // Check if the server responded with valid: true
                  if (response.data.valid) {
                    setIsAuthModalOpen(false);
                    setIsTokenValid(true);
                      // Save the signature in local storage associated with the wallet address
                      localStorage.setItem(
                          `token-${publicKey.toString()}`,
                          btoa(String.fromCharCode(...signature))
                      )

                      console.log(
                          'Signature is valid and saved in local storage.'
                      )
                  } else {
                      console.error(
                          'Signature is invalid according to the server.'
                      )
                  }
                  
              })
              .catch((error) => {
                  console.error('Error during verification:', error)
              })

          // Optionally handle the server response, such as saving the token to localStorage
          
      } catch (error) {
          console.error('Error during signing:', error)
      }
  }

    useEffect(() => {

        // Function to verify the token
        
        const verifyToken = async (token) => {
            try {
                const response = await axios.post('/verify-token', {
                    token,
                    publicKey: publicKey.toString(),
                })
                return response.data.valid
            } catch (error) {
                console.error('Token verification failed:', error)
                return false
            }
        }

        

        const checkAndHandleToken = async () => {
            if (publicKey) {
                console.log('public key:', publicKey.toBase58())

                const token = localStorage.getItem(`token-${publicKey.toString()}`)
                console.log('token in ls:', token)

                if (!token) {
                    // No token found, generate a new one
                    await generateAndSignToken()
                } else {
                    // Token found, verify it
                    
                    const isValid = await verifyToken(token)
                    if (!isValid) {
                        console.log('token not valid')

                        // Token is invalid, generate a new one
                        await generateAndSignToken()
                    }else{
                      setIsTokenValid(true);
                      console.log("token is valid");
                      
                    }
                    // If the token is valid, do nothing
                }
            } else {
                console.log('no pk')
            }
        }

        // Call the function to check and handle the token
        checkAndHandleToken()
    }, [connected, publicKey, signMessage, navigate])

    const toggleMenu = useCallback(() => {
        setIsOpen((prevState) => !prevState)
    }, [])

    const NavLink = ({ to, children }) => (
        <Link
            to={to}
            className="block rounded-md px-3 py-2 text-base font-medium hover:bg-purple-700"
        >
            {children}
        </Link>
    )

    return (
        <>
            {isAuthModalOpen && (
                <AuthorizationModal
                    closeModal={() => {
                        setIsAuthModalOpen(false)
                    }}
                />
            )}

            <nav className="bg-purple-900 text-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center">
                            <img
                                className="w-6 flex-shrink-0 shadow-lg"
                                src="/logo192.png"
                                alt="Logo"
                                onClick={()=>{navigate("/");}}
                            />
                        </div>
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-center space-x-4">
                                <NavLink to="/home">Home</NavLink>
                                <NavLink to="/explore">Explore</NavLink>
                                { isTokenValid && <><NavLink to="/profile">Profile</NavLink>
                                <NavLink to="/play">Play</NavLink></>}
                                <WalletMultiButton />
                                {!publicKey ? <div
                                    className="teyt-sm flex cursor-pointer items-center justify-center rounded-full bg-purple-700 p-1"
                                    onClick={clearStorageWallet}
                                >
                                    {/* Apply text-white to the icon itself to make the exclamation mark white */}
                                    <FaEraser className="text-white" />
                                </div> :isTokenValid ? <div
                                    className="teyt-sm flex cursor-pointer items-center justify-center rounded-full bg-purple-700 p-1"
                                    onClick={generateAndSignToken}
                                >
                                    {/* Apply text-white to the icon itself to make the exclamation mark white */}
                                    <FaCheck className="text-white" />
                                </div> :<div
                                    className="teyt-sm flex cursor-pointer items-center justify-center rounded-full bg-red-500 p-1"
                                    onClick={generateAndSignToken}
                                >
                                    {/* Apply text-white to the icon itself to make the exclamation mark white */}
                                    <FaExclamation className="text-white" />
                                </div>}
                                
                            </div>
                        </div>
                        <div className="-mr-2 flex md:hidden">
                            <button
                                onClick={toggleMenu}
                                className="inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-purple-800"
                                aria-label={
                                    isOpen
                                        ? 'Close main menu'
                                        : 'Open main menu'
                                }
                            >
                                {isOpen ? (
                                    <svg
                                        className="block h-6 w-6"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                ) : (
                                    <svg
                                        className="block h-6 w-6"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 6h16M4 12h16M4 18h16"
                                        />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
                {isOpen && (
                    <div className="md:hidden">
                        <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
                            <NavLink to="/">Home</NavLink>
                            <NavLink to="/explore">Explore</NavLink>
                            <NavLink to="/profile">Profile</NavLink>
                            <NavLink to="/play">Play</NavLink>
                            <WalletMultiButton />
                        </div>
                    </div>
                )}
            </nav>
        </>
    )
}

export default Navbar
