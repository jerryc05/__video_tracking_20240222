/* @refresh reload */
import { render } from 'solid-js/web'

import './index.css'
import App from './App'

const root = document.getElementById('root')

if (root instanceof HTMLElement) render(() => <App />, root)
else
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?'
  )
