import { useWallet } from '@solana/wallet-adapter-react';
import axios from 'axios';
import React from 'react'

function LoginTeam({setToken, token,setActiveTab}) {
    const { connected, publicKey, signMessage } = useWallet()
    axios.defaults.baseURL = process.env.REACT_APP_API_CONNECTION
    const generateAndSignToken = async () => {
        if (!publicKey || !signMessage) return;
    
        try {
          // Step 1: Generate a message or token
          const array = new Uint8Array(10);
          const nonce = crypto.getRandomValues(array).toString();
          const message = `Please sign this message to authenticate. Nonce: ${nonce}`;
          console.log('Message is:', message);
    
          const encodedMessage = new TextEncoder().encode(message);
    
          // Step 2: Use the wallet to sign the message
          const signature = await signMessage(encodedMessage);
    
          // Step 3: Send the signed message to the server for verification
          axios.post('/verify-signature-team', {
            signature: Array.from(signature), // Convert the signature to a normal array for JSON serialization
            publicKey: publicKey.toString(),
            message,
          })
          .then((response) => {
            if (response.data.valid) {
                console.log("token is: ", btoa(String.fromCharCode(...signature)));
                setToken(btoa(String.fromCharCode(...signature)))
                setActiveTab("teamHome")
              console.log('Signature is valid and saved in local storage.');
            } else {
              console.error('Signature is invalid according to the server.');
            }
          })
          .catch((error) => {
            console.error('Error during verification:', error);
          });
        } catch (error) {
          console.error('Error during signing:', error);
        }
      };


  return (
    <div className='text-white py-4 px-4'>
        <h1 className=' text-center text-lg'>Team Login</h1>
        <div className="flex justify-center"> {/* Flex container with horizontal centering */}
        <button onClick={generateAndSignToken} className="mt-4 bg-purple-800 px-4 py-2 rounded-lg">Login with Solana Wallet</button>
    </div>
    </div>
  )
}

export default LoginTeam