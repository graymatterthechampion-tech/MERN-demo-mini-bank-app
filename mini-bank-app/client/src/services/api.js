import axios from 'axios'

const api = axios.create({
    baseURL: '/api',
    headers: {
        "content-Type": 'application/json'
    }
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('minibank_token');
    if(token){
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
}, (error) => Promise.reject(error))

api.interceptors.response.use((response) => response,
(error) => {
    if(error.response && error.response.status === 401){
        if(localStorage.getItem('minibank_token')){
            localStorage.removeItem('minibank_token')
            localStorage.removeItem('minibank_user')
            window.location.reload()
        }
    }
    return Promise.reject(error)
})

export default api;