import React from 'react'
import { HiOutlineTrash } from "react-icons/hi2";

const FileList = ({ files, setFiles }) => {
    const filterFiles = (filename) => {
        setFiles(files.filter(file => file.name !== filename))
    }

    return (
        <>
            <ul className='flex flex-col gap-4'>
                <h3>{files > 0 ? 'No Chosen Files' : 'Chosen Files'}</h3>
                {files && files.map( file => (
                    <div className='flex justify-between  items-center p-4 rounded-md border-[1px] border-black' key={file.name}>
                        <li className='inline-block whitespace-nowrap text-ellipsis overflow-hidden'>{file.name}</li>
                        <HiOutlineTrash className='text-2xl  hover:cursor-pointer ' onClick={() => filterFiles(file.name)} />
                    </div>
                ))}
            </ul>
        </>
    )
}

export default FileList