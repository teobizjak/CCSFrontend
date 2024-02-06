import React, { useState } from 'react';
import { CSSTransition } from 'react-transition-group';
import './styles/post.css'
import ProfilePhoto from './profilePhoto';
import UserTitleBox from './userTitleBox';
import { useWallet } from '@solana/wallet-adapter-react';
import axios from 'axios';

const Post = ({ post, onUpdate  }) => {
    const [showReplies, setShowReplies] = useState(false);
  const [newReply, setNewReply] = useState('');
  const [replies, setReplies] = useState(post.replies.slice(0, 3)); // Use this state for rendering replies
  const [replyPage, setReplyPage] = useState(1);
  const { publicKey } = useWallet();
  const userWalletAddress = publicKey ? publicKey.toString() : "";

  const toggleReplies = () => setShowReplies(!showReplies);

  const handleReplyChange = (e) => setNewReply(e.target.value);

  const submitReply = async () => {
    if (!newReply.trim()) return; // Prevent empty replies
    const replyData = {
      postId: post._id,
      userWalletAddress,
      content: newReply,
    };

    try {
      const response = await axios.post('/createReply', replyData);
      setNewReply(''); 
      const newReplyObj = response.data;
      setReplies(currentReplies => [...currentReplies, newReplyObj]); // Update the local replies state
      onUpdate(post._id, [...post.replies, newReplyObj]); // Update the global post state
    } catch (error) {
      console.error('Error submitting reply:', error);
    }
  };

  const loadMoreReplies = async () => {
    try {
      const response = await axios.get(`/getReplies/${post._id}?page=${replyPage + 1}`);
      console.log(`response data for load more replies`, response.data);
      setReplies(currentReplies => [...currentReplies, ...response.data]);
      setReplyPage(currentPage => currentPage + 1);
    } catch (error) {
      console.error('Error loading more replies:', error);
    }
  };
  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow mb-4">
      <div className="mb-4">
        <div className="flex items-center mb-2">
          {/* User avatar -- use default avatar if userAvatar is not provided */}

          <span className="text-sm relative opacity-75">{post.userWalletAddress && post.userWalletAddress.slice(0,8) + "..." || "none"}</span>
        </div>
        <h3 className="text-lg font-bold text-white mb-2">{post.title}</h3>
        <p className="text-gray-400">{post.content}</p>
      </div>

      <div className='opacity-60 text-xs'>
        {post.createdAt}
      </div>
      <button
        onClick={toggleReplies}
        className="text-gray-300 hover:text-white transition ease-in-out duration-150"
      >
        {showReplies ? 'Hide Replies' : 'Show Replies'}
      </button>
      

      <CSSTransition
        in={showReplies}
        timeout={300}
        classNames="reply"
        unmountOnExit
      >
        <div className="mt-4 space-y-4">
        {replies.map((reply, index) => (
            <div key={index} className="bg-gray-700 p-3 rounded shadow">
            <div className="flex items-center mb-2 text-gray-400">
              <span className="text-xs relative"><span className='opacity-75'>{reply.userWalletAddress && reply.userWalletAddress.slice(0,8) + "..." || "none"}</span></span>
            </div>
            <p className="text-gray-300">{reply.content}</p>
          </div>
          ))}
          {post.replies.length > replies.length && (
            <button onClick={loadMoreReplies}>
              Load More Replies
            </button>
          )}
          <textarea
            className="w-full p-3 mt-4 text-white bg-gray-800 rounded shadow appearance-none focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            placeholder="Write a reply..."
            rows="3"
            value={newReply}
            onChange={handleReplyChange}
          ></textarea>

          <button
            onClick={submitReply}
            className="w-full rounded-lg bg-purple-800 ease-in-out hover:bg-purple-700 text-white font-bold py-2 px-4 transition duration-300  focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-opacity-50"
          >
            Reply
          </button>
        </div>
      </CSSTransition>
    </div>
  );
};

export default Post;
