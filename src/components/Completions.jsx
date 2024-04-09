import React, { useState } from 'react';
import axios from 'axios';
import RefreshIcon from '@mui/icons-material/Refresh';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRedo } from '@fortawesome/free-solid-svg-icons';


const Chat = (props) => {
    const { history, suggestions, setSuggestions, setHistory, userInfo, inputText, setInputText, setCursorStyle, currentAudio, setCurrentAudio, isUser, setIsUser } = props;

    const handleDivClick = (index) => {
        if (!isUser) return;
        setSuggestions(["Hi, how are you doing today?", "Where is the nearest bathroom?", "I'm hungry, where can I get some food?", "What's the weather like today?", "What's your name?", "Where can I find a taxi?"]); // Provide default options
        const text = suggestions[index];
        // Add the suggestion to history
        let newHistory = [...history];
        newHistory.push({
            originalMessage: inputText.length === 0 ? '...' : inputText, // TODO: this needs to be the text in the input text box (and then it needs to get cleared)
            chosenMessage: text,
            isPatient: isUser,
            audio: currentAudio,
            audio2: null
        });
        setCurrentAudio(null);

        setInputText('');
        setIsUser((prev) => !prev)
        setHistory(newHistory);
        // TODO: make call to ElevenLabs to generate the audio.
        textToSpeech(text).then(async (data) => {
            // if (this.ref.current) {
            // this.ref.current.scrollTop = this.ref.current.scrollHeight;
            // }
            const audio = new Audio(URL.createObjectURL(new Blob([data], { type: 'audio/mpeg' })));
            const audioBlob = await fetch(audio.src).then((response) => response.blob());

            // Create a FormData object and append the Blob
            const formData = new FormData();
            formData.append('mp3File', audioBlob);

            // Make the API call to your Flask backend
            fetch('http://localhost:8000/api/getTranscript', {
                method: 'POST',
                body: formData,
            })
                .then(response => response.json())
                .then(data => {
                    // Handle the response from Flask (transcribed text)
                    // console.log("****", data)
                    // console.log(data.message.results[0].alternatives[0].transcript);
                    setInputText(data.message.results[0].alternatives[0].transcript);
                    generateSuggestions();
                    // You can display the transcribed text in your React component as needed
                })
                .catch(error => {
                    console.error('Error:', error);
                });

            audio.playbackRate = 1
            audio.play();

            // save the audio
            newHistory[newHistory.length - 1].audio2 = audio;
            setHistory(newHistory);
            // console.log("saved the audio to index " + (newHistory.length - 1));
            // console.log(newHistory)

        });
    };

    const textToSpeech = async (inputText) => {
        // Set the API key for ElevenLabs API. 
        // Do not use directly. Use environment variables.
        const API_KEY = process.env.REACT_APP_ELEVEN_LABS
        // Set the ID of the voice to be used.
        const VOICE_ID = process.env.REACT_APP_VOICE_ID

        // Set options for the API request.
        const options = {
            method: 'POST',
            url: `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
            headers: {
                accept: 'audio/mpeg', // Set the expected response type to audio/mpeg.
                'content-type': 'application/json', // Set the content type to application/json.
                'xi-api-key': `${API_KEY}`, // Set the API key in the headers.
            },
            data: {
                text: inputText, // Pass in the inputText as the text to be converted to speech.
                // model_id: "eleven_multilingual_v1",
                stability: 0.41,
                similarity_boost: 0.85, // Set the similarity boost to 0.5.
            },
            responseType: 'arraybuffer', // Set the responseType to arraybuffer to receive binary data as response.
        };

        // Send the API request using Axios and wait for the response.
        const speechDetails = await axios.request(options);

        // Return the binary audio data received from the API response.
        return speechDetails.data;
    };



    const generateSuggestions = async () => {
        let suggestionLength = 5;
        let input = "You are going to be given some broken English spoken by either a non-native English speaker or a person with aphasia/a speech disorder.\n";
        input += "Your job is to interpret the meaning of the broken English and acccurately generate a gramatically correct, casual, coherent version of it so that the user can communicate with others. You are supposed to write from first person and pretend you are the user. It is more likely that the user will be asking for assistance/directions.\n";
        if (history.length > 0) {
            input += "Here are past messages that the user has spoken and examples of what they were succesfully corrected to.\n"
            for (let i = 0; i < history.length; i++) {
                if (!history[i].isPatient) continue
                input += "BROKEN ENGLISH: " + history[i].originalMessage + "\n";
                input += "CORRECTED VERSION: " + history[i].chosenMessage + "\n";
            }
            input += "Learn from those examples.\n";
        }
        if (Object.keys(userInfo).length > 0) {
            input += "For context, here is info about the user:";
            if (userInfo.name)
                input += " Name is " + userInfo.name;
            if (userInfo.condition)
                input += ". Speech impairment is due to " + userInfo.condition;
            if (userInfo.country)
                input += ". Country of origin is: " + userInfo.country
            if (userInfo.tone)
                input += ". Desired tone of voice is: " + userInfo.tone
            if (userInfo.tone && userInfo.tone === 'Funny')
                input += "Be super funny and chill.";
            if (userInfo.tone && userInfo.tone === 'Rizz')
                input += "Rizz is when you're trying to impress a girl by being charismatic";
            input += "\n";
        }
        input += "Here is what the person just said: " + inputText + "\n";
        input += "Now generate " + suggestionLength + " most relevant, different versions of what the person could be trying to say. Output EXACTLY in this format:\n"
        for (let i = 0; i < suggestionLength; i++) {
            input += "OPTION: <your option here>\n";
        }
        if (!history[history.length - 1].isPatient) {
            input += "For additional context. Here is the last thing that the person's conversation partner said: " + history[history.length - 1].originalMessage + "\n";
        }
        const API_URL = "https://api.openai.com/v1/chat/completions";
        const API_KEY = process.env.REACT_APP_OPEN_AI;

        const messages = []
        const initial = {
            role: 'user', content: input
        };
        messages.push(initial);

        const result = await fetch(API_URL, {
            method: "POST",
            headers: {
                Accept: 'application/json',
                "Content-Type": "application/json",
                Authorization: `Bearer ${API_KEY}`,
            },
            body: JSON.stringify({
                // model: "gpt-4",
                model: "gpt-3.5-turbo",
                messages: messages,
            }),
        });
        const response = await result.json();
        let title = response.choices[0].message.content;
        // let title = "OPTION:Abracadbra bruh.\nOPTION:eejkasldfjkjlsdf\nOPTION: aslkdfjkajsdfkljal ksdfja lskdjf aksdjf:\nOPTION: 233223";
        const segments = title.split(/OPTION:/).filter(segment => segment.trim() !== '');
        setSuggestions(segments);
        setCursorStyle('default')
    }
    const suggestionsRefresh = () => {
        setCursorStyle('wait')
        generateSuggestions();
    }


    const renderSuggestions = () => {
        // Implement your logic to render suggestions here
        // You can return an array of JSX elements
        return suggestions.map((suggestion, index) => (
            <div key={index} style={{
                display: 'flex', justifyContent: 'center',
                alignItems: 'center'
            }}>
                <div
                    style={{
                        display: 'inline-block',
                        padding: '18px',
                        borderRadius: '14px',
                        backgroundColor: 'rgba(200, 200, 200, 0.2)',
                        color: '#222',
                        fontSize: '19px',
                        cursor: 'pointer',
                        marginTop: '27px'
                    }}
                    onClick={() => handleDivClick(index)}
                >
                    {suggestion}
                </div>
            </div>
            // <div key={index} style={{
            //     display: 'flex',
            //     justifyContent: 'flex-start', // align text to the left
            //     alignItems: 'center',
            //     padding: '10px 15px', // reduce horizontal padding to make it less wide
            //     borderRadius: '30px',
            //     backgroundColor: 'rgba(178, 224, 224, 0.8)',
            //     color: '#222',
            //     marginTop: '30px',
            //     marginBottom: '30px',
            //     marginLeft: '20px',
            //     marginRight: '25px',
            //     fontSize: '22px',
            //     cursor: 'pointer'
            // }}
            //     onClick={() => handleDivClick(index)} // Pass the index to handleDivClick
            // >
            //     {suggestion}
            // </div>

        ));
    };
    return (
        <div>
            <div className="side2header">Suggested Responses:</div>
            {renderSuggestions()}
            <div className="refresh-button-container">
                <div className="refresh-button-title" style={{ marginLeft: '15px' }}><i>Not what you're looking for?</i></div>
                <div className="refresh-button-side-text" onClick={suggestionsRefresh}>Regenerate suggestions</div>
                <button className="refresh-button" onClick={suggestionsRefresh}>
                    <FontAwesomeIcon icon={faRedo} />
                </button>
            </div>
        </div>
    );
};

export default Chat;