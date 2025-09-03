import React, { useState, useEffect } from 'react';
import './App.css'

import MyTextInput from './components/TextInput.jsx'
import ChatLog from './components/ChatLog.jsx'

function App() {
  //Text Input from user
  const [textValue, setTextValue] = useState('');
  const [onUse, setOnUse] = useState(false);

  //Data
  const [chatHistory, setChatHistory] = useState([]);
  const [originalPrompt, setOriginalPrompt] = useState("");

  useEffect(() => {
    if (!onUse) return;
    setOnUse(false);
    const prompt = {
      content: `Here is the chat history so far: ${originalPrompt} ${chatHistory.toString()}
      The user just answered: ${textValue} give your next reply`
    };
    setChatHistory(prevChatHistory => [...prevChatHistory, textValue]);
    const fetchData = () => {
      const data = { output: "Hello World!"}
      setChatHistory(prevChatHistory => [...prevChatHistory, "Model :" + JSON.stringify(data.output)]);
    }
    fetchData();
  }, [onUse]);

  return (
    <>
      <div className='section'>
        <h1>AI Mock Interviewer Text</h1>
        <div className='sectionChild'>
          <ChatLog chat={chatHistory} />
        </div>
        <div className='sectionChild'>
          <MyTextInput setTextValue={setTextValue} setOnUse={setOnUse} />
        </div>
      </div>
    </>
  )
}

export default App
