import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import Groq from 'groq-sdk';
import { marked } from 'marked';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View
} from 'react-native';
import RenderHTML from 'react-native-render-html';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { auth, db } from '../../firebase';

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY || "";
const groq = new Groq({ apiKey: GROQ_API_KEY });

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
    feedbackGiven?: boolean;
}

const QUICK_DIAGNOSIS = [
    { id: '1', title: 'Engine Smoking', icon: 'smoke-free' },
    { id: '2', title: 'Flat Tyre', icon: 'tire-repair' },
    { id: '3', title: 'Clicking Sound', icon: 'volume-up' },
    { id: '4', title: 'Overheating', icon: 'device-thermostat' },
];

export default function AIChatScreen() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "Hey, I'm your workshop foreman on CARSOS. 🚗\n\nTell me what's going on with your car (weird sound, smoke, won't start, whatever). I'll walk you through what to do safely first, then what might be wrong.",
            sender: 'ai',
            timestamp: new Date(),
        },
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const flatListRef = useRef<FlatList>(null);
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const TAB_BAR_HEIGHT = 60 + insets.bottom;

    const SYSTEM_INSTRUCTION =
        "You are a senior workshop foreman helping drivers on the CARSOS emergency app. " +
        "Talk like a real person beside the car — warm, calm, direct. Never sound like a robot, manual, or corporate helpdesk. " +
        "Use short sentences, 'you' and 'we', and plain everyday words. Light Malaysian English is fine when natural " +
        "(e.g. 'Okay, pull over first', 'Can check this') and stay clear. " +
        "Never say 'As an AI', 'I understand your concern', or open with stiff greetings. " +
        "How to reply every time: (1) Safety first — what to do right now on the road (hazards, pull over, don't open hood if steaming, etc.) in clear steps. " +
        "(2) What might be going on — explain like experience, not a lecture. Say when you're not sure. " +
        "(3) Simple next steps — what they can check safely, when to stop driving, when to use CARSOS SOS or get a tow, when to book a bengkel. " +
        "Keep answers concise: about 3-5 short blocks max. No walls of text. " +
        "Use Markdown lightly — **bold** for urgent warnings, bullet lists for steps. " +
        "If it's dangerous (brake failure, fire, smoke in cabin, stuck in traffic lane) be firm and clear: stop driving, get safe, call for help. " +
        "Your job is to calm them down and get them safe, like a foreman who actually cares.";

    const sendMessageToAI = async (text: string) => {
        if (!GROQ_API_KEY) {
            return "AI is not configured. Add EXPO_PUBLIC_GROQ_API_KEY to your .env file and restart the app.";
        }
        try {
            const history = messages
                .filter(m => m.id !== '1')
                .map(m => ({
                    role: (m.sender === 'ai' ? 'assistant' : 'user') as 'assistant' | 'user',
                    content: m.text,
                }));

            const completion = await groq.chat.completions.create({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: SYSTEM_INSTRUCTION },
                    ...history,
                    { role: 'user', content: text },
                ],
            });

            return completion.choices[0]?.message?.content?.trim()
                || "Sorry — I couldn't get that out. If it's urgent, hit SOS or get off the road first.";
        } catch (error) {
            console.error("AI Error:", error);
            return "Sorry, line's a bit jammed on my end. If it's an emergency, use SOS — don't wait on me.";
        }
    };

    const handleSend = async (textToSend?: string) => {
        const messageContent = textToSend || inputText;
        if (!messageContent.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: messageContent,
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputText('');
        setIsLoading(true);

        const aiResponseText = await sendMessageToAI(messageContent);

        const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: aiResponseText,
            sender: 'ai',
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, aiMessage]);
        setIsLoading(false);

        const uid = auth.currentUser?.uid;
        if (uid) {
            try {
                await addDoc(collection(db, 'ai_queries'), {
                    userId: uid,
                    userQuery: messageContent,
                    aiResponse: aiResponseText,
                    timestamp: serverTimestamp(),
                });
            } catch (e) {
                console.log("Database logging failed", e);
            }
        }
    };

    const submitFeedback = async (messageId: string, isPositive: boolean) => {
        const uid = auth.currentUser?.uid;
        if (!uid) {
            Alert.alert("Login Required", "Please sign in to submit feedback.");
            return;
        }
        try {
            await addDoc(collection(db, 'ai_feedback'), {
                userId: uid,
                messageId,
                isPositive,
                timestamp: serverTimestamp(),
            });

            setMessages(prev =>
                prev.map(m => m.id === messageId ? { ...m, feedbackGiven: true } : m)
            );
            Alert.alert("Feedback Received", "Thank you! This helps improve our AI advice.");
        } catch (error) {
            console.error("Feedback Error:", error);
        }
    };

    const renderMessage = ({ item }: { item: Message }) => (
        <View style={[
            styles.messageBubble,
            item.sender === 'user' ? styles.userBubble : styles.aiBubble
        ]}>
            {item.sender === 'user' ? (
                <Text style={styles.userText}>{item.text}</Text>
            ) : (
                <RenderHTML
                    contentWidth={width}
                    source={{ html: marked.parse(item.text) as string }}
                    baseStyle={{
                        color: '#2C3E50',
                        fontSize: 15,
                        lineHeight: 22,
                    }}
                />
            )}

            {item.sender === 'ai' && !item.feedbackGiven && item.id !== '1' && (
                <View style={styles.feedbackContainer}>
                    <Text style={styles.feedbackPrompt}>Was this advice helpful?</Text>
                    <View style={styles.feedbackButtons}>
                        <TouchableOpacity onPress={() => submitFeedback(item.id, true)}>
                            <Ionicons name="thumbs-up" size={18} color="#4CAF50" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => submitFeedback(item.id, false)} style={{ marginLeft: 20 }}>
                            <Ionicons name="thumbs-down" size={18} color="#F44336" />
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );

    useEffect(() => {
        const timer = setTimeout(() => {
            if (messages.length > 0) {
                flatListRef.current?.scrollToEnd({ animated: true });
            }
        }, 100);
        return () => clearTimeout(timer);
    }, [messages.length]);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
            style={styles.container}
            keyboardVerticalOffset={Platform.OS === 'ios' ?  0 :  insets.bottom}
            pointerEvents="box-none"
        >
            {/* Header Container */}
            <View style={[styles.header,{paddingTop: Platform.OS === 'ios' ? 80 : 20}]}>
                <View style={styles.botIcon}>
                    <MaterialIcons name="auto-awesome" size={20} color="white" />
                </View>
                <Text style={styles.headerTitle}>AI Mechanical Assistant</Text>
            </View>

            {/* Main Message Board */}
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                contentContainerStyle={[styles.messageList]}
                ListHeaderComponent={() => (
                    <View style={styles.quickDiagnosisGrid}>
                        <Text style={styles.sectionTitle}>Quick Diagnosis</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillContainer}>
                            {QUICK_DIAGNOSIS.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={styles.pill}
                                    onPress={() => handleSend(item.title)}
                                >
                                    <MaterialIcons name={item.icon as any} size={16} color="#2f95dc" style={{ marginRight: 6 }} />
                                    <Text style={styles.pillText}>{item.title}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}
            />

            {/* Processing Indicator */}
            {isLoading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator color="#2f95dc" size="small" />
                    <Text style={styles.loadingText}>Hold on, checking...</Text>
                </View>
            )}

            <View style={[styles.inputContainer]}>
                <TextInput
                    style={styles.input}
                    placeholder="Type what's happening..."
                    value={inputText}
                    onChangeText={setInputText}
                    multiline
                />
                <TouchableOpacity style={styles.sendButton} onPress={() => handleSend()}>
                    <Ionicons name="send" size={22} color="white" />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 16,
        backgroundColor: '#f8fafc',
    },
    botIcon: {
        width: 36,
        height: 36,
        borderRadius: 15,
        backgroundColor: '#2f95dc',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: 'SpaceMono-Bold',
        color: '#0f172a',
    },
    messageList: {
        padding: 16,
    },
    quickDiagnosisGrid: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#64748b',
        marginBottom: 8,
        fontFamily: 'Inter',
    },
    pillContainer: {
        flexDirection: 'row',
    },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    pillText: {
        fontSize: 13,
        color: '#334155',
        fontWeight: '500',
        fontFamily: 'Inter',
    },
    messageBubble: {
        maxWidth: '85%',
        padding: 12,
        borderRadius: 16,
        marginBottom: 12,
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: '#2f95dc',
    },
    aiBubble: {
        alignSelf: 'flex-start',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    userText: {
        color: '#fff',
        fontSize: 15,
        lineHeight: 22,
        fontFamily: 'Inter',
    },
    feedbackContainer: {
        marginTop: 12,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    feedbackPrompt: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 6,
        fontFamily: 'Inter',
    },
    feedbackButtons: {
        flexDirection: 'row',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
    },
    loadingText: {
        marginLeft: 8,
        color: '#64748b',
        fontSize: 13,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    input: {
        flex: 1,
        backgroundColor: 'rgba(227, 226, 226, 0.5)',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        fontSize: 15,
        maxHeight: 100,
        color: '#0f172a',
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#2f95dc',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
});