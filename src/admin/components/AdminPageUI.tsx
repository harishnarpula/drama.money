import type { ReactNode } from 'react'
import { SearchIcon } from '../../components/Icons'

export function Metric({ icon, label, value, note, bars }: { icon: string; label: string; value: string; note: string; bars: number[] }) {
  return (
    <article className="min-h-[180px] rounded-[17px] border border-[#E2E5DF] bg-[linear-gradient(145deg,#fff,#fafbf8)] p-[18px] shadow-[0_9px_30px_rgba(29,51,40,.045)] motion-safe:transition-[transform,border-color,box-shadow] motion-safe:duration-300 hover:border-[#BDC9C0] hover:shadow-[0_16px_38px_rgba(29,51,40,.09)] [&:nth-child(2)>div:first-child>span]:bg-[linear-gradient(145deg,#f58a5c,#d5572a)] [&:nth-child(3)>div:first-child>span]:bg-[linear-gradient(145deg,#d99b43,#9d6720)] [&:nth-child(4)>div:first-child>span]:bg-[linear-gradient(145deg,#586ca5,#314477)] [&:nth-child(2)>div:nth-child(3)>div>i]:bg-[#ee9b78]">
      <div className="flex items-center justify-between">
        <span className="grid size-[34px] place-items-center rounded-[10px] bg-[linear-gradient(145deg,#345e4a,#1d3328)] text-[13px] text-white shadow-[0_9px_18px_rgba(29,51,40,.2)]">{icon}</span>
        <small className="tracking-[2px] text-[#A4ADA7]">•••</small>
      </div>
      <span className="mt-[13px] block text-[13px] font-semibold text-[#738078]">{label}</span>
      <div className="mt-1 flex items-end justify-between">
        <strong className="text-[34px]">{value}</strong>
        <div className="flex h-[38px] items-end gap-[3px]">
          {bars.map((height, index) => (
            <i key={index} className="w-1 rounded bg-[#8CAA99]" style={{ height: height + '%' }} />
          ))}
        </div>
      </div>
      <small className="mt-[11px] block text-[11px] text-[#7C8981]">
        <b className="text-[#3C9560]">↗</b> {note}
      </small>
    </article>
  )
}

export function CardHeading({ title, subtitle, action }: { title: string; subtitle: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="m-0 text-[18px]">{title}</h2>
        <p className="mt-[5px] mb-0 text-xs leading-[1.5] text-[#738078]">{subtitle}</p>
      </div>
      {action}
    </div>
  )
}

export function AdminPage({
  eyebrow,
  title,
  subtitle,
  actions,
  children,
}: {
  eyebrow: string
  title: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="mx-auto min-h-full w-full max-w-[1500px] px-8 pt-[30px] pb-[45px] max-[760px]:px-[15px] max-[760px]:pt-[21px] max-[760px]:pb-[35px]">
      <div className="mb-[23px] flex items-end justify-between gap-6 max-[760px]:flex-col max-[760px]:items-start">
        <div>
          <p className="mb-[5px] text-[8px] font-black tracking-[.15em] text-[#F06E3D]">{eyebrow}</p>
          <h1 className="m-0 text-[28px] tracking-[-.035em] max-[500px]:text-[28px]">{title}</h1>
          {subtitle && <span className="mt-[6px] block text-[10px] text-[#738078] max-[760px]:text-xs">{subtitle}</span>}
        </div>
        {actions && <div className="flex gap-[9px] max-[760px]:w-full">{actions}</div>}
      </div>
      {children}
    </div>
  )
}

