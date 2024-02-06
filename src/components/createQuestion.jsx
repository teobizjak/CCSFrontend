import axios from 'axios';
import React, { useState } from 'react';

const CreateQuestion = ({ onNewQuestion }) => {
    axios.defaults.baseURL = process.env.REACT_APP_API_CONNECTION;
  const [title, setTitle] = useState('');

  const handleAddQuestrion = async (e) => {
    e.preventDefault();
    try {
        // Replace '/question' with the actual endpoint you're posting to
        const response = await axios.post('/question', { title });
        console.log('Question submitted successfully:', response.data);
        // Handle the response, e.g., update the UI or notify the user
      } catch (error) {
        console.error('Error submitting question:', error);
        // Handle the error, e.g., show an error message to the user
      }
    setTitle('');
  };

  return (
    <div className="max-w-xl my-8">
    <div className="mb-4">
    <input
      type="text"
      id="question"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      placeholder="Ask us a question."
      required
      style={{ backgroundColor: '#2D3748' }}
      className="mt-1 block w-full px-3 py-2  text-white leading-tight rounded shadow appearance-none focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent sm:text-sm bg-gray-900"
    />
  </div>
  <button type="submit" className="inline-flex justify-center border border-transparent shadow-sm text-sm rounded-lg bg-purple-800 ease-in-out hover:bg-purple-700 text-white font-bold py-2 px-4 transition duration-300  focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-opacity-50" onClick={handleAddQuestrion}
               >
    Add Question
  </button>
</div>
  );
};

export default CreateQuestion;
