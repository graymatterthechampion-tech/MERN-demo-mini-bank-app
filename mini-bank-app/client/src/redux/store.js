import {configureStore} from '@reduxjs/toolkit'
import authReducer from './authSlice.js'
import accountReducer from './accountSlice.js'
import admin from './adminSlice.js'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        account: accountReducer,
        admin: admin
    }
})

export default store