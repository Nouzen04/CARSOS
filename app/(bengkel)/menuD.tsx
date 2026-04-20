import { collection, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View, TouchableHighlight, TouchableOpacity } from 'react-native';
import { Text, SegmentedButtons, IconButton, Surface, useTheme } from 'react-native-paper';
import { auth, db } from '../../firebase';
import { ModernCard } from '@/components/ModernCard';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

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

    const statusColor = job.status === 'Pending' ? '#ef4444' : '#10b981';

    return (
        <ModernCard style={styles.card} elevation={2}>
            <View style={styles.cardHeader}>
                <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
                <Text variant="titleSmall" style={[styles.statusText, { color: statusColor }]}>
                    {job.status.toUpperCase()}
                </Text>
                <Text variant="bodySmall" style={styles.timeText}>
                    {job.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'N/A'}
                </Text>
            </View>

            <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                    <View style={styles.iconCircle}>
                        <MaterialCommunityIcons name="account" size={20} color={Colors.light.primary} />
                    </View>
                    <View>
                        <Text variant="labelSmall" style={styles.infoLabel}>Driver</Text>
                        <Text variant="bodyMedium" style={styles.infoValue}>{job.pemanduName || 'Unknown driver'}</Text>
                    </View>
                </View>

                <View style={styles.infoRow}>
                    <View style={styles.iconCircle}>
                        <MaterialCommunityIcons name="phone" size={20} color={Colors.light.primary} />
                    </View>
                    <View>
                        <Text variant="labelSmall" style={styles.infoLabel}>Contact Method</Text>
                        <Text variant="bodyMedium" style={styles.infoValue}>{job.contactMethod}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.cardFooter}>
                {job.status === 'Pending' ? (
                    <View style={styles.actionButtons}>
                        <TouchableOpacity 
                            style={[styles.actionBtn, { backgroundColor: '#10b981' }]} 
                            onPress={() => handleStatusUpdate('Accepted')}
                        >
                            <Text style={styles.actionBtnText}>Accept</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.actionBtn, { backgroundColor: '#ef4444' }]} 
                            onPress={() => handleStatusUpdate('Cancelled')}
                        >
                            <Text style={styles.actionBtnText}>Decline</Text>
                        </TouchableOpacity>
                    </View>
                ) : job.status === 'Accepted' ? (
                    <TouchableOpacity 
                        style={[styles.viewDetailsBtn, { backgroundColor: '#3b82f6' }]} 
                        onPress={() => handleStatusUpdate('Completed')}
                    >
                        <MaterialCommunityIcons name="check-all" size={20} color="#fff" />
                        <Text style={styles.viewDetailsText}>Complete Job</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.viewDetailsBtn}>
                        <Text style={styles.viewDetailsText}>View Details & Tools</Text>
                        <Feather name="arrow-right" size={16} color="#fff" />
                    </TouchableOpacity>
                )
                }
            </View>
        </ModernCard>
    );
};

export default function BengkelHome() {
    const [activeTab, setActiveTab] = useState('incoming');
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!auth.currentUser) return;

        const q = query(
            collection(db, 'service_requests'),
            where('bengkelID', '==', auth.currentUser.uid)
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
        <View style={styles.mainContainer}>
            <LinearGradient
                colors={[Colors.light.primary, Colors.light.secondary]}
                style={styles.header}
            >
                <SafeAreaView style={styles.headerContent}>
                    <Text variant="headlineSmall" style={styles.headerTitle}>Workshop Portal</Text>
                    <Text variant="bodyMedium" style={styles.headerSubtitle}>Manage your active requests</Text>
                </SafeAreaView>
            </LinearGradient>

            <View style={styles.body}>
                <SegmentedButtons
                    value={activeTab}
                    onValueChange={setActiveTab}
                    buttons={[
                        { value: 'incoming', label: `Incoming (${requests.filter(r => r.status === 'Pending').length})` },
                        { value: 'waiting', label: `Active (${requests.filter(r => r.status === 'Accepted').length})` },
                    ]}
                    style={styles.segmentedButtons}
                />

                {loading ? (
                    <ActivityIndicator size="large" color={Colors.light.primary} style={{ marginTop: 40 }} />
                ) : (
                    <ScrollView 
                        style={styles.scrollContainer} 
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 40 }}
                    >
                        {filteredRequests.length > 0 ? (
                            filteredRequests.map(req => (
                                <JobCard key={req.id} job={req} type={activeTab as any} />
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <View style={styles.emptyIconContainer}>
                                    <MaterialCommunityIcons name="clipboard-text-outline" size={60} color="#cbd5e1" />
                                </View>
                                <Text variant="titleMedium" style={styles.emptyText}>No {activeTab} requests found.</Text>
                                <Text variant="bodySmall" style={styles.emptySubtext}>We'll notify you when new jobs arrive.</Text>
                            </View>
                        )}
                    </ScrollView>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        height: 160,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    headerContent: {
        paddingHorizontal: 25,
    },
    headerTitle: {
        color: '#fff',
        fontWeight: 'bold',
    },
    headerSubtitle: {
        color: 'rgba(255,255,255,0.8)',
        marginTop: 4,
    },
    body: {
        flex: 1,
        marginTop: -30,
        paddingHorizontal: 20,
    },
    segmentedButtons: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 20,
    },
    scrollContainer: {
        flex: 1,
    },
    card: {
        backgroundColor: '#fff',
        padding: 0, // We'll use internal padding
        marginBottom: 16,
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    statusIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    statusText: {
        fontWeight: 'bold',
        flex: 1,
    },
    timeText: {
        color: '#94a3b8',
    },
    cardBody: {
        padding: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    infoLabel: {
        color: '#64748b',
        fontSize: 10,
    },
    infoValue: {
        color: '#0f172a',
        fontWeight: '600',
    },
    cardFooter: {
        padding: 16,
        backgroundColor: '#f8fafc',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    actionBtn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    actionBtnText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    viewDetailsBtn: {
        backgroundColor: '#6366f1',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        gap: 8,
    },
    viewDetailsText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    emptyState: {
        marginTop: 60,
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyText: {
        color: '#475569',
        textAlign: 'center',
    },
    emptySubtext: {
        color: '#94a3b8',
        textAlign: 'center',
        marginTop: 8,
    },
});
