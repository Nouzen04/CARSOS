import { Href, router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, Alert } from 'react-native';
import { Text, IconButton, useTheme, Surface } from 'react-native-paper';
import { auth } from '../../firebase';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ModernCard } from '@/components/ModernCard';
import Colors from '@/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminDashboard() {
    const stats = [
        { id: '1', title: 'Total Users', value: '1,245', icon: 'account-group', color: '#6366f1' },
        { id: '2', title: 'Workshops', value: '34', icon: 'tools', color: '#8b5cf6' },
        { id: '3', title: 'Jobs Today', value: '128', icon: 'car-wrench', color: '#3b82f6' },
        { id: '4', title: 'Pending', value: '7', icon: 'alert-circle', color: '#f59e0b' },
    ];

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
                <View style={styles.statsGrid}>
                    {stats.map((stat) => (
                        <ModernCard key={stat.id} style={styles.statCard} elevation={2}>
                            <View style={[styles.statIconContainer, { backgroundColor: stat.color + '15' }]}>
                                <MaterialCommunityIcons name={stat.icon as any} size={24} color={stat.color} />
                            </View>
                            <Text variant="headlineMedium" style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                            <Text variant="labelMedium" style={styles.statTitle}>{stat.title}</Text>
                        </ModernCard>
                    ))}
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
                                    <Text variant="titleMedium" style={styles.actionText}>{action.title}</Text>
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
});
