import React from 'react';
import { FaPlay, FaQuestionCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const ReadyToMakeYourMove = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-gray-900 text-white py-12 px-4">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-purple-600 mb-6">Ready to Make Your Move?</h2>
        <p className="text-gray-300 mb-8">
          Join the ranks of strategic minds and chess enthusiasts who are already
          reaping the rewards of Solana Chess. Whether you’re a seasoned grandmaster or
          a tactical beginner, every move on our platform is a step towards victory.
        </p>
        <div className="flex justify-center gap-4">
          <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-full inline-flex items-center" onClick={() => navigate('/home')}>
            <FaPlay className="mr-2" />
            Start Playing
          </button>
          <button className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-full inline-flex items-center" onClick={() => navigate('/learnMore')}>
            <FaQuestionCircle className="mr-2"  />
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReadyToMakeYourMove;
