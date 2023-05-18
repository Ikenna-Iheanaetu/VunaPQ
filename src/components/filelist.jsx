import React from 'react'
import { HiOutlineTrash } from "react-icons/hi2";

const FileList = ({ files, setFiles }) => {
    const filterFiles = (filename) => {
        setFiles(files.filter(file => file.name !== filename))
    }
    console.log(files);
   
    return (
        <>
            <ul className='flex flex-col gap-4'>
                <h3  className={files.length > 0 ? 'text-green-500' : 'text-red-600'}>{files.length > 0 ? 'Chosen File(s)' : 'No Chosen File(s)'}</h3>
                {files && files.map( file => (
                    <div className='flex justify-between  items-center p-4 rounded-md border-[1px] border-black' key={file.name}>
                        <li className='inline-block whitespace-nowrap text-ellipsis overflow-hidden pl-2'>{file.name}</li>
                        <HiOutlineTrash className='text-[27.5px]  hover:cursor-pointer ' onClick={() => filterFiles(file.name)} />
                    </div>
                ))}
            </ul>
        </>
    )
}

export default FileList