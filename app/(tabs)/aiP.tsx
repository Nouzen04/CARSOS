import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import React, { useRef, useState } from 'react';
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
    View
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import { auth, db } from '../../firebase'; // Accessing configured Firestore and Auth

// Configuration - USER NEEDS TO ADD THEIR GEMINI API KEY HERE
const GEMINI_API_KEY = "AIzaSyAelDZmM1rFRW2wiQR9kG6I_s7rbd71tqQ";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

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
            text: "Hello! I am your CARSOS Assistant. 🚗💨 \n\nPlease describe what's happening to your car, and I'll give you safety procedures and diagnosis advice.",
            sender: 'ai',
            timestamp: new Date(),
        },
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    // System Instruction to make the AI a Car Expert
    const SYSTEM_INSTRUCTION =
        "You are a professional car breakdown analyst and safety assistant for the 'CARSOS' emergency app. " +
        "Safety first. If a user describes a breakdown, your first response must prioritize their safety (pull over, hazard lights, etc.). " +
        "Then, provide a professional analysis of the symptoms. Finally, give a clear procedure to follow. Make it simple as possible so that driver can understand and follow the instructions. " +
        "If the issue is critical (brake failure, fire), strongly advise calling for a professional tow (SOS).";

    const sendMessageToAI = async (text: string) => {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
            const prompt = `${SYSTEM_INSTRUCTION}\n\nUser Issue: ${text}\n\nResponse:`;
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error("AI Error:", error);
            return "I'm sorry, I'm having trouble analyzing your issue right now. If it's an emergency, please use our SOS feature.";
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

        // Save message to database for logging
        try {
            await addDoc(collection(db, 'ai_queries'), {
                userId: auth.currentUser?.uid || 'anonymous',
                userQuery: messageContent,
                aiResponse: aiResponseText,
                timestamp: serverTimestamp(),
            });
        } catch (e) {
            console.log("Database logging failed", e);
        }
    };

    const submitFeedback = async (messageId: string, isPositive: boolean) => {
        try {
            await addDoc(collection(db, 'ai_feedback'), {
                userId: auth.currentUser?.uid || 'anonymous',
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
                <Markdown
                    style={{
                        body: { color: '#2C3E50', fontSize: 15, lineHeight: 22 },
                        strong: { fontWeight: 'bold' },
                        bullet_list: { marginBottom: 10 },
                        list_item: { marginBottom: 5 }
                    }}
                >
                    {item.text}
                </Markdown>
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
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
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
                    <Text style={styles.loadingText}>Analyzing symptoms...</Text>
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