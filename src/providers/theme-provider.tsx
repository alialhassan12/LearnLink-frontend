import {
    createContext,
    useState,
    useEffect,
    useContext,
    type ReactNode
} from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext=createContext<ThemeContextType|null>(null);

export function ThemeProvider({children}: {children: ReactNode}){
    const [theme,setTheme]=useState<Theme>(()=>{
        //Check local storage for theme,default to light mode if not found
        return (localStorage.getItem('theme') as Theme || 'light')
    });

    //Apply theme to the html element and update local storage
    useEffect(()=>{
        const root=document.documentElement;
        root.classList.remove('light','dark');
        root.classList.add(theme);
        localStorage.setItem('theme',theme);
    },[theme])

    const toggleTheme=()=>{
        setTheme((prevTheme)=>(prevTheme==='light'?'dark':'light'))
    }
    
    return (
        <ThemeContext.Provider value={{theme,toggleTheme}}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme(){
    const context=useContext(ThemeContext)
    if(!context){
        throw new Error('useTheme must be used within ThemeProvider')
    }
    return context
}