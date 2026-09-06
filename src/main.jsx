import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles.css'
import './experience.css'
import './kiosk.css'
import './qa-fixes.css'
import './game-rules.css'
import './ios-home-polish.css'
import './official-icons.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
)
