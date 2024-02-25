import React, { useState, useEffect } from 'react';
import CreatePost from './createPost';
import Post from './post';
import axios from 'axios';


const Forum = () => {
  const [posts, setPosts] = useState([]);
  axios.defaults.baseURL = process.env.REACT_APP_API_CONNECTION;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchPosts(currentPage);
  }, [currentPage]);

  const fetchPosts = async (page) => {
    try {
      const response = await axios.get(`/getPosts?page=${page}`);
      setPosts(prevPosts => [...prevPosts, ...response.data]);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const loadMorePosts = () => {
    setCurrentPage(prevPage => prevPage + 1);
  };


  const handlePostUpdate = (postId, updatedReplies) => {
    setPosts(posts => posts.map(post => 
      post._id === postId ? { ...post, replies: updatedReplies } : post
    ));
  };

  const handleUpdatePostReplies = (postId, newReplies) => {
    setPosts(posts => posts.map(post => 
      post._id === postId ? { ...post, replies: newReplies } : post
    ));
  };

  const addPost = (newPost) => {
    console.log('Adding new post:', newPost);
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };
  return (
    <div className='md:p-4'>
    <h2 className="text-xl font-semibold mb-4 text-purple-400 text-center md:text-left">Forum</h2>
    <div className="rounded-lg bg-gray-800 p-4 shadow-lg">
      <CreatePost onPostCreated={addPost} onUpdate={handlePostUpdate} />
      {posts.length > 0 && posts.map((post, index) => (
        <Post key={index} post={post} onReplyUpdate={handleUpdatePostReplies} />
      ))}
      <button onClick={loadMorePosts}>Load more</button>
    </div>
    </div>
  );
};

export default Forum;
