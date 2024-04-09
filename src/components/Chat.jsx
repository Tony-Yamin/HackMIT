import React, { useState, useRef, useEffect } from 'react';
import { TextField, Button, IconButton } from '@mui/material';
import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import StopIcon from '@mui/icons-material/Stop';
import { Switch, FormControlLabel } from '@mui/material';
import { AudioRecorder } from 'react-audio-voice-recorder';

const Chat = (props) => {
    const { history, suggestions, setSuggestions, setHistory, inputText, setInputText,
        lastInput, setLastInput, lastTime, setLastTime, userInfo, setUserInfo
        , currentAudio, setCurrentAudio, isUser, setIsUser, setCursorStyle
    } = props;
    const [audioObject, setAudioObject] = useState(null);
    const [currentlyPlaying, setCurrentlyPlaying] = useState(null);  // Track the currently playing audio
    const messagesEndRef = useRef(null);  // Step 1: Create a reference
    const [timerId, setTimerId] = useState(null); // To store the timer ID

    useEffect(() => { // Step 2: Use the useEffect hook
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [history]);

    const relevantSuggestions = async (lastMessage) => {
        let suggestionLength = 4;
        let input = "You are going to assist someone who has speech impediments (by either a non-native English speaker or a person with aphasia/a speech disorder).\n";
        input += "You will be given a conversation between the user and the person they are talking to.\n";
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
        if (history.length > 0) {
            input += "Here are the past messages in the conversation:\n";
            for (let i = 0; i < history.length; i++) {
                if (history[i].isPatient) input += "USER: " + history[i].chosenMessage + "\n";
                else input += "PARTNER: " + history[i].originalMessage + "\n";
            }
            input += "PARTNER: " + lastMessage + "\n";
            input += "Based off what the partner just said, provide " + suggestionLength + " most relevant, different recommendation options for what the USER can respond with. Pretend you are the USER and that you are responding to the partner. Output EXACTLY in this format:\n";
            for (let i = 0; i < suggestionLength; i++) {
                input += "OPTION: <your option here>\n";
            }
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
        const segments = title.split(/OPTION:/).filter(segment => segment.trim() !== '');
        setSuggestions(segments);
    }

    const handleChange = (event) => {
        setInputText(event.target.value);
        if (event.target.value.length === 0 && isUser) {
            setSuggestions(["Hi, how are you doing today?", "Where is the nearest bathroom?", "I'm hungry, where can I get some food?", "What's the weather like today?", "What's your name?", "Where can I find a taxi?"]); // Provide default options
            return;
        }
        setCurrentAudio(null); // set audio to null since they are now typing the input.
        // check if they entered new line
        if (event.target.value.includes('\n') && !isUser) {
            // submit the text
            let newHistory = [...history];
            newHistory.push({
                originalMessage: event.target.value.length === 0 ? '...' : event.target.value, // TODO: this needs to be the text in the input text box (and then it needs to get cleared)
                chosenMessage: event.target.value,
                isPatient: false,
                audio: null,
                audio2: null
            });
            relevantSuggestions(event.target.value);
            setIsUser((prev) => !prev)
            setHistory(newHistory);
            setInputText('');
        }
        if (!isUser) return;

        let refreshDelay = 1000;

        // TODO check toggle if they are a patient or not. Only then. generate suggestions.
        if (timerId) {
            clearTimeout(timerId);
        }

        if (isUser) {
            const newTimerId = setTimeout(() => {
                setLastTime(Date.now());
                generateSuggestions();
            }, refreshDelay + 300);
            setTimerId(newTimerId);
            if (lastTime == 0 || Date.now() - lastTime > refreshDelay) {
                // console.log("*Getting called", Date.now(), lastTime, Date.now() - lastTime);
                clearTimeout(timerId);
                setLastTime(Date.now());
                generateSuggestions();
            }
        }
        else
            setSuggestions(["Hi, how are you doing today?", "Where is the nearest bathroom?", "I'm hungry, where can I get some food?", "What's the weather like today?", "What's your name?", "Where can I find a taxi?"]); // Provide default options
    }

    const chatContainerStyle = {
        position: 'relative', paddingTop: '10px', paddingLeft: '20px', paddingRight: '18px', height: '80%', // Adjust as needed
        overflowY: 'auto',
        /* Custom Scrollbar styles */
        scrollbarWidth: 'thin',
        scrollbarColor: '#888 transparent',  // Thumb color and track color
        '&::-webkit-scrollbar': {
            width: '8px',
        },
        '&::-webkit-scrollbar-track': {
            background: 'transparent',  // Track color
        },
        '&::-webkit-scrollbar-thumb': {
            background: '#888',  // Thumb color
            borderRadius: '4px',
        },
    };
    const handlePlayAudio = (audioFile) => {
        // alert("hi")
        if (audioFile == null) return;
        if (audioObject) {
            audioObject.pause();
            setCurrentlyPlaying(null);
        }
        // alert("Clicked")
        // console.log(history)

        if (currentlyPlaying !== audioFile) {
            // const audio = new Audio(audioFile);
            const audio = audioFile;
            audio.play();

            audio.addEventListener('ended', () => {
                setCurrentlyPlaying(null);
            });

            setAudioObject(audio);
            setCurrentlyPlaying(audioFile);
        }
    };


    const getMessageStyle = (isPatient, isOriginal = false) => ({
        display: 'flex',
        alignItems: 'center',
        textAlign: 'center',
        backgroundColor: isPatient
            ? (isOriginal ? '#e8e6e6' : '#c9efff')
            : '#fcd4b6',
        color: 'black',
        borderRadius: '15px',
        paddingLeft: '10px',
        paddingRight: '10px',
        paddingTop: !isOriginal ? '7px' : '3px',
        paddingBottom: !isOriginal ? '7px' : '3px',
        marginBottom: '20px',
        marginTop: !isOriginal ? '0px' : '-14px',
        // fontSize: !isOriginal ? '17px' : '15px',
        fontStyle: !isOriginal ? '' : 'italic'
    });

    const getMessageContainerStyle = (isPatient) => ({
        display: 'flex',
        flexDirection: 'column',
        alignItems: isPatient ? 'flex-end' : 'flex-start'
    });

    const chatBarStyle = {
        position: 'absolute',
        bottom: '0',
        left: '0',
        width: '100%',
        backgroundColor: '#f0f0f0', // You can change the color
        padding: '10px',
        borderTop: '1px solid #ddd' // You can adjust the border as per your preference
    };

    const examples = [
        // {
        //     originalMessage: 'help. ummm. lost. uhhh. where grocery',
        //     chosenMessage: 'Hello, I\'m lost. Can you help me find the grocery store please?',
        //     audio: null,
        //     audio2: null,
        //     isPatient: true
        // },
    ];

    const generateSuggestions = async () => {
        let suggestionLength = 5;
        let input = "You are going to be given some broken English spoken by either a non-native English speaker or a person with aphasia/a speech disorder.\n";
        input += "Your job is to interpret the meaning of the broken English and acccurately generate a gramatically correct, casual, coherent version of it so that the user can communicate with others. You are supposed to write from first person and pretend you are the user. It is more likely that the user will be asking for assistance/directions.\n";
        if (history.length > 0) {
            input += "Here are past messages that the user has spoken and examples of what they were succesfully corrected to.\n"
            for (let i = 0; i < history.length; i++) {
                if (!history[i].isPatient) {
                    input += "PARTNER: " + history[i].originalMessage + "\n";
                    continue;
                }
                input += "BROKEN ENGLISH: " + history[i].originalMessage + "\n";
                input += "CORRECTED VERSION: " + history[i].chosenMessage + "\n";
            }
            for (let i = 0; i < examples.length; i++) {
                if (!examples[i].isPatient) continue
                input += "BROKEN ENGLISH: " + examples[i].originalMessage + "\n";
                input += "CORRECTED VERSION: " + examples[i].chosenMessage + "\n";
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
        input += "Here is what the user just said: " + inputText + "\n";
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
        if (messagesEndRef.current) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
        const response = await result.json();
        let title = response.choices[0].message.content;
        // let title = "OPTION:Abracadbra bruh.\nOPTION:eejkasldfjkjlsdf\nOPTION: aslkdfjkajsdfkljal ksdfja lskdjf aksdjf:\nOPTION: 233223";
        const segments = title.split(/OPTION:/).filter(segment => segment.trim() !== '');
        setSuggestions(segments);
    }
    const generateSuggestions2 = async (text) => {
        let suggestionLength = 5;

        let input = "You are going to be given some broken English spoken by either a non-native English speaker or a person with aphasia/a speech disorder.\n";
        input += "Your job is to interpret the meaning of the broken English and acccurately generate a gramatically correct, casual, coherent version of it so that the user can communicate with others. You are supposed to write from first person and pretend you are the user. It is more likely that the user will be asking for assistance/directions.\n";
        if (history.length > 0) {
            input += "Here are past messages that the user's partner has spoken and the user has spoken and examples of what they were succesfully corrected to.\n"
            for (let i = 0; i < history.length; i++) {
                if (!history[i].isPatient) {
                    input += "PARTNER: " + history[i].originalMessage + "\n";
                    continue;
                }
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
        input += "Here is what the user just said: " + text + "\n";
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
        if (messagesEndRef.current) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
        const response = await result.json();
        let title = response.choices[0].message.content;
        // let title = "OPTION:Abracadbra bruh.\nOPTION:eejkasldfjkjlsdf\nOPTION: aslkdfjkajsdfkljal ksdfja lskdjf aksdjf:\nOPTION: 233223";
        const segments = title.split(/OPTION:/).filter(segment => segment.trim() !== '');
        setSuggestions(segments);
    }

    const dealWithRecording = async (audio) => {
        setCurrentAudio(audio);
        const audioBlob = await fetch(audio.src).then((response) => response.blob());

        // Create a FormData object and append the Blob
        // const formData = new FormData();
        // formData.append('mp3File', audioBlob);

        // Create a FormData object and append the Blob and other form data
        const formData = new FormData();
        formData.append('file', audioBlob, 'audio.mp3');
        formData.append('model', 'whisper-1');
        formData.append('response_format', 'json');
        const API_KEY = process.env.REACT_APP_OPEN_AI;

        try {
            // Call the OpenAI Whisper API to transcribe the audio
            const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API_KEY}`
                },
                body: formData
            });

            if (!response.ok) {
                console.error('Response error:', response);
                return;
            }

            const data = await response.json();
            // console.log(data); // Here, handle the response as per your need

            const trans = data.text

            if (isUser) {
                generateSuggestions2(trans);
                setInputText(trans);
                setCursorStyle('default')
            } else {
                setInputText("");
                let newHistory = [...history];
                setCursorStyle('default')
                newHistory.push({
                    originalMessage: trans,
                    chosenMessage: '',
                    isPatient: false,
                    audio: audio,
                    audio2: null
                });
                setIsUser((prev) => !prev)
                setHistory(newHistory);
                relevantSuggestions(trans);
            }

        } catch (error) {
            console.error('Error during fetch operation:', error);
        }


        // transcribeAudio(audioBlob);

        // Make the API call to your Flask backend
        // fetch('http://localhost:8000/api/getTranscript', {
        //     method: 'POST',
        //     body: formData,
        // })
        //     .then(response => response.json())
        //     .then(data => {
        //         // Handle the response from Flask (transcribed text)
        //         const trans = data.message.results[0].alternatives[0].transcript;
        //         // console.log(trans);
        //         if (isUser) {
        //             generateSuggestions2(trans);
        //             setInputText(trans);
        //             setCursorStyle('default')
        //         } else {
        //             setInputText("");
        //             let newHistory = [...history];
        //             setCursorStyle('default')
        //             newHistory.push({
        //                 originalMessage: trans,
        //                 chosenMessage: '',
        //                 isPatient: false,
        //                 audio: audio,
        //                 audio2: null
        //             });
        //             setIsUser((prev) => !prev)
        //             setHistory(newHistory);
        //             relevantSuggestions(trans);
        //         }
        //         // You can display the transcribed text in your React component as needed
        //     })
        //     .catch(error => {
        //         console.error('Error:', error);
        //     });
    }
    const addAudioElement = (blob) => {
        const url = URL.createObjectURL(blob);
        setInputText("");
        setCursorStyle('wait')
        const audio = document.createElement("audio");
        audio.src = url;
        audio.controls = true;
        // document.body.appendChild(audio);
        dealWithRecording(audio);

    };

    // You would typically call this function when a user clicks a button, for example
    async function transcribeAudio(audioFile) {
        const url = "https://api.openai.com/v1/audio/transcriptions";

        const formData = new FormData();
        // Replace `audioFile` with the actual variable holding your audio file
        formData.append("file", audioFile);
        formData.append("model", "whisper-1");

        console.log("**HERE")
        const API_KEY = process.env.REACT_APP_OPEN_AI;

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Authorization": "Bearer" + API_KEY
                },
                body: formData // Attaching formData as the body
            });

            if (!response.ok) {
                // Handle non-OK response
                console.error('Response error:', response);
                return;
            }

            const data = await response.json();
            console.log("**DATA", data); // Log the response data for now, you can handle it as needed

        } catch (error) {
            console.error('Error during fetch operation:', error);
        }
    }


    const handleSwitchChange = () => {
        if (isUser) {
            setSuggestions(["Hi, how are you doing today?", "Where is the nearest bathroom?", "I'm hungry, where can I get some food?", "What's the weather like today?", "What's your name?", "Where can I find a taxi?"]); // Provide default options
        }
        setIsUser((prev) => !prev); // Toggle the state

    };


    return (
        <>
            <div style={chatContainerStyle}>
                {history.map((message, index) => (
                    <div key={index} style={getMessageContainerStyle(message.isPatient)}>
                        <div style={getMessageStyle(message.isPatient)}>
                            {/* Play icon for top message (corrected message) */}
                            {message.isPatient && message.audio != null && (
                                <button onClick={() => handlePlayAudio(message.audio2)} style={{
                                    background: 'none', border: 'none', padding: 0, marginRight: '10px', cursor: 'pointer'
                                }}>
                                    {currentlyPlaying === message.audio2 && message.audio2 !== null ? (
                                        <StopIcon style={{ marginTop: '3px' }} />
                                    ) : (
                                        <PlayCircleIcon style={{ marginTop: '3px' }} />
                                    )}
                                </button>
                            )}
                            {!message.isPatient && message.audio !== null && (
                                <button onClick={() => handlePlayAudio(message.audio)} style={{
                                    background: 'none', border: 'none', padding: 0, marginRight: '10px', cursor: 'pointer'
                                }}>
                                    {currentlyPlaying === message.audio && message.audio !== null ? (
                                        <StopIcon style={{ marginTop: '3px' }} />
                                    ) : (
                                        <PlayCircleIcon style={{ marginTop: '3px' }} />
                                    )}
                                </button>
                            )}
                            {/* top message */}
                            {message.isPatient ? message.chosenMessage : message.originalMessage}
                        </div>
                        {message.isPatient && message.originalMessage != "..." && (
                            <div style={getMessageStyle(message.isPatient, true)}>
                                {message.audio !== null && (<button onClick={() => handlePlayAudio(message.audio)} style={{
                                    background: 'none', border: 'none', padding: 0, marginRight: '10px', cursor: 'pointer'
                                }}>
                                    {currentlyPlaying === message.audio && message.audio !== null ? (
                                        <StopIcon style={{ marginTop: '3px' }} />
                                    ) : (
                                        <PlayCircleIcon style={{ marginTop: '3px' }} />
                                    )}
                                    {/* <PlayCircleIcon style={{ marginTop: '3px' }} /> */}
                                    {/* <img src={PlayCircleIcon} alt="Play" style={{ height: '14px', width: '14px' }} /> */}
                                </button>)}
                                {message.originalMessage}
                            </div>
                        )}
                    </div>
                ))}
                <div ref={messagesEndRef}></div>  {/* Add this line to mark the end of the chat messages */}

            </div>
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginTop: 'auto',
                width: '48%',
                height: '10%',
                position: 'absolute',
                bottom: '0',
                left: '0',
                // backgroundColor: '#f0f0f0', // You can change the color
                marginLeft: '10px',
                marginBottom: '-10px',
                borderTop: '1px solid #ddd' // You can adjust the border as per your preference
            }}>
                <FormControlLabel
                    style={{ marginLeft: '-2px', marginRight: '6px' }}
                    control={
                        <Switch
                            checked={isUser}
                            onChange={handleSwitchChange}
                            name="isRecording"
                            // color="secondary"
                            sx={{
                                "&.MuiSwitch-root .MuiSwitch-switchBase": {
                                    color: "#ffb278",
                                },

                                "&.MuiSwitch-root .Mui-checked": {
                                    color: "#5797ff",
                                },

                            }}
                        />
                    }
                />
                {/* <KeyboardVoiceIcon
                    style={{
                        marginLeft: '-10px', marginRight: '10px', padding: '10px', color: '#bf7821',
                        background: '#fff7e6', borderRadius: '50%', border: '1px solid #fae4c8',
                        cursor: 'pointer'
                    }}
                    onClick={recordAudio}
                /> */}
                <AudioRecorder
                    onRecordingComplete={addAudioElement}
                    audioTrackConstraints={{
                        noiseSuppression: true,
                        echoCancellation: true,
                    }}
                // downloadOnSavePress={true}
                // downloadFileExtension="mp3"
                />
                <TextField
                    multiline
                    rowsMax={4}
                    // rows={1}
                    type="text"
                    value={inputText}
                    size='small'
                    onChange={handleChange}
                    placeholder="Type message: (example: 'food where')"
                    style={{ marginLeft: '14px', marginRight: '10px', width: '90%', marginTop: '3px', borderRadius: '6px' }}
                />
            </div>
        </>
    );

    // return (
    //     <div className="side">
    //         <p style={{ marginTop: '10px' }}></p>
    //         {loadMessages()}
    //         {/* <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '5px', marginBottom: '10px', width: '100%' }}> */}
    //         <KeyboardVoiceIcon
    //             style={{
    //                 marginLeft: '10px', marginRight: '10px', padding: '10px', color: '#bf7821',
    //                 background: '#fff7e6', borderRadius: '50%', border: '1px solid #fae4c8',
    //                 cursor: 'pointer'
    //             }}
    //         />
    //         <TextField
    //             multiline
    //             rowsMax={4}
    //             rows={1}
    //             type="text"
    //             value={inputText}
    //             size='small'
    //             onChange={handleChange}
    //             placeholder="Type message: (example: 'food where')"
    //             style={{ marginRight: '10px', width: '90%', marginTop: '3px', borderRadius: '6px' }}
    //         />
    //         {/* </div> */}
    //     </div>
    // );
    // return (
    //     <div className="side">
    //         <h2>Left Div</h2>
    //         {/* Write your code here to do conditional rendering of chat messages
    //             I recommend having a state variable called history that is an array of objects
    //             object structure:
    //                original message: 
    //                chosen message:
    //                audio file:
    //                isPatient (boolean)
    //             if isPatient is false, then only original message matters

    //             then do conditional rendering where you loop over the objects in the array
    //             if isPatient is true, make the stuff right-aligned and a particular style (like grey bubbles)
    //             otherwise make it left aligned and blue bubbles. stuff like that.
    //             process.env.REACT_APP_OPEN_AI is the API key
    //         */}
    //     </div>
    // );
};

export default Chat;