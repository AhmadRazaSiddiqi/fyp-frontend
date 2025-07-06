import { useReducer, createContext, useContext } from "react"

const WatchLaterContext = createContext()

const updateWatchLaterFunc = (state,action) => {
    console.log('WatchLaterContext - Action received:', action.type);
    console.log('WatchLaterContext - Current state length:', state.length);
    console.log('WatchLaterContext - New payload length:', action.payload?.length || 0);
    
    switch(action.type)
    {
        case "UPDATE_WATCH_LATER_LIST" : 
            {
                console.log('WatchLaterContext - Updating watch later list');
                return [...action.payload]
            }
        default :
            {
                console.log('WatchLaterContext - Default case, returning current state');
                return [...state]
            }
    }
}

const WatchLaterContextProvider = ({children}) => {
    const [ watchLaterList, dispatchWatchLaterList ] = useReducer(updateWatchLaterFunc,[])

    return (
        <WatchLaterContext.Provider value={{watchLaterList, dispatchWatchLaterList}}>
            {children}
        </WatchLaterContext.Provider>
    )
}

const useWatchLater = () => useContext(WatchLaterContext)

export { WatchLaterContextProvider, useWatchLater }