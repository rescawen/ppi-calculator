import type { Dispatch } from 'react'
import { borderClasses } from '../utils/utils'
import { DisplayDataState, Action, estimatedScreenSizes } from '../reducers/displayDataReducer'

function Inputs({ displayData, dispatch }: { displayData: DisplayDataState; dispatch: Dispatch<Action> }) {

    // console.log(`screen ${screen.orientation.type}`)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, dimension: 'horizontal' | 'vertical' | 'diagonal') => {
        const value = Number(e.target.value);
        if (dimension === 'horizontal' || dimension === 'vertical') {
            const newResolution = {
                ...displayData.resolution,
                [dimension]: value
            }
            dispatch({ type: 'SET_RESOLUTION', payload: newResolution })
        } else {
            dispatch({ type: 'SET_DIAGONAL', payload: value })
        }
    };

    return (
        <div className={`${borderClasses} grid grid-cols-3 lg:max-w-3xl p-2 m-2`}>
            <div data-testid="inputs" className="col-span-2 grid grid-cols-1 sm:grid-cols-11 w-full sm:max-w-md">
                <div className="col-span-4">
                    <label>Horizontal resolution:</label>
                </div>
                <div className="col-span-7">
                    <input
                        type="number"
                        className="border-2 border-gray-300 rounded-md mr-2"
                        value={displayData.resolution.horizontal}
                        onChange={(e) => handleChange(e, 'horizontal')}
                    />
                    <span>pixels</span>
                </div>

                <div className="col-span-4">
                    <label>Vertical resolution:</label>
                </div>
                <div className="col-span-7">
                    <input
                        type="number"
                        className="border-2 border-gray-300 rounded-md mr-2"
                        value={displayData.resolution.vertical}
                        onChange={(e) => handleChange(e, 'vertical')}
                    />
                    <span>pixels</span>
                </div>

                <div className="col-span-4">
                    <label>Diagonal:</label>
                </div>
                <div className="col-span-7">
                    <input
                        type="number"
                        className="border-2 border-gray-300 rounded-md mr-2"
                        value={displayData.diagonal}
                        onChange={(e) => handleChange(e, 'diagonal')}
                    />
                    <span>inches</span>
                </div>
            </div>

            <div className="col-span-1 grid">
                <div>
                    Total pixels: {displayData.resolution.horizontal * displayData.resolution.vertical}
                </div>
                <div>
                    Pixel density: <span className="font-semibold text-rose-700">{displayData.pixelPerInch}</span>
                </div>
                <div>
                    {estimatedScreenSizes.length > 1 ? (
                        <>Is your screen size {estimatedScreenSizes.slice(1).map((alternateScreenSize, index) => (
                            <span key={index}>
                                <span
                                    onClick={() => {
                                        dispatch({ type: 'SET_DIAGONAL', payload: alternateScreenSize })
                                    }}
                                    className="text-blue-600 cursor-pointer underline"
                                >
                                    {alternateScreenSize}
                                </span>
                                {index < estimatedScreenSizes.length - 2 ? ', ' : ''}
                            </span>
                        ))}?</>
                    ) : (
                        <>Your resolution is unique.</>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Inputs