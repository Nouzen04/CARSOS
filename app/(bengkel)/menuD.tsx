import { collection, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TouchableHighlight, View } from 'react-native';
import { db } from '../../firebase';

const JobCard = ({ job, type }: { job: any, type: 'incoming' | 'waiting' }) => {
    const handleStatusUpdate = async (newStatus: string) => {
        try {
            await updateDoc(doc(db, 'service_requests', job.id), {
                status: newStatus
            });
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    return (
        <View style={styles.card}>
            <Text style={styles.cardTitle}>{type === 'incoming' ? 'Incoming Request' : 'Ongoing Job'}</Text>
            <View style={styles.detailRow}>
                <Text style={styles.label}>Driver:</Text>
                <Text style={styles.value}>{job.pemanduName || 'Unknown driver'}</Text>
            </View>
            <View style={styles.detailRow}>
                <Text style={styles.label}>Contact via:</Text>
                <Text style={styles.value}>{job.contactMethod}</Text>
            </View>
            <View style={styles.detailRow}>
                <Text style={styles.label}>Time:</Text>
                <Text style={styles.value}>{job.timestamp?.toDate().toLocaleString() || 'N/A'}</Text>
            </View>
            <View style={styles.detailRow}>
                <Text style={styles.label}>Status:</Text>
                <Text style={[styles.value, { color: job.status === 'Pending' ? '#E31E24' : '#4CAF50', fontWeight: 'bold' }]}>
                    {job.status}
                </Text>
            </View>

            <View style={styles.pillContainer}>
                {job.status === 'Pending' ? (
                    <>
                        <TouchableHighlight
                            style={[styles.pill, { backgroundColor: '#4CAF50' }]}
                            onPress={() => handleStatusUpdate('Accepted')}
                            underlayColor="#388E3C"
                        >
                            <Text style={{ color: 'white', fontWeight: 'bold' }}>Accept Request</Text>
                        </TouchableHighlight>
                        <TouchableHighlight
                            style={[styles.pill, { backgroundColor: '#F44336', marginTop: 8 }]}
                            onPress={() => handleStatusUpdate('Cancelled')}
                            underlayColor="#D32F2F"
                        >
                            <Text style={{ color: 'white', fontWeight: 'bold' }}>Decline</Text>
                        </TouchableHighlight>
                    </>
                ) : (
                    <TouchableHighlight
                        style={[styles.pill, { backgroundColor: '#896CFE' }]}
                        onPress={() => console.log('View Details')}
                        underlayColor="#6B4FE7"
                    >
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>View Details & Tools</Text>
                    </TouchableHighlight>
                )}
            </View>
        </View>
    );
};

export default function BengkelHome() {
    const [activeTab, setActiveTab] = useState<'incoming' | 'waiting'>('incoming');
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Ideally we filter by workshop ID (bengkelID)
        // For now, listing all for demo purposes or using the placeholder
        const q = query(
            collection(db, 'service_requests'),
            where('bengkelID', '==', 'SNSService123')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setRequests(list);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const filteredRequests = requests.filter(req =>
        activeTab === 'incoming' ? req.status === 'Pending' : req.status === 'Accepted'
    );

    return (
        <ScrollView style={styles.mainContainer}>
            <View style={styles.container}>
                <View style={styles.buttonContainer}>
                    <Pressable
                        onPress={() => setActiveTab('incoming')}
                        style={({ pressed }) => [
                            styles.button,
                            { backgroundColor: activeTab === 'incoming' ? '#E2F163' : '#FFFFFF' }
                        ]}
                    >
                        <Text style={styles.buttonText}>Incoming ({requests.filter(r => r.status === 'Pending').length})</Text>
                    </Pressable>

                    <Pressable
                        onPress={() => setActiveTab('waiting')}
                        style={({ pressed }) => [
                            styles.button,
                            { backgroundColor: activeTab === 'waiting' ? '#E2F163' : '#FFFFFF' }
                        ]}
                    >
                        <Text style={styles.buttonText}>Accepted ({requests.filter(r => r.status === 'Accepted').length})</Text>
                    </Pressable>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#896CFE" style={{ marginTop: 40 }} />
                ) : (
                    <View style={styles.listContainer}>
                        {filteredRequests.length > 0 ? (
                            filteredRequests.map(req => (
                                <JobCard key={req.id} job={req} type={activeTab} />
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyText}>No {activeTab} requests found.</Text>
                            </View>
                        )}
                    </View>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    container: {
        flex: 1,
        alignItems: 'center',
        paddingBottom: 40,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        padding: 20,
        width: '100%',
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        borderColor: '#896CFE',
        borderWidth: 1,
        minWidth: 140,
    },
    buttonText: {
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#000',
    },
    listContainer: {
        width: '100%',
        padding: 16,
    },
    card: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
        width: '100%',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#896CFE',
        marginBottom: 12,
        textTransform: 'uppercase',
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 6,
    },
    label: {
        width: 100,
        color: '#888',
        fontSize: 14,
    },
    value: {
        flex: 1,
        color: '#333',
        fontSize: 14,
        fontWeight: '500',
    },
    pillContainer: {
        marginTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#EEE',
        paddingTop: 15,
    },
    pill: {
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
    },
    emptyState: {
        marginTop: 60,
        alignItems: 'center',
    },
    emptyText: {
        color: '#999',
        fontSize: 16,
    }
});
