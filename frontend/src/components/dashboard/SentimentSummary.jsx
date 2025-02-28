import { useState } from 'react'
import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { FiTwitter, FiInstagram } from 'react-icons/fi'

ChartJS.register(ArcElement, Tooltip, Legend)

function SentimentSummary() {
  const [timeframe, setTimeframe] = useState('daily')
  const [platform, setPlatform] = useState('all')

  const sentimentScore = 78 // Example score out of 100

  const chartData = {
    labels: ['Positive', 'Neutral', 'Negative'],
    datasets: [
      {
        data: platform === 'twitter' ? [65, 20, 15] :
          platform === 'instagram' ? [70, 25, 5] :
            [68, 22, 10],
        backgroundColor: [
          '#10B981', // positive
          '#F59E0B', // neutral
          '#EF4444', // negative
        ],
        borderWidth: 0,
      },
    ],
  }

  const chartOptions = {
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          color: '#6B7280',
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.label}: ${context.raw}%`
          }
        }
      }
    },
  }

  const timeframeOptions = ['hourly', 'daily', 'weekly', 'monthly']

  return (
    <div className="card dark:bg-gray-800 rounded-3xl shadow-lg p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white ml-4">Overall Sentiment Summary</h2>
        <div className="flex space-x-2">
          {timeframeOptions.map(option => (
            <button
              key={option}
              onClick={() => setTimeframe(option)}
              className={`px-3 py-1 text-xs rounded-full ${timeframe === option
                ? 'bg-primary-light text-white bg-blue-400'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col items-center justify-center">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Brand Sentiment Score</h3>
          <div className="relative w-40 h-40">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{sentimentScore}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">out of 100</div>
              </div>
            </div>
            <svg className="w-full h-full" viewBox="0 0 36 36">
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="3"
                strokeDasharray="100, 100"
              />
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={sentimentScore > 75 ? "#10B981" : sentimentScore > 50 ? "#F59E0B" : "#EF4444"}
                strokeWidth="3"
                strokeDasharray={`${sentimentScore}, 100`}
                className="animate-[dash_1.5s_ease-in-out_forwards]"
                style={{
                  strokeDashoffset: 25,
                  transform: "rotate(-90deg)",
                  transformOrigin: "center"
                }}
              />
            </svg>
          </div>
          <div className="mt-2 text-sm font-medium text-positive text-green-600">+5% from last {timeframe}</div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Sentiment Distribution</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setPlatform('all')}
                className={`flex items-center px-2 py-1 text-xs rounded-full ${platform === 'all'
                  ? 'bg-primary-light text-white  bg-red-300'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
              >
                All
              </button>
              <button
                onClick={() => setPlatform('twitter')}
                className={`flex items-center px-2 py-1 text-xs rounded-full ${platform === 'twitter'
                  ? 'bg-primary-light text-white bg-blue-400'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
              >
                <FiTwitter className="mr-1" /> Twitter
              </button>
              <button
                onClick={() => setPlatform('instagram')}
                className={`flex items-center px-2 py-1 text-xs rounded-full ${platform === 'instagram'
                  ? 'bg-primary-light text-white bg-pink-600'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
              >
                <FiInstagram className="mr-1" /> Instagram
              </button>
            </div>
          </div>
          <div className="h-48">
            <Doughnut data={chartData} options={chartOptions} />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Real-Time Mentions</h3>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-3 h-48 overflow-y-auto scrollbar-hide">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="mb-3 p-2 bg-white dark:bg-gray-800 rounded shadow-sm">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {item % 2 === 0 ? (
                      <FiTwitter className="h-4 w-4 text-blue-400" />
                    ) : (
                      <FiInstagram className="h-4 w-4 text-pink-500" />
                    )}
                  </div>
                  <div className="ml-2 text-xs font-medium text-gray-900 dark:text-white">@user{item}</div>
                  <div className="ml-auto text-xs text-gray-500 dark:text-gray-400">Just now</div>
                </div>
                <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                  {item % 3 === 0
                    ? "Loving the new features! Great job team! 👍"
                    : item % 3 === 1
                      ? "Interesting update, still exploring all the options."
                      : "Having some issues with the latest version. Please fix."}
                </div>
                <div className="mt-1 flex items-center">
                  <span className={`inline-block w-2 h-2 rounded-full ${item % 3 === 0 ? "bg-positive" : item % 3 === 1 ? "bg-neutral" : "bg-negative"
                    }`}></span>
                  <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                    {item % 3 === 0 ? "Positive" : item % 3 === 1 ? "Neutral" : "Negative"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SentimentSummary