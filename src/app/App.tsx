import { PromptsPage } from './pages/PromptsPage'
import { Layout } from './components/Layout'
import { ThemeProvider } from './components/ThemeProvider'
import { Toaster } from '@/app/components/ui/toaster'
import { WelcomePrompts } from './components/WelcomePrompts'

export function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="iprompt-theme">
      <WelcomePrompts />
      <Layout>
        <PromptsPage />
      </Layout>
      <Toaster />
    </ThemeProvider>
  )
}