export function TablePage({
  eyebrow,
  title,
  subtitle,
  headings,
  rows,
}: {
  eyebrow: string
  title: string
  subtitle: string
  headings: string[];
  rows: (string | ReactNode)[][]
}) {
  return (
    <AdminPage eyebrow={eyebrow} title={title} subtitle={subtitle} actions={<button className="inline-flex cursor-pointer items-center justify-center rounded-[9px] border border-transparent bg-[#1D3328] px-[14px] py-[10px] text-[9px] font-extrabold text-white transition-[background-color,box-shadow] hover:bg-[#315443] hover:shadow-[0_6px_16px_rgba(29,51,40,.12)] max-[760px]:flex-1 max-[760px]:text-xs">+ Add new</button>}>
      <section className="overflow-hidden rounded-[18px] border border-[#E2E5DF] bg-white shadow-[0_18px_50px_rgba(29,51,40,.08)]">
        <div className="flex justify-between gap-[15px] border-b border-[#E2E5DF] p-[15px] max-[760px]:flex-col max-[760px]:items-stretch">
          <label className="flex h-[34px] w-[min(340px,50%)] items-center gap-[7px] rounded-lg border border-[#E2E5DF] bg-[#F8FAF7] px-[9px] max-[760px]:w-full">
            <SearchIcon className="w-[13px]" />
            <input className="w-full border-0 bg-transparent text-[11px] outline-none" placeholder={`Search ${title.toLowerCase()}`} />
          </label>
          <div className="flex gap-[7px]">
            <button className="inline-flex cursor-pointer items-center justify-center rounded-[9px] border border-[#E2E5DF] bg-white px-[11px] py-2 text-[11px] font-extrabold text-[#425148] transition-[background-color,box-shadow] hover:bg-[#315443] hover:text-white hover:shadow-[0_6px_16px_rgba(29,51,40,.12)]">Filter</button>
            <button className="inline-flex cursor-pointer items-center justify-center rounded-[9px] border border-[#E2E5DF] bg-white px-[11px] py-2 text-[11px] font-extrabold text-[#425148] transition-[background-color,box-shadow] hover:bg-[#315443] hover:text-white hover:shadow-[0_6px_16px_rgba(29,51,40,.12)]">Export</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {headings.map((heading) => (
                  <th key={heading} className="whitespace-nowrap border-b border-[#EDF0EB] px-[18px] py-[15px] text-left text-[10px] font-black uppercase tracking-[.08em] text-[#8B9690] max-[760px]:px-[11px] max-[760px]:py-[11px]">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index} className="hover:bg-[#FAFBF8]">
                  {row.map((cell, cellIndex) => {
                    const statusClass = typeof cell === 'string' && cellIndex === 2
                      ? ['warned', 'pending', 'high', 'review'].includes(cell.toLowerCase())
                        ? 'bg-[#FAE9DC] text-[#A25A2F]'
                        : 'bg-[#E7F4EA] text-[#36714A]'
                      : ''
                    return (
                      <td key={cellIndex} className="whitespace-nowrap border-b border-[#EDF0EB] px-[18px] py-[15px] text-left text-[13px] max-[760px]:px-[11px] max-[760px]:py-[11px]">
                        {cellIndex === 2 && typeof cell === 'string' ? (
                          <span className={`inline-flex items-center gap-[6px] rounded-xl px-2 py-[5px] text-[10px] font-extrabold ${statusClass}`}>
                            <i className="size-[5px] rounded-full bg-current" />
                            {cell}
                          </span>
                        ) : (
                          cell
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 text-[11px] text-[#738078]">
          <span>Showing {rows.length} records</span>
          <div className="flex gap-1">
            <button disabled className="inline-flex min-w-[27px] cursor-pointer items-center justify-center rounded border border-transparent bg-[#F7F8F5] p-[6px] text-[#647068] shadow-none disabled:cursor-not-allowed disabled:opacity-50">←</button>
            <button className="inline-flex min-w-[27px] cursor-pointer items-center justify-center rounded border border-transparent bg-[#1D3328] p-[6px] text-white">1</button>
            <button className="inline-flex min-w-[27px] cursor-pointer items-center justify-center rounded border border-transparent bg-[#F7F8F5] p-[6px] text-[#647068]">2</button>
            <button className="inline-flex min-w-[27px] cursor-pointer items-center justify-center rounded border border-transparent bg-[#F7F8F5] p-[6px] text-[#647068]">→</button>
          </div>
        </div>
      </section>
    </AdminPage>
  )
}
