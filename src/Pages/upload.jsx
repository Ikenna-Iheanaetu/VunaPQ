import React from 'react'
import { useState } from "react"
import { Link } from 'react-router-dom';
import Image from '../assets/image3.png'
import { IoCloudUploadOutline } from "react-icons/io5";
import Design from '../components/design';
import FileList from '../components/filelist';

const Upload = () => {
    const height = 'h-[300px]'

    const [department, setDeparment] = useState('')
    const [semester, setSemester] = useState('')
    const [courseCode, setCourseCode] = useState('')
    const [files, setFiles] = useState([])

    const onChangeDepartment = (event) => {
        const value = event.value
        setDeparment(value)

    }
    const onChangeSemester = (event) => {
        const value = event.target.value
        setSemester(value)
    }
    const onChangeCourseCode = (event) => {
        const value = event.target.value
        setCourseCode(value)
    }
    const onChangeFile = (event) => {
        const file = event.target.files[0]
        setFiles([...files, file])
    }
    console.log(files);

    return (
        <>

            <div className='grid grid-cols-10 h-screen max-[770px]:hidden'>
                <div className='col-span-4 bg-gradient-to-b from-green-400 to-slate-900 to-80% rounded-r-sm rounded-b-sm flex justify-center items-center'>
                    <div className='flex flex-col gap-5 items-center justify-center'>
                        <img src={Image} alt="upload" className='w-full h-[300px] max-[1000px]:h-[250px]' />
                        <h2 className='text-poppins text-slate-100 text-5xl hover:cursor-pointer max-[1000px]:text-4xl'>
                            <Link to='/'>VunaPQ</Link>
                        </h2>
                        <p className='text-slate-300 max-[1000px]:text-[14px]'>Upload your <span className='font-semibold'>VUNA</span> past examination  questions</p>
                    </div>
                </div>
                <div className='col-span-6 px-[90px] py-[40px] max-[1000px]:px-[30px]'>
                    <div className='flex flex-col'>
                        <div className='text-center mb-10'>
                            <h1 className='text-3xl'>VunaPQ</h1>
                        </div>
                        <div className='grid grid-cols-6 gap-8'>
                            <div className='col-span-6'>
                                <div className='flex flex-col gap-3'>
                                    <label for="Department">Department</label>
                                    <input type="text" name="" value={department} onChange={onChangeDepartment} placeholder='e.g Software Engineering' className='border-[1px] border-black outline-none h-[40px] rounded-md p-6' />
                                </div>
                            </div>
                            <div className='col-span-3'>
                                <div className='flex flex-col gap-3'>
                                    <label for="Department">Semester</label>
                                    <input type="text" name="" value={semester} onChange={onChangeSemester} placeholder='e.g Second' className='border-[1px] border-black outline-none h-[40px] rounded-md p-6' />
                                </div>
                            </div>
                            <div className='col-span-3'>
                                <div className='flex flex-col gap-3'>
                                    <label for="Department">Course Code</label>
                                    <input type="text" name="" value={courseCode} onChange={onChangeCourseCode} placeholder='e.g SEN182' className='border-[1px] border-black outline-none h-[40px] rounded-md p-6' />
                                </div>
                            </div>
                            <div className='col-span-6'>
                                <div class="flex items-center justify-center w-full">
                                    <label for="dropzone-file" class="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-800 border-dashed rounded-lg cursor-pointer bg-gray-50 =">
                                        <div class="flex flex-col items-center justify-center pt-5 pb-6">
                                            <IoCloudUploadOutline className='text-3xl mb-5' />
                                            <p class="mb-2 text-sm text-gray-900"><span class="font-semibold text-[18px]">Click to Upload</span></p>
                                            <p class="text-xs text-gray-900">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                                        </div>
                                        <input id="dropzone-file" type="file" onChange={onChangeFile} class="hidden" />
                                    </label>
                                </div>
                            </div>
                            <div className='col-span-6'>
                                <FileList files={files} setFiles={setFiles} />
                            </div>
                        </div>

                    </div>
                    <button className='flex mt-9 gap-2 border-[1px] border-gray-900 p-4 rounded-md hover:bg-black hover:first:text-white hover:last:text-white'>
                        <IoCloudUploadOutline className='text-2xl' />
                        <p>Submit</p>
                    </button>
                </div>
            </div>

            <div className='min-[770px]:hidden z-[1000px]'>
                <div className='mb-5 h-[300px] bg-gradient-to-b from-green-400 to-slate-900 to-80% rounded-b-xl flex justify-center items-center'>
                    <div className='flex flex-col gap-3 items-center z-10'>
                        <h2 className='text-poppins text-slate-100 text-5xl hover:cursor-pointer max-[1000px]:text-4xl'>
                            <Link to='/'>VunaPQ</Link>
                        </h2>
                        <p className='text-slate-300 max-[1000px]:text-[14px]'>Upload your <span className='font-semibold'>VUNA</span> past examination  questions</p>
                    </div>
                </div>
                <div className='p-7 flex flex-col gap-4'>
                    <div className='flex flex-col gap-3'>
                        <label for="Department">Department</label>
                        <input type="text" name="" value={department} onChange={onChangeDepartment} placeholder='e.g Software Engineering' className='border-[1px] border-black outline-none h-[40px] rounded-md p-6' />
                    </div>
                    <div className='flex flex-col gap-3'>
                        <label for="Department">Semester</label>
                        <input type="text" name="" value={semester} onChange={onChangeSemester} placeholder='e.g Second' className='border-[1px] border-black outline-none h-[40px] rounded-md p-6' />
                    </div>
                    <div className='flex flex-col gap-3'>
                        <label for="Department">Course Code</label>
                        <input type="text" name="" value={courseCode} onChange={onChangeCourseCode} placeholder='e.g SEN182' className='border-[1px] border-black outline-none h-[40px] rounded-md p-6' />
                    </div>
                    <div class="flex items-center justify-center w-full">
                        <label for="dropzone-file" class="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-800 border-dashed rounded-lg cursor-pointer bg-gray-50 =">
                            <div class="flex flex-col items-center justify-center pt-4 pb-5">
                                <IoCloudUploadOutline className='text-3xl mb-5' />
                                <p class="mb-2 text-sm text-gray-900"><span class="font-semibold text-[18px]">Click to upload</span></p>
                                <p class="text-xs text-gray-900">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                            </div>
                            <input id="dropzone-file" type="file" onChange={onChangeFile} class="hidden" />
                        </label>
                    </div>
                    <div className='col-span-6'>
                        <FileList files={files} setFiles={setFiles} />
                    </div>
                    <button className='flex justify-center mt-9 gap-2 border-[1px] border-gray-900 p-4 rounded-md hover:bg-black hover:first:text-white hover:last:text-white'>
                        <IoCloudUploadOutline className='text-2xl' />
                        <p>Submit</p>
                    </button>
                </div>
            </div>

            <div className="z-[-10px] min-[770px]:hidden w-full absolute top-0 left-0">
                <Design height={height} />
            </div>

        </>
    )
}

export default Upload