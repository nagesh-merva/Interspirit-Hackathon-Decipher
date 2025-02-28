
import React from "react"
import PieChartdiv from "../components/dashboard/PieChartData"  // Adjust path if necessary
import Positivesentiments from "@/components/dashboard/Positivesentiments"
import Realtime from "@/components/dashboard/Realtime"
const chartData = [
    { browser: "chrome", visitors: 275, fill: "#4285F4" },
    { browser: "safari", visitors: 200, fill: "#FF9500" },
    { browser: "firefox", visitors: 287, fill: "#FF7139" },
    { browser: "edge", visitors: 173, fill: "#0078D7" },
    { browser: "other", visitors: 190, fill: "#6c757d" },
]
const Recenttweets = [
    {
        "ID": 1895371961603367322,
        "tweet": "@Vikky4_ Me and you same boat \nApart from yhemo Lee that\u2019s always in our faces, I don\u2019t know of any other socialite",
        "date": "2025-02-28 07:14:24+00:00",
        "likes": 0,
        "retweets": 0
    },
    {
        "ID": 1895371846335234118,
        "tweet": "i want a nice little boat made out of ocean.\nlike...",
        "date": "2025-02-28 07:13:57+00:00",
        "likes": 0,
        "retweets": 0
    },
    {
        "ID": 1895371830376223152,
        "tweet": "\ud83d\udea8 #ElonMusk officially launches X Token Presale! \n\n\ud83d\ude80Link in Pin\u279e https://t.co/llnB4uK7xg\n\nInvited users: @SayUncanny @medmrgh @boat_thegoat @iagocvs @PruIfan @0xgoodfellas @evavveli @ABDESADK3 @0xClassOf2017 @KAPOTHEGOAT01 @dosbol6868 @Minqian_lu  SJORU",
        "date": "2025-02-28 07:13:53+00:00",
        "likes": 0,
        "retweets": 0
    },
    {
        "ID": 1895371773056819544,
        "tweet": "\"A light boat has passed ten thousand mountains\" #Writing #Calligraphy #Poetry https://t.co/49ikA4WRIc",
        "date": "2025-02-28 07:13:39+00:00",
        "likes": 0,
        "retweets": 0
    }
]
function Dashboard() {
    return (
        <div className="h-full w-full">
            <Realtime Recenttweets={Recenttweets} />
            {/* <PieChartdiv chartData={chartData} /> */}
            {/* <Positivesentiments /> */}
        </div>
    )
}

export default Dashboard
