import { useState } from 'react'
import { FiAlertTriangle, FiAlertCircle, FiInfo, FiCheckCircle, FiBell, FiBellOff } from 'react-icons/fi'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import { useTheme } from '@/context/ThemeContext'

function Alerts() {
  const [alertsEnabled, setAlertsEnabled] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(false)

  const toggleEmailNotifications = () => setEmailNotifications(!emailNotifications)
  const toggleSmsNotifications = () => setSmsNotifications(!smsNotifications)

  const alertSettings = [
    {
      id: 1,
      type: 'Negative Sentiment Spike',
      description: 'Alert when negative sentiment exceeds 20% within 24 hours',
      icon: FiAlertTriangle,
      iconColor: 'text-red-500',
      enabled: true,
      threshold: 20,
    },
    {
      id: 2,
      type: 'Engagement Volume Surge',
      description: 'Alert when mentions increase by 200% compared to baseline',
      icon: FiAlertCircle,
      iconColor: 'text-yellow-500',
      enabled: true,
      threshold: 200,
    },
    {
      id: 3,
      type: 'Positive Sentiment Opportunity',
      description: 'Alert when positive sentiment exceeds 80% for a specific topic',
      icon: FiCheckCircle,
      iconColor: 'text-green-500',
      enabled: false,
      threshold: 80,
    },
    {
      id: 4,
      type: 'Competitor Mention Spike',
      description: 'Alert when competitor mentions increase significantly',
      icon: FiInfo,
      iconColor: 'text-blue-500',
      enabled: true,
      threshold: 150,
    },
  ]

  const recentAlerts = [
    {
      id: 1,
      type: 'Negative Sentiment Spike',
      message: 'Negative sentiment reached 25% in the last 24 hours',
      timestamp: '2 hours ago',
      severity: 'high',
      icon: FiAlertTriangle,
      iconColor: 'text-red-500',
    },
    {
      id: 2,
      type: 'Engagement Volume Surge',
      message: 'Mentions increased by 250% compared to baseline',
      timestamp: '1 day ago',
      severity: 'medium',
      icon: FiAlertCircle,
      iconColor: 'text-yellow-500',
    },
    {
      id: 3,
      type: 'Competitor Mention Spike',
      message: 'Competitor mentions increased by 180% in the last 48 hours',
      timestamp: '2 days ago',
      severity: 'low',
      icon: FiInfo,
      iconColor: 'text-blue-500',
    },
  ]
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { darkMode } = useTheme()
  const handleSaveSettings = () => alert('Notification settings saved!')
  return (
    <div className={`flex h-full overflow-y-scroll w-full pb-10 ${darkMode ? 'dark bg-slate-900' : ''}`}>
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex flex-col space-y-6 overflow-hidden bg-background-light dark:bg-background-dark overflow-y-scroll">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="space-y-6 mx-5  ">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Alerts & Notifications</h1>
          <div className="flex justify-center items-center w-full">

            <div className="card w-full rounded-md shadow-lg p-4 dark:bg-gray-800 ">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Alerts</h2>
              {recentAlerts.length > 0 ? (
                <div className="space-y-4">
                  {recentAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-start p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                      <div className={`flex-shrink-0 ${alert.iconColor}`}>
                        <alert.icon className="h-5 w-5" />
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white">{alert.type}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${alert.severity === 'high'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : alert.severity === 'medium'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            }`}>
                            {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{alert.message}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-gray-500 dark:text-gray-400">{alert.timestamp}</span>
                          <div className="flex space-x-2">
                            <button className="text-xs text-primary-light hover:text-primary-dark text-blue-500 dark:text-primary-dark dark:hover:text-primary-light">
                              View Details
                            </button>
                            <button className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                              Dismiss
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="text-gray-400 dark:text-gray-500">
                    <FiBellOff className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No alerts</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    There are no recent alerts to display.
                  </p>
                </div>
              )}
              <div className="mt-4 flex justify-between">
                <button className="btn btn-secondary bg-gray-300 rounded-sm p-2">
                  <FiBell className="h-4 w-4 mr-2" />
                  Test Alert
                </button>
                <button className="btn btn-secondary bg-gray-300 rounded-sm p-2">View All Alerts</button>
              </div>
            </div>
          </div>

          <div className="card p-4 dark:bg-gray-800 rounded-md shadow-lg">


            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notification Channels</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Email Notifications</h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Send alerts to email</span>
                  <button onClick={toggleEmailNotifications} className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${emailNotifications ? 'bg-blue-500' : 'bg-gray-400'}`}>
                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${emailNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div className="mt-2">
                  <input
                    type="email"
                    placeholder="Enter email address"
                    className="w-full px-3 py-2 text-sm bg-white dark:text-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md"
                    value="alerts@company.com"
                    disabled={!emailNotifications}
                  />
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">SMS Notifications</h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Send alerts via SMS</span>
                  <button onClick={toggleSmsNotifications} className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${smsNotifications ? 'bg-blue-500' : 'bg-gray-400'}`}>
                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${smsNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div className="mt-2">
                  <input
                    type="tel"
                    placeholder="Enter phone number"
                    className="w-full px-3 py-2 text-sm bg-white dark:text-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md"
                    disabled={!smsNotifications}
                  />
                </div>
              </div>
            </div>
            <div className="mt-4">
              <button onClick={handleSaveSettings} className="btn btn-primary bg-blue-500 rounded-sm p-2">Save Notification Settings</button>
            </div>
          </div>
        </div>
      </div>
    </div>



  )
}

export default Alerts