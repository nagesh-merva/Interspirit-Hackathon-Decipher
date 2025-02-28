import React from "react";

const Recenttweets = [
    {
        "ID": 1895371961603367322,
        "tweet": "@Vikky4_ Me and you same boat \nApart from yhemo Lee that’s always in our faces, I don’t know of any other socialite",
        "date": "2025-02-28 07:14:24+00:00",
        "likes": 0,
        "retweets": 0
    },
    {
        "ID": 1895371846335234118,
        "tweet": "I want a nice little boat made out of ocean.\nLike...",
        "date": "2025-02-28 07:13:57+00:00",
        "likes": 0,
        "retweets": 0
    },
    {
        "ID": 1895371830376223152,
        "tweet": "🚨 #ElonMusk officially launches X Token Presale! 🚀Link in Pin➡️ https://t.co/llnB4uK7xg",
        "date": "2025-02-28 07:13:53+00:00",
        "likes": 0,
        "retweets": 0
    },
    {
        "ID": 1895371773056819544,
        "tweet": "A light boat has passed ten thousand mountains #Writing #Calligraphy #Poetry",
        "date": "2025-02-28 07:13:39+00:00",
        "likes": 0,
        "retweets": 0
    }
];

const Realtime = () => {
    // Sort tweets in descending order (most recent first)
    const sortedTweets = [...Recenttweets].sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">Real-time Brand Mentions</h1>
            <div className="grid md:grid-cols-2 gap-6">
                {sortedTweets.map((tweet, index) => (
                    <div key={tweet.ID} className="border p-4 rounded-lg shadow-sm bg-white">
                        <h2 className="font-semibold text-lg">New Mention</h2>
                        <p className="text-gray-600 mt-2">{tweet.tweet}</p>
                        <p className="text-gray-400 text-sm mt-2">{new Date(tweet.date).toLocaleTimeString()}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Realtime;
