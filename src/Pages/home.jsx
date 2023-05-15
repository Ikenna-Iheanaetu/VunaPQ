import React from 'react'
import Design from '../components/design';
import Banner from '../components/banner'

const Home = () => {
    const height = 'h-[550px]'

    return (
        <div className=" w-full h-[550px] bg-gradient-to-b from-green-400 to-slate-900 to-90% bg-cover bg-no-repeat bg-center rounded-b-[10rem]">
            <div className='flex justify-center pt-[11rem]'>
                <Banner />
            </div>
            <div className="w-full h-[550px] absolute top-0 left-0">
                <Design height={height} />
            </div>
        </div>
    );
}

export default Home;