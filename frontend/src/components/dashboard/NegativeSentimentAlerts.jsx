import { useState } from 'react'
import { FiTwitter, FiInstagram, FiAlertTriangle } from 'react-icons/fi'

function NegativeSentimentAlerts() {
  const [selectedTab, setSelectedTab] = useState('negative')

  const negativeTweets = [
    {
      id: 1,
      platform: 'twitter',
      username: 'unhappyuser',
      content: 'Your customer service is terrible! I\'ve been waiting for a response for 3 days now. #disappointed',
      engagement: { likes: 45, retweets: 23, replies: 12 },
      severity: 'high',
    },
    {
      id: 2,
      platform: 'instagram',
      username: 'customer_feedback',
      content: 'The new update is full of bugs. Can\'t even use the app properly anymore. Please fix ASAP!',
      engagement: { likes: 32, comments: 18 },
      severity: 'medium',
    },
    {
      id: 3,
      platform: 'twitter',
      username: 'tech_reviewer',
      content: 'The latest product release doesn\'t live up to the hype. Many features are half-baked and unusable.',
      engagement: { likes: 78, retweets: 34, replies: 22 },
      severity: 'medium',
    },
    {
      id: 4,
      platform: 'instagram',
      username: 'daily_consumer',
      content: 'Extremely disappointed with the quality. Not worth the premium price at all.',
      engagement: { likes: 56, comments: 27 },
      severity: 'high',
    },
    {
      id: 5,
      platform: 'twitter',
      username: 'industry_watcher',
      content: 'Your competitors are innovating while you\'re stagnating. Wake up before it\'s too late.',
      engagement: { likes: 89, retweets: 45, replies: 32 },
      severity: 'medium',
    },
  ]

  const suggestedResponses = {
    1: 'We\'re sorry to hear about your experience. Our team is looking into this and will reach out to you directly to resolve this issue as quickly as possible.',
    2: 'We apologize for the inconvenience. Our development team is aware of these issues and working on a fix that will be released in the next update.',
    3: 'Thank you for your feedback. We value your opinion and are continuously working to improve our products based on customer feedback.',
    4: 'We\'re sorry to hear you\'re disappointed. Please reach out to our support team so we can understand your concerns better and make it right.',
    5: 'We appreciate your perspective. Innovation is at the core of our roadmap, and we\'re excited to share our upcoming developments soon.',
  }

  return (
    <div className="card mt-6 dark:bg-gray-800 p-4 mb-2 rounded-3xl shadow-sm">
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
                {negativeTweets.map((tweet) => (
                  <tr key={tweet.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {tweet.platform === 'twitter' ? (
                          <FiTwitter className="h-5 w-5 text-blue-400" />
                        ) : (
                          <FiInstagram className="h-5 w-5 text-pink-500" />
                        )}
                        <div className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                          @{tweet.username}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700 dark:text-gray-300">{tweet.content}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {tweet.platform === 'twitter' ? (
                          <span>
                            {tweet.engagement.likes} likes • {tweet.engagement.retweets} RT • {tweet.engagement.replies} replies
                          </span>
                        ) : (
                          <span>
                            {tweet.engagement.likes} likes • {tweet.engagement.comments} comments
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${tweet.severity === 'high'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                        {tweet.severity === 'high' ? (
                          <FiAlertTriangle className="h-3 w-3 mr-1" />
                        ) : null}
                        {tweet.severity.charAt(0).toUpperCase() + tweet.severity.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-700 hover:text-red-200 dark:text-blue-700 dark:hover:text-red-400 bg-amber-200 px-2 py-1 rounded-4xl">
                        Respond
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">AI Response Suggestion</h3>
            <div className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600">
              {suggestedResponses[1]}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Crisis Severity Meter</h3>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4 h-32 flex items-center">
              <div className="w-full h-6 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                  style={{ width: '35%' }}
                ></div>
              </div>
              <div className="ml-4 text-sm font-medium text-yellow-500">
                Monitor (35%)
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Current negative sentiment is within manageable levels, but monitor closely for any increases.
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">PR Risk Assessment</h3>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4 h-32">
              <div className="flex flex-col h-full justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Current Status:</span>
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    Monitor
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Trend:</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Stable</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Recommendation:</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Proactive Response</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NegativeSentimentAlerts