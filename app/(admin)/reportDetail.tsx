import { ModernCard } from "@/components/ModernCard";
import Colors from "@/constants/Colors";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { Surface, Text } from "react-native-paper";
import { db } from "../../firebase";

export default function ReportDetail() {
    const { id, name } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        completed: 0,
        successRate: 0,
        avgRating: 0,
        cancelled: 0,
    });

    useEffect(() => {
        fetchWorkshopStats();
    }, [id]);

    const fetchWorkshopStats = async () => {
        try {
            setLoading(true);
            const q = query(
                collection(db, "service_requests"),
                where("workshopId", "==", id)
            );
            const snapshot = await getDocs(q);
            const requests = snapshot.docs.map(doc => doc.data());

            const total = requests.length;
            const completed = requests.filter(r => r.status === 'completed').length;
            const cancelled = requests.filter(r => r.status === 'cancelled').length;
            const ratings = requests.filter(r => r.rating).map(r => r.rating);

            const avgRating = ratings.length > 0
                ? (ratings.reduce((a, b: any) => a + b, 0) / ratings.length).toFixed(1)
                : 0;

            const successRate = total > 0
                ? ((completed / total) * 100).toFixed(1)
                : 0;

            setStats({
                total,
                completed,
                successRate: Number(successRate),
                avgRating: Number(avgRating),
                cancelled,
            });
        } catch (error) {
            console.error("Error fetching stats:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.light.primary} />
                <Text style={styles.loadingText}>Calculating metrics...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Text variant="headlineSmall" style={styles.workshopName}>{name}</Text>
                <Text variant="bodyMedium" style={styles.subtitle}>Performance Overview</Text>
            </View>

            <View style={styles.grid}>
                <ModernCard style={styles.statCard}>
                    <View style={styles.cardHeader}>
                        <View style={[styles.iconBox, { backgroundColor: '#eff6ff' }]}>
                            <Feather name="check-circle" size={22} color="#3b82f6" />
                        </View>
                        <Text style={styles.statLabel}>Completed</Text>
                    </View>
                    <Text style={styles.statValue}>{stats.completed}</Text>
                    <Text style={styles.statSub}>Total fulfillments</Text>
                </ModernCard>

                <ModernCard style={styles.statCard}>
                    <View style={styles.cardHeader}>
                        <View style={[styles.iconBox, { backgroundColor: '#f0fdf4' }]}>
                            <Feather name="trending-up" size={22} color="#22c55e" />
                        </View>
                        <Text style={styles.statLabel}>Success Rate</Text>
                    </View>
                    <Text style={styles.statValue}>{stats.successRate}%</Text>
                    <Text style={styles.statSub}>Completion percentage</Text>
                </ModernCard>

                <ModernCard style={styles.statCard}>
                    <View style={styles.cardHeader}>
                        <View style={[styles.iconBox, { backgroundColor: '#fff7ed' }]}>
                            <Feather name="star" size={22} color="#f97316" />
                        </View>
                        <Text style={styles.statLabel}>Rating</Text>
                    </View>
                    <Text style={styles.statValue}>{stats.avgRating}</Text>
                    <Text style={styles.statSub}>Customer satisfaction</Text>
                </ModernCard>

                <ModernCard style={styles.statCard}>
                    <View style={styles.cardHeader}>
                        <View style={[styles.iconBox, { backgroundColor: '#fef2f2' }]}>
                            <Feather name="activity" size={22} color="#ef4444" />
                        </View>
                        <Text style={styles.statLabel}>Total Logs</Text>
                    </View>
                    <Text style={styles.statValue}>{stats.total}</Text>
                    <Text style={styles.statSub}>Total requests received</Text>
                </ModernCard>
            </View>

            <Surface style={styles.summaryBox} elevation={1}>
                <View style={styles.summaryItem}>
                    <Feather name="alert-circle" size={20} color="#64748b" />
                    <View style={styles.summaryTextGroup}>
                        <Text style={styles.summaryLabel}>Cancelled Requests</Text>
                        <Text style={styles.summaryValue}>{stats.cancelled}</Text>
                    </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.summaryItem}>
                    <Feather name="clock" size={20} color="#64748b" />
                    <View style={styles.summaryTextGroup}>
                        <Text style={styles.summaryLabel}>Active Status</Text>
                        <Text style={[styles.summaryValue, { color: '#22c55e' }]}>Operational</Text>
                    </View>
                </View>
            </Surface>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    content: {
        padding: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    loadingText: {
        marginTop: 12,
        color: '#64748b',
    },
    header: {
        marginBottom: 25,
    },
    workshopName: {
        fontWeight: 'bold',
        color: '#0f172a',
    },
    subtitle: {
        color: '#64748b',
        marginTop: 4,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 15,
    },
    statCard: {
        width: '47%',
        padding: 16,
        borderRadius: 20,
        backgroundColor: '#fff',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 12,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#475569',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    statSub: {
        fontSize: 11,
        color: '#94a3b8',
        marginTop: 4,
    },
    summaryBox: {
        marginTop: 25,
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 20,
    },
    summaryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    summaryTextGroup: {
        flex: 1,
    },
    summaryLabel: {
        fontSize: 13,
        color: '#64748b',
    },
    summaryValue: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#0f172a',
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: '#f1f5f9',
        marginVertical: 15,
    },
});
