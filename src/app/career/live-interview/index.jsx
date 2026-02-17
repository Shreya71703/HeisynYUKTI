'use client'

import { useState, useEffect, useRef } from 'react'
import { GoogleGenAI, Modality } from '@google/genai'
import {
    FiMic, FiMicOff, FiPhoneOff, FiPlay, FiClock,
    FiCheck, FiCode, FiTerminal, FiSend, FiLoader,
    FiRefreshCw, FiArrowLeft, FiAward, FiTrendingUp,
    FiAlertTriangle, FiFileText, FiZap, FiX, FiDownload,
    FiEdit2, FiLayout
} from 'react-icons/fi'
import { arrayBufferToBase64, base64ToUint8Array, decodeAudioData, float32ToPCM16 } from './audio'
import AudioVisualizer from './AudioVisualizer'
import InterviewSetup from './InterviewSetup'
import InterviewWhiteboard from './InterviewWhiteboard'
import { LANGUAGE_VERSIONS } from '@/app/code-editor/EditorData'

const LIVE_MODEL = 'gemini-2.5-flash-native-audio-preview-09-2025'
const ANALYSIS_MODEL = 'gemini-2.5-flash-preview-05-20'
const JUDGE_MODEL = 'gemini-2.5-flash'

const INTERVIEWERS = {
    emma: { name: 'Dr. Emma', voice: 'Kore', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=600&fit=crop&crop=top' },
    john: { name: 'Dr. John', voice: 'Fenrir', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&h=600&fit=crop&crop=top' },
}

const PISTON_API = 'https://emkc.org/api/v2/piston'

export default function LiveInterviewComponents() {
    const [apiKey, setApiKey] = useState('')
    const [config, setConfig] = useState(null)
    const [interviewStatus, setInterviewStatus] = useState('idle')
    const [isMicOn, setIsMicOn] = useState(true)
    const [sessionDuration, setSessionDuration] = useState(0)
    const [speakingCount, setSpeakingCount] = useState(0)
    const [activeTab, setActiveTab] = useState('code') // code | whiteboard

    // Questions / code editor
    const [questions, setQuestions] = useState([])
    const [activeQuestionIndex, setActiveQuestionIndex] = useState(0)
    const [language, setLanguage] = useState('python')
    const [code, setCode] = useState('')
    const [consoleOutput, setConsoleOutput] = useState('')
    const [isRunning, setIsRunning] = useState(false)
    const [submissionResult, setSubmissionResult] = useState(null)
    const [interviewQuestions, setInterviewQuestions] = useState([])

    // Transcript & report
    const [fullTranscript, setFullTranscript] = useState([])
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [reportData, setReportData] = useState(null)

    // Audio refs
    const inputAudioContextRef = useRef(null)
    const outputAudioContextRef = useRef(null)
    const audioStreamRef = useRef(null)
    const sourceNodeRef = useRef(null)
    const inputAnalyserRef = useRef(null)
    const outputAnalyserRef = useRef(null)
    const [inputAnalyser, setInputAnalyser] = useState(undefined)
    const [outputAnalyser, setOutputAnalyser] = useState(undefined)
    const sessionRef = useRef(null)
    const nextStartTimeRef = useRef(0)
    const sourcesRef = useRef(new Set())
    const videoTimeoutsRef = useRef([])

    const selectedInterviewer = config ? INTERVIEWERS[config.interviewer] || INTERVIEWERS.emma : INTERVIEWERS.emma

    // Fetch API key from server
    useEffect(() => {
        fetch('/api/gemini-key').then(r => r.json()).then(d => {
            if (d.key) setApiKey(d.key)
        }).catch(() => { })
    }, [])

    // Fetch dynamic questions when config is set
    useEffect(() => {
        if (!config) return
        const fetchQuestions = async () => {
            try {
                const res = await fetch(`/api/interview-questions?topic=${encodeURIComponent(config.role)}&difficulty=${config.difficulty || 'Medium'}`)
                const data = await res.json()
                if (data.questions) setInterviewQuestions(data.questions)
            } catch (e) { console.error('Failed to fetch questions:', e) }
        }
        fetchQuestions()
    }, [config])

    // Select coding questions
    useEffect(() => {
        if (!config || config.round !== 'Coding') return
        if (questions.length > 0) return
        const bank = [
            { id: 'm1', title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', description: 'Given a string s, find the length of the longest substring without repeating characters.', examples: "Input: s = 'abcabcbb'\nOutput: 3", constraints: ['0 <= s.length <= 5*10^4'], starterCode: { python: 'class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        pass', javascript: 'var lengthOfLongestSubstring = function(s) {\n};', java: 'class Solution {\n    public int lengthOfLongestSubstring(String s) {\n    }\n}' } },
            { id: 'm2', title: 'Container With Most Water', difficulty: 'Medium', description: 'Find two lines that form a container with the most water.', examples: 'Input: height = [1,8,6,2,5,4,8,3,7]\nOutput: 49', constraints: ['2 <= n <= 10^5'], starterCode: { python: 'class Solution:\n    def maxArea(self, height) -> int:\n        pass', javascript: 'var maxArea = function(height) {\n};', java: 'class Solution {\n    public int maxArea(int[] height) {\n    }\n}' } },
            { id: 'h1', title: 'Trapping Rain Water', difficulty: 'Hard', description: 'Compute how much water an elevation map can trap.', examples: 'Input: height = [0,1,0,2,1,0,1,3,2,1,2,1]\nOutput: 6', constraints: ['1 <= n <= 2*10^4'], starterCode: { python: 'class Solution:\n    def trap(self, height) -> int:\n        pass', javascript: 'var trap = function(height) {\n};', java: 'class Solution {\n    public int trap(int[] height) {\n    }\n}' } },
        ]
        const medium = bank.filter(q => q.difficulty === 'Medium')
        const hard = bank.filter(q => q.difficulty === 'Hard')
        const selected = [medium[Math.floor(Math.random() * medium.length)], hard[Math.floor(Math.random() * hard.length)]]
        setQuestions(selected)
        setCode(selected[0].starterCode.python)
    }, [config])

    // Timer
    useEffect(() => {
        let interval
        if (interviewStatus === 'active') {
            interval = setInterval(() => {
                setSessionDuration(prev => {
                    if (config?.duration && prev >= config.duration * 60) { stopSession(); return prev }
                    return prev + 1
                })
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [interviewStatus, config?.duration])

    useEffect(() => { return () => stopSession() }, [])

    const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

    // Build system prompt
    const buildSystemPrompt = () => {
        let prompt = `You are ${selectedInterviewer.name}, a professional AI interviewer.\n`
        prompt += `Job Type: ${config.jobType || 'Job'}\nRole: ${config.role}\nRound: ${config.round}\nDifficulty: ${config.difficulty || 'Medium'}\n`
        if (config.company) prompt += `Company: ${config.company}\n`
        prompt += `Duration: ${config.duration || 15} minutes.\n\n`

        prompt += `INSTRUCTIONS:\n`
        prompt += `- Conduct a structured ${config.round} interview for the ${config.role} role.\n`
        prompt += `- Difficulty level is ${config.difficulty}: adjust question complexity accordingly.\n`
        prompt += `- Be professional, encouraging, and give brief feedback after each answer.\n`
        prompt += `- Pace yourself for a ${config.duration}-minute session.\n`
        prompt += `- Start by introducing yourself and the interview format.\n\n`

        if (config.resumeText) {
            prompt += `CANDIDATE RESUME:\n${config.resumeText.substring(0, 2000)}\nUse this to personalize questions.\n\n`
        }

        if (interviewQuestions.length > 0) {
            prompt += `QUESTION BANK (use these as reference, adapt based on conversation):\n`
            interviewQuestions.slice(0, 10).forEach((q, i) => {
                prompt += `${i + 1}. ${q.question} [${q.difficulty}]\n`
            })
            prompt += '\n'
        }

        if (config.round === 'Coding' && questions.length > 0) {
            prompt += `CODING PROBLEM: "${questions[0].title}" — guide the candidate through this problem.\n`
        }

        return prompt
    }

    // --- GEMINI LIVE CONNECTION ---
    const connectToLive = async () => {
        if (!apiKey) {
            alert('Gemini API Key is missing. Please check your .env.local file has GEMINI_API_KEY set.')
            return
        }
        try {
            const inputCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 })
            const outputCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 })
            inputAudioContextRef.current = inputCtx
            outputAudioContextRef.current = outputCtx
            inputAnalyserRef.current = inputCtx.createAnalyser()
            outputAnalyserRef.current = outputCtx.createAnalyser()
            setInputAnalyser(inputAnalyserRef.current)
            setOutputAnalyser(outputAnalyserRef.current)
            const outputNode = outputCtx.createGain()
            outputNode.connect(outputCtx.destination)
            outputNode.connect(outputAnalyserRef.current)

            const ai = new GoogleGenAI({ apiKey })
            const systemInstruction = buildSystemPrompt()

            const sessionPromise = ai.live.connect({
                model: LIVE_MODEL,
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedInterviewer.voice } } },
                    systemInstruction,
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                },
                callbacks: {
                    onopen: async () => {
                        setInterviewStatus('active')
                        setFullTranscript([])
                        await startMicStream(inputCtx, sessionPromise)
                    },
                    onmessage: async (msg) => await handleServerMessage(msg, outputCtx, outputNode),
                    onclose: () => stopSession(),
                    onerror: (err) => { console.error('Gemini Live error:', err); stopSession() },
                },
            })
            sessionRef.current = sessionPromise
        } catch (e) {
            console.error('Connection failed', e)
            alert('Failed to connect. Check your API key.')
            stopSession()
        }
    }

    const startMicStream = async (ctx, sessionPromise) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            audioStreamRef.current = stream
            const source = ctx.createMediaStreamSource(stream)
            sourceNodeRef.current = source
            if (inputAnalyserRef.current) source.connect(inputAnalyserRef.current)
            const processor = ctx.createScriptProcessor(2048, 1, 1)
            processor.onaudioprocess = (e) => {
                if (!inputAudioContextRef.current || inputAudioContextRef.current.state === 'closed') return
                const pcm16 = float32ToPCM16(e.inputBuffer.getChannelData(0))
                const b64 = arrayBufferToBase64(pcm16.buffer)
                sessionPromise.then(s => s.sendRealtimeInput({ media: { mimeType: 'audio/pcm;rate=16000', data: b64 } }))
            }
            source.connect(processor)
            processor.connect(ctx.destination)
        } catch (err) {
            console.error('Mic error', err)
            alert('Microphone access denied.')
        }
    }

    const handleServerMessage = async (msg, ctx, outputNode) => {
        const inputTx = msg.serverContent?.inputTranscription?.text
        const outputTx = msg.serverContent?.outputTranscription?.text
        if (inputTx || outputTx) {
            setFullTranscript(prev => {
                const logs = [...prev]
                if (inputTx) logs.push({ role: 'You', text: inputTx })
                if (outputTx) logs.push({ role: selectedInterviewer.name, text: outputTx })
                return logs
            })
        }
        const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data
        if (audioData && ctx.state !== 'closed') {
            const buf = await decodeAudioData(base64ToUint8Array(audioData), ctx, 24000, 1)
            const now = ctx.currentTime
            let start = nextStartTimeRef.current < now ? now : nextStartTimeRef.current
            const src = ctx.createBufferSource()
            src.buffer = buf
            src.connect(outputNode)
            src.start(start)
            nextStartTimeRef.current = start + buf.duration
            sourcesRef.current.add(src)
            const t = setTimeout(() => setSpeakingCount(p => p + 1), Math.max(0, (start - now) * 1000))
            videoTimeoutsRef.current.push(t)
            src.onended = () => { setSpeakingCount(p => Math.max(0, p - 1)); sourcesRef.current.delete(src) }
        }
        if (msg.serverContent?.interrupted) {
            sourcesRef.current.forEach(s => s.stop()); sourcesRef.current.clear()
            nextStartTimeRef.current = 0; videoTimeoutsRef.current.forEach(clearTimeout); videoTimeoutsRef.current = []
            setSpeakingCount(0)
        }
    }

    const stopSession = () => {
        if (!sessionRef.current && interviewStatus === 'idle') return
        if (interviewStatus === 'active') { setInterviewStatus('finished'); generateFeedback() }
        else setInterviewStatus('idle')
        if (audioStreamRef.current) audioStreamRef.current.getTracks().forEach(t => t.stop())
        if (inputAudioContextRef.current?.state !== 'closed') inputAudioContextRef.current?.close()
        if (outputAudioContextRef.current?.state !== 'closed') outputAudioContextRef.current?.close()
        videoTimeoutsRef.current.forEach(clearTimeout); setSpeakingCount(0)
        if (sessionRef.current) {
            sessionRef.current.then(s => { try { s?.close?.() } catch { } })
            sessionRef.current = null
        }
    }

    // --- PISTON CODE EXECUTION ---
    const runWithPiston = async () => {
        if (!code.trim()) return
        setIsRunning(true); setConsoleOutput('Running...'); setSubmissionResult(null)
        try {
            const langMap = { python: 'python', javascript: 'javascript', java: 'java', cpp: 'cpp', csharp: 'csharp', php: 'php' }
            const res = await fetch(`${PISTON_API}/execute`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    language: langMap[language] || language,
                    version: LANGUAGE_VERSIONS[language] || '*',
                    files: [{ content: code }],
                }),
            })
            const data = await res.json()
            const output = data.run?.output || data.run?.stderr || 'No output'
            setConsoleOutput(output)
        } catch (err) {
            setConsoleOutput('Error: Could not connect to execution service.')
        } finally { setIsRunning(false) }
    }

    // --- AI JUDGE (Submit) ---
    const executeJudge = async () => {
        if (!code.trim() || questions.length === 0 || !apiKey) return
        setIsRunning(true); setConsoleOutput('Judging Solution...'); setSubmissionResult(null)
        try {
            const q = questions[activeQuestionIndex]
            const ai = new GoogleGenAI({ apiKey })
            const prompt = `You are a strict CP Judge.\nProblem: ${q.title}\nConstraints: ${q.constraints.join(', ')}\nLanguage: ${language}\nCode:\n${code}\n\nReturn JSON:\n{"status":"Accepted"|"Wrong Answer"|"TLE"|"Error","testCasesPassed":0,"totalTestCases":0,"input":"","expectedOutput":"","actualOutput":"","errorMessage":"","executionTime":"","memoryUsed":"","complexityAnalysis":""}`
            const response = await ai.models.generateContent({ model: JUDGE_MODEL, contents: prompt })
            const text = response.text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
            const result = JSON.parse(text)
            setSubmissionResult(result)
            setConsoleOutput(result.status === 'Accepted'
                ? `> Status: Accepted\n> Runtime: ${result.executionTime}\n> Memory: ${result.memoryUsed}\n\n${result.complexityAnalysis}`
                : `> Status: ${result.status}\n> Input: ${result.input}\n> Output: ${result.actualOutput}\n> Expected: ${result.expectedOutput}\n\n${result.errorMessage || ''}`)
        } catch (e) {
            console.error('Judge Error', e)
            setConsoleOutput('Error: Could not connect to Judge.')
        } finally { setIsRunning(false) }
    }

    // --- FEEDBACK ---
    const generateFeedback = async () => {
        setIsAnalyzing(true)
        try {
            const ai = new GoogleGenAI({ apiKey })
            const txText = fullTranscript.length > 0 ? fullTranscript.map(t => `${t.role}: ${t.text}`).join('\n') : 'No transcript.'
            const prompt = `Analyze this interview for a ${config?.role} (${config?.round}, ${config?.difficulty}).\nTranscript:\n${txText}\n\nReturn JSON:\n{"score":0,"feedback":"","strengths":[""],"improvements":[""],"technicalAccuracy":"","communicationStyle":""}`
            const response = await ai.models.generateContent({ model: ANALYSIS_MODEL, contents: prompt })
            const text = response.text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
            setReportData(JSON.parse(text))
        } catch (e) {
            setReportData({ score: 0, feedback: 'Analysis failed.', strengths: [], improvements: [], technicalAccuracy: 'N/A', communicationStyle: 'N/A' })
        } finally { setIsAnalyzing(false) }
    }

    const downloadReport = () => {
        if (!reportData) return
        const text = `Interview Report\n${'='.repeat(40)}\nScore: ${reportData.score}/100\n\nFeedback:\n${reportData.feedback}\n\nStrengths:\n${reportData.strengths.map(s => `- ${s}`).join('\n')}\n\nAreas for Improvement:\n${reportData.improvements.map(s => `- ${s}`).join('\n')}\n\nTechnical Accuracy: ${reportData.technicalAccuracy}\nCommunication: ${reportData.communicationStyle}`
        const blob = new Blob([text], { type: 'text/plain' })
        const link = document.createElement('a')
        link.download = 'interview-report.txt'
        link.href = URL.createObjectURL(blob)
        link.click()
    }

    const handleQuestionSwitch = (i) => { setActiveQuestionIndex(i); setSubmissionResult(null); setConsoleOutput(''); if (questions[i]) setCode(questions[i].starterCode[language]) }
    const handleLanguageChange = (e) => { const l = e.target.value; setLanguage(l); if (questions[activeQuestionIndex]) setCode(questions[activeQuestionIndex].starterCode[l]); setConsoleOutput(''); setSubmissionResult(null) }

    if (!config) return <InterviewSetup onStart={cfg => setConfig(cfg)} />

    const isCodingRound = config.round === 'Coding'
    const isSystemDesign = config.round === 'System Design'
    const showEditor = isCodingRound || isSystemDesign
    const isTimeLow = config.duration && sessionDuration > config.duration * 60 - 60

    const S = {
        card: { background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', overflow: 'hidden' },
        btn: { padding: '12px 24px', borderRadius: 12, fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' },
    }

    // --- REPORT CARD ---
    if (interviewStatus === 'finished') {
        return (
            <div style={{ maxWidth: 700, margin: '0 auto' }}>
                <div style={{ ...S.card, padding: 0 }}>
                    <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, #f5f3ff, #fff)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <FiAward size={22} color="#7c3aed" />
                            <h3 style={{ fontWeight: 800, fontSize: 18, margin: 0 }}>Interview Report Card</h3>
                        </div>
                        {reportData && <button onClick={downloadReport} style={{ ...S.btn, padding: '8px 16px', fontSize: 13, background: '#f3f4f6', color: '#374151' }}><FiDownload size={16} /> Download</button>}
                    </div>
                    {isAnalyzing ? (
                        <div style={{ padding: 60, textAlign: 'center' }}>
                            <FiLoader size={36} color="#7c3aed" style={{ animation: 'spin 1s linear infinite' }} />
                            <h4 style={{ fontWeight: 700, fontSize: 20, marginTop: 16 }}>Analyzing Performance...</h4>
                        </div>
                    ) : reportData ? (
                        <div style={{ padding: 32 }}>
                            <div style={{ textAlign: 'center', marginBottom: 32 }}>
                                <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <svg width="160" height="160" style={{ transform: 'rotate(-90deg)' }}>
                                        <circle cx="80" cy="80" r="70" stroke="#e5e7eb" strokeWidth="10" fill="transparent" />
                                        <circle cx="80" cy="80" r="70" stroke="#7c3aed" strokeWidth="10" fill="transparent" strokeDasharray={440} strokeDashoffset={440 - (440 * reportData.score) / 100} style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
                                    </svg>
                                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <span style={{ fontSize: 42, fontWeight: 800 }}>{reportData.score}</span>
                                        <span style={{ fontSize: 13, color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Score</span>
                                    </div>
                                </div>
                            </div>
                            <div style={{ background: '#f9fafb', padding: 20, borderRadius: 14, marginBottom: 24, border: '1px solid #f0f0f0' }}>
                                <h4 style={{ fontWeight: 700, fontSize: 15, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}><FiFileText color="#3b82f6" /> Summary</h4>
                                <p style={{ color: '#4b5563', lineHeight: 1.7, fontStyle: 'italic' }}>&quot;{reportData.feedback}&quot;</p>
                            </div>
                            <div style={{ background: '#f0fdf4', padding: 20, borderRadius: 14, marginBottom: 16, border: '1px solid #dcfce7' }}>
                                <h4 style={{ fontWeight: 700, fontSize: 13, textTransform: 'uppercase', color: '#15803d', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}><FiTrendingUp size={16} /> Strengths</h4>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>{reportData.strengths.map((s, i) => <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8, color: '#166534', fontSize: 14 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', marginTop: 6, flexShrink: 0 }} />{s}</li>)}</ul>
                            </div>
                            <div style={{ background: '#fff7ed', padding: 20, borderRadius: 14, marginBottom: 24, border: '1px solid #fed7aa' }}>
                                <h4 style={{ fontWeight: 700, fontSize: 13, textTransform: 'uppercase', color: '#c2410c', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}><FiAlertTriangle size={16} /> Areas for Improvement</h4>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>{reportData.improvements.map((s, i) => <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8, color: '#9a3412', fontSize: 14 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f97316', marginTop: 6, flexShrink: 0 }} />{s}</li>)}</ul>
                            </div>
                            <div style={{ display: 'flex', gap: 12, borderTop: '1px solid #e5e7eb', paddingTop: 20 }}>
                                <button onClick={() => { setConfig(null); setInterviewStatus('idle'); setSessionDuration(0); setFullTranscript([]); setReportData(null); setQuestions([]); setInterviewQuestions([]) }} style={{ ...S.btn, flex: 1, background: '#f3f4f6', color: '#374151' }}><FiRefreshCw size={18} /> New Interview</button>
                                <button onClick={downloadReport} style={{ ...S.btn, flex: 1, background: '#7c3aed', color: '#fff' }}><FiDownload size={18} /> Download Report</button>
                            </div>
                        </div>
                    ) : <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>No report available.</div>}
                </div>
            </div>
        )
    }

    // --- LIVE INTERVIEW ---
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minHeight: '80vh' }}>
            {/* Top Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <button onClick={() => { if (interviewStatus === 'active') { if (!confirm('End interview?')) return; stopSession() } setConfig(null); setInterviewStatus('idle'); setSessionDuration(0) }} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, color: '#6b7280', fontWeight: 600, fontSize: 14 }}>
                    <FiArrowLeft size={18} /> Back to Setup
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FiClock size={16} color="#6b7280" />
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 18, color: isTimeLow ? '#ef4444' : '#1f2937', animation: isTimeLow ? 'pulse 1s infinite' : 'none' }}>{formatTime(sessionDuration)}</span>
                    </div>
                    {interviewStatus === 'active' ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#dcfce7', color: '#16a34a', padding: '4px 14px', borderRadius: 20, fontWeight: 700, fontSize: 13 }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', animation: 'pulse 1.5s infinite' }} /> LIVE
                        </span>
                    ) : <span style={{ background: '#f3f4f6', color: '#6b7280', padding: '4px 14px', borderRadius: 20, fontWeight: 700, fontSize: 13 }}>OFFLINE</span>}
                </div>
            </div>

            {/* Main Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: showEditor ? '320px 1fr 340px' : '380px 1fr', gap: 16, flex: 1, minHeight: 0 }}>
                {/* Left: Avatars & Controls */}
                <div style={{ ...S.card, padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ aspectRatio: '4/3', background: '#1f2937', borderRadius: 12, overflow: 'hidden', position: 'relative' }}>
                        <img src={selectedInterviewer.image} alt={selectedInterviewer.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
                        <div style={{ position: 'absolute', bottom: 10, left: 12, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', padding: '4px 12px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, color: '#fff', fontSize: 13, fontWeight: 700 }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: speakingCount > 0 ? '#22c55e' : '#a855f7', animation: speakingCount > 0 ? 'pulse 1s infinite' : 'none' }} />{selectedInterviewer.name}
                        </div>
                    </div>
                    <div style={{ aspectRatio: '4/3', background: '#f9fafb', borderRadius: 12, overflow: 'hidden', position: 'relative' }}>
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <AudioVisualizer isActive={interviewStatus === 'active' && isMicOn} analyser={inputAnalyser} color="#06b6d4" />
                        </div>
                        <div style={{ position: 'absolute', bottom: 10, left: 12, background: 'rgba(255,255,255,0.8)', padding: '4px 12px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, color: '#1f2937', fontSize: 13, fontWeight: 700 }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#06b6d4' }} />You
                        </div>
                    </div>
                    {interviewStatus === 'idle' ? (
                        <button onClick={connectToLive} style={{ ...S.btn, width: '100%', background: 'linear-gradient(135deg, #7c3aed, #ec4899)', color: '#fff', fontSize: 17, boxShadow: '0 8px 24px rgba(124,58,237,0.25)' }}><FiPlay size={20} /> Start Interview</button>
                    ) : (
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={() => setIsMicOn(!isMicOn)} style={{ ...S.btn, flex: 1, background: isMicOn ? '#f3f4f6' : '#fef2f2', color: isMicOn ? '#374151' : '#ef4444', border: isMicOn ? '1px solid #e5e7eb' : '1px solid #fecaca' }}>{isMicOn ? <FiMic size={20} /> : <FiMicOff size={20} />}</button>
                            <button onClick={stopSession} style={{ ...S.btn, flex: 1, background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca' }}><FiPhoneOff size={20} /> End</button>
                        </div>
                    )}
                </div>

                {/* Middle: Code Editor / Whiteboard (for Coding & System Design) */}
                {showEditor && (
                    <div style={{ ...S.card, display: 'flex', flexDirection: 'column', minHeight: 500 }}>
                        {/* Tab Switcher */}
                        {(isCodingRound || isSystemDesign) && (
                            <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', background: '#fafafa' }}>
                                <button onClick={() => setActiveTab('code')} style={{ flex: 1, padding: '12px', border: 'none', borderBottom: activeTab === 'code' ? '2px solid #7c3aed' : '2px solid transparent', background: 'transparent', fontWeight: 700, fontSize: 13, cursor: 'pointer', color: activeTab === 'code' ? '#7c3aed' : '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><FiCode size={16} /> Code Editor</button>
                                <button onClick={() => setActiveTab('whiteboard')} style={{ flex: 1, padding: '12px', border: 'none', borderBottom: activeTab === 'whiteboard' ? '2px solid #7c3aed' : '2px solid transparent', background: 'transparent', fontWeight: 700, fontSize: 13, cursor: 'pointer', color: activeTab === 'whiteboard' ? '#7c3aed' : '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><FiEdit2 size={16} /> Whiteboard</button>
                            </div>
                        )}

                        {activeTab === 'whiteboard' ? (
                            <div style={{ flex: 1, minHeight: 400 }}><InterviewWhiteboard /></div>
                        ) : (
                            <>
                                {/* Editor Header */}
                                <div style={{ height: 48, background: '#252526', borderBottom: '1px solid #111', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <FiCode size={16} color="#60a5fa" />
                                        <select value={language} onChange={handleLanguageChange} style={{ background: '#333', color: '#d4d4d4', border: '1px solid #444', padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', outline: 'none' }}>
                                            <option value="python">Python</option>
                                            <option value="javascript">JavaScript</option>
                                            <option value="java">Java</option>
                                            <option value="csharp">C#</option>
                                            <option value="php">PHP</option>
                                        </select>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <button onClick={runWithPiston} disabled={isRunning} style={{ padding: '5px 14px', borderRadius: 6, border: '1px solid #444', background: '#333', color: '#d4d4d4', fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}><FiPlay size={13} /> Run</button>
                                        {isCodingRound && <button onClick={executeJudge} disabled={isRunning} style={{ padding: '5px 14px', borderRadius: 6, border: 'none', background: '#16a34a', color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}><FiSend size={13} /> Submit</button>}
                                    </div>
                                </div>
                                {/* Code Area */}
                                <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
                                    <div style={{ width: 44, background: '#1e1e1e', borderRight: '1px solid #333', padding: '16px 6px 16px 0', textAlign: 'right', overflowY: 'hidden', fontFamily: 'monospace', fontSize: 13, lineHeight: '1.75', color: '#858585', userSelect: 'none' }}>
                                        {code.split('\n').map((_, i) => <div key={i}>{i + 1}</div>)}
                                    </div>
                                    <textarea value={code} onChange={e => setCode(e.target.value)} spellCheck={false} style={{ flex: 1, background: '#1e1e1e', color: '#d4d4d4', fontFamily: 'monospace', fontSize: 13, lineHeight: '1.75', padding: 16, border: 'none', resize: 'none', outline: 'none', whiteSpace: 'pre' }} />
                                </div>
                                {/* Console */}
                                <div style={{ height: 160, borderTop: '1px solid #111', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ padding: '6px 16px', background: '#252526', borderBottom: '1px solid #111', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#9ca3af', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}><FiTerminal size={13} /> Console</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            {submissionResult && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 700, background: submissionResult.status === 'Accepted' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: submissionResult.status === 'Accepted' ? '#22c55e' : '#ef4444' }}>{submissionResult.status}</span>}
                                            <button onClick={() => setConsoleOutput('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}><FiX size={13} /></button>
                                        </div>
                                    </div>
                                    <div style={{ flex: 1, background: '#1e1e1e', padding: 12, overflowY: 'auto', fontFamily: 'monospace', fontSize: 12, color: '#d4d4d4', whiteSpace: 'pre-wrap' }}>
                                        {consoleOutput || <span style={{ color: '#555', fontStyle: 'italic' }}>Ready to execute...</span>}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Right: Problem / Context */}
                <div style={{ ...S.card, display: 'flex', flexDirection: 'column' }}>
                    {isCodingRound ? (
                        <>
                            <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fafafa' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FiCode size={16} color="#7c3aed" /><h3 style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>Problem</h3></div>
                                <div style={{ display: 'flex', gap: 4 }}>{questions.map((_, i) => <button key={i} onClick={() => handleQuestionSwitch(i)} style={{ padding: '3px 12px', borderRadius: 6, fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer', background: activeQuestionIndex === i ? '#7c3aed' : '#f3f4f6', color: activeQuestionIndex === i ? '#fff' : '#6b7280' }}>Q{i + 1}</button>)}</div>
                            </div>
                            {questions.length > 0 && (
                                <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
                                    <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>{activeQuestionIndex + 1}. {questions[activeQuestionIndex].title}</h2>
                                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 10, background: questions[activeQuestionIndex].difficulty === 'Hard' ? '#fef2f2' : '#fffbeb', color: questions[activeQuestionIndex].difficulty === 'Hard' ? '#ef4444' : '#f59e0b' }}>{questions[activeQuestionIndex].difficulty}</span>
                                    <p style={{ marginTop: 14, color: '#4b5563', lineHeight: 1.7, fontSize: 14 }}>{questions[activeQuestionIndex].description}</p>
                                    <div style={{ background: '#f9fafb', padding: 14, borderRadius: 10, marginTop: 14, fontFamily: 'monospace', fontSize: 12, whiteSpace: 'pre-wrap', border: '1px solid #f0f0f0' }}>{questions[activeQuestionIndex].examples}</div>
                                    <h4 style={{ fontWeight: 700, marginTop: 16, marginBottom: 8, fontSize: 14 }}>Constraints:</h4>
                                    <ul style={{ paddingLeft: 18, fontFamily: 'monospace', fontSize: 12, color: '#4b5563' }}>{questions[activeQuestionIndex].constraints.map((c, i) => <li key={i} style={{ marginBottom: 3 }}>{c}</li>)}</ul>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 8, background: '#fafafa' }}><FiZap size={16} color="#7c3aed" /><h3 style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>Interview Context</h3></div>
                            <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
                                <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{config.role}</h2>
                                {config.company && <div style={{ color: '#7c3aed', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', marginBottom: 14 }}>{config.company}</div>}
                                <div style={{ background: '#f9fafb', padding: 16, borderRadius: 14, border: '1px solid #f0f0f0', marginBottom: 16 }}>
                                    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 13 }}>
                                        <div><span style={{ color: '#6b7280' }}>Round:</span> <strong>{config.round}</strong></div>
                                        <div><span style={{ color: '#6b7280' }}>Difficulty:</span> <strong>{config.difficulty}</strong></div>
                                        <div><span style={{ color: '#6b7280' }}>Type:</span> <strong>{config.jobType}</strong></div>
                                    </div>
                                </div>
                                {interviewQuestions.length > 0 && (
                                    <div style={{ marginBottom: 16 }}>
                                        <h4 style={{ fontWeight: 700, fontSize: 13, color: '#6b7280', textTransform: 'uppercase', marginBottom: 8 }}>Possible Topics</h4>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                            {interviewQuestions.slice(0, 6).map((q, i) => <span key={i} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 8, background: '#f3f4f6', color: '#4b5563' }}>{q.question?.substring(0, 50)}...</span>)}
                                        </div>
                                    </div>
                                )}
                                <div style={{ padding: 14, borderRadius: 14, background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)', border: '1px solid #ddd6fe' }}>
                                    <h4 style={{ fontWeight: 700, fontSize: 12, color: '#7c3aed', marginBottom: 6 }}>Tips</h4>
                                    <ul style={{ paddingLeft: 14, fontSize: 12, color: '#4b5563', margin: 0 }}>
                                        <li style={{ marginBottom: 3 }}>Speak clearly at a moderate pace</li>
                                        <li style={{ marginBottom: 3 }}>Structure answers using STAR method</li>
                                        <li style={{ marginBottom: 3 }}>Ask clarifying questions when needed</li>
                                        <li>Take a moment to think before answering</li>
                                    </ul>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <style jsx global>{`
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    )
}
