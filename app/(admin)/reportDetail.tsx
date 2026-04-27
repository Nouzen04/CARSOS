import { ModernCard } from "@/components/ModernCard";
import Colors from "@/constants/Colors";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, View, TouchableOpacity, Alert } from "react-native";
import { Button, Divider, List, Surface, Text } from "react-native-paper";
import { db } from "../../firebase";
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { BarChart } from "react-native-chart-kit";

export default function ReportDetail() {
    const { id, name } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [ratingsList, setRatingsList] = useState<any[]>([]);
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
            // 1. Fetch Service Requests for volume metrics
            const qRequests = query(
                collection(db, "service_requests"),
                where("bengkelID", "==", id)
            );
            const requestSnapshot = await getDocs(qRequests);
            const requests = requestSnapshot.docs.map(doc => doc.data());

            // 2. Fetch Ratings for quality metrics (Historical accuracy)
            const qRatings = query(
                collection(db, "ratings"),
                where("bengkelID", "==", id)
            );
            const ratingSnapshot = await getDocs(qRatings);
            const ratingsData = ratingSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setRatingsList(ratingsData);

            const total = requests.length;
            const completed = requests.filter(r => r.status === 'Completed').length;
            const cancelled = requests.filter(r => r.status === 'Cancelled').length;

            // Calculate average from the actual ratings collection
            const avgRating = ratingsData.length > 0
                ? (ratingsData.reduce((a, b: any) => a + (b.score || 0), 0) / ratingsData.length).toFixed(1)
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

    const generatePDF = async () => {
        try {
            setExporting(true);
            const html = `
                <html>
                <head>
                    <style>
                        body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #1e293b; }
                        .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; }
                        h1 { color: #0f172a; margin-bottom: 5px; }
                        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; }
                        .stat-box { background: #f8fafc; padding: 20px; border-radius: 10px; border: 1px solid #e2e8f0; }
                        .stat-label { font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: bold; }
                        .stat-value { font-size: 24px; font-weight: bold; color: #3b82f6; }
                        .section-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; margin-top: 30px; color: #0f172a; border-left: 4px solid #3b82f6; padding-left: 10px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                        th { text-align: left; background: #f1f5f9; padding: 12px; font-size: 12px; }
                        td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; }
                        .rating-star { color: #f59e0b; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Workshop Performance Report</h1>
                        <p>${name}</p>
                        <p style="font-size: 12px; color: #64748b;">Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
                    </div>

                    <div class="section-title">Key Performance Indicators</div>
                    <div class="stats-grid">
                        <div class="stat-box">
                            <div class="stat-label">Average Rating</div>
                            <div class="stat-value">${stats.avgRating} / 5.0</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-label">Success Rate</div>
                            <div class="stat-value">${stats.successRate}%</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-label">Completed Jobs</div>
                            <div class="stat-value">${stats.completed}</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-label">Total Requests</div>
                            <div class="stat-value">${stats.total}</div>
                        </div>
                    </div>

                    <div class="section-title">Customer Feedback (${ratingsList.length})</div>
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 80px;">Rating</th>
                                <th>Comment</th>
                                <th style="width: 100px;">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${ratingsList.map(r => `
                                <tr>
                                    <td><span class="rating-star">${'★'.repeat(r.score)}${'☆'.repeat(5 - r.score)}</span></td>
                                    <td>${r.comment || 'No comment provided'}</td>
                                    <td>${r.timestamp?.toDate().toLocaleDateString() || 'N/A'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <div style="margin-top: 50px; text-align: center; font-size: 10px; color: #94a3b8;">
                        © ${new Date().getFullYear()} CARSOS Application - Official Performance Report
                    </div>
                </body>
                </html>
            `;

            const { uri } = await Print.printToFileAsync({ html });
            await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
        } catch (error) {
            console.error("PDF Generation error:", error);
            Alert.alert("Export Error", "Failed to generate PDF report.");
        } finally {
            setExporting(false);
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
                <View style={styles.headerTop}>
                    <View style={{ flex: 1 }}>
                        <Text variant="headlineSmall" style={styles.workshopName}>{name}</Text>
                        <Text variant="bodyMedium" style={styles.subtitle}>Performance Overview</Text>
                    </View>
                    <Button 
                        mode="contained" 
                        onPress={generatePDF} 
                        loading={exporting}
                        disabled={exporting}
                        icon="file-pdf-box"
                        style={styles.exportBtn}
                    >
                        Export PDF
                    </Button>
                </View>
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

            {/* Performance Chart */}
            <ModernCard style={styles.chartCard}>
                <Text variant="titleMedium" style={styles.cardTitle}>Job Outcome Analysis</Text>
                <BarChart
                    data={{
                        labels: ["Completed", "Cancelled", "Total"],
                        datasets: [{
                            data: [stats.completed, stats.cancelled, stats.total]
                        }]
                    }}
                    width={Dimensions.get("window").width - 72}
                    height={220}
                    yAxisLabel=""
                    yAxisSuffix=""
                    chartConfig={{
                        backgroundColor: "#ffffff",
                        backgroundGradientFrom: "#ffffff",
                        backgroundGradientTo: "#ffffff",
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
                        style: { borderRadius: 16 },
                        propsForDots: { r: "6", strokeWidth: "2", stroke: "#ffa726" }
                    }}
                    verticalLabelRotation={0}
                    style={{ marginVertical: 8, borderRadius: 16 }}
                />
            </ModernCard>

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

            {/* Customer Reviews List */}
            <View style={styles.reviewsSection}>
                <Text variant="titleLarge" style={styles.sectionTitle}>Customer Feedback</Text>
                {ratingsList.length > 0 ? (
                    ratingsList.map((review) => (
                        <ModernCard key={review.id} style={styles.reviewCard}>
                            <View style={styles.reviewHeader}>
                                <View style={styles.ratingRow}>
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <MaterialCommunityIcons 
                                            key={s} 
                                            name={s <= review.score ? "star" : "star-outline"} 
                                            size={16} 
                                            color={s <= review.score ? "#f59e0b" : "#cbd5e1"} 
                                        />
                                    ))}
                                    <Text style={styles.reviewScore}>{review.score}.0</Text>
                                </View>
                                <Text style={styles.reviewDate}>{review.timestamp?.toDate().toLocaleDateString()}</Text>
                            </View>
                            <Text variant="bodyMedium" style={styles.reviewComment}>
                                {review.comment || "No comment provided."}
                            </Text>
                        </ModernCard>
                    ))
                ) : (
                    <View style={styles.emptyReviews}>
                        <MaterialCommunityIcons name="comment-off-outline" size={48} color="#cbd5e1" />
                        <Text style={styles.emptyText}>No reviews yet.</Text>
                    </View>
                )}
            </View>
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
        paddingBottom: 40,
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
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    workshopName: {
        fontWeight: 'bold',
        color: '#0f172a',
    },
    subtitle: {
        color: '#64748b',
        marginTop: 4,
    },
    exportBtn: {
        borderRadius: 12,
        backgroundColor: '#0f172a',
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
    chartCard: {
        marginTop: 20,
        padding: 16,
        borderRadius: 24,
        backgroundColor: '#fff',
    },
    cardTitle: {
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 16,
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
        marginTop: 20,
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
    reviewsSection: {
        marginTop: 30,
    },
    sectionTitle: {
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 16,
    },
    reviewCard: {
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 12,
        borderRadius: 16,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    reviewScore: {
        marginLeft: 4,
        fontWeight: 'bold',
        color: '#475569',
        fontSize: 13,
    },
    reviewDate: {
        fontSize: 12,
        color: '#94a3b8',
    },
    reviewComment: {
        color: '#334155',
        lineHeight: 20,
    },
    emptyReviews: {
        padding: 40,
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 24,
    },
    emptyText: {
        marginTop: 12,
        color: '#94a3b8',
    }
});
