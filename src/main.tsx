import { HashRouter } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
//import React from 'react'
import { TonConnectUIProvider } from '@tonconnect/ui-react'

createRoot(document.getElementById('root')!).render(
    <TonConnectUIProvider manifestUrl="https://gist.githubusercontent.com/romanovichim/e797fa898a9d4fc331d7441f361b591b/raw/eb1f39f4b6d1bc8382300e75704d6643d37f7403/centrurion.txt">
      <HashRouter>
        <App />
      </HashRouter>
    </TonConnectUIProvider>
)
