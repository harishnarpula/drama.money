import { getAuditEntries } from '../../data/videoStore'
import { AdminPage, CardHeading, TablePage } from '../components/AdminPageUI'

const userRows = [
  ['@hari_learns', 'Creator', 'Active', '284'],
  ['@ananya_careers', 'Creator', 'Active', '1,240'],
  ['@career_fast', 'Creator', 'Warned', '86'],
  ['@ravi_student', 'Viewer', 'Active', '0'],
]
const tableActionButtonClass = 'inline-flex cursor-pointer items-center justify-center rounded-[9px] border border-transparent bg-[#1D3328] px-[10px] py-[7px] text-[11px] font-extrabold text-white transition-[background-color,box-shadow] hover:bg-[#315443] hover:shadow-[0_6px_16px_rgba(29,51,40,.12)]'

export function UsersPage() {
  return (
    <TablePage
      eyebrow="TRUST & SAFETY"
      title="User management"
      subtitle="Review accounts, status and creator access."
      headings={['Account', 'Type', 'Status', 'Followers', 'Action']}
      rows={userRows.map((row) => [...row, <button key="a" className={tableActionButtonClass}>Review account</button>])}
    />
  )
}

export function ReportsPage() {
  return (
    <TablePage
      eyebrow="MODERATION"
      title="Reports and comments"
      subtitle="Resolve community reports and moderate harmful comments."
      headings={['Report', 'Target', 'Reason', 'Age', 'Action']}
      rows={[
        ['RPT-1042', 'Video: Job in 7 days', 'Misleading claim', '12 min', <button key="a" className={tableActionButtonClass}>Resolve</button>],
        ['RPT-1041', 'Comment by @spam_job', 'Spam link', '31 min', <button key="b" className={tableActionButtonClass}>Hide comment</button>],
      ]}
    />
  )
}

export function KycPage() {
  return (
    <TablePage
      eyebrow="FINANCE"
      title="Creator KYC"
      subtitle="Verify creator identity before the first payout."
      headings={['Creator', 'Document', 'Status', 'Submitted', 'Action']}
      rows={[
        ['@ananya_careers', 'PAN + bank', 'Pending', 'Today', <button key="a" className={tableActionButtonClass}>Verify</button>],
        ['@hari_learns', 'PAN + bank', 'Approved', '17 Nov', <button key="b" className={tableActionButtonClass}>View</button>],
      ]}
    />
  )
}

export function PayoutsPage() {
  return (
    <TablePage
      eyebrow="FINANCE"
      title="Payout control"
      subtitle="Manage seven-day holds and approved creator payments."
      headings={['Creator', 'Eligible', 'Hold ends', 'Risk', 'Action']}
      rows={[
        ['@hari_learns', '₹120', '24 Nov', 'Clean', <button key="a" className={tableActionButtonClass}>Approve</button>],
        ['@ananya_careers', '₹240', '25 Nov', 'Review', <button key="b" className={tableActionButtonClass}>Pause</button>],
      ]}
    />
  )
}

export function FraudPage() {
  return (
    <TablePage
      eyebrow="RISK ENGINE"
      title="Fraud signals"
      subtitle="Investigate abnormal viewing and linked-device patterns."
      headings={['Signal', 'Account', 'Severity', 'Evidence', 'Action']}
      rows={[
        ['Viewer velocity', '@career_fast', 'High', '92% new sessions', <button key="a" className={tableActionButtonClass}>Investigate</button>],
        ['Repeated devices', '@quick_skill', 'Medium', '14 accounts', <button key="b" className={tableActionButtonClass}>Review</button>],
      ]}
    />
  )
}

export function CategoriesPage() {
  return (
    <TablePage
      eyebrow="CONTENT POLICY"
      title="Categories and pay"
      subtitle="Control pilot categories, limits and creator rewards."
      headings={['Category', 'Status', 'Base pay', 'Daily limit', 'Action']}
      rows={[
        ['Private jobs', 'Active', '₹40', '3', <button key="a" className={tableActionButtonClass}>Edit</button>],
        ['Interview preparation', 'Active', '₹40', '3', <button key="b" className={tableActionButtonClass}>Edit</button>],
        ['Skill building', 'Active', '₹30', '3', <button key="c" className={tableActionButtonClass}>Edit</button>],
      ]}
    />
  )
}

