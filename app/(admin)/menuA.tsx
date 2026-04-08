import { Href, router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AdminDashboard() {
    const stats = [
        { id: '1', title: 'Total Users', value: '1,245' },
        { id: '2', title: 'Active Workshops', value: '34' },
        { id: '3', title: 'Jobs Today', value: '128' },
        { id: '4', title: 'Pending Verifications', value: '7' },
    ];

    const actions = [
        { id: '1', title: 'View Users', icon: 'U', onPress: () => router.push('/viewuserA' as Href) },
        { id: '2', title: 'Manage Workshops', icon: 'W', onPress: () => router.push('/manageworkshopA' as Href) },
        { id: '3', title: 'View Reports', icon: 'R', onPress: () => router.push('/reportsA' as Href) },
    ];

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Overview</Text>
            </View>

            <View style={styles.statsContainer}>
                {stats.map((stat) => (
                    <View key={stat.id} style={styles.statCard}>
                        <Text style={styles.statValue}>{stat.value}</Text>
                        <Text style={styles.statTitle}>{stat.title}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.header}>
                <Text style={styles.headerTitle}>Quick Actions</Text>
            </View>

            <View style={styles.actionsContainer}>
                {actions.map((action) => (
                    <TouchableOpacity
                        key={action.id}
                        style={styles.actionButton}
                        activeOpacity={0.7}
                        onPress={action.onPress}
                    >
                        <View style={styles.actionIconPlaceholder}>
                            <Text style={styles.actionIconText}>{action.icon}</Text>
                        </View>
                        <Text style={styles.actionText}>{action.title}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
    },
    statsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
    },
    statCard: {
        backgroundColor: '#fff',
        width: '46%',
        padding: 20,
        borderRadius: 12,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#896CFE',
        marginBottom: 5,
    },
    statTitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    actionsContainer: {
        paddingHorizontal: 20,
        paddingBottom: 30,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    actionIconPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E2F163',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    actionIconText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    actionText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
});
