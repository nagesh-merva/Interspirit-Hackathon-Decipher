
import React, { useState } from "react"
// import PieChartdiv from "../components/dashboard/PieChartData"  
import Header from "@/components/layout/Header"
import Sidebar from "@/components/layout/Sidebar"
import { useTheme } from "@/context/ThemeContext"
import SentimentSummary from "@/components/dashboard/SentimentSummary"
import TrendingAnalysis from "@/components/dashboard/TrendingAnalysis"
import PlatformBreakdown from "@/components/dashboard/PlatformBreakdown"
import NegativeSentimentAlerts from "@/components/dashboard/NegativeSentimentAlerts"
import EngagementMonitoring from "@/components/dashboard/EngagementMonitoring"
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
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const { darkMode } = useTheme()

    return (
        <div className={`flex h-full overflow-y-scroll w-full ${darkMode ? 'dark bg-slate-900' : ''}`}>
            <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

            <div className="flex-1 flex flex-col space-y-6 overflow-hidden bg-background-light dark:bg-background-dark overflow-y-scroll">
                <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
                <div className="space-y-6 mx-5 mt-2 ">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sentiment Analysis Dashboard</h1>
                        <div className="flex space-x-2">

                            <button className=" border-2 border-gray-200 px-2 py-1 rounded-sm bg-blue-700 text-white">Generate Report</button>
                        </div>
                    </div>

                    <SentimentSummary />
                    <TrendingAnalysis />
                    <PlatformBreakdown />
                    <NegativeSentimentAlerts />
                    <EngagementMonitoring />
                </div>
            </div>
        </div>
    )
}

export default Dashboard
