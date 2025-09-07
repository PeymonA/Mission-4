import React, { useState } from 'react';
import '../App.css'

function MyTextInput(props) {
    const [inputValue, setInputValue] = useState(''); // Initialize state for the input value

    const handleChange = (event) => {
        setInputValue(event.target.value); // Update state on input change
    };
    const handleClick = () => {
        props.setTextValue(inputValue);
        props.setOnUse(true);
    };
    return (
    <div>
        <input
            type="text"
            value={inputValue} // Bind the input's value to the state
            onChange={handleChange} // Handle changes with the handleChange function
            placeholder="Enter text here..."
        />
        <button onClick={handleClick}>
            Send
        </button>
    </div>
    );
}

export default MyTextInput;