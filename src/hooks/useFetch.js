/**
 * Custom Hook: useFetch
 * Manages async data fetching with loading, error, and caching states
 * Provides retry mechanism for failed requests
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { getWikipediaPageSummary, formatWikipediaData } from '../services/wikipediaService'

/**
 * Custom hook for fetching Wikipedia data
 * @param {string} title - Wikipedia page title
 * @param {Object} options - Configuration options
 * @returns {Object} { data, loading, error, retry }
 */
export function useWikipediaData(title, options = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Use refs to prevent re-renders from stale closures
  const abortControllerRef = useRef(null)
  const fetchTimeoutRef = useRef(null)
  const retryCountRef = useRef(0)
  const maxRetries = options.maxRetries ?? 3

  /**
   * Perform the fetch
   */
  const performFetch = useCallback(async () => {
    // Don't fetch if title is empty
    if (!title || !title.trim()) {
      setData(null)
      setError(null)
      setLoading(false)
      return
    }

    // Cancel previous fetch if still in progress
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Reset states
    setLoading(true)
    setError(null)
    abortControllerRef.current = new AbortController()

    try {
      const result = await getWikipediaPageSummary(title)

      // Don't update state if fetch was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return
      }

      if (result.error) {
        // Handle different error types
        if (result.errorCode === 'NOT_FOUND') {
          setError({
            message: `Không tìm thấy bài viết Wikipedia cho "${title}"`,
            code: 'NOT_FOUND',
            url: result.url,
            retryable: false
          })
        } else if (result.errorCode === 'TIMEOUT' || result.errorCode === 'NETWORK_ERROR') {
          setError({
            message: 'Không thể kết nối đến Wikipedia. Vui lòng thử lại.',
            code: result.errorCode,
            retryable: true
          })
        } else if (result.errorCode === 'RATE_LIMIT') {
          setError({
            message: 'Wikipedia đang bận. Vui lòng thử lại sau.',
            code: 'RATE_LIMIT',
            retryable: true
          })
        } else {
          setError({
            message: 'Lỗi khi tải dữ liệu từ Wikipedia',
            code: result.errorCode || 'UNKNOWN',
            retryable: true
          })
        }
        setData(null)
      } else {
        // Success
        const formattedData = formatWikipediaData(result)
        setData(formattedData)
        setError(null)
        retryCountRef.current = 0 // Reset retry count on success
      }
    } catch (err) {
      // Handle unexpected errors
      if (!abortControllerRef.current?.signal.aborted) {
        setError({
          message: 'Lỗi không xác định',
          code: 'UNKNOWN_ERROR',
          retryable: true,
          originalError: err.message
        })
        setData(null)
      }
    } finally {
      setLoading(false)
    }
  }, [title])

  /**
   * Retry mechanism
   */
  const retry = useCallback(async () => {
    if (retryCountRef.current >= maxRetries) {
      setError(prev => ({
        ...prev,
        message: 'Đã vượt quá số lần thử lại. Vui lòng thử lại sau.'
      }))
      return
    }

    retryCountRef.current += 1

    // Add exponential backoff: 1s, 2s, 4s, etc.
    const backoffDelay = Math.pow(2, retryCountRef.current - 1) * 1000
    await new Promise(resolve => setTimeout(resolve, backoffDelay))

    performFetch()
  }, [performFetch, maxRetries])

  /**
   * Fetch when title changes
   */
  useEffect(() => {
    retryCountRef.current = 0
    performFetch()

    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current)
      }
    }
  }, [performFetch])

  return {
    data,
    loading,
    error,
    retry,
    isRetryable: error?.retryable ?? false,
    hasError: error !== null,
    hasData: data !== null
  }
}

/**
 * Generic fetch hook (reusable for other APIs)
 * @param {Function} fetchFn - Async function to execute
 * @param {Array} deps - Dependency array
 * @returns {Object} { data, loading, error, retry }
 */
export function useFetch(fetchFn, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const abortControllerRef = useRef(null)
  const retryCountRef = useRef(0)

  const performFetch = useCallback(async () => {
    // Cancel previous fetch
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    setLoading(true)
    setError(null)
    abortControllerRef.current = new AbortController()

    try {
      const result = await fetchFn()

      if (abortControllerRef.current?.signal.aborted) {
        return
      }

      setData(result)
      setError(null)
      retryCountRef.current = 0
    } catch (err) {
      if (!abortControllerRef.current?.signal.aborted) {
        setError(err)
        setData(null)
      }
    } finally {
      setLoading(false)
    }
  }, [fetchFn])

  const retry = useCallback(async () => {
    retryCountRef.current += 1
    const backoffDelay = Math.pow(2, retryCountRef.current - 1) * 1000
    await new Promise(resolve => setTimeout(resolve, backoffDelay))
    performFetch()
  }, [performFetch])

  useEffect(() => {
    performFetch()

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    data,
    loading,
    error,
    retry
  }
}

export default useWikipediaData
