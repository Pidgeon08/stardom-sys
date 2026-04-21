import {useState} from 'react'
import { useNavigate } from 'react-router';

export default function LoginPage() {

  //login handler (unitedstates)
  const [uname, setUsername] = useState('');
  const [pword, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
      e.preventDefault();
      
       //API/mock credentials

    const users = [
      {uname: 'admin', pword: 'admin123', utype: 'admin', legname: 'Pidgeon'},
      {uname: 'teacher', pword: 'teacher123', utype: 'teacher', legname: 'Jane Doe'},
      {uname: 'student', pword: 'student123', utype: 'student', legname: 'Seth Lowel'},  
    ]

      const user = users.find(u => u.uname === uname && u.pword === pword);

        if (user){
            localStorage.setItem('user', JSON.stringify(user));
            navigate(`/${user.uname}`, {replace: true});
        }else{
            alert("Invalid Credentials");
        }


    };

   

  return (
    <div className='min-h-screen flex items-center justify-center bg-linear-to-br from-orange-100 to-red-100'>
        <div className='bg-white p-8 rounded-lg shadow-lg w-full max-w-md'>
            <div className='text-center mb-8'><h1 className='text-3xl font-bold text-orange-600 mb-2'>Stardom Musical Center</h1>
            <p className='text-gray-600'>Student Enrollment & Information Management System</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
            <label className="block text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={uname}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Enter username"
              required
            />
          </div>
            <div className="mb-6">
            <label className="block text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={pword}
              onChange={(e)=> setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Enter password"
              required
            />
            </div>
            <button type="submit" className='w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition'>Login</button>
            </form>
        </div>
    </div>
  )
}
