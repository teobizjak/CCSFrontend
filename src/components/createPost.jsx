import { useWallet } from '@solana/wallet-adapter-react';
import axios from 'axios';
import React, { useState } from 'react';

const CreatePost = ({ onPostCreated  }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    axios.defaults.baseURL = process.env.REACT_APP_API_CONNECTION;
    const { publicKey } = useWallet();
    const userWalletAddress = publicKey ? publicKey.toString() : "no address";

    const submitPost = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const response = await axios.post('/createPost', { userWalletAddress, title, content });
            onPostCreated(response.data)
            alert('Post created successfully!');
            // Optionally clear the form fields
            setTitle('');
            setContent('');
        } catch (error) {
            console.error('Error creating post:', error);
            alert('Failed to create post.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-gray-900 p-4 rounded-lg shadow mb-4">
            <input
                className="w-full p-3 mb-3 text-white leading-tight rounded shadow appearance-none focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                type="text"
                placeholder="Post Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ backgroundColor: '#2D3748' }} // You can create a custom class in your Tailwind config for this color
            />
            <textarea
                className="w-full h-24 p-3 mb-3 text-white leading-tight rounded shadow appearance-none focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="Post Content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{ backgroundColor: '#2D3748' }} // Same as above for consistency
            ></textarea>
            <button
                className="w-full rounded-lg bg-purple-800 ease-in-out hover:bg-purple-700 text-white font-bold py-2 px-4 transition duration-300  focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-opacity-50"
                type="button" disabled={submitting} onClick={submitPost}
            >
                {submitting ? 'Submitting...' : 'Submit Post'}
            </button>
        </div>


    );
};

export default CreatePost;
