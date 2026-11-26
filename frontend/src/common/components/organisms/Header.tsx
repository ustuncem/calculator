import Logo from '../molecules/Logo'
import ThemeToggle from '../molecules/theme-toggle/ThemeToggle'

export default function Header() {
  return (
    <header className="flex items-center justify-between">
      <Logo />
      <ThemeToggle />
    </header>
  )
}
