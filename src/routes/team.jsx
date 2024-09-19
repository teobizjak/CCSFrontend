import React, { useEffect, useState } from 'react';

// Import your tab components



import LoginTeam from '../components/teamComponents/loginTeam';
import DbUsers from '../components/teamComponents/dbUsers';
import TeamHome from '../components/teamComponents/teamHome';
import DbGames from '../components/teamComponents/dbGames';
import DbForum from '../components/teamComponents/dbForum';
import DbQuestions from '../components/teamComponents/dbQuestions';
import ReviewGames from '../components/teamComponents/reviewGames';
import EditUser from '../components/teamComponents/editUser';
import EditGame from '../components/teamComponents/editGame';
import TeamLayout from '../components/teamComponents/teamLayout';
import TeamDashboard from '../components/teamComponents/teamDashboard';
import TeamUsers from '../components/teamComponents/teamUsers';
import TeamGames from '../components/teamComponents/teamGames';
import TeamContent from '../components/teamComponents/teamContent';
import TeamFinances from '../components/teamComponents/teamFinances';

function Team() {
    const [activeTab, setActiveTab] = useState("login");
    const [token, setToken] = useState("");

    // Render the appropriate tab based on the activeTab state
    const renderTab = () => {
        switch (activeTab) {
            case "dashboard":
                return <TeamLayout Component={TeamDashboard} activeTab={activeTab} setActiveTab={setActiveTab} token={token}/>;
                case "users":
                return <TeamLayout Component={TeamUsers} activeTab={activeTab} setActiveTab={setActiveTab} token={token}/>;
                case "games":
                return <TeamLayout Component={TeamGames} activeTab={activeTab} setActiveTab={setActiveTab} token={token}/>;
                case "content":
                return <TeamLayout Component={TeamContent} activeTab={activeTab} setActiveTab={setActiveTab} token={token}/>;
                case "finances":
                return <TeamLayout Component={TeamFinances} activeTab={activeTab} setActiveTab={setActiveTab} token={token}/>;
            default:
                return <div>Tab not found</div>;
        }
    };

    return (
        <>
            {token !== "" ? renderTab() : <LoginTeam setToken={setToken} token={token} setActiveTab={setActiveTab} />}
        </>
    );
}

export default Team;
