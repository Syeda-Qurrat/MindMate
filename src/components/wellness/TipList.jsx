import { Lightbulb } from 'lucide-react'

function TipList({ tips }) {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {tips.map((tip) => (
        <div key={tip.title} className="bg-white border border-[#eee8f5] rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#fff2df] flex items-center justify-center shrink-0">
              <Lightbulb size={18} className="text-[#d49a4e]" />
            </div>
            <h4 className="font-semibold text-[#302747]">{tip.title}</h4>
          </div>
          <p className="text-sm text-[#827991] leading-6 mt-3">{tip.body}</p>
        </div>
      ))}
    </div>
  )
}

export default TipList