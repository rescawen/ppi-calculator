import { borderClasses } from '../utils/utils'
// import ResolutionBlock from './ResolutionBlock'
import { Action } from '../reducers/displayDataReducer'

const watchResolutions = [
    { horizontal: 272, vertical: 340, diagonal: 1.337, label: 'Apple watch 38mm' },
    { horizontal: 312, vertical: 390, diagonal: 1.534, label: 'Apple watch 42mm' },
    { horizontal: 368, vertical: 448, diagonal: 1.757, label: 'Apple watch 44mm' },
    { horizontal: 272, vertical: 340, diagonal: 1.337, label: 'Apple watch 38mm' },
    { horizontal: 312, vertical: 390, diagonal: 1.534, label: 'Apple watch 42mm' },
    { horizontal: 368, vertical: 448, diagonal: 1.757, label: 'Apple watch 44mm' },
]

function Container({ dispatch }: { dispatch: React.Dispatch<Action> }) {
    return (
        <div className={`flex flex-wrap p-1 m-2 ${borderClasses}`}>
            {Array.from({ length: 24 }, (_, index) => (
                <div key={index} className={`m-1 p-1 w-72 ${borderClasses}`}>
                    {watchResolutions.map(({ horizontal, vertical, diagonal, label }, index) => (
                        <div key={index}>
                            <span
                                onClick={() => {
                                    dispatch({ type: 'SET_ALL', payload: { resolution: { horizontal, vertical }, diagonal } });
                                }}
                                className="text-blue-600 cursor-pointer underline"
                            >
                                {`${horizontal}x${vertical} @ ${diagonal}`}
                            </span>
                            &nbsp;{`${label}`}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    )
}

export default Container