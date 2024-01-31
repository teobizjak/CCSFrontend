import axios from 'axios';

export async function getUserData(address) {
    axios.defaults.baseURL = process.env.REACT_APP_API_CONNECTION
  try {
    const response = await axios.get(`/user/${address}`); // Adjust the endpoint as needed
    return response.data; // Return the data from the response
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null; // Return null or handle the error as needed
  }
}
