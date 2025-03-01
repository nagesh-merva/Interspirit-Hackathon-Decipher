import { useTheme } from '@/context/ThemeContext'
import { useState, useEffect } from 'react'
import { FiTwitter, FiInstagram, FiAlertTriangle } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

function NegativeSentimentAlerts() {
  const [selectedTab, setSelectedTab] = useState('negative')
  const { negativeTweets, setNegativeTweets } = useTheme()
  const [negativeComments, setNegativeComments] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    fetch('/api/getNegativeComments')
      .then(response => response.json())
      .then(data => setNegativeComments(data))
      .catch(error => console.error('Error fetching negative comments:', error))
  }, [])

  const suggestedResponses = {
    1: 'We\'re sorry to hear about your experience. Our team is looking into this and will reach out to you directly to resolve this issue as quickly as possible.',
    2: 'We apologize for the inconvenience. Our development team is aware of these issues and working on a fix that will be released in the next update.',
    3: 'Thank you for your feedback. We value your opinion and are continuously working to improve our products based on customer feedback.',
    4: 'We\'re sorry to hear you\'re disappointed. Please reach out to our support team so we can understand your concerns better and make it right.',
    5: 'We appreciate your perspective. Innovation is at the core of our roadmap, and we\'re excited to share our upcoming developments soon.',
  }

  const mappedTweets = negativeTweets.map(tweet => ({
    id: tweet._id,
    platform: "twitter",
    username: tweet.username,
    content: tweet.tweet,
    engagement: {
      likes: tweet.likes,
      retweets: tweet.retweets,
      replies: tweet.replies || 0,
      comments: tweet.comments || 0,
    },
    severity: tweet.severity
  }))

  const mappedComments = negativeComments.map(comment => ({
    id: comment.comment_id,
    platform: "instagram",
    username: comment.username,
    content: comment.text,
    engagement: {
      likes: comment.likes,
      comments: 0,
    },
    severity: comment.severity
  }))

  const allNegativeMentions = [...mappedTweets, ...mappedComments]

  return (
    <div className="card mt-6 dark:bg-gray-800 p-4 mb-2 rounded-3xl shadow-sm max-h-[540px] overflow-y-scroll">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Negative Sentiment & Crisis Alerts</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedTab('negative')}
            className={`px-3 py-1 text-xs rounded-full ${selectedTab === 'negative'
              ? 'bg-primary-light text-white bg-blue-400'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
          >
            Negative Mentions
          </button>
          <button
            onClick={() => setSelectedTab('crisis')}
            className={`px-3 py-1 text-xs rounded-full ${selectedTab === 'crisis'
              ? 'bg-primary-light text-white bg-blue-400'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
          >
            Crisis Meter
          </button>
        </div>
      </div>

      {selectedTab === 'negative' ? (
        <div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Source
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Content
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Engagement
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Severity
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {allNegativeMentions.map((mention) => (
                  <tr key={mention.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {mention.platform === "instagram" && (
                          <FiInstagram className="h-5 w-5 text-pink-500" />
                        )}
                        {mention.platform === "twitter" && (
                          <FiTwitter className="h-5 w-5 text-blue-400" />
                        )}
                        <div className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                          @{mention.username}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700 dark:text-gray-300">{mention.content}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {mention.platform === 'twitter' ? (
                          <span>
                            {mention.engagement.likes} likes • {mention.engagement.retweets} RT • {mention.engagement.replies} replies
                          </span>
                        ) : (
                          <span>
                            {mention.engagement.likes} likes • {mention.engagement.comments} comments
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${mention.severity === 'high'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                        {mention.severity === 'high' ? (
                          <FiAlertTriangle className="h-3 w-3 mr-1" />
                        ) : null}
                        {mention.severity
                          ? mention.severity.charAt(0).toUpperCase() + mention.severity.slice(1)
                          : 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <a href='https://x.com/home' target='_blank' className="text-blue-700 bg-blue-300 px-4 py-2 rounded-full hover:text-white hover:bg-blue-900 dark:text-slate-700 dark:hover:text-black">
                        Respond
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default NegativeSentimentAlerts