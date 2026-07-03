'use client'

import { useEffect } from 'react'

export default function ConsoleCapture() {
  useEffect(() => {
    // Only run if we're in an iframe
    if (typeof window === 'undefined' || window.self === window.top) {
      return
    }

    // Only on preview domains (*.vercel.app)
    if (!window.location.hostname.includes('vercel.app')) {
      return
    }

    const originalConsole = { ...console }
    const PORTAL_ORIGIN = window.location.ancestorOrigins?.[0] || '*'

    function sendToParent(type: 'console' | 'network', level: string, message: string) {
      try {
        window.parent.postMessage(
          { type, level, message, timestamp: new Date().toISOString() },
          PORTAL_ORIGIN
        )
      } catch (e) { /* ignore */ }
    }

    // Capture console
    console.log = (...args: any[]) => {
      originalConsole.log(...args)
      sendToParent('console', 'log', args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '))
    }

    console.warn = (...args: any[]) => {
      originalConsole.warn(...args)
      sendToParent('console', 'warn', args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '))
    }

    console.error = (...args: any[]) => {
      originalConsole.error(...args)
      sendToParent('console', 'error', args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '))
    }

    return () => {
      Object.assign(console, originalConsole)
    }
  }, [])

  return null
}
