import { Chess } from 'chess.js';
import React, { useEffect, useMemo, useRef, useState } from 'react'
import Engine from './engine';
import { Chessboard } from 'react-chessboard';
import axios from 'axios';
import GameUserData from './gameUserData';
import GameHistoryBox from './gameHistoryBox';
import { FaSquare, FaSync } from 'react-icons/fa';

function AnalysisPanel({ roomId }) {
  axios.defaults.baseURL = process.env.REACT_APP_API_CONNECTION;
  const engine = useMemo(() => new Engine(), []);
  const [fenHistory, setFenHistory] = useState([]);
  const [winner, setWinner] = useState("");
  const [whitePlayer, setWhitePlayer] = useState({ elo: 0, firstName: '', lastName: '', walletAddress: 'waiting...', picture: 'avatar' });
  const [blackPlayer, setBlackPlayer] = useState({ elo: 0, firstName: '', lastName: '', walletAddress: 'waiting...', picture: 'avatar' });
  const game = useRef(new Chess());
  const [evaluation, setEvaluation] = useState("waiting for evaluation...");
  const [pgn, setPgn] = useState(
    "1.e4 e5 2.d3 Qg5 3.a4 Bc5 4.Qf3 a6 5.Qxf7"
  );
  const [msg, setMsg] = useState("");

  const loadPgnAndGetFenHistory = (pgn) => {
    console.log("loadpgnandsethistorystart");

    const newGame = new Chess();
    newGame.loadPgn(pgn);

    const moves = newGame.history({ verbose: true });
    const fens = [];

    // Reset the game to start position
    newGame.reset();

    // Iterate over the moves and make each move to generate the FEN history
    for (let move of moves) {

      fens.push(newGame.fen());
      newGame.move(move);
    }
    fens.push(game.current.fen());

    setFenHistory(fens);
  };

  const fetchUserData = async (userId, setPlayer) => {
    try {
      const response = await axios.get(`/user/${userId}`);
      const userData = response.data;
      setPlayer(userData);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    console.log(roomId);
    if (roomId !== "") {
      fetchData();
    }

  }, [roomId])

  const fetchData = async () => { // Mark the function as async
    console.log(`getting game details of ${roomId}`);

    try {
      const response = await axios.get(`/game/${roomId}`); // Use await to wait for the promise to resolve
      console.log(`response of server call for pgn: ${response.data.pgn}`);
      const { fen, black, white, turn, whiteTime, blackTime, duration, pgn, winner } = response.data;

      // Await the user data fetches in sequence
      await fetchUserData(black, setBlackPlayer);
      await fetchUserData(white, setWhitePlayer);
      setWinner(winner);
      loadPgnAndGetFenHistory(pgn);
      setPgn(pgn);
    } catch (error) {
      console.error('Error:', error);
    }

  };

  // Use useRef hook to create the game variable

  const [fen, setFen] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");

  const [history, setHistory] = useState([]);
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [line3, setLine3] = useState("");
  const [index, setIndex] = useState();
  const [height, setHeight] = useState(50);

  // Create a state variable for the evaluation

  const orientation = "white";
  function transformToSAN(fen, moves) {
    //console.log(moves);

    const chess = new Chess(fen);
    var movesArr = moves.toString().split(' ');

    for (let i = 0; i < movesArr.length; i++) {
      try {
        //console.log(JSON.stringify(movesArr[i]));

        chess.move({ from: movesArr[i].slice(0, 2), to: movesArr[i].slice(-2), promotion: 'q' });
      } catch (error) {
        console.log(error);

      }

    }
    return chess.history().join(" ");
  }
  function findBestMove() {
    console.log(`finding best move with fen: ${game.current.fen()}`);

    engine.evaluatePosition(game.current.fen(), 13);
    engine.onMessage((data) => {
      console.log("data", data);

      if (data) {
        console.log(data.uciMessage);

      }

      if (data.possibleMate) {
        setEvaluation("M" + data.possibleMate)
      } else if (data.positionEvaluation) {
        if (game.current.turn() == 'b') {
          setEvaluation((data.positionEvaluation / 100 * (-1)).toFixed(1))
        } else {
          setEvaluation((data.positionEvaluation / 100).toFixed(1))
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
          if (movesArr[i].slice(0, 2) !== "" || movesArr[i].slice(-2) !== "") {
            chess.move({ from: movesArr[i].slice(0, 2), to: movesArr[i].slice(-2), promotion: 'q' });
          }
        } catch (error) {
          //console.log(error);

        }

      }
      if (chess.isGameOver()) {
        if (chess.turn() == 'b') {
          setHeight(0);
        } else if (chess.turn() == 'w') {
          setHeight(100);
        }
      }

    } else {
      var x = -8 * parseFloat(evaluation) + 50;
      if (x > 90) {
        x = 90;
      } else if (x < 10) {
        x = 10;
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
        console.log(`index: ${index}`);

      } else if (event.key === "ArrowRight") {
        handleRightArrow();
        console.log(`index: ${index}`);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };

  }, [index, pgn]);
  useEffect(() => {
    setLine1("");
    setLine2("");
    setLine3("");
    if (engine.isReady === false) {
      console.log("engine not ready");
      setMsg("Failed to load the engine. See how to acces analysis on our help page")

    } else {
      setMsg("");
    }
    findBestMove();
  }, [game, fen, index, pgn, engine])

  return (
    <div className="grid grid-cols-1 items-start gap-14 py-8 md:grid-cols-7">
      <div className=" h-fit col-span-4 my-auto rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors duration-700 px-6 text-white">
        {/* White Player Info */}

        <div>
          <div className="flex w-full items-center justify-between py-4">
            <GameUserData user={blackPlayer} timer={455} name={"Opponent"} />
          </div>
          <div className='flex flex-1'>
            <div className="w-6 bg-white flex-grow flex-row">
              <div style={{ height: height + '%' }} className="w-full bg-black relative transition-all duration-1000 delay-150"><span className=' absolute bottom-0 left-1/2 text-white -translate-x-1/2 -translate-y-1/2 text-xs'>{height > 50 ? evaluation : ""}</span></div>
              <div className='w-full bg-white relative'><span className=' absolute top-0 left-1/2 text-black -translate-x-1/2 translate-y-1/2 text-xs'>{height <= 50 ? evaluation : ""}</span></div>
            </div>
            <div className="flex w-full">
              <Chessboard
                position={fen}
                boardOrientation={orientation}

              />
            </div>
          </div>
          <div className="flex w-full items-center justify-between py-4">
            <GameUserData user={whitePlayer} timer={455} name={"You"} />
          </div>
        </div>
      </div>
      <div className='col-span-3'>
        <div className="text-6xl font-bold  flex mb-4 items-end text-white">
          <img
            className="aspect-auto w-8 mr-2"
            src="/logo192.png"
            alt="Logo"
          />
          <span className="text-4xl">CryptoChess</span>
          <span className="text-lg">.site</span>

        </div>

        <div className="flex flex-col rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors duration-700 px-4 py-2 overflow-hidden text-white">
          <div className='flex-grow'>
            <div className='flex justify-between items-center mb-4'>
              <div className='flex items-center'>
                <FaSquare className=' text-white mr-1'/>{whitePlayer.walletAddress?.slice(0, 8)}... - <FaSquare className=' text-black ml-2 mr-1'/>{blackPlayer.walletAddress?.slice(0, 8)}... 
              </div>
              <FaSync className='text-white hover:text-purple-600 transition-colors duration-1000 cursor-pointer' />
            </div>

            {/* Evaluation and Lines Information */}
            <div className="mb-4 px-4 bg-gray-900 rounded-lg py-4">
              <div className="Evaluation text-sm md:text-base">
                {msg === "" ? (
                  <p className="font-semibold">Evaluation: <span className="font-normal">{evaluation}</span></p>
                ) : (
                  <></>
                )}
                <div className=' custom-x-scrollbar w-full overflow-x-auto flex whitespace-nowrap my-2'>
                  <p className=' font-semibold'>Line1: <span className="font-normal">{transformToSAN(fen, line1)}</span></p>
                </div>
                <div className='custom-x-scrollbar w-full overflow-x-auto flex whitespace-nowrap my-2'>
                  <p className=' font-semibold'>Line2: <span className="font-normal">{transformToSAN(fen, line2)}</span></p>
                </div>
                <div className='custom-x-scrollbar w-full overflow-x-auto flex whitespace-nowrap my-2'>
                  <p className=' font-semibold'>Line3: <span className="font-normal">{transformToSAN(fen, line3)}</span></p>
                </div>

              </div>
            </div>
          </div>

          <div className="flex-grow overflow-auto bg-gray-900 rounded-lg px-4 py-4">
            <GameHistoryBox chess={game.current} fenHistory={fenHistory} setPlaybackIndex={index} />
          </div>
          <div className='flex w-full justify-center py-2'>{winner === "draw" ? "Draw" : <><span className=' capitalize mr-1'>{winner} </span>wins</>}</div>
        </div>

      </div>
    </div>
  )
}

export default AnalysisPanel