import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import Engine from '../components/engine';
import { useWallet } from '@solana/wallet-adapter-react';
import axios from "axios";
import { useLocation } from 'react-router-dom';
import AnimateHeight from "react-animate-height";




export default function AnalyzeGame() {
  axios.defaults.baseURL = process.env.REACT_APP_API_CONNECTION;
  const location = useLocation();
  const [roomId, setRoomId] = useState(location.state?.roomId);
  const [pgn, setPgn] = useState(
    "1.e4 e5 2.d3 Qg5 3.a4 Bc5 4.Qf3 a6 5.Qxf7"
  );
  useEffect(()=>{
   console.log(roomId);
    fetchData();
  }, [roomId])
  const fetchData = () => {
    console.log(`getting game details of ${roomId}`);
    
    axios.get(`/game/${roomId}`)
    .then(response => {
      setPgn(response.data.pgn);
    })
    .catch(error => {
      console.error('Error:', error);
    });
    let str = "";
  };
    // Use useRef hook to create the game variable
  const engine = useMemo(() => new Engine(), []);
  const { publicKey } = useWallet();
  const game = useRef(new Chess());
  const [fen, setFen] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");

  const [history, setHistory] = useState([]);
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [line3, setLine3] = useState("");
  const [index, setIndex] = useState();
  const [height, setHeight] = useState(50);

  // Create a state variable for the evaluation
  const [evaluation, setEvaluation] = useState("waiting for evaluation...");

  const orientation = "white";
  function transformToSAN(fen, moves){
    console.log(moves);
    
    const chess = new Chess(fen);
    var movesArr = moves.toString().split(' ');

    for (let i = 0; i < movesArr.length; i++) {
      try {
        console.log(JSON.stringify(movesArr[i]));
        
        chess.move({from: movesArr[i].slice(0,2), to: movesArr[i].slice(-2), promotion: 'q'});
      } catch (error) {
        console.log(error);
        
      }
      
    }
    return chess.history().join(" ");
  }
  function findBestMove() {
    engine.evaluatePosition(game.current.fen(), 13);
    engine.onMessage((data ) => {
        
        if (data.possibleMate) {
          setEvaluation("M"+data.possibleMate)
        }else if (data.positionEvaluation) {
          if (game.current.turn() == 'b') {
            setEvaluation((data.positionEvaluation/100 * (-1)).toFixed(1))
          }else{
            setEvaluation((data.positionEvaluation/100).toFixed(1))
          }
        }
        if (data.uciMessage) {
          var string = data.uciMessage;
          var substring = " pv ";
          if (data.uciMessage.includes(" multipv 1 ")) {
            var index = string.indexOf(substring); // 74
            setLine1(string.slice(index + substring.length)); // "c5b4 c2c3 g5g4 c3b4 g8e7 h2h3 g4h4 g1f3"
          }
          if (data.uciMessage.includes(" multipv 2 ")) {
            var index = string.indexOf(substring); // 74
            setLine2(string.slice(index + substring.length)); // "c5b4 c2c3 g5g4 c3b4 g8e7 h2h3 g4h4 g1f3"
          }
          if (data.uciMessage.includes(" multipv 3 ")) {
            var index = string.indexOf(substring); // 74
            setLine3(string.slice(index + substring.length)); // "c5b4 c2c3 g5g4 c3b4 g8e7 h2h3 g4h4 g1f3"
          }
        }
        //console.log(data.uciMessage.match(/multipv\s+(\d+)\s+pv\s+(.*)/)?.slice(1));
          
          
        
      
    });
  }
  useEffect(() => {
    // Use game.current to access the game object
    game.current.loadPgn(pgn);
    setFen(game.current.fen());
    setHistory(game.current.history())
    setIndex(game.current.history().length)
  }, [pgn]);
  useEffect(() => {
    if (evaluation.includes("M")) {
      const chess = new Chess(fen);
      var movesArr = line1.toString().split(' ');
      for (let i = 0; i < movesArr.length; i++) {
        try {
          console.log(JSON.stringify(movesArr[i]));
          
          chess.move({from: movesArr[i].slice(0,2), to: movesArr[i].slice(-2), promotion: 'q'});
        } catch (error) {
          console.log(error);
          
        }
        
      }
      if (chess.isGameOver()) {
        if (chess.turn() == 'b') {
          setHeight(0);
        }else if (chess.turn() == 'w') {
          setHeight(100);
        }
      }
      
    }else{
      var x = -8 * parseFloat(evaluation) + 50;
    if (x > 90) {
      x=90;
    }else if(x < 10){
      x= 10;
    }
    setHeight(x);
    }
    
  }, [evaluation]);

  // Create a function to handle the left arrow key
  const handleLeftArrow = () => {
    if (index > 0) {
      setIndex((prevIndex) => prevIndex - 1);
      game.current.undo();
      setFen(game.current.fen());
    }
  };

  // Create a function to handle the right arrow key
  const handleRightArrow = () => {
    if (index < history.length) {
      setIndex((prevIndex) => prevIndex + 1);
      game.current.move(history[index]);
      setFen(game.current.fen());
    }
  };

  // Use the useEffect hook to add event listeners for the arrow keys
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowLeft") {
        handleLeftArrow();
      } else if (event.key === "ArrowRight") {
        handleRightArrow();
      }
    };
    setLine1("");
    setLine2("");
    setLine3("");
    findBestMove();
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
    
  }, [index, pgn]);


  return (
    <div className="h-screen w-full bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full bg-purple-100">
        <div className="flex flex-col md:flex-row justify-between items-center h-full">
        <div className="w-full md:w-1/2 h-auto bg-gray-200 border-4 px-6 ">
          <div className="flex justify-between items-center py-6 w-full">
            <p className="text-2xl font-medium text-left">
              Opponent: 
            </p>
            <p className="text-2xl font-medium text-right">
              Time: 
            </p>
          </div>
          <div className='flex flex-1'>
          <div className="w-6 bg-white flex-grow flex-row">
            <div style={{height: height+'%'}} className="w-full bg-black relative transition-all duration-1000 delay-150"><span className=' absolute bottom-0 left-1/2 text-white -translate-x-1/2 -translate-y-1/2 text-xs'>{height > 50 ? evaluation : ""}</span></div>
            <div className='w-full bg-white relative'><span className=' absolute top-0 left-1/2 text-black -translate-x-1/2 translate-y-1/2 text-xs'>{height <= 50 ? evaluation : ""}</span></div>
          </div>
          <div className="flex w-full">
            <Chessboard
              position={fen}
              boardOrientation={orientation}
            />
          </div>
          </div>
          <button onClick={() =>{setHeight(height+10)}}>Click</button>
          <div className="flex justify-between items-center py-8 w-full">
            <p className="text-2xl font-medium text-left">
              User: 
            </p>
            <p className="text-2xl font-medium text-right">
              Time:
            </p>
          </div>
        </div>

          <div className="w-full md:w-1/2 h-96 flex flex-col justify-center items-center">
          <div className="Evaluation">
        <p>Evaluation: {evaluation}</p>
        <p>Line1: {transformToSAN(fen, line1)}</p>
        <p>Line2: {transformToSAN(fen, line2)}</p>
        <p>Line3: {transformToSAN(fen, line3)}</p>
      </div>
          </div>
        </div>
      </div>
    </div>
  );
}