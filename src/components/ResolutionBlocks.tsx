import type { Dispatch } from 'react'
import { borderClasses } from '../utils/utils'
import { Action } from '../reducers/displayDataReducer'
import devices from '../data/devices.json'

function Container({ dispatch }: { dispatch: Dispatch<Action> }) {
   return (

      // column based layout
      <div className="columns-4">
         {devices.map(devices => (
            <div key={devices.brand} className={`relative pt-3 px-2 pb-2 m-2 ${borderClasses}`}>
               <div className="absolute -top-3.5 left-1/4 transform -translate-x-1/2 bg-white px-1">
                  {devices.brand}
               </div>
               {devices.devices.map(({ resolution: { horizontal, vertical }, diagonal, label }, index) => (
                  <div key={index}>
                     <span className="text-blue-600 cursor-pointer underline"
                        onClick={() => dispatch({ type: 'SET_ALL', payload: { resolution: { horizontal, vertical }, diagonal } })}
                     >
                        {`${horizontal}x${vertical} @ ${diagonal}`}
                     </span>
                     &nbsp;{`${label}`}
                  </div>
               ))}
            </div>
         ))}
      </div>

      // flexbox based layout
      // <div className={`flex flex-wrap items-start`}>
      //    {devices.map(devices => (
      //       <div key={devices.brand} className={`relative pt-3 px-2 pb-2 m-2 ${borderClasses}`}>
      //          <div className="absolute -top-3.5 left-1/4 transform -translate-x-1/2 bg-white px-1">
      //             {devices.brand}
      //          </div>
      //          {devices.devices.map(({ resolution: { horizontal, vertical }, diagonal, label }, index) => (
      //             <div key={index}>
      //                <span className="text-blue-600 cursor-pointer underline"
      //                   onClick={() => dispatch({ type: 'SET_ALL', payload: { resolution: { horizontal, vertical }, diagonal } })}
      //                >
      //                   {`${horizontal}x${vertical} @ ${diagonal}`}
      //                </span>
      //                &nbsp;{`${label}`}
      //             </div>
      //          ))}
      //       </div>
      //    ))}
      // </div>
   )
}

export default Container