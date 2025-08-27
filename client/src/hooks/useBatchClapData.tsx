import { useCallback, useEffect, useState } from "react";
import { useClapContext } from "../context/ClapContext";


export const useBatchClapData = (storyIds: string[]) => {
    const {dispatch} = useClapContext();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadBatchData = useCallback(async ()=>{
        if(storyIds.length === 0) return;
        setIsLoading(true);
        setError(null);

        try {
            const batchData = await getBatchClapData(storyIds);
            dispatch({
                type: 'SET_BATCH_DATA',
                data: batchData
            })
        } catch (error) {
            setError('Failed to load batch clap data');
            console.error("Batch Clap Data error");
        } finally {
            setIsLoading(false);
        }
    }, [dispatch, storyIds.join(',')]);

    useEffect(()=> {
        loadBatchData();
    }, [loadBatchData]);

    return {
        isLoading,
        error,
    };
}