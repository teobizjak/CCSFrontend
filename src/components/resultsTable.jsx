import { useWallet } from '@solana/wallet-adapter-react';
import axios from 'axios';
import React, { useEffect, useState } from 'react'

function ResultsTable({ games, handleClaim, publicKey, loadMore }) {
  return (
    <>
    <table className="w-full text-center border-collapse">
          <thead>
            <tr>
              <th className="border p-4">Opponent</th>
              <th className="border p-4">Your color</th>
              <th className="border p-4">Result</th>
              <th className="border p-4">Claim reward</th>
            </tr>
          </thead>
          <tbody>
      {games.map((game, index) => {
        let result;
        if (game.winner === "draw") {
          result = "Draw";
        } else if (game.winner === "white" && game.white === publicKey?.toBase58()) {
          result = "Win";
        } else if (game.winner === "black" && game.black === publicKey?.toBase58()) {
          result = "Win";
        } else {
          result = "Defeat";
        }

        let opponent = game.white === publicKey?.toBase58() ? game.black : game.white;
        opponent = opponent ? opponent.slice(0, 8) : "none";
        let colorTxId = game.white === publicKey?.toBase58() ? "whiteTxnId" : "blackTxnId";

        return (
          <tr key={index}>
            <td className="border p-4">{opponent}...</td>
            <td className="border p-4">{game.white === publicKey?.toBase58() ? "white" : "black" }</td>
            <td className="border p-4">{result}</td>
            <td className="border p-4">
              {result !== "Defeat" ?
              game[colorTxId] ? <a href={"https://explorer.solana.com/tx/" + game[colorTxId] + "?cluster=devnet"} target="blank">{"Claimed: "+game[colorTxId].slice(0,8)+"..."}</a>  :
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                onClick={() => handleClaim(game.roomId)}
              >
                {result === "Win" ? "Claim " + game.betAmount*1.95 + " SOL" : result === "Draw" ? "Claim " + game.betAmount*0.95 + " SOL" : ""}
              </button>
              : <span className=" cursor-default">You lost</span>
              }
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
  {games.length === 0 ? <div className=" w-fit mx-auto mt-4">You haven't played any games</div> :<div className=" w-fit mx-auto mt-4" onClick={loadMore}>Load more</div>}
  </>
  )
}

export default ResultsTable