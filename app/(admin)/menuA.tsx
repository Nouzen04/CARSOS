import { ModernCard } from '@/components/ModernCard';
import Colors from '@/constants/Colors';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Href, router } from 'expo-router';
import { collection, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { IconButton, Surface, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../firebase';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
    totalUser: 0,
    workshop: 0,
    job: 0,
    pending: 0,
    });

    useEffect(() => {
        const unsubscribeUsers = onSnapshot(collection(db, "users"), (userSnapshot) => {
            const allUsers = userSnapshot.docs.map(doc => doc.data());
            const drivers = allUsers.filter(u => u.role === 'pemandu');
            const work = allUsers.filter(u => u.role === 'bengkel');
            const pending = work.filter(r => r.verified === false && r.status !== 'rejected').length;

            setStats(prev => ({
                ...prev,
                totalUser: drivers.length,
                workshop: work.length,
                pending,
            }));
        }, (error: any) => {
            console.error("Error listening to users:", error);
            if (error?.code === 'permission-denied') {
                Alert.alert(
                    "Permission Denied",
                    "Admin cannot read workshop/user data. Publish the updated Firestore rules from firestore.rules (see FIRESTORE_RULES.md)."
                );
            }
        });

        const unsubscribeRequests = onSnapshot(collection(db, "service_requests"), (requestSnapshot) => {
            const requests = requestSnapshot.docs.map(doc => doc.data());
            const job = requests.filter(
                r => r.status === 'Completed' || r.status === 'Cancelled'
            ).length;

            setStats(prev => ({
                ...prev,
                job,
            }));
        }, (error: any) => {
            console.error("Error listening to requests:", error);
        });

        return () => {
            unsubscribeUsers();
            unsubscribeRequests();
        };
    }, []);
    const actions = [
        { id: '1', title: 'View Users', subtitle: 'Manage driver & staff accounts', icon: 'users', color: '#6366f1', onPress: () => router.push('/viewuserA' as Href) },
        { id: '2', title: 'Manage Workshops', subtitle: 'Review and verify service centers', icon: 'tool', color: '#8b5cf6', onPress: () => router.push('/manageworkshopA' as Href) },
        { id: '3', title: 'System Reports', subtitle: 'View performance and logs', icon: 'file-text', color: '#3b82f6', onPress: () => router.push('/reportsA' as Href) },
    ];

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout from Admin panel?",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Logout", 
                    style: "destructive", 
                    onPress: async () => {
                        try {
                            await auth.signOut();
                            router.replace('/login');
                        } catch (error) {
                            console.error("Logout error:", error);
                        }
                    } 
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[Colors.light.primary, Colors.light.secondary]}
                style={styles.header}
            >
                <SafeAreaView style={styles.headerContent}>
                    <View style={styles.headerTop}>
                        <View>
                            <Text variant="headlineSmall" style={styles.headerTitle}>Dashboard</Text>
                            <Text variant="bodyMedium" style={styles.headerSubtitle}>System Overview</Text>
                        </View>
                        <IconButton 
                            icon="logout" 
                            iconColor="#fff" 
                            size={24} 
                            onPress={handleLogout}
                            style={styles.logoutBtn}
                        />
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <ScrollView 
                style={styles.content} 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                {stats.pending > 0 && (
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => router.push('/manageworkshopA' as Href)}
                        style={styles.notificationBanner}
                    >
                        <Surface style={styles.notificationSurface} elevation={1}>
                            <MaterialCommunityIcons name="bell-ring" size={24} color="#d97706" />
                            <View style={styles.notificationContent}>
                                <Text style={styles.notificationTitle}>Pending Review</Text>
                                <Text style={styles.notificationText}>
                                    There {stats.pending === 1 ? 'is' : 'are'} {stats.pending} workshop registration{stats.pending > 1 ? 's' : ''} waiting for verification.
                                </Text>
                            </View>
                            <Feather name="arrow-right" size={18} color="#d97706" />
                        </Surface>
                    </TouchableOpacity>
                )}

                <View style={styles.statsGrid}>

                        <ModernCard style={styles.statCard} elevation={2}>
                            <View style={[styles.statIconContainer, { backgroundColor: '#6366f1' + '15' }]}>
                                <MaterialCommunityIcons name= 'account-group' size={24} color= '#6366f1' />
                            </View>
                            <Text variant="headlineMedium" style={[styles.statValue, { color: '#6366f1' }]}>{stats.totalUser}</Text>
                            <Text variant="labelMedium" style={styles.statTitle}>Total User</Text>
                        </ModernCard>

                        <ModernCard style={styles.statCard} elevation={2}>
                            <View style={[styles.statIconContainer, { backgroundColor: '#8b5cf6' + '15' }]}>
                                <MaterialCommunityIcons name= 'tools' size={24} color= '#8b5cf6' />
                            </View>
                            <Text variant="headlineMedium" style={[styles.statValue, { color: '#8b5cf6' }]}>{stats.workshop}</Text>
                            <Text variant="labelMedium" style={styles.statTitle}>Workshop</Text>
                        </ModernCard>
                        
                        <ModernCard style={styles.statCard} elevation={2}>
                            <View style={[styles.statIconContainer, { backgroundColor: '#3b82f6' + '15' }]}>
                                <MaterialCommunityIcons name= 'car-wrench' size={24} color= '#3b82f6' />
                            </View>
                            <Text variant="headlineMedium" style={[styles.statValue, { color: '#3b82f6' }]}>{stats.job}</Text>
                            <Text variant="labelMedium" style={styles.statTitle}>Jobs</Text>
                        </ModernCard>

                        <ModernCard style={styles.statCard} elevation={2}>
                            <View style={[styles.statIconContainer, { backgroundColor: '#f59e0b' + '15' }]}>
                                <MaterialCommunityIcons name= 'alert-circle' size={24} color= '#f59e0b' />
                            </View>
                            <Text variant="headlineMedium" style={[styles.statValue, { color: '#f59e0b' }]}>{stats.pending}</Text>
                            <Text variant="labelMedium" style={styles.statTitle}>Pending</Text>
                        </ModernCard>
                   
                </View>

                <View style={styles.sectionHeader}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>Quick Actions</Text>
                </View>

                <View style={styles.actionsContainer}>
                    {actions.map((action) => (
                        <TouchableOpacity
                            key={action.id}
                            activeOpacity={0.7}
                            onPress={action.onPress}
                        >
                            <Surface style={styles.actionItem} elevation={1}>
                                <View style={[styles.actionIconPlaceholder, { backgroundColor: action.color + '15' }]}>
                                    <Feather name={action.icon as any} size={20} color={action.color} />
                                </View>
                                <View style={styles.actionTextContainer}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text variant="titleMedium" style={styles.actionText}>{action.title}</Text>
                                        {action.id === '2' && stats.pending > 0 && (
                                            <View style={styles.bulletNotification} />
                                        )}
                                    </View>
                                    <Text variant="bodySmall" style={styles.actionSubtitle}>{action.subtitle}</Text>
                                </View>
                                <Feather name="chevron-right" size={20} color="#cbd5e1" />
                            </Surface>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        height: 180,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerContent: {
        paddingHorizontal: 20,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    headerTitle: {
        color: '#fff',
        fontWeight: 'bold',
    },
    headerSubtitle: {
        color: 'rgba(255,255,255,0.8)',
    },
    logoutBtn: {
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    content: {
        flex: 1,
        marginTop: -30,
        paddingHorizontal: 20,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    statCard: {
        width: '48%',
        padding: 15,
        marginBottom: 15,
        alignItems: 'flex-start',
        backgroundColor: '#fff',
    },
    statIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    statValue: {
        fontWeight: 'bold',
        fontSize: 22,
    },
    statTitle: {
        color: '#64748b',
        marginTop: 2,
    },
    sectionHeader: {
        marginVertical: 15,
    },
    sectionTitle: {
        fontWeight: 'bold',
        color: '#0f172a',
    },
    actionsContainer: {
        gap: 12,
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
    },
    actionIconPlaceholder: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    actionTextContainer: {
        flex: 1,
    },
    actionText: {
        fontWeight: '600',
        color: '#0f172a',
    },
    actionSubtitle: {
        color: '#64748b',
        marginTop: 2,
    },
    bulletNotification: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ef4444',
        marginLeft: 8,
    },
    notificationBanner: {
        marginBottom: 15,
        marginTop: 10,
    },
    notificationSurface: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fffbeb',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#fef3c7',
    },
    notificationContent: {
        flex: 1,
        marginLeft: 12,
        marginRight: 8,
    },
    notificationTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#b45309',
    },
    notificationText: {
        fontSize: 13,
        color: '#d97706',
        marginTop: 2,
    },
});
