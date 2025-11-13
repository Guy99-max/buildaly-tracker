import { useEffect, useState } from 'react'
import { auth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from '../firebase'

export default function AuthGate({children}){
  const [user,setUser] = useState(null)
  const [loading,setLoading] = useState(true)
  const [err,setErr] = useState('')

  useEffect(()=>{
    const unsub = onAuthStateChanged(auth, u=>{ setUser(u); setLoading(false) })
    return ()=>unsub()
  },[])

  if(loading) return <div className="p-8 text-center text-zinc-500">טוען…</div>
  if(!user) return <Login setErr={setErr} />

  return (
    <div>
      <div className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-4 py-2 text-xs text-zinc-600 flex items-center justify-between">
          <div>מחובר כ־ {user.email}</div>
          <button className="px-2 py-1 rounded bg-zinc-100 hover:bg-zinc-200" onClick={()=>signOut(auth)}>התנתק</button>
        </div>
      </div>
      {children}
    </div>
  )
}

function Login({setErr}){
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')

  async function doLogin(e){
    e.preventDefault()
    try{
      await signInWithEmailAndPassword(auth, email, password)
    }catch(e){
      setErr?.(e.message)
      alert('שגיאה: '+e.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={doLogin} className="w-full max-w-sm bg-white border rounded-2xl p-6 shadow-sm">
        <div className="text-lg font-semibold mb-4">כניסה למערכת</div>
        <label className="text-xs">אימייל</label>
        <input className="w-full border rounded-lg px-3 py-2 mb-3" value={email} onChange={e=>setEmail(e.target.value)} />
        <label className="text-xs">סיסמה</label>
        <input type="password" className="w-full border rounded-lg px-3 py-2 mb-4" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="w-full px-4 py-2 rounded-lg bg-black text-white">התחבר</button>
        <div className="text-xs text-zinc-500 mt-3">את המשתמשים יוצרים דרך Firebase Console (Email/Password)</div>
      </form>
    </div>
  )
}
