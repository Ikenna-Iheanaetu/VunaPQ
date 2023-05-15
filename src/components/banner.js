import React from "react";
import { Link } from "react-router-dom";


const Banner = () => {
    return(
        <div className="z-10">
            <h1 className="text-poppins text-9xl text-white">VunaPQ</h1>
            <button>
                <Link to="/upload">Uploads Page</Link>
            </button>
        </div>
    )
}

export default Banner