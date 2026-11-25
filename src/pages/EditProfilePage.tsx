import { useState } from 'react'
import type { SyntheticEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/auth-context'
import { ExternalLinkIcon, PlatformIcon, PlusIcon, TrashIcon } from '../components/Icons'
import ProfilePhotoPicker from '../components/ProfilePhotoPicker'
import type { SocialLink, SocialPlatform } from '../services/api'

const PLATFORM_DEFAULT_NAMES: Record<SocialPlatform, string> = {
  WEBSITE: 'Website',
  LINKEDIN: 'LinkedIn',
  INSTAGRAM: 'Instagram',
  FACEBOOK: 'Facebook',
  TWITTER: 'Twitter',
  YOUTUBE: 'YouTube',
  GITHUB: 'GitHub',
  THREADS: 'Threads',
  OTHER: 'Other',
}

const editableFields = ['town', 'country', 'college', 'skills', 'bio', 'latitude', 'longitude'] as const

export default function EditProfilePage() {
  const { profile, updateProfile, addSocialLink, updateSocialLink, toggleSocialLink } = useAuth()
  const navigate = useNavigate()
  const [draft, setDraft] = useState(profile)
  const [prevProfile, setPrevProfile] = useState(profile)
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  // Location detection state
  const [locState, setLocState] = useState<'idle' | 'detecting' | 'success' | 'error'>('idle')
  const [locMessage, setLocMessage] = useState('')

  // Unified social link editor state (for both adding new and updating existing)
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null)
  const [linkPlatform, setLinkPlatform] = useState<SocialPlatform>('WEBSITE')
  const [linkTitle, setLinkTitle] = useState('Website')
  const [linkUrl, setLinkUrl] = useState('')
  const [isSavingLink, setIsSavingLink] = useState(false)
  const [socialError, setSocialError] = useState('')
  const [socialSuccess, setSocialSuccess] = useState('')

  if (profile !== prevProfile) {
    setPrevProfile(profile)
    setDraft((current) => {
      if (current.id !== profile.id) return profile
      const unsavedFields = editableFields.filter((field) => current[field] !== prevProfile[field])
      return { ...profile, ...Object.fromEntries(unsavedFields.map((field) => [field, current[field]])) }
    })
  }

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocState('error')
      setLocMessage('Geolocation is not supported by your browser.')
      return
    }
    setLocState('detecting')
    setLocMessage('Requesting location permission...')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(7))
        const lng = Number(pos.coords.longitude.toFixed(7))
        setDraft((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
        }))
        setLocState('success')
        setLocMessage(`Location captured: ${lat.toFixed(6)}, ${lng.toFixed(6)}`)
      },
      (err) => {
        setLocState('error')
        if (err.code === 1) {
          setLocMessage('Location permission denied. Please allow location access in your browser.')
        } else if (err.code === 2) {
          setLocMessage('Position unavailable. Check your device GPS.')
        } else {
          setLocMessage('Location request timed out. Please try again.')
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    )
  }

  const startEditingLink = (link: SocialLink) => {
    setEditingLinkId(link.id)
    setLinkPlatform(link.platform)
    setLinkTitle(link.title)
    setLinkUrl(link.url)
    setSocialError('')
    setSocialSuccess('')
  }

  const cancelEditingLink = () => {
    setEditingLinkId(null)
    setLinkPlatform('WEBSITE')
    setLinkTitle('Website')
    setLinkUrl('')
    setSocialError('')
  }

  const handleSaveSocialLink = async (e?: SyntheticEvent) => {
    if (e) e.preventDefault()
    if (!linkUrl.trim()) {
      setSocialError('Please enter a link URL.')
      return
    }
    let formattedUrl = linkUrl.trim()
    if (!formattedUrl.toLowerCase().startsWith('http://') && !formattedUrl.toLowerCase().startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`
    }
    const titleToSave = linkTitle.trim() || PLATFORM_DEFAULT_NAMES[linkPlatform]
    setSocialError('')
    setSocialSuccess('')
    setIsSavingLink(true)
    try {
      if (editingLinkId) {
        if (updateSocialLink) {
          await updateSocialLink(editingLinkId, {
            platform: linkPlatform,
            title: titleToSave,
            url: formattedUrl,
          })
          setSocialSuccess('Social media link updated successfully!')
        }
      } else {
        if (addSocialLink) {
          await addSocialLink({
            platform: linkPlatform,
            title: titleToSave,
            url: formattedUrl,
          })
          setSocialSuccess('Social media link added successfully!')
        }
      }
      setEditingLinkId(null)
      setLinkUrl('')
      setLinkTitle(PLATFORM_DEFAULT_NAMES[linkPlatform])
      setTimeout(() => setSocialSuccess(''), 3000)
    } catch (err: unknown) {
      setSocialError(err instanceof Error ? err.message : 'Failed to save link')
    } finally {
      setIsSavingLink(false)
    }
  }

  const handleDeleteOrDeactivate = async (linkId: string) => {
    try {
      if (toggleSocialLink) {
        await toggleSocialLink(linkId, false)
        setSocialSuccess('Social media link deactivated successfully.')
        setTimeout(() => setSocialSuccess(''), 3000)
      }
    } catch (err: unknown) {
      setSocialError(err instanceof Error ? err.message : 'Failed to deactivate link')
    }
  }

  const handleActivateLink = async (linkId: string) => {
    try {
      if (toggleSocialLink) {
        await toggleSocialLink(linkId, true)
        setSocialSuccess('Social media link activated successfully.')
        setTimeout(() => setSocialSuccess(''), 3000)
      }
    } catch (err: unknown) {
      setSocialError(err instanceof Error ? err.message : 'Failed to activate link')
    }
  }

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault()
    setError('')
    setSuccessMsg('')
    setIsSaving(true)
    try {
      if (linkUrl.trim()) {
        let formattedUrl = linkUrl.trim()
        if (!formattedUrl.toLowerCase().startsWith('http://') && !formattedUrl.toLowerCase().startsWith('https://')) {
          formattedUrl = `https://${formattedUrl}`
        }
        const titleToSave = linkTitle.trim() || PLATFORM_DEFAULT_NAMES[linkPlatform]
        if (editingLinkId && updateSocialLink) {
          await updateSocialLink(editingLinkId, {
            platform: linkPlatform,
            title: titleToSave,
            url: formattedUrl,
          })
        } else if (addSocialLink) {
          await addSocialLink({
            platform: linkPlatform,
            title: titleToSave,
            url: formattedUrl,
          })
        }
        setEditingLinkId(null)
        setLinkUrl('')
        setLinkTitle(PLATFORM_DEFAULT_NAMES[linkPlatform])
      }
      await updateProfile(draft)
      setSuccessMsg('Profile updated successfully!')
      setTimeout(() => {
        navigate('/app/profile')
      }, 700)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile'
      setError(msg)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 antialiased">
      <header className="mb-6 flex items-end justify-between border-b border-[#D8D2C8] pb-4">
        <div>
          <p className="text-[10px] font-black tracking-widest text-[#24372C]/60 uppercase">Your Account</p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#24372C]">Edit profile</h1>
        </div>
        <Link
          to="/app/profile"
          className="text-xs sm:text-sm font-semibold text-[#657067] hover:text-[#24372C] transition-colors"
        >
          Cancel
        </Link>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <section className="flex flex-col items-center gap-4 rounded-2xl border border-[#D8D2C8] bg-white p-4 shadow-sm sm:flex-row sm:gap-6 sm:p-6">
          <ProfilePhotoPicker />
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <h2 className="text-base font-bold text-[#24372C]">Profile photo</h2>
            <p className="mt-1 text-sm text-[#657067]">Select your photo to upload a JPG, PNG or WebP image up to 2 MB.</p>
          </div>
        </section>

        {error && (
          <p className="rounded-xl border border-[#FCA5A5] bg-[#FEE2E2] p-3 text-xs font-semibold text-[#DC2626]" role="alert">
            {error}
          </p>
        )}

        {successMsg && (
          <p className="rounded-xl border border-[#86EFAC] bg-[#DCFCE7] p-3 text-xs font-semibold text-[#166534]" role="status">
            {successMsg}
          </p>
        )}

        {/* Unified Profile Card: Inputs + Location + Bio + Social Links */}
        <section className="grid grid-cols-1 gap-4 rounded-2xl border border-[#D8D2C8] bg-white p-4 shadow-sm sm:grid-cols-2 sm:p-6">
          <label className="flex flex-col gap-1.5 text-xs font-bold text-[#24372C]">
            <span>Full name</span>
            <input
              disabled
              value={draft.name}
              title="Full name is tied to your account"
              className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-[#F3F4F6] px-3 text-sm text-[#4B5563] cursor-not-allowed outline-none"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-bold text-[#24372C]">
            <span>Username</span>
            <input
              disabled
              value={draft.username}
              title="Username is tied to your account"
              className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-[#F3F4F6] px-3 text-sm text-[#4B5563] cursor-not-allowed outline-none"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-bold text-[#24372C]">
            <span>Town / Location</span>
            <input
              maxLength={150}
              value={draft.town || ''}
              onChange={(event) => setDraft({ ...draft, town: event.target.value })}
              placeholder="e.g. Hyderabad, Vijayawada"
              className="h-10 w-full rounded-xl border border-[#DCE0DD] bg-[#FCFBF8] px-3 text-sm text-[#24372C] outline-none transition focus:border-[#24372C] focus:ring-2 focus:ring-[#24372C]/10"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-bold text-[#24372C]">
            <span>Country</span>
            <input
              maxLength={100}
              value={draft.country || ''}
              onChange={(event) => setDraft({ ...draft, country: event.target.value })}
              placeholder="e.g. INDIA"
              className="h-10 w-full rounded-xl border border-[#DCE0DD] bg-[#FCFBF8] px-3 text-sm text-[#24372C] outline-none transition focus:border-[#24372C] focus:ring-2 focus:ring-[#24372C]/10"
            />
          </label>

          {/* Location & GPS Detection Card */}
          <div className="sm:col-span-2 rounded-xl border border-[#D8D2C8] bg-[#FAF8F5] p-3 sm:p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-[#24372C]">📍 GPS Location</span>
                {draft.latitude != null && draft.longitude != null ? (
                  <span className="rounded-md bg-[#DCFCE7] px-2 py-0.5 text-[10px] font-bold text-[#166534]">
                    Coordinates captured
                  </span>
                ) : (
                  <span className="rounded-md bg-[#E5E7EB] px-2 py-0.5 text-[10px] font-medium text-[#4B5563]">
                    Not set
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#657067] mt-1">
                {draft.latitude != null && draft.longitude != null
                  ? `Latitude: ${draft.latitude.toFixed(6)}, Longitude: ${draft.longitude.toFixed(6)}`
                  : 'Capture precise GPS coordinates automatically via browser location permission.'}
              </p>
              {locMessage && (
                <p
                  className={`text-[11px] font-semibold mt-1 ${
                    locState === 'error' ? 'text-[#DC2626]' : locState === 'success' ? 'text-[#166534]' : 'text-[#657067]'
                  }`}
                >
                  {locMessage}
                </p>
              )}
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2 self-start md:self-center">
              {draft.latitude != null && draft.longitude != null && (
                <button
                  type="button"
                  onClick={() => {
                    setDraft((prev) => ({ ...prev, latitude: null, longitude: null }))
                    setLocState('idle')
                    setLocMessage('')
                  }}
                  className="h-8 px-2.5 rounded-lg text-xs font-bold text-[#DC2626] hover:bg-[#FEE2E2] transition cursor-pointer"
                >
                  Clear GPS
                </button>
              )}
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={locState === 'detecting'}
                className="min-h-10 whitespace-nowrap px-3.5 rounded-xl border border-[#D8D2C8] bg-white text-sm font-bold text-[#24372C] hover:bg-[#EAE4D9] transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <span>📍</span>
                <span>{locState === 'detecting' ? 'Detecting...' : 'Auto-detect GPS'}</span>
              </button>
            </div>
          </div>

          <label className="flex flex-col gap-1.5 text-xs font-bold text-[#24372C]">
            <span>College / University</span>
            <input
              maxLength={100}
              value={draft.college || ''}
              onChange={(event) => setDraft({ ...draft, college: event.target.value })}
              placeholder="Your college or university"
              className="h-10 w-full rounded-xl border border-[#DCE0DD] bg-[#FCFBF8] px-3 text-sm text-[#24372C] outline-none transition focus:border-[#24372C] focus:ring-2 focus:ring-[#24372C]/10"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-bold text-[#24372C]">
            <span>Skills</span>
            <input
              maxLength={120}
              value={draft.skills || ''}
              onChange={(event) => setDraft({ ...draft, skills: event.target.value })}
              placeholder="e.g. Java, Communication, Banking exams, Web design"
              className="h-10 w-full rounded-xl border border-[#DCE0DD] bg-[#FCFBF8] px-3 text-sm text-[#24372C] outline-none transition focus:border-[#24372C] focus:ring-2 focus:ring-[#24372C]/10"
            />
          </label>

          <label className="sm:col-span-2 flex flex-col gap-1.5 text-xs font-bold text-[#24372C]">
            <div className="flex items-center justify-between">
              <span>Bio (saved to server)</span>
              <span className="text-[11px] font-normal text-[#657067]">{(draft.bio || '').length}/500</span>
            </div>
            <textarea
              maxLength={500}
              rows={4}
              value={draft.bio || ''}
              onChange={(event) => setDraft({ ...draft, bio: event.target.value })}
              placeholder="Tell the community what you are learning or sharing (max 500 characters)"
              className="w-full rounded-xl border border-[#DCE0DD] bg-[#FCFBF8] p-3 text-sm text-[#24372C] outline-none transition resize-none focus:border-[#24372C] focus:ring-2 focus:ring-[#24372C]/10"
            />
          </label>

          {/* Social Media Links Section Inside the Same Profile Card */}
          <div id="social-links" className="sm:col-span-2 pt-6 mt-2 border-t border-[#EAE7DF] flex flex-col gap-4">
            <div>
              <h2 className="text-base font-bold text-[#24372C]">Social media links</h2>
              <p className="text-xs text-[#657067] mt-0.5">
                Connect your social media profiles to show on your public profile page.
              </p>
            </div>

            {/* Existing Links List */}
            {profile.socialLinks && profile.socialLinks.length > 0 ? (
              <div className="flex flex-col gap-2">
                {profile.socialLinks.map((link) => (
                  <div
                    key={link.id}
                    className={`flex items-center justify-between gap-3 rounded-xl border p-3 transition ${
                      editingLinkId === link.id
                        ? 'border-[#24372C] bg-[#FAF8F5] ring-2 ring-[#24372C]/10'
                        : link.active
                        ? 'border-[#D8D2C8] bg-white'
                        : 'border-dashed border-[#D8D2C8] bg-transparent opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#EAE7DF] text-[#24372C]">
                        <PlatformIcon platform={link.platform} className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#24372C] truncate">
                          {link.title || PLATFORM_DEFAULT_NAMES[link.platform] || link.platform}
                        </p>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-[#657067] hover:text-[#24372C] hover:underline flex items-center gap-1 truncate"
                        >
                          <span className="truncate">{link.url}</span>
                          <ExternalLinkIcon className="size-2.5 shrink-0" />
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          link.active ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#F3F4F6] text-[#6B7280]'
                        }`}
                      >
                        {link.active ? 'Active' : 'Inactive'}
                      </span>
                      <button
                        type="button"
                        onClick={() => startEditingLink(link)}
                        className="h-7 px-2.5 rounded-lg border border-[#D8D2C8] bg-white text-xs font-bold text-[#24372C] hover:bg-[#F4F1EA] transition cursor-pointer"
                      >
                        Edit
                      </button>
                      {link.active ? (
                        <button
                          type="button"
                          onClick={() => handleDeleteOrDeactivate(link.id)}
                          className="h-7 px-2.5 rounded-lg border border-[#FCA5A5] bg-[#FEE2E2]/60 text-xs font-bold text-[#DC2626] hover:bg-[#FEE2E2] transition cursor-pointer flex items-center gap-1"
                        >
                          <TrashIcon className="size-3" />
                          <span>Delete</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleActivateLink(link.id)}
                          className="h-7 px-2.5 rounded-lg border border-[#86EFAC] bg-[#DCFCE7]/60 text-xs font-bold text-[#166534] hover:bg-[#DCFCE7] transition cursor-pointer"
                        >
                          Activate
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#657067] italic">No social media links added yet. Add your first link below.</p>
            )}

            {/* Single Clean Link Form */}
            <div className="pt-2 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#24372C]">
                  {editingLinkId ? 'Edit social media link' : 'Add new social media link'}
                </span>
                {editingLinkId && (
                  <button
                    type="button"
                    onClick={cancelEditingLink}
                    className="text-xs font-semibold text-[#657067] hover:text-[#24372C] cursor-pointer"
                  >
                    Cancel editing
                  </button>
                )}
              </div>

              {socialError && (
                <p className="rounded-lg border border-[#FCA5A5] bg-[#FEE2E2] p-2 text-xs font-semibold text-[#DC2626]">
                  {socialError}
                </p>
              )}

              {socialSuccess && (
                <p className="rounded-lg border border-[#86EFAC] bg-[#DCFCE7] p-2 text-xs font-semibold text-[#166534]">
                  {socialSuccess}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="flex flex-col gap-1 text-[11px] font-bold text-[#24372C]">
                  <span>Platform</span>
                  <select
                    value={linkPlatform}
                    onChange={(e) => {
                      const plat = e.target.value as SocialPlatform
                      setLinkPlatform(plat)
                      if (!linkTitle || Object.values(PLATFORM_DEFAULT_NAMES).includes(linkTitle)) {
                        setLinkTitle(PLATFORM_DEFAULT_NAMES[plat])
                      }
                    }}
                    className="h-10 w-full rounded-xl border border-[#DCE0DD] bg-white px-3 text-xs sm:text-sm text-[#24372C] outline-none transition focus:border-[#24372C]"
                  >
                    <option value="WEBSITE">Website</option>
                    <option value="LINKEDIN">LinkedIn</option>
                    <option value="INSTAGRAM">Instagram</option>
                    <option value="FACEBOOK">Facebook</option>
                    <option value="TWITTER">Twitter</option>
                    <option value="YOUTUBE">YouTube</option>
                    <option value="GITHUB">GitHub</option>
                    <option value="THREADS">Threads</option>
                    <option value="OTHER">Other</option>
                  </select>
                </label>

                <label className="flex flex-col gap-1 text-[11px] font-bold text-[#24372C]">
                  <span>Title</span>
                  <input
                    type="text"
                    maxLength={100}
                    value={linkTitle}
                    onChange={(e) => setLinkTitle(e.target.value)}
                    placeholder="e.g. My Website"
                    className="h-10 w-full rounded-xl border border-[#DCE0DD] bg-white px-3 text-xs sm:text-sm text-[#24372C] outline-none transition focus:border-[#24372C] focus:ring-2 focus:ring-[#24372C]/10"
                  />
                </label>

                <label className="flex flex-col gap-1 text-[11px] font-bold text-[#24372C]">
                  <span>URL</span>
                  <input
                    type="text"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://..."
                    className="h-10 w-full rounded-xl border border-[#DCE0DD] bg-white px-3 text-xs sm:text-sm text-[#24372C] outline-none transition focus:border-[#24372C] focus:ring-2 focus:ring-[#24372C]/10"
                  />
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                {editingLinkId && (
                  <button
                    type="button"
                    onClick={cancelEditingLink}
                    className="h-9 px-4 rounded-xl border border-[#D8D2C8] text-xs font-semibold text-[#657067] hover:bg-white cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleSaveSocialLink()}
                  disabled={isSavingLink}
                  style={{ color: '#F4F1EA', backgroundColor: '#24372C' }}
                  className="h-9 px-5 rounded-xl text-xs sm:text-sm font-bold shadow-xs hover:bg-[#2F4739] transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  <PlusIcon className="size-4" />
                  <span>{isSavingLink ? 'Saving...' : editingLinkId ? 'Update link' : 'Add social media link'}</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Action Row: Cancel / Save changes at the bottom */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            to="/app/profile"
            className="h-10 px-5 rounded-xl border border-[#D8D2C8] text-xs font-bold text-[#657067] hover:text-[#24372C] hover:bg-[#E6E0D5]/50 flex items-center justify-center transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            style={{ color: '#F4F1EA', backgroundColor: '#24372C' }}
            className="h-10 min-w-[130px] px-6 rounded-xl text-xs sm:text-sm font-bold shadow-md hover:bg-[#2F4739] disabled:opacity-50 transition flex items-center justify-center cursor-pointer"
          >
            {isSaving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
