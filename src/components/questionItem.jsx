import React, { useState } from 'react';
import { FaArrowDown } from 'react-icons/fa';
import { CSSTransition } from 'react-transition-group';

const QuestionItem = ({ question }) => {
  const [showAnswers, setShowAnswers] = useState(false);

  const toggleAnswers = () => {
    setShowAnswers(!showAnswers);
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-xl">
  <div 
    className="question-title flex justify-between items-center p-4 text-lg font-medium text-white hover:bg-gray-700 cursor-pointer"
    onClick={toggleAnswers}
    tabIndex="0"
    onKeyDown={(e) => e.key === 'Enter' && toggleAnswers()}
  >
    <span>{question.title}</span>
    <span className={`transform transition-transform ${showAnswers ? 'rotate-90' : ''}`}><FaArrowDown/></span> {/* Chevron icon */}
  </div>
  <CSSTransition in={showAnswers} timeout={300} classNames="answer" unmountOnExit>
    <div className="answers bg-gray-900 p-4 space-y-2">
      {question.answers.map((answer, index) => (
        <div key={index} className="answer text-gray-400">
          - {answer}
        </div>
      ))}
    </div>
  </CSSTransition>
</div>

  );
};

export default QuestionItem;
