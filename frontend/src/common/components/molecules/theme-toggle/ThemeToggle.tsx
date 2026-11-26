import { useLayoutEffect, useState } from 'react'

import moon from '@common/assets/moon.svg'
import sun from '@common/assets/sun.svg'
import { AnimatedButton } from '@common/components/atoms/AnimatedButton'
import { ShadowBox } from '@common/components/atoms/shadow-box/ShadowBox'

import './ThemeToggle.css'

const themeKey = 'calculator-theme'

function readDarkMode() {
  try {
    return localStorage.getItem(themeKey) === 'dark'
  } catch {
    return false
  }
}

export default function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(readDarkMode)

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  function toggleTheme() {
    const next = !darkMode
    setDarkMode(next)
    try {
      localStorage.setItem(themeKey, next ? 'dark' : 'light')
    } catch {
      return
    }
  }

  return (
    <AnimatedButton
      aria-label="Dark mode"
      aria-pressed={darkMode}
      onPress={toggleTheme}
      className="rounded-xl"
    >
      <ShadowBox render={<span />} className="grid size-11 place-items-center">
        <span className="relative block size-5" aria-hidden="true">
          <img className="theme-moon" src={moon} alt="Crescent moon" />
          <span className="theme-sun">
            <img src={sun} alt="Sun" />
          </span>
        </span>
      </ShadowBox>
    </AnimatedButton>
  )
}
