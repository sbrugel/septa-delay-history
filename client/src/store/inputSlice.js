import { createSlice } from '@reduxjs/toolkit';

export const initialState = {
    service: '',
    intervalDays: '',
    date: ''
}

export const inputSlice = createSlice({
	name: 'input',
	initialState,
	reducers: {
        updateData: (state, action) => {
            const { service, intervalDays, date } = action.payload;
            state.service = service;
            state.intervalDays = intervalDays;
            state.date = date;
        },
	},
});

export const { updateData } = inputSlice.actions;

export default inputSlice.reducer;