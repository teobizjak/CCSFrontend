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

function Team() {
    const [activeTab, setActiveTab] = useState("login");
    const [token, setToken] = useState("");

    // Render the appropriate tab based on the activeTab state
    const renderTab = () => {
        switch (activeTab) {
            case "teamHome":
                return <TeamHome setActiveTab={setActiveTab} />;
            case "dbUsers":
                return <DbUsers setActiveTab={setActiveTab} token={token}/>;
            case "dbGames":
                return <DbGames setActiveTab={setActiveTab} token={token}/>;
            case "dbForum":
                return <DbForum setActiveTab={setActiveTab} token={token}/>;
            case "dbQuestions":
                return <DbQuestions setActiveTab={setActiveTab} token={token}/>;
            case "reviewGames":
                return <ReviewGames setActiveTab={setActiveTab} token={token}/>;
            case "editUser":
                return <EditUser setActiveTab={setActiveTab} token={token}/>;
            case "editGame":
                return <EditGame setActiveTab={setActiveTab} token={token}/>;
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
