import { borderClasses } from '../utils/utils'
import ResolutionBlock from './ResolutionBlock'

function Container() {
    return (
        <div className={`flex flex-wrap p-1 m-2 ${borderClasses}`}>
            {Array.from({ length: 24 }, (_, index) => (
                <ResolutionBlock key={index} />
            ))}
        </div>
    )
}

export default Container