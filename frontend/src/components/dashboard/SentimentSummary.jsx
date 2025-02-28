import { useState, useEffect } from 'react'
import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { FiTwitter, FiInstagram } from 'react-icons/fi'
import { useTheme } from '@/context/ThemeContext'

ChartJS.register(ArcElement, Tooltip, Legend)

function SentimentSummary() {
  const [timeframe, setTimeframe] = useState('daily')
  const [platform, setPlatform] = useState('all')
  const { sentimentData, setSentimentData, negativeTweets, setNegativeTweets } = useTheme()
  const [loading, setLoading] = useState(false)
  const [percentages, setPercentages] = useState({
    pos: 0,
    neu: 0,
    neg: 0
  });

  useEffect(() => {
    async function fetchNegativeTweets() {
      setLoading(true)
      try {
        const response = await fetch('http://127.0.0.1:5000/api/get_negative_tweets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ brand_name: "boAt" })
        })

        console.log('Raw response:', response)

        const data = await response.json()
        console.log('Fetched negative tweets:', data)

        if (!Array.isArray(data)) {
          console.error('Response data is not an array:', data)
        }

        setNegativeTweets(data)
      } catch (error) {
        console.error('Error fetching negative tweets:', error)
      } finally {
        setTimeout(() => {
          setLoading(false)
        }, 3500)
      }
    }
    fetchNegativeTweets()
  }, [])

  useEffect(() => {
    async function fetchSentimentData() {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/getsenti_score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ brand_name: "boAt", platform }),
        })
        const data = await response.json()
        console.log(data)
        setSentimentData(data)
        const total = data.positive_score + data.neutral_score + data.negative_score;
        if (total > 0) {
          const newPercentages = {
            pos: (data.positive_score / total * 100),
            neu: (data.neutral_score / total * 100),
            neg: (data.negative_score / total * 100)
          };
          console.log('Calculated percentages:', newPercentages);
          setPercentages(newPercentages);
        }
      } catch (error) {
        console.error('Error fetching sentiment data:', error)
      }
    }
    console.log(percentages)

    fetchSentimentData()
  }, [platform])

  const sentimentScore = 78

  const chartData = {
    labels: ['Positive', 'Neutral', 'Negative'],
    datasets: [
      {
        data: platform === 'twitter' ? [percentages.pos, percentages.neu, percentages.neg] :
          platform === 'instagram' ? [percentages.pos, percentages.neu, percentages.neg] :
            [68, 22, 10],
        backgroundColor: [
          '#10B981',
          '#F59E0B',
          '#EF4444',
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

  const calcRiseDown = (ovr, prevOvr, timeframe) => {
    if (prevOvr === 0) {
      return <p className="text-gray-500">No previous data available</p>;
    }

    const percentageChange = ((ovr - prevOvr) / prevOvr) * 100;
    const formattedPercentage = percentageChange.toFixed(2);

    if (percentageChange > 0) {
      return <p className="text-green-500">+{formattedPercentage}% from last {timeframe}</p>;
    } else if (percentageChange < 0) {
      return <p className="text-red-500">{formattedPercentage}% from last {timeframe}</p>;
    } else {
      return <p className="text-gray-500">No change from last {timeframe}</p>;
    }
  };

  const LoadingState = () => (
    <div className="fixed h-screen inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl max-w-md w-full mx-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col items-center">
          <div className="relative w-20 h-20 mb-4">
            <div className="absolute top-0 left-0 right-0 bottom-0 animate-spin">
              <div className="h-20 w-20 rounded-full border-4 border-blue-400 border-t-transparent"></div>
            </div>
            <div className="absolute top-0 left-0 right-0 bottom-0 animate-ping opacity-30">
              <div className="h-20 w-20 rounded-full border-4 border-pink-500 border-t-transparent border-l-transparent"></div>
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Analyzing Social Sentiment</h3>
          <p className="text-gray-600 dark:text-gray-300 text-center mb-4">Collecting tweets and social mentions to generate sentiment analysis...</p>

          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-6">
            <div className="bg-blue-400 h-2.5 rounded-full animate-[loadingProgress_2s_ease-in-out_infinite]"></div>
          </div>

          <div className="flex space-x-2 text-sm text-gray-500 dark:text-gray-400 italic">
            <span className="flex items-center">
              <FiTwitter className="mr-1 text-blue-400" />
              Twitter
            </span>
            <span>•</span>
            <span className="flex items-center">
              <FiInstagram className="mr-1 text-pink-500" />
              Instagram
            </span>
          </div>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <>
        <LoadingState />
        <style jsx global>{`
          @keyframes loadingProgress {
            0% {
              width: 15%;
            }
            50% {
              width: 85%;
            }
            100% {
              width: 15%;
            }
          }
        `}</style>
      </>
    );
  }
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
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{sentimentData.ovr_score}</div>
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
          <div className="mt-2 text-sm font-medium">
            {calcRiseDown(sentimentData.ovr_score, sentimentData.prev_ovr_score, "1 day")}
          </div>
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
        <div className="card dark:bg-gray-800 rounded-3xl shadow-lg p-5">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Real-Time Mentions</h3>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-3 h-48 overflow-y-auto scrollbar-hide">
            {sentimentData.recent_mentions.map((mention, index) => (
              <div key={index} className="mb-3 p-2 bg-white dark:bg-gray-800 rounded shadow-sm">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {mention.platform === 'instagram' ? (
                      <FiInstagram className="h-4 w-4 text-pink-500" />
                    ) : (
                      <FiTwitter className="h-4 w-4 text-blue-400" />
                    )}
                  </div>
                  <div className="ml-2 text-xs font-medium text-gray-900 dark:text-white">@user{index + 1}</div>
                  <div className="ml-auto text-xs text-gray-500 dark:text-gray-400">{mention.date}</div>
                </div>
                <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">{mention.tweet}</div>
                <div className="mt-1 flex items-center">
                  <span className={`inline-block w-2 h-2 rounded-full ${mention.sentiment === 'Positive' ? "bg-green-500" : mention.sentiment === 'Neutral' ? "bg-yellow-500" : "bg-red-500"}`}></span>
                  <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">{mention.sentiment}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style jsx global>{`
        @keyframes dash {
          from {
            stroke-dashoffset: 100;
          }
          to {
            stroke-dashoffset: 25;
          }
        }
      `}</style>
    </div>
  )
}

export default SentimentSummary