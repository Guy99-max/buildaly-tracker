import { useEffect, useMemo, useState } from 'react'
import { collection, addDoc, onSnapshot, doc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'

const STATUS = ['מכרז פתוח','הוגשה הצעה','מו״מ','זכינו','לא זכינו','בהקפאה']
const TYPES = ['תמ״א 1','תמ״א 2','שיפוץ','מסחרי','שיקום מבנה','שימור','אחר']

function calcEQ({above=0, below=0, balcony=0, service=0}){
  return Number(above||0) + 0.5*(Number(below||0)+Number(balcony||0)+Number(service||0))
}

function Drawer({project, onClose}){
  const [form,setForm] = useState(project||{})
  useEffect(()=>setForm(project||{}),[project])
  if(!project) return null

  const eq = calcEQ({above:form.above, below:form.below, balcony:form.balcony, service:form.service})
  const pricePerSqm = (form.offer && eq) ? Math.round(form.offer/eq).toLocaleString() : '—'
  const pricePerApt = (form.offer && form.apartments>0) ? Math.round(form.offer/form.apartments).toLocaleString() : '—'

  async function save(){
    try {
      if (!form.id) {
        console.error('Missing form.id, form =', form)
        alert('לא נמצא מזהה לפרויקט (id), אי אפשר לשמור.')
        return
      }

      const ref = doc(db,'executions', form.id)
      const payload = { ...form, eq, updatedAt: Date.now() }

      await setDoc(ref, payload, { merge:true })
      onClose()
    } catch (err) {
      console.error('Error saving execution project:', err)
      alert('אירעה שגיאה בשמירה. פתח Console בדפדפן ותראה את פרטי השגיאה.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 z-20" onClick={onClose}>
      <div
        className="absolute top-0 bottom-0 left-0 w-full sm:w-[520px] bg-white shadow-xl p-5 overflow-auto"
        onClick={e=>e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold truncate">
            {form.name || 'ללא שם'}
          </h2>
          <button
            type="button"
            className="text-zinc-500 hover:text-black"
            onClick={onClose}
          >
            סגור
          </button>
        </div>

        <div className="mt-4 grid gap-4">
          {/* שם הפרויקט */}
          <div>
            <label className="text-xs">שם הפרויקט</label>
            <input
              className="w-full border rounded-lg px-2 py-1.5"
              value={form.name || ''}
              onChange={e=>setForm({...form, name:e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs">סטטוס</label>
              <select
                className="w-full border rounded-lg px-2 py-1.5"
                value={form.status||STATUS[0]}
                onChange={e=>setForm({...form,status:e.target.value})}
              >
                {STATUS.map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs">סוג</label>
              <select
                className="w-full border rounded-lg px-2 py-1.5"
                value={form.kind||TYPES[0]}
                onChange={e=>setForm({...form,kind:e.target.value})}
              >
                {TYPES.map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs">עיר / כתובת</label>
              <input
                className="w-full border rounded-lg px-2 py-1.5"
                value={form.city||''}
                onChange={e=>setForm({...form,city:e.target.value})}
              />
            </div>
            <div>
              <label className="text-xs">גוש/חלקה</label>
              <input
                className="w-full border rounded-lg px-2 py-1.5"
                value={form.block||''}
                onChange={e=>setForm({...form,block:e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs">קומות</label>
              <input
                type="number"
                className="w-full border rounded-lg px-2 py-1.5"
                value={form.floors||''}
                onChange={e=>setForm({...form,floors:Number(e.target.value)})}
              />
            </div>
            <div>
              <label className="text-xs">דירות</label>
              <input
                type="number"
                className="w-full border rounded-lg px-2 py-1.5"
                value={form.apartments||''}
                onChange={e=>setForm({...form,apartments:Number(e.target.value)})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs">יזם</label>
              <input
                className="w-full border rounded-lg px-2 py-1.5"
                value={form.client||''}
                onChange={e=>setForm({...form,client:e.target.value})}
              />
            </div>
            <div>
              <label className="text-xs">אדריכל</label>
              <input
                className="w-full border rounded-lg px-2 py-1.5"
                value={form.arch||''}
                onChange={e=>setForm({...form,arch:e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs">קונסטרוקטור</label>
              <input
                className="w-full border rounded-lg px-2 py-1.5"
                value={form.struct||''}
                onChange={e=>setForm({...form,struct:e.target.value})}
              />
            </div>
            <div>
              <label className="text-xs">מפקח</label>
              <input
                className="w-full border rounded-lg px-2 py-1.5"
                value={form.supervisor||''}
                onChange={e=>setForm({...form,supervisor:e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs">מעל הקרקע (מ״ר)</label>
              <input
                type="number"
                className="w-full border rounded-lg px-2 py-1.5"
                value={form.above||''}
                onChange={e=>setForm({...form,above:Number(e.target.value)})}
              />
            </div>
            <div>
              <label className="text-xs">מתחת לקרקע (מ״ר)</label>
              <input
                type="number"
                className="w-full border rounded-lg px-2 py-1.5"
                value={form.below||''}
                onChange={e=>setForm({...form,below:Number(e.target.value)})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs">מרפסות (מ״ר)</label>
              <input
                type="number"
                className="w-full border rounded-lg px-2 py-1.5"
                value={form.balcony||''}
                onChange={e=>setForm({...form,balcony:Number(e.target.value)})}
              />
            </div>
            <div>
              <label className="text-xs">שירות (מ״ר)</label>
              <input
                type="number"
                className="w-full border rounded-lg px-2 py-1.5"
                value={form.service||''}
                onChange={e=>setForm({...form,service:Number(e.target.value)})}
              />
            </div>
          </div>

          <div>
            <label className="text-xs">ברוטו בנייה (מ״ר)</label>
            <input
              type="number"
              className="w-full border rounded-lg px-2 py-1.5"
              value={form.gross||''}
              onChange={e=>setForm({...form,gross:Number(e.target.value)})}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs">סכום הצעה (₪)</label>
              <input
                type="number"
                className="w-full border rounded-lg px-2 py-1.5"
                value={form.offer||''}
                onChange={e=>setForm({...form,offer:Number(e.target.value)})}
              />
            </div>
            <div>
              <label className="text-xs">סוג חניון</label>
              <select
                className="w-full border rounded-lg px-2 py-1.5"
                value={form.parkingType || 'ללא חניון'}
                onChange={e=>setForm({...form,parkingType:e.target.value})}
              >
                <option>ללא חניון</option>
                <option>קונבנציונלי</option>
                <option>רובוטי</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 bg-zinc-50 rounded-xl p-3">
            <div>
              <div className="text-xs text-zinc-500">EQ</div>
              <div className="text-lg font-semibold">{eq || '—'}</div>
            </div>
            <div>
              <div className="text-xs text-zinc-500">₪/מ״ר (EQ)</div>
              <div className="text-lg font-semibold">{pricePerSqm}</div>
            </div>
            <div>
              <div className="text-xs text-zinc-500">₪/דירה</div>
              <div className="text-lg font-semibold">{pricePerApt}</div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              className="px-4 py-2 rounded-lg bg-black text-white"
              onClick={save}
            >
              שמירה
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-lg bg-zinc-100"
              onClick={onClose}
            >
              בטל
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Execution(){
  const [items,setItems] = useState([])
  const [filter,setFilter] = useState({status:'', kind:'', q:''})
  const [open,setOpen] = useState(null)

  useEffect(()=>{
    const unsub = onSnapshot(collection(db,'executions'), snap=>{
      setItems(snap.docs.map(d=>({id:d.id, ...d.data()})))
    })
    return ()=>unsub()
  },[])

  const filtered = useMemo(()=>{
    return items.filter(p=>
      (!filter.status || p.status===filter.status) &&
      (!filter.kind || p.kind===filter.kind) &&
      (!filter.q || (p.name||'').includes(filter.q) || (p.city||'').includes(filter.q))
    )
  },[items,filter])

  async function addNew(){
    try {
      const payload = {
        name:'פרויקט חדש',
        status:'מכרז פתוח',
        kind:'תמ״א 1',
        createdAt: Date.now()
      }
      const ref = await addDoc(collection(db,'executions'), payload)
      setOpen({ id: ref.id, ...payload })
    } catch (err) {
      console.error('Error creating new execution project:', err)
      alert('שגיאה ביצירת פרויקט חדש. ראה פרטים ב-Console.')
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="text-lg font-semibold text-right sm:text-left">קבלנות ביצוע</div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            placeholder="חיפוש..."
            className="w-full sm:w-auto border rounded-lg px-3 py-1.5"
            onChange={e=>setFilter({...filter,q:e.target.value})}
          />
          <div className="flex gap-2">
            <select
              className="border rounded-lg px-2 py-1.5"
              onChange={e=>setFilter({...filter,status:e.target.value||''})}
            >
              <option value="">סטטוס</option>
              {STATUS.map(s=><option key={s}>{s}</option>)}
            </select>
            <select
              className="border rounded-lg px-2 py-1.5"
              onChange={e=>setFilter({...filter,kind:e.target.value||''})}
            >
              <option value="">סוג</option>
              {TYPES.map(s=><option key={s}>{s}</option>)}
            </select>
            <button
              type="button"
              className="px-4 py-2 rounded-lg bg-execOrange text-white whitespace-nowrap"
              onClick={addNew}
            >
              + פרויקט
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto border rounded-xl bg-white">
        <table className="min-w-full text-xs sm:text-sm">
          <thead className="bg-zinc-100 text-zinc-600">
            <tr>
              <th className="text-right p-2">שם</th>
              <th className="text-right p-2">סטטוס</th>
              <th className="text-right p-2">סוג</th>
              <th className="text-right p-2">עיר</th>
              <th className="text-right p-2">₪/מ״ר (EQ)</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p=>{
              const pricePerSqm = (p.offer && p.eq) ? Math.round(p.offer/p.eq).toLocaleString() : '—'
              return (
                <tr
                  key={p.id}
                  className="border-t hover:bg-zinc-50 cursor-pointer"
                  onClick={()=>setOpen(p)}
                >
                  <td className="p-2">{p.name}</td>
                  <td className="p-2">
                    <span className="badge badge-orange">{p.status}</span>
                  </td>
                  <td className="p-2">{p.kind}</td>
                  <td className="p-2">{p.city || '—'}</td>
                  <td className="p-2">{pricePerSqm}</td>
                </tr>
              )
            })}
            {!filtered.length && (
              <tr>
                <td className="p-6 text-center text-zinc-500" colSpan={5}>
                  אין נתונים
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Drawer project={open} onClose={()=>setOpen(null)} />
    </div>
  )
}
