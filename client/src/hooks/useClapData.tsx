import { useCallback, useEffect, useState } from 'react';
import {useClapContext} from '../context/ClapContext';
import { getStoryClapData, toggleStoryClap } from '../api/featureServices';

export const useClapData = ({storyId}: {storyId: string}) => {
    const { claps, dispatch } = useClapContext();
    const [isLoading, setIsLoading] = useState(false);
    const [isToggling, setIsToggling] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const clapData = claps[storyId];

    const fetchClapData = useCallback(async () => {
        if(clapData) return;
        setIsLoading(true);
        setError(null);

        try {
            const data = await getStoryClapData(storyId);
            dispatch({
                type: 'SET_CLAP_DATA',
                storyId,
                data: {
                    clapCount: data.clapCount,
                    userClapped: data.userClapped,
                    allowClaps: data.allowClaps
                }
            })
        } catch (error) {
            setError('Failed to fetch clap data');
        } finally {
            setIsLoading(false);
        }
    }, [clapData, dispatch, storyId]);


    const toggleClap = useCallback(async () => {
        if(!clapData || !clapData.allowClaps || isToggling) return;
        setIsToggling(true);
        setError(null);

        dispatch({ 
            type: 'TOGGLE_CLAP',
            storyId
        })

        try {
            const result = await toggleStoryClap(storyId);

            dispatch({
                type: 'UPDATE_CLAP_COUNT',
                storyId,
                count: result.clapCount,
                userClapped: result.clapped,
            })
        }catch (err: any){
            dispatch({
                type: 'TOGGLE_CLAP',
                storyId
            });

            const errMsg = err.response?.data?.error || 'Failed to toggle clap';
            setError(errMsg);
            console.error('Toggle clap error: ', err);
        } finally {
            setIsToggling(false);
        }
    }, [storyId, clapData, isToggling, dispatch])

    useEffect(()=> {
        fetchClapData();
    }, [fetchClapData]);

    return {
        clapCount: clapData?.clapCount || 0,
        userClapped: clapData?.userClapped || false,
        allowClaps: clapData?.allowClaps ?? true,
        isLoading,
        isToggling,
        error,
        toggleClap
    };
}