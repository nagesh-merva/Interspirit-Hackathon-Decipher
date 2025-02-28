import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { FiTwitter, FiInstagram } from 'react-icons/fi'
import { useTheme } from '@/context/ThemeContext'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

function PlatformBreakdown() {
  const { sentimentData } = useTheme()
  let total = sentimentData.positive_score + sentimentData.negative_score + sentimentData.neutral_score
  let pos = sentimentData.positive_score / total * 100
  let neu = sentimentData.neutral_score / total * 100
  let neg = sentimentData.negative_score / total * 100
  const twitterData = {
    labels: ['Positive', 'Neutral', 'Negative'],
    datasets: [
      {
        label: 'Percentage',
        data: [pos, neu, neg],
        backgroundColor: [
          '#10B981', // positive
          '#F59E0B', // neutral
          '#EF4444', // negative
        ],
        borderWidth: 0,
        borderRadius: 4,
      },
    ],
  }

  const instagramData = {
    labels: ['Positive', 'Neutral', 'Negative'],
    datasets: [
      {
        label: 'Percentage',
        data: [70, 25, 5],
        backgroundColor: [
          '#10B981', // positive
          '#F59E0B', // neutral
          '#EF4444', // negative
        ],
        borderWidth: 0,
        borderRadius: 4,
      },
    ],
  }

  const chartOptions = {
    indexAxis: 'y',
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.raw}%`
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
        grid: {
          display: false,
        },
        ticks: {
          callback: function (value) {
            return value + '%'
          }
        }
      },
      y: {
        grid: {
          display: false,
        },
      },
    },
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 mb-3 rounded-3xl">
      <div className="card shadow-lg rounded-3xl p-4 dark:bg-gray-800">
        <div className="flex items-center mb-4">
          <FiTwitter className="h-5 w-5 text-blue-400 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Twitter Sentiment</h2>
        </div>
        <div className="h-48 dark:text-white">
          <Bar data={twitterData} options={chartOptions} />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="text-center">
            <div className="text-2xl font-bold text-positive text-green-400 ">{pos.toFixed(2)}%</div>
            <div className="text-xs text-gray-500 dark:text-white">Positive</div>
            <div className="text-xs font-medium text-positive mt-1 text-green-400">+5% vs last week</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-black dark:text-white">{neu.toFixed(2)}%</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Neutral</div>
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">-2% vs last week</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-negative text-red-500">{neg.toFixed(2)}%</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Negative</div>
            <div className="text-xs font-medium text-negative mt-1 text-red-500">-3% vs last week</div>
          </div>
        </div>
      </div>

      <div className="card shadow-lg rounded-3xl p-4 dark:bg-gray-800">
        <div className="flex items-center mb-4">
          <FiInstagram className="h-5 w-5 text-pink-500 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Instagram Sentiment</h2>
        </div>
        <div className="h-48">
          <Bar data={instagramData} options={chartOptions} />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="text-center">
            <div className="text-2xl font-bold text-positive  text-green-400">70%</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Positive</div>
            <div className="text-xs font-medium text-positive mt-1  text-green-400">+8% vs last week</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-neutral text-black dark:text-white">25%</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Neutral</div>
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">-3% vs last week</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-negative text-red-500">5%</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Negative</div>
            <div className="text-xs font-medium text-negative mt-1 text-red-500">-5% vs last week</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlatformBreakdown