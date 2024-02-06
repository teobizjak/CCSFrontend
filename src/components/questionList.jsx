import React, { useEffect, useState } from 'react';
import QuestionItem from './questionItem';
import CreateQuestion from './createQuestion';
import axios from 'axios';

const QuestionList = () => {
  axios.defaults.baseURL = process.env.REACT_APP_API_CONNECTION;
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get('/api/questions'); // Adjust the URL based on your API endpoint
        setQuestions(response.data);
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    };

    fetchQuestions();
  }, []); // Empty dependency array means this effect runs once on mount

  const addQuestion = (newQuestion) => {
    setQuestions([...questions, newQuestion]);
  };
  return (
    <div className='p-4'>
      <h2 className="text-xl font-semibold mb-4 text-purple-400">FAQ & Help</h2>
      <div className="rounded-lg bg-gray-800 p-4 shadow-lg space-y-4">
        {questions.map((question, index) => (
          <QuestionItem key={index} question={question} /> // Using index as key; consider using unique IDs
        ))}
      </div>
      <CreateQuestion onNewQuestion={addQuestion} />
    </div>
  );
};

export default QuestionList;
