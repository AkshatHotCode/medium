import { Auth } from "../components/Auth"
import { Quote } from "../components/Qoute"

export const Signup = () => {
    return <div>
        <div className="grid grid-cols-2">
            <div>
                <Auth></Auth>
            </div>
            <div className="invisible lg:visible">
                <Quote/>
            </div>

        </div>
    </div>
}