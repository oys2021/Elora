import { EnvironmentOutlined, ClockCircleOutlined } from '@ant-design/icons'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import FloatingActions from '../components/common/FloatingActions'

const jobs = [
  { title: 'Hair Stylist', department: 'Salon', location: 'Accra, Ghana', type: 'Full-time' },
  { title: 'Customer Support Associate', department: 'Support', location: 'Remote', type: 'Full-time' },
  { title: 'Social Media Coordinator', department: 'Marketing', location: 'Accra, Ghana', type: 'Part-time' },
  { title: 'Warehouse Assistant', department: 'Operations', location: 'Tema, Ghana', type: 'Full-time' },
]

export default function Career() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="text-2xl font-semibold text-neutral-900">Careers at Elora</h1>
        <p className="mt-2 text-sm text-neutral-500">
          We're a small team obsessed with hair and skincare done right. Come build it with us.
        </p>

        <div className="mt-8 divide-y divide-neutral-100 rounded-xl border border-neutral-200">
          {jobs.map((job) => (
            <div key={job.title} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-neutral-900">{job.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                  <span>{job.department}</span>
                  <span className="flex items-center gap-1">
                    <EnvironmentOutlined /> {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <ClockCircleOutlined /> {job.type}
                  </span>
                </div>
              </div>
              <a
                href="mailto:careers@elora.com"
                className="inline-block shrink-0 rounded-full bg-black px-5 py-2 text-center text-xs font-medium text-white hover:bg-neutral-800"
              >
                Apply
              </a>
            </div>
          ))}
        </div>
      </main>

      <Footer />
      <FloatingActions />
    </div>
  )
}
