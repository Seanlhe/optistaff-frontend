import { useCallback, useState } from "react";
import {useDropzone} from 'react-dropzone'
import UploadModal from "../../components/UploadModal";
import { ShiftObject, getError} from "../../utils/uploadjobs";

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
                lines.slice(1).map((line: string, index:number) => {
                    const entry: string[] = line.split(",")
                    const newShift: ShiftObject = {
                        title: entry[0],
                        category: entry[1],
                        description: entry[2],
                        date: entry[3],
                        startTime: entry[4],
                        endTime: entry[5],
                        address: entry[6],
                        zipCode: entry[7],
                        payRate: parseFloat(entry[8]),
                        staffNo: parseInt(entry[9]),
                        unfilledStaff: null
                    }
                    console.log(isNaN(newShift.payRate));
                    if (getError(newShift) != null){ 
                        setError((prev: string[]|null)=> prev? [...prev, `Error on line ${index + 1}: ${getError(newShift)}`]: [`Error on line ${index + 1}: ${getError(newShift)}`]);
                    }else{ //No error
                        setShiftData((prev: ShiftObject[]|null) => prev? [...prev, newShift]: [newShift]);
                        console.log(entry);
                    }
                } );
            }else{
                setError(["Error: no shifts detected in file. Please check your file."]);
            } 
        }
        reader.readAsText(file);
    },[]);

    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [selectedShift, setSelectedShift] = useState<ShiftObject|null>(null);
    const [fileData, setFileData] = useState<FileData|null>(
        null);
    const [shiftData, setShiftData] = useState<ShiftObject[]|null>(null);
    const [error, setError] = useState<string[]|null>(null);

    const {getRootProps, getInputProps, isDragActive} = useDropzone({
        onDrop,
        multiple: false,
        maxFiles: 1,
        accept: {
            'text/csv': ['.csv'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
        }
    });

    
    const handleRemove = ()=>{
        setError(null);
        setFileData(null);
        setShiftData(null)
    }

    const handleSave = (updatedShift: ShiftObject) => {
        setShiftData(prev => {
            if (!prev || !selectedShift) return prev; // return null if prev is null
            return prev.map(shift =>
                shift === selectedShift ? updatedShift : shift
            );
        });
        setModalVisible(false);
    }

    const handleSubmit = () => {
        console.log("submitted");
    }

    return <div className = {"relative bg-tertiary-bg flex flex-col gap-8 px-15 py-8"}>
        <h1 className={`font-montserrat-b text-black text-3xl ${modalVisible?"opacity-50": null}`}>Upload Files</h1>
        <div id="upload-dnd-box" {...getRootProps({className : `py-15 flex flex-col gap-2.5 items-center border-1 border-dashed border-black rounded-lg ${modalVisible?"opacity-50": null}`})}>
                <p className="font-montserrat-b text-xl text-secondary-text">Drag and drop files here</p>
                <p className="font-montserrat-b text-base text-secondary-text">Supported File Types: .csv, .xlsx</p>
                <p className="font-montserrat-b text-base text-secondary-text">Max Size: 100MB</p>
                <p className="font-montserrat-b text-base text-secondary-text">Max Files: 1</p>
                <input {...getInputProps()}></input>
                <button className="hover:opacity-80 hover:cursor-pointer p-2.5 rounded-lg bg-primary-blue font-montserrat-smb text-white text-base">Choose File</button>
        </div>
        <div id="uploadcsv-uploaded" className={`py-6 flex flex-col gap-4 ${modalVisible?"opacity-50": null}`}>
            <h2 className="font-montserrat-b text-black text-2xl">Files</h2>
            {fileData && <UploadFileCard fileName={fileData.fileName} fileSize={fileData.fileSize} handleRemove={handleRemove}/>}
            {fileData==null && <div className="flex flex-row"><p className="font-montserrat-b text-gray-600 whitespace-pre">Haven’t created a file? Download our custom template </p><button className="hover:cursor-pointer hover:opacity-80 underline text-primary-blue text-base font-montserrat-b">here</button></div>}
        </div>
        <div id="uploadcsv-uploaded" className={`py-6 flex flex-col gap-4 ${modalVisible?"opacity-50": null}`}>
            <h2 className="font-montserrat-b text-black text-2xl">Preview</h2>
            {shiftData && shiftData.map((data: ShiftObject) => <UploadShiftCard shiftObject={data} setModalVisible={setModalVisible} setSelectedShift={setSelectedShift}/>)}
            {!error && shiftData == null && <p className="font-montserrat-b text-gray-600 text-base">No shift data entered</p>}
            {error? error.map((err) => {return <p className="font-montserrat-smb text-sm text-pink-500">{err}</p>}) : null}
        </div>
        {modalVisible && <UploadModal onSave={handleSave} onClose={()=>setModalVisible(false)} shift={selectedShift}/>}
        {shiftData && <button onClick={handleSubmit} disabled={!modalVisible}className={`over:cursor-pointer hover:opacity-80 rounded-lg self-center p-2.5 rounded-8 w-fit  bg-primary-blue text-white font-montserrat-smb text-base ${modalVisible?"opacity-50": null}`}>Submit</button>}
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

type UploadShiftCardProps = {
    shiftObject: ShiftObject,
    setModalVisible: React.Dispatch<React.SetStateAction<boolean>>
    setSelectedShift: React.Dispatch<React.SetStateAction<ShiftObject|null>>
}


function UploadFileCard({fileName, fileSize, handleRemove}: UploadFileCardProps){
    return <div className="w-fit px-5 py-3 bg-white flex flex-row gap-40 items-center rounded-lg">
        <div className="flex flex-row gap-3 items-center">
            <img className="h-8 w-8" src="/icons/filecorner.svg"/>
            <p className="font-montserrat-b text-base text-gray-600">{fileName}</p>
        </div>
        <div className="flex flex-row gap-5">
            <p className="text-gray-600 text-base font-montserrat-b">{`${fileSize}KB`}</p>
            <button onClick={() => handleRemove()}className="hover:cursor-pointer underline font-montserrat text-primary-blue">Remove</button>
        </div>
    </div>
}

function UploadShiftCard({shiftObject, setModalVisible, setSelectedShift}: UploadShiftCardProps){
    function handleManage(){
        setModalVisible(true);
        setSelectedShift(shiftObject);
        console.log(shiftObject);
    }
    return <div className="bg-white flex flex-row p-5 items-center justify-between rounded-2xl">
        <div className="flex flex-col gap-4"> 
            <p className="text-XL font-montserrat-b text-primary-text">{shiftObject.title}</p>
            <div className="flex flex-row gap-2">
                <img src = "/public/icons/clock.svg"/>
                <p className="text-l font-montserrat text-secondary-text">{shiftObject.date}</p>
                <p className="text-l font-montserrat text-secondary-text">{`${shiftObject.startTime} - ${shiftObject.endTime}`}</p>
            </div>
            <div className="flex flex-row gap-2">
                <img src = "/public/icons/users.svg" />
                <p className="text-l font-montserrat text-secondary-text">{shiftObject.staffNo}</p>
            </div>
        </div>
        <button 
        className="hover:cursor-pointer hover:bg-gray-100 hover:text-secondary-text hover:opacity-80 bg-white rounded-md text-secondary-text py-2.5 px-4 border border-secondary-text font-montserrat-smb text-base"
        onClick={()=>handleManage()}>Manage</button>
    </div>
}