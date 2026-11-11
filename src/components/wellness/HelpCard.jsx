import { LifeBuoy, Phone } from 'lucide-react'

import { HELP_RESOURCES } from '../../data/wellnessContent'

function HelpCard() {
  return (
    <section className="bg-[#eee6fc] rounded-2xl p-6 md:p-8" aria-labelledby="help-heading">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-white w-11 h-11 rounded-xl flex items-center justify-center">
          <LifeBuoy size={22} className="text-[#9878d4]" />
        </div>
        <h2 id="help-heading" className="text-lg font-bold text-[#49366c]">
          When to reach out for more support
        </h2>
      </div>

      <p className="text-sm text-[#5a4d73] leading-6">
        MindMate offers self-help tools and is not a substitute for professional care. Please talk to a counsellor, doctor or someone you trust if you notice:
      </p>
      <ul className="list-disc pl-5 mt-3 space-y-1 text-sm text-[#5a4d73]">
        {HELP_RESOURCES.warningSigns.map((sign) => (
          <li key={sign}>{sign}</li>
        ))}
      </ul>
      <p className="text-sm text-[#5a4d73] mt-3">
        Your college counselling centre is also a good place to start.
      </p>

      <div className="grid sm:grid-cols-2 gap-4 mt-5">
        {HELP_RESOURCES.contacts.map((contact) => (
          <div key={contact.name} className="bg-white rounded-xl p-4">
            <p className="font-semibold text-[#302747]">{contact.name}</p>
            <p className="text-xs text-[#827991] mt-1 leading-5">{contact.detail}</p>
            <div className="flex flex-wrap gap-3 mt-3">
              <a
                href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`}
                className="inline-flex items-center gap-2 bg-[#9878d4] hover:bg-[#7955b5] text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
              >
                <Phone size={14} /> {contact.phone}
              </a>
              {contact.altPhone && (
                <a
                  href={`tel:${contact.altPhone.replace(/[^0-9+]/g, '')}`}
                  className="inline-flex items-center gap-2 bg-[#f5f0fc] text-[#7955b5] px-4 py-2 rounded-lg text-sm font-semibold"
                >
                  {contact.altPhone}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default HelpCard