import { useState } from 'react';
import DashboardLayout from '../layout/DashboardLayout';
import { BookOpen, HelpCircle, MessageSquare, Mail, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function HelpCenter() {
  const { fullName: authName } = useAuth();
  const displayName = authName ?? 'Student';

  // State to track which FAQ is open (null means all are closed)
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    // Toggle the clicked FAQ open/close
    setOpenFaq(openFaq === index ? null : index);
  };

  const steps = [
    {
      id: 1,
      title: 'Select a Room from the Catalog',
      desc: 'Browse various available rooms according to your capacity and facility needs in the Room Catalog menu.',
    },
    {
      id: 2,
      title: 'Click the Book Button',
      desc: "Once you find a suitable room, click the 'Book Now' button to start the reservation process.",
    },
    {
      id: 3,
      title: 'Fill in Form Details',
      desc: 'Provide the necessary information such as date, duration, number of attendees, and the purpose of room usage.',
    },
    {
      id: 4,
      title: 'Wait for Admin Approval',
      desc: 'The admin team will review your request. You can monitor your booking status in real-time through the My Bookings menu.',
    },
  ];

  const faqs = [
    {
      q: 'How long does the booking approval process take?',
      a: 'The approval process usually takes 15-60 minutes during office hours. You will receive an email notification once the status changes.',
    },
    {
      q: 'Can I cancel an approved booking?',
      a: "Yes, cancellations can be made through the 'My Bookings' menu up to 2 hours before the booking time starts.",
    },
    {
      q: 'What should I do if the room key is not yet available?',
      a: "Please contact the operational staff at the respective floor's reception desk or use the 'Contact Admin' feature on this page.",
    },
    {
      q: 'Is there a maximum limit for booking duration?',
      a: 'The standard maximum booking duration is 8 hours per day. For bookings longer than 1 day, please submit a special request to the Admin.',
    },
  ];

  return (
    <DashboardLayout>
      {/* Header Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Help & Guide Center</h2>
        <p className="text-slate-500">
          Find answers to your questions and guides on how to use the TEKSPACE system.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left Column: Booking Guide */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="text-[#0088FF]" size={24} />
            <h3 className="text-lg font-bold text-slate-800">Room Booking Guide</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {steps.map((step) => (
              <div key={step.id} className="bg-slate-50 p-5 rounded-lg border border-slate-100">
                <div className="w-8 h-8 rounded-md bg-[#004A8F] text-white flex items-center justify-center font-bold mb-4 shadow-sm">
                  {step.id}
                </div>
                <h4 className="font-bold text-slate-800 mb-2">{step.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Support & Operational Hours */}
        <div className="flex flex-col gap-6">
          {/* Support Box */}
          <div className="bg-[#0077B6] rounded-xl p-6 text-white shadow-sm">
            <h3 className="text-lg font-bold mb-3">Need More Help?</h3>
            <p className="text-white/80 text-sm mb-6 leading-relaxed">
              Our support team is ready to assist with technical issues or urgent questions regarding your room reservations.
            </p>
            
            <div className="space-y-3">
              {/* WhatsApp Button */}
              <button 
                onClick={() => {
                  const message = `Hello TEKSPACE Admin, I am ${displayName}. I need assistance regarding a campus room reservation.`;
                  // Replace the number below with the actual admin WhatsApp number (use international format without '+', e.g., 62...)
                  window.open(`https://wa.me/6287822408980?text=${encodeURIComponent(message)}`, '_blank');
                }}
                className="w-full bg-white/20 hover:bg-white/30 transition border border-white/30 rounded-lg p-3 flex items-center gap-4 text-left"
              >
                <MessageSquare size={20} className="text-white" />
                <div>
                  <p className="text-[10px] font-bold text-white/70 tracking-wider uppercase">Live Chat (WhatsApp)</p>
                  <p className="font-semibold text-sm">Contact Admin</p>
                </div>
              </button>
              
              {/* Email Button */}
              <button 
                onClick={() => {
                  const subject = `[TEKSPACE Support] Need Assistance - ${displayName}`;
                  const body = `Hello TEKSPACE Support Team,%0D%0A%0D%0AI am ${displayName} and I would like to ask about...`;
                  window.location.href = `mailto:support@spacereserve.com?subject=${subject}&body=${body}`;
                }}
                className="w-full bg-white/20 hover:bg-white/30 transition border border-white/30 rounded-lg p-3 flex items-center gap-4 text-left"
              >
                <Mail size={20} className="text-white" />
                <div>
                  <p className="text-[10px] font-bold text-white/70 tracking-wider uppercase">Email Support</p>
                  <p className="font-semibold text-sm">support@spacereserve.com</p>
                </div>
              </button>
            </div>
          </div>

          {/* Operational Hours */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-4">
              Operational Hours
            </h3>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-sm text-slate-700 font-medium">Monday - Friday</span>
              <span className="text-sm text-[#0088FF] font-bold">08:00 - 18:00</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-slate-700 font-medium">Saturday</span>
              <span className="text-sm text-slate-600 font-medium">09:00 - 13:00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: FAQ */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-8">
        <div className="flex items-center gap-3 mb-6">
          <HelpCircle className="text-[#0088FF]" size={24} />
          <h3 className="text-lg font-bold text-slate-800">Frequently Asked Questions</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              onClick={() => toggleFaq(index)}
              className="group cursor-pointer bg-transparent hover:bg-slate-50 p-3 rounded-lg transition-colors"
            >
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-slate-800 text-[15px] pr-4">{faq.q}</h4>
                <ChevronDown 
                  size={18} 
                  className={`text-slate-400 mt-1 flex-shrink-0 transition-transform duration-200 ${
                    openFaq === index ? 'rotate-180 text-[#0088FF]' : ''
                  }`} 
                />
              </div>
              
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openFaq === index ? 'max-h-40 opacity-100 mt-2' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="text-sm text-slate-500 leading-relaxed pr-8">
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}