'use client'

import { useState, useEffect, useRef } from 'react'
import { GoogleGenAI, Modality } from '@google/genai'
import {
    FiMic, FiMicOff, FiPhoneOff, FiPlay, FiClock,
    FiCheck, FiCode, FiTerminal, FiSend, FiLoader,
    FiRefreshCw, FiArrowLeft, FiAward, FiTrendingUp,
    FiAlertTriangle, FiFileText, FiZap, FiX
} from 'react-icons/fi'
import { arrayBufferToBase64, base64ToUint8Array, decodeAudioData, float32ToPCM16 } from './audio'
import AudioVisualizer from './AudioVisualizer'
import InterviewSetup from './InterviewSetup'

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''
const LIVE_MODEL = 'gemini-2.5-flash-native-audio-preview-09-2025'
const ANALYSIS_MODEL = 'gemini-2.5-flash-preview-05-20'
const JUDGE_MODEL = 'gemini-2.5-flash'

const INTERVIEWERS = {
    emma: { name: 'Dr. Emma', voice: 'Kore', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=600&fit=crop&crop=top' },
    john: { name: 'Dr. John', voice: 'Fenrir', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&h=600&fit=crop&crop=top' },
}

// --- QUESTION BANK ---
const QUESTION_BANK = [
    {
        id: 'm1', title: "Longest Substring Without Repeating Characters", difficulty: 'Medium',
        description: "Given a string s, find the length of the longest substring without repeating characters.",
        examples: "Input: s = 'abcabcbb'\nOutput: 3\nExplanation: The answer is 'abc', with the length of 3.",
        constraints: ["0 <= s.length <= 5 * 10^4", "s consists of English letters, digits, symbols and spaces."],
        starterCode: {
            python: "class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        # Your code here\n        pass",
            javascript: "var lengthOfLongestSubstring = function(s) {\n    // Your code here\n};",
            java: "class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        // Your code here\n    }\n}",
        }
    },
    {
        id: 'm2', title: "Container With Most Water", difficulty: 'Medium',
        description: "You are given an integer array height of length n. Find two lines that together with the x-axis form a container, such that the container contains the most water.",
        examples: "Input: height = [1,8,6,2,5,4,8,3,7]\nOutput: 49",
        constraints: ["n == height.length", "2 <= n <= 10^5", "0 <= height[i] <= 10^4"],
        starterCode: {
            python: "class Solution:\n    def maxArea(self, height: List[int]) -> int:\n        pass",
            javascript: "var maxArea = function(height) {\n};",
            java: "class Solution {\n    public int maxArea(int[] height) {\n    }\n}",
        }
    },
    {
        id: 'm3', title: "Group Anagrams", difficulty: 'Medium',
        description: "Given an array of strings strs, group the anagrams together.",
        examples: 'Input: strs = ["eat","tea","tan","ate","nat","bat"]\nOutput: [["bat"],["nat","tan"],["ate","eat","tea"]]',
        constraints: ["1 <= strs.length <= 10^4", "0 <= strs[i].length <= 100"],
        starterCode: {
            python: "class Solution:\n    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:\n        pass",
            javascript: "var groupAnagrams = function(strs) {\n};",
            java: "class Solution {\n    public List<List<String>> groupAnagrams(String[] strs) {\n    }\n}",
        }
    },
    {
        id: 'h1', title: "Median of Two Sorted Arrays", difficulty: 'Hard',
        description: "Given two sorted arrays nums1 and nums2 of size m and n, return the median. O(log(m+n)).",
        examples: "Input: nums1 = [1,3], nums2 = [2]\nOutput: 2.00000",
        constraints: ["0 <= m <= 1000", "0 <= n <= 1000", "1 <= m + n <= 2000"],
        starterCode: {
            python: "class Solution:\n    def findMedianSortedArrays(self, nums1, nums2) -> float:\n        pass",
            javascript: "var findMedianSortedArrays = function(nums1, nums2) {\n};",
            java: "class Solution {\n    public double findMedianSortedArrays(int[] nums1, int[] nums2) {\n    }\n}",
        }
    },
    {
        id: 'h2', title: "Trapping Rain Water", difficulty: 'Hard',
        description: "Given n non-negative integers representing an elevation map, compute how much water it can trap after raining.",
        examples: "Input: height = [0,1,0,2,1,0,1,3,2,1,2,1]\nOutput: 6",
        constraints: ["n == height.length", "1 <= n <= 2 * 10^4", "0 <= height[i] <= 10^5"],
        starterCode: {
            python: "class Solution:\n    def trap(self, height: List[int]) -> int:\n        pass",
            javascript: "var trap = function(height) {\n};",
            java: "class Solution {\n    public int trap(int[] height) {\n    }\n}",
        }
    },
]

export default function LiveInterviewComponents() {
    // Config from setup screen
    const [config, setConfig] = useState(null)
    const [interviewStatus, setInterviewStatus] = useState('idle') // idle | active | finished
    const [isMicOn, setIsMicOn] = useState(true)
    const [sessionDuration, setSessionDuration] = useState(0)
    const [speakingCount, setSpeakingCount] = useState(0)

    // Questions / code editor
    const [questions, setQuestions] = useState([])
    const [activeQuestionIndex, setActiveQuestionIndex] = useState(0)
    const [language, setLanguage] = useState('python')
    const [code, setCode] = useState('')
    const [consoleOutput, setConsoleOutput] = useState('')
    const [isRunning, setIsRunning] = useState(false)
    const [submissionResult, setSubmissionResult] = useState(null)

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

    // Select questions for coding round
    useEffect(() => {
        if (!config || config.round !== 'Coding') return
        if (questions.length > 0) return
        const medium = QUESTION_BANK.filter((q) => q.difficulty === 'Medium')
        const hard = QUESTION_BANK.filter((q) => q.difficulty === 'Hard')
        const selM = medium[Math.floor(Math.random() * medium.length)]
        const selH = hard[Math.floor(Math.random() * hard.length)]
        setQuestions([selM, selH])
        setCode(selM.starterCode.python)
    }, [config])

    // Timer
    useEffect(() => {
        let interval
        if (interviewStatus === 'active') {
            interval = setInterval(() => {
                setSessionDuration((prev) => {
                    if (config?.duration && prev >= config.duration * 60) {
                        stopSession()
                        return prev
                    }
                    return prev + 1
                })
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [interviewStatus, config?.duration])

    // Cleanup on unmount
    useEffect(() => { return () => stopSession() }, [])

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    // --- GEMINI LIVE CONNECTION ---
    const connectToLive = async () => {
        if (!API_KEY) {
            alert('Gemini API Key is missing. Please add NEXT_PUBLIC_GEMINI_API_KEY to your .env.local')
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

            const ai = new GoogleGenAI({ apiKey: API_KEY })

            let systemInstruction = `You are ${selectedInterviewer.name}, a technical interviewer. Role: ${config.role}. Round: ${config.round}.`
            if (config.company) systemInstruction += ` Company: ${config.company}.`
            if (config.jobDescription) systemInstruction += `\nJob Description:\n${config.jobDescription}`

            if (questions.length > 0 && config.round === 'Coding') {
                systemInstruction += `\nConduct a ${config.duration || 15} minute coding interview. Start with question: "${questions[0].title}".`
            }

            const sessionPromise = ai.live.connect({
                model: LIVE_MODEL,
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedInterviewer.voice } } },
                    systemInstruction: systemInstruction,
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                },
                callbacks: {
                    onopen: async () => {
                        setInterviewStatus('active')
                        setFullTranscript([])
                        await startMicrophoneStream(inputCtx, sessionPromise)
                    },
                    onmessage: async (msg) => await handleServerMessage(msg, outputCtx, outputNode),
                    onclose: () => stopSession(),
                    onerror: (err) => { console.error('Gemini Live error:', err); stopSession() },
                },
            })
            sessionRef.current = sessionPromise
        } catch (e) {
            console.error('Connection failed', e)
            alert('Failed to connect to Gemini Live. Check your API key and try again.')
            stopSession()
        }
    }

    const startMicrophoneStream = async (ctx, sessionPromise) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            audioStreamRef.current = stream
            const source = ctx.createMediaStreamSource(stream)
            sourceNodeRef.current = source
            if (inputAnalyserRef.current) source.connect(inputAnalyserRef.current)

            const processor = ctx.createScriptProcessor(2048, 1, 1)
            processor.onaudioprocess = (e) => {
                if (!inputAudioContextRef.current || inputAudioContextRef.current.state === 'closed') return
                const inputData = e.inputBuffer.getChannelData(0)
                const pcm16 = float32ToPCM16(inputData)
                const base64Data = arrayBufferToBase64(pcm16.buffer)
                sessionPromise.then((session) =>
                    session.sendRealtimeInput({ media: { mimeType: 'audio/pcm;rate=16000', data: base64Data } })
                )
            }
            source.connect(processor)
            processor.connect(ctx.destination)
        } catch (err) {
            console.error('Microphone error', err)
            alert('Microphone access denied. Please allow microphone access and try again.')
        }
    }

    const handleServerMessage = async (msg, ctx, outputNode) => {
        const inputTx = msg.serverContent?.inputTranscription?.text
        const outputTx = msg.serverContent?.outputTranscription?.text
        if (inputTx || outputTx) {
            setFullTranscript((prev) => {
                const logs = [...prev]
                if (inputTx) logs.push({ role: 'You', text: inputTx })
                if (outputTx) logs.push({ role: selectedInterviewer.name, text: outputTx })
                return logs
            })
        }

        const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data
        if (audioData && ctx.state !== 'closed') {
            const uint8Array = base64ToUint8Array(audioData)
            const audioBuffer = await decodeAudioData(uint8Array, ctx, 24000, 1)
            const currentTime = ctx.currentTime
            let startTime = nextStartTimeRef.current < currentTime ? currentTime : nextStartTimeRef.current

            const source = ctx.createBufferSource()
            source.buffer = audioBuffer
            source.connect(outputNode)
            source.start(startTime)
            nextStartTimeRef.current = startTime + audioBuffer.duration
            sourcesRef.current.add(source)

            const delayMs = (startTime - currentTime) * 1000
            const timeout = setTimeout(() => setSpeakingCount((p) => p + 1), Math.max(0, delayMs))
            videoTimeoutsRef.current.push(timeout)
            source.onended = () => {
                setSpeakingCount((p) => Math.max(0, p - 1))
                sourcesRef.current.delete(source)
            }
        }

        if (msg.serverContent?.interrupted) {
            sourcesRef.current.forEach((s) => s.stop())
            sourcesRef.current.clear()
            nextStartTimeRef.current = 0
            videoTimeoutsRef.current.forEach(clearTimeout)
            videoTimeoutsRef.current = []
            setSpeakingCount(0)
        }
    }

    const stopSession = () => {
        if (!sessionRef.current && interviewStatus === 'idle') return
        if (interviewStatus === 'active') {
            setInterviewStatus('finished')
            generateFeedback()
        } else {
            setInterviewStatus('idle')
        }
        if (audioStreamRef.current) audioStreamRef.current.getTracks().forEach((t) => t.stop())
        if (inputAudioContextRef.current?.state !== 'closed') inputAudioContextRef.current?.close()
        if (outputAudioContextRef.current?.state !== 'closed') outputAudioContextRef.current?.close()
        videoTimeoutsRef.current.forEach(clearTimeout)
        setSpeakingCount(0)
        if (sessionRef.current) {
            sessionRef.current.then((s) => { try { if (s.close) s.close() } catch (e) { } })
            sessionRef.current = null
        }
    }

    // --- AI JUDGE ---
    const executeJudge = async (isSubmission) => {
        if (!code.trim() || questions.length === 0) return
        setIsRunning(true)
        setConsoleOutput(isSubmission ? 'Judging Solution...' : 'Running Code...')
        setSubmissionResult(null)
        try {
            const q = questions[activeQuestionIndex]
            const ai = new GoogleGenAI({ apiKey: API_KEY })
            const prompt = `You are a strict Competitive Programming Judge.\nProblem: ${q.title}\nConstraints: ${q.constraints.join(', ')}\nLanguage: ${language}\nCode:\n${code}\n\nReturn JSON:\n{"status":"Accepted"|"Wrong Answer"|"TLE"|"Error","testCasesPassed":number,"totalTestCases":number,"input":"str","expectedOutput":"str","actualOutput":"str","errorMessage":"str","executionTime":"str","memoryUsed":"str","complexityAnalysis":"str"}`
            const response = await ai.models.generateContent({ model: JUDGE_MODEL, contents: prompt })
            const text = response.text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
            const result = JSON.parse(text)
            setSubmissionResult(result)
            if (result.status === 'Accepted') {
                setConsoleOutput(`> Status: ${isSubmission ? 'Accepted ✅' : 'Finished'}\n> Runtime: ${result.executionTime}\n> Memory: ${result.memoryUsed}\n\n${result.complexityAnalysis}`)
            } else {
                setConsoleOutput(`> Status: ${result.status}\n> Input: ${result.input}\n> Output: ${result.actualOutput}\n> Expected: ${result.expectedOutput}\n\n${result.errorMessage || ''}`)
            }
        } catch (error) {
            console.error('Judge Error', error)
            setConsoleOutput('Error: Could not connect to the Judge Service.')
        } finally {
            setIsRunning(false)
        }
    }

    // --- POST-INTERVIEW FEEDBACK ---
    const generateFeedback = async () => {
        setIsAnalyzing(true)
        try {
            const ai = new GoogleGenAI({ apiKey: API_KEY })
            const transcriptText = fullTranscript.length > 0
                ? fullTranscript.map((t) => `${t.role}: ${t.text}`).join('\n')
                : 'No transcript available.'
            const prompt = `Analyze this interview transcript for a ${config?.role || 'Software Engineer'} role.\nRound: ${config?.round || 'Technical'}\nTranscript:\n${transcriptText}\n\nReturn JSON:\n{"score":number,"feedback":"string","strengths":["s1"],"improvements":["s1"],"technicalAccuracy":"string","communicationStyle":"string"}`
            const response = await ai.models.generateContent({ model: ANALYSIS_MODEL, contents: prompt })
            const text = response.text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
            setReportData(JSON.parse(text))
        } catch (e) {
            console.error('Analysis failed', e)
            setReportData({ score: 0, feedback: 'Analysis failed.', strengths: [], improvements: [], technicalAccuracy: 'N/A', communicationStyle: 'N/A' })
        } finally {
            setIsAnalyzing(false)
        }
    }

    const handleQuestionSwitch = (index) => {
        setActiveQuestionIndex(index)
        setSubmissionResult(null)
        setConsoleOutput('')
        if (questions[index]) setCode(questions[index].starterCode[language])
    }

    const handleLanguageChange = (e) => {
        const newLang = e.target.value
        setLanguage(newLang)
        if (questions[activeQuestionIndex]) setCode(questions[activeQuestionIndex].starterCode[newLang])
        setConsoleOutput('')
        setSubmissionResult(null)
    }

    // --- RENDER: Setup Screen ---
    if (!config) {
        return <InterviewSetup onStart={(cfg) => setConfig(cfg)} />
    }

    const isCodingRound = config.round === 'Coding'
    const isTimeLow = config.duration && sessionDuration > config.duration * 60 - 60

    // --- STYLES ---
    const styles = {
        container: {
            display: 'flex', flexDirection: 'column', gap: 20,
            minHeight: '80vh',
        },
        topBar: {
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 20px', background: '#fff', borderRadius: 14,
            border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        },
        mainGrid: {
            display: 'grid',
            gridTemplateColumns: isCodingRound ? '340px 1fr 360px' : '380px 1fr',
            gap: 20, flex: 1, minHeight: 0,
        },
        card: {
            background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb',
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)', overflow: 'hidden',
        },
        avatarBox: {
            aspectRatio: '4/3', background: '#1f2937', borderRadius: 12,
            overflow: 'hidden', position: 'relative',
        },
        btn: {
            padding: '12px 24px', borderRadius: 12, fontWeight: 700,
            fontSize: 15, border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'all 0.2s',
        },
    }

    // --- RENDER: Report Card ---
    if (interviewStatus === 'finished') {
        return (
            <div style={{ maxWidth: 700, margin: '0 auto' }}>
                <div style={{ ...styles.card, padding: 0 }}>
                    <div style={{
                        padding: '16px 24px', borderBottom: '1px solid #e5e7eb',
                        display: 'flex', alignItems: 'center', gap: 10,
                        background: 'linear-gradient(135deg, #f5f3ff, #fff)',
                    }}>
                        <FiAward size={22} color="#7c3aed" />
                        <h3 style={{ fontWeight: 800, fontSize: 18, margin: 0 }}>Interview Report Card</h3>
                    </div>

                    {isAnalyzing ? (
                        <div style={{ padding: 60, textAlign: 'center' }}>
                            <FiLoader size={36} color="#7c3aed" style={{ animation: 'spin 1s linear infinite' }} />
                            <h4 style={{ fontWeight: 700, fontSize: 20, marginTop: 16 }}>Analyzing Performance...</h4>
                            <p style={{ color: '#6b7280' }}>Generating scores and feedback based on the session.</p>
                        </div>
                    ) : reportData ? (
                        <div style={{ padding: 32 }}>
                            {/* Score Circle */}
                            <div style={{ textAlign: 'center', marginBottom: 32 }}>
                                <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <svg width="160" height="160" style={{ transform: 'rotate(-90deg)' }}>
                                        <circle cx="80" cy="80" r="70" stroke="#e5e7eb" strokeWidth="10" fill="transparent" />
                                        <circle cx="80" cy="80" r="70" stroke="#7c3aed" strokeWidth="10" fill="transparent"
                                            strokeDasharray={440} strokeDashoffset={440 - (440 * reportData.score) / 100}
                                            style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
                                    </svg>
                                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <span style={{ fontSize: 42, fontWeight: 800 }}>{reportData.score}</span>
                                        <span style={{ fontSize: 13, color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Score</span>
                                    </div>
                                </div>
                            </div>

                            {/* Summary */}
                            <div style={{ background: '#f9fafb', padding: 20, borderRadius: 14, marginBottom: 24, border: '1px solid #f0f0f0' }}>
                                <h4 style={{ fontWeight: 700, fontSize: 15, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <FiFileText color="#3b82f6" /> Summary
                                </h4>
                                <p style={{ color: '#4b5563', lineHeight: 1.7, fontStyle: 'italic' }}>&quot;{reportData.feedback}&quot;</p>
                            </div>

                            {/* Strengths */}
                            <div style={{ background: '#f0fdf4', padding: 20, borderRadius: 14, marginBottom: 16, border: '1px solid #dcfce7' }}>
                                <h4 style={{ fontWeight: 700, fontSize: 13, textTransform: 'uppercase', color: '#15803d', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <FiTrendingUp size={16} /> Strengths
                                </h4>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {reportData.strengths.map((s, i) => (
                                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8, color: '#166534', fontSize: 14 }}>
                                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', marginTop: 6, flexShrink: 0 }} />
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Improvements */}
                            <div style={{ background: '#fff7ed', padding: 20, borderRadius: 14, marginBottom: 24, border: '1px solid #fed7aa' }}>
                                <h4 style={{ fontWeight: 700, fontSize: 13, textTransform: 'uppercase', color: '#c2410c', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <FiAlertTriangle size={16} /> Areas for Improvement
                                </h4>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {reportData.improvements.map((s, i) => (
                                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8, color: '#9a3412', fontSize: 14 }}>
                                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f97316', marginTop: 6, flexShrink: 0 }} />
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: 12, borderTop: '1px solid #e5e7eb', paddingTop: 20 }}>
                                <button
                                    onClick={() => { setConfig(null); setInterviewStatus('idle'); setSessionDuration(0); setFullTranscript([]); setReportData(null); setQuestions([]) }}
                                    style={{ ...styles.btn, flex: 1, background: '#f3f4f6', color: '#374151' }}
                                >
                                    <FiRefreshCw size={18} /> New Interview
                                </button>
                                <button
                                    onClick={() => setConfig(null)}
                                    style={{ ...styles.btn, flex: 1, background: '#7c3aed', color: '#fff' }}
                                >
                                    Back to Setup
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>No report available.</div>
                    )}
                </div>
            </div>
        )
    }

    // --- RENDER: Live Interview ---
    return (
        <div style={styles.container}>
            {/* Top Bar */}
            <div style={styles.topBar}>
                <button
                    onClick={() => { if (interviewStatus === 'active') { if (confirm('End interview and go back?')) stopSession(); else return; } setConfig(null); setInterviewStatus('idle'); setSessionDuration(0) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, color: '#6b7280', fontWeight: 600, fontSize: 14 }}
                >
                    <FiArrowLeft size={18} /> Back to Setup
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FiClock size={16} color="#6b7280" />
                        <span style={{
                            fontFamily: 'monospace', fontWeight: 700, fontSize: 18,
                            color: isTimeLow ? '#ef4444' : '#1f2937',
                            animation: isTimeLow ? 'pulse 1s infinite' : 'none',
                        }}>
                            {formatTime(sessionDuration)}
                        </span>
                    </div>
                    {interviewStatus === 'active' ? (
                        <span style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            background: '#dcfce7', color: '#16a34a', padding: '4px 14px',
                            borderRadius: 20, fontWeight: 700, fontSize: 13,
                        }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', animation: 'pulse 1.5s infinite' }} />
                            LIVE
                        </span>
                    ) : (
                        <span style={{ background: '#f3f4f6', color: '#6b7280', padding: '4px 14px', borderRadius: 20, fontWeight: 700, fontSize: 13 }}>
                            OFFLINE
                        </span>
                    )}
                </div>
            </div>

            {/* Main Grid */}
            <div style={{
                ...styles.mainGrid,
                ...(typeof window !== 'undefined' && window.innerWidth < 1024 ? { gridTemplateColumns: '1fr', } : {}),
            }}>
                {/* Left: Avatars & Controls */}
                <div style={{ ...styles.card, padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Interviewer */}
                    <div style={styles.avatarBox}>
                        <img src={selectedInterviewer.image} alt={selectedInterviewer.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
                        <div style={{
                            position: 'absolute', bottom: 10, left: 12,
                            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
                            padding: '4px 12px', borderRadius: 8,
                            display: 'flex', alignItems: 'center', gap: 8,
                            color: '#fff', fontSize: 13, fontWeight: 700,
                        }}>
                            <span style={{
                                width: 8, height: 8, borderRadius: '50%',
                                background: speakingCount > 0 ? '#22c55e' : '#a855f7',
                                animation: speakingCount > 0 ? 'pulse 1s infinite' : 'none',
                            }} />
                            {selectedInterviewer.name}
                        </div>
                    </div>

                    {/* Candidate */}
                    <div style={{ ...styles.avatarBox, background: '#f9fafb' }}>
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <AudioVisualizer isActive={interviewStatus === 'active' && isMicOn} analyser={inputAnalyser} color="#06b6d4" />
                        </div>
                        <div style={{
                            position: 'absolute', bottom: 10, left: 12,
                            background: 'rgba(255,255,255,0.8)', padding: '4px 12px', borderRadius: 8,
                            display: 'flex', alignItems: 'center', gap: 8,
                            color: '#1f2937', fontSize: 13, fontWeight: 700,
                        }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#06b6d4' }} />
                            You
                        </div>
                    </div>

                    {/* Controls */}
                    {interviewStatus === 'idle' ? (
                        <button onClick={connectToLive} style={{
                            ...styles.btn, width: '100%',
                            background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                            color: '#fff', fontSize: 17,
                            boxShadow: '0 8px 24px rgba(124, 58, 237, 0.25)',
                        }}>
                            <FiPlay size={20} /> Start Interview
                        </button>
                    ) : (
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button onClick={() => setIsMicOn(!isMicOn)} style={{
                                ...styles.btn, flex: 1,
                                background: isMicOn ? '#f3f4f6' : '#fef2f2',
                                color: isMicOn ? '#374151' : '#ef4444',
                                border: isMicOn ? '1px solid #e5e7eb' : '1px solid #fecaca',
                            }}>
                                {isMicOn ? <FiMic size={20} /> : <FiMicOff size={20} />}
                            </button>
                            <button onClick={stopSession} style={{
                                ...styles.btn, flex: 1,
                                background: '#fef2f2', color: '#ef4444',
                                border: '1px solid #fecaca',
                            }}>
                                <FiPhoneOff size={20} /> End
                            </button>
                        </div>
                    )}
                </div>

                {/* Middle: Code Editor (only for Coding round) */}
                {isCodingRound && (
                    <div style={{ ...styles.card, display: 'flex', flexDirection: 'column', minHeight: 500 }}>
                        {/* Editor Header */}
                        <div style={{
                            height: 52, background: '#252526', borderBottom: '1px solid #111',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                <FiCode size={18} color="#60a5fa" />
                                <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: '#d4d4d4' }}>code_editor</span>
                                <div style={{ width: 1, height: 20, background: '#555' }} />
                                <select value={language} onChange={handleLanguageChange}
                                    style={{
                                        background: '#333', color: '#d4d4d4', border: '1px solid #444',
                                        padding: '6px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                                        cursor: 'pointer', outline: 'none',
                                    }}>
                                    <option value="python">Python</option>
                                    <option value="javascript">JavaScript</option>
                                    <option value="java">Java</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <button onClick={() => executeJudge(false)} disabled={isRunning}
                                    style={{
                                        padding: '6px 16px', borderRadius: 8, border: '1px solid #444',
                                        background: '#333', color: '#d4d4d4', fontWeight: 700, fontSize: 13,
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                                    }}>
                                    <FiPlay size={14} /> Run
                                </button>
                                <button onClick={() => { if (interviewStatus !== 'active') { alert('Start the interview first!'); return; } executeJudge(true) }}
                                    disabled={isRunning}
                                    style={{
                                        padding: '6px 16px', borderRadius: 8, border: 'none',
                                        background: '#16a34a', color: '#fff', fontWeight: 700, fontSize: 13,
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                                    }}>
                                    <FiSend size={14} /> Submit
                                </button>
                            </div>
                        </div>

                        {/* Code Area */}
                        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
                            {/* Line Numbers */}
                            <div style={{
                                width: 48, background: '#1e1e1e', borderRight: '1px solid #333',
                                padding: '20px 8px 20px 0', textAlign: 'right', overflowY: 'hidden',
                                fontFamily: 'monospace', fontSize: 14, lineHeight: '1.75', color: '#858585',
                                userSelect: 'none',
                            }}>
                                {code.split('\n').map((_, i) => <div key={i}>{i + 1}</div>)}
                            </div>
                            <textarea
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                spellCheck={false}
                                style={{
                                    flex: 1, background: '#1e1e1e', color: '#d4d4d4',
                                    fontFamily: 'monospace', fontSize: 14, lineHeight: '1.75',
                                    padding: 20, border: 'none', resize: 'none', outline: 'none',
                                    whiteSpace: 'pre',
                                }}
                            />
                        </div>

                        {/* Console Output */}
                        <div style={{ height: 180, borderTop: '1px solid #111', display: 'flex', flexDirection: 'column' }}>
                            <div style={{
                                padding: '8px 20px', background: '#252526', borderBottom: '1px solid #111',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#9ca3af', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>
                                    <FiTerminal size={14} /> Console
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    {submissionResult && (
                                        <span style={{
                                            fontSize: 11, padding: '2px 10px', borderRadius: 20, fontWeight: 700,
                                            background: submissionResult.status === 'Accepted' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                                            color: submissionResult.status === 'Accepted' ? '#22c55e' : '#ef4444',
                                        }}>
                                            {submissionResult.status}
                                        </span>
                                    )}
                                    <button onClick={() => setConsoleOutput('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                                        <FiX size={14} />
                                    </button>
                                </div>
                            </div>
                            <div style={{
                                flex: 1, background: '#1e1e1e', padding: 16, overflowY: 'auto',
                                fontFamily: 'monospace', fontSize: 13, color: '#d4d4d4', whiteSpace: 'pre-wrap',
                            }}>
                                {consoleOutput || <span style={{ color: '#555', fontStyle: 'italic' }}>Ready to execute...</span>}
                            </div>
                        </div>
                    </div>
                )}

                {/* Right: Problem / Context */}
                <div style={{ ...styles.card, display: 'flex', flexDirection: 'column' }}>
                    {isCodingRound ? (
                        <>
                            <div style={{
                                padding: '14px 20px', borderBottom: '1px solid #e5e7eb',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                background: '#fafafa',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <FiCode size={18} color="#7c3aed" />
                                    <h3 style={{ fontWeight: 700, fontSize: 15, margin: 0 }}>Problem</h3>
                                </div>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    {questions.map((_, i) => (
                                        <button key={i} onClick={() => handleQuestionSwitch(i)} style={{
                                            padding: '4px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                                            border: 'none', cursor: 'pointer',
                                            background: activeQuestionIndex === i ? '#7c3aed' : '#f3f4f6',
                                            color: activeQuestionIndex === i ? '#fff' : '#6b7280',
                                        }}>
                                            Q{i + 1}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {questions.length > 0 && (
                                <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
                                    <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>
                                        {activeQuestionIndex + 1}. {questions[activeQuestionIndex].title}
                                    </h2>
                                    <span style={{
                                        fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 10,
                                        background: questions[activeQuestionIndex].difficulty === 'Hard' ? '#fef2f2' : '#fffbeb',
                                        color: questions[activeQuestionIndex].difficulty === 'Hard' ? '#ef4444' : '#f59e0b',
                                    }}>
                                        {questions[activeQuestionIndex].difficulty}
                                    </span>
                                    <p style={{ marginTop: 16, color: '#4b5563', lineHeight: 1.7 }}>
                                        {questions[activeQuestionIndex].description}
                                    </p>
                                    <div style={{
                                        background: '#f9fafb', padding: 16, borderRadius: 10, marginTop: 16,
                                        fontFamily: 'monospace', fontSize: 13, whiteSpace: 'pre-wrap',
                                        border: '1px solid #f0f0f0',
                                    }}>
                                        {questions[activeQuestionIndex].examples}
                                    </div>
                                    <h4 style={{ fontWeight: 700, marginTop: 20, marginBottom: 10, fontSize: 15 }}>Constraints:</h4>
                                    <ul style={{ paddingLeft: 20, fontFamily: 'monospace', fontSize: 13, color: '#4b5563' }}>
                                        {questions[activeQuestionIndex].constraints.map((c, i) => (
                                            <li key={i} style={{ marginBottom: 4 }}>{c}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <div style={{
                                padding: '14px 20px', borderBottom: '1px solid #e5e7eb',
                                display: 'flex', alignItems: 'center', gap: 8,
                                background: '#fafafa',
                            }}>
                                <FiZap size={18} color="#7c3aed" />
                                <h3 style={{ fontWeight: 700, fontSize: 15, margin: 0 }}>Interview Context</h3>
                            </div>
                            <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
                                <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>{config.role}</h2>
                                {config.company && (
                                    <div style={{ color: '#7c3aed', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', marginBottom: 16 }}>
                                        {config.company}
                                    </div>
                                )}
                                <div style={{ background: '#f9fafb', padding: 20, borderRadius: 14, border: '1px solid #f0f0f0' }}>
                                    <h4 style={{ fontWeight: 700, fontSize: 13, textTransform: 'uppercase', color: '#6b7280', marginBottom: 10 }}>
                                        Round: {config.round}
                                    </h4>
                                    <p style={{ color: '#4b5563', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                                        {config.jobDescription || 'Standard interview context. The AI interviewer will adapt based on your responses.'}
                                    </p>
                                </div>
                                <div style={{
                                    marginTop: 20, padding: 16, borderRadius: 14,
                                    background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)',
                                    border: '1px solid #ddd6fe',
                                }}>
                                    <h4 style={{ fontWeight: 700, fontSize: 13, color: '#7c3aed', marginBottom: 8 }}>💡 Tips</h4>
                                    <ul style={{ paddingLeft: 16, fontSize: 13, color: '#4b5563', margin: 0 }}>
                                        <li style={{ marginBottom: 4 }}>Speak clearly and at a moderate pace</li>
                                        <li style={{ marginBottom: 4 }}>Structure your answers using STAR method</li>
                                        <li style={{ marginBottom: 4 }}>Ask clarifying questions when needed</li>
                                        <li>Take a moment to think before answering</li>
                                    </ul>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* CSS Animation */}
            <style jsx global>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    )
}
