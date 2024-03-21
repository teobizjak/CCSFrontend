import React, { useState } from 'react';
import ClaimedLink from './claimedLink';
import axios from 'axios';
import { FaEye } from 'react-icons/fa';

function HandleClaimButton({ handleClaim, txId, result, isOwner, roomId, betAmount, reported }) {
    axios.defaults.baseURL = process.env.REACT_APP_API_CONNECTION;
    const [isClaiming, setIsClaiming] = useState(false);
    const [txIdState, setTxIdState] = useState(txId);

    const handleClaimHere = (roomId) => {
        console.log(`Claim ${roomId}`);
        setIsClaiming(true);

        axios.post(`/claim/${roomId}`)
            .then((response) => {
                console.log('response: ', response.data);
                const { OK, txId } = response.data;
                console.log('Success:', OK);
                if (OK) {
                    console.log('Transaction ID:', txId);
                    setTxIdState(txId);
                }
                setIsClaiming(false);
                handleClaim();
            })
            .catch((error) => {
                console.error('Error:', error);
                setIsClaiming(false);
            });
    };

    return (
        <div>
            {reported === true ? <div className="flex justify-center items-center">
            <FaEye className="animate-spin rounded-full h-8 w-8 text-purple-300"></FaEye>
        </div> : isClaiming ? (
        // Spinner/Loader animation when isClaiming is true
        <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-800"></div>
        </div>
    )  : result !== 'Defeat' ? isOwner === false ? "awaiting claim" : (
                txIdState ? (
                    <ClaimedLink link={txIdState} />
                ) : (
                    <button
                        className="rounded-lg bg-purple-800 px-4 py-2 text-white hover:bg-purple-700"
                        onClick={() => handleClaimHere(roomId)}
                    >
                        {result === 'Win' ? betAmount * 1.95 + ' SOL' : result === 'Draw' ? betAmount * 0.975 + ' SOL' : ''}
                    </button>
                )
            ) : (
                <span className="cursor-default">
                    {isOwner === false ? "User" : "You"} lost
                </span>
            )}
        </div>
    );
}

export default HandleClaimButton;
