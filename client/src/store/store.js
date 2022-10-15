import { configureStore } from '@reduxjs/toolkit';
import inputSlice from './inputSlice';

export default configureStore({
    reducer: {
        input: inputSlice
    },
})