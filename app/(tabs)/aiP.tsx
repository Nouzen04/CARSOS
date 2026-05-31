import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import Groq from 'groq-sdk';
import { marked } from 'marked';
import { useRef, useState } from 'react';
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
import { auth, db } from '../../firebase'; // Accessing configured Firestore and Auth

// Configuration - USER NEEDS TO ADD THEIR GROQ API KEY HERE
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

    const SYSTEM_INSTRUCTION =
        "You are a senior workshop foreman helping drivers on the CARSOS emergency app. " +
        "Talk like a real person beside the car — warm, calm, direct. Never sound like a robot, manual, or corporate helpdesk. " +
        "Use short sentences, 'you' and 'we', and plain everyday words. Light Malaysian English is fine when natural (e.g. 'Okay, pull over first', 'Can check this') — stay clear. " +
        "Never say 'As an AI', 'I understand your concern', or open with stiff greetings. " +
        "How to reply every time: (1) Safety first — what to do right now on the road (hazards, pull over, don't open hood if steaming, etc.) in clear steps. " +
        "(2) What might be going on — explain like experience, not a lecture. Say when you're not sure. " +
        "(3) Simple next steps — what they can check safely, when to stop driving, when to use CARSOS SOS or get a tow, when to book a bengkel. " +
        "Keep answers concise: about 3-5 short blocks max. No walls of text. " +
        "Use Markdown lightly — **bold** for urgent warnings, bullet lists for steps. " +
        "If it's dangerous (brake failure, fire, smoke in cabin, stuck in traffic lane) — be firm and clear: stop driving, get safe, call for help. " +
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

        // Save message to database for logging (requires Firestore rules + signed-in user)
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

    // ... (inside the component)

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

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
            style={styles.container}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 95 : 95}
        >
            <View style={styles.header}>
                <View style={styles.botIcon}>
                    <MaterialIcons name="auto-awesome" size={20} color="white" />
                </View>
                <Text style={styles.headerTitle}>AI Mechanical Assistant</Text>
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.messageList}
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
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />

            {isLoading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator color="#2f95dc" size="small" />
                    <Text style={styles.loadingText}>Hold on, checking...</Text>
                </View>
            )}

            <View style={styles.inputContainer}>
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
        backgroundColor: '#F7F9FB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    botIcon: {
        backgroundColor: '#2f95dc',
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 12,
        color: '#333',
    },
    messageList: {
        padding: 16,
    },
    messageBubble: {
        maxWidth: '85%',
        padding: 16,
        borderRadius: 18,
        marginBottom: 16,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: '#2f95dc',
        borderBottomRightRadius: 4,
    },
    aiBubble: {
        alignSelf: 'flex-start',
        backgroundColor: 'white',
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
    },
    userText: {
        color: 'white',
    },
    aiText: {
        color: '#2C3E50',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 10,
        backgroundColor: 'white',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#EEE',
    },
    input: {
        flex: 1,
        backgroundColor: '#F1F3F5',
        borderRadius: 25,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 15,
        maxHeight: 100,
    },
    sendButton: {
        backgroundColor: '#2f95dc',
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    loadingText: {
        marginLeft: 10,
        fontSize: 13,
        color: '#7F8C8D',
        fontStyle: 'italic',
    },
    feedbackContainer: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        alignItems: 'center',
    },
    feedbackPrompt: {
        fontSize: 12,
        color: '#95A5A6',
        marginBottom: 8,
    },
    feedbackButtons: {
        flexDirection: 'row',
    },
    quickDiagnosisGrid: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#888',
        marginBottom: 10,
        textTransform: 'uppercase',
    },
    pillContainer: {
        flexDirection: 'row',
    },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#D1D9E6',
    },
    pillText: {
        fontSize: 13,
        color: '#34495E',
        fontWeight: '500',
    }
});