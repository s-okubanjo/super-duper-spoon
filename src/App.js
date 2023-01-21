import './App.css';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

function App() {
  const [queryString, setQueryString] = useState('');
  const [mapsData, setMapsData] = useState({});
  const [message, setMessage] = useState('');
  function handleChange(event) {
    setQueryString(event.target.value);
  }
  function submitQuery(event) {
    event.preventDefault();
    searchData();
  }
  const searchData = useCallback(() => {
    document.getElementById('loadSpinner').style.display = "flex";
    axios.get(`${process.env.APP_BACKEND_URL || ""}/api/?q=${encodeURIComponent(queryString)}`)
      .then(res => {
        setMapsData(res.data);
      })
      .catch(err => {
        console.error(err);
        setMessage("An error occurred. Please try again.");
        setMapsData({});
      })
      .then(() => {
        document.getElementById('loadSpinner').style.display = "none";
      });
  }, [queryString])
  useEffect(() => {
    document.getElementById('searchForm').click();
    return () => {
      setMapsData({});
      setMessage('');
    };
  }, []);
  useEffect(() => {
    searchData();
    return () => {
      setMapsData({});
      setMessage('');
    };
  }, [searchData]);
  return (
    <div className="bg-white">
      <div className="max-w-2xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:max-w-7xl lg:px-8">
        <form onSubmit={submitQuery}>
          <input
            placeholder="Phone Number"
            type="tel"
            value={queryString}
            className='rounded-md'
            onChange={handleChange} />
          <button
            id="searchForm"
            onClick={submitQuery}
            className='text-gray-800 bg-gray-300 rounded-md hover:bg-blue-800 hover:text-white p-2 mx-2'>
            Search
          </button>
        </form>
        <div id="loadSpinner" className="items-center justify-center hidden">
          <div className="w-16 h-16 border-b-2 border-gray-900 rounded-full animate-spin"></div>
        </div>
        {message !== "" && <div>{message}</div>}
        <div className="mt-6 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
        {mapsData}
        </div>
      </div>
    </div>
  );
}

export default App;
