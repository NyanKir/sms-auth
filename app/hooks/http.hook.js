import {useState, useCallback} from 'react'

export const useHttp = () => {
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)


    const request = useCallback(async (url, method = 'POST', body, headers = {'Content-Type': 'application/json'}) => {
        setLoading(true)
        try {
            const res = await fetch(url, {method, body, headers})
            const data = await res.json()
            setLoading(false)
            return [data,res]
        } catch (e) {
            setError(e.message)
            setLoading(false)
        }

    }, [])

    return {request, error, loading}
}