import image from "../images/log.jpeg"
import navbar from "./navbar.css";
function Navbar(){
    return(
        <nav>
            <img src={image} alt="This is log"/>

            <div>
                <ul id='navbar'>
                    <li> <a href="">Expert Sourcing</a></li>
                    <li> <a href="">Contract Manufacturing</a></li>
                    <li> <a href="">Buy</a></li>
                    <li> <a href="">Financing</a></li>
                    <li> <a href="">About Us</a></li>
                </ul>
            </div>
        </nav>
    )
}

export default Navbar;