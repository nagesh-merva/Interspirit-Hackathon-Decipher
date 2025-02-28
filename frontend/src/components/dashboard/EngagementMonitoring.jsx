import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
import { useState, useEffect } from 'react'
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

function EngagementMonitoring() {
  const [emotionalToneData, setEmotionalToneData] = useState([])
  const engagementData = {
    labels: ['12 AM', '2 AM', '4 AM', '6 AM', '8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM', '10 PM'],
    datasets: [
      {
        label: 'Current Rate',
        data: [5, 3, 2, 4, 8, 15, 25, 30, 28, 35, 25, 15],
        borderColor: '#4F46E5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        fill: true,
        tension: 0.4,
      },
      // {
      //   label: 'Historical Average',
      //   data: [4, 3, 3, 5, 10, 12, 18, 22, 20, 25, 18, 10],
      //   borderColor: '#9CA3AF',
      //   backgroundColor: 'transparent',
      //   borderDash: [5, 5],
      //   tension: 0.4,
      // },
    ],
  }

  const engagementOptions = {
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
        title: {
          display: true,
          text: 'Posts per hour',
          color: '#6B7280',
        },
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

  // const emotionalToneData = [
  //   { emotion: 'Joy', twitter: 45, instagram: 60 },
  //   { emotion: 'Sadness', twitter: 15, instagram: 10 },
  //   { emotion: 'Anger', twitter: 25, instagram: 12 },
  //   { emotion: 'Fear', twitter: 8, instagram: 5 },
  //   { emotion: 'Surprise', twitter: 7, instagram: 13 },
  // ]

  useEffect(() => {
    async function fetchEmotionalToneData() {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/get_emotion_counts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ brand_name: "boAt" })
        })
        const data = await response.json()
        console.log('Fetched emotion counts:', data)
        setEmotionalToneData(data)
      } catch (error) {
        console.error('Error fetching emotion counts:', error)
      }
    }
    fetchEmotionalToneData()
  }, [])

  const maxValue = emotionalToneData.length > 0
    ? Math.max(...emotionalToneData.map(item => item.count))
    : 100

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 mb-2">
      <div className="card shadow-lg rounded-3xl p-4 dark:bg-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tweet & Comment Rate</h2>
        <div className="h-64">
          <Line data={engagementData} options={engagementOptions} />
        </div>
        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Current engagement is <span className="font-medium text-primary-light">32% higher</span> than historical average.
        </div>
      </div>

      <div className="card shadow-lg rounded-3xl p-4 dark:bg-gray-800 ">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Emotional Tone of Engagement</h2>
        <div className="h-64 overflow-y-scroll">
          <div className="flex flex-col space-y-3">
            {emotionalToneData.map((item) => (
              <div key={item.emotion} className="flex items-center">
                <div className="w-20 text-sm text-gray-700 dark:text-gray-300">{item.emotion}</div>
                <div className="flex-1 flex items-center space-x-2">
                  <div className="flex-1 h-6 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden">
                    <div
                      className="h-full bg-blue-400 flex items-center justify-end pr-1"
                      style={{ width: `${(item.count / maxValue) * 100}%` }}
                    >
                      <span className="text-xs text-white">{item.count}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {emotionalToneData.length === 0 && (
              <div className="text-sm text-gray-500 dark:text-gray-400">No emotion data available.</div>
            )}
          </div>
        </div>
        <div className="mt-4 flex justify-center space-x-6">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-400 rounded-full mr-1"></div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Emotion Count</span>
          </div>
        </div>

        <div className="mt-4 flex justify-center space-x-6">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-400 rounded-full mr-1"></div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Twitter</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-pink-400 rounded-full mr-1"></div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Instagram</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EngagementMonitoring