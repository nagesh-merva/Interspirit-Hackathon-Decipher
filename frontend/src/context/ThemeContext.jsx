import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  // Dark mode state
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('darkMode')
    return savedTheme ? JSON.parse(savedTheme) :
      window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
  }, [darkMode])

  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode)
  }

  // Sentiment data state
  const [sentimentData, setSentimentData] = useState({
    positive_score: 0,
    negative_score: 0,
    neutral_score: 0,
    ovr_score: 0,
    prev_ovr_score: 0, // Added previous overall score for comparison
    recent_mentions: []
  })

  const [negativeTweets, setNegativeTweets] = useState([])

  return (
    <ThemeContext.Provider value={{
      darkMode,
      toggleDarkMode,
      sentimentData,
      setSentimentData,
      negativeTweets,
      setNegativeTweets
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

// Custom hook to use ThemeContext
export function useTheme() {
  return useContext(ThemeContext)
}
