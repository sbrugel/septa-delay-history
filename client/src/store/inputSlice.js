import { createSlice } from '@reduxjs/toolkit';

export const initialState = {
    service: '',
    intervalDays: '',
}

export const inputSlice = createSlice({
	name: 'input',
	initialState,
	reducers: {
        updateData: (state, action) => {
            const { service, intervalDays } = action.payload;
            state.service = service;
            state.intervalDays = intervalDays;
        },
	},
});

export const { updateData } = inputSlice.actions;

export default inputSlice.reducer;