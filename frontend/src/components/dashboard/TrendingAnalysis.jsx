import { useState } from 'react'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

function TrendingAnalysis() {
  const [timeframe, setTimeframe] = useState('7days')
  const [sentimentFilter, setSentimentFilter] = useState('all')

  const timeframeOptions = [
    { value: '24hours', label: 'Last 24 Hours' },
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
  ]

  const sentimentOptions = [
    { value: 'all', label: 'All' },
    { value: 'positive', label: 'Positive' },
    { value: 'neutral', label: 'Neutral' },
    { value: 'negative', label: 'Negative' },
  ]

  // Sample data for the trending hashtags
  const trendingHashtags = [
    { text: 'ProductLaunch', value: 25, sentiment: 'positive' },
    { text: 'CustomerService', value: 18, sentiment: 'neutral' },
    { text: 'Innovation', value: 15, sentiment: 'positive' },
    { text: 'TechIssue', value: 12, sentiment: 'negative' },
    { text: 'Feedback', value: 10, sentiment: 'neutral' },
    { text: 'NewFeature', value: 8, sentiment: 'positive' },
    { text: 'BugFix', value: 7, sentiment: 'positive' },
    { text: 'Outage', value: 6, sentiment: 'negative' },
    { text: 'Update', value: 5, sentiment: 'neutral' },
    { text: 'Review', value: 4, sentiment: 'positive' },
  ].filter(tag => sentimentFilter === 'all' || tag.sentiment === sentimentFilter)

  // Sample data for the trend graph
  const trendData = {
    labels: timeframe === '24hours'
      ? Array.from({ length: 24 }, (_, i) => `${i}:00`)
      : timeframe === '7days'
        ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        : Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
    datasets: [
      {
        label: 'Mentions',
        data: timeframe === '24hours'
          ? [12, 19, 15, 8, 5, 3, 7, 10, 15, 25, 30, 35, 25, 20, 15, 18, 22, 30, 25, 20, 15, 10, 8, 5]
          : timeframe === '7days'
            ? [65, 75, 60, 80, 90, 100, 85]
            : Array.from({ length: 30 }, () => Math.floor(Math.random() * 50) + 50),
        borderColor: '#4F46E5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Sentiment Score',
        data: timeframe === '24hours'
          ? [70, 75, 72, 68, 65, 60, 62, 68, 72, 75, 78, 80, 75, 72, 70, 72, 75, 78, 75, 72, 70, 68, 65, 62]
          : timeframe === '7days'
            ? [75, 78, 72, 80, 82, 85, 80]
            : Array.from({ length: 30 }, () => Math.floor(Math.random() * 20) + 65),
        borderColor: '#10B981',
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        tension: 0.4,
      },
    ],
  }

  const trendOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          color: '#6B7280',
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
        ticks: {
          color: '#6B7280',
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6B7280',
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
    elements: {
      point: {
        radius: 2,
        hoverRadius: 4,
      },
    },
  }

  return (
    <div className="card mt-6 mb-4 p-4 rounded-3xl shadow-lg dark:bg-gray-800">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Trending Analysis</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Spikes & Anomalies in Trends</h3>
            <div className="flex space-x-2">
              {timeframeOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setTimeframe(option.value)}
                  className={`px-3 py-1 text-xs rounded-full ${timeframe === option.value
                    ? 'bg-primary-light text-white bg-blue-400'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div className="h-64">
            <Line data={trendData} options={trendOptions} />
          </div>
          <div className="mt-2 flex items-center">
            <div className="flex items-center">
              <span className="inline-block w-3 h-3 rounded-full bg-red-500"></span>
              <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">PR Incident</span>
            </div>
            <div className="ml-4 text-xs text-gray-500 dark:text-gray-400">
              {timeframe === '7days' ? 'Wed: Product outage reported by users' : 'Notable incident'}
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Trending Hashtags & Phrases</h3>
            <div className="flex space-x-2">
              {sentimentOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setSentimentFilter(option.value)}
                  className={`px-3 py-1 text-xs rounded-full ${sentimentFilter === option.value
                    ? 'bg-primary-light text-white bg-blue-400'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4 h-64 flex flex-wrap items-center justify-center overflow-y-scroll">
            {trendingHashtags.map((tag, index) => (
              <div
                key={index}
                className={`m-1 px-3 py-1 rounded-full text-white  ${tag.sentiment === 'positive' ? 'bg-green-400' :
                  tag.sentiment === 'neutral' ? 'bg-orange-400' : 'bg-red-500'
                  }`}
                style={{ fontSize: `${Math.max(0.7, tag.value / 10)}rem` }}
              >
                #{tag.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TrendingAnalysis