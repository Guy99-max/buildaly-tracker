import { Link } from 'react-router-dom'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { useEffect, useState } from 'react'

function Stat({label, value}){
  return (<div className="flex flex-col">
    <div className="text-xs text-zinc-500">{label}</div>
    <div className="text-lg font-semibold">{value}</div>
  </div>)
}

export default function Home(){
  const [dev,setDev] = useState([])
  const [exe,setExe] = useState([])

  useEffect(()=>{
    const unsub1 = onSnapshot(collection(db,'developments'), snap=>{
      setDev(snap.docs.map(d=>({id:d.id, ...d.data()})))
    })
    const unsub2 = onSnapshot(collection(db,'executions'), snap=>{
      setExe(snap.docs.map(d=>({id:d.id, ...d.data()})))
    })
    return ()=>{unsub1();unsub2();}
  },[])

  const devActive = dev.length
  const devNeg = dev.filter(p=>['מו״מ קרקע','אופציה חתומה','DD'].includes(p.stage)).length
  const devGrossAvg = (()=>{
    const arr = dev.map(p=>p.kpiProfitPct).filter(v=>typeof v==='number')
    if(!arr.length) return '—'; return (arr.reduce((a,b)=>a+b,0)/arr.length).toFixed(1)+'%'
  })()
  const devProfitSum = (()=>{
    const arr = dev.map(p=>p.kpiProfitNis).filter(v=>typeof v==='number')
    if(!arr.length) return '—'; return '₪ '+Math.round(arr.reduce((a,b)=>a+b,0)).toLocaleString()
  })()

  const exeOpen = exe.filter(p=>p.status==='מכרז פתוח').length
  const exePending = exe.filter(p=>p.status==='הוגשה הצעה' || p.status==='מו״מ').length
  const exeWon = exe.filter(p=>p.status==='זכינו').length
  const exePricePerSqmAvg = (()=>{
    const arr = exe.map(p=> (p.offer && p.eq) ? (p.offer/p.eq) : null).filter(v=>typeof v==='number')
    if(!arr.length) return '—'; return '₪ '+Math.round(arr.reduce((a,b)=>a+b,0)/arr.length).toLocaleString()
  })()

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid lg:grid-cols-2 gap-6">
      <section className="rounded-2xl border bg-white overflow-hidden">
        <div className="px-6 py-4 bg-devBlue text-white text-lg font-semibold">🏢 יזמות</div>
        <div className="p-6 grid grid-cols-2 gap-6">
          <Stat label="פרויקטים פעילים" value={devActive} />
          <Stat label="במו״מ / אופציה / DD" value={devNeg} />
          <Stat label="רווח גולמי ממוצע" value={devGrossAvg} />
          <Stat label="רווח צפוי כולל" value={devProfitSum} />
        </div>
        <div className="px-6 pb-6">
          <Link to="/development" className="inline-flex items-center px-4 py-2 rounded-xl bg-devBlue text-white hover:opacity-90">פתח רשימת יזמות</Link>
        </div>
      </section>

      <section className="rounded-2xl border bg-white overflow-hidden">
        <div className="px-6 py-4 bg-execOrange text-white text-lg font-semibold">🏗️ קבלנות ביצוע</div>
        <div className="p-6 grid grid-cols-2 gap-6">
          <Stat label="מכרזים פתוחים" value={exeOpen} />
          <Stat label="הצעות ממתינות/מו״מ" value={exePending} />
          <Stat label="פרויקטים שזכינו" value={exeWon} />
          <Stat label="מחיר ממוצע למ״ר (EQ)" value={exePricePerSqmAvg} />
        </div>
        <div className="px-6 pb-6">
          <Link to="/execution" className="inline-flex items-center px-4 py-2 rounded-xl bg-execOrange text-white hover:opacity-90">פתח רשימת ביצוע</Link>
        </div>
      </section>
    </div>
  )
}
