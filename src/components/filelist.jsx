import React from 'react'
import { HiOutlineTrash } from "react-icons/hi2";

const FileList = ({ files, setFiles }) => {
    const filterFiles = (filename) => {
        setFiles(files.filter(file => file.name !== filename))
    }

    return (
        <>
            <ul className='flex flex-col gap-4'>
                {files && files.map( file => (
                    <div className='flex justify-between  items-center p-4 rounded-md border-[1px] border-black' key={file.name}>
                        <li className='max-[10px]:text-ellipsis overflow-hidden'>{file.name}</li>
                        <HiOutlineTrash className='text-3xl max-[500px]:text-4xl hover:cursor-pointer hover:border-[1px] hover:border-black rounded-[4px] p-1' onClick={() => filterFiles(file.name)} />
                    </div>
                ))}
            </ul>
        </>
    )
}

export default FileList