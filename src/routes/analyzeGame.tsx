import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import Engine from '../components/engine';
import axios from "axios";
import { useParams } from 'react-router-dom';
import AnalysisPanel from '../components/analysisPanel';





export default function AnalyzeGame() {
  
  const { gameId } = useParams()
  
  const [roomId, setRoomId] = useState("");
  
  
  useEffect(()=>{
    if (gameId) {
      setRoomId(gameId)
    }
   }, [gameId])

  


  return (
    <div className="h-full w-full bg-gray-900">
            <div className="mx-auto min-h-screen max-w-7xl px-4 sm:px-6 lg:px-8">
        {
          roomId == "" ? "waiting..." : <AnalysisPanel roomId={roomId}/>

        }
        
      </div>
    </div>
  );
}