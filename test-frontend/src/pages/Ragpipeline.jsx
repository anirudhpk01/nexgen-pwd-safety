export default function App(){
    return <>
        <div className="flex flex-col justify-center items-center">
            <h1 className="text-5xl font-bold text-center p-5 m-5">Just feed in your company's passowrd policy document like a pdf or a txt file as input</h1> 


            <div className="bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-md">We then store vector embeddings of your password policy and generate a super regex, specialized for your company!</div>


            <h1 className="text-5xl font-bold text-center p-5 m-5">This regex is used after all the checks to check any password that you type</h1>
        </div>
    </>
}