'use client'

import { useState, useRef } from 'react'
import {
    FiPlay, FiUser, FiClock, FiCode, FiMessageCircle,
    FiSettings, FiMic, FiZap, FiBriefcase, FiUpload,
    FiCheck, FiChevronRight, FiChevronLeft, FiFileText,
    FiShield, FiStar, FiTarget, FiTrendingUp
} from 'react-icons/fi'

const INTERVIEWERS = [
    { id: 'emma', name: 'Dr. Emma', voice: 'Kore', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=300&fit=crop&crop=top', desc: 'Professional, warm, structured' },
    { id: 'john', name: 'Dr. John', voice: 'Puck', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=300&fit=crop&crop=top', desc: 'Technical, in-depth, analytical' },
]

const ROLES = [
    'Software Development Engineer', 'Frontend Developer', 'Backend Developer',
    'Full-Stack Developer', 'Java Developer', 'Android Developer',
    'Data Scientist', 'Data Engineer', 'Cybersecurity Analyst',
    'Network Engineer', 'Mechanical Engineer', 'Business Manager',
    'Product Manager', 'Project Manager', 'Business Analyst',
    'Digital Marketing Specialist', 'HR', 'Sales Executive',
    'Customer Service Representative',
]

const ROUNDS = [
    { id: 'Coding', label: 'Coding', icon: <FiCode />, desc: 'DSA problems with code editor & AI judge' },
    { id: 'Warm-up', label: 'Warm-up', icon: <FiZap />, desc: 'Light introductory conversation' },
    { id: 'Role-based', label: 'Role-based', icon: <FiBriefcase />, desc: 'Role-specific technical questions' },
    { id: 'Behavioral', label: 'Behavioral', icon: <FiMessageCircle />, desc: 'Communication, teamwork, leadership' },
    { id: 'System Design', label: 'System Design', icon: <FiSettings />, desc: 'Architecture & whiteboard design' },
    { id: 'Managerial', label: 'Managerial', icon: <FiStar />, desc: 'Leadership, strategy, people management' },
]

const DIFFICULTIES = [
    { id: 'Beginner', label: 'Beginner', icon: <FiTarget />, color: '#22c55e', desc: 'Entry-level, foundational concepts' },
    { id: 'Medium', label: 'Medium', icon: <FiTrendingUp />, color: '#f59e0b', desc: 'Intermediate challenge, practical scenarios' },
    { id: 'Professional', label: 'Professional', icon: <FiShield />, color: '#ef4444', desc: 'Expert-level, complex & nuanced' },
]

const DURATIONS = [5, 10, 15, 60]

export default function InterviewSetup({ onStart }) {
    const [step, setStep] = useState(1)

    // Step 1
    const [jobType, setJobType] = useState('Job')
    const [role, setRole] = useState('')
    const [customRole, setCustomRole] = useState('')
    const [isCustomRole, setIsCustomRole] = useState(false)

    // Step 2
    const [round, setRound] = useState('Behavioral')
    const [customRound, setCustomRound] = useState('')
    const [isCustomRound, setIsCustomRound] = useState(false)
    const [difficulty, setDifficulty] = useState('Medium')
    const [duration, setDuration] = useState(15)

    // Step 3
    const [interviewer, setInterviewer] = useState('emma')
    const [company, setCompany] = useState('')
    const [resumeText, setResumeText] = useState('')
    const [resumeFileName, setResumeFileName] = useState('')
    const [isUploadingResume, setIsUploadingResume] = useState(false)
    const [agreedTerms, setAgreedTerms] = useState(false)
    const [micPermission, setMicPermission] = useState(null) // null | granted | denied
    const fileInputRef = useRef(null)

    const effectiveRole = isCustomRole ? customRole : role
    const effectiveRound = isCustomRound ? customRound : round

    const canProceedStep1 = effectiveRole.trim().length > 0
    const canProceedStep2 = effectiveRound.trim().length > 0
    const canStart = agreedTerms && micPermission === 'granted'

    const handleResumeUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        setIsUploadingResume(true)
        setResumeFileName(file.name)
        try {
            const formData = new FormData()
            formData.append('file', file)
            const res = await fetch('/api/resume-analyzer/parse-pdf', { method: 'POST', body: formData })
            const data = await res.json()
            if (data.error) {
                alert(data.error)
                setResumeText('')
                setResumeFileName('')
            } else {
                setResumeText(data.text || '')
            }
        } catch (err) {
            alert('Failed to parse resume. Please try again.')
            setResumeText('')
            setResumeFileName('')
        } finally {
            setIsUploadingResume(false)
        }
    }

    const requestMicPermission = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            stream.getTracks().forEach(t => t.stop())
            setMicPermission('granted')
        } catch {
            setMicPermission('denied')
        }
    }

    const handleStart = () => {
        onStart({
            jobType,
            role: effectiveRole,
            round: effectiveRound,
            difficulty,
            duration,
            interviewer,
            company,
            resumeText,
        })
    }

    const inputStyle = {
        width: '100%', padding: '12px 16px', borderRadius: 12,
        border: '2px solid #e5e7eb', fontSize: 15, outline: 'none',
        transition: 'border-color 0.2s', boxSizing: 'border-box',
        background: '#fff',
    }

    const sectionTitle = (text) => (
        <label style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, display: 'block', color: '#374151' }}>
            {text}
        </label>
    )

    return (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
            {/* Header */}
            <div style={{
                textAlign: 'center', marginBottom: 28,
                padding: '28px 24px',
                background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
                borderRadius: 16, color: '#fff',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
                    <FiMic size={26} />
                    <h2 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>AI Live Interview</h2>
                </div>
                <p style={{ opacity: 0.85, margin: 0, fontSize: 14 }}>
                    Real-time voice interview powered by Gemini 2.5 Flash
                </p>
            </div>

            {/* Stepper */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 0, marginBottom: 28, alignItems: 'center' }}>
                {[1, 2, 3].map((s, i) => (
                    <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: step >= s ? '#7c3aed' : '#e5e7eb',
                            color: step >= s ? '#fff' : '#9ca3af',
                            fontWeight: 800, fontSize: 14, transition: 'all 0.3s',
                        }}>{s}</div>
                        <span style={{
                            marginLeft: 8, fontWeight: 700, fontSize: 13,
                            color: step >= s ? '#1f2937' : '#9ca3af',
                        }}>
                            {s === 1 ? 'Role' : s === 2 ? 'Round' : 'Setup'}
                        </span>
                        {i < 2 && <div style={{ width: 40, height: 2, background: step > s ? '#7c3aed' : '#e5e7eb', margin: '0 12px', transition: 'background 0.3s' }} />}
                    </div>
                ))}
            </div>

            {/* STEP 1: Job Type & Role */}
            {step === 1 && (
                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                    {/* Job Type Toggle */}
                    <div style={{ marginBottom: 24 }}>
                        {sectionTitle('Type')}
                        <div style={{ display: 'flex', gap: 12 }}>
                            {['Job', 'Internship'].map(t => (
                                <button key={t} onClick={() => setJobType(t)} style={{
                                    flex: 1, padding: '14px', borderRadius: 12,
                                    border: jobType === t ? '2px solid #7c3aed' : '2px solid #e5e7eb',
                                    background: jobType === t ? 'linear-gradient(135deg, #f5f3ff, #ede9fe)' : '#fff',
                                    fontWeight: 700, fontSize: 15, cursor: 'pointer',
                                    color: jobType === t ? '#7c3aed' : '#6b7280',
                                    transition: 'all 0.2s',
                                }}>
                                    {t === 'Job' ? <FiBriefcase style={{ marginRight: 8 }} /> : <FiStar style={{ marginRight: 8 }} />}
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Role */}
                    <div style={{ marginBottom: 24 }}>
                        {sectionTitle('Select Role')}
                        <select
                            value={isCustomRole ? '__other__' : role}
                            onChange={(e) => {
                                if (e.target.value === '__other__') { setIsCustomRole(true); setRole('') }
                                else { setIsCustomRole(false); setRole(e.target.value); setCustomRole('') }
                            }}
                            style={{ ...inputStyle, cursor: 'pointer', appearance: 'auto' }}
                        >
                            <option value="" disabled>Select a role...</option>
                            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                            <option value="__other__">Other (specify below)</option>
                        </select>
                        {isCustomRole && (
                            <input
                                type="text" value={customRole}
                                onChange={(e) => setCustomRole(e.target.value)}
                                placeholder="Enter your role..."
                                style={{ ...inputStyle, marginTop: 10 }}
                                onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                            />
                        )}
                    </div>

                    {/* Company */}
                    <div style={{ marginBottom: 28 }}>
                        {sectionTitle('Company (optional)')}
                        <input
                            type="text" value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            placeholder="e.g. Google, Amazon, Flipkart..."
                            style={inputStyle}
                            onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                        />
                    </div>

                    <button onClick={() => setStep(2)} disabled={!canProceedStep1}
                        style={{
                            width: '100%', padding: '14px', borderRadius: 12,
                            background: canProceedStep1 ? '#7c3aed' : '#d1d5db',
                            color: '#fff', fontWeight: 700, fontSize: 16, border: 'none',
                            cursor: canProceedStep1 ? 'pointer' : 'not-allowed',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        }}>
                        Next <FiChevronRight size={20} />
                    </button>
                </div>
            )}

            {/* STEP 2: Round, Difficulty, Duration */}
            {step === 2 && (
                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                    {/* Round */}
                    <div style={{ marginBottom: 24 }}>
                        {sectionTitle('Select Round')}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                            {ROUNDS.map(r => (
                                <button key={r.id}
                                    onClick={() => { setRound(r.id); setIsCustomRound(false); setCustomRound('') }}
                                    style={{
                                        padding: '14px 10px', borderRadius: 12,
                                        border: !isCustomRound && round === r.id ? '2px solid #7c3aed' : '2px solid #e5e7eb',
                                        background: !isCustomRound && round === r.id ? 'linear-gradient(135deg, #f5f3ff, #ede9fe)' : '#fff',
                                        cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                                    }}>
                                    <div style={{ fontSize: 20, marginBottom: 4, color: !isCustomRound && round === r.id ? '#7c3aed' : '#9ca3af', display: 'flex', justifyContent: 'center' }}>{r.icon}</div>
                                    <div style={{ fontWeight: 700, fontSize: 13, color: '#1f2937' }}>{r.label}</div>
                                    <div style={{ fontSize: 10, color: '#6b7280', marginTop: 3 }}>{r.desc}</div>
                                </button>
                            ))}
                            <button
                                onClick={() => { setIsCustomRound(true); setRound('') }}
                                style={{
                                    padding: '14px 10px', borderRadius: 12,
                                    border: isCustomRound ? '2px solid #7c3aed' : '2px solid #e5e7eb',
                                    background: isCustomRound ? 'linear-gradient(135deg, #f5f3ff, #ede9fe)' : '#fff',
                                    cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                                }}>
                                <div style={{ fontSize: 20, marginBottom: 4, color: isCustomRound ? '#7c3aed' : '#9ca3af', display: 'flex', justifyContent: 'center' }}><FiFileText /></div>
                                <div style={{ fontWeight: 700, fontSize: 13, color: '#1f2937' }}>Other</div>
                                <div style={{ fontSize: 10, color: '#6b7280', marginTop: 3 }}>Custom round type</div>
                            </button>
                        </div>
                        {isCustomRound && (
                            <input type="text" value={customRound}
                                onChange={(e) => setCustomRound(e.target.value)}
                                placeholder="Specify round type..."
                                style={{ ...inputStyle, marginTop: 10 }}
                                onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                            />
                        )}
                    </div>

                    {/* Difficulty */}
                    <div style={{ marginBottom: 24 }}>
                        {sectionTitle('Difficulty')}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                            {DIFFICULTIES.map(d => (
                                <button key={d.id} onClick={() => setDifficulty(d.id)}
                                    style={{
                                        padding: '16px 10px', borderRadius: 12,
                                        border: difficulty === d.id ? `2px solid ${d.color}` : '2px solid #e5e7eb',
                                        background: difficulty === d.id ? `${d.color}10` : '#fff',
                                        cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                                    }}>
                                    <div style={{ fontSize: 20, marginBottom: 4, color: d.color, display: 'flex', justifyContent: 'center' }}>{d.icon}</div>
                                    <div style={{ fontWeight: 700, fontSize: 14, color: '#1f2937' }}>{d.label}</div>
                                    <div style={{ fontSize: 10, color: '#6b7280', marginTop: 3 }}>{d.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Duration */}
                    <div style={{ marginBottom: 28 }}>
                        {sectionTitle('Duration')}
                        <div style={{ display: 'flex', gap: 10 }}>
                            {DURATIONS.map(d => (
                                <button key={d} onClick={() => setDuration(d)}
                                    style={{
                                        flex: 1, padding: '12px', borderRadius: 10,
                                        border: duration === d ? '2px solid #7c3aed' : '2px solid #e5e7eb',
                                        background: duration === d ? '#7c3aed' : '#fff',
                                        color: duration === d ? '#fff' : '#374151',
                                        fontWeight: 700, fontSize: 15, cursor: 'pointer',
                                        transition: 'all 0.2s',
                                    }}>
                                    {d}m
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12 }}>
                        <button onClick={() => setStep(1)} style={{
                            flex: 1, padding: '14px', borderRadius: 12,
                            background: '#f3f4f6', color: '#374151', fontWeight: 700, fontSize: 15,
                            border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        }}>
                            <FiChevronLeft size={18} /> Back
                        </button>
                        <button onClick={() => setStep(3)} disabled={!canProceedStep2}
                            style={{
                                flex: 2, padding: '14px', borderRadius: 12,
                                background: canProceedStep2 ? '#7c3aed' : '#d1d5db',
                                color: '#fff', fontWeight: 700, fontSize: 16, border: 'none',
                                cursor: canProceedStep2 ? 'pointer' : 'not-allowed',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            }}>
                            Next <FiChevronRight size={20} />
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 3: Resume, Permissions, Interviewer, Start */}
            {step === 3 && (
                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                    {/* Resume Upload */}
                    <div style={{ marginBottom: 24 }}>
                        {sectionTitle('Upload Resume (optional)')}
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                border: '2px dashed #d1d5db', borderRadius: 14, padding: '28px 16px',
                                textAlign: 'center', cursor: 'pointer',
                                background: resumeText ? '#f0fdf4' : '#fafafa',
                                transition: 'all 0.2s',
                            }}
                        >
                            {isUploadingResume ? (
                                <p style={{ color: '#7c3aed', fontWeight: 600 }}>Parsing resume...</p>
                            ) : resumeText ? (
                                <>
                                    <FiCheck size={28} color="#22c55e" style={{ margin: '0 auto 8px' }} />
                                    <p style={{ fontWeight: 700, color: '#16a34a', margin: 0 }}>{resumeFileName}</p>
                                    <p style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Resume parsed successfully. Click to replace.</p>
                                </>
                            ) : (
                                <>
                                    <FiUpload size={28} color="#9ca3af" style={{ margin: '0 auto 8px' }} />
                                    <p style={{ fontWeight: 600, color: '#6b7280', margin: 0 }}>Click to upload PDF resume</p>
                                    <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>Your resume will personalize the interview questions</p>
                                </>
                            )}
                        </div>
                        <input type="file" ref={fileInputRef} accept=".pdf" style={{ display: 'none' }}
                            onChange={handleResumeUpload} />
                    </div>

                    {/* Interviewer */}
                    <div style={{ marginBottom: 24 }}>
                        {sectionTitle('Choose Interviewer')}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            {INTERVIEWERS.map(iv => (
                                <button key={iv.id} onClick={() => setInterviewer(iv.id)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 14,
                                        padding: 14, borderRadius: 14,
                                        border: interviewer === iv.id ? '2px solid #7c3aed' : '2px solid #e5e7eb',
                                        background: interviewer === iv.id ? 'linear-gradient(135deg, #f5f3ff, #ede9fe)' : '#fff',
                                        cursor: 'pointer', transition: 'all 0.2s',
                                    }}>
                                    <img src={iv.image} alt={iv.name} style={{
                                        width: 52, height: 52, borderRadius: 12, objectFit: 'cover',
                                        border: interviewer === iv.id ? '2px solid #7c3aed' : '2px solid #e5e7eb',
                                    }} />
                                    <div style={{ textAlign: 'left' }}>
                                        <div style={{ fontWeight: 700, fontSize: 15, color: '#1f2937' }}>{iv.name}</div>
                                        <div style={{ fontSize: 11, color: '#6b7280' }}>{iv.desc}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Permissions */}
                    <div style={{ marginBottom: 20 }}>
                        {sectionTitle('Permissions')}
                        <button onClick={requestMicPermission}
                            style={{
                                width: '100%', padding: '14px 16px', borderRadius: 12,
                                border: micPermission === 'granted' ? '2px solid #22c55e' : '2px solid #e5e7eb',
                                background: micPermission === 'granted' ? '#f0fdf4' : '#fff',
                                fontWeight: 600, fontSize: 14, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: 10,
                                color: micPermission === 'granted' ? '#16a34a' : micPermission === 'denied' ? '#ef4444' : '#374151',
                                transition: 'all 0.2s',
                            }}>
                            {micPermission === 'granted' ? <FiCheck size={18} /> : <FiMic size={18} />}
                            {micPermission === 'granted' ? 'Microphone Access Granted' : micPermission === 'denied' ? 'Microphone Denied — Click to Retry' : 'Grant Microphone Permission'}
                        </button>
                    </div>

                    {/* Terms */}
                    <div style={{ marginBottom: 28 }}>
                        <label style={{
                            display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer',
                            padding: '14px 16px', borderRadius: 12,
                            border: agreedTerms ? '2px solid #7c3aed' : '2px solid #e5e7eb',
                            background: agreedTerms ? '#f5f3ff' : '#fff',
                            transition: 'all 0.2s',
                        }}>
                            <div style={{
                                width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 1,
                                border: agreedTerms ? '2px solid #7c3aed' : '2px solid #d1d5db',
                                background: agreedTerms ? '#7c3aed' : '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.2s',
                            }}>
                                {agreedTerms && <FiCheck size={14} color="#fff" />}
                            </div>
                            <input type="checkbox" checked={agreedTerms}
                                onChange={(e) => setAgreedTerms(e.target.checked)}
                                style={{ display: 'none' }} />
                            <div>
                                <span style={{ fontWeight: 700, fontSize: 14, color: '#1f2937' }}>
                                    I agree to the Terms & Conditions
                                </span>
                                <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2, margin: '4px 0 0 0' }}>
                                    Your audio will be processed by Google Gemini for real-time interview simulation. No recordings are stored.
                                </p>
                            </div>
                        </label>
                    </div>

                    <div style={{ display: 'flex', gap: 12 }}>
                        <button onClick={() => setStep(2)} style={{
                            flex: 1, padding: '14px', borderRadius: 12,
                            background: '#f3f4f6', color: '#374151', fontWeight: 700, fontSize: 15,
                            border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        }}>
                            <FiChevronLeft size={18} /> Back
                        </button>
                        <button onClick={handleStart} disabled={!canStart}
                            style={{
                                flex: 2, padding: '16px', borderRadius: 14,
                                background: canStart ? 'linear-gradient(135deg, #7c3aed, #ec4899)' : '#d1d5db',
                                color: '#fff', fontWeight: 800, fontSize: 17, border: 'none',
                                cursor: canStart ? 'pointer' : 'not-allowed',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                boxShadow: canStart ? '0 8px 32px rgba(124, 58, 237, 0.3)' : 'none',
                                transition: 'all 0.3s',
                            }}>
                            <FiPlay size={20} /> Start Practice Mode
                        </button>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    )
}
