import { createSlice } from '@reduxjs/toolkit';

export const initialState = {
    service: '',
}

export const inputSlice = createSlice({
	name: 'input',
	initialState,
	reducers: {
        updateData: (state, action) => {
            const { service } = action.payload;
            state.service = service;
        },
	},
});

export const { updateData } = inputSlice.actions;

export default inputSlice.reducer;