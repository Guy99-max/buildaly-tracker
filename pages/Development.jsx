import { useEffect, useMemo, useState } from 'react'
import { collection, addDoc, onSnapshot, doc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'

const STAGES = ['איתור','בדיקה ראשונית','בדיקת זכויות','כלכליות','מו״מ קרקע','אופציה חתומה','DD','חוזה חתום','ירד']

function KPIs(f){
  const revenue = Number(f.sellable||0) * Number(f.pricePerSqm||0)
  const costs = (Number(f.landCost||0)+Number(f.buildCost||0)+Number(f.softCost||0)+Number(f.finance||0)+Number(f.contingency||0))
  const profit = revenue - costs
  const profitPct = revenue ? (profit / revenue * 100) : null
  return { revenue, costs, profit, profitPct }
}

function Drawer({project, onClose}){
  const [form,setForm] = useState(project||{})
  useEffect(()=>setForm(project||{}),[project])
  if(!project) return null
  const k = KPIs(form)

  async function save(){
    const ref = doc(db,'developments', form.id)
    await setDoc(ref, { 
      ...form, 
      kpiProfitPct: (k.profitPct!=null? Number(k.profitPct): null), 
      kpiProfitNis: (isNaN(k.profit)? null : Number(k.profit)), 
      updatedAt: Date.now() 
    }, { merge:true })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/30 z-20" onClick={onClose}>
      <div className="absolute top-0 bottom-0 left-0 w-full sm:w-[520px] bg-white shadow-xl p-5 overflow-auto" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{form.name || 'ללא שם'}</h2>
          <button className="text-zinc-500 hover:text-black" onClick={onClose}>סגור</button>
        </div>

        <div className="mt-4 grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs">שלב</label>
              <select className="w-full border rounded-lg px-2 py-1.5" value={form.stage||''} onChange={e=>setForm({...form,stage:e.target.value})}>
                {STAGES.map(s=><option key={s}>{s}</option>)}
              </select></div>
            <div><label className="text-xs">עיר / כתובת</label>
              <input className="w-full border rounded-lg px-2 py-1.5" value={form.city||''} onChange={e=>setForm({...form,city:e.target.value})}/></div>
          </div>

          <div><label className="text-xs">גוש/חלקה</label>
            <input className="w-full border rounded-lg px-2 py-1.5" value={form.parcel||''} onChange={e=>setForm({...form,parcel:e.target.value})}/></div>

          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs">מ״ר מכירתי</label>
              <input type="number" className="w-full border rounded-lg px-2 py-1.5" value={form.sellable||''} onChange={e=>setForm({...form,sellable:Number(e.target.value)})}/></div>
            <div><label className="text-xs">₪/מ״ר מכירה</label>
              <input type="number" className="w-full border rounded-lg px-2 py-1.5" value={form.pricePerSqm||''} onChange={e=>setForm({...form,pricePerSqm:Number(e.target.value)})}/></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs">עלות קרקע (₪)</label>
              <input type="number" className="w-full border rounded-lg px-2 py-1.5" value={form.landCost||''} onChange={e=>setForm({...form,landCost:Number(e.target.value)})}/></div>
            <div><label className="text-xs">עלות בנייה (₪)</label>
              <input type="number" className="w-full border rounded-lg px-2 py-1.5" value={form.buildCost||''} onChange={e=>setForm({...form,buildCost:Number(e.target.value)})}/></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs">עלויות רכות (₪)</label>
              <input type="number" className="w-full border rounded-lg px-2 py-1.5" value={form.softCost||''} onChange={e=>setForm({...form,softCost:Number(e.target.value)})}/></div>
            <div><label className="text-xs">מימון / ריביות (₪)</label>
              <input type="number" className="w-full border rounded-lg px-2 py-1.5" value={form.finance||''} onChange={e=>setForm({...form,finance:Number(e.target.value)})}/></div>
          </div>

          <div><label className="text-xs">בלתי צפוי (₪)</label>
            <input type="number" className="w-full border rounded-lg px-2 py-1.5" value={form.contingency||''} onChange={e=>setForm({...form,contingency:Number(e.target.value)})}/></div>

          <div className="grid grid-cols-2 gap-3 bg-zinc-50 rounded-xl p-3">
            <div><div className="text-xs text-zinc-500">רווח (₪)</div><div className="text-lg font-semibold">{isNaN(k.profit)?'—':'₪ '+Math.round(k.profit).toLocaleString()}</div></div>
            <div><div className="text-xs text-zinc-500">רווח גולמי %</div><div className="text-lg font-semibold">{k.profitPct!=null? k.profitPct.toFixed(1)+'%' : '—'}</div></div>
          </div>

          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-lg bg-black text-white" onClick={save}>שמירה</button>
            <button className="px-4 py-2 rounded-lg bg-zinc-100" onClick={onClose}>בטל</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Development(){
  const [items,setItems] = useState([])
  const [filter,setFilter] = useState({stage:'', q:''})
  const [open,setOpen] = useState(null)

  useEffect(()=>{
    const unsub = onSnapshot(collection(db,'developments'), snap=>{
      setItems(snap.docs.map(d=>({id:d.id, ...d.data()})))
    })
    return ()=>unsub()
  },[])

  const filtered = useMemo(()=>{
    return items.filter(p=>
      (!filter.stage || p.stage===filter.stage) &&
      (!filter.q || (p.name||'').includes(filter.q) || (p.city||'').includes(filter.q))
    )
  },[items,filter])

  async function addNew(){
    const payload = { name:'עסקת יזמות חדשה', stage:'איתור', createdAt: Date.now() }
    const ref = await addDoc(collection(db,'developments'), payload)
    setOpen({ id: ref.id, ...payload })
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="text-lg font-semibold">ייזמות</div>
        <div className="flex gap-2">
          <input placeholder="חיפוש..." className="border rounded-lg px-3 py-1.5" onChange={e=>setFilter({...filter,q:e.target.value})}/>
          <select className="border rounded-lg px-2 py-1.5" onChange={e=>setFilter({...filter,stage:e.target.value||''})}>
            <option value="">שלב</option>{STAGES.map(s=><option key={s}>{s}</option>)}
          </select>
          <button className="px-4 py-2 rounded-lg bg-devBlue text-white" onClick={addNew}>+ פרויקט</button>
        </div>
      </div>

      <div className="overflow-auto border rounded-xl">
        <table className="w-full text-sm">
          <thead className="bg-zinc-100 text-zinc-600">
            <tr>
              <th className="text-right p-2">שם</th>
              <th className="text-right p-2">שלב</th>
              <th className="text-right p-2">עיר</th>
              <th className="text-right p-2">מ״ר מכירתי</th>
              <th className="text-right p-2">רווח גולמי %</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p=>{
              const pct = (typeof p.kpiProfitPct==='number') ? (p.kpiProfitPct.toFixed(1)+'%') : '—'
              return (
                <tr key={p.id} className="border-t hover:bg-zinc-50 cursor-pointer" onClick={()=>setOpen(p)}>
                  <td className="p-2">{p.name}</td>
                  <td className="p-2"><span className="badge badge-blue">{p.stage}</span></td>
                  <td className="p-2">{p.city || '—'}</td>
                  <td className="p-2">{p.sellable || '—'}</td>
                  <td className="p-2">{pct}</td>
                </tr>
              )
            })}
            {!filtered.length && (
              <tr><td className="p-6 text-center text-zinc-500" colSpan={5}>אין נתונים</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Drawer project={open} onClose={()=>setOpen(null)} />
    </div>
  )
}
