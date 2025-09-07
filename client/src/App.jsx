import React, { useState, useEffect } from 'react';
import './App.css'

import MyTextInput from './components/TextInput.jsx'
import ChatLog from './components/ChatLog.jsx'
import SimpleRecordButton from './components/RecordButton.jsx';

function App() {
  //Text Input from user
  const [textValue, setTextValue] = useState('');
  const [onUse, setOnUse] = useState(false);

  const firstMessage = "I’m Tina. I help you to choose right insurance policy. May I ask you a few personal questions to make sure I recommend the best policy for you?";
  //Data
  const [chatHistory, setChatHistory] = useState(["Model: " + firstMessage]);

  useEffect(() => {
    if (!onUse) return;
    setOnUse(false);
    const prompt = {
      content: `Here is the chat history so far: ${chatHistory.toString()}
      The user just answered: ${textValue} give your next reply`
    };
    setChatHistory(prevChatHistory => [...prevChatHistory, "User: " + textValue]);
    const fetchData = async () => {
      const response = await fetch("http://localhost:3000/", {
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
      <div className="chatBot">
        <header>
          <h2>Tina</h2>
        </header>
        <ChatLog chat={chatHistory} />
        <div className='chat-parent'>
          <div className="chat-input">
            <MyTextInput setTextValue={setTextValue} setOnUse={setOnUse} />
          </div>
          <div> 
            <SimpleRecordButton />
          </div>
        </div>
      </div>
    </>
  )
}

export default App