export function SettingsPage() {
  return (
    <AdminPage eyebrow="SUPER ADMIN" title="Platform settings" subtitle="Configure high-impact safety and access controls.">
      <div className="grid grid-cols-2 gap-4 max-[760px]:grid-cols-1">
        <section className="rounded-[18px] border border-[#E2E5DF] bg-white p-[22px] shadow-[0_18px_50px_rgba(29,51,40,.08)]">
          <CardHeading title="Safety controls" subtitle="Content processing and moderation defaults" />
          <label className="mt-4 grid gap-[7px] text-xs font-bold">
            AI risk threshold
            <select className="rounded-lg border border-[#E2E5DF] bg-[#FAFBF9] p-[11px]" defaultValue="balanced">
              <option value="balanced">Balanced</option>
              <option>Strict</option>
            </select>
          </label>
          <label className="mt-4 grid gap-[7px] text-xs font-bold">
            Maximum video duration
            <input className="rounded-lg border border-[#E2E5DF] bg-[#FAFBF9] p-[11px]" defaultValue="3 minutes" />
          </label>
          <label className="mt-4 grid grid-cols-[1fr_auto] items-center gap-[7px] rounded-[10px] border border-[#E2E5DF] p-[14px]">
            <span>
              <b className="block">Emergency payout pause</b>
              <small className="mt-1 block text-[10px] text-[#738078]">Stop all new creator payouts immediately</small>
            </span>
            <input className="size-[20px] w-[38px] accent-[#1D3328]" type="checkbox" />
          </label>
          <button className="mt-4 mr-[5px] inline-flex cursor-pointer items-center justify-center rounded-[9px] border border-transparent bg-[#1D3328] px-[14px] py-[10px] text-xs font-extrabold text-white transition-[background-color,box-shadow] hover:bg-[#315443] hover:shadow-[0_6px_16px_rgba(29,51,40,.12)]">Save safety controls</button>
        </section>

        <section className="rounded-[18px] border border-[#E2E5DF] bg-white p-[22px] shadow-[0_18px_50px_rgba(29,51,40,.08)]">
          <CardHeading title="Access control" subtitle="Admin roles and authentication policy" />
          <div className="my-5 flex items-center gap-3 rounded-[11px] border border-[#E2E5DF] p-[15px]">
            <span className="grid size-[38px] place-items-center rounded-[10px] bg-[#1D3328] text-[9px] font-black text-white">AD</span>
            <div>
              <b className="block text-xs">1 administrator</b>
              <small className="mt-1 block text-[10px] text-[#738078]">Unified Drama.Money Administrator</small>
            </div>
          </div>
          <button className="mt-4 mr-[5px] inline-flex cursor-pointer items-center justify-center rounded-[9px] border border-transparent bg-[#1D3328] px-[14px] py-[10px] text-xs font-extrabold text-white transition-[background-color,box-shadow] hover:bg-[#315443] hover:shadow-[0_6px_16px_rgba(29,51,40,.12)]">Manage admin accounts</button>
          <button className="mt-4 mr-[5px] inline-flex cursor-pointer items-center justify-center rounded-[9px] border border-[#E2E5DF] bg-white px-[14px] py-[10px] text-xs font-extrabold text-[#34473D] transition-colors hover:border-[#AEBCB2] hover:bg-[#EEF2ED] hover:text-[#1D3328]">Require MFA for everyone</button>
        </section>
      </div>
    </AdminPage>
  )
}

export function AuditPage() {
  const rows = getAuditEntries().map((entry) => [
    entry.action,
    entry.actor,
    entry.target,
    new Date(entry.timestamp).toLocaleString('en-IN'),
  ])

  return (
    <TablePage
      eyebrow="SECURITY"
      title="Immutable audit trail"
      subtitle="A permanent record of sensitive administrative actions."
      headings={['Action', 'Actor', 'Target', 'Time']}
      rows={rows}
    />
  )
}
