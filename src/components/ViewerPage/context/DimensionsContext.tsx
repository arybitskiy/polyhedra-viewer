import React, {
  createContext,
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react"
import { noop } from "lodash-es"

type Dimension = number[]

interface DimensionsContextValue {
  dimension?: Dimension
  goNext: () => void
}

interface DimensionsContextProviderProps {
  dimensions: Dimension[]
}

export const DimensionsContext = createContext<DimensionsContextValue>({
  dimension: [0, 0],
  goNext: noop,
})

export const DimensionsContextProvider: FunctionComponent<DimensionsContextProviderProps> = ({
  children,
  dimensions,
}) => {
  const [activeDimensionId, setActiveDimensionId] = useState(-1)
  const [shouldRender, setShouldRender] = useState(false)

  const goNext = useCallback(() => {
    setShouldRender(false)
    if (activeDimensionId + 1 < dimensions.length) {
      setTimeout(() => {
        setActiveDimensionId((c) => c + 1)
        setShouldRender(true)
      }, 1000)
    }
  }, [setShouldRender, activeDimensionId, dimensions, setActiveDimensionId])

  useEffect(() => {
    goNext()
    // setShouldRender(true)
    // setActiveDimensionId(0)
    // eslint-disable-next-line
  }, [])

  const dimension = shouldRender ? dimensions[activeDimensionId] : undefined

  return (
    <DimensionsContext.Provider
      value={{
        dimension,
        goNext,
      }}
    >
      {dimension ? children : null}
    </DimensionsContext.Provider>
  )
}
