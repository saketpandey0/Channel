import { useEffect, useState } from "react";



const useDebounce = (input: string, delay: number) => {

    const [debouncedVal, setDebouncedVal] = useState(input);

    useEffect(()=> {
        const val = setTimeout(()=>{
            setDebouncedVal(input);
        }, delay);
        return ()=>{
            clearInterval(val);
        }
    }, [input]);

    return debouncedVal;
}

export default useDebounce;