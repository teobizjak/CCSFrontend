import React from 'react';
import Leaderboard from '../components/leaderboard';
import CurrentlyPlayedGames from '../components/currentlyPlayedGames';
import FinishedGames from '../components/finishedGames';
import AllGames from '../components/allGames';
import SearchComponent from '../components/searchUser';

const Explore = () => {
    return (
        <div className="h-full w-full bg-gray-900 text-white">
            <div className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <header className="mb-8 text-3xl font-bold text-purple-300">
                    Explore Chess Universe
                </header>

                <div className="grid gap-8 md:grid-cols-4">
                    {/* Left Column (smaller) */}
                    <aside className="md:col-span-1 space-y-8">
                        <Leaderboard />
                        <SearchComponent />
                    </aside>

                    {/* Right Column (larger) */}
                    <main className="md:col-span-3 space-y-8">
                        <CurrentlyPlayedGames />
                        <FinishedGames />
                        <AllGames />
                    </main>
                </div>

                <footer className="mt-8">
                  {/* Footer content, could include copyright, navigation links, social media icons, etc. */}
                </footer>
            </div>
        </div>
    );
}

export default Explore;
