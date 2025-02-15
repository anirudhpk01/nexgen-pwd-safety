import { useNavigate } from "react-router"

export default function Card(props){

    const navigate = useNavigate()

    return 
    <>

        <div className="p-5 h-96 w-44 bg-white flex flex-col rounded-lg shadow-lg cursor-pointer" onClick={()=>{
            navigate(`/${props.to_url}`)

        }}>

            <h1 className="p-2 text-center text-3xl font-bold ">{props.heading}</h1>
            <p className="p-2 mt-4 text-center text-xl text-slate-700 font-semibold">{props.content}</p>

        </div>
    
    </>

}