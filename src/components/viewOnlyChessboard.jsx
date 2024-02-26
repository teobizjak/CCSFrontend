import React, { useEffect, useState } from 'react';
import whitePawn from '../assets/pieces/whitePawn.svg';
import whiteRook from '../assets/pieces/whiteRook.svg';
import whiteKnight from '../assets/pieces/whiteKnight.svg';
import whiteBishop from '../assets/pieces/whiteBishop.svg';
import whiteQueen from '../assets/pieces/whiteQueen.svg';
import whiteKing from '../assets/pieces/whiteKing.svg';
import blackPawn from '../assets/pieces/blackPawn.svg';
import blackRook from '../assets/pieces/blackRook.svg';
import blackKnight from '../assets/pieces/blackKnight.svg';
import blackBishop from '../assets/pieces/blackBishop.svg';
import blackQueen from '../assets/pieces/blackQueen.svg';
import blackKing from '../assets/pieces/blackKing.svg';

// Mapping FEN characters to the corresponding SVGs
const pieceSVGs = {
    'P': whitePawn,
    'R': whiteRook,
    'N': whiteKnight,
    'B': whiteBishop,
    'Q': whiteQueen,
    'K': whiteKing,
    'p': blackPawn,
    'r': blackRook,
    'n': blackKnight,
    'b': blackBishop,
    'q': blackQueen,
    'k': blackKing,
};
const ViewOnlyChessboard = ({ fen, orientation = 'white' }) => {
    const [board, setBoard] = useState([]);
    const [squareSize, setSquareSize] = useState(32); // Default square size

    useEffect(() => {
        setBoard(parseFEN(fen));
    }, [fen]);

    useEffect(() => {
        const handleResize = () => {
            const newSize = document.querySelector('.chessboard')?.offsetWidth / 8 || 32;
            setSquareSize(newSize);
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Set initial size

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const parseFEN = (fen) => {
        const rows = fen.split(' ')[0].split('/');
        if(orientation === 'black') console.log("rows", rows.reverse());
        return rows.map(row => {
            return row.split('').reduce((acc, char) => {
                if (!isNaN(char)) { // If the character is a number, add that many empty squares
                    return acc.concat(Array.from({ length: parseInt(char) }).map(() => ''));
                }
                acc.push(pieceSVGs[char] || ''); // If it's a piece character, add the corresponding SVG
                return acc;
            }, []);
        });
    };

    return (
        <div className="chessboard mx-auto" style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', maxWidth: '320px', aspectRatio: '1' }}>
            {board.map((row, rowIndex) => (
                row.map((cell, cellIndex) => (
                    <div key={`${rowIndex}-${cellIndex}`} style={{ width: '100%', paddingBottom: '100%', position: 'relative', backgroundColor: (rowIndex + cellIndex) % 2 === 0 ? '#f0d9b5' : '#b58863' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {cell && (
                                <img src={cell} alt="Chess piece" style={{ width: squareSize, height: 'auto' }} />

                            )}
                        </div>
                    </div>
                ))
            ))}
        </div>
    );
};

export default ViewOnlyChessboard;
