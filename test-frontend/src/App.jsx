import { useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Signup from './pages/Signup'
import Nextpage from './pages/Nextpage'
import Signup1 from './pages/Signup1'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>

      <BrowserRouter>
        <Routes>
        <Route path='/signup' element={<Signup company_name="Infosys" />} />
        <Route path='/signup' element={<Signup1 company_name="Infosys" />} />

          <Route path='/nextpage' element={<Nextpage/>}/>
          
        </Routes>

      </BrowserRouter>
      
    </>
  )
}

export default App
