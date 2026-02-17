'use client'

import { useState } from 'react'
import {
    FiPlay, FiUser, FiClock, FiCode, FiMessageCircle,
    FiSettings, FiMic, FiZap
} from 'react-icons/fi'

const INTERVIEWERS = [
    { id: 'emma', name: 'Dr. Emma', voice: 'Kore', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=300&fit=crop&crop=top' },
    { id: 'john', name: 'Dr. John', voice: 'Fenrir', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=300&fit=crop&crop=top' },
]

const ROUNDS = [
    { id: 'Behavioral', label: 'Behavioral', icon: <FiMessageCircle />, desc: 'Communication, teamwork, leadership questions' },
    { id: 'Coding', label: 'Coding', icon: <FiCode />, desc: 'DSA problems with live code editor & AI judge' },
    { id: 'Technical', label: 'Technical', icon: <FiSettings />, desc: 'System design, architecture, deep tech questions' },
]

const DURATIONS = [10, 15, 20, 30, 45]

export default function InterviewSetup({ onStart }) {
    const [role, setRole] = useState('Software Engineer')
    const [round, setRound] = useState('Behavioral')
    const [duration, setDuration] = useState(15)
    const [interviewer, setInterviewer] = useState('emma')
    const [company, setCompany] = useState('')
    const [jobDescription, setJobDescription] = useState('')

    const handleStart = () => {
        onStart({
            role,
            round,
            duration,
            interviewer,
            company,
            jobDescription,
        })
    }

    return (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
            {/* Header */}
            <div style={{
                textAlign: 'center', marginBottom: 32,
                padding: '32px 24px',
                background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
                borderRadius: 16, color: '#fff'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
                    <FiMic size={28} />
                    <h2 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>AI Live Interview</h2>
                </div>
                <p style={{ opacity: 0.85, margin: 0, fontSize: 15 }}>
                    Practice with a real-time AI interviewer powered by Gemini 2.5
                </p>
            </div>

            {/* Role */}
            <div style={{ marginBottom: 24 }}>
                <label style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, display: 'block', color: '#374151' }}>
                    Target Role
                </label>
                <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Frontend Developer, Data Scientist..."
                    style={{
                        width: '100%', padding: '12px 16px', borderRadius: 12,
                        border: '2px solid #e5e7eb', fontSize: 15, outline: 'none',
                        transition: 'border-color 0.2s',
                        boxSizing: 'border-box',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
            </div>

            {/* Company & JD (optional) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div>
                    <label style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, display: 'block', color: '#374151' }}>
                        Company (optional)
                    </label>
                    <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="e.g. Google, Amazon..."
                        style={{
                            width: '100%', padding: '12px 16px', borderRadius: 12,
                            border: '2px solid #e5e7eb', fontSize: 15, outline: 'none',
                            boxSizing: 'border-box',
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
                        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                </div>
                <div>
                    <label style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, display: 'block', color: '#374151' }}>
                        Duration
                    </label>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {DURATIONS.map((d) => (
                            <button
                                key={d}
                                onClick={() => setDuration(d)}
                                style={{
                                    padding: '10px 16px', borderRadius: 10,
                                    border: duration === d ? '2px solid #7c3aed' : '2px solid #e5e7eb',
                                    background: duration === d ? '#7c3aed' : '#fff',
                                    color: duration === d ? '#fff' : '#374151',
                                    fontWeight: 700, fontSize: 14, cursor: 'pointer',
                                    transition: 'all 0.2s',
                                }}
                            >
                                {d}m
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Job Description */}
            <div style={{ marginBottom: 28 }}>
                <label style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, display: 'block', color: '#374151' }}>
                    Job Description / Context (optional)
                </label>
                <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description here for a tailored interview experience..."
                    rows={3}
                    style={{
                        width: '100%', padding: '12px 16px', borderRadius: 12,
                        border: '2px solid #e5e7eb', fontSize: 14, outline: 'none',
                        resize: 'vertical', fontFamily: 'inherit',
                        boxSizing: 'border-box',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
            </div>

            {/* Round Type */}
            <div style={{ marginBottom: 28 }}>
                <label style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, display: 'block', color: '#374151' }}>
                    Interview Round
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    {ROUNDS.map((r) => (
                        <button
                            key={r.id}
                            onClick={() => setRound(r.id)}
                            style={{
                                padding: '16px 12px', borderRadius: 14,
                                border: round === r.id ? '2px solid #7c3aed' : '2px solid #e5e7eb',
                                background: round === r.id ? 'linear-gradient(135deg, #f5f3ff, #ede9fe)' : '#fff',
                                cursor: 'pointer', textAlign: 'center',
                                transition: 'all 0.2s',
                            }}
                        >
                            <div style={{
                                fontSize: 22, marginBottom: 6,
                                color: round === r.id ? '#7c3aed' : '#9ca3af',
                                display: 'flex', justifyContent: 'center',
                            }}>
                                {r.icon}
                            </div>
                            <div style={{ fontWeight: 700, fontSize: 14, color: '#1f2937' }}>{r.label}</div>
                            <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>{r.desc}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Interviewer */}
            <div style={{ marginBottom: 32 }}>
                <label style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, display: 'block', color: '#374151' }}>
                    Choose Interviewer
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {INTERVIEWERS.map((iv) => (
                        <button
                            key={iv.id}
                            onClick={() => setInterviewer(iv.id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 14,
                                padding: 14, borderRadius: 14,
                                border: interviewer === iv.id ? '2px solid #7c3aed' : '2px solid #e5e7eb',
                                background: interviewer === iv.id ? 'linear-gradient(135deg, #f5f3ff, #ede9fe)' : '#fff',
                                cursor: 'pointer', transition: 'all 0.2s',
                            }}
                        >
                            <img
                                src={iv.image}
                                alt={iv.name}
                                style={{
                                    width: 52, height: 52, borderRadius: 12, objectFit: 'cover',
                                    border: interviewer === iv.id ? '2px solid #7c3aed' : '2px solid #e5e7eb',
                                }}
                            />
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontWeight: 700, fontSize: 15, color: '#1f2937' }}>{iv.name}</div>
                                <div style={{ fontSize: 12, color: '#6b7280' }}>AI Interviewer</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Start Button */}
            <button
                onClick={handleStart}
                disabled={!role.trim()}
                style={{
                    width: '100%', padding: '16px 24px', borderRadius: 14,
                    background: !role.trim() ? '#d1d5db' : 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
                    color: '#fff', fontWeight: 800, fontSize: 17,
                    border: 'none', cursor: !role.trim() ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    transition: 'all 0.3s',
                    boxShadow: !role.trim() ? 'none' : '0 8px 32px rgba(124, 58, 237, 0.3)',
                }}
            >
                <FiZap size={20} />
                Start Live Interview
            </button>
        </div>
    )
}
