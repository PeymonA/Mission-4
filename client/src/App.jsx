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

  useEffect(() => {
    if (!onUse) return;
    setOnUse(false);
    const prompt = {
      content: `Here is the chat history so far: ${chatHistory.toString()}
      The user just answered: ${textValue} give your next reply`
    };
    setChatHistory(prevChatHistory => [...prevChatHistory, textValue]);
    const fetchData = async () => {
      const response = await fetch("http://localhost:80/", {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ input: prompt })
      });
      const data = await response.json();
      console.log(data);
      setChatHistory(prevChatHistory => [...prevChatHistory, "Model: " + data.output]);
    }
    fetchData();
  }, [onUse]);

  return (
    <>
      <div className='section'>
        <h1>Tina</h1>
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
