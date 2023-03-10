import './App.css';
import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, LoadScript, Circle, InfoWindow } from '@react-google-maps/api';
import InputMask from 'react-input-mask';
import axios from 'axios';
import Geocode from "react-geocode";

Geocode.setApiKey(process.env.REACT_APP_GMAPS_API_KEY);
Geocode.setRegion("us");
// Geocode.setLocationType("ROOFTOP");

const defaultCenter = {
  lat: 38.967,
  lng: -100.77
}

let timeout = null;

const circleOptions = {
  strokeColor: '#FF0000',
  strokeOpacity: 0.8,
  strokeWeight: 2,
  fillColor: '#FF0000',
  fillOpacity: 0.35,
  clickable: false,
  draggable: false,
  editable: false,
  visible: true,
  radius: 1600,
  zIndex: 2147483647
}

function PhoneInput(props) {
  return <InputMask
    mask='(+1) 999 999 9999'
    type='tel'
    className='rounded-md'
    onChange={props.onChange}
    value={props.value}
    alwaysShowMask={true}
  />;
}

function App() {
  const [queryString, setQueryString] = useState('');
  const [mapsData, setMapsData] = useState(defaultCenter);
  const [message, setMessage] = useState('');
  const [addr, setAddr] = useState('');
  function handleChange(event) {
    setQueryString(event.target.value);
  }
  function submitQuery(event) {
    clearTimeout(timeout);
    event.preventDefault();
    const phone = queryString.replace(/[^0-9]/g, '');
    if (phone.length !== 11) {
      setMessage('Invalid US phone number!');
      return;
    }
    searchData();
  }
  const searchData = useCallback(() => {
    const phone = queryString.replace(/[^0-9]/g, '');
    if (phone.length !== 11) {
      return;
    }
    setMessage('');
    document.getElementById('loadSpinner').style.display = "flex";
    axios.get(`${process.env.REACT_APP_BACKEND_URL}/?phone=${phone}`)
      .then(res => {
        if (res.data.msg) {
          setMessage(res.data.msg);
        }
        if (res.data.data) {
          setMapsData(res.data.data);
          Geocode.fromLatLng(res.data.data.lat, res.data.data.lng).then(
            response => setAddr(response.results[0].formatted_address),
            error => console.error(error)
          );
        } else {
          setMapsData(defaultCenter);
        }
      })
      .catch(err => {
        console.error(err);
        setMessage("An error occurred. Please try again.");
        setMapsData(defaultCenter);
      })
      .then(() => document.getElementById('loadSpinner').style.display = "none");
  }, [queryString])
  useEffect(() => {
    searchData();
    return () => {
      setMapsData(defaultCenter);
      setMessage('');
    };
  }, [searchData]);
  return (
    <div className="bg-white">
      <div className="max-w-2xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:max-w-7xl lg:px-8">
        <form onSubmit={submitQuery}>
          <PhoneInput 
            value={queryString}
            onChange={handleChange}
          >
          </PhoneInput>
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
        {message !== "" && <div className='text-red-700'>{message}</div>}
        <div className='mt-2 rounded-lg'>
          <LoadScript
            className="w-12 mt-6 rounded-lg"
            googleMapsApiKey={process.env.REACT_APP_GMAPS_API_KEY || ""}
          >
            <GoogleMap
              id="mapss-id"
              mapContainerStyle={{
                width: '1000px',
                height: '500px'
              }}
              center={mapsData}
              // eslint-disable-next-line 
              zoom={(mapsData == defaultCenter) ? 4 : 9}
            >
              {
                // eslint-disable-next-line
                (mapsData != defaultCenter) && 
                <Circle
                  center={mapsData}
                  radius={32000}
                  options={circleOptions}
                />
              }
              {
                // eslint-disable-next-line
                (mapsData != defaultCenter && addr) && 
                <InfoWindow
                  position={mapsData}
                >
                  <p>{addr}</p>
                </InfoWindow>
              }
              <></>
            </GoogleMap>
          </LoadScript>
        </div>
      </div>
    </div>
  );
}

export default App;
