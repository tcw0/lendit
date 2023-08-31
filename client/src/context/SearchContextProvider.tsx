import React, { createContext, useMemo, useState } from 'react'

type SearchContextType = {
  finalInput: string
  setFinalInput: (input: string) => void
}

const defaultValues: SearchContextType = {
  finalInput: '',
  setFinalInput: () => {},
}

export const SearchContext = createContext<SearchContextType>(defaultValues)

export function SearchContextProvider(props: { children: React.ReactNode }) {
  const { children } = props
  const [finalInput, setFinalInput] = useState<string>('')

  const value = useMemo(() => {
    return { finalInput, setFinalInput }
  }, [finalInput])

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  )
}
