import React from 'react';
import './App.css';
import WorkSchedule from './pages/WorkSchedule';
import { isMobile } from 'react-device-detect';
import MobileWorkSchedule from './pages/MobileWorkSchedule';

const MobileView: React.FC = () => (
    <div className="App">
        <header className="App-header">
            <h1>Work Schedule</h1>
        </header>
            <MobileWorkSchedule/>
    </div>
);

const PCView: React.FC = () => (
    <div className="App">
        <header className="App-header">
            <h1>Work Schedule</h1>
        </header>
        <div><WorkSchedule /></div>
    </div>
);

function App() {
    return (
        <>
            {isMobile ? <MobileView /> : <PCView />}
        </>
    );
}

export default App;
