import { ShiftCardProps } from "../../types/components";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import {useDropzone} from 'react-dropzone'

export default function UploadCSV(){
    const onDrop = useCallback((acceptedFiles: File[]) =>{
        handleRemove();
        const file: File = acceptedFiles[0];
        const reader = new FileReader();
        reader.onload = () => {
            setFileData({
                fileName: file.name,
                fileSize: file.size/1000
            })
            const text: string = reader.result as string;
            const lines = text.split(/\r?\n/);
            if (lines.length > 0){
                lines.slice(1).map((line: string) => {
                    const entry: string[] = line.split(",")
                    const newShift: ShiftCardProps = {
                        title: entry[0],
                        date: `${entry[2]}`,
                        time: `${entry[3]} - ${entry[4]}` ,
                        staffNo: parseInt(entry[8]),
                        unfilledStaff: 0
                    }
                    setShiftData((prev: ShiftCardProps[]|null) => prev? [...prev, newShift]: [newShift]);
                    console.log(entry);
                } );
            }
            
        }
        reader.readAsText(file);
    },[]);
    const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})

    const [fileData, setFileData] = useState<FileData|null>(
        null);

    const [shiftData, setShiftData] = useState<ShiftCardProps[]|null>(null);
    
    function handleRemove(){
        setFileData(null);
        setShiftData(null)
    }

    return <div className = "bg-tertiary-bg flex flex-col gap-8 px-15 py-8">
        <h1 className="font-montserrat-b text-black text-3xl">Upload Files</h1>
        <div {...getRootProps({className : "py-15 flex flex-col gap-2.5 items-center border-1 border-dashed border-black rounded-lg"})}>
                <p className="font-montserrat-b text-xl text-secondary-text">Drag and drop files here</p>
                <p className="font-montserrat-b text-base text-secondary-text">Supported File Types: .csv, .xlsx</p>
                <p className="font-montserrat-b text-base text-secondary-text">Max Size: 100MB</p>
                <p className="font-montserrat-b text-base text-secondary-text">Max Files: 1</p>
                <input {...getInputProps()}></input>
                <button className="hover:opacity-80 hover:cursor-pointer p-2.5 rounded-lg bg-primary-blue font-montserrat-smb text-white text-base">Choose File</button>
        </div>
        <div id="uploadcsv-uploaded" className="py-6 flex flex-col gap-4">
            <h2 className="font-montserrat-b text-black text-2xl">Files</h2>
            {fileData && <UploadFileCard fileName={fileData.fileName} fileSize={fileData.fileSize} handleRemove={handleRemove}/>}
            {fileData==null && <div className="flex flex-row"><p className="font-montserrat-b text-gray-600 whitespace-pre">Haven’t created a file? Download our custom template </p><button className="hover:cursor-pointer hover:opacity-80 underline text-primary-blue text-base font-montserrat-b">here</button></div>}
        </div>
        <div id="uploadcsv-uploaded" className="py-6 flex flex-col gap-4">
            <h2 className="font-montserrat-b text-black text-2xl">Preview</h2>
            {shiftData && shiftData.map((data: ShiftCardProps) => <UploadShiftCard {...data}/>)}
            {shiftData == null && <p className="font-montserrat-b text-gray-600 text-base">No shift data entered</p>}
        </div>
        {shiftData && <button className="hover:cursor-pointer self-center p-2.5 rounded-8 w-fit  bg-primary-blue text-white font-montserrat-smb text-base ">Submit</button>}
    </div>
}
type FileData = {
    fileName: string|null;
    fileSize: number|null;
};

type UploadFileCardProps = {
    fileName: string|null;
    fileSize: number|null;
    handleRemove: Function;
};

type ShiftObject = {

}

function UploadFileCard({fileName, fileSize, handleRemove}: UploadFileCardProps){
    return <div className="w-fit px-5 py-3 bg-secondary-bg flex flex-row gap-40 items-center rounded-lg">
        <div className="flex flex-row gap-3 items-center">
            <img className="h-8 w-8" src="/icons/filecorner.svg"/>
            <p className="font-montserrat-b text-base text-gray-600">{fileName}</p>
        </div>
        <div className="flex flex-row gap-5">
            <p className="text-gray-600 text-base font-montserrat-b">{`${fileSize}KB`}</p>
            <button onClick={handleRemove}className="hover:cursor-pointer underline font-montserrat text-primary-blue">Remove</button>
        </div>
    </div>
}

function UploadShiftCard({title, date, time, staffNo}: ShiftCardProps){
    const navigate = useNavigate();
    function handleManageClick(){
        console.log("Showing details");
    }
    return <div className="bg-secondary-bg flex flex-row p-5 items-center justify-between rounded-2xl">
        <div className="flex flex-col gap-4"> 
            <p className="text-XL font-montserrat-b text-primary-text">{title}</p>
            <div className="flex flex-row gap-2">
                <img src = "/public/icons/clock.svg"/>
                <p className="text-l font-montserrat text-secondary-text">{date}</p>
                <p className="text-l font-montserrat text-secondary-text">{time}</p>
            </div>
            <div className="flex flex-row gap-2">
                <img src = "/public/icons/users.svg" />
                <p className="text-l font-montserrat text-secondary-text">{staffNo}</p>
            </div>
        </div>
        <button className="hover:cursor-pointer hover:bg-gray-100 hover:text-secondary-text hover:opacity-80 bg-white rounded-md text-secondary-text py-2.5 px-4 border border-secondary-text font-montserrat-smb text-base"
        onClick={()=>handleManageClick()}>Manage</button>
    </div>
}