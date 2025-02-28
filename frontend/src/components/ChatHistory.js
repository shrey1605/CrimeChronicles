import React, { useEffect, useState } from 'react';
import '../styles/ChatHistory.css';


function ChatHistory() {
    useEffect(() => {
      fetchHistory();
    },[])

    const fetchHistory = () => {
      fetch('http://localhost:5100/history?user_email=finaldemo@gmail.com&page_no='+offset)
      .then(res => res.json())
      .then(response =>  {
        if(response.length === 0){
          setEnd(true);
        }
        setOffset(offset + response?.length);
        setMessages(messages.concat(response));
      });
    }
    const [offset, setOffset] = useState(0);
    const [end, setEnd] = useState(false);
    const [messages, setMessages] = useState([]);

  return (
    <div className="chat-history">
      <h2>Chat History</h2>
      <div className="chat-history-items">
        {messages.map((message, index) => (
          <div className='message'>
            <div
                key={index}
                className={`user`}
            >
                <div className="message-content">
                    {message.user_query}
                </div>
            </div>
            <div
                key={index}
                className={`chatbot`}
            >
                <div className="message-content">
                    {message.response}
                </div>
            </div>
          </div>
            ))}
            {
              !end && (
                <button onClick={fetchHistory}>Load More</button>
              )
            }
      </div>
    </div>
  );
}

export default ChatHistory;
