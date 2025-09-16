import axios from 'axios'
import { useState } from 'react'

function Home(){

    const [userIp,setUserIP] = useState('')
    const [qaValue , setQAValue] = useState('')
    const [lang , setLang] = useState('english')
    const [qa , setQa] = useState(false)
    const [context , setContext] = useState([])
    const [loading , setLoading] = useState(false)
    
    
    async function handleUpload(e) {
        e.preventDefault()
        try {
            const listFiles = e.target.fileIP.files // retruns the list of files
            const formData = new FormData()

            for (let i =0;i<listFiles.length;i++){
                formData.append("files",listFiles[i])
            }
            formData.append("language",lang)
            
            console.log(...formData)

            setLoading(true)

            try{
                const res = await axios.post("http://127.0.0.1:8000/upload",formData)
                const data = res.data
                console.log(data.msg)
                let polishedData = data.msg
                for (let i =0;i<polishedData.length;i++){
                    console.log(polishedData[i].fileSummary)
                } 
                setContext(prev => [
                    ...prev,
                    ...polishedData.map(file => ({
                        summary: file.fileSummary
                    }))
                ])
                setQa(true)


            } catch (error){
                console.log("Error in axios : ",error)
            }
        } catch (error){
            console.log("Error in handleupload : ",error)
        } finally {
            setLoading(false)
        }
    }

    async function handleText(e) {
        e.preventDefault()
        try {
            
            setLoading(true)
            console.log("User input no problem")
            try {
                
                const res = await axios.post("http://127.0.0.1:8000/summary",{
                    text : userIp,
                    language : lang
                })
                const data = res.data
                const d = data.msg
                console.log(d)
                setContext(prev => [
                    ...prev,
                    {summary : d}
                ])
                setQa(true)
            } catch (error){
                console.log("Error in text Axios" , error)
            }
        } catch (error){
            console.log("Error in data input : ",error)
        } finally {
            setLoading(false)
        }
    }

    async function handleQA(e) {
        e.preventDefault()
        console.log(qaValue)
        setLoading(true)
        try {
            const summaryOnly = context.map((con) => ({summary : con.summary}))
            const res = await axios.post('http://127.0.0.1:8000/qa',{
                question : qaValue,
                context : summaryOnly,
                language : lang
            })
            const data = res.data
            const polishedData = data.msg
            console.log(polishedData)
        } 
        catch (error){
            console.log("Error in qa : ",error)
        } finally {
            setLoading(false)
        }
    }

    function Spinner() {
        return <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>;
    }

    

    return (
        <div className="h-screen w-full flex justify-center items-center bg-blue-950">
            <div className="flex flex-col">
                <div className="bg-white rounded-2xl">
                    <div>
                        <form action="submit" onSubmit={handleText}>
                            <input type="text" name='summText' value={userIp} onChange={(e) => {setUserIP(e.target.value)}} placeholder="Enter the text" className="p-2 border-2 rounded-2xl"/>
                            <button type="submit">Submit</button>
                        </form>
                    </div>
                </div>
                <div className="bg-teal-200 p-2 rounded-2xl">
                    <div>
                        <form action="submit" onSubmit={handleUpload}>
                            <input type="file" multiple name="fileIP" id="" />
                            <button type="submit">Upload</button>
                        </form>
                    </div>
                </div>
                <div>
                    <label htmlFor="" className='text-white'>Choose the language of the summary</label>
                    <select value={lang} className='p-2 bg-white' onChange={(e) => {setLang(e.target.value)}} id="">
                        <option value="english">English</option>
                        <option value="tamil">Tamil</option>
                        <option value="malayalam">Malayalam</option>
                        <option value="hindi">Hindi</option>
                    </select>
                </div>
                <div>
                    {qa === true && <div className='bg-slate-800 text-white rounded-2xl p-2'>
                        <div>
                            <form action="" onSubmit={handleQA}>
                                <input type="text" value={qaValue} onChange={(e) => {setQAValue(e.target.value)}} className='border-2 rounded-2xl p-2 '/>
                                <button type="submit">Send</button>
                            </form>
                        </div>
                    </div>}
                </div>
                {loading && <div className="flex justify-center"><Spinner /></div>}
            </div>
            
        </div>
        
    )
}

export default Home