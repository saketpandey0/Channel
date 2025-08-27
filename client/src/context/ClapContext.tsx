import React, {createContext, useContext, useReducer, type ReactNode} from 'react';
import type { ClapAction, ClapState } from '../types/clap';


const clapReducer = (state: ClapState, action: ClapAction): ClapState => {
    switch (action.type){
        case 'SET_CLAP_DATA':
            return {
                ...state,
                [action.storyId]: action.data
            };
        case 'TOGGLE_CLAP':
            const currentData = state[action.storyId];
            if(!currentData) return state;
            return {
                ...state,
                [action.storyId]: {
                    ...currentData,
                    userClapped: !currentData.userClapped,
                    clapCount: currentData.userClapped
                        ? Math.max(currentData.clapCount - 1, 0)
                        : currentData.clapCount + 1
                }
            }
        case 'SET_BATCH_DATA':
            return {
                ...state,
                ...action.data
            };

        case 'UPDATE_CLAP_COUNT':
            return {
                ...state,
                [action.storyId] : {
                    ...state[action.storyId],
                    clapCount: action.count,
                    userClapped: action.userClapped
                }
            };
        default:
            return state;
    }
};


const ClapContext = createContext<{
    claps: ClapState;
    dispatch: React.Dispatch<ClapAction>;
} | null>(null);

export const ClapProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [claps, dispatch] = useReducer(clapReducer, {});
    
    return (
        <ClapContext.Provider value={{ claps, dispatch }}>
            {children}
        </ClapContext.Provider>
    );
};

export const useClapContext = () => {
    const context = useContext(ClapContext);
    if (!context) {
        throw new Error('useClapContext must be used within ClapProvider');
    }
    return context;
};