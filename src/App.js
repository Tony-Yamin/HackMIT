import React, { useState } from 'react';
import './App.css';
import Chat from './components/Chat'
import Completions from './components/Completions'
import logo from './Tran.png'; // Adjust the path to where your image is located
import myFont from './fonts/TitilliumWeb-Regular.ttf';
import SettingsIcon from '@mui/icons-material/Settings';
import { TextField, IconButton } from '@mui/material';
import { Autocomplete } from '@mui/material';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';


/* 
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  authDomain: "tran-70002.firebaseapp.com",
  projectId: "tran-70002",
  storageBucket: "tran-70002.appspot.com",
  messagingSenderId: "296236382713",
  appId: "1:296236382713:web:bb134c52c645e2246da528",
  measurementId: "G-3XLZ5NTZ7H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

*/

const App = () => {
  const [suggestions, setSuggestions] = useState(["Hi, how are you doing today?", "Where is the nearest bathroom?", "I'm hungry, where can I get some food?", "What's the weather like today?", "What's your name?", "Where can I find a taxi?"]);
  const [inputText, setInputText] = useState("");
  const [lastInput, setLastInput] = useState("");
  const [name, setName] = useState("");
  const [tone, setTone] = useState("Casual");
  const [lastTime, setLastTime] = useState(0);
  const [cursorStyle, setCursorStyle] = useState('default')
  const [currentAudio, setCurrentAudio] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({});
  const [selectedOption, setSelectedOption] = useState('Aphasia')
  const [selectedCountry, setSelectedCountry] = useState("United States of America");
  const [isUser, setIsUser] = useState(true);

  

  const countries = [
    "Afghanistan",
    "Albania",
    "Algeria",
    "American Samoa",
    "Andorra",
    "Angola",
    "Anguilla",
    "Antarctica",
    "Antigua and Barbuda",
    "Argentina",
    "Armenia",
    "Aruba",
    "Australia",
    "Austria",
    "Azerbaijan",
    "Bahamas",
    "Bahrain",
    "Bangladesh",
    "Barbados",
    "Belarus",
    "Belgium",
    "Belize",
    "Benin",
    "Bermuda",
    "Bhutan",
    "Bolivia (Plurinational State of)",
    "Bonaire, Sint Eustatius and Saba",
    "Bosnia and Herzegovina",
    "Botswana",
    "Bouvet Island",
    "Brazil",
    "British Indian Ocean Territory",
    "Brunei Darussalam",
    "Bulgaria",
    "Burkina Faso",
    "Burundi",
    "Cabo Verde",
    "Cambodia",
    "Cameroon",
    "Canada",
    "Cayman Islands",
    "Central African Republic",
    "Chad",
    "Chile",
    "China",
    "Christmas Island",
    "Cocos (Keeling) Islands",
    "Colombia",
    "Comoros",
    "Congo (the Democratic Republic of the)",
    "Congo",
    "Cook Islands",
    "Costa Rica",
    "Croatia",
    "Cuba",
    "Curaçao",
    "Cyprus",
    "Czechia",
    "Côte d'Ivoire",
    "Denmark",
    "Djibouti",
    "Dominica",
    "Dominican Republic",
    "Ecuador",
    "Egypt",
    "El Salvador",
    "Equatorial Guinea",
    "Eritrea",
    "Estonia",
    "Eswatini",
    "Ethiopia",
    "Falkland Islands [Malvinas]",
    "Faroe Islands",
    "Fiji",
    "Finland",
    "France",
    "French Guiana",
    "French Polynesia",
    "French Southern Territories",
    "Gabon",
    "Gambia",
    "Georgia",
    "Germany",
    "Ghana",
    "Gibraltar",
    "Greece",
    "Greenland",
    "Grenada",
    "Guadeloupe",
    "Guam",
    "Guatemala",
    "Guernsey",
    "Guinea",
    "Guinea-Bissau",
    "Guyana",
    "Haiti",
    "Heard Island and McDonald Islands",
    "Holy See",
    "Honduras",
    "Hong Kong",
    "Hungary",
    "Iceland",
    "India",
    "Indonesia",
    "Iran (Islamic Republic of)",
    "Iraq",
    "Ireland",
    "Isle of Man",
    "Israel",
    "Italy",
    "Jamaica",
    "Japan",
    "Jersey",
    "Jordan",
    "Kazakhstan",
    "Kenya",
    "Kiribati",
    "Korea (the Democratic People's Republic of)",
    "Korea (the Republic of)",
    "Kuwait",
    "Kyrgyzstan",
    "Lao People's Democratic Republic",
    "Latvia",
    "Lebanon",
    "Lesotho",
    "Liberia",
    "Libya",
    "Liechtenstein",
    "Lithuania",
    "Luxembourg",
    "Macao",
    "Madagascar",
    "Malawi",
    "Malaysia",
    "Maldives",
    "Mali",
    "Malta",
    "Marshall Islands",
    "Martinique",
    "Mauritania",
    "Mauritius",
    "Mayotte",
    "Mexico",
    "Micronesia (Federated States of)",
    "Moldova (the Republic of)",
    "Monaco",
    "Mongolia",
    "Montenegro",
    "Montserrat",
    "Morocco",
    "Mozambique",
    "Myanmar",
    "Namibia",
    "Nauru",
    "Nepal",
    "Netherlands",
    "New Caledonia",
    "New Zealand",
    "Nicaragua",
    "Niger",
    "Nigeria",
    "Niue",
    "Norfolk Island",
    "Northern Mariana Islands",
    "Norway",
    "Oman",
    "Pakistan",
    "Palau",
    "Palestine, State of",
    "Panama",
    "Papua New Guinea",
    "Paraguay",
    "Peru",
    "Philippines",
    "Pitcairn",
    "Poland",
    "Portugal",
    "Puerto Rico",
    "Qatar",
    "Republic of North Macedonia",
    "Romania",
    "Russian Federation",
    "Rwanda",
    "Réunion",
    "Saint Barthélemy",
    "Saint Helena, Ascension and Tristan da Cunha",
    "Saint Kitts and Nevis",
    "Saint Lucia",
    "Saint Martin (French part)",
    "Saint Pierre and Miquelon",
    "Saint Vincent and the Grenadines",
    "Samoa",
    "San Marino",
    "Sao Tome and Principe",
    "Saudi Arabia",
    "Senegal",
    "Serbia",
    "Seychelles",
    "Sierra Leone",
    "Singapore",
    "Sint Maarten (Dutch part)",
    "Slovakia",
    "Slovenia",
    "Solomon Islands",
    "Somalia",
    "South Africa",
    "South Georgia and the South Sandwich Islands",
    "South Sudan",
    "Spain",
    "Sri Lanka",
    "Sudan",
    "Suriname",
    "Svalbard and Jan Mayen",
    "Sweden",
    "Switzerland",
    "Syrian Arab Republic",
    "Taiwan",
    "Tajikistan",
    "Tanzania, United Republic of",
    "Thailand",
    "Timor-Leste",
    "Togo",
    "Tokelau",
    "Tonga",
    "Trinidad and Tobago",
    "Tunisia",
    "Turkey",
    "Turkmenistan",
    "Turks and Caicos Islands",
    "Tuvalu",
    "Uganda",
    "Ukraine",
    "United Arab Emirates",
    "United Kingdom of Great Britain and Northern Ireland",
    "United States Minor Outlying Islands",
    "United States of America",
    "Uruguay",
    "Uzbekistan",
    "Vanuatu",
    "Venezuela (Bolivarian Republic of)",
    "Viet Nam",
    "Virgin Islands (British)",
    "Virgin Islands (U.S.)",
    "Wallis and Futuna",
    "Western Sahara",
    "Yemen",
    "Zambia",
    "Zimbabwe",
    "Åland Islands"
  ];

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    let newInfo = {}
    if (name !== "") {
      newInfo.name = name;
    }
    if (tone !== "") {
      newInfo.tone = tone;
    }
    if (selectedOption !== "") {
      newInfo.condition = selectedOption;
    }
    if (selectedCountry !== "") {
      newInfo.country = selectedCountry;
    }
    setUserInfo(newInfo);
    setIsDialogOpen(false);
  };

  const [history, setHistory] = useState([
    {
      originalMessage: 'ummmm. how to say. food. uhhh. you want?',
      chosenMessage: 'Hello, do you want food?',
      audio: null,
      audio2: null,
      isPatient: true
    },
    {
      originalMessage: 'hi. ummmm. uhhhh. bathroom uh where?',
      chosenMessage: 'Hello, where may I find the bathroom?',
      audio: null,
      audio2: null,
      isPatient: true
    },
    {
      originalMessage: 'Yes, down the hall.',
      chosenMessage: 'Hello, where may I find the bathroom?',
      audio: null,
      audio2: null,
      isPatient: false
    },
    {
      originalMessage: 'uhhhh. time. ummmm. how to say? uhh watch. time. ',
      chosenMessage: 'Do you know what time it is?',
      audio: null,
      audio2: null,
      isPatient: true
    },

  ]);

  const appStyle = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    cursor: cursorStyle,
  };

  const headerStyle = {
    // background: 'linear-gradient(to right, #fff0d9, #b5dfff)',
    background: 'linear-gradient(to left, #edd6ff, #b5dfff)',
    textAlign: 'center',
    padding: '10px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height:'40px'
  };
  /*  */

  const contentStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    height: '92vh',
  };

  const sideStyle = {
    flex: 1,
    padding: '10px',
    border: '1px solid #ccc', // Optional: Add a border for separation
  };

  const handleChange = (event) => {
    setName(event.target.value)
    let info = { ...userInfo };
    info.name = event.target.value;
    setUserInfo(info);
  }
  const handleToneChange = (event) => {
    setTone(event.target.value)
    let info = { ...userInfo };
    info.tone = event.target.value;
    // console.log(info)
    setUserInfo(info);
  }
  const handleDropdownChange = (event) => {
    setSelectedOption(event.target.value);
    let info = { ...userInfo };
    info.condition = event.target.value;
    setUserInfo(info);
  };
  const handleSelect = (event, value) => {
    setSelectedCountry(value);
    let info = { ...userInfo };
    info.country = event.target.value;
    setUserInfo(info);
  };


  return (
    <div style={appStyle}>
      <div style={headerStyle}>
        <p style={{ fontSize: '18px', fontFamily: myFont, marginLeft: '20px', paddingTop: '8px', paddingBottom: '-10px' }}><i><b>Tran</b></i></p>
        <SettingsIcon style={{ alignSelf: 'flex-end', marginBottom: '3px' }} onClick={handleOpenDialog} />
      </div>
      <Dialog open={isDialogOpen} onClose={handleCloseDialog} >
        <DialogTitle>Settings</DialogTitle>
        <DialogContent style={{ width: '300px' }}>
          {/* Add your settings content here */}
          <TextField
            rowsMax={1}
            // rows={1}
            type="text"
            value={name}
            size='small'
            onChange={handleChange}
            placeholder="What's your name?"
            style={{ marginRight: '10px', width: '90%', marginTop: '3px', borderRadius: '6px' }}
          />
          <FormControl style={{ marginTop: '30px' }}>
            <InputLabel id="dropdown-label">Condition</InputLabel>
            <Select
              labelId="dropdown-label"
              id="dropdown"
              label="Condition"
              value={selectedOption}
              size="small"
              onChange={handleDropdownChange}
            >
              <MenuItem value="Aphasia">Aphasia</MenuItem>
              <MenuItem value="Non-native English speaker">Non-native English speaker</MenuItem>
              <MenuItem value="Dementia">Dementia</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>
          <br></br>
          <FormControl style={{ marginTop: '30px' }} >
            <InputLabel id="dropdown-label"> Tone</InputLabel>
            <Select
              labelId="dropdown-label"
              id="dropdown"
              value={tone}
              size="small"
              label="Tone"
              onChange={handleToneChange}
            >
              <MenuItem value="Casual">Casual</MenuItem>
              <MenuItem value="Funny">Funny</MenuItem>
              <MenuItem value="Formal">Formal</MenuItem>
              <MenuItem value="Rizz">Rizz</MenuItem>
              <MenuItem value="Needing Assistance">Needing Assistance</MenuItem>
            </Select>
          </FormControl>

          <Autocomplete
            style={{ marginTop: '30px' }}
            id="country-autocomplete"
            size="small"
            options={countries}
            getOptionLabel={(option) => option} // Maps the option to its label
            renderInput={(params) => <TextField {...params} variant="outlined" />}
            value={selectedCountry}
            onChange={handleSelect} // Handle the selection
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <div style={contentStyle}>
        <div style={sideStyle}>
          <Chat
            history={history}
            suggestions={suggestions}
            setSuggestions={setSuggestions}
            setHistory={setHistory}
            inputText={inputText}
            setInputText={setInputText}
            lastInput={lastInput}
            setLastInput={setLastInput}
            lastTime={lastTime}
            setLastTime={setLastTime}
            userInfo={userInfo}
            setUserInfo={setUserInfo}
            currentAudio={currentAudio}
            setCurrentAudio={setCurrentAudio}
            isUser={isUser}
            setCursorStyle={setCursorStyle}
            setIsUser={setIsUser}
          />
        </div>
        <div style={sideStyle}>
          <Completions
            history={history}
            suggestions={suggestions}
            setSuggestions={setSuggestions}
            setHistory={setHistory}
            inputText={inputText}
            setInputText={setInputText}
            lastInput={lastInput}
            userInfo={userInfo}
            setLastInput={setLastInput}
            lastTime={lastTime}
            setLastTime={setLastTime}
            setCursorStyle={setCursorStyle}
            currentAudio={currentAudio}
            setCurrentAudio={setCurrentAudio}
            isUser={isUser}
            setIsUser={setIsUser}
          />
          {/* <img className="logo" src={logo} alt="Logo" /> */}
        </div>
      </div>
    </div>
  );
};

export default App;
