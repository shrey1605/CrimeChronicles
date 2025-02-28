import React, { useState } from 'react';
import './style.css';
import Header from './components/Header';
import QueryInput from './components/QueryInput';
import Visualization from './components/Visualization';
import ChartTypeSelector from './components/ChartTypeSelector';
import ChatHistory from './components/ChatHistory';
import Login from './components/Login';
import Signup from './components/Signup';
import './styles/App.css';

function App() {
  const [chartType, setChartType] = useState('pie'); // Default chart type
  const [viewType, setViewType] = useState('chart'); // Default view type
  const [isLoggedIn, setIsLoggedIn] = useState(true) // User logged out by default
  
  // console.log("Chart type changed to : ", chartType);

  // Handle view type changes (chart or text)
  const handleViewTypeChange = (viewType) => {
    setViewType(viewType); // Correctly update the view type
  };

  const handleLogout = () => {
    // localStorage.removeItem('cc_username');
    setIsLoggedIn(false);
  };

  return (
    <div className="container">
      <Header />
      {!isLoggedIn ? ( // When user is not logged in
        <div style={{
          width:"80vw",
          // border:"solid 1px black",
          justifyContent:'space-evenly',
          marginInline:"auto",
          display:'flex',
          marginBlock:'2.5rem'
        }}>
          <Signup setIsLoggedIn={setIsLoggedIn}/>
          <Login setIsLoggedIn={setIsLoggedIn}/>
        </div>
      ) : ( // When user is logged in
        <> 
          <div style={{
            textAlign:"right",
            // border:'solid 1px black',
            display:'flex',
            justifyContent:'end',
            alignItems:'center',
            marginInline:'2rem'
          }}>
            {/* <h3>Welcome</h3> */}
            <button style={{
              background: "transparent", 
              fontWeight: "bold", 
              cursor:"pointer",
              color: "#e1e8ed",
              backgroundColor: "#067ec9",
              padding:"10px",
              borderRadius:"10px",
              border:"2px solid #272626" 
              }} onClick={handleLogout}>Log Out</button>
          </div>
          <ChatHistory/>

          {/* <Visualization chartType={chartType} viewType={viewType} /> */}
          
          {/* <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            }}>
            {viewType === 'chart' && <ChartTypeSelector chartType={chartType} setChartType={setChartType} />}
          </div> */}
          <QueryInput setViewType={handleViewTypeChange} chartType={chartType} setChartType={setChartType} viewType={viewType} />
      </>
      )}
    </div>
  );
}

export default App;