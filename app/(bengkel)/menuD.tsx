import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TouchableHighlight, View } from 'react-native';



const WaitingJobCard = () => {
    const driver = 'Ali'
    const car = 'Toyato'
    const Prob = 'Enjin mati'
    const loc = 'Jalan bahagia'
    const status = 'Accepted'

    const BUTTON = [
        { id: '1', text: 'View Details', color: '#42ea42ff' },
        { id: '2', text: 'Set ETA', color: '#ef4747ff' }
    ]
    return (
        <View style={styles.card}>
            <Text style={styles.cardTitle}>Waiting Job</Text>
            <Text style={styles.cardDescription}>Driver: {driver}</Text>
            <Text style={styles.cardDescription}>Car: {car}</Text>
            <Text style={styles.cardDescription}>Problem: {Prob}</Text>
            <Text style={styles.cardDescription}>Location: {loc}</Text>
            <Text style={styles.cardDescription}>Status: {status}</Text>
            <View style={styles.pillContainer}>
                {BUTTON.map((button) => (
                    < TouchableHighlight
                        key={button.id}
                        style={[styles.pill, { backgroundColor: button.color }]}
                        onPress={() => console.log(`${button.text}`)}
                        activeOpacity={0.6}
                        underlayColor="#fdffb8ff"
                    >
                        <Text style={[{ color: 'white' }]}>{button.text}</Text>
                    </TouchableHighlight>
                ))}
            </View>
        </View>
    );
};

const IncomingJobCard = () => {
    const driver = 'Ali'
    const car = 'Toyato'
    const Prob = 'Enjin mati'
    const loc = 'Jalan bahagia'
    const status = 'Waiting'

    const BUTTON = [
        { id: '1', text: 'Accept', color: '#42ea42ff' },
        { id: '2', text: 'Decline', color: '#ef4747ff' }
    ]

    return (
        <View style={styles.card}>
            <Text style={styles.cardTitle}>Incoming Job</Text>
            <Text style={styles.cardDescription}>Driver: {driver}</Text>
            <Text style={styles.cardDescription}>Car: {car}</Text>
            <Text style={styles.cardDescription}>Problem: {Prob}</Text>
            <Text style={styles.cardDescription}>Location: {loc}</Text>
            <Text style={styles.cardDescription}>Status: {status}</Text>
            <View style={styles.pillContainer}>
                {BUTTON.map((button) => (
                    < TouchableHighlight
                        key={button.id}
                        style={[styles.pill, { backgroundColor: button.color }]}
                        onPress={() => console.log(`${button.text}`)}
                        activeOpacity={0.6}
                        underlayColor="#fdffb8ff"
                    >
                        <Text style={[{ color: 'white' }]}>{button.text}</Text>
                    </TouchableHighlight>
                ))}
            </View>
        </View >
    );
};


export default function BengkelHome() {
    const [activeTab, setActiveTab] = useState<'incoming' | 'waiting'>('incoming');

    return (
        <ScrollView>
            <View style={styles.container}>
                <View style={styles.buttonContainer}>
                    <Pressable
                        onPress={() => setActiveTab('incoming')}
                        style={({ pressed }) => [
                            styles.button,
                            // Stay dark if active, otherwise change on press, else normal
                            { backgroundColor: activeTab === 'incoming' ? '#E2F163' : (pressed ? '#E2F163' : '#ffffffff') }
                        ]}
                    >
                        <Text style={styles.buttonText}>Incoming</Text>
                    </Pressable>

                    <Pressable
                        onPress={() => setActiveTab('waiting')}
                        style={({ pressed }) => [
                            styles.button,
                            { backgroundColor: activeTab === 'waiting' ? '#E2F163' : (pressed ? '#E2F163' : '#ffffffff') }
                        ]}
                    >
                        <Text style={styles.buttonText}>Waiting</Text>
                    </Pressable>
                </View>
                <View style={styles.separator} />
                <View>
                    {activeTab === 'incoming'
                        ? <IncomingJobCard />
                        : <WaitingJobCard />}
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f5f5f5',
        width: '100%',
    },
    button: {
        padding: 16,
        width: 100,
        borderRadius: 18,
        borderColor: '#896CFE',
        borderWidth: 1,
        marginBottom: -15,
    },
    buttonText: {
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#000',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    separator: {
        marginVertical: 12,
        height: 1,
        width: '80%',
        backgroundColor: '#ff0000ff',
        alignSelf: 'center'
    },
    card: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 3,
        marginBottom: 16,
        width: 328,
        alignSelf: 'center',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    cardDescription: {
        fontSize: 14,
        color: '#666',
    },
    pill: {
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 20,
        alignItems: 'center',
        alignSelf: 'center',
        justifyContent: 'center',
        marginTop: 10,
        width: '75%'
    },
    pillContainer: {
        marginTop: 5
    }
});
