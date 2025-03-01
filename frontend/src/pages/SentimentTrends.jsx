import { useState, useEffect } from 'react'
import { Line } from 'react-chartjs-2'
import { useTheme } from "@/context/ThemeContext"
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
import { FiTwitter, FiInstagram, FiCalendar } from 'react-icons/fi'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

function SentimentTrends() {
  const [platform, setPlatform] = useState('all')
  const [dateRange, setDateRange] = useState([new Date(new Date().setDate(new Date().getDate() - 30)), new Date()])
  const [startDate, endDate] = dateRange
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { darkMode } = useTheme()
  const [sentimentData, setSentimentData] = useState([])

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/calculate-sentiment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ brand_name: "boAt", platform }),
        })
        const data = await response.json();
        setSentimentData(data);
        console.log(data)
      } catch (error) {
        console.error('Error fetching sentiment data:', error);
      }
    }
    fetchData();
  }, []);
  const sentimentMetrics = [
    {
      title: 'Average Sentiment Score',
      value: sentimentData.avg_sentiment_score + '/100',
      change: '+5%',
      trend: 'up',
      description: 'Overall sentiment has improved over the selected period.'
    },
    {
      title: 'Sentiment Volatility',
      value: sentimentData.volatility_level,
      change: '-2%',
      trend: 'down',
      description: 'Sentiment stability has improved slightly.'
    },
    {
      title: 'Negative Mention Rate',
      value: sentimentData.neg_pos_ratio * 100 + '%',
      change: '-3.1%',
      trend: 'down',
      description: 'Negative mentions have decreased significantly.'
    },
    {
      title: 'Positive to Negative Ratio',
      value: sentimentData.pos_neg_ratio + ':1',
      change: '+0.8',
      trend: 'up',
      description: 'The ratio of positive to negative mentions has improved.'
    },
  ]

  return (
    <div className={`flex h-full overflow-y-scroll w-full ${darkMode ? 'dark bg-slate-900' : ''}`}>
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex flex-col space-y-6 overflow-hidden bg-background-light dark:bg-background-dark overflow-y-scroll">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="space-y-6 mx-5 ">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sentiment Trends</h1>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiCalendar className="h-4 w-4 text-gray-400" />
                </div>
                <DatePicker
                  selectsRange={true}
                  startDate={startDate}
                  endDate={endDate}
                  onChange={(update) => {
                    setDateRange(update)
                  }}
                  className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2 rounded-md text-sm border w-fit border-gray-300 dark:border-gray-700"
                  placeholderText="Select date range"
                  dateFormat="MMM d, yyyy"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPlatform('all')}
                  className={`px-3 py-2 rounded-md text-sm ${platform === 'all'
                    ? 'bg-primary-light text-white bg-red-300'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                >
                  All Platforms
                </button>
                <button
                  onClick={() => setPlatform('twitter')}
                  className={`flex items-center px-3 py-2 rounded-md text-sm ${platform === 'twitter'
                    ? 'bg-primary-light text-white bg-blue-500'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                >
                  <FiTwitter className="mr-2" /> Twitter
                </button>
                <button
                  onClick={() => setPlatform('instagram')}
                  className={`flex items-center px-3 py-2 rounded-md text-sm ${platform === 'instagram'
                    ? 'bg-primary-light text-white bg-pink-600'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                >
                  <FiInstagram className="mr-2" /> Instagram
                </button>
              </div>
            </div>
          </div>



          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sentimentMetrics.map((metric, index) => (
              <div key={index} className="card shadow-lg rounded-3xl p-4 dark:bg-gray-800">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{metric.title}</h3>
                <div className="flex items-end justify-between">
                  <div className="text-3xl font-bold text-gray-900  dark:text-white">{metric.value}</div>
                  <div className={`flex items-center text-sm font-medium dark:text-white ${metric.trend === 'up' ? 'text-positive' : 'text-negative'
                    }`}>
                    {metric.change}
                    <svg
                      className={`ml-1 h-4 w-4 ${metric.trend === 'down' && 'transform rotate-180'}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{metric.description}</p>
              </div>
            ))}
          </div>

          <div className="card shadow-lg rounded-3xl p-4 dark:bg-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Key Insights</h2>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900 rounded-md">
                <h3 className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">Positive Trend</h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Sentiment has shown consistent improvement over the past 2 weeks, with positive mentions increasing by 12%.
                </p>
              </div>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900 rounded-md">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">Area to Monitor</h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Product performance discussions show mixed sentiment. Consider addressing common concerns in upcoming updates.
                </p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-md">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">Recommendation</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Highlight positive customer experiences in marketing materials to reinforce brand reputation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SentimentTrends